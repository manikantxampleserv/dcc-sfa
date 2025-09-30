# Authentication Context

This authentication system provides a centralized way to manage user authentication state throughout the application using React Context and the existing user API hooks.

## Features

- 🔐 **Centralized Auth State** - Single source of truth for authentication
- 🔄 **Automatic Loading States** - Built-in loading indicators during auth verification
- 🚀 **React Query Integration** - Uses existing `useCurrentUser` hook for data fetching
- 🎯 **Type Safety** - Full TypeScript support with proper typing
- 🔧 **Easy Integration** - Simple hooks for different use cases

## Setup

The auth system is already integrated into the app via `App.tsx`:

```tsx
import AuthGuard from './components/AuthGuard';

const App = () => {
  return (
    <ContextProvider>
      <AuthGuard>
        <AppRouter />
        <ToastContainer />
      </AuthGuard>
    </ContextProvider>
  );
};
```

## Usage

### Basic Auth Hook

```tsx
import { useAuth } from 'contexts/AuthContext';

const MyComponent = () => {
  const { user, isLoading, isAuthenticated, error, logout } = useAuth();

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      <h1>Welcome, {user?.name}!</h1>
      <button onClick={logout}>Logout</button>
    </div>
  );
};
```

### Specialized Hooks

```tsx
import { useAuthUser, useIsAuthenticated } from 'contexts/AuthContext';

// Get just the user data
const user = useAuthUser();

// Check authentication status
const isAuthenticated = useIsAuthenticated();
```

### Protected Routes Example

```tsx
import { useIsAuthenticated } from 'contexts/AuthContext';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  const isAuthenticated = useIsAuthenticated();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
};
```

### Conditional Rendering

```tsx
import { useAuth } from 'contexts/AuthContext';

const Navigation = () => {
  const { user, isAuthenticated } = useAuth();

  return (
    <nav>
      {isAuthenticated ? (
        <div>
          <span>Welcome, {user?.name}</span>
          <UserMenu />
        </div>
      ) : (
        <LoginButton />
      )}
    </nav>
  );
};
```

## API Reference

### `useAuth()`

Returns the complete authentication context:

```tsx
interface AuthContextType {
  user: User | null;           // Current user data
  isLoading: boolean;          // Loading state
  isAuthenticated: boolean;    // Authentication status
  error: Error | null;         // Any authentication errors
  refetchUser: () => void;     // Refetch user data
  logout: () => void;          // Logout function
}
```

### `useAuthUser()`

Returns just the current user data:

```tsx
const user: User | null = useAuthUser();
```

### `useIsAuthenticated()`

Returns just the authentication status:

```tsx
const isAuthenticated: boolean = useIsAuthenticated();
```

## Components

### `AuthGuard`

Wraps the app and provides authentication context with loading states:

- Shows loading spinner while verifying authentication
- Handles error states
- Provides auth context to all child components

### `AuthLoader`

Loading component shown during authentication verification:

- Branded loading screen with DCC-SFA logo
- Customizable loading message
- Animated loading indicators

## Integration with Existing Code

The auth system integrates seamlessly with existing code:

- **Header Component**: Updated to use `useAuth()` instead of direct API calls
- **User Hooks**: Leverages existing `useCurrentUser` hook from `hooks/useUsers.ts`
- **React Query**: Maintains existing caching and query management
- **Type Safety**: Uses existing `User` type definitions

## Error Handling

The system handles various error scenarios:

- **Network Errors**: Shows loading state and retries
- **Authentication Failures**: Redirects to login
- **Token Expiration**: Automatic logout and redirect

## Customization

### Custom Loading Messages

```tsx
<AuthLoader message="Verifying your credentials..." />
```

### Custom Logout Behavior

The logout function in `AuthContext.tsx` can be customized:

```tsx
const logout = () => {
  // Clear tokens
  localStorage.removeItem('authToken');
  
  // Custom cleanup
  // ... your custom logic
  
  // Redirect
  window.location.href = '/login';
};
```

## Best Practices

1. **Use Specialized Hooks**: Use `useAuthUser()` or `useIsAuthenticated()` when you only need specific data
2. **Handle Loading States**: Always check `isLoading` before rendering user-dependent content
3. **Error Boundaries**: Wrap components with error boundaries for better error handling
4. **Avoid Direct API Calls**: Use the auth context instead of calling user APIs directly in components

## Examples

See `components/AuthExample/index.tsx` for a comprehensive example of all auth context features.
