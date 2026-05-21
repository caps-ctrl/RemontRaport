"use client";

import { Icon } from "@/components/ui/Icon";

export function PrintReportButton() {
  return (
    <button
      className="inline-flex h-11 items-center justify-center gap-2 rounded-[8px] bg-slate-950 px-5 text-sm font-extrabold text-white shadow-[0_12px_24px_rgba(15,23,42,0.18)] transition hover:bg-slate-800"
      onClick={() => window.print()}
      type="button"
    >
      <Icon name="download" className="size-5" />
      Drukuj / zapisz PDF
    </button>
  );
}
