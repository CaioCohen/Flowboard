import { apiBaseUrl, authorizedFetch } from "@/shared/api-client";

import type { ITicket, ITicketDraft, IWorkspace, IWorkspaceMember, WorkspaceRole } from "../types/workspace";

export class ApiError extends Error {
  constructor(public readonly status: number, message: string) { super(message); }
}

async function request<T>(path: string, token: string, options?: RequestInit): Promise<T> {
  const response = await authorizedFetch(`${apiBaseUrl}${path}`, token, {
    ...options,
    headers: { "Content-Type": "application/json", ...options?.headers },
  });
  if (!response.ok) {
    const body: unknown = await response.json().catch(() => undefined);
    const message = typeof body === "object" && body !== null && "message" in body && typeof body.message === "string"
      ? body.message : "The request could not be completed.";
    throw new ApiError(response.status, message);
  }
  return response.status === 204 ? undefined as T : response.json() as Promise<T>;
}

export const workspaceApi = {
  list: (token: string) => request<IWorkspace[]>("/workspaces", token),
  get: (token: string, id: string) => request<IWorkspace>(`/workspaces/${id}`, token),
  create: (token: string, name: string) => request<IWorkspace>("/workspaces", token, { method: "POST", body: JSON.stringify({ name }) }),
  rename: (token: string, id: string, name: string) => request<IWorkspace>(`/workspaces/${id}`, token, { method: "PATCH", body: JSON.stringify({ name }) }),
  addMember: (token: string, id: string, email: string, role: WorkspaceRole) => request<IWorkspaceMember>(`/workspaces/${id}/members`, token, { method: "POST", body: JSON.stringify({ email, role }) }),
  changeMemberRole: (token: string, id: string, userId: string, role: WorkspaceRole) => request<IWorkspaceMember>(`/workspaces/${id}/members/${userId}`, token, { method: "PATCH", body: JSON.stringify({ role }) }),
  removeMember: (token: string, id: string, userId: string) => request<void>(`/workspaces/${id}/members/${userId}`, token, { method: "DELETE" }),
  leave: (token: string, id: string) => request<void>(`/workspaces/${id}/leave`, token, { method: "POST" }),
  tickets: (token: string, id: string) => request<ITicket[]>(`/workspaces/${id}/tickets`, token),
  createTicket: (token: string, id: string, draft: ITicketDraft) => request<ITicket>(`/workspaces/${id}/tickets`, token, { method: "POST", body: JSON.stringify(draft) }),
  updateTicket: (token: string, id: string, draft: Partial<ITicketDraft>) => request<ITicket>(`/tickets/${id}`, token, { method: "PATCH", body: JSON.stringify(draft) }),
  deleteTicket: (token: string, id: string) => request<void>(`/tickets/${id}`, token, { method: "DELETE" }),
};
