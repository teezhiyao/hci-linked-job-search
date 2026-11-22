# Prototype Review: Find, Compare, and Narrow

## Evaluation model

The three prototypes use the same LinkedIn-style shell, job information, and decision criteria. Their primary interaction should remain distinct:

| Alternative | Primary purpose | Decision model | Final action |
|---|---|---|---|
| Prototype A: Integrated search and compare | Find a suitable opportunity during discovery | Configure requirements and inspect jobs individually in search | Save one job |
| Prototype B: Shortlist narrowing | Review a large saved collection | Decide between two jobs at a time | Keep at least one suitable job |
| Prototype C: Shortlisted job comparison | Evaluate an existing shortlist systematically | Compare all shortlisted jobs simultaneously | Leave one job as Considering |

## Prototype A: Integrated search and compare

### Distinct features

- Search and filters are the primary workspace.
- Result cards present standardized responsibilities, pay, work arrangement, and history.
- Job details assess each required or preferred criterion independently.
- Missing information and dated hiring evidence remain visible.
- Viewed, Saved, and Applied states help users avoid repeated work.

### Boundary

This alternative should not provide dedicated simultaneous or pairwise job comparison. Users inspect listings individually and save the matching job. This isolates whether enriched search information is sufficient for a decision.

### Implemented update

The comparison checkboxes, Compare selected action, comparison drawer, comparison state, and comparison-directed task language have been removed. The guide now presents one task and directs the final response to PeerSurvey.

## Prototype B: Shortlist narrowing

### Distinct features

- An existing shortlist is displayed in one persistent table.
- Corresponding criteria are aligned across jobs.
- Users can highlight differences and reorder columns.
- Evidence panels explain assessments.
- Notes and Considering or Passed states preserve decisions.

### Boundary

Search remains secondary. The primary activity is simultaneous comparison of the whole shortlist, rather than individual discovery or repeated two-job decisions.

### Implemented update

The study guide now combines scenario, goal, and one task in a single panel. Task progress, completion controls, and Overview or Tasks tabs have been removed. The participant leaves only the matching job as Considering and submits the answer in PeerSurvey.

## Prototype C: Shortlisted job comparison

### Distinct features

- Jobs are reviewed two at a time.
- Users can keep, set aside, or postpone jobs.
- Decisions can include reasons and private notes.
- Undo and review history support recovery.
- Further rounds reduce the retained collection.

### Boundary

This alternative does not use a configurable requirements table or overall match score. Its contribution is reducing simultaneous information load through sequential, recoverable decisions.

### Implemented update

The guide now combines scenario, goal, and one task in a single panel. The task asks participants to start a two-job comparison, inspect at least one hiring-evidence source, confirm at least one decision, and identify a suitable role. These checkpoints are captured in the evaluation log, while participants submit the role and observed evidence in PeerSurvey.

## Shared evaluation structure

Each alternative now targets one observable result:

1. Find the job that meets every required criterion.
2. Complete the alternative-specific final action: Saved, Considering, or Kept.
3. Record the selected job, ease rating, and confidence rating in PeerSurvey.

Shared features such as fictional job data, standardized categories, hiring evidence, and the LinkedIn visual shell are controlled constants. The decision mechanism is the independent design difference.

## Current study implementation

- The current study is fixed to the software-development dataset.
- Each prototype keeps its own local state, so completing one task does not affect another prototype.
- Three groups rotate the starting prototype: A--B--C, B--C--A, or C--A--B.
- The landing page converts the persistent group assignment into three ordered prototype links.
- Every link includes the group and step number.
- J11 and J06 meet all required conditions; J11 also fully meets the experience preference.
- The customer-support dataset remains in the code for a possible later two-domain study, but it is not currently selectable.

Before launching the study, test every group sequence in a clean browser session and verify the corresponding PeerSurvey branching and answer keys.

## Identification task and evaluation plan

All prototypes begin with the same 15-job evaluation pool and use the same decision rule: required conditions take priority, followed by the preferred experience range. Existing history such as Viewed, Saved, or Applied remains visible but does not remove a listing from the pool. Participants only need to identify at least one suitable role.

- **J11, Riverbank Technology:** meets every required condition and the preferred experience range.
- **J06, Meridian Systems:** meets every required condition, but its 2--4 year range only partially meets the preference for no more than three years.
- **J05, Brightpath Learning:** is a plausible near-match, but its SGD 4,500--5,500 range does not guarantee the required SGD 5,000 minimum.

The remaining listings each have at least one required-condition gap, such as insufficient guaranteed salary, stale or missing hiring confirmation, too many office days, ineligible geography, missing salary, or irrelevant technologies.

PeerSurvey should ask participants to enter at least one suitable role, then collect confidence and a short reason. Evaluation can compare:

- **Identification accuracy:** whether the response includes J11 or J06.
- **False-positive rate:** whether the response includes jobs that fail a required condition.
- **Evidence use:** whether the participant inspects the information needed to justify the selected role.
- **Decision time and completion:** whether the participant finishes and how long the task takes.
- **Confidence and rationale:** whether the participant identifies the decisive evidence and distinguishes required criteria from the experience preference.

Compare these measures by prototype and presentation order while reviewing participants' explanations for reasonable interpretations or interface-driven misunderstandings.

## Anonymous frontend evaluation log

Each prototype records meaningful task actions in a separate `sessionStorage` session. Logs identify the prototype (`enhanced-search`, `comparison-table`, or `two-job-comparison`), study group, sequence step, dataset version, anonymous session ID, elapsed and active time, summary counts, and the underlying event sequence. After completing step 3, the participant explicitly copies one combined log containing all three sessions into PeerSurvey; nothing is transmitted automatically. Page visibility is recorded to distinguish active time from time spent away from the tab, and resetting a prototype also starts a fresh evaluation session.
