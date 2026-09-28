import { useState, type FormEvent } from "react";

import { AuthLayout, navigateTo } from "../../components/auth-layout";
import { AuthRequestError, login } from "../../services/auth-api";
import { saveSession } from "../../services/auth-session";
import { validateLogin, type AuthFieldErrors, type ILoginValues } from "../../utils/auth-validation";

export function LoginPage() {
  const [values, setValues] = useState<ILoginValues>({ email: "", password: "" });
  const [errors, setErrors] = useState<AuthFieldErrors>({});
  const [formError, setFormError] = useState<string>();
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextErrors = validateLogin(values);
    setErrors(nextErrors);
    setFormError(undefined);

    if (Object.keys(nextErrors).length) return;

    setIsSubmitting(true);
    try {
      saveSession(await login(values));
      navigateTo("/workspaces");
    } catch (error) {
      setFormError(error instanceof AuthRequestError ? error.message : "Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  function updateField(field: keyof ILoginValues, value: string) {
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  }

  return <AuthLayout><form className="auth-form" noValidate onSubmit={handleSubmit}>
    <h1 className="auth-title">Log in</h1>
    <p className="auth-intro">Continue to your Flowboard workspaces.</p>
    {formError && <p className="auth-form-error" role="alert">{formError}</p>}
    <label className="auth-field" htmlFor="login-email"><span className="auth-label">Email</span><input autoComplete="email" className="auth-input" id="login-email" type="email" value={values.email} onChange={(event) => updateField("email", event.target.value)} aria-describedby={errors.email ? "login-email-error" : undefined} aria-invalid={Boolean(errors.email)} disabled={isSubmitting} />{errors.email && <span className="auth-error" id="login-email-error">{errors.email}</span>}</label>
    <label className="auth-field" htmlFor="login-password"><span className="auth-label">Password</span><input autoComplete="current-password" className="auth-input" id="login-password" type="password" value={values.password} onChange={(event) => updateField("password", event.target.value)} aria-describedby={errors.password ? "login-password-error" : undefined} aria-invalid={Boolean(errors.password)} disabled={isSubmitting} />{errors.password && <span className="auth-error" id="login-password-error">{errors.password}</span>}</label>
    <button className="auth-submit" disabled={isSubmitting} type="submit">{isSubmitting ? "Logging in…" : "Log in"}</button>
    <p className="auth-footer">Need an account? <a className="auth-link" href="/register">Create one</a></p>
  </form></AuthLayout>;
}
