import type { Colorway, ComplicationId, SlotId } from "@/lib/watch/types";
import type { Metrics } from "@/lib/watch/metrics";

export type FaceRenderProps = {
  palette: Colorway;
  now: Date;
  metrics: Metrics;
  ambient: boolean;
  hour24: boolean;
  slots: Record<SlotId, ComplicationId>;
  onCycleSlot: (slot: SlotId) => void;
};
