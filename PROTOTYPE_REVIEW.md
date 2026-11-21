# Prototype Review: Find, Compare, and Narrow

## Evaluation model

The three prototypes use the same LinkedIn-style shell, job information, and decision criteria. Their primary interaction should remain distinct:

| Alternative | Primary purpose | Decision model | Final action |
|---|---|---|---|
| Enhanced search workspace | Find a suitable opportunity during discovery | Inspect jobs individually using enriched search information | Save one job |
| Shortlist comparison table | Evaluate an existing shortlist systematically | Compare all shortlisted jobs simultaneously | Leave one job as Considering |
| Pairwise shortlist narrowing | Reduce a large saved collection | Decide between two jobs at a time | Leave one job as Kept |

## Alternative 1: Enhanced search workspace

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

## Alternative 2: Shortlist comparison table

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

## Alternative 3: Pairwise shortlist narrowing

### Distinct features

- Jobs are reviewed two at a time.
- Users can keep, set aside, or postpone jobs.
- Decisions can include reasons and private notes.
- Undo and review history support recovery.
- Further rounds reduce the retained collection.

### Boundary

This alternative does not use a configurable requirements table or overall match score. Its contribution is reducing simultaneous information load through sequential, recoverable decisions.

### Implemented update

The guide now combines scenario, goal, and one task in a single panel. The task asks participants to narrow until one matching job remains Kept. Task-completion storage and controls have been removed; participants submit the answer in PeerSurvey.

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
- The software-development reference answer is J06.
- The customer-support dataset remains in the code for a possible later two-domain study, but it is not currently selectable.

Before launching the study, test every group sequence in a clean browser session and verify the corresponding PeerSurvey branching and answer keys.
