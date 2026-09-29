import { Body, Controller, Get, Param, ParseUUIDPipe, Patch, Post, Req } from '@nestjs/common';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateTicketDto } from './dto/update-ticket.dto';
import { TicketsService } from './tickets.service';

interface AuthenticatedRequest {
  user: { id: string };
}

@Controller()
export class TicketsController {
  constructor(private readonly tickets: TicketsService) {}

  @Get('workspaces/:id/tickets')
  findAll(@Param('id', new ParseUUIDPipe()) workspaceId: string, @Req() request: AuthenticatedRequest) {
    return this.tickets.findAll(workspaceId, request.user.id);
  }

  @Post('workspaces/:id/tickets')
  create(@Param('id', new ParseUUIDPipe()) workspaceId: string, @Req() request: AuthenticatedRequest, @Body() dto: CreateTicketDto) {
    return this.tickets.create(workspaceId, request.user.id, dto);
  }

  @Get('tickets/:id')
  findOne(@Param('id', new ParseUUIDPipe()) ticketId: string, @Req() request: AuthenticatedRequest) {
    return this.tickets.findOne(ticketId, request.user.id);
  }

  @Patch('tickets/:id')
  update(@Param('id', new ParseUUIDPipe()) ticketId: string, @Req() request: AuthenticatedRequest, @Body() dto: UpdateTicketDto) {
    return this.tickets.update(ticketId, request.user.id, dto);
  }
}
