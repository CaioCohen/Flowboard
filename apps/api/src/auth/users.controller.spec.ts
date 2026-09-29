import { UsersController } from './users.controller';

describe('UsersController', () => {
  it('returns the authenticated user for GET /users/me', () => {
    const controller = new UsersController();
    const user = { id: 'u1', firstName: 'Ada', lastName: 'Lovelace', email: 'ada@example.test' };

    expect(controller.me({ user } as never)).toEqual(user);
  });
});
