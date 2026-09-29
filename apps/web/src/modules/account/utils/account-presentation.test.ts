import { describe, expect, it } from "vitest";

import { applyReadNotification, formatNotificationDate, getInitials, hasUnreadNotifications } from "./account-presentation";

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

describe("hasUnreadNotifications", () => {
  it("reports unread items so the navigation bell can show an indicator", () => {
    expect(hasUnreadNotifications([{ isRead: true }, { isRead: false }])).toBe(true);
  });
});

describe("applyReadNotification", () => {
  it("replaces the read notification so unread status turns off immediately after the final item is read", () => {
    const next = applyReadNotification(
      [{ id: "notification-1", isRead: false }],
      { id: "notification-1", isRead: true },
    );

    expect(hasUnreadNotifications(next)).toBe(false);
  });
});
