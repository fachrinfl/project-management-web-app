import type { Metadata } from "next";

import { LoginForm } from "@/features/auth/components/login-form";

export const metadata: Metadata = {
  title: "Sign in | Project Management",
};

export default function LoginPage() {
  return (
    <main className="w-full px-4 py-16 md:px-0">
      <LoginForm />
    </main>
  );
}

