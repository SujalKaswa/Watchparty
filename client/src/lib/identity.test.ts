import { afterEach, describe, expect, it, vi } from "vitest";
import { createAnonymousName, getDisplayName, saveDisplayName } from "./identity";

afterEach(() => vi.unstubAllGlobals());

describe("anonymous display names", () => {
  it("creates an anonymous name with exactly eight random digits", () => {
    expect(createAnonymousName(0)).toBe("anonymous10000000");
    expect(createAnonymousName(0.5)).toBe("anonymous55000000");
    expect(createAnonymousName(0.999999999)).toMatch(/^anonymous\d{8}$/);
  });

  it("creates and persists a generated name when storage is empty", () => {
    const data = new Map<string, string>();
    vi.stubGlobal("localStorage", {
      getItem: (key: string) => data.get(key) ?? null,
      setItem: (key: string, value: string) => data.set(key, value),
    });
    const name = getDisplayName();
    expect(name).toMatch(/^anonymous\d{8}$/);
    expect(getDisplayName()).toBe(name);
  });

  it("replaces the old Alex default, but keeps names the visitor explicitly saves", () => {
    const data = new Map<string, string>([["reelroom-display-name", "Alex"]]);
    vi.stubGlobal("localStorage", {
      getItem: (key: string) => data.get(key) ?? null,
      setItem: (key: string, value: string) => data.set(key, value),
    });
    const migrated = getDisplayName();
    expect(migrated).toMatch(/^anonymous\d{8}$/);
    expect(data.get("reelroom-display-name")).toBe(migrated);
    expect(saveDisplayName("Mina")).toBe("Mina");
    expect(getDisplayName()).toBe("Mina");
    expect(saveDisplayName("Alex")).toBe("Alex");
    expect(getDisplayName()).toBe("Alex");
  });
});
