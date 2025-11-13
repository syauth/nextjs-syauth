import React from 'react';
import { NextRequest, NextResponse } from 'next/server';

interface AuthUser {
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
interface ProfileUpdateData {
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
interface AuthResponse {
    user: AuthUser;
    token?: string;
    refresh_token?: string;
    message: string;
}
interface RegisterResponse {
    message: string;
    user?: Partial<AuthUser>;
    success: boolean;
}
interface VerificationResponse {
    message: string;
    success: boolean;
    email?: string;
}
interface PasswordResetResponse {
    message: string;
    success: boolean;
}
interface SyAuthConfig {
    apiUrl: string;
    apiKey: string;
    oauthClientId: string;
    onLoginSuccess?: (user: AuthUser) => void;
    onLogout?: () => void;
}
interface RegisterData {
    email: string;
    password: string;
    confirm_password: string;
    first_name: string;
    last_name: string;
    oauth_client: string;
}
interface PasswordResetConfirmData {
    email: string;
    code: string;
    new_password: string;
    confirm_password: string;
}
declare class SyAuth {
    private apiClient;
    private config;
    private tokenKey;
    private userKey;
    private cookieName;
    private apiKey;
    constructor(config: SyAuthConfig);
    login(email: string, password: string, remember_me?: boolean): Promise<AuthUser>;
    logout(): Promise<void>;
    getProfile(): Promise<AuthUser | null>;
    updateProfile(data: ProfileUpdateData): Promise<AuthUser>;
    register(userData: RegisterData): Promise<RegisterResponse>;
    verifyEmail(email: string, code: string): Promise<VerificationResponse>;
    requestVerificationCode(email: string): Promise<VerificationResponse>;
    requestPasswordReset(email: string): Promise<PasswordResetResponse>;
    confirmPasswordReset(data: PasswordResetConfirmData): Promise<PasswordResetResponse>;
    getToken(): string | null;
    getUser(): AuthUser | null;
    isAuthenticated(): boolean;
    getOAuthClientId(): string;
    private setToken;
    private setUser;
    private clearAuth;
    private syncAuthStatus;
    private clearAuthCookie;
}

interface AuthContextType {
    user: AuthUser | null;
    loading: boolean;
    error: string | null;
    isAuthenticated: boolean;
    authClient: SyAuth;
    login: (email: string, password: string, remember_me?: boolean) => Promise<void>;
    logout: () => Promise<void>;
    register: (userData: RegisterData) => Promise<void>;
    updateProfile: (data: ProfileUpdateData) => Promise<AuthUser>;
    verifyEmail: (email: string, code: string) => Promise<VerificationResponse>;
    requestVerificationCode: (email: string) => Promise<VerificationResponse>;
    requestPasswordReset: (email: string) => Promise<PasswordResetResponse>;
    confirmPasswordReset: (data: PasswordResetConfirmData) => Promise<PasswordResetResponse>;
}
interface AuthProviderProps {
    children: React.ReactNode;
    authClient: SyAuth;
    redirectAfterLogin?: string;
    unauthorizedRedirect?: string;
}
declare const SyAuthProvider: React.FC<AuthProviderProps>;
declare const useSyAuth: () => AuthContextType;

interface MiddlewareOptions {
    /**
     * Routes that require authentication. User will be redirected to
     * the loginUrl if not authenticated.
     */
    protectedRoutes: string[];
    /**
     * Public authentication routes (login, register, etc.)
     */
    authRoutes?: string[];
    /**
     * URL to redirect to when authentication is required
     */
    loginUrl: string;
    /**
     * URL to redirect to after successful login
     */
    defaultProtectedRoute?: string;
    /**
     * Cookie name that indicates authentication status
     */
    authCookieName?: string;
}
/**
 * Middleware helper for SyAuth
 */
declare function withAuth(request: NextRequest, options: MiddlewareOptions): NextResponse;

export { type AuthResponse, type AuthUser, type MiddlewareOptions, type PasswordResetConfirmData, type PasswordResetResponse, type ProfileUpdateData, type RegisterData, SyAuth, type SyAuthConfig, SyAuthProvider, type VerificationResponse, useSyAuth, withAuth };
