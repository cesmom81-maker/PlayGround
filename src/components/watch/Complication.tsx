import {
  Activity,
  Battery,
  Calendar,
  CloudSun,
  Footprints,
  Hash,
} from "lucide-react";
import type { ComplicationId } from "@/lib/watch/types";
import {
  formatSteps,
  monthDay,
  weekNumber,
  weekday,
  type Metrics,
} from "@/lib/watch/metrics";

type Props = {
  id: ComplicationId;
  now: Date;
  metrics: Metrics;
  color: string;
  muted: string;
  accent: string;
  compact?: boolean;
  onCycle?: () => void;
};

export function Complication({
  id,
  now,
  metrics,
  color,
  muted,
  accent,
  compact,
  onCycle,
}: Props) {
  const iconSize = compact ? 9 : 11;
  const value = valueFor(id, now, metrics, compact);
  const Icon = iconFor(id);

  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onCycle?.();
      }}
      className="flex flex-col items-center justify-center gap-0.5 rounded-full"
      aria-label={`Complication ${id}, ${value}. Tap to change.`}
    >
      <Icon size={iconSize} color={accent} strokeWidth={1.75} />
      <span
        className="font-sans font-medium tabular-nums leading-none"
        style={{ color, fontSize: compact ? 9 : 11 }}
      >
        {value}
      </span>
      {compact ? null : (
        <span
          className="font-sans uppercase leading-none"
          style={{ color: muted, fontSize: 6, letterSpacing: "0.12em" }}
        >
          {labelFor(id)}
        </span>
      )}
    </button>
  );
}

export function ArcComplication({
  id,
  now,
  metrics,
  accent,
  marks,
  startDeg,
  sweepDeg,
}: {
  id: ComplicationId;
  now: Date;
  metrics: Metrics;
  accent: string;
  marks: string;
  startDeg: number;
  sweepDeg: number;
}) {
  const progress = progressFor(id, metrics);
  const r = 88;
  const filled = Math.max(0.04, progress) * sweepDeg;
  return (
    <g>
      <ArcPath r={r} start={startDeg} sweep={sweepDeg} color={marks} width={3.2} opacity={0.28} />
      <ArcPath r={r} start={startDeg} sweep={filled} color={accent} width={3.2} opacity={1} />
    </g>
  );
}

function round2(n: number) {
  return Math.round(n * 100) / 100;
}

function ArcPath({
  r,
  start,
  sweep,
  color,
  width,
  opacity,
}: {
  r: number;
  start: number;
  sweep: number;
  color: string;
  width: number;
  opacity: number;
}) {
  const s = ((start - 90) * Math.PI) / 180;
  const e = ((start + sweep - 90) * Math.PI) / 180;
  const x1 = round2(100 + Math.cos(s) * r);
  const y1 = round2(100 + Math.sin(s) * r);
  const x2 = round2(100 + Math.cos(e) * r);
  const y2 = round2(100 + Math.sin(e) * r);
  const large = sweep > 180 ? 1 : 0;
  return (
    <path
      d={`M ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2}`}
      fill="none"
      stroke={color}
      strokeWidth={width}
      strokeLinecap="round"
      opacity={opacity}
    />
  );
}

function iconFor(id: ComplicationId) {
  switch (id) {
    case "hr":
      return Activity;
    case "steps":
      return Footprints;
    case "battery":
      return Battery;
    case "weather":
      return CloudSun;
    case "date":
    case "cal":
      return Calendar;
    case "week":
      return Hash;
  }
}

function labelFor(id: ComplicationId) {
  switch (id) {
    case "hr":
      return "BPM";
    case "steps":
      return "STEPS";
    case "battery":
      return "BATT";
    case "weather":
      return "TEMP";
    case "date":
      return weekday(new Date()).slice(0, 3);
    case "cal":
      return "NEXT";
    case "week":
      return "WEEK";
  }
}

export function valueFor(
  id: ComplicationId,
  now: Date,
  metrics: Metrics,
  compact?: boolean,
) {
  switch (id) {
    case "hr":
      return String(metrics.hr);
    case "steps":
      if (compact && metrics.steps >= 1000) {
        return `${(metrics.steps / 1000).toFixed(1)}k`;
      }
      return formatSteps(metrics.steps);
    case "battery":
      return `${metrics.battery}%`;
    case "weather":
      return `${metrics.temp}°`;
    case "date":
      return String(now.getDate());
    case "cal":
      return metrics.nextCalTime;
    case "week":
      return `W${weekNumber(now)}`;
  }
}

export function progressFor(id: ComplicationId, metrics: Metrics) {
  switch (id) {
    case "hr":
      return Math.min(1, metrics.hr / 140);
    case "steps":
      return Math.min(1, metrics.steps / 10000);
    case "battery":
      return metrics.battery / 100;
    case "weather":
      return Math.min(1, Math.max(0, (metrics.temp - 40) / 50));
    default:
      return 0.45;
  }
}

export function dateLabel(now: Date) {
  return `${weekday(now)} ${monthDay(now)}`;
}
