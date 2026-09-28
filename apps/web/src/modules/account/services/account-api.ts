import { apiBaseUrl, authorizedFetch } from "@/shared/api-client";

export interface ICurrentUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

export interface INotification {
  id: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  workspaceId?: string | null;
  workspaceName?: string | null;
}

export class AccountApiError extends Error {
  public constructor(public readonly status: number) {
    super("Unable to complete this request. Please try again.");
    this.name = "AccountApiError";
  }
}

async function request<T>(path: string, token: string, options?: RequestInit): Promise<T> {
  const response = await authorizedFetch(`${apiBaseUrl}${path}`, token, options);

  if (!response.ok) {
    throw new AccountApiError(response.status);
  }

  return response.json() as Promise<T>;
}

export function getCurrentUser(token: string): Promise<ICurrentUser> {
  return request<ICurrentUser>("/users/me", token);
}

export function getNotifications(token: string): Promise<INotification[]> {
  return request<INotification[]>("/notifications", token);
}

export function markNotificationRead(token: string, notificationId: string): Promise<INotification> {
  return request<INotification>(`/notifications/${encodeURIComponent(notificationId)}/read`, token, {
    method: "PATCH",
  });
}
