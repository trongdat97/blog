# Blog Cá Nhân

Blog cá nhân xây dựng bằng [Astro 7](https://astro.build), TailwindCSS v4, MDX và React.

## Yêu cầu

- Node.js v22+
- npm v11+

## Bắt đầu

```bash
npm install
npm run dev
```

Mở trình duyệt tại `http://localhost:4321`.

## Thêm bài viết mới

Tạo file `.mdx` mới trong `src/content/blog/`, ví dụ `src/content/blog/ten-bai-viet.mdx`:

```mdx
---
title: "Tiêu đề bài viết"
description: "Mô tả ngắn gọn."
pubDate: "2026-07-01"
tags: ["kubernetes", "devops"]
draft: false
---

Nội dung bài viết ở đây...
```

> Đặt `draft: true` để ẩn bài viết khỏi listing và RSS feed.

## Build

```bash
npm run build
```

Output tĩnh xuất ra thư mục `dist/` — sẵn sàng deploy lên Cloudflare Pages.

**Cài đặt Cloudflare Pages:**
- Build command: `npm run build`
- Build output directory: `dist`
- Node.js version: `22`
