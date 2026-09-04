let currentProfile = null;

(async () => {
  const auth = await requireAuth();
  if (!auth) return;
  currentProfile = auth.profile;
  renderHeader(currentProfile, 'announcements');

  if (currentProfile.role === 'teacher' || currentProfile.role === 'admin') {
    document.getElementById('create-form-wrap').style.display = 'block';
  }

  await loadAnnouncements();
})();

document.getElementById('announcement-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const errorEl = document.getElementById('an-error');
  errorEl.style.display = 'none';
  const btn = document.getElementById('publish-btn');
  btn.disabled = true;
  btn.textContent = t('announcements.publishing');

  try {
    const title = document.getElementById('an-title').value.trim();
    const body = document.getElementById('an-body').value.trim();

    const { error } = await sb.from('announcements').insert({
      title, body, created_by: currentProfile.id
    });
    if (error) throw error;

    document.getElementById('announcement-form').reset();
    await loadAnnouncements();
  } catch (err) {
    errorEl.textContent = t('announcements.error') + err.message;
    errorEl.style.display = 'block';
  } finally {
    btn.disabled = false;
    btn.textContent = t('announcements.publish');
  }
});

async function loadAnnouncements() {
  const listEl = document.getElementById('announcements-list');
  const { data, error } = await sb
    .from('announcements')
    .select('*, profiles(first_name, last_name)')
    .order('created_at', { ascending: false });

  if (error) {
    listEl.innerHTML = `<p class="error-msg">${t('announcements.loadError')}</p>`;
    return;
  }

  if (!data.length) {
    listEl.innerHTML = `<div class="empty-state">${t('announcements.empty')}</div>`;
    return;
  }

  listEl.innerHTML = data.map(a => {
    const canDelete = a.created_by === currentProfile.id || currentProfile.role === 'admin';
    const author = a.profiles ? `${a.profiles.first_name} ${a.profiles.last_name}` : '';
    return `
      <div class="card">
        <h3>${escapeHtml(a.title)}</h3>
        <p class="meta-line">${formatDateTime(a.created_at)} · ${t('announcements.by')}${escapeHtml(author)}</p>
        <p>${escapeHtml(a.body)}</p>
        ${canDelete ? `<button class="danger small" data-delete="${a.id}">${t('delete')}</button>` : ''}
      </div>
    `;
  }).join('');

  listEl.querySelectorAll('[data-delete]').forEach(btn => {
    btn.addEventListener('click', async () => {
      if (!confirm(t('announcements.deleteConfirm'))) return;
      const { error } = await sb.from('announcements').delete().eq('id', btn.dataset.delete);
      if (error) { alert(t('announcements.error') + error.message); return; }
      await loadAnnouncements();
    });
  });
}
