"use client";

import { ChevronDown, Heart, Users } from "lucide-react";
import type { ParentChildLink, Person, UnionRecord } from "@/lib/types";

function personLabel(person: Person) {
  return `${person.first_name} ${person.last_name ?? ""}`.trim();
}

function computeGenerations(
  persons: Person[],
  links: ParentChildLink[],
  unions: UnionRecord[],
  rootPersonId: string | null
) {
  const levels = new Map<string, number>();
  const childrenOf = new Map<string, string[]>();
  const spouseOf = new Map<string, string[]>();

  for (const link of links) {
    childrenOf.set(link.parent_id, [...(childrenOf.get(link.parent_id) ?? []), link.child_id]);
  }
  for (const union of unions) {
    spouseOf.set(union.partner_1_id, [
      ...(spouseOf.get(union.partner_1_id) ?? []),
      union.partner_2_id,
    ]);
    spouseOf.set(union.partner_2_id, [
      ...(spouseOf.get(union.partner_2_id) ?? []),
      union.partner_1_id,
    ]);
  }

  const start = rootPersonId && persons.some((p) => p.id === rootPersonId) ? rootPersonId : persons[0]?.id;
  if (!start) return { levels, spouseOf };

  const queue: string[] = [start];
  levels.set(start, 0);

  while (queue.length > 0) {
    const current = queue.shift()!;
    const level = levels.get(current)!;

    for (const spouseId of spouseOf.get(current) ?? []) {
      if (!levels.has(spouseId)) {
        levels.set(spouseId, level);
        queue.push(spouseId);
      }
    }
    for (const childId of childrenOf.get(current) ?? []) {
      if (!levels.has(childId)) {
        levels.set(childId, level + 1);
        queue.push(childId);
      }
    }
  }

  return { levels, spouseOf };
}

const GENERATION_LABELS = ["Chef de famille", "Enfants", "Petits-enfants"];

export function FamilyTreePreview({
  persons,
  unions,
  links,
  rootPersonId,
}: {
  persons: Person[];
  unions: UnionRecord[];
  links: ParentChildLink[];
  rootPersonId: string | null;
}) {
  if (persons.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed p-10 text-center text-muted-foreground">
        <Users className="size-6" />
        <p className="text-sm">Aucune personne saisie pour le moment.</p>
      </div>
    );
  }

  const { levels, spouseOf } = computeGenerations(persons, links, unions, rootPersonId);

  const byLevel = new Map<number, Person[]>();
  const unlinked: Person[] = [];
  for (const person of persons) {
    const level = levels.get(person.id);
    if (level === undefined) {
      unlinked.push(person);
      continue;
    }
    byLevel.set(level, [...(byLevel.get(level) ?? []), person]);
  }

  const sortedLevels = [...byLevel.keys()].sort((a, b) => a - b);

  return (
    <div className="flex flex-col items-stretch gap-3">
      {sortedLevels.map((level, idx) => {
        const peopleAtLevel = byLevel.get(level)!;
        const rendered = new Set<string>();
        const groups: Person[][] = [];
        for (const person of peopleAtLevel) {
          if (rendered.has(person.id)) continue;
          const spouseIds = (spouseOf.get(person.id) ?? []).filter(
            (id) => levels.get(id) === level && !rendered.has(id)
          );
          const group = [person, ...spouseIds.map((id) => persons.find((p) => p.id === id)!).filter(Boolean)];
          group.forEach((p) => rendered.add(p.id));
          groups.push(group);
        }

        return (
          <div key={level} className="flex flex-col items-center gap-2">
            <div className="flex flex-wrap items-center justify-center gap-2">
              {groups.map((group, gIdx) => (
                <div
                  key={gIdx}
                  className="flex items-center gap-1.5 rounded-full border bg-card px-3 py-1.5 text-sm shadow-sm ring-1 ring-foreground/5"
                >
                  {group.map((p, pIdx) => (
                    <span key={p.id} className="flex items-center gap-1.5">
                      {pIdx > 0 && <Heart className="size-3 fill-primary text-primary" />}
                      <span className="font-medium">{personLabel(p)}</span>
                    </span>
                  ))}
                </div>
              ))}
            </div>
            <p className="text-xs text-muted-foreground">
              {GENERATION_LABELS[idx] ?? `Génération ${idx + 1}`}
            </p>
            {idx < sortedLevels.length - 1 && (
              <ChevronDown className="size-4 text-muted-foreground/50" />
            )}
          </div>
        );
      })}

      {unlinked.length > 0 && (
        <div className="mt-2 flex flex-col items-center gap-2 border-t pt-3">
          <p className="text-xs text-muted-foreground">Personnes non rattachées pour le moment</p>
          <div className="flex flex-wrap justify-center gap-2">
            {unlinked.map((p) => (
              <span
                key={p.id}
                className="rounded-full border border-dashed px-3 py-1 text-sm text-muted-foreground"
              >
                {personLabel(p)}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
