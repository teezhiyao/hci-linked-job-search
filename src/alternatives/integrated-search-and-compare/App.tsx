import { FormEvent, ReactNode, useEffect, useMemo, useRef, useState } from "react";

const STUDY_DATE = new Date("2026-11-19T12:00:00");
const STORAGE_KEY = "integrated-search-compare-v1";

export const studyContent = {
  label: "Interactive prototype",
  projectName: "Integrated search and compare",
  overview: [
    { title: "About this prototype", text: "[Replace with the prototype description.]" },
    { title: "Your scenario", text: "[Replace with the participant scenario.]" },
    { title: "Before you begin", text: "[Replace with evaluation instructions.]" },
  ],
  notice: "All jobs, companies, and listing details in this prototype are fictional.",
  tasks: [
    { title: "[Task 1 title]", description: "[Replace with the first task description.]" },
    { title: "[Task 2 title]", description: "[Replace with the second task description.]" },
    { title: "[Task 3 title]", description: "[Replace with the third task description.]" },
  ],
};

type Arrangement = "Remote" | "Hybrid" | "On-site";
type History = { viewed?: string; saved?: string; applied?: string };
type Job = {
  id: string;
  company: string;
  title: string;
  experience: [number, number];
  technologies: string[];
  responsibilities: string[];
  salary: [number, number] | null;
  arrangement: Arrangement;
  officeDays: number | null;
  location: string;
  eligibility: string;
  hiringDate: string | null;
  history: History;
};

const JOBS: Job[] = [
  {
    id: "J01",
    company: "Northstar Health",
    title: "Junior Frontend Developer",
    experience: [0, 2],
    technologies: ["React", "TypeScript", "CSS"],
    responsibilities: ["Build patient-portal interfaces", "Implement accessible components"],
    salary: [4000, 5000],
    arrangement: "Hybrid",
    officeDays: 2,
    location: "Singapore",
    eligibility: "Singapore-based applicants",
    hiringDate: "2026-11-17",
    history: { viewed: "18 Nov 2026" },
  },
  {
    id: "J02",
    company: "Harbor Digital",
    title: "Frontend Software Engineer",
    experience: [2, 4],
    technologies: ["React", "TypeScript", "testing"],
    responsibilities: ["Develop customer dashboards", "Improve frontend performance"],
    salary: [5500, 7000],
    arrangement: "Remote",
    officeDays: null,
    location: "Singapore",
    eligibility: "Must reside in Singapore",
    hiringDate: null,
    history: { saved: "18 Nov 2026" },
  },
  {
    id: "J03",
    company: "Fieldwork Labs",
    title: "Junior Backend Developer",
    experience: [0, 2],
    technologies: ["Python", "Django", "PostgreSQL"],
    responsibilities: ["Build REST APIs", "Maintain data models"],
    salary: null,
    arrangement: "On-site",
    officeDays: 5,
    location: "Singapore",
    eligibility: "Singapore-based applicants",
    hiringDate: "2026-11-15",
    history: {},
  },
  {
    id: "J04",
    company: "Cedar Commerce",
    title: "Backend Software Engineer",
    experience: [2, 4],
    technologies: ["Java", "Spring Boot", "SQL"],
    responsibilities: ["Develop checkout services", "Improve service reliability"],
    salary: [5500, 7500],
    arrangement: "Hybrid",
    officeDays: 3,
    location: "Singapore",
    eligibility: "Singapore-based applicants",
    hiringDate: "2026-10-28",
    history: {},
  },
  {
    id: "J05",
    company: "Brightpath Learning",
    title: "Junior Full-Stack Developer",
    experience: [0, 2],
    technologies: ["React", "Node.js", "PostgreSQL"],
    responsibilities: ["Build learning-platform features", "Maintain frontend and API tests"],
    salary: [4500, 5500],
    arrangement: "Hybrid",
    officeDays: 1,
    location: "Singapore",
    eligibility: "Singapore-based applicants",
    hiringDate: "2026-11-18",
    history: {},
  },
  {
    id: "J06",
    company: "Meridian Systems",
    title: "Full-Stack Software Engineer",
    experience: [2, 4],
    technologies: ["TypeScript", "React", "Node.js"],
    responsibilities: ["Develop internal workflow tools", "Own features from interface to API"],
    salary: [6000, 8000],
    arrangement: "Remote",
    officeDays: null,
    location: "Singapore",
    eligibility: "Singapore or Malaysia residents",
    hiringDate: "2026-11-16",
    history: {},
  },
  {
    id: "J07",
    company: "PocketWorks",
    title: "Junior Mobile Developer",
    experience: [0, 2],
    technologies: ["Flutter", "Dart"],
    responsibilities: ["Build mobile application screens", "Integrate backend APIs"],
    salary: [4000, 5200],
    arrangement: "Hybrid",
    officeDays: 2,
    location: "Singapore",
    eligibility: "Singapore-based applicants",
    hiringDate: null,
    history: {},
  },
  {
    id: "J08",
    company: "Atlas Logistics",
    title: "Software Engineer, Integrations",
    experience: [2, 4],
    technologies: ["C#", ".NET", "SQL"],
    responsibilities: ["Build partner integrations", "Troubleshoot data exchange"],
    salary: [5200, 6800],
    arrangement: "On-site",
    officeDays: 5,
    location: "Singapore",
    eligibility: "Singapore-based applicants",
    hiringDate: "2026-11-14",
    history: { applied: "12 Nov 2026" },
  },
  {
    id: "J09",
    company: "GreenGrid Energy",
    title: "Python Software Developer",
    experience: [1, 3],
    technologies: ["Python", "FastAPI", "PostgreSQL"],
    responsibilities: ["Develop energy-data services", "Maintain automated tests"],
    salary: [5000, 6500],
    arrangement: "Remote",
    officeDays: null,
    location: "Australia",
    eligibility: "Must reside in Australia",
    hiringDate: "2026-11-18",
    history: {},
  },
  {
    id: "J10",
    company: "Studio Orbit",
    title: "Web Application Developer",
    experience: [1, 3],
    technologies: ["Vue", "TypeScript", "Node.js"],
    responsibilities: ["Build client web applications", "Collaborate on interface implementation"],
    salary: null,
    arrangement: "Hybrid",
    officeDays: null,
    location: "Singapore",
    eligibility: "Singapore-based applicants",
    hiringDate: "2026-11-05",
    history: { viewed: "17 Nov 2026" },
  },
];

