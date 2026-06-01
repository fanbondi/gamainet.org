function toggleMenu() {
  const links = document.getElementById('nav-links');
  if (links) links.classList.toggle('open');
}

document.addEventListener('DOMContentLoaded', () => {
  const bindNav = () => {
    document.querySelectorAll('.nav-links a').forEach((a) => {
      a.addEventListener('click', () => {
        const links = document.getElementById('nav-links');
        if (links) links.classList.remove('open');
      });
    });
  };
  bindNav();
  document.addEventListener('site-chrome-ready', bindNav);
  initScrollAnimations();
});

async function submitContact(e) {
  e.preventDefault();
  const successEl = document.getElementById('contact-success');
  const errorEl = document.getElementById('contact-error');
  if (successEl) successEl.style.display = 'none';
  if (errorEl) errorEl.style.display = 'none';

  const payload = {
    name: document.getElementById('contact-name').value.trim(),
    email: document.getElementById('contact-email-input').value.trim(),
    subject: document.getElementById('contact-subject')?.value.trim() || '',
    message: document.getElementById('contact-message').value.trim(),
  };

  const btn = e.target.querySelector('button[type="submit"]');
  if (btn) {
    btn.disabled = true;
    btn.textContent = 'Sending…';
  }

  try {
    const res = await fetch(`${window.location.origin}/api/contact`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok || !data.success) throw new Error(data.message || 'Could not send.');
    if (successEl) successEl.style.display = 'block';
    e.target.reset();
  } catch (err) {
    if (errorEl) {
      errorEl.textContent = err.message || 'Something went wrong.';
      errorEl.style.display = 'block';
    }
  } finally {
    if (btn) {
      btn.disabled = false;
      btn.textContent = 'Send Message';
    }
  }
}

async function submitJoin(e) {
  e.preventDefault();
  const successEl = document.getElementById('join-success');
  const errorEl = document.getElementById('join-error');
  if (successEl) successEl.style.display = 'none';
  if (errorEl) errorEl.style.display = 'none';

  const payload = {
    name: document.getElementById('join-name').value.trim(),
    email: document.getElementById('join-email').value.trim(),
    organisation: document.getElementById('join-org')?.value.trim() || '',
    role: document.getElementById('join-role')?.value.trim() || '',
    interests: document.getElementById('join-interests')?.value.trim() || '',
  };

  const btn = e.target.querySelector('button[type="submit"]');
  if (btn) {
    btn.disabled = true;
    btn.textContent = 'Submitting…';
  }

  try {
    const res = await fetch(`${window.location.origin}/api/members`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok || !data.success) throw new Error(data.message || 'Registration failed.');
    if (successEl) successEl.style.display = 'block';
    e.target.reset();
  } catch (err) {
    if (errorEl) {
      errorEl.textContent = err.message || 'Something went wrong.';
      errorEl.style.display = 'block';
    }
  } finally {
    if (btn) {
      btn.disabled = false;
      btn.textContent = 'Join AI-GAMNET';
    }
  }
}

function initScrollAnimations() {
  const targets = document.querySelectorAll('.card, .hub-card');
  if (!('IntersectionObserver' in window)) return;
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateY(0)';
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1 }
  );
  targets.forEach((t) => {
    t.style.opacity = '0';
    t.style.transform = 'translateY(24px)';
    t.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
    observer.observe(t);
  });
}
