"use client";

import { toast } from "sonner";
import { PartyPopper, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { FamilyTreePreview } from "@/components/collecte/family-tree-preview";
import { useSubmitBranch } from "@/lib/hooks/use-branches";
import type { Branch, ParentChildLink, Person, UnionRecord } from "@/lib/types";

export function StepRecapitulatif({
  branch,
  persons,
  unions,
  links,
  rootPersonId,
}: {
  branch: Branch;
  persons: Person[];
  unions: UnionRecord[];
  links: ParentChildLink[];
  rootPersonId: string | null;
}) {
  const submitBranch = useSubmitBranch(branch.id);

  const handleSubmit = async () => {
    try {
      await submitBranch.mutateAsync();
      toast.success("Merci ! Votre branche a été soumise.");
    } catch {
      toast.error("Impossible de soumettre la branche pour le moment");
    }
  };

  if (branch.status === "submitted") {
    return (
      <div className="flex flex-col items-center gap-3 rounded-xl border border-primary/30 bg-primary/5 p-8 text-center">
        <PartyPopper className="size-8 text-primary" />
        <h3 className="text-lg font-semibold">Merci pour votre contribution !</h3>
        <p className="max-w-md text-sm text-muted-foreground">
          Les informations que vous avez renseignées pour {branch.branch_name} ont bien été
          transmises. Vous pouvez fermer cette page ou continuer à ajouter des remarques si besoin.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <FamilyTreePreview
        persons={persons}
        unions={unions}
        links={links}
        rootPersonId={rootPersonId}
      />

      <Card>
        <CardContent className="flex flex-col gap-1 text-sm">
          <p>
            <span className="font-medium">{persons.length}</span> personne(s) ·{" "}
            <span className="font-medium">{unions.length}</span> union(s) ·{" "}
            <span className="font-medium">{links.length}</span> lien(s) parent-enfant
          </p>
          <p className="text-muted-foreground">
            Vous pourrez toujours contacter l&apos;administrateur si vous devez corriger une
            information après soumission.
          </p>
        </CardContent>
      </Card>

      <Button onClick={handleSubmit} disabled={submitBranch.isPending || persons.length === 0} size="lg">
        <Send />
        {submitBranch.isPending ? "Envoi..." : "Soumettre ma branche familiale"}
      </Button>
    </div>
  );
}
