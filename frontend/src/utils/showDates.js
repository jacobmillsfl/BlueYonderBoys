export const TIME_SLOTS = (() => {
  const hours = [12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
  const minutes = ["00", "15", "30", "45"];
  const slots = [];
  for (const hour of hours) {
    for (const minute of minutes) {
      slots.push(`${hour}:${minute}`);
    }
  }
  return slots;
})();

export const TIME_PERIODS = ["AM", "PM"];

/** Normalize stored show dates to yyyy-mm-dd for <input type="date">. */
export function toDateInputValue(dateStr) {
  if (!dateStr) return "";
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return dateStr;
  const slash = dateStr.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (slash) {
    const [, month, day, year] = slash;
    return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
  }
  return dateStr;
}

/** Ordinal suffix for a day of month (e.g. 12 → "12th"). */
export function ordinalDay(day) {
  const n = Number(day);
  if (n >= 11 && n <= 13) return `${n}th`;
  const mod = n % 10;
  if (mod === 1) return `${n}st`;
  if (mod === 2) return `${n}nd`;
  if (mod === 3) return `${n}rd`;
  return `${n}th`;
}

/** Display-friendly date (e.g. May 12th 2026). */
export function formatShowDate(dateStr) {
  const iso = toDateInputValue(dateStr);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) return dateStr;
  const [year, month, day] = iso.split("-");
  const date = new Date(`${year}-${month}-${day}T12:00:00`);
  const monthName = date.toLocaleString("en-US", { month: "long" });
  return `${monthName} ${ordinalDay(day)} ${year}`;
}

export function getTodayIso() {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/** Parse stored time strings into dropdown values. */
export function parseTimeParts(timeStr) {
  if (!timeStr) return { slot: "7:00", period: "PM" };
  const compact = timeStr.trim().toUpperCase().replace(/\s/g, "");
  const match = compact.match(/^(\d{1,2}):(\d{2})(AM|PM)?$/);
  if (!match) return { slot: "7:00", period: "PM" };

  let hour = parseInt(match[1], 10);
  const minute = match[2];
  let period = match[3] || "";

  if (!period) {
    if (hour === 0) {
      hour = 12;
      period = "AM";
    } else if (hour === 12) {
      period = "PM";
    } else if (hour > 12) {
      hour -= 12;
      period = "PM";
    } else {
      period = "AM";
    }
  }

  const slot = `${hour}:${minute}`;
  const nearest = TIME_SLOTS.includes(slot) ? slot : TIME_SLOTS[0];
  return { slot: nearest, period: TIME_PERIODS.includes(period) ? period : "PM" };
}

/** Canonical storage/display time (e.g. "7:00 PM"). */
export function formatTimeFromParts(slot, period) {
  return `${slot} ${period}`;
}

export function formatShowTime(timeStr) {
  if (!timeStr) return "—";
  const { slot, period } = parseTimeParts(timeStr);
  return formatTimeFromParts(slot, period);
}

export function showAddress(show) {
  return show.address || show.location || "";
}

export function googleMapsSearchUrl(show) {
  const query = showAddress(show) || show.venue || "";
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}

/** @param {"upcoming"|"past"} schedule */
export function filterShowsBySchedule(shows, schedule) {
  const today = getTodayIso();
  const filtered = shows.filter((show) => {
    const iso = toDateInputValue(show.date);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) return schedule === "upcoming";
    if (schedule === "upcoming") return iso >= today;
    return iso < today;
  });
  return filtered.sort((a, b) => {
    const da = toDateInputValue(a.date);
    const db = toDateInputValue(b.date);
    if (da !== db) {
      return schedule === "upcoming" ? da.localeCompare(db) : db.localeCompare(da);
    }
    return formatShowTime(a.time).localeCompare(formatShowTime(b.time));
  });
}
