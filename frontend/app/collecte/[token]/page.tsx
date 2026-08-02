import { notFound } from "next/navigation";
import { ApiError, getBranchByToken } from "@/lib/api";
import { CollecteWizard } from "@/components/collecte/collecte-wizard";

async function resolveBranch(token: string) {
  try {
    return await getBranchByToken(token);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      notFound();
    }
    throw error;
  }
}

export default async function CollectePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const branch = await resolveBranch(token);
  return <CollecteWizard branch={branch} />;
}
