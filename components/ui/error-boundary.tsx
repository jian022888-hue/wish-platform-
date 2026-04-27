"use client";

import { Component, type ErrorInfo, type ReactNode } from "react";

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex min-h-[60vh] items-center justify-center px-4">
          <div className="max-w-md rounded-3xl bg-white p-8 text-center shadow-sm dark:bg-surface-dark">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-50 dark:bg-red-900/20">
              <svg
                className="h-8 w-8 text-red-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <h2 className="mt-4 font-serif text-2xl text-ink dark:text-ink-light">
              出现了一些问题
            </h2>
            <p className="mt-2 text-sm text-ink/60 dark:text-ink-light/55">
              抱歉，这个组件遇到了错误。请稍后再试，或刷新页面。
            </p>
            {process.env.NODE_ENV === "development" && this.state.error && (
              <div className="mt-4 rounded-xl bg-stone-100 p-4 text-left dark:bg-stone-800">
                <p className="text-xs font-mono text-red-600 dark:text-red-400">
                  {this.state.error.message}
                </p>
              </div>
            )}
            <div className="mt-6 flex items-center justify-center gap-3">
              <button
                onClick={this.handleReset}
                className="rounded-full border border-stone-200 px-5 py-2.5 text-sm text-ink/70 transition hover:border-clay/40 hover:text-ink dark:border-stone-700 dark:text-ink-light/70 dark:hover:text-ink-light"
              >
                重试
              </button>
              <button
                onClick={() => window.location.reload()}
                className="rounded-full bg-ink px-5 py-2.5 text-sm text-white transition hover:bg-ink/90 dark:bg-ink-light dark:text-background-dark dark:hover:bg-ink-light/90"
              >
                刷新页面
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
