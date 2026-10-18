export type VehicleImage = { src: string; alt: string; label: string };
export type Vehicle = {
  slug: string; name: string; make: string; year: string; image: string; cutout?: string; alt: string;
  availability: string; condition: "Tokunbo" | "Nigerian used" | "New"; price: string; priceValue: number; gallery: VehicleImage[];
  featuredImage?:string; description?:string; specifications?:{label:string;value:string}[]; videos?:string[]; featured?:boolean; status?:"published"|"draft"|"archived"; showPrice?:boolean; restockExpected?:boolean;
};

const existingGallery = (lead: VehicleImage, slug: string, entries: [string, string, string][]) => [
  lead,
  ...entries.map(([file, alt, label]) => ({ src: `/vehicles/${slug}/${file}`, alt, label })),
];

const originalGallery = (slug: string, lead: number, count: number, vehicleName: string): VehicleImage[] => {
  const order = [lead, ...Array.from({ length: count }, (_, index) => index + 1).filter((number) => number !== lead)];
  return order.map((number, index) => ({
    src: `/vehicles/${slug}/${String(number).padStart(2, "0")}.jpeg`,
    alt: `${index === 0 ? "Original exterior view" : `View ${index + 1}`} of the ${vehicleName}`,
    label: index === 0 ? "Original exterior" : `View ${index + 1}`,
  }));
};

