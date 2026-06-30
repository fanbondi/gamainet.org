let editor = null;
let editingId = null;
let allEvents = [];
let currentFilter = 'all';

// ---------- Auth ----------
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
    showPanel();
  } else {
    document.getElementById('login-err').style.display = 'block';
  }
}

async function adminLogout() {
  await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
  location.reload();
}

async function checkSession() {
  const res = await fetch('/api/auth/status', { credentials: 'include' });
  const data = await res.json();
  if (data.isAdmin) showPanel();
}

async function showPanel() {
  document.getElementById('login-box').style.display = 'none';
  document.getElementById('panel').style.display = 'grid';
  document.getElementById('logout-btn').style.display = 'inline-block';
  await loadList();
  await newEvent();
}

// ---------- Editor.js ----------
function resetEditorHolder() {
  const current = document.getElementById('editorjs');
  if (!current) return;
  const fresh = document.createElement('div');
  fresh.id = 'editorjs';
  fresh.className = 'editor-holder';
  current.replaceWith(fresh);
}

function setEditorStatus(message, isError) {
  const el = document.getElementById('editor-status');
  if (!el) return;
  el.textContent = message || '';
  el.style.color = isError ? '#EF4444' : 'var(--gray-600)';
}

function getEditorTools() {
  const missing = [];
  if (!window.EditorJS) missing.push('EditorJS');
  if (!window.Header) missing.push('Header');
  if (!window.Paragraph) missing.push('Paragraph');
  const ListTool = window.List || window.EditorjsList;
  if (!ListTool) missing.push('List');
  if (!window.Quote) missing.push('Quote');
  if (missing.length) {
    throw new Error(`Editor tools failed to load (${missing.join(', ')}). Hard-refresh the page or disable ad blockers.`);
  }
  return {
    header: { class: window.Header, config: { levels: [2, 3], defaultLevel: 2 } },
    list: { class: ListTool, inlineToolbar: true },
    paragraph: { class: window.Paragraph, inlineToolbar: true },
    quote: { class: window.Quote, inlineToolbar: true },
  };
}

async function initEditor(data) {
  setEditorStatus('Loading editor…', false);
  if (editor) {
    try {
      await editor.destroy();
    } catch (e) {}
    editor = null;
  }
  resetEditorHolder();
  try {
    editor = new EditorJS({
      holder: 'editorjs',
      data: data || { blocks: [{ type: 'paragraph', data: { text: '' } }] },
      tools: getEditorTools(),
      placeholder: 'Write the full event description here…',
    });
    await editor.isReady;
    setEditorStatus('', false);
  } catch (err) {
    console.error('initEditor failed:', err);
    setEditorStatus(err.message || 'Editor failed to load.', true);
    editor = null;
  }
}

// ---------- Cover upload ----------
async function uploadCover(input) {
  if (!input.files || !input.files[0]) return;
  const fd = new FormData();
  fd.append('image', input.files[0]);
  const res = await fetch('/api/upload', { method: 'POST', credentials: 'include', body: fd });
  const data = await res.json();
  if (data.success) {
    document.getElementById('ev-cover').value = data.url;
    renderCoverPreview(data.url);
  } else {
    alert(data.message || 'Upload failed');
  }
}

function renderCoverPreview(url) {
  const el = document.getElementById('ev-cover-preview');
  el.innerHTML = url ? `<img src="${url}" alt="cover preview" />` : '';
}

async function uploadSpeakerPhoto(input, idx) {
  if (!input.files || !input.files[0]) return;
  const fd = new FormData();
  fd.append('image', input.files[0]);
  const res = await fetch('/api/upload', { method: 'POST', credentials: 'include', body: fd });
  const data = await res.json();
  if (data.success) {
    document.querySelector(`#sp-${idx} .sp-photo`).value = data.url;
    document.querySelector(`#sp-${idx} .sp-photo-preview`).innerHTML = `<img src="${data.url}" alt="" />`;
  } else {
    alert(data.message || 'Upload failed');
  }
}

