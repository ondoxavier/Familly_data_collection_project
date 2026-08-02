"use client";

import Link from "next/link";
import { useState } from "react";
import { Check, Copy, MessageCircle, Users } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { StatusBadge } from "@/components/admin/status-badge";
import { useBranches } from "@/lib/hooks/use-branches";
import { buildWhatsAppShareUrl } from "@/lib/whatsapp";
import type { Branch } from "@/lib/types";

function branchLink(branch: Branch) {
  if (typeof window === "undefined") return "";
  return `${window.location.origin}/collecte/${branch.access_token}`;
}

export function BranchList() {
  const { data: branches, isLoading, isError } = useBranches();

  if (isLoading) {
    return (
      <div className="flex flex-col gap-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <p className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
        Impossible de charger les branches. Vérifiez que l&apos;API est démarrée.
      </p>
    );
  }

  if (!branches || branches.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed p-12 text-center">
        <Users className="size-8 text-muted-foreground" />
        <p className="font-medium">Aucune branche pour le moment</p>
        <p className="text-sm text-muted-foreground">
          Créez une branche pour générer un lien de collecte à envoyer à un chef de famille.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Branche</TableHead>
            <TableHead>Chef de famille</TableHead>
            <TableHead>Statut</TableHead>
            <TableHead>Créée le</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {branches.map((branch) => (
            <BranchRow key={branch.id} branch={branch} />
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

function BranchRow({ branch }: { branch: Branch }) {
  const [copied, setCopied] = useState(false);

  const copyLink = async () => {
    await navigator.clipboard.writeText(branchLink(branch));
    setCopied(true);
    toast.success("Lien copié");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <TableRow>
      <TableCell className="max-w-52">
        <Link href={`/admin/branches/${branch.id}`} className="font-medium hover:underline">
          {branch.branch_name}
        </Link>
        {branch.root_person_name && (
          <p className="text-xs text-muted-foreground">Racine : {branch.root_person_name}</p>
        )}
      </TableCell>
      <TableCell>
        <p>{branch.collector_name || "—"}</p>
        <p className="text-xs text-muted-foreground">{branch.collector_phone || ""}</p>
      </TableCell>
      <TableCell>
        <StatusBadge status={branch.status} />
      </TableCell>
      <TableCell className="text-sm text-muted-foreground">
        {new Date(branch.created_at).toLocaleDateString("fr-FR")}
      </TableCell>
      <TableCell>
        <div className="flex justify-end gap-1">
          <Button size="icon-sm" variant="ghost" onClick={copyLink} aria-label="Copier le lien">
            {copied ? <Check className="text-primary" /> : <Copy />}
          </Button>
          <Button
            size="icon-sm"
            variant="ghost"
            aria-label="Partager sur WhatsApp"
            render={
              <a href={buildWhatsAppShareUrl(branchLink(branch))} target="_blank" rel="noreferrer" />
            }
          >
            <MessageCircle />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
}
