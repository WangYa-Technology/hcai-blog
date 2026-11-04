---
title: 用 GitHub Pages，发布你的第一篇 AI 笔记
description: 从 Markdown 到公开页面，理解这个博客的内容结构与发布方式。
category: tutorial
date: '2026-11-04'
tags:
  - GitHub Pages
  - Markdown
featured: false
draft: false
source: >-
  https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages
---
## 内容放在哪里
所有文章放在 content/posts 目录，每篇文章包含 YAML 元数据和 Markdown 正文。可以使用文本编辑器，也可以通过本项目的 MCP 工具维护。

## 本地预览
```sh
npm install
npm run dev
```

修改文章后重新构建。草稿不会出现在公开页面。

## 发布到 GitHub Pages
将项目推送到仓库 main 分支，在仓库 Settings → Pages 中选择 GitHub Actions。本项目包含构建与发布工作流。

## 文章链接
文章使用静态 HTML 路径，可直接打开和刷新。站点资源使用相对路径，适合部署在仓库子路径。
