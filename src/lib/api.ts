// API client for ReputeHQ backend
const API_BASE_URL = process.env.EXPO_PUBLIC_VIBECODE_BACKEND_URL || process.env.EXPO_PUBLIC_BACKEND_URL || '';

interface ApiResponse<T> {
  success?: boolean;
  error?: string;
  data?: T;
}

interface LoginResponse {
  success: boolean;
  user?: {
    id: string;
    email: string;
    name: string;
    avatar?: string;
    two_factor_enabled: boolean;
  };
  requires2FA?: boolean;
  userId?: string;
  error?: string;
  needsVerification?: boolean;
  email?: string;
}

interface SignupResponse {
  success: boolean;
  message?: string;
  emailSent?: boolean;
  error?: string;
}

interface VerifyEmailResponse {
  success: boolean;
  message?: string;
  error?: string;
}

interface TwoFactorSetupResponse {
  success: boolean;
  secret?: string;
  qrCode?: string;
  manualEntryKey?: string;
  error?: string;
}

interface TwoFactorVerifyResponse {
  success: boolean;
  user?: {
    id: string;
    email: string;
    name: string;
    avatar?: string;
    two_factor_enabled: boolean;
  };
  backupCodes?: string[];
  message?: string;
  error?: string;
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;

    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Request failed');
    }

    return data;
  }

  // Auth endpoints
  async login(email: string, password: string): Promise<LoginResponse> {
    return this.request<LoginResponse>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async signup(name: string, email: string, password: string): Promise<SignupResponse> {
    return this.request<SignupResponse>('/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ name, email, password }),
    });
  }

  async verifyEmail(token: string): Promise<VerifyEmailResponse> {
    return this.request<VerifyEmailResponse>('/api/auth/verify-email', {
      method: 'POST',
      body: JSON.stringify({ token }),
    });
  }

  async resendVerification(email: string): Promise<ApiResponse<void>> {
    return this.request<ApiResponse<void>>('/api/auth/resend-verification', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  // 2FA endpoints
  async setup2FA(userId: string): Promise<TwoFactorSetupResponse> {
    return this.request<TwoFactorSetupResponse>('/api/auth/2fa/setup', {
      method: 'POST',
      body: JSON.stringify({ userId }),
    });
  }

  async verify2FASetup(userId: string, code: string): Promise<TwoFactorVerifyResponse> {
    return this.request<TwoFactorVerifyResponse>('/api/auth/2fa/verify-setup', {
      method: 'POST',
      body: JSON.stringify({ userId, code }),
    });
  }

  async verify2FA(userId: string, code: string): Promise<TwoFactorVerifyResponse> {
    return this.request<TwoFactorVerifyResponse>('/api/auth/2fa/verify', {
      method: 'POST',
      body: JSON.stringify({ userId, code }),
    });
  }

  async disable2FA(userId: string, password: string): Promise<ApiResponse<void>> {
    return this.request<ApiResponse<void>>('/api/auth/2fa/disable', {
      method: 'POST',
      body: JSON.stringify({ userId, password }),
    });
  }

  // Health check
  async healthCheck(): Promise<{ status: string; timestamp: string }> {
    return this.request<{ status: string; timestamp: string }>('/api/health');
  }
}

export const api = new ApiClient(API_BASE_URL);
export type { LoginResponse, SignupResponse, TwoFactorSetupResponse, TwoFactorVerifyResponse };
