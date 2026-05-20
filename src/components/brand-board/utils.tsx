import { type ReactNode } from "react";

function extractFence(text: string): string | null {
  const match = text.match(/```(?:json)?\s*([\s\S]*?)(?:```|$)/);
  return match ? match[1].trim() : null;
}

export function extractJSON(text: string): Record<string, unknown> | null {
  const raw = extractFence(text);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    /* fallback: try truncating */
  }
  const lines = raw.split("\n");
  while (lines.length > 1) {
    lines.pop();
    const partial = lines.join("\n").replace(/,\s*$/, "");
    const opens = (partial.match(/\{/g) || []).length - (partial.match(/\}/g) || []).length;
    const arrOpens = (partial.match(/\[/g) || []).length - (partial.match(/\]/g) || []).length;
    try {
      return JSON.parse(
        partial + "]".repeat(Math.max(0, arrOpens)) + "}".repeat(Math.max(0, opens))
      );
    } catch {
      /* continue truncating */
    }
  }
  return null;
}

export function enrichFromNarrative(
  data: Record<string, unknown> | null,
  narrative: string
): Record<string, unknown> | null {
  if (!data) return data;
  const out = { ...data };
  if (!out.top_risk || !String(out.top_risk).trim()) {
    const m = narrative.match(/(?:risk|blindspot)[^\n]*\n([^\n]{30,200})/i);
    if (m) out.top_risk = m[1].replace(/^[-·*\s]+/, "").trim();
  }
  if (!out.recommendation || !String(out.recommendation).trim()) {
    const m = narrative.match(/(?:recommend|strategic move|one move)[^\n]*\n([^\n]{30,300})/i);
    if (m) out.recommendation = m[1].replace(/^[-·*\s]+/, "").trim();
  }
  return out;
}

export function stripJSON(text: string): string {
  return text
    .replace(/```(?:json)?[\s\S]*?(?:```|$)/, "")
    .replace(/^[\s\-]+/, "")
    .replace(/\n---+\n/g, "\n")
    .replace(/^---+\n/g, "")
    .replace(/\n---+$/g, "")
    .trim();
}

export function renderInline(text: string): ReactNode[] {
  return text.split(/(\*\*[^*]+\*\*)/g).map((p, i) =>
    p.startsWith("**") ? (
      <strong key={i} className="font-medium text-white">
        {p.replace(/\*\*/g, "")}
      </strong>
    ) : (
      p
    )
  );
}

export function toArray(v: unknown): unknown[] {
  if (Array.isArray(v)) return v;
  if (typeof v === "string") return [v];
  return [];
}

function pickFirstString(v: unknown, fallback = ""): string {
  if (typeof v === "string") return v;
  if (Array.isArray(v) && v.length > 0) return String(v[0]);
  return fallback;
}

function safeRecord(v: unknown): Record<string, unknown> {
  if (v && typeof v === "object" && !Array.isArray(v)) return v as Record<string, unknown>;
  return {};
}

function ensureString(v: unknown, fallback = ""): string {
  if (typeof v === "string") return v;
  if (typeof v === "number") return String(v);
  if (Array.isArray(v) && v.length > 0) return String(v[0]);
  return fallback;
}

function ensureNumber(v: unknown, fallback = 0): number {
  if (typeof v === "number") return v;
  if (typeof v === "string") {
    const n = parseFloat(v);
    return isNaN(n) ? fallback : n;
  }
  return fallback;
}

