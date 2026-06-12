"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { FORM } from "@/content/brasilena";
import { cn } from "@/lib/utils";

type StepKey = "name" | "email" | "message" | "privacy";
const ORDER: StepKey[] = ["name", "email", "message", "privacy"];

/**
 * c-form — conversational multi-step contact form. Tabs switch intent;
 * steps advance with inline validation; final submit shows the success state.
 */
export function ContactForm() {
  const [tab, setTab] = useState(0);
  const [step, setStep] = useState(0);
  const [values, setValues] = useState({ name: "", email: "", message: "", privacy: false });
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  // Focus the active step's field WITHOUT scrolling — and never on first paint.
  // (Plain `autoFocus` grabbed focus on load and jumped the page down to the form.)
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement | null>(null);
  const setRef = (el: HTMLInputElement | HTMLTextAreaElement | null) => {
    inputRef.current = el;
  };
  const mounted = useRef(false);
  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true;
      return;
    }
    inputRef.current?.focus({ preventScroll: true });
  }, [step, tab]);

  const key = ORDER[step];

  function validateCurrent(): boolean {
    if (key === "name" && values.name.trim() === "") return fail(FORM.steps.name.error);
    if (key === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) return fail(FORM.steps.email.error);
    if (key === "message" && values.message.trim() === "") return fail(FORM.steps.message.error);
    if (key === "privacy" && !values.privacy) return fail(FORM.privacyError);
    setError(null);
    return true;
  }
  function fail(msg: string) {
    setError(msg);
    return false;
  }
  function next() {
    if (!validateCurrent()) return;
    if (step === ORDER.length - 1) setDone(true);
    else setStep((s) => s + 1);
  }
  function back() {
    setError(null);
    setStep((s) => Math.max(0, s - 1));
  }

  return (
    <section id="form" data-scroll-align="center" className="relative scroll-mt-24 overflow-hidden bg-brasilena-cream">
      {/* Brasilena señorita — the brand's vintage mascot, vectorised into a
          clean stylised illustration, in the decorative corner the crocodile
          used to hold. `unoptimized` serves the SVG directly. */}
      <Image
        src="/images/brasilena/senorita.svg"
        alt=""
        width={500}
        height={500}
        unoptimized
        aria-hidden="true"
        data-parallax="0.14"
        className="pointer-events-none absolute bottom-[clamp(1rem,4vw,4rem)] right-[clamp(0.5rem,4vw,4rem)] h-[clamp(8rem,18vw,21rem)] w-auto object-contain drop-shadow-[0_14px_28px_rgba(106,63,64,0.28)]"
      />

      <div className="mx-auto flex min-h-[80vh] w-full max-w-3xl flex-col justify-center px-[clamp(1.25rem,6vw,6.25rem)] py-[clamp(4rem,9vw,8rem)]">
        {done ? (
          // No `.reveal` here — this node mounts after useReveal's one-shot
          // observer has run, so the class would leave it permanently hidden.
          <div className="text-center">
            <h2 className="font-display text-brasilena-red uppercase leading-[0.85] text-[clamp(3rem,8vw,6rem)]">
              {FORM.successTitle}
            </h2>
            <p className="mx-auto mt-4 max-w-sm text-base leading-snug text-brasilena-ink/80">
              {FORM.successText}
            </p>
          </div>
        ) : (
          <>
            <header className="reveal reveal-down text-center">
              <h2 className="font-display text-brasilena-red uppercase leading-[0.85] text-[clamp(3rem,8vw,6rem)]">
                {FORM.title}
              </h2>
              <p className="mx-auto mt-3 max-w-md text-base leading-snug text-brasilena-ink/80">
                {FORM.subtitle}
              </p>
            </header>

            {/* Tabs */}
            <div className="mt-8 flex justify-center gap-2">
              {FORM.tabs.map((label, i) => (
                <button
                  key={label}
                  onClick={() => setTab(i)}
                  className={cn(
                    "rounded-full border px-5 py-2.5 font-sans text-sm font-medium uppercase tracking-wide transition-colors",
                    tab === i
                      ? "border-brasilena-red bg-brasilena-red text-brasilena-cream"
                      : "border-brasilena-red/40 text-brasilena-red hover:border-brasilena-red",
                  )}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* Step */}
            <div className="mt-10">
              <label className="block font-display text-3xl uppercase leading-none text-brasilena-ink">
                {FORM.steps[key as "name" | "email" | "message"]?.label ?? FORM.privacy}
              </label>
              {key !== "privacy" && (
                <p className="mt-2 text-sm text-brasilena-ink/70">
                  {FORM.steps[key as "name" | "email" | "message"].help}
                </p>
              )}

              <div className="mt-5">
                {key === "name" && (
                  <input
                    ref={setRef}
                    value={values.name}
                    onChange={(e) => setValues((v) => ({ ...v, name: e.target.value }))}
                    onKeyDown={(e) => e.key === "Enter" && next()}
                    className="w-full border-b-2 border-brasilena-ink/30 bg-transparent pb-2 font-sans text-xl outline-none focus:border-brasilena-red"
                  />
                )}
                {key === "email" && (
                  <input
                    ref={setRef}
                    type="email"
                    value={values.email}
                    onChange={(e) => setValues((v) => ({ ...v, email: e.target.value }))}
                    onKeyDown={(e) => e.key === "Enter" && next()}
                    className="w-full border-b-2 border-brasilena-ink/30 bg-transparent pb-2 font-sans text-xl outline-none focus:border-brasilena-red"
                  />
                )}
                {key === "message" && (
                  <textarea
                    ref={setRef}
                    rows={3}
                    value={values.message}
                    onChange={(e) => setValues((v) => ({ ...v, message: e.target.value }))}
                    className="w-full resize-none border-b-2 border-brasilena-ink/30 bg-transparent pb-2 font-sans text-xl outline-none focus:border-brasilena-red"
                  />
                )}
                {key === "privacy" && (
                  <label className="flex items-start gap-3 text-sm text-brasilena-ink/80">
                    <input
                      type="checkbox"
                      checked={values.privacy}
                      onChange={(e) => setValues((v) => ({ ...v, privacy: e.target.checked }))}
                      className="mt-0.5 size-5 accent-brasilena-red"
                    />
                    <span>{FORM.privacy}</span>
                  </label>
                )}
              </div>

              {error && <p className="mt-3 text-sm font-medium text-brasilena-red">{error}</p>}
              {key === "privacy" && (
                <p className="mt-4 text-[11px] leading-snug text-brasilena-ink/50">{FORM.recaptcha}</p>
              )}

              <div className="mt-8 flex items-center gap-3">
                {step > 0 && (
                  <button
                    onClick={back}
                    className="rounded-full border border-brasilena-ink/40 px-5 py-3 font-sans text-sm font-medium uppercase tracking-wide text-brasilena-ink transition-colors hover:border-brasilena-ink"
                  >
                    {FORM.back}
                  </button>
                )}
                <button
                  onClick={next}
                  className="rounded-full border border-brasilena-red bg-brasilena-red px-7 py-3 font-sans text-sm font-medium uppercase tracking-wide text-brasilena-cream transition-opacity hover:opacity-90"
                >
                  {step === ORDER.length - 1 ? FORM.submit : "→"}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
