"use client";

import { useState } from "react";
import { Search, UserPlus, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PersonQuickForm } from "@/components/collecte/person-quick-form";
import { cn } from "@/lib/utils";
import type { Person } from "@/lib/types";

function label(person: Person) {
  return `${person.first_name} ${person.last_name ?? ""}`.trim();
}

export function PersonPicker({
  branchId,
  persons,
  selected,
  onChange,
  max = 2,
  helperText,
}: {
  branchId: string;
  persons: Person[];
  selected: string[];
  onChange: (ids: string[]) => void;
  max?: number;
  helperText?: string;
}) {
  const [query, setQuery] = useState("");
  const [addingNew, setAddingNew] = useState(false);

  const filtered = persons.filter((p) =>
    label(p).toLowerCase().includes(query.toLowerCase())
  );

  const toggle = (id: string) => {
    if (selected.includes(id)) {
      onChange(selected.filter((s) => s !== id));
      return;
    }
    if (selected.length >= max) return;
    onChange([...selected, id]);
  };

  return (
    <div className="flex flex-col gap-2">
      {helperText && <p className="text-xs text-muted-foreground">{helperText}</p>}

      {selected.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {selected.map((id) => {
            const person = persons.find((p) => p.id === id);
            if (!person) return null;
            return (
              <Badge key={id} variant="secondary" className="gap-1">
                {label(person)}
                <button
                  type="button"
                  onClick={() => toggle(id)}
                  aria-label={`Retirer ${label(person)}`}
                  className="ml-0.5"
                >
                  <X className="size-3" />
                </button>
              </Badge>
            );
          })}
        </div>
      )}

      {addingNew ? (
        <div className="rounded-lg border bg-muted/30 p-3">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-sm font-medium">Ajouter une personne non listée</p>
            <Button size="icon-xs" variant="ghost" onClick={() => setAddingNew(false)}>
              <X />
            </Button>
          </div>
          <PersonQuickForm
            branchId={branchId}
            compact
            submitLabel="Ajouter et sélectionner"
            onCreated={(person) => {
              setAddingNew(false);
              if (selected.length < max) onChange([...selected, person.id]);
            }}
          />
        </div>
      ) : (
        <>
          <div className="relative">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Rechercher une personne déjà saisie..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-8"
            />
          </div>
          <div className="flex max-h-40 flex-col gap-1 overflow-y-auto rounded-lg border p-1.5">
            {filtered.length === 0 && (
              <p className="p-2 text-center text-xs text-muted-foreground">Aucune personne</p>
            )}
            {filtered.map((p) => {
              const active = selected.includes(p.id);
              const disabled = !active && selected.length >= max;
              return (
                <button
                  type="button"
                  key={p.id}
                  onClick={() => toggle(p.id)}
                  disabled={disabled}
                  className={cn(
                    "flex items-center justify-between rounded-md px-2 py-1.5 text-left text-sm transition-colors",
                    active
                      ? "bg-primary/10 text-primary"
                      : "hover:bg-muted disabled:pointer-events-none disabled:opacity-40"
                  )}
                >
                  {label(p)}
                  {active && <Badge variant="default">Sélectionné</Badge>}
                </button>
              );
            })}
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="self-start"
            onClick={() => setAddingNew(true)}
          >
            <UserPlus />
            Cette personne n&apos;est pas encore dans la liste
          </Button>
        </>
      )}
    </div>
  );
}
