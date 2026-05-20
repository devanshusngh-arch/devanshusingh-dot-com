import { useState, useEffect, useRef } from "react";
import { useBrandAnalysis } from "./useBrandAnalysis";
import BrandDashboard from "./BrandDashboard";
import { extractJSON, stripJSON, enrichFromNarrative, normalizeBrandData } from "./utils";
import type { Message } from "./useBrandAnalysis";

const QUICK_PROMPTS = [
  "Biggest brand risk right now?",
  "How would you reposition this?",
  "Write a positioning statement",
  "Compare mental vs physical availability",
  "Which archetype fits best?",
  "What's the cultural tension here?",
];

type Props = {
  initialBrand?: string;
  onDone?: () => void;
  demoMessages?: Message[];
  onResult?: (data: { brand: string; messages: Message[] }) => void;
  onError?: () => void;
};

const ACCENT = "#6366f1";

export default function BrandBoard({ initialBrand, onDone, demoMessages, onResult, onError }: Props) {
  const { messages, loading, error, sendMessage } = useBrandAnalysis(!!initialBrand && !demoMessages);
  const [input, setInput] = useState("");
  const [started, setStarted] = useState(false);
  const reportedRef = useRef(false);

  const isRealSearch = !!initialBrand && !demoMessages;
  const [loadPhase, setLoadPhase] = useState<"progress" | "skeleton" | null>(
    isRealSearch ? "progress" : null
  );
  const [elapsed, setElapsed] = useState(0);

  // Real elapsed counter during progress phase
  useEffect(() => {
    if (loadPhase !== "progress") return;
    const t = setInterval(() => setElapsed(s => s + 1), 1000);
    return () => clearInterval(t);
  }, [loadPhase]);

  // Progress phase holds until API actually completes
  useEffect(() => {
    if (loadPhase !== "progress") return;
    if (loading) return;
    if (!(messages.length >= 2 || error)) return;
    setLoadPhase("skeleton");
  }, [loadPhase, loading, messages.length, error]);

  // Skeleton: exactly 1s, then null = show report
  useEffect(() => {
    if (loadPhase !== "skeleton") return;
    const t = setTimeout(() => setLoadPhase(null), 1000);
    return () => clearTimeout(t);
  }, [loadPhase]);

  // Thinking steps — spaced every 6s for a typical 60s API window
  const THINK_STEPS: [number, string][] = [
    [0, "Reading brand data…"],
    [6, "Mapping brand equity dimensions…"],
    [12, "Analysing market positioning…"],
    [18, "Building SWOT analysis…"],
    [24, "Profiling target audience…"],
    [30, "Mapping competitive landscape…"],
    [36, "Identifying strategic opportunities…"],
    [42, "Evaluating brand health scores…"],
    [48, "Calculating mental & physical availability…"],
    [54, "Almost there…"],
  ];
  const thinkText = [...THINK_STEPS].reverse().find(([t]) => elapsed >= t)?.[1] ?? "Almost there…";

  useEffect(() => {
    if (demoMessages) return;
    if (initialBrand && !started) {
      setStarted(true);
      sendMessage(`Do a full brand strategy analysis of ${initialBrand}`);
    }
  }, [initialBrand, started, sendMessage, demoMessages]);

  const displayMessages = demoMessages || messages;

  useEffect(() => {
    if (demoMessages && onDone) { onDone(); return; }
    if (started && !loading && messages.length > 0 && onDone) {
      onDone();
    }
  }, [loading, started, messages.length, onDone, demoMessages]);

  // Error displays inside the modal — don't auto-close via onError
  // (onError would close the modal before the user can see the error)

  useEffect(() => {
    if (!onResult || demoMessages) return;
    if (!started || (loading && !reportedRef.current)) return;
    if (messages.length < 2 || reportedRef.current) return;
    const brandMsg = messages[0];
    const resultMsg = messages[1];
    const brand = brandMsg.content.replace(/^Do a full brand strategy analysis of /i, "").trim();
    onResult({ brand, messages: messages.slice(0, 2) });
    reportedRef.current = true;
  }, [loading, started, messages, onResult, demoMessages]);

  function handleSend(text: string) {
    if (!text.trim() || loading) return;
    sendMessage(text);
    setInput("");
  }

  return (
    <div className="pt-4 px-1">
      <div className="space-y-5">
        {/* ---- loading phase (floating balls + thinking steps) ---- */}
        {loadPhase === "progress" && (
          <div className="flex flex-col items-center justify-center py-12 gap-5 animate-in"
            style={{ animation: "boardIn 0.3s ease-out both" }}>
            {/* Floating balls */}
            <div className="flex items-center gap-2.5 h-12">
              {[0,1,2].map(i => (
                <div key={i} className="w-3 h-3 rounded-full animate-floatBounce"
                  style={{
                    backgroundColor: "#6366f1",
                    animationDelay: `${i * 0.25}s`,
                    opacity: 0.6,
                  }} />
              ))}
            </div>
            <div className="text-center mt-2">
              <p className="text-sm font-medium text-white">Marcus is cooking…</p>
              <p className="text-xs text-neutral-400 mt-1.5 h-4 transition-all duration-300">{thinkText}</p>
            </div>
          </div>
        )}

        {/* ---- skeleton phase ---- */}
        {loadPhase === "skeleton" && (
          <div className="animate-in mb-2" style={{ animation: "boardIn 0.25s ease-out both" }}>
            <div className="flex items-center gap-3 mb-5">
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-semibold shrink-0"
                style={{ background: `${ACCENT}1a`, color: ACCENT }}>M</div>
              <span className="text-xs text-neutral-500">Almost there…</span>
            </div>
            <div className="p-[1px] rounded-[1.5rem]" style={{ background: "linear-gradient(135deg,rgba(255,255,255,0.06),rgba(255,255,255,0.02))" }}>
              <div className="rounded-[calc(1.5rem-1px)] bg-[#0c0c12] p-3 sm:p-5 space-y-5">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <div className="skeleton h-7 w-36 rounded-lg" />
                    <div className="skeleton h-3 w-52 rounded-full" />
                  </div>
                  <div className="skeleton h-14 w-14 rounded-full" />
                </div>
                <div className="flex gap-2 flex-wrap">
                  {[80,72,90,60,76,88,64].map((w,i) => (
                    <div key={i} className="skeleton h-7 rounded-full shrink-0" style={{ width: w }} />
                  ))}
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {[0,1,2].map(i => (
                    <div key={i} className="skeleton h-16 rounded-xl" />
                  ))}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="skeleton h-32 rounded-xl" />
                  <div className="space-y-2">
                    {[100,85,70,65,55].map((w,i) => (
                      <div key={i} className="skeleton h-5 rounded-full" style={{ width: `${w}%` }} />
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="skeleton h-20 rounded-xl" />
                  <div className="skeleton h-20 rounded-xl" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ---- report phase ---- */}
        {loadPhase === null && (
          <>
            {displayMessages.map((m, i) => {
              if (i === 0 && m.role === "user") return null;
              const isUser = m.role === "user";
              const rawData = !isUser ? extractJSON(m.content) : null;
              const narrative = !isUser ? stripJSON(m.content) : m.content;
              const data = !isUser && rawData ? normalizeBrandData(enrichFromNarrative(rawData, narrative) || {}) : null;

              return (
                <div key={i} className="animate-in" style={{ animation: "boardIn 0.35s ease-out both" }}>
                  {isUser ? (
                    <div className="flex justify-end">
                      <div className="max-w-[70%] px-4 py-2.5 text-sm text-white leading-relaxed"
                        style={{
                          borderRadius: "14px 14px 4px 14px",
                          background: "linear-gradient(135deg, rgba(255,255,255,0.08), rgba(255,255,255,0.04))",
                        }}>
                        {narrative}
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-semibold shrink-0 mt-1"
                        style={{ background: `${ACCENT}1a`, color: ACCENT }}>
                        M
                      </div>
                      <div className="flex-1 min-w-0 space-y-4">
                        {data ? (
                          <BrandDashboard data={data} narrative={narrative} />
                        ) : (
                          <div className="px-1 py-2 text-sm text-neutral-500">{narrative}</div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}

            {error && (
              <div className="animate-in p-[1px] rounded-xl" style={{ animation: "boardIn 0.3s ease-out both", background: "linear-gradient(135deg, rgba(239,68,68,0.2), rgba(239,68,68,0.05))" }}>
                <div className="rounded-[calc(1rem-1px)] bg-[#0c0c12] px-4 py-3 text-sm text-red-400">
                  {error}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {loadPhase === null && displayMessages.length > 1 && (
        <div className="flex gap-2 flex-wrap py-5">
          {QUICK_PROMPTS.map((p, i) => (
            <button key={i} onClick={() => handleSend(p)} disabled={loading}
              className="text-[11px] px-3.5 py-1.5 rounded-full border text-neutral-500 hover:text-white transition-all duration-200 disabled:cursor-not-allowed"
              style={{ borderColor: "rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.015)" }}>
              {p}
            </button>
          ))}
        </div>
      )}

      {loadPhase === null && displayMessages.length > 0 && !demoMessages && (
        <div className="pt-6 pb-12">
          {loading && (
            <div className="flex items-center gap-2 mb-3 px-1">
              <div className="h-px flex-1" style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.06), transparent)" }} />
              <span className="text-[10px] text-neutral-600 shrink-0">or ask something specific</span>
              <div className="h-px flex-1" style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.06), transparent)" }} />
            </div>
          )}
          <div className="flex items-center gap-1 p-1 rounded-2xl"
            style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
            <input value={input} onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(input); } }}
              placeholder="Ask Marcus…"
              disabled={loading}
              className="flex-1 h-10 px-4 bg-transparent text-sm text-white placeholder-neutral-600 outline-none disabled:opacity-50" />
            <button onClick={() => handleSend(input)} disabled={loading || !input.trim()}
              className="h-9 px-4 rounded-xl text-sm font-medium text-white transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.97]"
              style={{ background: `linear-gradient(135deg, ${ACCENT}, #8b5cf6)` }}>
              Ask Marcus
            </button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes boardIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes floatBounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-14px); }
        }
        .animate-floatBounce {
          animation: floatBounce 1.2s ease-in-out infinite;
        }
        .skeleton {
          background: linear-gradient(90deg, rgba(255,255,255,0.03) 25%, rgba(255,255,255,0.07) 50%, rgba(255,255,255,0.03) 75%);
          background-size: 200% 100%;
          animation: shimmer 1.8s ease-in-out infinite;
        }
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }

      `}</style>
    </div>
  );
}