type Importance = "Required" | "Preferred";
type ReqKey = "keywords" | "salary" | "arrangement" | "experience" | "eligibility" | "hiring";
type Requirements = {
  keywords: string[];
  keywordMode: "Any" | "All";
  salary: number;
  currency: string;
  payPeriod: string;
  arrangements: Arrangement[];
  maxOfficeDays: number;
  minExperience: number;
  maxExperience: number;
  eligibility: string;
  hiringDays: number;
  enabled: Record<ReqKey, boolean>;
  importance: Record<ReqKey, Importance>;
};

const reqKeys: ReqKey[] = [
  "keywords",
  "salary",
  "arrangement",
  "experience",
  "eligibility",
  "hiring",
];
const reqNames: Record<ReqKey, string> = {
  keywords: "Keywords",
  salary: "Minimum pay",
  arrangement: "Work arrangement",
  experience: "Required experience",
  eligibility: "Geographic eligibility",
  hiring: "Recent hiring confirmation",
};
const INITIAL_REQUIREMENTS: Requirements = {
  keywords: ["React", "TypeScript", "Node.js"],
  keywordMode: "Any",
  salary: 5000,
  currency: "SGD",
  payPeriod: "month",
  arrangements: ["Remote", "Hybrid"],
  maxOfficeDays: 2,
  minExperience: 0,
  maxExperience: 3,
  eligibility: "Singapore",
  hiringDays: 14,
  enabled: {
    keywords: true,
    salary: true,
    arrangement: true,
    experience: true,
    eligibility: true,
    hiring: true,
  },
  importance: {
    keywords: "Required",
    salary: "Required",
    arrangement: "Required",
    experience: "Required",
    eligibility: "Required",
    hiring: "Required",
  },
};

type Assessment = {
  status: "Meets" | "Does not meet" | "Partially meets" | "Unknown";
  explanation: string;
  evidence: string;
};
type AppState = {
  history: Record<string, History>;
  selectedId: string;
  compared: string[];
  requirements: Requirements;
  tasks: ("open" | "complete" | "unable")[];
  activeTask: number;
};
const initialState: AppState = {
  history: Object.fromEntries(JOBS.map((j) => [j.id, j.history])),
  selectedId: "J01",
  compared: [],
  requirements: INITIAL_REQUIREMENTS,
  tasks: studyContent.tasks.map(() => "open"),
  activeTask: 0,
};

function loadState(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return initialState;
    const parsed = JSON.parse(raw);
    return {
      ...initialState,
      ...parsed,
      requirements: { ...INITIAL_REQUIREMENTS, ...parsed.requirements },
    };
  } catch {
    return initialState;
  }
}

