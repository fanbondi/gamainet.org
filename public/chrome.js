const SITE_NAV = [
  { href: '/', label: 'Home', match: (p) => p === '/' || p === '/index.html' },
  {
    href: '/programs.html',
    label: 'Programs',
    match: (p) => ['/programs', '/indabax', '/meetups', '/webinars', '/event'].some((x) => p.startsWith(x)),
    children: [
      { href: '/programs.html', label: 'All programs' },
      { href: '/indabax.html', label: 'IndabaX' },
      { href: '/meetups.html', label: 'Meetups' },
      { href: '/webinars.html', label: 'Webinars' },
    ],
  },
  { href: '/ai-in-gambia.html', label: 'AI in Gambia' },
  { href: '/blog.html', label: 'Blog', match: (p) => p.startsWith('/blog') },
  { href: '/about.html', label: 'About' },
  { href: '/join.html', label: 'Join' },
  { href: '/contact.html', label: 'Contact' },
];

function isNavActive(item, path) {
  if (item.match) return item.match(path);
  return path === item.href;
}

function renderSiteHeader() {
  const mount = document.getElementById('site-header');
  if (!mount) return;

  const path = window.location.pathname;
  const links = SITE_NAV.map((item) => {
    const active = isNavActive(item, path) ? ' active' : '';
    if (item.children) {
      const sub = item.children
        .map((c) => `<li><a href="${c.href}"${path === c.href ? ' class="active"' : ''}>${c.label}</a></li>`)
        .join('');
      return `<li class="has-dropdown"><a href="${item.href}" class="nav-top${active}">${item.label} <span class="caret">▾</span></a><ul class="dropdown">${sub}</ul></li>`;
    }
    return `<li><a href="${item.href}" class="nav-top${active}">${item.label}</a></li>`;
  }).join('');

  mount.innerHTML = `
    <nav class="navbar" id="navbar">
      <div class="nav-container">
        <a href="/" class="nav-logo" aria-label="AI-GAMNET — Artificial Intelligence Gambia Network home">
          <img src="/images/logo.png" alt="AI-GAMNET" class="logo-img" />
        </a>
        <button type="button" class="hamburger" id="hamburger" onclick="toggleMenu()" aria-label="Open menu">
          <span></span><span></span><span></span>
        </button>
        <ul class="nav-links" id="nav-links">${links}</ul>
        <div class="nav-ctas"><a href="/join.html" class="btn-primary">Join</a></div>
      </div>
    </nav>`;

  const navbar = document.getElementById('navbar');
  if (navbar) {
    const onScroll = () => navbar.classList.toggle('scrolled', window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  document.dispatchEvent(new Event('site-chrome-ready'));
}

function renderSiteFooter() {
  const mount = document.getElementById('site-footer');
  if (!mount) return;

  mount.innerHTML = `
    <footer class="footer">
      <div class="container">
        <div class="footer-grid">
          <div class="footer-brand">
            <a href="/" class="footer-logo-link">
              <img src="/images/logo.png" alt="AI-GAMNET — Artificial Intelligence Gambia Network" class="footer-logo-img" />
            </a>
            <p>Advancing AI, empowering society across Gambia and Africa.</p>
            <a href="mailto:info@gamainet.org" class="footer-email">info@gamainet.org</a>
          </div>
          <div class="footer-col">
            <h4>Explore</h4>
            <ul>
              <li><a href="/programs.html">Programs</a></li>
              <li><a href="/blog.html">Blog</a></li>
              <li><a href="/about.html">About</a></li>
              <li><a href="/join.html">Join</a></li>
            </ul>
          </div>
          <div class="footer-col">
            <h4>Connect</h4>
            <ul>
              <li><a href="mailto:info@gamainet.org">info@gamainet.org</a></li>
              <li><a href="/contact.html">Contact</a></li>
              <li><a href="/admin.html">Admin</a></li>
            </ul>
          </div>
        </div>
        <p class="footer-copy">© ${new Date().getFullYear()} AI-GAMNET</p>
      </div>
    </footer>`;
}

document.addEventListener('DOMContentLoaded', () => {
  renderSiteHeader();
  renderSiteFooter();
});
