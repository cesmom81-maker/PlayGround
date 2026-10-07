import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  BAND_IDS,
  CASES,
  CASE_IDS,
  COLORWAY_IDS,
  COMPLICATION_IDS,
  DEFAULT_SLOTS,
  FACE_IDS,
  type BandId,
  type CaseId,
  type ColorwayId,
  type ComplicationId,
  type FaceId,
  type SlotId,
} from "./types";

type WatchState = {
  face: FaceId;
  colorway: ColorwayId;
  caseId: CaseId;
  band: BandId;
  hour24: boolean;
  ambient: boolean;
  editMode: boolean;
  slots: Record<SlotId, ComplicationId>;
  hintSeen: boolean;
  setFace: (face: FaceId) => void;
  cycleFace: (dir: 1 | -1) => void;
  setColorway: (id: ColorwayId) => void;
  cycleColorway: () => void;
  setCase: (id: CaseId) => void;
  setBand: (id: BandId) => void;
  setHour24: (v: boolean) => void;
  setAmbient: (v: boolean) => void;
  toggleAmbient: () => void;
  setEditMode: (v: boolean) => void;
  cycleSlot: (slot: SlotId) => void;
  dismissHint: () => void;
};

function nextIn<T extends string>(list: readonly T[], current: T, dir: 1 | -1): T {
  const i = list.indexOf(current);
  return list[(i + dir + list.length) % list.length]!;
}

export const useWatch = create<WatchState>()(
  persist(
    (set, get) => ({
      face: "seam",
      colorway: "kintsugi",
      caseId: "obsidian",
      band: "obsidian",
      hour24: false,
      ambient: false,
      editMode: false,
      slots: { ...DEFAULT_SLOTS },
      hintSeen: false,
      setFace: (face) => set({ face, editMode: false, ambient: false }),
      cycleFace: (dir) => {
        const face = nextIn(FACE_IDS, get().face, dir);
        set({ face, ambient: false });
      },
      setColorway: (colorway) => set({ colorway }),
      cycleColorway: () =>
        set({ colorway: nextIn(COLORWAY_IDS, get().colorway, 1) }),
      setCase: (caseId) => {
        const pair = CASES.find((c) => c.id === caseId)?.pair ?? get().band;
        set({ caseId, band: pair });
      },
      setBand: (band) => set({ band }),
      setHour24: (hour24) => set({ hour24 }),
      setAmbient: (ambient) => set({ ambient, editMode: false }),
      toggleAmbient: () =>
        set({ ambient: !get().ambient, editMode: false }),
      setEditMode: (editMode) => set({ editMode, ambient: false }),
      cycleSlot: (slot) => {
        const current = get().slots[slot];
        const next = nextIn(COMPLICATION_IDS, current, 1);
        set({ slots: { ...get().slots, [slot]: next } });
      },
      dismissHint: () => set({ hintSeen: true }),
    }),
    {
      name: "mendsway-watch",
      partialize: (s) => ({
        face: s.face,
        colorway: s.colorway,
        caseId: s.caseId,
        band: s.band,
        hour24: s.hour24,
        slots: s.slots,
        hintSeen: s.hintSeen,
      }),
    },
  ),
);

export function isFaceId(v: string): v is FaceId {
  return (FACE_IDS as readonly string[]).includes(v);
}

export function isCaseId(v: string): v is CaseId {
  return (CASE_IDS as readonly string[]).includes(v);
}

export function isBandId(v: string): v is BandId {
  return (BAND_IDS as readonly string[]).includes(v);
}

export function isColorwayId(v: string): v is ColorwayId {
  return (COLORWAY_IDS as readonly string[]).includes(v);
}
