import { Studio } from "./components/studio/Studio";

export default function App() {
  return (
    <main className="min-h-dvh bg-bg text-fg">
      <header className="mx-auto flex w-full max-w-6xl items-baseline justify-between px-5 pt-6">
        <h1 className="font-serif text-3xl tracking-tight lg:text-4xl">Mendsway</h1>
        <p className="font-sans text-xs uppercase tracking-[0.22em] text-subtle">
          Pixel Watch 2
        </p>
      </header>
      <Studio />
      <footer className="mx-auto max-w-6xl px-5 pb-10">
        <p className="font-sans text-xs leading-relaxed text-subtle">
          A boutique face collection for the 41 mm Pixel Watch 2. Four faces — Seam, Way,
          Arc, Field — in Kintsugi, Porcelain, and Night. Hardware finishes match the
          official aluminum cases and Active bands.
        </p>
      </footer>
    </main>
  );
}
