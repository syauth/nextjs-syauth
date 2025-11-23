import axios, { AxiosInstance, AxiosError } from 'axios';
import {
  generatePKCEPair,
  generateState,
  storePKCEParams,
  retrievePKCEParams,
  clearPKCEParams,
} from './utils/pkce';

export interface AuthUser {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  email_verified: boolean;
  user_type: string;
  company: string;
  job_title: string;
  phone_number: string;
  country: string;
}

export interface ProfileUpdateData {
  first_name?: string;
  last_name?: string;
  email?: string;
  password?: string;
  current_password?: string;
  company?: string;
  job_title?: string;
  phone_number?: string;
  country?: string;
}

export interface AuthResponse {
  user: AuthUser;
  token?: string;
  refresh_token?: string;
  message: string;
}

export interface RegisterResponse {
  message: string;
  user?: Partial<AuthUser>;
  success: boolean;
}

export interface VerificationResponse {
  message: string;
  success: boolean;
  email?: string;
}

export interface PasswordResetResponse {
  message: string;
  success: boolean;
}

export interface OAuthTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token?: string;
  id_token?: string;
  scope?: string;
}

export interface OAuthCallbackParams {
  code: string;
  state: string;
}

export interface SyAuthConfig {
  apiUrl: string;
  apiKey?: string; // Optional - only required for registration endpoint
  oauthClientId: string;
  redirectUri?: string; // OAuth 2.0 redirect URI (required for OAuth flow)
  scopes?: string; // OAuth scopes (default: "openid profile email")
  onLoginSuccess?: (user: AuthUser) => void;
  onLogout?: () => void;
}
export interface RegisterData {
  email: string;
  password: string;
  confirm_password: string;
  first_name: string;
  last_name: string;
  oauth_client: string;
}

export interface PasswordResetConfirmData {
  email: string;
  code: string;
  new_password: string;
  confirm_password: string;
}

export interface DjangoValidationError {
  [key: string]: string[] | string;
}

/**
 * Format Django error responses into user-friendly messages
 */
function formatDjangoError(error: AxiosError): string {
  if (!error.response?.data) {
    return error.message || 'An unexpected error occurred';
  }

  const data = error.response.data as Record<string, unknown>;

  if (typeof data === 'string') {
    return data;
  }

  if (data.error) {
    return data.error as string;
  }

  if (data.message) {
    return data.message as string;
  }

  if (data.detail) {
    return data.detail as string;
  }

  const validationErrors: string[] = [];
  for (const [field, messages] of Object.entries(data)) {
    if (Array.isArray(messages)) {
      messages.forEach((msg: string) => {
        const fieldLabel = field === 'non_field_errors' ? '' : `${field}: `;
        validationErrors.push(`${fieldLabel}${msg}`);
      });
    } else if (typeof messages === 'string') {
      const fieldLabel = field === 'non_field_errors' ? '' : `${field}: `;
      validationErrors.push(`${fieldLabel}${messages}`);
    }
  }

  if (validationErrors.length > 0) {
    return validationErrors.join(', ');
  }

  return error.message || 'An unexpected error occurred';
}

class SyAuth {
  private apiClient: AxiosInstance;
  private config: SyAuthConfig;
  private tokenKey: string;
  private refreshTokenKey: string;
  private tokenExpiryKey: string;
  private userKey: string;
  private cookieName: string;
  private apiKey?: string;
  private refreshPromise: Promise<string> | null = null;

  constructor(config: SyAuthConfig) {
    this.config = config;
    this.tokenKey = 'auth_token';
    this.refreshTokenKey = 'auth_refresh_token';
    this.tokenExpiryKey = 'auth_token_expiry';
    this.userKey = 'auth_user';
    this.cookieName = 'auth_status';
    this.apiKey = config.apiKey;

    if (!config.oauthClientId) {
      throw new Error('OAuth Client ID is required for SyAuth');
    }
    // Create API client
    this.apiClient = axios.create({
      baseURL: config.apiUrl,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add token interceptor - automatically add auth header
    this.apiClient.interceptors.request.use(
      async (config) => {
        // Skip token for certain endpoints
        const skipTokenEndpoints = ['/oauth/token/', '/register/', '/login/'];
        const isSkipEndpoint = skipTokenEndpoints.some(endpoint =>
          config.url?.includes(endpoint)
        );

        if (!isSkipEndpoint) {
          try {
            const token = await this.getValidToken();
            if (token) {
              config.headers.Authorization = `Bearer ${token}`;
            }
          } catch (error) {
            // If token refresh fails, let the request proceed without token
            // The 401 response will trigger logout
          }
        }
        return config;
      },
      error => Promise.reject(error)
    );

    // Add response interceptor to handle 401 errors
    this.apiClient.interceptors.response.use(
      response => response,
      async (error) => {
        const originalRequest = error.config;

        // If 401 and we haven't already retried
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            // Try to refresh the token
            const newToken = await this.refreshAccessToken();

            // Retry original request with new token
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            return this.apiClient(originalRequest);
          } catch (refreshError) {
            // Refresh failed - clear auth and reject
            this.clearAuth();
            return Promise.reject(refreshError);
          }
        }

        return Promise.reject(error);
      }
    );

    // Initialize auth status
    if (typeof window !== 'undefined') {
      this.syncAuthStatus();
    }
  }

