import { afterEach, describe, expect, it } from "vitest";

import { clearSession, getAuthenticatedUser, saveSession } from "./auth-session";

const storage = new Map<string, string>();

Object.defineProperty(globalThis, "sessionStorage", {
  configurable: true,
  value: {
    clear: () => storage.clear(),
    getItem: (key: string) => storage.get(key) ?? null,
    removeItem: (key: string) => storage.delete(key),
    setItem: (key: string, value: string) => storage.set(key, value),
  },
});

afterEach(() => {
  sessionStorage.clear();
  clearSession();
});

describe("saveSession", () => {
  it("stores only the JWT in session storage and keeps the authenticated identity in memory", () => {
    saveSession({
      token: "signed.jwt.value",
      user: { id: "user-1", firstName: "Ada", lastName: "Lovelace", email: "ada@example.com" },
    });

    expect(sessionStorage.getItem("token")).toBe("signed.jwt.value");
    expect(getAuthenticatedUser()).toEqual({
      id: "user-1",
      firstName: "Ada",
      lastName: "Lovelace",
      email: "ada@example.com",
    });
    expect(sessionStorage.getItem("user")).toBeNull();
  });
});
