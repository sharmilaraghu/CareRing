import { describe, it, expect } from "vitest";
import fc from "fast-check";

describe("fast-check setup", () => {
  it("should run property-based tests", () => {
    fc.assert(
      fc.property(fc.integer(), fc.integer(), (a, b) => {
        expect(a + b).toBe(b + a);
      })
    );
  });
});
