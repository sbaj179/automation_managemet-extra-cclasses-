import SignupForm from "./signupForm";

export default function SignupPage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        padding: 24,
        background:
          "radial-gradient(900px 600px at 50% -10%, rgba(125,211,252,0.14), transparent 55%), radial-gradient(800px 520px at 10% 90%, rgba(167,139,250,0.12), transparent 60%), radial-gradient(900px 520px at 90% 85%, rgba(52,211,153,0.10), transparent 60%), linear-gradient(180deg, #04050a 0%, #070a12 55%, #050615 100%)",
        color: "#fff",
      }}
    >
      <SignupForm />
    </main>
  );
}
