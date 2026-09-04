function categoryLabels() {
  return {
    project: t('category.project'),
    achievement: t('category.achievement'),
    certificate: t('category.certificate'),
    creative: t('category.creative'),
  };
}

let currentProfile = null;
let myRegisteredEvents = [];
let currentEditItemId = null; // если редактируем — сюда кладём id, чтобы удалять/подгружать вложения

(async () => {
  const auth = await requireAuth();
  if (!auth) return;
  currentProfile = auth.profile;
  renderHeader(currentProfile, 'dashboard');

  // Абсолютный путь от корня сайта — надёжнее, чем вырезать текущее имя
  // страницы из URL (на Vercel адреса показываются без ".html").
  const publicUrl = `${window.location.origin}/portfolio?id=${currentProfile.id}`;
  document.getElementById('public-link-line').innerHTML =
    `${t('dashboard.publicLink')}<a href="${publicUrl}" target="_blank">${publicUrl}</a>`;

  if (window.QRCode) {
    QRCode.toCanvas(document.getElementById('qr-canvas'), publicUrl, { width: 170, margin: 1 }, (err) => {
      if (err) console.error(err);
    });
  }

  initAvatar();
  await loadMyRegisteredEventsForSelect();
  await loadPortfolio();
  await loadMyEvents();
})();

// ---------- Аватар ----------
function initAvatar() {
  const preview = document.getElementById('avatar-preview');
  if (currentProfile.avatar_url) {
    preview.src = currentProfile.avatar_url;
    preview.style.display = 'inline-block';
  }

  document.getElementById('avatar-input').addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const errorEl = document.getElementById('avatar-error');
    errorEl.style.display = 'none';

    try {
      const path = `${currentProfile.id}/avatar-${Date.now()}-${file.name}`;
      const { error: uploadError } = await sb.storage.from('portfolio-files').upload(path, file);
      if (uploadError) throw uploadError;
      const { data: pub } = sb.storage.from('portfolio-files').getPublicUrl(path);

      const { error: updateError } = await sb.from('profiles').update({ avatar_url: pub.publicUrl }).eq('id', currentProfile.id);
      if (updateError) throw updateError;

      currentProfile.avatar_url = pub.publicUrl;
      preview.src = pub.publicUrl;
      preview.style.display = 'inline-block';
    } catch (err) {
      errorEl.textContent = t('dashboard.avatarError') + err.message;
      errorEl.style.display = 'block';
    }
  });
}

// ---------- Список мероприятий пользователя для выпадающего списка ----------
async function loadMyRegisteredEventsForSelect() {
  const { data } = await sb
    .from('event_registrations')
    .select('events(id, title, event_date)')
    .eq('user_id', currentProfile.id);

  myRegisteredEvents = (data || []).map(r => r.events).filter(Boolean);

  const select = document.getElementById('item-event');
  const noneOption = select.querySelector('option[value=""]');
  select.innerHTML = '';
  select.appendChild(noneOption);
  myRegisteredEvents.forEach(ev => {
    const opt = document.createElement('option');
    opt.value = ev.id;
    opt.textContent = `${ev.title} — ${formatDate(ev.event_date)}`;
    select.appendChild(opt);
  });
}

// ---------- Вкладки ----------
document.querySelectorAll('.tabs button').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.tabs button').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const tab = btn.dataset.tab;
    document.getElementById('tab-portfolio').style.display = tab === 'portfolio' ? '' : 'none';
    document.getElementById('tab-events').style.display = tab === 'events' ? '' : 'none';
  });
});

// ---------- Динамические строки вложений (файл/ссылка) ----------
const attachmentRows = document.getElementById('attachment-rows');

function addFileRow() {
  const row = document.createElement('div');
  row.className = 'attachment-row';
  row.style.cssText = 'display:flex; gap:8px; align-items:center; margin-top:6px;';
  row.innerHTML = `<input type="file" class="attachment-file-input" style="flex:1;">
    <button type="button" class="secondary small remove-row-btn">×</button>`;
  row.querySelector('.remove-row-btn').addEventListener('click', () => row.remove());
  attachmentRows.appendChild(row);
}

function addLinkRow() {
  const row = document.createElement('div');
  row.className = 'attachment-row';
  row.style.cssText = 'display:flex; gap:8px; align-items:center; margin-top:6px;';
  row.innerHTML = `<input type="url" class="attachment-link-input" placeholder="https://..." style="flex:1;">
    <button type="button" class="secondary small remove-row-btn">×</button>`;
  row.querySelector('.remove-row-btn').addEventListener('click', () => row.remove());
  attachmentRows.appendChild(row);
}

document.getElementById('add-file-row').addEventListener('click', addFileRow);
document.getElementById('add-link-row').addEventListener('click', addLinkRow);

