import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import Home from './pages/Home'
import Listings from './pages/Listings'
import PropertyDetail from './pages/PropertyDetail'
import BuilderDetail from './pages/BuilderDetail'
import Login from './pages/Login'
import UserDashboard from './pages/user/UserDashboard'
import AdminLayout from './pages/admin/AdminLayout'
import Dashboard from './pages/admin/Dashboard'
import AdminProperties from './pages/admin/AdminProperties'
import PropertyForm from './pages/admin/PropertyForm'
import Inquiries from './pages/admin/Inquiries'
import Analytics from './pages/admin/Analytics'
import './App.css'

function ProtectedRoute({ children, adminOnly = false }) {
  const { user, loading, isAdmin } = useAuth()
  if (loading) return <div className="route-loading"><div className="route-spinner"></div></div>
  if (!user) return <Navigate to="/login" replace />
  if (adminOnly && !isAdmin) return (
    <div className="not-admin">
      <div style={{fontSize:48,marginBottom:'1rem'}}>🔒</div>
      <h2>Admin Access Required</h2>
      <p>You don't have permission to view this page.</p>
      <a href="/" className="btn btn-primary" style={{marginTop:'1rem',display:'inline-flex'}}>← Go Home</a>
    </div>
  )
  return children
}

function PublicLayout({ children }) {
  return <>
    <Navbar />
    <main className="main-content">{children}</main>
    <Footer />
  </>
}

function UserLayout({ children }) {
  return <>
    <Navbar />
    <main className="main-content">{children}</main>
  </>
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="app">
          <Routes>
            {/* PUBLIC */}
            <Route path="/"             element={<PublicLayout><Home /></PublicLayout>} />
            <Route path="/listings"     element={<PublicLayout><Listings /></PublicLayout>} />
            <Route path="/property/:id" element={<PublicLayout><PropertyDetail /></PublicLayout>} />
            <Route path="/builder/:id"  element={<PublicLayout><BuilderDetail /></PublicLayout>} />
            <Route path="/login"        element={<Login />} />

            {/* USER DASHBOARD */}
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <UserLayout><UserDashboard defaultTab="overview" /></UserLayout>
              </ProtectedRoute>
            }/>
            <Route path="/dashboard/favorites" element={
              <ProtectedRoute>
                <UserLayout><UserDashboard defaultTab="favorites" /></UserLayout>
              </ProtectedRoute>
            }/>
            <Route path="/dashboard/inquiries" element={
              <ProtectedRoute>
                <UserLayout><UserDashboard defaultTab="inquiries" /></UserLayout>
              </ProtectedRoute>
            }/>
            <Route path="/dashboard/profile" element={
              <ProtectedRoute>
                <UserLayout><UserDashboard defaultTab="profile" /></UserLayout>
              </ProtectedRoute>
            }/>

            {/* ADMIN */}
            <Route path="/admin" element={
              <ProtectedRoute adminOnly>
                <AdminLayout><Dashboard /></AdminLayout>
              </ProtectedRoute>
            }/>
            <Route path="/admin/properties" element={
              <ProtectedRoute adminOnly>
                <AdminLayout><AdminProperties /></AdminLayout>
              </ProtectedRoute>
            }/>
            <Route path="/admin/add-property" element={
              <ProtectedRoute adminOnly>
                <AdminLayout><PropertyForm /></AdminLayout>
              </ProtectedRoute>
            }/>
            <Route path="/admin/edit-property/:id" element={
              <ProtectedRoute adminOnly>
                <AdminLayout><PropertyForm /></AdminLayout>
              </ProtectedRoute>
            }/>
            <Route path="/admin/inquiries" element={
              <ProtectedRoute adminOnly>
                <AdminLayout><Inquiries /></AdminLayout>
              </ProtectedRoute>
            }/>
            <Route path="/admin/analytics" element={
              <ProtectedRoute adminOnly>
                <AdminLayout><Analytics /></AdminLayout>
              </ProtectedRoute>
            }/>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </BrowserRouter>
    </AuthProvider>
  )
}
