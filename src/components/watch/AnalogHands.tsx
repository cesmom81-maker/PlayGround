import { useEffect, useRef } from "react";

type Props = {
  color: string;
  accent: string;
  showSeconds: boolean;
  sweep: boolean;
};

function round2(n: number) {
  return Math.round(n * 100) / 100;
}

function polar(deg: number, r: number) {
  const a = ((deg - 90) * Math.PI) / 180;
  return { x: round2(100 + Math.cos(a) * r), y: round2(100 + Math.sin(a) * r) };
}

function anglesAt(date: Date, sweep: boolean, reduce: boolean) {
  const ms = date.getMilliseconds();
  const s = date.getSeconds() + (sweep && !reduce ? ms / 1000 : 0);
  const m = date.getMinutes() + s / 60;
  const h = (date.getHours() % 12) + m / 60;
  return { h: h * 30, m: m * 6, s: s * 6 };
}

export function AnalogHands({ color, accent, showSeconds, sweep }: Props) {
  const hourRef = useRef<SVGLineElement>(null);
  const minuteRef = useRef<SVGLineElement>(null);
  const secondRef = useRef<SVGLineElement>(null);
  const seed = anglesAt(new Date(2026, 8, 25, 10, 10, 8), false, true);

  useEffect(() => {
    let raf = 0;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const apply = (date: Date) => {
      const ang = anglesAt(date, sweep, reduce);
      const h = polar(ang.h, 54);
      const m = polar(ang.m, 70);
      const s = polar(ang.s, 78);
      hourRef.current?.setAttribute("x2", String(h.x));
      hourRef.current?.setAttribute("y2", String(h.y));
      minuteRef.current?.setAttribute("x2", String(m.x));
      minuteRef.current?.setAttribute("y2", String(m.y));
      if (secondRef.current) {
        secondRef.current.setAttribute("x2", String(s.x));
        secondRef.current.setAttribute("y2", String(s.y));
      }
    };

    apply(new Date());

    if (showSeconds && sweep && !reduce) {
      const loop = () => {
        apply(new Date());
        raf = requestAnimationFrame(loop);
      };
      raf = requestAnimationFrame(loop);
      return () => cancelAnimationFrame(raf);
    }

    const id = window.setInterval(() => apply(new Date()), 1000);
    return () => window.clearInterval(id);
  }, [showSeconds, sweep]);

  const h0 = polar(seed.h, 54);
  const m0 = polar(seed.m, 70);
  const s0 = polar(seed.s, 78);

  return (
    <g>
      <line
        ref={hourRef}
        x1="100"
        y1="100"
        x2={h0.x}
        y2={h0.y}
        stroke={color}
        strokeWidth="5.2"
        strokeLinecap="round"
      />
      <line
        ref={minuteRef}
        x1="100"
        y1="100"
        x2={m0.x}
        y2={m0.y}
        stroke={color}
        strokeWidth="3.4"
        strokeLinecap="round"
      />
      {showSeconds ? (
        <line
          ref={secondRef}
          x1="100"
          y1="100"
          x2={s0.x}
          y2={s0.y}
          stroke={accent}
          strokeWidth="1.2"
          strokeLinecap="round"
        />
      ) : null}
      <circle cx="100" cy="100" r="4.8" fill={color} />
      <circle cx="100" cy="100" r="2.2" fill={accent} />
    </g>
  );
}

export function MinuteTrack({ color, major }: { color: string; major: string }) {
  return (
    <g>
      {TICKS.map((t) => (
        <line
          key={t.i}
          x1={t.x1}
          y1={t.y1}
          x2={t.x2}
          y2={t.y2}
          stroke={t.cardinal ? major : color}
          strokeWidth={t.cardinal ? 1.8 : t.hour ? 1.2 : 0.55}
          strokeLinecap="round"
          opacity={t.cardinal ? 1 : t.hour ? 0.85 : 0.45}
        />
      ))}
    </g>
  );
}

const TICKS = Array.from({ length: 60 }, (_, i) => {
  const a = (i / 60) * Math.PI * 2 - Math.PI / 2;
  const hour = i % 5 === 0;
  const cardinal = i % 15 === 0;
  const inner = cardinal ? 78 : hour ? 82 : 86;
  const outer = 91;
  return {
    i,
    hour,
    cardinal,
    x1: round2(100 + Math.cos(a) * inner),
    y1: round2(100 + Math.sin(a) * inner),
    x2: round2(100 + Math.cos(a) * outer),
    y2: round2(100 + Math.sin(a) * outer),
  };
});
