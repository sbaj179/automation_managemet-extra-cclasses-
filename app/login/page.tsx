import LoginForm from "@/app/login/LoginForm";

type LoginPageProps = {
  searchParams: Promise<{ error?: string }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const error = params.error ? decodeURIComponent(params.error) : "";

  return (
    <main style={{ minHeight: "100vh", display: "grid", placeItems: "center" }}>
      <LoginForm error={error} />
    </main>
  );
}
