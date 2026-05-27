import { TIME_PERIODS, TIME_SLOTS } from "../utils/showDates";

export default function ShowTimePicker({ slot, period, onSlotChange, onPeriodChange }) {
  return (
    <div className="grid grid-cols-2 gap-2">
      <label className="text-xs uppercase tracking-widest text-smoke">
        Time
        <select
          className="mt-1 w-full rounded border border-leather bg-ink px-3 py-2 text-stone-100"
          value={slot}
          onChange={(e) => onSlotChange(e.target.value)}
          required
        >
          {TIME_SLOTS.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </label>
      <label className="text-xs uppercase tracking-widest text-smoke">
        AM / PM
        <select
          className="mt-1 w-full rounded border border-leather bg-ink px-3 py-2 text-stone-100"
          value={period}
          onChange={(e) => onPeriodChange(e.target.value)}
          required
        >
          {TIME_PERIODS.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}
