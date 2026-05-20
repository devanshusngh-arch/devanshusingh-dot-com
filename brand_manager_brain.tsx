import { useState, useRef, useEffect } from "react";

const SYSTEM_PROMPT = `You are a senior brand strategist. For every brand analysis, you MUST return a JSON block followed by your narrative analysis.

THE JSON BLOCK FORMAT (strictly valid JSON, no trailing commas):
\`\`\`json
{
  "brand": "Brand Name",
  "category": "Category name",
  "lifecycle": "Introduction|Growth|Maturity|Decline",
  "archetype": "Hero|Outlaw|Caregiver|Creator|Sage|Innocent|Explorer|Ruler|Everyman|Jester|Lover|Magician",
  "cbbe_level": 1,
  "cbbe_label": "Salience|Performance/Imagery|Judgments/Feelings|Resonance",
  "aaker": { "awareness": 7, "loyalty": 6, "quality": 8, "associations": 7, "assets": 5 },
  "health_funnel": { "awareness": 85, "consideration": 60, "preference": 40, "trial": 35, "repeat": 55, "advocacy": 30 },
  "positioning_map": {
    "x_axis": "Affordable ← → Premium",
    "y_axis": "Functional ← → Aspirational",
    "brand_x": 0.6, "brand_y": 0.7,
    "competitors": [{"name": "Competitor1", "x": 0.3, "y": 0.5}]
  },
  "kapferer": { "physique": "...", "personality": "...", "culture": "...", "relationship": "...", "reflection": "...", "self_image": "..." },
  "pops": ["POP1", "POP2"],
  "pods": ["POD1", "POD2"],
  "positioning_statement": "For [target], [brand] is the [category] that [POD] because [RTB].",
  "jobs": { "functional": "...", "emotional": "...", "social": "..." },
  "mental_availability": 7,
  "physical_availability": 6,
  "cultural_tension": "The cultural contradiction this brand resolves",
  "top_risk": "The single biggest strategic risk in one sentence",
  "recommendation": "One sharp specific strategic recommendation"
}
\`\`\`

After the JSON block, write full narrative analysis covering: Brand Snapshot, Category & Competition, JTBD, Identity (Kapferer), Positioning, Equity (Aaker), CBBE Level, Mental & Physical Availability, Brand Health Funnel, Cultural Angle, Blindspots & Risk, Strategic Recommendation.

INDIA CONTEXT: Apply Bharat vs India divide, value-seeking behaviour, D2C disruption, EdTech trust deficit, fintech regulation, creator economy as CEP.
TONE: Senior consultant in a workshop. Sharp, direct, no padding. Use **bold** for headers.`;

const SUGGESTED_BRANDS = ["Swiggy","Nykaa","Zepto","Groww","Physics Wallah","Scaler","Razorpay","boAt","Mamaearth","Zomato"];
const QUICK_PROMPTS = ["Biggest brand risk right now?","How would you reposition this?","Write a positioning statement","Compare mental vs physical availability","Which archetype fits best?","What's the cultural tension here?"];

const FRAMEWORK_ITEMS = [
  { title: "Kapferer Prism", desc: "All 6 identity facets", color: "#534AB7", bg: "#EEEDFE", detail: "Kapferer's Identity Prism maps a brand across 6 facets: Physique (visual identity), Personality (tone of voice), Culture (values & origin), Relationship (brand-consumer bond), Reflection (who the brand portrays as its user), and Self-Image (how users see themselves through the brand). Left = externalization; right = internalization." },
  { title: "CBBE Pyramid", desc: "Keller's level, highlighted", color: "#185FA5", bg: "#E6F1FB", detail: "Keller's Customer-Based Brand Equity Pyramid has 4 levels built bottom-up: Salience (recalled in buying situations?), Performance & Imagery (rational + emotional meaning), Judgments & Feelings (head + heart response), Resonance (intense loyalty, community, active engagement). Most brands stall at level 2 or 3." },
  { title: "Aaker Equity Bars", desc: "5 dimensions scored", color: "#0F6E56", bg: "#E1F5EE", detail: "Aaker's Brand Equity Model scores 5 components: Awareness (how widely known?), Loyalty (how sticky?), Perceived Quality (premium signal?), Brand Associations (cognitive & emotional links), Proprietary Assets (patents, trademarks, distribution). Scored 1–10. The shape of scores tells you where equity is deep vs. fragile." },
  { title: "Health Funnel", desc: "Leakage analysis with warnings", color: "#854F0B", bg: "#FAEEDA", detail: "The Brand Health Funnel tracks: Awareness → Consideration → Preference → Trial → Repeat → Advocacy. Each drop is a leakage point. A >20pp drop is flagged. High awareness + low consideration = positioning problem. High trial + low repeat = product-promise mismatch." },
  { title: "Positioning Map", desc: "Brand vs. competitors, 2×2", color: "#993C1D", bg: "#FAECE7", detail: "A perceptual map plots your brand and competitors on two strategically chosen axes (e.g. Affordable ↔ Premium vs. Functional ↔ Aspirational). Gaps near desirable positions = whitespace opportunities. Shows where consumers actually perceive you — not where you claim to be." },
  { title: "Sharp Availability", desc: "Mental + physical scores", color: "#993556", bg: "#FBEAF0", detail: "Byron Sharp's How Brands Grow: Mental Availability = how easily your brand comes to mind in buying situations. Physical Availability = how easy it is to buy across channels. Most brand strategy over-indexes on differentiation and under-invests in availability." },
  { title: "JTBD Cards", desc: "Functional, emotional, social jobs", color: "#3B6D11", bg: "#EAF3DE", detail: "Jobs-to-be-Done (Christensen): what is the customer hiring this brand to do? Three layers — Functional (practical task), Emotional (how they want to feel), Social (how they want to be perceived). Reveals non-obvious competitors and switching triggers that positioning frameworks miss." },
  { title: "POPs & PODs", desc: "Table stakes vs. owned advantages", color: "#185FA5", bg: "#E6F1FB", detail: "Points of Parity (POPs) = category table stakes — what you must have to be a legitimate player. Points of Difference (PODs) = what only you can credibly own. Great positioning: match on POPs, win on PODs. PODs must be Desirable, Deliverable, and Differentiating." },
];

