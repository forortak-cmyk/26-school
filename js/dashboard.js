const categoryLabels = {
  project: 'Проект',
  achievement: 'Достижение',
  certificate: 'Сертификат',
  creative: 'Творческая работа',
};

let currentProfile = null;

(async () => {
  const auth = await requireAuth();
  if (!auth) return;
  currentProfile = auth.profile;
  renderHeader(currentProfile, 'dashboard');

  const publicUrl = `${window.location.origin}${window.location.pathname.replace('dashboard.html', '')}portfolio.html?id=${currentProfile.id}`;
  document.getElementById('public-link-line').innerHTML =
    `Публичная ссылка на ваше портфолио: <a href="${publicUrl}" target="_blank">${publicUrl}</a>`;

  await loadPortfolio();
  await loadMyEvents();
})();

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

// ---------- Форма добавления/редактирования ----------
const formWrap = document.getElementById('portfolio-form-wrap');
const form = document.getElementById('portfolio-form');
const itemError = document.getElementById('item-error');

document.getElementById('add-item-btn').addEventListener('click', () => {
  form.reset();
  document.getElementById('item-id').value = '';
  document.getElementById('form-title').textContent = 'Новая работа';
  document.getElementById('existing-file-hint').textContent = '';
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
  saveBtn.textContent = 'Сохраняем...';

  try {
    const id = document.getElementById('item-id').value;
    const title = document.getElementById('item-title').value.trim();
    const category = document.getElementById('item-category').value;
    const item_date = document.getElementById('item-date').value || null;
    const description = document.getElementById('item-description').value.trim();
    const external_link = document.getElementById('item-link').value.trim() || null;
    const fileInput = document.getElementById('item-file');

    let file_url = null;

    if (fileInput.files.length > 0) {
      const file = fileInput.files[0];
      const path = `${currentProfile.id}/${Date.now()}-${file.name}`;
      const { error: uploadError } = await sb.storage.from('portfolio-files').upload(path, file);
      if (uploadError) throw uploadError;
      const { data: pub } = sb.storage.from('portfolio-files').getPublicUrl(path);
      file_url = pub.publicUrl;
    }

    if (id) {
      const updatePayload = { title, category, item_date, description, external_link };
      if (file_url) updatePayload.file_url = file_url;
      const { error } = await sb.from('portfolio_items').update(updatePayload).eq('id', id);
      if (error) throw error;
    } else {
      const { error } = await sb.from('portfolio_items').insert({
        user_id: currentProfile.id,
        title, category, item_date, description, external_link, file_url
      });
      if (error) throw error;
    }

    formWrap.style.display = 'none';
    await loadPortfolio();
  } catch (err) {
    console.error(err);
    itemError.textContent = 'Ошибка сохранения: ' + err.message;
    itemError.style.display = 'block';
  } finally {
    saveBtn.disabled = false;
    saveBtn.textContent = 'Сохранить';
  }
});

// ---------- Загрузка и отрисовка портфолио ----------
async function loadPortfolio() {
  const listEl = document.getElementById('portfolio-list');
  const { data, error } = await sb
    .from('portfolio_items')
    .select('*')
    .eq('user_id', currentProfile.id)
    .order('item_date', { ascending: false, nullsFirst: false });

  if (error) {
    listEl.innerHTML = `<p class="error-msg">Не удалось загрузить портфолио.</p>`;
    return;
  }

  if (!data.length) {
    listEl.innerHTML = `<div class="empty-state">Пока пусто. Добавьте первую работу в портфолио.</div>`;
    return;
  }

  listEl.innerHTML = data.map(item => `
    <div class="card">
      <div class="card-row">
        <div>
          <span class="category-tag">${categoryLabels[item.category] || item.category}</span>
          <h3 style="display:inline;">${escapeHtml(item.title)}</h3>
          <p class="meta-line">${item.item_date ? formatDate(item.item_date) : ''}</p>
        </div>
        <div>
          <button class="secondary small" data-edit="${item.id}">Изменить</button>
          <button class="danger small" data-delete="${item.id}">Удалить</button>
        </div>
      </div>
      ${item.description ? `<p>${escapeHtml(item.description)}</p>` : ''}
      ${item.file_url ? `<p><a href="${item.file_url}" target="_blank">Открыть файл</a></p>` : ''}
      ${item.external_link ? `<p><a href="${item.external_link}" target="_blank">Внешняя ссылка</a></p>` : ''}
    </div>
  `).join('');

  listEl.querySelectorAll('[data-edit]').forEach(btn => {
    btn.addEventListener('click', () => editItem(data.find(d => d.id === btn.dataset.edit)));
  });
  listEl.querySelectorAll('[data-delete]').forEach(btn => {
    btn.addEventListener('click', () => deleteItem(btn.dataset.delete));
  });
}

function editItem(item) {
  document.getElementById('item-id').value = item.id;
  document.getElementById('item-title').value = item.title;
  document.getElementById('item-category').value = item.category;
  document.getElementById('item-date').value = item.item_date || '';
  document.getElementById('item-description').value = item.description || '';
  document.getElementById('item-link').value = item.external_link || '';
  document.getElementById('form-title').textContent = 'Редактировать работу';
  document.getElementById('existing-file-hint').textContent = item.file_url
    ? 'Уже прикреплён файл. Выберите новый, чтобы заменить его.' : '';
  itemError.style.display = 'none';
  formWrap.style.display = 'block';
  window.scrollTo({ top: formWrap.offsetTop - 20, behavior: 'smooth' });
}

async function deleteItem(id) {
  if (!confirm('Удалить эту работу из портфолио?')) return;
  const { error } = await sb.from('portfolio_items').delete().eq('id', id);
  if (error) {
    alert('Не удалось удалить: ' + error.message);
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
    listEl.innerHTML = `<p class="error-msg">Не удалось загрузить записи.</p>`;
    return;
  }

  if (!data.length) {
    listEl.innerHTML = `<div class="empty-state">Вы пока не записаны ни на одно событие. <a href="calendar.html">Посмотреть календарь</a>.</div>`;
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
        <button class="danger small" data-cancel="${reg.id}">Отменить запись</button>
      </div>
    `;
  }).join('');

  listEl.querySelectorAll('[data-cancel]').forEach(btn => {
    btn.addEventListener('click', () => cancelRegistration(btn.dataset.cancel));
  });
}

async function cancelRegistration(regId) {
  if (!confirm('Отменить запись на это событие?')) return;
  const { error } = await sb.from('event_registrations').delete().eq('id', regId);
  if (error) {
    alert('Не удалось отменить запись: ' + error.message);
    return;
  }
  await loadMyEvents();
}
