import { useEffect, useRef, useState } from "react";

function BrandOrbitSVG() {
  const ref = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const svg = ref.current;
    if (!svg) return;
    const circles = svg.querySelectorAll<SVGCircleElement>("circle[data-rotate]");
    let angle = 0;
    let running = true;

    const tick = () => {
      if (!running) return;
      angle += 0.002;
      circles.forEach((c, i) => {
        const speeds = [1, -0.7, 0.5];
        const rot = angle * (speeds[i] || 1);
        c.setAttribute("stroke-dashoffset", `${rot}`);
      });
      raf = requestAnimationFrame(tick);
    };
    let raf = requestAnimationFrame(tick);

    return () => { running = false; cancelAnimationFrame(raf); };
  }, []);

  return (
    <svg ref={ref} viewBox="0 0 1000 1000" className="w-full h-full" preserveAspectRatio="xMidYMid meet">
      <defs>
        <radialGradient id="glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="rgba(255,255,255,0.06)" />
          <stop offset="35%" stopColor="rgba(255,255,255,0.02)" />
          <stop offset="100%" stopColor="transparent" />
        </radialGradient>
      </defs>
      <circle cx="500" cy="500" r="420" fill="url(#glow)" />
      <circle cx="500" cy="500" r="400" fill="none" stroke="rgba(255,255,255,0.025)" strokeWidth="0.5" strokeDasharray="4 12" data-rotate aria-hidden="true" />
      <circle cx="500" cy="500" r="260" fill="none" stroke="rgba(255,255,255,0.02)" strokeWidth="0.5" strokeDasharray="3 10" data-rotate aria-hidden="true" />
      <circle cx="500" cy="500" r="150" fill="none" stroke="rgba(255,255,255,0.015)" strokeWidth="0.5" strokeDasharray="2 8" data-rotate aria-hidden="true" />
      <circle cx="500" cy="500" r={3} fill="rgba(255,255,255,0.06)" aria-hidden="true" />
    </svg>
  );
}

type Props = {
  onAnalyse: (brand: string) => void;
  onTest?: () => void;
  loading?: boolean;
};

const SUGGESTED = ["Swiggy","Nykaa","Zepto","Groww","Physics Wallah","Scaler","Razorpay","boAt"];

export default function BrandOrbitHero({ onAnalyse, onTest, loading }: Props) {
  const [input, setInput] = useState("");
  const [focused, setFocused] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !loading) {
      onAnalyse(input.trim());
      setInput("");
    }
  };

  return (
    <div className="w-full overflow-hidden">
      <div className="relative w-full min-h-[75vh] overflow-hidden">
        {/* Orbitals */}
        <div className="absolute inset-0 w-full h-full pointer-events-none select-none"
          style={{ perspective: "1200px", transform: "perspective(1200px) rotateX(14deg)", transformOrigin: "center bottom" }}>
          <div className="absolute inset-0 opacity-[0.28]">
            <BrandOrbitSVG />
          </div>
        </div>

        {/* Gradient fade */}
        <div className="absolute inset-0 z-10 pointer-events-none"
          style={{ background: "linear-gradient(to top, #09090b 10%, rgba(9,9,11,0.6) 30%, transparent 100%)" }} />

        {/* Content */}
        <div className="relative z-20 w-full min-h-[75vh] flex flex-col items-center justify-center gap-5 px-5">

          <div className="hero-fade text-center">
            <h1 className="font-body italic font-normal text-white tracking-tight leading-none"
              style={{ fontSize: "clamp(3.25rem, 7vw, 5.75rem)" }}>
              Meet Marcus.
            </h1>
            <p className="font-body italic font-normal text-white/60 tracking-tight mt-3"
              style={{ fontSize: "clamp(1.5rem, 3.25vw, 2.6rem)", lineHeight: "1.25" }}>
              Your AI brand strategist.
            </p>
          </div>

          <p className="hero-fade text-base text-neutral-500 text-center max-w-xl leading-relaxed" style={{ animationDelay: "0.15s" }}>
            Instant brand audits. Powered by proven strategy frameworks.
          </p>

          <div className="hero-fade flex gap-3 items-center justify-center" style={{ animationDelay: "0.2s" }}>
            <button onClick={onTest}
              className="px-4 py-2 rounded-full text-sm font-medium border border-white/[0.08] text-neutral-400 hover:text-white hover:border-white/20 hover:bg-white/[0.04] transition-all duration-200">
              Quick Demo
            </button>
          </div>

          <div className="hero-fade w-full max-w-xl mt-2" style={{ animationDelay: "0.3s" }}>
            <form onSubmit={handleSubmit}>
              <div className="relative h-[72px] group">
                <input value={input} onChange={(e) => setInput(e.target.value)}
                  onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
                  placeholder="Type a brand name..." disabled={loading}
                  aria-label="Brand name"
                  className="w-full h-full pl-8 pr-[170px] rounded-full focus:outline-none focus:ring-2 focus:ring-[#3b5ce4] text-base text-white placeholder-zinc-500 transition-all duration-300 disabled:opacity-50"
                  style={{ backgroundColor: "#27272a", border: "1px solid", borderColor: focused ? "rgba(255,255,255,0.2)" : "rgba(255,255,255,0.08)" }} />
                <div className="absolute top-[8px] right-[8px] bottom-[8px]">
                  <button type="submit" disabled={loading || !input.trim()}
                    className="h-full px-8 rounded-full text-base font-medium text-white transition-all duration-200 active:scale-[0.97] hover:brightness-110 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2 justify-center min-w-[145px]"
                    style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)", opacity: loading ? 0.7 : 1 }}>
                    {loading ? (
                      <>
                        <svg className="animate-spin h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        <span>Analysing…</span>
                      </>
                    ) : "Run Audit"}
                  </button>
                </div>
              </div>
            </form>
          </div>

          <div className="hero-fade flex flex-wrap justify-center gap-3 max-w-3xl" style={{ animationDelay: "0.45s" }}>
            {SUGGESTED.map((b, i) => (
              <button key={b} onClick={() => onAnalyse(b)} disabled={loading}
                className="px-4 py-2 rounded-full border border-white/[0.06] bg-white/[0.02] text-sm text-neutral-500 hover:text-white hover:border-white/20 hover:bg-white/[0.04] transition-all duration-200 disabled:opacity-40"
                style={{ animationDelay: `${0.5 + i * 0.05}s` }}>
                {b}
              </button>
            ))}
          </div>
        </div>

        <style>{`
          .hero-fade {
            opacity: 0;
            transform: translateY(12px);
            animation: heroUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          }
          @keyframes heroUp {
            to { opacity: 1; transform: translateY(0); }
          }
        `}</style>
      </div>
    </div>
  );
}
