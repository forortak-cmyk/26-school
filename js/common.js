// =========================================================
// Общие функции: проверка сессии, загрузка профиля, шапка сайта,
// выход из аккаунта. Подключается после supabaseClient.js на
// всех страницах, кроме публичной portfolio.html.
// =========================================================

// Возвращает { session, profile } или null, если пользователь не вошёл.
async function requireAuth() {
  const { data: { session } } = await sb.auth.getSession();
  if (!session) {
    window.location.href = 'index.html';
    return null;
  }
  const { data: profile, error } = await sb
    .from('profiles')
    .select('*')
    .eq('id', session.user.id)
    .single();

  if (error || !profile) {
    console.error('Не удалось загрузить профиль', error);
    window.location.href = 'index.html';
    return null;
  }
  return { session, profile };
}

function renderHeader(profile, activePage) {
  const el = document.getElementById('app-header');
  if (!el) return;

  const links = [
    { href: 'dashboard.html', label: t('nav.dashboard'), page: 'dashboard' },
    { href: 'announcements.html', label: t('nav.announcements'), page: 'announcements' },
    { href: 'calendar.html', label: t('nav.calendar'), page: 'calendar' },
  ];
  if (profile.role === 'teacher' || profile.role === 'admin') {
    links.push({ href: 'teacher.html', label: t('nav.teacher'), page: 'teacher' });
  }
  if (profile.role === 'admin') {
    links.push({ href: 'admin.html', label: t('nav.admin'), page: 'admin' });
  }

  const roleLabel = t('role.' + profile.role) || profile.role;

  el.innerHTML = `
    <a class="brand" href="dashboard.html">${t('brand')}</a>
    <nav class="app-nav">
      ${links.map(l => `<a href="${l.href}" class="${l.page === activePage ? 'active' : ''}">${l.label}</a>`).join('')}
    </nav>
    <div class="user-badge">
      <span>${profile.first_name} ${profile.last_name}</span>
      <span class="role-tag">${roleLabel}</span>
      <button class="secondary" id="logout-btn">${t('logout')}</button>
    </div>
  `;

  document.getElementById('logout-btn').addEventListener('click', async () => {
    await sb.auth.signOut();
    window.location.href = 'index.html';
  });
}

function escapeHtml(str) {
  if (str == null) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function dateLocale() {
  return (typeof getLang === 'function' && getLang() === 'ru') ? 'ru-RU' : 'hy-AM';
}

function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString(dateLocale(), { day: 'numeric', month: 'long', year: 'numeric' });
}

function formatDateTime(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString(dateLocale(), { day: 'numeric', month: 'long', year: 'numeric' }) +
    ', ' + d.toLocaleTimeString(dateLocale(), { hour: '2-digit', minute: '2-digit' });
}
