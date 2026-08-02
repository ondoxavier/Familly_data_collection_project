"use client";

import { useState } from "react";
import { toast } from "sonner";
import { MessageSquareText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useCreateRemark } from "@/lib/hooks/use-family-data";
import type { Person, Remark } from "@/lib/types";

export function StepRemarques({
  branchId,
  persons,
  remarks,
}: {
  branchId: string;
  persons: Person[];
  remarks: Remark[];
}) {
  const createRemark = useCreateRemark(branchId);
  const [content, setContent] = useState("");
  const [personId, setPersonId] = useState<string>("general");

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    try {
      await createRemark.mutateAsync({
        branch_id: branchId,
        person_id: personId === "general" ? null : personId,
        content: content.trim(),
      });
      setContent("");
      setPersonId("general");
      toast.success("Remarque ajoutée");
    } catch {
      toast.error("Impossible d'ajouter cette remarque");
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {remarks.length > 0 ? (
        <div className="flex flex-col gap-2">
          {remarks.map((r) => {
            const person = persons.find((p) => p.id === r.person_id);
            return (
              <Card key={r.id}>
                <CardContent className="flex items-start gap-3">
                  <MessageSquareText className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                  <div>
                    <p className="text-sm">{r.content}</p>
                    <p className="text-xs text-muted-foreground">
                      {person ? `${person.first_name} ${person.last_name ?? ""}` : "Remarque générale"}
                    </p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <p className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
          Personnes oubliées, informations incertaines, données à vérifier : notez ici tout ce qui
          mérite d&apos;être vérifié plus tard.
        </p>
      )}

      <form onSubmit={onSubmit} className="flex flex-col gap-3 rounded-xl border p-4">
        <Textarea
          rows={3}
          placeholder="Ex : Je ne suis pas sûr de la date de naissance de Paul, à vérifier avec tata Alice."
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <Select value={personId} onValueChange={(v) => setPersonId(v ?? "general")}>
            <SelectTrigger className="w-full sm:w-64">
              <SelectValue placeholder="Concerne qui ?" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="general">Remarque générale</SelectItem>
              {persons.map((p) => (
                <SelectItem key={p.id} value={p.id}>
                  {p.first_name} {p.last_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button type="submit" disabled={createRemark.isPending || !content.trim()}>
            {createRemark.isPending ? "Ajout..." : "Ajouter la remarque"}
          </Button>
        </div>
      </form>
    </div>
  );
}
