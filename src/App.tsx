import React, { useState, useEffect } from 'react';
import { Send, Bot, User, Loader2, Scale, FileText, Sparkles } from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const App: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: '🙏 Namaste! Welcome to Law GPT - your AI legal assistant for Indian law.\n\n📚 I can help you with:\n• Constitutional Law (Articles, Fundamental Rights)\n• Indian Penal Code (IPC Sections)\n• Criminal Procedure Code (CrPC)\n• Civil Procedure Code (CPC)\n• Contract Law, Property Law, Family Law\n• Legal procedures and case law\n\n💡 Try asking: "What is Section 302 IPC?" or "Explain Article 21 of Constitution"\n\nHow can I assist you today?',
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'checking' | 'connected' | 'disconnected'>('checking');

  // Check backend connection
  useEffect(() => {
    checkConnection();
  }, []);

  const checkConnection = async () => {
    try {
      const response = await fetch('https://law-gpt-backend20-production.up.railway.app/', {
        method: 'GET',
        mode: 'cors',
      });
      
      if (response.ok) {
        setConnectionStatus('connected');
      } else {
        setConnectionStatus('disconnected');
      }
    } catch (error) {
      setConnectionStatus('disconnected');
    }
  };

  const sendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const response = await fetch('https://law-gpt-backend20-production.up.railway.app/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        mode: 'cors',
        body: JSON.stringify({
          query: userMessage.content
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Parse JSON response
      const data = await response.json();
      const fullResponse = data.response || 'No response received';
      
      // Add assistant message
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: fullResponse,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, assistantMessage]);
      setIsLoading(false);
      
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage: Message = {
        id: (Date.now() + 2).toString(),
        role: 'assistant',
        content: `Sorry, I encountered an error: ${error}. Please try again.`,
        timestamp: new Date()
      };
      setMessages(prev => [...prev.slice(0, -1), errorMessage]);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {/* Law GPT Logo */}
              <div className="w-12 h-12 rounded-lg overflow-hidden shadow-lg border-2 border-blue-200 bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <Scale className="w-8 h-8 text-white" />
              </div>
              
              <div>
                <h1 className="text-xl font-bold text-gray-800 flex items-center space-x-2">
                  <span>Law GPT</span>
                  <Sparkles className="w-5 h-5 text-yellow-500" />
                </h1>
                <p className="text-sm text-gray-600">AI Legal Assistant for Indian Law</p>
              </div>
            </div>
            
            {/* Connection Status */}
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${
                connectionStatus === 'connected' ? 'bg-green-500' : 
                connectionStatus === 'disconnected' ? 'bg-red-500' : 'bg-yellow-500'
              }`}></div>
              <span className={`text-sm font-medium ${
                connectionStatus === 'connected' ? 'text-green-600' : 
                connectionStatus === 'disconnected' ? 'text-red-600' : 'text-yellow-600'
              }`}>
                {connectionStatus === 'connected' ? 'Connected' :
                 connectionStatus === 'disconnected' ? 'Disconnected' :
                 'Checking...'}
              </span>
              <button
                onClick={checkConnection}
                className="ml-2 px-3 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Retry
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Chat Area */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="bg-white rounded-lg shadow-lg h-[600px] flex flex-col">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`flex max-w-[80%] ${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                  {/* Avatar */}
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    message.role === 'user' 
                      ? 'bg-blue-500 ml-3' 
                      : 'bg-gray-600 mr-3'
                  }`}>
                    {message.role === 'user' ? (
                      <User size={16} className="text-white" />
                    ) : (
                      <Bot size={16} className="text-white" />
                    )}
                  </div>
                  
                  {/* Message */}
                  <div className={`px-4 py-3 rounded-lg ${
                    message.role === 'user'
                      ? 'bg-blue-500 text-white rounded-br-sm'
                      : 'bg-gray-100 text-gray-800 rounded-bl-sm'
                  }`}>
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    <p className="text-xs mt-2 opacity-70">
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex justify-start">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center">
                    <Bot size={16} className="text-white" />
                  </div>
                  <div className="bg-gray-100 rounded-lg px-4 py-3">
                    <div className="flex items-center space-x-2">
                      <Loader2 size={16} className="animate-spin text-blue-500" />
                      <span className="text-sm text-gray-600">AI is thinking...</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Quick Actions */}
          {messages.length === 1 && (
            <div className="border-t border-b p-4 bg-gray-50">
              <p className="text-sm text-gray-600 mb-3 font-medium">🚀 Quick Legal Queries:</p>
              <div className="flex flex-wrap gap-2">
                {[
                  "What is Section 302 IPC?",
                  "Explain Article 21",
                  "Rights under Article 14",
                  "Section 420 IPC punishment",
                  "Bail provisions in CrPC",
                  "Property rights in India"
                ].map((query, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setInputValue(query);
                      setTimeout(() => sendMessage(), 100);
                    }}
                    className="px-3 py-2 text-xs bg-blue-100 text-blue-700 rounded-full hover:bg-blue-200 transition-colors border border-blue-200"
                    disabled={isLoading || connectionStatus !== 'connected'}
                  >
                    {query}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input Area */}
          <div className="border-t p-4">
            <div className="flex space-x-3">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                placeholder="Ask about Indian law, IPC sections, constitutional articles..."
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={isLoading || connectionStatus !== 'connected'}
              />
              <button
                onClick={sendMessage}
                disabled={isLoading || !inputValue.trim() || connectionStatus !== 'connected'}
                className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center space-x-2 transition-colors"
              >
                <Send size={16} />
                <span>Send</span>
              </button>
            </div>
            
            {connectionStatus === 'disconnected' && (
              <p className="text-red-600 text-sm mt-2">
                ❌ Backend disconnected. Please check if the server is running on http://localhost:8001
              </p>
            )}
          </div>
        </div>
        
        {/* Legal Disclaimer Footer */}
        <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-start space-x-2">
            <FileText className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
            <div className="text-xs text-yellow-800">
              <p className="font-semibold mb-1">⚖️ Legal Disclaimer:</p>
              <p>This AI assistant provides general legal information for educational purposes only. It is not a substitute for professional legal advice. Always consult with a qualified lawyer for specific legal matters. The information provided may not reflect the most current legal developments.</p>
            </div>
          </div>
        </div>
        
        {/* Legal Disclaimer Footer */}
        <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-start space-x-2">
            <FileText className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
            <div className="text-xs text-yellow-800">
              <p className="font-semibold mb-1">⚖️ Legal Disclaimer:</p>
              <p>This AI assistant provides general legal information for educational purposes only. It is not a substitute for professional legal advice. Always consult with a qualified lawyer for specific legal matters. The information provided may not reflect the most current legal developments.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;