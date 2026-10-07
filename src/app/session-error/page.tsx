import type { Metadata } from "next";
import Link from "next/link";

import { DEFAULT_SIGNED_IN_PATH } from "@/lib/auth/constants";

export const metadata: Metadata = { title: "Algo salió mal" };

/**
 * Exit of the expired-session loop guard (`/api/auth/expired`): the session is valid but the
 * page the user came from keeps answering 401. Same copy as the root error boundary.
 */
export default function SessionErrorPage() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center px-6 py-12 max-sm:px-4 max-sm:py-8">
      <div
        role="alert"
        className="border-border bg-surface shadow-card flex w-full max-w-md flex-col items-center gap-3 rounded-xl border p-8 text-center max-sm:p-5"
      >
        <h1 className="font-heading text-3xl max-sm:text-2xl">Algo salió mal</h1>
        <p className="text-muted text-sm">
          No pudimos cargar esta página. Intenta de nuevo en unos segundos.
        </p>
        <Link
          href={DEFAULT_SIGNED_IN_PATH}
          className="bg-primary text-primary-foreground hover:bg-primary-hover active:bg-primary-active focus-visible:outline-ring mt-3 inline-flex min-h-11 items-center justify-center rounded-lg px-4 py-2.5 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2"
        >
          Ir al inicio
        </Link>
      </div>
    </main>
  );
}
