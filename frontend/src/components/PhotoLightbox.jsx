import { useEffect } from "react";

export default function PhotoLightbox({ photo, onClose }) {
  useEffect(() => {
    if (!photo) return;
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [photo, onClose]);

  if (!photo) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-ink/95 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label="Photo viewer"
      onClick={onClose}
    >
      <button
        type="button"
        onClick={onClose}
        className="absolute right-4 top-4 z-10 rounded border border-leather/60 bg-bark/90 px-3 py-1 text-xs uppercase tracking-widest text-ember hover:bg-midnight"
      >
        Close
      </button>
      <figure className="max-h-full max-w-5xl" onClick={(e) => e.stopPropagation()}>
        <img
          src={photo.url}
          alt={photo.caption || "Band photo"}
          className="max-h-[85vh] w-auto max-w-full rounded-lg object-contain shadow-glow"
        />
        {photo.caption && (
          <figcaption className="mt-3 text-center text-sm text-smoke">{photo.caption}</figcaption>
        )}
      </figure>
    </div>
  );
}
