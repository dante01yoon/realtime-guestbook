import { describe, expect, it, vi } from "vitest";
import { formatRelativeDate } from "@/lib/format";

describe("formatRelativeDate", () => {
  it("returns minutes ago", () => {
    const now = new Date("2024-01-01T12:00:00Z");
    vi.setSystemTime(now);
    const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000).toISOString();
    expect(formatRelativeDate(fiveMinutesAgo)).toBe("5분 전");
  });

  it("returns formatted date", () => {
    const result = formatRelativeDate("2022-05-01T00:00:00Z");
    expect(result).toContain("2022");
  });
});
