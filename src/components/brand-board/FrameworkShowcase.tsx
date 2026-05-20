import { useState } from "react";

const FRAMEWORKS = [
  {
    id: "kapferer",
    title: "Kapferer Prism",
    desc: "6 identity facets: physique, personality, culture, relationship, reflection, self-image",
    detail: "Maps brand identity across 6 interconnected facets. Left column = external expression (physique, relationship, reflection). Right column = internalization (personality, culture, self-image). Strength of the prism reveals brand identity coherence.",
    accent: "#818cf8",
    bg: "rgba(129,140,248,0.06)",
    border: "rgba(129,140,248,0.12)",
    Diagram: () => (
      <svg viewBox="0 0 120 80" className="w-full h-20">
        <polygon points="60,8 112,28 112,60 60,72 8,60 8,28" fill="rgba(129,140,248,0.08)" stroke="rgba(129,140,248,0.3)" strokeWidth="1" />
        <line x1="60" y1="72" x2="60" y2="8" stroke="rgba(129,140,248,0.12)" strokeWidth="0.5" strokeDasharray="2 2" />
        {[[60,8,"P"],[112,28,"Pe"],[112,60,"C"],[60,72,"R"],[8,60,"Rf"],[8,28,"S"]].map(([x,y,l]) => (
          <circle key={String(l)} cx={x} cy={y} r="3" fill="rgba(129,140,248,0.6)" />
        ))}
        <text x="60" y="40" textAnchor="middle" fontSize="6" fill="rgba(255,255,255,0.15)" fontFamily="system-ui,sans-serif">Identity</text>
      </svg>
    ),
  },
  {
    id: "cbbe",
    title: "CBBE Pyramid",
    desc: "Keller's 4 levels: salience → performance/imagery → judgments/feelings → resonance",
    detail: "Customer-Based Brand Equity builds from bottom up: Salience (who are you?) → Performance & Imagery (what are you?) → Judgments & Feelings (what about you?) → Resonance (what about us?). Each level depends on the one below.",
    accent: "#a78bfa",
    bg: "rgba(167,139,250,0.06)",
    border: "rgba(167,139,250,0.12)",
    Diagram: () => (
      <svg viewBox="0 0 120 80" className="w-full h-20">
        {[
          { y: 62, w: 104, l: "Salience", c: "rgba(167,139,250,0.15)" },
          { y: 44, w: 78, l: "Performance & Imagery", c: "rgba(167,139,250,0.2)" },
          { y: 26, w: 52, l: "Judgments & Feelings", c: "rgba(167,139,250,0.25)" },
          { y: 8, w: 30, l: "Resonance", c: "rgba(167,139,250,0.35)" },
        ].map((r) => (
          <rect key={r.l} x={(120-r.w)/2} y={r.y} width={r.w} height="16" rx="2" fill={r.c} stroke="rgba(167,139,250,0.3)" strokeWidth="0.5" />
        ))}
      </svg>
    ),
  },
  {
    id: "aaker",
    title: "Aaker Equity",
    desc: "5 dimensions: awareness, loyalty, quality, associations, proprietary assets",
    detail: "5-component brand equity score (1-10 each). The shape of the scores reveals where equity is deep vs fragile — a wide variation indicates inconsistent brand delivery. High awareness + low associations = hollow fame.",
    accent: "#34d399",
    bg: "rgba(52,211,153,0.06)",
    border: "rgba(52,211,153,0.12)",
    Diagram: () => (
      <svg viewBox="0 0 120 80" className="w-full h-20">
        {[
          { y: 4, w: 90, l: "Awareness" },
          { y: 20, w: 75, l: "Loyalty" },
          { y: 36, w: 80, l: "Quality" },
          { y: 52, w: 65, l: "Associations" },
          { y: 68, w: 55, l: "Assets" },
        ].map((r) => (
          <g key={r.l}>
            <rect x="0" y={r.y} width={r.w} height="12" rx="2" fill="rgba(52,211,153,0.2)" stroke="rgba(52,211,153,0.3)" strokeWidth="0.5" />
          </g>
        ))}
      </svg>
    ),
  },
  {
    id: "funnel",
    title: "Health Funnel",
    desc: "Awareness → Consideration → Preference → Purchase → Loyalty with leakage flags",
    detail: "Tracks conversion through 5 stages. Each drop >20pp is flagged as leakage. High awareness + low consideration = positioning problem. High purchase + low loyalty = experience gap. The funnel shape reveals where the brand loses people.",
    accent: "#f59e0b",
    bg: "rgba(245,158,11,0.06)",
    border: "rgba(245,158,11,0.12)",
    Diagram: () => (
      <svg viewBox="0 0 120 80" className="w-full h-20">
        {[
          { y: 2, top: 100, bot: 80 },
          { y: 18, top: 80, bot: 60 },
          { y: 34, top: 60, bot: 44 },
          { y: 50, top: 44, bot: 30 },
          { y: 66, top: 30, bot: 22 },
        ].map((r, i) => {
          const midX = 60;
          return (
            <polygon key={i} points={`${midX-r.top/2},${r.y} ${midX+r.top/2},${r.y} ${midX+r.bot/2},${r.y+14} ${midX-r.bot/2},${r.y+14}`}
              fill={i > 0 && (i === 3 || i === 4) ? "rgba(239,68,68,0.12)" : "rgba(245,158,11,0.12)"}
              stroke={i > 0 && (i === 3 || i === 4) ? "rgba(239,68,68,0.3)" : "rgba(245,158,11,0.2)"} strokeWidth="0.5" />
          );
        })}
      </svg>
    ),
  },
  {
    id: "positioning",
    title: "Positioning Map",
    desc: "2×2 perceptual map with brand vs competitor positioning",
    detail: "Plots brands on two axes (e.g. Affordable ↔ Premium, Functional ↔ Aspirational). Gaps near desirable positions = whitespace opportunities. Reveals perceptual crowding and differentiation headroom.",
    accent: "#f472b6",
    bg: "rgba(244,114,182,0.06)",
    border: "rgba(244,114,182,0.12)",
    Diagram: () => (
      <svg viewBox="0 0 120 80" className="w-full h-20">
        <rect x="0" y="0" width="60" height="40" fill="rgba(244,114,182,0.04)" rx="1" />
        <rect x="60" y="0" width="60" height="40" fill="rgba(52,211,153,0.04)" rx="1" />
        <rect x="0" y="40" width="60" height="40" fill="rgba(251,191,36,0.04)" rx="1" />
        <rect x="60" y="40" width="60" height="40" fill="rgba(96,165,250,0.04)" rx="1" />
        <line x1="60" y1="0" x2="60" y2="80" stroke="rgba(255,255,255,0.08)" strokeWidth="0.5" />
        <line x1="0" y1="40" x2="120" y2="40" stroke="rgba(255,255,255,0.08)" strokeWidth="0.5" />
        {[[20,25],[85,15],[95,55],[30,60]].map(([x,y],i) => (
          <g key={i}>
            {i === 0 && <circle cx={x} cy={y} r="10" fill="rgba(244,114,182,0.08)" stroke="none" />}
            <circle cx={x} cy={y} r={i === 0 ? 5 : 3}
              fill={i === 0 ? "rgba(244,114,182,0.9)" : "rgba(255,255,255,0.15)"}
              stroke={i === 0 ? "rgba(244,114,182,0.6)" : "rgba(255,255,255,0.2)"} strokeWidth="0.5" />
          </g>
        ))}
      </svg>
    ),
  },
  {
    id: "availability",
    title: "Sharp Availability",
    desc: "Mental availability (memory cues) + Physical availability (distribution ease)",
    detail: "Byron Sharp's How Brands Grow: brand growth comes from building mental and physical availability, not differentiation. Mental = how easily consumers think of you in buying situations. Physical = how easily they can buy you. Most brands over-index on differentiation and under-invest here.",
    accent: "#06b6d4",
    bg: "rgba(6,182,212,0.06)",
    border: "rgba(6,182,212,0.12)",
    Diagram: () => (
      <svg viewBox="0 0 120 80" className="w-full h-20">
        <text x="2" y="18" fontSize="7" fill="rgba(255,255,255,0.4)" fontFamily="system-ui,sans-serif" fontWeight="600">Mental</text>
        <rect x="2" y="24" width="96" height="10" rx="4" fill="rgba(6,182,212,0.1)" stroke="rgba(6,182,212,0.2)" strokeWidth="0.5" />
        <rect x="2" y="24" width="72" height="10" rx="4" fill="rgba(6,182,212,0.4)" />
        <text x="2" y="54" fontSize="7" fill="rgba(255,255,255,0.4)" fontFamily="system-ui,sans-serif" fontWeight="600">Physical</text>
        <rect x="2" y="60" width="96" height="10" rx="4" fill="rgba(6,182,212,0.1)" stroke="rgba(6,182,212,0.2)" strokeWidth="0.5" />
        <rect x="2" y="60" width="56" height="10" rx="4" fill="rgba(6,182,212,0.4)" />
      </svg>
    ),
  },
  {
    id: "jtbd",
    title: "Jobs-to-be-Done",
    desc: "Functional (task), Emotional (feeling), Social (perception) — Christensen",
    detail: "What does the customer hire the brand to do? Three layers: Functional = practical task (cut grass, order food). Emotional = how they want to feel (confident, cared for). Social = how they want to be seen (successful, responsible). Reveals non-obvious competitors.",
    accent: "#fb923c",
    bg: "rgba(251,146,60,0.06)",
    border: "rgba(251,146,60,0.12)",
    Diagram: () => (
      <svg viewBox="0 0 120 80" className="w-full h-20">
        <rect x="2" y="2" width="116" height="22" rx="3" fill="rgba(129,140,248,0.12)" stroke="rgba(129,140,248,0.25)" strokeWidth="0.5" />
        <text x="8" y="16" fontSize="7" fill="rgba(129,140,248,0.7)" fontFamily="system-ui,sans-serif" fontWeight="600">Functional</text>
        <rect x="2" y="28" width="116" height="22" rx="3" fill="rgba(52,211,153,0.12)" stroke="rgba(52,211,153,0.25)" strokeWidth="0.5" />
        <text x="8" y="42" fontSize="7" fill="rgba(52,211,153,0.7)" fontFamily="system-ui,sans-serif" fontWeight="600">Emotional</text>
        <rect x="2" y="54" width="116" height="22" rx="3" fill="rgba(251,146,60,0.12)" stroke="rgba(251,146,60,0.25)" strokeWidth="0.5" />
        <text x="8" y="68" fontSize="7" fill="rgba(251,146,60,0.7)" fontFamily="system-ui,sans-serif" fontWeight="600">Social</text>
      </svg>
    ),
  },
  {
    id: "pops",
    title: "POPs & PODs",
    desc: "Points of Parity (table stakes) vs Points of Difference (owned advantages)",
    detail: "POPs = category must-haves to be considered a legitimate player. PODs = what only this brand can credibly own. Great brands match on POPs and win on PODs. If you can't name at least 2 PODs, your positioning is undifferentiated.",
    accent: "#a78bfa",
    bg: "rgba(167,139,250,0.06)",
    border: "rgba(167,139,250,0.12)",
    Diagram: () => (
      <svg viewBox="0 0 120 80" className="w-full h-20">
        <defs>
          <clipPath id="pops-pod-clip"><circle cx="35" cy="40" r="30" /></clipPath>
        </defs>
        <circle cx="35" cy="40" r="30" fill="rgba(99,102,241,0.08)" stroke="rgba(99,102,241,0.25)" strokeWidth="0.5" />
        <circle cx="85" cy="40" r="30" fill="rgba(52,211,153,0.08)" stroke="rgba(52,211,153,0.25)" strokeWidth="0.5" />
        <circle cx="85" cy="40" r="30" fill="rgba(255,255,255,0.03)" clipPath="url(#pops-pod-clip)" />
        <text x="35" y="42" textAnchor="middle" fontSize="6" fill="rgba(99,102,241,0.5)" fontFamily="system-ui,sans-serif" fontWeight="700">POP</text>
        <text x="85" y="42" textAnchor="middle" fontSize="6" fill="rgba(52,211,153,0.5)" fontFamily="system-ui,sans-serif" fontWeight="700">POD</text>
        <text x="60" y="76" textAnchor="middle" fontSize="5" fill="rgba(255,255,255,0.15)" fontFamily="system-ui,sans-serif">Parity</text>
      </svg>
    ),
  },
];

