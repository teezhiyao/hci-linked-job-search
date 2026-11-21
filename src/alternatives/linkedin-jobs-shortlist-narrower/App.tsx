import { useEffect, useMemo, useRef, useState } from "react";
import StudyGroupNotice from "../../StudyGroupNotice";
import { StudySequenceHandoff, useEvaluationTracking } from "../../evaluation-tracking";
import { CUSTOMER_SUPPORT_JOBS, EXTRA_SOFTWARE_JOBS, getStudyDomain } from "../../study-domains";

const DOMAIN = getStudyDomain();

type Status = "pending" | "kept" | "aside" | "later";
type View = "shortlist" | "search" | "narrow" | "history";
type Job = {
  id: string;
  company: string;
  title: string;
  experience: string;
  technologies: string[];
  responsibilities: string[];
  pay: string;
  arrangement: string;
  eligibility: string;
  hiring: string | null;
  history: string;
};
type HistoryEntry = {
  id: string;
  jobIds: string[];
  decision: string;
  reason: string;
  note: string;
  date: string;
  flagged?: boolean;
};
type AppState = {
  shortlist: string[];
  statuses: Record<string, Status>;
  viewed: string[];
  history: HistoryEntry[];
};

const studyContent = {
  eyebrow: "Interactive prototype.",
  projectName: "Prototype C — Two-job comparison",
  overview: {
    intro: "You are seeking a Singapore software-development role with:",
    conditions: [
      "Required: React, TypeScript, or Node.js",
      "Required: at least SGD 5,000 per month",
      "Required: remote or hybrid work with no more than two office days",
      "Required: eligibility for Singapore-based applicants",
      "Required: hiring confirmed within the past 14 days",
      "Preferred: no more than three years of experience",
    ],
    goal: "Identify at least one role that meets the required conditions. Use the preference to distinguish between suitable roles.",
  },
  disclaimer: "All job information in this prototype is fictional.",
  submission:
    "Record at least one suitable role in PeerSurvey. The combined evaluation log is available after the third prototype.",
  tasks: [
    {
      title: "Compare and narrow your shortlist",
      description:
        "Select Start comparing jobs. In at least one pair, open Show source under Hiring evidence and inspect what appears. Confirm at least one comparison decision, then identify at least one role that meets every required condition. In PeerSurvey, record the role and what the hiring-evidence source showed.",
    },
  ],
};

const softwareJobs: Job[] = [
  {
    id: "J01",
    company: "Northstar Health",
    title: "Junior Frontend Developer",
    experience: "0–2 years",
    technologies: ["React", "TypeScript", "CSS"],
    responsibilities: ["Build patient-portal interfaces", "Implement accessible components"],
    pay: "4,000–5,000",
    arrangement: "Hybrid, 2 office days/week, Singapore",
    eligibility: "Singapore-based applicants",
    hiring: "Employer confirmed open 17 Nov 2026",
    history: "Viewed 18 Nov 2026",
  },
  {
    id: "J02",
    company: "Harbor Digital",
    title: "Frontend Software Engineer",
    experience: "2–4 years",
    technologies: ["React", "TypeScript", "testing"],
    responsibilities: ["Develop customer dashboards", "Improve frontend performance"],
    pay: "5,500–7,000",
    arrangement: "Remote",
    eligibility: "Must reside in Singapore",
    hiring: null,
    history: "Saved 18 Nov 2026",
  },
  {
    id: "J03",
    company: "Fieldwork Labs",
    title: "Junior Backend Developer",
    experience: "0–2 years",
    technologies: ["Python", "Django", "PostgreSQL"],
    responsibilities: ["Build REST APIs", "Maintain data models"],
    pay: "Not provided",
    arrangement: "On-site, Singapore",
    eligibility: "Singapore-based applicants",
    hiring: "Employer confirmed open 15 Nov 2026",
    history: "Unseen",
  },
  {
    id: "J04",
    company: "Cedar Commerce",
    title: "Backend Software Engineer",
    experience: "2–4 years",
    technologies: ["Java", "Spring Boot", "SQL"],
    responsibilities: ["Develop checkout services", "Improve service reliability"],
    pay: "5,500–7,500",
    arrangement: "Hybrid, 3 office days/week, Singapore",
    eligibility: "Singapore-based applicants",
    hiring: "Employer confirmed open 28 Oct 2026",
    history: "Unseen",
  },
  {
    id: "J05",
    company: "Brightpath Learning",
    title: "Junior Full-Stack Developer",
    experience: "0–2 years",
    technologies: ["React", "Node.js", "PostgreSQL"],
    responsibilities: ["Build learning-platform features", "Maintain frontend and API tests"],
    pay: "4,500–5,500",
    arrangement: "Hybrid, 1 office day/week, Singapore",
    eligibility: "Singapore-based applicants",
    hiring: "Employer confirmed open 18 Nov 2026",
    history: "Unseen",
  },
  {
    id: "J06",
    company: "Meridian Systems",
    title: "Full-Stack Software Engineer",
    experience: "2–4 years",
    technologies: ["TypeScript", "React", "Node.js"],
    responsibilities: ["Develop internal workflow tools", "Own features from interface to API"],
    pay: "6,000–8,000",
    arrangement: "Remote",
    eligibility: "Singapore or Malaysia residents",
    hiring: "Employer confirmed open 16 Nov 2026",
    history: "Unseen",
  },
  {
    id: "J07",
    company: "PocketWorks",
    title: "Junior Mobile Developer",
    experience: "0–2 years",
    technologies: ["Flutter", "Dart"],
    responsibilities: ["Build mobile application screens", "Integrate backend APIs"],
    pay: "4,000–5,200",
    arrangement: "Hybrid, 2 office days/week, Singapore",
    eligibility: "Singapore-based applicants",
    hiring: null,
    history: "Unseen",
  },
  {
    id: "J08",
    company: "Atlas Logistics",
    title: "Software Engineer, Integrations",
    experience: "2–4 years",
    technologies: ["C#", ".NET", "SQL"],
    responsibilities: ["Build partner integrations", "Troubleshoot data exchange"],
    pay: "5,200–6,800",
    arrangement: "On-site, Singapore",
    eligibility: "Singapore-based applicants",
    hiring: "Employer confirmed open 14 Nov 2026",
    history: "Applied 12 Nov 2026",
  },
  {
    id: "J09",
    company: "GreenGrid Energy",
    title: "Python Software Developer",
    experience: "1–3 years",
    technologies: ["Python", "FastAPI", "PostgreSQL"],
    responsibilities: ["Develop energy-data services", "Maintain automated tests"],
    pay: "5,000–6,500",
    arrangement: "Remote",
    eligibility: "Must reside in Australia",
    hiring: "Employer confirmed open 18 Nov 2026",
    history: "Unseen",
  },
  {
    id: "J10",
    company: "Studio Orbit",
    title: "Web Application Developer",
    experience: "1–3 years",
    technologies: ["Vue", "TypeScript", "Node.js"],
    responsibilities: ["Build client web applications", "Collaborate on interface implementation"],
    pay: "Not provided",
    arrangement: "Hybrid, office frequency not provided, Singapore",
    eligibility: "Singapore-based applicants",
    hiring: "Employer confirmed open 5 Nov 2026",
    history: "Viewed 17 Nov 2026",
  },
  ...EXTRA_SOFTWARE_JOBS.map((job) => ({
    id: job.id,
    company: job.company,
    title: job.title,
    experience: `${job.experience[0]}–${job.experience[1]} years`,
    technologies: job.technologies,
    responsibilities: job.responsibilities,
    pay: job.salary ? `${job.salary[0].toLocaleString()}–${job.salary[1].toLocaleString()}` : "Not provided",
    arrangement: `${job.arrangement}${job.officeDays !== null ? `, ${job.officeDays} office days/week` : ""}, ${job.location}`,
    eligibility: job.eligibility,
    hiring: job.hiringDate
      ? `Employer confirmed open ${new Date(`${job.hiringDate}T12:00:00`).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}`
      : null,
    history: "Unseen",
  })),
];

