// src/data/products.ts
import { Product } from "@/src/types/product";

export const MOCK_PRODUCTS: Product[] = [
  // ========================================================================
  // 1. CUSTOM KEYBOARD KITS (Phân khúc cao cấp, nhiều options)
  // ========================================================================
  {
    id: "p_zoom75",
    slug: "zoom75-ee-wireless",
    name: "Zoom75 EE Wireless Kit",
    basePrice: 189.0,
    originalPrice: 210.0,
    rating: 4.9,
    reviewsCount: 125,
    status: "IN_STOCK",
    category: "Custom Kits",
    brand: "Meletrix",
    tag: "HOT",
    shortDesc: "The best 75% keyboard kit in the game with LCD screen support.",
    description:
      "<p>Zoom75 is the latest enthusiast keyboard kit from Meletrix...</p>",

    model3dId: "keyboard-gaming-pro",

    images: [
      "https://res.cloudinary.com/doezwafgz/image/upload/v1765554095/Blossom-Honey-IK-Falcon-1_egmmas.png",
      "https://res.cloudinary.com/doezwafgz/image/upload/v1765548984/cat3_ky7ssk.png",
      "https://res.cloudinary.com/doezwafgz/image/upload/v1765548985/produc1_jc0ojq.png",
    ],
    features: [
      "Modular LCD Screen / Badge System",
      "Premium Internal Weight",
      "Tri-mode Connectivity (BT/2.4G/Wired)",
    ],
    specs: {
      layout: "75% (82 Keys)",
      mounting: "Gasket Mount",
      pcb: "1.2mm Flex-cut, Hotswap",
      connection: "Tri-mode",
      battery: "2250mAh x 2",
      caseMaterial: "CNC Aluminum",
      plateMaterial: "PC (Default)",
      pollingRate: "1000Hz",
      warranty: "12 Months",
    },
    options: [
      {
        id: "color",
        name: "Case Color",
        type: "color",
        values: [
          { id: "milk-tea", name: "Milk Tea", value: "#eddecc" },
          { id: "obsidian", name: "Obsidian Black", value: "#1a1a1a" },
          { id: "wild-green", name: "Wild Green", value: "#4a5d23" },
        ],
      },
      {
        id: "plate",
        name: "Plate Material",
        type: "select",
        values: [
          { id: "pc", name: "Polycarbonate", value: "pc", priceModifier: 0 },
          {
            id: "brass",
            name: "Brass (+$15)",
            value: "brass",
            priceModifier: 15,
          },
          { id: "fr4", name: "FR4 (+$5)", value: "fr4", priceModifier: 5 },
        ],
      },
    ],
    soundTest: {
      videoUrl: "https://www.youtube.com/embed/zDRo8MCDPpI",
      description:
        "Deep thock sound profile with Oil King switches and PC Plate.",
    },
    boughtTogether: [
      {
        id: "sw_oil_king",
        slug: "gateron-oil-king",
        name: "Gateron Oil King Switch",
        price: 65.0,
        image:
          "https://res.cloudinary.com/doezwafgz/image/upload/v1765554095/Blossom-Honey-IK-Falcon-1_egmmas.png",
      },
    ],
  },

  {
    id: "p_keychron_q1_max",
    slug: "keychron-q1-max-wireless",
    name: "Keychron Q1 Max QMK/VIA Wireless",
    basePrice: 219.0,
    rating: 4.8,
    reviewsCount: 342,
    status: "IN_STOCK",
    category: "Custom Kits",
    brand: "Keychron",
    tag: "NEW",
    shortDesc: "The ultimate 75% wireless custom mechanical keyboard.",

    model3dId: "keyboard-gaming-vip",

    images: [
      "https://res.cloudinary.com/doezwafgz/image/upload/v1765548984/cat3_ky7ssk.png",
    ],
    features: [
      "Tri-mode Connection (2.4 GHz / Bluetooth / Wired)",
      "Premium CNC Aluminum Body",
      "Double-Gasket Design",
    ],
    specs: {
      layout: "75%",
      mounting: "Double-Gasket",
      pcb: "Hotswap",
      connection: "Tri-mode",
      battery: "4000 mAh",
      caseMaterial: "6063 Aluminum",
      weight: "1724g",
    },
    soundTest: {
      videoUrl: "https://www.youtube.com/embed/zFfpmMFt1KI",
      description: "Creamy sound signature with Jupiter Banana switches.",
    },
  },

  {
    id: "p_qk75",
    slug: "qk75n-wireless",
    name: "QwertyKeys QK75N Wireless",
    basePrice: 215.0,
    rating: 4.8,
    reviewsCount: 89,
    status: "PRE_ORDER",
    category: "Custom Kits",
    brand: "QwertyKeys",
    tag: "NEW",
    shortDesc: "Budget king 75% keyboard with rotary knob and mini screen.",
    images: [
      "https://res.cloudinary.com/doezwafgz/image/upload/v1765548984/cat3_ky7ssk.png",
    ],
    features: [
      "Integrated Rotary Knob & Screen",
      "Screw-less Assembly Design",
      "Hard-anodized Aluminum Case",
    ],
    specs: {
      layout: "75%",
      mounting: "Gasket",
      pcb: "Non-flex cut Hotswap",
      connection: "Tri-mode",
      battery: "4000mAh",
      weight: "1.7kg",
    },
    options: [
      {
        id: "switch",
        name: "Bundle Switch",
        type: "button",
        values: [
          { id: "none", name: "None", value: "none" },
          {
            id: "neo_white",
            name: "Neo White Linear",
            value: "neo_white",
            priceModifier: 30,
          },
        ],
      },
    ],
    soundTest: {
      videoUrl: "https://www.youtube.com/embed/zDRo8MCDPpI",
      description:
        "Deep thock sound profile with Oil King switches and PC Plate.",
    },
  },

  // ========================================================================
  // 2. PRE-BUILT KEYBOARDS (Phân khúc Gaming/Phổ thông)
  // ========================================================================
  {
    id: "p_k5v2",
    slug: "k5v2-compact-white",
    name: "CHERRY XTRFY K5V2 Compact White",
    basePrice: 149.0,
    rating: 4.7,
    reviewsCount: 210,
    status: "IN_STOCK",
    category: "Keyboards",
    brand: "Cherry Xtrfy",
    shortDesc: "The world's most customizable 65% gaming keyboard.",
    images: [
      "https://res.cloudinary.com/doezwafgz/image/upload/v1765548984/cat3_ky7ssk.png",
    ],
    features: [
      "65% Compact Form Factor",
      "Super-scan Technology (0.5ms)",
      "Translucent Case with RGB",
    ],
    specs: {
      layout: "65%",
      mounting: "Tray Mount",
      pcb: "Hotswap 5-pin",
      connection: "Wired (USB-C)",
      pollingRate: "1000Hz",
      antiGhosting: "100% NKRO",
    },
    soundTest: {
      videoUrl: "https://www.youtube.com/embed/zDRo8MCDPpI",
      description:
        "Deep thock sound profile with Oil King switches and PC Plate.",
    },
  },

  {
    id: "p_k4v2",
    slug: "k4v2-tkl-black",
    name: "CHERRY XTRFY K4V2 TKL Black",
    basePrice: 119.0,
    originalPrice: 139.0,
    rating: 4.5,
    reviewsCount: 340,
    status: "IN_STOCK",
    category: "Keyboards",
    brand: "Cherry Xtrfy",
    tag: "SALE",
    shortDesc: "Pro-level mechanical gaming keyboard used by esports legends.",
    images: [
      "https://res.cloudinary.com/doezwafgz/image/upload/v1765548985/produc1_jc0ojq.png",
    ],
    features: [
      "Tenkeyless (TKL) Design",
      "Pre-lubed Stabilizers",
      "Robust Construction",
    ],
    specs: {
      layout: "TKL (80%)",
      mounting: "Integrated Plate",
      pcb: "Soldered",
      connection: "Wired",
      pollingRate: "1000Hz",
    },
    soundTest: {
      videoUrl: "https://www.youtube.com/embed/zFfpmMFt1KI",
      description:
        "Deep thock sound profile with Oil King switches and PC Plate.",
    },
  },

  // ========================================================================
  // 3. GAMING MICE (Chuột)
  // ========================================================================
  {
    id: "p_m64_pro",
    slug: "m64-pro-8k-wireless",
    name: "CHERRY XTRFY M64 Pro 8K",
    basePrice: 139.0,
    rating: 5.0,
    reviewsCount: 45,
    status: "IN_STOCK",
    category: "Mice",
    brand: "Cherry Xtrfy",
    tag: "NEW",
    shortDesc: "Ultra-lightweight wireless mouse with 8000Hz polling rate.",
    images: [
      "https://res.cloudinary.com/doezwafgz/image/upload/v1765548985/456_qcrwfk.png",
    ],
    features: [
      "True 8000Hz Wireless Polling",
      "55g Ultra-lightweight",
      "Ergonomic Low-front Shape",
    ],
    specs: {
      layout: "5 Buttons",
      mounting: "N/A",
      pcb: "Pixart 3395 Sensor",
      connection: "2.4GHz Wireless / Wired",
      battery: "Up to 90 hours",
      pollingRate: "8000Hz",
      weight: "55g",
    },
    soundTest: {
      videoUrl: "https://www.youtube.com/embed/zFfpmMFt1KI",
      description:
        "Deep thock sound profile with Oil King switches and PC Plate.",
    },
  },

  // ========================================================================
  // 4. AUDIO & ACCESSORIES (Tai nghe, Keycaps)
  // ========================================================================
  {
    id: "p_h3_wireless",
    slug: "h3-wireless-headset",
    name: "CHERRY XTRFY H3 Wireless",
    basePrice: 99.0,
    rating: 4.6,
    reviewsCount: 78,
    status: "IN_STOCK",
    category: "Audio",
    brand: "Cherry Xtrfy",
    shortDesc: "Esports-optimized wireless gaming headset with 53mm drivers.",
    images: [
      "https://res.cloudinary.com/doezwafgz/image/upload/v1765548985/CHERRY-XTRFY-H3-WIRELESS_category_nmdupa.png",
    ],
    features: [
      "Lag-free 2.4GHz Wireless",
      "53mm Deep Bass Drivers",
      "Memory Foam Earcups",
    ],
    specs: {
      layout: "Over-ear",
      mounting: "Adjustable Headband",
      pcb: "N/A",
      connection: "Wireless / 3.5mm",
      battery: "30+ Hours",
    },
  },

  {
    id: "p_gmk_red_samurai",
    slug: "gmk-red-samurai",
    name: "GMK Red Samurai Keycaps",
    basePrice: 110.0,
    rating: 4.9,
    reviewsCount: 312,
    status: "OUT_OF_STOCK",
    category: "Keycaps",
    brand: "GMK",
    shortDesc: "Legendary keycap set designed by RedSuns.",
    images: [
      "https://res.cloudinary.com/doezwafgz/image/upload/v1765548984/cat3_ky7ssk.png",
    ],
    features: [
      "Doubleshot ABS Plastic",
      "Cherry Profile",
      "Wide Compatibility (65%, 75%, TKL)",
    ],
    specs: {
      layout: "Base Kit (140 Keys)",
      mounting: "MX Style Stem",
      pcb: "N/A",
      connection: "N/A",
      caseMaterial: "ABS Doubleshot",
    },
    soundTest: {
      videoUrl: "https://www.youtube.com/embed/zFfpmMFt1KI",
      description:
        "Deep thock sound profile with Oil King switches and PC Plate.",
    },
  },

  {
    id: "p_gateron_ink_black",
    slug: "gateron-ink-black-switches",
    name: "Gateron Ink Black Switches",
    basePrice: 45.0,
    rating: 4.8,
    reviewsCount: 150,
    status: "IN_STOCK",
    category: "Switches",
    brand: "Gateron",
    shortDesc:
      "Smooth and silent linear switches for a premium typing experience.",
    images: [
      "https://res.cloudinary.com/doezwafgz/image/upload/v1765554095/Blossom-Honey-IK-Falcon-1_egmmas.png",
    ],
    features: [
      "Smooth Linear Action",
      "Silent Operation",
      "Durable 50M Clicks Lifespan",
    ],
    specs: {
      layout: "N/A",
      mounting: "MX Style",
      pcb: "N/A",
      connection: "N/A",
      caseMaterial: "Polycarbonate",
    },
  },

  {
    id: "p_gateron_ink_blacks",
    slug: "gateron-ink-black-switches",
    name: "Gateron Ink Black Switches",
    basePrice: 45.0,
    rating: 4.8,
    reviewsCount: 150,
    status: "IN_STOCK",
    category: "Switches",
    brand: "Gateron",
    shortDesc:
      "Smooth and silent linear switches for a premium typing experience.",
    images: [
      "https://res.cloudinary.com/doezwafgz/image/upload/v1765554095/Blossom-Honey-IK-Falcon-1_egmmas.png",
    ],
    features: [
      "Smooth Linear Action",
      "Silent Operation",
      "Durable 50M Clicks Lifespan",
    ],
    specs: {
      layout: "N/A",
      mounting: "MX Style",
      pcb: "N/A",
      connection: "N/A",
      caseMaterial: "Polycarbonate",
    },
  },

  // ========================================================================
  // 5. KEYCAPS & AUDIO
  // ========================================================================
  {
    id: "p_gmk_red_samuraiss",
    slug: "gmk-red-samurai",
    name: "GMK Red Samurai Keycaps",
    basePrice: 110.0,
    rating: 4.9,
    reviewsCount: 312,
    status: "IN_STOCK",
    category: "Keycaps",
    brand: "GMK",
    shortDesc: "Legendary keycap set designed by RedSuns.",
    images: [
      "https://res.cloudinary.com/doezwafgz/image/upload/v1765548984/cat3_ky7ssk.png",
    ],
    features: ["Doubleshot ABS", "Cherry Profile", "Wide Compatibility"],
    specs: {
      layout: "Base Kit",
      mounting: "MX Stem",
      connection: "N/A",
      pcb: "N/A",
    },
  },
  {
    id: "p_pbtfans_bow",
    slug: "pbtfans-bow",
    name: "PBTfans Black on White (BoW)",
    basePrice: 75.0,
    rating: 4.8,
    reviewsCount: 150,
    status: "IN_STOCK",
    category: "Keycaps",
    brand: "PBTfans",
    shortDesc: "Clean, minimalist PBT keycaps with crisp legends.",
    images: [
      "https://res.cloudinary.com/doezwafgz/image/upload/v1765548984/cat3_ky7ssk.png",
    ],
    features: ["Doubleshot PBT", "Cherry Profile", "Simple Design"],
    specs: {
      layout: "Base Kit",
      mounting: "MX Stem",
      connection: "N/A",
      pcb: "N/A",
    },
  },
  {
    id: "p_h3_wirelessss",
    slug: "h3-wireless-headset",
    name: "CHERRY XTRFY H3 Wireless",
    basePrice: 99.0,
    rating: 4.6,
    reviewsCount: 78,
    status: "IN_STOCK",
    category: "Audio",
    brand: "Cherry Xtrfy",
    shortDesc: "Esports-optimized wireless gaming headset with 53mm drivers.",
    images: [
      "https://res.cloudinary.com/doezwafgz/image/upload/v1765548985/CHERRY-XTRFY-H3-WIRELESS_category_nmdupa.png",
    ],
    features: ["Lag-free Wireless", "53mm Drivers", "Memory Foam"],
    specs: {
      layout: "Over-ear",
      connection: "Wireless / 3.5mm",
      pcb: "N/A",
      mounting: "MX Stem",
    },
  },
  {
    id: "p_epos_h6pro",
    slug: "epos-h6pro-open",
    name: "EPOS H6PRO Open Acoustic",
    basePrice: 179.0,
    rating: 4.8,
    reviewsCount: 65,
    status: "IN_STOCK",
    category: "Audio",
    brand: "EPOS",
    shortDesc: "Open-back design for expansive, natural soundstage.",
    images: [
      "https://res.cloudinary.com/doezwafgz/image/upload/v1765548985/CHERRY-XTRFY-H3-WIRELESS_category_nmdupa.png",
    ],
    features: ["Open Acoustic", "Lift-to-mute Mic", "Lightweight"],
    specs: {
      layout: "Over-ear",
      connection: "Wired",
      pcb: "N/A",
      mounting: "MX Stem",
    },
  },
  {
    id: "p_moondrop_chu_2",
    slug: "moondrop-chu-2",
    name: "Moondrop Chu II IEM",
    basePrice: 18.99,
    rating: 4.5,
    reviewsCount: 400,
    status: "IN_STOCK",
    category: "Audio",
    brand: "Moondrop",
    tag: "HOT",
    shortDesc: "Budget king In-Ear Monitors with replaceable cable.",
    images: [
      "https://res.cloudinary.com/doezwafgz/image/upload/v1765548985/CHERRY-XTRFY-H3-WIRELESS_category_nmdupa.png",
    ],
    features: ["Aluminum-Magnesium Dome", "0.78mm 2-pin", "Zinc Alloy Shell"],
    specs: {
      layout: "In-ear",
      connection: "Wired",
      pcb: "N/A",
      mounting: "MX Stem",
    },
  },
];
