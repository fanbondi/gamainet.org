const TYPE_LABEL = { indabax: 'IndabaX', meetup: 'Meetup', webinar: 'Webinar' };
const TYPE_FALLBACK_IMG = {
  indabax: '/images/home/feature-conference.jpg',
  meetup: '/images/home/african-team-meeting.jpg',
  webinar: '/images/home/online-webinar.jpg',
};

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
  if (sameMonth) {
    return `${s.getDate()}–${e.getDate()} ${e.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}`;
  }
  return `${s.toLocaleDateString('en-GB', opts)} – ${e.toLocaleDateString('en-GB', opts)}`;
}

function eventCard(ev) {
  const img = ev.coverImage || TYPE_FALLBACK_IMG[ev.type] || '/images/home/hero-feature.jpg';
  const date = fmtDateRange(ev.startDate, ev.endDate);
  const type = TYPE_LABEL[ev.type] || 'Event';
  return `
    <a class="event-card" href="/event.html?slug=${encodeURIComponent(ev.slug)}">
      <div class="event-card-media">
        <img src="${esc(img)}" alt="${esc(ev.title)}" loading="lazy" />
        <span class="event-pill open">${ev.registrationOpen ? 'Register now' : 'Upcoming'}</span>
      </div>
      <div class="event-card-body">
        <span class="event-date">${esc(type)}${date ? ` · ${date}` : ''}${ev.timeInfo ? ` · ${esc(ev.timeInfo)}` : ''}</span>
        <h3>${esc(ev.title)}</h3>
        ${ev.theme ? `<p class="event-theme">${esc(ev.theme)}</p>` : ''}
        ${ev.summary ? `<p class="event-summary">${esc(ev.summary)}</p>` : ''}
      </div>
    </a>`;
}

function spotlightCard(ev) {
  const img = ev.coverImage || TYPE_FALLBACK_IMG[ev.type] || '/images/home/hero-feature.jpg';
  const date = fmtDateRange(ev.startDate, ev.endDate);
  const type = TYPE_LABEL[ev.type] || 'Event';
  return `
    <a class="hero-event-spotlight" href="/event.html?slug=${encodeURIComponent(ev.slug)}">
      <img src="${esc(img)}" alt="" class="hero-event-spotlight-img" />
      <div class="hero-event-spotlight-body">
        <span class="hero-event-spotlight-tag">${esc(type)} · ${esc(date)}</span>
        <strong>${esc(ev.title)}</strong>
        <span>${ev.registrationOpen ? 'Register free →' : 'View details →'}</span>
      </div>
    </a>`;
}

async function loadHomeEvents() {
  const grid = document.getElementById('home-events-grid');
  const spotlight = document.getElementById('hero-event-spotlight');
  const section = document.getElementById('home-events-section');
  if (!grid && !spotlight) return;

  try {
    let res = await fetch('/api/events?featured=true&upcoming=true');
    let data = await res.json();
    let events = data.events || [];

    if (!events.length) {
      res = await fetch('/api/events?upcoming=true');
      data = await res.json();
      events = (data.events || []).slice(0, 3);
    }

    if (!events.length) {
      if (section) section.style.display = 'none';
      if (spotlight) spotlight.innerHTML = '';
      return;
    }

    if (spotlight) spotlight.innerHTML = spotlightCard(events[0]);
    if (grid) {
      grid.innerHTML = events.map(eventCard).join('');
      if (section) section.style.display = '';
    }
  } catch {
    if (section) section.style.display = 'none';
  }
}

document.addEventListener('DOMContentLoaded', loadHomeEvents);
