import { useState } from "react";

type Props = {
  item: {
    title: string;
    desc: string;
    color: string;
    detail: string;
  };
};

export default function FrameworkCard({ item }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <button
      onClick={() => setOpen(!open)}
      className="text-left rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3 transition-all hover:border-white/[0.12] hover:bg-white/[0.04]"
    >
      <div className="flex items-center justify-between gap-2 mb-0.5">
        <span
          className="text-xs font-medium"
          style={{ color: item.color }}
        >
          {item.title}
        </span>
        <span className="text-[10px] text-neutral-600 shrink-0">
          {open ? "▲" : "▼"}
        </span>
      </div>
      <p className="text-[11px] text-neutral-500">{item.desc}</p>
      {open && (
        <p className="text-xs text-neutral-400 mt-2 pt-2 border-t border-white/[0.06] leading-relaxed">
          {item.detail}
        </p>
      )}
    </button>
  );
}
