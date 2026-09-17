import { SITE } from "@/lib/site";

export function ContactCard({
  viewer,
  accountantName,
  accountantEmail,
  clientName,
  clientEmail,
}: {
  viewer: "client" | "accountant";
  accountantName?: string | null;
  accountantEmail?: string | null;
  clientName?: string | null;
  clientEmail?: string | null;
}) {
  if (viewer === "client") {
    const name = accountantName || "Your Wingate accountant";
    return (
      <aside className="rounded-2xl border border-border bg-card p-5">
        <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">Your accountant</p>
        <p className="font-heading mt-1 text-lg font-semibold">{name}</p>
        <p className="mt-1 text-sm text-muted-foreground">Wingate Accountants Limited</p>
        <p className="mt-3 text-sm">
          <a className="underline" href={`mailto:${accountantEmail || SITE.email}`}>
            {accountantEmail || SITE.email}
          </a>
        </p>
        <p className="mt-1 text-sm">
          <a className="underline" href={SITE.phoneHref}>
            {SITE.phone}
          </a>
        </p>
        <p className="mt-3 text-xs text-muted-foreground">
          Messages in this portal go to your accountant. They are not handled by any other software product.
        </p>
      </aside>
    );
  }
  return (
    <aside className="rounded-2xl border border-border bg-card p-5">
      <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">Client</p>
      <p className="font-heading mt-1 text-lg font-semibold">{clientName || "Client"}</p>
      {clientEmail ? (
        <p className="mt-1 text-sm">
          <a className="underline" href={`mailto:${clientEmail}`}>
            {clientEmail}
          </a>
        </p>
      ) : null}
      <p className="mt-3 text-xs text-muted-foreground">
        This thread is between you and the client. Replies stay on the Wingate file.
      </p>
    </aside>
  );
}
