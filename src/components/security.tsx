import { Shield, Lock, Eye, Server } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

const securityFeatures = [
  {
    icon: Lock,
    title: "Chiffrement E2E",
    description:
      "Vos données sont chiffrées côté client avant même d'être envoyées. Personne, pas même nous, ne peut y accéder.",
  },
  {
    icon: Shield,
    title: "Conformité RGPD",
    description:
      "Conforme aux réglementations européennes les plus strictes en matière de protection des données de santé.",
  },
  {
    icon: Eye,
    title: "Zéro-Knowledge",
    description: "Architecture zero-knowledge : nous ne connaissons pas vos données et ne pouvons pas les lire.",
  },
  {
    icon: Server,
    title: "Infrastructure sécurisée",
    description: "Hébergement certifié HDS (Hébergeur de Données de Santé) en France.",
  },
]

export function Security() {
  return (
    <section id="security" className="border-b border-border bg-muted/30 py-20 md:py-24">
      <div className="container px-4 md:px-6">
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-border bg-background px-4 py-1.5 text-sm text-muted-foreground">
            <Shield className="h-3.5 w-3.5" />
            <span>Sécurité maximale</span>
          </div>
          <h2 className="mb-4 text-balance text-3xl font-bold tracking-tight text-foreground md:text-4xl">
            Votre confidentialité est notre priorité
          </h2>
          <p className="text-pretty text-lg text-muted-foreground">
            Nous utilisons les technologies de chiffrement les plus avancées pour protéger vos données médicales
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {securityFeatures.map((feature, index) => (
            <Card key={index} className="border-border bg-card">
              <CardContent className="p-6">
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10">
                  <feature.icon className="h-7 w-7 text-primary" />
                </div>
                <h3 className="mb-3 text-xl font-semibold text-card-foreground">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
