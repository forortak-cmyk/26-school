let currentProfile = null;

(async () => {
  const auth = await requireAuth();
  if (!auth) return;
  currentProfile = auth.profile;

  if (currentProfile.role !== 'admin' && currentProfile.role !== 'teacher') {
    window.location.href = 'dashboard.html';
    return;
  }

  renderHeader(currentProfile, currentProfile.role === 'admin' ? 'admin' : 'teacher');
  document.getElementById('back-link').href = currentProfile.role === 'admin' ? 'admin.html' : 'teacher.html';
  await loadClassAnalytics();
})();

async function loadClassAnalytics() {
  const listEl = document.getElementById('class-analytics-list');

  const [{ data: students, error }, { data: items }, { data: regs }] = await Promise.all([
    sb.from('profiles').select('id, first_name, last_name, class').eq('role', 'student'),
    sb.from('portfolio_items').select('user_id'),
    sb.from('event_registrations').select('user_id'),
  ]);

  if (error) {
    listEl.innerHTML = `<p class="error-msg">${t('admin.loadError')}</p>`;
    return;
  }

  const itemCountByUser = {};
  (items || []).forEach(i => { itemCountByUser[i.user_id] = (itemCountByUser[i.user_id] || 0) + 1; });
  const regCountByUser = {};
  (regs || []).forEach(r => { regCountByUser[r.user_id] = (regCountByUser[r.user_id] || 0) + 1; });

  listEl.innerHTML = CLASS_LIST.map(cls => {
    const classStudents = (students || []).filter(s => s.class === cls);

    if (!classStudents.length) {
      return `
        <div class="card plain">
          <h3>${escapeHtml(cls)}</h3>
          <p class="small muted">${t('classAnalytics.noStudents')}</p>
        </div>
      `;
    }

    const totalItems = classStudents.reduce((sum, s) => sum + (itemCountByUser[s.id] || 0), 0);
    const totalRegs = classStudents.reduce((sum, s) => sum + (regCountByUser[s.id] || 0), 0);
    const avgItems = (totalItems / classStudents.length).toFixed(1);
    const zeroStudents = classStudents.filter(s => !itemCountByUser[s.id]);

    return `
      <div class="card">
        <h3>${escapeHtml(cls)}</h3>
        <p class="meta-line">
          ${t('classAnalytics.studentsCount')}: ${classStudents.length}
          · ${t('classAnalytics.itemsCount')}: ${totalItems}
          · ${t('classAnalytics.avgItems')}: ${avgItems}
          · ${t('classAnalytics.regsCount')}: ${totalRegs}
        </p>
        ${zeroStudents.length
          ? `<p class="small" style="color:var(--danger);">${t('classAnalytics.zeroItems')}: ${zeroStudents.map(s => escapeHtml(s.first_name + ' ' + s.last_name)).join(', ')}</p>`
          : `<p class="small" style="color:var(--sage);">${t('classAnalytics.allActive')}</p>`}
      </div>
    `;
  }).join('');
}
