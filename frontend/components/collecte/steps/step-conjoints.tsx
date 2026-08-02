"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";
import { Heart, Users } from "lucide-react";
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
import { useCreatePerson, useCreateUnion } from "@/lib/hooks/use-family-data";
import type { Person, UnionRecord } from "@/lib/types";

const schema = z.object({
  first_name: z.string().min(1, "Le prénom est requis"),
  last_name: z.string().optional(),
  gender: z.enum(["unknown", "M", "F"]),
  union_type: z.string(),
  start_date_text: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

const UNION_TYPES = [
  { value: "mariage civil", label: "Mariage civil" },
  { value: "mariage coutumier", label: "Mariage coutumier" },
  { value: "union libre", label: "Union libre" },
  { value: "autre", label: "Autre" },
  { value: "inconnu", label: "Inconnu" },
];

export function StepConjoints({
  branchId,
  rootPerson,
  spouses,
  onAdded,
}: {
  branchId: string;
  rootPerson: Person;
  spouses: { person: Person; union: UnionRecord }[];
  onAdded: (person: Person) => void;
}) {
  const createPerson = useCreatePerson(branchId);
  const createUnion = useCreateUnion(branchId);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    control,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { gender: "unknown", union_type: "mariage civil" },
  });
  const gender = useWatch({ control, name: "gender" });
  const unionType = useWatch({ control, name: "union_type" });

  const pending = createPerson.isPending || createUnion.isPending;

  const onSubmit = handleSubmit(async (values) => {
    try {
      const person = await createPerson.mutateAsync({
        branch_id: branchId,
        first_name: values.first_name,
        last_name: values.last_name || null,
        gender: values.gender,
      });
      await createUnion.mutateAsync({
        branch_id: branchId,
        partner_1_id: rootPerson.id,
        partner_2_id: person.id,
        union_type: values.union_type,
        start_date_text: values.start_date_text || null,
      });
      reset({ gender: "unknown", union_type: "mariage civil" });
      toast.success("Conjoint(e) ajouté(e)");
      onAdded(person);
    } catch {
      toast.error("Impossible d'ajouter ce conjoint");
    }
  });

  return (
    <div className="flex flex-col gap-4">
      {spouses.length > 0 && (
        <div className="flex flex-col gap-2">
          {spouses.map(({ person, union }) => (
            <Card key={person.id}>
              <CardContent className="flex items-center gap-3">
                <Heart className="size-4 shrink-0 fill-primary text-primary" />
                <div>
                  <p className="font-medium">
                    {person.first_name} {person.last_name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {union.union_type || "Type d'union inconnu"}
                    {union.start_date_text ? ` · depuis ${union.start_date_text}` : ""}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {spouses.length === 0 && (
        <div className="flex items-center gap-2 rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
          <Users className="size-4" />
          Aucun conjoint ajouté pour le moment. Si le chef de famille n&apos;a pas eu de conjoint(e)
          connu(e), passez simplement à l&apos;étape suivante.
        </div>
      )}

      <form onSubmit={onSubmit} className="flex flex-col gap-4 rounded-xl border p-4">
        <p className="text-sm font-medium">Ajouter un(e) conjoint(e)</p>
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="spouse_first_name">Prénom(s) *</Label>
            <Input id="spouse_first_name" {...register("first_name")} />
            {errors.first_name && (
              <p className="text-xs text-destructive">{errors.first_name.message}</p>
            )}
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="spouse_last_name">Nom</Label>
            <Input id="spouse_last_name" {...register("last_name")} />
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
            <Label>Type d&apos;union</Label>
            <Select
              value={unionType}
              onValueChange={(v) => setValue("union_type", v ?? "inconnu")}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {UNION_TYPES.map((t) => (
                  <SelectItem key={t.value} value={t.value}>
                    {t.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="start_date_text">Date approximative de l&apos;union</Label>
            <Input id="start_date_text" placeholder="Ex : 1978" {...register("start_date_text")} />
          </div>
        </div>
        <Button type="submit" disabled={pending} className="self-start">
          {pending ? "Ajout..." : "Ajouter ce conjoint"}
        </Button>
      </form>
    </div>
  );
}
