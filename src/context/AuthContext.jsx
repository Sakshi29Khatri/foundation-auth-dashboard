/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem("token"));
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("user");
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [loading, setLoading] = useState(() => Boolean(localStorage.getItem("token")));
  const navigate = useNavigate();

  const setSession = useCallback((newToken, newUser) => {
    if (newToken) {
      localStorage.setItem("token", newToken);
      setToken(newToken);
    } else {
      localStorage.removeItem("token");
      setToken(null);
    }

    if (newUser) {
      localStorage.setItem("user", JSON.stringify(newUser));
      setUser(newUser);
    } else {
      localStorage.removeItem("user");
      setUser(null);
    }
  }, []);

  const fetchProfile = useCallback(async () => {
    const storedToken = localStorage.getItem("token");
    if (!storedToken) {
      setLoading(false);
      return null;
    }
    try {
      const response = await API.get("/auth/profile");
      const profile = response.data?.data ?? response.data?.user ?? response.data;
      if (profile && profile.role === "user") {
        profile.role = "member";
      }
      localStorage.setItem("user", JSON.stringify(profile));
      setUser(profile);
      return profile;
    } catch {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      setToken(null);
      setUser(null);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    if (!storedToken) {
      setLoading(false);
      return;
    }
    fetchProfile();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

const login = async (credentials) => {
  const response = await API.post("/auth/login", credentials);

  const data = response.data.data || response.data;

  const token = data.token;
  const user = data.user;

  setSession(token, user);

  return user;
};

  const register = async (values) => {
  const response = await API.post("/auth/register", values);

  const data = response.data.data || response.data;

  const token = data.token;
  const user = data.user;

  setSession(token, user);

  return user;
};

  const logout = useCallback(async () => {
    try {
      await API.post("/auth/logout");
    } catch {
      // ignore logout errors
    }
    setSession(null, null);
    navigate("/");
  }, [navigate, setSession]);

  const updateProfile = useCallback(
    async (values) => {
      const payload = {
        name: values.name,
        phone: values.phone,
        email: values.email,
      };
      if (values.password) {
        payload.password = values.password;
      }
      const response = await API.post("/auth/update-profile", payload);
      const updated = response.data?.data ?? response.data?.user ?? response.data;
      if (updated && updated.role === "user") {
        updated.role = "member";
      }
      const mergedUser = { ...user, ...updated };
      setSession(token, mergedUser);
      return mergedUser;
    },
    [setSession, token, user]
  );

  const forgotPassword = useCallback(async (email) => {
    const response = await API.post("/auth/forgot-password", { email });
    return response.data;
  }, []);

  const resetPassword = useCallback(async (resetToken, password) => {
    const response = await API.post("/auth/reset-password", { token: resetToken, password });
    return response.data;
  }, []);

  const value = useMemo(
    () => ({
      token,
      user,
      loading,
      login,
      register,
      logout,
      updateProfile,
      fetchProfile,
      forgotPassword,
      resetPassword,
    }),
    [token, user, loading, login, register, logout, updateProfile, fetchProfile, forgotPassword, resetPassword]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
