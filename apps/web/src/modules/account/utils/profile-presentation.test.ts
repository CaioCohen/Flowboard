import { describe, expect, it } from "vitest";

import { getProfileDisplayName } from "./profile-presentation";

describe("getProfileDisplayName", () => {
  it("combines the authenticated user's first and last name for profile navigation", () => {
    expect(getProfileDisplayName({ firstName: "Caio", lastName: "Test" })).toBe("Caio Test");
  });

  it("uses Account when no authenticated user is available", () => {
    expect(getProfileDisplayName(null)).toBe("Account");
  });
});
