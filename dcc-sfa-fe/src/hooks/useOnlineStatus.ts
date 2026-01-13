import { useState, useEffect } from 'react';

/**
 * Represents the Network Information API connection object
 * @interface NavigatorConnection
 * @extends {EventTarget}
 */
interface NavigatorConnection extends EventTarget {
  /** The effective connection type (e.g., '4g', '3g', '2g', 'slow-2g') */
  effectiveType?: string;
  /** The connection type (e.g., 'wifi', 'cellular') */
  type?: string;
}

/**
 * Extended Navigator interface with connection properties
 * @interface NavigatorWithConnection
 * @extends {Navigator}
 */
interface NavigatorWithConnection extends Navigator {
  /** Standard connection property */
  connection?: NavigatorConnection;
  /** Mozilla-specific connection property */
  mozConnection?: NavigatorConnection;
  /** Webkit-specific connection property */
  webkitConnection?: NavigatorConnection;
}

/**
 * Custom hook to monitor online/offline status and connection type
 * 
 * This hook tracks the browser's online/offline status and provides information
 * about the current connection type using the Network Information API when available.
 * It automatically updates when the connection status changes.
 * 
 * @returns {{isOnline: boolean, connectionType: string}} Object containing:
 *   - isOnline: Boolean indicating if the browser is online
 *   - connectionType: String describing the connection type (e.g., '4g', 'wifi', '')
 * 
 * @example
 * const { isOnline, connectionType } = useOnlineStatus();
 * console.log(isOnline); // true or false
 * console.log(connectionType); // '4g', '3g', 'wifi', etc.
 */
const useOnlineStatus = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [connectionType, setConnectionType] = useState('');

  useEffect(() => {
    /**
     * Gets the connection object from navigator
     * Checks for standard, Mozilla, and Webkit-specific implementations
     * @returns {NavigatorConnection | undefined} The connection object if available
     */
    const getConnection = (): NavigatorConnection | undefined => {
      const nav = navigator as NavigatorWithConnection;
      return nav.connection || nav.mozConnection || nav.webkitConnection;
    };

    /**
     * Retrieves the current connection type
     * @returns {string} The effective type or type of connection, or empty string if unavailable
     */
    const getConnectionType = (): string => {
      const conn = getConnection();
      return conn?.effectiveType || conn?.type || '';
    };

    /**
     * Handles online event
     * Updates online status and refreshes connection type
     */
    const handleOnline = () => {
      setIsOnline(true);
      setConnectionType(getConnectionType());
    };

    /**
     * Handles offline event
     * Updates online status and clears connection type
     */
    const handleOffline = () => {
      setIsOnline(false);
      setConnectionType('');
    };

    /**
     * Handles connection change event
     * Updates the connection type when network conditions change
     */
    const handleConnectionChange = () => {
      setConnectionType(getConnectionType());
    };

    setConnectionType(getConnectionType());

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    const connection = getConnection();
    if (connection) {
      connection.addEventListener('change', handleConnectionChange);
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      if (connection) {
        connection.removeEventListener('change', handleConnectionChange);
      }
    };
  }, []);

  return { isOnline, connectionType };
};

export default useOnlineStatus;