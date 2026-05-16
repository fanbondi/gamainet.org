# Claude Code prompts — demo (short)

We are building a **Next.js** and **Tailwind** site for **AI-GAMNET** with the look and structure of a typical modern AI organisation site. We are inspired by common patterns only, and we are not copying any real website. **Editor.js** will save page content as JSON in **MongoDB**, and a **join form** will save new members in the same database.

Paste **one** prompt block at a time into Claude. If you run short on time, ship only these three things in order: a database health check, the join flow, and one editable page that appears on the public site.

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

## 2 — Build

### 2.1 — Dependencies

```text
Please add the packages this Next.js project needs to connect to MongoDB, to validate form payloads on the server with Zod, and to run Editor.js only in the admin user interface. Choose one MongoDB approach and explain in one sentence why you chose it. Add a file named .env.local.example that lists every environment variable we need, including the database connection string and any demo admin secret. Do not put real secrets in the repository. Add a short note in README or SETUP that explains how to run MongoDB on a laptop for local practice, for example with a one-line Docker command. Please keep the change set as small as possible beyond these tasks.
```

### 2.2 — Database connection and health check

```text
Please add a MongoDB connection helper that follows common practice for Next.js, including reusing a single connection in development where appropriate. Add a small API route that returns JSON indicating whether the database connection is healthy. If the connection string is missing, the app should fail in a clear way without taking down unrelated pages. Please ensure that database code is not bundled into code that runs in the visitor’s browser.
```

### 2.3 — Members API

```text
Please add a server endpoint that accepts POST requests to register a new member. The body should include the person’s name and email, and you may include a few optional fields if they help the organisation. Validate the body on the server. If validation fails, return errors the UI can show. If the email is already registered, return a friendly message instead of a raw server error. Store when the person signed up. Do not add a public endpoint that lists everyone’s personal details unless it is strictly protected for admins only. Please add a copy-paste example in a comment or in the README that shows how to test the endpoint with curl or a similar tool.
```

### 2.4 — Join page

```text
Please add a public page at /join with a form that posts to the member registration endpoint. The page should show a clear loading state while the request runs, show validation or server errors if something fails, and show a success message when registration completes. Please add links to this page from the header and the footer.
```

### 2.5 — Visual design and navigation

```text
Please update the global styles and Tailwind configuration so the site feels modern, calm, and trustworthy, with readable typography and sensible spacing. Please update the header and footer so the navigation matches the routes we planned. Reuse existing section components where you can instead of rewriting everything. Please make sure the layout works well on a phone, including a sensible mobile menu or stacked navigation.
```

### 2.6 — Marketing pages

```text
Please add dedicated routes for About, Programs, and optionally Community. Pull the main text from the existing files under the data folder instead of duplicating long paragraphs. Use a shared layout so these pages feel consistent. Please wire internal links so visitors do not hit missing pages.
```

### 2.7 — CMS API

```text
Please add a MongoDB collection for editable pages. Each document should store a slug, a title, the Editor.js JSON, a last-updated time, and whether the page is published. The public should be able to read a page by slug only when it is published. Saving or updating a page should require a shared secret sent in a request header, read from an environment variable, and you must document that this approach is for demos only and is not suitable for production. Please validate slugs, reject unreasonably large payloads, and return a not-found response for missing or unpublished pages without leaking internal details.
```

### 2.8 — Admin editor

```text
Please add an admin route where we can choose a page slug, see the Editor.js editor, load existing content if it exists, and save through the protected API. If the data model includes a published flag, please include a toggle. The editor must run only in a client component, not inside server-only modules. If it is quick to add, please include a simple admin index that lists existing page slugs.
```

### 2.9 — Public page rendering

```text
Please add a public route that loads one saved page by its slug and renders it read-only for visitors. Support at least paragraph, header, list, and link blocks from Editor.js. Treat text safely when rendering so we do not introduce script injection from edited content. If a page is not published, the public route should behave as if the page does not exist.
```

### 2.10 — Polish

```text
Please set sensible page titles and descriptions for the routes we added. Add basic Open Graph metadata where Next.js makes that straightforward. Please show an in-progress state on the join form and on the admin save action so people do not double-submit by mistake. Please run through until npm run build completes successfully.
```

---

## 3 — Wrap (optional, one prompt)

```text
Please review what we built from a security and performance angle. Answer in short bullet points only. List the main security concerns for our database routes, the demo admin secret, how we render edited content, and the join form. For each concern, say whether it is acceptable for a tutorial or must change before a public launch. Then list the top three performance wins, ranked. Do not write code unless a critical issue can be fixed in a single obvious line; otherwise stay at the advice level.
```
