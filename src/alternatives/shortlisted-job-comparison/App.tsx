import { ReactNode, useEffect, useMemo, useRef, useState } from "react";
import StudyGroupNotice from "../../StudyGroupNotice";
import { StudySequenceHandoff, useEvaluationTracking } from "../../evaluation-tracking";
import { CUSTOMER_SUPPORT_JOBS, EXTRA_SOFTWARE_JOBS, getStudyDomain } from "../../study-domains";

const DOMAIN = getStudyDomain();

type Importance = "Required" | "Preferred";
type CriterionKey = "keywords" | "pay" | "arrangement" | "experience" | "eligibility" | "hiring";
type Assessment = "Meets" | "Does not meet" | "Partially meets" | "Unknown";
type Decision = "Considering" | "Passed" | "Applied";

type Job = {
  id: string;
  company: string;
  title: string;
  exp: [number, number];
  technologies: string[];
  responsibilities: string[];
  pay: [number, number] | null;
  arrangement: "Remote" | "Hybrid" | "On-site";
  officeDays: number | null;
  location: string;
  eligibility: string;
  hiringDate: string | null;
  initialHistory: string;
};

type Requirements = {
  keywords: { enabled: boolean; importance: Importance; values: string[]; mode: "Any" | "All" };
  pay: {
    enabled: boolean;
    importance: Importance;
    minimum: number;
    currency: string;
    period: string;
  };
  arrangement: {
    enabled: boolean;
    importance: Importance;
    values: string[];
    maxOfficeDays: number;
  };
  experience: { enabled: boolean; importance: Importance; maximum: number };
  eligibility: { enabled: boolean; importance: Importance; value: string };
  hiring: { enabled: boolean; importance: Importance; freshness: number };
};

type AppState = {
  view: "compare" | "search";
  shortlist: string[];
  decisions: Record<string, Decision>;
  passReasons: Record<string, string>;
  viewed: string[];
  notes: Record<string, string>;
  requirements: Requirements;
  columnOrder: string[];
};

