export const FACE_IDS = ["seam", "way", "arc", "field"] as const;
export type FaceId = (typeof FACE_IDS)[number];

export const COLORWAY_IDS = ["kintsugi", "porcelain", "night"] as const;
export type ColorwayId = (typeof COLORWAY_IDS)[number];

export const CASE_IDS = ["obsidian", "silver", "champagne"] as const;
export type CaseId = (typeof CASE_IDS)[number];

export const BAND_IDS = ["obsidian", "bay", "hazel", "porcelain"] as const;
export type BandId = (typeof BAND_IDS)[number];

export const COMPLICATION_IDS = [
  "hr",
  "steps",
  "battery",
  "weather",
  "date",
  "cal",
  "week",
] as const;
export type ComplicationId = (typeof COMPLICATION_IDS)[number];

export type SlotId = "north" | "east" | "south" | "west";

export type FaceDef = {
  id: FaceId;
  name: string;
  tagline: string;
};

export type Colorway = {
  id: ColorwayId;
  name: string;
  dial: string;
  seam: string;
  hands: string;
  marks: string;
  text: string;
  muted: string;
  accent: string;
};

export type CaseFinish = {
  id: CaseId;
  name: string;
  pair: BandId;
};

export type BandFinish = {
  id: BandId;
  name: string;
};

export const FACES: FaceDef[] = [
  { id: "seam", name: "Seam", tagline: "Analog, mended in gold" },
  { id: "way", name: "Way", tagline: "Stacked digital, one path" },
  { id: "arc", name: "Arc", tagline: "Rim complications, quiet hands" },
  { id: "field", name: "Field", tagline: "Everything at a glance" },
];

export const COLORWAYS: Record<ColorwayId, Colorway> = {
  kintsugi: {
    id: "kintsugi",
    name: "Kintsugi",
    dial: "#0a0908",
    seam: "#c9a86a",
    hands: "#f3ead8",
    marks: "#8a8174",
    text: "#f3ead8",
    muted: "#7a7368",
    accent: "#c9a86a",
  },
  porcelain: {
    id: "porcelain",
    name: "Porcelain",
    dial: "#efe8dc",
    seam: "#5c4a32",
    hands: "#1a1612",
    marks: "#8a7b68",
    text: "#1a1612",
    muted: "#6b6258",
    accent: "#8b6914",
  },
  night: {
    id: "night",
    name: "Night",
    dial: "#10141c",
    seam: "#c5d0dc",
    hands: "#e8eef4",
    marks: "#6a7380",
    text: "#e8eef4",
    muted: "#7a8490",
    accent: "#c5d0dc",
  },
};

export const CASES: CaseFinish[] = [
  { id: "obsidian", name: "Matte Black", pair: "obsidian" },
  { id: "silver", name: "Polished Silver", pair: "bay" },
  { id: "champagne", name: "Champagne Gold", pair: "hazel" },
];

export const BANDS: BandFinish[] = [
  { id: "obsidian", name: "Obsidian" },
  { id: "bay", name: "Bay" },
  { id: "hazel", name: "Hazel" },
  { id: "porcelain", name: "Porcelain" },
];

export const COMPLICATIONS: Record<
  ComplicationId,
  { label: string; unit: string }
> = {
  hr: { label: "Heart", unit: "bpm" },
  steps: { label: "Steps", unit: "" },
  battery: { label: "Battery", unit: "%" },
  weather: { label: "Weather", unit: "°" },
  date: { label: "Date", unit: "" },
  cal: { label: "Next", unit: "" },
  week: { label: "Week", unit: "" },
};

export const DEFAULT_SLOTS: Record<SlotId, ComplicationId> = {
  north: "weather",
  east: "steps",
  south: "date",
  west: "hr",
};
