const slugify = require('slugify');
const ProgramEvent = require('../models/ProgramEvent');

const MONTHS = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
const STOP = new Set([
  'the', 'and', 'for', 'with', 'from', 'your', 'how', 'use', 'into', 'across', 'their', 'that', 'this', 'will',
]);

function normalizeShortCode(raw) {
  if (!raw) return '';
  return slugify(String(raw).trim().toLowerCase(), { lower: true, strict: true, trim: true }).slice(0, 32);
}

function suggestShortCode({ title, type, startDate }) {
  const words = String(title || '')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 2 && !STOP.has(w));
  let base = words.slice(0, 2).join('-');
  if (!base || base.length < 3) base = type || 'event';
  const d = startDate ? new Date(startDate) : null;
  const suffix =
    d && !Number.isNaN(d.getTime()) ? `-${MONTHS[d.getMonth()]}${String(d.getFullYear()).slice(-2)}` : '';
  return normalizeShortCode(`${base}${suffix}`) || normalizeShortCode(type);
}

async function ensureUniqueShortCode(base, excludeId = null) {
  let code = normalizeShortCode(base);
  if (!code) code = 'event';
  let n = 0;
  while (n < 100) {
    const candidate = (n === 0 ? code : `${code}-${n}`).slice(0, 32);
    const filter = { shortCode: candidate };
    if (excludeId) filter._id = { $ne: excludeId };
    const exists = await ProgramEvent.exists(filter);
    if (!exists) return candidate;
    n += 1;
  }
  return `${code}-${Date.now().toString(36)}`.slice(0, 32);
}

function eventPublicPath(event) {
  if (event?.shortCode) return `/e/${encodeURIComponent(event.shortCode)}`;
  if (event?.slug) return `/event.html?slug=${encodeURIComponent(event.slug)}`;
  return '/programs.html';
}

function eventLookupFilter(key) {
  const normalized = String(key || '').trim();
  return {
    $or: [{ slug: normalized }, { shortCode: normalized.toLowerCase() }],
  };
}

module.exports = {
  normalizeShortCode,
  suggestShortCode,
  ensureUniqueShortCode,
  eventPublicPath,
  eventLookupFilter,
};