function Icon({ name, size = 20 }: { name: string; size?: number }) {
  const paths: Record<string, ReactNode> = {
    search: (
      <>
        <circle cx="10.5" cy="10.5" r="6.5" />
        <path d="m15.5 15.5 5 5" />
      </>
    ),
    home: (
      <>
        <path d="m3 11 9-8 9 8" />
        <path d="M5.5 9.5V21h13V9.5M9 21v-7h6v7" />
      </>
    ),
    people: (
      <>
        <circle cx="8" cy="8" r="3.5" />
        <circle cx="17" cy="9" r="3" />
        <path d="M1.5 21c.4-5 2.7-7 6.5-7s6.1 2 6.5 7M14 15c4-.6 7.5 1.2 8 5" />
      </>
    ),
    briefcase: (
      <>
        <rect x="3" y="7" width="18" height="13" rx="2" />
        <path d="M8 7V4h8v3M3 12h18M10 12v2h4v-2" />
      </>
    ),
    message: (
      <>
        <path d="M4 5h16v12H9l-5 4V5Z" />
      </>
    ),
    bell: (
      <>
        <path d="M5 17h14l-2-3V9a5 5 0 0 0-10 0v5l-2 3ZM10 21h4" />
      </>
    ),
    user: (
      <>
        <circle cx="12" cy="8" r="4" />
        <path d="M4 22c.5-5 3-7 8-7s7.5 2 8 7" />
      </>
    ),
    bookmark: <path d="M6 3h12v18l-6-4-6 4V3Z" />,
    check: <path d="m5 12 4 4L19 6" />,
    close: <path d="m5 5 14 14M19 5 5 19" />,
    chevron: <path d="m8 10 4 4 4-4" />,
    tune: (
      <>
        <path d="M4 7h16M7 4v6M4 17h16M16 14v6" />
      </>
    ),
    compare: (
      <>
        <path d="M8 4 4 8l4 4M4 8h16M16 20l4-4-4-4M20 16H4" />
      </>
    ),
  };
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      width={size}
      height={size}
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

const formatSalary = (j: Job) =>
  j.salary
    ? `SGD ${j.salary[0].toLocaleString()}–${j.salary[1].toLocaleString()} / month`
    : "Pay not provided";
const formatArrangement = (j: Job) =>
  j.arrangement === "Hybrid"
    ? `Hybrid · ${j.officeDays == null ? "office frequency not provided" : `${j.officeDays} office day${j.officeDays === 1 ? "" : "s"}/week`}`
    : j.arrangement;
const daysAgo = (date: string) =>
  Math.floor((STUDY_DATE.getTime() - new Date(`${date}T12:00:00`).getTime()) / 86400000);
const friendlyDate = (date: string) =>
  new Date(`${date}T12:00:00`).toLocaleDateString("en-SG", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

function assess(job: Job, req: Requirements, key: ReqKey): Assessment {
  if (!req.enabled[key])
    return {
      status: "Unknown",
      explanation: "This criterion is disabled.",
      evidence: "Not assessed",
    };
  if (key === "keywords") {
    const hay = [...job.technologies, ...job.responsibilities].join(" ").toLowerCase();
    const matches = req.keywords.filter((k) => hay.includes(k.toLowerCase()));
    const meets =
      req.keywordMode === "Any" ? matches.length > 0 : matches.length === req.keywords.length;
    const partial = req.keywordMode === "All" && matches.length > 0;
    return {
      status: meets ? "Meets" : partial ? "Partially meets" : "Does not meet",
      explanation: `${matches.length} of ${req.keywords.length} keywords found in the listing.`,
      evidence: matches.length ? `Found: ${matches.join(", ")}` : "No selected keywords found",
    };
  }
  if (key === "salary") {
    if (!job.salary)
      return {
        status: "Unknown",
        explanation: "The employer did not provide pay information.",
        evidence: "Not provided",
      };
    const status =
      job.salary[0] >= req.salary
        ? "Meets"
        : job.salary[1] >= req.salary
          ? "Partially meets"
          : "Does not meet";
    return {
      status,
      explanation:
        status === "Meets"
          ? "The entire range is at or above your minimum."
          : status === "Partially meets"
            ? "The range overlaps your minimum."
            : "The entire range is below your minimum.",
      evidence: formatSalary(job),
    };
  }
  if (key === "arrangement") {
    if (!req.arrangements.includes(job.arrangement))
      return {
        status: "Does not meet",
        explanation: `${job.arrangement} is not one of your accepted arrangements.`,
        evidence: formatArrangement(job),
      };
    if (job.arrangement === "Hybrid" && job.officeDays == null)
      return {
        status: "Unknown",
        explanation: "Hybrid office frequency was not provided.",
        evidence: formatArrangement(job),
      };
    if (job.arrangement === "Hybrid" && (job.officeDays || 0) > req.maxOfficeDays)
      return {
        status: "Does not meet",
        explanation: `This role requires more than ${req.maxOfficeDays} office days per week.`,
        evidence: formatArrangement(job),
      };
    return {
      status: "Meets",
      explanation: "The listed arrangement is within your preference.",
      evidence: formatArrangement(job),
    };
  }
  if (key === "experience") {
    const [low, high] = job.experience;
    const meets = low >= req.minExperience && high <= req.maxExperience;
    const overlap = high >= req.minExperience && low <= req.maxExperience;
    return {
      status: meets ? "Meets" : overlap ? "Partially meets" : "Does not meet",
      explanation: meets
        ? "The entire required range is within your range."
        : overlap
          ? "The required range partially overlaps your range."
          : "The required range is outside your range.",
      evidence: `${low}–${high} years required`,
    };
  }
  if (key === "eligibility") {
    const match = job.eligibility.toLowerCase().includes(req.eligibility.toLowerCase());
    return {
      status: match ? "Meets" : "Does not meet",
      explanation: match
        ? "The listing includes your selected geography."
        : "The listing requires a different geography.",
      evidence: job.eligibility,
    };
  }
  if (!job.hiringDate)
    return {
      status: "Unknown",
      explanation: "No dated employer confirmation was provided.",
      evidence: "Not provided",
    };
  const age = daysAgo(job.hiringDate);
  return {
    status: age <= req.hiringDays ? "Meets" : "Does not meet",
    explanation:
      age <= req.hiringDays
        ? `Employer confirmation is ${age} day${age === 1 ? "" : "s"} old.`
        : `Employer confirmation is older than your ${req.hiringDays}-day limit.`,
    evidence: `Employer confirmed open ${friendlyDate(job.hiringDate)}`,
  };
}

function Badge({ status }: { status: Assessment["status"] }) {
  return (
    <span className={`status status-${status.toLowerCase().replaceAll(" ", "-")}`}>
      <span className="status-dot" />
      {status}
    </span>
  );
}

function StudyGuide({
  state,
  setState,
  visible,
  setVisible,
  width,
  setWidth,
  overlay,
}: {
  state: AppState;
  setState: React.Dispatch<React.SetStateAction<AppState>>;
  visible: boolean;
  setVisible: (v: boolean) => void;
  width: number;
  setWidth: (n: number) => void;
  overlay: boolean;
}) {
  const [tab, setTab] = useState<"overview" | "tasks">("overview");
  const drag = useRef(false);
  useEffect(() => {
    const move = (e: PointerEvent) => {
      if (drag.current && !overlay) setWidth(Math.max(260, Math.min(480, e.clientX)));
    };
    const up = () => {
      drag.current = false;
      document.body.classList.remove("resizing");
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
    };
  }, [overlay, setWidth]);
  if (!visible) return null;
  const done = state.tasks.filter((t) => t !== "open").length;
  const task = studyContent.tasks[state.activeTask];
  return (
    <>
      {overlay && (
        <button
          className="guide-scrim"
          aria-label="Close guide"
          onClick={() => setVisible(false)}
        />
      )}
      <aside
        className={`study-guide ${overlay ? "guide-overlay" : ""}`}
        style={{ width: overlay ? 340 : width }}
      >
        <div className="guide-inner">
          <div className="guide-top">
            <span className="prototype-pill">{studyContent.label}</span>
            <button className="text-button" onClick={() => setVisible(false)}>
              Hide guide
            </button>
          </div>
          <h1>{studyContent.projectName}</h1>
          <div className="guide-tabs" role="tablist" aria-label="Study guide sections">
            <button
              role="tab"
              aria-selected={tab === "overview"}
              onClick={() => setTab("overview")}
            >
              Overview
            </button>
            <button
              role="tab"
              aria-selected={tab === "tasks"}
              onClick={() => setTab("tasks")}
            >
              Tasks{" "}
              <span>
                {done}/{studyContent.tasks.length}
              </span>
            </button>
          </div>
          <div className="guide-content">
          {tab === "overview" ? (
            <>
              {studyContent.overview.map((section) => (
                <section className="guide-section" key={section.title}>
                  <h2>{section.title}</h2>
                  <p>{section.text}</p>
                </section>
              ))}
              <div className="fictional-note">
                <strong>Study note</strong>
                <span>{studyContent.notice}</span>
              </div>
            </>
          ) : (
            <>
              <div className="progress-row">
                <span>
                  Task {state.activeTask + 1} of {studyContent.tasks.length}
                </span>
                <strong>
                  {done}/{studyContent.tasks.length} complete
                </strong>
              </div>
              <div className="progress-track">
                <span style={{ width: `${(done / studyContent.tasks.length) * 100}%` }} />
              </div>
              <article className="task-card">
                <span className="task-number">TASK {state.activeTask + 1}</span>
                <h2>{task.title}</h2>
                <p>{task.description}</p>
                <p className="self-report">Completion is self-reported.</p>
                <button
                  className="primary wide"
                  disabled={state.tasks[state.activeTask] === "complete"}
                  onClick={() =>
                    setState((s) => ({
                      ...s,
                      tasks: s.tasks.map((v, i) => (i === s.activeTask ? "complete" : v)),
                    }))
                  }
                >
                  {state.tasks[state.activeTask] === "complete" ? "Completed" : "Mark complete"}
                </button>
                <button
                  className="secondary wide"
                  onClick={() =>
                    setState((s) => ({
                      ...s,
                      tasks: s.tasks.map((v, i) => (i === s.activeTask ? "unable" : v)),
                    }))
                  }
                >
                  Unable to finish
                </button>
              </article>
              <div className="task-nav">
                <button
                  className="secondary"
                  disabled={state.activeTask === 0}
                  onClick={() => setState((s) => ({ ...s, activeTask: s.activeTask - 1 }))}
                >
                  Previous
                </button>
                <button
                  className="secondary"
                  disabled={state.activeTask === studyContent.tasks.length - 1}
                  onClick={() => setState((s) => ({ ...s, activeTask: s.activeTask + 1 }))}
                >
                  Next
                </button>
              </div>
            </>
          )}
          </div>
          <div className="guide-footer">
            <button
              className="reset-button"
              onClick={() => {
                if (
                  confirm(
                    "Reset the entire prototype? Your search, requirements, history, comparison, and task progress will be restored to their initial state.",
                  )
                ) {
                  localStorage.removeItem(STORAGE_KEY);
                  window.location.reload();
                }
              }}
            >
              Reset prototype
            </button>
          </div>
        </div>
        {!overlay && (
          <div
            className="resize-handle"
            role="separator"
            aria-orientation="vertical"
            aria-label="Resize guide"
            onPointerDown={() => {
              drag.current = true;
              document.body.classList.add("resizing");
            }}
          />
        )}
      </aside>
    </>
  );
}

function Header({ guideVisible, onShowGuide }: { guideVisible: boolean; onShowGuide: () => void }) {
  const nav = [
    ["home", "Home"],
    ["people", "My Network"],
    ["briefcase", "Jobs"],
    ["message", "Messaging"],
    ["bell", "Notifications"],
    ["user", "Me"],
  ];
  return (
    <header className="global-nav">
      <div className="nav-inner">
        {!guideVisible && (
          <button className="show-guide" onClick={onShowGuide}>
            Show guide
          </button>
        )}
        <div className="linkedin-logo" aria-label="LinkedIn">
          in
        </div>
        <div className="nav-search">
          <Icon name="search" size={17} />
          <span>Search jobs</span>
        </div>
        <nav aria-label="Primary">
          {nav.map(([icon, label]) => (
            <button key={label} className={label === "Jobs" ? "selected" : ""}>
              <Icon name={icon} size={21} />
              <span>{label}</span>
            </button>
          ))}
        </nav>
      </div>
    </header>
  );
}

function RequirementsEditor({
  value,
  onSave,
  onClose,
}: {
  value: Requirements;
  onSave: (r: Requirements) => void;
  onClose: () => void;
}) {
  const [draft, setDraft] = useState<Requirements>(() => structuredClone(value));
  const [newKeyword, setNewKeyword] = useState("");
  const update = <K extends keyof Requirements>(key: K, val: Requirements[K]) =>
    setDraft((d) => ({ ...d, [key]: val }));
  return (
    <div
      className="modal-backdrop"
      role="presentation"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="modal requirements-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="requirements-title"
      >
        <div className="modal-head">
          <div>
            <h2 id="requirements-title">My requirements</h2>
            <p>Assess each job against what matters to you. Jobs will not be hidden.</p>
          </div>
          <button className="icon-button" aria-label="Close" onClick={onClose}>
            <Icon name="close" />
          </button>
        </div>
        <div className="criteria-list">
          {reqKeys.map((key) => (
            <section
              className={`criterion-editor ${draft.enabled[key] ? "" : "disabled"}`}
              key={key}
            >
              <div className="criterion-head">
                <div>
                  <h3>{reqNames[key]}</h3>
                  <span>{draft.enabled[key] ? draft.importance[key] : "Disabled"}</span>
                </div>
                <div className="criterion-controls">
                  {draft.enabled[key] ? (
                    <>
                      <select
                        aria-label={`${reqNames[key]} importance`}
                        value={draft.importance[key]}
                        onChange={(e) =>
                          setDraft((d) => ({
                            ...d,
                            importance: { ...d.importance, [key]: e.target.value as Importance },
                          }))
                        }
                      >
                        <option>Required</option>
                        <option>Preferred</option>
                      </select>
                      <button
                        onClick={() =>
                          setDraft((d) => ({ ...d, enabled: { ...d.enabled, [key]: false } }))
                        }
                      >
                        Remove
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() =>
                        setDraft((d) => ({ ...d, enabled: { ...d.enabled, [key]: true } }))
                      }
                    >
                      Enable
                    </button>
                  )}
                </div>
              </div>
              {draft.enabled[key] && (
                <div className="criterion-fields">
                  {key === "keywords" && (
                    <>
                      <div className="chip-editor">
                        {draft.keywords.map((k) => (
                          <span key={k}>
                            {k}
                            <button
                              aria-label={`Remove ${k}`}
                              onClick={() =>
                                update(
                                  "keywords",
                                  draft.keywords.filter((x) => x !== k),
                                )
                              }
                            >
                              ×
                            </button>
                          </span>
                        ))}
                        <input
                          aria-label="Add keyword"
                          placeholder="Add keyword"
                          value={newKeyword}
                          onChange={(e) => setNewKeyword(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" && newKeyword.trim()) {
                              e.preventDefault();
                              update("keywords", [...draft.keywords, newKeyword.trim()]);
                              setNewKeyword("");
                            }
                          }}
                        />
                      </div>
                      <div className="segmented">
                        <button
                          className={draft.keywordMode === "Any" ? "active" : ""}
                          onClick={() => update("keywordMode", "Any")}
                        >
                          Match any keyword
                        </button>
                        <button
                          className={draft.keywordMode === "All" ? "active" : ""}
                          onClick={() => update("keywordMode", "All")}
                        >
                          Match all keywords
                        </button>
                      </div>
                    </>
                  )}
                  {key === "salary" && (
                    <div className="field-row">
                      <label>
                        Minimum
                        <input
                          type="number"
                          value={draft.salary}
                          onChange={(e) => update("salary", Number(e.target.value))}
                        />
                      </label>
                      <label>
                        Currency
                        <select
                          value={draft.currency}
                          onChange={(e) => update("currency", e.target.value)}
                        >
                          <option>SGD</option>
                        </select>
                      </label>
                      <label>
                        Pay period
                        <select
                          value={draft.payPeriod}
                          onChange={(e) => update("payPeriod", e.target.value)}
                        >
                          <option>month</option>
                        </select>
                      </label>
                    </div>
                  )}
                  {key === "arrangement" && (
                    <>
                      <div className="check-row">
                        {(["Remote", "Hybrid", "On-site"] as Arrangement[]).map((a) => (
                          <label key={a}>
                            <input
                              type="checkbox"
                              checked={draft.arrangements.includes(a)}
                              onChange={(e) =>
                                update(
                                  "arrangements",
                                  e.target.checked
                                    ? [...draft.arrangements, a]
                                    : draft.arrangements.filter((x) => x !== a),
                                )
                              }
                            />
                            {a}
                          </label>
                        ))}
                      </div>
                      <label className="inline-field">
                        Maximum office days per week for Hybrid{" "}
                        <input
                          type="number"
                          min="0"
                          max="5"
                          value={draft.maxOfficeDays}
                          onChange={(e) => update("maxOfficeDays", Number(e.target.value))}
                        />
                      </label>
                    </>
                  )}
                  {key === "experience" && (
                    <div className="field-row">
                      <label>
                        Minimum years
                        <input
                          type="number"
                          min="0"
                          value={draft.minExperience}
                          onChange={(e) => update("minExperience", Number(e.target.value))}
                        />
                      </label>
                      <label>
                        Maximum years
                        <input
                          type="number"
                          min="0"
                          value={draft.maxExperience}
                          onChange={(e) => update("maxExperience", Number(e.target.value))}
                        />
                      </label>
                    </div>
                  )}
                  {key === "eligibility" && (
                    <label>
                      Eligible to work from
                      <input
                        value={draft.eligibility}
                        onChange={(e) => update("eligibility", e.target.value)}
                      />
                    </label>
                  )}
                  {key === "hiring" && (
                    <label className="inline-field">
                      Employer confirmation within{" "}
                      <input
                        type="number"
                        min="1"
                        value={draft.hiringDays}
                        onChange={(e) => update("hiringDays", Number(e.target.value))}
                      />{" "}
                      days
                    </label>
                  )}
                </div>
              )}
            </section>
          ))}
        </div>
        <div className="modal-actions">
          <button className="secondary" onClick={onClose}>
            Cancel
          </button>
          <button className="primary" onClick={() => onSave(draft)}>
            Save requirements
          </button>
        </div>
      </div>
    </div>
  );
}

