export interface IAuthenticatedUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

export interface IAuthSession {
  token: string;
  user: IAuthenticatedUser;
}

type SessionListener = () => void;

let authenticatedUser: IAuthenticatedUser | null = null;
const listeners = new Set<SessionListener>();

function notify(): void {
  listeners.forEach((listener) => listener());
}

export function saveSession(session: IAuthSession): void {
  sessionStorage.setItem("token", session.token);
  authenticatedUser = session.user;
  notify();
}

export function clearSession(): void {
  sessionStorage.removeItem("token");
  authenticatedUser = null;
  notify();
}

export function getSessionToken(): string | null {
  return sessionStorage.getItem("token");
}

export function getAuthenticatedUser(): IAuthenticatedUser | null {
  return authenticatedUser;
}

export function subscribeToSession(listener: SessionListener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
import { setUnauthorizedHandler } from "@/shared/api-client";


export function initializeAuthentication(): void {
  setUnauthorizedHandler(() => {
    clearSession();
    window.history.pushState(null, "", "/login");
    window.dispatchEvent(new PopStateEvent("popstate"));
  });
}
