import { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/cn";
import { useWatch } from "@/lib/watch/store";
import { WatchFace } from "./WatchFace";

export function PixelWatch() {
  const caseId = useWatch((s) => s.caseId);
  const band = useWatch((s) => s.band);
  const ambient = useWatch((s) => s.ambient);
  const editMode = useWatch((s) => s.editMode);
  const cycleFace = useWatch((s) => s.cycleFace);
  const toggleAmbient = useWatch((s) => s.toggleAmbient);
  const setEditMode = useWatch((s) => s.setEditMode);

  const [crownRot, setCrownRot] = useState(0);
  const [tick, setTick] = useState(false);
  const drag = useRef<{ y: number; acc: number } | null>(null);
  const pressTimer = useRef<number | 0>(0);
  const caseRef = useRef<HTMLDivElement>(null);

  const bump = useCallback(
    (dir: 1 | -1) => {
      cycleFace(dir);
      setCrownRot((r) => r + dir * 28);
      setTick(true);
      window.setTimeout(() => setTick(false), 180);
    },
    [cycleFace],
  );

  const onCrownPointerDown = (e: React.PointerEvent) => {
    e.preventDefault();
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    drag.current = { y: e.clientY, acc: 0 };
  };

  const onCrownPointerMove = (e: React.PointerEvent) => {
    if (!drag.current) return;
    const dy = drag.current.y - e.clientY;
    drag.current.y = e.clientY;
    drag.current.acc += dy;
    if (Math.abs(drag.current.acc) >= 24) {
      bump(drag.current.acc > 0 ? 1 : -1);
      drag.current.acc = 0;
    }
  };

  const onCrownPointerUp = (e: React.PointerEvent) => {
    (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    if (drag.current && Math.abs(drag.current.acc) < 8) {
      bump(1);
    }
    drag.current = null;
  };

  useEffect(() => {
    const el = caseRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      if (Math.abs(e.deltaY) < 8) return;
      bump(e.deltaY > 0 ? 1 : -1);
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [bump]);

  const onFacePointerDown = () => {
    pressTimer.current = window.setTimeout(() => {
      setEditMode(true);
      pressTimer.current = 0;
    }, 480);
  };

  const onFacePointerUp = () => {
    if (pressTimer.current) {
      window.clearTimeout(pressTimer.current);
      pressTimer.current = 0;
      if (editMode) setEditMode(false);
    }
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === "ArrowDown") bump(1);
      if (e.key === "ArrowLeft" || e.key === "ArrowUp") bump(-1);
      if (e.key === "a" || e.key === "A") toggleAmbient();
      if (e.key === "e" || e.key === "E") setEditMode(!useWatch.getState().editMode);
      if (e.key === "Escape") setEditMode(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [bump, toggleAmbient, setEditMode]);

  return (
    <div className={cn("watch-stage", tick && "watch-tick")}>
      <div className={cn("watch-band watch-band-top", `band-${band}`)} />

      <div ref={caseRef} className={cn("watch-case", `case-${caseId}`)}>
        <div className={cn("watch-glass", ambient && "watch-ambient")}>
          <div
            className="watch-face-root"
            onPointerDown={onFacePointerDown}
            onPointerUp={onFacePointerUp}
            onPointerLeave={onFacePointerUp}
            onPointerCancel={onFacePointerUp}
            role="img"
            aria-label="Mendsway watch face. Long-press to edit. Scroll or use the crown to change faces."
          >
            <WatchFace />
          </div>
          <div className="watch-glare" />
        </div>

        <button
          type="button"
          className={cn("watch-side-btn", `btn-${caseId}`)}
          aria-label={ambient ? "Exit always-on display" : "Always-on display"}
          onClick={toggleAmbient}
        />

        <button
          type="button"
          className={cn("watch-crown", `crown-${caseId}`)}
          style={{ "--crown-rot": `${crownRot}deg` } as React.CSSProperties}
          aria-label="Digital crown. Drag or click to change faces."
          onPointerDown={onCrownPointerDown}
          onPointerMove={onCrownPointerMove}
          onPointerUp={onCrownPointerUp}
        />
      </div>

      <div className={cn("watch-band watch-band-bottom", `band-${band}`)} />
    </div>
  );
}
