interface IUserIdentity {
  firstName: string;
  lastName: string;
}

export function getProfileDisplayName(user: IUserIdentity | null): string {
  return user ? `${user.firstName} ${user.lastName}` : "Account";
}
