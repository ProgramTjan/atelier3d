export const ROOM_H = 2.6;
export const STORAGE_KEY = "atelier-ontwerpen";

export const ITEM_COLORS = [
  "#D9D2C7", "#C2A98B", "#8A9B8E", "#4A6B4F",
  "#46484C", "#A3552F", "#7A8CA3", "#5C5048",
];

export const WALL_SWATCHES = [
  { name: "Gebroken wit", c: "#F1EDE5" },
  { name: "Greige", c: "#DDD5C7" },
  { name: "Saliegroen", c: "#7E9388" },
  { name: "Mosgroen", c: "#5A6B5D" },
  { name: "Klei", c: "#B07A5E" },
  { name: "Nachtblauw", c: "#3E4A5A" },
  { name: "Baksteen", c: "#9B5B45" },
];

export const FLOOR_SWATCHES = [
  { name: "Licht eiken", c: "#D7BE9C" },
  { name: "Walnoot", c: "#7A5638" },
  { name: "Donker hout", c: "#54402E" },
  { name: "Beton", c: "#9D9A94" },
  { name: "Terrazzo licht", c: "#CFC8BC" },
  { name: "Leisteen", c: "#5A5C5E" },
];

export const WALL_FINISHES = [
  { key: "verf", label: "Verf" },
  { key: "vierkant", label: "Tegel 30×30" },
  { key: "metro", label: "Metrotegel" },
  { key: "zellige", label: "Zellige" },
];
export const FLOOR_FINISHES = [
  { key: "hout", label: "Planken" },
  { key: "tegel", label: "Tegels" },
  { key: "glad", label: "Gietvloer" },
];

export const CATALOG_WONEN = [
  { type: "bank", label: "Bank" },
  { type: "fauteuil", label: "Fauteuil" },
  { type: "poef", label: "Poef" },
  { type: "salontafel", label: "Salontafel" },
  { type: "eettafel", label: "Eettafel" },
  { type: "stoel", label: "Stoel" },
  { type: "bureau", label: "Bureau" },
  { type: "bureaustoel", label: "Bureaustoel" },
  { type: "bed", label: "Bed" },
  { type: "kast", label: "Kast" },
  { type: "boekenkast", label: "Boekenkast" },
  { type: "kledingrek", label: "Kledingrek" },
  { type: "tvmeubel", label: "Tv-meubel" },
  { type: "haard", label: "Haard" },
  { type: "vloerlamp", label: "Vloerlamp" },
  { type: "hanglamp", label: "Hanglamp" },
  { type: "wandlamp", label: "Wandlamp" },
  { type: "schilderij", label: "Schilderij" },
  { type: "spiegel", label: "Spiegel" },
  { type: "wandplank", label: "Wandplank" },
  { type: "gordijnen", label: "Gordijnen" },
  { type: "plant", label: "Plant" },
  { type: "vloerkleed", label: "Vloerkleed" },
];
export const CATALOG_BAD = [
  { type: "bad", label: "Ligbad" },
  { type: "douche", label: "Inloopdouche" },
  { type: "wastafel", label: "Wastafelmeubel" },
  { type: "toilet", label: "Toilet" },
  { type: "wasmachine", label: "Wasmachine" },
  { type: "handdoekrek", label: "Handdoekrek" },
  { type: "wasmand", label: "Wasmand" },
  { type: "wandlamp", label: "Wandlamp" },
  { type: "hanglamp", label: "Hanglamp" },
  { type: "spiegel", label: "Spiegel" },
  { type: "kast", label: "Kast" },
  { type: "plant", label: "Plant" },
  { type: "vloerkleed", label: "Badmat" },
];
export const ALL_TYPES = [...CATALOG_WONEN, ...CATALOG_BAD];

// types met instelbare lichtsterkte
export const LIGHT_TYPES = ["vloerlamp", "hanglamp", "wandlamp", "haard"];

export const VARIANT_COUNT = {
  bank: 3, fauteuil: 3, salontafel: 3, eettafel: 2, stoel: 3,
  bed: 2, kast: 2, boekenkast: 2, tvmeubel: 2, vloerlamp: 3,
  plant: 2, vloerkleed: 2, bad: 2, douche: 1, wastafel: 2,
  toilet: 1, handdoekrek: 1, schilderij: 2, gordijnen: 1, wandlamp: 1,
  bureau: 2, bureaustoel: 1, hanglamp: 2, poef: 2, spiegel: 1,
  wandplank: 1, kledingrek: 1, haard: 1, wasmachine: 1, wasmand: 1,
};
