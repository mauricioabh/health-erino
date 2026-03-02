import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <main className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-b from-slate-900 via-indigo-950/40 to-slate-900">
      <SignUp
        signInUrl="/sign-in"
        forceRedirectUrl="/admin"
        fallbackRedirectUrl="/admin"
      />
    </main>
  );
}
