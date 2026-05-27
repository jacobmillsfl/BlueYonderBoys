import { useState } from "react";

const SECTIONS = [
  { id: "hero", label: "Home" },
  { id: "links", label: "Connect" },
  { id: "about", label: "About" },
  { id: "shows", label: "Shows" },
  { id: "photos", label: "Photos" },
];

export default function Nav() {
  const [open, setOpen] = useState(false);

  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    setOpen(false);
  };

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-leather/50 bg-ink/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        <button
          type="button"
          onClick={() => scrollTo("hero")}
          className="font-display text-lg tracking-wide text-ember md:text-xl"
        >
          Blue Yonder Boys
        </button>

        <button
          type="button"
          className="rounded border border-leather px-3 py-1 text-sm text-ember md:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-label="Toggle menu"
        >
          Menu
        </button>

        <nav
          className={`${open ? "flex" : "hidden"} absolute left-0 right-0 top-full flex-col gap-1 border-b border-leather/40 bg-bark px-4 py-3 md:static md:flex md:flex-row md:border-0 md:bg-transparent md:p-0`}
        >
          {SECTIONS.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => scrollTo(s.id)}
              className="rounded px-3 py-2 text-left text-sm uppercase tracking-widest text-smoke transition hover:text-ember md:text-center"
            >
              {s.label}
            </button>
          ))}
        </nav>
      </div>
    </header>
  );
}
