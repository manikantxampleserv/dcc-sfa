/**
 * @fileoverview Authentication Service
 * @description Handles all authentication-related API calls and token management
 * @author DCC-SFA Team
 * @version 1.0.0
 */

import api from '../../configs/axio.config';
import { tokenService, type UserData } from './tokenService';

/**
 * Interface for login request payload
 */
export interface LoginRequest {
  email: string;
  password: string;
}

/**
 * Interface for login response from API
 */
export interface LoginResponse {
  success: boolean;
  message: string;
  data: {
    user: {
      id: number;
      email: string;
      name: string;
      role: string;
    };
    accessToken: string;
    refreshToken: string;
    tokenType: string;
    expiresIn: string;
  };
}

/**
 * Authentication Service Class
 * @description Provides methods for user authentication and session management
 */
class AuthService {
  /**
   * Authenticates user with email and password
   * @param {LoginRequest} credentials - User login credentials
   * @returns {Promise<LoginResponse>} Login response with user data and tokens
   * @throws {Error} When login fails
   */
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const response = await api.post('/auth/login', credentials, {
      skipAuth: true, // Skip auth for login endpoint
    } as any);

    const loginResponse = response.data as LoginResponse;

    if (loginResponse.success && loginResponse.data) {
      const { user, accessToken, expiresIn } = loginResponse.data;

      // Convert user data to match UserData interface
      const userData: UserData = {
        id: user.id,
        username: user.name, // Using name as username
        email: user.email,
        role: user.role,
        parent_id: 0, // Will be updated from API response if available
        depot_id: null, // Will be updated from API response if available
        zone_id: null, // Will be updated from API response if available
      };

      // Parse expiresIn (e.g., "24h" -> seconds)
      const expiresInSeconds = this.parseExpiresIn(expiresIn);

      // Store token and user data
      tokenService.setToken(accessToken, userData, expiresInSeconds);
    }

    return loginResponse;
  }

  /**
   * Logs out the current user
   * @returns {Promise<void>}
   */
  async logout(): Promise<void> {
    try {
      // Call logout endpoint to invalidate token on server
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Server logout error:', error);
      // Continue with local logout even if server call fails
    } finally {
      // Always clear local auth data
      tokenService.clearAuth();
    }
  }

  /**
   * Parses expiresIn string to seconds
   * @private
   * @param {string} expiresIn - Expiration string (e.g., "24h", "1d", "3600s")
   * @returns {number} Expiration time in seconds
   */
  private parseExpiresIn(expiresIn: string): number {
    // Handle different formats: "24h", "1d", "3600s", "3600"
    const match = expiresIn.match(/^(\d+)([hdms]?)$/);

    if (!match) {
      // Default to 24 hours if parsing fails
      return 24 * 60 * 60;
    }

    const [, value, unit] = match;
    const numValue = parseInt(value, 10);

    switch (unit) {
      case 'h':
        return numValue * 60 * 60; // hours to seconds
      case 'd':
        return numValue * 24 * 60 * 60; // days to seconds
      case 'm':
        return numValue * 60; // minutes to seconds
      case 's':
      case '':
      default:
        return numValue; // already in seconds
    }
  }
}

/**
 * Singleton instance of AuthService
 * @description Export a single instance to ensure consistent auth management across the app
 */
export const authService = new AuthService();

/**
 * Default export for convenience
 */
export default authService;
