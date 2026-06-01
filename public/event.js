let CURRENT_EVENT = null;

function esc(s) {
  return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function fmtDateRange(start, end) {
  if (!start) return '';
  const s = new Date(start);
  const opts = { day: 'numeric', month: 'long', year: 'numeric' };
  if (!end) return s.toLocaleDateString('en-GB', opts);
  const e = new Date(end);
  const sameMonth = s.getMonth() === e.getMonth() && s.getFullYear() === e.getFullYear();
  if (sameMonth) return `${s.getDate()}–${e.getDate()} ${e.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}`;
  return `${s.toLocaleDateString('en-GB', opts)} – ${e.toLocaleDateString('en-GB', opts)}`;
}

// Render Editor.js blocks to HTML
function renderBlocks(data) {
  if (!data || !data.blocks) return '';
  return data.blocks
    .map((b) => {
      switch (b.type) {
        case 'header':
          return `<h${b.data.level || 2}>${b.data.text}</h${b.data.level || 2}>`;
        case 'paragraph':
          return `<p>${b.data.text || ''}</p>`;
        case 'list': {
          const tag = b.data.style === 'ordered' ? 'ol' : 'ul';
          const items = (b.data.items || []).map((it) => `<li>${typeof it === 'string' ? it : it.content || ''}</li>`).join('');
          return `<${tag}>${items}</${tag}>`;
        }
        case 'quote':
          return `<blockquote>${b.data.text || ''}${b.data.caption ? `<cite>— ${b.data.caption}</cite>` : ''}</blockquote>`;
        default:
          return '';
      }
    })
    .join('');
}

function speakerCard(s) {
  const img = s.photo || '/images/home/african-researcher.jpg';
  return `
    <div class="speaker-card">
      <img src="${esc(img)}" alt="${esc(s.name)}" loading="lazy" />
      <div class="speaker-body">
        <strong>${esc(s.name)}</strong>
        ${s.role || s.org ? `<span class="speaker-role">${esc([s.role, s.org].filter(Boolean).join(', '))}</span>` : ''}
        ${s.topic ? `<span class="speaker-topic">“${esc(s.topic)}”</span>` : ''}
        ${s.bio ? `<p class="speaker-bio">${esc(s.bio)}</p>` : ''}
      </div>
    </div>`;
}

function agendaBlock(agenda) {
  if (!agenda || !agenda.length) return '';
  return `
    <section class="section" id="agenda-section">
      <div class="container" style="max-width:880px;">
        <div class="section-header left"><p class="section-eyebrow">Schedule</p><h2 class="section-title">Agenda</h2></div>
        ${agenda
          .map(
            (d) => `
          <div class="agenda-day-view">
            <div class="agenda-day-head"><strong>${esc(d.label)}</strong>${d.date ? `<span>${esc(d.date)}</span>` : ''}</div>
            <table class="agenda-table">
              <tbody>
                ${(d.sessions || [])
                  .map(
                    (s) => `<tr><td class="ag-time">${esc(s.time)}</td><td class="ag-title">${esc(s.title)}${s.speaker ? `<span class="ag-speaker">${esc(s.speaker)}</span>` : ''}</td></tr>`
                  )
                  .join('')}
              </tbody>
            </table>
          </div>`
          )
          .join('')}
      </div>
    </section>`;
}

function registrationBlock(ev) {
  if (ev.externalRegistrationUrl) {
    return `
      <section class="section" id="register" style="background:var(--off-white);">
        <div class="container" style="max-width:640px;text-align:center;">
          <h2 class="section-title">Register</h2>
          <p style="color:var(--gray-600);margin:1rem 0 1.5rem;">Registration is handled on an external page.</p>
          <a href="${esc(ev.externalRegistrationUrl)}" target="_blank" rel="noopener" class="btn-primary btn-lg">Register now</a>
        </div>
      </section>`;
  }
  if (!ev.registrationOpen) {
    return `
      <section class="section" id="register" style="background:var(--off-white);">
        <div class="container" style="max-width:640px;text-align:center;">
          <h2 class="section-title">Registration closed</h2>
          <p style="color:var(--gray-600);margin-top:1rem;">Registration for this event is not open. Follow us or <a href="/contact.html">get in touch</a> for updates.</p>
        </div>
      </section>`;
  }
  return `
    <section class="section" id="register" style="background:var(--off-white);">
      <div class="container" style="max-width:600px;">
        <div class="section-header"><p class="section-eyebrow eyebrow-center">Attend</p><h2 class="section-title">Register for this event</h2></div>
        <div class="reg-form-card">
          <form id="reg-form" class="contact-form" onsubmit="submitRegistration(event)">
            <div class="form-group"><input type="text" id="reg-name" required placeholder="Full name" /></div>
            <div class="form-group"><input type="email" id="reg-email" required placeholder="Email" /></div>
            <div class="form-group"><input type="text" id="reg-org" placeholder="Organisation (optional)" /></div>
            <div class="form-group"><input type="text" id="reg-role" placeholder="Role (optional)" /></div>
            <div class="form-group"><input type="tel" id="reg-phone" placeholder="Phone (optional)" /></div>
            <button type="submit" class="btn-form">Register</button>
            <p id="reg-success" style="display:none;color:#10B981;margin-top:1rem;text-align:center;"></p>
            <p id="reg-error" style="display:none;color:#EF4444;margin-top:1rem;text-align:center;"></p>
          </form>
        </div>
      </div>
    </section>`;
}

async function submitRegistration(e) {
  e.preventDefault();
  const ok = document.getElementById('reg-success');
  const err = document.getElementById('reg-error');
  ok.style.display = 'none';
  err.style.display = 'none';
  const btn = e.target.querySelector('button[type="submit"]');
  btn.disabled = true;
  btn.textContent = 'Registering…';
  try {
    const res = await fetch('/api/registrations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        eventId: CURRENT_EVENT._id,
        name: document.getElementById('reg-name').value.trim(),
        email: document.getElementById('reg-email').value.trim(),
        organisation: document.getElementById('reg-org').value.trim(),
        role: document.getElementById('reg-role').value.trim(),
        phone: document.getElementById('reg-phone').value.trim(),
      }),
    });
    const data = await res.json();
    if (!res.ok || !data.success) throw new Error(data.message || 'Registration failed.');
    ok.textContent = data.message;
    ok.style.display = 'block';
    e.target.reset();
  } catch (e2) {
    err.textContent = e2.message;
    err.style.display = 'block';
  } finally {
    btn.disabled = false;
    btn.textContent = 'Register';
  }
}

