import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { useTheme } from "../context/ThemeContext.jsx";
import { useState } from "react";

const navLinkClass = ({ isActive }) =>
  `nav-link ${isActive ? "active fw-semibold" : "text-secondary"}`;

export default function Layout() {
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const baseLinks = [
    { to: "/dashboard", label: "Dashboard" },
    { to: "/profile", label: "My Profile" },
  ];

  const adminLinks = [
    { to: "/dashboard", label: "Dashboard" },
    { to: "/users", label: "User Management" },
    { to: "/profile", label: "My Profile" },
  ];

  const links = user?.role === "admin" ? adminLinks : baseLinks;

  return (
    <div className="container-fluid">
      <div className="row min-vh-100 dashboard-layout-row">
        <aside className={`dashboard-sidebar col-12 col-md-3 col-lg-2 bg-light border-end p-3 ${sidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
          <div className="mb-4">
            <h4 className="mb-1">Foundation App</h4>
            <p className="text-muted mb-1">{user?.role?.toUpperCase() ?? "Guest"}</p>
            <p className="small text-muted">{user?.name}</p>
          </div>

          <nav className="nav flex-column gap-2">
            {links.map((item) => (
              <NavLink key={item.to} to={item.to} className={navLinkClass} onClick={() => setSidebarOpen(false)}>
                {item.label}
              </NavLink>
            ))}
            <button type="button" className="btn btn-outline-danger mt-3" onClick={() => { logout(); setSidebarOpen(false); }}>
              Logout
            </button>
          </nav>
        </aside>

        <main className="dashboard-main col-12 col-md-9 col-lg-10 p-4">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div className="d-md-none">
              <button className="btn btn-outline-secondary" onClick={() => setSidebarOpen(!sidebarOpen)}>
                ☰
              </button>
            </div>
            <div>
              <h2 className="mb-0">{location.pathname === "/dashboard" ? "Dashboard" : "Control Panel"}</h2>
              <p className="text-muted mb-0">Welcome back, {user?.name}</p>
            </div>
            <div className="d-flex gap-2 align-items-center">
              <Link to="/profile" className="btn btn-outline-primary">
                Profile
              </Link>
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={toggleTheme}
                title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
              >
                {isDark ? "☀️ Light" : "🌙 Dark"}
              </button>
            </div>
          </div>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
