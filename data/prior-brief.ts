// The "previous brief" — the hypotheses and questions a ReadyRoom brief would
// have carried into the FIRST (intro) call, before that call happened. The
// Post-Call Scorecard grades these against the intro-call transcript:
// which predicted pains the prospect confirmed, and which suggested questions
// the rep actually asked. This is the self-grading loop made concrete.
//
// H4 and Q3 deliberately concern budget/procurement — the planted gap. They
// come back "not-surfaced" / "not asked", so the scorecard shows the honest
// unknown persisting across the call rather than being quietly filled in.

export interface PriorHypothesis {
  id: string; // H1..Hn
  pain: string;
  predictedConfidence: "confirmed" | "inferred" | "speculative";
}

export interface PriorQuestion {
  id: string; // Q1..Qn
  question: string;
}

export const PRIOR_HYPOTHESES: PriorHypothesis[] = [
  {
    id: "H1",
    pain: "Litigation spend on the defect matter is rising and lacks transparency for in-house legal.",
    predictedConfidence: "inferred",
  },
  {
    id: "H2",
    pain: "The volume of project documents is more than a lean legal team can review by hand.",
    predictedConfidence: "inferred",
  },
  {
    id: "H3",
    pain: "They want more control of review in-house but doubt they have the capacity to run it.",
    predictedConfidence: "speculative",
  },
  {
    id: "H4",
    pain: "Budget is approved and procurement will move quickly once a tool is chosen.",
    predictedConfidence: "speculative",
  },
];

export const PRIOR_QUESTIONS: PriorQuestion[] = [
  {
    id: "Q1",
    question: "How is document review on the defect matter handled today?",
  },
  {
    id: "Q2",
    question: "Who on the team would operate a review tool day-to-day?",
  },
  {
    id: "Q3",
    question: "What is the budget for this, and who signs off on the purchase?",
  },
];

export const priorBrief = { PRIOR_HYPOTHESES, PRIOR_QUESTIONS };
