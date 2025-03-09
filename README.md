# AI 聊天助手

一个简洁、美观的AI聊天Web应用，支持多种AI模型接入，类似ChatBox，但使用浅色主题设计。

## 功能特点

- 🎨 浅色主题UI设计
- 📱 响应式布局，支持各种设备
- 💬 支持多会话管理
- ⚙️ 可配置API接口、模型和参数
- 💾 自动保存聊天记录和设置

## 技术栈

- Next.js 15
- React 19
- TypeScript
- TailwindCSS 4

## 快速开始

### 安装依赖

```bash
# 使用npm
npm install

# 或使用yarn
yarn install

# 或使用pnpm
pnpm install
```

### 开发模式运行

```bash
npm run dev
```

然后在浏览器中打开 [http://localhost:3000](http://localhost:3000) 查看应用。

### 构建生产版本

```bash
npm run build
npm run start
```

## 配置指南

在应用的设置页面中，您可以配置以下参数：

- **API 网址**：AI服务提供商的API地址
- **API Key**：您的API密钥
- **模型**：要使用的AI模型
- **Temperature**：控制生成结果的随机性（0-2）
- **最大Token数**：限制生成结果的长度

## 自定义和扩展

您可以轻松地根据自己的需求修改和扩展此应用：

- 添加更多AI模型支持
- 自定义UI主题和样式
- 添加更多功能，如导出对话、语音输入等

## 贡献指南

欢迎贡献代码、报告问题或提出建议！请提交Pull Request或创建Issue。

## 许可证

MIT
