/**
 * UDP WYSIWYG INLINE EDITOR — API-backed version
 * Content is saved to MongoDB via the Express backend.
 * Admin session is maintained server-side.
 * Image uploads go to /api/upload and are served from /uploads/
 */

const API_BASE = window.location.origin;

// ── Load content from MongoDB on page load ─────────────────────
window.addEventListener('DOMContentLoaded', async () => {
  ensureMediaKeys();
  await loadContent();
  initScrollSpy();
  checkAdminSession();
});

async function loadContent() {
  try {
    const res = await fetch(`${API_BASE}/api/content`);
    if (!res.ok) return;
    const { content } = await res.json();
    if (!content) return;
    document.querySelectorAll('[data-key]').forEach(el => {
      const key = el.dataset.key;
      if (content[key] !== undefined) {
        el.innerHTML = content[key];
      }
    });
    document.querySelectorAll('img[data-img-key]').forEach(el => {
      const key = el.dataset.imgKey;
      if (content[key]) {
        el.src = content[key];
      }
    });
    document.querySelectorAll('[data-bg-key]').forEach(el => {
      const key = el.dataset.bgKey;
      if (content[key]) {
        el.style.backgroundImage = `url('${content[key]}')`;
      }
    });
  } catch (e) {
    console.warn('UDP Editor: could not load content from API', e);
  }
}

// Check if already logged in (session persists on reload)
async function checkAdminSession() {
  try {
    const res = await fetch(`${API_BASE}/api/auth/status`);
    const { isAdmin } = await res.json();
    if (isAdmin) {
      activateEditor(false); // activate silently (no toast)
    }
  } catch (e) { /* server may not be running */ }
}

// ── Save content to MongoDB ─────────────────────────────────────
async function saveContent() {
  const content = {};
  document.querySelectorAll('[data-key]').forEach(el => {
    content[el.dataset.key] = el.innerHTML;
  });

  // Also collect image src values
  document.querySelectorAll('img[data-img-key]').forEach(el => {
    content[el.dataset.imgKey] = el.src;
  });
  // And background image sections
  document.querySelectorAll('[data-bg-key]').forEach(el => {
    const raw = el.style.backgroundImage;
    if (raw) content[el.dataset.bgKey] = raw.replace(/url\(["']?/, '').replace(/["']?\)$/, '');
  });

  try {
    const res = await fetch(`${API_BASE}/api/content`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ content })
    });
    const data = await res.json();
    if (data.success) {
      showToast('✅ Changes saved to database!');
    } else {
      showToast('❌ Save failed: ' + data.message, true);
    }
  } catch (e) {
    showToast('❌ Could not reach server. Is it running?', true);
  }
}

// ── Login ───────────────────────────────────────────────────────
function enterEditMode() {
  document.getElementById('login-modal').style.display = 'flex';
  setTimeout(() => {
    const pwInput = document.getElementById('admin-password');
    if (pwInput) pwInput.focus();
  }, 100);
}

