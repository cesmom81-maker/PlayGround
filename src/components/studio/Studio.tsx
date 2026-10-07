import { PixelWatch } from "@/components/watch/PixelWatch";
import { ControlPanel } from "./ControlPanel";
import { useWatch } from "@/lib/watch/store";
import { FACES, COLORWAYS } from "@/lib/watch/types";
import { Button } from "@/components/ui/button";

export function Studio() {
  const face = useWatch((s) => s.face);
  const colorway = useWatch((s) => s.colorway);
  const hintSeen = useWatch((s) => s.hintSeen);
  const dismissHint = useWatch((s) => s.dismissHint);
  const def = FACES.find((f) => f.id === face)!;
  const cw = COLORWAYS[colorway];

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-5 pb-20 pt-6 lg:flex-row lg:items-start lg:gap-16 lg:pt-10">
      <div className="flex min-w-0 flex-1 flex-col items-center">
        <div className="studio-vignette relative flex w-full flex-col items-center rounded-2xl px-4 py-8 lg:py-12">
          <PixelWatch />
          <div className="mt-2 text-center">
            <p className="font-serif text-2xl">{def.name}</p>
            <p className="mt-1 font-sans text-sm text-muted">
              {cw.name} · {def.tagline}
            </p>
          </div>

          {!hintSeen ? (
            <div className="hint-enter mt-6 max-w-sm rounded-lg border border-border bg-surface px-4 py-3 text-center">
              <p className="font-sans text-sm leading-relaxed text-muted">
                Long-press the face to edit. Turn the crown — or scroll — to
                change faces. Side button toggles always-on.
              </p>
              <Button
                variant="ghost"
                size="sm"
                className="mt-2 text-accent"
                onClick={dismissHint}
              >
                Got it
              </Button>
            </div>
          ) : null}
        </div>
      </div>

      <aside className="w-full shrink-0 lg:max-w-sm lg:pt-6">
        <ControlPanel />
      </aside>
    </div>
  );
}
