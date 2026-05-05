import { render, screen } from '@testing-library/react';
import { App } from './App';

describe('App', () => {
  it('renders the setup complete screen', () => {
    render(<App />);

    expect(
      screen.getByRole('heading', { name: 'Task Manager — Setup Complete' })
    ).toBeInTheDocument();
  });
});
