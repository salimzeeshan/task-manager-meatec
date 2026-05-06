import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { PageLoader } from './PageLoader';

describe('PageLoader', () => {
  it('renders the loading message and spinner', () => {
    render(<PageLoader />);

    expect(screen.getByText('Loading...')).toBeInTheDocument();
    expect(screen.getByRole('status')).toBeInTheDocument();
  });
});
