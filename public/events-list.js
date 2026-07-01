function eventTypeFromBody() {
  return document.body.getAttribute('data-event-type') || '';
}

function fmtDateRange(start, end) {
  if (!start) return '';
  const s = new Date(start);
  const opts = { day: 'numeric', month: 'short', year: 'numeric' };
  if (!end) return s.toLocaleDateString('en-GB', opts);
  const e = new Date(end);
  const sameMonth = s.getMonth() === e.getMonth() && s.getFullYear() === e.getFullYear();
  if (sameMonth) {
    return `${s.getDate()}–${e.getDate()} ${e.toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })}`;
  }
  return `${s.toLocaleDateString('en-GB', opts)} – ${e.toLocaleDateString('en-GB', opts)}`;
}

function eventStatus(ev) {
  const now = Date.now();
  const end = ev.endDate ? new Date(ev.endDate).getTime() : ev.startDate ? new Date(ev.startDate).getTime() : 0;
  if (end && end < now) return { label: 'Past', cls: 'past' };
  return { label: ev.registrationOpen ? 'Open' : 'Upcoming', cls: ev.registrationOpen ? 'open' : 'soon' };
}

const TYPE_FALLBACK_IMG = {
  indabax: '/images/home/feature-conference.jpg',
  meetup: '/images/home/african-team-meeting.jpg',
  webinar: '/images/home/online-webinar.jpg',
};

function eventCard(ev) {
  const img = ev.coverImage || TYPE_FALLBACK_IMG[ev.type] || '/images/home/hero-feature.jpg';
  const st = eventStatus(ev);
  const date = fmtDateRange(ev.startDate, ev.endDate);
  return `
    <a class="event-card" href="${eventHref(ev)}">
      <div class="event-card-media">
        <img src="${img}" alt="${esc(ev.title)}" loading="lazy" />
        <span class="event-pill ${st.cls}">${st.label}</span>
      </div>
      <div class="event-card-body">
        ${date ? `<span class="event-date">${date}</span>` : ''}
        <h3>${esc(ev.title)}</h3>
        ${ev.theme ? `<p class="event-theme">${esc(ev.theme)}</p>` : ''}
        ${ev.summary ? `<p class="event-summary">${esc(ev.summary)}</p>` : ''}
        ${ev.location ? `<span class="event-loc">📍 ${esc(ev.location)}</span>` : ''}
      </div>
    </a>`;
}

async function loadEventList() {
  const grid = document.getElementById('event-grid');
  if (!grid) return;
  const type = eventTypeFromBody();
  try {
    const res = await fetch(`/api/events?type=${encodeURIComponent(type)}`);
    const data = await res.json();
    const events = (data.events || []).filter((e) => e.published);
    if (!events.length) {
      grid.innerHTML = '<p class="empty-note">No events published yet. Check back soon — or contact us to get involved.</p>';
      return;
    }
    grid.innerHTML = events.map(eventCard).join('');
  } catch {
    grid.innerHTML = '<p class="empty-note">Could not load events. Please try again later.</p>';
  }
}

function esc(s) {
  return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

document.addEventListener('DOMContentLoaded', loadEventList);
