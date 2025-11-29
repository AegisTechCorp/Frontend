import { useState } from 'react'
import { Lock, Smartphone, Shield, AlertTriangle } from 'lucide-react'
import { enable2FA, verify2FA, disable2FA, revokeAllSessions } from '../api/userApi'
import { Layout } from '../components/Layout'

export default function Security() {
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false)

  const handleToggle2FA = async () => {
    if (!twoFactorEnabled) {

      const result = await enable2FA()
      if (result.success) {
        const code = prompt('QR Code généré ! Entrez le code de vérification de votre application :')
        if (code) {
          const verifyResult = await verify2FA(code)
          if (verifyResult.success) {
            setTwoFactorEnabled(true)
            alert('✓ 2FA activée avec succès')
          } else {
            alert('❌ ' + verifyResult.error)
          }
        }
      } else {
        alert('❌ ' + result.error)
      }
    } else {

      const password = prompt('Entrez votre mot de passe pour désactiver la 2FA :')
      if (password) {
        const result = await disable2FA(password)
        if (result.success) {
          setTwoFactorEnabled(false)
          alert('✓ 2FA désactivée')
        } else {
          alert('❌ ' + result.error)
        }
      }
    }
  }

  return (
    <Layout
      currentPage="security"
      showHeader={true}
      headerContent={
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-slate-900">Sécurité</h1>
          <p className="text-sm text-slate-600 mt-1">Authentification et protection des données</p>
        </div>
      }
    >
      <div className="max-w-4xl mx-auto">

        {}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <Smartphone className="w-6 h-6 text-blue-600 mr-3" />
              <div>
                <h2 className="text-xl font-bold text-gray-900">Authentification à deux facteurs</h2>
                <p className="text-sm text-gray-600">Ajouter une couche de sécurité supplémentaire</p>
              </div>
            </div>
            <button
              onClick={handleToggle2FA}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                twoFactorEnabled ? 'bg-blue-600' : 'bg-gray-300'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  twoFactorEnabled ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {twoFactorEnabled ? (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-start">
                <Shield className="w-5 h-5 text-green-600 mr-3 mt-0.5" />
                <div className="text-sm text-green-900">
                  <p className="font-medium">✓ Authentification à deux facteurs activée</p>
                  <p className="text-green-800 mt-1">
                    Vos documents médicaux sont protégés par une double sécurité. 
                    Même si votre mot de passe est compromis, vos données restent inaccessibles.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-start">
                <AlertTriangle className="w-5 h-5 text-yellow-600 mr-3 mt-0.5" />
                <div className="text-sm text-yellow-900">
                  <p className="font-medium">⚠️ Recommandé : Activez l'authentification à deux facteurs</p>
                  <p className="text-yellow-800 mt-1">
                    Vos documents médicaux contiennent des informations sensibles. 
                    Ajoutez une couche de sécurité supplémentaire avec un code de vérification.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
          <div className="flex items-center mb-6">
            <Lock className="w-6 h-6 text-blue-600 mr-3" />
            <h2 className="text-xl font-bold text-gray-900">Chiffrement des données médicales</h2>
          </div>

          <div className="space-y-4">
            <div className="flex items-start p-4 bg-blue-50 rounded-lg">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-4 flex-shrink-0">
                <Lock className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Chiffrement de bout en bout (E2EE)</h3>
                <p className="text-sm text-gray-600">
                  Vos documents sont chiffrés sur votre appareil avant d'être envoyés. 
                  Nous ne pouvons pas accéder à vos données médicales, même si nous le voulions.
                </p>
              </div>
            </div>

            <div className="flex items-start p-4 bg-green-50 rounded-lg">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mr-4 flex-shrink-0">
                <Shield className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Zero-Knowledge</h3>
                <p className="text-sm text-gray-600">
                  Seul votre mot de passe peut déchiffrer vos documents. 
                  Si vous le perdez, vos données sont irrécupérables - c'est le prix de la sécurité maximale.
                </p>
              </div>
            </div>
          </div>
        </div>

        {}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <div className="flex items-center mb-6">
            <Shield className="w-6 h-6 text-blue-600 mr-3" />
            <h2 className="text-xl font-bold text-gray-900">Sessions actives</h2>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mr-4">
                  <Smartphone className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Session actuelle</h3>
                  <p className="text-sm text-gray-600">Windows • Chrome • Paris, France</p>
                </div>
              </div>
              <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                Actif maintenant
              </span>
            </div>
          </div>

          <button 
            onClick={async () => {
              if (window.confirm('Déconnecter toutes les autres sessions ?')) {
                const result = await revokeAllSessions()
                if (result.success) {
                  alert('✓ Sessions révoquées')
                } else {
                  alert('❌ ' + result.error)
                }
              }
            }}
            className="w-full mt-4 px-6 py-3 border-2 border-red-300 text-red-700 rounded-lg font-medium hover:bg-red-50 transition-all"
          >
            Déconnecter toutes les sessions
          </button>
        </div>
      </div>
    </Layout>
  )
}
