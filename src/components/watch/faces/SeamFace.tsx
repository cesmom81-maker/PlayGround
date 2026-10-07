import { AnalogHands, MinuteTrack } from "../AnalogHands";
import { Complication } from "../Complication";
import { KintsugiSeam } from "../KintsugiSeam";
import type { FaceRenderProps } from "./types";
import { weekday } from "@/lib/watch/metrics";

export function SeamFace({
  palette,
  now,
  metrics,
  ambient,
  slots,
  onCycleSlot,
}: FaceRenderProps) {
  const { dial, seam, hands, marks, text, muted, accent } = palette;

  return (
    <div className="absolute inset-0" style={{ background: dial }}>
      <svg viewBox="0 0 200 200" className="absolute inset-0 block h-full w-full">
        <MinuteTrack color={marks} major={hands} />
        <KintsugiSeam color={seam} dim={ambient} />
        <AnalogHands
          color={hands}
          accent={accent}
          showSeconds={!ambient}
          sweep
        />
      </svg>

      {!ambient ? (
        <>
          <p
            className="pointer-events-none absolute left-1/2 top-[14%] font-serif uppercase leading-none"
            style={{
              color: muted,
              fontSize: 7,
              letterSpacing: "0.38em",
              transform: "translateX(-50%)",
            }}
          >
            Mendsway
          </p>
          <div
            className="absolute left-[14%] top-1/2 size-[52px]"
            style={{ transform: "translateY(-50%)" }}
          >
            <Complication
              id={slots.west}
              now={now}
              metrics={metrics}
              color={text}
              muted={muted}
              accent={accent}
              compact
              onCycle={() => onCycleSlot("west")}
            />
          </div>
          <div
            className="absolute right-[14%] top-1/2 size-[52px]"
            style={{ transform: "translateY(-50%)" }}
          >
            <Complication
              id={slots.east}
              now={now}
              metrics={metrics}
              color={text}
              muted={muted}
              accent={accent}
              compact
              onCycle={() => onCycleSlot("east")}
            />
          </div>
          <p
            className="pointer-events-none absolute bottom-[16%] left-1/2 font-sans font-medium tabular-nums leading-none"
            style={{
              color: text,
              fontSize: 11,
              letterSpacing: "0.08em",
              transform: "translateX(-50%)",
            }}
          >
            {weekday(now)} {now.getDate()}
          </p>
        </>
      ) : null}
    </div>
  );
}
