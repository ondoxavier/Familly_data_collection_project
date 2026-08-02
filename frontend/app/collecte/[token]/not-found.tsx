import Link from "next/link";
import { TreeDeciduous } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function CollecteNotFound() {
  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center gap-4 px-4 text-center">
      <TreeDeciduous className="size-10 text-muted-foreground" />
      <h1 className="text-xl font-semibold">Lien de collecte introuvable</h1>
      <p className="text-sm text-muted-foreground">
        Ce lien n&apos;est plus valide ou a été mal copié. Contactez la personne qui vous l&apos;a
        envoyé pour obtenir un nouveau lien.
      </p>
      <Button variant="outline" render={<Link href="/" />}>
        Retour à l&apos;accueil
      </Button>
    </div>
  );
}
