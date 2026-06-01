# AI-GAMNET Website

Artificial Intelligence Gambia Network — a simple **Express + static HTML** site with an inline CMS.

- Public pages in `public/` (HTML, CSS, JS)
- **Inline editing** on any page — gear icon, log in, edit text/images, save to MongoDB
- **Blog** with an Editor.js (WYSIWYG) admin
- **Programs**: Meetups, IndabaX, and Webinars — each event has speakers, an agenda, and unified attendee registration
- APIs for members (join), contact, blog, events, and registrations

Contact: **info@gamainet.org**

## Quick start

```bash
cp .env.example .env.local
# Set MONGODB_URI and ADMIN_PASSWORD in .env.local

npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

> The server reads `.env.local` first, then `.env`. In development it will still start if MongoDB is unavailable (static pages work; the CMS/APIs need MongoDB).

## Logging in as admin

There is **one admin password** (`ADMIN_PASSWORD` in `.env.local`). It unlocks every admin feature below. Two ways to log in:

- **Inline edit** — click the ⚙️ gear icon (bottom-right of any public page) → enter the password.
- **Admin pages** — open `/admin-blog.html` or `/admin-events.html` and log in there.

---

## How admins add / edit content

### 1. Edit page text & images (inline)

1. Click the ⚙️ gear icon on any page and log in.
2. Highlighted text becomes editable — click and type.
3. Hover an image and click **📷 Change Image** to upload/replace it.
4. Click **Save** in the top toolbar. Changes are stored in MongoDB and shown to all visitors.

Editable text uses `data-key`, images use `data-img-key`, and background images use `data-bg-key` in the HTML.

### 2. Add a blog post — `/admin-blog.html`

Yes, the blog is fully implemented.

1. Go to [`/admin-blog.html`](http://localhost:3000/admin-blog.html) and log in.
2. Fill in **Title**, **Slug** (auto from title if blank), **Excerpt**, and **Year**.
3. Write the post in the **Editor.js** WYSIWYG (headings, paragraphs, lists).
4. Tick **Published** to make it public, then **Save post**.
5. Posts appear on [`/blog.html`](http://localhost:3000/blog.html); click one to read it at `/blog-post.html?slug=...`.

Use the post list at the bottom to **edit** or **delete** existing posts.

### 3. Add an event (Meetup / IndabaX / Webinar) — `/admin-events.html`

1. Go to [`/admin-events.html`](http://localhost:3000/admin-events.html) and log in.
2. Click **+ New event** and choose the **Type** (Meetup, IndabaX, or Webinar).
3. Fill in title, theme, summary, dates, time, location/venue, and upload a **cover image**.
4. Write the full description in the WYSIWYG editor.
5. **Speakers** — click *+ Add speaker* for each (name, role, org, topic, bio, photo).
6. **Agenda** — click *+ Add day*, then *+ Add session* (time / activity / speaker). Add a day per conference day for multi-day IndabaX.
7. Toggle **Published** (visible on site) and **Registration open**.
8. **Save event.**

Events show up automatically on the matching page:

- IndabaX → [`/indabax.html`](http://localhost:3000/indabax.html)
- Meetups → [`/meetups.html`](http://localhost:3000/meetups.html)
- Webinars → [`/webinars.html`](http://localhost:3000/webinars.html)

Each event has a public detail page at `/event.html?slug=...` with a built-in **registration form**.

### 4. View / export registrations

Open an event in `/admin-events.html` — the **Registrations** card lists everyone who signed up and has an **Export CSV** button.

---

## Seeding example IndabaX editions

```bash
npm run seed:events
```

Creates the 2023, 2024, and 2025 IndabaX Gambia editions (idempotent — safe to re-run).

## Structure

```
server.js              # Express app + route wiring
public/                # Static site, style.css, editor.js (inline CMS), chrome.js (nav/footer)
  admin-blog.html/.js  # Blog WYSIWYG admin
  admin-events.html/.js# Events WYSIWYG admin (speakers, agenda, registrations)
  event.html/.js       # Public event detail + registration
src/routes/            # auth, content, upload, members, blog, events, registrations
src/models/            # Content, Member, BlogPost, Contact, Upload, ProgramEvent, Registration
src/utils/seed-events.js
```

## Environment

| Var | Purpose |
|-----|---------|
| `MONGODB_URI` | MongoDB connection string |
| `ADMIN_PASSWORD` | Admin login password (unlocks all admin features) |
| `SESSION_SECRET` | Secret for session cookies |
| `PORT` | Server port (default 3000) |

## Scripts

- `npm run dev` — dev server with auto-reload (`node --watch`)
- `npm start` — production
- `npm run seed:events` — seed example IndabaX editions
