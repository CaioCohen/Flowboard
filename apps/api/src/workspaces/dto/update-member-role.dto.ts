import { IsEnum } from 'class-validator';
import { WorkspaceRole } from '../workspace.repository';

export class UpdateMemberRoleDto {
  @IsEnum(WorkspaceRole)
  role!: WorkspaceRole;
}
