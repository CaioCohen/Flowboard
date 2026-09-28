import { useEffect, useState } from "react";

import { NotificationsPage, ProfilePage } from "@/modules/account";
import { LoginPage, RegisterPage, clearSession, getAuthenticatedUser, getSessionToken, subscribeToSession } from "@/modules/auth";
import { WorkspaceDashboardPage, WorkspacesPage } from "@/modules/workspace";

import "./app-routes.css";

function navigate(path: string): void {
  window.history.pushState(null, "", path);
  window.dispatchEvent(new PopStateEvent("popstate"));
}

function AppLayout({ children, onLogout }: { children: React.ReactNode; onLogout: () => void }) {
  const user = getAuthenticatedUser();
  const displayName = user ? `${user.firstName} ${user.lastName}` : "Account";

  return <div className="app-shell">
    <nav className="app-navbar" aria-label="Main navigation">
      <a href="/workspaces" onClick={(event) => { event.preventDefault(); navigate("/workspaces"); }}>Flowboard</a>
      <div className="app-navbar__actions">
        <a href="/notifications" onClick={(event) => { event.preventDefault(); navigate("/notifications"); }}>Notifications</a>
        <a href="/profile" onClick={(event) => { event.preventDefault(); navigate("/profile"); }}>{displayName}</a>
        <button type="button" onClick={onLogout}>Log out</button>
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
    if (path !== "/login" && path !== "/register") navigate("/login");
    return path === "/register" ? <RegisterPage /> : <LoginPage />;
  }

  if (path === "/login" || path === "/register" || path === "/") {
    navigate("/workspaces");
    return <WorkspacesPage accessToken={token!} onOpenWorkspace={(id) => navigate(`/workspace/${id}`)} />;
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
