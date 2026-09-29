import { readFile } from "node:fs/promises";

import { describe, expect, it } from "vitest";

describe("application favicon", () => {
  it("declares and provides a local SVG favicon", async () => {
    const [document, favicon] = await Promise.all([
      readFile(new URL("../../index.html", import.meta.url), "utf8"),
      readFile(new URL("../../public/favicon.svg", import.meta.url), "utf8"),
    ]);

    expect(document).toContain('href="/favicon.svg"');
    expect(favicon).toContain("<svg");
  });
});
