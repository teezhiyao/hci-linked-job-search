# Design principles by alternative

This review uses the terminology from CS6750 Lesson 2.5, which consolidates principles from Norman, Nielsen, Constantine and Lockwood, and Universal Design. The principles are guidelines with tensions between them, rather than requirements that every interface must maximize simultaneously.

## Principles shared across alternatives

- **Consistency:** The alternatives use the same 15 fictional jobs, criterion categories, terminology, standardized fields, and LinkedIn-style shell. Their similarly structured scenarios use different values so participants cannot reuse one answer.
- **Perceptibility:** Salary, experience, arrangement, eligibility, hiring evidence, missing information, prior activity, and decisions are shown explicitly.
- **Mapping:** Listing information is organized around applicants' real decision criteria rather than the source job-description structure.
- **Structure:** Responsibilities, technologies, experience, salary, arrangement, eligibility, and hiring evidence are grouped consistently.
- **Equity:** Decision-relevant information is available without a simulated Premium restriction, and status meaning is communicated with text rather than color alone.
- **Documentation:** The study guide keeps the scenario, conditions, task, fictional-data notice, and survey instructions available in context.
- **Feedback:** Viewed, saved, considering, passed, kept, and copied states visibly confirm user actions.

## Prototype A: Integrated job search

Primary principles:

- **Discoverability:** Standardized job information, requirements, and filters are available during search instead of being hidden in full descriptions.
- **Perceptibility:** Viewed and saved states, missing values, criterion assessments, and dated hiring evidence expose the current state.
- **Mapping:** Each listing is assessed against the user's stated requirements.
- **Flexibility:** Users may search, filter, edit requirements, inspect evidence, and save jobs without following a fixed sequence.
- **Feedback:** Opening and saving a listing updates its visible state immediately.

Main trade-off: greater discoverability may weaken **Simplicity** because filters, requirements, assessments, and details compete for attention.

## Prototype B: Shortlist narrowing

Primary principles:

- **Simplicity:** Only one or two jobs are considered in each immediate decision.
- **Structure:** Corresponding categories are aligned across the pair.
- **Mapping:** Action labels state their effects, such as keeping one company and setting aside the other.
- **Feedback:** Confirmed decisions update status and history views.
- **Tolerance:** Confirmation, undo, restoration, postponement, and later review reduce the cost of mistakes.
- **Constraints:** A predictable queue limits the immediate decision space.
- **Ease and comfort:** Smaller comparisons reduce the information that must be processed at once.

Main trade-off: local simplicity may increase total effort. Repeated comparisons across 15 jobs can produce fatigue and order effects.

## Prototype C: Shortlisted job comparison

Primary principles:

- **Structure:** Corresponding job attributes are aligned in stable rows and columns.
- **Consistency:** Every listing uses the same categories and assessment vocabulary.
- **Mapping:** Desired values beneath headings connect personal requirements with each job's actual information.
- **Perceptibility:** Differences, missing values, decisions, previous activity, and supporting evidence remain visible.
- **Flexibility:** Users may reorder columns, edit requirements, filter decisions, inspect evidence, and add private notes.
- **Tolerance:** Passed and removed jobs remain recoverable, and passing is distinct from shortlist removal.

Main trade-off: comprehensive structure can weaken **Simplicity** and **Ease and comfort** because a 15-job table is dense and may require horizontal scrolling.

## Evaluation implications

The alternatives intentionally emphasize different principles, so the evaluation should examine trade-offs instead of assuming that one design is universally superior. Measures include whether participants identify a suitable role, checkpoint comprehension, required-feature use, active task time, jobs and evidence panels inspected, decision changes or undo actions, confidence, ease, and explanations of the decisive criteria.

The final evaluation log is kept separate from the product interface in the study guide. Each prototype records a distinct anonymous session containing its prototype identifier, study group, sequence step, dataset version, summary measures, and events. After step 3, the participant copies one combined log containing all three sessions into PeerSurvey.
