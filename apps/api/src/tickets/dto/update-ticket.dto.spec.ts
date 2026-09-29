import { plainToInstance } from 'class-transformer';
import { validateSync } from 'class-validator';
import { UpdateTicketDto } from './update-ticket.dto';

describe('UpdateTicketDto', () => {
  it('allows a validated subset of editable fields without requiring title or status', () => {
    const dto = plainToInstance(UpdateTicketDto, { priority: 'URGENT' });

    expect(validateSync(dto)).toHaveLength(0);
  });

  it('rejects invalid status values', () => {
    const dto = plainToInstance(UpdateTicketDto, { status: 'LATER' });

    expect(validateSync(dto).map((error) => error.property)).toContain('status');
  });
});
