import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";

function Profile() {
  const { user, updateProfile } = useAuth();
  const [form, setForm] = useState(() => ({
    name: user?.name || "",
    phone: user?.phone || "",
    email: user?.email || "",
    password: "",
  }));
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) return;
    setForm({
      name: user.name || "",
      phone: user.phone || "",
      email: user.email || "",
      password: "",
    });
  }, [user]);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccess("");
    setError("");
    setLoading(true);

    try {
      const payload = {
        name: form.name,
        phone: form.phone,
        email: form.email,
      };

      if (form.password) {
        payload.password = form.password;
      }

      await updateProfile(payload);
      setSuccess("Profile updated successfully.");
      setForm((prev) => ({ ...prev, password: "" }));
    } catch (err) {
      const status = err.response?.status;
      if (status === 422) {
        const validationErrors = err.response?.data?.errors;
        if (validationErrors && typeof validationErrors === "object") {
          const messages = Object.values(validationErrors).flat();
          setError(messages.join(" "));
        } else {
          setError(err.response?.data?.message || "Validation failed. Please check your inputs.");
        }
      } else {
        setError(err.response?.data?.message || err.message || "Unable to update profile.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card shadow-sm">
      <div className="card-body">
        <h3 className="card-title mb-4">My Profile</h3>

        {success && <div className="alert alert-success">{success}</div>}
        {error && <div className="alert alert-danger">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label">Name</label>
            <input
              type="text"
              name="name"
              value={form.name}
              required
              className="form-control"
              onChange={handleChange}
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Phone</label>
            <input
              type="text"
              name="phone"
              value={form.phone}
              required
              className="form-control"
              onChange={handleChange}
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Email</label>
            <input
              type="email"
              name="email"
              value={form.email}
              required
              className="form-control"
              onChange={handleChange}
            />
          </div>

          <div className="mb-3">
            <label className="form-label">New password (optional)</label>
            <input
              type="password"
              name="password"
              value={form.password}
              className="form-control"
              onChange={handleChange}
            />
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? "Saving..." : "Update Profile"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Profile;
