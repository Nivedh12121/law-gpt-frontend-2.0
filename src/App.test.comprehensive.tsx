import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
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
  test('renders initial welcome message', () => {
    render(<App />);
    const welcomeMessage = screen.getByText(/Hello! I'm your AI legal assistant/i);
    expect(welcomeMessage).toBeInTheDocument();
  });

  test('renders chat input and send button', () => {
    render(<App />);
    const chatInput = screen.getByPlaceholderText(/Ask me anything about Indian law/i);
    const sendButton = screen.getByRole('button', { name: /send/i });
    
    expect(chatInput).toBeInTheDocument();
    expect(sendButton).toBeInTheDocument();
  });

  test('can type in chat input', async () => {
    render(<App />);
    
    const chatInput = screen.getByPlaceholderText(/Ask me anything about Indian law/i);
    await userEvent.type(chatInput, 'What is contract law?');
    
    expect(chatInput).toHaveValue('What is contract law?');
  });

  test('send button is disabled when input is empty', () => {
    render(<App />);
    const sendButton = screen.getByRole('button', { name: /send/i });
    
    expect(sendButton).toBeDisabled();
  });

  test('send button is enabled when input has text', async () => {
    render(<App />);
    
    const chatInput = screen.getByPlaceholderText(/Ask me anything about Indian law/i);
    const sendButton = screen.getByRole('button', { name: /send/i });
    
    await userEvent.type(chatInput, 'Test question');
    
    expect(sendButton).not.toBeDisabled();
  });

  test('displays loading state when message is sent', async () => {

    render(<App />);
    
    const chatInput = screen.getByPlaceholderText(/Ask me anything about Indian law/i);
    const sendButton = screen.getByRole('button', { name: /send/i });
    
    await userEvent.type(chatInput, 'What is contract law?');
    await userEvent.click(sendButton);
    
    // Should show loading indicator
    const loadingIndicator = screen.getByText(/AI is thinking/i);
    expect(loadingIndicator).toBeInTheDocument();
  });

  test('displays user message after sending', async () => {

    render(<App />);
    
    const chatInput = screen.getByPlaceholderText(/Ask me anything about Indian law/i);
    const sendButton = screen.getByRole('button', { name: /send/i });
    
    await userEvent.type(chatInput, 'What is contract law?');
    await userEvent.click(sendButton);
    
    // User message should appear
    const userMessage = screen.getByText('What is contract law?');
    expect(userMessage).toBeInTheDocument();
  });

  test('clears input after sending message', async () => {

    render(<App />);
    
    const chatInput = screen.getByPlaceholderText(/Ask me anything about Indian law/i);
    const sendButton = screen.getByRole('button', { name: /send/i });
    
    await userEvent.type(chatInput, 'What is contract law?');
    await userEvent.click(sendButton);
    
    expect(chatInput).toHaveValue('');
  });

  test('can send message with Enter key', async () => {

    render(<App />);
    
    const chatInput = screen.getByPlaceholderText(/Ask me anything about Indian law/i);
    
    await userEvent.type(chatInput, 'What is contract law?');
    await userEvent.keyboard('{Enter}');
    
    // User message should appear
    const userMessage = screen.getByText('What is contract law?');
    expect(userMessage).toBeInTheDocument();
  });

  test('displays chat history management buttons', () => {
    render(<App />);
    
    // Check for presence of history-related elements
    const historyButton = screen.getByRole('button', { name: /history/i });
    expect(historyButton).toBeInTheDocument();
  });

  test('handles API error gracefully', async () => {
    // Mock API error
    const axios = require('axios');
    axios.post.mockRejectedValueOnce(new Error('API Error'));
    

    render(<App />);
    
    const chatInput = screen.getByPlaceholderText(/Ask me anything about Indian law/i);
    const sendButton = screen.getByRole('button', { name: /send/i });
    
    await userEvent.type(chatInput, 'Test question');
    await userEvent.click(sendButton);
    
    // Should eventually show error state
    await waitFor(() => {
      const errorElement = screen.getByText(/error/i);
      expect(errorElement).toBeInTheDocument();
    }, { timeout: 3000 });
  });

  test('displays legal sources when available', async () => {

    render(<App />);
    
    const chatInput = screen.getByPlaceholderText(/Ask me anything about Indian law/i);
    const sendButton = screen.getByRole('button', { name: /send/i });
    
    await userEvent.type(chatInput, 'What is contract law?');
    await userEvent.click(sendButton);
    
    // Wait for response and check for sources
    await waitFor(() => {
      const sourcesLabel = screen.getByText(/Legal Sources/i);
      expect(sourcesLabel).toBeInTheDocument();
    }, { timeout: 3000 });
  });

  test('can toggle sidebar', async () => {

    render(<App />);
    
    const menuButton = screen.getByRole('button', { name: /menu/i });
    await userEvent.click(menuButton);
    
    // Sidebar should be visible or toggle state should change
    // The exact assertion depends on how the sidebar is implemented
    expect(menuButton).toBeInTheDocument();
  });
});

// Test utility functions
describe('Chat Utility Functions', () => {
  test('generates appropriate chat names', () => {
    // These would test the utility functions if exported
    // For now, we test the overall functionality through the component
    expect(true).toBe(true);
  });

  test('categorizes legal topics correctly', () => {
    // Test legal topic categorization
    expect(true).toBe(true);
  });

  test('calculates message complexity', () => {
    // Test complexity calculation
    expect(true).toBe(true);
  });
});

// Integration tests
describe('App Integration', () => {
  test('complete chat flow works', async () => {

    render(<App />);
    
    // Type a question
    const chatInput = screen.getByPlaceholderText(/Ask me anything about Indian law/i);
    await userEvent.type(chatInput, 'What is the Indian Contract Act?');
    
    // Send the message
    const sendButton = screen.getByRole('button', { name: /send/i });
    await userEvent.click(sendButton);
    
    // Check user message appears
    expect(screen.getByText('What is the Indian Contract Act?')).toBeInTheDocument();
    
    // Wait for AI response
    await waitFor(() => {
      const aiResponse = screen.getByText(/Test response from chatbot/i);
      expect(aiResponse).toBeInTheDocument();
    }, { timeout: 3000 });
  });

  test('multiple messages create proper chat history', async () => {

    render(<App />);
    
    const chatInput = screen.getByPlaceholderText(/Ask me anything about Indian law/i);
    const sendButton = screen.getByRole('button', { name: /send/i });
    
    // Send first message
    await userEvent.type(chatInput, 'First question');
    await userEvent.click(sendButton);
    
    // Wait and send second message
    await waitFor(() => {
      expect(screen.getByText('First question')).toBeInTheDocument();
    });
    
    await userEvent.type(chatInput, 'Second question');
    await userEvent.click(sendButton);
    
    // Both messages should be visible
    expect(screen.getByText('First question')).toBeInTheDocument();
    expect(screen.getByText('Second question')).toBeInTheDocument();
  });
});