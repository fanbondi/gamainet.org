function getEventRefFromLocation() {
  const m = location.pathname.match(/^\/e\/([^/]+)\/?$/);
  if (m) return decodeURIComponent(m[1]);
  return new URLSearchParams(location.search).get('slug');
}

function eventHref(ev) {
  if (ev && ev.shortCode) return `/e/${encodeURIComponent(ev.shortCode)}`;
  if (ev && ev.slug) return `/event.html?slug=${encodeURIComponent(ev.slug)}`;
  return '/programs.html';
}

function eventShareUrl(ev) {
  return `${location.origin}${eventHref(ev)}`;
}
