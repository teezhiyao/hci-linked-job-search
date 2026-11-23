import { useCallback, useEffect, useRef, useState } from "react";

export type PrototypeId = "enhanced-search" | "comparison-table" | "two-job-comparison";
export type Details = Record<string, string | number | boolean | null | string[]>;
type EvaluationEvent = { t: number; type: string; details?: Details };
type Session = {
  version: "1.1"; sessionId: string; prototype: PrototypeId; studyGroup: number | null;
  step: number | null; dataset: "software-development-v2"; startedAt: number; endedAt?: number; events: EvaluationEvent[];
};

const numberParam = (name: string) => {
  const value = Number(new URLSearchParams(location.search).get(name));
  return Number.isInteger(value) && value > 0 ? value : null;
};
const newId = () => {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  return Array.from(crypto.getRandomValues(new Uint32Array(6)), value => alphabet[value % alphabet.length]).join("");
};
const createSession = (prototype: PrototypeId): Session => ({
  version: "1.1", sessionId: newId(), prototype, studyGroup: numberParam("group"), step: numberParam("step"),
  dataset: "software-development-v2", startedAt: Date.now(), events: [{ t: 0, type: "prototype_opened" }],
});

function summarize(current: Session) {
  const elapsedSeconds = Math.round(((current.endedAt ?? Date.now()) - current.startedAt) / 1000);
  const count = (type: string) => current.events.filter(event => event.type === type).length;
  let hiddenAt: number | null = null, hiddenSeconds = 0;
  current.events.forEach(event => {
    if (event.type === "page_hidden") hiddenAt = event.t;
    if (event.type === "page_visible" && hiddenAt !== null) { hiddenSeconds += Math.max(0, event.t - hiddenAt); hiddenAt = null; }
  });
  if (hiddenAt !== null) hiddenSeconds += Math.max(0, elapsedSeconds - hiddenAt);
  return {
    version: current.version, sessionId: current.sessionId, prototype: current.prototype, studyGroup: current.studyGroup,
    step: current.step, dataset: current.dataset,
    summary: {
      elapsedSeconds, activeSeconds: Math.max(0, elapsedSeconds - hiddenSeconds), jobsOpened: count("job_opened"),
      evidenceOpened: count("evidence_opened") + count("comparison_source_opened"),
      filtersChanged: count("filter_changed"), requirementsSaved: count("requirements_saved"),
      decisionChanges: count("decision_changed") + count("pair_decision_confirmed"),
      undos: count("decision_undone"), taskCompleted: count("task_completed"), taskFinished: count("task_finished"),
    },
    events: current.events,
  };
}

export function useEvaluationTracking(prototype: PrototypeId) {
  const key = `hci-job-evaluation-v2-${prototype}-g${numberParam("group") ?? "direct"}-s${numberParam("step") ?? "direct"}`;
  const session = useRef<Session | null>(null);
  const stopped = useRef(false);
  if (!session.current) {
    try { session.current = JSON.parse(sessionStorage.getItem(key) || "null") || createSession(prototype); }
    catch { session.current = createSession(prototype); }
  }
  const persist = useCallback(() => { try { sessionStorage.setItem(key, JSON.stringify(session.current)); } catch { /* memory fallback */ } }, [key]);
  const trackEvent = useCallback((type: string, details?: Details) => {
    if (stopped.current) return;
    const current = session.current!;
    current.events.push({ t: Math.round((Date.now() - current.startedAt) / 1000), type, ...(details && Object.keys(details).length ? { details } : {}) });
    persist();
  }, [persist]);
  useEffect(() => {
    persist();
    const listener = () => trackEvent(document.hidden ? "page_hidden" : "page_visible");
    document.addEventListener("visibilitychange", listener);
    return () => document.removeEventListener("visibilitychange", listener);
  }, [persist, trackEvent]);
  const resetSession = useCallback(() => { session.current = createSession(prototype); stopped.current = false; persist(); }, [persist, prototype]);
  const stopTracking = useCallback(() => {
    if (stopped.current) return;
    const current = session.current!;
    current.events.push({ t: Math.round((Date.now() - current.startedAt) / 1000), type: "session_finished" });
    current.endedAt = Date.now();
    stopped.current = true;
    persist();
  }, [persist]);
  return { trackEvent, resetSession, stopTracking };
}

