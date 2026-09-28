import { useState, type FormEvent } from "react";

import { AuthLayout, navigateTo } from "../../components/auth-layout";
import { AuthRequestError, register } from "../../services/auth-api";
import { saveSession } from "../../services/auth-session";
import { validateRegistration, type AuthFieldErrors, type IRegistrationValues } from "../../utils/auth-validation";

export function RegisterPage() {
  const [values, setValues] = useState<IRegistrationValues>({ firstName: "", lastName: "", email: "", password: "", passwordConfirmation: "" });
  const [errors, setErrors] = useState<AuthFieldErrors>({});
  const [formError, setFormError] = useState<string>();
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextErrors = validateRegistration(values);
    setErrors(nextErrors);
    setFormError(undefined);
    if (Object.keys(nextErrors).length) return;

    setIsSubmitting(true);
    try {
      saveSession(await register(values));
      navigateTo("/workspaces");
    } catch (error) {
      const message = error instanceof AuthRequestError ? error.message : "Something went wrong. Please try again.";
      if (error instanceof AuthRequestError && error.status === 409) {
        setErrors((current) => ({ ...current, email: message }));
        setValues((current) => ({ ...current, password: "", passwordConfirmation: "" }));
      } else {
        setFormError(message);
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  function updateField(field: keyof IRegistrationValues, value: string) {
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  }

  return <AuthLayout><form className="auth-form" noValidate onSubmit={handleSubmit}>
    <h1 className="auth-title">Create account</h1>
    <p className="auth-intro">Get started with Flowboard. Passwords must contain at least 8 characters.</p>
    {formError && <p className="auth-form-error" role="alert">{formError}</p>}
    <AuthInput field="firstName" label="First name" values={values} errors={errors} isSubmitting={isSubmitting} updateField={updateField} />
    <AuthInput field="lastName" label="Last name" values={values} errors={errors} isSubmitting={isSubmitting} updateField={updateField} />
    <AuthInput field="email" label="Email" type="email" autoComplete="email" values={values} errors={errors} isSubmitting={isSubmitting} updateField={updateField} />
    <AuthInput field="password" label="Password" type="password" autoComplete="new-password" values={values} errors={errors} isSubmitting={isSubmitting} updateField={updateField} />
    <AuthInput field="passwordConfirmation" label="Confirm password" type="password" autoComplete="new-password" values={values} errors={errors} isSubmitting={isSubmitting} updateField={updateField} />
    <button className="auth-submit" disabled={isSubmitting} type="submit">{isSubmitting ? "Creating account…" : "Create account"}</button>
    <p className="auth-footer">Already have an account? <a className="auth-link" href="/login">Log in</a></p>
  </form></AuthLayout>;
}

interface IAuthInputProps {
  autoComplete?: string;
  errors: AuthFieldErrors;
  field: keyof IRegistrationValues;
  isSubmitting: boolean;
  label: string;
  type?: "email" | "password" | "text";
  updateField: (field: keyof IRegistrationValues, value: string) => void;
  values: IRegistrationValues;
}

function AuthInput({ autoComplete, errors, field, isSubmitting, label, type = "text", updateField, values }: IAuthInputProps) {
  const id = `register-${field}`;
  const errorId = `${id}-error`;
  return <label className="auth-field" htmlFor={id}><span className="auth-label">{label}</span><input autoComplete={autoComplete} className="auth-input" id={id} type={type} value={values[field]} onChange={(event) => updateField(field, event.target.value)} aria-describedby={errors[field] ? errorId : undefined} aria-invalid={Boolean(errors[field])} disabled={isSubmitting} />{errors[field] && <span className="auth-error" id={errorId}>{errors[field]}</span>}</label>;
}