// ---------- Speakers ----------
let speakerCounter = 0;
function addSpeaker(s = {}) {
  const idx = speakerCounter++;
  const wrap = document.createElement('div');
  wrap.className = 'repeat-row';
  wrap.id = `sp-${idx}`;
  wrap.innerHTML = `
    <div class="repeat-grid">
      <input class="sp-name" placeholder="Name" value="${esc(s.name)}" />
      <input class="sp-role" placeholder="Role / title" value="${esc(s.role)}" />
      <input class="sp-org" placeholder="Organisation" value="${esc(s.org)}" />
      <input class="sp-topic" placeholder="Talk / topic" value="${esc(s.topic)}" />
    </div>
    <textarea class="sp-bio" rows="2" placeholder="Short bio (optional)">${esc(s.bio)}</textarea>
    <div class="img-field">
      <input class="sp-photo" placeholder="Photo URL (optional)" value="${esc(s.photo)}" />
      <input type="file" accept="image/*" onchange="uploadSpeakerPhoto(this, ${idx})" />
      <button class="btn-remove" onclick="this.closest('.repeat-row').remove()">Remove</button>
    </div>
    <div class="sp-photo-preview img-preview">${s.photo ? `<img src="${esc(s.photo)}" alt="" />` : ''}</div>
  `;
  document.getElementById('speakers').appendChild(wrap);
}

function collectSpeakers() {
  return [...document.querySelectorAll('#speakers .repeat-row')]
    .map((row) => ({
      name: row.querySelector('.sp-name').value.trim(),
      role: row.querySelector('.sp-role').value.trim(),
      org: row.querySelector('.sp-org').value.trim(),
      topic: row.querySelector('.sp-topic').value.trim(),
      bio: row.querySelector('.sp-bio').value.trim(),
      photo: row.querySelector('.sp-photo').value.trim(),
    }))
    .filter((s) => s.name);
}

// ---------- Agenda ----------
let dayCounter = 0;
function addDay(d = {}) {
  const idx = dayCounter++;
  const wrap = document.createElement('div');
  wrap.className = 'agenda-day';
  wrap.id = `day-${idx}`;
  wrap.innerHTML = `
    <div class="repeat-grid">
      <input class="day-label" placeholder="Day label (e.g. Day 1)" value="${esc(d.label)}" />
      <input class="day-date" placeholder="Date (e.g. 11 Dec 2025)" value="${esc(d.date)}" />
      <button class="btn-remove" onclick="this.closest('.agenda-day').remove()">Remove day</button>
    </div>
    <div class="sessions"></div>
    <button class="btn-outline btn-sm" onclick="addSession(${idx})">+ Add session</button>
  `;
  document.getElementById('agenda').appendChild(wrap);
  (d.sessions || []).forEach((sess) => addSession(idx, sess));
}

function addSession(dayIdx, sess = {}) {
  const sessions = document.querySelector(`#day-${dayIdx} .sessions`);
  const row = document.createElement('div');
  row.className = 'session-row';
  row.innerHTML = `
    <input class="ss-time" placeholder="Time" value="${esc(sess.time)}" />
    <input class="ss-title" placeholder="Activity / session" value="${esc(sess.title)}" />
    <input class="ss-speaker" placeholder="Speaker (optional)" value="${esc(sess.speaker)}" />
    <button class="btn-remove" onclick="this.closest('.session-row').remove()">×</button>
  `;
  sessions.appendChild(row);
}

function collectAgenda() {
  return [...document.querySelectorAll('#agenda .agenda-day')]
    .map((day) => ({
      label: day.querySelector('.day-label').value.trim(),
      date: day.querySelector('.day-date').value.trim(),
      sessions: [...day.querySelectorAll('.session-row')]
        .map((s) => ({
          time: s.querySelector('.ss-time').value.trim(),
          title: s.querySelector('.ss-title').value.trim(),
          speaker: s.querySelector('.ss-speaker').value.trim(),
        }))
        .filter((s) => s.title || s.time),
    }))
    .filter((d) => d.label || d.sessions.length);
}

// ---------- List ----------
async function loadList() {
  const res = await fetch('/api/events', { credentials: 'include' });
  const data = await res.json();
  allEvents = data.events || [];
  renderList();
}

