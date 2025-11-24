import { Button } from "@/components/ui/button"
import { Shield, Lock, FileText } from "lucide-react"

export function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-border bg-background py-20 md:py-28 lg:py-32">
      <div className="container relative px-4 md:px-6">
        <div className="mx-auto max-w-4xl text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-muted px-4 py-1.5 text-sm text-muted-foreground">
            <Lock className="h-3.5 w-3.5" />
            <span>Chiffrement de bout en bout</span>
          </div>

          <h1 className="mb-6 text-balance text-4xl font-bold tracking-tight text-foreground md:text-5xl lg:text-6xl">
            Votre santé entre vos mains, en toute sécurité
          </h1>

          <p className="mb-8 text-pretty text-lg text-muted-foreground md:text-xl">
            Aegis vous permet de stocker et gérer votre dossier médical complet : examens, ordonnances, radios,
            allergies. Entièrement chiffré côté client pour une confidentialité maximale.
          </p>

          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button size="lg" className="w-full sm:w-auto">
              Créer mon dossier gratuit
            </Button>
            <Button size="lg" variant="outline" className="w-full sm:w-auto bg-transparent">
              En savoir plus
            </Button>
          </div>

          <div className="mt-12 grid grid-cols-3 gap-4 md:gap-8">
            <div className="flex flex-col items-center gap-2">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <p className="text-sm font-medium text-foreground">100% Sécurisé</p>
            </div>
            <div className="flex flex-col items-center gap-2">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-secondary/10">
                <Lock className="h-6 w-6 text-secondary" />
              </div>
              <p className="text-sm font-medium text-foreground">Chiffré E2E</p>
            </div>
            <div className="flex flex-col items-center gap-2">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-accent/10">
                <FileText className="h-6 w-6 text-accent" />
              </div>
              <p className="text-sm font-medium text-foreground">Vos données</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
