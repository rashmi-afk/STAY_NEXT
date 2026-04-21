import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ProtectedRoute from "./components/ProtectedRoute";

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
                <div style={{ padding: "40px", maxWidth: "1200px", margin: "0 auto" }}>
                  <h1>Host Bookings Page</h1>
                  <p>This page will show all bookings for host properties.</p>
                </div>
              </ProtectedRoute>
            }
          />

          {/* Admin temporary routes */}
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <div style={{ padding: "40px", maxWidth: "1200px", margin: "0 auto" }}>
                  <h1>Admin Dashboard</h1>
                </div>
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/users"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <div style={{ padding: "40px", maxWidth: "1200px", margin: "0 auto" }}>
                  <h1>Admin Users Page</h1>
                </div>
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/tickets"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <div style={{ padding: "40px", maxWidth: "1200px", margin: "0 auto" }}>
                  <h1>Admin Tickets Page</h1>
                </div>
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>

      <Footer />
    </div>
  );
}

export default App;