#!/usr/bin/env bash
# Rebuild the hero's scroll-scrub frames in public/frames-pop/.
#
# The shoot delivered 18 frames (public/images/brasilena/pop-1..18.webp). Spread
# over the hero's 3.4-viewport pin that is ~170px of scroll per frame, which
# reads as stepping rather than pouring. This interpolates them up to 49 with
# ffmpeg's motion-compensated interpolation, so the liquid moves continuously.
#
# Usage: ./scripts/build-hero-frames.sh      (needs ffmpeg on PATH)
set -euo pipefail

SRC="public/images/brasilena"
DEST="public/frames-pop"

# Tuned against the pop beat, where the cap is small and fast — the worst case
# for block matching. mb_size=8 tore the cap apart; me=epzs smeared the liquid
# tip. umh with a wide search window and 16px blocks keeps both intact.
# scd=none stops the splash growth from being read as a scene cut.
FILTER="mi_mode=mci:mc_mode=aobmc:me_mode=bidir:me=umh:mb_size=16:search_param=96:vsbmc=1:scd=none"

# 960 covers every phone, tablet and non-retina desktop and lands *lighter*
# than the old 18-frame set; 1600 is only fetched by high-density stages.
# Keep these in sync with FRAME_SETS in BrasilenaScrollSequence.tsx.
for WIDTH in 960 1600; do
  OUT="$DEST/$WIDTH"
  rm -rf "$OUT"
  mkdir -p "$OUT"
  ffmpeg -y -loglevel error \
    -framerate 18 -start_number 1 -i "$SRC/pop-%d.webp" \
    -vf "minterpolate=fps=54:$FILTER,scale=$WIDTH:-1:flags=lanczos" \
    -c:v libwebp -quality 72 -compression_level 6 \
    "$OUT/f-%03d.webp"
  echo "$WIDTH: $(find "$OUT" -name '*.webp' | wc -l) frames, $(du -sh "$OUT" | cut -f1)"
done

# minterpolate drops a few frames at the sequence boundaries, so the real count
# is 49 rather than the 54 the fps= implies. FRAME_COUNT must match it.
echo
echo "Set FRAME_COUNT in src/components/BrasilenaScrollSequence.tsx to the count above."
