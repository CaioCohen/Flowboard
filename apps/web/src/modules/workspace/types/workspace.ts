import type { TicketPriority, TicketStatus } from "../utils/workspace-validation";

export type WorkspaceRole = "ADMIN" | "EMPLOYEE";

export interface IUserSummary { id: string; name?: string; email?: string }
export interface IWorkspaceMember extends IUserSummary { role: WorkspaceRole; userId?: string }
export interface IWorkspace { id: string; name: string; role?: WorkspaceRole; members?: IWorkspaceMember[] }
export interface ITicket {
  id: string; workspaceId: string; title: string; description?: string; status: TicketStatus;
  priority?: TicketPriority; assigneeId?: string; createdById: string; createdAt: string; updatedAt: string;
  assignee?: IUserSummary; createdBy?: IUserSummary;
}
export interface ITicketDraft { title: string; status: TicketStatus; description?: string; priority?: TicketPriority; assigneeId?: string }
