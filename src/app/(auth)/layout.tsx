import Image from "next/image";

/** Shell for the signed-out screens (login, sign-up): centered brand and card, no app header. */
export default function AuthLayout({ children }: LayoutProps<"/">) {
  return (
    <main className="flex flex-1 flex-col items-center justify-center px-6 py-12 max-sm:px-4 max-sm:py-8">
      <div className="flex w-full max-w-md flex-col items-center gap-6">
        {/* Two files because the brand colors differ per theme; CSS picks one. */}
        <Image
          src="/brand/logo-mono-white.svg"
          alt="ReNest"
          width={130}
          height={48}
          priority
          className="light:hidden h-12 w-auto"
        />
        <Image
          src="/brand/logo-horizontal.svg"
          alt="ReNest"
          width={130}
          height={48}
          priority
          className="light:block hidden h-12 w-auto"
        />
        {children}
      </div>
    </main>
  );
}
