let editor = null;
let editingId = null;

async function adminLogin() {
  const password = document.getElementById('admin-pw').value;
  const res = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ password }),
  });
  const data = await res.json();
  if (data.success) {
    document.getElementById('login-box').style.display = 'none';
    document.getElementById('editor-panel').style.display = 'block';
    await initEditor();
    await loadPostList();
  } else {
    document.getElementById('login-err').style.display = 'block';
  }
}

async function checkSession() {
  const res = await fetch('/api/auth/status', { credentials: 'include' });
  const data = await res.json();
  if (data.isAdmin) {
    document.getElementById('login-box').style.display = 'none';
    document.getElementById('editor-panel').style.display = 'block';
    await initEditor();
    await loadPostList();
  }
}

async function initEditor(data) {
  if (editor) {
    await editor.destroy();
    editor = null;
  }
  editor = new EditorJS({
    holder: 'editorjs',
    data: data || { blocks: [{ type: 'paragraph', data: { text: '' } }] },
    tools: {
      header: { class: Header, config: { levels: [2, 3], defaultLevel: 2 } },
      list: { class: List, inlineToolbar: true },
      paragraph: { class: Paragraph, inlineToolbar: true },
    },
  });
  await editor.isReady;
}

async function loadPostList() {
  const res = await fetch('/api/blog', { credentials: 'include' });
  const data = await res.json();
  const ul = document.getElementById('post-list');
  if (!data.posts?.length) {
    ul.innerHTML = '<li>No posts</li>';
    return;
  }
  ul.innerHTML = data.posts
    .map(
      (p) =>
        `<li style="margin:0.5rem 0;"><button type="button" onclick="editPost('${p._id}')">${p.title}</button> · ${p.published ? 'published' : 'draft'} · <button type="button" onclick="deletePost('${p._id}')">delete</button></li>`
    )
    .join('');
}

async function savePost() {
  const content = await editor.save();
  const body = {
    title: document.getElementById('post-title').value.trim(),
    slug: document.getElementById('post-slug').value.trim(),
    excerpt: document.getElementById('post-excerpt').value.trim(),
    year: Number(document.getElementById('post-year').value),
    published: document.getElementById('post-published').checked,
    content,
  };
  const url = editingId ? `/api/blog/${editingId}` : '/api/blog';
  const method = editingId ? 'PUT' : 'POST';
  const res = await fetch(url, {
    method,
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(body),
  });
  const data = await res.json();
  document.getElementById('save-msg').textContent = data.success
    ? 'Saved.'
    : data.message || 'Save failed';
  if (data.success && !editingId && data.post?._id) editingId = data.post._id;
  await loadPostList();
}

async function editPost(id) {
  const res = await fetch('/api/blog', { credentials: 'include' });
  const data = await res.json();
  const post = data.posts.find((p) => p._id === id);
  if (!post) return;
  editingId = id;
  document.getElementById('post-title').value = post.title;
  document.getElementById('post-slug').value = post.slug;
  document.getElementById('post-excerpt').value = post.excerpt || '';
  document.getElementById('post-year').value = post.year;
  document.getElementById('post-published').checked = post.published;
  await initEditor(post.content);
}

async function deletePost(id) {
  if (!confirm('Delete this post?')) return;
  await fetch(`/api/blog/${id}`, { method: 'DELETE', credentials: 'include' });
  if (editingId === id) newPost();
  await loadPostList();
}

function newPost() {
  editingId = null;
  document.getElementById('post-title').value = '';
  document.getElementById('post-slug').value = '';
  document.getElementById('post-excerpt').value = '';
  document.getElementById('post-published').checked = true;
  initEditor();
}

document.addEventListener('DOMContentLoaded', checkSession);
