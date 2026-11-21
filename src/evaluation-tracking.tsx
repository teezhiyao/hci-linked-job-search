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
  const getEvaluationLog = useCallback((ranking: string[]) => {
    const current = session.current!;
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
        decisionChanges: count("decision_changed") + count("pair_decision_confirmed"), undos: count("decision_undone"),
        firstChoice: ranking[0] || null, secondChoice: ranking[1] || null, thirdChoice: ranking[2] || null },
      events: current.events,
    };
  }, []);
  return { trackEvent, getEvaluationLog, resetSession };
}

export function EvaluationLogPanel({ getEvaluationLog, onFinished }: { getEvaluationLog: (ranking: string[]) => unknown; onFinished: (ranking: string[]) => void }) {
  const [ranking, setRanking] = useState(["", "", ""]);
  const [status, setStatus] = useState<"idle" | "copied" | "manual">("idle");
  const valid = ranking.every(value => /^J(0[1-9]|1[0-5])$/.test(value)) && new Set(ranking).size === 3;
  const copy = async () => {
    if (!valid) return;
    onFinished(ranking);
    const text = JSON.stringify(getEvaluationLog(ranking), null, 2);
    try { await navigator.clipboard.writeText(text); setStatus("copied"); }
    catch { setStatus("manual"); }
  };
  return <section className="evaluation-log-panel">
    <h2>Finish and copy log</h2><p>Enter your ranked job IDs, then paste the anonymous log into PeerSurvey.</p>
    {ranking.map((value, index) => <label key={index}>{["1st", "2nd", "3rd"][index]} choice<input value={value} placeholder="e.g. J11" onChange={event => {
      const next = [...ranking]; next[index] = event.target.value.trim().toUpperCase(); setRanking(next); setStatus("idle");
    }} /></label>)}
    {!valid && ranking.some(Boolean) && <small>Enter three different IDs from J01 to J15.</small>}
    <button type="button" onClick={copy} disabled={!valid}>Copy evaluation log</button>
    {status === "copied" && <strong>Copied to clipboard.</strong>}
    {status === "manual" && <textarea readOnly value={JSON.stringify(getEvaluationLog(ranking), null, 2)} rows={8} aria-label="Evaluation log" />}
  </section>;
}
