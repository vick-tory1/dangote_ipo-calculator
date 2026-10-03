"use client";

import { FormEvent, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function LoginForm({ callbackUrl }: { callbackUrl: string }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setPending(true);
    const form = new FormData(event.currentTarget);
    try {
      const result = await signIn("credentials", {
        email: String(form.get("email") ?? ""),
        password: String(form.get("password") ?? ""),
        redirect: false,
        callbackUrl,
      });
      if (!result || result.error) {
        setError("Those sign-in details were not accepted. Check them or contact the site owner about account access.");
      } else {
        router.replace(callbackUrl);
        router.refresh();
      }
    } catch {
      setError("Sign-in is unavailable right now. Try again shortly.");
    } finally {
      setPending(false);
    }
  }

  return <form className="auth-form" onSubmit={submit} autoComplete="off">
    <label>Email address<input name="email" type="email" autoComplete="username" required maxLength={254} /></label>
    <label>Password<div className="password-input"><input name="password" type={showPassword ? "text" : "password"} autoComplete="off" required /><button type="button" className="password-toggle" onClick={() => setShowPassword(value => !value)} aria-label={showPassword ? "Hide password" : "Show password"} aria-pressed={showPassword} title={showPassword ? "Hide password" : "Show password"}><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12Z" /><circle cx="12" cy="12" r="3" />{showPassword && <path d="m4 4 16 16" />}</svg></button></div></label>
    {error && <p className="message" role="alert">{error}</p>}
    <button className="primary" type="submit" disabled={pending}>{pending ? "Signing in…" : "Sign in to support"}</button>
  </form>;
}