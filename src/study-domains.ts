export type StudyDomain = "developer" | "support";

export type SharedJob = {
  id: string;
  company: string;
  title: string;
  experience: [number, number];
  technologies: string[];
  responsibilities: string[];
  salary: [number, number] | null;
  arrangement: "Remote" | "Hybrid" | "On-site";
  officeDays: number | null;
  location: string;
  eligibility: string;
  hiringDate: string | null;
  history: { viewed?: string; saved?: string; applied?: string };
};

export const getStudyDomain = (): StudyDomain =>
  new URLSearchParams(window.location.search).get("domain") === "support"
    ? "support"
    : "developer";

export const SUPPORT_SCENARIO =
  "You are seeking a Singapore customer-support role. Required: email or live-chat support; at least SGD 4,000 per month; remote or hybrid with no more than two office days; Singapore eligibility; and hiring confirmed within 14 days. Preferred: no more than two years of experience.";

export const CUSTOMER_SUPPORT_JOBS: SharedJob[] = [
  { id: "J01", company: "Northstar Travel", title: "Customer Care Associate", experience: [0, 2], technologies: ["Phone", "Email"], responsibilities: ["Answer booking questions", "Resolve customer complaints"], salary: [3200, 4000], arrangement: "Hybrid", officeDays: 2, location: "Singapore", eligibility: "Singapore-based applicants", hiringDate: "2026-11-17", history: { viewed: "18 Nov 2026" } },
  { id: "J02", company: "Harbor Market", title: "Customer Support Specialist", experience: [1, 3], technologies: ["Email", "Live chat", "Zendesk"], responsibilities: ["Resolve account enquiries", "Document recurring issues"], salary: [4200, 5200], arrangement: "Remote", officeDays: null, location: "Singapore", eligibility: "Must reside in Singapore", hiringDate: null, history: { saved: "18 Nov 2026" } },
  { id: "J03", company: "Fieldwork Services", title: "Service Desk Associate", experience: [0, 2], technologies: ["Phone", "Ticketing"], responsibilities: ["Triage service requests", "Escalate technical incidents"], salary: null, arrangement: "On-site", officeDays: 5, location: "Singapore", eligibility: "Singapore-based applicants", hiringDate: "2026-11-15", history: {} },
  { id: "J04", company: "ClearDesk", title: "Digital Customer Support Specialist", experience: [1, 3], technologies: ["Email", "Live chat", "Zendesk"], responsibilities: ["Support customers through chat and email", "Maintain help-centre articles"], salary: [4500, 5600], arrangement: "Hybrid", officeDays: 1, location: "Singapore", eligibility: "Singapore-based applicants", hiringDate: "2026-11-18", history: {} },
  { id: "J05", company: "Brightpath Learning", title: "Learner Support Coordinator", experience: [0, 2], technologies: ["Email", "Live chat"], responsibilities: ["Answer learner questions", "Coordinate enrolment support"], salary: [3500, 4300], arrangement: "Hybrid", officeDays: 1, location: "Singapore", eligibility: "Singapore-based applicants", hiringDate: "2026-11-18", history: {} },
  { id: "J06", company: "Meridian Cloud", title: "Technical Support Specialist", experience: [2, 4], technologies: ["Email", "Live chat", "SQL"], responsibilities: ["Troubleshoot customer integrations", "Escalate product defects"], salary: [5000, 6500], arrangement: "Hybrid", officeDays: 3, location: "Singapore", eligibility: "Singapore or Malaysia residents", hiringDate: "2026-11-16", history: {} },
  { id: "J07", company: "PocketWorks", title: "Customer Service Representative", experience: [0, 2], technologies: ["Phone", "Live chat"], responsibilities: ["Handle delivery enquiries", "Process service recovery"], salary: [3600, 4200], arrangement: "Hybrid", officeDays: 2, location: "Singapore", eligibility: "Singapore-based applicants", hiringDate: null, history: {} },
  { id: "J08", company: "Atlas Logistics", title: "Client Support Executive", experience: [2, 4], technologies: ["Email", "Phone"], responsibilities: ["Support business clients", "Coordinate shipment issues"], salary: [4400, 5600], arrangement: "On-site", officeDays: 5, location: "Singapore", eligibility: "Singapore-based applicants", hiringDate: "2026-11-14", history: { applied: "12 Nov 2026" } },
  { id: "J09", company: "GreenGrid Energy", title: "Customer Operations Associate", experience: [1, 2], technologies: ["Email", "Live chat"], responsibilities: ["Answer billing enquiries", "Maintain customer records"], salary: [4200, 5000], arrangement: "Remote", officeDays: null, location: "Australia", eligibility: "Must reside in Australia", hiringDate: "2026-11-18", history: {} },
  { id: "J10", company: "Studio Orbit", title: "Community Support Specialist", experience: [1, 2], technologies: ["Email", "Community forum"], responsibilities: ["Moderate customer discussions", "Respond to support requests"], salary: null, arrangement: "Hybrid", officeDays: null, location: "Singapore", eligibility: "Singapore-based applicants", hiringDate: "2026-11-05", history: { viewed: "17 Nov 2026" } },
];

export const domainLabel = (domain: StudyDomain) =>
  domain === "support" ? "Customer support" : "Software development";
