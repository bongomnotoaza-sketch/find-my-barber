// src/utils/barberServices.ts

export type BarberServiceCategory =
  | "hair"
  | "beard"
  | "shave"
  | "combined"
  | "kids";

export interface DefaultBarberService {
  code: string;
  name: string;
  category: BarberServiceCategory;
  imageUrl: string;
}

export const DEFAULT_BARBER_SERVICES: DefaultBarberService[] = [
  // ─────────────────────────────
  // HAIR
  // ─────────────────────────────

  {
    code: "H001",
    name: "Basic Clipper Cut",
    category: "hair",
    imageUrl:
      "https://images.unsplash.com/photo-1621605815971-fbc98d665033",
  },

  {
    code: "H002",
    name: "Low Fade",
    category: "hair",
    imageUrl:
      "https://images.unsplash.com/photo-1622286342621-4bd786c2447c",
  },

  {
    code: "H003",
    name: "Mid Fade",
    category: "hair",
    imageUrl:
      "https://images.unsplash.com/photo-1503951914875-452162b0f3f1",
  },

  {
    code: "H004",
    name: "High Fade",
    category: "hair",
    imageUrl:
      "https://images.unsplash.com/photo-1622288432450-277d0fef5ed6",
  },

  {
    code: "H005",
    name: "Taper",
    category: "hair",
    imageUrl:
      "https://images.unsplash.com/photo-1621605815971-fbc98d665033",
  },

  {
    code: "H006",
    name: "Buzz Cut",
    category: "hair",
    imageUrl:
      "https://images.unsplash.com/photo-1599351431202-1e0f0137899a",
  },

  {
    code: "H007",
    name: "Bald / Skin Cut",
    category: "hair",
    imageUrl:
      "https://images.unsplash.com/photo-1503951914875-452162b0f3f1",
  },

  {
    code: "H008",
    name: "Scissors Cut",
    category: "hair",
    imageUrl:
      "https://images.unsplash.com/photo-1621605815971-fbc98d665033",
  },

  {
    code: "H009",
    name: "Afro Cut",
    category: "hair",
    imageUrl:
      "https://images.unsplash.com/photo-1534297635766-a262cdcb8ee4",
  },

  {
    code: "H010",
    name: "Line-up / Edge-up",
    category: "hair",
    imageUrl:
      "https://images.unsplash.com/photo-1622286342621-4bd786c2447c",
  },

  {
    code: "H011",
    name: "Hair Design",
    category: "hair",
    imageUrl:
      "https://images.unsplash.com/photo-1599351431202-1e0f0137899a",
  },

  // ─────────────────────────────
  // BEARD
  // ─────────────────────────────

  {
    code: "B001",
    name: "Beard Trim",
    category: "beard",
    imageUrl:
      "https://images.unsplash.com/photo-1621605815971-fbc98d665033",
  },

  {
    code: "B002",
    name: "Beard Shape-up",
    category: "beard",
    imageUrl:
      "https://images.unsplash.com/photo-1503951914875-452162b0f3f1",
  },

  {
    code: "B003",
    name: "Beard Line-up",
    category: "beard",
    imageUrl:
      "https://images.unsplash.com/photo-1622286342621-4bd786c2447c",
  },

  {
    code: "B004",
    name: "Full Beard Grooming",
    category: "beard",
    imageUrl:
      "https://images.unsplash.com/photo-1599351431202-1e0f0137899a",
  },

  {
    code: "B005",
    name: "Mustache Trim",
    category: "beard",
    imageUrl:
      "https://images.unsplash.com/photo-1621605815971-fbc98d665033",
  },

  // ─────────────────────────────
  // SHAVING
  // ─────────────────────────────

  {
    code: "S001",
    name: "Clean Shave",
    category: "shave",
    imageUrl:
      "https://images.unsplash.com/photo-1503951914875-452162b0f3f1",
  },

  {
    code: "S002",
    name: "Hot Towel Shave",
    category: "shave",
    imageUrl:
      "https://images.unsplash.com/photo-1622288432450-277d0fef5ed6",
  },

  // ─────────────────────────────
  // COMBINED
  // ─────────────────────────────

  {
    code: "C001",
    name: "Fade + Beard",
    category: "combined",
    imageUrl:
      "https://images.unsplash.com/photo-1622286342621-4bd786c2447c",
  },

  {
    code: "C002",
    name: "Taper + Beard",
    category: "combined",
    imageUrl:
      "https://images.unsplash.com/photo-1621605815971-fbc98d665033",
  },

  {
    code: "C003",
    name: "Buzz Cut + Beard",
    category: "combined",
    imageUrl:
      "https://images.unsplash.com/photo-1599351431202-1e0f0137899a",
  },

  {
    code: "C004",
    name: "Bald / Skin Cut + Beard",
    category: "combined",
    imageUrl:
      "https://images.unsplash.com/photo-1503951914875-452162b0f3f1",
  },

  {
    code: "C005",
    name: "Hair Design + Beard",
    category: "combined",
    imageUrl:
      "https://images.unsplash.com/photo-1622286342621-4bd786c2447c",
  },

  // ─────────────────────────────
  // KIDS
  // ─────────────────────────────

  {
    code: "K001",
    name: "Kids Basic Cut",
    category: "kids",
    imageUrl:
      "https://images.unsplash.com/photo-1599351431202-1e0f0137899a",
  },

  {
    code: "K002",
    name: "Kids Fade",
    category: "kids",
    imageUrl:
      "https://images.unsplash.com/photo-1622286342621-4bd786c2447c",
  },

  {
    code: "K003",
    name: "Kids Line-up",
    category: "kids",
    imageUrl:
      "https://images.unsplash.com/photo-1621605815971-fbc98d665033",
  },

  {
    code: "K004",
    name: "Kids Hair Design",
    category: "kids",
    imageUrl:
      "https://images.unsplash.com/photo-1599351431202-1e0f0137899a",
  },
];