async function checkLogin() {
  const password = document.getElementById('admin-password').value;
  const errEl = document.getElementById('login-error');
  if (!password) return;

  try {
    const res = await fetch(`${API_BASE}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ password })
    });
    const data = await res.json();

    if (data.success) {
      document.getElementById('login-modal').style.display = 'none';
      document.getElementById('admin-password').value = '';
      if (errEl) errEl.style.display = 'none';
      activateEditor(true);
    } else {
      if (errEl) errEl.style.display = 'block';
      document.getElementById('admin-password').value = '';
      document.getElementById('admin-password').focus();
    }
  } catch (e) {
    if (errEl) { errEl.textContent = 'Could not reach server.'; errEl.style.display = 'block'; }
  }
}

// ── Activate Edit Mode ──────────────────────────────────────────
function activateEditor(showHint = true) {
  document.body.classList.add('edit-mode');
  document.getElementById('editor-toolbar').style.display = 'block';
  document.getElementById('admin-trigger').style.display = 'none';

  // Make text fields editable
  document.querySelectorAll('.editable').forEach(el => {
    el.contentEditable = 'true';
    el.setAttribute('spellcheck', 'true');
  });

  // Make images clickable to change
  addImageOverlays();

  if (showHint) showToast('✏️ Edit mode active — click highlighted text or images to edit');
}

// ── Exit Edit Mode ──────────────────────────────────────────────
async function exitEditMode() {
  // Logout from server
  try {
    await fetch(`${API_BASE}/api/auth/logout`, { method: 'POST', credentials: 'include' });
  } catch (e) { /* ignore */ }

  document.body.classList.remove('edit-mode');
  document.getElementById('editor-toolbar').style.display = 'none';
  document.getElementById('admin-trigger').style.display = 'flex';

  document.querySelectorAll('.editable').forEach(el => {
    el.contentEditable = 'false';
  });

  removeImageOverlays();
  closeImageLibrary();
}

// ── Image Overlays ──────────────────────────────────────────────
function addImageOverlays() {
  document.querySelectorAll('img[data-img-key], [data-bg-key]').forEach(el => {
    if (el.querySelector('.img-edit-btn')) return; // already added
    const btn = document.createElement('button');
    btn.className = 'img-edit-btn';
    btn.innerHTML = '📷 Change Image';
    btn.onclick = (e) => { e.stopPropagation(); openImagePicker(el); };

    // Make sure parent has position:relative
    const parent = el.closest('.news-card, .hero, .leader-card, .news-img-placeholder') || el.parentElement;
    parent.style.position = 'relative';
    parent.appendChild(btn);
    el._imgOverlayParent = parent;
    el._imgOverlayBtn = btn;
  });
}

function ensureMediaKeys() {
  const pageKey = window.location.pathname.replace(/[^a-z0-9]/gi, '-').replace(/^-+|-+$/g, '') || 'home';

  // Ensure every image can be edited/uploaded.
  document.querySelectorAll('img').forEach((img, index) => {
    if (!img.dataset.imgKey) {
      img.dataset.imgKey = `img-${pageKey}-${index + 1}`;
    }
  });
}

function removeImageOverlays() {
  document.querySelectorAll('.img-edit-btn').forEach(btn => btn.remove());
}

// ── Image Picker ────────────────────────────────────────────────
let _currentImgTarget = null;

function openImagePicker(targetEl) {
  _currentImgTarget = targetEl;
  // Show library panel
  openImageLibrary();
}

// ── Image Library Panel ─────────────────────────────────────────
function openImageLibrary() {
  let panel = document.getElementById('img-library-panel');
  if (!panel) panel = createLibraryPanel();
  panel.style.display = 'flex';
  loadImageLibrary();
}

function closeImageLibrary() {
  const panel = document.getElementById('img-library-panel');
  if (panel) panel.style.display = 'none';
  _currentImgTarget = null;
}

function createLibraryPanel() {
  const panel = document.createElement('div');
  panel.id = 'img-library-panel';
  panel.innerHTML = `
    <div class="img-lib-inner">
      <div class="img-lib-header">
        <h3>🖼️ Image Library</h3>
        <button onclick="closeImageLibrary()">✕</button>
      </div>
      <div class="img-lib-upload">
        <label class="img-lib-upload-btn">
          📤 Upload New Image
          <input type="file" id="img-file-input" accept="image/*" style="display:none" onchange="uploadSelectedImage(this)" />
        </label>
        <p id="img-upload-status"></p>
      </div>
      <div class="img-lib-grid" id="img-lib-grid">
        <p style="color:#999; padding:1rem;">Loading images…</p>
      </div>
      ${_currentImgTarget ? '<p class="img-lib-hint">Click an image to apply it</p>' : ''}
    </div>
  `;
  panel.style.cssText = `
    position: fixed; inset: 0; z-index: 99999;
    background: rgba(26,60,94,0.85); backdrop-filter: blur(8px);
    display: flex; align-items: center; justify-content: center;
    padding: 2rem;
  `;
  document.body.appendChild(panel);
  return panel;
}

async function loadImageLibrary() {
  const grid = document.getElementById('img-lib-grid');
  if (!grid) return;

  try {
    const res = await fetch(`${API_BASE}/api/upload`, { credentials: 'include' });
    const data = await res.json();

    if (!data.success || !data.images.length) {
      grid.innerHTML = '<p style="color:#999; padding:1rem;">No images uploaded yet. Upload one above!</p>';
      return;
    }

    grid.innerHTML = data.images.map(img => `
      <div class="img-lib-item" onclick="applyImage('${img.url}', '${img._id}')">
        <img src="${img.url}" alt="${img.originalName}" />
        <span>${img.originalName}</span>
        <button class="img-lib-delete" onclick="deleteImage(event, '${img._id}')">🗑️</button>
      </div>
    `).join('');
  } catch (e) {
    grid.innerHTML = '<p style="color:#e53e3e;">Failed to load images.</p>';
  }
}

async function uploadSelectedImage(input) {
  const statusEl = document.getElementById('img-upload-status');
  if (!input.files || !input.files[0]) return;

  const file = input.files[0];
  if (file.size > 5 * 1024 * 1024) {
    if (statusEl) statusEl.textContent = '❌ File too large (max 5MB)';
    return;
  }

  if (statusEl) statusEl.textContent = '⏳ Uploading…';

  const formData = new FormData();
  formData.append('image', file);

  try {
    const res = await fetch(`${API_BASE}/api/upload`, {
      method: 'POST',
      credentials: 'include',
      body: formData
    });
    const data = await res.json();

    if (data.success) {
      if (statusEl) statusEl.textContent = '✅ Uploaded!';
      await loadImageLibrary(); // refresh grid
      if (_currentImgTarget) applyImage(data.url);
      setTimeout(() => { if (statusEl) statusEl.textContent = ''; }, 3000);
    } else {
      if (statusEl) statusEl.textContent = '❌ ' + (data.message || 'Upload failed');
    }
  } catch (e) {
    if (statusEl) statusEl.textContent = '❌ Upload error: ' + e.message;
  }

  input.value = '';
}

function applyImage(url) {
  if (!_currentImgTarget) return;

  const target = _currentImgTarget;

  if (target.tagName === 'IMG') {
    // Direct image element
    target.src = url;
  } else if (target.dataset.bgKey) {
    // Background image element (e.g. hero section)
    target.style.backgroundImage = `url('${url}')`;
  } else if (target.classList.contains('news-img-placeholder')) {
    // News card placeholder
    target.innerHTML = `<img src="${url}" alt="News image" style="width:100%;height:100%;object-fit:cover;" />`;
  }

  closeImageLibrary();
  showToast('✅ Image applied! Remember to save.');
}

async function deleteImage(e, id) {
  e.stopPropagation();
  if (!confirm('Delete this image?')) return;

  try {
    await fetch(`${API_BASE}/api/upload/${id}`, { method: 'DELETE', credentials: 'include' });
    await loadImageLibrary();
  } catch (e) {
    showToast('❌ Could not delete image', true);
  }
}

// ── Image Library Button (floating in edit mode) ────────────────
// Inject via CSS — .edit-toolbar images button

// ── Toast notifications ─────────────────────────────────────────
function showToast(msg, isError = false) {
  const existing = document.getElementById('udp-toast');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.id = 'udp-toast';
  toast.textContent = msg;
  toast.style.cssText = `
    position: fixed; bottom: 6rem; left: 50%;
    transform: translateX(-50%);
    background: ${isError ? '#EF4444' : '#1a3c5e'};
    color: ${isError ? '#fff' : '#d4a017'};
    font-family: 'Inter', sans-serif; font-weight: 700; font-size: 0.9rem;
    padding: 0.85rem 2rem; border-radius: 50px;
    box-shadow: 0 8px 32px rgba(0,0,0,0.35);
    z-index: 99999; white-space: nowrap;
    animation: toastIn 0.3s ease both;
  `;
  const style = document.createElement('style');
  style.textContent = `@keyframes toastIn { from { opacity:0; transform:translateX(-50%) translateY(20px); } to { opacity:1; transform:translateX(-50%) translateY(0); } }`;
  document.head.appendChild(style);
  document.body.appendChild(toast);
  setTimeout(() => { toast.style.opacity='0'; toast.style.transition='opacity 0.4s'; setTimeout(()=>toast.remove(),400); }, 3500);
}

// ── Image Library Styles (injected once) ───────────────────────
(function injectLibraryStyles() {
  if (document.getElementById('udp-editor-styles')) return;
  const style = document.createElement('style');
  style.id = 'udp-editor-styles';
  style.textContent = `
    .img-lib-inner {
      background: #fff; border-radius: 20px; padding: 2rem;
      width: 100%; max-width: 860px; max-height: 85vh;
      display: flex; flex-direction: column; gap: 1.25rem;
      box-shadow: 0 24px 80px rgba(0,0,0,0.4);
    }
    .img-lib-header { display:flex; align-items:center; justify-content:space-between; }
    .img-lib-header h3 { font-family:'Inter',sans-serif; font-size:1.4rem; font-weight:900; color:#1a3c5e; }
    .img-lib-header button { background:#f2f4f8; border:none; border-radius:8px; padding:0.5rem 1rem; cursor:pointer; font-weight:700; font-size:1rem; }
    .img-lib-upload-btn {
      display:inline-flex; align-items:center; gap:0.5rem;
      background:#d4a017; color:#1a3c5e; font-family:'Inter',sans-serif;
      font-weight:800; font-size:0.9rem; padding:0.9rem 2rem;
      border-radius:8px; cursor:pointer; transition:all 0.2s;
    }
    .img-lib-upload-btn:hover { background:#a17910; }
    #img-upload-status { font-size:0.85rem; color:#5A6478; margin-top:0.5rem; }
    .img-lib-hint { text-align:center; color:#9AA3B2; font-size:0.85rem; }
    .img-lib-grid {
      display:grid; grid-template-columns:repeat(auto-fill, minmax(160px,1fr));
      gap:0.75rem; overflow-y:auto; flex:1; padding:0.25rem;
    }
    .img-lib-item {
      position:relative; border-radius:12px; overflow:hidden;
      border:2px solid #E8EBF0; cursor:pointer; transition:all 0.2s;
      background:#F2F4F8;
    }
    .img-lib-item:hover { border-color:#d4a017; transform:scale(1.03); box-shadow:0 4px 16px rgba(212,160,23,0.3); }
    .img-lib-item img { width:100%; height:120px; object-fit:cover; display:block; }
    .img-lib-item span { display:block; padding:0.4rem 0.5rem; font-size:0.7rem; color:#5A6478; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
    .img-lib-delete {
      position:absolute; top:4px; right:4px; background:rgba(229,62,62,0.9);
      border:none; border-radius:6px; padding:0.2rem 0.4rem; cursor:pointer;
      font-size:0.8rem; opacity:0; transition:opacity 0.2s;
    }
    .img-lib-item:hover .img-lib-delete { opacity:1; }
    .img-edit-btn {
      position:absolute; bottom:10px; left:50%; transform:translateX(-50%);
      background:rgba(26,60,94,0.9); color:#d4a017; border:none;
      padding:0.5rem 1rem; border-radius:20px; font-family:'Inter',sans-serif;
      font-weight:700; font-size:0.75rem; cursor:pointer; white-space:nowrap;
      z-index:50; transition:all 0.2s; opacity:0;
    }
    *:hover > .img-edit-btn { opacity:1; }
  `;
  document.head.appendChild(style);
})();

// ── Navbar scroll spy ──────────────────────────────────────────
function initScrollSpy() {
  const navbar = document.getElementById('navbar');
  if (!navbar) return;
  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 50);
  }, { passive: true });
}
