let currentProfile = null;
let allUsers = [];
let subjectsByTeacher = {}; // teacher_id -> [subject, subject, ...]
let openSubjectPanelFor = null; // id пользователя, для которого сейчас открыта панель выбора предметов

(async () => {
  const auth = await requireAuth();
  if (!auth) return;
  currentProfile = auth.profile;

  if (currentProfile.role !== 'admin') {
    window.location.href = 'dashboard.html';
    return;
  }

  renderHeader(currentProfile, 'admin');
  await loadStats();
  await loadUsers();
  await loadRoleLog();
})();

async function loadStats() {
  const el = document.getElementById('stats-block');
  if (!el) return;

  const [students, teachers, items, events, regs] = await Promise.all([
    sb.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'student'),
    sb.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'teacher'),
    sb.from('portfolio_items').select('*', { count: 'exact', head: true }),
    sb.from('events').select('*', { count: 'exact', head: true }),
    sb.from('event_registrations').select('*', { count: 'exact', head: true }),
  ]);

  el.innerHTML = `
    <h2 style="margin-bottom:12px;">${t('admin.statsTitle')}</h2>
    <div class="grid-2" style="grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));">
      <div><div style="font-size:1.6rem; font-family:var(--serif);">${students.count ?? '—'}</div><div class="small muted">${t('admin.statsStudents')}</div></div>
      <div><div style="font-size:1.6rem; font-family:var(--serif);">${teachers.count ?? '—'}</div><div class="small muted">${t('admin.statsTeachers')}</div></div>
      <div><div style="font-size:1.6rem; font-family:var(--serif);">${items.count ?? '—'}</div><div class="small muted">${t('admin.statsPortfolioItems')}</div></div>
      <div><div style="font-size:1.6rem; font-family:var(--serif);">${events.count ?? '—'}</div><div class="small muted">${t('admin.statsEvents')}</div></div>
      <div><div style="font-size:1.6rem; font-family:var(--serif);">${regs.count ?? '—'}</div><div class="small muted">${t('admin.statsRegistrations')}</div></div>
    </div>
  `;
}

async function loadRoleLog() {
  const el = document.getElementById('role-log-list');
  if (!el) return;

  const { data, error } = await sb
    .from('role_change_log')
    .select('*, target:profiles!role_change_log_target_user_id_fkey(first_name, last_name), changer:profiles!role_change_log_changed_by_fkey(first_name, last_name)')
    .order('changed_at', { ascending: false })
    .limit(50);

  if (error || !data || !data.length) {
    el.innerHTML = `<p class="muted">${t('admin.logEmpty')}</p>`;
    return;
  }

  el.innerHTML = data.map(entry => `
    <p class="small">
      ${formatDateTime(entry.changed_at)} — ${escapeHtml(entry.target ? entry.target.first_name + ' ' + entry.target.last_name : '')}:
      ${t('role.' + entry.old_role) || entry.old_role} → ${t('role.' + entry.new_role) || entry.new_role}
      <span class="muted">(${t('admin.logChangedBy')}${escapeHtml(entry.changer ? entry.changer.first_name + ' ' + entry.changer.last_name : '—')})</span>
    </p>
  `).join('');
}

async function loadUsers() {
  const { data, error } = await sb
    .from('profiles')
    .select('*')
    .order('last_name', { ascending: true });

  if (error) {
    document.getElementById('users-list').innerHTML = `<p class="error-msg">${t('admin.loadError')}</p>`;
    return;
  }
  allUsers = data;

  const { data: ts } = await sb.from('teacher_subjects').select('*');
  subjectsByTeacher = {};
  (ts || []).forEach(row => {
    (subjectsByTeacher[row.teacher_id] = subjectsByTeacher[row.teacher_id] || []).push(row.subject);
  });

  renderUsers(allUsers);
}

function renderUsers(users) {
  const listEl = document.getElementById('users-list');
  if (!users.length) {
    listEl.innerHTML = `<div class="empty-state">${t('admin.empty')}</div>`;
    return;
  }

  listEl.innerHTML = users.map(u => `
    <div class="card plain">
      <div class="card-row">
        <div>
          <strong>${escapeHtml(u.first_name)} ${escapeHtml(u.last_name)}</strong>
          <span class="role-tag">${t('role.' + u.role) || u.role}</span>
          <p class="meta-line">${escapeHtml(u.email)} · ${t('admin.classLabel')}${escapeHtml(u.class || '—')}</p>
          ${u.role === 'teacher' ? `<p class="small muted">${t('admin.teacherSubjectsLabel')}${
            (subjectsByTeacher[u.id] || []).length
              ? (subjectsByTeacher[u.id] || []).map(s => t('subject.' + s)).join(', ')
              : t('admin.noSubjects')
          }</p>` : ''}
        </div>
        <div>${renderRoleButton(u)}</div>
      </div>
      <div class="subject-panel-slot" data-slot-for="${u.id}"></div>
    </div>
  `).join('');

  listEl.querySelectorAll('[data-toggle-teacher]').forEach(btn => {
    btn.addEventListener('click', () => openSubjectPanel(btn.dataset.toggleTeacher));
  });
  listEl.querySelectorAll('[data-remove-teacher]').forEach(btn => {
    btn.addEventListener('click', () => removeTeacherRole(btn.dataset.removeTeacher));
  });
  listEl.querySelectorAll('[data-edit-subjects]').forEach(btn => {
    btn.addEventListener('click', () => openSubjectPanel(btn.dataset.editSubjects));
  });

  if (openSubjectPanelFor) renderSubjectPanel(openSubjectPanelFor);
}

