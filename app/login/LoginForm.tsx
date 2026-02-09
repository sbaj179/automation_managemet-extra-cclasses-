"use client";

import { useFormState } from "react-dom";
import { signIn } from "@/app/login/actions";

const initialState = { error: "" };

export default function LoginForm() {
  const [state, formAction] = useFormState(signIn, initialState);

  return (
    <form action={formAction} className="card" style={{ maxWidth: 420 }}>
      <h1 style={{ marginTop: 0 }}>Admin & Tutor Login</h1>
      <div className="form-row">
        <label className="label" htmlFor="email">
          Email
        </label>
        <input className="input" id="email" name="email" type="email" required />
      </div>
      <div className="form-row">
        <label className="label" htmlFor="password">
          Password
        </label>
        <input
          className="input"
          id="password"
          name="password"
          type="password"
          required
        />
      </div>
      {state.error ? <p className="notice">{state.error}</p> : null}
      <button className="button" type="submit">
        Sign in
      </button>
    </form>
  );
}
