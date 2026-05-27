import { describe, expect, it, vi } from "vitest";
import {
  filterShowsBySchedule,
  formatShowDate,
  formatShowTime,
  getTodayIso,
  googleMapsSearchUrl,
  parseTimeParts,
  toDateInputValue,
} from "./showDates";

describe("toDateInputValue", () => {
  it("keeps ISO dates", () => {
    expect(toDateInputValue("2026-05-24")).toBe("2026-05-24");
  });

  it("converts slash dates", () => {
    expect(toDateInputValue("5/24/2026")).toBe("2026-05-24");
  });
});

describe("formatShowDate", () => {
  it("formats ISO dates for display", () => {
    expect(formatShowDate("2026-05-24")).toBe("May 24th 2026");
    expect(formatShowDate("2026-05-12")).toBe("May 12th 2026");
    expect(formatShowDate("2026-05-01")).toBe("May 1st 2026");
    expect(formatShowDate("2026-05-03")).toBe("May 3rd 2026");
  });
});

describe("formatShowTime", () => {
  it("normalizes compact times", () => {
    expect(formatShowTime("7:30PM")).toBe("7:30 PM");
  });

  it("returns em dash when empty", () => {
    expect(formatShowTime("")).toBe("—");
  });
});

describe("parseTimeParts", () => {
  it("defaults missing time to 7:00 PM", () => {
    expect(parseTimeParts("")).toEqual({ slot: "7:00", period: "PM" });
  });
});

describe("googleMapsSearchUrl", () => {
  it("prefers address over venue", () => {
    const url = googleMapsSearchUrl({
      venue: "The Armory",
      address: "123 Main St",
    });
    expect(url).toContain(encodeURIComponent("123 Main St"));
  });
});

describe("filterShowsBySchedule", () => {
  it("splits upcoming and past shows by today", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-05-26T12:00:00"));

    const shows = [
      { id: 1, date: "2026-05-20", time: "7:00 PM", venue: "Past", address: "A" },
      { id: 2, date: "2026-06-01", time: "8:00 PM", venue: "Future", address: "B" },
    ];

    const upcoming = filterShowsBySchedule(shows, "upcoming");
    const past = filterShowsBySchedule(shows, "past");

    expect(upcoming.map((s) => s.venue)).toEqual(["Future"]);
    expect(past.map((s) => s.venue)).toEqual(["Past"]);
    expect(getTodayIso()).toBe("2026-05-26");

    vi.useRealTimers();
  });
});
