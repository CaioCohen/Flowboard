import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, ParseUUIDPipe, Patch, Post, Req } from '@nestjs/common';
import { Request } from 'express';
import { IAuthenticatedUser } from '../auth/auth.service';
import { AddMemberDto } from './dto/add-member.dto';
import { CreateWorkspaceDto } from './dto/create-workspace.dto';
import { UpdateMemberRoleDto } from './dto/update-member-role.dto';
import { UpdateWorkspaceDto } from './dto/update-workspace.dto';
import { WorkspaceService } from './workspace.service';

type AuthenticatedRequest = Request & { user: IAuthenticatedUser };

@Controller('workspaces')
export class WorkspaceController {
  constructor(private readonly workspaces: WorkspaceService) {}
  @Get() list(@Req() request: AuthenticatedRequest) { return this.workspaces.list(request.user); }
  @Post() create(@Req() request: AuthenticatedRequest, @Body() dto: CreateWorkspaceDto) { return this.workspaces.create(request.user, dto); }
  @Get(':id') get(@Req() request: AuthenticatedRequest, @Param('id', new ParseUUIDPipe()) id: string) { return this.workspaces.get(request.user, id); }
  @Patch(':id') rename(@Req() request: AuthenticatedRequest, @Param('id', new ParseUUIDPipe()) id: string, @Body() dto: UpdateWorkspaceDto) { return this.workspaces.rename(request.user, id, dto); }
  @Post(':id/members') addMember(@Req() request: AuthenticatedRequest, @Param('id', new ParseUUIDPipe()) id: string, @Body() dto: AddMemberDto) { return this.workspaces.addMember(request.user, id, dto); }
  @Patch(':id/members/:userId') changeMemberRole(@Req() request: AuthenticatedRequest, @Param('id', new ParseUUIDPipe()) id: string, @Param('userId', new ParseUUIDPipe()) userId: string, @Body() dto: UpdateMemberRoleDto) { return this.workspaces.changeMemberRole(request.user, id, userId, dto); }
  @Delete(':id/members/:userId') @HttpCode(HttpStatus.NO_CONTENT) async removeMember(@Req() request: AuthenticatedRequest, @Param('id', new ParseUUIDPipe()) id: string, @Param('userId', new ParseUUIDPipe()) userId: string): Promise<void> { await this.workspaces.removeMember(request.user, id, userId); }
  @Post(':id/leave') @HttpCode(HttpStatus.NO_CONTENT) async leave(@Req() request: AuthenticatedRequest, @Param('id', new ParseUUIDPipe()) id: string): Promise<void> { await this.workspaces.leave(request.user, id); }
}
