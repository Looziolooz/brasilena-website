// Adapt the "Anni '70 — L'acqua della Calabria" photo for the cronostoria:
// crop to the timeline's 4:3 frame and apply a warm 1970s vintage tone.
//
// Usage:  node scripts/process-acqua.mjs <input-image> [output]
// Default output: public/images/acqua-calabria.webp
import sharp from "sharp";
import { existsSync } from "node:fs";
import path from "node:path";

const input = process.argv[2];
const output =
  process.argv[3] ?? path.resolve("public/images/acqua-calabria.webp");

if (!input || !existsSync(input)) {
  console.error(`Input non trovato: ${input ?? "(nessun percorso passato)"}`);
  console.error("Uso: node scripts/process-acqua.mjs <percorso-immagine> [output]");
  process.exit(1);
}

const W = 1280;
const H = 960; // 4:3 — matches the timeline media frame

await sharp(input)
  .resize(W, H, { fit: "cover", position: "attention" })
  // pull saturation back and warm the midtones a touch
  .modulate({ saturation: 0.82, brightness: 1.03 })
  .gamma(1.04)
  // soft warm wash → 1970s film tone (subtle, non-destructive)
  .composite([
    {
      input: {
        create: { width: W, height: H, channels: 4, background: { r: 150, g: 95, b: 40, alpha: 0.22 } },
      },
      blend: "soft-light",
    },
  ])
  .webp({ quality: 82 })
  .toFile(output);

const meta = await sharp(output).metadata();
console.log(`OK → ${output} (${meta.width}x${meta.height}, ${meta.format})`);
