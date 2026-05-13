import { useAuth } from "../context/AuthContext.jsx";
import { useTheme } from "../context/ThemeContext.jsx";

function Dashboard() {
  const { user } = useAuth();
  const { isDark, toggleTheme } = useTheme();

  return (
    <div>

      
      <div className="card shadow-sm mb-4">
        <div className="card-body">
          <h3 className="card-title">Welcome, {user?.name || "User"}!</h3>
          <p className="card-text">
            You are signed in as <strong>{user?.role || "member"}</strong>.
          </p>
          <p className="text-muted">
            Use the navigation on the left to manage your profile and access your dashboard tools.
          </p>
        </div>
      </div>

      <div className="row g-3">
        <div className="col-md-4">
          <div className="card border-primary h-100">
            <div className="card-body">
              <h5 className="card-title">Profile</h5>
              <p className="card-text">Update your personal details and password on the Profile page.</p>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card border-success h-100">
            <div className="card-body">
              <h5 className="card-title">Role</h5>
              <p className="card-text">Your current role is <strong>{user?.role}</strong>.</p>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card border-info h-100">
            <div className="card-body">
              <h5 className="card-title">Next step</h5>
              <p className="card-text">Use the left menu to continue. Admins can manage users, members can update profile.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
