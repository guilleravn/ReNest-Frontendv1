import type { Metadata } from "next";
import Link from "next/link";

import { AuthCard } from "@/features/auth/components/auth-card";
import { RegisterForm } from "@/features/auth/components/register-form";
import { isSafeRedirectPath } from "@/lib/auth/redirect-path";

export const metadata: Metadata = { title: "Crea tu cuenta · ReNest" };

export default async function RegisterPage({ searchParams }: PageProps<"/register">) {
  const { next } = await searchParams;
  // Sign-up always lands on the feed; `next` is only handed back to the login link.
  const safeNext = isSafeRedirectPath(next) ? next : undefined;

  return (
    <>
      <AuthCard title="Crea tu cuenta" subtitle="Únete a una comunidad de segunda mano verificada.">
        <RegisterForm />
      </AuthCard>
      <p className="text-muted text-sm">
        ¿Ya tienes cuenta?{" "}
        <Link
          href={safeNext ? `/login?${new URLSearchParams({ next: safeNext })}` : "/login"}
          className="text-primary hover:text-primary-hover focus-visible:outline-ring rounded-sm font-semibold underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2"
        >
          Inicia sesión
        </Link>
      </p>
    </>
  );
}
