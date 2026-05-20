import { useEffect, useRef } from "react";
import type { Message } from "./useBrandAnalysis";
import BrandBoard from "./BrandBoard";

type Props = {
  open: boolean;
  onClose: () => void;
  demoMessages?: Message[];
  brand?: string;
  onResult?: (data: { brand: string; messages: Message[] }) => void;
  onError?: () => void;
};

export default function ReportModal({ open, onClose, demoMessages, brand, onResult, onError }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollPosRef = useRef(0);

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    scrollPosRef.current = window.scrollY;
    document.body.style.overflow = "hidden";
    containerRef.current?.focus();
    return () => {
      document.removeEventListener("keydown", handler);
      document.body.style.overflow = "";
      window.scrollTo(0, scrollPosRef.current);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      ref={containerRef}
      role="dialog"
      aria-modal="true"
      aria-label="Brand Analysis Report"
      tabIndex={-1}
      className="fixed inset-0 z-50 flex items-start justify-center pt-4 sm:pt-12 pb-4 sm:pb-12 px-2 sm:px-4 outline-none"
      style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)" }}>
      <div className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-xl sm:rounded-2xl"
        style={{ background: "#09090b", border: "1px solid rgba(255,255,255,0.08)" }}>
        <div className="sticky top-0 z-10 flex items-center justify-between px-3 sm:px-5 py-3"
          style={{ background: "#09090b", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          <h2 className="text-xs sm:text-sm font-medium text-white">Brand Analysis</h2>
          <button onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-neutral-500 hover:text-white hover:bg-white/[0.06] transition-all duration-200">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M4 4l8 8M12 4l-8 8" />
            </svg>
          </button>
        </div>
        <div className="px-3 sm:px-5 pt-3 pb-5">
          {demoMessages ? (
            <BrandBoard demoMessages={demoMessages} onResult={onResult} onError={onError} />
          ) : brand ? (
            <BrandBoard initialBrand={brand} onResult={onResult} onError={onError} />
          ) : null}
        </div>
      </div>
    </div>
  );
}