const studyContent = {
  eyebrow: "Interactive prototype.",
  projectName: "Prototype B — Multi-job comparison",
  fictionalNotice: "All job data in this prototype is fictional.",
  overview: {
    scenarioTitle: "Scenario and goal",
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
  submission:
    "Record at least one suitable role in PeerSurvey. The combined evaluation log is available after the third prototype.",
  tasks: [
    {
      title: "Identify a suitable role",
      description:
        "In the comparison table, use the requirement summary and Highlight differences to compare the shortlisted jobs. Open at least one cell to inspect its evidence panel, then mark at least one role Considering. Record the role and the evidence you inspected in PeerSurvey.",
    },
  ],
};

const softwareJobs: Job[] = [
  {
    id: "J01",
    company: "Northstar Health",
    title: "Junior Frontend Developer",
    exp: [0, 2],
    technologies: ["React", "TypeScript", "CSS"],
    responsibilities: ["Build patient-portal interfaces", "Implement accessible components"],
    pay: [4000, 5000],
    arrangement: "Hybrid",
    officeDays: 2,
    location: "Singapore",
    eligibility: "Singapore-based applicants",
    hiringDate: "2026-11-17",
    initialHistory: "Viewed 18 Nov 2026",
  },
  {
    id: "J02",
    company: "Harbor Digital",
    title: "Frontend Software Engineer",
    exp: [2, 4],
    technologies: ["React", "TypeScript", "testing"],
    responsibilities: ["Develop customer dashboards", "Improve frontend performance"],
    pay: [5500, 7000],
    arrangement: "Remote",
    officeDays: 0,
    location: "Remote",
    eligibility: "Must reside in Singapore",
    hiringDate: null,
    initialHistory: "Saved 18 Nov 2026",
  },
  {
    id: "J03",
    company: "Fieldwork Labs",
    title: "Junior Backend Developer",
    exp: [0, 2],
    technologies: ["Python", "Django", "PostgreSQL"],
    responsibilities: ["Build REST APIs", "Maintain data models"],
    pay: null,
    arrangement: "On-site",
    officeDays: 5,
    location: "Singapore",
    eligibility: "Singapore-based applicants",
    hiringDate: "2026-11-15",
    initialHistory: "Unseen",
  },
  {
    id: "J04",
    company: "Cedar Commerce",
    title: "Backend Software Engineer",
    exp: [2, 4],
    technologies: ["Java", "Spring Boot", "SQL"],
    responsibilities: ["Develop checkout services", "Improve service reliability"],
    pay: [5500, 7500],
    arrangement: "Hybrid",
    officeDays: 3,
    location: "Singapore",
    eligibility: "Singapore-based applicants",
    hiringDate: "2026-10-28",
    initialHistory: "Unseen",
  },
  {
    id: "J05",
    company: "Brightpath Learning",
    title: "Junior Full-Stack Developer",
    exp: [0, 2],
    technologies: ["React", "Node.js", "PostgreSQL"],
    responsibilities: ["Build learning-platform features", "Maintain frontend and API tests"],
    pay: [4500, 5500],
    arrangement: "Hybrid",
    officeDays: 1,
    location: "Singapore",
    eligibility: "Singapore-based applicants",
    hiringDate: "2026-11-18",
    initialHistory: "Unseen",
  },
  {
    id: "J06",
    company: "Meridian Systems",
    title: "Full-Stack Software Engineer",
    exp: [2, 4],
    technologies: ["TypeScript", "React", "Node.js"],
    responsibilities: ["Develop internal workflow tools", "Own features from interface to API"],
    pay: [6000, 8000],
    arrangement: "Remote",
    officeDays: 0,
    location: "Remote",
    eligibility: "Singapore or Malaysia residents",
    hiringDate: "2026-11-16",
    initialHistory: "Unseen",
  },
  {
    id: "J07",
    company: "PocketWorks",
    title: "Junior Mobile Developer",
    exp: [0, 2],
    technologies: ["Flutter", "Dart"],
    responsibilities: ["Build mobile application screens", "Integrate backend APIs"],
    pay: [4000, 5200],
    arrangement: "Hybrid",
    officeDays: 2,
    location: "Singapore",
    eligibility: "Singapore-based applicants",
    hiringDate: null,
    initialHistory: "Unseen",
  },
  {
    id: "J08",
    company: "Atlas Logistics",
    title: "Software Engineer, Integrations",
    exp: [2, 4],
    technologies: ["C#", ".NET", "SQL"],
    responsibilities: ["Build partner integrations", "Troubleshoot data exchange"],
    pay: [5200, 6800],
    arrangement: "On-site",
    officeDays: 5,
    location: "Singapore",
    eligibility: "Singapore-based applicants",
    hiringDate: "2026-11-14",
    initialHistory: "Applied 12 Nov 2026",
  },
  {
    id: "J09",
    company: "GreenGrid Energy",
    title: "Python Software Developer",
    exp: [1, 3],
    technologies: ["Python", "FastAPI", "PostgreSQL"],
    responsibilities: ["Develop energy-data services", "Maintain automated tests"],
    pay: [5000, 6500],
    arrangement: "Remote",
    officeDays: 0,
    location: "Remote",
    eligibility: "Must reside in Australia",
    hiringDate: "2026-11-18",
    initialHistory: "Unseen",
  },
  {
    id: "J10",
    company: "Studio Orbit",
    title: "Web Application Developer",
    exp: [1, 3],
    technologies: ["Vue", "TypeScript", "Node.js"],
    responsibilities: ["Build client web applications", "Collaborate on interface implementation"],
    pay: null,
    arrangement: "Hybrid",
    officeDays: null,
    location: "Singapore",
    eligibility: "Singapore-based applicants",
    hiringDate: "2026-11-05",
    initialHistory: "Viewed 17 Nov 2026",
  },
  ...EXTRA_SOFTWARE_JOBS.map((job) => ({
    id: job.id, company: job.company, title: job.title, exp: job.experience,
    technologies: job.technologies, responsibilities: job.responsibilities, pay: job.salary,
    arrangement: job.arrangement, officeDays: job.officeDays, location: job.location,
    eligibility: job.eligibility, hiringDate: job.hiringDate, initialHistory: "Unseen",
  })),
];

const supportJobs: Job[] = CUSTOMER_SUPPORT_JOBS.map((job) => ({
  id: job.id,
  company: job.company,
  title: job.title,
  exp: job.experience,
  technologies: job.technologies,
  responsibilities: job.responsibilities,
  pay: job.salary,
  arrangement: job.arrangement,
  officeDays: job.officeDays,
  location: job.location,
  eligibility: job.eligibility,
  hiringDate: job.hiringDate,
  initialHistory: job.history.applied
    ? `Applied ${job.history.applied}`
    : job.history.saved
      ? `Saved ${job.history.saved}`
      : job.history.viewed
        ? `Viewed ${job.history.viewed}`
        : "Unseen",
}));

const jobs = DOMAIN === "support" ? supportJobs : softwareJobs;

const initialRequirements: Requirements = {
  keywords: {
    enabled: true,
    importance: "Required",
    values: DOMAIN === "support" ? ["Email", "Live chat"] : ["React", "TypeScript", "Node.js"],
    mode: "Any",
  },
  pay: { enabled: true, importance: "Required", minimum: DOMAIN === "support" ? 4000 : 5000, currency: "SGD", period: "month" },
  arrangement: {
    enabled: true,
    importance: "Required",
    values: ["Remote", "Hybrid"],
    maxOfficeDays: 2,
  },
  experience: { enabled: true, importance: "Preferred", maximum: DOMAIN === "support" ? 2 : 3 },
  eligibility: { enabled: true, importance: "Required", value: "Singapore" },
  hiring: { enabled: true, importance: "Required", freshness: 14 },
};

const initialState: AppState = {
  view: "compare",
  shortlist: ["J01", "J02", "J03", "J04", "J05", "J06", "J07", "J08", "J09", "J10", "J11", "J12", "J13", "J14", "J15"],
  decisions: {
    J01: "Considering",
    J02: "Considering",
    J03: "Considering",
    J04: "Considering",
    J05: "Considering",
    J06: "Considering",
    J07: "Considering",
    J08: "Applied",
    J09: "Considering",
    J10: "Considering",
    J11: "Considering",
    J12: "Considering",
    J13: "Considering",
    J14: "Considering",
    J15: "Considering",
  },
  passReasons: {},
  viewed: ["J01", "J10"],
  notes: {},
  requirements: initialRequirements,
  columnOrder: ["identity", "skills", "experience", "pay", "arrangement", "hiring", "decision"],
};

const columnMeta: Record<string, { label: string; desired?: (r: Requirements) => string }> = {
  identity: { label: "Job title, company & previous activity" },
  skills: {
    label: "Responsibilities & technologies",
    desired: (r) => `${r.keywords.mode} of ${r.keywords.values.join(", ")}`,
  },
  experience: {
    label: "Experience",
    desired: (r) => `No higher than ${r.experience.maximum} years`,
  },
  pay: {
    label: "Pay",
    desired: (r) => `At least ${r.pay.currency} ${r.pay.minimum.toLocaleString()}/${r.pay.period}`,
  },
  arrangement: {
    label: "Work arrangement & eligibility",
    desired: (r) =>
      `${r.arrangement.values.join(" or ")}, ≤${r.arrangement.maxOfficeDays} office days; ${r.eligibility.value}`,
  },
  hiring: {
    label: "Hiring evidence",
    desired: (r) => `Confirmed within ${r.hiring.freshness} days`,
  },
  decision: { label: "Your decision" },
};

const STORAGE_KEY = `shortlisted-job-comparison-v5-${DOMAIN}`;
const fmtDate = (iso: string) =>
  new Date(`${iso}T12:00:00`).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
const daysOld = (iso: string) =>
  Math.round(
    (new Date("2026-11-19T12:00:00").getTime() - new Date(`${iso}T12:00:00`).getTime()) / 86400000,
  );
const formatPay = (job: Job) =>
  job.pay
    ? `SGD ${job.pay[0].toLocaleString()}–${job.pay[1].toLocaleString()} / month`
    : "Not provided";
const initials = (company: string) =>
  company
    .split(" ")
    .map((x) => x[0])
    .join("")
    .slice(0, 2);

function assess(
  job: Job,
  key: CriterionKey,
  r: Requirements,
): { status: Assessment; actual: string; explanation: string; excerpt: string } {
  if (key === "keywords") {
    const haystack = [...job.technologies, ...job.responsibilities].join(" ").toLowerCase();
    const matches = r.keywords.values.filter((x) => haystack.includes(x.toLowerCase()));
    const meets =
      r.keywords.mode === "Any" ? matches.length > 0 : matches.length === r.keywords.values.length;
    return {
      status: meets ? "Meets" : matches.length ? "Partially meets" : "Does not meet",
      actual: job.technologies.join(", "),
      explanation: `${matches.length ? `Matches ${matches.join(", ")}` : "No selected keywords found"} using “${r.keywords.mode.toLowerCase()}” matching.`,
      excerpt: `“You will ${job.responsibilities.join(" and ").toLowerCase()}, using ${job.technologies.join(", ")}.”`,
    };
  }
  if (key === "pay") {
    if (!job.pay)
      return {
        status: "Unknown",
        actual: "Salary not provided",
        explanation: "The employer did not provide a salary range.",
        excerpt: "“Compensation details are not included in this listing.”",
      };
    const status =
      job.pay[0] >= r.pay.minimum
        ? "Meets"
        : job.pay[1] >= r.pay.minimum
          ? "Partially meets"
          : "Does not meet";
    return {
      status,
      actual: formatPay(job),
      explanation:
        status === "Meets"
          ? "The entire range meets or exceeds your minimum."
          : status === "Partially meets"
            ? "The range overlaps your minimum."
            : "The entire range is below your minimum.",
      excerpt: `“The monthly salary range for this role is SGD ${job.pay[0].toLocaleString()}–${job.pay[1].toLocaleString()}.”`,
    };
  }
  if (key === "experience") {
    const status =
      job.exp[1] <= r.experience.maximum
        ? "Meets"
        : job.exp[0] <= r.experience.maximum
          ? "Partially meets"
          : "Does not meet";
    return {
      status,
      actual: `${job.exp[0]}–${job.exp[1]} years`,
      explanation:
        status === "Meets"
          ? "The full range is within your maximum."
          : status === "Partially meets"
            ? "The requested range overlaps your maximum."
            : "The minimum requested experience exceeds your maximum.",
      excerpt: `“Candidates should have ${job.exp[0]}–${job.exp[1]} years of relevant software development experience.”`,
    };
  }
  if (key === "arrangement") {
    const acceptable = r.arrangement.values.includes(job.arrangement);
    let status: Assessment = acceptable ? "Meets" : "Does not meet";
    let explanation = acceptable
      ? "The work arrangement is one you accept."
      : "The work arrangement is not one you selected.";
    if (job.arrangement === "Hybrid" && job.officeDays === null) {
      status = "Unknown";
      explanation = "Hybrid is acceptable, but weekly office frequency is not provided.";
    } else if (job.arrangement === "Hybrid" && job.officeDays! > r.arrangement.maxOfficeDays) {
      status = acceptable ? "Partially meets" : "Does not meet";
      explanation = `Hybrid is acceptable, but ${job.officeDays} office days exceeds your maximum.`;
    }
    return {
      status,
      actual: `${job.arrangement}${job.arrangement === "Hybrid" ? `, ${job.officeDays ?? "frequency not provided"}${job.officeDays ? " office days/week" : ""}` : ""}; ${job.location}`,
      explanation,
      excerpt: `“This is a ${job.arrangement.toLowerCase()} role${job.officeDays !== null && job.arrangement === "Hybrid" ? ` with ${job.officeDays} days each week in our Singapore office` : ""}.”`,
    };
  }
  if (key === "eligibility") {
    const meets = !job.eligibility.toLowerCase().includes("australia");
    return {
      status: meets ? "Meets" : "Does not meet",
      actual: job.eligibility,
      explanation: meets
        ? "The stated eligibility includes Singapore."
        : "The stated eligibility does not include Singapore.",
      excerpt: `“Applications are open to ${job.eligibility.toLowerCase()}.”`,
    };
  }
  if (!job.hiringDate)
    return {
      status: "Unknown",
      actual: "No dated employer confirmation",
      explanation: "No dated confirmation is available.",
      excerpt: "“No recent employer hiring confirmation is attached to this listing.”",
    };
  const age = daysOld(job.hiringDate);
  return {
    status: age <= r.hiring.freshness ? "Meets" : "Does not meet",
    actual: `Employer confirmed open ${fmtDate(job.hiringDate)}`,
    explanation: `The confirmation is ${age} days old; your threshold is ${r.hiring.freshness} days.`,
    excerpt: `“${job.company} confirmed this role is actively hiring on ${fmtDate(job.hiringDate)}.”`,
  };
}

function Icon({ name }: { name: string }) {
  const paths: Record<string, React.ReactNode> = {
    search: (
      <>
        <circle cx="11" cy="11" r="6" />
        <path d="m16 16 4 4" />
      </>
    ),
    home: (
      <>
        <path d="m3 11 9-8 9 8" />
        <path d="M5 10v10h14V10M9 20v-6h6v6" />
      </>
    ),
    people: (
      <>
        <circle cx="8" cy="8" r="4" />
        <circle cx="17" cy="9" r="3" />
        <path d="M2 20c0-4 2-7 6-7s6 3 6 7M14 14c4-1 7 2 7 6" />
      </>
    ),
    briefcase: (
      <>
        <rect x="3" y="7" width="18" height="13" rx="2" />
        <path d="M9 7V4h6v3M3 12h18M10 12v2h4v-2" />
      </>
    ),
    message: (
      <>
        <path d="M4 4h16v12H9l-5 4V4Z" />
        <path d="M8 9h8M8 12h5" />
      </>
    ),
    bell: (
      <>
        <path d="M6 9a6 6 0 0 1 12 0c0 7 3 7 3 7H3s3 0 3-7M10 20h4" />
      </>
    ),
    chevron: <path d="m8 10 4 4 4-4" />,
    arrow: (
      <>
        <path d="M5 12h14M13 6l6 6-6 6" />
      </>
    ),
    close: <path d="m6 6 12 12M18 6 6 18" />,
    tune: (
      <>
        <path d="M4 7h10M18 7h2M4 17h2M10 17h10" />
        <circle cx="16" cy="7" r="2" />
        <circle cx="8" cy="17" r="2" />
      </>
    ),
    note: (
      <>
        <path d="M5 3h14v18H5zM8 8h8M8 12h8M8 16h5" />
      </>
    ),
  };
  return (
    <svg className="icon" viewBox="0 0 24 24" aria-hidden="true">
      {paths[name]}
    </svg>
  );
}

function StatusBadge({ status }: { status: Assessment }) {
  return (
    <span className={`status status-${status.toLowerCase().replaceAll(" ", "-")}`}>
      <span className="status-dot" />
      {status}
    </span>
  );
}

function StudyGuide({
  width,
  setWidth,
  hidden,
  setHidden,
  mobile,
  onReset,
  evaluationLog,
}: {
  width: number;
  setWidth: (n: number) => void;
  hidden: boolean;
  setHidden: (v: boolean) => void;
  mobile: boolean;
  onReset: () => void;
  evaluationLog: ReactNode;
}) {
  const dragging = useRef(false);
  useEffect(() => {
    const move = (e: MouseEvent) => {
      if (dragging.current) setWidth(Math.max(260, Math.min(480, e.clientX)));
    };
    const up = () => {
      dragging.current = false;
    };
    window.addEventListener("mousemove", move);
    window.addEventListener("mouseup", up);
    return () => {
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mouseup", up);
    };
  }, [setWidth]);
  if (hidden)
    return (
      <button className="show-guide" onClick={() => setHidden(false)}>
        Show guide
      </button>
    );
  return (
    <aside
      className={`study-guide ${mobile ? "guide-overlay" : ""}`}
      style={{ width: mobile ? "min(360px, 90vw)" : width }}
    >
      <div className="guide-inner">
        <div className="guide-top">
          <span className="prototype-pill">{studyContent.eyebrow}</span>
          <button className="text-button" onClick={() => setHidden(true)}>
            Hide guide
          </button>
        </div>
        <h1>{studyContent.projectName}</h1>
        <StudyGroupNotice />
        <div className="guide-content">
          <section className="guide-section">
            <h2>{studyContent.overview.scenarioTitle}</h2>
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
            <span>{studyContent.fictionalNotice}</span>
          </div>
          {evaluationLog}
        </div>
      </div>
      {!mobile && (
        <div
          className="resize-handle"
          role="separator"
          aria-label="Resize study guide"
          aria-orientation="vertical"
          onMouseDown={() => {
            dragging.current = true;
          }}
        />
      )}
    </aside>
  );
}

function GlobalNav({ shortlistCount }: { shortlistCount: number }) {
  return (
    <header className="global-nav">
      <div className="nav-content">
        <div className="linkedin-logo" aria-label="LinkedIn">
          in
        </div>
        <label className="global-search">
          <Icon name="search" />
          <input aria-label="Search LinkedIn" placeholder="Search" />
        </label>
        <nav className="main-nav" aria-label="LinkedIn">
          {[
            ["home", "Home"],
            ["people", "My Network"],
            ["briefcase", "Jobs"],
            ["message", "Messaging"],
            ["bell", "Notifications"],
          ].map(([icon, label]) => (
            <button key={label} className={label === "Jobs" ? "active" : ""}>
              <Icon name={icon} />
              <span>{label}</span>
              {label === "Jobs" && shortlistCount > 0 && <b>{shortlistCount}</b>}
            </button>
          ))}
          <button>
            <span className="avatar">AM</span>
            <span>
              Me <Icon name="chevron" />
            </span>
          </button>
        </nav>
      </div>
    </header>
  );
}

function AppNav({
  state,
  setState,
}: {
  state: AppState;
  setState: React.Dispatch<React.SetStateAction<AppState>>;
}) {
  return (
    <nav className="jobs-nav" aria-label="Jobs sections">
      <div className="jobs-nav-inner">
        <button
          className={state.view === "search" ? "active" : ""}
          onClick={() => setState((s) => ({ ...s, view: "search" }))}
        >
          Search jobs
        </button>
        <button
          className={state.view === "compare" ? "active" : ""}
          onClick={() => setState((s) => ({ ...s, view: "compare" }))}
        >
          Compare shortlist <span>{state.shortlist.length}</span>
        </button>
      </div>
    </nav>
  );
}

function SearchView({
  state,
  setState,
  trackEvent,
}: {
  state: AppState;
  setState: React.Dispatch<React.SetStateAction<AppState>>;
  trackEvent: (type: string, details?: Record<string, string>) => void;
}) {
  const [selectedId, setSelectedId] = useState("J01");
  const [keyword, setKeyword] = useState(
    DOMAIN === "support" ? "Customer support" : "Software developer",
  );
  const [tech, setTech] = useState("All technologies");
  const [experience, setExperience] = useState("Any experience");
  const [arrangement, setArrangement] = useState("Any arrangement");
  const [applyOpen, setApplyOpen] = useState(false);
  const selected = jobs.find((j) => j.id === selectedId)!;
  const filtered = jobs.filter((j) => {
    const wordMatch =
      !keyword ||
      [j.title, j.company, ...j.technologies, ...j.responsibilities]
        .join(" ")
        .toLowerCase()
        .includes(keyword.toLowerCase()) ||
      keyword.toLowerCase() === "software developer";
    return (
      wordMatch &&
      (tech === "All technologies" || j.technologies.includes(tech)) &&
      (experience === "Any experience" ||
        (experience === "0–2 years" ? j.exp[0] <= 2 : j.exp[1] >= 3)) &&
      (arrangement === "Any arrangement" || j.arrangement === arrangement)
    );
  });
  const select = (id: string) => {
    trackEvent("job_opened", { jobId: id });
    setSelectedId(id);
    setState((s) => ({ ...s, viewed: [...new Set([...s.viewed, id])] }));
  };
  const toggleShortlist = () =>
    setState((s) => ({
      ...s,
      shortlist: s.shortlist.includes(selected.id)
        ? s.shortlist.filter((id) => id !== selected.id)
        : [...s.shortlist, selected.id],
      decisions: {
        ...s.decisions,
        [selected.id]:
          selected.id === "J08" ? "Applied" : s.decisions[selected.id] || "Considering",
      },
    }));
  return (
    <main className="search-page">
      <section className="search-controls" aria-label="Job search filters">
        <div className="search-inputs">
          <label>
            <span>Search by title, skill, or company</span>
            <div>
              <Icon name="search" />
              <input value={keyword} onChange={(e) => setKeyword(e.target.value)} />
            </div>
          </label>
          <label>
            <span>Location</span>
            <div>
              <span className="pin">⌖</span>
              <input value="Singapore" readOnly />
            </div>
          </label>
          <button className="primary search-action">Search</button>
        </div>
        <div className="filter-row">
          <FilterSelect
            label="Technology"
            value={tech}
            setValue={setTech}
            options={[
              "All technologies",
              "React",
              "TypeScript",
              "Node.js",
              "Python",
              "Java",
              "C#",
              "Vue",
              "Flutter",
            ]}
          />
          <FilterSelect
            label="Experience"
            value={experience}
            setValue={setExperience}
            options={["Any experience", "0–2 years", "3+ years"]}
          />
          <FilterSelect
            label="Work arrangement"
            value={arrangement}
            setValue={setArrangement}
            options={["Any arrangement", "Remote", "Hybrid", "On-site"]}
          />
        </div>
      </section>
      <div className="search-layout">
        <section className="results-panel">
          <div className="results-heading">
            <div>
              <h1>{DOMAIN === "support" ? "Customer support jobs" : "Software developer jobs"}</h1>
              <p>{filtered.length} results · Singapore</p>
            </div>
            <button aria-label="Set alert" className="toggle">
              <span />
            </button>
          </div>
          <div className="job-list">
            {filtered.map((job) => (
              <button
                key={job.id}
                className={`job-card ${selectedId === job.id ? "selected" : ""}`}
                onClick={() => select(job.id)}
              >
                <CompanyMark company={job.company} />
                <div>
                  <h2>{job.title}</h2>
                  <p className="company">{job.company}</p>
                  <p>
                    {job.location} · {job.arrangement}
                  </p>
                  <p className="salary">{formatPay(job)}</p>
                  <div className="marker-row">
                    {state.viewed.includes(job.id) && <span>Viewed</span>}
                    {job.initialHistory.startsWith("Saved") && <span>Saved</span>}
                    {job.initialHistory.startsWith("Applied") && <span>Applied</span>}
                    {state.shortlist.includes(job.id) && (
                      <span className="shortlisted">Shortlisted</span>
                    )}
                  </div>
                </div>
              </button>
            ))}
            {!filtered.length && <div className="empty-state">No jobs match these filters.</div>}
          </div>
        </section>
        <section className="detail-panel">
          <div className="detail-header">
            <div className="detail-title">
              <CompanyMark company={selected.company} />
              <div>
                <span className="job-id">{selected.id}</span>
                <h1>{selected.title}</h1>
                <p>
                  {selected.company} · {selected.location}
                </p>
              </div>
            </div>
            <div className="detail-actions">
              <button className="primary" onClick={() => setApplyOpen(true)}>
                Apply
              </button>
              <button className="secondary" onClick={toggleShortlist}>
                {state.shortlist.includes(selected.id)
                  ? "Remove from shortlist"
                  : "Add to shortlist"}
              </button>
            </div>
            <div className="detail-meta">
              {selected.exp[0]}–{selected.exp[1]} years · {selected.arrangement} ·{" "}
              {formatPay(selected)}
            </div>
          </div>
          <div className="detail-body">
            <h2>About the job</h2>
            <DetailGroup title="What you’ll do" lines={selected.responsibilities} />
            <DetailGroup title="Technologies" lines={[selected.technologies.join(" · ")]} />
            <DetailGroup
              title="Experience"
              lines={[`${selected.exp[0]}–${selected.exp[1]} years of relevant experience`]}
            />
            <DetailGroup title="Pay" lines={[formatPay(selected)]} />
            <DetailGroup
              title="Work arrangement and eligibility"
              lines={[
                `${selected.arrangement}${selected.arrangement === "Hybrid" ? ` · ${selected.officeDays ?? "Office frequency not provided"}${selected.officeDays ? " office days/week" : ""}` : ""}`,
                selected.eligibility,
              ]}
            />
            <DetailGroup
              title="Hiring information"
              lines={[
                selected.hiringDate
                  ? `Employer confirmed open ${fmtDate(selected.hiringDate)}`
                  : "No dated employer confirmation",
              ]}
            />
            <div className="fictional-product-note">
              Fictional listing for prototype use · Study date 19 November 2026
            </div>
          </div>
        </section>
      </div>
      {applyOpen && (
        <Modal title="Continue your application?" onClose={() => setApplyOpen(false)}>
          <p>
            This prototype ends before the external application begins. No application was submitted
            and your status was not changed.
          </p>
          <div className="modal-actions">
            <button className="secondary" onClick={() => setApplyOpen(false)}>
              Close
            </button>
          </div>
        </Modal>
      )}
    </main>
  );
}

function FilterSelect({
  label,
  value,
  setValue,
  options,
}: {
  label: string;
  value: string;
  setValue: (v: string) => void;
  options: string[];
}) {
  return (
    <label className="filter-select">
      <span className="sr-only">{label}</span>
      <select value={value} onChange={(e) => setValue(e.target.value)}>
        {options.map((x) => (
          <option key={x}>{x}</option>
        ))}
      </select>
      <Icon name="chevron" />
    </label>
  );
}

function CompanyMark({ company }: { company: string }) {
  const colors = ["#d8e8f5", "#e8dfcf", "#dce9de", "#e5dcf0", "#f1dfd8"];
  const color = colors[company.length % colors.length];
  return (
    <span className="company-mark" style={{ background: color }}>
      {initials(company)}
    </span>
  );
}

function DetailGroup({ title, lines }: { title: string; lines: string[] }) {
  return (
    <section className="detail-group">
      <h3>{title}</h3>
      <ul>
        {lines.map((line) => (
          <li key={line}>{line}</li>
        ))}
      </ul>
    </section>
  );
}

function CompareView({
  state,
  setState,
  trackEvent,
}: {
  state: AppState;
  setState: React.Dispatch<React.SetStateAction<AppState>>;
  trackEvent: (type: string, details?: Record<string, string>) => void;
}) {
  const [filter, setFilter] = useState<"All" | Decision>("All");
  const [highlight, setHighlight] = useState(true);
  const [editorOpen, setEditorOpen] = useState(false);
  const [evidence, setEvidence] = useState<{ job: Job; key: CriterionKey } | null>(null);
  const [passJob, setPassJob] = useState<Job | null>(null);
  const [undo, setUndo] = useState<{ message: string; action: () => void } | null>(null);
  const shortlistJobs = state.shortlist
    .map((id) => jobs.find((j) => j.id === id)!)
    .filter(Boolean)
    .filter((job) => filter === "All" || state.decisions[job.id] === filter);
  const enabledCount = Object.values(state.requirements).filter((x) => x.enabled).length;
  const moveColumn = (key: string, dir: number) =>
    setState((s) => {
      const order = [...s.columnOrder],
        index = order.indexOf(key),
        next = index + dir;
      if (key === "identity" || next <= 0 || next >= order.length) return s;
      [order[index], order[next]] = [order[next], order[index]];
      return { ...s, columnOrder: order };
    });
  const remove = (job: Job) => {
    setState((s) => ({ ...s, shortlist: s.shortlist.filter((id) => id !== job.id) }));
    setUndo({
      message: `${job.title} removed from shortlist.`,
      action: () => setState((s) => ({ ...s, shortlist: [...s.shortlist, job.id] })),
    });
  };
  const setDecision = (job: Job, decision: Decision, reason = "") => {
    const previous = state.decisions[job.id] || "Considering";
    trackEvent("decision_changed", { jobId: job.id, from: previous, to: decision });
    setState((s) => ({
      ...s,
      decisions: { ...s.decisions, [job.id]: decision },
      passReasons: { ...s.passReasons, [job.id]: reason },
    }));
    if (decision === "Passed")
      setUndo({
        message: `${job.title} marked as passed.`,
        action: () =>
          setState((s) => ({ ...s, decisions: { ...s.decisions, [job.id]: previous } })),
      });
  };
  return (
    <main className="compare-page">
      <div className="page-heading">
        <div>
          <button className="back-link" onClick={() => setState((s) => ({ ...s, view: "search" }))}>
            ← Return to search
          </button>
          <h1>Compare your shortlist</h1>
          <p>Review jobs side by side against what matters to you.</p>
        </div>
        <span className="study-date">Study date: 19 Nov 2026</span>
      </div>
      <section className="requirements-summary">
        <div className="requirement-icon">
          <Icon name="tune" />
        </div>
        <div>
          <div className="summary-title">
            <h2>My requirements</h2>
            <span>{enabledCount} active</span>
          </div>
          <p>{requirementsSummary(state.requirements)}</p>
        </div>
        <button className="secondary" onClick={() => setEditorOpen(true)}>
          Edit requirements
        </button>
      </section>
      <div className="comparison-toolbar">
        <div className="decision-filters" role="group" aria-label="Filter by decision">
          {(["All", "Considering", "Passed", "Applied"] as const).map((x) => (
            <button key={x} className={filter === x ? "active" : ""} onClick={() => setFilter(x)}>
              {x}{" "}
              <span>
                {x === "All"
                  ? state.shortlist.length
                  : state.shortlist.filter((id) => state.decisions[id] === x).length}
              </span>
            </button>
          ))}
        </div>
        <label className="switch-control">
          <input
            type="checkbox"
            checked={highlight}
            onChange={(e) => setHighlight(e.target.checked)}
          />
          <span className="switch" />
          Highlight differences
        </label>
      </div>
      <div className={`table-wrap ${highlight ? "highlight" : ""}`}>
        <table className="comparison-table">
          <thead>
            <tr>
              {state.columnOrder.map((key, index) => (
                <th key={key} className={key === "identity" ? "sticky-col" : ""}>
                  <div className="column-heading">
                    <span>{columnMeta[key].label}</span>
                    {key !== "identity" && (
                      <div className="reorder-controls">
                        <button
                          aria-label={`Move ${columnMeta[key].label} left`}
                          disabled={index <= 1}
                          onClick={() => moveColumn(key, -1)}
                        >
                          ←
                        </button>
                        <button
                          aria-label={`Move ${columnMeta[key].label} right`}
                          disabled={index === state.columnOrder.length - 1}
                          onClick={() => moveColumn(key, 1)}
                        >
                          →
                        </button>
                      </div>
                    )}
                  </div>
                  {columnMeta[key].desired && (
                    <small>Your requirement: {columnMeta[key].desired!(state.requirements)}</small>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {shortlistJobs.map((job) => (
              <tr key={job.id} className={state.decisions[job.id] === "Passed" ? "passed-row" : ""}>
                {state.columnOrder.map((key) => (
                  <ComparisonCell
                    key={key}
                    column={key}
                    job={job}
                    state={state}
                    setEvidence={(value) => {
                      trackEvent("evidence_opened", { jobId: value.job.id, criterion: value.key });
                      setEvidence(value);
                    }}
                    setDecision={(decision) =>
                      decision === "Passed" ? setPassJob(job) : setDecision(job, decision)
                    }
                    remove={() => remove(job)}
                  />
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        {!shortlistJobs.length && (
          <div className="empty-comparison">
            <h2>No jobs in this view</h2>
            <p>Try another decision filter or return to search to add a job.</p>
          </div>
        )}
      </div>
      <p className="table-help">
        Select an assessment cell to review its evidence and add a private note. Use the arrow
        controls in column headings to reorder the table.
      </p>
      {editorOpen && (
        <RequirementsEditor
          requirements={state.requirements}
          onClose={() => setEditorOpen(false)}
          onSave={(requirements) => {
            setState((s) => ({ ...s, requirements }));
            setEditorOpen(false);
          }}
        />
      )}
      {evidence && (
        <EvidencePanel
          job={evidence.job}
          criterion={evidence.key}
          requirements={state.requirements}
          note={state.notes[`${evidence.job.id}-${evidence.key}`] || ""}
          onNote={(note) =>
            setState((s) => ({
              ...s,
              notes: { ...s.notes, [`${evidence.job.id}-${evidence.key}`]: note },
            }))
          }
          onClose={() => setEvidence(null)}
        />
      )}
      {passJob && (
        <PassModal
          job={passJob}
          onClose={() => setPassJob(null)}
          onPass={(reason) => {
            setDecision(passJob, "Passed", reason);
            setPassJob(null);
          }}
        />
      )}
      {undo && (
        <div className="undo-toast" role="status">
          <span>{undo.message}</span>
          <button
            onClick={() => {
              undo.action();
              setUndo(null);
            }}
          >
            Undo
          </button>
          <button aria-label="Dismiss" onClick={() => setUndo(null)}>
            <Icon name="close" />
          </button>
        </div>
      )}
    </main>
  );
}

function requirementsSummary(r: Requirements) {
  const parts: string[] = [];
  if (r.keywords.enabled) parts.push(`${r.keywords.mode} of ${r.keywords.values.join(", ")}`);
  if (r.pay.enabled)
    parts.push(`≥ ${r.pay.currency} ${r.pay.minimum.toLocaleString()}/${r.pay.period}`);
  if (r.arrangement.enabled)
    parts.push(
      `${r.arrangement.values.join(" or ")}, max ${r.arrangement.maxOfficeDays} office days`,
    );
  if (r.experience.enabled) parts.push(`≤ ${r.experience.maximum} years’ experience`);
  if (r.eligibility.enabled) parts.push(`${r.eligibility.value} eligible`);
  if (r.hiring.enabled) parts.push(`hiring confirmed within ${r.hiring.freshness} days`);
  return parts.join(" · ") || "No active requirements";
}

function ComparisonCell({
  column,
  job,
  state,
  setEvidence,
  setDecision,
  remove,
}: {
  column: string;
  job: Job;
  state: AppState;
  setEvidence: (v: { job: Job; key: CriterionKey }) => void;
  setDecision: (v: Decision) => void;
  remove: () => void;
}) {
  const r = state.requirements;
  const criterionButton = (key: CriterionKey, actual?: string) => {
    if (!r[key].enabled) return <span className="disabled-criterion">Criterion disabled</span>;
    const result = assess(job, key, r);
    return (
      <button className="assessment-cell" onClick={() => setEvidence({ job, key })}>
        <span className="actual">{actual || result.actual}</span>
        <StatusBadge status={result.status} />
        <span className="evidence-link">View evidence</span>
      </button>
    );
  };
  if (column === "identity")
    return (
      <td className="sticky-col identity-cell">
        <div className="identity-top">
          <CompanyMark company={job.company} />
          <span className="job-id">{job.id}</span>
        </div>
        <h2>{job.title}</h2>
        <p>{job.company}</p>
        <span className="history">{job.initialHistory}</span>
      </td>
    );
  if (column === "skills")
    return (
      <td>
        <div className="responsibilities">
          {job.responsibilities.map((x) => (
            <span key={x}>{x}</span>
          ))}
        </div>
        {criterionButton("keywords", job.technologies.join(", "))}
      </td>
    );
  if (column === "experience") return <td>{criterionButton("experience")}</td>;
  if (column === "pay") return <td>{criterionButton("pay")}</td>;
  if (column === "arrangement")
    return (
      <td>
        <div className="stacked-assessments">
          {criterionButton("arrangement")}
          {criterionButton("eligibility")}
        </div>
      </td>
    );
  if (column === "hiring") return <td>{criterionButton("hiring")}</td>;
  const decision = state.decisions[job.id] || "Considering";
  return (
    <td className="decision-cell">
      <label>
        <span className="sr-only">Decision for {job.title}</span>
        <select
          value={decision}
          disabled={decision === "Applied"}
          onChange={(e) => setDecision(e.target.value as Decision)}
        >
          <option>Considering</option>
          <option>Passed</option>
          {decision === "Applied" && <option>Applied</option>}
        </select>
      </label>
      {state.passReasons[job.id] && (
        <p className="pass-reason">Reason: {state.passReasons[job.id]}</p>
      )}
      <button className="remove-link" onClick={remove}>
        Remove from shortlist
      </button>
    </td>
  );
}

function RequirementsEditor({
  requirements,
  onSave,
  onClose,
}: {
  requirements: Requirements;
  onSave: (r: Requirements) => void;
  onClose: () => void;
}) {
  const [draft, setDraft] = useState<Requirements>(() => structuredClone(requirements));
  const setCriterion = <K extends CriterionKey>(key: K, patch: Partial<Requirements[K]>) =>
    setDraft((r) => ({ ...r, [key]: { ...r[key], ...patch } }));
  const rows: { key: CriterionKey; title: string; description: string }[] = [
    {
      key: "keywords",
      title: "Responsibility or technology keywords",
      description: "Match against responsibilities and technologies.",
    },
    { key: "pay", title: "Minimum pay", description: "Compare the full advertised salary range." },
    {
      key: "arrangement",
      title: "Work arrangement",
      description: "Choose acceptable arrangements and office frequency.",
    },
    {
      key: "experience",
      title: "Required experience",
      description: "Set the highest acceptable requirement.",
    },
    {
      key: "eligibility",
      title: "Geographic eligibility",
      description: "Choose where you are eligible to work.",
    },
    {
      key: "hiring",
      title: "Hiring confirmation",
      description: "Set how recent employer confirmation should be.",
    },
  ];
  return (
    <div className="scrim">
      <aside
        className="side-panel requirements-panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="requirements-title"
      >
        <div className="panel-header">
          <div>
            <span className="panel-eyebrow">PERSONAL PREFERENCES</span>
            <h2 id="requirements-title">Edit requirements</h2>
            <p>Changes update every shortlisted job assessment.</p>
          </div>
          <button className="icon-button" onClick={onClose} aria-label="Close">
            <Icon name="close" />
          </button>
        </div>
        <div className="panel-content">
          {rows.map(({ key, title, description }) => (
            <section
              className={`criterion-editor ${!draft[key].enabled ? "disabled" : ""}`}
              key={key}
            >
              <div className="criterion-head">
                <label className="enable-control">
                  <input
                    type="checkbox"
                    checked={draft[key].enabled}
                    onChange={(e) =>
                      setCriterion(key, { enabled: e.target.checked } as Partial<
                        Requirements[typeof key]
                      >)
                    }
                  />
                  <span className="switch" />
                  <span>
                    <strong>{title}</strong>
                    <small>{description}</small>
                  </span>
                </label>
                <select
                  aria-label={`${title} importance`}
                  value={draft[key].importance}
                  onChange={(e) =>
                    setCriterion(key, { importance: e.target.value as Importance } as Partial<
                      Requirements[typeof key]
                    >)
                  }
                >
                  <option>Required</option>
                  <option>Preferred</option>
                </select>
              </div>
              {key === "keywords" && (
                <div className="editor-fields">
                  <label>
                    Keywords
                    <input
                      value={draft.keywords.values.join(", ")}
                      onChange={(e) =>
                        setCriterion("keywords", {
                          values: e.target.value
                            .split(",")
                            .map((x) => x.trim())
                            .filter(Boolean),
                        })
                      }
                    />
                  </label>
                  <label>
                    Matching
                    <select
                      value={draft.keywords.mode}
                      onChange={(e) =>
                        setCriterion("keywords", { mode: e.target.value as "Any" | "All" })
                      }
                    >
                      <option>Any</option>
                      <option>All</option>
                    </select>
                  </label>
                </div>
              )}
              {key === "pay" && (
                <div className="editor-fields three">
                  <label>
                    Currency
                    <select
                      value={draft.pay.currency}
                      onChange={(e) => setCriterion("pay", { currency: e.target.value })}
                    >
                      <option>SGD</option>
                    </select>
                  </label>
                  <label>
                    Minimum
                    <input
                      type="number"
                      min="0"
                      value={draft.pay.minimum}
                      onChange={(e) => setCriterion("pay", { minimum: Number(e.target.value) })}
                    />
                  </label>
                  <label>
                    Period
                    <select
                      value={draft.pay.period}
                      onChange={(e) => setCriterion("pay", { period: e.target.value })}
                    >
                      <option>month</option>
                    </select>
                  </label>
                </div>
              )}
              {key === "arrangement" && (
                <>
                  <div className="check-row">
                    {["Remote", "Hybrid", "On-site"].map((v) => (
                      <label key={v}>
                        <input
                          type="checkbox"
                          checked={draft.arrangement.values.includes(v)}
                          onChange={(e) =>
                            setCriterion("arrangement", {
                              values: e.target.checked
                                ? [...draft.arrangement.values, v]
                                : draft.arrangement.values.filter((x) => x !== v),
                            })
                          }
                        />
                        {v}
                      </label>
                    ))}
                  </div>
                  <label className="single-field">
                    Maximum hybrid office days/week
                    <input
                      type="number"
                      min="0"
                      max="7"
                      value={draft.arrangement.maxOfficeDays}
                      onChange={(e) =>
                        setCriterion("arrangement", { maxOfficeDays: Number(e.target.value) })
                      }
                    />
                  </label>
                </>
              )}
              {key === "experience" && (
                <label className="single-field">
                  Maximum required years
                  <input
                    type="number"
                    min="0"
                    value={draft.experience.maximum}
                    onChange={(e) =>
                      setCriterion("experience", { maximum: Number(e.target.value) })
                    }
                  />
                </label>
              )}
              {key === "eligibility" && (
                <label className="single-field">
                  Eligible to work from
                  <input
                    value={draft.eligibility.value}
                    onChange={(e) => setCriterion("eligibility", { value: e.target.value })}
                  />
                </label>
              )}
              {key === "hiring" && (
                <label className="single-field">
                  Confirmation freshness in days
                  <input
                    type="number"
                    min="1"
                    value={draft.hiring.freshness}
                    onChange={(e) => setCriterion("hiring", { freshness: Number(e.target.value) })}
                  />
                </label>
              )}
              <button
                className="remove-criterion"
                onClick={() =>
                  setCriterion(key, { enabled: false } as Partial<Requirements[typeof key]>)
                }
              >
                Remove criterion
              </button>
            </section>
          ))}
        </div>
        <div className="panel-footer">
          <button className="secondary" onClick={onClose}>
            Cancel
          </button>
          <button className="primary" onClick={() => onSave(draft)}>
            Save requirements
          </button>
        </div>
      </aside>
    </div>
  );
}

function EvidencePanel({
  job,
  criterion,
  requirements,
  note,
  onNote,
  onClose,
}: {
  job: Job;
  criterion: CriterionKey;
  requirements: Requirements;
  note: string;
  onNote: (v: string) => void;
  onClose: () => void;
}) {
  const result = assess(job, criterion, requirements);
  const names: Record<CriterionKey, string> = {
    keywords: "Responsibility or technology keywords",
    pay: "Minimum pay",
    arrangement: "Work arrangement",
    experience: "Required experience",
    eligibility: "Geographic eligibility",
    hiring: "Hiring confirmation freshness",
  };
  const desired =
    criterion === "keywords"
      ? columnMeta.skills.desired!(requirements)
      : criterion === "pay"
        ? columnMeta.pay.desired!(requirements)
        : criterion === "experience"
          ? columnMeta.experience.desired!(requirements)
          : criterion === "arrangement" || criterion === "eligibility"
            ? columnMeta.arrangement.desired!(requirements)
            : columnMeta.hiring.desired!(requirements);
  return (
    <div className="scrim">
      <aside
        className="side-panel evidence-panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="evidence-title"
      >
        <div className="panel-header">
          <div>
            <span className="panel-eyebrow">ASSESSMENT EVIDENCE</span>
            <h2 id="evidence-title">{job.title}</h2>
            <p>
              {job.company} · {job.id}
            </p>
          </div>
          <button className="icon-button" onClick={onClose} aria-label="Close">
            <Icon name="close" />
          </button>
        </div>
        <div className="panel-content evidence-content">
          <StatusBadge status={result.status} />
          <EvidenceBlock label="Your requirement" value={`${names[criterion]}: ${desired}`} />
          <EvidenceBlock label="Job’s actual value" value={result.actual} />
          <EvidenceBlock label="Why this assessment?" value={result.explanation} />
          <div className="excerpt">
            <span>Supporting employer-description excerpt</span>
            <blockquote>{result.excerpt}</blockquote>
          </div>
          {criterion === "hiring" && (
            <EvidenceBlock
              label="Hiring source and date"
              value={
                job.hiringDate
                  ? `Employer confirmation · ${fmtDate(job.hiringDate)}`
                  : "No source or date available"
              }
            />
          )}
          <label className="note-field">
            <span>Private note</span>
            <small>Only visible to you in this prototype.</small>
            <textarea
              value={note}
              onChange={(e) => onNote(e.target.value)}
              placeholder="Add a note about this evidence…"
            />
          </label>
        </div>
        <div className="panel-footer">
          <span className="saved-label">Notes save automatically</span>
          <button className="primary" onClick={onClose}>
            Done
          </button>
        </div>
      </aside>
    </div>
  );
}

function EvidenceBlock({ label, value }: { label: string; value: string }) {
  return (
    <div className="evidence-block">
      <span>{label}</span>
      <p>{value}</p>
    </div>
  );
}

function PassModal({
  job,
  onClose,
  onPass,
}: {
  job: Job;
  onClose: () => void;
  onPass: (v: string) => void;
}) {
  const [reason, setReason] = useState("");
  return (
    <Modal title={`Pass on ${job.title}?`} onClose={onClose}>
      <p>The job will stay in your shortlist and can be recovered at any time.</p>
      <label className="modal-label">
        Reason (optional)
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Why are you passing on this role?"
        />
      </label>
      <div className="modal-actions">
        <button className="secondary" onClick={onClose}>
          Cancel
        </button>
        <button className="danger" onClick={() => onPass(reason)}>
          Pass on job
        </button>
      </div>
    </Modal>
  );
}

function Modal({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="modal-scrim">
      <div className="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title">
        <div className="modal-heading">
          <h2 id="modal-title">{title}</h2>
          <button className="icon-button" aria-label="Close" onClick={onClose}>
            <Icon name="close" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

function App() {
  const { trackEvent, resetSession } = useEvaluationTracking("comparison-table");
  const [state, setState] = useState<AppState>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? { ...initialState, ...JSON.parse(saved) } : structuredClone(initialState);
    } catch {
      return structuredClone(initialState);
    }
  });
  const [guideWidth, setGuideWidth] = useState(300);
  const [guideHidden, setGuideHidden] = useState(false);
  const [mobile, setMobile] = useState(() => window.innerWidth < 1100);
  const [resetOpen, setResetOpen] = useState(false);
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);
  useEffect(() => {
    const resize = () => setMobile(window.innerWidth < 1100);
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, []);
  const reset = () => {
    resetSession();
    localStorage.removeItem(STORAGE_KEY);
    setState(structuredClone(initialState));
    setGuideWidth(300);
    setGuideHidden(false);
    setResetOpen(false);
  };
  return (
    <div className="prototype-shell">
      <StudyGuide
        width={guideWidth}
        setWidth={setGuideWidth}
        hidden={guideHidden}
        setHidden={setGuideHidden}
        mobile={mobile}
        onReset={() => setResetOpen(true)}
        evaluationLog={<StudySequenceHandoff prototype="comparison-table" onTaskComplete={() => trackEvent("task_completed")} onFinished={() => trackEvent("task_finished")} />}
      />
      <div className="application-shell">
        <GlobalNav shortlistCount={state.shortlist.length} />
        <AppNav state={state} setState={setState} />
        {state.view === "search" ? (
          <SearchView state={state} setState={setState} trackEvent={trackEvent} />
        ) : (
          <CompareView state={state} setState={setState} trackEvent={trackEvent} />
        )}
      </div>
      {resetOpen && (
        <Modal title="Reset this prototype?" onClose={() => setResetOpen(false)}>
          <p>
            This will restore the original shortlist, requirements, notes, and decisions. This action
            cannot be undone.
          </p>
          <div className="modal-actions">
            <button className="secondary" onClick={() => setResetOpen(false)}>
              Cancel
            </button>
            <button className="danger" onClick={reset}>
              Reset everything
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}

export default App;
