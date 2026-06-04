"use client";

import { useState } from "react";
import { COOKIE } from "@/content/brasilena";

/** Bottom cookie-consent bar, matching the live site's banner copy + actions. */
export function CookieBanner() {
  const [open, setOpen] = useState(true);
  if (!open) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-[60] flex justify-center p-3 sm:p-5">
      <div className="flex w-full max-w-3xl flex-col gap-3 rounded-2xl bg-white px-5 py-4 shadow-[0_8px_40px_rgba(0,0,0,0.18)] sm:flex-row sm:items-center sm:gap-5">
        <div className="flex-1">
          <p className="font-sans text-[11px] font-semibold uppercase tracking-wide text-[#1a1a1a]">
            {COOKIE.title}
          </p>
          <p className="mt-1 text-[11px] leading-snug text-[#5b5b5b]">
            {COOKIE.text}{" "}
            <a href="/politica-cookie" className="underline">
              {COOKIE.policy}
            </a>
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <button
            onClick={() => setOpen(false)}
            className="rounded-full bg-brasilena-ink px-4 py-2 text-[11px] font-semibold uppercase tracking-wide text-white transition-opacity hover:opacity-85"
          >
            {COOKIE.accept}
          </button>
          <button
            onClick={() => setOpen(false)}
            className="rounded-full px-3 py-2 text-[11px] font-semibold uppercase tracking-wide text-[#5b5b5b] transition-colors hover:text-[#1a1a1a]"
          >
            {COOKIE.reject}
          </button>
          <button
            onClick={() => setOpen(false)}
            className="px-2 text-[11px] font-semibold uppercase tracking-wide text-[#5b5b5b] underline transition-colors hover:text-[#1a1a1a]"
          >
            {COOKIE.customize}
          </button>
        </div>
      </div>
    </div>
  );
}
