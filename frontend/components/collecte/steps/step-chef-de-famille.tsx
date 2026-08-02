"use client";

import { CheckCircle2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { PersonQuickForm } from "@/components/collecte/person-quick-form";
import type { Person } from "@/lib/types";

export function StepChefDeFamille({
  branchId,
  rootPerson,
  onCreated,
}: {
  branchId: string;
  rootPerson: Person | null;
  onCreated: (person: Person) => void;
}) {
  if (rootPerson) {
    return (
      <Card className="border-primary/30 bg-primary/5">
        <CardContent className="flex items-center gap-3">
          <CheckCircle2 className="size-5 shrink-0 text-primary" />
          <div>
            <p className="font-medium">
              {rootPerson.first_name} {rootPerson.last_name}
            </p>
            <p className="text-sm text-muted-foreground">
              Chef de famille enregistré. Vous pouvez continuer vers l&apos;étape suivante.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <PersonQuickForm
      branchId={branchId}
      submitLabel="Enregistrer le chef de famille"
      onCreated={onCreated}
    />
  );
}
