import { useState, useEffect, useRef } from 'react'
import { X, Shield } from 'lucide-react'

interface QRCodeModalProps {
  isOpen: boolean
  onClose: () => void
  onVerify: (code: string) => void
  qrCode: string
  secret: string
  isLoading?: boolean
}

export default function QRCodeModal({
  isOpen,
  onClose,
  onVerify,
  qrCode,
  secret,
  isLoading = false,
}: QRCodeModalProps) {
  const [code, setCode] = useState(['', '', '', '', '', ''])
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  // Reset code when modal opens
  useEffect(() => {
    if (isOpen) {
      setCode(['', '', '', '', '', ''])
      setTimeout(() => {
        inputRefs.current[0]?.focus()
      }, 100)
    }
  }, [isOpen])

  const handleChange = (index: number, value: string) => {
    if (value.length > 1) {
      // Gestion du copier-coller
      const pastedCode = value.slice(0, 6).split('')
      const newCode = [...code]
      pastedCode.forEach((char, i) => {
        if (index + i < 6 && /^\d$/.test(char)) {
          newCode[index + i] = char
        }
      })
      setCode(newCode)
      
      // Focus sur le dernier champ rempli ou le premier vide
      const nextEmptyIndex = newCode.findIndex(c => c === '')
      const focusIndex = nextEmptyIndex === -1 ? 5 : nextEmptyIndex
      inputRefs.current[focusIndex]?.focus()
      
      // Auto-submit si tous les champs sont remplis
      if (newCode.every(c => c !== '')) {
        onVerify(newCode.join(''))
      }
      return
    }

    if (!/^\d*$/.test(value)) return

    const newCode = [...code]
    newCode[index] = value
    setCode(newCode)

    // Focus sur le champ suivant si une valeur a été entrée
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }

    // Auto-submit si tous les champs sont remplis
    if (newCode.every(c => c !== '') && index === 5) {
      onVerify(newCode.join(''))
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const fullCode = code.join('')
    if (fullCode.length === 6) {
      onVerify(fullCode)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 relative">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors"
          disabled={isLoading}
        >
          <X className="w-6 h-6" />
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">
            Configuration 2FA
          </h2>
          <p className="text-slate-600 text-sm">
            Scannez le QR code avec votre application d'authentification
          </p>
        </div>

        {/* QR Code */}
        <div className="bg-white border-2 border-slate-200 rounded-xl p-4 mb-6 flex justify-center">
          <img 
            src={qrCode} 
            alt="QR Code pour 2FA" 
            className="w-48 h-48"
          />
        </div>

        {/* Secret key fallback */}
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 mb-6">
          <p className="text-xs text-slate-600 mb-2 font-semibold">
            Clé secrète (si vous ne pouvez pas scanner) :
          </p>
          <code className="text-sm font-mono text-slate-900 break-all block">
            {secret}
          </code>
        </div>

        {/* Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-blue-900">
            <strong>Instructions :</strong>
          </p>
          <ol className="text-sm text-blue-800 mt-2 space-y-1 ml-4 list-decimal">
            <li>Ouvrez votre application d'authentification (Google Authenticator, Authy, etc.)</li>
            <li>Scannez le QR code ci-dessus</li>
            <li>Entrez le code de vérification à 6 chiffres</li>
          </ol>
        </div>

        {/* Code input */}
        <form onSubmit={handleSubmit}>
          <label className="block text-sm font-semibold text-slate-700 mb-3 text-center">
            Code de vérification
          </label>
          <div className="flex gap-2 mb-6 justify-center">
            {code.map((digit, index) => (
              <input
                key={index}
                ref={el => {
                  inputRefs.current[index] = el
                }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={e => handleChange(index, e.target.value)}
                onKeyDown={e => handleKeyDown(index, e)}
                disabled={isLoading}
                className="w-12 h-14 text-center text-2xl font-bold border-2 border-slate-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all disabled:bg-slate-100 disabled:cursor-not-allowed"
              />
            ))}
          </div>

          <button
            type="submit"
            disabled={code.some(c => c === '') || isLoading}
            className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-semibold py-3 px-6 rounded-xl hover:from-blue-700 hover:to-cyan-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Vérification...
              </>
            ) : (
              'Activer 2FA'
            )}
          </button>
        </form>
      </div>
    </div>
  )
}
