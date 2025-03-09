'use client';

import { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import Sidebar from '../components/chat/Sidebar';
import ChatArea from '../components/chat/ChatArea';
import Header from '../components/chat/Header';
import SettingsPanel from '../components/chat/SettingsPanel';
import type { Conversation, Message, Settings, ApiConfig } from '../types';
import { sendMessageToAI } from '../services/ai-service';

// 默认设置
const defaultSettings: Settings = {
  apiUrl: '',
  apiKey: '',
  model: '',
  temperature: 0.7,
  maxTokens: 2000,
  customModels: []
};

export default function Home() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<string | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [isLoading, setIsLoading] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [editingTitle, setEditingTitle] = useState<string | null>(null);
  const [newTitle, setNewTitle] = useState('');
  const [configs, setConfigs] = useState<ApiConfig[]>([]);
  const [selectedConfigId, setSelectedConfigId] = useState<string | null>(null);

  // 从本地存储加载会话、设置和配置
  useEffect(() => {
    const savedConversations = localStorage.getItem('conversations');
    const savedSettings = localStorage.getItem('settings');
    const savedSidebarState = localStorage.getItem('sidebarCollapsed');
    const savedConfigs = localStorage.getItem('apiConfigs');
    const savedSelectedConfigId = localStorage.getItem('selectedConfigId');

    if (savedConversations) {
      setConversations(JSON.parse(savedConversations));
    }

    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }

    if (savedSidebarState) {
      setSidebarCollapsed(JSON.parse(savedSidebarState));
    }

    if (savedConfigs) {
      setConfigs(JSON.parse(savedConfigs));
    }

    if (savedSelectedConfigId) {
      setSelectedConfigId(JSON.parse(savedSelectedConfigId));
    }
  }, []);

  // 保存会话到本地存储
  useEffect(() => {
    if (conversations.length > 0) {
      localStorage.setItem('conversations', JSON.stringify(conversations));
    }
  }, [conversations]);

  // 保存设置到本地存储
  useEffect(() => {
    localStorage.setItem('settings', JSON.stringify(settings));
  }, [settings]);

  // 保存侧边栏状态到本地存储
  useEffect(() => {
    localStorage.setItem('sidebarCollapsed', JSON.stringify(sidebarCollapsed));
  }, [sidebarCollapsed]);

  // 保存配置到本地存储
  useEffect(() => {
    if (configs.length > 0) {
      localStorage.setItem('apiConfigs', JSON.stringify(configs));
    }
  }, [configs]);

  // 保存选中的配置ID到本地存储
  useEffect(() => {
    if (selectedConfigId) {
      localStorage.setItem('selectedConfigId', JSON.stringify(selectedConfigId));
    } else {
      localStorage.removeItem('selectedConfigId');
    }
  }, [selectedConfigId]);

  // 切换侧边栏状态
  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  // 选择配置
  const handleSelectConfig = (configId: string | null) => {
    setSelectedConfigId(configId);
    if (configId) {
      const selectedConfig = configs.find(c => c.id === configId);
      if (selectedConfig) {
        setSettings(selectedConfig.settings);
      }
    } else {
      setSettings(defaultSettings);
    }
  };

  // 保存配置列表
  const handleSaveConfigs = (newConfigs: ApiConfig[]) => {
    setConfigs(newConfigs);
  };

  // 创建新会话
  const handleNewChat = () => {
    const newConversation: Conversation = {
      id: uuidv4(),
      title: '新对话',
      date: new Date().toLocaleString('zh-CN'),
      messages: [],
    };

    setConversations([newConversation, ...conversations]);
    setActiveConversation(newConversation.id);
  };

  // 选择会话
  const handleSelectConversation = (id: string) => {
    setActiveConversation(id);
  };

  // 删除会话
  const handleDeleteConversation = (id: string) => {
    const updatedConversations = conversations.filter(conv => conv.id !== id);
    setConversations(updatedConversations);
    
    // 如果删除的是当前活跃会话，则重置活跃会话
    if (activeConversation === id) {
      setActiveConversation(updatedConversations.length > 0 ? updatedConversations[0].id : null);
    }
  };

  // 开始编辑会话标题
  const handleStartEditTitle = (id: string) => {
    const conversation = conversations.find(conv => conv.id === id);
    if (conversation) {
      setEditingTitle(id);
      setNewTitle(conversation.title);
    }
  };

  // 保存编辑后的会话标题
  const handleSaveTitle = (id: string) => {
    if (newTitle.trim()) {
      setConversations(
        conversations.map(conv => {
          if (conv.id === id) {
            return { ...conv, title: newTitle.trim() };
          }
          return conv;
        })
      );
    }
    setEditingTitle(null);
  };

  // 取消编辑会话标题
  const handleCancelEditTitle = () => {
    setEditingTitle(null);
  };

  // 发送消息
  const handleSendMessage = async (content: string) => {
    if (!activeConversation) return;

    const userMessage: Message = {
      id: uuidv4(),
      role: 'user',
      content,
      timestamp: new Date().toLocaleString('zh-CN'),
    };

    // 更新当前会话，添加用户消息
    const updatedConversations = conversations.map((conversation) => {
      if (conversation.id === activeConversation) {
        return {
          ...conversation,
          messages: [...conversation.messages, userMessage],
        };
      }
      return conversation;
    });

    setConversations(updatedConversations);

    // 如果是第一条消息，更新会话标题
    if (updatedConversations.find(c => c.id === activeConversation)?.messages.length === 0) {
      setConversations(
        updatedConversations.map((conv) => {
          if (conv.id === activeConversation) {
            return {
              ...conv,
              title: content.substring(0, 30) + (content.length > 30 ? '...' : ''),
            };
          }
          return conv;
        })
      );
    }

    try {
      setIsLoading(true);

      // 获取当前会话的所有消息（不包括刚添加的用户消息）
      const currentMessages = conversations.find(
        conv => conv.id === activeConversation
      )?.messages || [];

      // 发送到AI API获取响应
      const aiResponse = await sendMessageToAI(content, currentMessages, settings);

      // 创建AI响应消息
      const assistantMessage: Message = {
        id: uuidv4(),
        role: 'assistant',
        content: aiResponse,
        timestamp: new Date().toLocaleString('zh-CN'),
      };

      // 更新会话
      setConversations(
        conversations.map((conv) => {
          if (conv.id === activeConversation) {
            return {
              ...conv,
              messages: [...conv.messages, userMessage, assistantMessage],
            };
          }
          return conv;
        })
      );
    } catch (error) {
      console.error('发送消息失败:', error);
      
      // 添加错误消息
      const errorMessage: Message = {
        id: uuidv4(),
        role: 'assistant',
        content: error instanceof Error 
          ? `发送消息失败: ${error.message}` 
          : '发送消息失败，请检查您的API设置或网络连接。',
        timestamp: new Date().toLocaleString('zh-CN'),
        isError: true
      };

      setConversations(
        conversations.map((conv) => {
          if (conv.id === activeConversation) {
            return {
              ...conv,
              messages: [...conv.messages, userMessage, errorMessage],
            };
          }
          return conv;
        })
      );
    } finally {
      setIsLoading(false);
    }
  };

  // 获取当前活跃会话
  const currentConversation = conversations.find(
    (conv) => conv.id === activeConversation
  );

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {/* 侧边栏 */}
      <Sidebar
        conversations={conversations}
        activeConversation={activeConversation}
        onNewChat={handleNewChat}
        onSelectConversation={handleSelectConversation}
        collapsed={sidebarCollapsed}
        onDeleteConversation={handleDeleteConversation}
        onEditTitle={handleStartEditTitle}
        editingTitle={editingTitle}
        newTitle={newTitle}
        onNewTitleChange={setNewTitle}
        onSaveTitle={handleSaveTitle}
        onCancelEditTitle={handleCancelEditTitle}
      />

      {/* 主要内容区域 */}
      <div className={`flex-1 flex flex-col h-screen overflow-hidden transition-all duration-300 ${settingsOpen ? 'mr-96' : ''}`}>
        {/* 头部 */}
        <Header
          title={currentConversation?.title || 'AI聊天助手'}
          onOpenSettings={() => setSettingsOpen(true)}
          toggleSidebar={toggleSidebar}
          sidebarCollapsed={sidebarCollapsed}
        />

        {/* 聊天区域 */}
        <div className="flex-1 overflow-hidden">
          {activeConversation ? (
            <ChatArea
              messages={currentConversation?.messages || []}
              onSendMessage={handleSendMessage}
              isLoading={isLoading}
              configs={configs}
              settings={settings}
              onChangeSettings={setSettings}
            />
          ) : (
            <div className="flex-1 flex items-center justify-center bg-white text-gray-400 h-full">
              <div className="text-center">
                <h3 className="text-xl font-semibold mb-2">欢迎使用AI聊天助手</h3>
                <p>点击左侧的"新建对话"按钮开始聊天</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 设置面板 */}
      <SettingsPanel
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        settings={settings}
        onSaveSettings={setSettings}
        configs={configs}
        onSaveConfigs={handleSaveConfigs}
        selectedConfigId={selectedConfigId}
        onSelectConfig={handleSelectConfig}
      />
    </div>
  );
}
