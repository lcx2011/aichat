import { useState } from 'react';
import Link from 'next/link';

type Conversation = {
  id: string;
  title: string;
  date: string;
};

type SidebarProps = {
  conversations: Conversation[];
  activeConversation: string | null;
  onNewChat: () => void;
  onSelectConversation: (id: string) => void;
  collapsed: boolean;
  onDeleteConversation: (id: string) => void;
  onEditTitle: (id: string) => void;
  editingTitle: string | null;
  newTitle: string;
  onNewTitleChange: (title: string) => void;
  onSaveTitle: (id: string) => void;
  onCancelEditTitle: () => void;
};

export default function Sidebar({
  conversations,
  activeConversation,
  onNewChat,
  onSelectConversation,
  collapsed,
  onDeleteConversation,
  onEditTitle,
  editingTitle,
  newTitle,
  onNewTitleChange,
  onSaveTitle,
  onCancelEditTitle
}: SidebarProps) {
  return (
    <div className={`${collapsed ? 'w-16' : 'w-80'} bg-gray-50 border-r border-gray-200 h-screen flex flex-col transition-all duration-300`}>
      <div className="p-4">
        <button
          onClick={onNewChat}
          className={`w-full flex items-center justify-center gap-2 bg-white border border-gray-300 rounded-md py-2 px-4 text-sm hover:bg-gray-50 transition-colors ${
            collapsed ? 'px-2' : 'px-4'
          }`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          {!collapsed && <span className="text-black font-medium">新建对话</span>}
        </button>
      </div>
      
      <div className="flex-1 overflow-y-auto">
        <div className="px-2">
          {!collapsed && <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-2 mb-2">对话历史</h2>}
          <ul className="space-y-1">
            {conversations.map((conversation) => (
              <li key={conversation.id}>
                {editingTitle === conversation.id && !collapsed ? (
                  <div className="px-3 py-2 bg-white border border-gray-300 rounded-md">
                    <input
                      type="text"
                      value={newTitle}
                      onChange={(e) => onNewTitleChange(e.target.value)}
                      className="w-full border-none focus:outline-none text-sm mb-1 text-black"
                      autoFocus
                    />
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={onCancelEditTitle}
                        className="text-xs text-gray-500 hover:text-gray-700"
                      >
                        取消
                      </button>
                      <button
                        onClick={() => onSaveTitle(conversation.id)}
                        className="text-xs text-blue-500 hover:text-blue-700"
                      >
                        保存
                      </button>
                    </div>
                  </div>
                ) : (
                  <div 
                    className={`flex items-center w-full ${
                      activeConversation === conversation.id
                        ? 'bg-gray-200 text-gray-900'
                        : 'text-gray-700 hover:bg-gray-100'
                    } rounded-md ${collapsed ? 'justify-center py-2' : 'px-3 py-2'}`}
                  >
                    <button
                      onClick={() => onSelectConversation(conversation.id)}
                      className={`${collapsed ? '' : 'flex-1 text-left mr-1'}`}
                      title={collapsed ? conversation.title : undefined}
                    >
                      {collapsed ? (
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                        </svg>
                      ) : (
                        <>
                          <div className="flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                            </svg>
                            <span className="truncate">{conversation.title}</span>
                          </div>
                          <div className="text-xs text-gray-500 ml-6">{conversation.date}</div>
                        </>
                      )}
                    </button>
                    
                    {!collapsed && (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => onEditTitle(conversation.id)}
                          className="p-1 text-gray-500 hover:text-gray-700 rounded-md"
                          title="编辑标题"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12 20h9"></path>
                            <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
                          </svg>
                        </button>
                        <button
                          onClick={() => onDeleteConversation(conversation.id)}
                          className="p-1 text-gray-500 hover:text-red-500 rounded-md"
                          title="删除对话"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="3 6 5 6 21 6"></polyline>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                          </svg>
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
} 