function renderRoleButton(u) {
  if (u.role === 'admin') return `<span class="small muted">${t('admin.managedManually')}</span>`;
  if (u.id === currentProfile.id) return `<span class="small muted">${t('admin.thatsYou')}</span>`;
  if (u.role === 'teacher') {
    return `
      <button class="secondary small" data-edit-subjects="${u.id}">${t('admin.editSubjects')}</button>
      <button class="danger small" data-remove-teacher="${u.id}">${t('admin.removeTeacher')}</button>
    `;
  }
  return `<button class="small" data-toggle-teacher="${u.id}">${t('admin.makeTeacher')}</button>`;
}

// ---------- Панель выбора предмета(ов) ----------
function openSubjectPanel(userId) {
  openSubjectPanelFor = openSubjectPanelFor === userId ? null : userId;
  renderUsers(allUsers);
}

function renderSubjectPanel(userId) {
  const slot = document.querySelector(`[data-slot-for="${userId}"]`);
  if (!slot) return;

  const currentSubjects = subjectsByTeacher[userId] || [];

  slot.innerHTML = `
    <div class="card sage" style="margin-top:10px;">
      <p class="small" style="margin-bottom:8px;">${t('admin.assignSubjectsTitle')}</p>
      <div style="display:flex; flex-wrap:wrap; gap:10px;">
        ${SUBJECT_LIST.map(s => `
          <label class="small" style="display:flex; align-items:center; gap:4px; font-weight:normal;">
            <input type="checkbox" class="subject-checkbox" value="${s}" ${currentSubjects.includes(s) ? 'checked' : ''}>
            ${t('subject.' + s)}
          </label>
        `).join('')}
      </div>
      <div class="form-actions">
        <button type="button" class="small" data-confirm-subjects="${userId}">${t('admin.confirmAssign')}</button>
        <button type="button" class="secondary small" data-cancel-subjects>${t('cancel')}</button>
      </div>
    </div>
  `;

  slot.querySelector('[data-confirm-subjects]').addEventListener('click', () => confirmSubjectAssignment(userId, slot));
  slot.querySelector('[data-cancel-subjects]').addEventListener('click', () => { openSubjectPanelFor = null; renderUsers(allUsers); });
}

async function confirmSubjectAssignment(userId, slot) {
  const selected = Array.from(slot.querySelectorAll('.subject-checkbox:checked')).map(cb => cb.value);

  try {
    const user = allUsers.find(u => u.id === userId);
    if (user.role !== 'teacher') {
      const { error } = await sb.from('profiles').update({ role: 'teacher' }).eq('id', userId);
      if (error) throw error;
    }

    // Пересинхронизируем предметы: удаляем все старые, вставляем выбранные.
    await sb.from('teacher_subjects').delete().eq('teacher_id', userId);
    if (selected.length) {
      await sb.from('teacher_subjects').insert(selected.map(subject => ({ teacher_id: userId, subject })));
    }

    openSubjectPanelFor = null;
    await loadUsers();
    await loadRoleLog();
  } catch (err) {
    alert(t('admin.roleError') + err.message);
  }
}

async function removeTeacherRole(userId) {
  try {
    await sb.from('teacher_subjects').delete().eq('teacher_id', userId);
    const { error } = await sb.from('profiles').update({ role: 'student' }).eq('id', userId);
    if (error) throw error;
    await loadUsers();
    await loadRoleLog();
  } catch (err) {
    alert(t('admin.roleError') + err.message);
  }
}

document.getElementById('user-search').addEventListener('input', (e) => {
  const q = e.target.value.trim().toLowerCase();
  if (!q) { renderUsers(allUsers); return; }
  renderUsers(allUsers.filter(u =>
    `${u.first_name} ${u.last_name} ${u.email} ${u.class}`.toLowerCase().includes(q)
  ));
});
