import Link from "next/link";
import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

type Tone = "red" | "cream" | "ink";

const tones: Record<Tone, string> = {
  red: "border-brasilena-red text-brasilena-red hover:bg-brasilena-red hover:text-brasilena-cream",
  cream:
    "border-brasilena-cream text-brasilena-cream hover:bg-brasilena-cream hover:text-brasilena-red",
  ink: "border-brasilena-ink text-brasilena-ink hover:bg-brasilena-ink hover:text-brasilena-yellow",
};

interface PillButtonProps extends Omit<ComponentProps<typeof Link>, "href"> {
  href?: string;
  tone?: Tone;
}

/**
 * Outline pill CTA — GT America 14px/500 uppercase, fully rounded, brand red.
 * Matches the live `.c-button` styling.
 */
export function PillButton({ href = "#", tone = "red", className, children, ...rest }: PillButtonProps) {
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex items-center justify-center rounded-full border px-7 py-3.5 font-sans text-sm font-medium uppercase tracking-wide transition-colors duration-300",
        tones[tone],
        className,
      )}
      {...rest}
    >
      {children}
    </Link>
  );
}
