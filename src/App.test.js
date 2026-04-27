import { render, screen } from '@testing-library/react';
import App from './App';

test('renders tournament setup', () => {
  render(<App />);
  expect(screen.getByText(/Padel Americano og Mexicano/i)).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /Start turnering/i })).toBeInTheDocument();
});
