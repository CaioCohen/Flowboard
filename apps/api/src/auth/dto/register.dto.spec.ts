import { plainToInstance } from 'class-transformer';
import { validateSync } from 'class-validator';
import { RegisterDto } from './register.dto';

describe('RegisterDto', () => {
  it('rejects whitespace-only names after normalizing input', () => {
    const dto = plainToInstance(RegisterDto, {
      firstName: '   ', lastName: 'Lovelace', email: 'ada@example.test', password: 'Password-9!', passwordConfirmation: 'Password-9!',
    });

    expect(validateSync(dto).map((error) => error.property)).toContain('firstName');
  });
});
