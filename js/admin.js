let currentProfile = null;
let allUsers = [];

const roleLabels = { student: 'ученик', teacher: 'учитель', admin: 'админ' };

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
    document.getElementById('users-list').innerHTML = `<p class="error-msg">Не удалось загрузить пользователей.</p>`;
    return;
  }
  allUsers = data;
  renderUsers(allUsers);
}

function renderUsers(users) {
  const listEl = document.getElementById('users-list');
  if (!users.length) {
    listEl.innerHTML = `<div class="empty-state">Пользователи не найдены.</div>`;
    return;
  }

  listEl.innerHTML = users.map(u => `
    <div class="card plain card-row">
      <div>
        <strong>${escapeHtml(u.first_name)} ${escapeHtml(u.last_name)}</strong>
        <span class="role-tag">${roleLabels[u.role] || u.role}</span>
        <p class="meta-line">${escapeHtml(u.email)} · класс: ${escapeHtml(u.class || '—')}</p>
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
  if (u.role === 'admin') return '<span class="small muted">управляется вручную</span>';
  if (u.id === currentProfile.id) return '<span class="small muted">это вы</span>';
  if (u.role === 'teacher') {
    return `<button class="secondary small" data-toggle-teacher="${u.id}" data-new-role="student">Снять роль учителя</button>`;
  }
  return `<button class="small" data-toggle-teacher="${u.id}" data-new-role="teacher">Сделать учителем</button>`;
}

async function toggleTeacherRole(userId, newRole) {
  const { error } = await sb.from('profiles').update({ role: newRole }).eq('id', userId);
  if (error) {
    alert('Не удалось изменить роль: ' + error.message);
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
