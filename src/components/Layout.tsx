import { ReactNode, useState } from 'react'
import { Sidebar } from './Sidebar'
import { Menu } from 'lucide-react'

interface LayoutProps {
  children: ReactNode
  currentPage?: 'dashboard' | 'security' | 'profile' | 'settings' | 'notifications'
  onTabChange?: (tabId: string) => void
  activeTab?: string
  showHeader?: boolean
  headerContent?: ReactNode
}

export function Layout({
  children,
  currentPage = 'dashboard',
  onTabChange,
  activeTab,
  showHeader = false,
  headerContent,
}: LayoutProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <Sidebar
        currentPage={currentPage}
        onTabChange={onTabChange}
        activeTab={activeTab}
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
      />

      {/* Main content */}
      <main className="flex-1 lg:ml-72">
        {showHeader && (
          <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
            <div className="px-4 lg:px-8 py-4 lg:py-6">
              <div className="flex items-center gap-4">
                {/* Mobile menu button */}
                <button
                  onClick={() => setMobileMenuOpen(true)}
                  className="lg:hidden p-2 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <Menu className="w-6 h-6 text-slate-600" />
                </button>
                {headerContent}
              </div>
            </div>
          </header>
        )}
        {children}
      </main>
    </div>
  )
}
