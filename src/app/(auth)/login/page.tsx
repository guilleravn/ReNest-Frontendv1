import type { Metadata } from "next";
import Link from "next/link";

import { AuthCard } from "@/features/auth/components/auth-card";
import { LoginForm } from "@/features/auth/components/login-form";
import { isSafeRedirectPath } from "@/lib/auth/redirect-path";

export const metadata: Metadata = { title: "Inicia sesión · ReNest" };

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const { next } = await searchParams;
  // Only carried along when it's a safe internal path; the action re-validates it anyway.
  const safeNext = isSafeRedirectPath(next) ? next : undefined;

  return (
    <>
      <AuthCard title="Inicia sesión" subtitle="Bienvenido de vuelta a ReNest.">
        <LoginForm next={safeNext} />
      </AuthCard>
      <p className="text-muted text-sm">
        ¿No tienes cuenta?{" "}
        <Link
          href={safeNext ? `/register?${new URLSearchParams({ next: safeNext })}` : "/register"}
          className="text-primary hover:text-primary-hover focus-visible:outline-ring rounded-sm font-semibold underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2"
        >
          Regístrate
        </Link>
      </p>
    </>
  );
}
