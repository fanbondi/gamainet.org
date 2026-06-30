const nodemailer = require('nodemailer');

let transporter = null;

function isMailConfigured() {
  return !!(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);
}

function getTransporter() {
  if (!isMailConfigured()) return null;
  if (!transporter) {
    const port = Number(process.env.SMTP_PORT || 465);
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port,
      secure: process.env.SMTP_SECURE !== 'false' && port === 465,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }
  return transporter;
}

function fmtEventDate(start, end) {
  if (!start) return '';
  const s = new Date(start);
  const opts = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' };
  if (!end) return s.toLocaleDateString('en-GB', opts);
  const e = new Date(end);
  if (s.toDateString() === e.toDateString()) return s.toLocaleDateString('en-GB', opts);
  return `${s.toLocaleDateString('en-GB', opts)} – ${e.toLocaleDateString('en-GB', opts)}`;
}

async function sendRegistrationConfirmation({ to, name, event }) {
  const transport = getTransporter();
  if (!transport) {
    console.warn(`SMTP not configured — skipping registration email to ${to}`);
    return false;
  }

  const from = process.env.MAIL_FROM || process.env.SMTP_USER || 'info@gamainet.org';
  const dateStr = fmtEventDate(event.startDate, event.endDate);
  const timeStr = event.timeInfo || '';
  const where = [event.venue, event.location].filter(Boolean).join(' · ');
  const meetLink = event.meetingUrl || '';

  const subject = `You're registered — ${event.title}`;
  const text = [
    `Hi ${name},`,
    '',
    `Thank you for registering for "${event.title}".`,
    '',
    dateStr ? `Date: ${dateStr}` : '',
    timeStr ? `Time: ${timeStr}` : '',
    where ? `Where: ${where}` : '',
    meetLink ? `Join link: ${meetLink}` : '',
    '',
    meetLink
      ? 'Save the link above — use it to join on the day.'
      : 'We will send joining details closer to the event if needed.',
    '',
    'Questions? Reply to this email or contact info@gamainet.org',
    '',
    '— AI-GAMNET / Gamainet.org',
  ]
    .filter(Boolean)
    .join('\n');

  const html = `
    <div style="font-family:Inter,Arial,sans-serif;max-width:560px;color:#0f172a;line-height:1.6;">
      <p>Hi ${escapeHtml(name)},</p>
      <p>Thank you for registering for <strong>${escapeHtml(event.title)}</strong>.</p>
      <table style="margin:1.25rem 0;border-collapse:collapse;">
        ${dateStr ? `<tr><td style="padding:0.25rem 1rem 0.25rem 0;color:#64748b;">Date</td><td><strong>${escapeHtml(dateStr)}</strong></td></tr>` : ''}
        ${timeStr ? `<tr><td style="padding:0.25rem 1rem 0.25rem 0;color:#64748b;">Time</td><td><strong>${escapeHtml(timeStr)}</strong></td></tr>` : ''}
        ${where ? `<tr><td style="padding:0.25rem 1rem 0.25rem 0;color:#64748b;">Where</td><td><strong>${escapeHtml(where)}</strong></td></tr>` : ''}
      </table>
      ${
        meetLink
          ? `<p><a href="${escapeHtml(meetLink)}" style="display:inline-block;background:#f97316;color:#fff;text-decoration:none;padding:12px 20px;border-radius:8px;font-weight:700;">Join Google Meet</a></p>
             <p style="font-size:0.9rem;color:#64748b;">Or copy this link: <a href="${escapeHtml(meetLink)}">${escapeHtml(meetLink)}</a></p>`
          : '<p>We will share joining details closer to the event if needed.</p>'
      }
      <p style="margin-top:1.5rem;font-size:0.9rem;color:#64748b;">Questions? Contact <a href="mailto:info@gamainet.org">info@gamainet.org</a></p>
      <p style="font-size:0.85rem;color:#94a3b8;">— AI-GAMNET / Gamainet.org</p>
    </div>`;

  await transport.sendMail({ from, to, subject, text, html });
  return true;
}

function escapeHtml(s) {
  return String(s || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

module.exports = { sendRegistrationConfirmation, isMailConfigured };
