import { useState, useMemo } from "react";
import type { BrandData } from "./utils";
import { toArray } from "./utils";
import { downloadReport } from "./report";

type Props = {
  data: Record<string, unknown>;
  narrative: string;
};

const ACCENT = "#6366f1";

function computeGrade(d: BrandData): { letter: string; color: string; score: number } {
  const aaker = d.aaker || {};
  const equityAvg = ((aaker.awareness||0) + (aaker.loyalty||0) + (aaker.quality||0) + (aaker.associations||0) + (aaker.assets||0)) / 5;
  const funnel = d.health_funnel || {};
  const funnelAvg = ((funnel.awareness||0) + (funnel.consideration||0) + (funnel.preference||0) + (funnel.purchase||0) + (funnel.loyalty||0)) / 5 / 10;
  const availAvg = ((d.mental_availability || 0) + (d.physical_availability || 0)) / 2;
  const score = equityAvg * 0.4 + funnelAvg * 0.3 + availAvg * 0.3;
  const clamped = Math.round(Math.min(10, Math.max(0, score)) * 10) / 10;
  if (clamped >= 8.5) return { letter: "A", color: "#10b981", score: clamped };
  if (clamped >= 7) return { letter: "B", color: "#6366f1", score: clamped };
  if (clamped >= 5.5) return { letter: "C", color: "#f59e0b", score: clamped };
  if (clamped >= 4) return { letter: "D", color: "#f97316", score: clamped };
  return { letter: "F", color: "#ef4444", score: clamped };
}

