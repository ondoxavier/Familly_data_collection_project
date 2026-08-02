"use client";

import { BranchList } from "@/components/admin/branch-list";
import { CreateBranchDialog } from "@/components/admin/create-branch-dialog";
import { StatsCards } from "@/components/admin/stats-cards";

export default function AdminDashboardPage() {
  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Branches familiales</h1>
          <p className="text-sm text-muted-foreground">
            Créez une branche par chef de famille et envoyez-lui son lien de collecte.
          </p>
        </div>
        <CreateBranchDialog />
      </div>

      <StatsCards />

      <BranchList />
    </div>
  );
}
