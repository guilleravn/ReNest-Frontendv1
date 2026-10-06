type AuthCardProps = {
  title: string;
  subtitle: string;
  children: React.ReactNode;
};

/** The card that holds the login and sign-up forms, with the page's only `h1`. */
export function AuthCard({ title, subtitle, children }: AuthCardProps) {
  return (
    <div className="border-border bg-surface shadow-card flex w-full flex-col gap-6 rounded-xl border p-8 max-sm:p-5">
      <div className="flex flex-col gap-1.5">
        <h1 className="font-heading text-3xl max-sm:text-2xl">{title}</h1>
        <p className="text-muted text-sm">{subtitle}</p>
      </div>
      {children}
    </div>
  );
}
