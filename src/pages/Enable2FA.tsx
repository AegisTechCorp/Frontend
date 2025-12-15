import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Shield, Check, AlertCircle, ArrowLeft } from 'lucide-react'
import AuthService from '../services/authService'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1'

export default function Enable2FA() {
  const navigate = useNavigate()
  const [step, setStep] = useState<'start' | 'scan' | 'verify' | 'success'>('start')
  const [qrCode, setQrCode] = useState('')
  const [secret, setSecret] = useState('')
  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleEnable = async () => {
    setLoading(true)
    setError('')

    try {
      const response = await fetch(`${API_BASE_URL}/auth/2fa/enable`, {
        method: 'POST',
        headers: AuthService.getAuthHeaders(),
        credentials: 'include',
      })

      if (!response.ok) {
        throw new Error('Erreur lors de l\'activation du 2FA')
      }

      const data = await response.json()
      setQrCode(data.qrCode)
      setSecret(data.secret)
      setStep('scan')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue')
    } finally {
      setLoading(false)
    }
  }

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await fetch(`${API_BASE_URL}/auth/2fa/verify`, {
        method: 'POST',
        headers: {
          ...AuthService.getAuthHeaders(),
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ token: code }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.message || 'Code 2FA invalide')
      }

      setStep('success')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Code invalide')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 p-4">
      <div className="max-w-2xl mx-auto pt-8">
        <button
          onClick={() => navigate('/settings')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-6"
        >
          <ArrowLeft className="w-5 h-5" />
          Retour aux paramètres
        </button>

        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="flex items-center gap-3 mb-6">
            <Shield className="w-8 h-8 text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-900">
              Authentification à deux facteurs (2FA)
            </h1>
          </div>

          {/* Étape 1 : Start */}
          {step === 'start' && (
            <div>
              <p className="text-gray-600 mb-6">
                L'authentification à deux facteurs ajoute une couche de sécurité supplémentaire à votre compte.
                Vous aurez besoin d'un code généré par une application d'authentification comme Google Authenticator ou Authy.
              </p>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <h3 className="font-semibold text-blue-900 mb-2">Avant de commencer :</h3>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Installez Google Authenticator, Authy ou une application similaire</li>
                  <li>• Assurez-vous d'avoir accès à votre téléphone</li>
                  <li>• Ce processus prend environ 2 minutes</li>
                </ul>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              )}

              <button
                onClick={handleEnable}
                disabled={loading}
                className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Génération...' : 'Activer le 2FA'}
              </button>
            </div>
          )}

          {/* Étape 2 : Scan QR Code */}
          {step === 'scan' && (
            <div>
              <div className="mb-6">
                <h2 className="text-lg font-semibold mb-2">Étape 1 : Scannez le QR code</h2>
                <p className="text-gray-600 text-sm">
                  Ouvrez votre application d'authentification et scannez ce QR code
                </p>
              </div>

              <div className="flex justify-center mb-6">
                <img src={qrCode} alt="QR Code 2FA" className="border-4 border-gray-200 rounded-lg" />
              </div>

              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <p className="text-xs text-gray-600 mb-2">Impossible de scanner ? Entrez ce code manuellement :</p>
                <code className="text-sm bg-white px-3 py-2 rounded border border-gray-200 block break-all">
                  {secret}
                </code>
              </div>

              <button
                onClick={() => setStep('verify')}
                className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition"
              >
                Continuer
              </button>
            </div>
          )}

          {/* Étape 3 : Verify Code */}
          {step === 'verify' && (
            <div>
              <div className="mb-6">
                <h2 className="text-lg font-semibold mb-2">Étape 2 : Vérifiez le code</h2>
                <p className="text-gray-600 text-sm">
                  Entrez le code à 6 chiffres affiché dans votre application
                </p>
              </div>

              <form onSubmit={handleVerify}>
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="000000"
                  className="w-full text-center text-3xl tracking-widest border-2 border-gray-300 rounded-lg px-4 py-6 mb-4 focus:outline-none focus:border-blue-600"
                  maxLength={6}
                  pattern="\d{6}"
                  required
                  autoFocus
                />

                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4 flex items-start gap-2">
                    <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-red-800">{error}</p>
                  </div>
                )}

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setStep('scan')}
                    className="flex-1 bg-gray-200 text-gray-800 py-3 rounded-lg hover:bg-gray-300 transition"
                  >
                    Retour
                  </button>
                  <button
                    type="submit"
                    disabled={loading || code.length !== 6}
                    className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Vérification...' : 'Vérifier'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Étape 4 : Success */}
          {step === 'success' && (
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="w-8 h-8 text-green-600" />
              </div>

              <h2 className="text-2xl font-bold text-gray-900 mb-2">2FA activé !</h2>
              <p className="text-gray-600 mb-8">
                Votre compte est maintenant protégé par l'authentification à deux facteurs.
                Vous devrez entrer un code de votre application lors de chaque connexion.
              </p>

              <button
                onClick={() => navigate('/settings')}
                className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition"
              >
                Retour aux paramètres
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
