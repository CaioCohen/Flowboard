import { describe, expect, it } from "vitest";

import { formatWorkspaceLabel } from "./workspace-presentation";

describe("formatWorkspaceLabel", () => {
  it("turns an enum value into a readable ticket label", () => {
    expect(formatWorkspaceLabel("IN_PROGRESS")).toBe("In progress");
  });

  it("uses a supplied empty-state label when the value is unavailable", () => {
    expect(formatWorkspaceLabel(undefined, "Not set")).toBe("Not set");
  });
});
