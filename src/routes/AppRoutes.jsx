import { Routes, Route } from 'react-router-dom'
import GemStoneList from '../pages/GemStoneList/GemStoneList'
import GemStoneDetail from '../pages/GemStoneDetail/GemStoneDetail'
import GemStoneCreate from '../pages/GemStoneCreate/GemStoneCreate'
import GemStoneEdit from '../pages/GemStoneEdit/GemStoneEdit'
import Register from '../pages/Register/Register'
import Cart from '../pages/Cart/Cart'
import ProtectedRoute from './ProtectedRoute'
import Login from '../pages/Login/Login'
import { Navigate } from 'react-router-dom'
import Contact from '../pages/Contact/Contact'

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<GemStoneList />} />
      <Route path="/login" element={<Login />} />
      <Route path="/gemstones/:id" element={<GemStoneDetail />} />
      <Route path="/cart" element={<Cart />} />
      <Route path="/register" element={<Register />} />
      <Route path="/contact" element={<Contact />} />

      {/* Admin only */}
      <Route path="/gemstones/create" element={<ProtectedRoute><GemStoneCreate /></ProtectedRoute>} />
      <Route path="/gemstones/:id/edit" element={<ProtectedRoute><GemStoneEdit /></ProtectedRoute>} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}