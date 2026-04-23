import { useEffect, useRef, useState } from "react";
import { getMyNotifications, markNotificationRead } from "../services/notificationService";
import "../styles/BackOffice.css";

const getUserInfo = () => {
  try {
    return JSON.parse(localStorage.getItem("userInfo"));
  } catch {
    return null;
  }
};

const formatDateTime = (value) =>
  new Date(value).toLocaleString("en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, unreadCount: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const pageRef = useRef(1);
  const seenNotificationIdsRef = useRef(new Set());
  const hasLoadedOnceRef = useRef(false);

  const fetchNotifications = async (page = 1, options = {}) => {
    const { background = false } = options;
    try {
      pageRef.current = page;
      if (!background) {
        setLoading(true);
      }
      const data = await getMyNotifications(page);
      const items = data.items || [];
      const userInfo = getUserInfo();
      const browserAlertsEnabled = userInfo?.notificationPreferences?.browser;

      if (hasLoadedOnceRef.current && browserAlertsEnabled && "Notification" in window) {
        const newUnread = items.filter(
          (item) => !item.isRead && !seenNotificationIdsRef.current.has(item._id)
        );

        if (Notification.permission === "granted") {
          newUnread.forEach((item) => {
            new Notification(item.title, { body: item.message });
          });
        }
      }

      items.forEach((item) => seenNotificationIdsRef.current.add(item._id));
      hasLoadedOnceRef.current = true;
      setNotifications(items);
      setPagination({
        ...(data.pagination || { page: 1, totalPages: 1 }),
        unreadCount: data.unreadCount || 0,
      });
      setError("");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load notifications");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(() => {
      fetchNotifications(pageRef.current, { background: true });
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const handleRead = async (id) => {
    try {
      await markNotificationRead(id);
      setNotifications((current) =>
        current.map((item) =>
          item._id === id ? { ...item, isRead: true } : item
        )
      );
      setPagination((current) => ({
        ...current,
        unreadCount: Math.max((current.unreadCount || 0) - 1, 0),
      }));
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update notification");
    }
  };

  if (loading) {
    return <p className="backoffice-message">Loading notifications...</p>;
  }

  if (error) {
    return <p className="backoffice-error">{error}</p>;
  }

  return (
    <div className="backoffice-page">
      <div className="backoffice-header">
        <div>
          <p className="backoffice-kicker">Inbox</p>
          <h1>Notifications</h1>
          <p>Stay updated on bookings, payments, approvals, and support activity.</p>
          {!("Notification" in window) ? (
            <p className="muted-text">Browser desktop alerts are not supported in this browser.</p>
          ) : !getUserInfo()?.notificationPreferences?.browser ? (
            <p className="muted-text">Enable browser desktop alerts from Profile settings for near real-time notification popups.</p>
          ) : (
            <p className="muted-text">Browser alerts are enabled. This page also refreshes automatically every 30 seconds.</p>
          )}
        </div>
        <div className="stat-card compact">
          <span>Unread</span>
          <strong>{pagination.unreadCount || 0}</strong>
        </div>
      </div>

      {notifications.length === 0 ? (
        <div className="backoffice-empty">
          <h3>No notifications yet</h3>
          <p>Your in-app updates will appear here.</p>
        </div>
      ) : (
        <div className="record-list">
          {notifications.map((notification) => (
            <article
              className={`record-card notification-card ${notification.isRead ? "read" : "unread"}`}
              key={notification._id}
            >
              <div className="record-card-top">
                <div>
                  <h2>{notification.title}</h2>
                  <p>{notification.message}</p>
                </div>
                <span className={`status-chip ${notification.isRead ? "resolved" : "pending"}`}>
                  {notification.isRead ? "read" : "new"}
                </span>
              </div>
              <div className="record-actions">
                <span className="muted-text">{formatDateTime(notification.createdAt)}</span>
                {!notification.isRead && (
                  <button
                    type="button"
                    className="primary-btn"
                    onClick={() => handleRead(notification._id)}
                  >
                    Mark Read
                  </button>
                )}
              </div>
            </article>
          ))}
        </div>
      )}

      {pagination.totalPages > 1 && (
        <div className="pager">
          <button
            type="button"
            className="clear-btn"
            onClick={() => fetchNotifications(pagination.page - 1)}
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
            onClick={() => fetchNotifications(pagination.page + 1)}
            disabled={pagination.page >= pagination.totalPages}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}

export default Notifications;
