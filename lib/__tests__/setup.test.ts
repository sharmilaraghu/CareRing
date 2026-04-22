import { describe, it, expect } from "vitest";

describe("Project setup", () => {
  it("should have vitest configured correctly", () => {
    expect(1 + 1).toBe(2);
  });

  it("should resolve @ path alias", async () => {
    // Verify the path alias works by importing from @/
    const mod = await import("@/vitest.config");
    expect(mod).toBeDefined();
  });
});
