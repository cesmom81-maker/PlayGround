import { Complication } from "../Complication";
import { KintsugiSeam } from "../KintsugiSeam";
import { formatTime, weekday } from "@/lib/watch/metrics";
import type { FaceRenderProps } from "./types";

export function WayFace({
  palette,
  now,
  metrics,
  ambient,
  hour24,
  slots,
  onCycleSlot,
}: FaceRenderProps) {
  const { dial, seam, text, muted, accent } = palette;
  const t = formatTime(now, hour24);
  const sec = String(now.getSeconds()).padStart(2, "0");
  const size = ambient ? 46 : 40;

  return (
    <div className="absolute inset-0" style={{ background: dial }}>
      <svg viewBox="0 0 200 200" className="absolute inset-0 block h-full w-full opacity-50">
        <KintsugiSeam color={seam} dim={ambient} />
      </svg>

      <div className="absolute inset-0 flex flex-col items-center justify-center pt-1">
        {!ambient ? (
          <p
            className="font-sans uppercase leading-none"
            style={{ color: muted, fontSize: 8, letterSpacing: "0.28em" }}
          >
            {weekday(now)} {now.getDate()}
          </p>
        ) : null}

        <p
          className="mt-1 font-serif tabular-nums"
          style={{
            color: text,
            fontSize: size,
            lineHeight: 0.9,
            letterSpacing: "-0.03em",
          }}
        >
          {t.hours}
        </p>

        <div
          className="my-1.5 h-px w-12"
          style={{ background: seam, opacity: ambient ? 0.35 : 1 }}
        />

        <p
          className="font-serif tabular-nums"
          style={{
            color: text,
            fontSize: size,
            lineHeight: 0.9,
            letterSpacing: "-0.03em",
          }}
        >
          {t.minutes}
        </p>

        {!ambient ? (
          <p
            className="mt-1.5 font-sans tabular-nums leading-none"
            style={{ color: muted, fontSize: 10, letterSpacing: "0.18em" }}
          >
            {sec}
            {t.ampm ? `  ${t.ampm}` : ""}
          </p>
        ) : null}
      </div>

      {!ambient ? (
        <div
          className="absolute bottom-[11%] left-1/2"
          style={{ transform: "translateX(-50%)" }}
        >
          <Complication
            id={slots.south}
            now={now}
            metrics={metrics}
            color={text}
            muted={muted}
            accent={accent}
            compact
            onCycle={() => onCycleSlot("south")}
          />
        </div>
      ) : null}
    </div>
  );
}
