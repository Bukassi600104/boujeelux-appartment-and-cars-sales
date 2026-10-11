// Cinematic exterior edits are used in the homepage selection and sourcing feature.
// Original inventory and detail-gallery photographs remain untouched.
export const featuredScenes: Record<string, { src: string; location: string }> = {
  "lexus-lx-600": { src: "/inventory/lagos/lexus-lx600.webp", location: "Marina" },
  "2019-toyota-corolla": { src: "/inventory/lagos/toyota-corolla-2019.webp", location: "Victoria Island" },
  "mercedes-benz-gle": { src: "/inventory/lagos/mercedes-gle-white.webp", location: "Eko Atlantic" },
  "2017-lexus-rx-350": { src: "/inventory/lagos/lexus-rx350-2017.webp", location: "Ikoyi" },
  "2014-lexus-nx-200t": { src: "/inventory/lagos/lexus-nx200t-2014.webp", location: "Lekki Phase 1" },
  "lexus-rx-350-blue": { src: "/inventory/lagos/lexus-rx350-blue.webp", location: "Third Mainland Bridge" },
  "2011-lexus-rx-350": { src: "/inventory/lagos/lexus-rx350-2011.webp", location: "Onikan" },
  "2018-mercedes-benz-gle-350": { src: "/inventory/lagos/mercedes-gle-350.webp", location: "Banana Island" },
};

// Every homepage alternate uses the actual vehicle's front-cabin photograph.
export const cabinPreviews: Record<string, string> = {
  "lexus-lx-600": "/vehicles/lexus-lx-600/cabin.jpeg",
  "2019-toyota-corolla": "/vehicles/2019-toyota-corolla/cabin.jpeg",
  "mercedes-benz-gle": "/vehicles/mercedes-benz-gle/cabin.jpeg",
  "2017-lexus-rx-350": "/vehicles/2017-lexus-rx-350/cabin.jpeg",
  "2014-lexus-nx-200t": "/vehicles/2014-lexus-nx-200t/04.jpeg",
  "lexus-rx-350-blue": "/vehicles/lexus-rx-350-blue/cabin.jpeg",
  "2011-lexus-rx-350": "/vehicles/2011-lexus-rx-350/08.jpeg",
  "2018-mercedes-benz-gle-350": "/vehicles/2018-mercedes-benz-gle-350/cabin.jpeg",
};
