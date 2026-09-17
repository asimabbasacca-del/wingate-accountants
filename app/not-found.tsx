import { ButtonLink } from "@/components/button-link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-xl px-4 py-24 text-center">
      <h1 className="font-heading text-3xl font-bold">Page not found</h1>
      <p className="mt-3 text-muted-foreground">
        That address is not on the Wingate Accountants site. Try the blog or get in touch.
      </p>
      <div className="mt-8 flex justify-center gap-3">
        <ButtonLink href="/" className="h-10 px-4">
          Home
        </ButtonLink>
        <ButtonLink href="/blog/" variant="outline" className="h-10 px-4">
          Blog
        </ButtonLink>
      </div>
    </div>
  );
}
