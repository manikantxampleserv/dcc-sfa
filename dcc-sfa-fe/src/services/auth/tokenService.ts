/**
 * @fileoverview Token Service Utility
 * @description Provides secure token management functionality including storage, retrieval, and validation
 * @author DCC-SFA Team
 * @version 1.0.0
 */

/**
 * Interface for user authentication data stored with token
 */
export interface UserData {
  id: number;
  username: string;
  email: string;
  role: string;
  parent_id: number;
  depot_id?: number | null;
  zone_id?: number | null;
  profile_image?: string | null;
}

/**
 * Token Service Class
 * @description Handles all token-related operations with secure storage practices
 */
class TokenService {
  private readonly TOKEN_KEY = 'dcc_sfa_token';
  private readonly USER_KEY = 'dcc_sfa_user';
  private readonly EXPIRES_KEY = 'dcc_sfa_expires';

  /**
   * Stores authentication token securely in localStorage
   * @param {string} token - JWT token to store
   * @param {UserData} user - User data associated with the token
   * @param {number} [expiresIn] - Token expiration time in seconds (optional)
   * @returns {void}
   * @example
   * tokenService.setToken('eyJhbGciOiJIUzI1NiIs...', userData, 3600);
   */
  setToken(token: string, user: UserData, expiresIn?: number): void {
    try {
      localStorage.setItem(this.TOKEN_KEY, token);
      localStorage.setItem(this.USER_KEY, JSON.stringify(user));

      if (expiresIn) {
        const expiresAt = Date.now() + expiresIn * 1000;
        localStorage.setItem(this.EXPIRES_KEY, expiresAt.toString());
      }

      // Dispatch custom event to notify auth state change
      window.dispatchEvent(new Event('auth-change'));
    } catch (error) {
      console.error('Failed to store token:', error);
      throw new Error('Token storage failed');
    }
  }

  /**
   * Retrieves the stored authentication token
   * @returns {string | null} The stored token or null if not found/expired
   * @example
   * const token = tokenService.getToken();
   * if (token) {
   *   // Token is valid and not expired
   * }
   */
  getToken(): string | null {
    try {
      const token = localStorage.getItem(this.TOKEN_KEY);

      if (!token) {
        return null;
      }

      // Check if token is expired
      if (this.isTokenExpired()) {
        this.clearAuth();
        return null;
      }

      return token;
    } catch (error) {
      console.error('Failed to retrieve token:', error);
      return null;
    }
  }

  /**
   * Retrieves the stored user data
   * @returns {UserData | null} The stored user data or null if not found
   * @example
   * const user = tokenService.getUser();
   * if (user) {
   *   console.log(`Welcome, ${user.username}!`);
   * }
   */
  getUser(): UserData | null {
    try {
      const userStr = localStorage.getItem(this.USER_KEY);
      return userStr ? JSON.parse(userStr) : null;
    } catch (error) {
      console.error('Failed to retrieve user data:', error);
      return null;
    }
  }

  /**
   * Checks if the current token is expired
   * @returns {boolean} True if token is expired or expiration check fails
   * @example
   * if (tokenService.isTokenExpired()) {
   *   // Redirect to login
   * }
   */
  isTokenExpired(): boolean {
    try {
      const expiresAtStr = localStorage.getItem(this.EXPIRES_KEY);

      if (!expiresAtStr) {
        return false; // No expiration set, assume valid
      }

      const expiresAt = parseInt(expiresAtStr);
      return Date.now() >= expiresAt;
    } catch (error) {
      console.error('Failed to check token expiration:', error);
      return true; // Assume expired on error for security
    }
  }

  /**
   * Checks if user is currently authenticated
   * @returns {boolean} True if user has valid, non-expired token
   * @example
   * if (tokenService.isAuthenticated()) {
   *   // Show authenticated content
   * } else {
   *   // Redirect to login
   * }
   */
  isAuthenticated(): boolean {
    const token = this.getToken();
    const user = this.getUser();
    return !!(token && user && !this.isTokenExpired());
  }

  /**
   * Clears all authentication data from storage
   * @returns {void}
   * @example
   * // On logout
   * tokenService.clearAuth();
   * window.location.href = '/login';
   */
  clearAuth(): void {
    try {
      localStorage.removeItem(this.TOKEN_KEY);
      localStorage.removeItem(this.USER_KEY);
      localStorage.removeItem(this.EXPIRES_KEY);

      // Dispatch custom event to notify auth state change
      window.dispatchEvent(new Event('auth-change'));
    } catch (error) {
      console.error('Failed to clear auth data:', error);
    }
  }
}

/**
 * Singleton instance of TokenService
 * @description Export a single instance to ensure consistent token management across the app
 */
export const tokenService = new TokenService();

/**
 * Default export for convenience
 */
export default tokenService;