const supportJobs: Job[] = CUSTOMER_SUPPORT_JOBS.map((job) => ({
  id: job.id,
  company: job.company,
  title: job.title,
  experience: `${job.experience[0]}–${job.experience[1]} years`,
  technologies: job.technologies,
  responsibilities: job.responsibilities,
  pay: job.salary ? `${job.salary[0].toLocaleString()}–${job.salary[1].toLocaleString()}` : "Not provided",
  arrangement: `${job.arrangement}${job.officeDays !== null ? `, ${job.officeDays} office days/week` : ""}, ${job.location}`,
  eligibility: job.eligibility,
  hiring: job.hiringDate
    ? `Employer confirmed open ${new Date(`${job.hiringDate}T12:00:00`).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}`
    : null,
  history: job.history.applied
    ? `Applied ${job.history.applied}`
    : job.history.saved
      ? `Saved ${job.history.saved}`
      : job.history.viewed
        ? `Viewed ${job.history.viewed}`
        : "Unseen",
}));

const jobs = DOMAIN === "support" ? supportJobs : softwareJobs;

const initialShortlist = ["J01", "J02", "J03", "J04", "J05", "J06", "J07", "J08", "J09", "J10", "J11", "J12", "J13", "J14", "J15"];
const initialState: AppState = {
  shortlist: initialShortlist,
  statuses: Object.fromEntries(initialShortlist.map((id) => [id, "pending"])) as Record<
    string,
    Status
  >,
  viewed: ["J01", "J10"],
  history: [],
};
const statusMeta: Record<Status, { label: string; className: string }> = {
  pending: { label: "Pending review", className: "status-pending" },
  kept: { label: "Kept", className: "status-kept" },
  aside: { label: "Set aside", className: "status-aside" },
  later: { label: "Review later", className: "status-later" },
};
const reasons = [
  "Responsibilities",
  "Technologies",
  "Pay",
  "Work arrangement",
  "Eligibility",
  "Hiring uncertainty",
];

function Icon({ name, size = 20 }: { name: string; size?: number }) {
  const paths: Record<string, React.ReactNode> = {
    search: (
      <>
        <circle cx="10.5" cy="10.5" r="6.5" />
        <path d="m16 16 4.5 4.5" />
      </>
    ),
    home: (
      <>
        <path d="m3 11 9-7 9 7" />
        <path d="M5.5 10v10h13V10M9 20v-6h6v6" />
      </>
    ),
    users: (
      <>
        <circle cx="8" cy="8" r="3" />
        <circle cx="17" cy="9" r="2.5" />
        <path d="M2.5 20c.3-4 2-6 5.5-6s5.2 2 5.5 6M14 15c3.8-.8 6.5.9 7 4" />
      </>
    ),
    briefcase: (
      <>
        <rect x="3" y="7" width="18" height="13" rx="2" />
        <path d="M9 7V4h6v3M3 12h18M10 12v2h4v-2" />
      </>
    ),
    message: <path d="M4 5h16v12H9l-5 4V5Z" />,
    bell: (
      <>
        <path d="M6 17h12l-1.5-2.5V10a4.5 4.5 0 0 0-9 0v4.5L6 17Z" />
        <path d="M10 20h4" />
      </>
    ),
    person: (
      <>
        <circle cx="12" cy="8" r="4" />
        <path d="M4.5 21c.5-4.5 3-7 7.5-7s7 2.5 7.5 7" />
      </>
    ),
    bookmark: <path d="M6 3h12v18l-6-4-6 4V3Z" />,
    history: (
      <>
        <path d="M4 7v5h5" />
        <path d="M5 11a8 8 0 1 1 2 6" />
        <path d="M12 7v5l3 2" />
      </>
    ),
    chevron: <path d="m9 6 6 6-6 6" />,
    arrow: (
      <>
        <path d="M20 12H4M10 6l-6 6 6 6" />
      </>
    ),
    close: <path d="m5 5 14 14M19 5 5 19" />,
    filter: <path d="M4 6h16M7 12h10M10 18h4" />,
    external: (
      <>
        <path d="M13 4h7v7M20 4l-9 9" />
        <path d="M18 14v6H4V6h6" />
      </>
    ),
  };
  return (
    <svg
      aria-hidden="true"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {paths[name]}
    </svg>
  );
}

function monogram(company: string) {
  return company
    .split(" ")
    .map((x) => x[0])
    .slice(0, 2)
    .join("");
}

function loadState(): AppState {
  try {
    const raw = localStorage.getItem(`shortlist-prototype-v5-${DOMAIN}`);
    return raw ? { ...initialState, ...JSON.parse(raw) } : initialState;
  } catch {
    return initialState;
  }
}

