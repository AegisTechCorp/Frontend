import { useState } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import { Shield, Lock, ArrowLeft, Fingerprint, AlertCircle } from "lucide-react"
import { Layout } from "../components/Layout"
import { unlockFolderWithPin, unlockFolderWithBiometric } from "../api/dashboardApi"

export default function UnlockFolderPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const folderId = searchParams.get("id") || ""
  const unlockMethod = searchParams.get("method") || "pin"

  const [pin, setPin] = useState("")
  const [error, setError] = useState("")
  const [isUnlocking, setIsUnlocking] = useState(false)

  const handlePinChange = (value: string) => {
    if (value.length <= 4 && /^\d*$/.test(value)) {
      setPin(value)
      setError("")
      
      // Auto-submit when 4 digits entered
      if (value.length === 4) {
        handleUnlock(value)
      }
    }
  }

  const handleUnlock = async (pinValue: string = pin) => {
    if (!folderId) {
      setError("ID du dossier manquant")
      return
    }

    setIsUnlocking(true)
    setError("")

    try {
      const result = await unlockFolderWithPin(folderId, pinValue)
      
      if (result.success) {
        // Stocker le token de déverrouillage si nécessaire
        if (result.token) {
          sessionStorage.setItem(`folder_unlock_${folderId}`, result.token)
        }
        navigate(`/dashboard?folder=${folderId}`)
      } else {
        setError(result.error || "Code PIN incorrect")
        setPin("")
        setIsUnlocking(false)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur de déverrouillage")
      setPin("")
      setIsUnlocking(false)
    }
  }

  const handleBiometricUnlock = async () => {
    if (!folderId) {
      setError("ID du dossier manquant")
      return
    }

    setIsUnlocking(true)
    setError("")

    try {
      const result = await unlockFolderWithBiometric(folderId)
      
      if (result.success) {
        // Stocker le token de déverrouillage si nécessaire
        if (result.token) {
          sessionStorage.setItem(`folder_unlock_${folderId}`, result.token)
        }
        navigate(`/dashboard?folder=${folderId}`)
      } else {
        setError(result.error || "Erreur d'authentification biométrique")
        setIsUnlocking(false)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur de déverrouillage")
      setIsUnlocking(false)
    }
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50 flex items-center justify-center p-6 relative overflow-hidden">
          {/* Animated background */}
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

          {/* Back button */}
          <button
            onClick={() => navigate("/dashboard")}
            className="absolute top-6 left-6 flex items-center gap-2 text-slate-600 hover:text-blue-600 font-medium transition-colors z-10"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Retour</span>
          </button>

      {/* Unlock card */}
      <div className="relative w-full max-w-md" style={{ animation: "fadeInUp 0.8s ease-out" }}>
        <div className="bg-white rounded-3xl shadow-2xl p-8 border border-slate-200/50 backdrop-blur-xl">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-2xl mb-4 relative">
              <Lock className="w-10 h-10 text-white" />
              <Shield className="w-6 h-6 text-white absolute -top-2 -right-2 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-full p-1" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 mb-2">Dossier sécurisé</h1>
            <p className="text-slate-600">Déverrouillez pour accéder aux documents</p>
          </div>

          {unlockMethod === "pin" ? (
            <div className="space-y-6">
              {/* PIN Input */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-3 text-center">
                  Entrez votre code PIN
                </label>
                <div className="flex justify-center gap-3 mb-4">
                  {[0, 1, 2, 3].map((index) => (
                    <div
                      key={index}
                      className={`w-16 h-16 rounded-xl border-2 ${
                        pin.length > index
                          ? "border-blue-500 bg-blue-50"
                          : "border-slate-200 bg-slate-50"
                      } flex items-center justify-center transition-all`}
                    >
                      {pin.length > index && (
                        <div className="w-3 h-3 bg-blue-600 rounded-full" />
                      )}
                    </div>
                  ))}
                </div>

                {/* Hidden input for mobile keyboards */}
                <input
                  type="tel"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={4}
                  value={pin}
                  onChange={(e) => handlePinChange(e.target.value)}
                  className="w-full text-center text-2xl tracking-widest py-4 bg-slate-50 border-2 border-slate-200 rounded-xl focus:border-blue-500 focus:bg-white focus:outline-none transition-all"
                  placeholder="••••"
                  autoFocus
                  disabled={isUnlocking}
                />
              </div>

              {/* Error message */}
              {error && (
                <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  <span className="text-sm font-medium">{error}</span>
                </div>
              )}

              {/* Demo hint */}
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
                <p className="text-sm text-blue-700 text-center">
                  <strong>Demo:</strong> Utilisez le code <span className="font-mono font-bold">1234</span>
                </p>
              </div>

              {/* Unlock button */}
              <button
                onClick={() => handleUnlock()}
                disabled={pin.length !== 4 || isUnlocking}
                className="w-full py-4 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl font-semibold hover:shadow-lg hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
              >
                {isUnlocking ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Déverrouillage...</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-5 h-5" />
                    <span>Déverrouiller</span>
                  </>
                )}
              </button>

              {/* Alternative method */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white text-slate-500">ou</span>
                </div>
              </div>

              <button
                onClick={handleBiometricUnlock}
                disabled={isUnlocking}
                className="w-full flex items-center justify-center gap-3 py-3 border-2 border-slate-200 rounded-xl hover:border-blue-500 hover:bg-slate-50 transition-all group disabled:opacity-50"
              >
                <Fingerprint className="w-6 h-6 text-slate-500 group-hover:text-blue-600 transition-colors" />
                <span className="text-slate-700 font-medium">Empreinte digitale</span>
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Biometric unlock */}
              <div className="text-center py-8">
                <div className="inline-flex items-center justify-center w-32 h-32 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-full mb-6 relative">
                  <Fingerprint className="w-20 h-20 text-blue-600 animate-pulse" />
                </div>
                <p className="text-slate-600 mb-6">
                  Placez votre doigt sur le capteur pour déverrouiller
                </p>
              </div>

              <button
                onClick={handleBiometricUnlock}
                disabled={isUnlocking}
                className="w-full py-4 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl font-semibold hover:shadow-lg hover:scale-[1.02] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isUnlocking ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Authentification...</span>
                  </>
                ) : (
                  <>
                    <Fingerprint className="w-5 h-5" />
                    <span>Scanner l'empreinte</span>
                  </>
                )}
              </button>

              {/* Alternative method */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white text-slate-500">ou</span>
                </div>
              </div>

              <button
                onClick={() => navigate(`/unlock-folder?folder=${folderId}&method=pin`)}
                className="w-full flex items-center justify-center gap-3 py-3 border-2 border-slate-200 rounded-xl hover:border-blue-500 hover:bg-slate-50 transition-all group"
              >
                <Lock className="w-5 h-5 text-slate-500 group-hover:text-blue-600 transition-colors" />
                <span className="text-slate-700 font-medium">Utiliser un code PIN</span>
              </button>
            </div>
          )}
        </div>

        {/* Security badge */}
        <div className="mt-6 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full border border-slate-200/50 shadow-lg">
            <Shield className="w-4 h-4 text-green-600" />
            <span className="text-sm font-semibold text-slate-700">Chiffrement AES-256</span>
        </div>
      </div>
      </div>
      </div>

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
      `}</style>
    </Layout>
  )
}