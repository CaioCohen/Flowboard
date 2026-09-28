import { afterEach, describe, expect, it, vi } from "vitest";

import { authorizedFetch, setUnauthorizedHandler } from "./authorized-fetch";

afterEach(() => {
  setUnauthorizedHandler(undefined);
  vi.unstubAllGlobals();
});

describe("authorizedFetch", () => {
  it("cleans up an expired session after any protected request returns 401", async () => {
    const onUnauthorized = vi.fn();
    setUnauthorizedHandler(onUnauthorized);
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(null, { status: 401 })));

    await authorizedFetch("https://api.example.test/workspaces", "jwt-value");

    expect(onUnauthorized).toHaveBeenCalledOnce();
  });
});
