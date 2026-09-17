"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { api } from "./api";
import { PortalShell } from "./portal-shell";
import { useTaxPortal } from "./use-tax-portal";

export function ClientMessages() {
  const { payload, error, busy, run } = useTaxPortal("/sign-in/?next=/portal/tax-returns/messages/");
  const [message, setMessage] = useState("");
  const bundle = payload?.bundle;

  if (!payload?.user) {
    return (
      <PortalShell title="Messages">
        <p className="text-sm text-muted-foreground">{error || "Loading messages…"}</p>
      </PortalShell>
    );
  }

  if (!bundle) {
    return (
      <PortalShell title="Messages" email={payload.user.email}>
        <p className="text-sm text-muted-foreground">Choose a package first, then you can message your named accountant.</p>
      </PortalShell>
    );
  }

  return (
    <PortalShell title="Messages" email={payload.user.email}>
      {error ? <p className="mb-4 text-sm text-destructive">{error}</p> : null}
      <p className="text-sm text-muted-foreground">
        Secure messages with {bundle.accountant?.name ?? "your Wingate accountant"}. Only your firm can read this thread.
      </p>
      <div className="mt-4 max-h-96 space-y-2 overflow-y-auto">
        {bundle.messages.length === 0 ? <p className="text-sm text-muted-foreground">No messages yet.</p> : null}
        {bundle.messages.map((item) => (
          <p key={item.id} className="rounded-lg bg-muted px-3 py-2 text-sm">
            <span className="font-medium">
              {item.authorRole === "accountant" ? bundle.accountant?.name ?? "Your accountant" : "You"}:{" "}
            </span>
            {item.body}
          </p>
        ))}
      </div>
      <Textarea className="mt-4" value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Write a message" />
      <Button
        className="mt-3 h-10"
        disabled={busy || !message.trim()}
        onClick={() =>
          void run(async () => {
            await api("messages", { method: "POST", body: JSON.stringify({ orderId: bundle.order.id, body: message }) });
            setMessage("");
          })
        }
      >
        Send to your accountant
      </Button>
    </PortalShell>
  );
}