function RequirementsSummary({ req, onEdit }: { req: Requirements; onEdit: () => void }) {
  const summaries: Partial<Record<ReqKey, string>> = {
    keywords: `${req.keywordMode} of ${req.keywords.join(", ")}`,
    salary: `${req.currency} ${req.salary.toLocaleString()}+ / ${req.payPeriod}`,
    arrangement: `${req.arrangements.join(" or ")}${req.arrangements.includes("Hybrid") ? ` · ≤${req.maxOfficeDays} office days` : ""}`,
    experience: `${req.minExperience}–${req.maxExperience} years`,
    eligibility: req.eligibility,
    hiring: `Confirmed within ${req.hiringDays} days`,
  };
  return (
    <section className="requirements-summary">
      <div className="requirements-title">
        <div>
          <span className="eyebrow">PERSONALIZED ASSESSMENT</span>
          <h2>My requirements</h2>
        </div>
        <button className="secondary" onClick={onEdit}>
          Edit requirements
        </button>
      </div>
      <div className="requirement-pills">
        {reqKeys
          .filter((k) => req.enabled[k])
          .map((k) => (
            <div key={k}>
              <span>{req.importance[k]}</span>
              {summaries[k]}
            </div>
          ))}
      </div>
    </section>
  );
}

function JobCard({
  job,
  history,
  selected,
  compared,
  onSelect,
  onCompare,
}: {
  job: Job;
  history: History;
  selected: boolean;
  compared: boolean;
  onSelect: () => void;
  onCompare: () => void;
}) {
  const state = history.applied
    ? "Applied"
    : history.saved
      ? "Saved"
      : history.viewed
        ? "Viewed"
        : "";
  return (
    <article className={`job-card ${selected ? "selected" : ""}`}>
      <button className="job-card-main" onClick={onSelect}>
        <div className={`company-logo logo-${Number(job.id.slice(1)) % 5}`}>
          {job.company
            .split(" ")
            .map((w) => w[0])
            .slice(0, 2)
            .join("")}
        </div>
        <div className="job-card-copy">
          <h3>{job.title}</h3>
          <div className="company">{job.company}</div>
          <div className="metadata">
            {job.location} · {formatArrangement(job)}
          </div>
          <div className="salary">{formatSalary(job)}</div>
          <p>{job.responsibilities.join("; ")}.</p>
          {state && (
            <span className={`history ${state.toLowerCase()}`}>
              {state}
              {history[state.toLowerCase() as keyof History]
                ? ` · ${history[state.toLowerCase() as keyof History]}`
                : ""}
            </span>
          )}
        </div>
      </button>
      <label className="compare-check">
        <input type="checkbox" checked={compared} onChange={onCompare} /> Compare
      </label>
    </article>
  );
}

