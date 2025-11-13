import axios, { AxiosInstance, AxiosError } from 'axios';

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

export interface SyAuthConfig {
  apiUrl: string;
  apiKey: string;
  oauthClientId: string;
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
  private userKey: string;
  private cookieName: string;
  private apiKey: string;

  constructor(config: SyAuthConfig) {
    this.config = config;
    this.tokenKey = 'auth_token';
    this.userKey = 'auth_user';
    this.cookieName = 'auth_status';
    this.apiKey = config.apiKey;

    if (!config.apiKey) {
      throw new Error('API key is required for SyAuth');
    }
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

    // Add token interceptor
    this.apiClient.interceptors.request.use(
      config => {
        const token = this.getToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      error => Promise.reject(error)
    );

    // Initialize auth status
    if (typeof window !== 'undefined') {
      this.syncAuthStatus();
    }
  }

  // Authentication methods
  async login(
    email: string,
    password: string,
    remember_me: boolean = false
  ): Promise<AuthUser> {
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

  private setUser(user: AuthUser): void {
    localStorage.setItem(this.userKey, JSON.stringify(user));
  }

  private clearAuth(): void {
    localStorage.removeItem(this.tokenKey);
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
