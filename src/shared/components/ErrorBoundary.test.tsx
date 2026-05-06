import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ErrorBoundary } from './ErrorBoundary';

const ProblemChild = ({ shouldThrow }: { shouldThrow: boolean }) => {
  if (shouldThrow) {
    throw new Error('Render failed');
  }

  return <div>Safe content</div>;
};

describe('ErrorBoundary', () => {
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  it('renders children when there is no error', () => {
    render(
      <ErrorBoundary>
        <ProblemChild shouldThrow={false} />
      </ErrorBoundary>
    );

    expect(screen.getByText('Safe content')).toBeInTheDocument();
  });

  it('renders fallback UI when a child throws', () => {
    render(
      <ErrorBoundary>
        <ProblemChild shouldThrow />
      </ErrorBoundary>
    );

    expect(screen.getByRole('heading', { name: 'Something went wrong' })).toBeInTheDocument();
    expect(screen.getByText('An unexpected error occurred. Please try again.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Try again' })).toBeInTheDocument();
  });

  it('resets the error state when try again is clicked', () => {
    const { rerender } = render(
      <ErrorBoundary>
        <ProblemChild shouldThrow />
      </ErrorBoundary>
    );

    rerender(
      <ErrorBoundary>
        <ProblemChild shouldThrow={false} />
      </ErrorBoundary>
    );
    fireEvent.click(screen.getByRole('button', { name: 'Try again' }));

    expect(screen.getByText('Safe content')).toBeInTheDocument();
  });
});
