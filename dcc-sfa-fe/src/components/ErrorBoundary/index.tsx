import { Component, type ErrorInfo, type ReactNode } from 'react';
import Button from 'shared/Button';
import wrongIllustration from 'resources/wrong.png';

/** Cached image URL after successful preload */
let cachedImageUrl: string | null = null;

/** Flag indicating if image is currently loading */
let isImageLoading = false;

/** Promise for ongoing image load operation */
let imageLoadPromise: Promise<string> | null = null;

/**
 * Preloads the error illustration image and caches it for instant display
 * @returns Promise that resolves with the image URL when loaded
 * @throws Error if image fails to load
 */
const preloadErrorIllustration = (): Promise<string> => {
  if (cachedImageUrl) {
    return Promise.resolve(cachedImageUrl);
  }

  if (imageLoadPromise) {
    return imageLoadPromise;
  }

  isImageLoading = true;
  imageLoadPromise = new Promise((resolve, reject) => {
    const image = new Image();

    image.onload = () => {
      cachedImageUrl = wrongIllustration;
      isImageLoading = false;
      resolve(wrongIllustration);
    };

    image.onerror = () => {
      isImageLoading = false;
      imageLoadPromise = null;
      reject(new Error('Failed to load error illustration'));
    };

    image.src = wrongIllustration;
  });

  return imageLoadPromise;
};

preloadErrorIllustration().catch(console.error);

interface Props {
  children?: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  showFallback?: boolean;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  imageLoaded: boolean;
}

/**
 * Error Boundary Component
 * Catches JavaScript errors in its child component tree,
 * logs those errors, and displays a fallback UI
 */
class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      imageLoaded: !!cachedImageUrl,
    };
  }

  componentDidMount() {
    if (!cachedImageUrl && !isImageLoading) {
      preloadErrorIllustration()
        .then(() => {
          this.setState({ imageLoaded: true });
        })
        .catch(console.error);
    }
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error,
    };
  }

  /**
   * Catches errors in child components and logs them
   * @param error - The error that was thrown
   * @param errorInfo - Additional error information including component stack
   */
  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);

    if (import.meta.env.PROD) {
      this.logErrorToService(error, errorInfo);
    }

    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    this.setState({
      error,
      errorInfo,
    });
  }

  /**
   * Logs errors to external monitoring service
   * Replace with your preferred error tracking service (Sentry, LogRocket, etc.)
   * @param error - The error that was thrown
   * @param errorInfo - Additional error information including component stack
   */
  private logErrorToService = (error: Error, errorInfo: ErrorInfo) => {
    const errorData = {
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
    };

    console.error('Error logged:', errorData);
  };

  /**
   * Resets the error boundary state to clear the error
   */
  private handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  /**
   * Reloads the entire page
   */
  private handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError || this.props.showFallback) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen flex-col w-full bg-white px-4 py-10 flex items-center justify-center gap-3">
          <div className="flex items-center justify-center">
            {this.state.imageLoaded || cachedImageUrl ? (
              <img
                src={wrongIllustration}
                alt="Unexpected error"
                className="w-full max-w-sm"
                loading="eager"
                decoding="sync"
              />
            ) : (
              <div className="w-full max-w-sm h-64 bg-gray-100 animate-pulse rounded-lg" />
            )}
          </div>

          <div className="rounded-lg border flex flex-col justify-center items-center border-red-100 bg-red-50 px-6 py-4 text-left">
            <p className="text-sm font-semibold text-red-700">
              Something went wrong
            </p>
            <p className="mt-1 text-sm text-center text-red-600">
              An unexpected error occurred while rendering this page.
            </p>
          </div>

          <p className="mt-4 text-sm text-center text-gray-500">
            We apologize for the inconvenience. Please try refreshing the page
            or contact support if the problem persists.
          </p>

          {this.state.error && (
            <div className="mt-6 rounded-lg border border-gray-200 bg-gray-50 p-4 text-left">
              <p className="text-xs font-semibold text-gray-700">
                Error Details (Development Only):
              </p>
              <pre className="mt-2 max-h-60 overflow-auto text-xs text-red-600 whitespace-pre-wrap break-words">
                {this.state.error.toString()}
                {this.state.errorInfo?.componentStack && (
                  <>
                    {'\n\nComponent Stack:\n'}
                    {this.state.errorInfo.componentStack}
                  </>
                )}
              </pre>
            </div>
          )}

          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Button
              variant="contained"
              className="!min-w-[120px]"
              onClick={this.handleReset}
            >
              Try Again
            </Button>
            <Button
              variant="outlined"
              className="!min-w-[120px]"
              onClick={this.handleReload}
            >
              Reload
            </Button>
          </div>

          <p className="mt-4 text-xs text-gray-400">Error ID: {Date.now()}</p>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

/**
 * Higher-order component that wraps a component with an ErrorBoundary
 * @param Component - The component to wrap
 * @param errorBoundaryProps - Optional props to pass to the ErrorBoundary
 * @returns Wrapped component with error boundary protection
 */
export const withErrorBoundary = <P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<Props, 'children'>
) => {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </ErrorBoundary>
  );

  WrappedComponent.displayName = `withErrorBoundary(${
    Component.displayName || Component.name
  })`;

  return WrappedComponent;
};
