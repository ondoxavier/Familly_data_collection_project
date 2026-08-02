"use client";

import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import {
  ArrowLeft,
  Check,
  Copy,
  Download,
  MessageCircle,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StatusBadge } from "@/components/admin/status-badge";
import { useBranch } from "@/lib/hooks/use-branches";
import {
  useParentChildLinks,
  usePersons,
  useRemarks,
  useUnions,
} from "@/lib/hooks/use-family-data";
import { getExportUrl } from "@/lib/api";
import { buildWhatsAppShareUrl } from "@/lib/whatsapp";
import type { Person } from "@/lib/types";

function personName(persons: Person[] | undefined, id: string) {
  const person = persons?.find((p) => p.id === id);
  return person ? `${person.first_name} ${person.last_name ?? ""}`.trim() : id.slice(0, 8);
}

export function BranchDetail({ branchId }: { branchId: string }) {
  const { data: branch, isLoading, isError } = useBranch(branchId);
  const { data: persons } = usePersons(branchId);
  const { data: unions } = useUnions(branchId);
  const { data: links } = useParentChildLinks(branchId);
  const { data: remarks } = useRemarks(branchId);
  const [copied, setCopied] = useState(false);

  if (isLoading) {
    return (
      <div className="mx-auto flex max-w-5xl flex-col gap-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  if (isError || !branch) {
    return (
      <div className="mx-auto flex max-w-5xl flex-col items-center gap-3 py-16 text-center">
        <p className="font-medium">Branche introuvable</p>
        <Button render={<Link href="/admin" />}>Retour au tableau de bord</Button>
      </div>
    );
  }

  const link =
    typeof window !== "undefined" ? `${window.location.origin}/collecte/${branch.access_token}` : "";

  const copyLink = async () => {
    await navigator.clipboard.writeText(link);
    setCopied(true);
    toast.success("Lien copié");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6">
      <div>
        <Button variant="ghost" size="sm" render={<Link href="/admin" />} className="-ml-2 mb-2">
          <ArrowLeft />
          Toutes les branches
        </Button>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-semibold tracking-tight">{branch.branch_name}</h1>
              <StatusBadge status={branch.status} />
            </div>
            <p className="text-sm text-muted-foreground">
              Collecteur : {branch.collector_name || "non renseigné"}
              {branch.collector_phone ? ` · ${branch.collector_phone}` : ""}
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={copyLink}>
              {copied ? <Check className="text-primary" /> : <Copy />}
              Copier le lien
            </Button>
            <Button
              variant="outline"
              size="sm"
              render={<a href={buildWhatsAppShareUrl(link)} target="_blank" rel="noreferrer" />}
            >
              <MessageCircle />
              WhatsApp
            </Button>
            <Button
              size="sm"
              render={<a href={getExportUrl(branchId)} target="_blank" rel="noreferrer" />}
            >
              <Download />
              Exporter
            </Button>
          </div>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <SummaryCard label="Personnes" value={persons?.length ?? 0} />
        <SummaryCard label="Unions" value={unions?.length ?? 0} />
        <SummaryCard label="Remarques" value={remarks?.length ?? 0} />
      </div>

      <Tabs defaultValue="persons">
        <TabsList>
          <TabsTrigger value="persons">Personnes</TabsTrigger>
          <TabsTrigger value="unions">Unions</TabsTrigger>
          <TabsTrigger value="links">Liens parent-enfant</TabsTrigger>
          <TabsTrigger value="remarks">Remarques</TabsTrigger>
        </TabsList>

        <TabsContent value="persons" className="mt-3">
          {!persons || persons.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="overflow-x-auto rounded-xl border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nom</TableHead>
                    <TableHead>Sexe</TableHead>
                    <TableHead>Naissance</TableHead>
                    <TableHead>Lieu</TableHead>
                    <TableHead>Statut</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {persons.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell className="font-medium">
                        {p.first_name} {p.last_name}
                      </TableCell>
                      <TableCell>{p.gender ?? "—"}</TableCell>
                      <TableCell>{p.birth_date_text || "—"}</TableCell>
                      <TableCell>{p.birth_place || "—"}</TableCell>
                      <TableCell>
                        {p.is_alive === null ? "—" : p.is_alive ? "Vivant" : "Décédé"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </TabsContent>

        <TabsContent value="unions" className="mt-3">
          {!unions || unions.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="overflow-x-auto rounded-xl border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Partenaire 1</TableHead>
                    <TableHead>Partenaire 2</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {unions.map((u) => (
                    <TableRow key={u.id}>
                      <TableCell>{personName(persons, u.partner_1_id)}</TableCell>
                      <TableCell>{personName(persons, u.partner_2_id)}</TableCell>
                      <TableCell>{u.union_type || "—"}</TableCell>
                      <TableCell>{u.start_date_text || "—"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </TabsContent>

        <TabsContent value="links" className="mt-3">
          {!links || links.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="overflow-x-auto rounded-xl border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Parent</TableHead>
                    <TableHead>Enfant</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Certitude</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {links.map((l) => (
                    <TableRow key={l.id}>
                      <TableCell>{personName(persons, l.parent_id)}</TableCell>
                      <TableCell>{personName(persons, l.child_id)}</TableCell>
                      <TableCell>{l.link_type}</TableCell>
                      <TableCell>{l.certainty}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </TabsContent>

        <TabsContent value="remarks" className="mt-3">
          {!remarks || remarks.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="flex flex-col gap-2">
              {remarks.map((r) => (
                <Card key={r.id}>
                  <CardContent className="flex items-start justify-between gap-3 text-sm">
                    <p>{r.content}</p>
                    <span className="shrink-0 text-xs text-muted-foreground">
                      {r.person_id ? personName(persons, r.person_id) : "Général"}
                    </span>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function SummaryCard({ label, value }: { label: string; value: number }) {
  return (
    <Card>
      <CardContent className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">{label}</span>
        <span className="text-xl font-semibold tabular-nums">{value}</span>
      </CardContent>
    </Card>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed p-10 text-center text-muted-foreground">
      <Users className="size-6" />
      <p className="text-sm">Aucune donnée pour le moment.</p>
    </div>
  );
}
