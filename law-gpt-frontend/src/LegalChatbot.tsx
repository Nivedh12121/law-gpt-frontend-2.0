"use client";

import React, { useState, useReducer, useRef, useEffect } from 'react';
import { Send, Menu, Plus, AlertCircle, Bot, Scale, Sparkles, Zap, Shield, BookOpen, History, Star, Pin, Archive, Trash2, Search, Filter, MessageCircle, Clock, User, ChevronRight, X, Settings, Download, Share } from 'lucide-react';

// Subtle Floating Particles with Law Theme
const FloatingParticles = () => (
  <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
    {[...Array(20)].map((_, i) => (
      <div
        key={i}
        className={`absolute animate-float-gentle opacity-10 ${
          i % 4 === 0 ? 'text-blue-300' : 
          i % 4 === 1 ? 'text-indigo-300' : 
          i % 4 === 2 ? 'text-slate-400' : 'text-gray-400'
        }`}
        style={{
          left: `${Math.random() * 100}%`,
          top: `${Math.random() * 100}%`,
          animationDelay: `${Math.random() * 10}s`,
          animationDuration: `${20 + Math.random() * 10}s`
        }}
      >
        {i % 5 === 0 && <Scale size={12} />}
        {i % 5 === 1 && <BookOpen size={10} />}
        {i % 5 === 2 && <Shield size={8} />}
        {i % 5 === 3 && <Sparkles size={6} />}
        {i % 5 === 4 && <div className="w-1 h-1 bg-current rounded-full" />}
      </div>
    ))}
  </div>
);

// Subtle Legal Watermark
const LegalWatermark = () => (
  <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 opacity-5">
      <Scale size={300} className="text-slate-600" />
    </div>
  </div>
);

