let currentProfile = null;

(async () => {
  const auth = await requireAuth();
  if (!auth) return;
  currentProfile = auth.profile;
  renderHeader(currentProfile, 'calendar');
  await loadEvents();
})();

async function loadEvents() {
  const listEl = document.getElementById('events-list');

  const { data: events, error } = await sb
    .from('events')
    .select('*, profiles!events_created_by_fkey(first_name, last_name)')
    .order('event_date', { ascending: true });

  if (error) {
    listEl.innerHTML = `<p class="error-msg">Не удалось загрузить события.</p>`;
    console.error(error);
    return;
  }

  const { data: myRegs } = await sb
    .from('event_registrations')
    .select('id, event_id')
    .eq('user_id', currentProfile.id);
  const myRegMap = new Map((myRegs || []).map(r => [r.event_id, r.id]));

  // Число записавшихся на каждое событие — считаем отдельным запросом,
  // т.к. RLS для event_registrations ограничивает видимость строк учеников.
  const counts = {};
  for (const ev of events) {
    const { count } = await sb
      .from('event_registrations')
      .select('*', { count: 'exact', head: true })
      .eq('event_id', ev.id);
    counts[ev.id] = count || 0;
  }

  if (!events.length) {
    listEl.innerHTML = `<div class="empty-state">Пока нет запланированных событий.</div>`;
    return;
  }

  listEl.innerHTML = events.map(ev => {
    const registered = myRegMap.has(ev.id);
    const full = ev.max_participants != null && counts[ev.id] >= ev.max_participants;
    const organizer = ev.profiles ? `${ev.profiles.first_name} ${ev.profiles.last_name}` : '';
    const spotsLine = ev.max_participants != null
      ? `${counts[ev.id]} / ${ev.max_participants} записано`
      : `${counts[ev.id]} записано`;

    let actionHtml;
    if (registered) {
      actionHtml = `<button class="danger small" data-cancel="${myRegMap.get(ev.id)}">Отменить запись</button>`;
    } else if (full) {
      actionHtml = `<button disabled>Мест нет</button>`;
    } else {
      actionHtml = `<button data-register="${ev.id}">Записаться</button>`;
    }

    return `
      <div class="card ${registered ? 'sage' : ''}">
        <h3>${escapeHtml(ev.title)}</h3>
        <p class="meta-line">${formatDateTime(ev.event_date)} · ${escapeHtml(ev.location || '')}</p>
        <p class="meta-line">Организатор: ${escapeHtml(organizer)} · ${spotsLine}</p>
        ${ev.description ? `<p>${escapeHtml(ev.description)}</p>` : ''}
        ${actionHtml}
      </div>
    `;
  }).join('');

  listEl.querySelectorAll('[data-register]').forEach(btn => {
    btn.addEventListener('click', () => register(btn.dataset.register));
  });
  listEl.querySelectorAll('[data-cancel]').forEach(btn => {
    btn.addEventListener('click', () => cancelRegistration(btn.dataset.cancel));
  });
}

async function register(eventId) {
  const { error } = await sb.from('event_registrations').insert({
    event_id: eventId,
    user_id: currentProfile.id
  });
  if (error) {
    alert('Не удалось записаться: ' + error.message);
    return;
  }
  await loadEvents();
}

async function cancelRegistration(regId) {
  if (!confirm('Отменить запись на это событие?')) return;
  const { error } = await sb.from('event_registrations').delete().eq('id', regId);
  if (error) {
    alert('Не удалось отменить запись: ' + error.message);
    return;
  }
  await loadEvents();
}
