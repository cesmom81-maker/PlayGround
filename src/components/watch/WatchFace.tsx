import type { JSX } from "react";
import { COLORWAYS, FACES, type FaceId } from "@/lib/watch/types";
import { metricsAt } from "@/lib/watch/metrics";
import { useWatch } from "@/lib/watch/store";
import { ArcFace } from "./faces/ArcFace";
import { FieldFace } from "./faces/FieldFace";
import { SeamFace } from "./faces/SeamFace";
import { WayFace } from "./faces/WayFace";
import type { FaceRenderProps } from "./faces/types";
import { useNow } from "@/lib/watch/use-now";
import { Button } from "@/components/ui/button";

const FACE_MAP: Record<FaceId, (p: FaceRenderProps) => JSX.Element> = {
  seam: SeamFace,
  way: WayFace,
  arc: ArcFace,
  field: FieldFace,
};

export function WatchFace() {
  const { now } = useNow(1000);
  const face = useWatch((s) => s.face);
  const colorway = useWatch((s) => s.colorway);
  const ambient = useWatch((s) => s.ambient);
  const hour24 = useWatch((s) => s.hour24);
  const slots = useWatch((s) => s.slots);
  const editMode = useWatch((s) => s.editMode);
  const cycleSlot = useWatch((s) => s.cycleSlot);
  const cycleFace = useWatch((s) => s.cycleFace);
  const cycleColorway = useWatch((s) => s.cycleColorway);
  const setEditMode = useWatch((s) => s.setEditMode);

  const palette = COLORWAYS[colorway];
  const metrics = metricsAt(now);
  const Face = FACE_MAP[face];
  const def = FACES.find((f) => f.id === face)!;

  const props: FaceRenderProps = {
    palette,
    now,
    metrics,
    ambient,
    hour24,
    slots,
    onCycleSlot: cycleSlot,
  };

  if (editMode) {
    return (
      <div
        className="absolute inset-0 flex flex-col items-center justify-center"
        style={{ background: palette.dial }}
      >
        <div className="relative size-[54%] overflow-hidden rounded-full">
          <Face {...props} ambient={false} />
        </div>
        <p
          className="mt-2 font-serif text-lg leading-none"
          style={{ color: palette.text }}
        >
          {def.name}
        </p>
        <p
          className="mt-1 font-sans uppercase"
          style={{
            color: palette.muted,
            fontSize: 8,
            letterSpacing: "0.22em",
          }}
        >
          {COLORWAYS[colorway].name}
        </p>
        <div className="mt-2 flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 px-2 text-xs"
            style={{ color: palette.text }}
            onClick={() => cycleFace(-1)}
            aria-label="Previous face"
          >
            ‹
          </Button>
          <button
            type="button"
            onClick={cycleColorway}
            className="size-5 rounded-full border"
            style={{
              background: palette.seam,
              borderColor: palette.hands,
            }}
            aria-label="Cycle colorway"
          />
          <Button
            variant="ghost"
            size="sm"
            className="h-8 px-2 text-xs"
            style={{ color: palette.text }}
            onClick={() => cycleFace(1)}
            aria-label="Next face"
          >
            ›
          </Button>
        </div>
        <button
          type="button"
          className="mt-2 font-sans uppercase"
          style={{ color: palette.accent, fontSize: 8, letterSpacing: "0.2em" }}
          onClick={() => setEditMode(false)}
        >
          Done
        </button>
      </div>
    );
  }

  return <Face {...props} />;
}
