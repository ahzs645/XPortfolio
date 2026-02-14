import React from 'react';
import styled from 'styled-components';

/**
 * Generic React Error Boundary.
 * Wrap around major UI sections (individual app windows, WinXP desktop, etc.)
 * to prevent a single component crash from tearing down the entire app.
 *
 * Props:
 *   fallback  – optional custom fallback UI (ReactNode or render function)
 *   onError   – optional callback(error, errorInfo)
 *   name      – optional label shown in the default fallback
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error(`[ErrorBoundary${this.props.name ? `: ${this.props.name}` : ''}]`, error, errorInfo);
    this.props.onError?.(error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (typeof this.props.fallback === 'function') {
        return this.props.fallback({ error: this.state.error, retry: this.handleRetry });
      }
      if (this.props.fallback) {
        return this.props.fallback;
      }
      return <DefaultFallback name={this.props.name} onRetry={this.handleRetry} />;
    }
    return this.props.children;
  }
}

function DefaultFallback({ name, onRetry }) {
  return (
    <Container>
      <Icon>&#9888;</Icon>
      <Title>{name ? `${name} has encountered an error` : 'Something went wrong'}</Title>
      <Message>An unexpected error occurred. You can try again or close this window.</Message>
      <RetryButton onClick={onRetry}>Try Again</RetryButton>
    </Container>
  );
}

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  min-height: 120px;
  padding: 24px;
  background: #f5f3e8;
  font-family: Tahoma, 'Noto Sans', sans-serif;
  text-align: center;
`;

const Icon = styled.div`
  font-size: 36px;
  margin-bottom: 8px;
`;

const Title = styled.div`
  font-size: 13px;
  font-weight: bold;
  color: #333;
  margin-bottom: 6px;
`;

const Message = styled.div`
  font-size: 11px;
  color: #666;
  margin-bottom: 12px;
  max-width: 280px;
`;

const RetryButton = styled.button`
  padding: 4px 16px;
  font-size: 11px;
  font-family: Tahoma, sans-serif;
  cursor: pointer;
  background: #ece9d8;
  border: 1px solid #999;
  border-radius: 3px;

  &:hover {
    background: #e0dcc8;
  }

  &:active {
    background: #d6d2be;
  }
`;

export default ErrorBoundary;
