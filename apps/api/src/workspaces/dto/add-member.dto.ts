import { Transform } from 'class-transformer';
import { IsEmail, IsEnum, MaxLength } from 'class-validator';
import { WorkspaceRole } from '../workspace.repository';

export class AddMemberDto {
  @Transform(({ value }) => typeof value === 'string' ? value.trim().toLowerCase() : value)
  @IsEmail()
  @MaxLength(320)
  email!: string;

  @IsEnum(WorkspaceRole)
  role!: WorkspaceRole;
}
