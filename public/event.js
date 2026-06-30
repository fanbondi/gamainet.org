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
  if (s.toDateString() === e.toDateString()) return s.toLocaleDateString('en-GB', opts);
  const sameMonth = s.getMonth() === e.getMonth() && s.getFullYear() === e.getFullYear();
  if (sameMonth) return `${s.getDate()}–${e.getDate()} ${e.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}`;
  return `${s.toLocaleDateString('en-GB', opts)} – ${e.toLocaleDateString('en-GB', opts)}`;
}

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

function registrationHeroBlock(ev) {
  if (ev.externalRegistrationUrl) {
    return `
      <div class="reg-form-card reg-form-hero" id="register">
        <h3>Register for this event</h3>
        <p class="reg-form-hint">Registration is on an external page.</p>
        <a href="${esc(ev.externalRegistrationUrl)}" target="_blank" rel="noopener" class="btn-primary btn-lg" style="width:100%;text-align:center;">Register now</a>
      </div>`;
  }
  if (!ev.registrationOpen) {
    return `
      <div class="reg-form-card reg-form-hero reg-form-closed" id="register">
        <h3>Registration closed</h3>
        <p class="reg-form-hint">Follow us or <a href="/contact.html">get in touch</a> for updates.</p>
      </div>`;
  }
  return `
    <div class="reg-form-card reg-form-hero" id="register">
      <h3>Register free</h3>
      <p class="reg-form-hint">Secure your spot — we'll send joining details by email.</p>
      <form id="reg-form" class="contact-form reg-form-compact">
        <div class="reg-form-row">
          <div class="form-group"><input type="text" id="reg-name" required placeholder="Full name *" /></div>
          <div class="form-group"><input type="email" id="reg-email" required placeholder="Email *" /></div>
        </div>
        <div class="reg-form-row">
          <div class="form-group"><input type="text" id="reg-org" placeholder="Organisation" /></div>
          <div class="form-group"><input type="text" id="reg-role" placeholder="Role" /></div>
        </div>
        <div class="form-group"><input type="tel" id="reg-phone" placeholder="Phone (optional)" /></div>
        <button type="submit" class="btn-form">Register for this event</button>
        <p id="reg-success" class="reg-form-msg reg-form-msg-ok" style="display:none;"></p>
        <p id="reg-error" class="reg-form-msg reg-form-msg-err" style="display:none;"></p>
      </form>
    </div>`;
}

function bindRegistrationForm() {
  const form = document.getElementById('reg-form');
  if (!form || form.dataset.bound === '1') return;
  form.dataset.bound = '1';
  form.addEventListener('submit', submitRegistration);
}

async function submitRegistration(e) {
  e.preventDefault();
  const form = e.currentTarget || e.target;
  const ok = document.getElementById('reg-success');
  const err = document.getElementById('reg-error');
  ok.style.display = 'none';
  err.style.display = 'none';

  if (!CURRENT_EVENT?._id) {
    err.textContent = 'Event not loaded. Please refresh the page and try again.';
    err.style.display = 'block';
    return;
  }

  const btn = form.querySelector('button[type="submit"]');
  if (btn) {
    btn.disabled = true;
    btn.textContent = 'Registering…';
  }
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
    let data;
    try {
      data = await res.json();
    } catch {
      throw new Error('Server error. Please try again in a moment.');
    }
    if (!res.ok || !data.success) throw new Error(data.message || 'Registration failed.');
    ok.innerHTML = esc(data.message);
    if (data.meetingUrl) {
      ok.innerHTML += ` <a href="${esc(data.meetingUrl)}" target="_blank" rel="noopener" class="reg-join-link">Join Google Meet →</a>`;
    }
    ok.style.display = 'block';
    form.reset();
  } catch (e2) {
    err.textContent = e2.message || 'Something went wrong. Please try again.';
    err.style.display = 'block';
  } finally {
    if (btn) {
      btn.disabled = false;
      btn.textContent = 'Register for this event';
    }
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
    const dateStr = fmtDateRange(ev.startDate, ev.endDate);
    const metaItems = [
      dateStr ? `<li><span class="event-chip-label">Date</span><strong>${esc(dateStr)}</strong></li>` : '',
      ev.timeInfo ? `<li><span class="event-chip-label">Time</span><strong>${esc(ev.timeInfo)}</strong></li>` : '',
      ev.location ? `<li><span class="event-chip-label">Where</span><strong>${esc([ev.venue, ev.location].filter(Boolean).join(' · '))}</strong></li>` : '',
      ev.meetingUrl
        ? `<li class="event-meta-join"><span class="event-chip-label">Join</span><a href="${esc(ev.meetingUrl)}" target="_blank" rel="noopener" class="btn-primary btn-sm">Open Google Meet</a></li>`
        : '',
    ]
      .filter(Boolean)
      .join('');

    root.innerHTML = `
      <header class="event-hero-pro">
        <div class="container event-hero-pro-grid">
          <div class="event-hero-pro-copy">
            <a href="${TYPE_BACK[ev.type] || '/programs.html'}" class="event-back-light">← ${TYPE_LABEL[ev.type] || 'Events'}</a>
            <span class="event-type-badge">${TYPE_LABEL[ev.type] || 'Event'}</span>
            <h1>${esc(ev.title)}</h1>
            ${ev.theme ? `<p class="event-hero-pro-theme">${esc(ev.theme)}</p>` : ''}
            ${ev.summary ? `<p class="event-hero-pro-summary">${esc(ev.summary)}</p>` : ''}
            ${metaItems ? `<ul class="event-meta-list">${metaItems}</ul>` : ''}
            ${registrationHeroBlock(ev)}
          </div>
          <div class="event-hero-pro-visual">
            <img src="${esc(cover)}" alt="${esc(ev.title)}" class="event-hero-pro-img" />
          </div>
        </div>
      </header>

      ${
        renderBlocks(ev.description)
          ? `<section class="section"><div class="container post-body event-about" style="max-width:760px;">
              <div class="section-header left" style="margin-bottom:1.5rem;"><p class="section-eyebrow">About</p><h2 class="section-title">Event details</h2></div>
              ${renderBlocks(ev.description)}
            </div></section>`
          : ''
      }

      ${
        ev.speakers && ev.speakers.length
          ? `<section class="section" style="background:var(--off-white);"><div class="container">
              <div class="section-header"><p class="section-eyebrow eyebrow-center">Lineup</p><h2 class="section-title">Speakers</h2></div>
              <div class="speaker-grid">${ev.speakers.map(speakerCard).join('')}</div>
            </div></section>`
          : ''
      }

      ${agendaBlock(ev.agenda)}
    `;

    bindRegistrationForm();
  } catch {
    root.innerHTML = '<div class="page-hero-img"><div class="container"><h1>Event not found</h1><p>This event may have been removed or is not yet published.</p></div></div>';
  }
}

document.addEventListener('DOMContentLoaded', loadEvent);
