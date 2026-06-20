import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Clients from './pages/Clients'
import Barbers from './pages/Barbers'
import Appointments from './pages/Appointments'
import WhatsApp from './pages/WhatsApp'
import Commissions from './pages/Commissions'
import Orders from './pages/Orders'
import Stock from './pages/Stock'
import Reports from './pages/Reports'
import Booking from './pages/Booking'
import Services from './pages/Services'
import Settings from './pages/Settings'
import Register from './pages/Register'
import VendorRegister from './pages/VendorRegister'
import VendorDashboard from './pages/VendorDashboard'
import AdminPanel from './pages/AdminPanel'

function PrivateRoute({ children }) {
  const token = localStorage.getItem('token')
  return token ? children : <Navigate to="/login" />
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/agendar/:slug" element={<Booking />} />
        <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
        <Route path="/clients" element={<PrivateRoute><Clients /></PrivateRoute>} />
        <Route path="/barbers" element={<PrivateRoute><Barbers /></PrivateRoute>} />
        <Route path="/whatsapp" element={<PrivateRoute><WhatsApp /></PrivateRoute>} />
        <Route path="/appointments" element={<PrivateRoute><Appointments /></PrivateRoute>} />
        <Route path="/commissions" element={<PrivateRoute><Commissions /></PrivateRoute>} />
        <Route path="/orders" element={<PrivateRoute><Orders /></PrivateRoute>} />
        <Route path="/stock" element={<PrivateRoute><Stock /></PrivateRoute>} />
        <Route path="/reports" element={<PrivateRoute><Reports /></PrivateRoute>} />
        <Route path="/services" element={<PrivateRoute><Services /></PrivateRoute>} />
        <Route path="/settings" element={<PrivateRoute><Settings /></PrivateRoute>} />
        <Route path="/register" element={<Register />} />
        <Route path="/register/vendor" element={<VendorRegister />} />
        <Route path="/vendor" element={<PrivateRoute><VendorDashboard /></PrivateRoute>} />
        <Route path="/admin" element={<PrivateRoute><AdminPanel /></PrivateRoute>} />
        <Route path="/" element={<Navigate to="/login" />} />
      </Routes>
    </BrowserRouter>
  )
}