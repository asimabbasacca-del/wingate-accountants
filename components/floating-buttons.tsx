"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { MessageCircle, Phone, X } from "lucide-react";
import { SITE } from "@/lib/site";
import { cn } from "@/lib/utils";

function hideOn(path: string) {
  return (
    path.startsWith("/portal") ||
    path.startsWith("/sign-in") ||
    path.startsWith("/sign-up") ||
    path.startsWith("/checkout") ||
    path.startsWith("/forgot-password") ||
    path.startsWith("/reset-password") ||
    path.startsWith("/verify-email") ||
    path.startsWith("/tax-returns/onboarding") ||
    path.startsWith("/accountancy-packages/start")
  );
}

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className={className} fill="currentColor">
      <path d="M12.04 2c-5.46 0-9.91 4.43-9.91 9.88 0 1.74.46 3.44 1.32 4.94L2 22l5.31-1.39A9.9 9.9 0 0 0 12.04 22c5.46 0 9.91-4.43 9.91-9.88C21.95 6.43 17.5 2 12.04 2zm5.72 14.2c-.24.67-1.18 1.23-1.93 1.39-.52.11-1.2.2-3.49-.75-2.93-1.21-4.82-4.16-4.97-4.35-.14-.19-1.18-1.57-1.18-3 0-1.42.74-2.12 1.01-2.41.24-.26.64-.38 1.02-.38.12 0 .23 0 .33.01.3.01.44.03.64.5.24.58.83 2.02.9 2.17.08.15.13.32.02.52-.1.19-.16.31-.31.48-.16.16-.33.36-.47.49-.16.16-.32.33-.14.64.19.32.84 1.38 1.8 2.24 1.24 1.1 2.25 1.45 2.59 1.61.32.15.5.13.69-.08.19-.21.81-.94 1.03-1.27.22-.32.44-.27.73-.16.3.1 1.89.89 2.21 1.05.32.16.53.24.61.38.08.13.08.76-.16 1.43z" />
    </svg>
  );
}

export function FloatingButtons() {
  const path = usePathname();
  const [open, setOpen] = useState(false);
  if (hideOn(path)) return null;

  const links = (
    <>
      <a
        href="/contact/"
        className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-white shadow-lg transition hover:scale-105"
        style={{ backgroundColor: "#1E3A8A" }}
      >
        <Phone className="size-4" aria-hidden />
        Contact Us
      </a>
      <a
        href={SITE.whatsappHref}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-white shadow-lg transition hover:scale-105"
        style={{ backgroundColor: "#1E3A8A" }}
      >
        <WhatsAppIcon className="size-4" />
        WhatsApp
      </a>
    </>
  );

  return (
    <>
      <div className="fixed top-[40%] left-[20px] z-40 hidden flex-col gap-2 md:flex print:hidden">{links}</div>
      <div className="fixed right-4 bottom-4 z-40 md:hidden print:hidden">
        {open ? <div className="mb-2 flex flex-col items-end gap-2">{links}</div> : null}
        <button
          type="button"
          className={cn(
            "inline-flex size-12 items-center justify-center rounded-full text-white shadow-lg",
            open && "ring-2 ring-accent",
          )}
          style={{ backgroundColor: "#1E3A8A" }}
          aria-expanded={open}
          aria-label={open ? "Close contact options" : "Open contact options"}
          onClick={() => setOpen((value) => !value)}
        >
          {open ? <X className="size-5" /> : <MessageCircle className="size-5" />}
        </button>
      </div>
    </>
  );
}
