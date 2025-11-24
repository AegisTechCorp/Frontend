import { useState } from "react"
import { Link } from "react-router-dom"
import {
  Shield,
  Lock,
  FileText,
  Upload,
  Search,
  Filter,
  Calendar,
  Download,
  Eye,
  Trash2,
  Plus,
  User,
  Bell,
  LogOut,
  Activity,
  Heart,
  Stethoscope,
  Pill,
  Menu,
  X,
  FolderPlus,
  Folder,
  FileSpreadsheet,
  Camera,
  Settings,
  ChevronDown,
  type LucideIcon,
} from "lucide-react"

type Document = {
  id: string
  title: string
  type: "exam" | "prescription" | "imaging" | "allergy"
  date: string
  doctor: string
  size: string
  folderId?: string
}

type SecureFolder = {
  id: string
  name: string
  icon: LucideIcon
  color: string
  documentCount: number
  isLocked: boolean
  unlockMethod: "pin" | "biometric"
}

export default function DashboardPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedFilter, setSelectedFilter] = useState<string>("all")
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [showCreateFolder, setShowCreateFolder] = useState(false)
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null)
  const [showUserPopover, setShowUserPopover] = useState(false)

  const [folders, setFolders] = useState<SecureFolder[]>([
    {
      id: "1",
      name: "Analyses médicales",
      icon: Stethoscope,
      color: "from-blue-500 to-cyan-500",
      documentCount: 8,
      isLocked: true,
      unlockMethod: "pin",
    },
    {
      id: "2",
      name: "Ordonnances",
      icon: Pill,
      color: "from-green-500 to-emerald-500",
      documentCount: 12,
      isLocked: true,
      unlockMethod: "biometric",
    },
    {
      id: "3",
      name: "Imageries",
      icon: Camera,
      color: "from-purple-500 to-pink-500",
      documentCount: 5,
      isLocked: true,
      unlockMethod: "pin",
    },
  ])

  const documents: Document[] = [
    {
      id: "1",
      title: "Analyses sanguines complètes",
      type: "exam",
      date: "2024-01-15",
      doctor: "Dr. Martin",
      size: "2.3 MB",
      folderId: "1",
    },
    {
      id: "2",
      title: "IRM lombaire",
      type: "imaging",
      date: "2024-01-12",
      doctor: "Dr. Lefebvre",
      size: "15.8 MB",
      folderId: "3",
    },
    {
      id: "3",
      title: "Ordonnance antibiotiques",
      type: "prescription",
      date: "2024-01-10",
      doctor: "Dr. Martin",
      size: "0.5 MB",
      folderId: "2",
    },
    {
      id: "4",
      title: "Allergie pénicilline",
      type: "allergy",
      date: "2023-12-05",
      doctor: "Dr. Dubois",
      size: "0.3 MB",
    },
  ]

  const getDocumentIcon = (type: string) => {
    switch (type) {
      case "exam":
        return <Stethoscope className="w-5 h-5" />
      case "prescription":
        return <Pill className="w-5 h-5" />
      case "imaging":
        return <Activity className="w-5 h-5" />
      case "allergy":
        return <Heart className="w-5 h-5" />
      default:
        return <FileText className="w-5 h-5" />
    }
  }

  const getDocumentColor = (type: string) => {
    switch (type) {
      case "exam":
        return "from-blue-500 to-cyan-500"
      case "prescription":
        return "from-green-500 to-emerald-500"
      case "imaging":
        return "from-purple-500 to-pink-500"
      case "allergy":
        return "from-red-500 to-orange-500"
      default:
        return "from-slate-500 to-slate-600"
    }
  }

  const getDocumentLabel = (type: string) => {
    switch (type) {
      case "exam":
        return "Examen"
      case "prescription":
        return "Ordonnance"
      case "imaging":
        return "Imagerie"
      case "allergy":
        return "Allergie"
      default:
        return "Document"
    }
  }

  const stats = [
    { label: "Documents", value: "25", icon: FileText, color: "from-blue-500 to-cyan-500" },
    { label: "Dossiers", value: String(folders.length), icon: Folder, color: "from-purple-500 to-pink-500" },
    { label: "Ordonnances", value: "12", icon: Pill, color: "from-green-500 to-emerald-500" },
    { label: "Examens", value: "8", icon: Stethoscope, color: "from-cyan-500 to-blue-500" },
  ]

  const filteredDocuments = selectedFolder
    ? documents.filter((doc) => doc.folderId === selectedFolder)
    : documents

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40 backdrop-blur-xl bg-white/80">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3">
              <div className="relative">
                <Shield className="w-8 h-8 text-blue-600" strokeWidth={2.5} />
                <Lock className="w-4 h-4 text-cyan-500 absolute -bottom-1 -right-1" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent tracking-tight">
                Aegis
              </span>
            </Link>

            {/* Desktop navigation */}
            <div className="hidden md:flex items-center gap-6">
              <button className="relative p-2 text-slate-600 hover:text-blue-600 transition-colors">
                <Bell className="w-6 h-6" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
              </button>
              <div className="relative">
                <button
                  onClick={() => setShowUserPopover(!showUserPopover)}
                  className="flex items-center gap-3 pl-6 border-l border-slate-200 hover:bg-slate-50 py-2 px-3 rounded-lg transition-colors"
                >
                  <div className="text-right">
                    <p className="text-sm font-semibold text-slate-900">Jean Dupont</p>
                    <p className="text-xs text-slate-500">jean.dupont@email.fr</p>
                  </div>
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-white" />
                  </div>
                  <ChevronDown className="w-4 h-4 text-slate-400" />
                </button>

                {/* User Popover */}
                {showUserPopover && (
                  <>
                    <div 
                      className="fixed inset-0 z-40" 
                      onClick={() => setShowUserPopover(false)}
                    />
                    <div className="absolute right-0 top-full mt-2 w-72 bg-white rounded-2xl shadow-2xl border border-slate-200 z-50 overflow-hidden">
                      {/* Header */}
                      <div className="bg-gradient-to-br from-blue-500 to-cyan-500 p-6 text-white">
                        <div className="flex items-center gap-4 mb-3">
                          <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center ring-4 ring-white/30">
                            <User className="w-8 h-8" />
                          </div>
                          <div>
                            <h3 className="font-bold text-lg">Jean Dupont</h3>
                            <p className="text-blue-100 text-sm">jean.dupont@email.fr</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Shield className="w-4 h-4" />
                          <span>Compte vérifié</span>
                        </div>
                      </div>

                      {/* Menu Items */}
                      <div className="p-2">
                        <button className="w-full flex items-center gap-3 px-4 py-3 text-slate-700 hover:bg-slate-50 rounded-xl transition-colors group">
                          <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                            <User className="w-5 h-5 text-slate-600 group-hover:text-blue-600" />
                          </div>
                          <div className="text-left flex-1">
                            <p className="font-semibold text-sm">Mon profil</p>
                            <p className="text-xs text-slate-500">Gérer mes informations</p>
                          </div>
                        </button>

                        <button className="w-full flex items-center gap-3 px-4 py-3 text-slate-700 hover:bg-slate-50 rounded-xl transition-colors group">
                          <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                            <Settings className="w-5 h-5 text-slate-600 group-hover:text-blue-600" />
                          </div>
                          <div className="text-left flex-1">
                            <p className="font-semibold text-sm">Paramètres</p>
                            <p className="text-xs text-slate-500">Configuration du compte</p>
                          </div>
                        </button>

                        <button className="w-full flex items-center gap-3 px-4 py-3 text-slate-700 hover:bg-slate-50 rounded-xl transition-colors group">
                          <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                            <Shield className="w-5 h-5 text-slate-600 group-hover:text-blue-600" />
                          </div>
                          <div className="text-left flex-1">
                            <p className="font-semibold text-sm">Sécurité</p>
                            <p className="text-xs text-slate-500">Mot de passe et 2FA</p>
                          </div>
                        </button>

                        <div className="h-px bg-slate-200 my-2" />

                        <button className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-xl transition-colors group">
                          <div className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center group-hover:bg-red-100 transition-colors">
                            <LogOut className="w-5 h-5" />
                          </div>
                          <div className="text-left flex-1">
                            <p className="font-semibold text-sm">Déconnexion</p>
                            <p className="text-xs text-red-400">Quitter l'application</p>
                          </div>
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Mobile menu button */}
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden p-2 text-slate-600">
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Mobile menu */}
          {mobileMenuOpen && (
            <div className="md:hidden mt-4 pb-4 border-t border-slate-200 pt-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900">Jean Dupont</p>
                  <p className="text-xs text-slate-500">jean.dupont@email.fr</p>
                </div>
              </div>
              <div className="space-y-2">
                <button className="w-full flex items-center gap-3 px-4 py-2 text-slate-600 hover:bg-slate-50 rounded-lg transition-colors">
                  <Bell className="w-5 h-5" />
                  <span>Notifications</span>
                </button>
                <button className="w-full flex items-center gap-3 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                  <LogOut className="w-5 h-5" />
                  <span>Déconnexion</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-6 lg:px-8 py-8">
        {/* Welcome section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Bonjour, Jean 👋</h1>
          <p className="text-slate-600">Gérez vos dossiers médicaux sécurisés</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((stat, i) => (
            <div
              key={i}
              className="bg-white rounded-2xl p-6 border border-slate-200 hover:shadow-lg transition-all"
              style={{ animation: `fadeInUp 0.5s ease-out ${i * 0.1}s both` }}
            >
              <div
                className={`w-12 h-12 bg-gradient-to-br ${stat.color} rounded-xl flex items-center justify-center mb-4`}
              >
                <stat.icon className="w-6 h-6 text-white" />
              </div>
              <p className="text-3xl font-bold text-slate-900 mb-1">{stat.value}</p>
              <p className="text-sm text-slate-600">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Secure Folders Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-slate-900">Dossiers sécurisés</h2>
            <button
              onClick={() => setShowCreateFolder(true)}
              className="px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl font-semibold hover:shadow-lg hover:scale-[1.02] transition-all flex items-center gap-2"
            >
              <FolderPlus className="w-5 h-5" />
              <span className="hidden sm:inline">Nouveau dossier</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            {folders.map((folder, i) => (
              <button
                key={folder.id}
                onClick={() => {
                  if (selectedFolder === folder.id) {
                    setSelectedFolder(null)
                  } else {
                    // En production, ouvrir le modal de déverrouillage
                    setSelectedFolder(folder.id)
                  }
                }}
                className={`bg-white rounded-2xl p-6 border-2 ${
                  selectedFolder === folder.id ? "border-blue-500" : "border-slate-200"
                } hover:shadow-lg transition-all text-left group`}
                style={{ animation: `fadeInUp 0.5s ease-out ${i * 0.1}s both` }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-16 h-16 bg-gradient-to-br ${folder.color} rounded-2xl flex items-center justify-center shadow-lg`}>
                    <folder.icon className="w-8 h-8 text-white" strokeWidth={2} />
                  </div>
                  <div className="flex items-center gap-2">
                    <Lock className="w-5 h-5 text-green-600" />
                    <span className="text-xs font-semibold text-slate-500">
                      {folder.unlockMethod === "pin" ? "PIN" : "Bio"}
                    </span>
                  </div>
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2 group-hover:text-blue-600 transition-colors">
                  {folder.name}
                </h3>
                <p className="text-sm text-slate-600">{folder.documentCount} documents</p>
              </button>
            ))}
          </div>
        </div>

        {/* Actions bar */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 mb-8 shadow-sm">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Rechercher un document..."
                  className="w-full pl-12 pr-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl focus:border-blue-500 focus:bg-white focus:outline-none transition-all text-slate-900 placeholder:text-slate-400"
                />
              </div>
            </div>

            {/* Filter */}
            <div className="flex items-center gap-3">
              <div className="relative">
                <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
                <select
                  value={selectedFilter}
                  onChange={(e) => setSelectedFilter(e.target.value)}
                  className="pl-12 pr-8 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl focus:border-blue-500 focus:bg-white focus:outline-none transition-all text-slate-900 appearance-none cursor-pointer"
                >
                  <option value="all">Tous</option>
                  <option value="exam">Examens</option>
                  <option value="prescription">Ordonnances</option>
                  <option value="imaging">Imageries</option>
                  <option value="allergy">Allergies</option>
                </select>
              </div>

              {/* Upload button */}
              <button className="px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl font-semibold hover:shadow-lg hover:scale-[1.02] transition-all flex items-center gap-2 whitespace-nowrap">
                <Plus className="w-5 h-5" />
                <span className="hidden sm:inline">Ajouter</span>
              </button>
            </div>
          </div>
        </div>

        {/* Documents list */}
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="p-6 border-b border-slate-200">
            <h2 className="text-xl font-bold text-slate-900">
              {selectedFolder ? `Documents du dossier` : "Tous les documents"}
            </h2>
            {selectedFolder && (
              <button
                onClick={() => setSelectedFolder(null)}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium mt-1"
              >
                ← Retour à tous les documents
              </button>
            )}
          </div>

          <div className="divide-y divide-slate-200">
            {filteredDocuments.map((doc, i) => (
              <div
                key={doc.id}
                className="p-6 hover:bg-slate-50 transition-colors group"
                style={{ animation: `fadeInUp 0.5s ease-out ${i * 0.05}s both` }}
              >
                <div className="flex items-center gap-4">
                  {/* Icon */}
                  <div
                    className={`w-12 h-12 bg-gradient-to-br ${getDocumentColor(doc.type)} rounded-xl flex items-center justify-center flex-shrink-0 text-white`}
                  >
                    {getDocumentIcon(doc.type)}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-slate-900 truncate">{doc.title}</h3>
                      <span className="px-2 py-0.5 bg-slate-100 text-slate-600 text-xs rounded-full font-medium">
                        {getDocumentLabel(doc.type)}
                      </span>
                      <Lock className="w-4 h-4 text-green-500 flex-shrink-0" />
                    </div>
                    <div className="flex items-center gap-4 text-sm text-slate-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {new Date(doc.date).toLocaleDateString("fr-FR")}
                      </span>
                      <span>{doc.doctor}</span>
                      <span>{doc.size}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="p-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                      <Eye className="w-5 h-5" />
                    </button>
                    <button className="p-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                      <Download className="w-5 h-5" />
                    </button>
                    <button className="p-2 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Upload zone */}
        <div className="mt-8 bg-white rounded-2xl border-2 border-dashed border-slate-300 p-12 text-center hover:border-blue-500 hover:bg-blue-50/50 transition-all cursor-pointer group">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-2xl mb-4 group-hover:scale-110 transition-transform">
            <Upload className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-2">Glissez vos fichiers ici</h3>
          <p className="text-slate-600 mb-4">ou cliquez pour parcourir vos documents</p>
          <p className="text-sm text-slate-500">PDF, JPG, PNG jusqu'à 50 MB</p>
        </div>
      </main>

      {/* Create Folder Modal */}
      {showCreateFolder && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-6">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Créer un dossier sécurisé</h2>
            <p className="text-slate-600 mb-6">
              Les dossiers sont protégés par un code PIN ou une empreinte digitale
            </p>
            <button
              onClick={() => setShowCreateFolder(false)}
              className="w-full py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all"
            >
              Créer le dossier
            </button>
            <button
              onClick={() => setShowCreateFolder(false)}
              className="w-full mt-3 py-3 text-slate-600 hover:bg-slate-50 rounded-xl font-semibold transition-all"
            >
              Annuler
            </button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
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
