import { useState, useEffect } from 'react'
import { User, Mail, Calendar, Shield } from 'lucide-react'
import AuthService from '../services/authService'
import { getUserProfile, updateUserProfile } from '../api/userApi'
import { Layout } from '../components/Layout'

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
    <Layout
      currentPage="profile"
      showHeader={true}
      headerContent={
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-slate-900">Mon Profile</h1>
          <p className="text-sm text-slate-600 mt-1">Gérez vos informations personnelles</p>
        </div>
      }
    >
      <div className="max-w-4xl mx-auto">
        {}
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

          {}
          <div className="space-y-6">
            {}
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

            {}
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

            {}
            <div className="flex items-center border-b border-gray-200 pb-4">
              <Calendar className="w-5 h-5 text-gray-400 mr-4" />
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Membre depuis
                </label>
                <p className="text-gray-900">{formatDate(userData.createdAt)}</p>
              </div>
            </div>

            {}
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

          {}
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

          {}
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
    </Layout>
  )
}
