# CLAUDE.md

## Commands

```bash
npm run dev    # http://localhost:3000
npm start      # production
```

## Stack

Express + static HTML in `public/`, MongoDB, session admin auth, inline `editor.js` (SMATEQ-style), Editor.js CDN on `admin-blog.html`.

## Editing content

- Page copy: `data-key` on `.editable` elements, saved via `POST /api/content`
- Images: `data-img-key` / `data-bg-key`, upload via `/api/upload`
- Blog: `public/admin-blog.html` → `POST /api/blog`

## Env

`MONGODB_URI`, `ADMIN_PASSWORD` (or `SESSION_SECRET`), `PORT`