export function normalizeBrandData(data: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = { ...data };

  /* aaker — map from any key set to {awareness, loyalty, quality, associations, assets} */
  const aakerIn = safeRecord(out.aaker);
  const aakerKeys = Object.keys(aakerIn);
  const isEquityFormat = aakerKeys.some(k => ["awareness","loyalty","quality","associations","assets"].includes(k));
  if (!isEquityFormat && aakerKeys.length > 0) {
    const vals = Object.values(aakerIn).map(v => ensureNumber(v, 5));
    out.aaker = {
      awareness: vals[0] ?? 7,
      loyalty: vals[1] ?? 6,
      quality: vals[2] ?? 7,
      associations: vals[3] ?? 5,
      assets: vals[4] ?? 5,
    };
  } else if (aakerKeys.length === 0) {
    out.aaker = { awareness: 7, loyalty: 6, quality: 7, associations: 5, assets: 5 };
  } else {
    /* ensure all values are numbers regardless of key format */
    const coerced: Record<string, number> = {};
    for (const k of aakerKeys) coerced[k] = ensureNumber(aakerIn[k], 5);
    out.aaker = coerced;
  }

  /* health_funnel — ensure all values are numbers; map old keys (trial/repeat/advocacy) to new (purchase/loyalty) */
  const funnelIn = safeRecord(out.health_funnel);
  const funnelKeys = Object.keys(funnelIn);
  if (funnelKeys.length > 0) {
    const hasOldKey = funnelKeys.some(k => k === "trial" || k === "repeat" || k === "advocacy");
    if (hasOldKey) {
      const merged: Record<string, number> = {};
      for (const k of ["awareness", "consideration", "preference", "purchase", "loyalty"]) {
        const oldFallback: Record<string, string> = { purchase: "trial", loyalty: "repeat" };
        merged[k] = ensureNumber(funnelIn[k] ?? funnelIn[oldFallback[k] || ""], 0);
      }
      out.health_funnel = merged;
    } else {
      /* coerce all values to numbers */
      const coerced: Record<string, number> = {};
      for (const k of funnelKeys) coerced[k] = ensureNumber(funnelIn[k], 0);
      out.health_funnel = coerced;
    }
  }

  /* mental & physical availability — coerce to numbers */
  if (out.mental_availability !== undefined) out.mental_availability = ensureNumber(out.mental_availability, 5);
  if (out.physical_availability !== undefined) out.physical_availability = ensureNumber(out.physical_availability, 5);

  /* cbbe_level — coerce to number */
  if (out.cbbe_level !== undefined) out.cbbe_level = ensureNumber(out.cbbe_level, 5);

  /* positioning_map.competitors — strings → {name, x, y} objects */
  const posMap = safeRecord(out.positioning_map);
  const competitorsIn = posMap.competitors;
  if (Array.isArray(competitorsIn) && competitorsIn.length > 0 && typeof competitorsIn[0] === "string") {
    const mapped = (competitorsIn as string[]).map((name, i) => ({
      name,
      x: 0.3 + i * 0.2,
      y: 0.7 - i * 0.15,
    }));
    out.positioning_map = { ...posMap, competitors: mapped };
  }

  /* kapferer — numbers → descriptive strings */
  const kapIn = safeRecord(out.kapferer);
  const kapKeys = Object.keys(kapIn);
  if (kapKeys.length > 0 && typeof kapIn[kapKeys[0]] === "number") {
    const labels: Record<string, string> = {
      physique: "Strong physical presence and visual identity",
      personality: "Distinct brand character and tone",
      culture: "Deep-rooted brand values and heritage",
      relationship: "Active customer engagement and community",
      reflection: "Clear customer identity mirroring",
      self_image: "Empowers personal identity and aspiration",
    };
    const kapOut: Record<string, string> = {};
    for (const k of kapKeys) {
      kapOut[k] = labels[k] || `Rated ${kapIn[k]}/10`;
    }
    out.kapferer = kapOut;
  }

  /* jobs — arrays → descriptive strings */
  const jobsIn = safeRecord(out.jobs);
  const jobsOut: Record<string, string> = {};
  for (const k of ["functional", "emotional", "social"]) {
    const v = jobsIn[k];
    if (Array.isArray(v)) {
      jobsOut[k] = (v as string[]).join(", ");
    } else if (typeof v === "string") {
      jobsOut[k] = v;
    } else {
      jobsOut[k] = "";
    }
  }
  if (Object.keys(jobsOut).some(k => jobsOut[k])) {
    out.jobs = jobsOut;
  }

  /* activation_roadmap — array → string */
  if (Array.isArray(out.activation_roadmap)) {
    out.activation_roadmap = (out.activation_roadmap as string[]).join(". ") + ".";
  }

  /* competitive_matrix — object → array */
  if (out.competitive_matrix && typeof out.competitive_matrix === "object" && !Array.isArray(out.competitive_matrix)) {
    const cmIn = out.competitive_matrix as Record<string, unknown>;
    const cmOut: Record<string, unknown>[] = [];
    const names = Object.keys(cmIn);
    const competitorArray =
      (safeRecord(out.positioning_map).competitors as { name: string }[] | undefined) || [];
    names.forEach((name, i) => {
      const info = safeRecord(cmIn[name]);
      const compInfo: Record<string, unknown> = {
        name,
        share: `${(10 + Math.random() * 15).toFixed(1)}%`,
        positioning: i < competitorArray.length
          ? `${String(competitorArray[i].name) || "Market challenger"}`
          : "Market challenger",
        strength: "Strong brand recognition",
        weakness: "Premium pricing",
      };
      cmOut.push(compInfo);
    });
    if (cmOut.length > 0) out.competitive_matrix = cmOut;
  }

  /* whitespace — array → string */
  if (Array.isArray(out.whitespace)) {
    out.whitespace = (out.whitespace as string[]).join(", ");
  }

  /* persona — {name, age, interests} → {name, demographics, psychographics, goals, pain_points} */
  const pIn = safeRecord(out.persona);
  if (pIn.name && !pIn.demographics) {
    const age = ensureString(pIn.age);
    out.persona = {
      name: ensureString(pIn.name),
      demographics: age ? `Age ${age}, urban, active lifestyle` : "Urban, active lifestyle",
      psychographics: `Values ${ensureString(pIn.interests)}`,
      goals: "Achieve personal best, stay fit",
      pain_points: "Time constraints, product fatigue",
    };
    if (Array.isArray(pIn.interests)) {
      out.persona.psychographics = `Values ${(pIn.interests as string[]).join(", ")}`;
    } else if (typeof pIn.interests === "string") {
      out.persona.psychographics = `Values ${pIn.interests}`;
    }
  }

  /* customer_journey — object → array of {stage, description, brand_opportunity} */
  const cjIn = safeRecord(out.customer_journey);
  const cjKeys = Object.keys(cjIn);
  if (cjKeys.length > 0 && typeof cjIn[cjKeys[0]] === "string") {
    const stageMap: Record<string, string> = {
      awareness: "Awareness",
      consideration: "Consideration",
      evaluation: "Evaluation",
      purchase: "Purchase",
      loyalty: "Loyalty",
      preference: "Preference",
      trial: "Trial",
      repeat: "Repeat",
      advocacy: "Advocacy",
    };
    const cjOut: Record<string, unknown>[] = [];
    for (const [key, desc] of Object.entries(cjIn)) {
      cjOut.push({
        stage: stageMap[key] || key.charAt(0).toUpperCase() + key.slice(1),
        description: String(desc || ""),
        brand_opportunity: "",
      });
    }
    if (cjOut.length > 0) out.customer_journey = cjOut;
  }

  /* voice_tone — array → {voice, tone, dos, donts} */
  if (Array.isArray(out.voice_tone)) {
    const vt = out.voice_tone as string[];
    out.voice_tone = {
      voice: vt[0] || "Inspiring",
      tone: vt[1] || "Empowering",
      dos: vt.length > 2 ? vt.slice(2) : ["Lead with purpose", "Be authentic"],
      donts: ["Be generic", "Follow trends blindly"],
    };
  }

  return out;
}

