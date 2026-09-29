import { Transform } from 'class-transformer';
import { IsEnum, IsOptional, IsString, IsUUID, MaxLength, MinLength } from 'class-validator';
import { TicketPriority, TicketStatus } from '../tickets.service';

export class CreateTicketDto {
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  @Transform(({ value }) => typeof value === 'string' ? value.trim() : value)
  title!: string;

  @IsOptional()
  @IsString()
  @Transform(({ value }) => typeof value === 'string' ? value.trim() : value)
  description?: string;

  @IsEnum(['BACKLOG', 'TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE'])
  status!: TicketStatus;

  @IsOptional()
  @IsEnum(['LOW', 'MEDIUM', 'HIGH', 'URGENT'])
  priority?: TicketPriority;

  @IsOptional()
  @IsUUID()
  assigneeId?: string;
}
