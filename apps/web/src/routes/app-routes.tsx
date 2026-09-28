import { useEffect, useState } from "react";

import { NotificationsPage, ProfilePage, getInitials, getProfileDisplayName } from "@/modules/account";
import { LoginPage, RegisterPage, clearSession, getAuthenticatedUser, getSessionToken, subscribeToSession } from "@/modules/auth";
import { WorkspaceDashboardPage, WorkspacesPage } from "@/modules/workspace";

import "./app-routes.css";

function navigate(path: string): void {
  window.history.pushState(null, "", path);
  window.dispatchEvent(new PopStateEvent("popstate"));
}

function Redirect({ to }: { to: string }) {
  useEffect(() => { window.history.replaceState(null, "", to); window.dispatchEvent(new PopStateEvent("popstate")); }, [to]);
  return null;
}

function AppLayout({ children, onLogout }: { children: React.ReactNode; onLogout: () => void }) {
  const user = getAuthenticatedUser();
  const displayName = getProfileDisplayName(user);
  const initials = getInitials(user?.firstName, user?.lastName, user?.email);

  return <div className="app-shell">
    <nav className="app-navbar" aria-label="Main navigation">
      <a className="app-navbar__brand" href="/workspaces" onClick={(event) => { event.preventDefault(); navigate("/workspaces"); }}>Flowboard</a>
      <div className="app-navbar__actions">
        <a className="app-navbar__icon-button" href="/notifications" aria-label="Notifications" title="Notifications" onClick={(event) => { event.preventDefault(); navigate("/notifications"); }}>
          <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" /><path d="M10 21h4" /></svg>
        </a>
        <details className="app-profile-menu">
          <summary aria-label="Open account menu"><div className="app-profile-menu__trigger"><span className="app-profile-menu__avatar" aria-hidden="true">{initials}</span><span className="app-profile-menu__name">{displayName}</span><svg className="app-profile-menu__chevron" aria-hidden="true" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="m5 7.5 5 5 5-5" /></svg></div></summary>
          <div className="app-profile-menu__dropdown"><a href="/profile" onClick={(event) => { event.preventDefault(); navigate("/profile"); }}>Profile</a><button type="button" onClick={onLogout}>Log out</button></div>
        </details>
      </div>
    </nav>
    {children}
  </div>;
}

export function AppRoutes() {
  const [path, setPath] = useState(() => window.location.pathname);
  const [token, setToken] = useState(() => getSessionToken());

  useEffect(() => {
    const onPopState = () => setPath(window.location.pathname);
    const unsubscribe = subscribeToSession(() => setToken(getSessionToken()));
    window.addEventListener("popstate", onPopState);
    return () => { window.removeEventListener("popstate", onPopState); unsubscribe(); };
  }, []);

  const logout = () => { clearSession(); navigate("/login"); };
  const authenticated = Boolean(token);
  const workspaceMatch = path.match(/^\/workspace\/([^/]+)$/);

  if (!authenticated) {
    if (path !== "/login" && path !== "/register") return <Redirect to="/login" />;
    return path === "/register" ? <RegisterPage /> : <LoginPage />;
  }

  if (path === "/login" || path === "/register" || path === "/") {
    return <Redirect to="/workspaces" />;
  }

  const content = path === "/profile"
    ? <ProfilePage token={token} onUnauthorized={logout} />
    : path === "/notifications"
      ? <NotificationsPage token={token} onUnauthorized={logout} />
      : workspaceMatch
        ? <WorkspaceDashboardPage accessToken={token!} workspaceId={workspaceMatch[1]} onBack={() => navigate("/workspaces")} />
        : <WorkspacesPage accessToken={token!} onOpenWorkspace={(id) => navigate(`/workspace/${id}`)} />;

  return <AppLayout onLogout={logout}>{content}</AppLayout>;
}