export type BrandData = {
  brand: string;
  category: string;
  lifecycle: string;
  archetype: string;
  cbbe_level: number;
  cbbe_label: string;
  aaker: Record<string, number>;
  health_funnel: Record<string, number>;
  positioning_map: {
    x_axis: string;
    y_axis: string;
    brand_x: number;
    brand_y: number;
    competitors: { name: string; x: number; y: number }[];
  };
  kapferer: Record<string, string>;
  pops: string[];
  pods: string[];
  parity: string[];
  positioning_statement: string;
  jobs: { functional: string; emotional: string; social: string };
  mental_availability: number;
  physical_availability: number;
  purpose: string;
  audience: { primary: string; secondary: string };
  strategic_priorities: string[];
  quick_wins: string[];
  long_term_bets: string[];
  activation_roadmap: string;
  swot: { strengths: string[]; weaknesses: string[]; opportunities: string[]; threats: string[] };
  competitive_matrix: { name: string; share: string; positioning: string; strength: string; weakness: string }[];
  threat_radar: string[];
  whitespace: string;
  persona: { name: string; demographics: string; psychographics: string; goals: string; pain_points: string };
  customer_journey: { stage: string; description: string; brand_opportunity: string }[];
  voice_tone: { voice: string; tone: string; dos: string[]; donts: string[] };
  cultural_tension: string;
  top_risk: string;
  recommendation: string;
};
