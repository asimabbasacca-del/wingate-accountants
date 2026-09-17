import { redirect } from "next/navigation";

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

export default async function TaxReturnStartPage({ searchParams }: Props) {
  const raw = await searchParams;
  const next = new URLSearchParams();
  for (const [key, value] of Object.entries(raw)) {
    const text = Array.isArray(value) ? value[0] : value;
    if (text) next.set(key, text);
  }
  const qs = next.toString();
  redirect(qs ? `/sign-up/?${qs}` : "/sign-up/");
}
