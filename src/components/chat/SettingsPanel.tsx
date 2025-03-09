import { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Settings, ApiConfig, CustomModel } from '../../types';

type SettingsProps = {
  isOpen: boolean;
  onClose: () => void;
  settings: Settings;
  onSaveSettings: (settings: Settings) => void;
  configs: ApiConfig[];
  onSaveConfigs: (configs: ApiConfig[]) => void;
  selectedConfigId: string | null;
  onSelectConfig: (configId: string | null) => void;
};

// 创建默认空设置
const createEmptySettings = (): Settings => ({
  apiUrl: '',
  apiKey: '',
  model: '',
  temperature: 0.7,
  maxTokens: 2000,
  customModels: []
});

export default function SettingsPanel({
  isOpen,
  onClose,
  settings,
  onSaveSettings,
  configs,
  onSaveConfigs,
  selectedConfigId,
  onSelectConfig
}: SettingsProps) {
  const [localSettings, setLocalSettings] = useState<Settings>(settings);
  const [showNewConfig, setShowNewConfig] = useState(false);
  const [newConfigName, setNewConfigName] = useState('');
  
  // 模型管理
  const [showNewModel, setShowNewModel] = useState(false);
  const [newModelName, setNewModelName] = useState('');

  // 当settings变化时更新localSettings
  useEffect(() => {
    // 确保localSettings.customModels是一个数组
    if (!settings.customModels) {
      setLocalSettings({
        ...settings,
        customModels: []
      });
    } else {
      setLocalSettings(settings);
    }
  }, [settings]);

  // 保存当前配置设置
  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    
    // 保存当前设置
    onSaveSettings(localSettings);
    
    // 如果有选中的配置，更新该配置的设置
    if (selectedConfigId) {
      const updatedConfigs = configs.map(config => 
        config.id === selectedConfigId 
          ? { ...config, settings: localSettings } 
          : config
      );
      onSaveConfigs(updatedConfigs);
    }
    
    onClose();
  };

  // 处理设置内容变更
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    
    setLocalSettings((prev) => ({
      ...prev,
      [name]: name === 'temperature' || name === 'maxTokens' 
        ? parseFloat(value) 
        : value,
    }));
  };

  // 创建新配置
  const handleCreateConfig = () => {
    if (!newConfigName.trim()) return;
    
    const newConfig: ApiConfig = {
      id: uuidv4(),
      name: newConfigName.trim(),
      settings: {
        ...createEmptySettings(),
        customModels: [] // 确保新配置有一个空的自定义模型列表
      }
    };
    
    const updatedConfigs = [...configs, newConfig];
    onSaveConfigs(updatedConfigs);
    onSelectConfig(newConfig.id);
    
    // 加载新配置的设置
    setLocalSettings(newConfig.settings);
    
    setNewConfigName('');
    setShowNewConfig(false);
  };

  // 选择配置
  const handleSelectConfig = (configId: string) => {
    const config = configs.find(c => c.id === configId);
    if (config) {
      onSelectConfig(configId);
      setLocalSettings(config.settings);
    }
  };

  // 删除配置
  const handleDeleteConfig = (configId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('确定要删除此配置吗？')) {
      const updatedConfigs = configs.filter(config => config.id !== configId);
      onSaveConfigs(updatedConfigs);
      
      // 如果删除的是当前选中的配置，重置选中的配置
      if (selectedConfigId === configId) {
        onSelectConfig(null);
        setLocalSettings(createEmptySettings());
      }
    }
  };

  // 添加自定义模型
  const handleAddModel = () => {
    if (!newModelName.trim()) return;

    const modelName = newModelName.trim();
    const newModel: CustomModel = {
      id: uuidv4(),
      name: modelName,
      value: modelName
    };

    // 添加到当前设置的自定义模型列表中
    setLocalSettings(prev => ({
      ...prev,
      customModels: [...(prev.customModels || []), newModel],
      // 如果是第一个模型，自动设置为当前模型
      model: (!prev.customModels || prev.customModels.length === 0) && !prev.model 
        ? modelName 
        : prev.model
    }));

    setNewModelName('');
    setShowNewModel(false);
  };

  // 删除自定义模型
  const handleDeleteModel = (modelId: string) => {
    if (window.confirm('确定要删除此模型吗？')) {
      const deletedModel = localSettings.customModels.find(m => m.id === modelId);
      const remainingModels = localSettings.customModels.filter(m => m.id !== modelId);
      
      setLocalSettings(prev => {
        const updatedSettings = {
          ...prev,
          customModels: remainingModels
        };
        
        // 如果删除的是当前选中的模型，重置选择
        if (deletedModel && prev.model === deletedModel.value) {
          updatedSettings.model = remainingModels.length > 0 
            ? remainingModels[0].value 
            : '';
        }
        
        return updatedSettings;
      });
    }
  };

  return (
    <div 
      className={`fixed top-0 right-0 h-full w-96 bg-white shadow-lg transform transition-transform duration-300 ease-in-out z-50 ${
        isOpen ? 'translate-x-0' : 'translate-x-full'
      }`}
    >
      <div className="h-full p-6 overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-black">设置</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        {/* 配置管理 */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-md font-medium text-black">API配置</h3>
            <button
              type="button"
              onClick={() => setShowNewConfig(!showNewConfig)}
              className="text-blue-500 hover:text-blue-700 text-sm"
            >
              {showNewConfig ? '取消' : '新建配置'}
            </button>
          </div>

          {showNewConfig && (
            <div className="mb-4 p-3 border border-gray-200 rounded-md bg-gray-50">
              <input
                type="text"
                value={newConfigName}
                onChange={(e) => setNewConfigName(e.target.value)}
                placeholder="配置名称"
                className="w-full border border-gray-300 rounded-md py-2 px-3 mb-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
              />
              <button
                type="button"
                onClick={handleCreateConfig}
                disabled={!newConfigName.trim()}
                className={`w-full py-2 rounded-md ${
                  newConfigName.trim() 
                    ? 'bg-blue-500 text-white hover:bg-blue-600' 
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                创建
              </button>
            </div>
          )}

          {configs.length > 0 ? (
            <ul className="space-y-1 max-h-40 overflow-y-auto border border-gray-200 rounded-md p-2">
              {configs.map(config => (
                <li 
                  key={config.id}
                  onClick={() => handleSelectConfig(config.id)}
                  className={`flex justify-between items-center py-2 px-3 rounded-md cursor-pointer ${
                    selectedConfigId === config.id 
                      ? 'bg-blue-100' 
                      : 'hover:bg-gray-100'
                  }`}
                >
                  <span className="text-black font-medium">{config.name}</span>
                  <button
                    onClick={(e) => handleDeleteConfig(config.id, e)}
                    className="text-gray-500 hover:text-red-500"
                    title="删除配置"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="3 6 5 6 21 6"></polyline>
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                    </svg>
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-center py-3 text-gray-500 border border-gray-200 rounded-md">
              暂无保存的配置
            </div>
          )}
          
          {selectedConfigId ? (
            <div className="mt-2 text-sm text-blue-600">
              当前编辑：{configs.find(c => c.id === selectedConfigId)?.name}
            </div>
          ) : (
            <div className="mt-2 text-sm text-gray-500">
              请选择或创建一个配置
            </div>
          )}
        </div>

        {/* 设置表单 */}
        <form onSubmit={handleSave}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                API 网址
              </label>
              <input
                type="text"
                name="apiUrl"
                value={localSettings.apiUrl}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                placeholder="https://api.openai.com/v1/chat/completions"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                API Key
              </label>
              <input
                type="password"
                name="apiKey"
                value={localSettings.apiKey}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                placeholder="sk-..."
              />
            </div>

            {/* 模型选择与管理 */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-sm font-medium text-gray-700">
                  模型
                </label>
                <button
                  type="button"
                  onClick={() => setShowNewModel(!showNewModel)}
                  className="text-blue-500 hover:text-blue-700 text-sm"
                >
                  {showNewModel ? '取消' : '添加模型'}
                </button>
              </div>

              {showNewModel && (
                <div className="mb-3 p-3 border border-gray-200 rounded-md bg-gray-50">
                  <input
                    type="text"
                    value={newModelName}
                    onChange={(e) => setNewModelName(e.target.value)}
                    placeholder="输入模型名称"
                    className="w-full border border-gray-300 rounded-md py-2 px-3 mb-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                  />
                  <button
                    type="button"
                    onClick={handleAddModel}
                    disabled={!newModelName.trim()}
                    className={`w-full py-2 rounded-md ${
                      newModelName.trim()
                        ? 'bg-blue-500 text-white hover:bg-blue-600' 
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    添加
                  </button>
                </div>
              )}

              <select
                name="model"
                value={localSettings.model}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
              >
                {localSettings.customModels && localSettings.customModels.length > 0 ? (
                  localSettings.customModels.map(model => (
                    <option key={model.id} value={model.value}>{model.name}</option>
                  ))
                ) : (
                  <option value="" disabled>请添加模型</option>
                )}
              </select>

              {/* 自定义模型列表 */}
              {localSettings.customModels && localSettings.customModels.length > 0 && (
                <div className="mt-2">
                  <h4 className="text-xs font-medium text-gray-700 mb-1">模型列表</h4>
                  <ul className="max-h-32 overflow-y-auto border border-gray-200 rounded-md p-1">
                    {localSettings.customModels.map(model => (
                      <li key={model.id} className="flex justify-between items-center py-1 px-2 text-sm hover:bg-gray-50 rounded-md">
                        <span className="text-black font-medium">{model.name}</span>
                        <button
                          type="button"
                          onClick={() => handleDeleteModel(model.id)}
                          className="text-gray-500 hover:text-red-500"
                          title="删除模型"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="3 6 5 6 21 6"></polyline>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                          </svg>
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Temperature (0-2)
              </label>
              <div className="flex items-center">
                <input
                  type="range"
                  name="temperature"
                  min="0"
                  max="2"
                  step="0.1"
                  value={localSettings.temperature}
                  onChange={handleChange}
                  className="w-full"
                />
                <span className="ml-2 text-sm text-black">
                  {localSettings.temperature}
                </span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                最大Token数
              </label>
              <input
                type="number"
                name="maxTokens"
                value={localSettings.maxTokens}
                onChange={handleChange}
                min="100"
                max="32000"
                className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
              />
            </div>
          </div>

          <div className="mt-6 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="py-2 px-4 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              取消
            </button>
            <button
              type="submit"
              className="py-2 px-4 bg-blue-500 rounded-md text-white hover:bg-blue-600"
            >
              保存设置
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 