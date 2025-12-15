import React, { useState, useRef, useEffect } from 'react'
import { Shield, X, Loader2 } from 'lucide-react'

interface TwoFactorModalProps {
  isOpen: boolean
  onClose: () => void
  onVerify: (code: string) => Promise<void>
  isLoading?: boolean
}

export default function TwoFactorModal({ isOpen, onClose, onVerify, isLoading = false }: TwoFactorModalProps) {
  const [code, setCode] = useState(['', '', '', '', '', ''])
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  useEffect(() => {
    if (isOpen && inputRefs.current[0]) {
      inputRefs.current[0]?.focus()
    }
  }, [isOpen])

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return

    const newCode = [...code]
    newCode[index] = value.slice(-1)
    setCode(newCode)

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }

    // Auto-submit when all digits are entered
    if (index === 5 && value && newCode.every(digit => digit !== '')) {
      handleSubmit(newCode.join(''))
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData('text').slice(0, 6)
    if (!/^\d+$/.test(pastedData)) return

    const newCode = [...code]
    pastedData.split('').forEach((char, index) => {
      if (index < 6) newCode[index] = char
    })
    setCode(newCode)

    // Focus last filled input or first empty
    const lastIndex = Math.min(pastedData.length, 5)
    inputRefs.current[lastIndex]?.focus()

    // Auto-submit if complete
    if (pastedData.length === 6) {
      handleSubmit(pastedData)
    }
  }

  const handleSubmit = async (codeString?: string) => {
    const finalCode = codeString || code.join('')
    if (finalCode.length === 6) {
      await onVerify(finalCode)
    }
  }

  const handleClose = () => {
    if (!isLoading) {
      setCode(['', '', '', '', '', ''])
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="relative bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4">
        {/* Close button */}
        {!isLoading && (
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-2xl mb-4">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">
            Authentification à deux facteurs
          </h2>
          <p className="text-slate-600">
            Entrez le code à 6 chiffres de votre application d'authentification
          </p>
        </div>

        {/* Code input */}
        <div className="flex gap-3 justify-center mb-6">
          {code.map((digit, index) => (
            <input
              key={index}
              ref={(el) => { inputRefs.current[index] = el }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              onPaste={index === 0 ? handlePaste : undefined}
              disabled={isLoading}
              className="w-12 h-14 text-center text-2xl font-bold bg-slate-50 border-2 border-slate-200 rounded-xl focus:border-blue-500 focus:bg-white focus:outline-none transition-all text-slate-900 disabled:opacity-50"
            />
          ))}
        </div>

        {/* Submit button */}
        <button
          onClick={() => handleSubmit()}
          disabled={code.some(digit => !digit) || isLoading}
          className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl font-semibold hover:shadow-lg hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Vérification...
            </>
          ) : (
            'Vérifier'
          )}
        </button>

        {/* Help text */}
        <p className="text-center mt-4 text-sm text-slate-500">
          Utilisez Google Authenticator, Authy ou une application similaire
        </p>
      </div>
    </div>
  )
}
