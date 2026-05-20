import { useState, useCallback, useEffect } from "react";
import BrandOrbitHero from "../BrandOrbitHero";
import ReportModal from "./ReportModal";
import FrameworkShowcase from "./FrameworkShowcase";
import { BeamsBackground } from "../ui/beams-background";
import { DEMO_MESSAGES } from "./demo";
import type { Message } from "./useBrandAnalysis";

const STORAGE_KEY = "marcus_recent";
const MAX_RECENT = 13;

type SavedReport = {
  brand: string;
  messages: Message[];
  timestamp: number;
};

function loadRecent(): SavedReport[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function saveRecent(report: SavedReport) {
  const list = loadRecent();
  const filtered = list.filter(r => r.brand !== report.brand);
  const updated = [report, ...filtered].slice(0, MAX_RECENT);
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(updated)); } catch {}
}

function timeAgo(ts: number): string {
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

export default function MarcusPage() {
  const [brand, setBrand] = useState<string | null>(null);
  const [demo, setDemo] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [savedMessages, setSavedMessages] = useState<Message[] | null>(null);
  const [recent, setRecent] = useState<SavedReport[]>([]);

  useEffect(() => {
    setRecent(loadRecent());
  }, []);

  const handleAnalyse = useCallback((name: string) => {
    setBrand(name);
    setDemo(false);
    setLoading(true);
    setSavedMessages(null);
    setShowModal(true);
  }, []);

  const handleTest = useCallback(() => {
    setBrand("Nike");
    setDemo(true);
    setLoading(false);
    setSavedMessages(null);
    setShowModal(true);
  }, []);

  const handleResult = useCallback((data: { brand: string; messages: Message[] }) => {
    const report: SavedReport = { brand: data.brand, messages: data.messages, timestamp: Date.now() };
    saveRecent(report);
    setRecent(loadRecent());
    setLoading(false);
  }, []);

  const handleOpenSaved = useCallback((report: SavedReport) => {
    setBrand(report.brand);
    setDemo(false);
    setLoading(false);
    setSavedMessages(report.messages);
    setShowModal(true);
  }, []);

  const handleError = useCallback(() => {
    setLoading(false);
    setShowModal(false);
    setSavedMessages(null);
  }, []);

  const handleClose = useCallback(() => {
    setShowModal(false);
    setLoading(false);
    setSavedMessages(null);
  }, []);

  return (
    <BeamsBackground intensity="subtle">
      <BrandOrbitHero onAnalyse={handleAnalyse} onTest={handleTest} loading={loading} />
      <FrameworkShowcase />

      {recent.length > 0 && (
        <section className="w-full px-5 pb-8" style={{ background: "#09090b" }}>
          <div className="max-w-6xl mx-auto">
            <div className="w-full flex items-center gap-3 px-6 py-3 rounded-xl border"
              style={{ borderColor: "rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.01)" }}
            >
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-neutral-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5" aria-hidden="true">
                  <path d="M12 8v4l3 3M12 3a9 9 0 100 18 9 9 0 000-18z" />
                </svg>
                <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-neutral-500">
                  Recent Reports
                </h2>
                <span className="text-[10px] text-neutral-600 font-medium ml-1">{recent.length}</span>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 mt-3">
              {recent.map((r) => (
                <button
                  key={r.timestamp}
                  onClick={() => handleOpenSaved(r)}
                  className="flex items-center gap-2 px-3.5 py-2 rounded-lg border transition-all duration-200 hover:bg-white/[0.03] group"
                  style={{ borderColor: "rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.015)" }}
                >
                  <span className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-semibold"
                    style={{ background: "rgba(99,102,241,0.12)", color: "#818cf8" }}>
                    {r.brand[0]}
                  </span>
                  <div className="text-left">
                    <p className="text-xs font-medium text-neutral-300 group-hover:text-white transition-colors">{r.brand}</p>
                    <p className="text-[10px] text-neutral-600">{timeAgo(r.timestamp)}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </section>
      )}

      <div className="flex-1" style={{ background: "#09090b" }} />

      <ReportModal
        open={showModal}
        onClose={handleClose}
        demoMessages={demo ? DEMO_MESSAGES : savedMessages || undefined}
        brand={(!demo && !savedMessages) ? brand || undefined : undefined}
        onResult={handleResult}
        onError={handleError}
      />
    </BeamsBackground>
  );
}
