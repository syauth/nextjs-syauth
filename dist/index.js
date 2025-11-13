"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var index_exports = {};
__export(index_exports, {
  SyAuth: () => client_default,
  SyAuthProvider: () => SyAuthProvider,
  useSyAuth: () => useSyAuth,
  withAuth: () => withAuth
});
module.exports = __toCommonJS(index_exports);

// src/client.ts
var import_axios = __toESM(require("axios"));
function formatDjangoError(error) {
  if (!error.response?.data) {
    return error.message || "An unexpected error occurred";
  }
  const data = error.response.data;
  if (typeof data === "string") {
    return data;
  }
  if (data.error) {
    return data.error;
  }
  if (data.message) {
    return data.message;
  }
  if (data.detail) {
    return data.detail;
  }
  const validationErrors = [];
  for (const [field, messages] of Object.entries(data)) {
    if (Array.isArray(messages)) {
      messages.forEach((msg) => {
        const fieldLabel = field === "non_field_errors" ? "" : `${field}: `;
        validationErrors.push(`${fieldLabel}${msg}`);
      });
    } else if (typeof messages === "string") {
      const fieldLabel = field === "non_field_errors" ? "" : `${field}: `;
      validationErrors.push(`${fieldLabel}${messages}`);
    }
  }
  if (validationErrors.length > 0) {
    return validationErrors.join(", ");
  }
  return error.message || "An unexpected error occurred";
}
var SyAuth = class {
  constructor(config) {
    this.config = config;
    this.tokenKey = "auth_token";
    this.userKey = "auth_user";
    this.cookieName = "auth_status";
    this.apiKey = config.apiKey;
    if (!config.apiKey) {
      throw new Error("API key is required for SyAuth");
    }
    if (!config.oauthClientId) {
      throw new Error("OAuth Client ID is required for SyAuth");
    }
    this.apiClient = import_axios.default.create({
      baseURL: config.apiUrl,
      headers: {
        "Content-Type": "application/json"
      }
    });
    this.apiClient.interceptors.request.use(
      (config2) => {
        const token = this.getToken();
        if (token) {
          config2.headers.Authorization = `Bearer ${token}`;
        }
        return config2;
      },
      (error) => Promise.reject(error)
    );
    if (typeof window !== "undefined") {
      this.syncAuthStatus();
    }
  }
  // Authentication methods
  async login(email, password, remember_me = false) {
    try {
      const response = await this.apiClient.post("/login/", {
        email,
        password,
        remember_me
      });
      if (response.data.token) {
        this.setToken(response.data.token);
      }
      if (response.data.user) {
        this.setUser(response.data.user);
      }
      this.syncAuthStatus();
      if (this.config.onLoginSuccess) {
        this.config.onLoginSuccess(response.data.user);
      }
      return response.data.user;
    } catch (error) {
      if (import_axios.default.isAxiosError(error)) {
        const errorMessage = formatDjangoError(error);
        throw new Error(errorMessage);
      }
      throw error;
    }
  }
  async logout() {
    try {
      await this.apiClient.post("/logout/");
    } catch (error) {
      console.error("Logout API error:", error);
    } finally {
      this.clearAuth();
      if (this.config.onLogout) {
        this.config.onLogout();
      }
    }
  }
  async getProfile() {
    try {
      const response = await this.apiClient.get("/user/profile/");
      this.setUser(response.data);
      return response.data;
    } catch (error) {
      if (import_axios.default.isAxiosError(error) && error.response?.status === 401) {
        this.clearAuth();
      }
      return null;
    }
  }
  async updateProfile(data) {
    try {
      const response = await this.apiClient.patch(
        "/user/profile/",
        data
      );
      const currentUser = this.getUser();
      if (currentUser) {
        this.setUser({
          ...currentUser,
          ...response.data
        });
      }
      return response.data;
    } catch (error) {
      if (import_axios.default.isAxiosError(error)) {
        const errorMessage = formatDjangoError(error);
        throw new Error(errorMessage);
      }
      throw error;
    }
  }
  async register(userData) {
    try {
      const response = await this.apiClient.post(
        "/register/",
        userData,
        {
          headers: {
            "X-API-Key": this.apiKey
          }
        }
      );
      return response.data;
    } catch (error) {
      if (import_axios.default.isAxiosError(error)) {
        const errorMessage = formatDjangoError(error);
        throw new Error(errorMessage);
      }
      throw error;
    }
  }
  async verifyEmail(email, code) {
    try {
      const response = await this.apiClient.post(
        "/email/verify/",
        {
          email,
          code,
          oauth_client: this.config.oauthClientId
        }
      );
      return response.data;
    } catch (error) {
      if (import_axios.default.isAxiosError(error)) {
        const errorMessage = formatDjangoError(error);
        throw new Error(errorMessage);
      }
      throw error;
    }
  }
  async requestVerificationCode(email) {
    try {
      const response = await this.apiClient.post(
        "/email/verify/resend/",
        {
          email,
          oauth_client: this.config.oauthClientId
        }
      );
      return response.data;
    } catch (error) {
      if (import_axios.default.isAxiosError(error)) {
        const errorMessage = formatDjangoError(error);
        throw new Error(errorMessage);
      }
      throw error;
    }
  }
  async requestPasswordReset(email) {
    try {
      const response = await this.apiClient.post(
        "/password/reset/",
        {
          email,
          oauth_client: this.config.oauthClientId
        }
      );
      return response.data;
    } catch (error) {
      if (import_axios.default.isAxiosError(error)) {
        const errorMessage = formatDjangoError(error);
        throw new Error(errorMessage);
      }
      throw error;
    }
  }
  async confirmPasswordReset(data) {
    try {
      const response = await this.apiClient.post(
        "/password/reset/confirm/",
        {
          ...data,
          oauth_client: this.config.oauthClientId
        }
      );
      return response.data;
    } catch (error) {
      if (import_axios.default.isAxiosError(error)) {
        const errorMessage = formatDjangoError(error);
        throw new Error(errorMessage);
      }
      throw error;
    }
  }
  // Token management
  getToken() {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(this.tokenKey);
  }
  getUser() {
    if (typeof window === "undefined") return null;
    const userData = localStorage.getItem(this.userKey);
    return userData ? JSON.parse(userData) : null;
  }
  isAuthenticated() {
    return !!this.getToken();
  }
  getOAuthClientId() {
    return this.config.oauthClientId;
  }
  // Private methods
  setToken(token) {
    localStorage.setItem(this.tokenKey, token);
  }
  setUser(user) {
    localStorage.setItem(this.userKey, JSON.stringify(user));
  }
  clearAuth() {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);
    this.clearAuthCookie();
  }
  syncAuthStatus() {
    if (this.isAuthenticated()) {
      document.cookie = `${this.cookieName}=true; path=/; max-age=3600; SameSite=Strict`;
    } else {
      this.clearAuthCookie();
    }
  }
  clearAuthCookie() {
    document.cookie = `${this.cookieName}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
  }
};
var client_default = SyAuth;

// src/react.tsx
var import_react = require("react");
var import_navigation = require("next/navigation");
var import_jsx_runtime = require("react/jsx-runtime");
var AuthContext = (0, import_react.createContext)(void 0);
var SyAuthProvider = ({
  children,
  authClient,
  redirectAfterLogin = "/dashboard",
  unauthorizedRedirect = "/login"
}) => {
  const [user, setUser] = (0, import_react.useState)(null);
  const [loading, setLoading] = (0, import_react.useState)(true);
  const [error, setError] = (0, import_react.useState)(null);
  const [isAuthenticated, setIsAuthenticated] = (0, import_react.useState)(false);
  const router = (0, import_navigation.useRouter)();
  (0, import_react.useEffect)(() => {
    const checkAuth = async () => {
      try {
        setLoading(true);
        const storedUser = authClient.getUser();
        if (storedUser) {
          setUser(storedUser);
          setIsAuthenticated(true);
        }
        const userData = await authClient.getProfile();
        if (userData) {
          setUser(userData);
          setIsAuthenticated(true);
        } else if (!storedUser) {
          setUser(null);
          setIsAuthenticated(false);
        }
      } catch (error2) {
        console.error("Auth check error:", error2);
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, [authClient]);
  const login = async (email, password, remember_me = false) => {
    try {
      setLoading(true);
      setError(null);
      const userData = await authClient.login(email, password, remember_me);
      setUser(userData);
      setIsAuthenticated(true);
      let returnTo = redirectAfterLogin;
      if (typeof window !== "undefined") {
        const params = new URLSearchParams(window.location.search);
        const returnToParam = params.get("return_to");
        if (returnToParam) {
          returnTo = returnToParam;
        }
      }
      router.push(returnTo);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Login failed";
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };
  const logout = async () => {
    try {
      setLoading(true);
      await authClient.logout();
      setUser(null);
      setIsAuthenticated(false);
      router.push(unauthorizedRedirect);
    } catch (err) {
      console.error("Logout error:", err);
      setUser(null);
      setIsAuthenticated(false);
      router.push(unauthorizedRedirect);
    } finally {
      setLoading(false);
    }
  };
  const register = async (userData) => {
    try {
      setLoading(true);
      setError(null);
      await authClient.register(userData);
      router.push(
        `/verify-email?email=${encodeURIComponent(
          userData.email
        )}&registered=true`
      );
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Registration failed";
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };
  const verifyEmail = async (email, code) => {
    try {
      setLoading(true);
      setError(null);
      const result = await authClient.verifyEmail(email, code);
      router.push(`/login?verified=true&email=${encodeURIComponent(email)}`);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Verification failed";
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };
  const requestVerificationCode = async (email) => {
    try {
      setLoading(true);
      setError(null);
      return await authClient.requestVerificationCode(email);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to resend verification code";
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };
  const requestPasswordReset = async (email) => {
    try {
      setLoading(true);
      setError(null);
      const result = await authClient.requestPasswordReset(email);
      router.push(`/reset-password?email=${encodeURIComponent(email)}`);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Password reset request failed";
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };
  const confirmPasswordReset = async (data) => {
    try {
      setLoading(true);
      setError(null);
      const result = await authClient.confirmPasswordReset(data);
      router.push(`/login?reset=true&email=${encodeURIComponent(data.email)}`);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Password reset confirmation failed";
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };
  const updateProfile = async (data) => {
    try {
      setLoading(true);
      setError(null);
      const updatedUser = await authClient.updateProfile(data);
      setUser(updatedUser);
      return updatedUser;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Profile update failed";
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };
  (0, import_react.useEffect)(() => {
    if (!loading && !isAuthenticated) {
      if (typeof window !== "undefined") {
        const pathname = window.location.pathname;
        const isProtectedPath = [
          "/dashboard",
          "/profile",
          "/settings",
          "/account"
        ].some(
          (protectedPath) => pathname === protectedPath || pathname.startsWith(`${protectedPath}/`)
        );
        if (isProtectedPath) {
          const returnPath = encodeURIComponent(
            pathname + window.location.search
          );
          router.push(`${unauthorizedRedirect}?return_to=${returnPath}`);
        }
      }
    }
  }, [loading, isAuthenticated, router, unauthorizedRedirect]);
  const value = {
    user,
    loading,
    error,
    isAuthenticated,
    authClient,
    login,
    logout,
    register,
    verifyEmail,
    requestVerificationCode,
    requestPasswordReset,
    confirmPasswordReset,
    updateProfile
  };
  return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AuthContext.Provider, { value, children });
};
var useSyAuth = () => {
  const context = (0, import_react.useContext)(AuthContext);
  if (context === void 0) {
    throw new Error("useSyAuth must be used within a SyAuthProvider");
  }
  return context;
};

// src/middleware.ts
var import_server = require("next/server");
function withAuth(request, options) {
  const path = request.nextUrl.pathname;
  const authCookieName = options.authCookieName || "auth_status";
  const defaultProtectedRoute = options.defaultProtectedRoute || "/dashboard";
  const authRoutes = options.authRoutes || [
    "/login",
    "/register",
    "/forgot-password",
    "/reset-password",
    "/verify-email"
  ];
  const isProtectedPath = options.protectedRoutes.some(
    (protectedPath) => path === protectedPath || path.startsWith(`${protectedPath}/`)
  );
  const isAuthPath = authRoutes.some(
    (authPath) => path === authPath || path.startsWith(`${authPath}/`)
  );
  const isAuthenticated = request.cookies.has(authCookieName);
  const returnTo = request.nextUrl.searchParams.get("return_to");
  if (isAuthenticated && isAuthPath) {
    const redirectUrl = returnTo || defaultProtectedRoute;
    return import_server.NextResponse.redirect(new URL(redirectUrl, request.url));
  }
  if (isProtectedPath && !isAuthenticated) {
    const loginUrl = new URL(options.loginUrl, request.url);
    loginUrl.searchParams.set("return_to", path);
    return import_server.NextResponse.redirect(loginUrl);
  }
  const redirectCount = parseInt(
    request.cookies.get("redirect_count")?.value || "0"
  );
  if (redirectCount > 5) {
    const response = import_server.NextResponse.next();
    response.cookies.set("redirect_count", "0");
    return response;
  }
  if (isProtectedPath || isAuthPath) {
    const response = import_server.NextResponse.next();
    response.cookies.set("redirect_count", (redirectCount + 1).toString());
    return response;
  }
  return import_server.NextResponse.next();
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  SyAuth,
  SyAuthProvider,
  useSyAuth,
  withAuth
});
