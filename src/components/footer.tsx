import { Shield } from "lucide-react"

export function Footer() {
  return (
    <footer className="border-t border-border bg-background py-12 md:py-16">
      <div className="container px-4 md:px-6">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          <div className="lg:col-span-2">
            <div className="mb-4 flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
                <Shield className="h-6 w-6 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold text-foreground">Aegis</span>
            </div>
            <p className="mb-4 max-w-md text-sm text-muted-foreground">
              La solution de gestion de dossier médical la plus sécurisée. Vos données de santé protégées par un
              chiffrement de bout en bout.
            </p>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-semibold text-foreground">Produit</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <a href="#" className="transition-colors hover:text-foreground">
                  Fonctionnalités
                </a>
              </li>
              <li>
                <a href="#" className="transition-colors hover:text-foreground">
                  Sécurité
                </a>
              </li>
              <li>
                <a href="#" className="transition-colors hover:text-foreground">
                  Tarifs
                </a>
              </li>
              <li>
                <a href="#" className="transition-colors hover:text-foreground">
                  FAQ
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-semibold text-foreground">Légal</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <a href="#" className="transition-colors hover:text-foreground">
                  Confidentialité
                </a>
              </li>
              <li>
                <a href="#" className="transition-colors hover:text-foreground">
                  CGU
                </a>
              </li>
              <li>
                <a href="#" className="transition-colors hover:text-foreground">
                  Mentions légales
                </a>
              </li>
              <li>
                <a href="#" className="transition-colors hover:text-foreground">
                  Contact
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-border pt-8 text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} Aegis. Tous droits réservés. Hébergeur certifié HDS.</p>
        </div>
      </div>
    </footer>
  )
}
