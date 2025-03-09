import { useState, useRef, useEffect } from 'react';
import { Settings, ApiConfig } from '../../types';
import ErrorHelper from './ErrorHelper';

type Message = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  isError?: boolean;
};

type ChatAreaProps = {
  messages: Message[];
  onSendMessage: (content: string) => void;
  isLoading?: boolean;
  configs: ApiConfig[];
  settings: Settings;
  onChangeSettings: (settings: Settings) => void;
};

export default function ChatArea({ 
  messages, 
  onSendMessage, 
  isLoading = false, 
  configs, 
  settings, 
  onChangeSettings 
}: ChatAreaProps) {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [showConfigSelector, setShowConfigSelector] = useState(false);
  
  // 通过比较settings查找当前使用的配置
  const getCurrentConfig = () => {
    return configs.find(config => 
      config.settings.apiUrl === settings.apiUrl && 
      config.settings.apiKey === settings.apiKey);
  };
  
  const currentConfig = getCurrentConfig();
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isLoading && hasValidConfig) {
      onSendMessage(input);
      setInput('');
    }
  };

  // 处理配置变更
  const handleConfigChange = (configId: string) => {
    const config = configs.find(c => c.id === configId);
    if (config) {
      onChangeSettings(config.settings);
    }
  };

  // 处理模型变更
  const handleModelChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onChangeSettings({
      ...settings,
      model: e.target.value
    });
  };

  // 滚动到最新消息
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // 获取自定义模型
  const customModels = settings.customModels || [];
  
  // 检查是否有完整API配置
  const hasValidConfig = !!(settings.apiUrl && settings.apiKey && settings.model);

  return (
    <div className="flex flex-col h-full">
      {/* 聊天区域 */}
      <div className="flex-1 overflow-y-auto p-4 bg-white">
        {messages.length === 0 ? (
          <div className="h-full flex items-center justify-center text-gray-400">
            <div className="text-center">
              <h3 className="text-xl font-semibold mb-2">欢迎使用AI聊天助手</h3>
              {!hasValidConfig ? (
                <p className="text-red-500 mb-2">请先在设置中配置API和模型</p>
              ) : (
                <p>开始新的对话吧！</p>
              )}
              {currentConfig && (
                <p className="text-gray-600 mt-2">
                  当前使用配置: <span className="font-semibold text-blue-600">{currentConfig.name}</span>
                </p>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                <div
                  className={`max-w-3/4 rounded-lg px-4 py-2 ${
                    message.role === 'user'
                      ? 'bg-blue-100 text-blue-900'
                      : message.isError
                      ? 'bg-red-100 text-red-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  <div className="text-sm">{message.content}</div>
                  <div className="text-xs text-gray-500 mt-1">
                    {message.timestamp}
                  </div>
                  {message.isError && <ErrorHelper errorMessage={message.content} />}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 rounded-lg px-4 py-2 text-gray-800">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* 输入区域 */}
      <div className="border-t border-gray-200 p-4 bg-gray-50">
        <form onSubmit={handleSubmit} className="flex flex-col space-y-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={hasValidConfig ? "输入消息..." : "请先在设置中配置API和模型"}
            className="w-full border border-gray-300 rounded-md py-3 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black text-lg min-h-[100px] max-h-[150px] resize-y"
            disabled={isLoading || !hasValidConfig}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                if (input.trim() && !isLoading && hasValidConfig) {
                  handleSubmit(e as any);
                }
              }
            }}
          />
          
          {/* 配置和模型选择 */}
          <div className="flex items-center bg-white border border-gray-200 rounded-md p-2">
            <div className="flex-1">
              <button
                type="button"
                onClick={() => setShowConfigSelector(!showConfigSelector)}
                className={`text-sm flex items-center ${hasValidConfig ? 'text-gray-700 hover:text-gray-900' : 'text-red-500 hover:text-red-700'}`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                  <circle cx="12" cy="12" r="3"></circle>
                  <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
                </svg>
                {currentConfig
                  ? `配置：${currentConfig.name} | 模型：${settings.model || '未选择'}`
                  : (hasValidConfig 
                    ? '使用临时配置' 
                    : '⚠️ 需要配置API和模型')}
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`ml-1 transition-transform ${showConfigSelector ? 'rotate-180' : ''}`}>
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
              </button>
              
              {showConfigSelector && (
                <div className="mt-2 p-3 border border-gray-200 rounded-md bg-white">
                  {configs.length > 0 && (
                    <div className="mb-3">
                      <label className="block text-sm font-medium text-gray-700 mb-1">选择配置</label>
                      <select
                        className="w-full border border-gray-300 rounded-md py-1 px-2 text-sm text-black focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        onChange={(e) => handleConfigChange(e.target.value)}
                        value={currentConfig?.id || ""}
                      >
                        <option value="" disabled>选择一个配置</option>
                        {configs.map(config => (
                          <option key={config.id} value={config.id}>{config.name}</option>
                        ))}
                      </select>
                    </div>
                  )}
                  
                  {customModels.length > 0 ? (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">选择模型</label>
                      <select
                        className="w-full border border-gray-300 rounded-md py-1 px-2 text-sm text-black focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        value={settings.model}
                        onChange={handleModelChange}
                      >
                        {customModels.map(model => (
                          <option key={model.id} value={model.value}>{model.name}</option>
                        ))}
                      </select>
                    </div>
                  ) : (
                    <div className="text-center py-2 text-gray-500">
                      请在设置中添加模型
                    </div>
                  )}
                </div>
              )}
            </div>
            
            <div className="flex">
              <button
                type="submit"
                disabled={!input.trim() || isLoading || !hasValidConfig}
                className={`rounded-md py-3 px-6 ${
                  !input.trim() || isLoading || !hasValidConfig
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-blue-500 text-white hover:bg-blue-600'
                }`}
                title={!hasValidConfig ? "请先在设置中配置API和模型" : ""}
              >
                发送
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
} 