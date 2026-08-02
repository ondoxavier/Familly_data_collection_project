"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createBranch,
  getBranch,
  listBranches,
  submitBranch,
  updateBranch,
} from "@/lib/api";
import type { BranchCreateInput, BranchUpdateInput } from "@/lib/types";

export function useBranches() {
  return useQuery({ queryKey: ["branches"], queryFn: listBranches });
}

export function useBranch(branchId: string) {
  return useQuery({
    queryKey: ["branch", branchId],
    queryFn: () => getBranch(branchId),
    enabled: Boolean(branchId),
  });
}

export function useCreateBranch() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: BranchCreateInput) => createBranch(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["branches"] });
    },
  });
}

export function useUpdateBranch(branchId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: BranchUpdateInput) => updateBranch(branchId, payload),
    onSuccess: (branch) => {
      queryClient.setQueryData(["branch", branchId], branch);
      queryClient.invalidateQueries({ queryKey: ["branches"] });
    },
  });
}

export function useSubmitBranch(branchId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => submitBranch(branchId),
    onSuccess: (branch) => {
      queryClient.setQueryData(["branch", branchId], branch);
      queryClient.invalidateQueries({ queryKey: ["branches"] });
    },
  });
}
