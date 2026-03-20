type Credentials = {
  token: string;
  refreshToken?: string;
};

class AuthService {
  private tokenKey = 'auth_token';
  private refreshKey = 'refresh_token';

  storeCredentials({ token, refreshToken }: Credentials) {
    localStorage.setItem(this.tokenKey, token);
    if (refreshToken) {
      localStorage.setItem(this.refreshKey, refreshToken);
    }
  }

  clearCredentials() {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.refreshKey);
  }

  getToken() {
    return localStorage.getItem(this.tokenKey);
  }
}

export const authService = new AuthService();
