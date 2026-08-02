"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useBranches } from "@/lib/hooks/use-branches";
import { FileCheck2, FileClock, Users } from "lucide-react";

export function StatsCards() {
  const { data: branches, isLoading } = useBranches();

  const total = branches?.length ?? 0;
  const submitted = branches?.filter((b) => b.status === "submitted").length ?? 0;
  const drafts = total - submitted;

  const items = [
    { label: "Branches créées", value: total, icon: Users },
    { label: "En cours de collecte", value: drafts, icon: FileClock },
    { label: "Soumises", value: submitted, icon: FileCheck2 },
  ];

  return (
    <div className="grid gap-3 sm:grid-cols-3">
      {items.map((item) => (
        <Card key={item.label}>
          <CardHeader className="flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {item.label}
            </CardTitle>
            <item.icon className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-12" />
            ) : (
              <p className="text-2xl font-semibold tabular-nums">{item.value}</p>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
