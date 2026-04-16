export type User = {
  id: string;
  email: string;
  name: string;
  role: 'customer' | 'admin';
  phone?: string;
  dateOfBirth?: string | null;
  address?: {
    line1?: string;
    line2?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
  };
  profileImageUrl?: string;
  security?: {
    twoFactorEnabled: boolean;
    lastLoginAt?: string | null;
    activeSessions: Array<{
      sessionId: string;
      userAgent?: string;
      ip?: string;
      createdAt?: string | null;
      lastSeenAt?: string | null;
    }>;
  };
};

export type AuthResponse = {
  user: User;
  token: string;
};

export type BackendAuthResponse = {
  _id: string;
  email: string;
  name: string;
  role: 'customer' | 'admin';
  phone?: string;
  dateOfBirth?: string | null;
  address?: {
    line1?: string;
    line2?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
  };
  profileImageUrl?: string;
  security?: {
    twoFactorEnabled: boolean;
    lastLoginAt?: string | null;
    activeSessions: Array<{
      sessionId: string;
      userAgent?: string;
      ip?: string;
      createdAt?: string | null;
      lastSeenAt?: string | null;
    }>;
  };
  token: string;
};

export type BackendMeResponse = {
  _id: string;
  email: string;
  name: string;
  role: 'customer' | 'admin';
  phone?: string;
  dateOfBirth?: string | null;
  address?: {
    line1?: string;
    line2?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
  };
  profileImageUrl?: string;
  security?: {
    twoFactorEnabled: boolean;
    lastLoginAt?: string | null;
    activeSessions: Array<{
      sessionId: string;
      userAgent?: string;
      ip?: string;
      createdAt?: string | null;
      lastSeenAt?: string | null;
    }>;
  };
};
