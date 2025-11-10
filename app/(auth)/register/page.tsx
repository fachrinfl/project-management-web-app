import type { Metadata } from "next";

import { RegisterForm } from "@/features/auth/components/register-form";

export const metadata: Metadata = {
  title: "Create account | Project Management",
};

export default function RegisterPage() {
  return (
    <main className="w-full px-4 py-16 md:px-0">
      <RegisterForm />
    </main>
  );
}