function filterList(type, btn) {
  currentFilter = type;
  document.querySelectorAll('.admin-filter .chip').forEach((c) => c.classList.remove('active'));
  btn.classList.add('active');
  renderList();
}

function renderList() {
  const ul = document.getElementById('event-list');
  const items = allEvents.filter((e) => currentFilter === 'all' || e.type === currentFilter);
  if (!items.length) {
    ul.innerHTML = '<li class="empty">No events yet.</li>';
    return;
  }
  ul.innerHTML = items
    .map(
      (e) => `
    <li class="${editingId === e._id ? 'active' : ''}">
      <button class="list-main" onclick="editEvent('${e._id}')">
        <span class="badge badge-${e.type}">${e.type}</span>
        <strong>${esc(e.title)}</strong>
        <small>${e.published ? 'published' : 'draft'}${e.year ? ' · ' + e.year : ''}</small>
      </button>
      <button class="list-del" title="Delete" onclick="deleteEvent('${e._id}')">🗑</button>
    </li>`
    )
    .join('');
}

// ---------- Form helpers ----------
function dateInput(d) {
  if (!d) return '';
  return new Date(d).toISOString().slice(0, 10);
}

async function newEvent() {
  editingId = null;
  document.getElementById('ev-type').value = 'meetup';
  document.getElementById('ev-year').value = new Date().getFullYear();
  ['ev-title', 'ev-slug', 'ev-theme', 'ev-summary', 'ev-start', 'ev-end', 'ev-time', 'ev-location', 'ev-venue', 'ev-cover', 'ev-extreg', 'ev-meeting'].forEach((id) => (document.getElementById(id).value = ''));
  document.getElementById('ev-regopen').checked = true;
  document.getElementById('ev-published').checked = false;
  document.getElementById('ev-featured').checked = false;
  document.getElementById('speakers').innerHTML = '';
  document.getElementById('agenda').innerHTML = '';
  renderCoverPreview('');
  document.getElementById('reg-card').style.display = 'none';
  document.getElementById('save-msg').textContent = '';
  await initEditor();
  renderList();
}

