import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';

// Mock axios for API calls
jest.mock('axios', () => ({
  post: jest.fn(() => Promise.resolve({
    data: {
      response: 'Test response from chatbot',
      sources: ['Legal Knowledge Base', 'Test Source']
    }
  }))
}));

describe('App Component', () => {
  test('renders learn react link', () => {
    render(<App />);
    const linkElement = screen.getByText(/learn react/i);
    expect(linkElement).toBeInTheDocument();
  });

  test('basic app component renders', () => {
    render(<App />);
    // Just test that the component renders without crashing
    expect(document.body).toBeInTheDocument();
  });
});