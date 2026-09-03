let currentProfile = null;
let allUsers = [];

(async () => {
  const auth = await requireAuth();
  if (!auth) return;
  currentProfile = auth.profile;

  if (currentProfile.role !== 'admin') {
    window.location.href = 'dashboard.html';
    return;
  }

  renderHeader(currentProfile, 'admin');
  await loadUsers();
})();

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
  renderUsers(allUsers);
}

function renderUsers(users) {
  const listEl = document.getElementById('users-list');
  if (!users.length) {
    listEl.innerHTML = `<div class="empty-state">${t('admin.empty')}</div>`;
    return;
  }

  listEl.innerHTML = users.map(u => `
    <div class="card plain card-row">
      <div>
        <strong>${escapeHtml(u.first_name)} ${escapeHtml(u.last_name)}</strong>
        <span class="role-tag">${t('role.' + u.role) || u.role}</span>
        <p class="meta-line">${escapeHtml(u.email)} · ${t('admin.classLabel')}${escapeHtml(u.class || '—')}</p>
      </div>
      <div>
        ${renderRoleButton(u)}
      </div>
    </div>
  `).join('');

  listEl.querySelectorAll('[data-toggle-teacher]').forEach(btn => {
    btn.addEventListener('click', () => toggleTeacherRole(btn.dataset.toggleTeacher, btn.dataset.newRole));
  });
}

function renderRoleButton(u) {
  if (u.role === 'admin') return `<span class="small muted">${t('admin.managedManually')}</span>`;
  if (u.id === currentProfile.id) return `<span class="small muted">${t('admin.thatsYou')}</span>`;
  if (u.role === 'teacher') {
    return `<button class="secondary small" data-toggle-teacher="${u.id}" data-new-role="student">${t('admin.removeTeacher')}</button>`;
  }
  return `<button class="small" data-toggle-teacher="${u.id}" data-new-role="teacher">${t('admin.makeTeacher')}</button>`;
}

async function toggleTeacherRole(userId, newRole) {
  const { error } = await sb.from('profiles').update({ role: newRole }).eq('id', userId);
  if (error) {
    alert(t('admin.roleError') + error.message);
    return;
  }
  await loadUsers();
}

document.getElementById('user-search').addEventListener('input', (e) => {
  const q = e.target.value.trim().toLowerCase();
  if (!q) { renderUsers(allUsers); return; }
  renderUsers(allUsers.filter(u =>
    `${u.first_name} ${u.last_name} ${u.email} ${u.class}`.toLowerCase().includes(q)
  ));
});
