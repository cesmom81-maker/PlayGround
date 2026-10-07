import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";
import { useWatch } from "@/lib/watch/store";
import {
  BANDS,
  CASES,
  COLORWAYS,
  COLORWAY_IDS,
  COMPLICATIONS,
  FACES,
  type CaseId,
  type SlotId,
} from "@/lib/watch/types";

const SLOTS: { id: SlotId; label: string }[] = [
  { id: "north", label: "Top" },
  { id: "east", label: "Right" },
  { id: "south", label: "Bottom" },
  { id: "west", label: "Left" },
];

export function ControlPanel() {
  const face = useWatch((s) => s.face);
  const colorway = useWatch((s) => s.colorway);
  const caseId = useWatch((s) => s.caseId);
  const band = useWatch((s) => s.band);
  const hour24 = useWatch((s) => s.hour24);
  const ambient = useWatch((s) => s.ambient);
  const slots = useWatch((s) => s.slots);
  const setFace = useWatch((s) => s.setFace);
  const setColorway = useWatch((s) => s.setColorway);
  const setCase = useWatch((s) => s.setCase);
  const setBand = useWatch((s) => s.setBand);
  const setHour24 = useWatch((s) => s.setHour24);
  const setAmbient = useWatch((s) => s.setAmbient);
  const cycleSlot = useWatch((s) => s.cycleSlot);
  const setEditMode = useWatch((s) => s.setEditMode);

  return (
    <div className="flex w-full flex-col gap-8">
      <Section title="Face" kicker="Collection">
        <div className="grid grid-cols-2 gap-2">
          {FACES.map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setFace(f.id)}
              className={cn(
                "rounded-lg border px-3 py-3 text-left transition-[border-color,background-color] duration-150",
                face === f.id
                  ? "border-accent/50 bg-surface-2"
                  : "border-border bg-transparent hover:bg-surface-2",
              )}
            >
              <p className="font-serif text-lg leading-tight">{f.name}</p>
              <p className="mt-1 font-sans text-xs text-muted">{f.tagline}</p>
            </button>
          ))}
        </div>
      </Section>

      <Section title="Colorway" kicker="Dial">
        <div className="flex gap-2">
          {COLORWAY_IDS.map((id) => {
            const c = COLORWAYS[id];
            const on = colorway === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => setColorway(id)}
                className={cn(
                  "flex flex-1 flex-col items-center gap-2 rounded-lg border px-2 py-3 transition-[border-color] duration-150",
                  on ? "border-accent/50" : "border-border hover:border-muted",
                )}
                aria-label={c.name}
                aria-pressed={on}
              >
                <span
                  className="size-8 rounded-full border border-border"
                  style={{
                    background: `conic-gradient(from 210deg, ${c.dial} 0 70%, ${c.seam} 70% 100%)`,
                  }}
                />
                <span className="font-sans text-xs text-muted">{c.name}</span>
              </button>
            );
          })}
        </div>
      </Section>

      <Section title="Case" kicker="Pixel Watch 2">
        <div className="flex flex-col gap-2">
          {CASES.map((c) => (
            <ChoiceRow
              key={c.id}
              label={c.name}
              selected={caseId === c.id}
              onClick={() => setCase(c.id)}
              swatch={<CaseSwatch id={c.id} />}
            />
          ))}
        </div>
      </Section>

      <Section title="Band" kicker="Active">
        <div className="grid grid-cols-4 gap-2">
          {BANDS.map((b) => (
            <button
              key={b.id}
              type="button"
              onClick={() => setBand(b.id)}
              className={cn(
                "flex flex-col items-center gap-2 rounded-lg border px-2 py-3 transition-[border-color] duration-150",
                band === b.id
                  ? "border-accent/50"
                  : "border-border hover:border-muted",
              )}
              aria-label={b.name}
              aria-pressed={band === b.id}
            >
              <span className={cn("h-8 w-6 rounded-sm", `band-${b.id}`)} />
              <span className="font-sans text-xs text-muted">{b.name}</span>
            </button>
          ))}
        </div>
      </Section>

      <Section title="Complications" kicker="Tap on the face or here">
        <div className="flex flex-col gap-2">
          {SLOTS.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => cycleSlot(s.id)}
              className="flex items-center justify-between rounded-md border border-border px-3 py-2.5 text-left hover:bg-surface-2"
            >
              <span className="font-sans text-sm text-muted">{s.label}</span>
              <span className="font-sans text-sm font-medium">
                {COMPLICATIONS[slots[s.id]].label}
              </span>
            </button>
          ))}
        </div>
      </Section>

      <Section title="Display" kicker="Mode">
        <div className="flex flex-col gap-2">
          <ToggleRow
            label="24-hour time"
            on={hour24}
            onToggle={() => setHour24(!hour24)}
          />
          <ToggleRow
            label="Always-on"
            on={ambient}
            onToggle={() => setAmbient(!ambient)}
          />
        </div>
        <Button
          variant="outline"
          className="mt-3 w-full"
          onClick={() => setEditMode(true)}
        >
          Edit on watch
        </Button>
      </Section>
    </div>
  );
}

function Section({
  title,
  kicker,
  children,
}: {
  title: string;
  kicker: string;
  children: ReactNode;
}) {
  return (
    <section>
      <p className="font-sans text-xs uppercase tracking-[0.18em] text-subtle">
        {kicker}
      </p>
      <h2 className="mb-3 mt-1 font-serif text-2xl leading-tight">{title}</h2>
      {children}
    </section>
  );
}

function ChoiceRow({
  label,
  selected,
  onClick,
  swatch,
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
  swatch: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 rounded-md border px-3 py-2.5 text-left transition-[border-color,background-color] duration-150",
        selected
          ? "border-accent/50 bg-surface-2"
          : "border-border hover:bg-surface-2",
      )}
      aria-pressed={selected}
    >
      {swatch}
      <span className="font-sans text-sm">{label}</span>
    </button>
  );
}

function CaseSwatch({ id }: { id: CaseId }) {
  return <span className={cn("size-6 rounded-full", `case-${id}`)} />;
}

function ToggleRow({
  label,
  on,
  onToggle,
}: {
  label: string;
  on: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="flex h-11 items-center justify-between rounded-md border border-border px-3 hover:bg-surface-2"
      aria-pressed={on}
    >
      <span className="font-sans text-sm">{label}</span>
      <span
        className={cn(
          "relative h-6 w-10 rounded-full transition-colors duration-150",
          on ? "bg-accent" : "bg-surface-2",
        )}
      >
        <span
          className={cn(
            "absolute top-0.5 size-5 rounded-full bg-fg transition-transform duration-150",
            on ? "translate-x-4" : "translate-x-0.5",
          )}
        />
      </span>
    </button>
  );
}
