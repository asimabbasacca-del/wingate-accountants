export const dynamic = "force-dynamic";

export default function AccessDeniedPage() {
  return (
    <div className="mx-auto max-w-xl px-4 py-24 text-center">
      <p className="text-sm font-semibold tracking-wide text-primary uppercase">Wingate</p>
      <h1 className="font-heading mt-3 text-3xl font-bold">Access Denied</h1>
      <p className="mt-4 text-muted-foreground">
        You do not have permission to open this area. Restricted client, tax and payment data is not shown.
      </p>
      <a href="/portal/" className="mt-8 inline-block text-sm font-medium text-primary">
        Return to your dashboard
      </a>
    </div>
  );
}