export default function BrandDashboard({ data, narrative }: Props) {
  const [tab, setTab] = useState("overview");
  const [summaryOpen, setSummaryOpen] = useState(true);
  if (!data) return <div className="text-sm text-neutral-500 p-4">No data available</div>;
  const d = data as unknown as BrandData;
  const grade = useMemo(() => computeGrade(d), [d]);

  const tabs = [
    { id: "overview", label: "Overview" },
    { id: "identity", label: "Identity" },
    { id: "equity", label: "Brand Equity" },
    { id: "market", label: "Market" },
    { id: "strategy", label: "Strategy" },
    { id: "competitive", label: "Competitive" },
    { id: "audience", label: "Audience" },
  ];

  return (
    <div className="p-[1px] rounded-[1.5rem]"
      style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02))" }}>
      <div className="rounded-[calc(1.5rem-1px)] bg-[#0c0c12] p-3 sm:p-5"
        style={{ boxShadow: "inset 0 1px 1px rgba(255,255,255,0.06)" }}>
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 sm:gap-3 mb-4">
          <div className="min-w-0">
              <h3 className="text-lg sm:text-xl font-semibold text-white tracking-tight truncate">
                {d.brand ?? "—"}
              </h3>
              <div className="flex flex-wrap gap-x-1.5 text-[11px] sm:text-xs text-neutral-500 mt-1">
                <span>{d.category ?? "—"}</span>
                <span className="text-neutral-400 mx-0.5">·</span>
                <span>{d.lifecycle ?? "—"}</span>
                <span className="text-neutral-400 mx-0.5">·</span>
                <span>{d.archetype ?? "—"}</span>
              </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-[10px] px-2.5 py-1 rounded-full font-semibold whitespace-nowrap"
              style={{ background: `${ACCENT}18`, color: ACCENT, border: `1px solid ${ACCENT}33` }}>
              {d.cbbe_label ?? "—"}
            </span>
            <button onClick={() => downloadReport(d, narrative)}
              className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full font-medium transition-all duration-200 hover:bg-white/10 active:scale-95 whitespace-nowrap"
              style={{ background: "rgba(255,255,255,0.06)", color: "#ccc", border: "1px solid rgba(255,255,255,0.1)" }}>
              <svg width="11" height="11" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M8 2v9M4 8l4 4 4-4M2 14h12"/>
              </svg>
              Report
            </button>
          </div>
        </div>

        {/* At a Glance */}
        <div className="mb-5 rounded-xl border border-white/[0.06] overflow-hidden"
          style={{ background: "rgba(255,255,255,0.015)" }}>
          <button onClick={() => setSummaryOpen(!summaryOpen)}
            className="w-full flex items-center justify-between px-4 py-2.5 text-xs font-medium text-neutral-400 hover:text-white transition-colors">
            At a Glance
            <svg className={`w-3.5 h-3.5 transition-transform duration-200 ${summaryOpen ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
              <path d="M6 9l6 6 6-6" />
            </svg>
          </button>
          {summaryOpen && (
            <div className="px-4 pb-4 space-y-3">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold"
                  style={{ background: `${grade.color}1a`, color: grade.color, border: `2px solid ${grade.color}44` }}>
                  {grade.letter}
                </div>
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex flex-wrap gap-x-3 text-xs text-neutral-500">
                    <span>Score: <span className="text-white font-medium">{grade.score}/10</span></span>
                    <span>·</span>
                    <span>Mental: <span className="text-emerald-400 font-medium">{d.mental_availability ?? 0}/10</span></span>
                    <span>·</span>
                    <span>Physical: <span className="text-emerald-400 font-medium">{d.physical_availability ?? 0}/10</span></span>
                  </div>
                  <div className="flex gap-2 text-xs flex-wrap">
                    <span className="px-2 py-0.5 rounded-full text-[10px] text-sky-400" style={{ background: "rgba(56,189,248,0.08)", border: "1px solid rgba(56,189,248,0.15)" }}>{d.lifecycle}</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] text-purple-400" style={{ background: "rgba(168,85,247,0.08)", border: "1px solid rgba(168,85,247,0.15)" }}>{d.archetype}</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px]" style={{ background: `${ACCENT}12`, color: ACCENT, border: `1px solid ${ACCENT}25` }}>{d.cbbe_label}</span>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div className="p-2.5 rounded-lg" style={{ background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.12)" }}>
                  <p className="text-[10px] font-body uppercase tracking-wider text-red-400 mb-1">Top Risk</p>
                  <p className="text-xs text-neutral-300 leading-relaxed">{d.top_risk ?? "—"}</p>
                </div>
                <div className="p-2.5 rounded-lg" style={{ background: "rgba(16,185,129,0.06)", border: "1px solid rgba(16,185,129,0.12)" }}>
                  <p className="text-[10px] font-body uppercase tracking-wider text-emerald-400 mb-1">Recommendation</p>
                  <p className="text-xs text-neutral-300 leading-relaxed">{d.recommendation ?? "—"}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className="flex gap-1.5 mb-5 pb-4 border-b border-white/[0.06] overflow-x-auto scrollbar-none flex-nowrap">
          {tabs.map((t) => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`text-xs px-3.5 py-1.5 rounded-full transition-all duration-200 ${
                tab === t.id
                  ? "text-white font-medium"
                  : "text-neutral-500 hover:text-white"
              }`}
              style={tab === t.id ? { background: ACCENT } : {}}>
              {t.label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="space-y-4">
          {tab === "overview" && <OverviewTab d={d} narrative={narrative} />}
          {tab === "identity" && <IdentityTab d={d} narrative={narrative} />}
          {tab === "equity" && <EquityTab d={d} narrative={narrative} />}
          {tab === "market" && <MarketTab d={d} narrative={narrative} />}
          {tab === "strategy" && <StrategyTab d={d} narrative={narrative} />}
          {tab === "competitive" && <CompetitiveTab d={d} narrative={narrative} />}
          {tab === "audience" && <AudienceTab d={d} narrative={narrative} />}
        </div>
      </div>
    </div>
  );
}

function SectionCard({ children, label }: { children: React.ReactNode; label: string }) {
  return (
    <div>
      <p className="text-[10px] font-semibold uppercase tracking-widest text-neutral-500 mb-3 flex items-center gap-2">
        <span className="h-px w-3 rounded" style={{ background: "rgba(255,255,255,0.12)" }} />
        {label}
      </p>
      {children}
    </div>
  );
}

function SubCard({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div className="rounded-xl border border-white/[0.04] p-3.5"
      style={{ background: "rgba(255,255,255,0.015)", ...style }}>
      {children}
    </div>
  );
}

function extractSections(text: string, wanted: string[]): string {
  if (!text) return "";
  const ALL = [
    "Brand Snapshot","Category & Competition","Jobs-to-be-Done","Identity",
    "Positioning","Equity","Brand Equity Level","Mental & Physical Availability",
    "Brand Health Funnel","Cultural Angle","Competitive Landscape","Audience Profile",
    "Strategy Roadmap","Blindspots & Risk","Recommendation",
  ];
  const esc = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const boundary = ALL.map(esc).join("|");
  const results: string[] = [];
  for (const title of wanted) {
    const pat = new RegExp(
      "(?:^|\\n)\\*{0,2}" + esc(title) + "\\*{0,2}[:\\s*]+(.+?)(?=\\n\\*{0,2}(?:" + boundary + ")\\*{0,2}[:\\s]|$)",
      "is"
    );
    const m = text.match(pat);
    if (m) results.push(m[1].replace(/\*+/g, "").trim());
  }
  return results.join("\n\n").replace(/\n{3,}/g, "\n\n").trim();
}

function NarrativeAccordion({ narrative, sections }: { narrative: string; sections: string[] }) {
  const [open, setOpen] = useState(false);
  const content = extractSections(narrative, sections);
  if (!content) return null;
  return (
    <div className="rounded-xl border border-white/[0.06] overflow-hidden"
      style={{ background: "rgba(255,255,255,0.015)" }}>
      <button onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-2.5 text-[10px] font-body uppercase tracking-wider text-neutral-500 hover:text-neutral-300 transition-colors">
        Narrative
        <svg className={`w-3 h-3 transition-transform duration-200 ${open ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>
      {open && (
        <div className="px-4 pb-4">
          <p className="text-xs text-neutral-400 leading-relaxed whitespace-pre-wrap">{content}</p>
        </div>
      )}
    </div>
  );
}

