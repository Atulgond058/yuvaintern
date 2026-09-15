/**
 * Rule-based triage engine.
 * Mirrors the Symptom Checker & Triage Decision Flow documented in the
 * Week 1 System Architecture report (Figure 3): weighted symptom criteria
 * assign one of three urgency tiers.
 *
 * This is intentionally simple and conservative — see the report's
 * Section 12 (Risk Management) on triage misclassification risk. It is
 * designed to be replaced or augmented by a clinician-reviewed model
 * without changing the API contract.
 */

const EMERGENCY_KEYWORDS = [
  "chest pain",
  "difficulty breathing",
  "shortness of breath",
  "severe bleeding",
  "loss of consciousness",
  "slurred speech",
  "stroke",
  "seizure",
  "suicidal",
];

const URGENT_KEYWORDS = [
  "high fever",
  "persistent vomiting",
  "severe pain",
  "dehydration",
  "confusion",
  "chest tightness",
];

function normalize(text) {
  return text.toLowerCase().trim();
}

function containsAny(symptomText, keywords) {
  return keywords.some((keyword) => symptomText.includes(keyword));
}

/**
 * assess({ symptoms, durationDays, severity }) -> { urgency, reasons }
 * urgency: "emergency" | "urgent" | "routine"
 */
function assess({ symptoms, durationDays, severity }) {
  const joined = symptoms.map(normalize).join(" ; ");
  const reasons = [];

  if (containsAny(joined, EMERGENCY_KEYWORDS)) {
    reasons.push("Reported symptoms match emergency-indicator keywords.");
    return { urgency: "emergency", reasons };
  }

  if (severity >= 4) {
    reasons.push("Self-reported severity is high (4-5 out of 5).");
  }
  if (containsAny(joined, URGENT_KEYWORDS)) {
    reasons.push("Reported symptoms match urgent-indicator keywords.");
  }
  if (durationDays >= 7 && severity >= 3) {
    reasons.push("Symptoms have persisted 7+ days at moderate-or-higher severity.");
  }

  if (reasons.length > 0) {
    return { urgency: "urgent", reasons };
  }

  reasons.push("No emergency or urgent indicators detected; routed as routine.");
  return { urgency: "routine", reasons };
}

module.exports = { assess, EMERGENCY_KEYWORDS, URGENT_KEYWORDS };