export default function App() {
  const { trackEvent, resetSession } = useEvaluationTracking("two-job-comparison");
  const [state, setState] = useState<AppState>(loadState);
  const [view, setView] = useState<View>("shortlist");
  const [guideOpen, setGuideOpen] = useState(true);
  const [guideWidth, setGuideWidth] = useState(300);
  const [detailId, setDetailId] = useState<string | null>(null);
  const [applyId, setApplyId] = useState<string | null>(null);
  const [statusTab, setStatusTab] = useState<Status>("pending");
  const [techFilter, setTechFilter] = useState("All technologies");
  const [arrangementFilter, setArrangementFilter] = useState("All arrangements");
  const [keyword, setKeyword] = useState("");
  const [location, setLocation] = useState("Singapore");
  const [searchArrangement, setSearchArrangement] = useState("Any arrangement");
  const [pair, setPair] = useState<string[]>([]);
  const [decision, setDecision] = useState<{ kind: string; labels: string } | null>(null);
  const [reason, setReason] = useState("");
  const [note, setNote] = useState("");
  const [editingHistory, setEditingHistory] = useState<string | null>(null);
  const [undoState, setUndoState] = useState<AppState | null>(null);
  const [undoPair, setUndoPair] = useState<string[]>([]);
  const [showReset, setShowReset] = useState(false);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const dragStart = useRef<{ x: number; width: number } | null>(null);

  useEffect(() => {
    localStorage.setItem(`shortlist-prototype-v5-${DOMAIN}`, JSON.stringify(state));
  }, [state]);
  useEffect(() => {
    const move = (e: MouseEvent) => {
      if (dragStart.current)
        setGuideWidth(
          Math.min(450, Math.max(250, dragStart.current.width + e.clientX - dragStart.current.x)),
        );
    };
    const up = () => {
      dragStart.current = null;
      document.body.style.cursor = "";
    };
    window.addEventListener("mousemove", move);
    window.addEventListener("mouseup", up);
    return () => {
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mouseup", up);
    };
  }, []);

  const technologies = useMemo(() => [...new Set(jobs.flatMap((j) => j.technologies))].sort(), []);
  const shortlistedJobs = jobs.filter((j) => state.shortlist.includes(j.id));
  const filteredPool = shortlistedJobs.filter(
    (j) =>
      (techFilter === "All technologies" || j.technologies.includes(techFilter)) &&
      (arrangementFilter === "All arrangements" || j.arrangement.startsWith(arrangementFilter)),
  );
  const pending = filteredPool.filter((j) => state.statuses[j.id] === "pending");
  const visibleByStatus = filteredPool.filter((j) => state.statuses[j.id] === statusTab);
  const searchResults = jobs.filter((j) => {
    const q = keyword.toLowerCase();
    const text = `${j.title} ${j.company} ${j.technologies.join(" ")}`.toLowerCase();
    const arrangementOk =
      searchArrangement === "Any arrangement" || j.arrangement.startsWith(searchArrangement);
    const locationOk =
      !location ||
      `${j.arrangement} ${j.eligibility}`.toLowerCase().includes(location.toLowerCase());
    return (!q || text.includes(q)) && arrangementOk && locationOk;
  });

  function setAppState(update: (s: AppState) => AppState) {
    setState((s) => update(s));
  }
  function navigate(next: View) {
    setView(next);
    if (next !== "narrow") setPair([]);
  }
  function openJob(id: string) {
    trackEvent("job_opened", { jobId: id });
    setDetailId(id);
    setAppState((s) => ({ ...s, viewed: s.viewed.includes(id) ? s.viewed : [...s.viewed, id] }));
  }
  function toggleShortlist(id: string) {
    setAppState((s) =>
      s.shortlist.includes(id)
        ? {
            ...s,
            shortlist: s.shortlist.filter((x) => x !== id),
            statuses: Object.fromEntries(Object.entries(s.statuses).filter(([key]) => key !== id)),
          }
        : { ...s, shortlist: [...s.shortlist, id], statuses: { ...s.statuses, [id]: "pending" } },
    );
  }
  function beginReview(ids = pending.map((j) => j.id)) {
    trackEvent("pair_comparison_started", { pendingCount: ids.length });
    setPair(ids.slice(0, 2));
    setEditingHistory(null);
    setView("narrow");
  }
  function openDecision(kind: string) {
    const left = jobs.find((j) => j.id === pair[0])!;
    const right = jobs.find((j) => j.id === pair[1]);
    const labels: Record<string, string> = right
      ? {
          left: `Keep ${left.company}, set aside ${right.company}`,
          right: `Keep ${right.company}, set aside ${left.company}`,
          both: "Keep both",
          aside: "Set aside both",
          later: "Review both later",
        }
      : {
          left: `Keep ${left.company}`,
          aside: `Set aside ${left.company}`,
          later: `Review ${left.company} later`,
        };
    setDecision({ kind, labels: labels[kind] });
  }
  function confirmDecision() {
    if (!decision) return;
    const previous = state;
    const nextStatuses = { ...state.statuses };
    if (pair.length === 1)
      nextStatuses[pair[0]] =
        decision.kind === "left" ? "kept" : decision.kind === "aside" ? "aside" : "later";
    else if (decision.kind === "left") {
      nextStatuses[pair[0]] = "kept";
      nextStatuses[pair[1]] = "aside";
    } else if (decision.kind === "right") {
      nextStatuses[pair[0]] = "aside";
      nextStatuses[pair[1]] = "kept";
    } else {
      const status: Status =
        decision.kind === "both" ? "kept" : decision.kind === "aside" ? "aside" : "later";
      pair.forEach((id) => {
        nextStatuses[id] = status;
      });
    }
    const entry: HistoryEntry = {
      id: editingHistory || `${Date.now()}`,
      jobIds: [...pair],
      decision: decision.labels,
      reason,
      note,
      date: "19 Nov 2026",
    };
    trackEvent("pair_decision_confirmed", { jobIds: [...pair], decision: decision.kind });
    let nextHistory: HistoryEntry[];
    if (editingHistory) {
      const oldIndex = state.history.findIndex((h) => h.id === editingHistory);
      nextHistory = state.history.map((h, index) =>
        h.id === editingHistory
          ? entry
          : index > oldIndex && h.jobIds.some((id) => pair.includes(id))
            ? { ...h, flagged: true }
            : h,
      );
    } else nextHistory = [...state.history, entry];
    const nextState = { ...state, statuses: nextStatuses, history: nextHistory };
    setUndoState(previous);
    setUndoPair([...pair]);
    setState(nextState);
    setDecision(null);
    setReason("");
    setNote("");
    setEditingHistory(null);
    const remaining = filteredPool.filter(
      (j) => nextStatuses[j.id] === "pending" && !pair.includes(j.id),
    );
    setPair(remaining.slice(0, 2).map((j) => j.id));
  }
  function resetAll() {
    resetSession();
    setState(initialState);
    setView("shortlist");
    setStatusTab("pending");
    setTechFilter("All technologies");
    setArrangementFilter("All arrangements");
    setKeyword("");
    setLocation("Singapore");
    setSearchArrangement("Any arrangement");
    setPair([]);
    setDecision(null);
    setReason("");
    setNote("");
    setEditingHistory(null);
    setUndoState(null);
    setDetailId(null);
    setApplyId(null);
    setExpanded({});
    setShowReset(false);
    localStorage.removeItem(`shortlist-prototype-v5-${DOMAIN}`);
  }
  function reopenHistory(entry: HistoryEntry) {
    setPair(entry.jobIds);
    setReason(entry.reason);
    setNote(entry.note);
    setEditingHistory(entry.id);
    setView("narrow");
  }

  const currentPair = pair.map((id) => jobs.find((j) => j.id === id)!).filter(Boolean);
  const reviewComplete = view === "narrow" && currentPair.length === 0;

  return (
    <div className="prototype-shell">
      <aside
        className={`study-guide ${guideOpen ? "is-open" : ""}`}
        style={{ width: guideOpen ? guideWidth : 0 }}
      >
        <div className="guide-inner" style={{ width: guideWidth }}>
          <div className="guide-top">
            <span className="prototype-pill">{studyContent.eyebrow}</span>
            <button className="text-btn" onClick={() => setGuideOpen(false)}>
              Hide guide
            </button>
          </div>
          <h1>{studyContent.projectName}</h1>
          <StudyGroupNotice />
          <div className="guide-content">
            <section className="guide-section">
              <h2>Scenario and goal</h2>
              <p>{studyContent.overview.intro}</p>
              <ul className="guide-conditions">{studyContent.overview.conditions.map((condition) => {
                const [label, detail] = condition.split(": ");
                return <li key={condition}><span className={`condition-label ${label.toLowerCase()}`}>{label}</span><span>{detail}</span></li>;
              })}</ul>
              <p><strong>Goal:</strong> {studyContent.overview.goal}</p>
            </section>
            <section className="guide-section combined-tasks">
              <h2>Task</h2>
              {studyContent.tasks.map((task, index) => (
                <article className="task-card" key={task.title}>
                  <span className="task-number">STEP {index + 1}</span>
                  <h2>{task.title}</h2>
                  <p>{task.description}</p>
                </article>
              ))}
            </section>
            <div className="fictional-note peer-survey-note">
              <strong>Submit in PeerSurvey</strong>
              <span>{studyContent.submission}</span>
            </div>
            <div className="fictional-note">
              <strong>Study note</strong>
              <span>{studyContent.disclaimer}</span>
            </div>
            <StudySequenceHandoff prototype="two-job-comparison" onFinished={() => trackEvent("task_finished")} />
          </div>
          <div className="guide-footer">
            <button className="reset-button" onClick={() => setShowReset(true)}>
              Reset prototype
            </button>
          </div>
        </div>
        <div
          className="resize-handle"
          role="separator"
          aria-label="Resize study guide"
          onMouseDown={(e) => {
            dragStart.current = { x: e.clientX, width: guideWidth };
            document.body.style.cursor = "col-resize";
          }}
        />
      </aside>

      <main className="app-frame">
        {!guideOpen && (
          <button className="show-guide" onClick={() => setGuideOpen(true)}>
            Show guide
          </button>
        )}
        <LinkedInHeader
          view={view}
          navigate={(next) => (next === "narrow" ? beginReview() : navigate(next))}
        />
        {view === "shortlist" && (
          <ShortlistView
            state={state}
            jobs={visibleByStatus}
            allJobs={shortlistedJobs}
            statusTab={statusTab}
            setStatusTab={setStatusTab}
            techFilter={techFilter}
            setTechFilter={setTechFilter}
            technologies={technologies}
            arrangementFilter={arrangementFilter}
            setArrangementFilter={setArrangementFilter}
            openJob={openJob}
            beginReview={() => beginReview()}
            setState={setState}
          />
        )}
        {view === "search" && (
          <SearchView
            keyword={keyword}
            setKeyword={setKeyword}
            location={location}
            setLocation={setLocation}
            arrangement={searchArrangement}
            setArrangement={setSearchArrangement}
            results={searchResults}
            state={state}
            openJob={openJob}
            toggleShortlist={toggleShortlist}
          />
        )}
        {view === "history" && <HistoryView history={state.history} reopen={reopenHistory} />}
        {view === "narrow" && (
          <NarrowView
            jobs={currentPair}
            pendingCount={pending.length}
            statuses={state.statuses}
            expanded={expanded}
            toggleExpanded={(key) =>
              setExpanded((current) => {
                const willExpand = !current[key];
                trackEvent(willExpand ? "comparison_source_opened" : "comparison_source_closed", {
                  sourceKey: key,
                });
                return { ...current, [key]: willExpand };
              })
            }
            onBack={() => navigate("shortlist")}
            onDecision={openDecision}
            complete={reviewComplete}
            kept={shortlistedJobs.filter((j) => state.statuses[j.id] === "kept")}
            onReviewKept={() => {
              setAppState((s) => ({
                ...s,
                statuses: {
                  ...s.statuses,
                  ...Object.fromEntries(
                    shortlistedJobs
                      .filter((j) => s.statuses[j.id] === "kept")
                      .map((j) => [j.id, "pending"]),
                  ),
                },
              }));
              setPair(
                shortlistedJobs
                  .filter((j) => state.statuses[j.id] === "kept")
                  .slice(0, 2)
                  .map((j) => j.id),
              );
            }}
            onResume={() => {
              const later = shortlistedJobs.filter((j) => state.statuses[j.id] === "later");
              setAppState((s) => ({
                ...s,
                statuses: {
                  ...s.statuses,
                  ...Object.fromEntries(later.map((j) => [j.id, "pending"])),
                },
              }));
              setPair(later.slice(0, 2).map((j) => j.id));
            }}
            onSearch={() => navigate("search")}
            filtersActive={
              techFilter !== "All technologies" || arrangementFilter !== "All arrangements"
            }
            clearFilters={() => {
              setTechFilter("All technologies");
              setArrangementFilter("All arrangements");
              beginReview(
                shortlistedJobs.filter((j) => state.statuses[j.id] === "pending").map((j) => j.id),
              );
            }}
          />
        )}
        {undoState && (
          <div className="undo-toast" role="status">
            <span>Decision saved.</span>
            <button
              onClick={() => {
                setState(undoState);
                setUndoState(null);
                setPair(undoPair);
                setView("narrow");
              }}
            >
              Undo
            </button>
            <button aria-label="Dismiss" onClick={() => setUndoState(null)}>
              <Icon name="close" size={16} />
            </button>
          </div>
        )}
      </main>

      {detailId && (
        <JobDetail
          job={jobs.find((j) => j.id === detailId)!}
          state={state}
          close={() => setDetailId(null)}
          toggleShortlist={toggleShortlist}
          apply={() => setApplyId(detailId)}
        />
      )}
      {applyId && (
        <Dialog title="Start application" close={() => setApplyId(null)}>
          <p>
            You’re about to leave this prototype and begin an application for{" "}
            <strong>{jobs.find((j) => j.id === applyId)?.title}</strong>.
          </p>
          <div className="dialog-note">
            Application submission is outside the scope of this prototype. Your current status will
            not change.
          </div>
          <div className="dialog-actions">
            <button className="secondary-btn" onClick={() => setApplyId(null)}>
              Cancel
            </button>
            <button className="primary-btn" onClick={() => setApplyId(null)}>
              Got it
            </button>
          </div>
        </Dialog>
      )}
      {decision && (
        <Dialog title="Confirm your decision" close={() => setDecision(null)}>
          <div className="decision-summary">
            <span>Decision</span>
            <strong>{decision.labels}</strong>
          </div>
          <label className="field-label">
            Reason <span>Optional</span>
          </label>
          <div className="reason-chips">
            {reasons.map((r) => (
              <button
                key={r}
                className={reason === r ? "selected" : ""}
                onClick={() => setReason(reason === r ? "" : r)}
              >
                {r}
              </button>
            ))}
          </div>
          <label className="field-label" htmlFor="note">
            Private note <span>Optional</span>
          </label>
          <textarea
            id="note"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Add a note for yourself"
            maxLength={240}
          />
          <div className="char-count">{note.length}/240</div>
          <p className="confirm-help">
            This updates the current state of {pair.length === 2 ? "both jobs" : "this job"}. You
            can undo afterward.
          </p>
          <div className="dialog-actions">
            <button className="secondary-btn" onClick={() => setDecision(null)}>
              Cancel
            </button>
            <button className="primary-btn" onClick={confirmDecision}>
              Confirm decision
            </button>
          </div>
        </Dialog>
      )}
      {showReset && (
        <Dialog title="Reset prototype?" close={() => setShowReset(false)}>
          <p>
            This will restore all jobs, decisions, filters, and history to the initial state.
          </p>
          <div className="dialog-actions">
            <button className="secondary-btn" onClick={() => setShowReset(false)}>
              Cancel
            </button>
            <button className="danger-btn" onClick={resetAll}>
              Reset everything
            </button>
          </div>
        </Dialog>
      )}
    </div>
  );
}

