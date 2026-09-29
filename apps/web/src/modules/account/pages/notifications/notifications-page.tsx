import { useEffect, useState } from "react";

import { AccountApiError, getNotifications, markNotificationRead, type INotification } from "../../services/account-api";
import { applyReadNotification, formatNotificationDate, hasUnreadNotifications } from "../../utils/account-presentation";

import "./notifications-page.css";

interface INotificationsPageProps {
  token?: string | null;
  onUnauthorized?: () => void;
  onNotificationRead?: (notification: INotification) => void;
  onUnreadStatusChange?: (hasUnread: boolean) => void;
}

function readSessionToken(): string | null {
  return typeof window === "undefined" ? null : window.sessionStorage.getItem("token");
}

export function NotificationsPage({ token = readSessionToken(), onUnauthorized, onNotificationRead, onUnreadStatusChange }: INotificationsPageProps) {
  const [notifications, setNotifications] = useState<INotification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [mutationErrorId, setMutationErrorId] = useState<string | null>(null);
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    let isCurrent = true;
    if (!token) {
      onUnauthorized?.();
      return () => { isCurrent = false; };
    }
    setIsLoading(true);
    setHasError(false);
    getNotifications(token)
      .then((items) => { if (isCurrent) { setNotifications(items); onUnreadStatusChange?.(hasUnreadNotifications(items)); } })
      .catch((error: unknown) => {
        if (!isCurrent) return;
        if (error instanceof AccountApiError && error.status === 401) onUnauthorized?.();
        else setHasError(true);
      })
      .finally(() => { if (isCurrent) setIsLoading(false); });
    return () => { isCurrent = false; };
  }, [onUnauthorized, retryKey, token]);

  async function handleMarkRead(notification: INotification) {
    if (!token || notification.isRead || pendingId) return;
    setPendingId(notification.id);
    setMutationErrorId(null);
    try {
      const updated = await markNotificationRead(token, notification.id);
      const nextNotifications = applyReadNotification(notifications, { id: updated.id, isRead: true });
      setNotifications(nextNotifications);
      onUnreadStatusChange?.(hasUnreadNotifications(nextNotifications));
      onNotificationRead?.({ ...notification, ...updated, isRead: true });
    } catch (error: unknown) {
      if (error instanceof AccountApiError && error.status === 401) onUnauthorized?.();
      else setMutationErrorId(notification.id);
    } finally {
      setPendingId(null);
    }
  }

  if (isLoading) return <main className="notifications-page" aria-busy="true"><p>Loading notifications…</p></main>;
  if (hasError) return <main className="notifications-page" role="alert"><h1>Notifications</h1><p>We could not load notifications. Please try again.</p><button type="button" onClick={() => setRetryKey((value) => value + 1)}>Retry</button></main>;

  return (
    <main className="notifications-page">
      <h1>Notifications</h1>
      {notifications.length === 0 ? <p>You have no notifications.</p> : (
        <ul className="notification-list" aria-label="Your notifications">
          {notifications.map((notification) => (
            <li className={`notification-item${notification.isRead ? "" : " notification-item--unread"}`} key={notification.id}>
              <div className="notification-content">
                <p className="notification-status">{notification.isRead ? "Read" : "Unread"}</p>
                <h2>{notification.title}</h2>
                <p>{notification.message}</p>
                <p className="notification-meta">{formatNotificationDate(notification.createdAt)}{notification.workspaceName ? ` · ${notification.workspaceName}` : ""}</p>
                {mutationErrorId === notification.id && <p className="notification-error" role="alert">Could not mark this notification as read. Please try again.</p>}
              </div>
              {!notification.isRead && <button type="button" disabled={pendingId === notification.id} onClick={() => void handleMarkRead(notification)}>{pendingId === notification.id ? "Marking read…" : "Mark as read"}</button>}
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