function combinedLog() {
  const group = numberParam("group");
  const sessions: Session[] = [];
  for (let index = 0; index < sessionStorage.length; index += 1) {
    const key = sessionStorage.key(index);
    if (!key?.startsWith("hci-job-evaluation-v2-")) continue;
    try {
      const session = JSON.parse(sessionStorage.getItem(key) || "null") as Session | null;
      if (session && (group === null || session.studyGroup === group)) sessions.push(session);
    } catch { /* ignore invalid stored data */ }
  }
  sessions.sort((a, b) => (a.step ?? 99) - (b.step ?? 99));
  return { version: "1.1", studyGroup: group, dataset: "software-development-v2", exportedAt: new Date().toISOString(), sessions: sessions.map(summarize) };
}

const prototypes = {
  "enhanced-search": { path: "../integrated-search-and-compare/", name: "Integrated job search" },
  "comparison-table": { path: "../shortlisted-job-comparison/", name: "Shortlisted job comparison" },
  "two-job-comparison": { path: "../linkedin-jobs-shortlist-narrower/", name: "Shortlist narrowing" },
} as const;
const sequences: Record<number, PrototypeId[]> = {
  1: ["enhanced-search", "two-job-comparison", "comparison-table"],
  2: ["two-job-comparison", "comparison-table", "enhanced-search"],
  3: ["comparison-table", "enhanced-search", "two-job-comparison"],
};

type StudyConfig = {
  scenarioId: string; learnTitle: string; learnInstruction: string; learnQuestion: string;
  learnOptions: { value: string; label: string }[]; learnCorrect: string;
  taskTitle: string; taskInstruction: string; taskQuestion: string;
  taskOptions: { value: string; label: string }[]; taskCorrect: string;
  detailLabel: string; detailOptions: string[]; optimal: string[]; acceptable: string[];
};

const jobOptions = Array.from({ length: 15 }, (_, index) => `J${String(index + 1).padStart(2, "0")}`);
const studyConfigs: Record<PrototypeId, StudyConfig> = {
  "enhanced-search": {
    scenarioId: "A-search-requirements",
    learnTitle: "Test how required criteria filter results",
    learnInstruction: "Open Edit requirements, set minimum pay to SGD 100,000, and apply the requirements.",
    learnQuestion: "What happened to the job results?",
    learnOptions: [
      { value: "none", label: "No jobs remained" }, { value: "one", label: "One job remained" },
      { value: "all", label: "All jobs remained" }, { value: "unsure", label: "I am not sure" },
    ],
    learnCorrect: "none",
    taskTitle: "Configure and inspect the scenario",
    taskInstruction: "Return to Edit requirements and change every criterion to match the scenario. Apply the requirements, then open a remaining job and inspect Compared with your requirements.",
    taskQuestion: "How many roles remain after the required criteria are applied?",
    taskOptions: [
      { value: "0", label: "0" }, { value: "1", label: "1" },
      { value: "2", label: "2" }, { value: "3+", label: "3 or more" },
    ],
    taskCorrect: "2",
    detailLabel: "One assessment you observed",
    detailOptions: ["Meets", "Partially meets", "Does not meet", "Unknown"],
    optimal: ["J11"], acceptable: ["J06"],
  },
  "two-job-comparison": {
    scenarioId: "B-pairwise-narrowing",
    learnTitle: "Inspect the source behind hiring evidence",
    learnInstruction: "Select Start comparing jobs. In the first pair, open Show source under Hiring evidence.",
    learnQuestion: "What does the source provide?",
    learnOptions: [
      { value: "dated", label: "A dated employer statement about active hiring" },
      { value: "review", label: "A company-review score" },
      { value: "applicants", label: "An applicant-count estimate" },
      { value: "guarantee", label: "An automatic legitimacy guarantee" },
    ],
    learnCorrect: "dated",
    taskTitle: "Compare and narrow the first pair",
    taskInstruction: "Review the aligned criteria for J05 and J06. Choose which role should remain in consideration and confirm the decision.",
    taskQuestion: "Which comparison action did you confirm?",
    taskOptions: [
      { value: "left", label: "Kept the left role" }, { value: "right", label: "Kept the right role" },
      { value: "both", label: "Kept both" }, { value: "other", label: "Another action" },
    ],
    taskCorrect: "left",
    detailLabel: "Most influential factor",
    detailOptions: ["Responsibilities", "Technologies", "Experience", "Pay", "Work arrangement", "Eligibility", "Hiring evidence"],
    optimal: ["J05"], acceptable: ["J06", "J11"],
  },
  "comparison-table": {
    scenarioId: "C-shortlist-table",
    learnTitle: "Learn how the table exposes differences",
    learnInstruction: "Turn on Highlight differences and inspect how the table changes.",
    learnQuestion: "What changed?",
    learnOptions: [
      { value: "emphasis", label: "Differences and unmet or uncertain criteria became easier to locate" },
      { value: "removed", label: "Unsuitable jobs were removed" },
      { value: "ranked", label: "Jobs were automatically ranked" },
      { value: "hidden", label: "Salary information was hidden" },
    ],
    learnCorrect: "emphasis",
    taskTitle: "Configure and inspect the comparison table",
    taskInstruction: "Correct the pre-filled requirements, inspect the aligned assessments, and open at least one evidence cell.",
    taskQuestion: "What happens to a job that does not meet a criterion?",
    taskOptions: [
      { value: "labelled", label: "It remains visible with a labelled assessment" },
      { value: "removed", label: "It is automatically removed" },
      { value: "passed", label: "It is automatically marked Passed" },
      { value: "top", label: "It moves to the top" },
    ],
    taskCorrect: "labelled",
    detailLabel: "Evidence category inspected",
    detailOptions: ["Responsibilities and technologies", "Experience", "Pay", "Work arrangement and eligibility", "Hiring evidence"],
    optimal: ["J13"], acceptable: ["J06", "J11"],
  },
};

