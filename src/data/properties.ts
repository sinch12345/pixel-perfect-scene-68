export type PropertyType = "Villa" | "Apartment" | "Townhouse" | "Studio";
export type Neighborhood = "Lakeside" | "Old Town" | "Hillcrest" | "Harbour";
export type Vibe =
  | "Sunlit mornings"
  | "Quiet street"
  | "Pet friendly"
  | "Work-from-home ready"
  | "Great for hosting";

export type Property = {
  id: string;
  name: string;
  area: Neighborhood;
  type: PropertyType;
  price: number;
  beds: number;
  baths: number;
  sqft: number;
  images: [string, string, string];
  latitude: number;
  longitude: number;
  vibes: [Vibe, Vibe];
  description: string;
  listedOn: string;
  status: "New" | "Price drop" | "Just listed" | "Open Sunday";
};

export const neighborhoods: Neighborhood[] = ["Lakeside", "Old Town", "Hillcrest", "Harbour"];
export const propertyTypes: PropertyType[] = ["Villa", "Apartment", "Townhouse", "Studio"];
export const vibes: Vibe[] = [
  "Sunlit mornings",
  "Quiet street",
  "Pet friendly",
  "Work-from-home ready",
  "Great for hosting",
];

const photos = {
  coastal: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=85",
  home: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=85",
  living: "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1200&q=85",
  exterior: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=85",
  apartment: "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1200&q=85",
  interior: "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?auto=format&fit=crop&w=1200&q=85",
  house: "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?auto=format&fit=crop&w=1200&q=85",
  kitchen: "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1200&q=85",
  room: "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=1200&q=85",
};

export const properties: Property[] = [
  {
    id: "sunroom-villa",
    name: "The Sunroom Villa",
    area: "Lakeside",
    type: "Villa",
    price: 785000,
    beds: 4,
    baths: 3,
    sqft: 2400,
    images: [photos.coastal, photos.living, photos.kitchen],
    latitude: 41.412,
    longitude: -70.614,
    vibes: ["Sunlit mornings", "Great for hosting"],
    description: "A light-filled retreat with lake breezes, a generous garden and room for everyone. Start the day slowly in the glass-walled breakfast room, then gather outside as the evening rolls in.",
    listedOn: "2026-10-15",
    status: "New",
  },
  {
    id: "corner-loft",
    name: "Corner Loft on Baker Lane",
    area: "Old Town",
    type: "Apartment",
    price: 320000,
    beds: 2,
    baths: 1,
    sqft: 980,
    images: [photos.apartment, photos.interior, photos.room],
    latitude: 41.425,
    longitude: -70.632,
    vibes: ["Work-from-home ready", "Quiet street"],
    description: "A bright corner home where tall windows meet thoughtful modern finishes. Settle into a walkable neighborhood with bakeries, bookshops and the harbor all close by.",
    listedOn: "2026-10-12",
    status: "Just listed",
  },
  {
    id: "hilltop-garden",
    name: "Hilltop Garden House",
    area: "Hillcrest",
    type: "Townhouse",
    price: 540000,
    beds: 3,
    baths: 2,
    sqft: 1750,
    images: [photos.house, photos.living, photos.kitchen],
    latitude: 41.438,
    longitude: -70.596,
    vibes: ["Pet friendly", "Sunlit mornings"],
    description: "A welcoming three-bedroom home with a private garden and a lovely outlook over the hill. Open living spaces make everyday routines feel easy and weekends feel like a treat.",
    listedOn: "2026-10-08",
    status: "Open Sunday",
  },
  {
    id: "harbour-light",
    name: "Harbour Light Studio",
    area: "Harbour",
    type: "Studio",
    price: 185000,
    beds: 1,
    baths: 1,
    sqft: 520,
    images: [photos.interior, photos.apartment, photos.room],
    latitude: 41.401,
    longitude: -70.641,
    vibes: ["Sunlit mornings", "Quiet street"],
    description: "A cleverly designed studio with soft morning light and a calm, coastal feel. An easy stroll brings you to the water, local cafés and everything you need close at hand.",
    listedOn: "2026-10-03",
    status: "Price drop",
  },
  {
    id: "lantern-court",
    name: "Lantern Court Townhouse",
    area: "Old Town",
    type: "Townhouse",
    price: 465000,
    beds: 3,
    baths: 2,
    sqft: 1500,
    images: [photos.exterior, photos.kitchen, photos.living],
    latitude: 41.429,
    longitude: -70.62,
    vibes: ["Pet friendly", "Great for hosting"],
    description: "A classic townhome with a fresh, open-plan heart and a little outdoor space of your own. Friends can linger around the kitchen island while the neighborhood does the rest.",
    listedOn: "2026-09-28",
    status: "New",
  },
  {
    id: "willow-water",
    name: "Willow Water Apartment",
    area: "Lakeside",
    type: "Apartment",
    price: 255000,
    beds: 2,
    baths: 2,
    sqft: 880,
    images: [photos.room, photos.apartment, photos.interior],
    latitude: 41.405,
    longitude: -70.607,
    vibes: ["Work-from-home ready", "Sunlit mornings"],
    description: "A peaceful, easy-care home with two well-separated bedrooms and a bright living room. Enjoy leafy walks nearby and a quiet spot to recharge at the end of the day.",
    listedOn: "2026-09-20",
    status: "Price drop",
  },
  {
    id: "ridge-estate",
    name: "The Ridge Estate",
    area: "Hillcrest",
    type: "Villa",
    price: 1250000,
    beds: 5,
    baths: 4,
    sqft: 3800,
    images: [photos.coastal, photos.exterior, photos.house],
    latitude: 41.446,
    longitude: -70.59,
    vibes: ["Great for hosting", "Pet friendly"],
    description: "Room to spread out, bring everyone together and make the most of the coast. Expansive windows, generous entertaining spaces and a beautifully private setting make this a rare find.",
    listedOn: "2026-09-15",
    status: "Open Sunday",
  },
  {
    id: "mariners-rest",
    name: "Mariner's Rest",
    area: "Harbour",
    type: "Apartment",
    price: 395000,
    beds: 2,
    baths: 2,
    sqft: 1100,
    images: [photos.home, photos.living, photos.interior],
    latitude: 41.394,
    longitude: -70.636,
    vibes: ["Quiet street", "Work-from-home ready"],
    description: "A composed, modern apartment with space for a proper home office and guests. Step outside to a neighborhood that feels like a deep breath beside the sea.",
    listedOn: "2026-09-09",
    status: "Just listed",
  },
];

export const formatPrice = (price: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(price);