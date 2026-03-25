import { Routes, Route, Navigate } from 'react-router-dom'
import AdminLayout from './layouts/AdminLayout'
import LoginPage from './pages/LoginPage'

// Component 01: Booking & Pricing
import OrdersPage from './features/booking/OrdersPage'
import NewOrderPage from './features/booking/NewOrderPage'
import PricingPage from './features/booking/PricingPage'

// Component 02: Agreement & Payment
import AgreementsPage from './features/agreement/AgreementsPage'
import PortalPage from './features/agreement/PortalPage'
import AgreementPage from './features/agreement/AgreementPage'
import TrackPage from './features/agreement/TrackPage'

// Component 03: Event & Schedule
import OrderDetailPage from './features/events/OrderDetailPage'

// Component 04: Team & Location
import TeamPage from './features/team-location/TeamPage'
import LocationPage from './features/team-location/LocationPage'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<LoginPage />} />
      
      {/* Admin routes with shared layout */}
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<OrdersPage />} />
        <Route path="orders/new" element={<NewOrderPage />} />
        <Route path="orders/:id" element={<OrderDetailPage />} />
        <Route path="agreements" element={<AgreementsPage />} />
        <Route path="pricing" element={<PricingPage />} />
        <Route path="team" element={<TeamPage />} />
        <Route path="locations" element={<LocationPage />} />
      </Route>


      {/* Public client routes */}
      <Route path="/portal/:token" element={<PortalPage />} />
      <Route path="/agreement/:token" element={<AgreementPage />} />
      <Route path="/track/:id" element={<TrackPage />} />
    </Routes>
  )
}

export default App
