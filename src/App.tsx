import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Landing from './components/landing'
import LoginPage from './pages/Login'
import DashboardPage from './pages/Dashboard'
import UnlockFolderPage from './pages/UnlockFolder'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/unlock-folder" element={<UnlockFolderPage />} />
      </Routes>
    </Router>
  )
}

export default App
