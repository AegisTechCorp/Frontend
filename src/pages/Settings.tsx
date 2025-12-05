import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Bell, Download, Trash2, HardDrive, Shield, Lock, User, Settings as SettingsIcon, LogOut, Menu, X, Activity, FileText, Pill, Image, AlertCircle, Clock } from 'lucide-react'
import { exportUserData, deleteUserAccount, updateNotificationSettings, getNotificationSettings } from '../api/userApi'
import { Layout } from '../components/Layout'

export default function Settings() {
  const [settings, setSettings] = useState({
    notifications: true,
    emailNotifications: true,
    autoBackup: true,
  })

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    try {
      const notifSettings = await getNotificationSettings()
      setSettings(prev => ({
        ...prev,
        notifications: notifSettings.pushNotifications ?? true,
        emailNotifications: notifSettings.emailNotifications ?? true,
      }))
    } catch (error) {
      console.error('Erreur chargement paramètres:', error)
    }
  }

  const handleToggle = async (key: keyof typeof settings) => {
    const newValue = !settings[key]
    setSettings({
      ...settings,
      [key]: newValue,
    })

    if (key === 'notifications' || key === 'emailNotifications') {
      await updateNotificationSettings({
        pushNotifications: key === 'notifications' ? newValue : settings.notifications,
        emailNotifications: key === 'emailNotifications' ? newValue : settings.emailNotifications,
      })
    }
  }

  const handleLanguageChange = (language: string) => {
    setSettings({
      ...settings,
      language,
    })
  }

  const handleExportData = async () => {
    const result = await exportUserData()
    if (result.success) {
      alert('✓ Export de vos données réussi !')
    } else {
      alert('❌ ' + result.error)
    }
  }

  const handleDeleteAccount = async () => {
    const password = prompt('Confirmez votre mot de passe pour supprimer le compte :')
    if (!password) return

    if (window.confirm('⚠️ Êtes-vous VRAIMENT sûr ? Tous vos documents médicaux seront définitivement supprimés.')) {
      const result = await deleteUserAccount(password)
      if (result.success) {
        alert('✓ Compte supprimé')
        window.location.href = '/'
      } else {
        alert('❌ ' + result.error)
      }
    }
  }

  return (
    <Layout
      currentPage="settings"
      showHeader={true}
      headerContent={
        <div className="min-w-0 flex-1">
          <h2 className="text-lg lg:text-2xl font-bold text-slate-900">Paramètres</h2>
          <p className="text-xs lg:text-sm text-slate-500 mt-1 hidden sm:block">
            Configuration du compte
          </p>
        </div>
      }
    >
      <div className="max-w-4xl mx-auto">
        {}
        <div className="bg-white rounded-xl lg:rounded-2xl shadow-lg p-6 lg:p-8 mb-6">
          <div className="flex items-center mb-6">
            <Bell className="w-6 h-6 text-blue-600 mr-3" />
            <h2 className="text-xl font-bold text-gray-900">Notifications</h2>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between py-3 border-b border-gray-200">
              <div>
                <h3 className="font-medium text-gray-900">Notifications push</h3>
                <p className="text-sm text-gray-600">Recevoir des notifications dans l'application</p>
              </div>
              <button
                onClick={() => handleToggle('notifications')}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings.notifications ? 'bg-blue-600' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.notifications ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between py-3">
              <div>
                <h3 className="font-medium text-gray-900">Notifications par email</h3>
                <p className="text-sm text-gray-600">Recevoir des emails de notification</p>
              </div>
              <button
                onClick={() => handleToggle('emailNotifications')}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings.emailNotifications ? 'bg-blue-600' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.emailNotifications ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>



            {}
            <div className="bg-white rounded-xl lg:rounded-2xl shadow-lg p-6 lg:p-8 mb-6">
          <div className="flex items-center mb-6">
            <HardDrive className="w-6 h-6 text-blue-600 mr-3" />
            <h2 className="text-xl font-bold text-gray-900">Documents médicaux</h2>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between py-3 border-b border-gray-200">
              <div>
                <h3 className="font-medium text-gray-900">Sauvegarde automatique chiffrée</h3>
                <p className="text-sm text-gray-600">Chiffrer et sauvegarder automatiquement vos documents</p>
              </div>
              <button
                onClick={() => handleToggle('autoBackup')}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings.autoBackup ? 'bg-blue-600' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.autoBackup ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start">
                <Shield className="w-5 h-5 text-blue-600 mr-3 mt-0.5" />
                <div className="text-sm text-blue-900">
                  <p className="font-medium mb-1">Chiffrement de bout en bout</p>
                  <p className="text-blue-800">
                    Vos documents médicaux sont chiffrés localement avant d'être envoyés au serveur. 
                    Seul vous pouvez les déchiffrer avec votre mot de passe.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

            {}
            <div className="bg-white rounded-xl lg:rounded-2xl shadow-lg p-6 lg:p-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Gestion des données médicales</h2>
          
          <div className="space-y-4">
            <button
              onClick={handleExportData}
              className="w-full flex items-center justify-between px-6 py-4 border-2 border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all"
            >
              <div className="flex items-center">
                <Download className="w-5 h-5 text-gray-700 mr-3" />
                <div className="text-left">
                  <h3 className="font-medium text-gray-900">Exporter mon dossier médical</h3>
                  <p className="text-sm text-gray-600">Télécharger une archive chiffrée de tous vos documents</p>
                </div>
              </div>
            </button>

            <button
              onClick={handleDeleteAccount}
              className="w-full flex items-center justify-between px-6 py-4 border-2 border-red-300 rounded-lg hover:border-red-500 hover:bg-red-50 transition-all"
            >
              <div className="flex items-center">
                <Trash2 className="w-5 h-5 text-red-600 mr-3" />
                <div className="text-left">
                  <h3 className="font-medium text-red-900">Supprimer mon compte et mes données médicales</h3>
                  <p className="text-sm text-red-600">Suppression définitive de tous vos documents - Action irréversible</p>
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>
    </Layout>
  )
}
