export default function AdminAlert({ type = "error", message, onDismiss }) {
  if (!message) return null;

  const styles =
    type === "error"
      ? "border-red-400/60 bg-red-950/50 text-red-100"
      : "border-ember/50 bg-midnight/60 text-ember";

  return (
    <div
      role="alert"
      className={`mt-4 flex items-start justify-between gap-3 rounded-lg border px-4 py-3 ${styles}`}
    >
      <p className="min-w-0 flex-1 text-sm leading-relaxed">{message}</p>
      <button
        type="button"
        onClick={onDismiss}
        className="shrink-0 rounded px-2 py-0.5 text-lg leading-none text-smoke/80 transition hover:bg-white/10 hover:text-stone-100"
        aria-label="Dismiss"
      >
        ×
      </button>
    </div>
  );
}
