import { describe, expect, it } from "vitest";
import { hashString, randomFromArray, rotationFromSeed } from "@/lib/utils";

describe("hashString", () => {
  it("returns deterministic positive hash", () => {
    expect(hashString("hello")).toBe(hashString("hello"));
    expect(hashString("hello")).toBeGreaterThanOrEqual(0);
  });
});

describe("randomFromArray", () => {
  it("picks element based on seed", () => {
    const items = ["a", "b", "c"];
    expect(randomFromArray(items, 1)).toBe("b");
    expect(randomFromArray(items, 4)).toBe("b");
  });
});

describe("rotationFromSeed", () => {
  it("cycles through rotations", () => {
    expect(rotationFromSeed(0)).toBe(-4);
    expect(rotationFromSeed(5)).toBe(-4);
  });
});