// Enhanced Message Bubble with Better Colors
const MessageBubble = ({ message, index }: { message: ChatMessage; index: number }) => (
  <div
    className={`mb-6 animate-fade-in-up group ${
      message.role === 'user' ? 'flex justify-end' : 'flex justify-start'
    }`}
    style={{ 
      animationDelay: `${index * 0.1}s`
    }}
  >
    <div
      className={`max-w-3xl px-6 py-4 rounded-2xl backdrop-blur-sm transition-all duration-300 hover:scale-[1.02] group relative ${
        message.role === 'user'
          ? 'bg-gradient-to-br from-blue-600 to-blue-700 text-white shadow-lg hover:shadow-blue-500/20'
          : 'bg-white/90 dark:bg-slate-800/90 text-slate-800 dark:text-slate-100 shadow-lg border border-slate-200 dark:border-slate-700 hover:shadow-xl'
      }`}
    >
      <div className="relative z-10">
        {message.role === 'assistant' && (
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-md">
              <Bot size={18} className="text-white" />
            </div>
            <div>
              <span className="font-semibold text-slate-700 dark:text-slate-200 text-lg">Law GPT</span>
              <div className="flex items-center space-x-2 mt-1">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="text-xs text-slate-500 dark:text-slate-400">AI Legal Assistant</span>
              </div>
            </div>
          </div>
        )}
        
        {message.isLoading ? (
          <div className="flex items-center space-x-3">
            <div className="flex space-x-2">
              {[...Array(3)].map((_, i) => (
                <div 
                  key={i}
                  className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"
                  style={{ animationDelay: `${i * 0.2}s` }}
                />
              ))}
            </div>
            <span className="text-slate-600 dark:text-slate-300">Analyzing legal query...</span>
          </div>
        ) : (
          <>
            <div className="prose prose-slate dark:prose-invert max-w-none">
              <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>
            </div>
            {message.sources && (
              <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-600">
                <div className="flex items-center space-x-2 text-sm text-slate-600 dark:text-slate-400">
                  <BookOpen size={14} />
                  <span className="font-medium">Legal Sources:</span>
                  <div className="flex flex-wrap gap-2">
                    {message.sources.map((source, idx) => (
                      <span key={idx} className="px-2 py-1 bg-slate-100 dark:bg-slate-700 rounded-lg text-xs border border-slate-200 dark:border-slate-600 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors">
                        {source}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  </div>
);

// Enhanced Chat History Sidebar with Better Colors
interface ChatHistorySidebarProps {
  isOpen: boolean;
  onClose: () => void;
  chatHistory: ChatHistory[];
  onLoadChat: (chat: ChatHistory) => void;
  onDeleteChat: (chatId: string) => void;
  onStarChat: (chatId: string) => void;
}

const ChatHistorySidebar = ({ isOpen, onClose, chatHistory, onLoadChat, onDeleteChat, onStarChat }: ChatHistorySidebarProps) => (
  <div className={`fixed inset-y-0 left-0 z-50 w-80 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-r border-slate-200 dark:border-slate-700 transform transition-all duration-300 ease-out ${
    isOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
  }`}>
    {/* Header */}
    <div className="p-6 border-b border-slate-200 dark:border-slate-700 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-800 dark:to-slate-800">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-md">
            <History size={20} className="text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-800 dark:text-white">Chat History</h2>
            <p className="text-slate-600 dark:text-slate-400 text-sm">{chatHistory.length} conversations</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors"
        >
          <X size={20} className="text-slate-600 dark:text-slate-400" />
        </button>
      </div>
      
      {/* Search Bar */}
      <div className="mt-4 relative">
        <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder="Search conversations..."
          className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-xl pl-10 pr-4 py-3 text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
        />
      </div>
    </div>

    {/* Chat List */}
    <div className="flex-1 overflow-y-auto p-4 space-y-3">
      {chatHistory.map((chat, index) => (
        <div
          key={chat.id}
          className="group bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 rounded-xl p-4 cursor-pointer transition-all duration-200 hover:shadow-md"
          onClick={() => onLoadChat(chat)}
        >
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2 mb-2">
                <div className={`w-3 h-3 rounded-full ${
                  chat.category === 'Contract Law' ? 'bg-blue-500' :
                  chat.category === 'Family Law' ? 'bg-purple-500' :
                  chat.category === 'Criminal Law' ? 'bg-red-500' :
                  chat.category === 'Corporate Law' ? 'bg-green-500' :
                  'bg-gray-500'
                }`} />
                <span className="text-xs text-slate-600 dark:text-slate-400 font-medium">{chat.category}</span>
                <span className="text-xs text-slate-500 dark:text-slate-500">{chat.duration}min</span>
              </div>
              
              <h3 className="text-slate-800 dark:text-white font-medium text-sm mb-1 truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                {chat.name}
              </h3>
              
              <p className="text-slate-600 dark:text-slate-400 text-xs mb-2 line-clamp-2">
                {chat.preview?.firstQuestion}
              </p>
              
              <div className="flex items-center space-x-4 text-xs text-slate-500 dark:text-slate-500">
                <div className="flex items-center space-x-1">
                  <MessageCircle size={12} />
                  <span>{chat.messageCount}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Clock size={12} />
                  <span>{new Date(chat.timestamp).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col space-y-1 ml-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onStarChat(chat.id);
                }}
                className="p-1 hover:bg-yellow-100 dark:hover:bg-yellow-900/20 rounded transition-colors"
              >
                <Star size={12} className={`${chat.isStarred ? 'text-yellow-500 fill-current' : 'text-slate-400'}`} />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteChat(chat.id);
                }}
                className="p-1 hover:bg-red-100 dark:hover:bg-red-900/20 rounded transition-colors"
              >
                <Trash2 size={12} className="text-red-500" />
              </button>
            </div>
          </div>
        </div>
      ))}
      
      {chatHistory.length === 0 && (
        <div className="text-center py-12">
          <History size={48} className="text-slate-400 mx-auto mb-4" />
          <p className="text-slate-600 dark:text-slate-400">No chat history yet</p>
          <p className="text-slate-500 dark:text-slate-500 text-sm">Start a conversation to see it here</p>
        </div>
      )}
    </div>
  </div>
);

// Status Indicator with Better Colors
const StatusIndicator = ({ status }: { status: 'connected' | 'disconnected' | 'connecting' }) => (
  <div className="flex items-center space-x-3 px-4 py-2 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
    <div className={`w-3 h-3 rounded-full ${
      status === 'connected' ? 'bg-green-500 animate-pulse' : 
      status === 'connecting' ? 'bg-yellow-500 animate-pulse' : 
      'bg-red-500'
    }`} />
    <span className="text-sm font-medium text-slate-700 dark:text-slate-300 capitalize">
      {status === 'connected' ? 'Online' : status === 'connecting' ? 'Connecting...' : 'Offline'}
    </span>
  </div>
);

// API Configuration
const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://resilient-rejoicing-production-e1e0.up.railway.app';

const getKanoonResponse = async (query: string) => {
  const response = await fetch(`${API_BASE_URL}/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query }),
  });

  if (!response.ok) {
    throw new Error('Failed to get response from server');
  }

  const data = await response.json();
  return data.response;
};

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  sources?: string[];
  isLoading?: boolean;
}

interface ChatHistory {
  id: string;
  name: string;
  messages: ChatMessage[];
  timestamp: string;
  category: string;
  duration: number;
  messageCount: number;
  isStarred: boolean;
  preview?: {
    firstQuestion: string;
    firstResponse: string;
  };
}

interface ChatState {
  messages: ChatMessage[];
  isLoading: boolean;
  error: string | null;
  apiStatus: 'connected' | 'disconnected' | 'connecting';
}

const initialState: ChatState = {
  messages: [
    {
      id: '1',
      role: 'assistant',
      content: '⚖️ Welcome to **Law GPT** - Your Advanced AI Legal Assistant!\n\nI\'m here to help you navigate the complex world of Indian law with:\n\n🔍 **Legal Research & Analysis**\n📚 **Case Law References** \n📋 **Document Review**\n⚖️ **Legal Procedure Guidance**\n🏛️ **Constitutional Matters**\n\nHow can I assist you with your legal inquiry today?',
      timestamp: new Date(),
      sources: ['Legal Knowledge Base', 'Indian Case Law Database', 'Legal Statutes']
    }
  ],
  isLoading: false,
  error: null,
  apiStatus: 'connected'
};

const chatReducer = (state: ChatState, action: any): ChatState => {
  switch (action.type) {
    case 'ADD_MESSAGE':
      return { ...state, messages: [...state.messages, action.payload] };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload, isLoading: false };
    case 'SET_API_STATUS':
      return { ...state, apiStatus: action.payload };
    case 'UPDATE_LAST_MESSAGE':
      return {
        ...state,
        messages: state.messages.map((msg, index) => 
          index === state.messages.length - 1 ? { ...msg, ...action.payload } : msg
        )
      };
    case 'CLEAR_MESSAGES':
      return { ...state, messages: [initialState.messages[0]] };
    case 'LOAD_MESSAGES':
      return { ...state, messages: action.payload };
    default:
      return state;
  }
};

// Generate mock chat history
const generateMockHistory = (): ChatHistory[] => [
  {
    id: '1',
    name: 'Contract Law: Employment Agreement Analysis',
    messages: [],
    timestamp: new Date(Date.now() - 86400000).toISOString(),
    category: 'Contract Law',
    duration: 15,
    messageCount: 8,
    isStarred: true,
    preview: {
      firstQuestion: 'I need help understanding my employment contract terms regarding termination clauses...',
      firstResponse: 'Based on your employment contract inquiry, here are the key legal considerations...'
    }
  },
  {
    id: '2', 
    name: 'Property Law: Land Acquisition Rights',
    messages: [],
    timestamp: new Date(Date.now() - 172800000).toISOString(),
    category: 'Property Law',
    duration: 23,
    messageCount: 12,
    isStarred: false,
    preview: {
      firstQuestion: 'What are my rights when the government wants to acquire my agricultural land?',
      firstResponse: 'Under the Land Acquisition Act, you have several important rights and protections...'
    }
  },
  {
    id: '3',
    name: 'Family Law: Divorce Proceedings',
    messages: [],
    timestamp: new Date(Date.now() - 259200000).toISOString(),
    category: 'Family Law', 
    duration: 31,
    messageCount: 18,
    isStarred: true,
    preview: {
      firstQuestion: 'I want to file for divorce. What is the legal process and required documentation?',
      firstResponse: 'Divorce proceedings in India involve several legal steps and requirements...'
    }
  }
];

const LegalChatbot: React.FC = () => {
  const [state, dispatch] = useReducer(chatReducer, initialState);
  const [inputValue, setInputValue] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [chatHistory, setChatHistory] = useState<ChatHistory[]>(generateMockHistory());
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [state.messages]);

  const sendMessage = async (content: string) => {
    if (!content.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: content.trim(),
      timestamp: new Date()
    };

    dispatch({ type: 'ADD_MESSAGE', payload: userMessage });
    dispatch({ type: 'SET_LOADING', payload: true });
    setInputValue('');

    const loadingMessage: ChatMessage = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: '',
      timestamp: new Date(),
      isLoading: true
    };

    dispatch({ type: 'ADD_MESSAGE', payload: loadingMessage });

    try {
      const responseText = await getKanoonResponse(content.trim());
      
      dispatch({ 
        type: 'UPDATE_LAST_MESSAGE', 
        payload: { 
          content: responseText,
          isLoading: false,
          sources: ['Indian Legal Database', 'Supreme Court Cases', 'Legal Statutes', 'Law Commission Reports']
        }
      });
    } catch (error) {
      console.error('API Error:', error);
      
      const fallbackResponse = `⚠️ **Connection Issue**\n\nI apologize, but I'm currently unable to access the legal database. However, regarding your question about "${content.substring(0, 50)}...":\n\n• **Always consult** with a qualified attorney for specific legal advice\n• **Legal matters** often depend on jurisdiction and specific circumstances  \n• **Documentation** and evidence are crucial in legal proceedings\n\nPlease try again when connection is restored, or consult with a legal professional for immediate assistance.`;
      
      dispatch({ 
        type: 'UPDATE_LAST_MESSAGE', 
        payload: { 
          content: fallbackResponse,
          isLoading: false,
          sources: ['Offline Mode - General Legal Principles']
        }
      });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(inputValue);
    }
  };

  const loadChat = (chat: ChatHistory) => {
    if (chat.messages && chat.messages.length > 0) {
      dispatch({ type: 'LOAD_MESSAGES', payload: chat.messages });
    }
    setSidebarOpen(false);
  };

  const deleteChat = (chatId: string) => {
    setChatHistory(prev => prev.filter(chat => chat.id !== chatId));
  };

  const starChat = (chatId: string) => {
    setChatHistory(prev => prev.map(chat => 
      chat.id === chatId ? { ...chat, isStarred: !chat.isStarred } : chat
    ));
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-950 dark:to-slate-900 relative overflow-hidden">
      {/* Subtle Background */}
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-100/50 via-slate-50 to-indigo-100/50 dark:from-blue-950/30 dark:via-slate-950 dark:to-indigo-950/30" />
      
      {/* Subtle Animated Background */}
      <div className="fixed inset-0 opacity-20 dark:opacity-10">
        <div className="absolute top-0 -left-4 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl animate-blob" />
        <div className="absolute top-0 -right-4 w-72 h-72 bg-indigo-300 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000" />
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-slate-300 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000" />
      </div>

      <FloatingParticles />
      <LegalWatermark />

      {/* Chat History Sidebar */}
      <ChatHistorySidebar 
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        chatHistory={chatHistory}
        onLoadChat={loadChat}
        onDeleteChat={deleteChat}
        onStarChat={starChat}
      />

      {/* Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className="flex-1 flex flex-col relative z-10">
        {/* Header */}
        <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl shadow-sm border-b border-slate-200 dark:border-slate-700 px-6 py-4 relative">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-3 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
              >
                <Menu size={20} className="text-slate-600 dark:text-slate-400" />
              </button>
              
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-md">
                  <Scale size={24} className="text-white" />
                </div>
                
                <div>
                  <h1 className="text-2xl font-bold text-slate-800 dark:text-white">
                    Law GPT
                  </h1>
                  <p className="text-slate-600 dark:text-slate-400 text-sm flex items-center space-x-2">
                    <Sparkles size={14} />
                    <span>Advanced AI Legal Research Assistant</span>
                    <Shield size={14} />
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <button className="flex items-center space-x-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors">
                <Download size={16} className="text-slate-600 dark:text-slate-400" />
                <span className="text-slate-700 dark:text-slate-300 text-sm hidden sm:inline">Export</span>
              </button>
              
              <button className="flex items-center space-x-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors">
                <Share size={16} className="text-slate-600 dark:text-slate-400" />
                <span className="text-slate-700 dark:text-slate-300 text-sm hidden sm:inline">Share</span>
              </button>
              
              <button
                onClick={() => {
                  if (state.messages.length > 1 && window.confirm('Start a new conversation? Current chat will be saved to history.')) {
                    dispatch({ type: 'CLEAR_MESSAGES' });
                  } else if (state.messages.length <= 1) {
                    dispatch({ type: 'CLEAR_MESSAGES' });
                  }
                }}
                className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-md hover:shadow-lg"
              >
                <Plus size={18} />
                <span className="hidden sm:inline">New Chat</span>
              </button>
              
              <StatusIndicator status={state.apiStatus} />
            </div>
          </div>
        </header>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto px-6 py-8 relative">
          <div className="max-w-4xl mx-auto relative">
            {state.messages.map((message, index) => (
              <MessageBubble key={message.id} message={message} index={index} />
            ))}
            
            {state.error && (
              <div className="flex justify-center mb-8">
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl px-6 py-4 flex items-center space-x-3 text-red-700 dark:text-red-400 shadow-sm">
                  <AlertCircle size={20} />
                  <span className="font-medium">{state.error}</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input Area */}
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-t border-slate-200 dark:border-slate-700 px-6 py-6 relative">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-end space-x-4">
              <div className="flex-1 relative">
                <textarea
                  ref={inputRef}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask your legal question here..."
                  className="w-full bg-white dark:bg-slate-800 text-slate-800 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 border border-slate-300 dark:border-slate-600 rounded-2xl px-6 py-4 pr-16 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all resize-none shadow-sm"
                  rows={1}
                  style={{ minHeight: '60px', maxHeight: '200px' }}
                />
                <button
                  onClick={() => sendMessage(inputValue)}
                  disabled={!inputValue.trim()}
                  className="absolute right-3 bottom-3 p-3 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-md hover:shadow-lg transform transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:hover:scale-100 disabled:cursor-not-allowed"
                >
                  <Send size={18} />
                </button>
              </div>
            </div>
            
            {/* Quick Actions */}
            <div className="mt-4 flex flex-wrap gap-2 justify-center">
              {[
                { icon: Scale, text: "Contract Review", color: "from-blue-500 to-blue-600" },
                { icon: Shield, text: "Legal Rights", color: "from-indigo-500 to-indigo-600" },
                { icon: BookOpen, text: "Case Law", color: "from-green-500 to-green-600" },
                { icon: User, text: "Family Law", color: "from-amber-500 to-amber-600" }
              ].map((action, index) => (
                <button
                  key={index}
                  onClick={() => setInputValue(`Help me with ${action.text.toLowerCase()}`)}
                  className={`flex items-center space-x-2 px-4 py-2 bg-gradient-to-r ${action.color} text-white rounded-xl hover:scale-105 transform transition-all duration-200 shadow-md hover:shadow-lg text-sm`}
                >
                  <action.icon size={14} />
                  <span>{action.text}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Custom Styles */}
      <style>{`
        @keyframes float-gentle {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-10px) rotate(5deg); }
        }
        
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-float-gentle { animation: float-gentle 6s ease-in-out infinite; }
        .animate-blob { animation: blob 7s ease-in-out infinite; }
        .animate-fade-in-up { animation: fade-in-up 0.5s ease-out forwards; }
        .animation-delay-2000 { animation-delay: 2s; }
        .animation-delay-4000 { animation-delay: 4s; }
        
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
};

export default LegalChatbot;