import type {
  Branch,
  BranchCreateInput,
  BranchUpdateInput,
  ParentChildCreateInput,
  ParentChildLink,
  Person,
  PersonCreateInput,
  Remark,
  RemarkCreateInput,
  UnionCreateInput,
  UnionRecord,
} from "./types";

export function getApiUrl(): string {
  return process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000/api";
}

class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
    this.name = "ApiError";
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${getApiUrl()}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...init?.headers,
    },
    cache: "no-store",
  });

  if (!res.ok) {
    let detail = res.statusText;
    try {
      const body = await res.json();
      detail = body.detail ?? detail;
    } catch {
      // ignore body parsing errors
    }
    throw new ApiError(res.status, detail);
  }

  if (res.status === 204) {
    return undefined as T;
  }

  return res.json() as Promise<T>;
}

export { ApiError };

// Branches
export const createBranch = (payload: BranchCreateInput) =>
  request<Branch>("/branches", { method: "POST", body: JSON.stringify(payload) });

export const listBranches = () => request<Branch[]>("/branches");

export const getBranch = (branchId: string) => request<Branch>(`/branches/${branchId}`);

export const getBranchByToken = (accessToken: string) =>
  request<Branch>(`/branches/token/${accessToken}`);

export const updateBranch = (branchId: string, payload: BranchUpdateInput) =>
  request<Branch>(`/branches/${branchId}`, { method: "PATCH", body: JSON.stringify(payload) });

export const submitBranch = (branchId: string) =>
  request<Branch>(`/branches/${branchId}/submit`, { method: "PATCH" });

export const getExportUrl = (branchId: string) => `${getApiUrl()}/branches/${branchId}/export`;

// Persons
export const createPerson = (payload: PersonCreateInput) =>
  request<Person>("/persons", { method: "POST", body: JSON.stringify(payload) });

export const listPersons = (branchId: string) =>
  request<Person[]>(`/branches/${branchId}/persons`);

// Unions
export const createUnion = (payload: UnionCreateInput) =>
  request<UnionRecord>("/unions", { method: "POST", body: JSON.stringify(payload) });

export const listUnions = (branchId: string) =>
  request<UnionRecord[]>(`/branches/${branchId}/unions`);

// Parent-child links
export const createParentChildLink = (payload: ParentChildCreateInput) =>
  request<ParentChildLink>("/parent-child", { method: "POST", body: JSON.stringify(payload) });

export const listParentChildLinks = (branchId: string) =>
  request<ParentChildLink[]>(`/branches/${branchId}/parent-child`);

// Remarks
export const createRemark = (payload: RemarkCreateInput) =>
  request<Remark>("/remarks", { method: "POST", body: JSON.stringify(payload) });

export const listRemarks = (branchId: string) =>
  request<Remark[]>(`/branches/${branchId}/remarks`);
