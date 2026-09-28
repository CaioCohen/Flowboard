import { afterEach, describe, expect, it, vi } from "vitest";

import { getCurrentUser, getNotifications, markNotificationRead } from "./account-api";

const fetchSpy = vi.fn();

describe("account API", () => {
  afterEach(() => {
    fetchSpy.mockReset();
    vi.unstubAllGlobals();
  });

  it("sends the session token when loading the current identity", async () => {
    fetchSpy.mockResolvedValue(
      new Response(JSON.stringify({ id: "user-1", firstName: "Ada", lastName: "Lovelace", email: "ada@example.com" }), { status: 200 }),
    );
    vi.stubGlobal("fetch", fetchSpy);

    await getCurrentUser("session-token");

    expect(fetchSpy).toHaveBeenCalledWith(
      expect.stringMatching(/\/users\/me$/),
      expect.objectContaining({ headers: { Authorization: "Bearer session-token" } }),
    );
  });

  it("uses the read endpoint only for the selected notification", async () => {
    fetchSpy.mockResolvedValue(new Response(JSON.stringify({ id: "notice-2", isRead: true }), { status: 200 }));
    vi.stubGlobal("fetch", fetchSpy);

    await markNotificationRead("session-token", "notice-2");

    expect(fetchSpy).toHaveBeenCalledWith(
      expect.stringMatching(/\/notifications\/notice-2\/read$/),
      expect.objectContaining({ method: "PATCH" }),
    );
  });

  it("loads the authenticated user's notification collection", async () => {
    fetchSpy.mockResolvedValue(new Response(JSON.stringify([]), { status: 200 }));
    vi.stubGlobal("fetch", fetchSpy);

    await getNotifications("session-token");

    expect(fetchSpy).toHaveBeenCalledWith(
      expect.stringMatching(/\/notifications$/),
      expect.objectContaining({ headers: { Authorization: "Bearer session-token" } }),
    );
  });
});
