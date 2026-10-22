// src/utils/barberServices.ts

export type BarberServiceCategory =
  | "hair"
  | "beard"
  | "shave"
  | "combined"
  | "kids"
  // ── Female / salon categories ──
  | "womens-cut"
  | "womens-styling"
  | "colour"
  | "braids"
  | "weave-wig"
  | "chemical"
  | "treatments";

export interface DefaultBarberService {
  code: string;
  name: string;
  category: BarberServiceCategory;
  /** Primary image (remote, category-matched). */
  imageUrl: string;
  /** Fallback shown when the remote image fails: your PWA logo from /public. */
  fallbackImageUrl: string;
}

/** Served from your Vite/CRA `public/` folder, so it lives at the site root. */
export const APP_LOGO_URL = "/pwa-512x512.png";

// ─────────────────────────────────────────────
// IMAGE HELPERS
// ─────────────────────────────────────────────

/** Unsplash URL with sizing/format params (smaller, faster, more reliable). */
const U = (id: string, w = 600) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&q=80`;

/** Images that match each category. Services rotate through their pool so
 *  cards in the same category don't all show the identical photo. */
const CATEGORY_IMAGES: Record<BarberServiceCategory, string[]> = {
  hair: [
    U("1621605815971-fbc98d665033"),
    U("1622286342621-4bd786c2447c"),
    U("1503951914875-452162b0f3f1"),
    U("1622288432450-277d0fef5ed6"),
    U("1599351431202-1e0f0137899a"),
  ],
  beard: [
    U("1621605815971-fbc98d665033"),
    U("1503951914875-452162b0f3f1"),
    U("1599351431202-1e0f0137899a"),
  ],
  shave: [
    U("1503951914875-452162b0f3f1"),
    U("1622288432450-277d0fef5ed6"),
  ],
  combined: [
    U("1622286342621-4bd786c2447c"),
    U("1621605815971-fbc98d665033"),
    U("1599351431202-1e0f0137899a"),
  ],
  kids: [
    U("1599351431202-1e0f0137899a"),
    U("1622286342621-4bd786c2447c"),
    U("1621605815971-fbc98d665033"),
  ],
  "womens-cut": [
    U("1560066984-138dadb4c035"),
    U("1560869713-7d0a29430803"),
    U("1595476108010-b4d1f102b1b1"),
    U("1519699047748-de8e457a634e"),
  ],
  "womens-styling": [
    U("1522337360788-8b13dee7a37e"),
    U("1560066984-138dadb4c035"),
    U("1519699047748-de8e457a634e"),
  ],
  colour: [
    U("1519699047748-de8e457a634e"),
    U("1560066984-138dadb4c035"),
  ],
  braids: [U("1522337660859-02fbefca4702")],
  "weave-wig": [
    U("1560869713-7d0a29430803"),
    U("1595959183082-7b570b7e08e8"),
  ],
  chemical: [
    U("1522337360788-8b13dee7a37e"),
    U("1595476108010-b4d1f102b1b1"),
  ],
  treatments: [U("1595476108010-b4d1f102b1b1")],
};

/** Specific services that deserve a more exact photo than their category. */
const SERVICE_IMAGE_OVERRIDES: Record<string, string> = {
  H009: U("1534297635766-a262cdcb8ee4"), // Afro Cut
  WC004: U("1595959183082-7b570b7e08e8"), // Bob Cut
  WC005: U("1605497788044-5a32c7078486"), // Pixie Cut
  WC006: U("1519699047748-de8e457a634e"), // Long Layers
  WC007: U("1620331311520-246422fd82f9"), // Curtain Bangs
};

const CATEGORY_STYLE: Record<
  BarberServiceCategory,
  { bg: string; fg: string; label: string }
> = {
  hair: { bg: "#1f2937", fg: "#f9fafb", label: "Hair" },
  beard: { bg: "#3f2d20", fg: "#fef3c7", label: "Beard" },
  shave: { bg: "#334155", fg: "#e2e8f0", label: "Shave" },
  combined: { bg: "#1e3a8a", fg: "#dbeafe", label: "Combo" },
  kids: { bg: "#0f766e", fg: "#ccfbf1", label: "Kids" },
  "womens-cut": { bg: "#9d174d", fg: "#fce7f3", label: "Women's Cut" },
  "womens-styling": { bg: "#86198f", fg: "#fae8ff", label: "Styling" },
  colour: { bg: "#b45309", fg: "#fef3c7", label: "Colour" },
  braids: { bg: "#7c2d12", fg: "#ffedd5", label: "Braids" },
  "weave-wig": { bg: "#5b21b6", fg: "#ede9fe", label: "Weave & Wig" },
  chemical: { bg: "#065f46", fg: "#d1fae5", label: "Chemical" },
  treatments: { bg: "#155e75", fg: "#cffafe", label: "Treatment" },
};

/** Inline SVG placeholder. Needs no network, so it can never 404. */
export function buildFallbackImage(
  category: BarberServiceCategory,
  name?: string,
): string {
  const { bg, fg, label } = CATEGORY_STYLE[category];
  const title = (name ?? label).replace(/[<>&"]/g, "");
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400">` +
    `<rect width="600" height="400" fill="${bg}"/>` +
    `<circle cx="300" cy="160" r="56" fill="${fg}" opacity="0.15"/>` +
    `<path d="M270 190 L330 130 M270 130 L330 190" stroke="${fg}" stroke-width="10" stroke-linecap="round" opacity="0.6"/>` +
    `<text x="300" y="275" font-family="Arial, Helvetica, sans-serif" font-size="30" font-weight="700" fill="${fg}" text-anchor="middle">${title}</text>` +
    `<text x="300" y="312" font-family="Arial, Helvetica, sans-serif" font-size="20" fill="${fg}" opacity="0.7" text-anchor="middle">${label}</text>` +
    `</svg>`;
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

