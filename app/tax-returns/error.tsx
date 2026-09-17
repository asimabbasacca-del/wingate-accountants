"use client";

export default function TaxReturnsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="mx-auto max-w-lg px-4 py-24 text-center">
      <h1 className="font-heading text-2xl font-semibold">This page could not load</h1>
      <p className="mt-2 text-sm text-muted-foreground">{error.message}</p>
      <button type="button" className="mt-6 text-sm font-medium text-primary underline" onClick={reset}>
        Try again
      </button>
    </div>
  );
}
