let currentProfile = null;

const categoryLabels = {
  project: 'Проект',
  achievement: 'Достижение',
  certificate: 'Сертификат',
  creative: 'Творческая работа',
};

(async () => {
  const auth = await requireAuth();
  if (!auth) return;
  currentProfile = auth.profile;

  if (currentProfile.role !== 'teacher' && currentProfile.role !== 'admin') {
    window.location.href = 'dashboard.html';
    return;
  }

  renderHeader(currentProfile, 'teacher');
  await loadMyCreatedEvents();
  await loadStudents();
})();

// ---------- Вкладки ----------
document.querySelectorAll('.tabs button').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.tabs button').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const tab = btn.dataset.tab;
    document.getElementById('tab-events').style.display = tab === 'events' ? '' : 'none';
    document.getElementById('tab-portfolios').style.display = tab === 'portfolios' ? '' : 'none';
  });
});

// ---------- Создание события ----------
document.getElementById('event-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const errorEl = document.getElementById('event-error');
  errorEl.style.display = 'none';
  const btn = document.getElementById('save-event-btn');
  btn.disabled = true;
  btn.textContent = 'Создаём...';

  try {
    const title = document.getElementById('ev-title').value.trim();
    const description = document.getElementById('ev-description').value.trim();
    const event_date = document.getElementById('ev-datetime').value;
    const location = document.getElementById('ev-location').value.trim();
    const maxRaw = document.getElementById('ev-max').value;
    const max_participants = maxRaw ? parseInt(maxRaw, 10) : null;

    const { error } = await sb.from('events').insert({
      title, description, event_date, location, max_participants,
      created_by: currentProfile.id
    });
    if (error) throw error;

    document.getElementById('event-form').reset();
    await loadMyCreatedEvents();
  } catch (err) {
    errorEl.textContent = 'Ошибка: ' + err.message;
    errorEl.style.display = 'block';
  } finally {
    btn.disabled = false;
    btn.textContent = 'Создать событие';
  }
});

// ---------- Список моих событий + записавшиеся ----------
async function loadMyCreatedEvents() {
  const listEl = document.getElementById('my-created-events');

  const { data: events, error } = await sb
    .from('events')
    .select('*')
    .eq('created_by', currentProfile.id)
    .order('event_date', { ascending: true });

  if (error) {
    listEl.innerHTML = `<p class="error-msg">Не удалось загрузить события.</p>`;
    return;
  }

  if (!events.length) {
    listEl.innerHTML = `<div class="empty-state">Вы пока не создали ни одного события.</div>`;
    return;
  }

  const html = [];
  for (const ev of events) {
    const { data: regs } = await sb
      .from('event_registrations')
      .select('id, profiles(first_name, last_name, class)')
      .eq('event_id', ev.id);

    const participants = (regs || []).map(r =>
      r.profiles ? `${escapeHtml(r.profiles.first_name)} ${escapeHtml(r.profiles.last_name)} (${escapeHtml(r.profiles.class || '')})` : ''
    ).join(', ') || '<span class="muted">пока никто не записался</span>';

    html.push(`
      <div class="card">
        <h3>${escapeHtml(ev.title)}</h3>
        <p class="meta-line">${formatDateTime(ev.event_date)} · ${escapeHtml(ev.location || '')}
          ${ev.max_participants != null ? `· мест: ${ev.max_participants}` : ''}</p>
        <p class="small"><strong>Записались:</strong> ${participants}</p>
        <button class="danger small" data-delete-event="${ev.id}">Удалить событие</button>
      </div>
    `);
  }
  listEl.innerHTML = html.join('');

  listEl.querySelectorAll('[data-delete-event]').forEach(btn => {
    btn.addEventListener('click', async () => {
      if (!confirm('Удалить это событие? Все записи на него тоже удалятся.')) return;
      const { error } = await sb.from('events').delete().eq('id', btn.dataset.deleteEvent);
      if (error) { alert('Ошибка: ' + error.message); return; }
      await loadMyCreatedEvents();
    });
  });
}

// ---------- Поиск и просмотр портфолио учеников ----------
let allStudents = [];

async function loadStudents() {
  const { data, error } = await sb
    .from('profiles')
    .select('id, first_name, last_name, class, role')
    .eq('role', 'student')
    .order('last_name', { ascending: true });

  if (error) {
    document.getElementById('students-list').innerHTML = `<p class="error-msg">Не удалось загрузить список учеников.</p>`;
    return;
  }
  allStudents = data;
  renderStudents(allStudents);
}

function renderStudents(students) {
  const listEl = document.getElementById('students-list');
  if (!students.length) {
    listEl.innerHTML = `<div class="empty-state">Ученики не найдены.</div>`;
    return;
  }
  listEl.innerHTML = students.map(s => `
    <div class="card plain card-row">
      <div>
        <strong>${escapeHtml(s.first_name)} ${escapeHtml(s.last_name)}</strong>
        <span class="meta-line">Класс: ${escapeHtml(s.class || '—')}</span>
      </div>
      <a class="btn secondary" href="portfolio.html?id=${s.id}" target="_blank">Открыть портфолио</a>
    </div>
  `).join('');
}

document.getElementById('student-search').addEventListener('input', (e) => {
  const q = e.target.value.trim().toLowerCase();
  if (!q) { renderStudents(allStudents); return; }
  renderStudents(allStudents.filter(s =>
    `${s.first_name} ${s.last_name} ${s.class}`.toLowerCase().includes(q)
  ));
});
