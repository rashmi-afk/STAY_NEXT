import { useEffect, useState } from "react";
import { getMyProfile, updateMyProfile } from "../services/userService";
import { uploadImage } from "../services/uploadService";
import "../styles/ProfileSettings.css";

const getStoredUserInfo = () => {
  try {
    return JSON.parse(localStorage.getItem("userInfo"));
  } catch {
    return null;
  }
};

function ProfileSettings() {
  const storedUserInfo = getStoredUserInfo();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    avatarUrl: "",
    currentPassword: "",
    newPassword: "",
    notificationPreferences: {
      inApp: true,
      browser: false,
      email: false,
      sms: false,
    },
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const loadProfile = async () => {
      try {
        setLoading(true);
        const profile = await getMyProfile();
        setFormData({
          name: profile.name || "",
          email: profile.email || "",
          phone: profile.phone || "",
          avatarUrl: profile.avatarUrl || "",
          currentPassword: "",
          newPassword: "",
          notificationPreferences: {
            inApp: profile.notificationPreferences?.inApp ?? true,
            browser: profile.notificationPreferences?.browser ?? false,
            email: profile.notificationPreferences?.email ?? false,
            sms: profile.notificationPreferences?.sms ?? false,
          },
        });
        setError("");
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load profile");
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handlePreferenceChange = async (event) => {
    const { name, checked } = event.target;
    let nextChecked = checked;

    if (name === "browser" && checked && "Notification" in window) {
      const permission = await Notification.requestPermission();
      nextChecked = permission === "granted";

      if (!nextChecked) {
        setError("Browser notifications were not granted by your browser.");
      } else {
        setError("");
      }
    }

    setFormData((current) => ({
      ...current,
      notificationPreferences: {
        ...current.notificationPreferences,
        [name]: nextChecked,
      },
    }));
  };

  const handleAvatarUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      const data = await uploadImage(file);
      const nextUrl = data.urls?.[0] || data.url || "";

      if (!nextUrl) {
        throw new Error("Avatar upload failed");
      }

      setFormData((current) => ({
        ...current,
        avatarUrl: nextUrl,
      }));
      setError("");
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Failed to upload avatar");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSuccess("");
    setError("");

    try {
      setSaving(true);
      const response = await updateMyProfile(formData);
      const nextUserInfo = {
        ...(storedUserInfo || {}),
        ...response.user,
      };

      localStorage.setItem("userInfo", JSON.stringify(nextUserInfo));
      window.dispatchEvent(new Event("userInfoUpdated"));

      setFormData((current) => ({
        ...current,
        currentPassword: "",
        newPassword: "",
      }));
      setSuccess("Profile updated successfully");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <p className="profile-message">Loading your profile...</p>;
  }

  return (
    <div className="profile-page">
      <div className="profile-header">
        <div>
          <p className="profile-kicker">Settings</p>
          <h1>Profile And Preferences</h1>
          <p>Update your account details, password, and notification preferences without changing any of your booking data.</p>
        </div>
      </div>

      <div className="profile-layout">
        <aside className="profile-summary-card">
          <div className="profile-avatar-shell">
            {formData.avatarUrl ? (
              <img src={formData.avatarUrl} alt={formData.name || "Profile"} className="profile-avatar" />
            ) : (
              <div className="profile-avatar placeholder">
                {(formData.name || storedUserInfo?.name || "U").charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          <h2>{formData.name || "User"}</h2>
          <p>{formData.email}</p>
          <span className="profile-role-chip">{storedUserInfo?.role || "guest"}</span>
          <label className="avatar-upload-btn">
            {uploading ? "Uploading..." : "Upload Avatar"}
            <input type="file" accept="image/*" onChange={handleAvatarUpload} hidden />
          </label>
        </aside>

        <form className="profile-form-card" onSubmit={handleSubmit}>
          {error && <p className="profile-feedback error">{error}</p>}
          {success && <p className="profile-feedback success">{success}</p>}

          <div className="profile-grid">
            <label>
              <span>Name</span>
              <input name="name" value={formData.name} onChange={handleChange} required />
            </label>

            <label>
              <span>Email</span>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </label>

            <label>
              <span>Phone</span>
              <input
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="Optional phone number"
              />
            </label>

            <label>
              <span>Avatar URL</span>
              <input
                name="avatarUrl"
                value={formData.avatarUrl}
                onChange={handleChange}
                placeholder="https://example.com/avatar.jpg"
              />
            </label>

            <label>
              <span>Current Password</span>
              <input
                type="password"
                name="currentPassword"
                value={formData.currentPassword}
                onChange={handleChange}
                placeholder="Required only when changing password"
              />
            </label>

            <label>
              <span>New Password</span>
              <input
                type="password"
                name="newPassword"
                value={formData.newPassword}
                onChange={handleChange}
                placeholder="Leave blank to keep existing password"
              />
            </label>
          </div>

          <section className="profile-preferences">
            <div>
              <h3>Notification Preferences</h3>
              <p>In-app works now. Browser alerts work when permission is granted. Email and SMS preferences are saved for future integration.</p>
            </div>

            <label className="toggle-row">
              <span>In-app notifications</span>
              <input
                type="checkbox"
                name="inApp"
                checked={formData.notificationPreferences.inApp}
                onChange={handlePreferenceChange}
              />
            </label>

            <label className="toggle-row">
              <span>Browser desktop alerts</span>
              <input
                type="checkbox"
                name="browser"
                checked={formData.notificationPreferences.browser}
                onChange={handlePreferenceChange}
              />
            </label>

            <label className="toggle-row">
              <span>Email alerts</span>
              <input
                type="checkbox"
                name="email"
                checked={formData.notificationPreferences.email}
                onChange={handlePreferenceChange}
              />
            </label>

            <label className="toggle-row">
              <span>SMS alerts</span>
              <input
                type="checkbox"
                name="sms"
                checked={formData.notificationPreferences.sms}
                onChange={handlePreferenceChange}
              />
            </label>
          </section>

          <div className="profile-actions">
            <button type="submit" className="profile-save-btn" disabled={saving || uploading}>
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ProfileSettings;
