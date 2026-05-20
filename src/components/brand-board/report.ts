import type { BrandData } from "./utils";
import { toArray } from "./utils";

export function downloadReport(data: BrandData, narrative: string) {
  const sans = "-apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif";
  const purple = "#534AB7";
  const green = "#1D9E75";
  const orange = "#D85A30";
  const blue = "#185FA5";

  /* ── helpers ── */
  const esc = (s: unknown) => String(s ?? "—").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");

  const barRow = (label: string, val: number, max = 10, isPercent = false) => {
    const pct = isPercent ? val : (val / max) * 100;
    const col = val >= (isPercent ? 70 : 7) ? green : val >= (isPercent ? 50 : 5) ? purple : orange;
    return `<div style="margin-bottom:10px;">
      <div style="display:flex;justify-content:space-between;margin-bottom:4px;">
        <span style="font-size:12px;color:#444;">${esc(label)}</span>
        <span style="font-size:12px;font-weight:700;color:${col};">${isPercent ? val + "%" : val + "/10"}</span>
      </div>
      <div style="height:7px;background:#EBEBEB;border-radius:4px;overflow:hidden;">
        <div style="height:100%;width:${Math.min(pct,100)}%;background:${col};border-radius:4px;"></div>
      </div>
    </div>`;
  };

  const chip = (text: string, bg: string, color: string) =>
    `<span style="display:inline-block;background:${bg};color:${color};font-size:11px;padding:3px 10px;border-radius:12px;margin:3px 3px 3px 0;">${esc(text)}</span>`;

  const card = (label: string, value: string, accent = "") =>
    `<div style="background:#F9F9F9;border-radius:8px;padding:12px 14px;${accent ? `border-left:3px solid ${accent};` : ""}">
      <div style="font-size:9px;text-transform:uppercase;letter-spacing:1px;color:#888;margin-bottom:5px;">${esc(label)}</div>
      <div style="font-size:12px;color:#1A1A1A;line-height:1.6;">${esc(value)}</div>
    </div>`;

  const sectionHead = (title: string, sub = "") =>
    `<div style="margin-bottom:4px;">
      <div style="font-size:17px;font-weight:700;color:#1A1A1A;padding-bottom:6px;border-bottom:2px solid #E8E8E8;">${esc(title)}</div>
      ${sub ? `<div style="font-size:10px;color:#999;letter-spacing:1px;text-transform:uppercase;margin-top:4px;">${esc(sub)}</div>` : ""}
    </div>`;

  /* ── SVG Radar Chart (Aaker 5-dim) ── */
  const radarChart = () => {
    const dims = [
      { key: "awareness", label: "Awareness" },
      { key: "loyalty", label: "Loyalty" },
      { key: "quality", label: "Quality" },
      { key: "associations", label: "Associations" },
      { key: "assets", label: "Assets" },
    ];
    const aaker = (data.aaker || {}) as Record<string, number>;
    const cx = 130, cy = 130, r = 85;
    const n = dims.length;
    const angle = (i: number) => (Math.PI * 2 * i) / n - Math.PI / 2;
    const pt = (i: number, radius: number) => {
      const a = angle(i);
      return [cx + radius * Math.cos(a), cy + radius * Math.sin(a)];
    };
    // grid circles
    const grid = [0.25, 0.5, 0.75, 1].map(f =>
      `<polygon points="${dims.map((_,i) => pt(i, r*f).join(",")).join(" ")}" fill="none" stroke="#E8E8E8" stroke-width="1"/>`
    ).join("");
    // axes
    const axes = dims.map((_, i) => {
      const [x, y] = pt(i, r);
      return `<line x1="${cx}" y1="${cy}" x2="${x}" y2="${y}" stroke="#E0E0E0" stroke-width="1"/>`;
    }).join("");
    // data polygon
    const vals = dims.map(d => (aaker[d.key] || 0) / 10);
    const poly = `<polygon points="${vals.map((v,i) => pt(i, r*v).join(",")).join(" ")}" fill="${purple}33" stroke="${purple}" stroke-width="2"/>`;
    // dots
    const dots = vals.map((v, i) => {
      const [x, y] = pt(i, r * v);
      return `<circle cx="${x}" cy="${y}" r="4" fill="${purple}"/>`;
    }).join("");
    // labels
    const labels = dims.map((d, i) => {
      const [x, y] = pt(i, r + 22);
      const val = aaker[d.key] || 0;
      return `<text x="${x}" y="${y}" text-anchor="middle" dominant-baseline="middle" font-size="10" fill="#555" font-family="${sans}">${d.label}</text>
              <text x="${x}" y="${y + 13}" text-anchor="middle" font-size="10" font-weight="700" fill="${purple}" font-family="${sans}">${val}/10</text>`;
    }).join("");
    return `<svg width="260" height="260" viewBox="0 0 260 260">
      ${grid}${axes}${poly}${dots}${labels}
    </svg>`;
  };

  /* ── SVG Funnel ── */
  const funnelChart = () => {
    const stages = ["awareness","consideration","preference","purchase","loyalty"];
    const hf = (data.health_funnel || {}) as Record<string, number>;
    const colors = [purple, "#6C63E0", blue, green, "#0F6E56"];
    const rows = stages.map((s, i) => {
      const val = hf[s] || 0;
      const prev = i > 0 ? hf[stages[i-1]] || 100 : 100;
      const drop = prev - val;
      const label = s.charAt(0).toUpperCase() + s.slice(1);
      return `
        <div style="display:flex;align-items:center;gap:10px;margin-bottom:8px;">
          <div style="width:90px;font-size:11px;color:#555;text-align:right;">${label}</div>
          <div style="position:relative;flex:1;height:28px;background:#F0F0F0;border-radius:4px;overflow:hidden;">
            <div style="height:100%;width:${Math.round(val)}%;background:${colors[i]};border-radius:4px;display:flex;align-items:center;padding-left:8px;">
              <span style="font-size:11px;font-weight:700;color:#fff;">${val}%</span>
            </div>
          </div>
          ${drop > 15 && i > 0 ? `<div style="font-size:10px;color:${orange};width:60px;">−${drop}pp ⚠</div>` : `<div style="width:60px;"></div>`}
        </div>`;
    });
    return rows.join("");
  };

  /* ── CBBE Pyramid ── */
  const cbbePyramid = () => {
    const levels = [
      { l: 4, n: "Resonance", w: 120 },
      { l: 3, n: "Judgements & Feelings", w: 180 },
      { l: 2, n: "Performance & Imagery", w: 230 },
      { l: 1, n: "Salience", w: 280 },
    ];
    // Map cbbe_level (1-10) to pyramid tier (1-4)
    const tier = (data.cbbe_level || 0) >= 8 ? 4 : (data.cbbe_level || 0) >= 6 ? 3 : (data.cbbe_level || 0) >= 4 ? 2 : 1;
    return `<div style="display:flex;flex-direction:column;align-items:center;gap:5px;padding:10px 0;">
      ${levels.map(lv => {
        const active = lv.l === tier;
        const below = lv.l < tier;
        const bg = active ? purple : below ? "#AFA9EC" : "#EBEBEB";
        const color = (active || below) ? "#fff" : "#999";
        return `<div style="width:${lv.w}px;padding:8px 0;text-align:center;border-radius:4px;background:${bg};">
          <span style="font-size:11px;font-weight:600;color:${color};">${lv.n}</span>
        </div>`;
      }).join("")}
      <div style="font-size:11px;font-weight:700;color:${purple};margin-top:6px;">${esc(data.cbbe_label)} (Level ${data.cbbe_level}/10)</div>
    </div>`;
  };

  /* ── Positioning Map SVG ── */
  const positioningMap = () => {
    const pm = data.positioning_map;
    if (!pm) return "";
    const w = 380, h = 300, pad = 50, innerW = w - pad * 2, innerH = h - pad * 2;
    const allPoints = [{ x: pm.brand_x ?? 0.5, y: pm.brand_y ?? 0.5 }, ...((pm.competitors || []) as { name: string; x: number; y: number }[])];
    const minX = Math.min(...allPoints.map(p => p.x));
    const maxX = Math.max(...allPoints.map(p => p.x));
    const minY = Math.min(...allPoints.map(p => p.y));
    const maxY = Math.max(...allPoints.map(p => p.y));
    const rangeX = maxX - minX || 1;
    const rangeY = maxY - minY || 1;
    const norm = (v: number, min: number, range: number) => 0.15 + ((v - min) / range) * 0.7;
    const toX = (v: number) => pad + norm(v, minX, rangeX) * innerW;
    const toY = (v: number) => h - pad - norm(v, minY, rangeY) * innerH;
    const parseAxis = (str?: string) => {
      if (!str) return ["Low", "High"];
      const parts = str.split(/←|→|↔|<->|->/);
      const clean = parts.map((s) => s.trim()).filter(Boolean);
      return [clean[0] || "Low", clean[clean.length - 1] || "High"];
    };
    const [xLeft, xRight] = parseAxis(pm.x_axis);
    const [yBottom, yTop] = parseAxis(pm.y_axis);
    const midX = w / 2, midY = h / 2;
    const bx = toX(pm.brand_x ?? 0.5);
    const by = toY(pm.brand_y ?? 0.5);
    const competitors = (pm.competitors || []) as { name: string; x: number; y: number }[];
    const compDots = competitors.map(c => {
      const cx2 = toX(c.x ?? 0.5);
      const cy2 = toY(c.y ?? 0.5);
      return `<circle cx="${cx2}" cy="${cy2}" r="5" fill="#AAAAAA"/>
              <text x="${cx2+8}" y="${cy2+4}" font-size="9" fill="#666" font-family="${sans}">${esc(c.name)}</text>`;
    }).join("");
    return `<svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" style="background:#FAFAFA;">
      <rect x="0.5" y="0.5" width="${w-1}" height="${h-1}" rx="8" fill="none" stroke="#E8E8E8" stroke-width="1"/>
      <rect x="${pad}" y="${pad}" width="${innerW/2}" height="${innerH/2}" fill="${purple}" opacity="0.04" rx="1"/>
      <rect x="${midX}" y="${pad}" width="${innerW/2}" height="${innerH/2}" fill="${green}" opacity="0.04" rx="1"/>
      <rect x="${pad}" y="${midY}" width="${innerW/2}" height="${innerH/2}" fill="#f59e0b" opacity="0.04" rx="1"/>
      <rect x="${midX}" y="${midY}" width="${innerW/2}" height="${innerH/2}" fill="${blue}" opacity="0.04" rx="1"/>
      <line x1="${midX}" y1="${pad}" x2="${midX}" y2="${h-pad}" stroke="#E0E0E0" stroke-width="1"/>
      <line x1="${pad}" y1="${midY}" x2="${w-pad}" y2="${midY}" stroke="#E0E0E0" stroke-width="1"/>
      <text x="${w-pad-4}" y="${midY-6}" font-size="9" fill="#999" text-anchor="end" font-family="${sans}">${esc(xRight)}</text>
      <text x="${pad+4}" y="${midY-6}" font-size="9" fill="#999" font-family="${sans}">${esc(xLeft)}</text>
      <text x="${midX}" y="${pad+12}" font-size="9" fill="#999" text-anchor="middle" font-family="${sans}">${esc(yTop)}</text>
      <text x="${midX}" y="${h-pad-4}" font-size="9" fill="#999" text-anchor="middle" font-family="${sans}">${esc(yBottom)}</text>
      ${compDots}
      <circle cx="${bx}" cy="${by}" r="9" fill="${purple}"/>
      <text x="${Math.min(bx+12, w-pad-20)}" y="${Math.min(Math.max(by+4, pad+14), h-pad-8)}" font-size="10" font-weight="700" fill="${purple}" font-family="${sans}">${esc(data.brand)}</text>
    </svg>`;
  };

  /* ── Narrative section extractor ── */
  const NARR_SECS = ["Brand Snapshot","Category & Competition","Jobs-to-be-Done","Identity","Positioning","Equity","Brand Equity Level","Mental & Physical Availability","Brand Health Funnel","Cultural Angle","Competitive Landscape","Audience Profile","Strategy Roadmap","Blindspots & Risk","Recommendation"];
  const extractSection = (title: string) => {
    const esc2 = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const boundary = NARR_SECS.map(esc2).join("|");
    const pat = new RegExp("(?:^|\n)\\*{0,2}" + esc2(title) + "\\*{0,2}[:\\s*]+(.+?)(?=\n\\*{0,2}(?:" + boundary + ")\\*{0,2}[:\\s]|$)", "is");
    const m = narrative.match(pat);
    return m ? m[1].replace(/\*+/g, "").trim() : "";
  };

  /* ── HTML ── */
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>${esc(data.brand)} — Brand Strategy Report</title>
<style>
  * { margin:0; padding:0; box-sizing:border-box; }
  body { font-family:${sans}; color:#1A1A1A; background:#fff; font-size:13px; }
  @page { size:A4; margin:15mm 14mm; }
  @media print {
    body { -webkit-print-color-adjust:exact; print-color-adjust:exact; }
    .no-break { page-break-inside:avoid; }
    .page-break { page-break-before:always; }
  }
  .page { max-width:780px; margin:0 auto; padding:40px 36px; }
  .grid2 { display:grid; grid-template-columns:1fr 1fr; gap:12px; }
  .grid3 { display:grid; grid-template-columns:1fr 1fr 1fr; gap:10px; }
  .section { margin-bottom:32px; }
  .no-break { page-break-inside:avoid; }
  a { color:${purple}; }
</style>
</head>
<body>
<div class="page">

  <!-- COVER -->
  <div class="no-break" style="border-bottom:3px solid ${purple};padding-bottom:28px;margin-bottom:36px;">
    <div style="font-size:10px;letter-spacing:2.5px;text-transform:uppercase;color:#999;margin-bottom:10px;">Brand Strategy Report · Marcus</div>
    <div style="font-size:42px;font-weight:800;color:#1A1A1A;line-height:1.05;margin-bottom:8px;">${esc(data.brand)}</div>
    <div style="font-size:14px;color:#666;margin-bottom:18px;">${esc(data.category)} &nbsp;·&nbsp; ${esc(data.lifecycle)} stage &nbsp;·&nbsp; ${esc(data.archetype)} archetype</div>
    <div style="display:flex;gap:8px;flex-wrap:wrap;">
      <span style="background:${purple};color:#fff;font-size:11px;font-weight:600;padding:5px 14px;border-radius:20px;">Equity: ${esc(data.cbbe_label)}</span>
      <span style="background:#F0F0F0;color:#444;font-size:11px;font-weight:600;padding:5px 14px;border-radius:20px;">Mental Availability: ${data.mental_availability}/10</span>
      <span style="background:#F0F0F0;color:#444;font-size:11px;font-weight:600;padding:5px 14px;border-radius:20px;">Physical Availability: ${data.physical_availability}/10</span>
    </div>
  </div>

  <!-- POSITIONING -->
  <div class="section no-break">
    ${sectionHead("Brand Positioning", "Points of Parity & Difference · Positioning Statement")}
    <div class="grid2" style="margin:14px 0 12px;">
      <div style="background:#EBF3FC;border-radius:8px;padding:12px 14px;">
        <div style="font-size:9px;text-transform:uppercase;letter-spacing:1px;color:#185FA5;margin-bottom:8px;">Points of Parity</div>
        <div>${toArray(data.pops).map((p: unknown) => chip(String(p),"#D6EAFB","#185FA5")).join("")}</div>
      </div>
      <div style="background:#E9F8F2;border-radius:8px;padding:12px 14px;">
        <div style="font-size:9px;text-transform:uppercase;letter-spacing:1px;color:#0F6E56;margin-bottom:8px;">Points of Difference</div>
        <div>${toArray(data.pods).map((p: unknown) => chip(String(p),"#C6F0E1","#0F6E56")).join("")}</div>
      </div>
    </div>
    <div style="background:#F5F3FF;border-left:3px solid ${purple};padding:14px 16px;border-radius:0 8px 8px 0;font-size:13px;font-style:italic;color:#333;line-height:1.7;">${esc(data.positioning_statement)}</div>
    ${extractSection("Positioning") ? `<div style="margin-top:10px;font-size:12px;color:#555;line-height:1.7;">${esc(extractSection("Positioning"))}</div>` : ""}
  </div>

  <!-- PURPOSE + AUDIENCE -->
  ${data.purpose ? `
  <div class="section no-break">
    ${sectionHead("Brand Purpose & Audience")}
    <div style="background:#F5F3FF;border-left:3px solid ${purple};padding:12px 16px;border-radius:0 8px 8px 0;font-size:13px;color:#333;line-height:1.7;margin:14px 0 12px;">${esc(data.purpose)}</div>
    ${data.audience?.primary ? `<div class="grid2">
      ${card("Primary Audience", data.audience.primary, purple)}
      ${card("Secondary Audience", data.audience.secondary || "—", blue)}
    </div>` : ""}
  </div>` : ""}

  <!-- JOBS TO BE DONE -->
  <div class="section no-break">
    ${sectionHead("Jobs-to-be-Done", "Functional · Emotional · Social")}
    <div class="grid3" style="margin-top:14px;">
      ${card("Functional", data.jobs?.functional || "—", green)}
      ${card("Emotional", data.jobs?.emotional || "—", purple)}
      ${card("Social", data.jobs?.social || "—", blue)}
    </div>
    ${extractSection("Jobs") ? `<div style="margin-top:10px;font-size:12px;color:#555;line-height:1.7;">${esc(extractSection("Jobs"))}</div>` : ""}
  </div>

  <!-- BRAND EQUITY -->
  <div class="section no-break page-break">
    ${sectionHead("Brand Equity", "Aaker's 5 Dimensions · CBBE Pyramid")}
    <div class="grid2" style="margin-top:14px;align-items:start;">
      <div>
        <div style="font-size:10px;text-transform:uppercase;letter-spacing:1px;color:#888;margin-bottom:12px;">Aaker Brand Equity Dimensions</div>
        ${radarChart()}
      </div>
      <div>
        <div style="font-size:10px;text-transform:uppercase;letter-spacing:1px;color:#888;margin-bottom:12px;">CBBE Pyramid Level</div>
        ${cbbePyramid()}
        <div style="margin-top:16px;">
          ${[
            {k:"awareness",l:"Brand Awareness"},
            {k:"loyalty",l:"Brand Loyalty"},
            {k:"quality",l:"Perceived Quality"},
            {k:"associations",l:"Associations"},
            {k:"assets",l:"Proprietary Assets"},
          ].map(({k,l}) => barRow(l, ((data.aaker||{}) as Record<string,number>)[k]||0)).join("")}
        </div>
      </div>
    </div>
    ${extractSection("Equity") ? `<div style="margin-top:10px;font-size:12px;color:#555;line-height:1.7;">${esc(extractSection("Equity"))}</div>` : ""}
  </div>

  <!-- BRAND HEALTH FUNNEL -->
  <div class="section no-break">
    ${sectionHead("Brand Health Funnel", "Awareness → Loyalty conversion")}
    <div style="margin-top:14px;">
      ${funnelChart()}
    </div>
    <div class="grid2" style="margin-top:12px;">
      ${card("Mental Availability", `${data.mental_availability}/10`, purple)}
      ${card("Physical Availability", `${data.physical_availability}/10`, blue)}
    </div>
    ${extractSection("Brand Health Funnel") ? `<div style="margin-top:10px;font-size:12px;color:#555;line-height:1.7;">${esc(extractSection("Brand Health Funnel"))}</div>` : ""}
  </div>

  <!-- IDENTITY PRISM -->
  <div class="section no-break">
    ${sectionHead("Brand Identity Prism", "Kapferer's 6 Facets")}
    <div class="grid2" style="margin-top:14px;">
      ${["physique","personality","culture","relationship","reflection","self_image"].map(f => {
        const label = f === "self_image" ? "Self-Image" : f.charAt(0).toUpperCase() + f.slice(1).replace("_"," ");
        return card(label, ((data.kapferer||{}) as Record<string,string>)[f] || "—");
      }).join("")}
    </div>
    ${extractSection("Identity") ? `<div style="margin-top:10px;font-size:12px;color:#555;line-height:1.7;">${esc(extractSection("Identity"))}</div>` : ""}
  </div>

  <!-- POSITIONING MAP -->
  ${data.positioning_map ? `
  <div class="section no-break page-break">
    ${sectionHead("Competitive Positioning Map")}
    <div style="margin-top:14px;display:flex;justify-content:center;">
      ${positioningMap()}
    </div>
  </div>` : ""}

  <!-- SWOT -->
  ${data.swot?.strengths?.length ? `
  <div class="section no-break">
    ${sectionHead("SWOT Analysis")}
    <div class="grid2" style="margin-top:14px;">
      <div style="background:#E9F8F2;border-radius:8px;padding:12px 14px;">
        <div style="font-size:9px;text-transform:uppercase;letter-spacing:1px;color:${green};margin-bottom:8px;">Strengths</div>
        ${(data.swot.strengths||[]).map((s: string) => `<div style="font-size:12px;color:#1A1A1A;margin-bottom:4px;">✓ ${esc(s)}</div>`).join("")}
      </div>
      <div style="background:#FFF3EF;border-radius:8px;padding:12px 14px;">
        <div style="font-size:9px;text-transform:uppercase;letter-spacing:1px;color:${orange};margin-bottom:8px;">Weaknesses</div>
        ${(data.swot.weaknesses||[]).map((w: string) => `<div style="font-size:12px;color:#1A1A1A;margin-bottom:4px;">✗ ${esc(w)}</div>`).join("")}
      </div>
      <div style="background:#EBF3FC;border-radius:8px;padding:12px 14px;">
        <div style="font-size:9px;text-transform:uppercase;letter-spacing:1px;color:${blue};margin-bottom:8px;">Opportunities</div>
        ${(data.swot.opportunities||[]).map((o: string) => `<div style="font-size:12px;color:#1A1A1A;margin-bottom:4px;">→ ${esc(o)}</div>`).join("")}
      </div>
      <div style="background:#FFF8EF;border-radius:8px;padding:12px 14px;">
        <div style="font-size:9px;text-transform:uppercase;letter-spacing:1px;color:#B45309;margin-bottom:8px;">Threats</div>
        ${(data.swot.threats||[]).map((t: string) => `<div style="font-size:12px;color:#1A1A1A;margin-bottom:4px;">⚠ ${esc(t)}</div>`).join("")}
      </div>
    </div>
  </div>` : ""}

  <!-- COMPETITIVE MATRIX -->
  ${Array.isArray(data.competitive_matrix) && data.competitive_matrix.length ? `
  <div class="section no-break">
    ${sectionHead("Competitive Landscape", "Market share · Positioning · Strengths & Weaknesses")}
    <div style="margin-top:14px;overflow-x:auto;">
      <table style="width:100%;border-collapse:collapse;font-size:12px;">
        <thead>
          <tr style="background:#F3F3F3;">
            <th style="padding:8px 10px;text-align:left;font-size:10px;text-transform:uppercase;letter-spacing:0.5px;color:#666;border-bottom:2px solid #E0E0E0;">Brand</th>
            <th style="padding:8px 10px;text-align:left;font-size:10px;text-transform:uppercase;letter-spacing:0.5px;color:#666;border-bottom:2px solid #E0E0E0;">Share</th>
            <th style="padding:8px 10px;text-align:left;font-size:10px;text-transform:uppercase;letter-spacing:0.5px;color:#666;border-bottom:2px solid #E0E0E0;">Positioning</th>
            <th style="padding:8px 10px;text-align:left;font-size:10px;text-transform:uppercase;letter-spacing:0.5px;color:#666;border-bottom:2px solid #E0E0E0;">Strength</th>
            <th style="padding:8px 10px;text-align:left;font-size:10px;text-transform:uppercase;letter-spacing:0.5px;color:#666;border-bottom:2px solid #E0E0E0;">Weakness</th>
          </tr>
        </thead>
        <tbody>
          ${(data.competitive_matrix as { name: string; share: string; positioning: string; strength: string; weakness: string }[]).map((c, i) =>
            `<tr style="background:${i%2===0?"#fff":"#FAFAFA"};">
              <td style="padding:8px 10px;font-weight:600;color:${purple};border-bottom:1px solid #F0F0F0;">${esc(c.name)}</td>
              <td style="padding:8px 10px;border-bottom:1px solid #F0F0F0;">${esc(c.share)}</td>
              <td style="padding:8px 10px;border-bottom:1px solid #F0F0F0;">${esc(c.positioning)}</td>
              <td style="padding:8px 10px;color:${green};border-bottom:1px solid #F0F0F0;">${esc(c.strength)}</td>
              <td style="padding:8px 10px;color:${orange};border-bottom:1px solid #F0F0F0;">${esc(c.weakness)}</td>
            </tr>`
          ).join("")}
        </tbody>
      </table>
    </div>
    ${extractSection("Competitive") ? `<div style="margin-top:10px;font-size:12px;color:#555;line-height:1.7;">${esc(extractSection("Competitive"))}</div>` : ""}
  </div>` : ""}

  <!-- STRATEGY -->
  <div class="section no-break page-break">
    ${sectionHead("Strategy Roadmap", "Priorities · Quick Wins · Long-Term Bets")}
    <div style="margin-top:14px;">
      ${toArray(data.strategic_priorities).map((p: unknown, i: number) =>
        `<div style="display:flex;gap:10px;align-items:flex-start;margin-bottom:8px;">
          <div style="min-width:22px;height:22px;background:${purple};color:#fff;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;">${i+1}</div>
          <div style="font-size:12px;color:#1A1A1A;line-height:1.6;padding-top:2px;">${esc(String(p))}</div>
        </div>`
      ).join("")}
    </div>
    <div class="grid2" style="margin-top:14px;">
      <div style="background:#E9F8F2;border-radius:8px;padding:12px 14px;">
        <div style="font-size:9px;text-transform:uppercase;letter-spacing:1px;color:${green};margin-bottom:8px;">Quick Wins</div>
        ${toArray(data.quick_wins).map((w: unknown) => `<div style="font-size:12px;color:#1A1A1A;margin-bottom:5px;">→ ${esc(String(w))}</div>`).join("")}
      </div>
      <div style="background:#EBF3FC;border-radius:8px;padding:12px 14px;">
        <div style="font-size:9px;text-transform:uppercase;letter-spacing:1px;color:${blue};margin-bottom:8px;">Long-Term Bets</div>
        ${toArray(data.long_term_bets).map((b: unknown) => `<div style="font-size:12px;color:#1A1A1A;margin-bottom:5px;">◆ ${esc(String(b))}</div>`).join("")}
      </div>
    </div>
    ${data.activation_roadmap ? `
    <div style="margin-top:12px;background:#F5F3FF;border-left:3px solid ${purple};padding:12px 16px;border-radius:0 8px 8px 0;font-size:12px;color:#333;line-height:1.7;">
      <div style="font-size:9px;text-transform:uppercase;letter-spacing:1px;color:${purple};margin-bottom:6px;">Activation Roadmap</div>
      ${esc(data.activation_roadmap)}
    </div>` : ""}
    ${extractSection("Strategy") ? `<div style="margin-top:10px;font-size:12px;color:#555;line-height:1.7;">${esc(extractSection("Strategy"))}</div>` : ""}
  </div>

  <!-- AUDIENCE PERSONA + JOURNEY -->
  ${data.persona?.name ? `
  <div class="section no-break">
    ${sectionHead("Audience Persona & Customer Journey")}
    <div style="margin-top:14px;background:#F9F9F9;border-radius:8px;padding:14px;margin-bottom:12px;">
      <div style="font-size:15px;font-weight:700;color:${purple};margin-bottom:10px;">${esc(data.persona.name)}</div>
      <div class="grid2">
        ${card("Demographics", data.persona.demographics)}
        ${card("Psychographics", data.persona.psychographics)}
        ${card("Goals", data.persona.goals, green)}
        ${card("Pain Points", data.persona.pain_points, orange)}
      </div>
    </div>
    ${Array.isArray(data.customer_journey) && data.customer_journey.length ? `
    <div style="margin-top:4px;">
      <div style="font-size:10px;text-transform:uppercase;letter-spacing:1px;color:#888;margin-bottom:10px;">Customer Journey</div>
      <div style="display:flex;gap:0;overflow:hidden;border-radius:8px;">
        ${(data.customer_journey as { stage: string; description: string; brand_opportunity: string }[]).map((j, i) => {
          const colors2 = [purple,"#6C63E0",blue,green,"#0F6E56"];
          const col2 = colors2[i % colors2.length];
          return `<div style="flex:1;background:${col2}18;border-right:1px solid #fff;padding:10px 8px;">
            <div style="font-size:10px;font-weight:700;color:${col2};margin-bottom:4px;">${esc(j.stage)}</div>
            <div style="font-size:10px;color:#444;line-height:1.5;margin-bottom:6px;">${esc(j.description)}</div>
            ${j.brand_opportunity ? `<div style="font-size:9px;color:${col2};font-style:italic;">${esc(j.brand_opportunity)}</div>` : ""}
          </div>`;
        }).join("")}
      </div>
    </div>` : ""}
    ${extractSection("Audience") ? `<div style="margin-top:10px;font-size:12px;color:#555;line-height:1.7;">${esc(extractSection("Audience"))}</div>` : ""}
  </div>` : ""}

  <!-- VOICE & TONE -->
  ${data.voice_tone?.voice ? `
  <div class="section no-break">
    ${sectionHead("Voice & Tone")}
    <div class="grid2" style="margin-top:14px;margin-bottom:12px;">
      ${card("Voice", data.voice_tone.voice, purple)}
      ${card("Tone", data.voice_tone.tone, blue)}
    </div>
    <div class="grid2">
      <div style="background:#E9F8F2;border-radius:8px;padding:12px 14px;">
        <div style="font-size:9px;text-transform:uppercase;letter-spacing:1px;color:${green};margin-bottom:8px;">Do</div>
        ${(data.voice_tone.dos||[]).map((d: string) => `<div style="font-size:12px;color:#1A1A1A;margin-bottom:4px;">✓ ${esc(d)}</div>`).join("")}
      </div>
      <div style="background:#FFF3EF;border-radius:8px;padding:12px 14px;">
        <div style="font-size:9px;text-transform:uppercase;letter-spacing:1px;color:${orange};margin-bottom:8px;">Don't</div>
        ${(data.voice_tone.donts||[]).map((d: string) => `<div style="font-size:12px;color:#1A1A1A;margin-bottom:4px;">✗ ${esc(d)}</div>`).join("")}
      </div>
    </div>
  </div>` : ""}

  <!-- WHITESPACE + THREAT RADAR -->
  ${(data.whitespace || (data.threat_radar?.length)) ? `
  <div class="section no-break">
    ${sectionHead("Whitespace & Threat Radar")}
    <div class="grid2" style="margin-top:14px;">
      ${data.whitespace ? `
      <div style="background:#E9F8F2;border-radius:8px;padding:12px 14px;">
        <div style="font-size:9px;text-transform:uppercase;letter-spacing:1px;color:${green};margin-bottom:8px;">Whitespace Opportunity</div>
        <div style="font-size:12px;color:#1A1A1A;line-height:1.6;">${esc(data.whitespace)}</div>
      </div>` : ""}
      ${toArray(data.threat_radar).length ? `
      <div style="background:#FFF3EF;border-radius:8px;padding:12px 14px;">
        <div style="font-size:9px;text-transform:uppercase;letter-spacing:1px;color:${orange};margin-bottom:8px;">Threat Radar</div>
        ${toArray(data.threat_radar).map((t: unknown) => `<div style="font-size:12px;color:#1A1A1A;margin-bottom:5px;">⚠ ${esc(String(t))}</div>`).join("")}
      </div>` : ""}
    </div>
  </div>` : ""}

  <!-- CULTURAL TENSION -->
  ${data.cultural_tension ? `
  <div class="section no-break">
    ${sectionHead("Cultural Tension")}
    <div style="background:#FFF8EF;border-left:3px solid #B45309;padding:12px 16px;border-radius:0 8px 8px 0;font-size:13px;color:#333;line-height:1.7;margin-top:14px;">${esc(data.cultural_tension)}</div>
    ${extractSection("Cultural") ? `<div style="margin-top:10px;font-size:12px;color:#555;line-height:1.7;">${esc(extractSection("Cultural"))}</div>` : ""}
  </div>` : ""}

  <!-- STRATEGIC OUTLOOK -->
  <div class="section no-break">
    ${sectionHead("Strategic Outlook", "Top Risk · Recommendation")}
    <div style="margin-top:14px;">
      <div style="font-size:9px;text-transform:uppercase;letter-spacing:1px;color:${orange};margin-bottom:6px;">Top Risk</div>
      <div style="background:#FFF3EF;border-left:3px solid ${orange};padding:12px 16px;border-radius:0 8px 8px 0;font-size:12px;color:#333;line-height:1.7;margin-bottom:14px;">${esc(data.top_risk)}</div>
      <div style="font-size:9px;text-transform:uppercase;letter-spacing:1px;color:${green};margin-bottom:6px;">Recommendation</div>
      <div style="background:#EDFAF4;border-left:3px solid ${green};padding:12px 16px;border-radius:0 8px 8px 0;font-size:12px;color:#333;line-height:1.7;">${esc(data.recommendation)}</div>
    </div>
    ${extractSection("Recommendation") ? `<div style="margin-top:10px;font-size:12px;color:#555;line-height:1.7;">${esc(extractSection("Recommendation"))}</div>` : ""}
  </div>

  <!-- FOOTER -->
  <div style="margin-top:40px;padding-top:14px;border-top:1px solid #E0E0E0;display:flex;justify-content:space-between;align-items:center;">
    <div style="font-size:11px;color:#888;">${esc(data.brand)} Brand Strategy Report</div>
    <div style="font-size:10px;color:#BBB;letter-spacing:0.5px;">Generated by Marcus · ${new Date().toLocaleDateString("en-IN",{year:"numeric",month:"long",day:"numeric"})}</div>
  </div>

</div>
<script>window.onload = () => window.print();</script>
</body>
</html>`;

  const blob = new Blob([html], { type: "text/html;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${(data.brand || "Brand").replace(/\s+/g,"-")}-Strategy-Report.html`;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => { document.body.removeChild(a); URL.revokeObjectURL(url); }, 1000);
}
