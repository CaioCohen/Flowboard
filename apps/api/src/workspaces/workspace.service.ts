import { ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { IAuthenticatedUser } from '../auth/auth.service';
import { DatabaseService } from '../database/database.service';
import { NotificationsService } from '../notifications/notifications.service';
import { AddMemberDto } from './dto/add-member.dto';
import { CreateWorkspaceDto } from './dto/create-workspace.dto';
import { UpdateMemberRoleDto } from './dto/update-member-role.dto';
import { UpdateWorkspaceDto } from './dto/update-workspace.dto';
import { IWorkspace, IWorkspaceMember, WorkspaceRepository, WorkspaceRole } from './workspace.repository';

const LAST_ADMINISTRATOR_MESSAGE = 'A workspace must have at least one administrator.';

@Injectable()
export class WorkspaceService {
  constructor(private readonly workspaces: WorkspaceRepository, private readonly database: DatabaseService, private readonly notifications: NotificationsService) {}

  create(actor: IAuthenticatedUser, dto: CreateWorkspaceDto): Promise<IWorkspace> { return this.workspaces.createWithAdmin(actor.id, dto.name); }
  list(actor: IAuthenticatedUser): Promise<IWorkspace[]> { return this.workspaces.listForUser(actor.id); }

  async get(actor: IAuthenticatedUser, workspaceId: string): Promise<IWorkspace> {
    await this.requireMember(actor.id, workspaceId);
    const workspace = await this.workspaces.findById(workspaceId, true);
    if (!workspace) throw new NotFoundException('Workspace not found.');
    const membership = await this.workspaces.findMembership(workspaceId, actor.id);
    return { ...workspace, role: membership!.role };
  }

  async rename(actor: IAuthenticatedUser, workspaceId: string, dto: UpdateWorkspaceDto): Promise<IWorkspace> {
    await this.requireAdmin(actor.id, workspaceId);
    return this.workspaces.updateName(workspaceId, dto.name);
  }

  async addMember(actor: IAuthenticatedUser, workspaceId: string, dto: AddMemberDto): Promise<IWorkspaceMember> {
    await this.requireAdmin(actor.id, workspaceId);
    const user = await this.workspaces.findUserByEmail(dto.email);
    if (!user) throw new NotFoundException('User not found.');
    if (await this.workspaces.findMember(workspaceId, user.id)) throw new ConflictException('User is already a workspace member.');
    const workspace = await this.workspaceOrThrow(workspaceId);
    try {
      return await this.database.transaction(async (transaction) => {
        const member = await this.workspaces.addMember(workspaceId, user.id, dto.role, transaction);
        await this.notifications.create({ userId: user.id, workspaceId, actorUserId: actor.id, type: 'WORKSPACE_ADDED', title: 'You were added to a workspace', message: `You were added to ${workspace.name}.` }, transaction);
        return member;
      });
    } catch (error: unknown) {
      if (this.isUniqueViolation(error)) throw new ConflictException('User is already a workspace member.');
      throw error;
    }
  }

  async changeMemberRole(actor: IAuthenticatedUser, workspaceId: string, userId: string, dto: UpdateMemberRoleDto): Promise<IWorkspaceMember> {
    await this.requireAdmin(actor.id, workspaceId);
    const member = await this.requireTargetMember(workspaceId, userId);
    if (member.role === dto.role) return this.workspaces.updateMemberRole(workspaceId, userId, dto.role);
    const workspace = await this.workspaceOrThrow(workspaceId);
    return this.database.transaction(async (transaction) => {
      await this.workspaces.lockMembers(workspaceId, transaction);
      const currentMember = await this.requireTargetMember(workspaceId, userId, transaction);
      await this.assertNotRemovingLastAdmin(workspaceId, currentMember.role, dto.role, transaction);
      const updated = await this.workspaces.updateMemberRole(workspaceId, userId, dto.role, transaction);
      await this.notifications.create({ userId, workspaceId, actorUserId: actor.id, type: 'WORKSPACE_ROLE_CHANGED', title: 'Your workspace role changed', message: `Your role in ${workspace.name} was changed to ${dto.role}.` }, transaction);
      return updated;
    });
  }

  async removeMember(actor: IAuthenticatedUser, workspaceId: string, userId: string): Promise<void> {
    await this.requireAdmin(actor.id, workspaceId);
    await this.requireTargetMember(workspaceId, userId);
    await this.removeWithNotification(actor.id, workspaceId, userId);
  }

  async leave(actor: IAuthenticatedUser, workspaceId: string): Promise<void> {
    await this.requireMember(actor.id, workspaceId);
    await this.removeWithNotification(actor.id, workspaceId, actor.id);
  }

  private async requireMember(userId: string, workspaceId: string): Promise<{ userId: string; role: WorkspaceRole }> {
    const member = await this.workspaces.findMembership(workspaceId, userId);
    if (member) return member;
    if (!await this.workspaces.findById(workspaceId)) throw new NotFoundException('Workspace not found.');
    throw new ForbiddenException();
  }

  private async workspaceOrThrow(workspaceId: string): Promise<IWorkspace> {
    const workspace = await this.workspaces.findById(workspaceId);
    if (!workspace) throw new NotFoundException('Workspace not found.');
    return workspace;
  }

  private async removeWithNotification(actorUserId: string, workspaceId: string, userId: string): Promise<void> {
    const workspace = await this.workspaceOrThrow(workspaceId);
    await this.database.transaction(async (transaction) => {
      await this.workspaces.lockMembers(workspaceId, transaction);
      const member = await this.requireTargetMember(workspaceId, userId, transaction);
      await this.assertNotRemovingLastAdmin(workspaceId, member.role, undefined, transaction);
      await this.workspaces.removeMember(workspaceId, userId, transaction);
      await this.notifications.create({ userId, workspaceId, actorUserId, type: 'WORKSPACE_REMOVED', title: 'You were removed from a workspace', message: `You were removed from ${workspace.name}.` }, transaction);
    });
  }

  private async requireAdmin(userId: string, workspaceId: string): Promise<void> {
    const member = await this.requireMember(userId, workspaceId);
    if (member.role !== WorkspaceRole.ADMIN) throw new ForbiddenException();
  }

  private async requireTargetMember(workspaceId: string, userId: string, executor?: Parameters<WorkspaceRepository['findMember']>[2]): Promise<{ userId: string; role: WorkspaceRole }> {
    const member = await this.workspaces.findMember(workspaceId, userId, executor);
    if (!member) throw new NotFoundException('Workspace member not found.');
    return member;
  }

  private async assertNotRemovingLastAdmin(workspaceId: string, currentRole: WorkspaceRole, nextRole?: WorkspaceRole, executor?: Parameters<WorkspaceRepository['countAdmins']>[1]): Promise<void> {
    if (currentRole === WorkspaceRole.ADMIN && nextRole !== WorkspaceRole.ADMIN && await this.workspaces.countAdmins(workspaceId, executor) === 1) {
      throw new ConflictException(LAST_ADMINISTRATOR_MESSAGE);
    }
  }

  private isUniqueViolation(error: unknown): boolean {
    return typeof error === 'object' && error !== null && 'code' in error && error.code === '23505';
  }
}
