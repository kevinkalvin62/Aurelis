import { describe, expect, it } from "vitest";
import { firstDisplayName, homeProgramCta } from "./home-presentation";

describe("home presentation", () => {
  it("uses only the first non-empty name", () => {
    expect(firstDisplayName("  Kevin Brenes ")).toBe("Kevin");
    expect(firstDisplayName(undefined)).toBe("Músico");
  });

  it("adapts the CTA to the local event date", () => {
    const today = new Date(2026, 6, 5, 23, 30);
    expect(homeProgramCta("2026-07-06", today)).toBe("Prepararme  ›");
    expect(homeProgramCta("2026-07-05", today)).toBe("Abrir programa  ›");
    expect(homeProgramCta("2026-07-04", today)).toBe("Abrir setlist  ›");
    expect(homeProgramCta(undefined, today)).toBe("Abrir setlist  ›");
  });
});
