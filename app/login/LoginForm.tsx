"use client";

type LoginFormProps = {
  error?: string;
};

export default function LoginForm({ error }: LoginFormProps) {

  return (
    <form action="/auth/sign-in" method="post" className="card" style={{ maxWidth: 420 }}>
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
      {error ? <p className="notice">{error}</p> : null}
      <button className="button" type="submit">
        Sign in
      </button>
    </form>
  );
}
