export type Metrics = {
  hr: number;
  steps: number;
  battery: number;
  temp: number;
  weather: string;
  nextCal: string;
  nextCalTime: string;
};

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

export function metricsAt(now: Date): Metrics {
  const h = now.getHours();
  const m = now.getMinutes();
  const s = now.getSeconds();
  const t = h * 3600 + m * 60 + s;

  const awake = h >= 6 && h < 23;
  const baseHr = awake ? 64 : 54;
  const hrWave = Math.sin(t / 7.5) * 4 + Math.sin(t / 19) * 2;
  const hr = Math.round(clamp(baseHr + hrWave, 52, 96));

  const stepsBase = awake ? Math.min(h - 6, 16) * 540 : 0;
  const steps = Math.max(0, stepsBase + m * 9 + Math.floor(s / 12));

  const battery = clamp(86 - Math.floor(h * 1.4) - Math.floor(m / 40), 18, 96);

  const tempWave = Math.sin(((h - 6) / 24) * Math.PI * 2) * 7;
  const temp = Math.round(64 + tempWave);

  let weather = "Fair";
  if (h >= 21 || h < 6) weather = "Clear";
  else if (h >= 12 && h < 16) weather = "Warm";
  else if (h >= 16 && h < 19) weather = "Haze";

  const nextCal =
    h < 12 ? "Walk" : h < 15 ? "Studio" : h < 18 ? "Call" : "Dinner";
  const nextHour = h < 12 ? 12 : h < 15 ? 15 : h < 18 ? 18 : 20;

  return {
    hr,
    steps,
    battery,
    temp,
    weather,
    nextCal,
    nextCalTime: `${nextHour > 12 ? nextHour - 12 : nextHour}:00`,
  };
}

export function formatSteps(n: number) {
  return n.toLocaleString("en-US");
}

export function weekday(now: Date) {
  return now.toLocaleDateString("en-US", { weekday: "short" }).toUpperCase();
}

export function monthDay(now: Date) {
  return now.toLocaleDateString("en-US", { month: "short", day: "numeric" }).toUpperCase();
}

export function weekNumber(now: Date) {
  const start = new Date(now.getFullYear(), 0, 1);
  const day = Math.floor((now.getTime() - start.getTime()) / 86400000) + 1;
  return Math.ceil(day / 7);
}

export function formatTime(now: Date, hour24: boolean) {
  let h = now.getHours();
  const m = now.getMinutes();
  const mm = String(m).padStart(2, "0");
  if (hour24) return { hours: String(h).padStart(2, "0"), minutes: mm, ampm: "" };
  const ampm = h >= 12 ? "PM" : "AM";
  h = h % 12 || 12;
  return { hours: String(h), minutes: mm, ampm };
}
