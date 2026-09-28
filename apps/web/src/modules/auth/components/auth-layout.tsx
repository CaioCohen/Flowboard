import { useEffect } from "react";

import { getSessionToken } from "../services/auth-session";

import "./auth-layout.css";

interface IAuthLayoutProps {
  children: React.ReactNode;
}

export function AuthLayout({ children }: IAuthLayoutProps) {
  useEffect(() => {
    if (getSessionToken()) {
      navigateTo("/workspaces");
    }
  }, []);

  return (
    <main className="auth-layout" aria-label="Flowboard authentication">
      <section className="auth-card">
        <a className="auth-brand" href="/" aria-label="Flowboard home">Flowboard</a>
        {children}
      </section>
    </main>
  );
}

export function navigateTo(path: string): void {
  window.history.pushState(null, "", path);
  window.dispatchEvent(new PopStateEvent("popstate"));
}
