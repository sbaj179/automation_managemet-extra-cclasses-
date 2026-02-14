"use client";

import { useActionState, useState } from "react";
import { signUp, type SignupState } from "./actions";
import styles from "./signupForm.module.css";

const initialState: SignupState = { error: "" };

export default function SignupForm() {
  const [state, formAction, isPending] = useActionState<SignupState, FormData>(
    signUp,
    initialState
  );

  const [showPassword, setShowPassword] = useState(false);
  const error = state?.error?.trim();

  return (
    <div className={styles.shell}>
      <div className={styles.glow} aria-hidden="true" />
      <form action={formAction} className={styles.card}>
        <div className={styles.header}>
          <div className={styles.badge}>
            <span className={styles.dot} />
            Create Admin Account
          </div>

          <h1 className={styles.title}>Start your school workspace</h1>
          <p className={styles.subtitle}>
            Create your admin login first. Next, you’ll create the school.
          </p>
        </div>

        {error ? <div className={styles.error}>{error}</div> : null}

        <div className={styles.field}>
          <label className={styles.label} htmlFor="full_name">
            Full name
          </label>
          <input
            className={styles.input}
            id="full_name"
            name="full_name"
            type="text"
            placeholder="Sibabalwe Mgangxela"
            required
          />
        </div>

        <div className={styles.field}>
          <label className={styles.label} htmlFor="email">
            Email
          </label>
          <input
            className={styles.input}
            id="email"
            name="email"
            type="email"
            placeholder="you@school.co.za"
            autoComplete="email"
            required
          />
        </div>

        <div className={styles.field}>
          <label className={styles.label} htmlFor="password">
            Password
          </label>

          <div className={styles.passwordWrap}>
            <input
              className={styles.input}
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              autoComplete="new-password"
              required
              minLength={8}
            />
            <button
              type="button"
              className={styles.toggle}
              onClick={() => setShowPassword((v) => !v)}
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>

          <p className={styles.hint}>Minimum 8 characters.</p>
        </div>

        <button className={styles.button} type="submit" disabled={isPending}>
          {isPending ? (
            <>
              <span className={styles.spinner} aria-hidden="true" />
              Creating…
            </>
          ) : (
            "Create account"
          )}
        </button>

        <div className={styles.footer}>
          <span>Already have an account?</span>
          <a className={styles.link} href="/login">
            Sign in
          </a>
        </div>
      </form>
    </div>
  );
}
