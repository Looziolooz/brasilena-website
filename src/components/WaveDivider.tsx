import { cn } from "@/lib/utils";

interface WaveDividerProps {
  /** Fill color of the wave shapes (the color that "drips" over the layer below). */
  color?: string;
  /** Flip vertically so the wave hangs from the top of a section. */
  flip?: boolean;
  className?: string;
}

/**
 * Repeating soft wave edge used between the cream and colored sections on
 * brasilena.net. The wave tile mirrors the site's `#waves` path rhythm.
 */
export function WaveDivider({ color = "#fe3e29", flip = false, className }: WaveDividerProps) {
  return (
    <div
      className={cn("pointer-events-none w-full leading-[0]", className)}
      style={flip ? { transform: "scaleY(-1)" } : undefined}
      aria-hidden="true"
    >
      <svg
        className="block h-[clamp(40px,7vw,120px)] w-full"
        viewBox="0 0 1656.91 120"
        preserveAspectRatio="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          fill={color}
          d="M1656.91 120V8c-114.82 0-144 10.7-281.25 10.7S1199.96 8 1101.7 8s-161.28 13.3-280.37 13.3S612.53 8 512.13 8 363.67 18.7 253.66 18.7 116.92 8 .5 8v112h1656.41Z"
        />
      </svg>
    </div>
  );
}
