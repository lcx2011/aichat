import React, { useState } from 'react';

interface ErrorHelperProps {
  errorMessage: string;
}

export default function ErrorHelper({ errorMessage }: ErrorHelperProps) {
  const [showDetails, setShowDetails] = useState(false);

  // 解析错误类型
  const getErrorType = () => {
    const lowerCaseError = errorMessage.toLowerCase();
    
    if (lowerCaseError.includes('model does not exist') || lowerCaseError.includes('model not found')) {
      return 'MODEL_NOT_FOUND';
    }
    if (lowerCaseError.includes('api key') || lowerCaseError.includes('authentication')) {
      return 'AUTH_ERROR';
    }
    if (lowerCaseError.includes('rate limit') || lowerCaseError.includes('too many requests')) {
      return 'RATE_LIMIT';
    }
    if (lowerCaseError.includes('timeout') || lowerCaseError.includes('timed out')) {
      return 'TIMEOUT';
    }
    if (lowerCaseError.includes('content filter') || lowerCaseError.includes('filtered')) {
      return 'CONTENT_FILTER';
    }
    return 'UNKNOWN';
  };

  // 根据错误类型获取帮助信息
  const getHelpMessage = () => {
    const errorType = getErrorType();
    
    switch (errorType) {
      case 'MODEL_NOT_FOUND':
        return {
          title: '模型不存在错误',
          solutions: [
            '确保您输入的模型名称与API提供商的模型名称完全一致',
            '不同API提供商的模型名称不可混用（例如，不能在百度API中使用OpenAI的模型名称）',
            '检查您的API密钥是否有权限访问该模型',
            '尝试创建一个与您的API提供商匹配的新模型名称'
          ]
        };
      case 'AUTH_ERROR':
        return {
          title: '身份验证错误',
          solutions: [
            '确保您的API密钥输入正确，没有多余的空格',
            '检查API密钥是否已过期或被撤销',
            '确认您的账户余额充足',
            '确保您使用了正确的API网址'
          ]
        };
      case 'RATE_LIMIT':
        return {
          title: '请求频率限制',
          solutions: [
            '减少请求频率',
            '等待几分钟后再试',
            '检查您的API使用限额',
            '考虑升级您的API套餐获取更高限额'
          ]
        };
      case 'TIMEOUT':
        return {
          title: '请求超时',
          solutions: [
            '检查您的网络连接',
            '减少请求的max_tokens参数',
            '稍后再试',
            '尝试使用不同的模型'
          ]
        };
      case 'CONTENT_FILTER':
        return {
          title: '内容过滤',
          solutions: [
            '您的请求可能包含敏感内容被AI提供商过滤',
            '修改您的输入内容再次尝试',
            '如果您认为这是误判，请联系API提供商'
          ]
        };
      default:
        return {
          title: '未知错误',
          solutions: [
            '检查API网址是否正确',
            '确认您的请求格式与API提供商的要求一致',
            '查看浏览器控制台获取更多错误详情',
            '尝试刷新页面或重启应用'
          ]
        };
    }
  };

  const help = getHelpMessage();

  return (
    <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
      <div className="flex items-start">
        <svg className="w-5 h-5 text-red-500 mt-0.5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
        <div className="flex-1">
          <h3 className="text-md font-medium text-red-800">{help.title}</h3>
          <p className="text-sm text-red-700 mt-1">{errorMessage}</p>
          
          <button 
            className="text-sm text-blue-600 hover:text-blue-800 mt-2"
            onClick={() => setShowDetails(!showDetails)}
          >
            {showDetails ? '隐藏帮助' : '显示帮助'}
          </button>
          
          {showDetails && (
            <div className="mt-3">
              <h4 className="text-sm font-medium text-red-800">可能的解决方案:</h4>
              <ul className="mt-1 pl-5 list-disc text-sm text-red-700 space-y-1">
                {help.solutions.map((solution, index) => (
                  <li key={index}>{solution}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 