function LinkedInHeader({ view, navigate }: { view: View; navigate: (v: View) => void }) {
  const items = [
    { icon: "home", label: "Home" },
    { icon: "users", label: "My Network" },
    { icon: "briefcase", label: "Jobs" },
    { icon: "message", label: "Messaging" },
    { icon: "bell", label: "Notifications" },
  ];
  return (
    <header className="linkedin-header">
      <div className="nav-inner">
        <button className="in-logo" aria-label="LinkedIn home">
          in
        </button>
        <div className="global-search">
          <Icon name="search" size={17} />
          <span>Search</span>
        </div>
        <nav aria-label="LinkedIn navigation">
          {items.map((item) => (
            <button key={item.label} className={item.label === "Jobs" ? "selected" : ""}>
              <Icon name={item.icon} />
              <span>{item.label}</span>
            </button>
          ))}
          <button>
            <Icon name="person" />
            <span>Me⌄</span>
          </button>
        </nav>
      </div>
      <div className="jobs-nav">
        <button className={view === "search" ? "active" : ""} onClick={() => navigate("search")}>
          Search jobs
        </button>
        <button
          className={view === "shortlist" ? "active" : ""}
          onClick={() => navigate("shortlist")}
        >
          My shortlist
        </button>
        <button className={view === "narrow" ? "active" : ""} onClick={() => navigate("narrow")}>
          Compare and narrow
        </button>
        <button className={view === "history" ? "active" : ""} onClick={() => navigate("history")}>
          Review history
        </button>
      </div>
    </header>
  );
}

