import trackedAssets from "./cms/assets.json" with { type: "json" };

const availableAssets = new Set<string>(trackedAssets);
const smallerSources: Record<string, number> = {
  "/inventory/lexus-lx600.webp": 570,
  "/inventory/lexus-rx350-2017.webp": 570,
  "/vehicles/mercedes-benz-gle/cabin.jpeg": 750,
  "/vehicles/2017-lexus-rx-350/cabin.jpeg": 810,
};

function optimizedVariant(src: string, size: 480 | 960 | "thumb") {
  return `/optimized/${size}${src.replace(/\.(jpe?g|png|webp)$/i, ".webp")}`;
}

export function imageVariant(src: string, size: 480 | 960 | "thumb") {
  const variant = optimizedVariant(src, size);
  return availableAssets.has(variant) ? variant : src;
}

export function imageSources(src: string) {
  return ([480, 960] as const).flatMap(size => {
    const variant = optimizedVariant(src, size);
    return availableAssets.has(variant)
      ? [`${variant} ${size === 480 ? 480 : smallerSources[src] ?? 960}w`]
      : [];
  }).join(", ");
}

// Focal points are calibrated to the photographed vehicle, rather than the sky or road.
const galleryPositions: Record<string, string> = {
  "/inventory/lagos/lexus-lx600.webp": "50% 45%",
  "/inventory/lagos/toyota-corolla-2019.webp": "50% 35%",
  "/inventory/lagos/mercedes-gle-white.webp": "50% 35%",
  "/inventory/lagos/lexus-rx350-2017.webp": "50% 40%",
  "/inventory/lagos/lexus-nx200t-2014.webp": "50% 45%",
  "/inventory/lagos/lexus-rx350-blue.webp": "50% 50%",
  "/inventory/lagos/lexus-rx350-2011.webp": "50% 50%",
  "/inventory/lagos/mercedes-gle-350.webp": "50% 50%",
  "/vehicles/polished/lexus-lx-600/rear-three-quarter.webp": "50% 85%",
  "/vehicles/polished/lexus-lx-600/rear.webp": "50% 85%",
  "/vehicles/polished/2017-lexus-rx-350/rear-three-quarter.webp": "50% 99%",
  "/vehicles/polished/2017-lexus-rx-350/rear.webp": "50% 75%",
  "/vehicles/polished/2014-lexus-nx-200t/03.webp": "50% 80%",
  "/vehicles/polished/2014-lexus-nx-200t/01.webp": "50% 60%",
  "/vehicles/polished/mercedes-benz-gle/rear.webp": "50% 70%",
  "/vehicles/polished/mercedes-benz-gle/cargo.webp": "50% 50%",
};

export function galleryPosition(src: string) {
  return galleryPositions[src] ?? "50% 50%";
}
