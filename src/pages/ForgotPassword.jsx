import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { useTheme } from "../context/ThemeContext.jsx";

function ForgotPassword() {
  const { forgotPassword } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const [email, setEmail] = useState("");
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccess("");
    setError("");
    setLoading(true);

    try {
      const data = await forgotPassword(email);
      setSuccess(data?.message || "If the email exists, we have sent reset instructions.");
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Unable to submit request. Please try again.");
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
        <h1 className="text-center mb-4">Forgot Password</h1>

        {success && <div className="alert alert-success">{success}</div>}
        {error && <div className="alert alert-danger">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label">Email address</label>
            <input
              type="email"
              value={email}
              required
              className="form-control"
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <button type="submit" className="btn btn-primary w-100" disabled={loading}>
            {loading ? "Submitting..." : "Send reset link"}
          </button>
        </form>

        <div className="text-center mt-3">
          <Link to="/">Back to Login</Link>
        </div>
      </div>
    </div>
  );
}

export default ForgotPassword;
