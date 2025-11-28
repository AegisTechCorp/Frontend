import { useNavigate, useLocation } from "react-router-dom"
import {
  Shield,
  FileText,
  User,
  LogOut,
  Activity,
  Pill,
  Image,
  AlertCircle,
  Clock,
  Settings,
  UserCircle,
  X,
  Bell,
  type LucideIcon,
} from "lucide-react"
import AuthService from "../services/authService"

interface SidebarItem {
  id: string
  icon: LucideIcon
  label: string
  route?: string
}

interface SidebarProps {
  currentPage?: 'dashboard' | 'security' | 'profile' | 'settings' | 'notifications'
  onTabChange?: (tabId: string) => void
  activeTab?: string
  mobileMenuOpen?: boolean
  setMobileMenuOpen?: (open: boolean) => void
}

export function Sidebar({ 
  currentPage = 'dashboard', 
  onTabChange, 
  activeTab,
  mobileMenuOpen = false,
  setMobileMenuOpen = () => {}
}: SidebarProps) {
  const navigate = useNavigate()
  const location = useLocation()
  const currentUser = AuthService.getUser()

  // Dashboard items (avec callback pour changer les tabs)
  const dashboardItems: SidebarItem[] = [
    { id: 'overview', icon: Activity, label: 'Vue d\'ensemble' },
    { id: 'documents', icon: FileText, label: 'Documents' },
    { id: 'prescriptions', icon: Pill, label: 'Ordonnances' },
    { id: 'imaging', icon: Image, label: 'Imagerie' },
    { id: 'allergies', icon: AlertCircle, label: 'Allergies' },
    { id: 'history', icon: Clock, label: 'Historique' },
  ]

  // Pages principales
  const mainPages: SidebarItem[] = [
    { id: 'notifications', icon: Bell, label: 'Notifications', route: '/notifications' },
    { id: 'security', icon: Shield, label: 'Sécurité', route: '/security' },
    { id: 'profile', icon: UserCircle, label: 'Profile', route: '/profile' },
    { id: 'settings', icon: Settings, label: 'Paramètres', route: '/settings' },
  ]

  const handleLogout = () => {
    if (window.confirm('Êtes-vous sûr de vouloir vous déconnecter ?')) {
      AuthService.logout()
      navigate('/login')
    }
  }

  const handleItemClick = (item: SidebarItem) => {
    if (!item.route) {
      // C'est un item de dashboard (tab)
      if (currentPage === 'dashboard' && onTabChange) {
        // Si on est déjà sur le dashboard, changer juste le tab
        onTabChange(item.id)
      } else {
        // Sinon naviguer vers le dashboard avec le bon tab
        navigate('/dashboard')
        // Le tab sera sélectionné par défaut ou il faudrait un state management global
      }
    } else {
      // Navigation vers une autre page
      navigate(item.route)
    }
    setMobileMenuOpen(false)
  }

  const isItemActive = (item: SidebarItem) => {
    if (currentPage === 'dashboard' && !item.route) {
      return activeTab === item.id
    }
    if (currentPage === 'settings' && item.route === '/settings') {
      return true
    }
    return item.route === location.pathname
  }

  return (
    <>
      {/* Mobile menu overlay */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        w-72 bg-gradient-to-b from-slate-900 to-slate-800 text-white flex flex-col fixed h-screen z-50
        transform transition-transform duration-300 ease-in-out
        ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0
      `}>
        {/* User info */}
        <div className="p-4 lg:p-6 border-b border-slate-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 lg:w-12 lg:h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center flex-shrink-0">
              <User className="w-5 h-5 lg:w-6 lg:h-6 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm lg:text-base truncate">{currentUser?.firstName} {currentUser?.lastName}</p>
              <p className="text-xs lg:text-sm text-slate-400 truncate">{currentUser?.email}</p>
            </div>
            {/* Close button mobile */}
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="lg:hidden p-2 hover:bg-slate-700 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-2 lg:p-4 space-y-1 overflow-y-auto">
          {/* Afficher les items du dashboard sur toutes les pages */}
          {dashboardItems.map(item => (
            <button
              key={item.id}
              onClick={() => handleItemClick(item)}
              className={`w-full flex items-center gap-2 lg:gap-3 px-3 lg:px-4 py-2.5 lg:py-3 rounded-xl transition-all text-sm lg:text-base ${
                isItemActive(item)
                  ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg'
                  : 'text-slate-300 hover:bg-slate-700 hover:text-white'
              }`}
            >
              <item.icon className="w-4 h-4 lg:w-5 lg:h-5 flex-shrink-0" />
              <span className="font-medium truncate">{item.label}</span>
            </button>
          ))}
          
          {/* Séparateur */}
          <div className="py-2">
            <div className="border-t border-slate-700"></div>
          </div>
          
          {/* Pages principales */}
          {mainPages.map(page => (
            <button
              key={page.id}
              onClick={() => handleItemClick(page)}
              className={`w-full flex items-center gap-2 lg:gap-3 px-3 lg:px-4 py-2.5 lg:py-3 rounded-xl transition-all text-sm lg:text-base ${
                location.pathname === page.route
                  ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg'
                  : 'text-slate-300 hover:bg-slate-700 hover:text-white'
              }`}
            >
              <page.icon className="w-4 h-4 lg:w-5 lg:h-5 flex-shrink-0" />
              <span className="font-medium">{page.label}</span>
            </button>
          ))}
        </nav>

        {/* Bottom actions */}
        <div className="p-2 lg:p-4 border-t border-slate-700 space-y-1">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-2 lg:gap-3 px-3 lg:px-4 py-2.5 lg:py-3 rounded-xl text-slate-300 hover:bg-slate-700 hover:text-white transition-all text-sm lg:text-base"
          >
            <LogOut className="w-4 h-4 lg:w-5 lg:h-5 flex-shrink-0" />
            <span className="font-medium">Déconnexion</span>
          </button>
        </div>
      </aside>
    </>
  )
}