export const vehicles: Vehicle[] = [
  {
    slug: "lexus-lx-600", name: "2025 Lexus LX 600", make: "Lexus", year: "2025",
    image: "/inventory/lexus-lx600-studio.webp", cutout: "/inventory/lexus-lx600.webp", alt: "Front view of a dark grey 2025 Lexus LX 600",
    availability: "Available", condition: "Tokunbo", price: "₦265,000,000", priceValue: 265000000,
    gallery: existingGallery({ src: "/inventory/lexus-lx600-studio.webp", alt: "Front view of a dark grey 2025 Lexus LX 600", label: "Front view" }, "lexus-lx-600", [["rear-three-quarter.jpeg", "2025 Lexus LX 600 from the rear three-quarter view", "Rear three-quarter"], ["rear.jpeg", "Rear view of the 2025 Lexus LX 600 with lamps on", "Rear view"], ["cabin.jpeg", "Front cabin and seats of the 2025 Lexus LX 600", "Cabin"], ["detail.jpeg", "Close view of the 2025 Lexus LX 600 grille", "Exterior detail"]]),
  },
  {
    slug: "2019-toyota-corolla", name: "2019 Toyota Corolla", make: "Toyota", year: "2019",
    image: "/inventory/toyota-corolla-2019-studio.webp", cutout: "/inventory/toyota-corolla-2019.webp", alt: "Blue 2019 Toyota Corolla from the front side",
    availability: "Available", condition: "Tokunbo", price: "₦19,500,000", priceValue: 19500000,
    gallery: existingGallery({ src: "/inventory/toyota-corolla-2019-studio.webp", alt: "Blue 2019 Toyota Corolla from the front side", label: "Front profile" }, "2019-toyota-corolla", [["front-three-quarter.jpeg", "Blue 2019 Toyota Corolla from the front three-quarter view", "Front three-quarter"], ["rear.jpeg", "Rear view of the blue 2019 Toyota Corolla", "Rear view"], ["cabin.jpeg", "Driver area and front cabin of the 2019 Toyota Corolla", "Cabin"], ["rear-seats.jpeg", "Rear seating of the 2019 Toyota Corolla", "Rear seats"], ["engine.jpeg", "Engine bay of the 2019 Toyota Corolla", "Engine bay"]]),
  },
  {
    slug: "mercedes-benz-gle", name: "2024 Mercedes-Benz GLE 53 Coupe", make: "Mercedes-Benz", year: "2024",
    image: "/inventory/mercedes-gle-white-studio.webp", cutout: "/inventory/mercedes-gle-white.webp", alt: "White 2024 Mercedes-Benz GLE 53 Coupe from the front side",
    availability: "Available", condition: "Tokunbo", price: "₦210,000,000", priceValue: 210000000,
    gallery: existingGallery({ src: "/inventory/mercedes-gle-white-studio.webp", alt: "White 2024 Mercedes-Benz GLE 53 Coupe from the front side", label: "Front three-quarter" }, "mercedes-benz-gle", [["rear.jpeg", "Rear view of the white 2024 Mercedes-Benz GLE 53 Coupe", "Rear view"], ["cargo.jpeg", "Open cargo area of the 2024 Mercedes-Benz GLE 53 Coupe", "Cargo area"], ["cabin.jpeg", "Front cabin and seats of the 2024 Mercedes-Benz GLE 53 Coupe", "Cabin"], ["cockpit.jpeg", "Cockpit and instrument view of the 2024 Mercedes-Benz GLE 53 Coupe", "Cockpit"]]),
  },
  {
    slug: "2017-lexus-rx-350", name: "2017 Lexus RX 350", make: "Lexus", year: "2017",
    image: "/inventory/lexus-rx350-2017-studio.webp", cutout: "/inventory/lexus-rx350-2017.webp", alt: "Black 2017 Lexus RX 350 from the front side",
    availability: "Available", condition: "Tokunbo", price: "₦37,000,000", priceValue: 37000000,
    gallery: existingGallery({ src: "/inventory/lexus-rx350-2017-studio.webp", alt: "Black 2017 Lexus RX 350 from the front side", label: "Front three-quarter" }, "2017-lexus-rx-350", [["rear.jpeg", "Rear view of the black 2017 Lexus RX 350", "Rear view"], ["rear-three-quarter.jpeg", "Rear three-quarter view of the 2017 Lexus RX 350", "Rear three-quarter"], ["cabin.jpeg", "Front cabin and seats of the 2017 Lexus RX 350", "Cabin"], ["rear-seats.jpeg", "Rear seating of the 2017 Lexus RX 350", "Rear seats"], ["engine.jpeg", "Engine bay of the 2017 Lexus RX 350", "Engine bay"]]),
  },
  {
    slug: "2014-lexus-nx-200t", name: "2014 Lexus NX 200t", make: "Lexus", year: "2014",
    image: "/inventory/lexus-nx200t-2014-studio.webp", cutout: "/inventory/lexus-nx200t-2014-cutout.webp", alt: "2014 Lexus NX 200t exterior view",
    availability: "Available", condition: "Tokunbo", price: "₦29,500,000", priceValue: 29500000,
    gallery: [{ src: "/inventory/lexus-nx200t-2014-studio.webp", alt: "2014 Lexus NX 200t exterior view", label: "Lead view" }, ...originalGallery("2014-lexus-nx-200t", 3, 4, "2014 Lexus NX 200t")],
  },
  {
    slug: "lexus-rx-350-blue", name: "2013 Lexus RX 350", make: "Lexus", year: "2013",
    image: "/inventory/lexus-rx350-blue-studio.webp", cutout: "/inventory/lexus-rx350-blue.webp", alt: "Blue 2013 Lexus RX 350 from the front side",
    availability: "Available", condition: "Tokunbo", price: "₦18,500,000", priceValue: 18500000,
    gallery: existingGallery({ src: "/inventory/lexus-rx350-blue-studio.webp", alt: "Blue 2013 Lexus RX 350 from the front side", label: "Front three-quarter" }, "lexus-rx-350-blue", [["front.jpeg", "Front view of the blue 2013 Lexus RX 350", "Front view"], ["rear-three-quarter.jpeg", "Rear three-quarter view of the blue 2013 Lexus RX 350", "Rear three-quarter"], ["cabin.jpeg", "Cockpit and front cabin of the blue 2013 Lexus RX 350", "Cabin"], ["rear-seats.jpeg", "Rear seating of the blue 2013 Lexus RX 350", "Rear seats"], ["engine.jpeg", "Engine bay of the blue 2013 Lexus RX 350", "Engine bay"]]),
  },
  {
    slug: "2011-lexus-rx-350", name: "2011 Lexus RX 350", make: "Lexus", year: "2011",
    image: "/inventory/lexus-rx350-2011-studio.webp", cutout: "/inventory/lexus-rx350-2011-cutout.webp", alt: "2011 Lexus RX 350 exterior view",
    availability: "Available", condition: "Tokunbo", price: "₦16,500,000", priceValue: 16500000,
    gallery: [{ src: "/inventory/lexus-rx350-2011-studio.webp", alt: "2011 Lexus RX 350 exterior view", label: "Lead view" }, ...originalGallery("2011-lexus-rx-350", 11, 13, "2011 Lexus RX 350")],
  },
  {
    slug: "2018-mercedes-benz-gle-350", name: "2018 Mercedes-Benz GLE 350", make: "Mercedes-Benz", year: "2018",
    image: "/inventory/mercedes-gle-350-studio.webp", cutout: "/inventory/mercedes-gle-350.webp", alt: "Dark blue 2018 Mercedes-Benz GLE 350 from the rear side",
    availability: "Available", condition: "Tokunbo", price: "₦35,000,000", priceValue: 35000000,
    gallery: existingGallery({ src: "/inventory/mercedes-gle-350-studio.webp", alt: "Dark blue 2018 Mercedes-Benz GLE 350 from the rear side", label: "Rear three-quarter" }, "2018-mercedes-benz-gle-350", [["front.jpeg", "Front view of the 2018 Mercedes-Benz GLE 350", "Front view"], ["rear.jpeg", "Rear view of the 2018 Mercedes-Benz GLE 350", "Rear view"], ["cabin.jpeg", "Cockpit and front cabin of the 2018 Mercedes-Benz GLE 350", "Cabin"], ["rear-seats.jpeg", "Rear seating of the 2018 Mercedes-Benz GLE 350", "Rear seats"], ["engine.jpeg", "Engine bay of the 2018 Mercedes-Benz GLE 350", "Engine bay"]]),
  },
];

export const contact = {
  whatsapp: [{ display: "0911 878 1995", href: "https://wa.me/2349118781995" }, { display: "0911 467 9578", href: "https://wa.me/2349114679578" }],
  phones: [{ display: "0911 878 1995", href: "tel:+2349118781995" }, { display: "0911 467 9578", href: "tel:+2349114679578" }, { display: "+234 707 881 2157", href: "tel:+2347078812157" }],
  emails: ["Boujeelux24@gmail.com", "Chidamooreglobal@gmail.com"],
  instagram: "https://instagram.com/Boujeelux24",
};

export const getVehicle = (slug: string) => vehicles.find((vehicle) => vehicle.slug === slug);
