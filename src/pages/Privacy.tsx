import React from "react"
import { Link } from "react-router-dom"
import { Shield, Lock, ArrowLeft, Lock as LockIcon } from "lucide-react"

export default function PrivacyPage() {
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
            <LockIcon className="w-8 h-8 text-blue-600" />
            <h1 className="text-4xl font-bold text-slate-900">Politique de confidentialité</h1>
          </div>
          <p className="text-slate-600 text-lg">Comment nous collectons, utilisons et protégeons vos données personnelles</p>
        </div>

        {/* Content sections */}
        <div className="bg-white rounded-2xl shadow-lg p-8 space-y-8 border border-slate-200/50">
          {/* Section 1 */}
          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-slate-900">1. Introduction</h2>
            <p className="text-slate-700 leading-relaxed">
              AegisTechCorp ("nous", "notre", "nos") s'engage à respecter votre vie privée. Cette politique de confidentialité
              explique comment nous collectons, utilisons, divulguons et conservons vos données personnelles.
            </p>
          </section>

          {/* Section 2 */}
          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-slate-900">2. Données que nous collectons</h2>
            <div className="space-y-3 text-slate-700">
              <p className="leading-relaxed">Nous collectons les types de données suivants :</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>
                  <strong>Données d'identification :</strong> Nom, prénom, adresse email, date de naissance
                </li>
                <li>
                  <strong>Données d'authentification :</strong> Mot de passe chiffré, tokens de session
                </li>
                <li>
                  <strong>Données de dossiers médicaux :</strong> Informations sensibles de santé (chiffrées de bout en bout)
                </li>
                <li>
                  <strong>Données de journal :</strong> Adresses IP, dates d'accès, navigateur utilisé
                </li>
                <li>
                  <strong>Données de cookies :</strong> Préférences de session et informations d'utilisation
                </li>
              </ul>
            </div>
          </section>

          {/* Section 3 */}
          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-slate-900">3. Comment nous utilisons vos données</h2>
            <div className="space-y-3 text-slate-700">
              <p className="leading-relaxed">Nous utilisons vos données pour :</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Créer et maintenir votre compte utilisateur</li>
                <li>Fournir et améliorer nos services</li>
                <li>Sécuriser votre compte et prévenir la fraude</li>
                <li>Vous envoyer des notifications et mises à jour importantes</li>
                <li>Répondre à vos demandes et questions</li>
                <li>Analyser l'utilisation du service pour l'amélioration</li>
              </ul>
            </div>
          </section>

          {/* Section 4 */}
          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-slate-900">4. Chiffrement et sécurité</h2>
            <p className="text-slate-700 leading-relaxed">
              Nous utilisons le chiffrement AES-256 pour protéger vos dossiers médicaux. Vos données sont chiffrées de bout en
              bout, ce qui signifie que seules vous et les personnes autorisées pouvez les déchiffrer. Nous utilisons également
              HTTPS pour tous les transferts de données et maintenons des mesures de sécurité strictes.
            </p>
          </section>

          {/* Section 5 */}
          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-slate-900">5. Partage de données</h2>
            <p className="text-slate-700 leading-relaxed">
              Nous ne partageons jamais vos données personnelles avec des tiers sans votre consentement explicite, sauf si
              requis par la loi. Nous pouvons partager des données agrégées et anonymisées à des fins de recherche et d'analyse.
            </p>
          </section>

          {/* Section 6 */}
          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-slate-900">6. Conservation des données</h2>
            <p className="text-slate-700 leading-relaxed">
              Nous conservons vos données personnelles aussi longtemps que votre compte est actif. Après suppression de votre
              compte, nous supprimons vos données dans un délai de 30 jours, sauf si nous sommes obligés de les conserver pour
              des raisons légales.
            </p>
          </section>

          {/* Section 7 */}
          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-slate-900">7. Vos droits</h2>
            <div className="space-y-3 text-slate-700">
              <p className="leading-relaxed">Vous avez les droits suivants concernant vos données personnelles :</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Droit d'accès : Demander une copie de vos données</li>
                <li>Droit de rectification : Corriger vos données incorrectes</li>
                <li>Droit à l'oubli : Demander la suppression de vos données</li>
                <li>Droit à la portabilité : Recevoir vos données dans un format exploitable</li>
                <li>Droit de limitation : Demander la limitation du traitement</li>
              </ul>
            </div>
          </section>

          {/* Section 8 */}
          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-slate-900">8. Cookies</h2>
            <p className="text-slate-700 leading-relaxed">
              Nous utilisons des cookies pour améliorer votre expérience utilisateur. Les cookies sont des petits fichiers
              stockés sur votre appareil. Vous pouvez désactiver les cookies via les paramètres de votre navigateur, bien que
              cela pourrait affecter les fonctionnalités du service.
            </p>
          </section>

          {/* Section 9 */}
          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-slate-900">9. Modification de cette politique</h2>
            <p className="text-slate-700 leading-relaxed">
              Nous pouvons mettre à jour cette politique de confidentialité de temps à autre. Nous vous notifierons de tout
              changement important en publiant la nouvelle politique sur notre site et en mettant à jour la date de dernière
              modification. Votre utilisation continue du service après les modifications constitue votre acceptation de la
              nouvelle politique.
            </p>
          </section>

          {/* Section 10 */}
          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-slate-900">10. Nous contacter</h2>
            <p className="text-slate-700 leading-relaxed">
              Si vous avez des questions sur cette politique de confidentialité ou sur la façon dont nous traitons vos données,
              veuillez nous contacter :
            </p>
            <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 mt-4">
              <p className="font-semibold text-slate-900">AegisTechCorp</p>
              <p className="text-slate-600">Email: privacy@aegistechcorp.com</p>
              <p className="text-slate-600">Support: support@aegistechcorp.com</p>
              <p className="text-slate-600">Délégué à la protection des données: dpo@aegistechcorp.com</p>
            </div>
          </section>

          {/* RGPD Notice */}
          <section className="space-y-4 bg-blue-50 p-6 rounded-lg border border-blue-200">
            <h2 className="text-2xl font-bold text-slate-900">Conformité RGPD</h2>
            <p className="text-slate-700 leading-relaxed">
              En tant que société opérant dans l'UE, AegisTechCorp est conforme au Règlement Général sur la Protection des
              Données (RGPD). Vos droits en vertu du RGPD sont entièrement respectés et appliqués par notre politique.
            </p>
          </section>
        </div>

        {/* Last updated */}
        <div className="mt-8 text-center text-slate-600 text-sm">
          <p>Dernière mise à jour : {new Date().toLocaleDateString("fr-FR")}</p>
        </div>

        {/* Link to terms */}
        <div className="mt-8 text-center">
          <p className="text-slate-600 mb-4">
            Consultez aussi nos <Link to="/terms" className="text-blue-600 font-semibold hover:text-blue-700">
              conditions d'utilisation
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
