# renqing-app
人情账本应用 - 纯前端项目

## 项目简介
人情账本是一个帮助用户记录和管理人情往来的应用。通过该应用，用户可以方便地记录送礼和收礼事件，管理联系人信息，并查看相关的统计分析。

## 技术栈
- Vue 3 (Composition API)
- Pinia (状态管理)
- Vite (构建工具)
- IndexedDB (本地数据存储)
- CSS3 (样式)

## 项目结构
```
src/
├── assets/          # 静态资源文件
├── components/      # 可复用组件
├── views/           # 页面视图组件
├── router/          # 路由配置
├── stores/          # 状态管理
├── services/        # 数据服务
├── utils/           # 工具函数
├── App.vue         # 根组件
└── main.js         # 入口文件
```

## 功能特性
- 事件管理：记录送礼和收礼事件
- 联系人管理：维护联系人信息
- 数据分析：提供人情往来统计分析
- 提醒功能：重要事件提醒
- 响应式设计：适配移动端和桌面端

## 安装与运行
```bash
# 安装依赖
npm install

# 开发环境运行
npm run dev

# 构建生产版本
npm run build

# 预览生产版本
npm run serve
```

## 浏览器支持
- Chrome 60+
- Firefox 55+
- Safari 11+
- Edge 79+

## 许可证
MIT