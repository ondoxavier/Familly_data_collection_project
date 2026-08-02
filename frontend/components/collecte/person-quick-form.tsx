"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useCreatePerson } from "@/lib/hooks/use-family-data";
import type { Person } from "@/lib/types";

const schema = z.object({
  first_name: z.string().min(1, "Le prénom est requis"),
  last_name: z.string().optional(),
  gender: z.enum(["unknown", "M", "F"]),
  birth_date_text: z.string().optional(),
  birth_place: z.string().optional(),
  is_alive: z.enum(["unknown", "yes", "no"]),
  notes: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

export function PersonQuickForm({
  branchId,
  submitLabel = "Ajouter",
  compact = false,
  onCreated,
}: {
  branchId: string;
  submitLabel?: string;
  compact?: boolean;
  onCreated: (person: Person) => void;
}) {
  const createPerson = useCreatePerson(branchId);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    control,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { gender: "unknown", is_alive: "unknown" },
  });
  const gender = useWatch({ control, name: "gender" });
  const isAlive = useWatch({ control, name: "is_alive" });

  const onSubmit = handleSubmit(async (values) => {
    try {
      const person = await createPerson.mutateAsync({
        branch_id: branchId,
        first_name: values.first_name,
        last_name: values.last_name || null,
        gender: values.gender,
        birth_date_text: values.birth_date_text || null,
        birth_place: values.birth_place || null,
        is_alive: values.is_alive === "unknown" ? null : values.is_alive === "yes",
        notes: values.notes || null,
      });
      reset({ gender: "unknown", is_alive: "unknown" });
      onCreated(person);
    } catch {
      toast.error("Impossible d'ajouter cette personne");
    }
  });

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="flex flex-col gap-1.5 sm:col-span-1">
          <Label htmlFor="first_name">Prénom(s) *</Label>
          <Input id="first_name" {...register("first_name")} autoFocus />
          {errors.first_name && (
            <p className="text-xs text-destructive">{errors.first_name.message}</p>
          )}
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="last_name">Nom</Label>
          <Input id="last_name" {...register("last_name")} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label>Sexe</Label>
          <Select value={gender} onValueChange={(v) => setValue("gender", v as FormValues["gender"])}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="unknown">Inconnu</SelectItem>
              <SelectItem value="M">Masculin</SelectItem>
              <SelectItem value="F">Féminin</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="birth_date_text">Naissance</Label>
          <Input
            id="birth_date_text"
            placeholder="Ex : 1950, vers 1950, inconnue"
            {...register("birth_date_text")}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="birth_place">Lieu de naissance</Label>
          <Input id="birth_place" {...register("birth_place")} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label>Statut</Label>
          <Select
            value={isAlive}
            onValueChange={(v) => setValue("is_alive", v as FormValues["is_alive"])}
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="unknown">Inconnu</SelectItem>
              <SelectItem value="yes">Vivant</SelectItem>
              <SelectItem value="no">Décédé</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {!compact && (
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="notes">Notes / informations complémentaires</Label>
          <Textarea id="notes" rows={2} {...register("notes")} />
        </div>
      )}

      <Button type="submit" disabled={createPerson.isPending} className="self-start">
        {createPerson.isPending ? "Ajout..." : submitLabel}
      </Button>
    </form>
  );
}
