import { cn } from "@/lib/utils";

export function Stepper({
  steps,
  current,
}: {
  steps: { id: string; label: string }[];
  current: string;
}) {
  const index = Math.max(0, steps.findIndex((step) => step.id === current));
  return (
    <ol className="flex gap-1 overflow-x-auto pb-1">
      {steps.map((step, i) => {
        const done = i < index;
        const active = i === index;
        return (
          <li key={step.id} className="min-w-0 flex-1">
            <div
              className={cn(
                "h-1.5 rounded-full",
                done || active ? "bg-primary" : "bg-border",
              )}
            />
            <p
              className={cn(
                "mt-2 truncate text-[11px] font-medium sm:text-xs",
                active ? "text-primary" : "text-muted-foreground",
              )}
            >
              {i + 1}. {step.label}
            </p>
          </li>
        );
      })}
    </ol>
  );
}
