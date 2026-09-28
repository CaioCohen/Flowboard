import { describe, expect, it } from "vitest";

import { validateLogin, validateRegistration } from "./auth-validation";

describe("validateLogin", () => {
  it("blocks missing credentials and malformed email before a login request", () => {
    expect(validateLogin({ email: "not-an-email", password: "" })).toEqual({
      email: "Enter a valid email address.",
      password: "Password is required.",
    });
  });
});

describe("validateRegistration", () => {
  it("reports required identity fields, an invalid email, and a mismatched password confirmation", () => {
    expect(
      validateRegistration({
        firstName: "",
        lastName: "",
        email: "invalid",
        password: "secret88",
        passwordConfirmation: "different8",
      }),
    ).toEqual({
      firstName: "First name is required.",
      lastName: "Last name is required.",
      email: "Enter a valid email address.",
      passwordConfirmation: "Passwords do not match.",
    });
  });

  it("explains the defined eight-character password requirement before registration is sent", () => {
    expect(
      validateRegistration({
        firstName: "Caio",
        lastName: "Test",
        email: "caio@example.test",
        password: "123123",
        passwordConfirmation: "123123",
      }),
    ).toEqual({ password: "Password must be at least 8 characters." });
  });
});
