import { FileText, ImageIcon, Pill, AlertCircle, Calendar, Download } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

const features = [
  {
    icon: FileText,
    title: "Examens médicaux",
    description: "Stockez tous vos résultats d'examens et analyses médicales en un seul endroit",
  },
  {
    icon: Pill,
    title: "Ordonnances",
    description: "Gardez une trace de vos prescriptions et traitements en cours",
  },
  {
    icon: ImageIcon,
    title: "Imagerie médicale",
    description: "Radiographies, IRM, scanners : toute votre imagerie accessible instantanément",
  },
  {
    icon: AlertCircle,
    title: "Allergies & Intolérances",
    description: "Référencez vos allergies pour un suivi médical optimal",
  },
  {
    icon: Calendar,
    title: "Historique complet",
    description: "Consultez votre historique médical sur plusieurs années",
  },
  {
    icon: Download,
    title: "Export sécurisé",
    description: "Exportez vos données quand vous en avez besoin, en toute sécurité",
  },
]

export function Features() {
  return (
    <section id="features" className="border-b border-border bg-background py-20 md:py-24">
      <div className="container px-4 md:px-6">
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <h2 className="mb-4 text-balance text-3xl font-bold tracking-tight text-foreground md:text-4xl">
            Tout votre dossier médical centralisé
          </h2>
          <p className="text-pretty text-lg text-muted-foreground">
            Gérez l'ensemble de vos informations de santé depuis une interface simple et intuitive
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => (
            <Card key={index} className="border-border bg-card transition-colors hover:bg-accent/5">
              <CardContent className="p-6">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="mb-2 text-lg font-semibold text-card-foreground">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
