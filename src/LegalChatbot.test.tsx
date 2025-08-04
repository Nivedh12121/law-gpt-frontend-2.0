import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import App from './App';

beforeAll(() => {
  // Mock scrollIntoView to avoid errors in tests
  window.HTMLElement.prototype.scrollIntoView = jest.fn();
});

describe('App Component', () => {
  test('renders input and send button', () => {
    render(<App />);
    const input = screen.getByPlaceholderText(/ask your legal question/i);
    const button = screen.getByRole('button', { name: /send/i });
    expect(input).toBeInTheDocument();
    expect(button).toBeInTheDocument();
  });

  test('displays loading state when sending a query', async () => {
    render(<App />);
    const input = screen.getByPlaceholderText(/ask your legal question/i);
    const button = screen.getByRole('button', { name: /send/i });

    fireEvent.change(input, { target: { value: 'What is contract law?' } });
    fireEvent.click(button);

    const loading = await screen.findByText(/loading/i);
    expect(loading).toBeInTheDocument();
  });

  test('displays error message on failed query', async () => {
    // Mock fetch or API call to simulate failure
    const fetchMock = jest.spyOn(global, 'fetch').mockRejectedValue(new Error('API is down'));

    render(<App />);
    const input = screen.getByPlaceholderText(/ask your legal question/i);
    const button = screen.getByRole('button', { name: /send/i });

    fireEvent.change(input, { target: { value: 'What is contract law?' } });
    fireEvent.click(button);

    const error = await screen.findByText(/error/i);
    expect(error).toBeInTheDocument();

    // Clean up mock
    fetchMock.mockRestore();
  });

  test('clears input after sending query', async () => {
    // Mock fetch to resolve successfully
    const fetchMock = jest.spyOn(global, 'fetch').mockResolvedValue({
      json: () => Promise.resolve({ answer: 'Contract law is...' }),
    } as Response);

    render(<App />);
    const input = screen.getByPlaceholderText(/ask your legal question/i) as HTMLInputElement;
    const button = screen.getByRole('button', { name: /send/i });

    fireEvent.change(input, { target: { value: 'What is contract law?' } });
    fireEvent.click(button);

    await waitFor(() => {
      expect(input.value).toBe('');
    });

    // Clean up mock
    fetchMock.mockRestore();
  });
});
