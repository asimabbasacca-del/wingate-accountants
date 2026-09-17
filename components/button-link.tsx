import Link from "next/link";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import type { VariantProps } from "class-variance-authority";

type Props = VariantProps<typeof buttonVariants> & {
  href: string;
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
};

export function ButtonLink({ href, children, className, variant, size, onClick }: Props) {
  return (
    <Link href={href} onClick={onClick} className={cn(buttonVariants({ variant, size }), className)}>
      {children}
    </Link>
  );
}