// ---------- Существующие вложения (при редактировании) ----------
async function renderExistingAttachments(itemId) {
  const wrap = document.getElementById('existing-attachments');
  if (!itemId) { wrap.innerHTML = ''; return; }

  const { data } = await sb
    .from('portfolio_item_attachments')
    .select('*')
    .eq('item_id', itemId)
    .order('created_at', { ascending: true });

  if (!data || !data.length) { wrap.innerHTML = ''; return; }

  wrap.innerHTML = `<p class="hint">${t('item.existingAttachments')}</p>` + data.map(a => `
    <div class="attachment-row" style="display:flex; gap:8px; align-items:center; margin-top:4px;">
      <a href="${a.url}" target="_blank" class="small" style="flex:1; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">
        ${a.type === 'file' ? '📎' : '🔗'} ${escapeHtml(a.label || a.url)}
      </a>
      <button type="button" class="danger small" data-delete-attachment="${a.id}">×</button>
    </div>
  `).join('');

  wrap.querySelectorAll('[data-delete-attachment]').forEach(btn => {
    btn.addEventListener('click', async () => {
      if (!confirm(t('item.attachmentDeleteConfirm'))) return;
      await sb.from('portfolio_item_attachments').delete().eq('id', btn.dataset.deleteAttachment);
      await renderExistingAttachments(itemId);
    });
  });
}

// ---------- Форма добавления/редактирования ----------
const formWrap = document.getElementById('portfolio-form-wrap');
const form = document.getElementById('portfolio-form');
const itemError = document.getElementById('item-error');

document.getElementById('add-item-btn').addEventListener('click', () => {
  form.reset();
  document.getElementById('item-id').value = '';
  document.getElementById('form-title').textContent = t('dashboard.formTitleNew');
  currentEditItemId = null;
  attachmentRows.innerHTML = '';
  document.getElementById('existing-attachments').innerHTML = '';
  itemError.style.display = 'none';
  formWrap.style.display = 'block';
  window.scrollTo({ top: formWrap.offsetTop - 20, behavior: 'smooth' });
});

document.getElementById('cancel-item-btn').addEventListener('click', () => {
  formWrap.style.display = 'none';
});

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  itemError.style.display = 'none';
  const saveBtn = document.getElementById('save-item-btn');
  saveBtn.disabled = true;
  saveBtn.textContent = t('saving');

  try {
    const id = document.getElementById('item-id').value;
    const title = document.getElementById('item-title').value.trim();
    const category = document.getElementById('item-category').value;
    const item_date = document.getElementById('item-date').value || null;
    const description = document.getElementById('item-description').value.trim();
    const event_id = document.getElementById('item-event').value || null;

    let itemId = id;

    if (id) {
      const { error } = await sb.from('portfolio_items')
        .update({ title, category, item_date, description, event_id })
        .eq('id', id);
      if (error) throw error;
    } else {
      const { data: inserted, error } = await sb.from('portfolio_items').insert({
        user_id: currentProfile.id,
        title, category, item_date, description, event_id
      }).select().single();
      if (error) throw error;
      itemId = inserted.id;
    }

    // Загружаем новые файлы и ссылки как вложения
    const fileInputs = attachmentRows.querySelectorAll('.attachment-file-input');
    for (const input of fileInputs) {
      if (input.files.length === 0) continue;
      const file = input.files[0];
      const path = `${currentProfile.id}/${Date.now()}-${file.name}`;
      const { error: uploadError } = await sb.storage.from('portfolio-files').upload(path, file);
      if (uploadError) throw uploadError;
      const { data: pub } = sb.storage.from('portfolio-files').getPublicUrl(path);
      await sb.from('portfolio_item_attachments').insert({
        item_id: itemId, type: 'file', url: pub.publicUrl, label: file.name
      });
    }

    const linkInputs = attachmentRows.querySelectorAll('.attachment-link-input');
    for (const input of linkInputs) {
      const url = input.value.trim();
      if (!url) continue;
      await sb.from('portfolio_item_attachments').insert({
        item_id: itemId, type: 'link', url, label: url
      });
    }

    formWrap.style.display = 'none';
    await loadPortfolio();
  } catch (err) {
    console.error(err);
    itemError.textContent = t('item.saveError') + err.message;
    itemError.style.display = 'block';
  } finally {
    saveBtn.disabled = false;
    saveBtn.textContent = t('save');
  }
});