  // Authentication methods
  /**
   * @deprecated Use loginWithRedirect() for OAuth 2.0 Authorization Code Flow.
   * Password grant is deprecated in OAuth 2.1 and may be removed in future versions.
   */
  async login(
    email: string,
    password: string,
    remember_me: boolean = false
  ): Promise<AuthUser> {
    console.warn(
      '[SyAuth] Warning: login() uses password grant which is deprecated in OAuth 2.1. ' +
      'Consider using loginWithRedirect() for better security.'
    );

    try {
      const response = await this.apiClient.post<AuthResponse>('/login/', {
        email,
        password,
        remember_me,
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
      // Handle Axios errors with proper Django error message extraction
      if (axios.isAxiosError(error)) {
        const errorMessage = formatDjangoError(error);
        throw new Error(errorMessage);
      }
      throw error;
    }
  }

  async logout(): Promise<void> {
    try {
      await this.apiClient.post('/logout/');
    } catch (error) {
      console.error('Logout API error:', error);
    } finally {
      this.clearAuth();
      if (this.config.onLogout) {
        this.config.onLogout();
      }
    }
  }

  async getProfile(): Promise<AuthUser | null> {
    try {
      const response = await this.apiClient.get<AuthUser>('/user/profile/');
      this.setUser(response.data);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        this.clearAuth();
      }
      return null;
    }
  }

  async updateProfile(data: ProfileUpdateData): Promise<AuthUser> {
    try {
      const response = await this.apiClient.patch<AuthUser>(
        '/user/profile/',
        data
      );

      // Update the stored user data
      const currentUser = this.getUser();
      if (currentUser) {
        this.setUser({
          ...currentUser,
          ...response.data,
        });
      }

      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const errorMessage = formatDjangoError(error);
        throw new Error(errorMessage);
      }
      throw error;
    }
  }

