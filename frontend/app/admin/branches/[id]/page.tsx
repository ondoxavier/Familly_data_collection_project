import { BranchDetail } from "@/components/admin/branch-detail";

export default async function BranchDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <BranchDetail branchId={id} />;
}
