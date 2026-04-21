import { Link, useNavigate } from "react-router-dom";
import "../styles/Navbar.css";

function Navbar() {
  const navigate = useNavigate();
  const userInfo = JSON.parse(localStorage.getItem("userInfo"));

  const handleLogout = () => {
    localStorage.removeItem("userInfo");
    navigate("/login");
  };

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
              <nav className="navbar-links">
                {userInfo?.role === "guest" && (
                  <>
                    <Link to="/my-bookings" className="top-link">
                      My Bookings
                    </Link>
                    <Link to="/wishlist" className="top-link">
                      Wishlist
                    </Link>
                    <Link to="/my-tickets" className="top-link">
                      Support
                    </Link>
                  </>
                )}

                {userInfo?.role === "host" && (
                  <>
                    <Link to="/add-property" className="top-link">
                      Add Property
                    </Link>
                    <Link to="/my-properties" className="top-link">
                      My Properties
                    </Link>
                    <Link to="/host-bookings" className="top-link">
                      Host Bookings
                    </Link>
                    <Link to="/my-tickets" className="top-link">
                      Support
                    </Link>
                  </>
                )}

                {userInfo?.role === "admin" && (
                  <>
                    <Link to="/admin/dashboard" className="top-link">
                      Dashboard
                    </Link>
                    <Link to="/admin/users" className="top-link">
                      Users
                    </Link>
                    <Link to="/admin/tickets" className="top-link">
                      Tickets
                    </Link>
                  </>
                )}
              </nav>

              <div className="navbar-user">
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