function renderBlock(block) {
  const d = block.data || {};
  if (block.type === 'header') {
    const level = d.level || 2;
    const tag = level === 3 ? 'h3' : 'h2';
    return `<${tag}>${d.text || ''}</${tag}>`;
  }
  if (block.type === 'list') {
    const tag = d.style === 'ordered' ? 'ol' : 'ul';
    const items = (d.items || []).map((i) => `<li>${i}</li>`).join('');
    return `<${tag}>${items}</${tag}>`;
  }
  if (block.type === 'paragraph') {
    return `<p>${d.text || ''}</p>`;
  }
  return '';
}

async function loadPost() {
  const slug = new URLSearchParams(location.search).get('slug');
  const root = document.getElementById('post-root');
  if (!slug || !root) {
    root.innerHTML = '<p>Post not found.</p>';
    return;
  }
  try {
    const res = await fetch(`/api/blog/${encodeURIComponent(slug)}`);
    const data = await res.json();
    if (!data.success || !data.post) {
      root.innerHTML = '<p>Post not found.</p>';
      return;
    }
    const p = data.post;
    document.title = `${p.title} — AI-GAMNET`;
    const blocks = p.content?.blocks || [];
    root.innerHTML = `
      <p style="color:var(--primary);font-size:0.8rem;font-weight:700;text-transform:uppercase;">${p.year}</p>
      <h1 style="font-size:2rem;margin:0.5rem 0 1rem;">${p.title}</h1>
      ${p.excerpt ? `<p style="font-size:1.1rem;color:var(--gray-600);border-left:4px solid var(--primary);padding-left:1rem;">${p.excerpt}</p>` : ''}
      <div class="post-body" style="margin-top:2rem;">${blocks.map(renderBlock).join('')}</div>
    `;
  } catch {
    root.innerHTML = '<p>Could not load post.</p>';
  }
}

document.addEventListener('DOMContentLoaded', loadPost);
