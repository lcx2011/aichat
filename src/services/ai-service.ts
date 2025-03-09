import { Settings, Message } from '../types';

// 将应用的消息格式转换为API请求格式
function formatMessages(messages: Message[]) {
  return messages.map(msg => ({
    role: msg.role,
    content: msg.content
  }));
}

// 发送请求到AI API
export async function sendMessageToAI(
  content: string,
  previousMessages: Message[],
  settings: Settings
) {
  if (!settings.apiUrl || !settings.apiKey || !settings.model) {
    throw new Error('API配置不完整，请在设置中配置API网址、API Key和模型');
  }

  try {
    // 准备请求参数
    const formattedMessages = formatMessages(previousMessages);
    
    // 添加用户最新消息
    formattedMessages.push({
      role: 'user',
      content: content
    });

    // 准备请求头
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    };

    // 添加不同API可能使用的不同授权方式
    if (settings.apiUrl.includes('openai.com')) {
      headers['Authorization'] = `Bearer ${settings.apiKey}`;
    } else if (settings.apiUrl.includes('anthropic.com')) {
      headers['x-api-key'] = settings.apiKey;
      headers['anthropic-version'] = '2023-06-01';
    } else {
      // 对于其他API，使用标准Bearer方式
      headers['Authorization'] = `Bearer ${settings.apiKey}`;
    }

    // 根据不同的API提供商准备不同的请求体格式
    let requestBody: any = {};

    // OpenAI 格式
    if (settings.apiUrl.includes('openai.com')) {
      requestBody = {
        model: settings.model,
        messages: formattedMessages,
        temperature: settings.temperature,
        max_tokens: settings.maxTokens
      };
    } 
    // Claude/Anthropic 格式
    else if (settings.apiUrl.includes('anthropic.com')) {
      requestBody = {
        model: settings.model,
        messages: formattedMessages,
        temperature: settings.temperature,
        max_tokens: settings.maxTokens
      };
    }
    // 国内模型通常使用这种格式 (如智谱、百度文心、通义千问等)
    else if (settings.apiUrl.includes('zhipu') || 
             settings.apiUrl.includes('baidu') || 
             settings.apiUrl.includes('qwen')) {
      requestBody = {
        model: settings.model,
        messages: formattedMessages,
        temperature: settings.temperature,
        max_tokens: settings.maxTokens
      };
      
      // 一些API可能需要在messages以外使用input字段
      if (settings.apiUrl.includes('baidu') || settings.apiUrl.includes('qwen')) {
        requestBody.input = {
          messages: formattedMessages
        };
        delete requestBody.messages;
      }
    } 
    // 默认格式（通用）
    else {
      requestBody = {
        model: settings.model,
        messages: formattedMessages,
        temperature: settings.temperature,
        max_tokens: settings.maxTokens
      };
    }

    console.log('发送请求到API:', settings.apiUrl);
    console.log('请求体:', JSON.stringify(requestBody, null, 2));

    // 发送请求
    const response = await fetch(settings.apiUrl, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(requestBody)
    });

    // 处理响应
    if (!response.ok) {
      const errorText = await response.text();
      let errorData;

      try {
        errorData = JSON.parse(errorText);
      } catch (e) {
        errorData = { message: errorText };
      }

      throw new Error(
        `API请求失败: ${response.status} ${response.statusText}${
          errorData ? ' - ' + JSON.stringify(errorData) : ''
        }`
      );
    }

    const data = await response.json();
    
    console.log('API响应:', JSON.stringify(data, null, 2));
    
    // 处理不同API可能的不同响应格式
    let assistantMessage = '';
    
    // OpenAI格式
    if (data.choices && data.choices[0] && data.choices[0].message) {
      assistantMessage = data.choices[0].message.content;
    } 
    // Claude格式
    else if (data.content) {
      assistantMessage = data.content;
    }
    // 国内模型常见格式
    else if (data.response) {
      assistantMessage = data.response;
    }
    else if (data.result) {
      assistantMessage = data.result;
    }
    else if (data.output && data.output.text) {
      assistantMessage = data.output.text;
    }
    // 百度文心格式
    else if (data.result && data.result.content) {
      assistantMessage = data.result.content;
    }
    // Claude新格式
    else if (data.content && data.content[0] && data.content[0].text) {
      assistantMessage = data.content[0].text;
    }
    // 通用兜底格式
    else if (data.text || data.output) {
      assistantMessage = data.text || data.output;
    } 
    // 其他情况
    else {
      assistantMessage = '无法解析AI响应，请检查API设置或联系服务提供商。响应数据: ' + JSON.stringify(data);
      console.warn('未知的API响应格式:', data);
    }

    return assistantMessage;
  } catch (error) {
    console.error('发送消息到AI时出错:', error);
    throw error;
  }
} 