function JobDetails({
  job,
  history,
  requirements,
  onSave,
  onApply,
}: {
  job: Job;
  history: History;
  requirements: Requirements;
  onSave: () => void;
  onApply: () => void;
}) {
  const [openEvidence, setOpenEvidence] = useState<ReqKey | null>(null);
  useEffect(() => setOpenEvidence(null), [job.id]);
  return (
    <article className="job-details">
      <div className="details-hero">
        <div className="detail-brand">
          <div className={`company-logo large logo-${Number(job.id.slice(1)) % 5}`}>
            {job.company
              .split(" ")
              .map((w) => w[0])
              .slice(0, 2)
              .join("")}
          </div>
          <span>{job.company}</span>
        </div>
        <h1>{job.title}</h1>
        <p>
          {job.company} · {job.location}
        </p>
        <p className="detail-meta">
          {formatArrangement(job)} · {job.experience[0]}–{job.experience[1]} years
        </p>
        <div className="details-actions">
          <button className="primary pill" onClick={onApply}>
            Apply
          </button>
          <button
            className={`secondary pill ${history.saved ? "saved-button" : ""}`}
            onClick={onSave}
          >
            <Icon name={history.saved ? "check" : "bookmark"} size={17} />
            {history.saved ? "Saved" : "Save"}
          </button>
        </div>
      </div>
      <div className="detail-section">
        <h2>Compared with your requirements</h2>
        <p className="section-intro">
          Each criterion is assessed independently. Select an assessment to see supporting listing
          text.
        </p>
        <div className="assessment-list">
          {reqKeys
            .filter((k) => requirements.enabled[k])
            .map((key) => {
              const a = assess(job, requirements, key);
              return (
                <div className="assessment-row" key={key}>
                  <button
                    aria-expanded={openEvidence === key}
                    onClick={() => setOpenEvidence(openEvidence === key ? null : key)}
                  >
                    <div>
                      <span className="criterion-name">
                        {reqNames[key]} <small>{requirements.importance[key]}</small>
                      </span>
                      <span className="criterion-explain">{a.explanation}</span>
                    </div>
                    <Badge status={a.status} />
                  </button>
                  {openEvidence === key && (
                    <div className="evidence">
                      <strong>Supporting listing text</strong>
                      <p>{a.evidence}</p>
                    </div>
                  )}
                </div>
              );
            })}
        </div>
      </div>
      <div className="detail-section">
        <h2>About the role</h2>
        <p>
          {job.company} is seeking a {job.title.toLowerCase()} to{" "}
          {job.responsibilities[0].toLowerCase()} and {job.responsibilities[1].toLowerCase()}. You
          will work with {job.technologies.join(", ")} in a {job.arrangement.toLowerCase()} role.
          This standardized summary is generated from the fictional employer listing.
        </p>
      </div>
      <div className="detail-section">
        <h2>Responsibilities</h2>
        <ul>
          {job.responsibilities.map((r) => (
            <li key={r}>{r}.</li>
          ))}
        </ul>
      </div>
      <div className="detail-grid">
        <section>
          <h3>Technologies</h3>
          <div className="tech-list">
            {job.technologies.map((t) => (
              <span key={t}>{t}</span>
            ))}
          </div>
        </section>
        <section>
          <h3>Required experience</h3>
          <p>
            {job.experience[0]}–{job.experience[1]} years
          </p>
        </section>
        <section>
          <h3>Pay</h3>
          <p>{job.salary ? formatSalary(job) : "Not provided"}</p>
        </section>
        <section>
          <h3>Work arrangement</h3>
          <p>{formatArrangement(job)}</p>
        </section>
        <section>
          <h3>Geographic eligibility</h3>
          <p>{job.eligibility || "Not provided"}</p>
        </section>
        <section>
          <h3>Hiring evidence</h3>
          <p>
            {job.hiringDate
              ? `Employer confirmed open ${friendlyDate(job.hiringDate)}`
              : "Not provided"}
          </p>
        </section>
      </div>
      <div className="hiring-note">
        <strong>About hiring evidence</strong>
        <p>
          An employer confirmation is a dated statement that applications are being accepted. It is
          not a guarantee of legitimacy, response, or employment.
        </p>
      </div>
    </article>
  );
}

