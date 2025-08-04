import React, { useState, useReducer, useRef, useEffect } from 'react';
import { Send, Bot, User, FileText, AlertCircle, Loader2, Menu, Settings, History, Zap, Sparkles, ChevronDown, Plus, Search, Star, Download, Share, Copy, Edit3, Archive } from 'lucide-react';
import LegalWatermark from './components/LegalWatermark';
import scstLogo from './assets/scst_logo.jpg';

// Enhanced Types
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
  duration: number; // in minutes
  messageCount: number;
  isPinned: boolean;
  isStarred: boolean;
  isArchived: boolean;
  preview: {
    firstQuestion: string;
    firstResponse: string;
  };
  metadata: {
    complexity: 'simple' | 'medium' | 'complex';
    satisfaction?: number; // 1-5 rating
    tags: string[];
  };
}

interface ChatState {
  messages: ChatMessage[];
  isLoading: boolean;
  error: string | null;
  apiStatus: 'connected' | 'disconnected' | 'connecting';
  currentChatId: string | null;
  chatStartTime: Date | null;
}

// Initial state
const initialState: ChatState = {
  messages: [
    {
      id: '1',
      role: 'assistant',
      content: 'Hello! I\'m your AI legal assistant. I can help you with legal questions, document analysis, and provide citations from relevant legal sources. How can I assist you today?',
      timestamp: new Date(),
      sources: ['Legal Knowledge Base', 'Case Law Database']
    }
  ],
  isLoading: false,
  error: null,
  apiStatus: 'connecting',
  currentChatId: null,
  chatStartTime: new Date()
};

// Utility Functions for Chat Management
const generateChatName = (firstUserMessage: string): string => {
  const keywords = {
    'contract': 'Contract Law',
    'property': 'Property Law',
    'marriage': 'Family Law',
    'divorce': 'Family Law',
    'criminal': 'Criminal Law',
    'labor': 'Labor Law',
    'employment': 'Labor Law',
    'consumer': 'Consumer Law',
    'tax': 'Tax Law',
    'company': 'Corporate Law',
    'business': 'Corporate Law',
    'intellectual': 'IP Law',
    'patent': 'IP Law',
    'copyright': 'IP Law',
    'constitutional': 'Constitutional Law',
    'civil': 'Civil Law',
    'tort': 'Tort Law',
    'evidence': 'Evidence Law',
    'procedure': 'Procedural Law'
  };

  const message = firstUserMessage.toLowerCase();
  let category = 'General Legal';
  
  for (const [keyword, cat] of Object.entries(keywords)) {
    if (message.includes(keyword)) {
      category = cat;
      break;
    }
  }

  const preview = firstUserMessage.length > 30 
    ? firstUserMessage.substring(0, 30) + '...' 
    : firstUserMessage;
  
  const date = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  return `${category}: ${preview} - ${date}`;
};

const categorizeLegalTopic = (content: string): string => {
  const categories = {
    'Contract Law': ['contract', 'agreement', 'breach', 'consideration', 'offer', 'acceptance'],
    'Property Law': ['property', 'real estate', 'land', 'ownership', 'title', 'deed'],
    'Family Law': ['marriage', 'divorce', 'custody', 'alimony', 'adoption', 'domestic'],
    'Criminal Law': ['criminal', 'crime', 'theft', 'murder', 'assault', 'bail'],
    'Labor Law': ['employment', 'labor', 'worker', 'salary', 'termination', 'workplace'],
    'Consumer Law': ['consumer', 'product', 'warranty', 'refund', 'complaint', 'service'],
    'Corporate Law': ['company', 'business', 'corporate', 'shares', 'director', 'partnership'],
    'Constitutional Law': ['constitutional', 'fundamental rights', 'article', 'amendment', 'supreme court'],
    'Tax Law': ['tax', 'income tax', 'gst', 'return', 'assessment', 'penalty'],
    'IP Law': ['intellectual property', 'patent', 'copyright', 'trademark', 'design']
  };

  const lowerContent = content.toLowerCase();
  
  for (const [category, keywords] of Object.entries(categories)) {
    if (keywords.some(keyword => lowerContent.includes(keyword))) {
      return category;
    }
  }
  
  return 'General Legal';
};

const calculateComplexity = (messages: ChatMessage[]): 'simple' | 'medium' | 'complex' => {
  const totalLength = messages.reduce((sum, msg) => sum + msg.content.length, 0);
  const avgLength = totalLength / messages.length;
  
  if (avgLength < 100) return 'simple';
  if (avgLength < 300) return 'medium';
  return 'complex';
};

// Reducer
const chatReducer = (state: ChatState, action: any): ChatState => {
  switch (action.type) {
    case 'ADD_MESSAGE':
      return {
        ...state,
        messages: [...state.messages, action.payload]
      };
    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload
      };
    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
        isLoading: false
      };
    case 'SET_API_STATUS':
      return {
        ...state,
        apiStatus: action.payload
      };
    case 'UPDATE_LAST_MESSAGE':
      return {
        ...state,
        messages: state.messages.map((msg, index) => 
          index === state.messages.length - 1 
            ? { ...msg, ...action.payload }
            : msg
        )
      };
    case 'CLEAR_MESSAGES':
      return {
        ...state,
        messages: [
          {
            id: '1',
            role: 'assistant',
            content: 'Hello! I\'m your AI legal assistant. I can help you with legal questions, document analysis, and provide citations from relevant legal sources. How can I assist you today?',
            timestamp: new Date(),
            sources: ['Legal Knowledge Base', 'Case Law Database']
          }
        ],
        currentChatId: null,
        chatStartTime: new Date()
      };
    case 'LOAD_MESSAGES':
      return {
        ...state,
        messages: action.payload
      };
    case 'SET_CHAT_START_TIME':
      return {
        ...state,
        chatStartTime: action.payload
      };
    default:
      return state;
  }
};

