import { useEffect, useState } from "react";

import { AccountApiError, getCurrentUser, type ICurrentUser } from "../../services/account-api";
import { getInitials } from "../../utils/account-presentation";

import "./profile-page.css";

interface IProfilePageProps {
  token?: string | null;
  onUnauthorized?: () => void;
}

function readSessionToken(): string | null {
  return typeof window === "undefined" ? null : window.sessionStorage.getItem("token");
}

export function ProfilePage({ token = readSessionToken(), onUnauthorized }: IProfilePageProps) {
  const [user, setUser] = useState<ICurrentUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    let isCurrent = true;

    if (!token) {
      onUnauthorized?.();
      return () => {
        isCurrent = false;
      };
    }

    setIsLoading(true);
    setHasError(false);
    getCurrentUser(token)
      .then((nextUser) => {
        if (isCurrent) setUser(nextUser);
      })
      .catch((error: unknown) => {
        if (!isCurrent) return;
        if (error instanceof AccountApiError && error.status === 401) onUnauthorized?.();
        else setHasError(true);
      })
      .finally(() => {
        if (isCurrent) setIsLoading(false);
      });

    return () => {
      isCurrent = false;
    };
  }, [onUnauthorized, retryKey, token]);

  if (isLoading) {
    return <main className="profile-page" aria-busy="true"><p>Loading profile…</p></main>;
  }

  if (hasError) {
    return (
      <main className="profile-page" role="alert">
        <h1>Profile</h1>
        <p>We could not load your profile. Please try again.</p>
        <button type="button" onClick={() => setRetryKey((value) => value + 1)}>Retry</button>
      </main>
    );
  }

  if (!user) {
    return <main className="profile-page"><h1>Profile unavailable</h1><p>Your identity information is not available right now.</p></main>;
  }

  return (
    <main className="profile-page">
      <h1>Profile</h1>
      <section className="profile-card" aria-label="Your identity">
        <div className="profile-avatar" aria-label={`Avatar initials ${getInitials(user.firstName, user.lastName, user.email)}`}>
          {getInitials(user.firstName, user.lastName, user.email)}
        </div>
        <dl className="profile-details">
          <div><dt>First name</dt><dd>{user.firstName}</dd></div>
          <div><dt>Last name</dt><dd>{user.lastName}</dd></div>
          <div><dt>Email</dt><dd>{user.email}</dd></div>
        </dl>
      </section>
    </main>
  );
}
