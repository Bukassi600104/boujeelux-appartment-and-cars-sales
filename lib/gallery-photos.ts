// Refined copies retain the original locations, camera angles and vehicle condition.
// The manufacturer's identification label stays as its untouched source photograph.
export function galleryPhoto(src: string) {
  if (!src.startsWith("/vehicles/") || src === "/vehicles/2011-lexus-rx-350/09.jpeg") return src;
  return src.replace("/vehicles/", "/vehicles/polished/").replace(/\.jpeg$/, ".webp");
}
