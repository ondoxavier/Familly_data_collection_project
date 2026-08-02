"use client";

import { useEffect, useMemo, useState } from "react";
import { TreeDeciduous } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Stepper, type StepDef } from "@/components/collecte/stepper";
import { StepIdentification } from "@/components/collecte/steps/step-identification";
import { StepChefDeFamille } from "@/components/collecte/steps/step-chef-de-famille";
import { StepConjoints } from "@/components/collecte/steps/step-conjoints";
import { StepAddDescendant } from "@/components/collecte/steps/step-add-descendant";
import { StepRemarques } from "@/components/collecte/steps/step-remarques";
import { StepRecapitulatif } from "@/components/collecte/steps/step-recapitulatif";
import { useBranch } from "@/lib/hooks/use-branches";
import {
  useParentChildLinks,
  usePersons,
  useRemarks,
  useUnions,
} from "@/lib/hooks/use-family-data";
import type { Branch } from "@/lib/types";

const STEPS: StepDef[] = [
  { label: "Identification", shortLabel: "1" },
  { label: "Chef de famille", shortLabel: "2" },
  { label: "Conjoint(s)", shortLabel: "3" },
  { label: "Enfants", shortLabel: "4" },
  { label: "Petits-enfants", shortLabel: "5" },
  { label: "Remarques", shortLabel: "6" },
  { label: "Récapitulatif", shortLabel: "7" },
];

function personName(persons: { id: string; first_name: string; last_name: string | null }[], id: string) {
  const person = persons.find((p) => p.id === id);
  return person ? `${person.first_name} ${person.last_name ?? ""}`.trim() : "";
}

