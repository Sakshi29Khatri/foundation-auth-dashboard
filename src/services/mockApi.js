const USERS_KEY = "mockAuthUsers";
const SESSION_KEY = "mockAuthSession";
const RESET_TOKENS_KEY = "mockAuthResetTokens";

const defaultUsers = [
  {
    id: 1,
    name: "Admin User",
    email: "admin@foundation.com",
    phone: "1234567890",
    password: "Admin1234",
    role: "admin",
  },
  {
    id: 2,
    name: "Member User",
    email: "member@foundation.com",
    phone: "0987654321",
    password: "Member1234",
    role: "member",
  },
];

function loadJson(key, fallback) {
  const raw = localStorage.getItem(key);
  return raw ? JSON.parse(raw) : fallback;
}

function saveJson(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function loadUsers() {
  const users = loadJson(USERS_KEY, null);
  if (!users) {
    saveJson(USERS_KEY, defaultUsers);
    return defaultUsers.slice();
  }
  return users;
}

function saveUsers(users) {
  saveJson(USERS_KEY, users);
}

function loadSession() {
  return loadJson(SESSION_KEY, null);
}

function saveSession(session) {
  if (!session) {
    localStorage.removeItem(SESSION_KEY);
    return;
  }
  saveJson(SESSION_KEY, session);
}

function loadResetTokens() {
  return loadJson(RESET_TOKENS_KEY, {});
}

function saveResetTokens(tokens) {
  saveJson(RESET_TOKENS_KEY, tokens);
}

function sanitizeUser(user) {
  const { password, ...rest } = user;
  return rest;
}

function createToken() {
  return `mock-${Math.random().toString(36).slice(2)}-${Date.now()}`;
}

function buildResponse(data) {
  return Promise.resolve({ data });
}

function buildError(status, message, errors = null) {
  const error = new Error(message);
  error.response = { status, data: { success: false, message, error: message, errors } };
  return Promise.reject(error);
}

function findUserByEmail(email) {
  return loadUsers().find((user) => user.email.toLowerCase() === email.toLowerCase());
}

function getSessionUser() {
  const session = loadSession();
  if (!session?.token || !session?.user) {
    return null;
  }
  return sanitizeUser(session.user);
}

function setLoggedInUser(user) {
  const token = createToken();
  const session = { token, user };
  saveSession(session);
  return session;
}

const MockApi = {
  async post(path, payload) {
    const users = loadUsers();
    const normalizedPath = path.replace(/^\/?/, "/");

    switch (normalizedPath) {
      case "/auth/register": {
        const errors = {};
        if (!payload?.name?.trim()) errors.name = ["Name is required."];
        if (!payload?.phone?.trim()) errors.phone = ["Phone is required."];
        if (!payload?.email?.trim()) errors.email = ["Email is required."];
        if (!payload?.password) errors.password = ["Password is required."];
        if (Object.keys(errors).length) {
          return buildError(422, "Validation failed.", errors);
        }
        if (findUserByEmail(payload.email)) {
          return buildError(409, "An account with this email already exists.");
        }
        const nextId = users.reduce((max, user) => Math.max(max, user.id), 0) + 1;
        const newUser = {
          id: nextId,
          name: payload.name,
          phone: payload.phone,
          email: payload.email,
          password: payload.password,
          role: "member",
        };
        const updated = [...users, newUser];
        saveUsers(updated);
        const session = setLoggedInUser(newUser);
        return buildResponse({ token: session.token, user: sanitizeUser(newUser) });
      }

      case "/auth/login": {
        if (!payload?.email || !payload?.password) {
          return buildError(422, "Email and password are required.");
        }
        const user = findUserByEmail(payload.email);
        if (!user || user.password !== payload.password) {
          return buildError(401, "Invalid email or password.");
        }
        const session = setLoggedInUser(user);
        return buildResponse({ token: session.token, user: sanitizeUser(user) });
      }

      case "/auth/logout": {
        saveSession(null);
        return buildResponse({ success: true });
      }

      case "/auth/update-profile": {
        const session = loadSession();
        if (!session?.token || !session.user) {
          return buildError(401, "Unauthorized.");
        }
        const currentUser = session.user;
        const updatedUser = {
          ...currentUser,
          name: payload.name ?? currentUser.name,
          phone: payload.phone ?? currentUser.phone,
          email: payload.email ?? currentUser.email,
          password: payload.password ? payload.password : currentUser.password,
        };
        const refreshedUsers = users.map((user) => (user.id === currentUser.id ? updatedUser : user));
        saveUsers(refreshedUsers);
        saveSession({ token: session.token, user: updatedUser });
        return buildResponse({ data: sanitizeUser(updatedUser) });
      }

      case "/auth/forgot-password": {
        if (!payload?.email) {
          return buildError(422, "Email is required.");
        }
        const user = findUserByEmail(payload.email);
        if (!user) {
          return buildResponse({ success: true, message: "If that email exists, a reset link has been sent." });
        }
        const tokens = loadResetTokens();
        const resetToken = createToken();
        tokens[resetToken] = user.email;
        saveResetTokens(tokens);
        return buildResponse({ success: true, message: "Password reset token created.", token: resetToken });
      }

      case "/auth/reset-password": {
        if (!payload?.token || !payload?.password) {
          return buildError(422, "Token and password are required.");
        }
        const tokens = loadResetTokens();
        const email = tokens[payload.token];
        if (!email) {
          return buildError(400, "Invalid or expired reset token.");
        }
        const user = findUserByEmail(email);
        if (!user) {
          return buildError(400, "Invalid token.");
        }
        const updatedUsers = users.map((item) =>
          item.email === email ? { ...item, password: payload.password } : item
        );
        saveUsers(updatedUsers);
        delete tokens[payload.token];
        saveResetTokens(tokens);
        return buildResponse({ success: true, message: "Password has been reset." });
      }

      default:
        return buildError(404, "Endpoint not found.");
    }
  },

  async get(path) {
    const normalizedPath = path.replace(/^\/?/, "/");
    switch (normalizedPath) {
      case "/auth/profile": {
        const session = loadSession();
        if (!session?.token || !session?.user) {
          return buildError(401, "Unauthorized.");
        }
        return buildResponse({ data: sanitizeUser(session.user) });
      }
      default:
        return buildError(404, "Endpoint not found.");
    }
  },
};

export default MockApi;