/**
 * Use in your UI so a broken remote image swaps to the fallback:
 *
 *   <img src={s.imageUrl} onError={(e) => applyImageFallback(e.currentTarget, s)} />
 */
export function applyImageFallback(
  img: HTMLImageElement,
  service: Pick<DefaultBarberService, "fallbackImageUrl" | "category" | "name">,
) {
  const step = img.dataset.fallbackStep ?? "0";

  if (step === "0") {
    // 1st failure: remote photo broke → show the app logo
    img.dataset.fallbackStep = "1";
    img.src = service.fallbackImageUrl;
  } else if (step === "1") {
    // 2nd failure: logo itself failed → inline SVG (can't fail)
    img.dataset.fallbackStep = "2";
    img.src = buildFallbackImage(service.category, service.name);
  }
  // step 2: stop, avoids infinite onError loops
}

// ─────────────────────────────────────────────
// SERVICE DEFINITIONS (images are attached below)
// ─────────────────────────────────────────────

type ServiceSeed = Pick<DefaultBarberService, "code" | "name" | "category">;

const SERVICE_SEEDS: ServiceSeed[] = [
  // HAIR
  { code: "H001", name: "Basic Clipper Cut", category: "hair" },
  { code: "H002", name: "Low Fade", category: "hair" },
  { code: "H003", name: "Mid Fade", category: "hair" },
  { code: "H004", name: "High Fade", category: "hair" },
  { code: "H005", name: "Taper", category: "hair" },
  { code: "H006", name: "Buzz Cut", category: "hair" },
  { code: "H007", name: "Bald / Skin Cut", category: "hair" },
  { code: "H008", name: "Scissors Cut", category: "hair" },
  { code: "H009", name: "Afro Cut", category: "hair" },
  { code: "H010", name: "Line-up / Edge-up", category: "hair" },
  { code: "H011", name: "Hair Design", category: "hair" },

  // BEARD
  { code: "B001", name: "Beard Trim", category: "beard" },
  { code: "B002", name: "Beard Shape-up", category: "beard" },
  { code: "B003", name: "Beard Line-up", category: "beard" },
  { code: "B004", name: "Full Beard Grooming", category: "beard" },
  { code: "B005", name: "Mustache Trim", category: "beard" },

  // SHAVING
  { code: "S001", name: "Clean Shave", category: "shave" },
  { code: "S002", name: "Hot Towel Shave", category: "shave" },

  // COMBINED
  { code: "C001", name: "Fade + Beard", category: "combined" },
  { code: "C002", name: "Taper + Beard", category: "combined" },
  { code: "C003", name: "Buzz Cut + Beard", category: "combined" },
  { code: "C004", name: "Bald / Skin Cut + Beard", category: "combined" },
  { code: "C005", name: "Hair Design + Beard", category: "combined" },

  // KIDS
  { code: "K001", name: "Kids Basic Cut", category: "kids" },
  { code: "K002", name: "Kids Fade", category: "kids" },
  { code: "K003", name: "Kids Line-up", category: "kids" },
  { code: "K004", name: "Kids Hair Design", category: "kids" },

  // WOMENS CUT
  { code: "WC001", name: "Wash, Cut & Blow Dry", category: "womens-cut" },
  { code: "WC002", name: "Trim / Dusting", category: "womens-cut" },
  { code: "WC003", name: "Layered Cut", category: "womens-cut" },
  { code: "WC004", name: "Bob Cut", category: "womens-cut" },
  { code: "WC005", name: "Pixie Cut", category: "womens-cut" },
  { code: "WC006", name: "Long Layers", category: "womens-cut" },
  { code: "WC007", name: "Curtain Bangs", category: "womens-cut" },
  { code: "WC008", name: "Fringe / Bangs Trim", category: "womens-cut" },
  { code: "WC009", name: "One-Length Cut", category: "womens-cut" },
  { code: "WC010", name: "Shag Cut", category: "womens-cut" },

  // WOMENS STYLING
  { code: "WS001", name: "Wash & Blow Dry", category: "womens-styling" },
  { code: "WS002", name: "Blow Dry & Style", category: "womens-styling" },
  { code: "WS003", name: "Curling / Tong Set", category: "womens-styling" },
  { code: "WS004", name: "Waves / Finger Waves", category: "womens-styling" },
  { code: "WS005", name: "Updo / Bun", category: "womens-styling" },
  { code: "WS006", name: "Bridal Hair Styling", category: "womens-styling" },
  { code: "WS007", name: "Event / Occasion Styling", category: "womens-styling" },
  { code: "WS008", name: "Silk Press", category: "womens-styling" },

  // COLOUR
  { code: "CL001", name: "Full Head Colour", category: "colour" },
  { code: "CL002", name: "Root Touch-up", category: "colour" },
  { code: "CL003", name: "Highlights (Full Head)", category: "colour" },
  { code: "CL004", name: "Partial Highlights", category: "colour" },
  { code: "CL005", name: "Balayage", category: "colour" },
  { code: "CL006", name: "Ombré", category: "colour" },
  { code: "CL007", name: "Toning / Gloss", category: "colour" },
  { code: "CL008", name: "Colour Correction", category: "colour" },
  { code: "CL009", name: "Bleach / Lightening", category: "colour" },

  // BRAIDS
  { code: "BR001", name: "Cornrows", category: "braids" },
  { code: "BR002", name: "Box Braids", category: "braids" },
  { code: "BR003", name: "Knotless Braids", category: "braids" },
  { code: "BR004", name: "Two-Strand Twists", category: "braids" },
  { code: "BR005", name: "Passion Twists", category: "braids" },
  { code: "BR006", name: "Faux Locs", category: "braids" },
  { code: "BR007", name: "Dreadlock Retwist", category: "braids" },
  { code: "BR008", name: "Feed-in Braids", category: "braids" },
  { code: "BR009", name: "Braid Take-down", category: "braids" },
  { code: "BR010", name: "Kids Braids", category: "braids" },

  // WEAVE & WIG
  { code: "WW001", name: "Weave Install (Sew-in)", category: "weave-wig" },
  { code: "WW002", name: "Weave Maintenance", category: "weave-wig" },
  { code: "WW003", name: "Weave Removal", category: "weave-wig" },
  { code: "WW004", name: "Wig Install", category: "weave-wig" },
  { code: "WW005", name: "Wig Customisation", category: "weave-wig" },
  { code: "WW006", name: "Lace Front Install", category: "weave-wig" },
  { code: "WW007", name: "Closure / Frontal Install", category: "weave-wig" },

  // CHEMICAL
  { code: "CH001", name: "Relaxer / Retouch", category: "chemical" },
  { code: "CH002", name: "Texturiser", category: "chemical" },
  { code: "CH003", name: "Keratin Treatment", category: "chemical" },
  { code: "CH004", name: "Hair Straightening (Permanent)", category: "chemical" },
  { code: "CH005", name: "Perm / Curl", category: "chemical" },
  { code: "CH006", name: "Relaxer Take-down / Neutralise", category: "chemical" },

  // TREATMENTS
  { code: "TR001", name: "Scalp Treatment", category: "treatments" },
  { code: "TR002", name: "Deep Conditioning", category: "treatments" },
  { code: "TR003", name: "Protein / Repair Treatment", category: "treatments" },
  { code: "TR004", name: "Hot Oil Treatment", category: "treatments" },
  { code: "TR005", name: "Scalp Massage", category: "treatments" },
  { code: "TR006", name: "Dandruff / Scalp Detox", category: "treatments" },
];

// Attach images: override → category pool (rotating) → SVG fallback.
const categoryCounters: Partial<Record<BarberServiceCategory, number>> = {};

export const DEFAULT_BARBER_SERVICES: DefaultBarberService[] = SERVICE_SEEDS.map(
  (seed) => {
    const pool = CATEGORY_IMAGES[seed.category];
    const i = categoryCounters[seed.category] ?? 0;
    categoryCounters[seed.category] = i + 1;

    return {
      ...seed,
      imageUrl: SERVICE_IMAGE_OVERRIDES[seed.code] ?? pool[i % pool.length],
      fallbackImageUrl: APP_LOGO_URL,
    };
  },
);