// ---------- Загрузка и отрисовка портфолио ----------
async function loadPortfolio() {
  const listEl = document.getElementById('portfolio-list');
  const { data, error } = await sb
    .from('portfolio_items')
    .select('*, events(id, title, event_date)')
    .eq('user_id', currentProfile.id)
    .order('item_date', { ascending: false, nullsFirst: false });

  if (error) {
    listEl.innerHTML = `<p class="error-msg">${t('portfolio.loadError')}</p>`;
    console.error(error);
    return;
  }

  if (!data.length) {
    listEl.innerHTML = `<div class="empty-state">${t('portfolio.empty')}</div>`;
    return;
  }

  // Подтягиваем вложения и комментарии учителя одним запросом на все элементы
  const ids = data.map(i => i.id);
  const { data: attachments } = await sb.from('portfolio_item_attachments').select('*').in('item_id', ids);
  const { data: comments } = await sb.from('portfolio_item_comments').select('*, profiles(first_name, last_name)').in('item_id', ids);

  const attByItem = {};
  (attachments || []).forEach(a => { (attByItem[a.item_id] = attByItem[a.item_id] || []).push(a); });
  const commentsByItem = {};
  (comments || []).forEach(c => { (commentsByItem[c.item_id] = commentsByItem[c.item_id] || []).push(c); });

  const labels = categoryLabels();
  listEl.innerHTML = data.map(item => {
    const atts = attByItem[item.id] || [];
    const cmts = commentsByItem[item.id] || [];
    return `
    <div class="card">
      <div class="card-row">
        <div>
          <span class="category-tag">${labels[item.category] || item.category}</span>
          <h3 style="display:inline;">${escapeHtml(item.title)}</h3>
          <p class="meta-line">${item.item_date ? formatDate(item.item_date) : ''}</p>
          ${item.events ? `<p class="meta-line">${t('item.linkedEvent')}${escapeHtml(item.events.title)}</p>` : ''}
        </div>
        <div>
          <button class="secondary small" data-edit="${item.id}">${t('edit')}</button>
          <button class="danger small" data-delete="${item.id}">${t('delete')}</button>
        </div>
      </div>
      ${item.description ? `<p>${escapeHtml(item.description)}</p>` : ''}
      ${atts.map(a => `<p><a href="${a.url}" target="_blank">${a.type === 'file' ? '📎' : '🔗'} ${escapeHtml(a.label || a.url)}</a></p>`).join('')}
      ${cmts.length ? `<hr class="divider" style="margin:10px 0;"><p class="small muted">${t('comment.label')}</p>` + cmts.map(c => `
        <p class="small">— ${escapeHtml(c.profiles ? c.profiles.first_name + ' ' + c.profiles.last_name : '')}: ${escapeHtml(c.comment)}</p>
      `).join('') : ''}
    </div>
  `;
  }).join('');

  listEl.querySelectorAll('[data-edit]').forEach(btn => {
    btn.addEventListener('click', () => editItem(data.find(d => d.id === btn.dataset.edit)));
  });
  listEl.querySelectorAll('[data-delete]').forEach(btn => {
    btn.addEventListener('click', () => deleteItem(btn.dataset.delete));
  });
}

async function editItem(item) {
  document.getElementById('item-id').value = item.id;
  document.getElementById('item-title').value = item.title;
  document.getElementById('item-category').value = item.category;
  document.getElementById('item-date').value = item.item_date || '';
  document.getElementById('item-description').value = item.description || '';
  document.getElementById('item-event').value = item.event_id || '';
  document.getElementById('form-title').textContent = t('dashboard.formTitleEdit');
  currentEditItemId = item.id;
  attachmentRows.innerHTML = '';
  await renderExistingAttachments(item.id);
  itemError.style.display = 'none';
  formWrap.style.display = 'block';
  window.scrollTo({ top: formWrap.offsetTop - 20, behavior: 'smooth' });
}

async function deleteItem(id) {
  if (!confirm(t('item.deleteConfirm'))) return;
  const { error } = await sb.from('portfolio_items').delete().eq('id', id);
  if (error) {
    alert(t('item.deleteError') + error.message);
    return;
  }
  await loadPortfolio();
}

// ---------- Мои записи на события ----------
async function loadMyEvents() {
  const listEl = document.getElementById('my-events-list');
  const { data, error } = await sb
    .from('event_registrations')
    .select('id, events(*)')
    .eq('user_id', currentProfile.id);

  if (error) {
    listEl.innerHTML = `<p class="error-msg">${t('events.loadError')}</p>`;
    return;
  }

  if (!data.length) {
    listEl.innerHTML = `<div class="empty-state">${t('events.empty')} <a href="calendar.html">${t('events.viewCalendar')}</a>.</div>`;
    return;
  }

  listEl.innerHTML = data.map(reg => {
    const ev = reg.events;
    if (!ev) return '';
    return `
      <div class="card sage">
        <h3>${escapeHtml(ev.title)}</h3>
        <p class="meta-line">${formatDateTime(ev.event_date)} · ${escapeHtml(ev.location || '')}</p>
        ${ev.description ? `<p>${escapeHtml(ev.description)}</p>` : ''}
        <button class="danger small" data-cancel="${reg.id}">${t('events.cancelReg')}</button>
      </div>
    `;
  }).join('');

  listEl.querySelectorAll('[data-cancel]').forEach(btn => {
    btn.addEventListener('click', () => cancelRegistration(btn.dataset.cancel));
  });
}

async function cancelRegistration(regId) {
  if (!confirm(t('events.cancelConfirm'))) return;
  const { error } = await sb.from('event_registrations').delete().eq('id', regId);
  if (error) {
    alert(t('events.cancelError') + error.message);
    return;
  }
  await loadMyEvents();
}