const classify = (config: StudyConfig, selectedJob: string) =>
  config.optimal.includes(selectedJob) ? "optimal" : config.acceptable.includes(selectedJob) ? "acceptable" : selectedJob ? "invalid" : "missing";

export function StudySequenceHandoff({ prototype, onFinished, onStudyFinished, onTaskComplete }: {
  prototype: PrototypeId; onFinished: () => void; onStudyFinished: () => void; onTaskComplete?: (details: Details) => void;
}) {
  const params = new URLSearchParams(window.location.search);
  const step = Number(params.get("step"));
  const group = params.get("group");
  const config = studyConfigs[prototype];
  const [stage, setStage] = useState(0);
  const [learnAnswer, setLearnAnswer] = useState("");
  const [taskAnswer, setTaskAnswer] = useState("");
  const [selectedJob, setSelectedJob] = useState("");
  const [detail, setDetail] = useState("");
  const [confidence, setConfidence] = useState("");
  const [ease, setEase] = useState("");
  if (step !== 1 && step !== 2 && step !== 3) return null;

  if (stage < 3) return <section className="evaluation-log-panel checkpoint-panel">
    <p className="handoff-step">Prototype step {stage + 1} of 3</p>
    {stage === 0 && <>
      <h2>{config.learnTitle}</h2><p>{config.learnInstruction}</p>
      <CheckpointQuestion question={config.learnQuestion} options={config.learnOptions} value={learnAnswer} onChange={setLearnAnswer} />
    </>}
    {stage === 1 && <>
      <h2>{config.taskTitle}</h2><p>{config.taskInstruction}</p>
      <CheckpointQuestion question={config.taskQuestion} options={config.taskOptions} value={taskAnswer} onChange={setTaskAnswer} />
    </>}
    {stage === 2 && <>
      <h2>Record your decision</h2>
      <p>Choose the role you would continue considering, then give a brief assessment of the experience.</p>
      <label className="checkpoint-field">Selected job code
        <select value={selectedJob} onChange={event => setSelectedJob(event.target.value)}>
          <option value="">Select a job</option>
          {jobOptions.map(job => <option key={job}>{job}</option>)}
        </select>
      </label>
      <label className="checkpoint-field">{config.detailLabel}
        <select value={detail} onChange={event => setDetail(event.target.value)}>
          <option value="">Select an answer</option>
          {config.detailOptions.map(option => <option key={option}>{option}</option>)}
        </select>
      </label>
      <label className="checkpoint-field">Confidence in your choice: {confidence || "Not selected"}
        <input type="range" min="1" max="5" value={confidence || "3"} onChange={event => setConfidence(event.target.value)} />
      </label>
      <label className="checkpoint-field">Ease of completing the task: {ease || "Not selected"}
        <input type="range" min="1" max="7" value={ease || "4"} onChange={event => setEase(event.target.value)} />
      </label>
    </>}
    <p className="checkpoint-note">Your answer is recorded for study-quality review, but it will not prevent you from continuing.</p>
    <button type="button" onClick={() => {
      if (stage < 2) { setStage(current => current + 1); return; }
      onTaskComplete?.({
        scenarioId: config.scenarioId, learnAnswer: learnAnswer || "missing", learnCorrect: learnAnswer === config.learnCorrect,
        taskAnswer: taskAnswer || "missing", taskCorrect: taskAnswer === config.taskCorrect,
        selectedJob: selectedJob || "missing", selectionClassification: classify(config, selectedJob),
        detail: detail || "missing", confidence: confidence ? Number(confidence) : null,
        ease: ease ? Number(ease) : null,
        checkpointMissing: !learnAnswer || !taskAnswer || !selectedJob || !detail || !confidence || !ease,
      });
      setStage(3);
    }}>{stage === 2 ? "Complete prototype task" : "Continue"}</button>
  </section>;

  if (step === 3) return <FinalEvaluationLogPanel onFinished={onStudyFinished} />;
  const nextStep = step + 1;
  const order = sequences[Number(group)] || sequences[1];
  const nextPrototype = order[nextStep - 1];
  const base = new URL(import.meta.env.BASE_URL || "/", window.location.origin);
  const target = new URL(prototypes[nextPrototype].path.replace(/^\.\.\//, ""), base);
  if (group) target.searchParams.set("group", group);
  target.searchParams.set("step", String(nextStep));
  return <section className="evaluation-log-panel sequence-handoff">
    <p className="handoff-step">Step {step} of 3 complete</p><h2>Continue to the next prototype</h2>
    <p>Your next assigned prototype is <strong>{prototypes[nextPrototype].name}</strong>.</p>
    <button type="button" onClick={() => { onFinished(); window.location.assign(target.href); }}>Finish and continue</button>
  </section>;
}

function CheckpointQuestion({ question, options, value, onChange }: {
  question: string; options: { value: string; label: string }[]; value: string; onChange: (value: string) => void;
}) {
  return <fieldset className="checkpoint-question"><legend>{question}</legend>
    {options.map(option => <label key={option.value}>
      <input type="radio" name={question} value={option.value} checked={value === option.value} onChange={() => onChange(option.value)} />
      <span>{option.label}</span>
    </label>)}
  </fieldset>;
}

export function FinalEvaluationLogPanel({ onFinished }: { onFinished: () => void }) {
  const [ready, setReady] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [finished, setFinished] = useState(false);
  const [status, setStatus] = useState<"idle" | "copied" | "manual">("idle");
  const [logText, setLogText] = useState("");
  const copy = async () => {
    try { await navigator.clipboard.writeText(logText); setStatus("copied"); }
    catch { setStatus("manual"); }
  };
  return <section className="evaluation-log-panel">
    <h2>Finish the study</h2>
    {!ready ? <>
      <p>After completing this third prototype, continue to the final evaluation log.</p>
      <button type="button" onClick={() => { onFinished(); setLogText(JSON.stringify(combinedLog(), null, 2)); setReady(true); }}>Finish and continue</button>
    </> : finished ? <div role="status"><strong>Study complete</strong><p>Thank you. You may now close this tab.</p></div> : <>
      <p>Copy the combined anonymous log and paste it into PeerSurvey before confirming.</p>
      <textarea readOnly value={logText} rows={10} aria-label="Combined evaluation log" onFocus={event => event.currentTarget.select()} />
      <button type="button" onClick={copy}>Copy evaluation log</button>
      {status === "copied" && <strong role="status">Copied to clipboard.</strong>}
      {status === "manual" && <strong role="status">Select and copy the log manually.</strong>}
      <label className="copy-confirmation"><input type="checkbox" checked={confirmed} onChange={event => setConfirmed(event.target.checked)} /> I pasted the log into PeerSurvey</label>
      <button type="button" disabled={!confirmed} onClick={() => setFinished(true)}>Confirm</button>
    </>}
  </section>;
}
