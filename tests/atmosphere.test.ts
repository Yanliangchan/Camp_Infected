import { describe, it, expect } from "vitest";
import { atmosphereLevel } from "../src/render/atmosphere";
describe("ambient lighting readability", () => {
  it("never blacks out and avoids abrupt high-frequency changes over a full minute", () => {
    for (const kind of ["fluorescent", "beacon"] as const) {
      let previous = atmosphereLevel(0, kind);
      for (let t = 0.02; t < 60; t += 0.02) {
        const value = atmosphereLevel(t, kind);
        expect(value).toBeGreaterThan(0.6);
        expect(value).toBeLessThanOrEqual(1.016);
        expect(Math.abs(value - previous)).toBeLessThan(0.025);
        previous = value;
      }
    }
  });
  it("separates fixture dips and restores steady lighting when effects are disabled", () => {
    expect(atmosphereLevel(4, "fluorescent", 0)).toBeLessThan(0.65);
    expect(atmosphereLevel(4, "fluorescent", 5.7)).toBeGreaterThan(0.98);
    for (const kind of ["fluorescent", "beacon"] as const)
      expect(atmosphereLevel(4, kind, 0, false)).toBe(1);
  });
});
