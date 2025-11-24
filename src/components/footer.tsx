import React, { useState } from "react"
import { Link } from "react-router-dom"
import { Shield, Mail, Twitter, Github } from "lucide-react"

export default function Footer() {
  const year = new Date().getFullYear()
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<null | { type: "success" | "error"; text: string }>(null)

  const validateEmail = (value: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage(null)

    if (!validateEmail(email)) {
      setMessage({ type: "error", text: "Veuillez saisir une adresse email valide." })
      return
    }

    setLoading(true)
    try {
      // Try to POST to a backend endpoint. If you don't have one yet,
      // this will fail and we fall back to saving locally.
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })

      if (res.ok) {
        setMessage({ type: "success", text: "Merci ! Vous êtes inscrit(e) à la newsletter." })
        setEmail("")
      } else {
        // If backend returns non-OK, show message and fallback
        const text = await res.text().catch(() => "")
        setMessage({ type: "error", text: `Impossible d'envoyer le formulaire (${res.status}). ${text}` })
      }
    } catch (err) {
      // Network error or no backend: fallback to localStorage
      try {
        const saved = JSON.parse(localStorage.getItem("aegis_subscribers") || "[]")
        if (!saved.includes(email)) saved.push(email)
        localStorage.setItem("aegis_subscribers", JSON.stringify(saved))
        setMessage({ type: "success", text: "Inscription enregistrée localement (aucun backend)." })
        setEmail("")
      } catch (e) {
        setMessage({ type: "error", text: "Une erreur est survenue lors de l'enregistrement." })
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <footer className="bg-slate-900 text-slate-200 py-12 px-6 lg:px-8">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="md:col-span-1">
          <div className="flex items-center gap-3 mb-4">
            <div className="relative">
              <Shield className="w-8 h-8 text-cyan-400" />
            </div>
            <span className="text-2xl font-bold text-white">Aegis</span>
          </div>
          <p className="text-sm text-slate-400">
            Protégez et centralisez vos données médicales. Chiffrement de bout en bout,
            confidentialité et contrôle total.
          </p>
          <div className="mt-6 flex items-center gap-3">
            <a href="#" aria-label="Twitter" className="p-2 rounded-md bg-slate-800 hover:bg-slate-700 transition-colors">
              <Twitter className="w-5 h-5 text-cyan-400" />
            </a>
            <a href="#" aria-label="Github" className="p-2 rounded-md bg-slate-800 hover:bg-slate-700 transition-colors">
              <Github className="w-5 h-5 text-cyan-400" />
            </a>
          </div>
        </div>

        <div>
          <h4 className="text-sm font-semibold text-slate-200 mb-3">Produit</h4>
          <ul className="space-y-2 text-sm text-slate-400">
            <li><Link to="/dashboard" className="hover:text-white">Tableau de bord</Link></li>
            <li><Link to="/register" className="hover:text-white">Créer un compte</Link></li>
            <li><Link to="/login" className="hover:text-white">Se connecter</Link></li>
            <li><a href="#features" className="hover:text-white">Fonctionnalités</a></li>
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-semibold text-slate-200 mb-3">Ressources</h4>
          <ul className="space-y-2 text-sm text-slate-400">
            <li><a href="#security" className="hover:text-white">Sécurité</a></li>
            <li><a href="#" className="hover:text-white">Aide</a></li>
            <li><a href="#" className="hover:text-white">Blog</a></li>
            <li><a href="#" className="hover:text-white">Contact</a></li>
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-semibold text-slate-200 mb-3">Restez informé</h4>
          <p className="text-sm text-slate-400 mb-3">Recevez des mises à jour et des conseils de sécurité.</p>
          <form className="flex gap-2" onSubmit={submit}>
            <label className="sr-only" htmlFor="footer-newsletter">Email</label>
            <div className="relative flex-1">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                id="footer-newsletter"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="votre@email.fr"
                className="w-full pl-10 pr-3 py-2 rounded-md bg-slate-800 border border-slate-700 text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-cyan-400"
                required
              />
            </div>
            <button disabled={loading} className="px-4 py-2 bg-cyan-500 text-slate-900 font-semibold rounded-md hover:bg-cyan-400 transition-colors disabled:opacity-60">
              {loading ? "Envoi..." : "S'inscrire"}
            </button>
          </form>

          {message && (
            <div className={`mt-3 text-sm ${message.type === "success" ? "text-emerald-400" : "text-rose-400"}`}>
              {message.text}
            </div>
          )}

          <p className="text-xs text-slate-500 mt-3">© {year} Aegis. Tous droits réservés.</p>
        </div>
      </div>
    </footer>
  )
}

