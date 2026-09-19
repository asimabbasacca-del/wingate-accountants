import { Suspense } from "react";
import { ContactForm } from "@/components/ContactForm";
import { SITE } from "@/lib/site";

export function ServiceContactForm() {
  return (
    <section id="enquire" className="mx-auto max-w-3xl scroll-mt-24 px-4 py-16 sm:px-6">
      <h2 className="font-heading text-3xl font-semibold">Send an enquiry</h2>
      <p className="mt-2 mb-8 text-muted-foreground">
        The same form as our contact page. Write to {SITE.email} or call {SITE.phone} if you would rather not use the
        form.
      </p>
      <Suspense fallback={<p className="text-sm text-muted-foreground">Loading the enquiry form…</p>}>
        <ContactForm />
      </Suspense>
    </section>
  );
}