export function CollecteWizard({ branch: initialBranch }: { branch: Branch }) {
  const branchId = initialBranch.id;
  const stepStorageKey = `family-collecte-step-${branchId}`;
  const rootStorageKey = `family-collecte-root-${branchId}`;

  const { data: branch } = useBranch(branchId);
  const currentBranch = branch ?? initialBranch;

  const { data: persons = [] } = usePersons(branchId);
  const { data: unions = [] } = useUnions(branchId);
  const { data: links = [] } = useParentChildLinks(branchId);
  const { data: remarks = [] } = useRemarks(branchId);

  const [step, setStep] = useState(0);
  const [rootPersonId, setRootPersonId] = useState<string | null>(null);

  useEffect(() => {
    // One-time hydration of wizard progress persisted from a previous visit.
    const storedStep = Number(localStorage.getItem(stepStorageKey));
    if (!Number.isNaN(storedStep) && storedStep >= 0 && storedStep < STEPS.length) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setStep(storedStep);
    }
    const storedRoot = localStorage.getItem(rootStorageKey);
    if (storedRoot) {
      setRootPersonId(storedRoot);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    localStorage.setItem(stepStorageKey, String(step));
  }, [step, stepStorageKey]);

  const effectiveRootId =
    rootPersonId && persons.some((p) => p.id === rootPersonId)
      ? rootPersonId
      : ([...persons].sort((a, b) => a.created_at.localeCompare(b.created_at))[0]?.id ?? null);

  const rootPerson = persons.find((p) => p.id === effectiveRootId) ?? null;

  const goToStep = (index: number) => setStep(index);
  const next = () => setStep((s) => Math.min(s + 1, STEPS.length - 1));

  const setRoot = (id: string) => {
    localStorage.setItem(rootStorageKey, id);
    setRootPersonId(id);
  };

  const spouseIds = useMemo(() => {
    if (!effectiveRootId) return new Set<string>();
    const ids = new Set<string>();
    for (const u of unions) {
      if (u.partner_1_id === effectiveRootId) ids.add(u.partner_2_id);
      if (u.partner_2_id === effectiveRootId) ids.add(u.partner_1_id);
    }
    return ids;
  }, [unions, effectiveRootId]);

  const spouses = useMemo(
    () =>
      unions
        .filter((u) => u.partner_1_id === effectiveRootId || u.partner_2_id === effectiveRootId)
        .map((u) => {
          const spouseId = u.partner_1_id === effectiveRootId ? u.partner_2_id : u.partner_1_id;
          const person = persons.find((p) => p.id === spouseId);
          return person ? { person, union: u } : null;
        })
        .filter((v): v is { person: (typeof persons)[number]; union: (typeof unions)[number] } => v !== null),
    [unions, persons, effectiveRootId]
  );

  const enfantsIds = useMemo(() => {
    const parentPool = new Set<string>([...(effectiveRootId ? [effectiveRootId] : []), ...spouseIds]);
    const ids = new Set<string>();
    for (const l of links) {
      if (parentPool.has(l.parent_id)) ids.add(l.child_id);
    }
    return ids;
  }, [links, spouseIds, effectiveRootId]);

  const petitsEnfantsIds = useMemo(() => {
    const ids = new Set<string>();
    for (const l of links) {
      if (enfantsIds.has(l.parent_id)) ids.add(l.child_id);
    }
    return ids;
  }, [links, enfantsIds]);

  const buildAddedItems = (ids: Set<string>) =>
    Array.from(ids)
      .map((id) => persons.find((p) => p.id === id))
      .filter((p): p is (typeof persons)[number] => Boolean(p))
      .map((person) => ({
        person,
        parentNames: links
          .filter((l) => l.child_id === person.id)
          .map((l) => personName(persons, l.parent_id))
          .filter(Boolean),
      }));

  const completed = [
    Boolean(currentBranch.collector_name),
    persons.length > 0,
    spouses.length > 0,
    enfantsIds.size > 0,
    petitsEnfantsIds.size > 0,
    remarks.length > 0,
    currentBranch.status === "submitted",
  ];

  const progressValue = Math.round(((step + 1) / STEPS.length) * 100);

  return (
    <div className="mx-auto flex min-h-screen max-w-2xl flex-col gap-5 px-4 py-6 sm:py-10">
      <header className="flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <TreeDeciduous className="size-5 text-primary" />
          <div>
            <h1 className="text-lg font-semibold tracking-tight">{currentBranch.branch_name}</h1>
            <p className="text-xs text-muted-foreground">Collecte des données généalogiques</p>
          </div>
        </div>
        <Progress value={progressValue} className="h-1.5" />
        <Stepper steps={STEPS} current={step} completed={completed} onSelect={goToStep} />
      </header>

      <section className="flex flex-col gap-3">
        <div>
          <h2 className="text-base font-semibold">{STEPS[step].label}</h2>
          <p className="text-sm text-muted-foreground">{STEP_DESCRIPTIONS[step]}</p>
        </div>

        {step === 0 && <StepIdentification branch={currentBranch} onDone={next} />}

        {step === 1 && (
          <StepChefDeFamille
            branchId={branchId}
            rootPerson={rootPerson}
            onCreated={(person) => {
              setRoot(person.id);
              next();
            }}
          />
        )}

        {step === 2 &&
          (rootPerson ? (
            <StepConjoints
              branchId={branchId}
              rootPerson={rootPerson}
              spouses={spouses}
              onAdded={() => {}}
            />
          ) : (
            <MissingRootNotice onBack={() => goToStep(1)} />
          ))}

        {step === 3 &&
          (rootPerson ? (
            <StepAddDescendant
              branchId={branchId}
              allPersons={persons}
              parentCandidates={[rootPerson, ...spouses.map((s) => s.person)]}
              addedItems={buildAddedItems(enfantsIds)}
              emptyLabel="Aucun enfant ajouté pour le moment."
              onAdded={() => {}}
            />
          ) : (
            <MissingRootNotice onBack={() => goToStep(1)} />
          ))}

        {step === 4 &&
          (rootPerson ? (
            <StepAddDescendant
              branchId={branchId}
              allPersons={persons}
              parentCandidates={persons}
              addedItems={buildAddedItems(petitsEnfantsIds)}
              emptyLabel="Aucun petit-enfant ajouté pour le moment. Vous pouvez choisir n'importe quelle personne déjà saisie comme parent, ou en ajouter une nouvelle (par ex. le/la conjoint(e) d'un enfant)."
              onAdded={() => {}}
            />
          ) : (
            <MissingRootNotice onBack={() => goToStep(1)} />
          ))}

        {step === 5 && <StepRemarques branchId={branchId} persons={persons} remarks={remarks} />}

        {step === 6 && (
          <StepRecapitulatif
            branch={currentBranch}
            persons={persons}
            unions={unions}
            links={links}
            rootPersonId={effectiveRootId}
          />
        )}
      </section>

      {step < STEPS.length - 1 && step !== 0 && step !== 1 && (
        <div className="flex justify-end">
          <button
            type="button"
            onClick={next}
            className="text-sm font-medium text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
          >
            Étape suivante →
          </button>
        </div>
      )}
    </div>
  );
}

const STEP_DESCRIPTIONS = [
  "Vos coordonnées, pour que l'administrateur puisse vous recontacter si besoin.",
  "Renseignez les informations du chef de famille de cette branche.",
  "Épouse(s) / époux ou conjoint(e)s du chef de famille.",
  "Les enfants du chef de famille et de ses conjoint(e)s.",
  "Les enfants de vos enfants.",
  "Personnes oubliées, informations incertaines ou à vérifier.",
  "Vérifiez l'ensemble avant de soumettre votre branche.",
];

function MissingRootNotice({ onBack }: { onBack: () => void }) {
  return (
    <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-4 text-sm">
      <p className="mb-2">Ajoutez d&apos;abord le chef de famille à l&apos;étape précédente.</p>
      <button type="button" onClick={onBack} className="font-medium underline underline-offset-4">
        Retourner à l&apos;étape « Chef de famille »
      </button>
    </div>
  );
}
