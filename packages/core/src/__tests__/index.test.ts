import { describe, expect, it } from "vitest";

import { formatDate } from "../index";

describe("formatDate", () => {
  it("formats a date string for en locale", () => {
    const result = formatDate("2024-01-15T10:30:00Z", "en");

    expect(result).toContain("2024");
    expect(result).toContain("15");
    expect(result).toContain("Jan");
  });

  it("formats a date string for zh locale", () => {
    const result = formatDate("2024-01-15T10:30:00Z", "zh");

    expect(result).toContain("2024");
    expect(result).toContain("15");
  });

  it("defaults to en locale when not specified", () => {
    const result = formatDate("2024-06-01T00:00:00Z");

    expect(result).toContain("Jun");
    expect(result).toContain("2024");
  });
});