// ── Helpers ───────────────────────────────────────────────────────────────────
function extractJSON(text) {
  const match = text.match(/```json\s*([\s\S]*?)(?:```|$)/);
  if (!match) return null;
  const raw = match[1].trim();
  try { return JSON.parse(raw); } catch {}
  const lines = raw.split("\n");
  while (lines.length > 1) {
    lines.pop();
    const partial = lines.join("\n").replace(/,\s*$/, "");
    const opens = (partial.match(/\{/g)||[]).length - (partial.match(/\}/g)||[]).length;
    const arrOpens = (partial.match(/\[/g)||[]).length - (partial.match(/\]/g)||[]).length;
    try { return JSON.parse(partial + "]".repeat(Math.max(0,arrOpens)) + "}".repeat(Math.max(0,opens))); } catch {}
  }
  return null;
}
function enrichFromNarrative(data, narrative) {
  if (!data) return data;
  const out = { ...data };
  if (!out.top_risk || !out.top_risk.trim()) {
    const m = narrative.match(/(?:risk|blindspot)[^\n]*\n([^\n]{30,200})/i);
    if (m) out.top_risk = m[1].replace(/^[-·*\s]+/, "").trim();
  }
  if (!out.recommendation || !out.recommendation.trim()) {
    const m = narrative.match(/(?:recommend|strategic move|one move)[^\n]*\n([^\n]{30,300})/i);
    if (m) out.recommendation = m[1].replace(/^[-·*\s]+/, "").trim();
  }
  return out;
}
function stripJSON(text) {
  return text
    .replace(/```json[\s\S]*?(?:```|$)/, "")
    .replace(/^[\s\-]+/, "")
    .replace(/\n---+\n/g, "\n")
    .replace(/^---+\n/g, "")
    .replace(/\n---+$/g, "")
    .trim();
}
function renderInline(text) {
  return text.split(/(\*\*[^*]+\*\*)/g).map((p, i) =>
    p.startsWith("**") ? <strong key={i} style={{ fontWeight: 500 }}>{p.replace(/\*\*/g, "")}</strong> : p
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────
function FrameworkCard({ item, activeCard, setActiveCard }) {
  const isOpen = activeCard === item.title;
  return (
    <div onClick={() => setActiveCard(isOpen ? null : item.title)}
      style={{ background: isOpen ? item.bg : "var(--color-background-secondary)", borderRadius: 8, padding: "9px 12px", cursor: "pointer", border: `1px solid ${isOpen ? item.color+"44" : "transparent"}`, transition: "all 0.15s" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <p style={{ fontWeight: 500, fontSize: 12, margin: "0 0 2px", color: isOpen ? item.color : "var(--color-text-primary)" }}>{item.title}</p>
        <span style={{ fontSize: 10, color: item.color, marginLeft: 4 }}>{isOpen ? "▲" : "▼"}</span>
      </div>
      <p style={{ fontSize: 11, color: "var(--color-text-secondary)", margin: 0 }}>{item.desc}</p>
      {isOpen && <p style={{ fontSize: 12, color: "var(--color-text-primary)", margin: "8px 0 0", lineHeight: 1.55, borderTop: `1px solid ${item.color}22`, paddingTop: 8 }}>{item.detail}</p>}
    </div>
  );
}

function CBBEPyramid({ level, label }) {
  const levels = [
    { l: 1, name: "Salience", sub: "Brand awareness & recall", w: 340 },
    { l: 2, name: "Performance & Imagery", sub: "Rational + emotional meaning", w: 260 },
    { l: 3, name: "Judgments & Feelings", sub: "Head + heart response", w: 180 },
    { l: 4, name: "Resonance", sub: "Loyalty & community", w: 110 },
  ];
  return (
    <div style={{ textAlign: "center" }}>
      <p style={{ fontSize: 11, fontWeight: 500, color: "var(--color-text-secondary)", textTransform: "uppercase", letterSpacing: 0.5, margin: "0 0 10px" }}>CBBE Pyramid — current level</p>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
        {[...levels].reverse().map(lv => {
          const active = lv.l === level;
          const achieved = lv.l <= level;
          return (
            <div key={lv.l} style={{ width: lv.w, background: active ? "#534AB7" : achieved ? "#AFA9EC" : "var(--color-background-secondary)", border: `1px solid ${active ? "#534AB7" : achieved ? "#7F77DD" : "var(--color-border-tertiary)"}`, borderRadius: 4, padding: "6px 8px" }}>
              <p style={{ margin: 0, fontSize: 12, fontWeight: 500, color: active ? "#fff" : achieved ? "#3C3489" : "var(--color-text-secondary)" }}>{lv.name}</p>
              <p style={{ margin: 0, fontSize: 10, color: active ? "#CECBF6" : achieved ? "#534AB7" : "var(--color-text-secondary)" }}>{lv.sub}</p>
            </div>
          );
        })}
      </div>
      <p style={{ fontSize: 11, color: "#534AB7", fontWeight: 500, margin: "8px 0 0" }}>Currently at: {label}</p>
    </div>
  );
}

function AakerBars({ aaker }) {
  const dims = [
    { key: "awareness", label: "Brand Awareness" }, { key: "loyalty", label: "Brand Loyalty" },
    { key: "quality", label: "Perceived Quality" }, { key: "associations", label: "Brand Associations" },
    { key: "assets", label: "Other Proprietary Brand Assets" },
  ];
  return (
    <div>
      <p style={{ fontSize: 11, fontWeight: 500, color: "var(--color-text-secondary)", textTransform: "uppercase", letterSpacing: 0.5, margin: "0 0 10px" }}>Aaker Brand Equity</p>
      {dims.map(d => {
        const val = aaker[d.key] || 0;
        const col = val >= 8 ? "#1D9E75" : val >= 6 ? "#534AB7" : val >= 4 ? "#BA7517" : "#D85A30";
        return (
          <div key={d.key} style={{ marginBottom: 8 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
              <span style={{ fontSize: 12, color: "var(--color-text-primary)" }}>{d.label}</span>
              <span style={{ fontSize: 12, fontWeight: 500, color: col }}>{val}/10</span>
            </div>
            <div style={{ height: 6, background: "var(--color-background-secondary)", borderRadius: 3, overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${val*10}%`, background: col, borderRadius: 3 }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function HealthFunnel({ funnel }) {
  const stages = [
    { key: "awareness", label: "Awareness" },
    { key: "consideration", label: "Consideration" },
    { key: "preference", label: "Preference" },
    { key: "trial", label: "Trial" },
    { key: "repeat", label: "Repeat" },
    { key: "advocacy", label: "Advocacy" },
  ];
  const top = Math.max(funnel["awareness"] || 100, 1);
  const maxBarW = 200;
  return (
    <div>
      <p style={{ fontSize: 11, fontWeight: 500, color: "var(--color-text-secondary)", textTransform: "uppercase", letterSpacing: 0.5, margin: "0 0 12px" }}>Brand Health Funnel</p>
      {stages.map((s, i) => {
        const val = funnel[s.key] || 0;
        const prev = i > 0 ? funnel[stages[i - 1].key] || 100 : 100;
        const drop = prev - val;
        const isLeak = drop > 20 && i > 0;
        const barW = Math.round((val / top) * maxBarW);
        const barColor = isLeak ? "#D85A30" : "#534AB7";
        return (
          <div key={s.key} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
            <div style={{ width: 88, fontSize: 12, textAlign: "right", color: "var(--color-text-primary)", flexShrink: 0 }}>{s.label}</div>
            <div style={{ position: "relative", width: maxBarW, height: 24, flexShrink: 0, borderRadius: 4, background: "var(--color-background-secondary)", overflow: "hidden" }}>
              <div style={{ position: "absolute", left: 0, top: 0, height: "100%", width: barW, background: barColor, borderRadius: 4 }} />
            </div>
            <span style={{ fontSize: 12, fontWeight: 600, color: isLeak ? "#D85A30" : "var(--color-text-primary)", minWidth: 36, flexShrink: 0 }}>{val}%</span>
            {isLeak && <span style={{ fontSize: 10, color: "#D85A30", flexShrink: 0, whiteSpace: "nowrap" }}>⚠ −{drop}%</span>}
          </div>
        );
      })}
      <p style={{ fontSize: 10, color: "var(--color-text-secondary)", margin: "8px 0 0" }}>⚠ = significant leakage (&gt;20pp drop)</p>
    </div>
  );
}

function PositioningMap({ map, brandName }) {
  const W = 320, H = 280, pad = 50;
  const innerW = W - pad * 2;
  const innerH = H - pad * 2;

  // Normalise coords: spread them across the full space
  const allX = [(map.brand_x || 0.5), ...(map.competitors || []).map(c => c.x)];
  const allY = [(map.brand_y || 0.5), ...(map.competitors || []).map(c => c.y)];
  const minX = Math.min(...allX), maxX = Math.max(...allX);
  const minY = Math.min(...allY), maxY = Math.max(...allY);
  const rangeX = maxX - minX || 1, rangeY = maxY - minY || 1;
  const margin = 0.15;
  const norm = (v, min, range) => margin + ((v - min) / range) * (1 - margin * 2);

  const toSvgX = v => pad + norm(v, minX, rangeX) * innerW;
  const toSvgY = v => H - pad - norm(v, minY, rangeY) * innerH;

  const parseAxis = str => {
    if (!str) return ["Low", "High"];
    const parts = str.split(/←|→|↔|<->|->/);
    const clean = parts.map(s => s.trim()).filter(Boolean);
    return [clean[0] || "Low", clean[clean.length - 1] || "High"];
  };
  const [xLeft, xRight] = parseAxis(map.x_axis);
  const [, yTop] = parseAxis(map.y_axis);
  const [yBottom] = parseAxis(map.y_axis);

  const bx = toSvgX(map.brand_x || 0.5);
  const by = toSvgY(map.brand_y || 0.5);

  const midX = pad + innerW / 2;
  const midY = pad + innerH / 2;

  return (
    <div>
      <p style={{ fontSize: 11, fontWeight: 500, color: "var(--color-text-secondary)", textTransform: "uppercase", letterSpacing: 0.5, margin: "0 0 8px" }}>Perceptual Positioning Map</p>
      <svg width={W} height={H} style={{ display: "block", overflow: "visible" }}>
        {/* Quadrant fills */}
        <rect x={pad} y={pad} width={innerW / 2} height={innerH / 2} fill="#EEEDFE" opacity={0.25} rx={2} />
        <rect x={midX} y={pad} width={innerW / 2} height={innerH / 2} fill="#E1F5EE" opacity={0.25} rx={2} />
        <rect x={pad} y={midY} width={innerW / 2} height={innerH / 2} fill="#FAECE7" opacity={0.25} rx={2} />
        <rect x={midX} y={midY} width={innerW / 2} height={innerH / 2} fill="#E6F1FB" opacity={0.25} rx={2} />
        {/* Centre axes */}
        <line x1={pad} y1={midY} x2={W - pad} y2={midY} stroke="var(--color-border-secondary)" strokeWidth={1} />
        <line x1={midX} y1={pad} x2={midX} y2={H - pad} stroke="var(--color-border-secondary)" strokeWidth={1} />
        {/* Axis labels */}
        <text x={pad + 2} y={midY - 5} fontSize={9} fill="var(--color-text-secondary)">{xLeft}</text>
        <text x={W - pad - 2} y={midY - 5} fontSize={9} fill="var(--color-text-secondary)" textAnchor="end">{xRight}</text>
        <text x={midX + 4} y={pad + 10} fontSize={9} fill="var(--color-text-secondary)">{yTop}</text>
        <text x={midX + 4} y={H - pad - 4} fontSize={9} fill="var(--color-text-secondary)">{yBottom}</text>
        {/* Competitors */}
        {(map.competitors || []).map((c, i) => {
          const cx = toSvgX(c.x), cy = toSvgY(c.y);
          return (
            <g key={i}>
              <circle cx={cx} cy={cy} r={5} fill="#AFA9EC" opacity={0.85} />
              <text x={cx + 7} y={cy + 4} fontSize={9} fill="var(--color-text-secondary)">{c.name}</text>
            </g>
          );
        })}
        {/* Brand */}
        <circle cx={bx} cy={by} r={13} fill="#534AB7" opacity={0.15} />
        <circle cx={bx} cy={by} r={8} fill="#534AB7" />
        <text x={bx + 12} y={by + 4} fontSize={10} fontWeight="500" fill="#534AB7">{brandName}</text>
      </svg>
    </div>
  );
}

function AvailabilityMeter({ mental, physical }) {
  return (
    <div>
      <p style={{ fontSize: 11, fontWeight: 500, color: "var(--color-text-secondary)", textTransform: "uppercase", letterSpacing: 0.5, margin: "0 0 10px" }}>Byron Sharp — Availability</p>
      {[{ label: "Mental Availability", val: mental, desc: "Memory links & CEPs" }, { label: "Physical Availability", val: physical, desc: "Distribution & ease of purchase" }].map(m => (
        <div key={m.label} style={{ marginBottom: 12 }}>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span style={{ fontSize: 12, color: "var(--color-text-primary)" }}>{m.label}</span>
            <span style={{ fontSize: 12, fontWeight: 500, color: "#1D9E75" }}>{m.val}/10</span>
          </div>
          <p style={{ fontSize: 10, color: "var(--color-text-secondary)", margin: "1px 0 4px" }}>{m.desc}</p>
          <div style={{ height: 8, background: "var(--color-background-secondary)", borderRadius: 4, overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${m.val*10}%`, background: "#1D9E75", borderRadius: 4 }} />
          </div>
        </div>
      ))}
    </div>
  );
}

function Tags({ items, color, bg }) {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
      {(items||[]).map((t,i) => <span key={i} style={{ fontSize: 11, padding: "3px 8px", borderRadius: 12, background: bg, color, border: `1px solid ${color}33` }}>{t}</span>)}
    </div>
  );
}

function JTBDCard({ jobs }) {
  return (
    <div>
      <p style={{ fontSize: 11, fontWeight: 500, color: "var(--color-text-secondary)", textTransform: "uppercase", letterSpacing: 0.5, margin: "0 0 8px" }}>Jobs-to-be-Done</p>
      {[["Functional", jobs.functional, "#534AB7", "#EEEDFE"], ["Emotional", jobs.emotional, "#0F6E56", "#E1F5EE"], ["Social", jobs.social, "#993C1D", "#FAECE7"]].map(([t,v,tc,bg]) => (
        <div key={t} style={{ background: bg, borderRadius: 8, padding: "7px 10px", marginBottom: 5, border: `1px solid ${tc}22` }}>
          <span style={{ fontSize: 10, fontWeight: 500, color: tc, textTransform: "uppercase", letterSpacing: 0.3 }}>{t}</span>
          <p style={{ fontSize: 12, color: "var(--color-text-primary)", margin: "2px 0 0", lineHeight: 1.4 }}>{v||"—"}</p>
        </div>
      ))}
    </div>
  );
}

function downloadReport(data, narrative) {
  const serif = "Georgia, 'Times New Roman', Times, serif";
  const sans = "-apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif";

  const aakers = [
    { label: "Awareness", val: data.aaker?.awareness || 0 },
    { label: "Brand Loyalty", val: data.aaker?.loyalty || 0 },
    { label: "Perceived Quality", val: data.aaker?.quality || 0 },
    { label: "Associations", val: data.aaker?.associations || 0 },
    { label: "Other Proprietary Brand Assets", val: data.aaker?.assets || 0 },
  ];
  const funnelStages = ["awareness","consideration","preference","trial","repeat","advocacy"];
  const kapfacets = ["physique","personality","culture","relationship","reflection","self_image"];

  const barRow = (label, val, max = 10, isPercent = false) => {
    const pct = isPercent ? val : (val / max) * 100;
    const col = val >= (isPercent ? 70 : 7) ? "#1D9E75" : val >= (isPercent ? 50 : 5) ? "#534AB7" : "#D85A30";
    return `<div style="margin-bottom:10px;">
      <div style="display:flex;justify-content:space-between;margin-bottom:3px;">
        <span style="font-family:${sans};font-size:12px;color:#333;">${label}</span>
        <span style="font-family:${sans};font-size:12px;font-weight:600;color:${col};">${isPercent ? val+"%" : val+"/10"}</span>
      </div>
      <div style="height:6px;background:#EBEBEB;border-radius:3px;overflow:hidden;">
        <div style="height:100%;width:${pct}%;background:${col};border-radius:3px;"></div>
      </div>
    </div>`;
  };

  const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>${data.brand} — Brand Strategy Report</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: ${sans}; color: #1A1A1A; background: #fff; }
  @page { size: A4; margin: 20mm 18mm; }
  @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }

  .page { max-width: 720px; margin: 0 auto; padding: 48px 40px; }

  /* COVER */
  .cover { border-bottom: 3px solid #534AB7; padding-bottom: 32px; margin-bottom: 36px; }
  .cover-label { font-family:${sans}; font-size:10px; letter-spacing:2px; text-transform:uppercase; color:#888; margin-bottom:12px; }
  .cover-brand { font-family:${serif}; font-size:40px; font-weight:700; color:#1A1A1A; line-height:1.1; margin-bottom:8px; }
  .cover-meta { font-family:${sans}; font-size:13px; color:#666; margin-bottom:20px; }
  .cover-badge { display:inline-block; background:#534AB7; color:#fff; font-family:${sans}; font-size:11px; font-weight:600; padding:4px 12px; border-radius:20px; letter-spacing:0.5px; }

  /* SECTION */
  .section { margin-bottom: 36px; page-break-inside: avoid; }
  .section-title { font-family:${serif}; font-size:18px; font-weight:700; color:#1A1A1A; margin-bottom:4px; padding-bottom:6px; border-bottom:1px solid #E0E0E0; }
  .section-sub { font-family:${sans}; font-size:10px; color:#888; letter-spacing:1px; text-transform:uppercase; margin-bottom:16px; }

  /* STATEMENT BOX */
  .statement { background:#F5F3FF; border-left:3px solid #534AB7; padding:14px 16px; border-radius:0 6px 6px 0; font-family:${serif}; font-size:13px; font-style:italic; color:#333; line-height:1.7; margin-bottom:12px; }

  /* CARDS GRID */
  .grid-2 { display:grid; grid-template-columns:1fr 1fr; gap:12px; }
  .card { background:#F9F9F9; border-radius:6px; padding:12px 14px; }
  .card-label { font-family:${sans}; font-size:9px; text-transform:uppercase; letter-spacing:1px; color:#888; margin-bottom:4px; }
  .card-value { font-family:${sans}; font-size:12px; color:#1A1A1A; line-height:1.5; }

  /* TAGS */
  .tags { display:flex; flex-wrap:wrap; gap:6px; margin-top:6px; }
  .tag { font-family:${sans}; font-size:11px; padding:3px 10px; border-radius:12px; }
  .tag-pop { background:#E6F1FB; color:#185FA5; }
  .tag-pod { background:#E1F5EE; color:#0F6E56; }

  /* RISK / REC */
  .risk { background:#FFF3EF; border-left:3px solid #D85A30; padding:12px 14px; border-radius:0 6px 6px 0; font-family:${sans}; font-size:12px; color:#333; line-height:1.6; margin-bottom:10px; }
  .rec { background:#EDFAF4; border-left:3px solid #1D9E75; padding:12px 14px; border-radius:0 6px 6px 0; font-family:${sans}; font-size:12px; color:#333; line-height:1.6; }

  /* NARRATIVE */
  .narrative { font-family:${sans}; font-size:12px; color:#444; line-height:1.75; white-space:pre-wrap; }

  /* FOOTER */
  .footer { margin-top:48px; padding-top:16px; border-top:1px solid #E0E0E0; display:flex; justify-content:space-between; align-items:center; }
  .footer-left { font-family:${serif}; font-size:11px; color:#888; }
  .footer-right { font-family:${sans}; font-size:10px; color:#AAA; letter-spacing:0.5px; }

  /* CBBE Pyramid in print */
  .pyramid { display:flex; flex-direction:column; align-items:center; gap:4px; margin:12px 0; }
  .pyramid-level { border-radius:3px; padding:6px 0; text-align:center; }
  .pyramid-text { font-family:${sans}; font-size:11px; font-weight:600; }
  .pyramid-sub { font-family:${sans}; font-size:9px; opacity:0.8; }
</style>
</head>
<body>
<div class="page">

  <!-- COVER -->
  <div class="cover">
    <div class="cover-label">Brand Strategy Report</div>
    <div class="cover-brand">${data.brand}</div>
    <div class="cover-meta">${data.category} &nbsp;·&nbsp; ${data.lifecycle} stage &nbsp;·&nbsp; ${data.archetype} archetype</div>
    <span class="cover-badge">CBBE Level: ${data.cbbe_label}</span>
  </div>

  <!-- POSITIONING -->
  <div class="section">
    <div class="section-title">Brand Positioning</div>
    <div class="section-sub">Points of Parity &amp; Difference · Positioning Statement</div>
    <div class="grid-2" style="margin-bottom:14px;">
      <div class="card">
        <div class="card-label">Points of Parity</div>
        <div class="tags">${(data.pops||[]).map(p=>`<span class="tag tag-pop">${p}</span>`).join("")}</div>
      </div>
      <div class="card">
        <div class="card-label">Points of Difference</div>
        <div class="tags">${(data.pods||[]).map(p=>`<span class="tag tag-pod">${p}</span>`).join("")}</div>
      </div>
    </div>
    <div class="statement">${data.positioning_statement || "—"}</div>
  </div>

  <!-- JTBD -->
  <div class="section">
    <div class="section-title">Jobs-to-be-Done</div>
    <div class="section-sub">Christensen Framework — Functional · Emotional · Social</div>
    <div class="grid-2">
      <div class="card"><div class="card-label">Functional</div><div class="card-value">${data.jobs?.functional||"—"}</div></div>
      <div class="card"><div class="card-label">Emotional</div><div class="card-value">${data.jobs?.emotional||"—"}</div></div>
    </div>
    <div class="card" style="margin-top:10px;"><div class="card-label">Social</div><div class="card-value">${data.jobs?.social||"—"}</div></div>
  </div>

  <!-- AAKER + CBBE -->
  <div class="section">
    <div class="section-title">Brand Equity</div>
    <div class="section-sub">Aaker's 5 Dimensions · Keller's CBBE Pyramid</div>
    <div class="grid-2">
      <div>
        ${aakers.map(a => barRow(a.label, a.val)).join("")}
        <div style="margin-top:16px;">
          <div class="card-label" style="font-family:${sans};font-size:9px;text-transform:uppercase;letter-spacing:1px;color:#888;margin-bottom:8px;">Byron Sharp — Availability</div>
          ${barRow("Mental Availability", data.mental_availability||0)}
          ${barRow("Physical Availability", data.physical_availability||0)}
        </div>
      </div>
      <div>
        <div class="card-label" style="font-family:${sans};font-size:9px;text-transform:uppercase;letter-spacing:1px;color:#888;margin-bottom:10px;">CBBE Pyramid</div>
        <div class="pyramid">
          ${[{l:4,n:"Resonance",w:"100px"},{l:3,n:"Judgments & Feelings",w:"150px"},{l:2,n:"Performance & Imagery",w:"200px"},{l:1,n:"Salience",w:"250px"}].map(lv=>`
            <div class="pyramid-level" style="width:${lv.w};background:${lv.l===data.cbbe_level?"#534AB7":lv.l<data.cbbe_level?"#AFA9EC":"#EBEBEB"};">
              <div class="pyramid-text" style="color:${lv.l<=data.cbbe_level?"#fff":"#999"};">${lv.n}</div>
            </div>`).join("")}
        </div>
        <div style="text-align:center;font-family:${sans};font-size:10px;color:#534AB7;font-weight:600;margin-top:6px;">Currently at: ${data.cbbe_label}</div>
      </div>
    </div>
  </div>

  <!-- HEALTH FUNNEL -->
  <div class="section">
    <div class="section-title">Brand Health Funnel</div>
    <div class="section-sub">Awareness → Consideration → Preference → Trial → Repeat → Advocacy</div>
    ${funnelStages.map((s,i)=>{
      const val = (data.health_funnel||{})[s]||0;
      const prev = i>0?(data.health_funnel||{})[funnelStages[i-1]]||100:100;
      const drop = prev-val; const isLeak = drop>20&&i>0;
      return barRow(s.charAt(0).toUpperCase()+s.slice(1), val, 100, true) + (isLeak?`<div style="font-family:${sans};font-size:10px;color:#D85A30;margin-top:-6px;margin-bottom:8px;">⚠ Significant leakage: −${drop}pp</div>`:"");
    }).join("")}
  </div>

  <!-- KAPFERER -->
  <div class="section">
    <div class="section-title">Kapferer Identity Prism</div>
    <div class="section-sub">6 Facets of Brand Identity</div>
    <div class="grid-2">
      ${kapfacets.map(f=>`<div class="card"><div class="card-label">${f.replace("_"," ")}</div><div class="card-value">${(data.kapferer||{})[f]||"—"}</div></div>`).join("")}
    </div>
  </div>

  <!-- RISK + REC -->
  <div class="section">
    <div class="section-title">Strategic Outlook</div>
    <div class="section-sub">Top Risk · Recommendation</div>
    <div class="card-label" style="font-family:${sans};font-size:9px;text-transform:uppercase;letter-spacing:1px;color:#D85A30;margin-bottom:6px;">Top Strategic Risk</div>
    <div class="risk">${data.top_risk||"—"}</div>
    <div class="card-label" style="font-family:${sans};font-size:9px;text-transform:uppercase;letter-spacing:1px;color:#1D9E75;margin-bottom:6px;margin-top:14px;">Strategic Recommendation</div>
    <div class="rec">${data.recommendation||"—"}</div>
  </div>

  <!-- NARRATIVE -->
  <div class="section">
    <div class="section-title">Full Analysis</div>
    <div class="section-sub">Strategic Narrative</div>
    <div class="narrative">${narrative.replace(/\*\*([^*]+)\*\*/g,"<strong>$1</strong>").replace(/</g,"&lt;").replace(/&lt;strong>/g,"<strong>").replace(/&lt;\/strong>/g,"</strong>")}</div>
  </div>

  <!-- FOOTER -->
  <div class="footer">
    <div class="footer-left">${data.brand} Brand Strategy Report</div>
    <div class="footer-right">Generated via Brand Strategy Research Board &nbsp;·&nbsp; ${new Date().toLocaleDateString("en-IN",{year:"numeric",month:"long",day:"numeric"})}</div>
  </div>

</div>
<script>window.onload=()=>window.print();</script>
</body>
</html>`;

  // Encode and trigger download via hidden anchor
  const blob = new Blob([html], { type: "text/html;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${(data.brand||"Brand").replace(/\s+/g,"-")}-Strategy-Report.html`;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => { document.body.removeChild(a); URL.revokeObjectURL(url); }, 1000);
}

function BrandDashboard({ data, narrative }) {
  const [tab, setTab] = useState("overview");
  const tabs = [{ id: "overview", label: "Overview" }, { id: "identity", label: "Identity" }, { id: "equity", label: "Equity" }, { id: "market", label: "Market" }];
  return (
    <div style={{ background: "var(--color-background-primary)", border: "0.5px solid var(--color-border-tertiary)", borderRadius: 12, padding: "14px 16px", marginBottom: 12 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
        <div>
          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 500, color: "var(--color-text-primary)" }}>{data.brand}</h3>
          <p style={{ margin: "2px 0 0", fontSize: 12, color: "var(--color-text-secondary)" }}>{data.category} · {data.lifecycle} stage · {data.archetype} archetype</p>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <span style={{ fontSize: 11, padding: "3px 10px", borderRadius: 12, background: "#EEEDFE", color: "#534AB7", fontWeight: 500 }}>{data.cbbe_label}</span>
          <button
            onClick={() => downloadReport(data, narrative)}
            style={{ fontSize: 11, padding: "4px 12px", borderRadius: 16, cursor: "pointer", background: "#1A1A1A", color: "#fff", border: "none", fontWeight: 500, display: "flex", alignItems: "center", gap: 5 }}
          >↓ PDF</button>
        </div>
      </div>
      <div style={{ display: "flex", gap: 6, marginBottom: 14, borderBottom: "0.5px solid var(--color-border-tertiary)", paddingBottom: 10 }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{ fontSize: 12, padding: "4px 12px", borderRadius: 16, border: "none", cursor: "pointer", background: tab===t.id ? "#534AB7" : "var(--color-background-secondary)", color: tab===t.id ? "#fff" : "var(--color-text-secondary)", fontWeight: tab===t.id ? 500 : 400 }}>{t.label}</button>
        ))}
      </div>
      {tab === "overview" && (
        <div style={{ display: "grid", gap: 16 }}>
          <JTBDCard jobs={data.jobs||{}} />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <p style={{ fontSize: 11, fontWeight: 500, color: "var(--color-text-secondary)", textTransform: "uppercase", letterSpacing: 0.5, margin: "0 0 6px" }}>Points of Parity</p>
              <Tags items={data.pops||[]} color="#185FA5" bg="#E6F1FB" />
            </div>
            <div>
              <p style={{ fontSize: 11, fontWeight: 500, color: "var(--color-text-secondary)", textTransform: "uppercase", letterSpacing: 0.5, margin: "0 0 6px" }}>Points of Difference</p>
              <Tags items={data.pods||[]} color="#0F6E56" bg="#E1F5EE" />
            </div>
          </div>
          <div style={{ background: "#EEEDFE", borderRadius: 8, padding: "10px 12px", border: "1px solid #AFA9EC44" }}>
            <p style={{ fontSize: 10, fontWeight: 500, color: "#534AB7", margin: "0 0 4px", textTransform: "uppercase", letterSpacing: 0.3 }}>Positioning Statement</p>
            <p style={{ fontSize: 12, color: "var(--color-text-primary)", margin: 0, lineHeight: 1.5, fontStyle: "italic" }}>{data.positioning_statement}</p>
          </div>
          <div style={{ background: "#FAECE7", borderRadius: 8, padding: "10px 12px", border: "1px solid #D85A3044" }}>
            <p style={{ fontSize: 10, fontWeight: 500, color: "#993C1D", margin: "0 0 4px", textTransform: "uppercase", letterSpacing: 0.3 }}>Top Strategic Risk</p>
            <p style={{ fontSize: 12, color: "var(--color-text-primary)", margin: 0, lineHeight: 1.5 }}>{data.top_risk||"—"}</p>
          </div>
          <div style={{ background: "#E1F5EE", borderRadius: 8, padding: "10px 12px", border: "1px solid #1D9E7544" }}>
            <p style={{ fontSize: 10, fontWeight: 500, color: "#0F6E56", margin: "0 0 4px", textTransform: "uppercase", letterSpacing: 0.3 }}>Strategic Recommendation</p>
            <p style={{ fontSize: 12, color: "var(--color-text-primary)", margin: 0, lineHeight: 1.5 }}>{data.recommendation||"—"}</p>
          </div>
        </div>
      )}
      {tab === "identity" && (
        <div style={{ display: "grid", gap: 16 }}>
          <div>
            <p style={{ fontSize: 11, fontWeight: 500, color: "var(--color-text-secondary)", textTransform: "uppercase", letterSpacing: 0.5, margin: "0 0 8px" }}>Kapferer Identity Prism</p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
              {[
                { key: "physique", label: "Physique", color: "#534AB7", bg: "#EEEDFE" },
                { key: "personality", label: "Personality", color: "#0F6E56", bg: "#E1F5EE" },
                { key: "culture", label: "Culture", color: "#993C1D", bg: "#FAECE7" },
                { key: "relationship", label: "Relationship", color: "#185FA5", bg: "#E6F1FB" },
                { key: "reflection", label: "Reflection", color: "#854F0B", bg: "#FAEEDA" },
                { key: "self_image", label: "Self-Image", color: "#993556", bg: "#FBEAF0" },
              ].map(f => (
                <div key={f.key} style={{ background: f.bg, borderRadius: 8, padding: "8px 10px", border: `1px solid ${f.color}22` }}>
                  <p style={{ fontSize: 10, fontWeight: 500, color: f.color, margin: "0 0 3px", textTransform: "uppercase", letterSpacing: 0.3 }}>{f.label}</p>
                  <p style={{ fontSize: 11, color: "var(--color-text-primary)", margin: 0, lineHeight: 1.4 }}>{(data.kapferer||{})[f.key]||"—"}</p>
                </div>
              ))}
            </div>
          </div>
          <CBBEPyramid level={data.cbbe_level} label={data.cbbe_label} />
        </div>
      )}
      {tab === "equity" && (
        <div style={{ display: "grid", gap: 16 }}>
          <AakerBars aaker={data.aaker||{}} />
          <AvailabilityMeter mental={data.mental_availability||5} physical={data.physical_availability||5} />
        </div>
      )}
      {tab === "market" && (
        <div style={{ display: "grid", gap: 16 }}>
          <HealthFunnel funnel={data.health_funnel||{}} />
          <PositioningMap map={data.positioning_map||{}} brandName={data.brand} />
        </div>
      )}
    </div>
  );
}

function FormattedText({ text }) {
  return (
    <div>
      {text.split("\n").map((line, i) => {
        if (!line.trim()) return <div key={i} style={{ height: 5 }} />;
        if (/^#{1,3}\s/.test(line)) return <p key={i} style={{ fontWeight: 500, fontSize: 14, margin: "8px 0 3px", color: "var(--color-text-primary)" }}>{line.replace(/^#+\s/, "")}</p>;
        if (line.startsWith("- ") || line.startsWith("• ")) return <p key={i} style={{ margin: "2px 0 2px 10px", color: "var(--color-text-secondary)", fontSize: 13 }}>· {renderInline(line.slice(2))}</p>;
        if (/^\d+\./.test(line)) return <p key={i} style={{ margin: "2px 0 2px 10px", color: "var(--color-text-secondary)", fontSize: 13 }}>{renderInline(line)}</p>;
        return <p key={i} style={{ margin: "2px 0", fontSize: 13 }}>{renderInline(line)}</p>;
      })}
    </div>
  );
}

function MsgBubble({ msg }) {
  const isUser = msg.role === "user";
  const rawData = !isUser ? extractJSON(msg.content) : null;
  const narrative = !isUser ? stripJSON(msg.content) : msg.content;
  const data = !isUser ? enrichFromNarrative(rawData, narrative) : null;
  return (
    <div style={{ marginBottom: 18 }}>
      {isUser ? (
        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <div style={{ maxWidth: "80%", background: "#534AB7", color: "#fff", borderRadius: "16px 16px 4px 16px", padding: "10px 14px", fontSize: 14, lineHeight: 1.6 }}>{narrative}</div>
        </div>
      ) : (
        <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
          <div style={{ width: 28, height: 28, borderRadius: "50%", background: "#EEEDFE", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 500, color: "#534AB7", flexShrink: 0, marginTop: 2 }}>B</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            {data && <BrandDashboard data={data} narrative={narrative} />}
            <div style={{ background: "var(--color-background-primary)", border: "0.5px solid var(--color-border-tertiary)", borderRadius: "4px 16px 16px 16px", padding: "12px 14px" }}>
              <FormattedText text={narrative} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function TypingDots() {
  return (
    <div style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 18 }}>
      <div style={{ width: 28, height: 28, borderRadius: "50%", background: "#EEEDFE", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 500, color: "#534AB7", flexShrink: 0 }}>B</div>
      <div style={{ background: "var(--color-background-primary)", border: "0.5px solid var(--color-border-tertiary)", borderRadius: "4px 16px 16px 16px", padding: "12px 16px", display: "flex", gap: 5, alignItems: "center" }}>
        {[0,1,2].map(i => <div key={i} style={{ width: 6, height: 6, borderRadius: "50%", background: "#534AB7", animation: `pulse 1.2s ease-in-out ${i*0.2}s infinite` }} />)}
      </div>
    </div>
  );
}

// ── App ───────────────────────────────────────────────────────────────────────
export default function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeBrand, setActiveBrand] = useState(null);
  const [view, setView] = useState("home");
  const [activeCard, setActiveCard] = useState(null);
  const bottomRef = useRef(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, loading]);

  async function sendMessage(text) {
    if (!text.trim() || loading) return;
    const userMsg = { role: "user", content: text };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setLoading(true);
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model: "claude-sonnet-4-6", max_tokens: 2500, system: SYSTEM_PROMPT, messages: newMessages }),
      });
      const data = await res.json();
      if (data.error) {
        setMessages(prev => [...prev, { role: "assistant", content: `API Error: ${data.error.type} — ${data.error.message}` }]);
        setLoading(false);
        return;
      }
      const reply = data.content?.find(b => b.type === "text")?.text;
      if (!reply) {
        setMessages(prev => [...prev, { role: "assistant", content: `Unexpected response: ${JSON.stringify(data).slice(0, 200)}` }]);
        setLoading(false);
        return;
      }
      setMessages(prev => [...prev, { role: "assistant", content: reply }]);
    } catch {
      setMessages(prev => [...prev, { role: "assistant", content: "Connection error. Please try again." }]);
    }
    setLoading(false);
  }

  function startBrand(brand) {
    setActiveBrand(brand);
    setMessages([]);
    setView("chat");
    setTimeout(() => sendMessage(`Do a full brand strategy analysis of ${brand}`), 100);
  }

  return (
    <div style={{ fontFamily: "var(--font-sans)", width: "100%", maxWidth: 780, margin: "0 auto" }}>
      <style>{`@keyframes pulse{0%,100%{opacity:0.2}50%{opacity:0.9}}`}</style>

      {/* ── HOME ── */}
      {view === "home" && (
        <div style={{ padding: "1rem 0" }}>
          <h2 style={{ fontSize: 22, fontWeight: 500, margin: "0 0 4px", color: "var(--color-text-primary)" }}>Brand Strategy Research Board</h2>
          <p style={{ fontSize: 14, color: "var(--color-text-secondary)", margin: "0 0 24px" }}>Type any brand — get a visual strategic breakdown across 12 frameworks, then go deeper.</p>
          <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
            <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => { if (e.key === "Enter" && input.trim()) startBrand(input.trim()); }} placeholder="Type a brand name (e.g. Nykaa, Zepto, Airbnb)..." style={{ flex: 1, fontSize: 14 }} />
            <button onClick={() => input.trim() && startBrand(input.trim())} disabled={!input.trim()} style={{ padding: "0 20px", borderRadius: 8, background: "#534AB7", color: "#fff", border: "none", cursor: input.trim() ? "pointer" : "not-allowed", opacity: input.trim() ? 1 : 0.45, fontWeight: 500, fontSize: 14 }}>Analyse ↗</button>
          </div>
          <p style={{ fontSize: 11, fontWeight: 500, color: "var(--color-text-secondary)", margin: "0 0 10px", textTransform: "uppercase", letterSpacing: 0.5 }}>Quick picks</p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 7, marginBottom: 28 }}>
            {SUGGESTED_BRANDS.map(b => <button key={b} onClick={() => startBrand(b)} style={{ padding: "6px 14px", borderRadius: 20, border: "0.5px solid var(--color-border-tertiary)", background: "var(--color-background-primary)", cursor: "pointer", fontSize: 13, color: "var(--color-text-primary)" }}>{b}</button>)}
          </div>
          <div style={{ borderTop: "0.5px solid var(--color-border-tertiary)", paddingTop: 18 }}>
            <p style={{ fontSize: 11, fontWeight: 500, color: "var(--color-text-secondary)", margin: "0 0 12px", textTransform: "uppercase", letterSpacing: 0.5 }}>What you get — click any to learn more</p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 8 }}>
              {FRAMEWORK_ITEMS.map(item => (
                <FrameworkCard key={item.title} item={item} activeCard={activeCard} setActiveCard={setActiveCard} />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── CHAT ── */}
      {view === "chat" && (
        <div style={{ display: "flex", flexDirection: "column", height: "92vh", padding: "0.75rem 0 0" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12, paddingBottom: 12, borderBottom: "0.5px solid var(--color-border-tertiary)", flexShrink: 0 }}>
            <button onClick={() => { setView("home"); setMessages([]); setInput(""); }} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--color-text-secondary)", fontSize: 18, lineHeight: 1 }}>←</button>
            <div style={{ width: 32, height: 32, borderRadius: "50%", background: "#EEEDFE", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 500, color: "#534AB7", flexShrink: 0 }}>{activeBrand?.[0]?.toUpperCase() || "B"}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ margin: 0, fontWeight: 500, fontSize: 14, color: "var(--color-text-primary)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{activeBrand || "Brand Research"}</p>
              <p style={{ margin: 0, fontSize: 11, color: "var(--color-text-secondary)" }}>12-framework analysis · SP Jain + Sharp + Holt</p>
            </div>
            <button onClick={() => { setMessages([]); setTimeout(() => sendMessage(`Do a full brand strategy analysis of ${activeBrand}`), 100); }} style={{ flexShrink: 0, fontSize: 11, padding: "4px 10px", borderRadius: 16, cursor: "pointer", color: "var(--color-text-secondary)", border: "0.5px solid var(--color-border-tertiary)", background: "none", whiteSpace: "nowrap" }}>Refresh ↺</button>
          </div>

          <div style={{ flex: 1, overflowY: "auto", paddingRight: 2 }}>
            {messages.map((m, i) => <MsgBubble key={i} msg={m} />)}
            {loading && <TypingDots />}
            <div ref={bottomRef} />
          </div>

          {messages.length > 1 && !loading && (
            <div style={{ display: "flex", gap: 5, flexWrap: "wrap", padding: "8px 0 5px", flexShrink: 0 }}>
              {QUICK_PROMPTS.map((p, i) => (
                <button key={i} onClick={() => sendMessage(p)} style={{ fontSize: 11, padding: "4px 10px", borderRadius: 16, cursor: "pointer", color: "#534AB7", border: "0.5px solid #AFA9EC", background: "#EEEDFE" }}>{p}</button>
              ))}
            </div>
          )}

          <div style={{ display: "flex", gap: 8, padding: "8px 0 4px", borderTop: "0.5px solid var(--color-border-tertiary)", marginTop: 4, flexShrink: 0 }}>
            <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(input); } }} placeholder={`Ask anything about ${activeBrand || "this brand"}...`} style={{ flex: 1, fontSize: 14 }} disabled={loading} />
            <button onClick={() => sendMessage(input)} disabled={loading || !input.trim()} style={{ padding: "0 16px", borderRadius: 8, background: "#534AB7", color: "#fff", border: "none", cursor: loading || !input.trim() ? "not-allowed" : "pointer", opacity: loading || !input.trim() ? 0.5 : 1, fontWeight: 500, fontSize: 14 }}>Send</button>
          </div>
        </div>
      )}
    </div>
  );
}
