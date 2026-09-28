import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const root = "C:/Users/USER/Desktop/Boujeelux";
const folders = process.argv.slice(2);

for (const folder of folders) {
  const source = path.join(root, folder);
  const files = (await fs.readdir(source)).filter((name) => /\.(jpe?g|png|webp)$/i.test(name));
  const tileWidth = 240;
  const tileHeight = 210;
  const columns = 4;
  const rows = Math.ceil(files.length / columns);
  const layers = [];

  for (let index = 0; index < files.length; index += 1) {
    const image = await sharp(path.join(source, files[index]))
      .rotate()
      .resize(tileWidth, 170, { fit: "cover" })
      .jpeg({ quality: 78 })
      .toBuffer();
    const label = Buffer.from(`<svg width="${tileWidth}" height="40"><rect width="100%" height="100%" fill="#111"/><text x="10" y="25" fill="white" font-size="16" font-family="Arial">${index + 1}: ${files[index].replace(/&/g, "&amp;")}</text></svg>`);
    const tile = await sharp({ create: { width: tileWidth, height: tileHeight, channels: 3, background: "#111" } })
      .composite([{ input: image, top: 0, left: 0 }, { input: label, top: 170, left: 0 }])
      .jpeg({ quality: 82 })
      .toBuffer();
    layers.push({ input: tile, left: (index % columns) * tileWidth, top: Math.floor(index / columns) * tileHeight });
  }

  await sharp({ create: { width: columns * tileWidth, height: rows * tileHeight, channels: 3, background: "#ddd" } })
    .composite(layers)
    .jpeg({ quality: 86 })
    .toFile(path.join(root, `${folder}-contact-sheet.jpg`));
}
