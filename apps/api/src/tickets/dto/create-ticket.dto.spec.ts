import { plainToInstance } from 'class-transformer';
import { validateSync } from 'class-validator';
import { CreateTicketDto } from './create-ticket.dto';

describe('CreateTicketDto', () => {
  it('requires title and a permitted status while rejecting forged creator fields', () => {
    const dto = plainToInstance(CreateTicketDto, {
      title: '   ', status: 'INVALID', createdById: '11111111-1111-4111-8111-111111111111',
    });

    expect(validateSync(dto, { whitelist: true, forbidNonWhitelisted: true }).map((error) => error.property)).toEqual(expect.arrayContaining(['title', 'status', 'createdById']));
  });

  it('accepts valid optional priority and assignee UUID', () => {
    const dto = plainToInstance(CreateTicketDto, {
      title: 'Implement reports', status: 'TODO', priority: 'HIGH', assigneeId: '11111111-1111-4111-8111-111111111111',
    });

    expect(validateSync(dto)).toHaveLength(0);
  });
});
