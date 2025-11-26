import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Landing from './components/landing'
import LoginPage from './pages/Login'
import SignupPage from './pages/Signup'
import DashboardPage from './pages/Dashboard'
import UnlockFolderPage from './pages/UnlockFolder'
import ZeroKnowledgeTest from './pages/ZeroKnowledgeTest'
import ProtectedRoute from './components/ProtectedRoute'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/register" element={<SignupPage />} />
        <Route path="/zk-test" element={<ZeroKnowledgeTest />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/unlock-folder"
          element={
            <ProtectedRoute>
              <UnlockFolderPage />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  )
}

export default App
