import { apiBaseUrl } from "@/shared/api-client";

import type { IAuthSession } from "./auth-session";
import type { ILoginValues, IRegistrationValues } from "../utils/auth-validation";

export class AuthRequestError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
  }
}

async function requestSession(path: string, body: ILoginValues | IRegistrationValues): Promise<IAuthSession> {
  let response: Response;

  try {
    response = await fetch(`${apiBaseUrl}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  } catch {
    throw new AuthRequestError(0, "We could not reach the server. Please try again.");
  }

  if (!response.ok) {
    if (response.status === 401) {
      throw new AuthRequestError(401, "Email or password is incorrect.");
    }

    if (response.status === 409) {
      throw new AuthRequestError(409, "Email is already in use.");
    }

    throw new AuthRequestError(response.status, "Something went wrong. Please try again.");
  }

  const payload: unknown = await response.json();
  if (!isAuthSession(payload)) {
    throw new AuthRequestError(0, "Something went wrong. Please try again.");
  }

  return payload;
}

function isAuthSession(value: unknown): value is IAuthSession {
  if (!value || typeof value !== "object") {
    return false;
  }

  const session = value as { token?: unknown; user?: Partial<IAuthSession["user"]> };
  const user = session.user;
  if (!user || typeof session.token !== "string") {
    return false;
  }

  return typeof user.id === "string" && typeof user.firstName === "string" &&
    typeof user.lastName === "string" && typeof user.email === "string";
}

export function login(values: ILoginValues): Promise<IAuthSession> {
  return requestSession("/auth/login", values);
}

export function register(values: IRegistrationValues): Promise<IAuthSession> {
  return requestSession("/auth/register", values);
}
