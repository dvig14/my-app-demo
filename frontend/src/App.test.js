import { render, screen } from '@testing-library/react';
import App from './App';

test('renders header text', () => {
  render(<App />);
  expect(screen.getByText(/FailOps Lab/i)).toBeInTheDocument();
});
