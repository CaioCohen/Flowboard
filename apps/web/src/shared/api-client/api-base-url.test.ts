import { describe, expect, it } from "vitest";

import { resolveApiBaseUrl } from "./api-base-url";

describe("resolveApiBaseUrl", () => {
  it("uses the configured Vite API URL without a trailing slash", () => {
    expect(resolveApiBaseUrl("http://localhost:3000/")).toBe("http://localhost:3000");
  });

  it("uses the local backend URL when no Vite API URL is configured", () => {
    expect(resolveApiBaseUrl(undefined)).toBe("http://localhost:3000");
  });
});
