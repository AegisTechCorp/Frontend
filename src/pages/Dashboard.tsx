import React, { useState } from 'react';
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
  Stethoscope,
  PanelBottom,
  Heart,
  Activity,
  Menu,
  X,
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';

type Document = {
  id: string;
  title: string;
  type: 'exam' | 'prescription' | 'imaging' | 'allergy';
  date: string;
  doctor: string;
  size: string;
};

const Dashboard: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const documents: Document[] = [
    {
      id: '1',
      title: 'Analyses sanguines complètes',
      type: 'exam',
      date: '2024-01-15',
      doctor: 'Dr. Martin',
      size: '2.3 MB',
    },
    {
      id: '2',
      title: 'IRM lombaire',
      type: 'imaging',
      date: '2024-01-12',
      doctor: 'Dr. Lefebvre',
      size: '15.8 MB',
    },
    {
      id: '3',
      title: 'Ordonnance antibiotiques',
      type: 'prescription',
      date: '2024-01-10',
      doctor: 'Dr. Martin',
      size: '0.5 MB',
    },
    {
      id: '4',
      title: 'Allergie pénicilline',
      type: 'allergy',
      date: '2023-12-05',
      doctor: 'Dr. Dubois',
      size: '0.3 MB',
    },
  ];

  const stats = [
    {
      label: 'Documents',
      value: '24',
      icon: FileText,
      color: 'from-blue-500 to-cyan-500',
    },
    {
      label: 'Examens',
      value: '8',
      icon: Stethoscope,
      color: 'from-green-500 to-emerald-500',
    },
    {
      label: 'Ordonnances',
      value: '12',
      icon: PanelBottom,
      color: 'from-purple-500 to-pink-500',
    },
    {
      label: 'Allergies',
      value: '4',
      icon: Heart,
      color: 'from-red-500 to-orange-500',
    },
  ];

  const getDocumentIcon = (type: string) => {
    const iconClass = 'w-5 h-5';
    switch (type) {
      case 'exam':
        return <Stethoscope className={iconClass} />;
      case 'prescription':
        return <PanelBottom className={iconClass} />;
      case 'imaging':
        return <Activity className={iconClass} />;
      case 'allergy':
        return <Heart className={iconClass} />;
      default:
        return <FileText className={iconClass} />;
    }
  };

  const getDocumentColor = (type: string) => {
    switch (type) {
      case 'exam':
        return 'from-blue-500 to-cyan-500';
      case 'prescription':
        return 'from-green-500 to-emerald-500';
      case 'imaging':
        return 'from-purple-500 to-pink-500';
      case 'allergy':
        return 'from-red-500 to-orange-500';
      default:
        return 'from-slate-500 to-slate-600';
    }
  };

  const getDocumentLabel = (type: string) => {
    switch (type) {
      case 'exam':
        return 'Examen';
      case 'prescription':
        return 'Ordonnance';
      case 'imaging':
        return 'Imagerie';
      case 'allergy':
        return 'Allergie';
      default:
        return 'Document';
    }
  };

  const filteredDocuments = documents.filter(
    (doc) =>
      (selectedFilter === 'all' || doc.type === selectedFilter) &&
      doc.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="relative">
                <Shield className="w-8 h-8 text-blue-600" strokeWidth={2.5} />
                <Lock className="w-4 h-4 text-cyan-500 absolute -bottom-1 -right-1" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                Aegis
              </span>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-6">
              <button className="relative p-2 text-slate-600 hover:text-blue-600 transition-colors">
                <Bell className="w-6 h-6" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
              </button>
              <div className="flex items-center gap-3 pl-6 border-l border-slate-200">
                <div className="text-right">
                  <p className="text-sm font-semibold text-slate-900">Jean Dupont</p>
                  <p className="text-xs text-slate-500">jean.dupont@email.fr</p>
                </div>
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-white" />
                </div>
              </div>
              <button className="p-2 text-slate-600 hover:text-red-600 transition-colors">
                <LogOut className="w-6 h-6" />
              </button>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-slate-600"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden mt-4 pb-4 border-t border-slate-200 pt-4 space-y-2">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900">Jean Dupont</p>
                  <p className="text-xs text-slate-500">jean.dupont@email.fr</p>
                </div>
              </div>
              <button className="w-full flex items-center gap-3 px-4 py-2 text-slate-600 hover:bg-slate-50 rounded-lg transition-colors">
                <Bell className="w-5 h-5" />
                <span>Notifications</span>
              </button>
              <button className="w-full flex items-center gap-3 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                <LogOut className="w-5 h-5" />
                <span>Déconnexion</span>
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2">
            Bonjour, Jean 👋
          </h1>
          <p className="text-slate-600 text-lg">
            Gérez votre dossier médical en toute sécurité
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((stat, i) => {
            const IconComponent = stat.icon;
            return (
              <Card
                key={i}
                className="hover:shadow-lg transition-all hover:border-blue-200"
              >
                <CardContent className="pt-6">
                  <div className={`w-12 h-12 bg-gradient-to-br ${stat.color} rounded-xl flex items-center justify-center mb-4`}>
                    <IconComponent className="w-6 h-6 text-white" />
                  </div>
                  <p className="text-3xl font-bold text-slate-900 mb-1">
                    {stat.value}
                  </p>
                  <p className="text-sm text-slate-600">{stat.label}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Search and Filter Bar */}
        <Card className="mb-8">
          <CardContent className="pt-6">
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
                    className="w-full pl-12 pr-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-lg focus:border-blue-500 focus:bg-white focus:outline-none transition-all text-slate-900 placeholder:text-slate-400"
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
                    className="pl-12 pr-8 py-3 bg-slate-50 border-2 border-slate-200 rounded-lg focus:border-blue-500 focus:bg-white focus:outline-none transition-all text-slate-900 appearance-none cursor-pointer"
                  >
                    <option value="all">Tous</option>
                    <option value="exam">Examens</option>
                    <option value="prescription">Ordonnances</option>
                    <option value="imaging">Imageries</option>
                    <option value="allergy">Allergies</option>
                  </select>
                </div>

                {/* Upload Button */}
                <Button className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:shadow-lg flex items-center gap-2 whitespace-nowrap">
                  <Plus className="w-5 h-5" />
                  <span className="hidden sm:inline">Ajouter</span>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Documents List */}
        <Card>
          <CardHeader>
            <CardTitle>Mes documents</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {filteredDocuments.length > 0 ? (
              <div className="divide-y divide-slate-200">
                {filteredDocuments.map((doc) => (
                  <div
                    key={doc.id}
                    className="p-6 hover:bg-slate-50 transition-colors group"
                  >
                    <div className="flex items-center gap-4">
                      {/* Document Icon */}
                      <div
                        className={`w-12 h-12 bg-gradient-to-br ${getDocumentColor(doc.type)} rounded-xl flex items-center justify-center flex-shrink-0`}
                      >
                        {getDocumentIcon(doc.type)}
                      </div>

                      {/* Document Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <h3 className="font-semibold text-slate-900 truncate">
                            {doc.title}
                          </h3>
                          <span className="px-2 py-0.5 bg-slate-100 text-slate-600 text-xs rounded-full font-medium whitespace-nowrap">
                            {getDocumentLabel(doc.type)}
                          </span>
                          <Lock className="w-4 h-4 text-green-500 flex-shrink-0" />
                        </div>
                        <div className="flex items-center gap-2 md:gap-4 text-sm text-slate-500 flex-wrap">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {new Date(doc.date).toLocaleDateString('fr-FR')}
                          </span>
                          <span className="hidden md:inline">{doc.doctor}</span>
                          <span className="hidden md:inline">{doc.size}</span>
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
            ) : (
              <div className="p-12 text-center">
                <FileText className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-600">Aucun document trouvé</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Upload Zone */}
        <div className="mt-8 bg-white rounded-lg border-2 border-dashed border-slate-300 p-12 text-center hover:border-blue-500 hover:bg-blue-50/50 transition-all cursor-pointer group">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-lg mb-4 group-hover:scale-110 transition-transform">
            <Upload className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-2">
            Glissez vos fichiers ici
          </h3>
          <p className="text-slate-600 mb-4">
            ou cliquez pour parcourir vos documents
          </p>
          <p className="text-sm text-slate-500">PDF, JPG, PNG jusqu'à 50 MB</p>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
