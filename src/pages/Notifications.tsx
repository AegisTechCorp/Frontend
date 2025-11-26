import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Bell, Shield, Lock, FileText, Calendar, AlertTriangle, CheckCircle, X, Trash2 } from 'lucide-react'
import { 
  getNotifications, 
  markNotificationAsRead, 
  markAllNotificationsAsRead,
  deleteNotification as deleteNotificationApi,
  deleteAllNotifications,
  type Notification as ApiNotification,
  type NotificationType
} from '../api/notificationsApi'

interface Notification extends ApiNotification {
  date: string
}

export default function Notifications() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [filter, setFilter] = useState<'all' | 'unread'>('all')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadNotifications()
  }, [filter])

  const loadNotifications = async () => {
    setLoading(true)
    try {
      const data = await getNotifications(filter)
      // Adapter le format
      const formatted = data.map(n => ({
        ...n,
        date: n.createdAt,
      }))
      setNotifications(formatted)
    } catch (error) {
      console.error('Erreur chargement notifications:', error)
    } finally {
      setLoading(false)
    }
  }

  const unreadCount = notifications.filter(n => !n.read).length

  const filteredNotifications = filter === 'unread' 
    ? notifications.filter(n => !n.read)
    : notifications

  const markAsRead = async (id: string) => {
    const result = await markNotificationAsRead(id)
    if (result.success) {
      setNotifications(notifications.map(n => 
        n.id === id ? { ...n, read: true } : n
      ))
    }
  }

  const markAllAsRead = async () => {
    const result = await markAllNotificationsAsRead()
    if (result.success) {
      setNotifications(notifications.map(n => ({ ...n, read: true })))
    }
  }

  const deleteNotification = async (id: string) => {
    const result = await deleteNotificationApi(id)
    if (result.success) {
      setNotifications(notifications.filter(n => n.id !== id))
    }
  }

  const clearAll = async () => {
    if (window.confirm('Voulez-vous vraiment supprimer toutes les notifications ?')) {
      const result = await deleteAllNotifications()
      if (result.success) {
        setNotifications([])
      }
    }
  }

  const getIcon = (type: NotificationType) => {
    switch (type) {
      case 'medical':
        return <Calendar className="w-5 h-5" />
      case 'warning':
        return <AlertTriangle className="w-5 h-5" />
      case 'success':
        return <CheckCircle className="w-5 h-5" />
      default:
        return <Bell className="w-5 h-5" />
    }
  }

  const getColorClasses = (type: NotificationType) => {
    switch (type) {
      case 'medical':
        return 'bg-purple-100 text-purple-600'
      case 'warning':
        return 'bg-yellow-100 text-yellow-600'
      case 'success':
        return 'bg-green-100 text-green-600'
      default:
        return 'bg-blue-100 text-blue-600'
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'À l\'instant'
    if (diffMins < 60) return `Il y a ${diffMins} min`
    if (diffHours < 24) return `Il y a ${diffHours}h`
    if (diffDays === 1) return 'Hier'
    if (diffDays < 7) return `Il y a ${diffDays} jours`
    
    return date.toLocaleDateString('fr-FR', { 
      day: 'numeric', 
      month: 'short',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined 
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
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                <Bell className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
                <p className="text-gray-600">
                  {unreadCount > 0 
                    ? `${unreadCount} notification${unreadCount > 1 ? 's' : ''} non lue${unreadCount > 1 ? 's' : ''}`
                    : 'Toutes les notifications sont lues'
                  }
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap items-center gap-3 mb-6">
          <div className="flex gap-2 bg-white rounded-lg p-1 shadow-sm">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                filter === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Toutes ({notifications.length})
            </button>
            <button
              onClick={() => setFilter('unread')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                filter === 'unread'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Non lues ({unreadCount})
            </button>
          </div>

          <div className="flex gap-2 ml-auto">
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg text-sm font-medium transition-colors"
              >
                Tout marquer comme lu
              </button>
            )}
            {notifications.length > 0 && (
              <button
                onClick={clearAll}
                className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Tout effacer
              </button>
            )}
          </div>
        </div>

        {/* Notifications List */}
        {loading ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
              <Bell className="w-8 h-8 text-blue-600" />
            </div>
            <p className="text-gray-600">Chargement des notifications...</p>
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Bell className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {filter === 'unread' ? 'Aucune notification non lue' : 'Aucune notification'}
            </h3>
            <p className="text-gray-600">
              {filter === 'unread' 
                ? 'Vous êtes à jour avec toutes vos notifications'
                : 'Vous n\'avez pas encore de notifications'
              }
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredNotifications.map((notification) => (
              <div
                key={notification.id}
                className={`bg-white rounded-xl shadow-sm border-2 transition-all hover:shadow-md ${
                  notification.read 
                    ? 'border-gray-100' 
                    : 'border-blue-200 bg-blue-50/30'
                }`}
              >
                <div className="p-5">
                  <div className="flex items-start gap-4">
                    {/* Icon */}
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${getColorClasses(notification.type)}`}>
                      {getIcon(notification.type)}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3 mb-1">
                        <h3 className={`font-semibold text-gray-900 ${!notification.read ? 'font-bold' : ''}`}>
                          {notification.title}
                        </h3>
                        <span className="text-xs text-gray-500 whitespace-nowrap">
                          {formatDate(notification.date)}
                        </span>
                      </div>
                      <p className="text-gray-600 text-sm leading-relaxed">
                        {notification.message}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {!notification.read && (
                        <button
                          onClick={() => markAsRead(notification.id)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Marquer comme lu"
                        >
                          <CheckCircle className="w-5 h-5" />
                        </button>
                      )}
                      <button
                        onClick={() => deleteNotification(notification.id)}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Supprimer"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  {/* Unread indicator */}
                  {!notification.read && (
                    <div className="flex items-center gap-2 mt-3 pt-3 border-t border-blue-100">
                      <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse" />
                      <span className="text-xs font-medium text-blue-600">Non lu</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Info box */}
        {notifications.length > 0 && (
          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <FileText className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-blue-900">
                <p className="font-medium mb-1">À propos des notifications</p>
                <p className="text-blue-800">
                  Vous recevez des notifications pour les rappels médicaux, l'ajout de nouveaux documents, 
                  les alertes de sécurité et les sauvegardes automatiques de votre dossier médical.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
