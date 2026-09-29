import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { TicketRepository } from './ticket.repository';
import { TicketsController } from './tickets.controller';
import { TICKET_REPOSITORY, TicketsService, WORKSPACE_MEMBERSHIP } from './tickets.service';
import { WorkspaceMembershipRepository } from './workspace-membership.repository';

@Module({
  imports: [DatabaseModule],
  controllers: [TicketsController],
  providers: [
    TicketsService,
    TicketRepository,
    WorkspaceMembershipRepository,
    { provide: TICKET_REPOSITORY, useExisting: TicketRepository },
    { provide: WORKSPACE_MEMBERSHIP, useExisting: WorkspaceMembershipRepository },
  ],
})
export class TicketsModule {}