function ShortlistView(props: {
  state: AppState;
  jobs: Job[];
  allJobs: Job[];
  statusTab: Status;
  setStatusTab: (s: Status) => void;
  techFilter: string;
  setTechFilter: (s: string) => void;
  technologies: string[];
  arrangementFilter: string;
  setArrangementFilter: (s: string) => void;
  openJob: (id: string) => void;
  beginReview: () => void;
  setState: React.Dispatch<React.SetStateAction<AppState>>;
}) {
  const counts = (status: Status) =>
    props.allJobs.filter((j) => props.state.statuses[j.id] === status).length;
  return (
    <div className="page-content shortlist-page">
      <div className="page-heading">
        <div>
          <p className="breadcrumb">Jobs / My shortlist</p>
          <h2>My shortlist</h2>
          <p>{props.allJobs.length} saved roles · Continue considering roles before you apply</p>
        </div>
        <button className="primary-btn large" onClick={props.beginReview}>
          <Icon name="filter" size={17} /> Start comparing jobs
        </button>
      </div>
      <div className="filter-bar">
        <span>Filter review pool</span>
        <select
          aria-label="Filter by technology"
          value={props.techFilter}
          onChange={(e) => props.setTechFilter(e.target.value)}
        >
          <option>All technologies</option>
          {props.technologies.map((x) => (
            <option key={x}>{x}</option>
          ))}
        </select>
        <select
          aria-label="Filter by work arrangement"
          value={props.arrangementFilter}
          onChange={(e) => props.setArrangementFilter(e.target.value)}
        >
          <option>All arrangements</option>
          <option>Remote</option>
          <option>Hybrid</option>
          <option>On-site</option>
        </select>
        {(props.techFilter !== "All technologies" ||
          props.arrangementFilter !== "All arrangements") && (
          <button
            className="text-btn"
            onClick={() => {
              props.setTechFilter("All technologies");
              props.setArrangementFilter("All arrangements");
            }}
          >
            Clear filters
          </button>
        )}
      </div>
      <div className="status-tabs">
        {(["pending", "kept", "aside", "later"] as Status[]).map((s) => (
          <button
            key={s}
            className={props.statusTab === s ? "active" : ""}
            onClick={() => props.setStatusTab(s)}
          >
            {statusMeta[s].label}
            <span>{counts(s)}</span>
          </button>
        ))}
      </div>
      <div className="list-panel">
        <div className="list-panel-head">
          <strong>{statusMeta[props.statusTab].label}</strong>
          <span>
            {props.jobs.length} {props.jobs.length === 1 ? "job" : "jobs"}
          </span>
        </div>
        {props.jobs.length ? (
          props.jobs.map((job) => (
            <JobRow
              key={job.id}
              job={job}
              status={props.state.statuses[job.id]}
              open={() => props.openJob(job.id)}
              action={
                props.statusTab !== "pending" ? (
                  <button
                    className="secondary-btn small"
                    onClick={() =>
                      props.setState((s) => ({
                        ...s,
                        statuses: { ...s.statuses, [job.id]: "pending" },
                      }))
                    }
                  >
                    {props.statusTab === "aside" ? "Restore to pending" : "Move to pending"}
                  </button>
                ) : null
              }
            />
          ))
        ) : (
          <div className="empty-list">
            <Icon name="bookmark" size={28} />
            <h3>No jobs in this view</h3>
            <p>Try another status or clear your filters.</p>
          </div>
        )}
      </div>
      <p className="page-footnote">
        Fixed study date: 19 November 2026 · All salaries are SGD per month.
      </p>
    </div>
  );
}

