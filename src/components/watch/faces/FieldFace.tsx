import { Complication } from "../Complication";
import { formatTime, weekday } from "@/lib/watch/metrics";
import type { FaceRenderProps } from "./types";
import type { SlotId } from "@/lib/watch/types";

export function FieldFace({
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
  const sec = now.getSeconds();
  const circ = 584;
  const filled = round2((sec / 60) * circ);
  const rest = round2(circ - filled);
  const grid: SlotId[] = ["west", "east", "north", "south"];

  return (
    <div className="absolute inset-0" style={{ background: dial }}>
      <svg viewBox="0 0 200 200" className="pointer-events-none absolute inset-0 block h-full w-full">
        <circle
          cx="100"
          cy="100"
          r="93"
          fill="none"
          stroke={muted}
          strokeWidth="2.2"
          opacity="0.18"
        />
        <circle
          cx="100"
          cy="100"
          r="93"
          fill="none"
          stroke={seam}
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeDasharray={`${filled} ${rest}`}
          transform="rotate(-90 100 100)"
          opacity={ambient ? 0.35 : 1}
        />
      </svg>

      <div className="absolute inset-0 flex flex-col items-center justify-center pb-8">
        {!ambient ? (
          <p
            className="font-sans uppercase leading-none"
            style={{ color: muted, fontSize: 8, letterSpacing: "0.26em" }}
          >
            {weekday(now)} {now.getDate()}
          </p>
        ) : null}

        <p
          className="mt-1 font-sans font-medium tabular-nums"
          style={{
            color: text,
            fontSize: ambient ? 36 : 32,
            lineHeight: 1,
            letterSpacing: "-0.03em",
          }}
        >
          {t.hours}:{t.minutes}
        </p>

        {!ambient ? (
          <p
            className="mt-1 font-sans tabular-nums leading-none"
            style={{ color: muted, fontSize: 9, letterSpacing: "0.16em" }}
          >
            {String(sec).padStart(2, "0")}
            {t.ampm ? `  ${t.ampm}` : ""}
          </p>
        ) : null}

        <div
          className="mt-2 h-px w-8"
          style={{ background: seam, opacity: ambient ? 0.3 : 0.9 }}
        />
      </div>

      {!ambient ? (
        <div
          className="absolute inset-x-[20%] bottom-[13%] grid grid-cols-2 gap-x-4 gap-y-2"
        >
          {grid.map((slot) => (
            <Complication
              key={slot}
              id={slots[slot]}
              now={now}
              metrics={metrics}
              color={text}
              muted={muted}
              accent={accent}
              compact
              onCycle={() => onCycleSlot(slot)}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}

function round2(n: number) {
  return Math.round(n * 100) / 100;
}
