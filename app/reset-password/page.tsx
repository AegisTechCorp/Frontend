"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { Shield, Lock, Mail, ArrowRight, ArrowLeft, Check } from "lucide-react"

export default function ResetPasswordPage() {
  const [email, setEmail] = useState("")
  const [emailSent, setEmailSent] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("[v0] Reset password request:", { email })
    setEmailSent(true)
  }

  return (
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

      {/* Logo top left */}
      <Link href="/" className="absolute top-6 left-6 flex items-center gap-3 z-10">
        <div className="relative">
          <Shield className="w-8 h-8 text-blue-600" strokeWidth={2.5} />
          <Lock className="w-4 h-4 text-cyan-500 absolute -bottom-1 -right-1" />
        </div>
        <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent tracking-tight">
          Aegis
        </span>
      </Link>

      {/* Reset password card */}
      <div className="relative w-full max-w-md" style={{ animation: "fadeInUp 0.8s ease-out" }}>
        <div className="bg-white rounded-3xl shadow-2xl p-8 border border-slate-200/50 backdrop-blur-xl">
          {!emailSent ? (
            <>
              {/* Header */}
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-2xl mb-4">
                  <Lock className="w-8 h-8 text-white" />
                </div>
                <h1 className="text-3xl font-bold text-slate-900 mb-2">Mot de passe oublié ?</h1>
                <p className="text-slate-600">Pas de problème, nous allons vous aider à le réinitialiser</p>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label htmlFor="email" className="block text-sm font-semibold text-slate-700 mb-2">
                    Adresse email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="votre@email.fr"
                      className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border-2 border-slate-200 rounded-xl focus:border-blue-500 focus:bg-white focus:outline-none transition-all text-slate-900 placeholder:text-slate-400"
                      required
                    />
                  </div>
                  <p className="mt-2 text-sm text-slate-500">
                    Nous vous enverrons un lien pour réinitialiser votre mot de passe
                  </p>
                </div>

                <button
                  type="submit"
                  className="w-full py-4 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl font-semibold text-lg hover:shadow-lg hover:scale-[1.02] transition-all flex items-center justify-center gap-2 group"
                >
                  Envoyer le lien
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
              </form>

              {/* Back to login */}
              <Link
                href="/login"
                className="mt-6 flex items-center justify-center gap-2 text-slate-600 hover:text-blue-600 transition-colors font-medium"
              >
                <ArrowLeft className="w-4 h-4" />
                Retour à la connexion
              </Link>
            </>
          ) : (
            <>
              {/* Success state */}
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl mb-4">
                  <Check className="w-8 h-8 text-white" strokeWidth={3} />
                </div>
                <h1 className="text-3xl font-bold text-slate-900 mb-2">Email envoyé !</h1>
                <p className="text-slate-600 mb-6">
                  Nous avons envoyé un lien de réinitialisation à{" "}
                  <span className="font-semibold text-slate-900">{email}</span>
                </p>

                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
                  <p className="text-sm text-slate-700 leading-relaxed">
                    <strong className="text-blue-700">Astuce :</strong> Le lien est valide pendant 1 heure. Pensez à
                    vérifier vos spams si vous ne le recevez pas.
                  </p>
                </div>

                <Link
                  href="/login"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl font-semibold hover:shadow-lg hover:scale-[1.02] transition-all"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Retour à la connexion
                </Link>

                <button
                  onClick={() => setEmailSent(false)}
                  className="mt-4 text-sm text-slate-600 hover:text-blue-600 transition-colors font-medium"
                >
                  Renvoyer l'email
                </button>
              </div>
            </>
          )}
        </div>

        {/* Security badge */}
        <div className="mt-6 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full border border-slate-200/50 shadow-lg">
            <Shield className="w-4 h-4 text-green-600" />
            <span className="text-sm font-semibold text-slate-700">Communication sécurisée</span>
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
    </div>
  )
}