function JobRow({
  job,
  status,
  open,
  action,
}: {
  job: Job;
  status: Status;
  open: () => void;
  action?: React.ReactNode;
}) {
  return (
    <article className="job-row">
      <div className={`company-logo logo-${Number(job.id.slice(1)) % 5}`}>
        {monogram(job.company)}
      </div>
      <div className="job-main">
        <button className="job-title" onClick={open}>
          {job.title}
        </button>
        <p className="company-name">{job.company}</p>
        <p className="responsibility-preview">{job.responsibilities.join(" · ")}</p>
        <div className="job-meta">
          <span>
            <strong>SGD {job.pay}</strong> / month
          </span>
          <span>{job.arrangement}</span>
        </div>
        <div className="job-signals">
          <span className={`status ${statusMeta[status].className}`}>
            {statusMeta[status].label}
          </span>
          <span className={job.hiring ? "confirmed" : "unconfirmed"}>
            {job.hiring || "Hiring status unconfirmed"}
          </span>
          <span>{job.history}</span>
        </div>
      </div>
      <div className="row-actions">
        {action}
        <button className="secondary-btn small" onClick={open}>
          View details
        </button>
      </div>
    </article>
  );
}

function SearchView({
  keyword,
  setKeyword,
  location,
  setLocation,
  arrangement,
  setArrangement,
  results,
  state,
  openJob,
  toggleShortlist,
}: {
  keyword: string;
  setKeyword: (s: string) => void;
  location: string;
  setLocation: (s: string) => void;
  arrangement: string;
  setArrangement: (s: string) => void;
  results: Job[];
  state: AppState;
  openJob: (id: string) => void;
  toggleShortlist: (id: string) => void;
}) {
  return (
    <div className="page-content search-page">
      <div className="search-hero">
        <h2>Search jobs</h2>
        <div className="search-fields">
          <label>
            <span>Keyword</span>
            <div>
              <Icon name="search" size={18} />
              <input
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="Title, skill, or company"
              />
            </div>
          </label>
          <label>
            <span>Location</span>
            <div>
              <input
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="City or country"
              />
            </div>
          </label>
          <button className="primary-btn">Search</button>
        </div>
      </div>
      <div className="search-layout">
        <aside className="search-filter">
          <h3>Filters</h3>
          <label>
            Work arrangement
            <select value={arrangement} onChange={(e) => setArrangement(e.target.value)}>
              <option>Any arrangement</option>
              <option>Remote</option>
              <option>Hybrid</option>
              <option>On-site</option>
            </select>
          </label>
          <div className="search-fact">
            <strong>Study date</strong>
            <span>19 November 2026</span>
          </div>
        </aside>
        <section className="list-panel search-results">
          <div className="list-panel-head">
            <strong>{results.length} results</strong>
            <span>Fictional listings</span>
          </div>
          {results.map((job) => (
            <article className="search-row" key={job.id}>
              <div className={`company-logo logo-${Number(job.id.slice(1)) % 5}`}>
                {monogram(job.company)}
              </div>
              <div>
                <button className="job-title" onClick={() => openJob(job.id)}>
                  {job.title}
                </button>
                <p>{job.company}</p>
                <p className="muted">
                  {job.arrangement} · SGD {job.pay}
                </p>
                <p className={job.hiring ? "confirmed" : "unconfirmed"}>
                  {job.hiring || "Hiring status unconfirmed"}
                </p>
                {job.id === "J08" && <span className="applied-label">Applied 12 Nov 2026</span>}
              </div>
              <button
                className={
                  state.shortlist.includes(job.id) ? "secondary-btn small" : "primary-btn small"
                }
                onClick={() => toggleShortlist(job.id)}
              >
                {state.shortlist.includes(job.id) ? "Remove" : "Save"}
              </button>
            </article>
          ))}
        </section>
      </div>
    </div>
  );
}

