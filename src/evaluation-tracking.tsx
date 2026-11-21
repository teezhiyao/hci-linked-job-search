import { useCallback, useEffect, useRef, useState } from "react";

export type PrototypeId = "enhanced-search" | "comparison-table" | "pairwise-narrowing";
type Details = Record<string, string | number | boolean | null | string[]>;
type EvaluationEvent = { t: number; type: string; details?: Details };
type Session = { version: "1.0"; sessionId: string; prototype: PrototypeId; studyGroup: number | null; step: number | null; dataset: "software-development-v1"; startedAt: number; events: EvaluationEvent[] };

const numberParam = (name: string) => {
  const value = Number(new URLSearchParams(location.search).get(name));
  return Number.isInteger(value) && value > 0 ? value : null;
};
const newId = () => {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  return Array.from(crypto.getRandomValues(new Uint32Array(6)), value => alphabet[value % alphabet.length]).join("");
};
const createSession = (prototype: PrototypeId): Session => ({
  version: "1.0", sessionId: newId(), prototype, studyGroup: numberParam("group"), step: numberParam("step"),
  dataset: "software-development-v1", startedAt: Date.now(), events: [{ t: 0, type: "prototype_opened" }],
});

function summarize(current: Session) {
  const elapsedSeconds = Math.round((Date.now() - current.startedAt) / 1000);
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
    summary: { elapsedSeconds, activeSeconds: Math.max(0, elapsedSeconds - hiddenSeconds), jobsOpened: count("job_opened"),
      evidenceOpened: count("evidence_opened"), filtersChanged: count("filter_changed"),
      decisionChanges: count("decision_changed") + count("pair_decision_confirmed"), undos: count("decision_undone") },
    events: current.events,
  };
}

export function useEvaluationTracking(prototype: PrototypeId) {
  const key = `hci-job-evaluation-v1-${prototype}-g${numberParam("group") ?? "direct"}-s${numberParam("step") ?? "direct"}`;
  const session = useRef<Session | null>(null);
  if (!session.current) {
    try { session.current = JSON.parse(sessionStorage.getItem(key) || "null") || createSession(prototype); }
    catch { session.current = createSession(prototype); }
  }
  const persist = useCallback(() => { try { sessionStorage.setItem(key, JSON.stringify(session.current)); } catch { /* memory fallback */ } }, [key]);
  const trackEvent = useCallback((type: string, details?: Details) => {
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
  const resetSession = useCallback(() => { session.current = createSession(prototype); persist(); }, [persist, prototype]);
  const getEvaluationLog = useCallback(() => {
    return summarize(session.current!);
  }, []);
  return { trackEvent, getEvaluationLog, resetSession };
}

function combinedLog() {
  const group = numberParam("group");
  const sessions: Session[] = [];
  for (let index = 0; index < sessionStorage.length; index += 1) {
    const key = sessionStorage.key(index);
    if (!key?.startsWith("hci-job-evaluation-v1-")) continue;
    try {
      const session = JSON.parse(sessionStorage.getItem(key) || "null") as Session | null;
      if (session && (group === null || session.studyGroup === group)) sessions.push(session);
    } catch { /* ignore invalid stored data */ }
  }
  sessions.sort((a, b) => (a.step ?? 99) - (b.step ?? 99));
  return { version: "1.0", studyGroup: group, dataset: "software-development-v1", exportedAt: new Date().toISOString(), sessions: sessions.map(summarize) };
}

export function FinalEvaluationLogPanel({ onFinished }: { onFinished: () => void }) {
  const [ready, setReady] = useState(false);
  const [status, setStatus] = useState<"idle" | "copied" | "manual">("idle");
  const copy = async () => {
    const text = JSON.stringify(combinedLog(), null, 2);
    try { await navigator.clipboard.writeText(text); setStatus("copied"); }
    catch { setStatus("manual"); }
  };
  return <section className="evaluation-log-panel">
    <h2>Finish the study</h2>
    {!ready ? <><p>After completing this third prototype, continue to the final evaluation log.</p><button type="button" onClick={() => { onFinished(); setReady(true); }}>I have finished prototype 3</button></> : <><p>Copy the combined anonymous log for all three prototypes and paste it into PeerSurvey.</p><button type="button" onClick={copy}>Copy evaluation log</button></>}
    {status === "copied" && <strong>Copied to clipboard.</strong>}
    {status === "manual" && <textarea readOnly value={JSON.stringify(combinedLog(), null, 2)} rows={8} aria-label="Evaluation log" />}
  </section>;
}
