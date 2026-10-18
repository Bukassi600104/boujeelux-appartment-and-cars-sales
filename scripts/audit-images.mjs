import { readdir, readFile, stat } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const publicDir = path.join(root, "public");
const sourceDirs = ["app", "components", "lib"];
const sourceExtensions = new Set([".ts", ".tsx", ".js", ".jsx", ".css"]);
const imageExtensions = new Set([".avif", ".gif", ".jpeg", ".jpg", ".png", ".svg", ".webp"]);

async function walk(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const absolute = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...await walk(absolute));
    else files.push(absolute);
  }
  return files;
}

const sourceFiles = (await Promise.all(sourceDirs.map(async directory => {
  const absolute = path.join(root, directory);
  try { return await walk(absolute); } catch { return []; }
}))).flat().filter(file => sourceExtensions.has(path.extname(file).toLowerCase()));

const referencePattern = /["'`](\/[^"'`?#\s)]+\.(?:avif|gif|jpe?g|png|svg|webp))(?:[?#][^"'`\s)]*)?["'`)]/gi;
const references = new Map();
for (const file of sourceFiles) {
  const content = await readFile(file, "utf8");
  for (const match of content.matchAll(referencePattern)) {
    const asset = match[1];
    const owners = references.get(asset) ?? [];
    owners.push(path.relative(root, file).replaceAll("\\", "/"));
    references.set(asset, owners);
  }
}

const publicFiles = (await walk(publicDir)).filter(file => imageExtensions.has(path.extname(file).toLowerCase()));
const publicRecords = await Promise.all(publicFiles.map(async file => ({
  asset: `/${path.relative(publicDir, file).replaceAll("\\", "/")}`,
  bytes: (await stat(file)).size,
})));
const byAsset = new Map(publicRecords.map(record => [record.asset, record]));

const missing = [...references].filter(([asset]) => !byAsset.has(asset)).map(([asset, owners]) => ({ asset, owners: [...new Set(owners)] }));
const referenced = publicRecords.filter(record => references.has(record.asset));
const unreferenced = publicRecords.filter(record => !references.has(record.asset) && !record.asset.startsWith("/optimized/"));
const large = publicRecords.filter(record => record.bytes >= 1_000_000).sort((a, b) => b.bytes - a.bytes);

const siblingGroups = new Map();
for (const record of publicRecords.filter(record => !record.asset.startsWith("/optimized/"))) {
  const key = record.asset.replace(/\.(avif|gif|jpe?g|png|svg|webp)$/i, "");
  const siblings = siblingGroups.get(key) ?? [];
  siblings.push(record);
  siblingGroups.set(key, siblings);
}
const redundantCandidates = [...siblingGroups.entries()]
  .filter(([, files]) => files.length > 1)
  .map(([basename, files]) => ({ basename, files: files.sort((a, b) => b.bytes - a.bytes) }));

const optimizedMissing = [];
for (const record of referenced.filter(record => /\.(jpe?g|png|webp)$/i.test(record.asset) && !record.asset.startsWith("/optimized/"))) {
  for (const width of [480, 960]) {
    const variant = `/optimized/${width}${record.asset.replace(/\.(jpe?g|png|webp)$/i, ".webp")}`;
    if (!byAsset.has(variant)) optimizedMissing.push({ source: record.asset, variant });
  }
}

const bytes = records => records.reduce((total, record) => total + record.bytes, 0);
const result = {
  summary: {
    sourceFilesScanned: sourceFiles.length,
    references: references.size,
    publicImages: publicRecords.length,
    publicImageBytes: bytes(publicRecords),
    referencedImageBytes: bytes(referenced),
    missingReferences: missing.length,
    largeFilesAtLeast1MB: large.length,
    unreferencedNonOptimized: unreferenced.length,
    redundantSiblingGroups: redundantCandidates.length,
    missingStandardOptimizedVariants: optimizedMissing.length,
  },
  missing,
  referenced: referenced.sort((a, b) => b.bytes - a.bytes),
  large,
  optimizedMissing,
  redundantCandidates,
  unreferenced,
};

console.log(JSON.stringify(result, null, 2));
if (missing.length) process.exitCode = 1;
