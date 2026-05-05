import React from 'react';

interface ErrorBoundaryState {
  hasError: boolean;
}

export class ErrorBoundary extends React.Component<React.PropsWithChildren, ErrorBoundaryState> {
  constructor(props: React.PropsWithChildren) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    // Optionally log error
    // console.error(error, info);
  }

  handleReset = () => {
    this.setState({ hasError: false });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-background text-foreground">
          <div className="flex flex-col items-center gap-4">
            <svg width="48" height="48" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="text-destructive"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-3-3v6m9 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            <h1 className="text-2xl font-bold">Something went wrong</h1>
            <p className="text-muted-foreground">An unexpected error occurred. Please try again.</p>
            <button className="px-4 py-2 bg-primary text-white rounded" onClick={this.handleReset}>Try again</button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
