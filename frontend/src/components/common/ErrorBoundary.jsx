import React from 'react';
import ErrorState from './ErrorState';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught a component crash:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    if (this.props.onReset) {
      this.props.onReset();
    } else {
      window.location.reload();
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="max-w-2xl mx-auto my-8 px-4">
          <ErrorState
            title={this.props.fallbackTitle || 'Section Display Error'}
            message={
              this.state.error?.message ||
              'A rendering error occurred while loading this section. Click below to reload.'
            }
            onRetry={this.handleReset}
            retryText="Reload View"
          />
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
