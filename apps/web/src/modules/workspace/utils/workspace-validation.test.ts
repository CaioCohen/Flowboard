import { describe, expect, it } from "vitest";

import {
  isTicketPriority,
  isTicketStatus,
  workspaceNameError,
} from "./workspace-validation";

describe("workspaceNameError", () => {
  it("requires a non-blank workspace name", () => {
    expect(workspaceNameError("   ")).toBe("Workspace name is required.");
  });

  it("accepts a trimmed workspace name", () => {
    expect(workspaceNameError(" Product ")).toBeUndefined();
  });
});

describe("ticket enum guards", () => {
  it("accepts only the defined ticket statuses", () => {
    expect(isTicketStatus("IN_REVIEW")).toBe(true);
    expect(isTicketStatus("CUSTOM")).toBe(false);
  });

  it("accepts only the defined ticket priorities", () => {
    expect(isTicketPriority("URGENT")).toBe(true);
    expect(isTicketPriority("CRITICAL")).toBe(false);
  });
});
