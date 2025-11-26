import { useState, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
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
  Camera,
  Settings,
  ChevronDown,
  Loader2,
  type LucideIcon,
} from "lucide-react"
import {
  getDashboardStats,
  getSecureFolders,
  getDocuments,
  searchDocuments,
  deleteDocument,
  downloadDocument,
  createSecureFolder,
  uploadDocument,
  type Document,
  type SecureFolder,
  type DashboardStats,
  type DocumentType,
} from "../api/dashboardApi"
import { logoutUser } from "../api/authApi"
import AuthService from "../services/authService"

// Mapping des icônes
const iconMap: Record<string, LucideIcon> = {
  Stethoscope,
  Pill,
  Camera,
  FileText,
  Folder,
}

export default function DashboardPage() {
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedFilter, setSelectedFilter] = useState<string>("all")
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [showCreateFolder, setShowCreateFolder] = useState(false)
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null)
  const [showUserPopover, setShowUserPopover] = useState(false)
  const [showUploadModal, setShowUploadModal] = useState(false)
  
  // États pour le formulaire de création de dossier
  const [newFolderData, setNewFolderData] = useState({
    name: '',
    icon: 'Folder',
    color: 'from-blue-500 to-cyan-500',
    unlockMethod: 'pin' as 'pin' | 'biometric',
    pin: '',
  })
  
  // États pour le formulaire d'upload
  const [uploadData, setUploadData] = useState({
    title: '',
    type: 'other' as DocumentType,
    doctor: '',
    folderId: '',
    file: null as File | null,
  })
  
  // États pour les données
  const [folders, setFolders] = useState<SecureFolder[]>([])
  const [documents, setDocuments] = useState<Document[]>([])
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  
  // Obtenir les infos utilisateur
  const currentUser = AuthService.getUser()

  useEffect(() => {
    loadDashboardData()
  }, [])

  // Fonction pour charger toutes les données du dashboard
  const loadDashboardData = async () => {
    try {
      setLoading(true)

      // Charger les données en parallèle - ignorer les erreurs individuelles pour l'instant
      const results = await Promise.allSettled([
        getDashboardStats(),
        getSecureFolders(),
        getDocuments(),
      ])

      if (results[0].status === 'fulfilled') setStats(results[0].value)
      if (results[1].status === 'fulfilled') setFolders(results[1].value)
      if (results[2].status === 'fulfilled') setDocuments(results[2].value)

      // Ne pas afficher d'erreur - c'est normal si l'utilisateur vient de créer son compte
      // Les données seront vides jusqu'à ce qu'il ajoute des documents et dossiers
    } catch (err) {
      console.error('Erreur lors du chargement:', err)
      // Ne pas afficher d'erreur critique
    } finally {
      setLoading(false)
    }
  }

  // Effet pour la recherche et le filtrage
  useEffect(() => {
    const performSearch = async () => {
      if (searchQuery.trim()) {
        try {
          const results = await searchDocuments(searchQuery, selectedFilter as DocumentType | 'all')
          setDocuments(results)
        } catch (err) {
          console.error('Erreur de recherche:', err)
          // Ne pas afficher l'erreur, juste garder les documents actuels
        }
      } else {
        // Recharger les documents si pas de recherche
        try {
          const documentsData = await getDocuments()
          setDocuments(documentsData)
        } catch (err) {
          console.error('Erreur lors du chargement:', err)
          // Ne pas afficher l'erreur, garder les documents vides
        }
      }
    }

    const debounceTimer = setTimeout(performSearch, 300)
    return () => clearTimeout(debounceTimer)
  }, [searchQuery, selectedFilter])

  const handleLogout = () => {
    logoutUser()
    navigate('/login')
  }

  const handleDeleteDocument = async (documentId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce document ?')) return
    
    try {
      const result = await deleteDocument(documentId)
      if (result.success) {
        // Recharger les documents après suppression
        await loadDashboardData()
      } else {
        alert(result.error || 'Erreur lors de la suppression')
      }
    } catch (err) {
      console.error('Erreur lors de la suppression:', err)
      alert('Erreur lors de la suppression du document')
    }
  }

  const handleDownloadDocument = async (documentId: string) => {
    try {
      const result = await downloadDocument(documentId)
      if (!result.success) {
        alert(result.error || 'Erreur lors du téléchargement')
      }
    } catch (err) {
      console.error('Erreur lors du téléchargement:', err)
      alert('Erreur lors du téléchargement du document')
    }
  }

  const handleCreateFolder = async () => {
    if (!newFolderData.name.trim()) {
      alert('Veuillez entrer un nom de dossier')
      return
    }
    
    if (newFolderData.unlockMethod === 'pin' && newFolderData.pin.length !== 4) {
      alert('Le code PIN doit contenir exactement 4 chiffres')
      return
    }

    try {
      const result = await createSecureFolder(newFolderData)
      if (result.success) {
        setShowCreateFolder(false)
        setNewFolderData({
          name: '',
          icon: 'Folder',
          color: 'from-blue-500 to-cyan-500',
          unlockMethod: 'pin',
          pin: '',
        })
        await loadDashboardData()
      } else {
        alert(result.error || 'Erreur lors de la création du dossier')
      }
    } catch (err) {
      console.error('Erreur lors de la création:', err)
      alert('Erreur lors de la création du dossier')
    }
  }

  const handleUploadDocument = async () => {
    if (!uploadData.title.trim() || !uploadData.doctor.trim() || !uploadData.file) {
      alert('Veuillez remplir tous les champs et sélectionner un fichier')
      return
    }

    try {
      const result = await uploadDocument({
        title: uploadData.title,
        type: uploadData.type,
        doctor: uploadData.doctor,
        folderId: uploadData.folderId || undefined,
        file: uploadData.file,
      })
      
      if (result.success) {
        setShowUploadModal(false)
        setUploadData({
          title: '',
          type: 'other',
          doctor: '',
          folderId: '',
          file: null,
        })
        await loadDashboardData()
      } else {
        alert(result.error || 'Erreur lors de l\'upload')
      }
    } catch (err) {
      console.error('Erreur lors de l\'upload:', err)
      alert('Erreur lors de l\'upload du document')
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setUploadData({ ...uploadData, file: e.target.files[0] })
    }
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setUploadData({ ...uploadData, file: e.dataTransfer.files[0] })
      setShowUploadModal(true)
    }
  }



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

  const displayStats = [
    { label: "Documents", value: String(stats?.totalDocuments || 0), icon: FileText, color: "from-blue-500 to-cyan-500" },
    { label: "Dossiers", value: String(stats?.totalFolders || 0), icon: Folder, color: "from-purple-500 to-pink-500" },
    { label: "Ordonnances", value: String(stats?.totalPrescriptions || 0), icon: Pill, color: "from-green-500 to-emerald-500" },
    { label: "Examens", value: String(stats?.totalExams || 0), icon: Stethoscope, color: "from-cyan-500 to-blue-500" },
  ]

  const filteredDocuments = selectedFolder
    ? documents.filter((doc) => doc.folderId === selectedFolder)
    : documents

  // État de chargement
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-slate-600 font-medium">Chargement de votre espace...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40 backdrop-blur-xl bg-white/80">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link to="/dashboard" className="flex items-center gap-3">
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
              <button 
                onClick={() => navigate('/notifications')}
                className="relative p-2 text-slate-600 hover:text-blue-600 transition-colors"
                title="Notifications"
              >
                <Bell className="w-6 h-6" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
              </button>
              <div className="relative">
                <button
                  onClick={() => setShowUserPopover(!showUserPopover)}
                  className="flex items-center gap-3 pl-6 border-l border-slate-200 hover:bg-slate-50 py-2 px-3 rounded-lg transition-colors"
                >
                  <div className="text-right">
                    <p className="text-sm font-semibold text-slate-900">
                      {currentUser?.firstName} {currentUser?.lastName}
                    </p>
                    <p className="text-xs text-slate-500">{currentUser?.email}</p>
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
                            <h3 className="font-bold text-lg">
                              {currentUser?.firstName} {currentUser?.lastName}
                            </h3>
                            <p className="text-blue-100 text-sm">{currentUser?.email}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Shield className="w-4 h-4" />
                          <span>Compte vérifié</span>
                        </div>
                      </div>

                      {/* Menu Items */}
                      <div className="p-2">
                        <button 
                          onClick={() => { setShowUserPopover(false); navigate('/profile'); }}
                          className="w-full flex items-center gap-3 px-4 py-3 text-slate-700 hover:bg-slate-50 rounded-xl transition-colors group"
                        >
                          <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                            <User className="w-5 h-5 text-slate-600 group-hover:text-blue-600" />
                          </div>
                          <div className="text-left flex-1">
                            <p className="font-semibold text-sm">Mon profil</p>
                            <p className="text-xs text-slate-500">Gérer mes informations</p>
                          </div>
                        </button>

                        <button 
                          onClick={() => { setShowUserPopover(false); navigate('/settings'); }}
                          className="w-full flex items-center gap-3 px-4 py-3 text-slate-700 hover:bg-slate-50 rounded-xl transition-colors group"
                        >
                          <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                            <Settings className="w-5 h-5 text-slate-600 group-hover:text-blue-600" />
                          </div>
                          <div className="text-left flex-1">
                            <p className="font-semibold text-sm">Paramètres</p>
                            <p className="text-xs text-slate-500">Configuration du compte</p>
                          </div>
                        </button>

                        <button 
                          onClick={() => { setShowUserPopover(false); navigate('/security'); }}
                          className="w-full flex items-center gap-3 px-4 py-3 text-slate-700 hover:bg-slate-50 rounded-xl transition-colors group"
                        >
                          <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                            <Shield className="w-5 h-5 text-slate-600 group-hover:text-blue-600" />
                          </div>
                          <div className="text-left flex-1">
                            <p className="font-semibold text-sm">Sécurité</p>
                            <p className="text-xs text-slate-500">Mot de passe et 2FA</p>
                          </div>
                        </button>

                        <div className="h-px bg-slate-200 my-2" />

                        <button 
                          onClick={handleLogout}
                          className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-xl transition-colors group"
                        >
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
                  <p className="text-sm font-semibold text-slate-900">
                    {currentUser?.firstName} {currentUser?.lastName}
                  </p>
                  <p className="text-xs text-slate-500">{currentUser?.email}</p>
                </div>
              </div>
              <div className="space-y-2">
                <button className="w-full flex items-center gap-3 px-4 py-2 text-slate-600 hover:bg-slate-50 rounded-lg transition-colors">
                  <Bell className="w-5 h-5" />
                  <span>Notifications</span>
                </button>
                <button 
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
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
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            Bonjour, {currentUser?.firstName || 'Utilisateur'} 👋
          </h1>
          <p className="text-slate-600">Gérez vos dossiers médicaux sécurisés</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {displayStats.map((stat, i) => (
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
            {folders.map((folder, i) => {
              const FolderIcon = iconMap[folder.icon] || Folder
              return (
              <button
                key={folder.id}
                onClick={() => {
                  if (selectedFolder === folder.id) {
                    setSelectedFolder(null)
                  } else {
                    // En production, rediriger vers la page de déverrouillage
                    navigate(`/unlock-folder?id=${folder.id}`)
                  }
                }}
                className={`bg-white rounded-2xl p-6 border-2 ${
                  selectedFolder === folder.id ? "border-blue-500" : "border-slate-200"
                } hover:shadow-lg transition-all text-left group`}
                style={{ animation: `fadeInUp 0.5s ease-out ${i * 0.1}s both` }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-16 h-16 bg-gradient-to-br ${folder.color} rounded-2xl flex items-center justify-center shadow-lg`}>
                    <FolderIcon className="w-8 h-8 text-white" strokeWidth={2} />
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
            )})}
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
              <button 
                onClick={() => setShowUploadModal(true)}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl font-semibold hover:shadow-lg hover:scale-[1.02] transition-all flex items-center gap-2 whitespace-nowrap"
              >
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
                    <button 
                      onClick={() => navigate(`/document/${doc.id}`)}
                      className="p-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Voir le document"
                    >
                      <Eye className="w-5 h-5" />
                    </button>
                    <button 
                      onClick={() => handleDownloadDocument(doc.id)}
                      className="p-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Télécharger"
                    >
                      <Download className="w-5 h-5" />
                    </button>
                    <button 
                      onClick={() => handleDeleteDocument(doc.id)}
                      className="p-2 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Supprimer"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Upload zone */}
        <div 
          className="mt-8 bg-white rounded-2xl border-2 border-dashed border-slate-300 p-12 text-center hover:border-blue-500 hover:bg-blue-50/50 transition-all cursor-pointer group"
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onClick={() => setShowUploadModal(true)}
        >
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
            
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Nom du dossier</label>
                <input
                  type="text"
                  value={newFolderData.name}
                  onChange={(e) => setNewFolderData({ ...newFolderData, name: e.target.value })}
                  placeholder="Ex: Analyses médicales"
                  className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl focus:border-blue-500 focus:bg-white focus:outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Icône</label>
                <select
                  value={newFolderData.icon}
                  onChange={(e) => setNewFolderData({ ...newFolderData, icon: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl focus:border-blue-500 focus:bg-white focus:outline-none transition-all"
                >
                  <option value="Folder">Dossier</option>
                  <option value="Stethoscope">Stéthoscope</option>
                  <option value="Pill">Médicament</option>
                  <option value="Camera">Imagerie</option>
                  <option value="FileText">Document</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Couleur</label>
                <select
                  value={newFolderData.color}
                  onChange={(e) => setNewFolderData({ ...newFolderData, color: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl focus:border-blue-500 focus:bg-white focus:outline-none transition-all"
                >
                  <option value="from-blue-500 to-cyan-500">Bleu</option>
                  <option value="from-green-500 to-emerald-500">Vert</option>
                  <option value="from-purple-500 to-pink-500">Violet</option>
                  <option value="from-red-500 to-orange-500">Rouge</option>
                  <option value="from-yellow-500 to-orange-500">Jaune</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Méthode de déverrouillage</label>
                <select
                  value={newFolderData.unlockMethod}
                  onChange={(e) => setNewFolderData({ ...newFolderData, unlockMethod: e.target.value as 'pin' | 'biometric' })}
                  className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl focus:border-blue-500 focus:bg-white focus:outline-none transition-all"
                >
                  <option value="pin">Code PIN</option>
                  <option value="biometric">Biométrie</option>
                </select>
              </div>

              {newFolderData.unlockMethod === 'pin' && (
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Code PIN (4 chiffres)</label>
                  <input
                    type="password"
                    value={newFolderData.pin}
                    onChange={(e) => setNewFolderData({ ...newFolderData, pin: e.target.value.replace(/\D/g, '').slice(0, 4) })}
                    placeholder="••••"
                    maxLength={4}
                    className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl focus:border-blue-500 focus:bg-white focus:outline-none transition-all text-center text-2xl tracking-widest"
                  />
                </div>
              )}
            </div>

            <button
              onClick={handleCreateFolder}
              className="w-full py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all"
            >
              Créer le dossier
            </button>
            <button
              onClick={() => {
                setShowCreateFolder(false)
                setNewFolderData({
                  name: '',
                  icon: 'Folder',
                  color: 'from-blue-500 to-cyan-500',
                  unlockMethod: 'pin',
                  pin: '',
                })
              }}
              className="w-full mt-3 py-3 text-slate-600 hover:bg-slate-50 rounded-xl font-semibold transition-all"
            >
              Annuler
            </button>
          </div>
        </div>
      )}

      {/* Upload Document Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-6">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Ajouter un document</h2>
            
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Titre du document</label>
                <input
                  type="text"
                  value={uploadData.title}
                  onChange={(e) => setUploadData({ ...uploadData, title: e.target.value })}
                  placeholder="Ex: Analyses sanguines"
                  className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl focus:border-blue-500 focus:bg-white focus:outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Type de document</label>
                <select
                  value={uploadData.type}
                  onChange={(e) => setUploadData({ ...uploadData, type: e.target.value as DocumentType })}
                  className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl focus:border-blue-500 focus:bg-white focus:outline-none transition-all"
                >
                  <option value="exam">Examen</option>
                  <option value="prescription">Ordonnance</option>
                  <option value="imaging">Imagerie</option>
                  <option value="allergy">Allergie</option>
                  <option value="other">Autre</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Médecin prescripteur</label>
                <input
                  type="text"
                  value={uploadData.doctor}
                  onChange={(e) => setUploadData({ ...uploadData, doctor: e.target.value })}
                  placeholder="Ex: Dr. Martin"
                  className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl focus:border-blue-500 focus:bg-white focus:outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Dossier (optionnel)</label>
                <select
                  value={uploadData.folderId}
                  onChange={(e) => setUploadData({ ...uploadData, folderId: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl focus:border-blue-500 focus:bg-white focus:outline-none transition-all"
                >
                  <option value="">Aucun dossier</option>
                  {folders.map((folder) => (
                    <option key={folder.id} value={folder.id}>
                      {folder.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Fichier</label>
                <input
                  type="file"
                  onChange={handleFileSelect}
                  accept=".pdf,.jpg,.jpeg,.png"
                  className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl focus:border-blue-500 focus:bg-white focus:outline-none transition-all file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-600 hover:file:bg-blue-100"
                />
                {uploadData.file && (
                  <p className="text-sm text-slate-600 mt-2">
                    Fichier sélectionné: {uploadData.file.name}
                  </p>
                )}
              </div>
            </div>

            <button
              onClick={handleUploadDocument}
              className="w-full py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all"
            >
              Ajouter le document
            </button>
            <button
              onClick={() => {
                setShowUploadModal(false)
                setUploadData({
                  title: '',
                  type: 'other',
                  doctor: '',
                  folderId: '',
                  file: null,
                })
              }}
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
