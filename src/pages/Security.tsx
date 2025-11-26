import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Lock, Key, Smartphone, Shield, Eye, EyeOff, AlertTriangle } from 'lucide-react'
import { changePassword, enable2FA, verify2FA, disable2FA, revokeAllSessions } from '../api/userApi'

export default function Security() {
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false)
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })

  const handlePasswordChange = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      alert('❌ Les mots de passe ne correspondent pas')
      return
    }

    if (passwordForm.newPassword.length < 8) {
      alert('❌ Le mot de passe doit contenir au moins 8 caractères')
      return
    }

    const result = await changePassword({
      currentPassword: passwordForm.currentPassword,
      newPassword: passwordForm.newPassword,
    })

    if (result.success) {
      alert('✓ Mot de passe modifié avec succès')
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      })
    } else {
      alert('❌ ' + result.error)
    }
  }

  const handleToggle2FA = async () => {
    if (!twoFactorEnabled) {
      // Activer 2FA
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
      // Désactiver 2FA
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

  const passwordStrength = (password: string) => {
    let strength = 0
    if (password.length >= 8) strength++
    if (password.length >= 12) strength++
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++
    if (/\d/.test(password)) strength++
    if (/[^a-zA-Z\d]/.test(password)) strength++
    return strength
  }

  const getStrengthColor = (strength: number) => {
    if (strength <= 2) return 'bg-red-500'
    if (strength <= 3) return 'bg-yellow-500'
    return 'bg-green-500'
  }

  const getStrengthText = (strength: number) => {
    if (strength <= 2) return 'Faible'
    if (strength <= 3) return 'Moyen'
    return 'Fort'
  }

  const strength = passwordStrength(passwordForm.newPassword)

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header with Logo */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40 backdrop-blur-xl bg-white/80">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-4">
          <Link to="/dashboard" className="flex items-center gap-3">
            <div className="relative">
              <Shield className="w-8 h-8 text-blue-600" strokeWidth={2.5} />
              <Lock className="w-4 h-4 text-cyan-500 absolute -bottom-1 -right-1" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent tracking-tight">
              Aegis
            </span>
          </Link>
        </div>
      </header>
      
      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Sécurité</h1>
          <p className="text-gray-600">Mot de passe et 2FA</p>
        </div>

        {/* Changement de mot de passe */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
          <div className="flex items-center mb-6">
            <Lock className="w-6 h-6 text-blue-600 mr-3" />
            <h2 className="text-xl font-bold text-gray-900">Changer le mot de passe</h2>
          </div>

          <div className="space-y-4">
            {/* Mot de passe actuel */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mot de passe actuel
              </label>
              <div className="relative">
                <input
                  type={showCurrentPassword ? 'text' : 'password'}
                  value={passwordForm.currentPassword}
                  onChange={(e) =>
                    setPasswordForm({ ...passwordForm, currentPassword: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-12"
                  placeholder="Entrez votre mot de passe actuel"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showCurrentPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {/* Nouveau mot de passe */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nouveau mot de passe
              </label>
              <div className="relative">
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  value={passwordForm.newPassword}
                  onChange={(e) =>
                    setPasswordForm({ ...passwordForm, newPassword: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-12"
                  placeholder="Entrez un nouveau mot de passe"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showNewPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              
              {/* Indicateur de force */}
              {passwordForm.newPassword && (
                <div className="mt-2">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-gray-600">Force du mot de passe</span>
                    <span className={`text-xs font-medium ${
                      strength <= 2 ? 'text-red-600' : strength <= 3 ? 'text-yellow-600' : 'text-green-600'
                    }`}>
                      {getStrengthText(strength)}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all ${getStrengthColor(strength)}`}
                      style={{ width: `${(strength / 5) * 100}%` }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Confirmation */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confirmer le mot de passe
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={passwordForm.confirmPassword}
                  onChange={(e) =>
                    setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-12"
                  placeholder="Confirmez votre mot de passe"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {/* Conseils */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start">
                <Key className="w-5 h-5 text-blue-600 mr-3 mt-0.5" />
                <div className="text-sm text-blue-900">
                  <p className="font-medium mb-2">⚕️ Protégez vos données médicales avec un mot de passe fort :</p>
                  <ul className="list-disc list-inside space-y-1 text-blue-800">
                    <li>Au moins 8 caractères (12+ recommandé pour les données de santé)</li>
                    <li>Mélange de majuscules et minuscules</li>
                    <li>Au moins un chiffre</li>
                    <li>Au moins un caractère spécial (!@#$%^&*)</li>
                    <li>Ne partagez jamais votre mot de passe - c'est la clé de vos documents</li>
                  </ul>
                </div>
              </div>
            </div>

            <button
              onClick={handlePasswordChange}
              className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium hover:shadow-lg transition-all"
            >
              Changer le mot de passe
            </button>
          </div>
        </div>

        {/* Authentification à deux facteurs */}
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

        {/* Chiffrement des données */}
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

        {/* Sessions actives */}
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
    </div>
  )
}