function ComparisonDrawer({
  ids,
  requirements,
  history,
  leftOffset,
  onClose,
  onRemove,
  onSave,
  onEdit,
}: {
  ids: string[];
  requirements: Requirements;
  history: Record<string, History>;
  leftOffset: number;
  onClose: () => void;
  onRemove: (id: string) => void;
  onSave: (id: string) => void;
  onEdit: () => void;
}) {
  const jobs = ids.map((id) => JOBS.find((j) => j.id === id)!);
  const values: Record<ReqKey, (j: Job) => string> = {
    keywords: (j) => j.technologies.join(", "),
    salary: formatSalary,
    arrangement: formatArrangement,
    experience: (j) => `${j.experience[0]}–${j.experience[1]} years`,
    eligibility: (j) => j.eligibility,
    hiring: (j) => (j.hiringDate ? `Confirmed ${friendlyDate(j.hiringDate)}` : "Not provided"),
  };
  return (
    <section className="comparison-drawer" aria-label="Job comparison" style={{ left: leftOffset }}>
      <div className="comparison-head">
        <div>
          <span className="eyebrow">SIDE-BY-SIDE</span>
          <h2>
            Compare jobs <span>{jobs.length} selected</span>
          </h2>
        </div>
        <button className="icon-button" aria-label="Close comparison" onClick={onClose}>
          <Icon name="close" />
        </button>
      </div>
      <div className="comparison-scroll">
        <div
          className="comparison-grid"
          style={{ gridTemplateColumns: `240px repeat(${jobs.length}, minmax(250px, 1fr))` }}
        >
          <div className="compare-requirements pinned">
            <strong>Your requirements</strong>
            <button onClick={onEdit}>Edit requirements</button>
          </div>
          {jobs.map((j) => (
            <div className="compare-job-head" key={j.id}>
              <div className="company-logo">
                {j.company
                  .split(" ")
                  .map((w) => w[0])
                  .slice(0, 2)
                  .join("")}
              </div>
              <div>
                <strong>{j.title}</strong>
                <span>{j.company}</span>
              </div>
              <div className="compare-head-actions">
                <button onClick={() => onSave(j.id)}>
                  {history[j.id].saved ? "Saved" : "Save job"}
                </button>
                <button onClick={() => onRemove(j.id)}>Remove</button>
              </div>
            </div>
          ))}
          {reqKeys
            .filter((k) => requirements.enabled[k])
            .map((key) => (
              <div
                className="comparison-row"
                key={key}
                style={{ gridColumn: `1 / span ${jobs.length + 1}` }}
              >
                <div className="compare-req-cell pinned">
                  <strong>{reqNames[key]}</strong>
                  <span>{requirements.importance[key]}</span>
                </div>
                {jobs.map((j) => {
                  const a = assess(j, requirements, key);
                  return (
                    <div className="compare-value" key={j.id}>
                      <Badge status={a.status} />
                      <strong>{values[key](j)}</strong>
                      <p>{a.explanation}</p>
                    </div>
                  );
                })}
              </div>
            ))}
        </div>
      </div>
    </section>
  );
}

