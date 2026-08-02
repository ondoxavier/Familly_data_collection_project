"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Plus, Copy, Check } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCreateBranch } from "@/lib/hooks/use-branches";
import type { Branch } from "@/lib/types";

const schema = z.object({
  branch_name: z.string().min(2, "Le nom de la branche est requis"),
  root_person_name: z.string().optional(),
  collector_name: z.string().optional(),
  collector_phone: z.string().optional(),
  collector_email: z.string().email("Email invalide").optional().or(z.literal("")),
});

type FormValues = z.infer<typeof schema>;

export function CreateBranchDialog() {
  const [open, setOpen] = useState(false);
  const [createdBranch, setCreatedBranch] = useState<Branch | null>(null);
  const createBranch = useCreateBranch();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const onSubmit = handleSubmit(async (values) => {
    try {
      const branch = await createBranch.mutateAsync({
        branch_name: values.branch_name,
        root_person_name: values.root_person_name || null,
        collector_name: values.collector_name || null,
        collector_phone: values.collector_phone || null,
        collector_email: values.collector_email || null,
      });
      setCreatedBranch(branch);
      reset();
      toast.success("Branche créée avec succès");
    } catch {
      toast.error("Impossible de créer la branche");
    }
  });

  const handleOpenChange = (next: boolean) => {
    setOpen(next);
    if (!next) {
      setCreatedBranch(null);
      reset();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger
        render={
          <Button>
            <Plus />
            Nouvelle branche
          </Button>
        }
      />
      <DialogContent className="sm:max-w-md">
        {createdBranch ? (
          <BranchCreatedView branch={createdBranch} onClose={() => handleOpenChange(false)} />
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Créer une branche familiale</DialogTitle>
              <DialogDescription>
                Une branche correspond à la descendance d&apos;un chef de famille. Un lien unique
                sera généré pour la collecte.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={onSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="branch_name">Nom de la branche *</Label>
                <Input
                  id="branch_name"
                  placeholder="Ex : Descendance de Jean Ondo"
                  {...register("branch_name")}
                />
                {errors.branch_name && (
                  <p className="text-xs text-destructive">{errors.branch_name.message}</p>
                )}
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="root_person_name">Ancêtre / personne racine</Label>
                <Input
                  id="root_person_name"
                  placeholder="Ex : Jean Ondo"
                  {...register("root_person_name")}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="collector_name">Chef de famille / collecteur</Label>
                <Input id="collector_name" {...register("collector_name")} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="collector_phone">Téléphone</Label>
                  <Input id="collector_phone" {...register("collector_phone")} />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="collector_email">Email</Label>
                  <Input id="collector_email" type="email" {...register("collector_email")} />
                  {errors.collector_email && (
                    <p className="text-xs text-destructive">{errors.collector_email.message}</p>
                  )}
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" disabled={createBranch.isPending}>
                  {createBranch.isPending ? "Création..." : "Créer la branche"}
                </Button>
              </DialogFooter>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

function BranchCreatedView({ branch, onClose }: { branch: Branch; onClose: () => void }) {
  const [copied, setCopied] = useState(false);
  const link =
    typeof window !== "undefined"
      ? `${window.location.origin}/collecte/${branch.access_token}`
      : "";

  const copyLink = async () => {
    await navigator.clipboard.writeText(link);
    setCopied(true);
    toast.success("Lien copié");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle>Branche créée</DialogTitle>
        <DialogDescription>
          Envoyez ce lien au chef de famille pour qu&apos;il puisse renseigner sa descendance.
        </DialogDescription>
      </DialogHeader>
      <div className="flex items-center gap-2 rounded-lg border bg-muted/40 p-3">
        <code className="flex-1 overflow-x-auto text-xs whitespace-nowrap">{link}</code>
        <Button size="icon-sm" variant="outline" onClick={copyLink} aria-label="Copier le lien">
          {copied ? <Check className="text-primary" /> : <Copy />}
        </Button>
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={onClose}>
          Fermer
        </Button>
      </DialogFooter>
    </>
  );
}
