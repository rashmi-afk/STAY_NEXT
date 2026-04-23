import { useEffect, useState } from "react";
import { getAllUsers, updateHostApproval } from "../services/userService";
import "../styles/BackOffice.css";

function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });
  const [filters, setFilters] = useState({ search: "", hostStatus: "" });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [savingId, setSavingId] = useState("");

  const fetchUsers = async (page = 1, nextFilters = filters) => {
    try {
      setLoading(true);
      const data = await getAllUsers({
        page,
        search: nextFilters.search,
        hostStatus: nextFilters.hostStatus,
      });
      setUsers(data.items || []);
      setPagination(data.pagination || { page: 1, totalPages: 1 });
      setError("");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleApprove = async (userId, hostApprovalStatus) => {
    try {
      setSavingId(userId);
      const response = await updateHostApproval(userId, hostApprovalStatus);
      setUsers((current) =>
        current.map((user) =>
          user._id === userId
            ? { ...user, hostApprovalStatus: response.user.hostApprovalStatus }
            : user
        )
      );
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update host approval");
    } finally {
      setSavingId("");
    }
  };

  if (loading) {
    return <p className="backoffice-message">Loading users...</p>;
  }

  if (error) {
    return <p className="backoffice-error">{error}</p>;
  }

  return (
    <div className="backoffice-page">
      <div className="backoffice-header">
        <div>
          <p className="backoffice-kicker">Admin Users</p>
          <h1>User And Host Approval Center</h1>
          <p>Review users, filter host requests, and approve hosts before they can list properties.</p>
        </div>
      </div>

      <div className="filter-bar">
        <input
          type="text"
          placeholder="Search by name or email"
          value={filters.search}
          onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))}
        />
        <select
          value={filters.hostStatus}
          onChange={(e) => setFilters((prev) => ({ ...prev, hostStatus: e.target.value }))}
        >
          <option value="">All host statuses</option>
          <option value="pending">pending</option>
          <option value="approved">approved</option>
          <option value="rejected">rejected</option>
        </select>
        <button type="button" className="search-btn" onClick={() => fetchUsers(1, filters)}>
          Apply
        </button>
      </div>

      <div className="record-list">
        {users.map((user) => (
          <article className="record-card" key={user._id}>
            <div className="record-card-top">
              <div>
                <h2>{user.name}</h2>
                <p>{user.email}</p>
              </div>
              <div className="status-stack">
                <span className={`status-chip ${user.role === "admin" ? "resolved" : "pending"}`}>
                  {user.role}
                </span>
                <span className={`status-chip ${user.hostApprovalStatus === "approved" ? "resolved" : user.hostApprovalStatus === "rejected" ? "failed" : "pending"}`}>
                  {user.hostApprovalStatus}
                </span>
              </div>
            </div>

            {user.role === "host" && (
              <div className="record-actions">
                <button
                  type="button"
                  className="primary-btn"
                  onClick={() => handleApprove(user._id, "approved")}
                  disabled={savingId === user._id}
                >
                  Approve
                </button>
                <button
                  type="button"
                  className="secondary-btn"
                  onClick={() => handleApprove(user._id, "rejected")}
                  disabled={savingId === user._id}
                >
                  Reject
                </button>
              </div>
            )}
          </article>
        ))}
      </div>

      {pagination.totalPages > 1 && (
        <div className="pager">
          <button
            type="button"
            className="clear-btn"
            onClick={() => fetchUsers(pagination.page - 1, filters)}
            disabled={pagination.page <= 1}
          >
            Previous
          </button>
          <span className="page-indicator">
            Page {pagination.page} of {pagination.totalPages}
          </span>
          <button
            type="button"
            className="search-btn"
            onClick={() => fetchUsers(pagination.page + 1, filters)}
            disabled={pagination.page >= pagination.totalPages}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}

export default AdminUsers;
