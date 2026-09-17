"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api, type StatePayload } from "./api";

export function useTaxPortal(redirectIfGuest = "/sign-in/?next=/portal/tax-returns/") {
  const router = useRouter();
  const [payload, setPayload] = useState<StatePayload | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const refresh = useCallback(async () => {
    const next = await api<StatePayload>("state");
    setPayload(next);
    return next;
  }, []);

  useEffect(() => {
    void (async () => {
      try {
        const next = await refresh();
        if (!next.user) router.replace(redirectIfGuest);
        else if (next.user.role === "accountant") router.replace("/portal/accountant/");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Could not load the portal");
      }
    })();
  }, [refresh, redirectIfGuest, router]);

  async function run(fn: () => Promise<void>) {
    setBusy(true);
    setError("");
    try {
      await fn();
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Request failed");
    } finally {
      setBusy(false);
    }
  }

  return { payload, error, busy, refresh, run, setError };
}
