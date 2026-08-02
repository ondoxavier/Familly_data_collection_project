export type Gender = "M" | "F" | "unknown";

export type BranchStatus = "draft" | "submitted";

export interface Branch {
  id: string;
  branch_name: string;
  root_person_name: string | null;
  collector_name: string | null;
  collector_phone: string | null;
  collector_email: string | null;
  access_token: string;
  status: BranchStatus | string;
  created_at: string;
}

export interface BranchCreateInput {
  branch_name: string;
  root_person_name?: string | null;
  collector_name?: string | null;
  collector_phone?: string | null;
  collector_email?: string | null;
}

export interface BranchUpdateInput {
  branch_name?: string;
  root_person_name?: string | null;
  collector_name?: string | null;
  collector_phone?: string | null;
  collector_email?: string | null;
}

export interface Person {
  id: string;
  branch_id: string;
  first_name: string;
  last_name: string | null;
  gender: Gender | null;
  birth_date: string | null;
  birth_date_text: string | null;
  birth_place: string | null;
  is_alive: boolean | null;
  death_date: string | null;
  death_date_text: string | null;
  notes: string | null;
  created_at: string;
}

export interface PersonCreateInput {
  branch_id: string;
  first_name: string;
  last_name?: string | null;
  gender?: Gender | null;
  birth_date_text?: string | null;
  birth_place?: string | null;
  is_alive?: boolean | null;
  death_date_text?: string | null;
  notes?: string | null;
}

export interface UnionRecord {
  id: string;
  branch_id: string;
  partner_1_id: string;
  partner_2_id: string;
  union_type: string | null;
  start_date_text: string | null;
  end_date_text: string | null;
  notes: string | null;
}

export interface UnionCreateInput {
  branch_id: string;
  partner_1_id: string;
  partner_2_id: string;
  union_type?: string | null;
  start_date_text?: string | null;
  end_date_text?: string | null;
  notes?: string | null;
}

export type LinkType = "biological" | "adoptive" | "recognized" | "unknown";
export type Certainty = "confirmed" | "uncertain" | "to_verify";

export interface ParentChildLink {
  id: string;
  branch_id: string;
  parent_id: string;
  child_id: string;
  link_type: LinkType | string;
  certainty: Certainty | string;
  notes: string | null;
}

export interface ParentChildCreateInput {
  branch_id: string;
  parent_id: string;
  child_id: string;
  link_type?: LinkType;
  certainty?: Certainty;
  notes?: string | null;
}

export type RemarkStatus = "to_verify" | "verified" | "resolved";

export interface Remark {
  id: string;
  branch_id: string;
  person_id: string | null;
  content: string;
  status: RemarkStatus | string;
  created_at: string;
}

export interface RemarkCreateInput {
  branch_id: string;
  person_id?: string | null;
  content: string;
  status?: RemarkStatus;
}
