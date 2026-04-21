import { useEffect, useState } from "react";
import { getAllProperties } from "../services/propertyService";
import PropertyCard from "../components/PropertyCard";
import "../styles/Home.css";

function Home() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [filters, setFilters] = useState({
    location: "",
    maxPrice: "",
    guests: "",
  });

  const fetchProperties = async (customFilters = filters) => {
    try {
      setLoading(true);
      setError("");
      const data = await getAllProperties(customFilters);
      setProperties(data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch properties");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProperties();
  }, []);

  const handleChange = (e) => {
    setFilters((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchProperties(filters);
  };

  const handleClear = () => {
    const resetFilters = {
      location: "",
      maxPrice: "",
      guests: "",
    };
    setFilters(resetFilters);
    fetchProperties(resetFilters);
  };

  return (
    <div className="home-page">
      <section className="hero-section">
        <div className="hero-overlay">
          <div className="hero-content">
            <h1>Find your next perfect stay</h1>
            <p>
              Explore beautiful homes, villas, and apartments for your next trip.
            </p>

            <form className="search-bar" onSubmit={handleSearch}>
              <div className="search-field">
                <label>Location</label>
                <input
                  type="text"
                  name="location"
                  placeholder="Where do you want to go?"
                  value={filters.location}
                  onChange={handleChange}
                />
              </div>

              <div className="search-field">
                <label>Max Price</label>
                <input
                  type="number"
                  name="maxPrice"
                  placeholder="Enter max price"
                  value={filters.maxPrice}
                  onChange={handleChange}
                  min="1"
                />
              </div>

              <div className="search-field">
                <label>Guests</label>
                <input
                  type="number"
                  name="guests"
                  placeholder="Guests"
                  value={filters.guests}
                  onChange={handleChange}
                  min="1"
                />
              </div>

              <div className="search-actions">
                <button type="submit" className="search-btn">
                  Search
                </button>
                <button
                  type="button"
                  className="clear-btn"
                  onClick={handleClear}
                >
                  Clear
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>

      <section className="home-list-section">
        <div className="section-heading">
          <h2>Popular stays</h2>
          <p>Browse places people are loving right now.</p>
        </div>

        {loading && <p className="home-message">Loading properties...</p>}
        {error && <p className="home-error">{error}</p>}

        {!loading && !error && properties.length === 0 && (
          <div className="no-results">
            <h3>No properties found</h3>
            <p>Try changing your filters and search again.</p>
          </div>
        )}

        <div className="property-grid">
          {properties.map((property) => (
            <PropertyCard key={property._id} property={property} />
          ))}
        </div>
      </section>
    </div>
  );
}

export default Home;