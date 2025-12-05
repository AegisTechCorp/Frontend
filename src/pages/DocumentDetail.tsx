import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import {
  Calendar,
  User,
  FileText,
  Download,
  Stethoscope,
  Pill,
  Activity,
  Heart,
  Loader2,
  Clock,
} from "lucide-react"
import { getDocuments, type Document } from "../api/dashboardApi"
import { Layout } from "../components/Layout"


export default function DocumentListPage() {
  const [documents, setDocuments] = useState<Document[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()

  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        setLoading(true)
        setError(null)
        const docs = await getDocuments()
        setDocuments(docs)
      } catch (err) {
        setError('Erreur lors du chargement des documents')
      } finally {
        setLoading(false)
      }
    }
    fetchDocuments()
  }, [])

  const getDocumentIcon = (type: string) => {
    switch (type) {
      case "exam":
        return <Stethoscope className="w-8 h-8" />
      case "prescription":
        return <Pill className="w-8 h-8" />
      case "imaging":
        return <Activity className="w-8 h-8" />
      case "allergy":
        return <Heart className="w-8 h-8" />
      default:
        return <FileText className="w-8 h-8" />
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
        <p className="text-slate-600 font-medium">Chargement des documents...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-red-600 font-medium">{error}</p>
      </div>
    )
  }

  return (
    <Layout showHeader={true} headerContent={<h1 className="text-2xl font-bold">Tous les documents</h1>}>
      <div className="max-w-4xl mx-auto px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {documents.map(doc => (
            <div key={doc.id} className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6 flex gap-4 items-center cursor-pointer hover:shadow-xl transition" onClick={() => navigate(`/document/${doc.id}`)}>
              <div className={`w-16 h-16 bg-gradient-to-br ${getDocumentColor(doc.type)} rounded-xl flex items-center justify-center text-white shadow-lg`}>
                {getDocumentIcon(doc.type)}
              </div>
              <div className="flex-1">
                <h2 className="text-lg font-bold text-slate-900 mb-1">{doc.title}</h2>
                <p className="text-sm text-slate-600 mb-1">Médecin : {doc.doctor}</p>
                <p className="text-xs text-slate-500">Date : {new Date(doc.date).toLocaleDateString('fr-FR')}</p>
              </div>
              <Download className="w-5 h-5 text-blue-600" />
            </div>
          ))}
        </div>
      </div>
    </Layout>
  )
}
