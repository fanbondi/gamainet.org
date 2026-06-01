# Claude Code prompts — demo (short)

We are building a **Next.js** and **Tailwind** site for **AI-GAMNET** with the look and structure of a typical modern AI organisation site. We are inspired by common patterns only, and we are not copying any real website. **Editor.js** will save page content as JSON in **MongoDB**, and a **join form** will save new members in the same database.

**Order of work:** plan the work, **run the current app on your machine**, then run the build prompts, then optionally wrap up with a review, then **push to GitHub, update your server from that repo, and confirm https://gamainet.org**.

Paste **one** prompt block at a time into Claude. If you run short on time during the build, ship only these three things in order: a database health check, the join flow, and one editable page that appears on the public site.

The main places in this repo are **`app/page.tsx`**, **`app/layout.tsx`**, the **`components`** folder, and the **`data`** folder.

| Section idea | Route |
|--------------|--------|
| Home | `/` |
| About / programs / community | `/about`, `/programs`, `/community` |
| Join | `/join` |
| Editable page | `/p/[slug]` (example) |

---

## 1 — Plan (single prompt)

Use this step first. You should end up with a route map, a short read of what already exists, and a plain-language picture of members, editable pages, and admin, with **no** implementation yet.

```text
This step is planning only. Please do not write application code.

First, propose a simple navigation and page list for AI-GAMNET in the spirit of a modern AI organisation website. Keep this to structure and clarity only, and do not copy any real site. Present the result as a small table in which each row gives the path and what that page is for.

Second, briefly review app/page.tsx, app/layout.tsx, the components folder, and the data folder. Explain what you would mostly keep, what you would change, and what could move into the CMS later. Then recommend the shortest sensible path from the current project to a small multi-page site.

Third, in clear language that a non-developer could follow, describe how we would store members in MongoDB so that each email can only appear once, how we would store Editor.js output as JSON for each page address with a published flag, and how the public site differs from the admin area. For a live demo, you may assume a shared secret to protect saves, but you must say plainly that this is not good enough for a real public launch and you must name what you would use instead later. Finish this part with one sentence about where secrets should live, and one sentence about how to render edited content safely.

Fourth, list what we should deliberately leave out of the first version.
```

---

## 2 — Run the current app locally (before you build new features)

Do this **after** the plan and **before** section 3 so you know the project already runs on your laptop.

**Checklist (you run these in a terminal at the project root):**

1. Install dependencies with **`npm install`**.
2. Start the dev server with **`npm run dev`**.
3. Open **http://localhost:3000** in your browser and click through the home page.
4. Optional but useful: run **`npm run build`** and then **`npm run start`** once, to confirm a production-style build works before you add Mongo and new routes.

If any step fails, fix versions or errors before moving on to the build prompts.

**Optional prompt for Claude (if the README or SETUP is unclear):**

```text
Please read SETUP.md and README.md in this repository. In short numbered steps, tell a newcomer exactly how to run the site locally for development and how to run a production build locally. If anything is missing or wrong for this repo, suggest concrete edits to those files only, and keep the instructions minimal.
```

---

## 3 — Build

### 3.1 — Dependencies

```text
Please add the packages this Next.js project needs to connect to MongoDB, to validate form payloads on the server with Zod, and to run Editor.js only in the admin user interface. Choose one MongoDB approach and explain in one sentence why you chose it. Add a file named .env.local.example that lists every environment variable we need, including the database connection string and any demo admin secret. Do not put real secrets in the repository. Add a short note in README or SETUP that explains how to run MongoDB on a laptop for local practice, for example with a one-line Docker command. Please keep the change set as small as possible beyond these tasks.
```

### 3.2 — Database connection and health check

```text
Please add a MongoDB connection helper that follows common practice for Next.js, including reusing a single connection in development where appropriate. Add a small API route that returns JSON indicating whether the database connection is healthy. If the connection string is missing, the app should fail in a clear way without taking down unrelated pages. Please ensure that database code is not bundled into code that runs in the visitor’s browser.
```

### 3.3 — Members API

```text
Please add a server endpoint that accepts POST requests to register a new member. The body should include the person’s name and email, and you may include a few optional fields if they help the organisation. Validate the body on the server. If validation fails, return errors the UI can show. If the email is already registered, return a friendly message instead of a raw server error. Store when the person signed up. Do not add a public endpoint that lists everyone’s personal details unless it is strictly protected for admins only. Please add a copy-paste example in a comment or in the README that shows how to test the endpoint with curl or a similar tool.
```

### 3.4 — Join page

```text
Please add a public page at /join with a form that posts to the member registration endpoint. The page should show a clear loading state while the request runs, show validation or server errors if something fails, and show a success message when registration completes. Please add links to this page from the header and the footer.
```

### 3.5 — Visual design and navigation

```text
Please update the global styles and Tailwind configuration so the site feels modern, calm, and trustworthy, with readable typography and sensible spacing. Please update the header and footer so the navigation matches the routes we planned. Reuse existing section components where you can instead of rewriting everything. Please make sure the layout works well on a phone, including a sensible mobile menu or stacked navigation.
```

### 3.6 — Marketing pages

```text
Please add dedicated routes for About, Programs, and optionally Community. Pull the main text from the existing files under the data folder instead of duplicating long paragraphs. Use a shared layout so these pages feel consistent. Please wire internal links so visitors do not hit missing pages.
```

### 3.7 — CMS API

