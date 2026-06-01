async function loadBlogList() {
  const el = document.getElementById('blog-list');
  if (!el) return;
  try {
    const res = await fetch('/api/blog');
    const data = await res.json();
    if (!data.success || !data.posts?.length) {
      el.innerHTML = '<p>No posts yet. Check back soon.</p>';
      return;
    }
    const byYear = {};
    data.posts.forEach((p) => {
      byYear[p.year] = byYear[p.year] || [];
      byYear[p.year].push(p);
    });
    const years = Object.keys(byYear).sort((a, b) => Number(b) - Number(a));
    el.innerHTML = years
      .map(
        (year) => `
      <h2 style="margin:2rem 0 1rem;font-size:0.85rem;text-transform:uppercase;letter-spacing:0.15em;color:var(--primary);">${year}</h2>
      ${byYear[year]
        .map(
          (p) => `
        <a href="/blog-post.html?slug=${encodeURIComponent(p.slug)}">
          <strong>${escapeHtml(p.title)}</strong>
          ${p.excerpt ? `<p style="margin-top:0.35rem;color:var(--gray-600);font-size:0.9rem;">${escapeHtml(p.excerpt)}</p>` : ''}
        </a>`
        )
        .join('')}`
      )
      .join('');
  } catch {
    el.innerHTML = '<p>Could not load posts.</p>';
  }
}

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

document.addEventListener('DOMContentLoaded', loadBlogList);
