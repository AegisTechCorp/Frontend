import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { User, Mail, Calendar, Shield, Lock } from 'lucide-react'
import AuthService from '../services/authService'
import { getUserProfile, updateUserProfile } from '../api/userApi'

export default function Profile() {
  const [userData, setUserData] = useState({
    name: '',
    email: '',
    createdAt: '',
  })
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
  })

  useEffect(() => {
    loadUserData()
  }, [])

  const loadUserData = async () => {
    try {
      const profile = await getUserProfile()
      const fullName = `${profile.firstName} ${profile.lastName}`
      setUserData({
        name: fullName,
        email: profile.email,
        createdAt: profile.createdAt,
      })
      setFormData({
        name: fullName,
        email: profile.email,
      })
    } catch (error) {
      // Fallback sur les données locales
      const user = AuthService.getUser()
      if (user) {
        const fullName = `${user.firstName} ${user.lastName}`
        setUserData({
          name: fullName,
          email: user.email,
          createdAt: user.createdAt,
        })
        setFormData({
          name: fullName,
          email: user.email,
        })
      }
    }
  }

  const handleSave = async () => {
    const [firstName, ...lastNameParts] = formData.name.split(' ')
    const lastName = lastNameParts.join(' ')
    
    const result = await updateUserProfile({
      firstName,
      lastName,
      email: formData.email,
    })

    if (result.success) {
      setIsEditing(false)
      setUserData({
        ...userData,
        name: formData.name,
        email: formData.email,
      })
      alert('✓ Profil mis à jour avec succès')
    } else {
      alert('❌ ' + result.error)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Mon profil</h1>
          <p className="text-gray-600">Gérer mes informations</p>
        </div>

        {/* Profile Card */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
          <div className="flex items-center mb-8">
            <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-3xl font-bold">
              {userData.name.charAt(0).toUpperCase()}
            </div>
            <div className="ml-6">
              <h2 className="text-2xl font-bold text-gray-900">{userData.name}</h2>
              <p className="text-gray-600">{userData.email}</p>
            </div>
          </div>

          {/* Informations */}
          <div className="space-y-6">
            {/* Nom */}
            <div className="flex items-center border-b border-gray-200 pb-4">
              <User className="w-5 h-5 text-gray-400 mr-4" />
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nom complet
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                ) : (
                  <p className="text-gray-900">{userData.name}</p>
                )}
              </div>
            </div>

            {/* Email */}
            <div className="flex items-center border-b border-gray-200 pb-4">
              <Mail className="w-5 h-5 text-gray-400 mr-4" />
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                {isEditing ? (
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                ) : (
                  <p className="text-gray-900">{userData.email}</p>
                )}
              </div>
            </div>

            {/* Date de création */}
            <div className="flex items-center border-b border-gray-200 pb-4">
              <Calendar className="w-5 h-5 text-gray-400 mr-4" />
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Membre depuis
                </label>
                <p className="text-gray-900">{formatDate(userData.createdAt)}</p>
              </div>
            </div>

            {/* Sécurité */}
            <div className="flex items-center pb-4">
              <Shield className="w-5 h-5 text-gray-400 mr-4" />
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Sécurité des données médicales
                </label>
                <div className="flex flex-col gap-2">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 w-fit">
                    ✓ Chiffrement de bout en bout actif
                  </span>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 w-fit">
                    ✓ Dossier médical protégé
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Statistiques médicales */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <h3 className="font-semibold text-gray-900 mb-4">Mes documents médicaux</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-blue-50 rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-1">Documents stockés</p>
                <p className="text-2xl font-bold text-blue-600">0</p>
              </div>
              <div className="bg-purple-50 rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-1">Espace utilisé</p>
                <p className="text-2xl font-bold text-purple-600">0 MB</p>
              </div>
            </div>
          </div>

          {/* Boutons d'action */}
          <div className="mt-8 flex gap-4">
            {isEditing ? (
              <>
                <button
                  onClick={handleSave}
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium hover:shadow-lg transition-all"
                >
                  Enregistrer
                </button>
                <button
                  onClick={() => {
                    setIsEditing(false)
                    loadUserData()
                  }}
                  className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-all"
                >
                  Annuler
                </button>
              </>
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium hover:shadow-lg transition-all"
              >
                Modifier le profil
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