const TYPE_LABEL = { indabax: 'IndabaX', meetup: 'Meetup', webinar: 'Webinar' };
const TYPE_BACK = { indabax: '/indabax.html', meetup: '/meetups.html', webinar: '/webinars.html' };
const TYPE_FALLBACK_IMG = {
  indabax: '/images/home/feature-conference.jpg',
  meetup: '/images/home/african-team-meeting.jpg',
  webinar: '/images/home/online-webinar.jpg',
};

async function loadEvent() {
  const params = new URLSearchParams(location.search);
  const slug = params.get('slug');
  const root = document.getElementById('event-root');
  if (!slug) {
    root.innerHTML = '<div class="page-hero-img"><div class="container"><h1>Event not found</h1></div></div>';
    return;
  }
  try {
    const res = await fetch(`/api/events/${encodeURIComponent(slug)}`);
    const data = await res.json();
    if (!data.success) throw new Error();
    const ev = data.event;
    CURRENT_EVENT = ev;
    document.title = `${ev.title} — AI-GAMNET`;

    const cover = ev.coverImage || TYPE_FALLBACK_IMG[ev.type] || '/images/home/hero-feature.jpg';
    const meta = [
      ev.startDate ? `<span>📅 ${fmtDateRange(ev.startDate, ev.endDate)}</span>` : '',
      ev.timeInfo ? `<span>🕒 ${esc(ev.timeInfo)}</span>` : '',
      ev.venue || ev.location ? `<span>📍 ${esc([ev.venue, ev.location].filter(Boolean).join(', '))}</span>` : '',
    ]
      .filter(Boolean)
      .join('');

    root.innerHTML = `
      <header class="event-hero" style="background-image:linear-gradient(rgba(15,23,42,0.72),rgba(15,23,42,0.82)),url('${esc(cover)}');">
        <div class="container">
          <a href="${TYPE_BACK[ev.type] || '/programs.html'}" class="event-back">← ${TYPE_LABEL[ev.type] || 'Events'}</a>
          <h1>${esc(ev.title)}</h1>
          ${ev.theme ? `<p class="event-hero-theme">${esc(ev.theme)}</p>` : ''}
          <div class="event-meta">${meta}</div>
          <div class="event-hero-actions">
            <a href="#register" class="btn-primary btn-lg">${ev.registrationOpen ? 'Register' : 'Details'}</a>
          </div>
        </div>
      </header>

      ${ev.summary ? `<section class="section" style="padding-bottom:0;"><div class="container" style="max-width:880px;"><p class="event-lead">${esc(ev.summary)}</p></div></section>` : ''}

      ${
        renderBlocks(ev.description)
          ? `<section class="section"><div class="container post-body" style="max-width:760px;">${renderBlocks(ev.description)}</div></section>`
          : ''
      }

      ${
        ev.speakers && ev.speakers.length
          ? `<section class="section" style="background:var(--white);"><div class="container">
              <div class="section-header"><p class="section-eyebrow eyebrow-center">Lineup</p><h2 class="section-title">Speakers</h2></div>
              <div class="speaker-grid">${ev.speakers.map(speakerCard).join('')}</div>
            </div></section>`
          : ''
      }

      ${agendaBlock(ev.agenda)}

      ${registrationBlock(ev)}
    `;

    if (location.hash) {
      const t = document.querySelector(location.hash);
      if (t) t.scrollIntoView();
    }
  } catch {
    root.innerHTML = '<div class="page-hero-img"><div class="container"><h1>Event not found</h1><p>This event may have been removed or is not yet published.</p></div></div>';
  }
}

document.addEventListener('DOMContentLoaded', loadEvent);
