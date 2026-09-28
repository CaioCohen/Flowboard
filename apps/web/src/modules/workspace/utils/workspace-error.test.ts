import { describe, expect, it } from "vitest";

import { workspaceErrorMessage } from "./workspace-error";

describe("workspaceErrorMessage", () => {
  it("replaces an internal missing-route message when loading workspaces", () => {
    const error = Object.assign(new Error("Cannot GET /workspaces"), { status: 404 });

    expect(workspaceErrorMessage(error, "load your workspaces")).toBe(
      "We couldn't load your workspaces. The page may be unavailable or you may no longer have access.",
    );
  });

  it("uses a friendly fallback for unexpected errors", () => {
    expect(workspaceErrorMessage(new Error("Failed to fetch"), "save the workspace")).toBe(
      "We couldn't save the workspace. Please try again.",
    );
  });
});
