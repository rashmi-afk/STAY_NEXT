import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ProtectedRoute from "./components/ProtectedRoute";
import BookingHelpAssistant from "./components/BookingHelpAssistant";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import PropertyDetails from "./pages/PropertyDetails";
import AddProperty from "./pages/AddProperty";
import MyProperties from "./pages/MyProperties";
import MyBookings from "./pages/MyBookings";
import PaymentPage from "./pages/PaymentPage";
import MyTickets from "./pages/MyTickets";
import Wishlist from "./pages/Wishlist";
import NotFound from "./pages/NotFound";
import HostBookings from "./pages/HostBookings";
import AdminDashboard from "./pages/AdminDashboard";
import AdminUsers from "./pages/AdminUsers";
import AdminBookings from "./pages/AdminBookings";
import AdminPayments from "./pages/AdminPayments";
import AdminTickets from "./pages/AdminTickets";
import Notifications from "./pages/Notifications";
import ProfileSettings from "./pages/ProfileSettings";

import "./styles/Layout.css";

function App() {
  return (
    <div className="app-shell">
      <Navbar />

      <main className="app-main">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/property/:id" element={<PropertyDetails />} />

          {/* Guest routes */}
          <Route
            path="/my-bookings"
            element={
              <ProtectedRoute allowedRoles={["guest"]}>
                <MyBookings />
              </ProtectedRoute>
            }
          />

          <Route
            path="/payment/:bookingId"
            element={
              <ProtectedRoute allowedRoles={["guest"]}>
                <PaymentPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/wishlist"
            element={
              <ProtectedRoute allowedRoles={["guest"]}>
                <Wishlist />
              </ProtectedRoute>
            }
          />

          {/* Shared routes */}
          <Route
            path="/my-tickets"
            element={
              <ProtectedRoute allowedRoles={["guest", "host", "admin"]}>
                <MyTickets />
              </ProtectedRoute>
            }
          />
          <Route
            path="/notifications"
            element={
              <ProtectedRoute allowedRoles={["guest", "host", "admin"]}>
                <Notifications />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute allowedRoles={["guest", "host", "admin"]}>
                <ProfileSettings />
              </ProtectedRoute>
            }
          />

          {/* Host routes */}
          <Route
            path="/add-property"
            element={
              <ProtectedRoute allowedRoles={["host"]}>
                <AddProperty />
              </ProtectedRoute>
            }
          />

          <Route
            path="/my-properties"
            element={
              <ProtectedRoute allowedRoles={["host"]}>
                <MyProperties />
              </ProtectedRoute>
            }
          />

          {/* Temporary placeholder route */}
          <Route
            path="/host-bookings"
            element={
              <ProtectedRoute allowedRoles={["host"]}>
                <HostBookings />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/users"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminUsers />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/bookings"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminBookings />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/payments"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminPayments />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/tickets"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminTickets />
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>

      <Footer />
      <BookingHelpAssistant />
    </div>
  );
}

export default App;