```text
Please add a MongoDB collection for editable pages. Each document should store a slug, a title, the Editor.js JSON, a last-updated time, and whether the page is published. The public should be able to read a page by slug only when it is published. Saving or updating a page should require a shared secret sent in a request header, read from an environment variable, and you must document that this approach is for demos only and is not suitable for production. Please validate slugs, reject unreasonably large payloads, and return a not-found response for missing or unpublished pages without leaking internal details.
```

### 3.8 — Admin editor

```text
Please add an admin route where we can choose a page slug, see the Editor.js editor, load existing content if it exists, and save through the protected API. If the data model includes a published flag, please include a toggle. The editor must run only in a client component, not inside server-only modules. If it is quick to add, please include a simple admin index that lists existing page slugs.
```

### 3.9 — Public page rendering

```text
Please add a public route that loads one saved page by its slug and renders it read-only for visitors. Support at least paragraph, header, list, and link blocks from Editor.js. Treat text safely when rendering so we do not introduce script injection from edited content. If a page is not published, the public route should behave as if the page does not exist.
```

### 3.10 — Polish

```text
Please set sensible page titles and descriptions for the routes we added. Add basic Open Graph metadata where Next.js makes that straightforward. Please show an in-progress state on the join form and on the admin save action so people do not double-submit by mistake. Please run through until npm run build completes successfully.
```

---

## 4 — Wrap (optional, one prompt)

```text
Please review what we built from a security and performance angle. Answer in short bullet points only. List the main security concerns for our database routes, the demo admin secret, how we render edited content, and the join form. For each concern, say whether it is acceptable for a tutorial or must change before a public launch. Then list the top three performance wins, ranked. Do not write code unless a critical issue can be fixed in a single obvious line; otherwise stay at the advice level.
```

---

## 5 — Deploy (GitHub → your server → verify gamainet.org)

The **source of truth** for code is **GitHub**. After you commit and **push** (from your machine, or from **Claude Code** when it has git access), you **log into your server**, **pull** the latest `main` (or whichever branch you deploy), then run the **post-pull steps** below, **restart** the app, and **open the live site** to confirm everything works.

**Typical flow in one line:** `git push` → SSH to server → `cd` into the app directory → `git pull` → **install dependencies and build** → **restart the app** → visit **https://gamainet.org** and sanity-check key pages.

### After every `git pull` on the server (usual order)

1. **Install JavaScript dependencies:** run **`npm ci`** if you want a clean install from the lockfile (common in production), or **`npm install`** if you do not use a lockfile the same way. Do this whenever `package.json` or `package-lock.json` changed.
2. **Build the Next.js app:** run **`npm run build`** so the server serves an up-to-date production build. Skip only if your deploy process builds elsewhere and copies artifacts (say so in your own runbook).
3. **Restart the running process** so Node picks up the new build (PM2 restart, `systemctl restart …`, Docker compose up rebuild, or whatever you use).
4. **Reload the reverse proxy** only if your team does that when the upstream app restarts (many setups do not need a separate Nginx reload).

### MongoDB on the server (first time and every deploy)

**`npm install` does not install or start MongoDB.** MongoDB is a **separate database service**. You (or your host) must have it **already installed and running** somewhere the app can reach—on the same machine, in Docker, or a managed service such as MongoDB Atlas.

- **First time you run the app:** if `MONGODB_URI` in your server’s environment (for example in `.env` or systemd/PM2 env) points at a live MongoDB instance, the app can usually **create databases and collections automatically** the **first time** your code writes data (for example the first member signup or first saved page). That depends on your code and credentials; some teams add an explicit “migrate” or “create indexes” step for **unique indexes** (such as unique email), which is safer for production.
- **If MongoDB is not running or the URI is wrong:** the app will fail when it tries to connect; fixing that is **outside** `npm install`—start the service, open the firewall, and check the connection string.
- **Secrets:** the database password and URI belong in **server environment variables**, not in GitHub.

### 5.1 — Checklist and commands (prompt for Claude)

```text
I host the live site at https://gamainet.org on my own server. The code lives in a GitHub repository, and I deploy by pushing to GitHub, then signing into the server with SSH, pulling the latest changes, and refreshing the running app so visitors see the update.

Please give me a concise, ordered checklist in plain English with example shell commands left generic where my paths or branch names may differ. Cover all of the following.

After git pull on the server: when to run npm ci versus npm install; when npm run build is required; restarting PM2, systemd, or Docker so the new build is served; optional Nginx reload only if relevant.

MongoDB explicitly: clarify that npm install does not install MongoDB; the database must be running separately and MONGODB_URI must be set on the server; explain that collections often appear on first write but that I should confirm indexes (especially unique email) match what we want in production; say what typically breaks on first deploy if Mongo was never set up.

Also cover: pushing from my laptop or from Claude Code to the right GitHub branch; SSH and cd to the repo; git pull and brief note on merge conflicts; where production environment variables live and that they must not be committed to GitHub; verifying https://gamainet.org after deploy (hard refresh, join form, CMS page if present).

Please call out anything specific to Next.js 14 App Router that I must not forget after a pull. If you need details you do not have, end with a short list of questions instead of guessing my server layout.
```

### 5.2 — Optional: one-page deploy notes in the repo

```text
Please add a short DEPLOY.md (or a section in README) that documents our team workflow: GitHub as source of truth, push then SSH pull, then npm ci (or npm install), npm run build, restart the app, verify at https://gamainet.org. Include a short subsection on MongoDB: it is not installed by npm; the server needs MONGODB_URI; first-run behaviour versus explicitly creating indexes. Use placeholders only for paths, hosts, and secrets—never real passwords or keys.
```