async function editEvent(id) {
  const e = allEvents.find((x) => x._id === id);
  if (!e) return;
  editingId = id;
  document.getElementById('ev-type').value = e.type;
  document.getElementById('ev-year').value = e.year || '';
  document.getElementById('ev-title').value = e.title || '';
  document.getElementById('ev-slug').value = e.slug || '';
  document.getElementById('ev-theme').value = e.theme || '';
  document.getElementById('ev-summary').value = e.summary || '';
  document.getElementById('ev-start').value = dateInput(e.startDate);
  document.getElementById('ev-end').value = dateInput(e.endDate);
  document.getElementById('ev-time').value = e.timeInfo || '';
  document.getElementById('ev-location').value = e.location || '';
  document.getElementById('ev-venue').value = e.venue || '';
  document.getElementById('ev-cover').value = e.coverImage || '';
  document.getElementById('ev-extreg').value = e.externalRegistrationUrl || '';
  document.getElementById('ev-meeting').value = e.meetingUrl || '';
  document.getElementById('ev-regopen').checked = e.registrationOpen !== false;
  document.getElementById('ev-published').checked = !!e.published;
  document.getElementById('ev-featured').checked = !!e.featured;
  renderCoverPreview(e.coverImage || '');

  document.getElementById('speakers').innerHTML = '';
  (e.speakers || []).forEach((s) => addSpeaker(s));
  document.getElementById('agenda').innerHTML = '';
  (e.agenda || []).forEach((d) => addDay(d));

  await initEditor(e.description || undefined);
  renderList();
  loadRegistrations(id);
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

async function saveEvent() {
  const msg = document.getElementById('save-msg');
  if (!editor) {
    msg.textContent = 'Editor still loading — wait a moment and try again.';
    msg.className = 'save-msg err';
    return;
  }

  let description;
  try {
    description = await editor.save();
  } catch (err) {
    console.error('Editor save failed:', err);
    msg.textContent = 'Could not save description. Wait for the editor to load, then try again.';
    msg.className = 'save-msg err';
    return;
  }

  const body = {
    type: document.getElementById('ev-type').value,
    year: document.getElementById('ev-year').value || undefined,
    title: document.getElementById('ev-title').value.trim(),
    slug: document.getElementById('ev-slug').value.trim(),
    theme: document.getElementById('ev-theme').value.trim(),
    summary: document.getElementById('ev-summary').value.trim(),
    startDate: document.getElementById('ev-start').value || undefined,
    endDate: document.getElementById('ev-end').value || undefined,
    timeInfo: document.getElementById('ev-time').value.trim(),
    location: document.getElementById('ev-location').value.trim(),
    venue: document.getElementById('ev-venue').value.trim(),
    coverImage: document.getElementById('ev-cover').value.trim(),
    externalRegistrationUrl: document.getElementById('ev-extreg').value.trim(),
    meetingUrl: document.getElementById('ev-meeting').value.trim(),
    registrationOpen: document.getElementById('ev-regopen').checked,
    published: document.getElementById('ev-published').checked,
    featured: document.getElementById('ev-featured').checked,
    speakers: collectSpeakers(),
    agenda: collectAgenda(),
    description,
  };

  if (!body.title) {
    msg.textContent = 'Title is required.';
    msg.className = 'save-msg err';
    return;
  }

  const url = editingId ? `/api/events/${editingId}` : '/api/events';
  const method = editingId ? 'PUT' : 'POST';
  try {
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (data.success) {
      msg.textContent = 'Saved.';
      msg.className = 'save-msg ok';
      if (!editingId && data.event?._id) editingId = data.event._id;
      await loadList();
      renderList();
      if (editingId) {
        document.getElementById('reg-card').style.display = 'block';
        loadRegistrations(editingId);
      }
    } else {
      msg.textContent = data.message || 'Save failed.';
      msg.className = 'save-msg err';
    }
  } catch (err) {
    console.error('Save event failed:', err);
    msg.textContent = 'Save failed — check your connection and try again.';
    msg.className = 'save-msg err';
  }
}

async function deleteEvent(id) {
  if (!confirm('Delete this event and all its registrations?')) return;
  await fetch(`/api/events/${id}`, { method: 'DELETE', credentials: 'include' });
  if (editingId === id) newEvent();
  await loadList();
  renderList();
}

// ---------- Registrations ----------
let currentRegs = [];
async function loadRegistrations(id) {
  const res = await fetch(`/api/events/${id}/registrations`, { credentials: 'include' });
  const data = await res.json();
  currentRegs = data.registrations || [];
  document.getElementById('reg-card').style.display = 'block';
  document.getElementById('reg-count').textContent = data.count || 0;
  const list = document.getElementById('reg-list');
  if (!currentRegs.length) {
    list.innerHTML = '<p class="empty">No registrations yet.</p>';
    return;
  }
  list.innerHTML = `
    <table class="reg-table">
      <thead><tr><th>Name</th><th>Email</th><th>Org</th><th>Role</th><th>When</th></tr></thead>
      <tbody>
        ${currentRegs
          .map(
            (r) => `<tr><td>${esc(r.name)}</td><td>${esc(r.email)}</td><td>${esc(r.organisation)}</td><td>${esc(r.role)}</td><td>${new Date(r.createdAt).toLocaleDateString()}</td></tr>`
          )
          .join('')}
      </tbody>
    </table>`;
}

function exportRegistrations() {
  if (!currentRegs.length) return;
  const header = ['Name', 'Email', 'Organisation', 'Role', 'Phone', 'Registered'];
  const rows = currentRegs.map((r) => [r.name, r.email, r.organisation, r.role, r.phone, new Date(r.createdAt).toISOString()]);
  const csv = [header, ...rows]
    .map((row) => row.map((c) => `"${String(c || '').replace(/"/g, '""')}"`).join(','))
    .join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'registrations.csv';
  a.click();
}

// ---------- util ----------
function esc(s) {
  return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

document.addEventListener('DOMContentLoaded', checkSession);
