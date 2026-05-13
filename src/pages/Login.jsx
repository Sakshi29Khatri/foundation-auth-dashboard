import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { useTheme } from "../context/ThemeContext.jsx";

function Login() {
  const { user, login } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      navigate(user.role === "admin" ? "/users" : "/dashboard", { replace: true });
    }
  }, [user, navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const authUser = await login({ email, password });
      navigate(authUser?.role === "admin" ? "/users" : "/dashboard", { replace: true });
    } catch (err) {
      const status = err.response?.status;
      if (status === 401 || status === 422) {
        setError("Invalid email or password. Please try again.");
      } else if (status === 429) {
        setError("Too many login attempts. Please wait a moment and try again.");
      } else {
        setError(err.response?.data?.message || err.response?.data?.error || err.message || "Login failed. Please check your credentials.");
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
      <div className="card p-4 mx-auto" style={{ maxWidth: 480 }}>
        <h1 className="text-center mb-4">Login</h1>

        {error && <div className="alert alert-danger">{error}</div>}

        <form onSubmit={handleLogin}>
          <div className="mb-3">
            <label className="form-label">Email</label>
            <input
              type="email"
              value={email}
              required
              className="form-control"
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Password</label>
            <input
              type="password"
              value={password}
              required
              className="form-control"
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button type="submit" className="btn btn-primary w-100" disabled={loading}>
            {loading ? "Signing in..." : "Login"}
          </button>
        </form>

        <div className="d-flex justify-content-between mt-3">
          <Link to="/forgot-password">Forgot Password?</Link>
          <Link to="/register">Create account</Link>
        </div>
      </div>
    </div>
  );
}

export default Login;