// 3D Floating Particles Background
const FloatingParticles: React.FC = () => {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {[...Array(20)].map((_, i) => (
        <div
          key={i}
          className="absolute w-2 h-2 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full opacity-20 animate-float-3d"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 10}s`,
            animationDuration: `${8 + Math.random() * 4}s`
          }}
        />
      ))}
    </div>
  );
};

// Enhanced Message Bubble with 3D effects
const MessageBubble: React.FC<{ message: ChatMessage; index: number }> = ({ message, index }) => {
  const isUser = message.role === 'user';
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <div 
      className={`flex mb-8 ${isUser ? 'justify-end' : 'justify-start'} message-enter`}
      style={{ animationDelay: `${index * 0.1}s` }}
    >
      <div className={`flex max-w-[85%] ${isUser ? 'flex-row-reverse' : 'flex-row'} group`}>
        {/* Enhanced Avatar with 3D effect */}
        <div 
          className={`relative flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center shadow-lg transform transition-all duration-500 hover:scale-110 hover:rotate-3 ${
            isUser ? 'bg-gradient-to-br from-blue-500 to-blue-700 ml-4' : 'bg-gradient-to-br from-gray-600 to-gray-800 mr-4'
          }`}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {isUser ? (
            <User size={20} className={`text-white transition-all duration-300 ${isHovered ? 'scale-110' : ''}`} />
          ) : (
            <Bot size={20} className={`text-white transition-all duration-300 ${isHovered ? 'scale-110 rotate-12' : ''}`} />
          )}
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white/20 to-transparent"></div>
        </div>
        
        {/* Enhanced Message Content with 3D depth */}
        <div 
          className={`relative transform transition-all duration-500 hover:scale-105 hover:-translate-y-2 ${
            isUser 
              ? 'bg-gradient-to-br from-blue-500 to-blue-700 text-white rounded-3xl rounded-br-lg shadow-xl' 
              : 'bg-gradient-to-br from-white to-gray-50 text-gray-800 rounded-3xl rounded-bl-lg shadow-xl border border-gray-200/50'
          }`}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {/* Glassmorphism overlay */}
          <div className={`absolute inset-0 rounded-3xl ${isUser ? 'rounded-br-lg' : 'rounded-bl-lg'} bg-gradient-to-br from-white/10 to-transparent backdrop-blur-sm`}></div>
          
          <div className="relative px-6 py-4">
            {message.isLoading ? (
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <Loader2 size={20} className="animate-spin text-blue-500" />
                  <div className="absolute inset-0 animate-ping">
                    <Loader2 size={20} className="text-blue-300 opacity-50" />
                  </div>
                </div>
                <span className="text-sm font-medium animate-pulse">AI is thinking...</span>
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-current rounded-full animate-bounce opacity-60"></div>
                  <div className="w-2 h-2 bg-current rounded-full animate-bounce opacity-60" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-current rounded-full animate-bounce opacity-60" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            ) : (
              <>
                <p className="text-sm leading-relaxed whitespace-pre-wrap font-medium">{message.content}</p>
                
                {/* Enhanced Sources with hover effects */}
                {message.sources && message.sources.length > 0 && (
                  <div className="mt-4 pt-3 border-t border-current/20">
                    <div className="flex items-center space-x-2 mb-2">
                      <FileText size={14} className="opacity-70" />
                      <span className="text-xs font-semibold opacity-70 tracking-wider uppercase">Legal Sources</span>
                      <Sparkles size={12} className="opacity-50 animate-pulse" />
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {message.sources.map((source, index) => (
                        <span 
                          key={index}
                          className={`text-xs px-3 py-1.5 rounded-full font-medium transition-all duration-300 hover:scale-105 hover:shadow-lg cursor-pointer transform ${
                            isUser 
                              ? 'bg-blue-400/30 text-blue-100 hover:bg-blue-400/50 backdrop-blur-sm' 
                              : 'bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700 hover:from-blue-200 hover:to-purple-200 shadow-sm'
                          }`}
                          style={{ animationDelay: `${index * 0.1}s` }}
                        >
                          {source}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
            
            {/* Enhanced timestamp with glow effect */}
            <div className={`text-xs mt-3 opacity-70 font-medium ${isUser ? 'text-right' : 'text-left'}`}>
              {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
          </div>
          
          {/* Message tail with 3D effect */}
          <div className={`absolute top-4 w-4 h-4 transform rotate-45 ${
            isUser 
              ? '-right-1 bg-gradient-to-br from-blue-500 to-blue-700' 
              : '-left-1 bg-gradient-to-br from-white to-gray-50 border-l border-t border-gray-200/50'
          }`}></div>
        </div>
      </div>
    </div>
  );
};

// Enhanced Typing Indicator with 3D effects
const TypingIndicator: React.FC = () => (
  <div className="flex justify-start mb-8">
    <div className="flex items-center space-x-4">
      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-gray-600 to-gray-800 flex items-center justify-center shadow-lg animate-pulse">
        <Bot size={20} className="text-white" />
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white/20 to-transparent"></div>
      </div>
      <div className="bg-gradient-to-br from-white to-gray-50 rounded-3xl rounded-bl-lg px-6 py-4 shadow-xl border border-gray-200/50">
        <div className="absolute inset-0 rounded-3xl rounded-bl-lg bg-gradient-to-br from-white/10 to-transparent backdrop-blur-sm"></div>
        <div className="relative flex space-x-2">
          <div className="w-3 h-3 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full animate-bounce shadow-lg"></div>
          <div className="w-3 h-3 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full animate-bounce shadow-lg" style={{ animationDelay: '0.2s' }}></div>
          <div className="w-3 h-3 bg-gradient-to-br from-pink-400 to-red-500 rounded-full animate-bounce shadow-lg" style={{ animationDelay: '0.4s' }}></div>
        </div>
      </div>
    </div>
  </div>
);

// Enhanced Status Indicator with pulse effect
const StatusIndicator: React.FC<{ status: 'connected' | 'disconnected' | 'connecting' }> = ({ status }) => {
  const statusConfig = {
    connected: { color: 'bg-gradient-to-r from-green-400 to-green-600', text: 'Connected', icon: Zap, pulse: 'animate-pulse' },
    disconnected: { color: 'bg-gradient-to-r from-red-400 to-red-600', text: 'Disconnected', icon: AlertCircle, pulse: '' },
    connecting: { color: 'bg-gradient-to-r from-yellow-400 to-orange-500', text: 'Connecting', icon: Loader2, pulse: 'animate-pulse' }
  };
  
  const config = statusConfig[status];
  const Icon = config.icon;
  
  return (
    <div className="flex items-center space-x-3 text-sm text-gray-600 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg border border-gray-200/50 hover:shadow-xl transition-all duration-300">
      <div className={`w-3 h-3 rounded-full ${config.color} ${config.pulse} shadow-lg`}></div>
      <Icon size={16} className={status === 'connecting' ? 'animate-spin' : 'animate-pulse'} />
      <span className="font-medium">{config.text}</span>
    </div>
  );
};

// Enhanced Sidebar with 3D navigation
const Sidebar: React.FC<{ 
  isOpen: boolean; 
  onClose: () => void; 
  messages: ChatMessage[];
  onClearHistory: () => void;
  onLoadHistory: (messages: ChatMessage[]) => void;
}> = ({ isOpen, onClose, messages, onClearHistory, onLoadHistory }) => {
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [showHistoryOptions, setShowHistoryOptions] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showArchived, setShowArchived] = useState(false);

  const navItems = [
    { id: 'history', icon: History, label: 'Chat History', color: 'from-blue-500 to-blue-600' },
    { id: 'documents', icon: FileText, label: 'Legal Documents', color: 'from-purple-500 to-purple-600' },
    { id: 'settings', icon: Settings, label: 'Settings', color: 'from-green-500 to-green-600' }
  ];

  // Enhanced Chat History Management
  const saveHistoryToStorage = () => {
    if (messages.length <= 1) {
      alert('No conversation to save!');
      return;
    }

    const firstUserMessage = messages.find(msg => msg.role === 'user');
    const firstAssistantMessage = messages.find(msg => msg.role === 'assistant' && msg.id !== '1');
    
    if (!firstUserMessage) {
      alert('No user messages to save!');
      return;
    }

    const chatName = generateChatName(firstUserMessage.content);
    const category = categorizeLegalTopic(firstUserMessage.content);
    const complexity = calculateComplexity(messages);
    
    const historyData: ChatHistory = {
      id: Date.now().toString(),
      name: chatName,
      messages: messages,
      timestamp: new Date().toISOString(),
      category: category,
      duration: Math.round((new Date().getTime() - new Date(messages[0].timestamp).getTime()) / (1000 * 60)),
      messageCount: messages.length,
      isPinned: false,
      isStarred: false,
      isArchived: false,
      preview: {
        firstQuestion: firstUserMessage.content.substring(0, 100) + (firstUserMessage.content.length > 100 ? '...' : ''),
        firstResponse: firstAssistantMessage ? firstAssistantMessage.content.substring(0, 150) + (firstAssistantMessage.content.length > 150 ? '...' : '') : 'No response yet'
      },
      metadata: {
        complexity: complexity,
        tags: [category.toLowerCase().replace(' ', '-')]
      }
    };
    
    const existingHistory = JSON.parse(localStorage.getItem('scst-chat-history') || '[]');
    existingHistory.unshift(historyData);
    
    // Keep only last 50 conversations (increased from 10)
    const limitedHistory = existingHistory.slice(0, 50);
    localStorage.setItem('scst-chat-history', JSON.stringify(limitedHistory));
    
    alert(`Chat saved as: "${chatName}"`);
  };

  // Load chat history from localStorage with enhanced filtering
  const loadHistoryFromStorage = (): ChatHistory[] => {
    const existingHistory = JSON.parse(localStorage.getItem('scst-chat-history') || '[]');
    return existingHistory.filter((chat: ChatHistory) => !chat.isArchived);
  };

  // Get archived chats
  const getArchivedChats = (): ChatHistory[] => {
    const existingHistory = JSON.parse(localStorage.getItem('scst-chat-history') || '[]');
    return existingHistory.filter((chat: ChatHistory) => chat.isArchived);
  };

  // Toggle pin status
  const togglePinChat = (chatId: string) => {
    const existingHistory = JSON.parse(localStorage.getItem('scst-chat-history') || '[]');
    const updatedHistory = existingHistory.map((chat: ChatHistory) =>
      chat.id === chatId ? { ...chat, isPinned: !chat.isPinned } : chat
    );
    localStorage.setItem('scst-chat-history', JSON.stringify(updatedHistory));
  };

  // Toggle star status
  const toggleStarChat = (chatId: string) => {
    const existingHistory = JSON.parse(localStorage.getItem('scst-chat-history') || '[]');
    const updatedHistory = existingHistory.map((chat: ChatHistory) =>
      chat.id === chatId ? { ...chat, isStarred: !chat.isStarred } : chat
    );
    localStorage.setItem('scst-chat-history', JSON.stringify(updatedHistory));
  };

  // Rename chat
  const renameChat = (chatId: string, newName: string) => {
    const existingHistory = JSON.parse(localStorage.getItem('scst-chat-history') || '[]');
    const updatedHistory = existingHistory.map((chat: ChatHistory) =>
      chat.id === chatId ? { ...chat, name: newName } : chat
    );
    localStorage.setItem('scst-chat-history', JSON.stringify(updatedHistory));
  };

  // Export chat as text
  const exportChatAsText = (chat: ChatHistory) => {
    const content = chat.messages.map(msg => 
      `${msg.role.toUpperCase()}: ${msg.content}\n${msg.sources ? 'Sources: ' + msg.sources.join(', ') + '\n' : ''}\n`
    ).join('\n');
    
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${chat.name.replace(/[^a-z0-9]/gi, '_')}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };



  // Duplicate/Fork conversation
  const duplicateChat = (chat: ChatHistory) => {
    const duplicatedChat: ChatHistory = {
      ...chat,
      id: Date.now().toString(),
      name: `${chat.name} (Copy)`,
      timestamp: new Date().toISOString(),
      metadata: {
        ...chat.metadata,
        tags: [...chat.metadata.tags, 'duplicated']
      }
    };
    
    const existingHistory = JSON.parse(localStorage.getItem('scst-chat-history') || '[]');
    existingHistory.unshift(duplicatedChat);
    localStorage.setItem('scst-chat-history', JSON.stringify(existingHistory));
    
    alert(`Chat duplicated as: "${duplicatedChat.name}"`);
  };

  // Share chat via link (creates a shareable text format)
  const shareChatAsLink = (chat: ChatHistory) => {
    const shareText = `📋 *${chat.name}*\n\n${chat.messages.map(msg => 
      `*${msg.role.toUpperCase()}:* ${msg.content}${msg.sources ? '\n_Sources: ' + msg.sources.join(', ') + '_' : ''}`
    ).join('\n\n')}\n\n---\nShared from SCST-GPT - AI Legal Assistant`;
    
    if (navigator.share) {
      navigator.share({
        title: chat.name,
        text: shareText,
      }).catch(console.error);
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(shareText).then(() => {
        alert('Chat copied to clipboard! You can now paste it anywhere to share.');
      }).catch(() => {
        // Final fallback: show in alert
        alert('Share Text:\n\n' + shareText.substring(0, 500) + '...');
      });
    }
  };

  // Export chat as PDF (simplified version using print)
  const exportChatAsPDF = (chat: ChatHistory) => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      const content = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>${chat.name}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; line-height: 1.6; }
            .header { border-bottom: 2px solid #333; padding-bottom: 10px; margin-bottom: 20px; }
            .message { margin-bottom: 20px; padding: 10px; border-left: 3px solid #007bff; }
            .user { border-left-color: #28a745; background: #f8f9fa; }
            .assistant { border-left-color: #007bff; background: #e3f2fd; }
            .sources { font-size: 0.9em; color: #666; margin-top: 5px; }
            .metadata { background: #f8f9fa; padding: 10px; border-radius: 5px; margin-top: 20px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>${chat.name}</h1>
            <p><strong>Category:</strong> ${chat.category} | <strong>Date:</strong> ${new Date(chat.timestamp).toLocaleDateString()} | <strong>Duration:</strong> ${chat.duration} minutes</p>
          </div>
          ${chat.messages.map(msg => `
            <div class="message ${msg.role}">
              <strong>${msg.role.toUpperCase()}:</strong><br>
              ${msg.content.replace(/\n/g, '<br>')}
              ${msg.sources ? `<div class="sources"><strong>Sources:</strong> ${msg.sources.join(', ')}</div>` : ''}
            </div>
          `).join('')}
          <div class="metadata">
            <h3>Chat Metadata</h3>
            <p><strong>Complexity:</strong> ${chat.metadata.complexity}</p>
            <p><strong>Tags:</strong> ${chat.metadata.tags.join(', ')}</p>
            <p><strong>Message Count:</strong> ${chat.messageCount}</p>
          </div>
        </body>
        </html>
      `;
      
      printWindow.document.write(content);
      printWindow.document.close();
      printWindow.print();
    }
  };

  // Rate chat satisfaction
  const rateChatSatisfaction = (chatId: string, rating: number) => {
    const existingHistory = JSON.parse(localStorage.getItem('scst-chat-history') || '[]');
    const updatedHistory = existingHistory.map((chat: ChatHistory) =>
      chat.id === chatId ? {
        ...chat,
        metadata: {
          ...chat.metadata,
          satisfaction: rating
        }
      } : chat
    );
    localStorage.setItem('scst-chat-history', JSON.stringify(updatedHistory));
    alert(`Rated ${rating}/5 stars!`);
  };

  const handleHistoryClick = () => {
    setShowHistoryOptions(!showHistoryOptions);
  };

  return (
    <>
      {/* Enhanced backdrop with blur */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 lg:hidden transition-all duration-300"
          onClick={onClose}
        />
      )}
      
      {/* Enhanced Sidebar */}
      <div className={`${isOpen ? 'translate-x-0' : '-translate-x-full'} fixed lg:relative lg:translate-x-0 w-80 h-full transition-all duration-500 ease-out z-50`}>
        <div className="h-full bg-gradient-to-br from-white via-gray-50 to-gray-100 shadow-2xl backdrop-blur-xl border-r border-gray-200/50">
          {/* Header with glassmorphism */}
          <div className="p-6 border-b border-gray-200/50 bg-gradient-to-r from-blue-600 to-purple-600 text-white relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
            <div className="relative">
              <h2 className="text-2xl font-bold tracking-tight">SCST-GPT</h2>
              <p className="text-blue-100 mt-1 text-sm font-medium">AI Legal Research Assistant</p>
            </div>
            {/* Animated background elements */}
            <div className="absolute -top-4 -right-4 w-24 h-24 bg-white/10 rounded-full animate-pulse"></div>
            <div className="absolute -bottom-2 -left-2 w-16 h-16 bg-purple-400/20 rounded-full animate-bounce"></div>
          </div>
          
          {/* Status section */}
          <div className="p-6">
            <StatusIndicator status="connected" />
          </div>

          {/* Enhanced Navigation */}
          <nav className="px-4 space-y-2">
            {navItems.map((item, index) => {
              const Icon = item.icon;
              const isHovered = hoveredItem === item.id;
              
              return (
                <div key={item.id}>
                  <button
                    className="w-full group relative overflow-hidden"
                    onMouseEnter={() => setHoveredItem(item.id)}
                    onMouseLeave={() => setHoveredItem(null)}
                    onClick={() => item.id === 'history' ? handleHistoryClick() : undefined}
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <div className={`flex items-center space-x-4 px-4 py-4 text-left rounded-xl transition-all duration-300 transform ${
                      isHovered 
                        ? 'scale-105 shadow-lg -translate-y-1' 
                        : 'hover:bg-gray-100/50'
                    }`}>
                      <div className={`p-2 rounded-lg bg-gradient-to-r ${item.color} shadow-lg transform transition-all duration-300 ${
                        isHovered ? 'scale-110 rotate-3' : ''
                      }`}>
                        <Icon size={18} className="text-white" />
                      </div>
                      <span className={`text-gray-700 font-medium transition-all duration-300 ${
                        isHovered ? 'text-gray-900 translate-x-2' : ''
                      }`}>
                        {item.label}
                      </span>
                      <ChevronDown size={16} className={`text-gray-400 ml-auto transition-all duration-300 ${
                        (isHovered || (item.id === 'history' && showHistoryOptions)) ? 'rotate-90 text-gray-600' : ''
                      }`} />
                    </div>
                    
                    {/* Hover background effect */}
                    <div className={`absolute inset-0 bg-gradient-to-r ${item.color} opacity-0 transition-all duration-300 rounded-xl ${
                      isHovered ? 'opacity-5' : ''
                    }`}></div>
                  </button>
                  
                  {/* History Options Dropdown */}
                  {item.id === 'history' && showHistoryOptions && (
                    <div className="ml-4 mt-2 space-y-2 animate-in slide-in-from-top-2 duration-300">
                      <button
                        onClick={saveHistoryToStorage}
                        className="w-full text-left px-4 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all duration-200"
                      >
                        💾 Save Current Chat
                      </button>
                      <button
                        onClick={() => {
                          const history = loadHistoryFromStorage();
                          if (history.length > 0) {
                            const latestChat = history[0];
                            onLoadHistory(latestChat.messages);
                            alert('Latest chat history loaded!');
                          } else {
                            alert('No saved chat history found.');
                          }
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all duration-200"
                      >
                        📂 Load Latest Chat
                      </button>
                      <button
                        onClick={() => {
                          // eslint-disable-next-line no-restricted-globals
                          if (confirm('Are you sure you want to clear the current chat?')) {
                            onClearHistory();
                          }
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:text-red-900 hover:bg-red-50 rounded-lg transition-all duration-200"
                      >
                        🗑️ Clear Current Chat
                      </button>
                      <button
                        onClick={() => {
                          // eslint-disable-next-line no-restricted-globals
                          if (confirm('Are you sure you want to delete all saved chat history?')) {
                            localStorage.removeItem('scst-chat-history');
                            alert('All chat history deleted!');
                          }
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:text-red-900 hover:bg-red-50 rounded-lg transition-all duration-200"
                      >
                        🗑️ Delete All History
                      </button>
                      
                      {/* Enhanced Chat History Section */}
                      <div className="border-t pt-4 mt-4 max-h-96 overflow-y-auto">
                        {/* Search and Filter */}
                        <div className="px-4 mb-3 space-y-2">
                          <div className="relative">
                            <Search size={14} className="absolute left-3 top-2.5 text-gray-400" />
                            <input
                              type="text"
                              placeholder="Search chats..."
                              value={searchQuery}
                              onChange={(e) => setSearchQuery(e.target.value)}
                              className="w-full pl-8 pr-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                            />
                          </div>
                          
                          <div className="flex gap-1">
                            <select
                              value={selectedCategory}
                              onChange={(e) => setSelectedCategory(e.target.value)}
                              className="flex-1 text-xs border border-gray-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                            >
                              <option value="all">All Categories</option>
                              <option value="Contract Law">Contract Law</option>
                              <option value="Property Law">Property Law</option>
                              <option value="Family Law">Family Law</option>
                              <option value="Criminal Law">Criminal Law</option>
                              <option value="Labor Law">Labor Law</option>
                              <option value="Consumer Law">Consumer Law</option>
                              <option value="Corporate Law">Corporate Law</option>
                            </select>
                            
                            <button
                              onClick={() => setShowArchived(!showArchived)}
                              className={`px-2 py-1 text-xs rounded-lg transition-all ${
                                showArchived 
                                  ? 'bg-blue-100 text-blue-700' 
                                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                              }`}
                            >
                              <Archive size={12} />
                            </button>
                          </div>
                        </div>

                        {/* Chat List */}
                        <div className="space-y-1">
                          {(() => {
                            const chats = showArchived ? getArchivedChats() : loadHistoryFromStorage();
                            const filteredChats = chats
                              .filter(chat => 
                                (selectedCategory === 'all' || chat.category === selectedCategory) &&
                                (searchQuery === '' || 
                                  chat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                  chat.preview.firstQuestion.toLowerCase().includes(searchQuery.toLowerCase())
                                )
                              )
                              .sort((a, b) => {
                                // Sort: pinned first, then starred, then by date
                                if (a.isPinned && !b.isPinned) return -1;
                                if (!a.isPinned && b.isPinned) return 1;
                                if (a.isStarred && !b.isStarred) return -1;
                                if (!a.isStarred && b.isStarred) return 1;
                                return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
                              });

                            return filteredChats.slice(0, 10).map((chat: ChatHistory) => (
                              <div key={chat.id} className="group relative">
                                <button
                                  onClick={() => {
                                    onLoadHistory(chat.messages);
                                    alert(`Loaded: ${chat.name}`);
                                  }}
                                  className="w-full text-left px-3 py-3 hover:bg-gray-50 rounded-lg transition-all duration-200 border border-transparent hover:border-gray-200"
                                >
                                  <div className="flex items-start justify-between">
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-center gap-1 mb-1">
                                        {chat.isPinned && <span className="text-blue-500">📌</span>}
                                        {chat.isStarred && <span className="text-yellow-500">⭐</span>}
                                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                                          chat.metadata.complexity === 'simple' ? 'bg-green-100 text-green-700' :
                                          chat.metadata.complexity === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                                          'bg-red-100 text-red-700'
                                        }`}>
                                          {chat.category}
                                        </span>
                                      </div>
                                      
                                      <div className="font-medium text-sm text-gray-900 truncate mb-1">
                                        {chat.name}
                                      </div>
                                      
                                      <div className="text-xs text-gray-500 line-clamp-2 mb-1">
                                        {chat.preview.firstQuestion}
                                      </div>
                                      
                                      <div className="flex items-center gap-2 text-xs text-gray-400">
                                        <span>{new Date(chat.timestamp).toLocaleDateString()}</span>
                                        <span>•</span>
                                        <span>{chat.messageCount} msgs</span>
                                        <span>•</span>
                                        <span>{chat.duration}m</span>
                                        {chat.metadata.satisfaction && (
                                          <>
                                            <span>•</span>
                                            <div className="flex items-center gap-0.5">
                                              {[1, 2, 3, 4, 5].map(star => (
                                                <span 
                                                  key={star} 
                                                  className={`text-xs ${star <= chat.metadata.satisfaction! ? 'text-yellow-400' : 'text-gray-300'}`}
                                                >
                                                  ⭐
                                                </span>
                                              ))}
                                            </div>
                                          </>
                                        )}
                                      </div>
                                    </div>
                                    
                                    {/* Enhanced Action buttons */}
                                    <div className="opacity-0 group-hover:opacity-100 transition-opacity flex flex-wrap gap-1 ml-2">
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          toggleStarChat(chat.id);
                                          window.location.reload(); // Simple refresh for demo
                                        }}
                                        className="p-1 hover:bg-gray-200 rounded"
                                        title="Star/Unstar"
                                      >
                                        <Star size={12} className={chat.isStarred ? 'text-yellow-500 fill-current' : 'text-gray-400'} />
                                      </button>
                                      
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          togglePinChat(chat.id);
                                          window.location.reload(); // Simple refresh for demo
                                        }}
                                        className="p-1 hover:bg-gray-200 rounded"
                                        title="Pin/Unpin"
                                      >
                                        <span className={`text-xs ${chat.isPinned ? 'text-blue-500' : 'text-gray-400'}`}>📌</span>
                                      </button>
                                      
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          exportChatAsText(chat);
                                        }}
                                        className="p-1 hover:bg-gray-200 rounded"
                                        title="Export as Text"
                                      >
                                        <Download size={12} className="text-gray-400" />
                                      </button>
                                      
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          exportChatAsPDF(chat);
                                        }}
                                        className="p-1 hover:bg-gray-200 rounded"
                                        title="Export as PDF"
                                      >
                                        <FileText size={12} className="text-gray-400" />
                                      </button>
                                      
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          shareChatAsLink(chat);
                                        }}
                                        className="p-1 hover:bg-gray-200 rounded"
                                        title="Share"
                                      >
                                        <Share size={12} className="text-gray-400" />
                                      </button>
                                      
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          duplicateChat(chat);
                                          window.location.reload(); // Simple refresh for demo
                                        }}
                                        className="p-1 hover:bg-gray-200 rounded"
                                        title="Duplicate"
                                      >
                                        <Copy size={12} className="text-gray-400" />
                                      </button>
                                      
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          const rating = prompt('Rate this chat (1-5 stars):', chat.metadata.satisfaction?.toString() || '');
                                          if (rating && !isNaN(Number(rating)) && Number(rating) >= 1 && Number(rating) <= 5) {
                                            rateChatSatisfaction(chat.id, Number(rating));
                                            window.location.reload(); // Simple refresh for demo
                                          }
                                        }}
                                        className="p-1 hover:bg-gray-200 rounded"
                                        title="Rate Chat"
                                      >
                                        <span className="text-xs">⭐</span>
                                      </button>
                                      
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          const newName = prompt('Enter new name:', chat.name);
                                          if (newName) {
                                            renameChat(chat.id, newName);
                                            window.location.reload(); // Simple refresh for demo
                                          }
                                        }}
                                        className="p-1 hover:bg-gray-200 rounded"
                                        title="Rename"
                                      >
                                        <Edit3 size={12} className="text-gray-400" />
                                      </button>
                                    </div>
                                  </div>
                                </button>
                              </div>
                            ));
                          })()}
                        </div>
                        
                        {/* No results message */}
                        {(() => {
                          const chats = showArchived ? getArchivedChats() : loadHistoryFromStorage();
                          const filteredChats = chats.filter(chat => 
                            (selectedCategory === 'all' || chat.category === selectedCategory) &&
                            (searchQuery === '' || 
                              chat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                              chat.preview.firstQuestion.toLowerCase().includes(searchQuery.toLowerCase())
                            )
                          );
                          
                          return filteredChats.length === 0 && (
                            <div className="text-center py-8 text-gray-500">
                              <History size={24} className="mx-auto mb-2 opacity-50" />
                              <p className="text-sm">
                                {searchQuery || selectedCategory !== 'all' 
                                  ? 'No chats match your filters' 
                                  : showArchived 
                                    ? 'No archived chats' 
                                    : 'No saved chats yet'
                                }
                              </p>
                            </div>
                          );
                        })()}
                        
                        {/* Quick Stats Section */}
                        {!showArchived && loadHistoryFromStorage().length > 0 && (
                          <div className="border-t pt-3 mt-3 px-4">
                            <div className="text-xs text-gray-500 font-medium mb-2">📊 Quick Stats</div>
                            {(() => {
                              const allChats = loadHistoryFromStorage();
                              const totalChats = allChats.length;
                              const starredChats = allChats.filter(chat => chat.isStarred).length;
                              const avgRating = allChats
                                .filter(chat => chat.metadata.satisfaction)
                                .reduce((sum, chat) => sum + (chat.metadata.satisfaction || 0), 0) / 
                                allChats.filter(chat => chat.metadata.satisfaction).length || 0;
                              const mostUsedCategory = allChats
                                .reduce((acc, chat) => {
                                  acc[chat.category] = (acc[chat.category] || 0) + 1;
                                  return acc;
                                }, {} as Record<string, number>);
                              const topCategory = Object.entries(mostUsedCategory)
                                .sort(([,a], [,b]) => b - a)[0]?.[0] || 'None';
                              
                              return (
                                <div className="grid grid-cols-2 gap-2 text-xs">
                                  <div className="bg-blue-50 p-2 rounded">
                                    <div className="font-medium text-blue-700">{totalChats}</div>
                                    <div className="text-blue-600">Total Chats</div>
                                  </div>
                                  <div className="bg-yellow-50 p-2 rounded">
                                    <div className="font-medium text-yellow-700">{starredChats}</div>
                                    <div className="text-yellow-600">Starred</div>
                                  </div>
                                  <div className="bg-green-50 p-2 rounded">
                                    <div className="font-medium text-green-700">
                                      {avgRating > 0 ? avgRating.toFixed(1) : 'N/A'}
                                    </div>
                                    <div className="text-green-600">Avg Rating</div>
                                  </div>
                                  <div className="bg-purple-50 p-2 rounded">
                                    <div className="font-medium text-purple-700 truncate">{topCategory}</div>
                                    <div className="text-purple-600">Top Category</div>
                                  </div>
                                </div>
                              );
                            })()}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </nav>

          {/* Enhanced Pro Tip */}
          <div className="absolute bottom-6 left-4 right-4">
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 border border-blue-200/50 rounded-2xl p-6 shadow-lg backdrop-blur-sm">
              <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-2xl"></div>
              <div className="relative">
                <div className="flex items-center space-x-2 mb-2">
                  <Sparkles size={16} className="text-blue-600 animate-pulse" />
                  <h3 className="font-bold text-blue-900 text-sm">Pro Tip</h3>
                </div>
                <p className="text-blue-700 text-xs leading-relaxed">Ask specific legal questions for more detailed responses with proper citations.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

// Main Component with enhanced animations
const API_BASE_URL = "http://localhost:8001";

const LegalChatbot: React.FC = () => {
  const [state, dispatch] = useReducer(chatReducer, initialState);
  const [inputValue, setInputValue] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // History management functions
  const clearHistory = () => {
    dispatch({ type: 'CLEAR_MESSAGES' });
  };

  const loadHistory = (messages: ChatMessage[]) => {
    dispatch({ type: 'LOAD_MESSAGES', payload: messages });
  };

  // Archive old chats (30+ days) - moved to main component
  const archiveOldChats = () => {
    const existingHistory = JSON.parse(localStorage.getItem('scst-chat-history') || '[]');
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const updatedHistory = existingHistory.map((chat: ChatHistory) => {
      const chatDate = new Date(chat.timestamp);
      return chatDate < thirtyDaysAgo ? { ...chat, isArchived: true } : chat;
    });
    
    localStorage.setItem('scst-chat-history', JSON.stringify(updatedHistory));
  };

  // Auto scroll with smooth animation
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [state.messages]);

  // Enhanced Auto-save chat history to localStorage when messages change
  useEffect(() => {
    if (state.messages.length > 1) { // Don't save just the initial message
      const firstUserMessage = state.messages.find(msg => msg.role === 'user');
      if (firstUserMessage) {
        const firstAssistantMessage = state.messages.find(msg => msg.role === 'assistant' && msg.id !== '1');
        const chatName = generateChatName(firstUserMessage.content);
        const category = categorizeLegalTopic(firstUserMessage.content);
        const complexity = calculateComplexity(state.messages);
        
        const autoSaveData: ChatHistory = {
          id: 'auto-save',
          name: `${chatName} (Auto-saved)`,
          messages: state.messages,
          timestamp: new Date().toISOString(),
          category: category,
          duration: Math.round((new Date().getTime() - (state.chatStartTime?.getTime() || new Date().getTime())) / (1000 * 60)),
          messageCount: state.messages.length,
          isPinned: false,
          isStarred: false,
          isArchived: false,
          preview: {
            firstQuestion: firstUserMessage.content.substring(0, 100) + (firstUserMessage.content.length > 100 ? '...' : ''),
            firstResponse: firstAssistantMessage ? firstAssistantMessage.content.substring(0, 150) + (firstAssistantMessage.content.length > 150 ? '...' : '') : 'No response yet'
          },
          metadata: {
            complexity: complexity,
            tags: [category.toLowerCase().replace(' ', '-'), 'auto-saved']
          }
        };
        localStorage.setItem('scst-chat-auto-save', JSON.stringify(autoSaveData));
      }
    }
  }, [state.messages, state.chatStartTime]);

  // Check API status and restore auto-saved chat on component mount
  useEffect(() => {
    const checkApiStatus = async () => {
      try {
        dispatch({ type: 'SET_API_STATUS', payload: 'connecting' });
        const response = await fetch('http://localhost:8001/', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        
        if (response.ok) {
          dispatch({ type: 'SET_API_STATUS', payload: 'connected' });
        } else {
          dispatch({ type: 'SET_API_STATUS', payload: 'disconnected' });
        }
      } catch (error) {
        console.error('API Status Check Error:', error);
        dispatch({ type: 'SET_API_STATUS', payload: 'disconnected' });
      }
    };

    // Restore auto-saved chat if available
    const restoreAutoSavedChat = () => {
      try {
        const autoSavedData = localStorage.getItem('scst-chat-auto-save');
        if (autoSavedData) {
          const parsedData: ChatHistory = JSON.parse(autoSavedData);
          if (parsedData.messages && parsedData.messages.length > 1) {
            dispatch({ type: 'LOAD_MESSAGES', payload: parsedData.messages });
            // Restore chat start time for duration calculation
            if (parsedData.timestamp) {
              dispatch({ type: 'SET_CHAT_START_TIME', payload: new Date(parsedData.timestamp) });
            }
          }
        }
      } catch (error) {
        console.error('Error restoring auto-saved chat:', error);
      }
    };

    checkApiStatus();
    restoreAutoSavedChat();
    
    // Auto-archive old chats on app load
    archiveOldChats();
  }, []);

  // API call to backend
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
      // Prepare chat history for API
      const chatHistory = state.messages.map(msg => ({
        role: msg.role,
        content: msg.content
      }));

      // 🔧 Enhanced connection with better error handling
      const response = await fetch('http://localhost:8001/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'text/plain',
        },
        mode: 'cors',
        body: JSON.stringify({
          query: content.trim()
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      // Add web search indicator to sources if web search was performed
      let sources = data.sources || ['Legal Knowledge Base'];
      if (data.web_search_performed) {
        sources.unshift(`🌐 Web Search (${data.web_results_count} results)`);
      }

      dispatch({ 
        type: 'UPDATE_LAST_MESSAGE', 
        payload: { 
          content: data.response || data.message || 'No response received',
          isLoading: false,
          sources: sources
        }
      });

      dispatch({ type: 'SET_API_STATUS', payload: 'connected' });

    } catch (error) {
      console.error('API Error:', error);
      dispatch({ type: 'SET_API_STATUS', payload: 'disconnected' });
      
      // Fallback response when API is not available
      const fallbackResponse = `I apologize, but I'm currently unable to connect to the legal database. However, regarding your question about "${content.substring(0, 40)}...", here are some general legal principles that might be relevant:\n\n• Always consult with a qualified attorney for specific legal advice\n• Legal matters often depend on jurisdiction and specific circumstances\n• Documentation and evidence are crucial in legal proceedings\n\nPlease try again later when the connection is restored, or consult with a legal professional for immediate assistance.`;
      
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

  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30 relative overflow-hidden">
      <FloatingParticles />
      <LegalWatermark 
        opacity={0.03} 
        size="large" 
        position="center" 
        showText={true}
        interactive={false}
      />
      
      {/* Enhanced Sidebar */}
      <Sidebar 
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)}
        messages={state.messages}
        onClearHistory={clearHistory}
        onLoadHistory={loadHistory}
      />

      {/* Main Content with glassmorphism */}
      <div className="flex-1 flex flex-col relative z-10">
        {/* Enhanced Header */}
        <header className="bg-white/80 backdrop-blur-xl shadow-lg border-b border-gray-200/50 px-6 py-4 relative">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 to-purple-600/5"></div>
          <div className="relative flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden p-3 hover:bg-white/50 rounded-xl transition-all duration-300 hover:shadow-lg hover:scale-105 transform"
              >
                <Menu size={20} className="text-gray-600" />
              </button>
              
              {/* Logo and Title */}
              <div className="flex items-center space-x-4">
                <img 
                  src={scstLogo} 
                  alt="SCST GPT Logo" 
                  className="w-12 h-12 rounded-full object-cover shadow-lg border-2 border-blue-200 hover:scale-110 transition-transform duration-300"
                />
                <div className="header-title-animation">
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    SCST-GPT
                  </h1>
                  <p className="text-gray-600 mt-1 font-medium">AI-powered Legal Research Assistant for Indian Law</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Prominent New Chat Button */}
              <button
                onClick={() => {
                  // eslint-disable-next-line no-restricted-globals
                  if (state.messages.length > 1 && confirm('Start a new chat? Current conversation will be auto-saved.')) {
                    // Auto-save current chat before clearing
                    if (state.messages.length > 1) {
                      const firstUserMessage = state.messages.find(msg => msg.role === 'user');
                      if (firstUserMessage) {
                        const chatName = generateChatName(firstUserMessage.content);
                        const category = categorizeLegalTopic(firstUserMessage.content);
                        const complexity = calculateComplexity(state.messages);
                        const firstAssistantMessage = state.messages.find(msg => msg.role === 'assistant' && msg.id !== '1');
                        
                        const historyData: ChatHistory = {
                          id: Date.now().toString(),
                          name: chatName,
                          messages: state.messages,
                          timestamp: new Date().toISOString(),
                          category: category,
                          duration: Math.round((new Date().getTime() - (state.chatStartTime?.getTime() || new Date().getTime())) / (1000 * 60)),
                          messageCount: state.messages.length,
                          isPinned: false,
                          isStarred: false,
                          isArchived: false,
                          preview: {
                            firstQuestion: firstUserMessage.content.substring(0, 100) + (firstUserMessage.content.length > 100 ? '...' : ''),
                            firstResponse: firstAssistantMessage ? firstAssistantMessage.content.substring(0, 150) + (firstAssistantMessage.content.length > 150 ? '...' : '') : 'No response yet'
                          },
                          metadata: {
                            complexity: complexity,
                            tags: [category.toLowerCase().replace(' ', '-')]
                          }
                        };
                        
                        const existingHistory = JSON.parse(localStorage.getItem('scst-chat-history') || '[]');
                        existingHistory.unshift(historyData);
                        const limitedHistory = existingHistory.slice(0, 50);
                        localStorage.setItem('scst-chat-history', JSON.stringify(limitedHistory));
                      }
                    }
                    clearHistory();
                  } else if (state.messages.length <= 1) {
                    clearHistory();
                  }
                }}
                className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 hover:shadow-lg hover:scale-105 transform font-medium"
              >
                <Plus size={18} />
                <span className="hidden sm:inline">New Chat</span>
              </button>
              
              <div className="hidden sm:block">
                <StatusIndicator status={state.apiStatus} />
              </div>
            </div>
          </div>
        </header>

        {/* Enhanced Messages Container */}
        <div className="flex-1 overflow-y-auto px-6 py-8 relative">
          <div className="max-w-4xl mx-auto relative">
            {state.messages.map((message, index) => (
              <MessageBubble key={message.id} message={message} index={index} />
            ))}
            {state.isLoading && !state.messages.some(m => m.isLoading) && <TypingIndicator />}
            
            {/* Enhanced Error Display */}
            {state.error && (
              <div className="flex justify-center mb-8">
                <div className="bg-gradient-to-br from-red-50 to-red-100 border border-red-200 rounded-xl px-6 py-4 flex items-center space-x-3 text-red-700">
                  <AlertCircle size={20} className="animate-pulse" />
                  <span className="font-medium">{state.error}</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Enhanced Input Section */}
        <div className="bg-white/90 backdrop-blur-xl border-t border-gray-200/50 px-6 py-6 relative">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-end space-x-4">
              <div className="flex-1 relative">
                <textarea
                  ref={inputRef}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask a legal question..."
                  className="w-full bg-white/80 border border-gray-200/70 rounded-2xl px-5 py-4 pr-14 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/50 transition-all duration-300 resize-none"
                  rows={1}
                  style={{ minHeight: '56px', maxHeight: '200px' }}
                />
                <button
                  onClick={() => sendMessage(inputValue)}
                  disabled={!inputValue.trim()}
                  className="absolute right-3 bottom-3 p-2 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 text-white shadow-lg transform transition-all duration-300 hover:scale-110 disabled:opacity-50 disabled:transform-none"
                >
                  <Send size={20} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const App = LegalChatbot;
export default App;
