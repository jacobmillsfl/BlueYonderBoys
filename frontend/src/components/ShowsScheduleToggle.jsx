export default function ShowsScheduleToggle({ value, onChange }) {
  return (
    <div className="inline-flex rounded-lg border border-leather/50 p-0.5">
      {[
        { id: "upcoming", label: "Upcoming" },
        { id: "past", label: "Past" },
      ].map((opt) => (
        <button
          key={opt.id}
          type="button"
          onClick={() => onChange(opt.id)}
          className={`rounded-md px-4 py-1.5 text-xs uppercase tracking-widest transition ${
            value === opt.id ? "bg-rust text-stone-50" : "text-smoke hover:text-ember"
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