export default function App() {
  const [state, setState] = useState<AppState>(loadState);
  const [guideVisible, setGuideVisible] = useState(true);
  const [guideWidth, setGuideWidth] = useState(300);
  const [overlay, setOverlay] = useState(() => window.innerWidth < 1100);
  const [keywordInput, setKeywordInput] = useState("Software developer");
  const [locationInput, setLocationInput] = useState("Singapore");
  const [query, setQuery] = useState({ keyword: "Software developer", location: "Singapore" });
  const [filters, setFilters] = useState({
    experience: "",
    arrangement: "",
    technology: "",
    history: "",
  });
  const [requirementsOpen, setRequirementsOpen] = useState(false);
  const [comparisonOpen, setComparisonOpen] = useState(false);
  const [compareNotice, setCompareNotice] = useState(false);
  const [applyJob, setApplyJob] = useState<Job | null>(null);
  const [filterOpen, setFilterOpen] = useState<string | null>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);
  useEffect(() => {
    const resize = () => {
      const next = window.innerWidth < 1100;
      setOverlay(next);
      if (next) setGuideVisible(false);
    };
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, []);

  const jobs = useMemo(
    () =>
      JOBS.filter((j) => {
        const terms = query.keyword.toLowerCase().split(/\s+/).filter(Boolean);
        const searchable = [j.title, ...j.responsibilities, ...j.technologies]
          .join(" ")
          .toLowerCase();
        const broadSoftwareDeveloper = query.keyword.trim().toLowerCase() === "software developer";
        const keywordMatch =
          broadSoftwareDeveloper ||
          terms.length === 0 ||
          terms.every((t) => searchable.includes(t));
        const locationMatch =
          !query.location.trim() ||
          j.location.toLowerCase().includes(query.location.toLowerCase()) ||
          j.eligibility.toLowerCase().includes(query.location.toLowerCase());
        const expMatch =
          !filters.experience || `${j.experience[0]}–${j.experience[1]}` === filters.experience;
        const arrangementMatch = !filters.arrangement || j.arrangement === filters.arrangement;
        const techMatch = !filters.technology || j.technologies.includes(filters.technology);
        const h = state.history[j.id];
        const historyMatch =
          !filters.history || (filters.history === "Viewed" ? !!h.viewed : !!h.saved);
        return (
          keywordMatch && locationMatch && expMatch && arrangementMatch && techMatch && historyMatch
        );
      }),
    [query, filters, state.history],
  );

  const selected = JOBS.find((j) => j.id === state.selectedId) || jobs[0] || JOBS[0];
  const selectJob = (job: Job) =>
    setState((s) => ({
      ...s,
      selectedId: job.id,
      history: {
        ...s.history,
        [job.id]: { ...s.history[job.id], viewed: s.history[job.id]?.viewed || "19 Nov 2026" },
      },
    }));
  const toggleCompare = (id: string) => {
    if (!state.compared.includes(id) && state.compared.length >= 3) {
      setCompareNotice(true);
      window.setTimeout(() => setCompareNotice(false), 2600);
      return;
    }
    setState((s) => {
      const included = s.compared.includes(id);
      return {
        ...s,
        compared: included ? s.compared.filter((x) => x !== id) : [...s.compared, id],
      };
    });
  };
  const toggleSave = (id: string) =>
    setState((s) => ({
      ...s,
      history: {
        ...s.history,
        [id]: { ...s.history[id], saved: s.history[id].saved ? undefined : "19 Nov 2026" },
      },
    }));
  const search = (e: FormEvent) => {
    e.preventDefault();
    setQuery({ keyword: keywordInput, location: locationInput });
  };
  const clearFilters = () => {
    setFilters({ experience: "", arrangement: "", technology: "", history: "" });
    setKeywordInput("");
    setLocationInput("");
    setQuery({ keyword: "", location: "" });
  };
  const activeFilterCount = Object.values(filters).filter(Boolean).length;

  return (
    <div className="app-shell">
      <StudyGuide
        state={state}
        setState={setState}
        visible={guideVisible}
        setVisible={setGuideVisible}
        width={guideWidth}
        setWidth={setGuideWidth}
        overlay={overlay}
      />
      <main className="linkedin-app">
        <Header guideVisible={guideVisible} onShowGuide={() => setGuideVisible(true)} />
        <div className="search-band">
          <form className="search-form" onSubmit={search}>
            <label>
              <Icon name="search" size={18} />
              <span className="sr-only">Keywords</span>
              <input
                value={keywordInput}
                onChange={(e) => setKeywordInput(e.target.value)}
                placeholder="Search by title, skill, or company"
              />
            </label>
            <label>
              <span className="location-pin">⌖</span>
              <span className="sr-only">Location</span>
              <input
                value={locationInput}
                onChange={(e) => setLocationInput(e.target.value)}
                placeholder="City, state, or country"
              />
            </label>
            <button className="primary" type="submit">
              Search
            </button>
          </form>
          <div className="filter-bar">
            {[
              {
                key: "experience",
                label: filters.experience ? `${filters.experience} years` : "Experience",
                options: ["0–2", "1–3", "2–4"],
              },
              {
                key: "arrangement",
                label: filters.arrangement || "Work arrangement",
                options: ["Remote", "Hybrid", "On-site"],
              },
              {
                key: "technology",
                label: filters.technology || "Technology",
                options: ["React", "TypeScript", "Node.js", "Python", "Java", "Vue", "C#"],
              },
              {
                key: "history",
                label: filters.history || "History",
                options: ["Previously viewed", "Saved"],
              },
            ].map((f) => (
              <div className="filter-wrap" key={f.key}>
                <button
                  className={`filter-pill ${filters[f.key as keyof typeof filters] ? "active" : ""}`}
                  onClick={() => setFilterOpen(filterOpen === f.key ? null : f.key)}
                >
                  {f.label}
                  <Icon name="chevron" size={15} />
                </button>
                {filterOpen === f.key && (
                  <div className="filter-menu">
                    {filters[f.key as keyof typeof filters] && (
                      <button
                        onClick={() => {
                          setFilters((x) => ({ ...x, [f.key]: "" }));
                          setFilterOpen(null);
                        }}
                      >
                        Any
                      </button>
                    )}
                    {f.options.map((o) => (
                      <button
                        key={o}
                        onClick={() => {
                          setFilters((x) => ({
                            ...x,
                            [f.key]: o === "Previously viewed" ? "Viewed" : o,
                          }));
                          setFilterOpen(null);
                        }}
                      >
                        {o}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
            {activeFilterCount > 0 && (
              <button className="clear-button" onClick={clearFilters}>
                Clear filters
              </button>
            )}
          </div>
        </div>
        <div className="workspace" ref={searchRef}>
          <RequirementsSummary req={state.requirements} onEdit={() => setRequirementsOpen(true)} />
          <div className="results-heading">
            <div>
              <h2>
                {jobs.length} job{jobs.length === 1 ? "" : "s"} found
              </h2>
              <p>
                {query.keyword || "All jobs"} in {query.location || "all locations"}
              </p>
            </div>
            {state.compared.length > 0 && (
              <button
                className="compare-action"
                disabled={state.compared.length < 2}
                onClick={() => setComparisonOpen(true)}
              >
                <Icon name="compare" size={17} />
                Compare selected ({state.compared.length})
              </button>
            )}
          </div>
          {jobs.length ? (
            <div className="search-layout">
              <section className="results-list" aria-label="Job search results">
                {jobs.map((job) => (
                  <JobCard
                    key={job.id}
                    job={job}
                    history={state.history[job.id]}
                    selected={selected.id === job.id}
                    compared={state.compared.includes(job.id)}
                    onSelect={() => selectJob(job)}
                    onCompare={() => toggleCompare(job.id)}
                  />
                ))}
              </section>
              <JobDetails
                job={selected}
                history={state.history[selected.id]}
                requirements={state.requirements}
                onSave={() => toggleSave(selected.id)}
                onApply={() => setApplyJob(selected)}
              />
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-icon">
                <Icon name="search" size={30} />
              </div>
              <h2>No jobs match your search</h2>
              <p>Try different keywords or clear your filters to see all ten fictional roles.</p>
              <button className="primary" onClick={clearFilters}>
                Clear search and filters
              </button>
            </div>
          )}
        </div>
        {comparisonOpen && (
          <ComparisonDrawer
            ids={state.compared}
            requirements={state.requirements}
            history={state.history}
            leftOffset={guideVisible && !overlay ? guideWidth : 0}
            onClose={() => setComparisonOpen(false)}
            onRemove={(id) =>
              setState((s) => ({ ...s, compared: s.compared.filter((x) => x !== id) }))
            }
            onSave={toggleSave}
            onEdit={() => setRequirementsOpen(true)}
          />
        )}
      </main>
      {requirementsOpen && (
        <RequirementsEditor
          value={state.requirements}
          onClose={() => setRequirementsOpen(false)}
          onSave={(r) => {
            setState((s) => ({ ...s, requirements: r }));
            setRequirementsOpen(false);
          }}
        />
      )}
      {applyJob && (
        <div className="modal-backdrop">
          <div
            className="modal apply-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="apply-title"
          >
            <button
              className="icon-button modal-close"
              aria-label="Close"
              onClick={() => setApplyJob(null)}
            >
              <Icon name="close" />
            </button>
            <div className="apply-icon">
              <Icon name="briefcase" size={26} />
            </div>
            <h2 id="apply-title">Application begins here</h2>
            <p>
              You would now continue to the application process for{" "}
              <strong>{applyJob.title}</strong> at {applyJob.company}.
            </p>
            <p className="apply-note">
              This prototype will not submit an application or change the role’s application status.
            </p>
            <div className="modal-actions">
              <button className="primary" onClick={() => setApplyJob(null)}>
                Got it
              </button>
            </div>
          </div>
        </div>
      )}
      {compareNotice && (
        <div className="toast" role="status">
          You can compare up to 3 jobs.
        </div>
      )}
    </div>
  );
}