function NarrowView({
  jobs: pairJobs,
  pendingCount,
  expanded,
  toggleExpanded,
  onBack,
  onDecision,
  complete,
  kept,
  onReviewKept,
  onResume,
  onSearch,
  filtersActive,
  clearFilters,
}: {
  jobs: Job[];
  pendingCount: number;
  statuses: Record<string, Status>;
  expanded: Record<string, boolean>;
  toggleExpanded: (s: string) => void;
  onBack: () => void;
  onDecision: (s: string) => void;
  complete: boolean;
  kept: Job[];
  onReviewKept: () => void;
  onResume: () => void;
  onSearch: () => void;
  filtersActive: boolean;
  clearFilters: () => void;
}) {
  if (complete && filtersActive)
    return (
      <div className="page-content end-round">
        <div className="completion-card">
          <div className="complete-icon filter-empty">
            <Icon name="filter" size={20} />
          </div>
          <p className="eyebrow">FILTERED REVIEW POOL</p>
          <h2>No pending roles match these filters</h2>
          <p>
            Your decisions are unchanged. Clear the active filters to continue with other pending
            jobs.
          </p>
          <div className="completion-actions filter-actions">
            <button className="primary-btn" onClick={clearFilters}>
              Clear filters and continue
            </button>
            <button className="secondary-btn" onClick={onBack}>
              Return to shortlist
            </button>
          </div>
        </div>
      </div>
    );
  if (complete)
    return (
      <div className="page-content end-round">
        <div className="completion-card">
          <div className="complete-icon">✓</div>
          <p className="eyebrow">ROUND COMPLETE</p>
          <h2>You’ve reviewed every pending role</h2>
          <p>Keep means continued consideration. No applications have been started.</p>
          <div className="kept-summary">
            <h3>
              Kept roles <span>{kept.length}</span>
            </h3>
            {kept.length ? (
              kept.map((j) => (
                <div key={j.id}>
                  <span className={`company-logo logo-${Number(j.id.slice(1)) % 5}`}>
                    {monogram(j.company)}
                  </span>
                  <span>
                    <strong>{j.title}</strong>
                    <small>{j.company}</small>
                  </span>
                </div>
              ))
            ) : (
              <p>No roles were kept in this round.</p>
            )}
          </div>
          <div className="completion-actions">
            <button className="primary-btn" onClick={onReviewKept} disabled={kept.length === 0}>
              Review kept roles again
            </button>
            <button className="secondary-btn" onClick={onResume}>
              Resume postponed roles
            </button>
            <button className="text-btn" onClick={onSearch}>
              Return to search
            </button>
          </div>
        </div>
      </div>
    );
  return (
    <div className="page-content compare-page">
      <div className="compare-top">
        <button className="back-link" onClick={onBack}>
          <Icon name="arrow" size={18} /> Back to shortlist
        </button>
        <div>
          <span className="pending-count">{pendingCount} pending</span>
          <span>Compare roles directly—there is no automatic ranking</span>
        </div>
      </div>
      {pairJobs.length < 2 && (
        <div className="single-notice">
          <strong>One role remains in this review pool.</strong>
          <span>
            Review it on its own, or{" "}
            {filtersActive
              ? "clear filters to include more pending jobs."
              : "make an individual decision."}
          </span>
          {filtersActive && (
            <button className="secondary-btn small" onClick={clearFilters}>
              Clear filters
            </button>
          )}
        </div>
      )}
      <div className={`comparison-grid ${pairJobs.length === 1 ? "single" : ""}`}>
        {pairJobs.map((job) => (
          <JobCompareCard
            key={job.id}
            job={job}
            expanded={expanded}
            toggleExpanded={toggleExpanded}
          />
        ))}
      </div>
      <div className="decision-bar">
        <div>
          <strong>Which roles should stay in consideration?</strong>
          <span>Your decision is saved only after confirmation.</span>
        </div>
        <div className="decision-buttons">
          {pairJobs.length === 2 ? (
            <>
              <button onClick={() => onDecision("left")}>
                Keep {pairJobs[0].company}
                <small>Set aside {pairJobs[1].company}</small>
              </button>
              <button onClick={() => onDecision("right")}>
                Keep {pairJobs[1].company}
                <small>Set aside {pairJobs[0].company}</small>
              </button>
              <button onClick={() => onDecision("both")}>Keep both</button>
              <button onClick={() => onDecision("aside")}>Set aside both</button>
              <button onClick={() => onDecision("later")}>Review both later</button>
            </>
          ) : (
            <>
              <button onClick={() => onDecision("left")}>Keep</button>
              <button onClick={() => onDecision("aside")}>Set aside</button>
              <button onClick={() => onDecision("later")}>Review later</button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function JobCompareCard({
  job,
  expanded,
  toggleExpanded,
}: {
  job: Job;
  expanded: Record<string, boolean>;
  toggleExpanded: (s: string) => void;
}) {
  const sections = [
    {
      key: "responsibilities",
      title: "Responsibilities",
      content: job.responsibilities.map((x) => <li key={x}>{x}</li>),
      excerpt: `“You will ${job.responsibilities.map((x) => x.toLowerCase()).join(" and ")}.”`,
    },
    {
      key: "technologies",
      title: "Technologies and experience",
      content: (
        <>
          <div className="tag-list">
            {job.technologies.map((x) => (
              <span key={x}>{x}</span>
            ))}
          </div>
          <p>{job.experience} experience</p>
        </>
      ),
      excerpt: `“We’re looking for candidates with ${job.experience} of experience working with ${job.technologies.join(", ")}.”`,
    },
    {
      key: "pay",
      title: "Pay",
      content: (
        <p className="large-value">
          {job.pay === "Not provided" ? "Not provided" : `SGD ${job.pay} / month`}
        </p>
      ),
      excerpt:
        job.pay === "Not provided"
          ? "The employer did not include a salary range."
          : `“Monthly salary range: SGD ${job.pay}.”`,
    },
    {
      key: "arrangement",
      title: "Work arrangement and eligibility",
      content: (
        <>
          <p>{job.arrangement}</p>
          <p className="muted">{job.eligibility}</p>
        </>
      ),
      excerpt: `“This role is ${job.arrangement.toLowerCase()}. Applicants: ${job.eligibility}.”`,
    },
    {
      key: "hiring",
      title: "Hiring evidence",
      content: job.hiring ? (
        <>
          <p className="confirmed">{job.hiring}</p>
          <p className="muted">Source: Employer listing update</p>
        </>
      ) : (
        <>
          <p className="unconfirmed">Hiring status unconfirmed</p>
          <p className="muted">
            No dated employer confirmation is available. This does not mean the role is closed.
          </p>
        </>
      ),
      excerpt: job.hiring
        ? `“${job.hiring}.” — employer listing update`
        : "No source excerpt is available because no dated employer confirmation was provided.",
    },
  ];
  return (
    <article className="compare-card">
      <header>
        <div className={`company-logo logo-${Number(job.id.slice(1)) % 5}`}>
          {monogram(job.company)}
        </div>
        <div>
          <span className="job-id">{job.id}</span>
          <h2>{job.title}</h2>
          <p>{job.company}</p>
        </div>
      </header>
      <div className="history-line">
        <Icon name="history" size={16} />
        <span>Previous activity: {job.history}</span>
      </div>
      {sections.map((section) => {
        const key = `${job.id}-${section.key}`;
        return (
          <section className="compare-section" key={key}>
            <div className="section-title">
              <h3>{section.title}</h3>
              <button onClick={() => toggleExpanded(key)} aria-expanded={!!expanded[key]}>
                {expanded[key] ? "Hide source" : "Show source"}{" "}
                <span className={expanded[key] ? "rotated" : ""}>⌄</span>
              </button>
            </div>
            <div className="section-content">
              {section.key === "responsibilities" ? <ul>{section.content}</ul> : section.content}
            </div>
            {expanded[key] && <blockquote>{section.excerpt}</blockquote>}
          </section>
        );
      })}
    </article>
  );
}

function HistoryView({
  history,
  reopen,
}: {
  history: HistoryEntry[];
  reopen: (h: HistoryEntry) => void;
}) {
  return (
    <div className="page-content history-page">
      <div className="page-heading">
        <div>
          <p className="breadcrumb">Jobs / Review history</p>
          <h2>Review history</h2>
          <p>Revisit or update decisions made while narrowing your shortlist.</p>
        </div>
      </div>
      {!history.length ? (
        <div className="history-empty">
          <Icon name="history" size={34} />
          <h3>No decisions yet</h3>
          <p>Your confirmed comparisons will appear here.</p>
        </div>
      ) : (
        <div className="history-list">
          {[...history].reverse().map((entry, index) => (
            <article key={entry.id}>
              <div className="history-timeline">
                <span>{history.length - index}</span>
                <i />
              </div>
              <div className="history-card">
                <div className="history-head">
                  <span>{entry.date}</span>
                  {entry.flagged && <strong className="review-flag">Needs review</strong>}
                </div>
                <h3>
                  {entry.jobIds.map((id) => jobs.find((j) => j.id === id)?.company).join(" and ")}
                </h3>
                <p className="history-decision">{entry.decision}</p>
                {(entry.reason || entry.note) && (
                  <dl>
                    {entry.reason && (
                      <>
                        <dt>Reason</dt>
                        <dd>{entry.reason}</dd>
                      </>
                    )}
                    {entry.note && (
                      <>
                        <dt>Private note</dt>
                        <dd>{entry.note}</dd>
                      </>
                    )}
                  </dl>
                )}
                {entry.flagged && (
                  <p className="flag-note">
                    A later state may conflict because an earlier decision involving this job was
                    edited.
                  </p>
                )}
                <button className="secondary-btn small" onClick={() => reopen(entry)}>
                  Reopen comparison
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

function JobDetail({
  job,
  state,
  close,
  toggleShortlist,
  apply,
}: {
  job: Job;
  state: AppState;
  close: () => void;
  toggleShortlist: (id: string) => void;
  apply: () => void;
}) {
  return (
    <div
      className="modal-backdrop detail-backdrop"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) close();
      }}
    >
      <aside
        className="detail-drawer"
        role="dialog"
        aria-modal="true"
        aria-label={`${job.title} details`}
      >
        <div className="drawer-top">
          <button className="icon-btn" onClick={close} aria-label="Close details">
            <Icon name="close" />
          </button>
        </div>
        <div className="detail-hero">
          <div className={`company-logo large logo-${Number(job.id.slice(1)) % 5}`}>
            {monogram(job.company)}
          </div>
          <span>{job.id}</span>
          <h2>{job.title}</h2>
          <p>{job.company}</p>
          <p>{job.arrangement}</p>
          <div className="detail-actions">
            <button className="primary-btn" onClick={apply}>
              Apply
            </button>
            <button className="secondary-btn" onClick={() => toggleShortlist(job.id)}>
              {state.shortlist.includes(job.id) ? "Remove from shortlist" : "Add to shortlist"}
            </button>
          </div>
        </div>
        <div className="detail-body">
          <section>
            <h3>About the job</h3>
            <p>{job.responsibilities.join(". ")}.</p>
          </section>
          <section>
            <h3>Technologies and experience</h3>
            <div className="tag-list">
              {job.technologies.map((x) => (
                <span key={x}>{x}</span>
              ))}
            </div>
            <p>{job.experience}</p>
          </section>
          <section>
            <h3>Pay</h3>
            <p>{job.pay === "Not provided" ? "Not provided" : `SGD ${job.pay} per month`}</p>
          </section>
          <section>
            <h3>Eligibility</h3>
            <p>{job.eligibility}</p>
          </section>
          <section>
            <h3>Hiring status</h3>
            {job.hiring ? (
              <p className="confirmed">
                {job.hiring}
                <small>Source: Employer listing update</small>
              </p>
            ) : (
              <p className="unconfirmed">
                Hiring status unconfirmed<small>No dated employer confirmation is available.</small>
              </p>
            )}
          </section>
          <section>
            <h3>Previous activity</h3>
            <p>{job.history}</p>
          </section>
        </div>
      </aside>
    </div>
  );
}

function Dialog({
  title,
  close,
  children,
}: {
  title: string;
  close: () => void;
  children: React.ReactNode;
}) {
  return (
    <div
      className="modal-backdrop"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) close();
      }}
    >
      <div className="dialog" role="dialog" aria-modal="true" aria-labelledby="dialog-title">
        <div className="dialog-head">
          <h2 id="dialog-title">{title}</h2>
          <button className="icon-btn" onClick={close} aria-label="Close">
            <Icon name="close" />
          </button>
        </div>
        <div className="dialog-body">{children}</div>
      </div>
    </div>
  );
}
