"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createParentChildLink,
  createPerson,
  createRemark,
  createUnion,
  listParentChildLinks,
  listPersons,
  listRemarks,
  listUnions,
} from "@/lib/api";
import type {
  ParentChildCreateInput,
  PersonCreateInput,
  RemarkCreateInput,
  UnionCreateInput,
} from "@/lib/types";

export function usePersons(branchId: string) {
  return useQuery({
    queryKey: ["persons", branchId],
    queryFn: () => listPersons(branchId),
    enabled: Boolean(branchId),
  });
}

export function useCreatePerson(branchId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: PersonCreateInput) => createPerson(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["persons", branchId] });
    },
  });
}

export function useUnions(branchId: string) {
  return useQuery({
    queryKey: ["unions", branchId],
    queryFn: () => listUnions(branchId),
    enabled: Boolean(branchId),
  });
}

export function useCreateUnion(branchId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: UnionCreateInput) => createUnion(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["unions", branchId] });
    },
  });
}

export function useParentChildLinks(branchId: string) {
  return useQuery({
    queryKey: ["parent-child", branchId],
    queryFn: () => listParentChildLinks(branchId),
    enabled: Boolean(branchId),
  });
}

export function useCreateParentChildLink(branchId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: ParentChildCreateInput) => createParentChildLink(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["parent-child", branchId] });
    },
  });
}

export function useRemarks(branchId: string) {
  return useQuery({
    queryKey: ["remarks", branchId],
    queryFn: () => listRemarks(branchId),
    enabled: Boolean(branchId),
  });
}

export function useCreateRemark(branchId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: RemarkCreateInput) => createRemark(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["remarks", branchId] });
    },
  });
}