  async register(userData: RegisterData): Promise<RegisterResponse> {
    if (!this.apiKey) {
      throw new Error('API key is required for user registration. Please provide apiKey in SyAuthConfig.');
    }

    try {
      const response = await this.apiClient.post<RegisterResponse>(
        '/register/',
        userData,
        {
          headers: {
            'X-API-Key': this.apiKey,
          },
        }
      );

      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const errorMessage = formatDjangoError(error);
        throw new Error(errorMessage);
      }
      throw error;
    }
  }

  async verifyEmail(
    email: string,
    code: string
  ): Promise<VerificationResponse> {
    try {
      const response = await this.apiClient.post<VerificationResponse>(
        '/email/verify/',
        {
          email,
          code,
          oauth_client: this.config.oauthClientId
        }
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const errorMessage = formatDjangoError(error);
        throw new Error(errorMessage);
      }
      throw error;
    }
  }

  async requestVerificationCode(email: string): Promise<VerificationResponse> {
    try {
      const response = await this.apiClient.post<VerificationResponse>(
        '/email/verify/resend/',
        {
          email,
          oauth_client: this.config.oauthClientId
        }
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const errorMessage = formatDjangoError(error);
        throw new Error(errorMessage);
      }
      throw error;
    }
  }

  async requestPasswordReset(email: string): Promise<PasswordResetResponse> {
    try {
      const response = await this.apiClient.post<PasswordResetResponse>(
        '/password/reset/',
        {
          email,
          oauth_client: this.config.oauthClientId
        }
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const errorMessage = formatDjangoError(error);
        throw new Error(errorMessage);
      }
      throw error;
    }
  }

  async confirmPasswordReset(
    data: PasswordResetConfirmData
  ): Promise<PasswordResetResponse> {
    try {
      const response = await this.apiClient.post<PasswordResetResponse>(
        '/password/reset/confirm/',
        {
          ...data,
          oauth_client: this.config.oauthClientId
        }
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const errorMessage = formatDjangoError(error);
        throw new Error(errorMessage);
      }
      throw error;
    }
  }

  // OAuth 2.0 Authorization Code Flow with PKCE

  /**
   * Initiate OAuth 2.0 login by redirecting to the authorization endpoint
   * Uses PKCE (Proof Key for Code Exchange) for security
   *
   * @param redirectTo - Optional path to redirect to after successful authentication
   */
  async loginWithRedirect(redirectTo?: string): Promise<void> {
    if (typeof window === 'undefined') {
      throw new Error('loginWithRedirect can only be called in the browser');
    }

    if (!this.config.redirectUri) {
      throw new Error(
        'redirectUri is required in SyAuthConfig to use OAuth 2.0 flow. ' +
        'Please provide it during initialization.'
      );
    }

    // Generate PKCE parameters
    const { verifier, challenge } = await generatePKCEPair();
    const state = generateState();

    // Store PKCE parameters in session storage
    storePKCEParams(verifier, state, redirectTo);

    // Build authorization URL
    const authUrl = this.buildAuthorizationUrl(challenge, state);

    // Redirect to authorization endpoint
    window.location.href = authUrl;
  }

  /**
   * Handle OAuth callback and exchange authorization code for tokens
   * Should be called on the redirect URI page
   *
   * @param params - Callback parameters (code, state) from URL
   * @returns The authenticated user
   */
  async handleOAuthCallback(params: OAuthCallbackParams): Promise<AuthUser> {
    if (typeof window === 'undefined') {
      throw new Error('handleOAuthCallback can only be called in the browser');
    }

    // Retrieve stored PKCE parameters
    const { verifier, state: storedState } = retrievePKCEParams();

    // Validate state parameter (CSRF protection)
    if (!storedState || storedState !== params.state) {
      clearPKCEParams();
      throw new Error(
        'Invalid state parameter. Possible CSRF attack or expired session.'
      );
    }

    if (!verifier) {
      clearPKCEParams();
      throw new Error(
        'Code verifier not found. Please initiate login again.'
      );
    }

    try {
      // Exchange authorization code for tokens
      const tokenResponse = await this.exchangeCodeForToken(
        params.code,
        verifier
      );

      // Store the access token, refresh token, and expiry
      this.setToken(tokenResponse.access_token);
      if (tokenResponse.refresh_token) {
        this.setRefreshToken(tokenResponse.refresh_token);
      }
      if (tokenResponse.expires_in) {
        const expiryTime = Date.now() + tokenResponse.expires_in * 1000;
        this.setTokenExpiry(expiryTime);
      }

      // Get user profile using the access token
      const user = await this.getProfile();

      if (!user) {
        throw new Error('Failed to retrieve user profile');
      }

      // Clear PKCE parameters
      clearPKCEParams();

      // Sync auth status
      this.syncAuthStatus();

      // Call success callback
      if (this.config.onLoginSuccess) {
        this.config.onLoginSuccess(user);
      }

      return user;
    } catch (error) {
      clearPKCEParams();
      if (axios.isAxiosError(error)) {
        const errorMessage = formatDjangoError(error);
        throw new Error(errorMessage);
      }
      throw error;
    }
  }

  /**
   * Exchange authorization code for access token
   * Calls the /oauth/token/ endpoint with PKCE verification
   *
   * @param code - Authorization code from callback
   * @param codeVerifier - PKCE code verifier
   * @returns Token response
   */
  private async exchangeCodeForToken(
    code: string,
    codeVerifier: string
  ): Promise<OAuthTokenResponse> {
    if (!this.config.redirectUri) {
      throw new Error('redirectUri is required for token exchange');
    }

    try {
      // Note: /oauth/token/ endpoint already has CSRF exempt + wildcard CORS
      const response = await this.apiClient.post<OAuthTokenResponse>(
        '/oauth/token/',
        new URLSearchParams({
          grant_type: 'authorization_code',
          code: code,
          redirect_uri: this.config.redirectUri,
          client_id: this.config.oauthClientId,
          code_verifier: codeVerifier,
        }).toString(),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }
      );

      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const errorMessage = formatDjangoError(error);
        throw new Error(`Token exchange failed: ${errorMessage}`);
      }
      throw error;
    }
  }

  /**
   * Refresh the access token using the refresh token
   * @returns New access token
   */
  private async refreshAccessToken(): Promise<string> {
    const refreshToken = this.getRefreshToken();

    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    try {
      const response = await this.apiClient.post<OAuthTokenResponse>(
        '/oauth/token/',
        new URLSearchParams({
          grant_type: 'refresh_token',
          refresh_token: refreshToken,
          client_id: this.config.oauthClientId,
        }).toString(),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }
      );

      // Store new tokens
      this.setToken(response.data.access_token);
      if (response.data.refresh_token) {
        this.setRefreshToken(response.data.refresh_token);
      }
      if (response.data.expires_in) {
        const expiryTime = Date.now() + response.data.expires_in * 1000;
        this.setTokenExpiry(expiryTime);
      }

      return response.data.access_token;
    } catch (error) {
      // If refresh fails, clear auth and force re-login
      this.clearAuth();
      throw new Error('Token refresh failed. Please log in again.');
    }
  }

  /**
   * Get a valid access token, refreshing if necessary
   * @returns Valid access token
   */
  async getValidToken(): Promise<string | null> {
    const token = this.getToken();

    if (!token) {
      return null;
    }

    // If token is expired or about to expire, refresh it
    if (this.isTokenExpired()) {
      try {
        // Prevent multiple simultaneous refresh requests
        if (this.refreshPromise) {
          return await this.refreshPromise;
        }

        this.refreshPromise = this.refreshAccessToken();
        const newToken = await this.refreshPromise;
        this.refreshPromise = null;
        return newToken;
      } catch (error) {
        this.refreshPromise = null;
        throw error;
      }
    }

    return token;
  }

  /**
   * Build the OAuth authorization URL with PKCE parameters
   *
   * @param codeChallenge - PKCE code challenge
   * @param state - State parameter for CSRF protection
   * @returns Complete authorization URL
   */
  private buildAuthorizationUrl(codeChallenge: string, state: string): string {
    const scopes = this.config.scopes || 'openid profile email';

    const params = new URLSearchParams({
      client_id: this.config.oauthClientId,
      redirect_uri: this.config.redirectUri!,
      response_type: 'code',
      scope: scopes,
      state: state,
      code_challenge: codeChallenge,
      code_challenge_method: 'S256',
    });

    return `${this.config.apiUrl}/oauth/authorize/?${params.toString()}`;
  }

  /**
   * Get the redirect path stored during login initiation
   *
   * @returns The redirect path or null
   */
  getStoredRedirectPath(): string | null {
    const { redirectTo } = retrievePKCEParams();
    return redirectTo;
  }

  // Token management
  getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(this.tokenKey);
  }

  getUser(): AuthUser | null {
    if (typeof window === 'undefined') return null;
    const userData = localStorage.getItem(this.userKey);
    return userData ? JSON.parse(userData) : null;
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  getOAuthClientId(): string {
    return this.config.oauthClientId;
  }

  // Private methods
  private setToken(token: string): void {
    localStorage.setItem(this.tokenKey, token);
  }

  private setRefreshToken(token: string): void {
    localStorage.setItem(this.refreshTokenKey, token);
  }

  private getRefreshToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(this.refreshTokenKey);
  }

  private setTokenExpiry(expiryTime: number): void {
    localStorage.setItem(this.tokenExpiryKey, expiryTime.toString());
  }

  private getTokenExpiry(): number | null {
    if (typeof window === 'undefined') return null;
    const expiry = localStorage.getItem(this.tokenExpiryKey);
    return expiry ? parseInt(expiry, 10) : null;
  }

  private isTokenExpired(): boolean {
    const expiry = this.getTokenExpiry();
    if (!expiry) return false;
    // Consider token expired if within 5 minutes of expiry
    return Date.now() >= expiry - 5 * 60 * 1000;
  }

  private setUser(user: AuthUser): void {
    localStorage.setItem(this.userKey, JSON.stringify(user));
  }

  private clearAuth(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.refreshTokenKey);
    localStorage.removeItem(this.tokenExpiryKey);
    localStorage.removeItem(this.userKey);
    this.clearAuthCookie();
  }

  private syncAuthStatus(): void {
    if (this.isAuthenticated()) {
      document.cookie = `${this.cookieName}=true; path=/; max-age=3600; SameSite=Strict`;
    } else {
      this.clearAuthCookie();
    }
  }

  private clearAuthCookie(): void {
    document.cookie = `${this.cookieName}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
  }
}

export default SyAuth;
