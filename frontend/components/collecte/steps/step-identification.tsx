"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useUpdateBranch } from "@/lib/hooks/use-branches";
import type { Branch } from "@/lib/types";

export function StepIdentification({
  branch,
  onDone,
}: {
  branch: Branch;
  onDone: () => void;
}) {
  const updateBranch = useUpdateBranch(branch.id);
  const [values, setValues] = useState({
    collector_name: branch.collector_name ?? "",
    collector_phone: branch.collector_phone ?? "",
    collector_email: branch.collector_email ?? "",
    root_person_name: branch.root_person_name ?? "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateBranch.mutateAsync(values);
      toast.success("Coordonnées enregistrées");
      onDone();
    } catch {
      toast.error("Impossible d'enregistrer ces informations");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <Label>Branche</Label>
        <Input value={branch.branch_name} disabled />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="root_person_name">Ancêtre / personne racine de cette branche</Label>
        <Input
          id="root_person_name"
          value={values.root_person_name}
          onChange={(e) => setValues((v) => ({ ...v, root_person_name: e.target.value }))}
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="collector_name">Votre nom (chef de famille qui remplit ce formulaire)</Label>
        <Input
          id="collector_name"
          value={values.collector_name}
          onChange={(e) => setValues((v) => ({ ...v, collector_name: e.target.value }))}
        />
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="collector_phone">Téléphone</Label>
          <Input
            id="collector_phone"
            value={values.collector_phone}
            onChange={(e) => setValues((v) => ({ ...v, collector_phone: e.target.value }))}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="collector_email">Email</Label>
          <Input
            id="collector_email"
            type="email"
            value={values.collector_email}
            onChange={(e) => setValues((v) => ({ ...v, collector_email: e.target.value }))}
          />
        </div>
      </div>
      <Button type="submit" disabled={updateBranch.isPending} className="self-start">
        {updateBranch.isPending ? "Enregistrement..." : "Continuer"}
      </Button>
    </form>
  );
}
