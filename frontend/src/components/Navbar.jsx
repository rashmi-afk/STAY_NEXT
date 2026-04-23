import { Link, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import "../styles/Navbar.css";

const getStoredUserInfo = () => {
  try {
    return JSON.parse(localStorage.getItem("userInfo"));
  } catch {
    return null;
  }
};

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [userInfo, setUserInfo] = useState(getStoredUserInfo());

  const roleMeta = {
    guest: { label: "Guest Hub", shortLabel: "Guest" },
    host: { label: "Host Hub", shortLabel: "Host" },
    admin: { label: "Admin Desk", shortLabel: "Admin" },
  };

  const roleLinks = {
    guest: [
      { to: "/my-bookings", label: "My Bookings" },
      { to: "/notifications", label: "Notifications" },
      { to: "/wishlist", label: "Wishlist" },
      { to: "/my-tickets", label: "Support" },
      { to: "/profile", label: "Profile" },
    ],
    host: [
      { to: "/add-property", label: "Add Property" },
      { to: "/notifications", label: "Notifications" },
      { to: "/my-properties", label: "My Properties" },
      { to: "/host-bookings", label: "Host Bookings" },
      { to: "/my-tickets", label: "Support" },
      { to: "/profile", label: "Profile" },
    ],
    admin: [
      { to: "/admin/dashboard", label: "Dashboard" },
      { to: "/admin/users", label: "Users" },
      { to: "/admin/bookings", label: "Bookings" },
      { to: "/notifications", label: "Notifications" },
      { to: "/admin/payments", label: "Payments" },
      { to: "/admin/tickets", label: "Support" },
      { to: "/profile", label: "Profile" },
    ],
  };

  useEffect(() => {
    const syncUserInfo = () => {
      setUserInfo(getStoredUserInfo());
    };

    window.addEventListener("storage", syncUserInfo);
    window.addEventListener("userInfoUpdated", syncUserInfo);

    return () => {
      window.removeEventListener("storage", syncUserInfo);
      window.removeEventListener("userInfoUpdated", syncUserInfo);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("userInfo");
    window.dispatchEvent(new Event("userInfoUpdated"));
    navigate("/login");
  };

  const currentRole = userInfo?.role;
  const currentRoleMeta = roleMeta[currentRole];
  const currentLinks = roleLinks[currentRole] || [];
  const isActivePath = (path) => location.pathname === path;

  return (
    <header className="navbar">
      <div className="navbar-container">
        <div className="navbar-left">
          <Link to="/" className="navbar-logo">
            <div className="logo-mark">
              <svg
                viewBox="0 0 64 64"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M32 8C28 8 24.8 10.1 22.8 13.7L11.5 34.2C10.4 36.2 9.8 38.1 9.8 40C9.8 48.9 17.1 56 26 56C30 56 33.8 54.5 36.7 51.7L32 47C30.4 48.6 28.3 49.5 26 49.5C20.8 49.5 16.5 45.2 16.5 40C16.5 39.1 16.8 38 17.4 36.8L28.7 16.3C29.4 15 30.5 14.3 32 14.3C33.5 14.3 34.6 15 35.3 16.3L46.6 36.8C47.2 38 47.5 39.1 47.5 40C47.5 45.2 43.2 49.5 38 49.5C35.7 49.5 33.6 48.6 32 47L27.3 51.7C30.2 54.5 34 56 38 56C46.9 56 54.2 48.9 54.2 40C54.2 38.1 53.6 36.2 52.5 34.2L41.2 13.7C39.2 10.1 36 8 32 8Z"
                  fill="currentColor"
                />
                <circle cx="32" cy="32" r="6.5" fill="white" />
              </svg>
            </div>
            <span>StayNext</span>
          </Link>
        </div>

        <div className="navbar-right">
          {!userInfo ? (
            <div className="navbar-auth">
              <Link to="/login" className="top-link">
                Login
              </Link>
              <Link to="/register" className="top-link">
                Register
              </Link>
            </div>
          ) : (
            <>
              <div className="navbar-dashboard-shell">
                <div className="navbar-workspace-tag">
                  <span className={`navbar-role-badge ${currentRole}`}>
                    {currentRoleMeta?.label}
                  </span>
                </div>

                <nav className="navbar-links">
                  {currentLinks.map((link) => (
                    <Link
                      key={link.to}
                      to={link.to}
                      className={`top-link ${isActivePath(link.to) ? "active" : ""}`}
                    >
                      {link.label}
                    </Link>
                  ))}
                </nav>
              </div>

              <div className="navbar-user">
                <span className={`navbar-user-role ${currentRole}`}>
                  {currentRoleMeta?.shortLabel}
                </span>
                <span className="navbar-user-name">
                  {userInfo.name?.split(" ")[0]}
                </span>

                <button onClick={handleLogout} className="logout-link">
                  Logout
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

export default Navbar;
