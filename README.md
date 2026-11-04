# HCAI Blog

简约的 AI 实践博客，纯静态 HTML、CSS 与 JavaScript。新闻、教程、Skills、提示词四个分类；支持搜索、置顶精选、深浅色主题、移动端和减少动态效果偏好。文章正文由 Markdown 在构建时转换并清理 HTML。

## 本地运行

要求 Node.js 22+。

```sh
npm ci
npm run dev
```

打开终端显示的本地地址。修改 `public/` 或 `content/posts/` 后，重新运行 `npm run build`；Vite 会刷新生成页面。`npm test` 执行内容与真实 MCP 客户端集成测试。

## 发布到 GitHub Pages

1. 将本项目推送到自己的 GitHub 仓库，默认发布分支为 `main`。
2. 仓库 Settings → Pages → Build and deployment → Source 选择 **GitHub Actions**。
3. 推送触发 `.github/workflows/pages.yml`，构建后发布 `dist/`。
4. 在 Actions 中查看部署结果和站点地址。默认是 `https://<用户名>.github.io/<仓库名>/`。

资源和文章链接使用相对路径，兼容根域与仓库子路径；文章为独立 HTML，可直接访问和刷新。自定义域名可在 `public/CNAME` 中填写域名并配置 DNS。

本地 MCP 服务不运行在 GitHub Pages 上：Pages 只托管静态文件。

## 连接 MCP

在支持 stdio MCP 的 AI 客户端中添加以下配置，路径替换为你的绝对路径，必要时把 `node` 换成 Node 可执行文件绝对路径：

```json
{
  "mcpServers": {
    "hcai-blog": {
      "command": "node",
      "args": ["/Users/helong/Documents/ChatGPT/HCAI Blog/mcp/server.mjs"]
    }
  }
}
```

工具：

- `list_posts`：列出所有文章（含草稿）。
- `read_post`：读取元数据与 Markdown 正文。
- `save_post`：创建或完整替换文章，默认 `draft: true`；覆盖已有文章必须提供 `overwrite: true`。更新前先读取原文，提交完整字段。
- `build_site`：生成静态站点，不执行 Git 提交、推送或部署。

示例指令：“给 HCAI 博客写一篇提示词教程，先保存为草稿”；“读取并修改该草稿，确认来源后设为非草稿，构建预览”。正式更新网站时，将修改提交并推送至 main，Actions 会发布。也可由拥有仓库权限的 GitHub MCP 创建/更新 `content/posts/*.md`；请通过仓库的正常提交或 PR 流程发布。

## 文章格式

```markdown
---
title: 标题
description: 简短介绍
category: tutorial
date: '2026-11-04'
tags: [AI, 工作流]
featured: false
draft: true
---

## 正文

使用 Markdown 撰写。
```

`category` 可选 `news`、`tutorial`、`skills`、`prompts`。`source` 为可选的原始来源 URL。`featured` 用于首页精选（多篇标记时取日期最新的一篇）。文件名使用小写英文、数字与连字符。`draft: true` 不进入静态输出。示例文章已发布，新闻栏目中的 MCP 文章是背景资料整理，不声称是实时新闻。替换为自己的正式内容即可。

## 目录

- `content/posts/` 内容源文件
- `public/` 样式与浏览器交互
- `scripts/` 内容校验与静态构建
- `mcp/` MCP 服务
- `dist/` 构建结果（不提交）

参考：[GitHub Pages 自定义工作流](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages)、[MCP SDK v1](https://ts.sdk.modelcontextprotocol.io/server)。

## 五语静态网站与 MCP 翻译工作流

已移除浏览器端 Google 翻译。中文位于根路径，英语 `/en/`、俄语 `/ru/`、日语 `/ja/`、韩语 `/ko/` 各自包含完整首页、文章和关于页面。Header 的语言链接会打开同一篇文章的对应语言版本，无需访问在线翻译服务。页面带有 lang 和 hreflang 标记，界面、搜索提示与复制按钮均本地化。

**内容导入后的翻译由连接 MCP 的 AI 完成，不是 MCP 服务自身调用一个模型。** AI 客户端必须执行完整工具链：

1. 调用 `import_document` 导入本地 UTF-8 `.md` / `.txt` 正文，另行提供标题、摘要、分类等元数据；或使用 `save_post` 保存文章。Word/PDF 等格式先由 AI 客户端提取为 Markdown，再导入。
2. 调用 `read_translation_source` 获取完整原文与 `sourceHash`。
3. AI 完整翻译标题、摘要、标签和 Markdown 正文到 `en`、`ru`、`ja`、`ko`，保留结构、代码、链接、例子，不做摘要。
4. 调用 `save_translations` 一次保存四语版本及 `sourceHash`。
5. 调用 `build_site`。确认后通过 Git 提交/推送发布。

可使用 MCP prompt `translate_article`（参数 `slug`）驱动第 2–5 步。`translation_status` 列出待翻译文章。译文保存在 `content/translations/<slug>.json`，可以审阅和修正。原文的标题、摘要、标签或正文变化会使旧译文失效；构建遇到缺失或过期译文会中止，要求 AI 补齐后再发布。草稿可以在译文尚未完成时保存，不进入公开构建。

这不包含公开访客上传入口；“上传”指向 AI 客户端提供文档，由 AI 经 MCP 导入和翻译。站点运行时不保存任何模型密钥。
