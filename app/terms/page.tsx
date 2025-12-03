import React from "react"
import { Link } from "react-router-dom"
import { Shield, Lock, ArrowLeft, FileText } from "lucide-react"

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50">
      {/* Header with logo and back button */}
      <div className="border-b border-slate-200/50 backdrop-blur-sm bg-white/50 sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <div className="relative">
              <Shield className="w-8 h-8 text-blue-600" strokeWidth={2.5} />
              <Lock className="w-4 h-4 text-cyan-500 absolute -bottom-1 -right-1" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
              Aegis
            </span>
          </Link>
          <Link
            to="/"
            className="flex items-center gap-2 px-4 py-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour
          </Link>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Title */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <FileText className="w-8 h-8 text-blue-600" />
            <h1 className="text-4xl font-bold text-slate-900">Conditions d'utilisation</h1>
          </div>
          <p className="text-slate-600 text-lg">Veuillez lire attentivement ces conditions avant d'utiliser notre service</p>
        </div>

        {/* Content sections */}
        <div className="bg-white rounded-2xl shadow-lg p-8 space-y-8 border border-slate-200/50">
          {/* Section 1 */}
          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-slate-900">1. Acceptation des conditions</h2>
            <p className="text-slate-700 leading-relaxed">
              En accédant et en utilisant Aegis, vous acceptez d'être lié par ces conditions d'utilisation. Si vous n'êtes
              pas d'accord avec une quelconque partie de ces conditions, veuillez cesser d'utiliser le service immédiatement.
            </p>
          </section>

          {/* Section 2 */}
          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-slate-900">2. Utilisation du service</h2>
            <div className="space-y-3 text-slate-700">
              <p className="leading-relaxed">Vous vous engagez à utiliser Aegis uniquement à des fins légales et de manière compatible avec ces conditions.</p>
              <p className="leading-relaxed">Vous ne pouvez pas :</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Utiliser le service de manière abusive ou frauduleuse</li>
                <li>Tenter d'accéder à des zones non autorisées du service</li>
                <li>Partager vos identifiants avec d'autres personnes</li>
                <li>Télécharger ou distribuer des contenus malveillants</li>
                <li>Violer la propriété intellectuelle d'autrui</li>
              </ul>
            </div>
          </section>

          {/* Section 3 */}
          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-slate-900">3. Compte utilisateur</h2>
            <p className="text-slate-700 leading-relaxed">
              Vous êtes responsable de maintenir la confidentialité de vos identifiants de compte et du mot de passe. Vous
              êtes entièrement responsable de toutes les activités qui se produisent sous votre compte. Vous vous engagez à
              notifier immédiatement Aegis de tout accès non autorisé à votre compte.
            </p>
          </section>

          {/* Section 4 */}
          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-slate-900">4. Propriété intellectuelle</h2>
            <p className="text-slate-700 leading-relaxed">
              Le service Aegis et tout son contenu (y compris les textes, graphiques, logos, images et logiciels) sont la
              propriété d'AegisTechCorp ou de ses fournisseurs de contenu et sont protégés par les lois internationales sur
              les droits d'auteur.
            </p>
          </section>

          {/* Section 5 */}
          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-slate-900">5. Limitation de responsabilité</h2>
            <p className="text-slate-700 leading-relaxed">
              Aegis est fourni "tel quel" sans garantie d'aucune sorte. En aucun cas AegisTechCorp ne sera responsable des
              dommages directs, indirects, accidentels, spéciaux ou consécutifs résultant de votre utilisation ou de
              l'impossibilité d'utiliser le service.
            </p>
          </section>

          {/* Section 6 */}
          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-slate-900">6. Modifications des conditions</h2>
            <p className="text-slate-700 leading-relaxed">
              AegisTechCorp se réserve le droit de modifier ces conditions à tout moment. Les modifications entreront en
              vigueur dès leur publication. Votre utilisation continue du service constitue votre acceptation des conditions
              modifiées.
            </p>
          </section>

          {/* Section 7 */}
          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-slate-900">7. Résiliation</h2>
            <p className="text-slate-700 leading-relaxed">
              AegisTechCorp peut résilier votre compte à tout moment et pour quelque raison que ce soit, sans préavis. Vous
              pouvez également résilier votre compte en contactant notre support client.
            </p>
          </section>

          {/* Section 8 */}
          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-slate-900">8. Droit applicable</h2>
            <p className="text-slate-700 leading-relaxed">
              Ces conditions sont régies par les lois en vigueur. Tout litige découlant de ces conditions sera soumis à la
              juridiction exclusive des tribunaux compétents.
            </p>
          </section>

          {/* Section 9 */}
          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-slate-900">9. Contact</h2>
            <p className="text-slate-700 leading-relaxed">
              Si vous avez des questions concernant ces conditions d'utilisation, veuillez nous contacter à l'adresse suivante :
            </p>
            <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 mt-4">
              <p className="font-semibold text-slate-900">AegisTechCorp</p>
              <p className="text-slate-600">Email: contact@aegistechcorp.com</p>
              <p className="text-slate-600">Support: support@aegistechcorp.com</p>
            </div>
          </section>
        </div>

        {/* Last updated */}
        <div className="mt-8 text-center text-slate-600 text-sm">
          <p>Dernière mise à jour : {new Date().toLocaleDateString("fr-FR")}</p>
        </div>

        {/* Link to privacy policy */}
        <div className="mt-8 text-center">
          <p className="text-slate-600 mb-4">
            Consultez aussi notre <Link to="/privacy" className="text-blue-600 font-semibold hover:text-blue-700">
              politique de confidentialité
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