export default function FrameworkShowcase() {
  const [expanded, setExpanded] = useState(false);
  const [openId, setOpenId] = useState<string | null>(null);

  return (
    <section className={`w-full px-5 pt-1 ${expanded ? "pb-16" : "pb-2"}`} style={{ background: "#09090b" }}>
      <div className="max-w-6xl mx-auto">
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full flex items-center justify-between gap-3 px-6 py-4 rounded-xl border transition-all duration-200 hover:bg-white/[0.02] group"
          style={{ borderColor: "rgba(255,255,255,0.06)", background: expanded ? "rgba(255,255,255,0.015)" : "rgba(255,255,255,0.01)" }}
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold uppercase tracking-[0.2em] text-neutral-400 group-hover:text-neutral-300 transition-colors">
                8 Proven Frameworks
              </span>
            </div>
          </div>
          <svg className={`w-5 h-5 shrink-0 transition-transform duration-300 text-neutral-500 ${expanded ? "rotate-180" : ""}`}
            fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
            <path d="M6 9l6 6 6-6" />
          </svg>
        </button>

        {expanded && (
          <div className="mt-4 animate-in slide-in-from-top-2 duration-200">
            <div className="text-center mb-5">
              <h2 className="font-body italic text-2xl text-white tracking-tight">
                Powered by brand strategy that works.
              </h2>
              <p className="text-xs text-neutral-500 mt-1 max-w-xl mx-auto">
                Your brand gets diagnosed across every major strategy framework — no cherry-picking, no fluff.
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
              {FRAMEWORKS.map((fw) => {
                const isOpen = openId === fw.id;
                return (
                  <div
                    key={fw.id}
                    onClick={() => setOpenId(isOpen ? null : fw.id)}
                    className="rounded-xl border transition-all duration-200 cursor-pointer hover:scale-[1.02]"
                    style={{
                      background: fw.bg,
                      borderColor: isOpen ? fw.accent + "44" : fw.border,
                      boxShadow: isOpen ? `0 0 20px ${fw.accent}08` : "none",
                    }}
                  >
                    <div className="p-3 pb-2">
                      <div className="mb-2" style={{ opacity: 0.85 }}>
                        <fw.Diagram />
                      </div>
                      <h3 className="text-xs font-semibold text-white tracking-tight leading-snug">
                        {fw.title}
                      </h3>
                      <p className="text-[10px] text-neutral-500 mt-1 leading-relaxed line-clamp-2">
                        {fw.desc}
                      </p>
                    </div>
                    {isOpen && (
                      <div className="px-3 pb-3 pt-0">
                        <div className="h-px w-full mb-2" style={{ background: `linear-gradient(90deg, transparent, ${fw.accent}33, transparent)` }} />
                        <p className="text-[10px] text-neutral-400 leading-relaxed">
                          {fw.detail}
                        </p>
                      </div>
                    )}
                    <div className="px-3 pb-2 flex items-center justify-end">
                      <svg
                        className={`w-3 h-3 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
                        style={{ color: fw.accent, opacity: 0.5 }}
                        fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"
                      >
                        <path d="M6 9l6 6 6-6" />
                      </svg>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
