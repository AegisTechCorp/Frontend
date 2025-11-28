import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { Shield, Lock, FileText, Stethoscope, Heart, Activity, ChevronRight, Check } from "lucide-react"

export default function AegisLanding() {
  const [_scrollY, setScrollY] = useState(0)

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY)
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const features = [
    {
      icon: FileText,
      title: "Dossier complet",
      description: "Tous vos documents médicaux en un seul endroit : examens, ordonnances, imageries",
    },
    {
      icon: Stethoscope,
      title: "Historique unifié",
      description: "Suivez l'évolution de votre santé avec une chronologie claire et détaillée",
    },
    {
      icon: Heart,
      title: "Alertes personnalisées",
      description: "Gestion des allergies, contre-indications et rappels de traitement",
    },
    {
      icon: Activity,
      title: "Toujours disponible",
      description: "Accédez à vos données 24/7, où que vous soyez, même hors ligne",
    },
  ]

  const securityFeatures = [
    "Chiffrement AES-256 côté client",
    "Zéro accès serveur à vos données",
    "Authentification multi-facteurs",
    "Conformité RGPD & HDS",
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50">
      {}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-200/50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Shield className="w-8 h-8 text-blue-600" strokeWidth={2.5} />
              <Lock className="w-4 h-4 text-cyan-500 absolute -bottom-1 -right-1" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent tracking-tight">
              Aegis
            </span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-slate-600 hover:text-blue-600 transition-colors font-medium">
              Fonctionnalités
            </a>
            <a href="#security" className="text-slate-600 hover:text-blue-600 transition-colors font-medium">
              Sécurité
            </a>
            <Link to="/login" className="text-slate-600 hover:text-blue-600 transition-colors font-medium">
              Connexion
            </Link>
            <Link to="/signup" className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-full font-semibold hover:shadow-lg hover:scale-105 transition-all">
              Commencer
            </Link>
          </div>
        </div>
      </nav>

      {}
      <section className="relative pt-32 pb-20 px-6 lg:px-8 overflow-hidden">
        <div className="absolute inset-0 opacity-30">
          <div
            className="absolute top-20 right-20 w-96 h-96 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl animate-pulse"
            style={{ animationDuration: "4s" }}
          />
          <div
            className="absolute bottom-20 left-20 w-96 h-96 bg-cyan-400 rounded-full mix-blend-multiply filter blur-3xl animate-pulse"
            style={{ animationDuration: "6s", animationDelay: "1s" }}
          />
        </div>

        <div className="max-w-7xl mx-auto relative">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8" style={{ animation: "fadeInUp 0.8s ease-out" }}>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100/60 backdrop-blur-sm rounded-full border border-blue-200/50">
                <Lock className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-semibold text-blue-700">Chiffrement de bout en bout</span>
              </div>

              <h1 className="text-5xl lg:text-6xl font-bold text-slate-900 leading-tight">
                Votre santé,{" "}
                <span className="bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                  sous contrôle
                </span>
              </h1>

              <p className="text-xl text-slate-600 leading-relaxed">
                Centralisez votre dossier médical en toute sécurité. Examens, ordonnances, imageries et allergies
                accessibles où que vous soyez, avec un chiffrement inviolable.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/signup" className="group px-8 py-4 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-2xl font-semibold text-lg hover:shadow-2xl hover:scale-105 transition-all flex items-center justify-center gap-2">
                  Créer mon dossier
                  <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                <button className="px-8 py-4 bg-white text-slate-700 rounded-2xl font-semibold text-lg hover:shadow-xl transition-all border-2 border-slate-200">
                  En savoir plus
                </button>
              </div>

              <div className="flex items-center gap-6 pt-4">
                <div className="flex -space-x-3">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-cyan-400 border-2 border-white"
                    />
                  ))}
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900">+50 000 utilisateurs</p>
                  <p className="text-sm text-slate-500">font confiance à Aegis</p>
                </div>
              </div>
            </div>

            {}
            <div className="relative" style={{ animation: "fadeInUp 0.8s ease-out 0.2s both" }}>
              <div className="relative bg-white rounded-3xl shadow-2xl p-8 border border-slate-200/50 backdrop-blur-xl">
                <div
                  className="absolute -top-4 -right-4 w-24 h-24 bg-gradient-to-br from-green-400 to-emerald-500 rounded-2xl flex items-center justify-center shadow-lg animate-bounce"
                  style={{ animationDuration: "3s" }}
                >
                  <Check className="w-12 h-12 text-white" strokeWidth={3} />
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between pb-4 border-b border-slate-200">
                    <h3 className="text-lg font-bold text-slate-900">Dossier médical</h3>
                    <Shield className="w-5 h-5 text-blue-600" />
                  </div>

                  {["Analyses sanguines", "IRM lombaire", "Ordonnance antibio.", "Allergies"].map((item, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
                      style={{ animation: `fadeInUp 0.5s ease-out ${0.4 + i * 0.1}s both` }}
                    >
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
                        <FileText className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-slate-900">{item}</p>
                        <p className="text-sm text-slate-500">Il y a {i + 2} jours</p>
                      </div>
                      <Lock className="w-4 h-4 text-green-500" />
                    </div>
                  ))}
                </div>
              </div>

              {}
              <div
                className="absolute -left-8 top-20 bg-white rounded-2xl shadow-xl p-4 border border-slate-200/50 backdrop-blur-xl animate-pulse"
                style={{ animationDuration: "3s" }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center">
                    <Lock className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-900">AES-256</p>
                    <p className="text-xs text-slate-500">Chiffré</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {}
      <section id="features" className="py-20 px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-slate-900 mb-4">Tout ce dont vous avez besoin</h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Une solution complète pour gérer votre santé au quotidien
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, i) => (
              <div
                key={i}
                className="group p-8 bg-gradient-to-br from-slate-50 to-blue-50 rounded-2xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-slate-200/50"
                style={{ animation: `fadeInUp 0.5s ease-out ${i * 0.1}s both` }}
              >
                <div className="w-14 h-14 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <feature.icon className="w-7 h-7 text-white" strokeWidth={2} />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">{feature.title}</h3>
                <p className="text-slate-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {}
      <section
        id="security"
        className="py-20 px-6 lg:px-8 bg-gradient-to-br from-slate-900 to-blue-900 text-white relative overflow-hidden"
      >
        <div className="absolute inset-0 opacity-10">
          <div
            className="absolute top-0 left-0 w-full h-full"
            style={{
              backgroundImage: "radial-gradient(circle at 2px 2px, white 1px, transparent 0)",
              backgroundSize: "40px 40px",
            }}
          />
        </div>

        <div className="max-w-7xl mx-auto relative">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full border border-white/20 mb-6">
                <Shield className="w-4 h-4" />
                <span className="text-sm font-semibold">Sécurité maximale</span>
              </div>

              <h2 className="text-4xl lg:text-5xl font-bold mb-6">
                Vos données,{" "}
                <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                  inviolables
                </span>
              </h2>

              <p className="text-xl text-slate-300 leading-relaxed mb-8">
                Le chiffrement de bout en bout garantit que seul vous pouvez accéder à vos informations médicales. Même
                nous ne pouvons pas les lire.
              </p>

              <div className="space-y-4">
                {securityFeatures.map((feature, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-4 p-4 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10"
                    style={{ animation: `fadeInUp 0.5s ease-out ${i * 0.1}s both` }}
                  >
                    <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-emerald-500 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Check className="w-5 h-5 text-white" strokeWidth={3} />
                    </div>
                    <span className="font-semibold">{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20">
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-slate-300">Processus de chiffrement</span>
                    <Lock className="w-5 h-5 text-cyan-400" />
                  </div>

                  {[
                    { step: "1", label: "Données locales", color: "from-blue-500 to-cyan-500" },
                    { step: "2", label: "Chiffrement AES-256", color: "from-cyan-500 to-green-500" },
                    { step: "3", label: "Transfert sécurisé", color: "from-green-500 to-emerald-500" },
                    { step: "4", label: "Stockage chiffré", color: "from-emerald-500 to-teal-500" },
                  ].map((item, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-4"
                      style={{ animation: `fadeInUp 0.5s ease-out ${0.2 + i * 0.1}s both` }}
                    >
                      <div
                        className={`w-12 h-12 bg-gradient-to-br ${item.color} rounded-xl flex items-center justify-center font-bold text-white text-lg`}
                      >
                        {item.step}
                      </div>
                      <div className="flex-1">
                        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                          <div
                            className={`h-full bg-gradient-to-r ${item.color} rounded-full`}
                            style={{
                              width: "100%",
                              animation: `slideIn 1s ease-out ${0.5 + i * 0.2}s both`,
                            }}
                          />
                        </div>
                      </div>
                      <span className="text-sm font-semibold text-slate-200 min-w-[140px]">{item.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {}
      <section className="py-20 px-6 lg:px-8 bg-gradient-to-br from-blue-600 to-cyan-600 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl lg:text-5xl font-bold mb-6">Prêt à reprendre le contrôle ?</h2>
          <p className="text-xl text-blue-100 mb-10 leading-relaxed">
            Rejoignez les milliers d'utilisateurs qui font confiance à Aegis pour protéger leurs données médicales.
          </p>
          <Link to="/signup" className="px-10 py-5 bg-white text-blue-600 rounded-2xl font-bold text-lg hover:shadow-2xl hover:scale-105 transition-all inline-flex items-center gap-3">
            Créer mon compte gratuitement
            <ChevronRight className="w-5 h-5" />
          </Link>
          <p className="text-sm text-blue-100 mt-6">Gratuit pendant 30 jours • Sans carte bancaire</p>
        </div>
      </section>

      {}
      <footer className="bg-slate-900 text-white py-12 px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-3">
              <Shield className="w-6 h-6 text-cyan-400" />
              <span className="text-xl font-bold">Aegis</span>
            </div>
            <div className="flex gap-8 text-sm text-slate-400">
              <a href="#" className="hover:text-white transition-colors">
                Mentions légales
              </a>
              <a href="#" className="hover:text-white transition-colors">
                Confidentialité
              </a>
              <a href="#" className="hover:text-white transition-colors">
                Conditions
              </a>
              <a href="#" className="hover:text-white transition-colors">
                Contact
              </a>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-slate-800 text-center text-sm text-slate-500">
            © 2024 Aegis. Tous droits réservés. Votre santé, notre priorité.
          </div>
        </div>
      </footer>

      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes slideIn {
          from {
            width: 0%;
          }
          to {
            width: 100%;
          }
        }
        
        * {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        }
      `}</style>
    </div>
  )
}
