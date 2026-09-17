import Link from "next/link";

export function AccountPage({
  title,
  intro,
  children,
}: {
  title: string;
  intro: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mx-auto grid max-w-5xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-2">
      <div>
        <p className="text-sm font-medium tracking-wide text-primary uppercase">Wingate Accountants Ltd</p>
        <h1 className="font-heading mt-3 text-3xl font-bold sm:text-4xl">{title}</h1>
        <p className="mt-4 text-muted-foreground">{intro}</p>
        <p className="mt-6 text-sm">
          <Link className="underline" href="/online-tax-return-preparation-service/">
            ← Online Tax Return Preparation Service
          </Link>
        </p>
      </div>
      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">{children}</div>
    </section>
  );
}
