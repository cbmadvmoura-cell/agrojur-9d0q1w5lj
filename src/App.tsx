/* Main App Component - Handles routing (using react-router-dom), query client and other providers */
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from '@/components/ui/toaster'
import { Toaster as Sonner } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import Index from './pages/Index'
import NotFound from './pages/NotFound'
import Layout from './components/Layout'
import PortalSection from './pages/PortalSection'
import Calculadora from './pages/Calculadora'
import Login from './pages/Login'
import Editorial from './pages/Editorial'
import ProtectedRoute from './components/ProtectedRoute'
import { AuthProvider } from './hooks/use-auth'

const App = () => (
  <BrowserRouter>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Index />} />
            <Route path="/temas" element={<PortalSection section="temas" />} />
            <Route path="/blog" element={<PortalSection section="blog" />} />
            <Route path="/diagnostico" element={<PortalSection section="diagnostico" />} />
            <Route path="/calculadora" element={<Calculadora />} />
          </Route>
          <Route path="/login" element={<Login />} />
          <Route
            path="/editorial"
            element={
              <ProtectedRoute>
                <Editorial />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </TooltipProvider>
    </AuthProvider>
  </BrowserRouter>
)

export default App
