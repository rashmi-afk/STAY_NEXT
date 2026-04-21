import "../styles/Footer.css";

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-brand">
          <h3>StayFinder</h3>
          <p>Discover stays, book with ease, and manage your trips smoothly.</p>
        </div>

        <div className="footer-links">
          <div>
            <h4>Explore</h4>
            <a href="#">Homes</a>
            <a href="#">Bookings</a>
            <a href="#">Wishlist</a>
          </div>

          <div>
            <h4>Support</h4>
            <a href="#">Help Center</a>
            <a href="#">Tickets</a>
            <a href="#">Contact</a>
          </div>

          <div>
            <h4>Hosting</h4>
            <a href="#">Add Property</a>
            <a href="#">My Properties</a>
            <a href="#">Host Guide</a>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <p>© 2026 StayFinder. All rights reserved.</p>
      </div>
    </footer>
  );
}

export default Footer;