import { useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { useTheme } from "../context/ThemeContext.jsx";

function ResetPassword() {
  const navigate = useNavigate();
  const params = useParams();
  const [searchParams] = useSearchParams();
  const { resetPassword } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const resetToken = params.token || searchParams.get("token");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccess("");
    setError("");

    if (!resetToken) {
      setError("Reset token is missing from the URL.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setLoading(true);
    try {
      await resetPassword(resetToken, password);
      setSuccess("Password reset successfully. Redirecting to login...");
      setTimeout(() => {
        navigate("/", { replace: true });
      }, 1500);
    } catch (err) {
      const status = err.response?.status;
      if (status === 422) {
        setError(err.response?.data?.message || "Invalid or expired reset token.");
      } else {
        setError(err.response?.data?.message || err.message || "Unable to reset password. The link may have expired.");
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
        <h1 className="text-center mb-4">Reset Password</h1>

        {success && <div className="alert alert-success">{success}</div>}
        {error && <div className="alert alert-danger">{error}</div>}

        {!resetToken && (
          <div className="alert alert-warning">
            No reset token found. Please use the link from your email.
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label">New Password</label>
            <input
              type="password"
              value={password}
              required
              minLength={8}
              className="form-control"
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Confirm New Password</label>
            <input
              type="password"
              value={confirmPassword}
              required
              minLength={8}
              className="form-control"
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>

          <button type="submit" className="btn btn-primary w-100" disabled={loading || !resetToken}>
            {loading ? "Resetting..." : "Reset Password"}
          </button>
        </form>

        <div className="text-center mt-3">
          <Link to="/">Back to Login</Link>
        </div>
      </div>
    </div>
  );
}

export default ResetPassword;
