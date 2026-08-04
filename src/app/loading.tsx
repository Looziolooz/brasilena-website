import { LOADER } from "@/content/brasilena";

/**
 * Route-level loading UI (App Router), shown while a segment is still
 * streaming.
 *
 * Deliberately just the brand yellow and a line of type. The homepage opens on
 * its own gate, and this can flash immediately before it — anything with a
 * bottle in it read as a second, competing opening screen that the gate then
 * landed on top of. Keeping the yellow constant makes the two continuous.
 */
export default function Loading() {
  return (
    <div
      className="grid min-h-svh w-full place-items-center bg-brasilena-yellow"
      role="status"
      aria-live="polite"
    >
      <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-brasilena-ink/60 md:text-[11px]">
        {LOADER.label}
      </span>
    </div>
  );
}
