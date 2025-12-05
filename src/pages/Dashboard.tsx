import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import {
  Lock,
  FileText,
  Upload,
  Search,
  Filter,
  Calendar,
  Trash2,
  Plus,
  Bell,
  Activity,
  Heart,
  Stethoscope,
  Pill,
  FolderPlus,
  Folder,
  FolderOpen,
  Loader2,
  TrendingUp,
  Files,
} from "lucide-react"
import { sanitizeText } from '../utils/sanitizer'
import {
  getDashboardStats,
  getDocuments,
  searchDocuments,
  deleteDocument,
  createMedicalRecord,
  uploadDocument,
  type Document,
  type DashboardStats,
  type DocumentType,
} from "../api/dashboardApi"
import { Layout } from "../components/Layout"

export default function DashboardPage() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<'overview' | 'documents' | 'prescriptions' | 'imaging' | 'allergies' | 'history'>('overview')
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedFilter, setSelectedFilter] = useState<string>("all")
  const [showCreateFolder, setShowCreateFolder] = useState(false)
  const [selectedFolder] = useState<string | null>(null)
  const [showUploadModal, setShowUploadModal] = useState(false)
  
  const [newRecordData, setNewRecordData] = useState({
    title: '',
    type: 'autre' as DocumentType,
    description: '',
  })
  
  const [uploadData, setUploadData] = useState({
    title: '',
    type: 'other' as DocumentType,
    doctor: '',
    folderId: '',
    file: null as File | null,
  })
  
  const [documents, setDocuments] = useState<Document[]>([])
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [filesCount, setFilesCount] = useState<Record<string, number>>({})
  
  const tabLabels: Record<string, string> = {
    overview: 'Vue d\'ensemble',
    documents: 'Documents',
    prescriptions: 'Ordonnances',
    imaging: 'Imagerie',
    allergies: 'Allergies',
    history: 'Historique',
  }

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      setLoading(true)

      const results = await Promise.allSettled([
        getDashboardStats(),
        getDocuments(),
      ])

      if (results[0].status === 'fulfilled') setStats(results[0].value)
      if (results[1].status === 'fulfilled') {
        const docs = results[1].value
        setDocuments(docs)
        
        // Charger le nombre de fichiers pour chaque dossier
        const counts: Record<string, number> = {}
        const { getFilesByMedicalRecord } = await import('../api/filesApi')
        
        await Promise.all(docs.map(async (doc) => {
          try {
            const files = await getFilesByMedicalRecord(doc.id)
            counts[doc.id] = files.length
          } catch {
            counts[doc.id] = 0
          }
        }))
        
        setFilesCount(counts)
      }
    } catch (err) {
      console.error('Erreur lors du chargement:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const performSearch = async () => {
      if (searchQuery.trim()) {
        try {
          const results = await searchDocuments(searchQuery, selectedFilter as DocumentType | 'all')
          setDocuments(results)
        } catch (err) {
          console.error('Erreur de recherche:', err)
        }
      } else {
        try {
          const documentsData = await getDocuments()
          setDocuments(documentsData)
        } catch (err) {
          console.error('Erreur lors du chargement:', err)
        }
      }
    }

    const debounceTimer = setTimeout(performSearch, 300)
    return () => clearTimeout(debounceTimer)
  }, [searchQuery, selectedFilter])

  const handleDeleteDocument = async (documentId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce document ?')) return
    
    try {
      const result = await deleteDocument(documentId)
      if (result.success) {
        await loadDashboardData()
      } else {
        alert(result.error || 'Erreur lors de la suppression')
      }
    } catch (err) {
      console.error('Erreur lors de la suppression:', err)
      alert('Erreur lors de la suppression du document')
    }
  }

  const handleCreateRecord = async () => {
    if (!newRecordData.title.trim()) {
      alert('Veuillez entrer un titre pour le dossier médical')
      return
    }

    try {
      const result = await createMedicalRecord(newRecordData)
      if (result.success) {
        setShowCreateFolder(false)
        setNewRecordData({
          title: '',
          type: 'other',
          description: '',
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
    if (!uploadData.title.trim()) {
      alert('Veuillez entrer un titre pour le dossier')
      return
    }

    try {
      // Si pas de fichier, créer un dossier vide
      if (!uploadData.file) {
        const result = await createMedicalRecord({
          title: uploadData.title,
          type: uploadData.type,
          description: uploadData.doctor ? `Médecin: ${uploadData.doctor}` : '',
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
          alert(result.error || 'Erreur lors de la création du dossier')
        }
      } else {
        // Si fichier présent, créer le dossier avec le fichier
        const result = await uploadDocument({
          title: uploadData.title,
          type: uploadData.type,
          doctor: uploadData.doctor || 'Non spécifié',
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
          alert(result.error || 'Erreur lors de la création')
        }
      }
    } catch (err) {
      console.error('Erreur lors de la création:', err)
      alert('Erreur lors de la création du dossier')
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

  const displayStats = [
    { label: "Dossiers médicaux", value: String(stats?.totalFolders || 0), icon: Folder, color: "from-purple-500 to-pink-500" },
    { label: "Documents", value: String(stats?.totalDocuments || 0), icon: FileText, color: "from-blue-500 to-cyan-500" },
    { label: "Ordonnances", value: String(stats?.totalPrescriptions || 0), icon: Pill, color: "from-green-500 to-emerald-500" },
    { label: "Examens", value: String(stats?.totalExams || 0), icon: Stethoscope, color: "from-orange-500 to-red-500" },
  ]

  const filteredDocuments = selectedFolder
    ? documents.filter((doc) => doc.folderId === selectedFolder)
    : documents

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
    <Layout
      currentPage="dashboard"
      onTabChange={(tabId) => setActiveTab(tabId as typeof activeTab)}
      activeTab={activeTab}
      showHeader={true}
      headerContent={
        <>
          <div className="min-w-0 flex-1">
            <h2 className="text-lg lg:text-2xl font-bold text-slate-900 truncate">
              {tabLabels[activeTab] || 'Vue d\'ensemble'}
            </h2>
            <p className="text-xs lg:text-sm text-slate-500 mt-1 hidden sm:block">
              Dernière mise à jour : {new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>

          <div className="flex items-center gap-2 lg:gap-4">
                {}
                <div className="relative hidden md:block">
                  <Search className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Rechercher..."
                    className="pl-10 pr-4 py-2 bg-slate-100 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-48 lg:w-64"
                  />
                </div>

                {}
                <button
                  onClick={() => {

                    const searchInput = document.querySelector('input[type="text"]') as HTMLInputElement
                    if (searchInput) searchInput.focus()
                  }}
                  className="md:hidden p-2 hover:bg-slate-100 rounded-xl transition-all"
                >
                  <Search className="w-5 h-5 text-slate-600" />
                </button>

                {}
                <button 
                  onClick={() => setShowUploadModal(true)}
                  className="flex items-center gap-1 lg:gap-2 px-2 lg:px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all text-sm lg:text-base"
                  title="Créer un nouveau dossier médical"
                >
                  <FolderPlus className="w-4 h-4 flex-shrink-0" />
                  <span className="hidden sm:inline">Nouveau dossier</span>
                  <span className="sm:hidden">Nouveau</span>
                </button>

                {}
                <button 
                  onClick={() => navigate('/notifications')}
                  className="relative p-2 hover:bg-slate-100 rounded-xl transition-all flex-shrink-0"
                >
                  <Bell className="w-5 h-5 lg:w-6 lg:h-6 text-slate-600" />
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                </button>
          </div>
      
          {}
          <div className="md:hidden mt-2">
            <div className="relative">
              <Search className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Rechercher..."
                className="w-full pl-10 pr-4 py-2 bg-slate-100 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </>
      }
    >
      {}
      <div className="p-4 lg:p-8">
          {activeTab === 'overview' && (
            <div className="space-y-6 lg:space-y-8">

              {}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-6">
                {displayStats.map((stat, i) => (
                  <div
                    key={i}
                    className="bg-white rounded-xl lg:rounded-2xl p-4 lg:p-6 border border-slate-200 hover:shadow-xl transition-all cursor-pointer"
                    style={{ animation: `fadeIn 0.5s ease-out ${i * 0.1}s both` }}
                  >
                    <div className="flex items-center justify-between mb-3 lg:mb-4">
                      <div className={`w-10 h-10 lg:w-12 lg:h-12 bg-gradient-to-br ${stat.color} rounded-xl flex items-center justify-center`}>
                        <stat.icon className="w-5 h-5 lg:w-6 lg:h-6 text-white" />
                      </div>
                      <TrendingUp className="w-4 h-4 lg:w-5 lg:h-5 text-green-500" />
                    </div>
                    <p className="text-2xl lg:text-3xl font-bold text-slate-900 mb-1">{stat.value}</p>
                    <p className="text-xs lg:text-sm text-slate-500">{stat.label}</p>
                  </div>
                ))}
              </div>

              {}
              <div className="mb-6 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-2xl p-4 lg:p-6 border border-blue-200">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center flex-shrink-0">
                    <FolderOpen className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-slate-900 mb-1">Comment ça marche ?</h3>
                    <p className="text-sm text-slate-700 mb-2">
                      Vos <strong>dossiers médicaux</strong> sont des conteneurs chiffrés qui regroupent vos documents.
                    </p>
                    <ul className="text-sm text-slate-600 space-y-1 list-disc list-inside">
                      <li>Cliquez sur <FolderPlus className="w-4 h-4 inline text-blue-600" /> pour créer un nouveau dossier</li>
                      <li>Ouvrez un dossier pour y ajouter et gérer vos fichiers (PDF, images, etc.)</li>
                      <li>Tous vos documents sont chiffrés de bout en bout 🔒</li>
                    </ul>
                  </div>
                </div>
              </div>

              {}
              <div className="bg-white rounded-xl lg:rounded-2xl p-4 lg:p-6 border border-slate-200 mb-6 lg:mb-8 shadow-sm">
                <div className="flex flex-col gap-3 lg:flex-row lg:gap-4">
                  {}
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 lg:left-4 top-1/2 -translate-y-1/2 w-4 h-4 lg:w-5 lg:h-5 text-slate-400" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Rechercher un dossier..."
                        className="w-full pl-10 lg:pl-12 pr-4 py-2.5 lg:py-3 bg-slate-50 border-2 border-slate-200 rounded-xl focus:border-blue-500 focus:bg-white focus:outline-none transition-all text-slate-900 placeholder:text-slate-400 text-sm lg:text-base"
                      />
                    </div>
                  </div>

                  {}
                  <div className="flex items-center gap-2 lg:gap-3">
                    <div className="relative flex-1 lg:flex-none">
                      <Filter className="absolute left-3 lg:left-4 top-1/2 -translate-y-1/2 w-4 h-4 lg:w-5 lg:h-5 text-slate-400 pointer-events-none" />
                      <select
                        value={selectedFilter}
                        onChange={(e) => setSelectedFilter(e.target.value)}
                        className="w-full lg:w-auto pl-10 lg:pl-12 pr-8 py-2.5 lg:py-3 bg-slate-50 border-2 border-slate-200 rounded-xl focus:border-blue-500 focus:bg-white focus:outline-none transition-all text-slate-900 appearance-none cursor-pointer text-sm lg:text-base"
                      >
                        <option value="all">Tous</option>
                        <option value="exam">Examens</option>
                        <option value="prescription">Ordonnances</option>
                        <option value="imaging">Imageries</option>
                        <option value="allergy">Allergies</option>
                      </select>
                    </div>

                    {}
                    <button 
                      onClick={() => setShowUploadModal(true)}
                      className="px-4 lg:px-6 py-2.5 lg:py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl font-semibold hover:shadow-lg hover:scale-[1.02] transition-all flex items-center gap-2 whitespace-nowrap text-sm lg:text-base"
                    >
                      <Plus className="w-4 h-4 lg:w-5 lg:h-5" />
                      <span className="hidden sm:inline">Ajouter</span>
                      <span className="sm:hidden">+</span>
                    </button>
                  </div>
                </div>
              </div>

              {}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg lg:text-xl font-bold text-slate-900">Dossiers sécurisés</h2>
                  <button
                    onClick={() => setShowUploadModal(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-all text-sm"
                  >
                    <FolderPlus className="w-4 h-4" />
                    Nouveau dossier
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {filteredDocuments.map((doc, i) => (
                    <div
                      key={doc.id}
                      onClick={() => navigate(`/document/${doc.id}`)}
                      className="bg-white rounded-xl border border-slate-200 p-6 hover:shadow-lg transition-all cursor-pointer group"
                      style={{ animation: `fadeIn 0.5s ease-out ${i * 0.05}s both` }}
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center flex-shrink-0">
                            <Folder className="w-6 h-6 text-white" />
                          </div>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-green-600">
                          <Lock className="w-4 h-4" />
                          <span>Chiffré</span>
                        </div>
                      </div>

                      <h3 className="font-bold text-slate-900 mb-2 truncate">{doc.title}</h3>
                      <p className="text-sm text-slate-500">{filesCount[doc.id] || 0} documents</p>
                    </div>
                  ))}
                </div>
              </div>

              {}
              <div 
                className="mt-6 lg:mt-8 bg-white rounded-xl lg:rounded-2xl border-2 border-dashed border-slate-300 p-6 lg:p-12 text-center hover:border-blue-500 hover:bg-blue-50/50 transition-all cursor-pointer group"
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onClick={() => setShowUploadModal(true)}
              >
                <div className="inline-flex items-center justify-center w-12 h-12 lg:w-16 lg:h-16 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-xl lg:rounded-2xl mb-3 lg:mb-4 group-hover:scale-110 transition-transform">
                  <Upload className="w-6 h-6 lg:w-8 lg:h-8 text-white" />
                </div>
                <h3 className="text-lg lg:text-xl font-bold text-slate-900 mb-2">Glissez vos fichiers ici</h3>
                <p className="text-sm lg:text-base text-slate-600 mb-3 lg:mb-4">ou cliquez pour parcourir vos documents</p>
                <p className="text-xs lg:text-sm text-slate-500">PDF, JPG, PNG jusqu'à 50 MB</p>
              </div>
            </div>
          )}

          {activeTab === 'documents' && (
            <div className="space-y-6 lg:space-y-8">
              {}
              <div className="bg-white rounded-xl lg:rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                <div className="p-4 lg:p-6 border-b border-slate-200">
                  <h2 className="text-lg lg:text-xl font-bold text-slate-900">Mes dossiers médicaux</h2>
                </div>
                <div className="divide-y divide-slate-200">
                  {filteredDocuments.map((doc, i) => (
                    <div
                      key={doc.id}
                      onClick={() => navigate(`/document/${doc.id}`)}
                      className="p-4 lg:p-6 hover:bg-blue-50 transition-all group cursor-pointer border-l-4 border-transparent hover:border-blue-500 rounded-r-lg"
                      style={{ animation: `fadeIn 0.5s ease-out ${i * 0.05}s both` }}
                    >
                      <div className="flex items-start gap-3 lg:gap-4">
                        <div className={`w-12 h-12 lg:w-14 lg:h-14 bg-gradient-to-br ${getDocumentColor(doc.type)} rounded-xl flex items-center justify-center flex-shrink-0 text-white group-hover:scale-110 transition-transform relative`}>
                          <FolderOpen className="w-6 h-6 lg:w-7 lg:h-7" />
                          <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-white rounded-full flex items-center justify-center shadow-md">
                            {getDocumentIcon(doc.type)}
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-1.5 lg:gap-2 mb-1">
                            <h3 className="font-bold text-sm lg:text-base text-slate-900 truncate">{doc.title}</h3>
                            <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full font-semibold whitespace-nowrap">
                              Dossier médical
                            </span>
                            <Lock className="w-3 h-3 lg:w-4 lg:h-4 text-green-500 flex-shrink-0" />
                          </div>
                          <div className="flex flex-wrap items-center gap-2 lg:gap-4 text-xs lg:text-sm text-slate-500">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3 lg:w-4 lg:h-4" />
                              {new Date(doc.date).toLocaleDateString("fr-FR")}
                            </span>
                            <span className="flex items-center gap-1 font-medium text-blue-600">
                              <Files className="w-3 h-3 lg:w-4 lg:h-4" />
                              Contient des fichiers
                            </span>
                          </div>
                          <p className="text-xs text-slate-400 mt-1 hidden lg:block group-hover:text-blue-600 transition-colors">
                            → Cliquez pour ouvrir ce dossier et gérer ses documents
                          </p>
                        </div>
                        <div className="flex items-center gap-1 lg:gap-2 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity flex-shrink-0">
                          <button 
                            onClick={(e) => {
                              e.stopPropagation()
                              navigate(`/document/${doc.id}`)
                            }}
                            className="p-1.5 lg:p-2 text-slate-600 hover:text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                            title="Ouvrir le dossier"
                          >
                            <FolderOpen className="w-4 h-4 lg:w-5 lg:h-5" />
                          </button>
                          <button 
                            onClick={(e) => {
                              e.stopPropagation()
                              handleDeleteDocument(doc.id)
                            }}
                            className="p-1.5 lg:p-2 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Supprimer le dossier"
                          >
                            <Trash2 className="w-4 h-4 lg:w-5 lg:h-5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {(activeTab === 'prescriptions' || activeTab === 'imaging' || activeTab === 'allergies' || activeTab === 'history') && (
            <div className="space-y-8">
              <div className="bg-white rounded-2xl p-8 border border-slate-200 text-center">
                <p className="text-slate-600">Fonctionnalité en cours de développement</p>
              </div>
            </div>
          )}
      </div>

      {}
      {showCreateFolder && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 lg:p-6">
          <div className="bg-white rounded-2xl lg:rounded-3xl p-6 lg:p-8 max-w-md w-full shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-xl flex items-center justify-center">
                <FolderPlus className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-900">Créer un dossier médical</h2>
                <p className="text-sm text-slate-600">Organisez vos documents médicaux</p>
              </div>
            </div>
            
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Titre du dossier *</label>
                <input
                  type="text"
                  value={newRecordData.title}
                  onChange={(e) => setNewRecordData({ ...newRecordData, title: e.target.value })}
                  placeholder="Ex: Analyses sanguines 2024"
                  className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl focus:border-blue-500 focus:bg-white focus:outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Type de dossier *</label>
                <select
                  value={newRecordData.type}
                  onChange={(e) => setNewRecordData({ ...newRecordData, type: e.target.value as DocumentType })}
                  className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl focus:border-blue-500 focus:bg-white focus:outline-none transition-all"
                >
                  <option value="exam">Examen médical</option>
                  <option value="prescription">Ordonnance</option>
                  <option value="imaging">Imagerie</option>
                  <option value="allergy">Allergie</option>
                  <option value="other">Autre</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Description (optionnel)</label>
                <textarea
                  value={newRecordData.description}
                  onChange={(e) => setNewRecordData({ ...newRecordData, description: e.target.value })}
                  placeholder="Ex: Suivi annuel, examens de routine..."
                  rows={3}
                  className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl focus:border-blue-500 focus:bg-white focus:outline-none transition-all resize-none"
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowCreateFolder(false)
                  setNewRecordData({
                    title: '',
                    type: 'other',
                    description: '',
                  })
                }}
                className="flex-1 py-3 border-2 border-slate-200 text-slate-700 rounded-xl font-semibold hover:bg-slate-50 transition-all"
              >
                Annuler
              </button>
              <button
                onClick={handleCreateRecord}
                className="flex-1 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all"
              >
                Créer le dossier
              </button>
            </div>
            
            <p className="text-xs text-slate-500 text-center mt-4">
              Vous pourrez ajouter des fichiers (PDF, images) après la création
            </p>
          </div>
        </div>
      )}

      {}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 lg:p-6">
          <div className="bg-white rounded-2xl lg:rounded-3xl p-6 lg:p-8 max-w-md w-full shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-xl flex items-center justify-center">
                <FolderPlus className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-900">Nouveau dossier médical</h2>
                <p className="text-sm text-slate-600">Créez un dossier (avec ou sans fichier initial)</p>
              </div>
            </div>
            
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Titre du dossier *</label>
                <input
                  type="text"
                  value={uploadData.title}
                  onChange={(e) => setUploadData({ ...uploadData, title: e.target.value })}
                  placeholder="Ex: Analyses sanguines 2024"
                  className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl focus:border-blue-500 focus:bg-white focus:outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Type de dossier *</label>
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
                <label className="block text-sm font-semibold text-slate-700 mb-2">Médecin (optionnel)</label>
                <input
                  type="text"
                  value={uploadData.doctor}
                  onChange={(e) => setUploadData({ ...uploadData, doctor: e.target.value })}
                  placeholder="Ex: Dr. Martin"
                  className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl focus:border-blue-500 focus:bg-white focus:outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Fichier initial (optionnel)</label>
                <input
                  type="file"
                  onChange={handleFileSelect}
                  accept=".pdf,.jpg,.jpeg,.png"
                  className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl focus:border-blue-500 focus:bg-white focus:outline-none transition-all file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-600 hover:file:bg-blue-100"
                />
                {uploadData.file && (
                  <p className="text-sm text-slate-600 mt-2">
                    Fichier sélectionné: {sanitizeText(uploadData.file.name)}
                  </p>
                )}
              </div>
            </div>

            <button
              onClick={handleUploadDocument}
              className="w-full py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all"
            >
              Créer le dossier
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
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

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
    </Layout>
  )
}
