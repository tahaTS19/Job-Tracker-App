// ============================================================
// utils/parseJobText.js — Parses raw OCR text from Tesseract
// Based on real Tesseract output from LinkedIn screenshots:
//
// "@ Astro Sirens LLC"         ← company (@ is logo artifact)
// "Senior Java Developer"      ← position
// "Pakistan - 2 weeks ago..."  ← noise, skip
// "No response insights..."    ← noise, skip
//
// NOTE: Salary pills ($30K/yr) are unreadable by Tesseract
// because they are rendered as UI elements, not plain text.
// Salary field is left for the user to fill manually.
// ============================================================

// ─── Job title keywords ───────────────────────────────────────
const JOB_TITLE_KEYWORDS = [
  "senior", "junior", "lead", "principal", "staff", "associate",
  "engineer", "developer", "designer", "manager", "director",
  "analyst", "consultant", "architect", "specialist", "coordinator",
  "executive", "officer", "head", "vp", "president", "intern",
  "trainee", "graduate", "full stack", "fullstack", "frontend",
  "backend", "devops", "data", "product", "project", "marketing",
  "sales", "finance", "hr", "recruiter", "operations", "support",
];

// ─── Noise lines to skip entirely ────────────────────────────
const NOISE_PATTERNS = [
  /\d+\s*(week|day|month|hour)s?\s*ago/i,
  /over\s*\d+\s*applicants?/i,
  /^\d+\s*applicants?/i,
  /no response insights/i,
  /easy apply/i,
  /^save$/i,
  /^follow$/i,
  /^apply$/i,
];

// ─── Clean a line ─────────────────────────────────────────────
function cleanLine(line) {
  return line
    .replace(/^@\s*/g, "")         // Remove leading @ (logo artifact)
    .replace(/[|•·►▶»«]/g, "")    // Remove bullet artifacts
    .replace(/[^\x20-\x7E]/g, " ") // Remove non-ASCII chars
    .replace(/\s+/g, " ")           // Collapse spaces
    .trim();
}

// ─── Check if line is noise ───────────────────────────────────
function isNoise(line) {
  if (line.length < 2) return true;
  if (line.includes(" - ") && /ago|applicants/i.test(line)) return true; // "Pakistan - 2 weeks ago"
  return NOISE_PATTERNS.some(p => p.test(line));
}

// ─── Extract position ─────────────────────────────────────────
function extractPosition(lines) {
  for (const line of lines) {
    const lower = line.toLowerCase();
    if (JOB_TITLE_KEYWORDS.some(k => lower.includes(k))) {
      return line;
    }
  }
  return "";
}

// ─── Extract company ─────────────────────────────────────────
// Company is the first clean line that isn't the position
// On LinkedIn it always appears before the job title
function extractCompany(lines, position) {
  for (const line of lines) {
    if (line === position) continue;
    if (line.includes("·") || line.includes(" - ")) continue;
    if (/remote|contract|hybrid|full.?time|part.?time/i.test(line)) continue;
    if (line.length > 60) continue;
    return line;
  }
  return "";
}

// ============================================================
// MAIN EXPORT
// ============================================================
export function parseJobText(rawText) {
  if (!rawText?.trim()) {
    return { position: "", company: "", salary: "" };
  }

  const lines = rawText
    .split("\n")
    .map(cleanLine)
    .filter(l => l.length > 1 && !isNoise(l));

  const position = extractPosition(lines);
  const company  = extractCompany(lines, position);

  // Salary intentionally left empty — pill badges are not
  // readable by Tesseract as they are CSS UI elements, not text
  return { position, company, salary: "" };
}
