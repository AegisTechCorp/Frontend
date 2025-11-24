import { UserPlus, Upload, Shield, Smartphone } from "lucide-react"

const steps = [
  {
    icon: UserPlus,
    title: "Créez votre compte",
    description: "Inscrivez-vous en quelques secondes avec votre email",
    step: "01",
  },
  {
    icon: Upload,
    title: "Importez vos documents",
    description: "Ajoutez vos examens, ordonnances et radiographies",
    step: "02",
  },
  {
    icon: Shield,
    title: "Chiffrement automatique",
    description: "Vos données sont automatiquement chiffrées côté client",
    step: "03",
  },
  {
    icon: Smartphone,
    title: "Accédez partout",
    description: "Consultez votre dossier depuis n'importe quel appareil",
    step: "04",
  },
]

export function HowItWorks() {
  return (
    <section id="how-it-works" className="border-b border-border bg-background py-20 md:py-24">
      <div className="container px-4 md:px-6">
        <div className="mx-auto mb-16 max-w-2xl text-center">
          <h2 className="mb-4 text-balance text-3xl font-bold tracking-tight text-foreground md:text-4xl">
            Comment ça marche ?
          </h2>
          <p className="text-pretty text-lg text-muted-foreground">Commencez à utiliser Aegis en 4 étapes simples</p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, index) => (
            <div key={index} className="relative">
              <div className="mb-6 flex items-start gap-4">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-primary/10">
                  <step.icon className="h-8 w-8 text-primary" />
                </div>
                <div className="text-6xl font-bold text-muted/20">{step.step}</div>
              </div>
              <h3 className="mb-2 text-xl font-semibold text-foreground">{step.title}</h3>
              <p className="text-muted-foreground">{step.description}</p>
              {index < steps.length - 1 && (
                <div className="absolute right-0 top-8 hidden h-0.5 w-full bg-gradient-to-r from-primary/50 to-transparent lg:block" />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