function PopPodDiagram({ pops, pods, parity, brand }: { pops: string[]; pods: string[]; parity: string[]; brand: string }) {
  return (
    <div className="space-y-3">
      {/* Column headers */}
      <div className="grid grid-cols-3 text-center">
        <p className="text-xs font-semibold uppercase tracking-widest text-indigo-400">Category / PoP</p>
        <p className="text-xs font-semibold uppercase tracking-widest text-neutral-500">Overlap</p>
        <p className="text-xs font-semibold uppercase tracking-widest text-emerald-400">{brand} / PoD</p>
      </div>

      {/* Venn SVG */}
      <div style={{ maxWidth: 460, margin: "0 auto" }}>
        <svg viewBox="0 0 460 170" className="w-full">
          <circle cx={160} cy={85} r={80} fill="rgba(99,102,241,0.07)" stroke="rgba(99,102,241,0.3)" strokeWidth={1.5} />
          <circle cx={300} cy={85} r={80} fill="rgba(16,185,129,0.07)" stroke="rgba(16,185,129,0.3)" strokeWidth={1.5} />
          <clipPath id="venn-clip-pop"><circle cx={160} cy={85} r={80} /></clipPath>
          <circle cx={300} cy={85} r={80} fill="rgba(255,255,255,0.04)" clipPath="url(#venn-clip-pop)" />
          <text x={230} y={80} textAnchor="middle" fontSize={10} fill="rgba(255,255,255,0.3)" fontWeight="700" fontFamily="system-ui,sans-serif" letterSpacing="1.5">PARITY</text>
          <text x={230} y={96} textAnchor="middle" fontSize={8} fill="rgba(255,255,255,0.2)" fontFamily="system-ui,sans-serif">must-haves</text>
        </svg>
      </div>

      {/* Items grid */}
      <div className="grid grid-cols-3 gap-3">
        {/* PoP */}
        <div className="space-y-2">
          {pops.map((p, i) => (
            <div key={i} className="flex items-start gap-2 px-3 py-2 rounded-lg"
              style={{ background: "rgba(99,102,241,0.06)", border: "1px solid rgba(99,102,241,0.12)" }}>
              <span className="w-2 h-2 rounded-full shrink-0 mt-0.5" style={{ background: "rgba(99,102,241,0.5)" }} />
              <span className="text-xs text-neutral-400 leading-snug">{p}</span>
            </div>
          ))}
        </div>

        {/* Overlap / Parity */}
        <div className="space-y-2">
          <div className="flex flex-col items-center justify-center rounded-lg px-2 py-1.5 min-h-[32px]"
            style={{ background: "rgba(255,255,255,0.015)", border: "1px solid rgba(255,255,255,0.06)" }}>
            <span className="text-[10px] text-neutral-600 text-center leading-snug font-medium uppercase tracking-wider">
              Table Stakes
            </span>
          </div>
          {parity.map((p, i) => (
            <div key={i} className="flex items-start gap-2 px-3 py-2 rounded-lg"
              style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
              <span className="w-2 h-2 rounded-full shrink-0 mt-0.5" style={{ background: "rgba(255,255,255,0.25)" }} />
              <span className="text-xs text-neutral-500 leading-snug">{p}</span>
            </div>
          ))}
        </div>

        {/* PoD */}
        <div className="space-y-2">
          {pods.map((p, i) => (
            <div key={i} className="flex items-start gap-2 px-3 py-2 rounded-lg"
              style={{ background: "rgba(16,185,129,0.06)", border: "1px solid rgba(16,185,129,0.12)" }}>
              <span className="w-2 h-2 rounded-full shrink-0 mt-0.5" style={{ background: "rgba(16,185,129,0.5)" }} />
              <span className="text-xs text-neutral-400 leading-snug">{p}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function OverviewTab({ d, narrative }: { d: BrandData; narrative: string }) {
  return (
    <div className="space-y-5">
      <SectionCard label="Jobs-to-be-Done">
        <div className="space-y-2">
          {[
            { label: "Functional", value: d.jobs?.functional, color: "#6366f1", border: true },
            { label: "Emotional", value: d.jobs?.emotional, color: "#10b981", border: true },
            { label: "Social", value: d.jobs?.social, color: "#f59e0b", border: true },
          ].map((j) => (
            <SubCard key={j.label}>
              <span className="text-[10px] font-body uppercase tracking-wider"
                style={{ color: j.color }}>{j.label}</span>
              <p className="text-xs text-neutral-300 mt-1 leading-relaxed">{j.value || "—"}</p>
            </SubCard>
          ))}
        </div>
      </SectionCard>

      <SectionCard label="Points of Parity & Difference">
        <PopPodDiagram pops={toArray(d.pops) as string[]} pods={toArray(d.pods) as string[]} parity={toArray(d.parity) as string[]} brand={d.brand} />
      </SectionCard>

      <SectionCard label="Positioning Statement">
        <SubCard>
          <p className="text-xs text-neutral-300 italic leading-relaxed">{d.positioning_statement}</p>
        </SubCard>
      </SectionCard>

      {d.purpose && (
        <SectionCard label="Brand Purpose">
          <SubCard>
            <p className="text-xs text-neutral-300 leading-relaxed">{d.purpose}</p>
          </SubCard>
        </SectionCard>
      )}

      {d.audience?.primary && (
        <SectionCard label="Target Audience">
          <div className="space-y-2">
            <SubCard>
              <span className="text-[10px] font-body uppercase tracking-wider text-purple-400">Primary</span>
              <p className="text-xs text-neutral-300 mt-1 leading-relaxed">{d.audience.primary}</p>
            </SubCard>
            {d.audience.secondary && (
              <SubCard>
                <span className="text-[10px] font-body uppercase tracking-wider text-neutral-500">Secondary</span>
                <p className="text-xs text-neutral-300 mt-1 leading-relaxed">{d.audience.secondary}</p>
              </SubCard>
            )}
          </div>
        </SectionCard>
      )}

      <NarrativeAccordion narrative={narrative} sections={["Brand Snapshot", "Positioning", "Jobs-to-be-Done", "Blindspots & Risk", "Recommendation"]} />
    </div>
  );
}

function IdentityTab({ d, narrative }: { d: BrandData; narrative: string }) {
  const facets = [
    { key: "physique", label: "Physique", color: "#6366f1" },
    { key: "personality", label: "Personality", color: "#10b981" },
    { key: "culture", label: "Culture", color: "#f59e0b" },
    { key: "relationship", label: "Relationship", color: "#3b82f6" },
    { key: "reflection", label: "Reflection", color: "#d97706" },
    { key: "self_image", label: "Self-Image", color: "#ec4899" },
  ];

  return (
    <div className="space-y-6">
      <SectionCard label="Brand Identity Prism">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {facets.map((f) => (
            <div key={f.key} className="rounded-xl p-3" style={{ background: "rgba(255,255,255,0.02)", border: `1px solid ${f.color}20` }}>
              <div className="flex items-center gap-1.5 mb-1.5">
                <div className="w-2 h-2 rounded-sm rotate-45 shrink-0" style={{ background: f.color, opacity: 0.7 }} />
                <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: f.color }}>{f.label}</span>
              </div>
              <p className="text-xs text-neutral-400 leading-relaxed">{(d.kapferer || {})[f.key] || "—"}</p>
            </div>
          ))}
        </div>
      </SectionCard>

      <SectionCard label="Brand Equity Pyramid">
        <CBBEPyramid level={d.cbbe_level} label={d.cbbe_label} />
      </SectionCard>

      <NarrativeAccordion narrative={narrative} sections={["Identity"]} />
    </div>
  );
}

function CBBEPyramid({ level, label }: { level: number; label: string }) {
  const levels = [
    { l: 4, name: "Resonance", w: "w-24" },
    { l: 3, name: "Judgments & Feelings", w: "w-40" },
    { l: 2, name: "Performance & Imagery", w: "w-56" },
    { l: 1, name: "Salience", w: "w-72" },
  ];
  // Map cbbe_level (1-10) to pyramid tier (1-4)
  const tier = (level || 0) >= 8 ? 4 : (level || 0) >= 6 ? 3 : (level || 0) >= 4 ? 2 : 1;

  return (
    <div className="flex flex-col items-center gap-1.5">
      {levels.map((lv) => {
        const active = lv.l === tier;
        const achieved = lv.l <= tier;
        return (
          <div key={lv.l} className={`${lv.w} py-2 px-3 text-center rounded-lg border transition-all duration-200 ${
            active ? "border-transparent" : achieved ? "border-white/[0.06]" : "border-white/[0.03]"
          }`}
            style={{
              background: active ? ACCENT : achieved ? "rgba(255,255,255,0.03)" : "rgba(255,255,255,0.01)",
            }}>
            <p className={`text-xs font-medium ${active ? "text-white" : achieved ? "text-white/80" : "text-neutral-600"}`}>
              {lv.name}
            </p>
          </div>
        );
      })}
      <p className="text-xs text-neutral-500 mt-2">Currently at: {label}</p>
    </div>
  );
}

function RadarChart({ dims }: { dims: { key: string; label: string; color: string; val: number }[] }) {
  const cx = 90, cy = 90, r = 72, sides = dims.length;
  const angleStep = (2 * Math.PI) / sides;
  const polyPoints = (scale: number) =>
    dims.map((_, i) => {
      const a = -Math.PI / 2 + i * angleStep;
      return `${cx + r * scale * Math.cos(a)},${cy + r * scale * Math.sin(a)}`;
    }).join(" ");
  const dataPoints = dims.map((d, i) => {
    const a = -Math.PI / 2 + i * angleStep;
    const sc = d.val / 10;
    return `${cx + r * sc * Math.cos(a)},${cy + r * sc * Math.sin(a)}`;
  }).join(" ");

  return (
    <svg viewBox="-60 -20 300 220" className="w-full max-w-[450px] mx-auto">
      {[0.2, 0.4, 0.6, 0.8, 1].map((sc, i) => (
        <polygon key={i} points={polyPoints(sc)} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={1} />
      ))}
      {dims.map((d, i) => {
        const a = -Math.PI / 2 + i * angleStep;
        const x = cx + r * Math.cos(a);
        const y = cy + r * Math.sin(a);
        return <line key={i} x1={cx} y1={cy} x2={x} y2={y} stroke="rgba(255,255,255,0.04)" strokeWidth={1} />;
      })}
      <polygon points={dataPoints} fill="rgba(99,102,241,0.15)" stroke="rgba(99,102,241,0.6)" strokeWidth={1.5} />
      {dims.map((d, i) => {
        const a = -Math.PI / 2 + i * angleStep;
        const sc = d.val / 10;
        const x = cx + r * sc * Math.cos(a);
        const y = cy + r * sc * Math.sin(a);
        return <circle key={i} cx={x} cy={y} r={3} fill={d.color} />;
      })}
      {dims.map((d, i) => {
        const a = -Math.PI / 2 + i * angleStep;
        const lx = cx + (r + 16) * Math.cos(a);
        const ly = cy + (r + 16) * Math.sin(a);
        return (
          <g key={i}>
            <text x={lx} y={ly - 4} fontSize={7.5} fill="#888" textAnchor="middle" dominantBaseline="middle" fontFamily="system-ui,sans-serif">
              {d.label}
            </text>
            <text x={lx} y={ly + 7} fontSize={8} fill={d.color} textAnchor="middle" dominantBaseline="middle" fontWeight="700" fontFamily="system-ui,sans-serif">
              {d.val}/10
            </text>
          </g>
        );
      })}
    </svg>
  );
}

function EquityTab({ d, narrative }: { d: BrandData; narrative: string }) {
  const dims = [
    { key: "awareness", label: "Brand Awareness", color: "#c4b5fd" },
    { key: "loyalty", label: "Brand Loyalty", color: "#a78bfa" },
    { key: "quality", label: "Perceived Quality", color: "#8b83f0" },
    { key: "associations", label: "Brand Associations", color: "#7c6fe0" },
    { key: "assets", label: "Proprietary Assets", color: "#6d5fc8" },
  ];

  const radarDims = dims.map((dim) => ({
    ...dim,
    val: Number((d.aaker || {})[dim.key]) || 0,
  }));

  return (
    <div className="space-y-6">
      <SectionCard label="Brand Equity (Aaker)">
        <RadarChart dims={radarDims} />
        <div className="mt-4 flex justify-center gap-4 flex-wrap">
          {radarDims.map((dim) => (
            <div key={dim.key} className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full" style={{ background: dim.color }} />
              <span className="text-[10px] text-neutral-500">{dim.label} <span className="text-white font-medium">{dim.val}/10</span></span>
            </div>
          ))}
        </div>
      </SectionCard>

      <SectionCard label="Mental & Physical Availability">
        <div className="space-y-4">
          {[
            { label: "Mental Availability", val: d.mental_availability, sub: "Memory links & brand cues" },
            { label: "Physical Availability", val: d.physical_availability, sub: "Distribution & ease" },
          ].map((m) => (
            <div key={m.label}>
              <div className="flex justify-between items-center mb-0.5">
                <span className="text-xs text-neutral-400">{m.label}</span>
                <span className="text-xs font-medium text-emerald-400">{m.val}/10</span>
              </div>
              <p className="text-xs text-neutral-600 mb-1.5">{m.sub}</p>
              <div className="h-2 rounded-full bg-white/[0.04] overflow-hidden">
                <div className="h-full rounded-full transition-all duration-500" style={{ width: `${(Number(m.val) || 0) * 10}%`, background: "linear-gradient(90deg, rgba(16,185,129,0.5), rgba(16,185,129,0.8))" }} />
              </div>
            </div>
          ))}
        </div>
      </SectionCard>

      <NarrativeAccordion narrative={narrative} sections={["Equity", "Brand Equity Level", "Mental & Physical Availability"]} />
    </div>
  );
}

function MarketTab({ d, narrative }: { d: BrandData; narrative: string }) {
  return (
    <div className="space-y-6">
      <HealthFunnel funnel={d.health_funnel || {}} />
      <PositioningMap map={d.positioning_map || {}} brandName={d.brand} />

      <NarrativeAccordion narrative={narrative} sections={["Category & Competition", "Brand Health Funnel", "Cultural Angle"]} />
    </div>
  );
}

function HealthFunnel({ funnel }: { funnel: Record<string, number> }) {
  const stages = [
    { key: "awareness", label: "Awareness" },
    { key: "consideration", label: "Consideration" },
    { key: "preference", label: "Preference" },
    { key: "purchase", label: "Purchase" },
    { key: "loyalty", label: "Loyalty" },
  ];
  const fw = 240, fh = 280, padL = 50, padR = 20, segH = fh / stages.length;
  const vals = stages.map((s) => Number(funnel[s.key]) || 0);
  const maxVal = Math.max(...vals, 1);
  const getWidth = (v: number) => Math.max(10, (v / maxVal) * (fw - padL - padR));

  return (
    <SectionCard label="Brand Health Funnel">
      <svg viewBox={`0 0 ${fw} ${fh}`} className="w-full max-w-[320px] mx-auto">
        {stages.map((s, i) => {
          const val = vals[i];
          const prev = i > 0 ? vals[i - 1] : 100;
          const drop = prev - val;
          const isLeak = drop > 20 && i > 0;
          const topW = getWidth(i === 0 ? val : vals[i - 1]);
          const botW = getWidth(val);
          const y = i * segH;
          const midX = (fw - padL - padR) / 2 + padL;
          return (
            <g key={s.key}>
              <polygon
                points={`${midX - topW / 2},${y} ${midX + topW / 2},${y} ${midX + botW / 2},${y + segH} ${midX - botW / 2},${y + segH}`}
                fill={isLeak ? "rgba(239,68,68,0.15)" : "rgba(99,102,241,0.12)"}
                stroke={isLeak ? "rgba(239,68,68,0.3)" : "rgba(255,255,255,0.06)"}
                strokeWidth={0.5}
              />
              <line x1={midX - topW / 2} y1={y} x2={midX - botW / 2} y2={y + segH} stroke="rgba(255,255,255,0.04)" strokeWidth={0.5} />
              <line x1={midX + topW / 2} y1={y} x2={midX + botW / 2} y2={y + segH} stroke="rgba(255,255,255,0.04)" strokeWidth={0.5} />
              <text x={padL - 4} y={y + segH / 2 + 3} fontSize={8} fill="#888" textAnchor="end" dominantBaseline="middle" fontFamily="system-ui,sans-serif">
                {s.label}
              </text>
              <text x={fw - 4} y={y + segH / 2 + 3} fontSize={8}
                fill={isLeak ? "#f87171" : "#aaa"} textAnchor="end" dominantBaseline="middle" fontWeight="600" fontFamily="system-ui,sans-serif">
                {val}%
              </text>
              {isLeak && (
                <text x={fw - 4} y={y + segH / 2 + 13} fontSize={7} fill="#f87171" textAnchor="end" dominantBaseline="middle" fontFamily="system-ui,sans-serif">
                  −{drop}pp
                </text>
              )}
            </g>
          );
        })}
      </svg>
      <p className="text-[10px] text-neutral-600 text-center mt-2">Drops &gt;20pp flagged as leakage</p>
    </SectionCard>
  );
}

function StrategyTab({ d, narrative }: { d: BrandData; narrative: string }) {
  return (
    <div className="space-y-5">
      {d.strategic_priorities?.length > 0 && (
        <SectionCard label="Strategic Priorities">
          <div className="space-y-2">
            {d.strategic_priorities.map((p, i) => (
              <div key={i} className="flex items-start gap-3 rounded-xl p-3"
                style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }}>
                <div className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5"
                  style={{ background: `${ACCENT}20`, color: ACCENT, border: `1px solid ${ACCENT}35` }}>{i + 1}</div>
                <p className="text-xs text-neutral-300 leading-relaxed pt-0.5">{p}</p>
              </div>
            ))}
          </div>
        </SectionCard>
      )}

      {(d.quick_wins?.length > 0 || d.long_term_bets?.length > 0) && (
        <SectionCard label="Quick Wins vs Long-Term Bets">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <SubCard style={{ borderColor: "rgba(16,185,129,0.15)" }}>
              <p className="text-[10px] font-body uppercase tracking-wider text-emerald-400 mb-2">Quick Wins</p>
              <div className="space-y-2">
                {(d.quick_wins || []).map((w, i) => (
                  <p key={i} className="text-xs text-neutral-400 leading-relaxed flex gap-2">
                    <span className="text-emerald-500 shrink-0">&#8594;</span> {w}
                  </p>
                ))}
              </div>
            </SubCard>
            <SubCard style={{ borderColor: "rgba(99,102,241,0.15)" }}>
              <p className="text-[10px] font-body uppercase tracking-wider text-indigo-400 mb-2">Long-Term Bets</p>
              <div className="space-y-2">
                {(d.long_term_bets || []).map((b, i) => (
                  <p key={i} className="text-xs text-neutral-400 leading-relaxed flex gap-2">
                    <span className="text-indigo-400 shrink-0">&#8594;</span> {b}
                  </p>
                ))}
              </div>
            </SubCard>
          </div>
        </SectionCard>
      )}

      {d.activation_roadmap && (
        <SectionCard label="Activation Roadmap">
          <SubCard>
            <p className="text-xs text-neutral-300 leading-relaxed">{d.activation_roadmap}</p>
          </SubCard>
        </SectionCard>
      )}

      {d.cultural_tension && (
        <SectionCard label="Cultural Tension">
          <SubCard style={{ borderColor: "rgba(245,158,11,0.15)" }}>
            <p className="text-xs text-neutral-300 leading-relaxed">{d.cultural_tension}</p>
          </SubCard>
        </SectionCard>
      )}

      <NarrativeAccordion narrative={narrative} sections={["Strategy Roadmap", "Cultural Angle"]} />
    </div>
  );
}

function CompetitiveTab({ d, narrative }: { d: BrandData; narrative: string }) {
  return (
    <div className="space-y-5">
      {d.swot?.strengths?.length > 0 && (
        <SectionCard label="SWOT Analysis">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {[
              { label: "Strengths", items: d.swot.strengths, color: "#10b981" },
              { label: "Weaknesses", items: d.swot.weaknesses, color: "#ef4444" },
              { label: "Opportunities", items: d.swot.opportunities, color: "#3b82f6" },
              { label: "Threats", items: d.swot.threats, color: "#f59e0b" },
            ].map((s) => (
              <SubCard key={s.label} style={{ borderColor: `${s.color}15` }}>
                <p className="text-[10px] font-body uppercase tracking-wider mb-2" style={{ color: s.color }}>{s.label}</p>
                <div className="space-y-1.5">
                  {s.items.map((item, i) => (
                    <p key={i} className="text-xs text-neutral-400 leading-relaxed">· {item}</p>
                  ))}
                </div>
              </SubCard>
            ))}
          </div>
        </SectionCard>
      )}

      {d.competitive_matrix?.length > 0 && (
        <SectionCard label="Competitive Comparison">
          <div className="space-y-2">
            {d.competitive_matrix.map((c, i) => {
              const shareNum = parseFloat(String(c.share).replace(/[^0-9.]/g, "")) || 0;
              return (
                <div key={i} className="rounded-xl p-3" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-white">{c.name}</span>
                    <span className="text-[10px] font-medium text-indigo-400">{c.share}{typeof c.share === "number" ? "%" : ""}</span>
                  </div>
                  {shareNum > 0 && (
                    <div className="h-1 rounded-full mb-2" style={{ background: "rgba(255,255,255,0.04)" }}>
                      <div className="h-full rounded-full" style={{ width: `${Math.min(shareNum, 100)}%`, background: "rgba(99,102,241,0.5)" }} />
                    </div>
                  )}
                  <p className="text-[10px] text-neutral-500 mb-1.5 italic">{c.positioning}</p>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="text-[10px] text-emerald-400 flex items-start gap-1"><span className="shrink-0">+</span>{c.strength}</div>
                    <div className="text-[10px] text-red-400 flex items-start gap-1"><span className="shrink-0">−</span>{c.weakness}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </SectionCard>
      )}

      {d.threat_radar?.length > 0 && (
        <SectionCard label="Threat Radar">
          <div className="space-y-2">
            {d.threat_radar.map((t, i) => (
              <div key={i} className="flex items-center gap-2.5 px-3.5 py-2 rounded-lg" style={{ background: "rgba(239,68,68,0.04)", border: "1px solid rgba(239,68,68,0.08)" }}>
                <span className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-medium text-red-400 shrink-0" style={{ background: "rgba(239,68,68,0.12)" }}>{i + 1}</span>
                <p className="text-xs text-neutral-400 leading-relaxed">{t}</p>
              </div>
            ))}
          </div>
        </SectionCard>
      )}

      {d.whitespace && (
        <SectionCard label="Whitespace Opportunity">
          <SubCard style={{ borderColor: "rgba(16,185,129,0.15)" }}>
            <p className="text-xs text-neutral-300 leading-relaxed">{d.whitespace}</p>
          </SubCard>
        </SectionCard>
      )}

      <NarrativeAccordion narrative={narrative} sections={["Competitive Landscape"]} />
    </div>
  );
}

function AudienceTab({ d, narrative }: { d: BrandData; narrative: string }) {
  return (
    <div className="space-y-5">
      {d.persona?.name && (
        <SectionCard label="Audience Persona">
          <SubCard>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-white">{d.persona.name}</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs mt-2">
              {[
                { label: "Demographics", value: d.persona.demographics, color: "#818cf8" },
                { label: "Psychographics", value: d.persona.psychographics, color: "#a78bfa" },
                { label: "Goals", value: d.persona.goals, color: "#34d399" },
                { label: "Pain Points", value: d.persona.pain_points, color: "#f87171" },
              ].map((field) => (
                <div key={field.label} className="rounded-lg p-2.5 break-words" style={{ background: `${field.color}08`, border: `1px solid ${field.color}18` }}>
                  <p className="text-[9px] font-semibold uppercase tracking-widest mb-1" style={{ color: field.color }}>{field.label}</p>
                  <p className="text-neutral-300 leading-snug">{field.value}</p>
                </div>
              ))}
            </div>
          </SubCard>
        </SectionCard>
      )}

      {d.customer_journey?.length > 0 && (
        <SectionCard label="Customer Journey">
          <div>
            {d.customer_journey.map((j, i) => {
              const colors = ["#6366f1","#8b5cf6","#3b82f6","#10b981","#059669"];
              const col = colors[i % colors.length];
              const isLast = i === d.customer_journey.length - 1;
              return (
                <div key={i} className={`relative flex items-start gap-3 ${isLast ? "" : "mb-2"}`}>
                  {!isLast && (
                    <div className="absolute left-[15px] top-0 -bottom-2 w-px"
                      style={{ background: "linear-gradient(180deg, rgba(99,102,241,0.3), rgba(99,102,241,0.05))" }} />
                  )}
                  <div className="relative w-[30px] h-[30px] rounded-full flex items-center justify-center text-[9px] font-bold shrink-0 z-10"
                    style={{ background: `${col}20`, color: col, border: `1.5px solid ${col}50` }}>{i+1}</div>
                  <div className="flex-1 rounded-xl p-3 pb-2 break-words" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }}>
                    <span className="text-[10px] font-semibold" style={{ color: col }}>{j.stage}</span>
                    <p className="text-xs text-neutral-400 leading-relaxed mt-1">{j.description}</p>
                    {j.brand_opportunity && (
                      <p className="text-[10px] text-emerald-400 mt-1.5 flex items-center gap-1">
                        <span style={{ color: col }}>→</span> {j.brand_opportunity}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </SectionCard>
      )}

      {d.voice_tone?.voice && (
        <SectionCard label="Voice & Tone">
          <div className="space-y-2">
            <SubCard>
              <p className="text-[10px] font-body uppercase tracking-wider text-neutral-500 mb-1">Voice</p>
              <p className="text-xs text-neutral-300">{d.voice_tone.voice}</p>
              <p className="text-[10px] font-body uppercase tracking-wider text-neutral-500 mt-2 mb-1">Tone</p>
              <p className="text-xs text-neutral-300">{d.voice_tone.tone}</p>
            </SubCard>
            {(d.voice_tone.dos?.length > 0 || d.voice_tone.donts?.length > 0) && (
              <div className="grid grid-cols-2 gap-2">
                <SubCard style={{ borderColor: "rgba(16,185,129,0.15)" }}>
                  <p className="text-[10px] font-body uppercase tracking-wider text-emerald-400 mb-2">Do</p>
                  <div className="space-y-1">
                    {(d.voice_tone.dos || []).map((item, i) => (
                      <p key={i} className="text-xs text-neutral-400">· {item}</p>
                    ))}
                  </div>
                </SubCard>
                <SubCard style={{ borderColor: "rgba(239,68,68,0.15)" }}>
                  <p className="text-[10px] font-body uppercase tracking-wider text-red-400 mb-2">Don't</p>
                  <div className="space-y-1">
                    {(d.voice_tone.donts || []).map((item, i) => (
                      <p key={i} className="text-xs text-neutral-400">· {item}</p>
                    ))}
                  </div>
                </SubCard>
              </div>
            )}
          </div>
        </SectionCard>
      )}

      <NarrativeAccordion narrative={narrative} sections={["Audience Profile"]} />
    </div>
  );
}

function PositioningMap({ map, brandName }: { map: { x_axis?: string; y_axis?: string; brand_x?: number; brand_y?: number; competitors?: { name: string; x: number; y: number }[] }; brandName: string }) {
  const W = 320; const H = 260; const pad = 45;
  const innerW = W - pad * 2; const innerH = H - pad * 2;
  const allX = [map.brand_x ?? 0.5, ...(map.competitors || []).map((c) => c.x ?? 0.5)];
  const allY = [map.brand_y ?? 0.5, ...(map.competitors || []).map((c) => c.y ?? 0.5)];
  const minX = Math.min(...allX); const maxX = Math.max(...allX);
  const minY = Math.min(...allY); const maxY = Math.max(...allY);
  const rangeX = maxX - minX || 1; const rangeY = maxY - minY || 1;
  const norm = (v: number, min: number, range: number) => 0.15 + ((v - min) / range) * 0.7;
  const toX = (v: number) => pad + norm(v, minX, rangeX) * innerW;
  const toY = (v: number) => H - pad - norm(v, minY, rangeY) * innerH;
  const parseAxis = (str?: string) => {
    if (!str) return ["Low", "High"];
    const parts = str.split(/←|→|↔|<->|->/);
    const clean = parts.map((s) => s.trim()).filter(Boolean);
    return [clean[0] || "Low", clean[clean.length - 1] || "High"];
  };
  const [xLeft, xRight] = parseAxis(map.x_axis);
  const [yBottom] = parseAxis(map.y_axis);
  const [, yTop] = parseAxis(map.y_axis);
  const midX = pad + innerW / 2; const midY = pad + innerH / 2;
  const bx = toX(map.brand_x ?? 0.5); const by = toY(map.brand_y ?? 0.5);

  return (
    <SectionCard label="Positioning Map">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full max-w-[480px] mx-auto">
        <rect x={pad} y={pad} width={innerW / 2} height={innerH / 2} fill="#6366f1" opacity={0.06} rx={2} />
        <rect x={midX} y={pad} width={innerW / 2} height={innerH / 2} fill="#10b981" opacity={0.06} rx={2} />
        <rect x={pad} y={midY} width={innerW / 2} height={innerH / 2} fill="#f59e0b" opacity={0.06} rx={2} />
        <rect x={midX} y={midY} width={innerW / 2} height={innerH / 2} fill="#3b82f6" opacity={0.06} rx={2} />
        <line x1={pad} y1={midY} x2={W - pad} y2={midY} stroke="rgba(255,255,255,0.08)" strokeWidth={1} />
        <line x1={midX} y1={pad} x2={midX} y2={H - pad} stroke="rgba(255,255,255,0.08)" strokeWidth={1} />
        <text x={pad + 2} y={midY - 6} fontSize={8} fill="#555" textAnchor="start" fontFamily="system-ui,sans-serif">{xLeft}</text>
        <text x={W - pad - 2} y={midY - 6} fontSize={8} fill="#555" textAnchor="end" fontFamily="system-ui,sans-serif">{xRight}</text>
        <text x={midX} y={pad + 10} fontSize={8} fill="#555" textAnchor="middle" fontFamily="system-ui,sans-serif">{yTop}</text>
        <text x={midX} y={H - pad - 4} fontSize={8} fill="#555" textAnchor="middle" fontFamily="system-ui,sans-serif">{yBottom}</text>
        {(map.competitors || []).map((c, i) => {
          const cx2 = toX(c.x); const cy2 = toY(c.y);
          return (<g key={i}>
            <circle cx={cx2} cy={cy2} r={5} fill="rgba(255,255,255,0.06)" stroke="rgba(255,255,255,0.2)" strokeWidth={1} />
            <text x={Math.min(cx2 + 8, W - pad - 30)} y={cy2 - 4} fontSize={8} fill="#555" fontFamily="system-ui,sans-serif">{c.name}</text>
          </g>);
        })}
        <circle cx={bx} cy={by} r={18} fill="#6366f1" opacity={0.08} />
        <circle cx={bx} cy={by} r={8} fill="#6366f1" opacity={0.9} />
        <circle cx={bx} cy={by} r={3} fill="white" opacity={0.8} />
        <text x={Math.min(bx + 14, W - pad - 20)} y={by - 10} fontSize={9} fontWeight="700" fill="#818cf8" fontFamily="system-ui,sans-serif">{brandName}</text>
      </svg>
    </SectionCard>
  );
}
