import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { useTheme } from "../context/ThemeContext.jsx";

function Register() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [formErrors, setFormErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.name.trim()) {
      errors.name = "Name is required.";
    }

    if (!formData.phone.trim()) {
      errors.phone = "Phone is required.";
    } else if (!/^\d{7,15}$/.test(formData.phone.trim())) {
      errors.phone = "Phone must contain 7–15 digits.";
    }

    if (!formData.email.trim()) {
      errors.email = "Email is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = "Enter a valid email address.";
    }

    if (!formData.password) {
      errors.password = "Password is required.";
    } else if (formData.password.length < 8) {
      errors.password = "Password must be at least 8 characters.";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    setFormErrors({});

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const authUser = await register(formData);
      navigate(authUser?.role === "admin" ? "/users" : "/dashboard", { replace: true });
    } catch (err) {
      const status = err.response?.status;
      if (status === 422) {
        const validationErrors = err.response?.data?.errors;
        if (validationErrors && typeof validationErrors === "object") {
          const mapped = {};
          for (const [field, messages] of Object.entries(validationErrors)) {
            mapped[field] = Array.isArray(messages) ? messages[0] : messages;
          }
          setFormErrors(mapped);
        } else {
          setError(err.response?.data?.message || "Validation failed. Please check your inputs.");
        }
      } else if (status === 409) {
        setError("An account with this email already exists. Please log in or use a different email.");
      } else if (status === 500) {
        setError("Registration service is temporarily unavailable. Please try again later.");
      } else {
        setError(
          err.response?.data?.message || err.response?.data?.error || err.message || "Registration failed. Please try again."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-5 position-relative">
      <div className="theme-toggle-wrapper position-absolute top-0 end-0 p-3">
        <button
          type="button"
          className="btn btn-outline-secondary"
          onClick={toggleTheme}
          title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
        >
          {isDark ? "☀️" : "🌙"}
        </button>
      </div>
      <div className="card p-4 mx-auto" style={{ maxWidth: 520 }}>
        <h1 className="text-center mb-4">Register</h1>

        {error && <div className="alert alert-danger">{error}</div>}

        <form onSubmit={handleRegister}>
          <div className="mb-3">
            <label className="form-label">Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              required
              className={`form-control ${formErrors.name ? "is-invalid" : ""}`}
              onChange={handleChange}
            />
            {formErrors.name && <div className="invalid-feedback">{formErrors.name}</div>}
          </div>

          <div className="mb-3">
            <label className="form-label">Phone</label>
            <input
              type="text"
              name="phone"
              value={formData.phone}
              required
              className={`form-control ${formErrors.phone ? "is-invalid" : ""}`}
              onChange={handleChange}
            />
            {formErrors.phone && <div className="invalid-feedback">{formErrors.phone}</div>}
          </div>

          <div className="mb-3">
            <label className="form-label">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              required
              className={`form-control ${formErrors.email ? "is-invalid" : ""}`}
              onChange={handleChange}
            />
            {formErrors.email && <div className="invalid-feedback">{formErrors.email}</div>}
          </div>

          <div className="mb-3">
            <label className="form-label">Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              required
              className={`form-control ${formErrors.password ? "is-invalid" : ""}`}
              onChange={handleChange}
            />
            {formErrors.password && <div className="invalid-feedback">{formErrors.password}</div>}
          </div>

          <button type="submit" className="btn btn-primary w-100" disabled={loading}>
            {loading ? "Registering..." : "Register"}
          </button>
        </form>

        <div className="text-center mt-3">
          Already registered? <Link to="/">Login here</Link>
        </div>
      </div>
    </div>
  );
}

export default Register;
