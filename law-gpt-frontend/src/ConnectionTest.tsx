import React, { useState, useEffect } from 'react';

const ConnectionTest: React.FC = () => {
  const [backendStatus, setBackendStatus] = useState<'checking' | 'connected' | 'disconnected'>('checking');
  const [testMessage, setTestMessage] = useState('');
  const [response, setResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Check backend connection on component mount
  useEffect(() => {
    checkBackendConnection();
  }, []);

  const checkBackendConnection = async () => {
    try {
      const response = await fetch('http://localhost:8001/', {
        method: 'GET',
        mode: 'cors',
      });
      
      if (response.ok) {
        setBackendStatus('connected');
        console.log('✅ Backend connected successfully');
      } else {
        setBackendStatus('disconnected');
        console.log('❌ Backend responded with error:', response.status);
      }
    } catch (error) {
      setBackendStatus('disconnected');
      console.log('❌ Backend connection failed:', error);
    }
  };

  const testChat = async () => {
    if (!testMessage.trim()) return;
    
    setIsLoading(true);
    setResponse('');
    
    try {
      const response = await fetch('http://localhost:8001/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'text/plain',
        },
        mode: 'cors',
        body: JSON.stringify({
          query: testMessage.trim()
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('No response body');
      }

      let fullResponse = '';
      
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        const chunk = new TextDecoder().decode(value);
        const lines = chunk.split('\n');
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              if (data.response) {
                fullResponse += data.response;
                setResponse(fullResponse);
              }
              if (data.done) {
                setIsLoading(false);
                return;
              }
            } catch (e) {
              console.log('Error parsing chunk:', e);
            }
          }
        }
      }
      
      setIsLoading(false);
      
    } catch (error) {
      console.error('Chat test failed:', error);
      setResponse(`Error: ${error}`);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">
          🔧 Law GPT Connection Test
        </h1>
        
        {/* Connection Status */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Backend Connection Status</h2>
          <div className="flex items-center space-x-3">
            <div className={`w-4 h-4 rounded-full ${
              backendStatus === 'connected' ? 'bg-green-500' : 
              backendStatus === 'disconnected' ? 'bg-red-500' : 'bg-yellow-500'
            }`}></div>
            <span className={`font-medium ${
              backendStatus === 'connected' ? 'text-green-600' : 
              backendStatus === 'disconnected' ? 'text-red-600' : 'text-yellow-600'
            }`}>
              {backendStatus === 'connected' ? '✅ Connected to http://localhost:8001' :
               backendStatus === 'disconnected' ? '❌ Disconnected from backend' :
               '🔄 Checking connection...'}
            </span>
            <button
              onClick={checkBackendConnection}
              className="ml-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
            >
              Recheck
            </button>
          </div>
        </div>

        {/* Chat Test */}
        {backendStatus === 'connected' && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Chat Test</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Test Message:
                </label>
                <input
                  type="text"
                  value={testMessage}
                  onChange={(e) => setTestMessage(e.target.value)}
                  placeholder="Enter a legal question to test..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  onKeyPress={(e) => e.key === 'Enter' && testChat()}
                />
              </div>
              
              <button
                onClick={testChat}
                disabled={isLoading || !testMessage.trim()}
                className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? '🔄 Testing...' : '🚀 Test Chat'}
              </button>
              
              {response && (
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Response:
                  </label>
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <pre className="whitespace-pre-wrap text-sm text-gray-800">
                      {response}
                    </pre>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mt-6">
          <h3 className="text-lg font-semibold text-yellow-800 mb-2">
            🔧 Troubleshooting Steps:
          </h3>
          <ul className="text-yellow-700 space-y-1">
            <li>1. Make sure backend is running on http://localhost:8001</li>
            <li>2. Check if frontend is running on http://localhost:3000</li>
            <li>3. Verify no firewall is blocking the connections</li>
            <li>4. Try refreshing this page</li>
            <li>5. Check browser console for errors (F12)</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ConnectionTest;