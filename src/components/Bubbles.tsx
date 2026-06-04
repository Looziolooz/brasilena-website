import { cn } from "@/lib/utils";
import { BubbleIcon } from "@/components/icons";

interface BubblesProps {
  count?: number;
  className?: string;
  /** CSS color for the bubble outlines. */
  color?: string;
}

// Deterministic pseudo-random so server and client render identically.
function rand(seed: number) {
  const x = Math.sin(seed * 99.13) * 10000;
  return x - Math.floor(x);
}

/**
 * Global drifting-bubble overlay, echoing brasilena.net's `b-bubbles` layer.
 * Bubbles rise slowly up the viewport with randomized size / position / timing.
 */
export function Bubbles({ count = 36, className, color = "currentColor" }: BubblesProps) {
  const bubbles = Array.from({ length: count }, (_, i) => {
    const size = 6 + rand(i + 1) * 26;
    const left = rand(i + 2) * 100;
    const duration = 14 + rand(i + 3) * 18;
    const delay = -rand(i + 4) * duration;
    const opacity = 0.12 + rand(i + 5) * 0.3;
    const scale = 0.6 + rand(i + 6) * 0.9;
    return { i, size, left, duration, delay, opacity, scale };
  });

  // Mobile-first: render only the first half on small screens for performance,
  // reveal the rest from `sm` upward.
  const mobileCount = Math.ceil(count / 2);

  return (
    <div
      aria-hidden="true"
      className={cn("pointer-events-none fixed inset-0 z-1 overflow-hidden", className)}
      style={{ color }}
    >
      {bubbles.map((b) => (
        <span
          key={b.i}
          className={cn("absolute -bottom-10 block", b.i >= mobileCount && "hidden sm:block")}
          style={{
            left: `${b.left}%`,
            width: `${b.size}px`,
            height: `${b.size}px`,
            ["--b-opacity" as string]: b.opacity,
            ["--b-scale" as string]: b.scale,
            animation: `rise ${b.duration}s linear ${b.delay}s infinite`,
          }}
        >
          <BubbleIcon className="size-full" />
        </span>
      ))}
    </div>
  );
}
