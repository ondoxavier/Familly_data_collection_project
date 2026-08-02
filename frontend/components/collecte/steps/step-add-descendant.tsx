"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import { useState } from "react";
import { toast } from "sonner";
import { Baby, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PersonPicker } from "@/components/collecte/person-picker";
import { useCreateParentChildLink, useCreatePerson } from "@/lib/hooks/use-family-data";
import type { Person } from "@/lib/types";

const schema = z.object({
  first_name: z.string().min(1, "Le prénom est requis"),
  last_name: z.string().optional(),
  gender: z.enum(["unknown", "M", "F"]),
  birth_date_text: z.string().optional(),
  is_alive: z.enum(["unknown", "yes", "no"]),
});

type FormValues = z.infer<typeof schema>;

export function StepAddDescendant({
  branchId,
  allPersons,
  parentCandidates,
  addedItems,
  emptyLabel,
  onAdded,
}: {
  branchId: string;
  allPersons: Person[];
  parentCandidates: Person[];
  addedItems: { person: Person; parentNames: string[] }[];
  emptyLabel: string;
  onAdded: (person: Person) => void;
}) {
  const createPerson = useCreatePerson(branchId);
  const createLink = useCreateParentChildLink(branchId);
  const [parentIds, setParentIds] = useState<string[]>([]);

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

  const pending = createPerson.isPending || createLink.isPending;

  const onSubmit = handleSubmit(async (values) => {
    try {
      const person = await createPerson.mutateAsync({
        branch_id: branchId,
        first_name: values.first_name,
        last_name: values.last_name || null,
        gender: values.gender,
        birth_date_text: values.birth_date_text || null,
        is_alive: values.is_alive === "unknown" ? null : values.is_alive === "yes",
      });
      for (const parentId of parentIds) {
        await createLink.mutateAsync({
          branch_id: branchId,
          parent_id: parentId,
          child_id: person.id,
        });
      }
      reset({ gender: "unknown", is_alive: "unknown" });
      setParentIds([]);
      toast.success("Personne ajoutée");
      onAdded(person);
    } catch {
      toast.error("Impossible d'ajouter cette personne");
    }
  });

  return (
    <div className="flex flex-col gap-4">
      {addedItems.length > 0 ? (
        <div className="flex flex-col gap-2">
          {addedItems.map(({ person, parentNames }) => (
            <Card key={person.id}>
              <CardContent className="flex items-center gap-3">
                <Baby className="size-4 shrink-0 text-primary" />
                <div>
                  <p className="font-medium">
                    {person.first_name} {person.last_name}
                  </p>
                  {parentNames.length > 0 && (
                    <p className="text-xs text-muted-foreground">
                      Parent(s) : {parentNames.join(" & ")}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="flex items-center gap-2 rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
          <Users className="size-4" />
          {emptyLabel}
        </div>
      )}

      <form onSubmit={onSubmit} className="flex flex-col gap-4 rounded-xl border p-4">
        <p className="text-sm font-medium">Ajouter une personne</p>
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="child_first_name">Prénom(s) *</Label>
            <Input id="child_first_name" {...register("first_name")} />
            {errors.first_name && (
              <p className="text-xs text-destructive">{errors.first_name.message}</p>
            )}
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="child_last_name">Nom</Label>
            <Input id="child_last_name" {...register("last_name")} />
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
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="child_birth_date_text">Naissance</Label>
            <Input
              id="child_birth_date_text"
              placeholder="Ex : 1985, vers 1985, inconnue"
              {...register("birth_date_text")}
            />
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

        <div className="flex flex-col gap-1.5">
          <Label>Père / mère (jusqu&apos;à 2)</Label>
          <PersonPicker
            branchId={branchId}
            persons={parentCandidates.length > 0 ? parentCandidates : allPersons}
            selected={parentIds}
            onChange={setParentIds}
            max={2}
          />
        </div>

        <Button type="submit" disabled={pending} className="self-start">
          {pending ? "Ajout..." : "Ajouter cette personne"}
        </Button>
      </form>
    </div>
  );
}
