import { Component, ReactNode } from "react";

/**
 * ErrorBoundary
 * -------------
 * Class component that catches render errors in its subtree and
 * displays a styled fallback UI instead of a white screen.
 *
 * React hooks do NOT support error boundary lifecycle, so this
 * must remain a class component.
 *
 * Phase 1 — Foundation: wraps every route in App.tsx.
 */

interface ErrorBoundaryProps {
  children: ReactNode;
  /** Optional fallback UI to render on error */
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // In production, send to an error reporting service (e.g., Sentry)
    console.error("[ErrorBoundary] Caught error:", error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      // Allow custom fallback
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default styled fallback
      return (
        <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
          <div className="rounded-2xl glass-strong p-8 shadow-3d max-w-md w-full">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10 mx-auto">
              <span className="text-2xl">⚠️</span>
            </div>
            <h2 className="mt-4 text-lg font-bold text-foreground font-body">
              Something went wrong
            </h2>
            <p className="mt-2 text-sm text-muted-foreground font-body">
              An unexpected error occurred. Please try again or return to the homepage.
            </p>
            {this.state.error && (
              <details className="mt-4 text-left">
                <summary className="cursor-pointer text-xs text-muted-foreground font-body">
                  Error details
                </summary>
                <pre className="mt-2 overflow-auto rounded-xl bg-secondary p-3 text-xs text-muted-foreground">
                  {this.state.error.message}
                </pre>
              </details>
            )}
            <div className="mt-6 flex gap-3 justify-center">
              <button
                onClick={this.handleReset}
                className="rounded-xl border border-border px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-secondary font-body"
              >
                Try Again
              </button>
              <a
                href="/"
                className="rounded-xl gradient-navy px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 font-body"
              >
                Go Home
              </a>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
