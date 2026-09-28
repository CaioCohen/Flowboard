export interface ILoginValues {
  email: string;
  password: string;
}

export interface IRegistrationValues extends ILoginValues {
  firstName: string;
  lastName: string;
  passwordConfirmation: string;
}

export type AuthFieldErrors = Partial<Record<keyof IRegistrationValues, string>>;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MINIMUM_PASSWORD_LENGTH = 8;

function validateEmail(email: string): string | undefined {
  if (!email.trim()) {
    return "Email is required.";
  }

  return EMAIL_PATTERN.test(email.trim()) ? undefined : "Enter a valid email address.";
}

export function validateLogin(values: ILoginValues): AuthFieldErrors {
  const errors: AuthFieldErrors = {};
  const emailError = validateEmail(values.email);

  if (emailError) {
    errors.email = emailError;
  }

  if (!values.password) {
    errors.password = "Password is required.";
  }

  return errors;
}

export function validateRegistration(values: IRegistrationValues): AuthFieldErrors {
  const errors = validateLogin(values);

  if (!values.firstName.trim()) {
    errors.firstName = "First name is required.";
  }

  if (!values.lastName.trim()) {
    errors.lastName = "Last name is required.";
  }

  if (values.password.length < MINIMUM_PASSWORD_LENGTH) {
    errors.password = `Password must be at least ${MINIMUM_PASSWORD_LENGTH} characters.`;
  }

  if (values.password && values.passwordConfirmation && values.password !== values.passwordConfirmation) {
    errors.passwordConfirmation = "Passwords do not match.";
  } else if (!values.passwordConfirmation) {
    errors.passwordConfirmation = "Password confirmation is required.";
  }

  return errors;
}
