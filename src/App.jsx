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

function PrivateRoute({ children }) {
  const token = localStorage.getItem('token')
  return token ? children : <Navigate to="/login" />
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
        <Route path="/clients" element={<PrivateRoute><Clients /></PrivateRoute>} />
        <Route path="/barbers" element={<PrivateRoute><Barbers /></PrivateRoute>} />
        <Route path="/whatsapp" element={<PrivateRoute><WhatsApp /></PrivateRoute>} />
        <Route path="/appointments" element={<PrivateRoute><Appointments /></PrivateRoute>} />
        <Route path="/commissions" element={<PrivateRoute><Commissions /></PrivateRoute>} />
        <Route path="/orders" element={<PrivateRoute><Orders /></PrivateRoute>} />
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/stock" element={<PrivateRoute><Stock /></PrivateRoute>} />
      </Routes>
    </BrowserRouter>
  )
}