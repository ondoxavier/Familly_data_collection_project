"use client";

import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export interface StepDef {
  label: string;
  shortLabel: string;
}

export function Stepper({
  steps,
  current,
  completed,
  onSelect,
}: {
  steps: StepDef[];
  current: number;
  completed: boolean[];
  onSelect: (index: number) => void;
}) {
  return (
    <div className="flex items-center gap-1 overflow-x-auto pb-1">
      {steps.map((step, index) => {
        const isCurrent = index === current;
        const isDone = completed[index];
        return (
          <div key={step.label} className="flex shrink-0 items-center gap-1">
            <button
              type="button"
              onClick={() => onSelect(index)}
              className={cn(
                "flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium whitespace-nowrap transition-colors sm:text-sm",
                isCurrent
                  ? "border-primary bg-primary text-primary-foreground"
                  : isDone
                    ? "border-primary/30 bg-primary/10 text-primary hover:bg-primary/15"
                    : "border-border text-muted-foreground hover:bg-muted"
              )}
            >
              <span
                className={cn(
                  "flex size-4 items-center justify-center rounded-full text-[10px]",
                  isCurrent
                    ? "bg-primary-foreground text-primary"
                    : isDone
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted-foreground/20"
                )}
              >
                {isDone && !isCurrent ? <Check className="size-2.5" /> : index + 1}
              </span>
              <span className="hidden sm:inline">{step.label}</span>
              <span className="sm:hidden">{step.shortLabel}</span>
            </button>
            {index < steps.length - 1 && <div className="h-px w-3 shrink-0 bg-border" />}
          </div>
        );
      })}
    </div>
  );
}
