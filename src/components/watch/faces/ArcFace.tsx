import { AnalogHands, MinuteTrack } from "../AnalogHands";
import { ArcComplication, Complication } from "../Complication";
import { KintsugiSeam } from "../KintsugiSeam";
import type { FaceRenderProps } from "./types";
import { weekday } from "@/lib/watch/metrics";

export function ArcFace({
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
        {!ambient ? (
          <>
            <ArcComplication
              id={slots.north}
              now={now}
              metrics={metrics}
              accent={accent}
              marks={marks}
              startDeg={-28}
              sweepDeg={56}
            />
            <ArcComplication
              id={slots.east}
              now={now}
              metrics={metrics}
              accent={accent}
              marks={marks}
              startDeg={62}
              sweepDeg={56}
            />
            <ArcComplication
              id={slots.south}
              now={now}
              metrics={metrics}
              accent={accent}
              marks={marks}
              startDeg={152}
              sweepDeg={56}
            />
            <ArcComplication
              id={slots.west}
              now={now}
              metrics={metrics}
              accent={accent}
              marks={marks}
              startDeg={242}
              sweepDeg={56}
            />
          </>
        ) : (
          <MinuteTrack color={marks} major={hands} />
        )}
        <g opacity={ambient ? 0.2 : 0.45}>
          <KintsugiSeam color={seam} dim />
        </g>
        <AnalogHands
          color={hands}
          accent={accent}
          showSeconds={!ambient}
          sweep={false}
        />
      </svg>

      {!ambient ? (
        <>
          <div
            className="absolute left-1/2 top-[18%]"
            style={{ transform: "translateX(-50%)" }}
          >
            <Complication
              id={slots.north}
              now={now}
              metrics={metrics}
              color={text}
              muted={muted}
              accent={accent}
              compact
              onCycle={() => onCycleSlot("north")}
            />
          </div>
          <div
            className="absolute bottom-[16%] left-1/2"
            style={{ transform: "translateX(-50%)" }}
          >
            <p
              className="font-sans font-medium tabular-nums leading-none"
              style={{ color: text, fontSize: 11, letterSpacing: "0.1em" }}
            >
              {weekday(now)} {now.getDate()}
            </p>
          </div>
        </>
      ) : null}
    </div>
  );
}
