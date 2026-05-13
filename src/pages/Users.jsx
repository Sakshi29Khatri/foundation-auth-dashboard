import { useCallback, useEffect, useRef, useState } from "react";
import API from "../services/api";

function Users() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [sort, setSort] = useState("name");
  const [order, setOrder] = useState("asc");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ name: "", phone: "", email: "", password: "", role: "member" });
  const [formErrors, setFormErrors] = useState({});
  const [meta, setMeta] = useState({ total: 0, per_page: limit });
  const searchTimer = useRef(null);

  const loadUsers = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await API.get("/users", {
        params: {
          search: search || undefined,
          page,
          limit,
          sort,
          order,
        },
      });

      const payload = response.data?.data ?? response.data;
      let items = [];

      if (Array.isArray(payload)) {
        items = payload;
      } else if (Array.isArray(payload?.items)) {
        items = payload.items;
      } else if (Array.isArray(payload?.data)) {
        items = payload.data;
      } else if (Array.isArray(payload?.users)) {
        items = payload.users;
      }

      // Normalize "user" role to "member"
      items = items.map((u) => (u.role === "user" ? { ...u, role: "member" } : u));

      setUsers(items);
      setMeta({
        total: payload?.meta?.total ?? payload?.total ?? payload?.pagination?.total ?? items.length,
        per_page: payload?.meta?.per_page ?? payload?.per_page ?? limit,
      });
    } catch (err) {
      const status = err.response?.status;
      if (status === 403) {
        setError("You do not have permission to view users.");
      } else {
        setError(err.response?.data?.message || err.message || "Unable to load users.");
      }
    } finally {
      setLoading(false);
    }
  }, [search, page, limit, sort, order]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  // Reset page when search/sort/order changes
  useEffect(() => {
    setPage(1);
  }, [search, sort, order]);

  // Debounce search input
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchInput(value);
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => {
      setSearch(value);
    }, 400);
  };

  const resetForm = () => {
    setEditId(null);
    setForm({ name: "", phone: "", email: "", password: "", role: "member" });
    setFormErrors({});
    setMessage("");
    setError("");
  };

  const validateForm = () => {
    const errors = {};
    if (!form.name.trim()) errors.name = "Name is required.";
    if (!form.phone.trim()) errors.phone = "Phone is required.";
    if (!form.email.trim()) {
      errors.email = "Email is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      errors.email = "Enter a valid email address.";
    }
    if (!editId && !form.password) {
      errors.password = "Password is required for new users.";
    } else if (form.password && form.password.length < 8) {
      errors.password = "Password must be at least 8 characters.";
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (!validateForm()) return;

    setLoading(true);

    try {
      const payload = {
        name: form.name,
        phone: form.phone,
        email: form.email,
        role: form.role,
      };

      if (form.password) {
        payload.password = form.password;
      }

      if (editId) {
        await API.put(`/users/${editId}`, payload);
        setMessage("User updated successfully.");
      } else {
        await API.post("/users", payload);
        setMessage("User created successfully.");
      }

      resetForm();
      loadUsers();
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
        setError("A user with this email already exists.");
      } else {
        setError(err.response?.data?.message || err.message || "Unable to save user.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (user) => {
    setEditId(user.id ?? user._id ?? null);
    setForm({
      name: user.name || "",
      phone: user.phone || "",
      email: user.email || "",
      password: "",
      role: user.role === "user" ? "member" : (user.role || "member"),
    });
    setFormErrors({});
    setMessage("");
    setError("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm("Are you sure you want to delete this user?");
    if (!confirmed) return;

    setLoading(true);
    setError("");
    setMessage("");

    try {
      await API.delete(`/users/${id}`);
      setMessage("User deleted successfully.");
      loadUsers();
    } catch (err) {
      const status = err.response?.status;
      if (status === 403) {
        setError("You do not have permission to delete this user.");
      } else if (status === 404) {
        setError("User not found. They may have already been deleted.");
      } else {
        setError(err.response?.data?.message || err.message || "Unable to delete user.");
      }
    } finally {
      setLoading(false);
    }
  };

  const pageCount = Math.max(1, Math.ceil((meta.total || users.length) / limit));

  return (
    <div>
      <div className="card shadow-sm mb-4">
        <div className="card-body">
          <h3 className="card-title mb-3">{editId ? "Edit User" : "Create User"}</h3>

          {message && <div className="alert alert-success alert-dismissible">
            {message}
            <button type="button" className="btn-close" onClick={() => setMessage("")} />
          </div>}
          {error && <div className="alert alert-danger alert-dismissible">
            {error}
            <button type="button" className="btn-close" onClick={() => setError("")} />
          </div>}

          <form onSubmit={handleSubmit} className="row g-3 mb-2">
            <div className="col-md-6">
              <label className="form-label">Name</label>
              <input
                type="text"
                className={`form-control ${formErrors.name ? "is-invalid" : ""}`}
                name="name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
              {formErrors.name && <div className="invalid-feedback">{formErrors.name}</div>}
            </div>
            <div className="col-md-6">
              <label className="form-label">Phone</label>
              <input
                type="text"
                className={`form-control ${formErrors.phone ? "is-invalid" : ""}`}
                name="phone"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
              {formErrors.phone && <div className="invalid-feedback">{formErrors.phone}</div>}
            </div>
            <div className="col-md-6">
              <label className="form-label">Email</label>
              <input
                type="email"
                className={`form-control ${formErrors.email ? "is-invalid" : ""}`}
                name="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
              {formErrors.email && <div className="invalid-feedback">{formErrors.email}</div>}
            </div>
            <div className="col-md-6">
              <label className="form-label">Role</label>
              <select
                className="form-select"
                name="role"
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
              >
                <option value="member">Member</option>
                <option value="volunteer">Volunteer</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div className="col-md-6">
              <label className="form-label">
                Password {editId ? "(leave blank to keep current)" : ""}
              </label>
              <input
                type="password"
                className={`form-control ${formErrors.password ? "is-invalid" : ""}`}
                name="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />
              {formErrors.password && <div className="invalid-feedback">{formErrors.password}</div>}
            </div>
            <div className="col-12 d-flex gap-2">
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {editId ? "Update User" : "Create User"}
              </button>
              <button type="button" className="btn btn-outline-secondary" onClick={resetForm} disabled={loading}>
                {editId ? "Cancel" : "Reset Form"}
              </button>
            </div>
          </form>
        </div>
      </div>

      <div className="card shadow-sm">
        <div className="card-body">
          <h5 className="card-title mb-3">User Management</h5>

          <div className="row gy-3 mb-3">
            <div className="col-md-4">
              <input
                type="search"
                className="form-control"
                placeholder="Search users..."
                value={searchInput}
                onChange={handleSearchChange}
              />
            </div>
            <div className="col-md-4">
              <select className="form-select" value={sort} onChange={(e) => setSort(e.target.value)}>
                <option value="name">Sort by name</option>
                <option value="email">Sort by email</option>
                <option value="role">Sort by role</option>
                <option value="created_at">Sort by date</option>
              </select>
            </div>
            <div className="col-md-4">
              <select className="form-select" value={order} onChange={(e) => setOrder(e.target.value)}>
                <option value="asc">Ascending</option>
                <option value="desc">Descending</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-bordered align-middle mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Role</th>
                    <th className="text-end">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center py-4 text-muted">
                        {search ? "No users match your search." : "No users found."}
                      </td>
                    </tr>
                  ) : (
                    users.map((user) => (
                      <tr key={user.id ?? user._id ?? user.email}>
                        <td>{user.name}</td>
                        <td>{user.email}</td>
                        <td>{user.phone}</td>
                        <td>
                          <span className={`badge ${
                            user.role === "admin" ? "bg-danger" :
                            user.role === "volunteer" ? "bg-info text-dark" :
                            "bg-secondary"
                          }`}>
                            {user.role}
                          </span>
                        </td>
                        <td className="text-end">
                          <button
                            className="btn btn-sm btn-outline-primary me-2"
                            onClick={() => handleEdit(user)}
                          >
                            Edit
                          </button>
                          <button
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => handleDelete(user.id ?? user._id)}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}

          <div className="d-flex justify-content-between align-items-center mt-3">
            <small className="text-muted">
              Page {page} of {pageCount} &bull; {meta.total} total users
            </small>
            <div className="btn-group" role="group">
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                disabled={page === 1 || loading}
              >
                &laquo; Previous
              </button>
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={() => setPage((prev) => Math.min(prev + 1, pageCount))}
                disabled={page >= pageCount || loading}
              >
                Next &raquo;
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Users;
