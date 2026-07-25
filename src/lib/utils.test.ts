import { cn, parseServerDate, formatUptime } from "./utils";

describe("parseServerDate", () => {
  it("treats an offset-less timestamp as UTC (not local)", () => {
    // The bug this guards: ES parses a date-TIME with no offset as LOCAL time, so
    // a naive-UTC server value would shift by the viewer's offset. Both forms must
    // resolve to the same instant.
    const naive = parseServerDate("2026-07-24T12:00:00");
    const explicit = parseServerDate("2026-07-24T12:00:00Z");
    expect(naive.getTime()).toBe(explicit.getTime());
    expect(naive.toISOString()).toBe("2026-07-24T12:00:00.000Z");
  });

  it("leaves an already-Z timestamp unchanged", () => {
    expect(parseServerDate("2026-07-24T12:00:00Z").toISOString()).toBe("2026-07-24T12:00:00.000Z");
  });

  it("respects an explicit numeric offset without double-suffixing", () => {
    expect(parseServerDate("2026-07-24T12:00:00+05:30").toISOString()).toBe(
      "2026-07-24T06:30:00.000Z",
    );
    expect(parseServerDate("2026-07-24T12:00:00-04:00").toISOString()).toBe(
      "2026-07-24T16:00:00.000Z",
    );
  });
});

describe("formatUptime", () => {
  it("shows seconds under a minute", () => {
    expect(formatUptime(0)).toBe("0s");
    expect(formatUptime(59)).toBe("59s");
  });

  it("shows minutes and seconds under an hour", () => {
    expect(formatUptime(60)).toBe("1m 0s");
    expect(formatUptime(3599)).toBe("59m 59s");
  });

  it("shows hours/minutes/seconds under a day", () => {
    expect(formatUptime(3600)).toBe("1h 0m 0s");
    expect(formatUptime(86399)).toBe("23h 59m 59s");
  });

  it("shows days/hours/minutes at a day or more", () => {
    expect(formatUptime(86400)).toBe("1d 0h 0m");
    expect(formatUptime(90061)).toBe("1d 1h 1m");
  });
});

describe("cn() utility", () => {
  it("merges class names", () => {
    expect(cn("foo", "bar")).toBe("foo bar");
  });

  it("handles conditional classes", () => {
    const isHidden = false;
    expect(cn("base", isHidden && "hidden", "visible")).toBe("base visible");
  });

  it("deduplicates tailwind classes", () => {
    expect(cn("p-4", "p-2")).toBe("p-2");
  });

  it("handles undefined and null values", () => {
    expect(cn("base", undefined, null, "end")).toBe("base end");
  });

  it("handles empty input", () => {
    expect(cn()).toBe("");
  });

  it("merges conflicting tailwind utilities correctly", () => {
    expect(cn("text-red-500", "text-blue-500")).toBe("text-blue-500");
  });
});
