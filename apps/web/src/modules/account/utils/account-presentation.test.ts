import { describe, expect, it } from "vitest";

import { formatNotificationDate, getInitials } from "./account-presentation";

describe("getInitials", () => {
  it("uses the first letters of the authenticated user's names", () => {
    expect(getInitials("Ada", "Lovelace")).toBe("AL");
  });

  it("uses the email prefix when name data is unavailable", () => {
    expect(getInitials(undefined, undefined, "grace@example.com")).toBe("G");
  });
});

describe("formatNotificationDate", () => {
  it("returns an accessible, non-empty date label for an API timestamp", () => {
    expect(formatNotificationDate("2026-09-28T14:30:00.000Z")).not.toBe("");
  });

  it("returns a safe fallback for an invalid timestamp", () => {
    expect(formatNotificationDate("not-a-date")).toBe("Date unavailable");
  });
});
