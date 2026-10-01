(() => {
  'use strict';

  const $ = (s) => document.querySelector(s);
  const $$ = (s) => [...document.querySelectorAll(s)];
  const E = () => window.CAIC_EDITOR;
  const esc = (v) => E()?.esc ? E().esc(v) : String(v ?? '');
  const normDT = (v) => v ? String(v).slice(0, 16) : '';

  function field(label, path, type = 'text', opts = {}) {
    const editor = E();
    const val = editor?.getDeep ? editor.getDeep(path) : '';
    const id = `f_${path.replace(/[^a-z0-9]/gi, '_')}`;

    if (type === 'textarea') {
      return `<div class="field"><label for="${id}">${esc(label)}</label><textarea id="${id}" data-path="${esc(path)}" ${opts.placeholder ? `placeholder="${esc(opts.placeholder)}"` : ''}>${esc(val ?? '')}</textarea></div>`;
    }
    if (type === 'checkbox') {
      return `<div class="switchrow"><label for="${id}"><b>${esc(label)}</b></label><input id="${id}" data-path="${esc(path)}" type="checkbox" ${val === true ? 'checked' : ''}></div>`;
    }
    if (type === 'datetime-local') {
      return `<div class="field"><label for="${id}">${esc(label)}</label><input id="${id}" data-path="${esc(path)}" type="datetime-local" value="${esc(normDT(val))}"></div>`;
    }
    if (type === 'image') {
      return `<div class="field"><label>${esc(label)}</label><div class="media-row"><input data-path="${esc(path)}" value="${esc(val || '')}" placeholder="/assets/... ou URL"><button class="btn ghost sm pickMedia" data-media-path="${esc(path)}" type="button">🖼</button></div></div>`;
    }
    return `<div class="field"><label for="${id}">${esc(label)}</label><input id="${id}" data-path="${esc(path)}" type="${type}" value="${esc(val ?? '')}" ${opts.placeholder ? `placeholder="${esc(opts.placeholder)}"` : ''}></div>`;
  }

  const group = (title, html) => `<div class="group"><h3>${esc(title)}</h3>${html}</div>`;

  const listButtons = (path, i) => `
    <button class="btn ghost sm moveItem" data-array="${esc(path)}" data-index="${i}" data-dir="-1" type="button">↑</button>
    <button class="btn ghost sm moveItem" data-array="${esc(path)}" data-index="${i}" data-dir="1" type="button">↓</button>
    <button class="btn danger sm arrayDelete" data-array="${esc(path)}" data-index="${i}" type="button">Excluir</button>`;

  function addArray(path) {
    const editor = E();
    const arr = editor?.getDeep?.(path);
    if (!Array.isArray(arr)) return editor?.toast?.('Não foi possível adicionar este item.');

    const now = Date.now();
    const templates = {
      quickLinks: { label: 'Novo atalho', sub: 'Descrição', href: '#', icon: String(arr.length + 1).padStart(2, '0'), visible: true },
      news: { id: `noticia-${now}`, visible: true, date: new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date()), title: 'Nova notícia', text: 'Escreva aqui o comunicado.', image: '', linkLabel: 'Ver publicação →', startsAt: '', endsAt: '' },
      events: { date: new Date().toISOString(), title: 'Novo evento', desc: '', type: 'school' },
      menu: { label: 'Novo item', href: '#', visible: true, featured: false },
      'gallery.items': { image: '', caption: 'Nova foto', alt: '', visible: true, startsAt: '', endsAt: '' },
      'documents.items': { type: 'PDF', title: 'Novo documento', desc: '', href: '', visible: true, startsAt: '', endsAt: '' }
    };

    if (path === 'hero.images') arr.push('');
    else if (templates[path]) arr.push(JSON.parse(JSON.stringify(templates[path])));
    else return editor?.toast?.('Tipo de item ainda não configurado.');

    editor.markDirty();
    window.dispatchEvent(new CustomEvent('caic-editor-rerender'));
  }

  function renderHero(s) {
    return group('Exibição',
      field('Mostrar destaque', 'hero.visible', 'checkbox') +
      `<div class="row2">${field('Início', 'hero.startsAt', 'datetime-local')}${field('Retirar do ar', 'hero.endsAt', 'datetime-local')}</div>`
    ) + group('Conteúdo',
      field('Selo / linha superior', 'hero.eyebrow') +
      field('Título', 'hero.title') +
      field('Texto', 'hero.text', 'textarea') +
      field('Enquadramento das imagens', 'hero.imagePosition', 'text', { placeholder: 'center center, center top, 50% 30%' })
    ) + group('Imagens do slider',
      (s.hero?.images || []).map((x, i) => `
        <div class="list-card">
          <div class="list-card-head"><strong>Imagem ${i + 1}</strong><button class="btn danger sm arrayDelete" data-array="hero.images" data-index="${i}" type="button">Excluir</button></div>
          ${field('Arquivo', `hero.images.${i}`, 'image')}
        </div>`).join('') +
      `<button class="btn ghost sm arrayAdd" data-array="hero.images" type="button">+ Adicionar imagem</button>` +
      field('Troca automática (ms)', 'hero.interval', 'number')
    );
  }

  function renderQuickLinks(s) {
    return `<div class="hint">Atalhos logo abaixo do destaque. Use as setas para mudar a ordem.</div>` +
      (s.quickLinks || []).map((x, i) => `
        <div class="list-card">
          <div class="list-card-head"><strong>Atalho ${i + 1}</strong>${listButtons('quickLinks', i)}</div>
          ${field('Visível', `quickLinks.${i}.visible`, 'checkbox')}
          <div class="row2">${field('Número/ícone', `quickLinks.${i}.icon`)}${field('Título', `quickLinks.${i}.label`)}</div>
          ${field('Descrição', `quickLinks.${i}.sub`)}
          ${field('Link', `quickLinks.${i}.href`)}
        </div>`).join('') +
      `<button class="btn primary sm arrayAdd" data-array="quickLinks" type="button">+ Novo atalho</button>`;
  }

  function renderNotice() {
    return group('Exibição',
      field('Mostrar aviso', 'featuredNotice.visible', 'checkbox') +
      `<div class="row2">${field('Início', 'featuredNotice.startsAt', 'datetime-local')}${field('Retirar do ar', 'featuredNotice.endsAt', 'datetime-local')}</div>`
    ) + group('Conteúdo',
      field('Etiqueta', 'featuredNotice.tag') +
      field('Título', 'featuredNotice.title') +
      field('Texto', 'featuredNotice.text', 'textarea') +
      field('Imagem', 'featuredNotice.image', 'image') +
      field('Data/rodapé', 'featuredNotice.date')
    );
  }

  function renderNews(s) {
    return `<button class="btn yellow" id="aiNewsBtn" style="margin-bottom:12px" type="button">✨ Criar notícia com assistente</button>` +
      (s.news || []).map((n, i) => `
        <div class="list-card">
          <div class="list-card-head"><strong>${esc(n.title || `Notícia ${i + 1}`)}</strong>${listButtons('news', i)}</div>
          ${field('Visível', `news.${i}.visible`, 'checkbox')}
          <div class="row2">${field('Data exibida', `news.${i}.date`)}${field('ID', `news.${i}.id`)}</div>
          ${field('Título', `news.${i}.title`)}
          ${field('Texto', `news.${i}.text`, 'textarea')}
          ${field('Imagem', `news.${i}.image`, 'image')}
          ${field('Texto do botão', `news.${i}.linkLabel`)}
          <div class="row2">${field('Publicar a partir de', `news.${i}.startsAt`, 'datetime-local')}${field('Retirar em', `news.${i}.endsAt`, 'datetime-local')}</div>
        </div>`).join('') +
      `<button class="btn primary sm arrayAdd" data-array="news" type="button">+ Nova notícia</button>`;
  }

  function renderGallery(s) {
    return group('Seção',
      field('Mostrar galeria', 'gallery.visible', 'checkbox') +
      field('Linha superior', 'gallery.kicker') +
      field('Título', 'gallery.title') +
      field('Descrição', 'gallery.text', 'textarea')
    ) + (s.gallery?.items || []).map((x, i) => `
      <div class="list-card">
        <div class="list-card-head"><strong>${esc(x.caption || `Foto ${i + 1}`)}</strong>${listButtons('gallery.items', i)}</div>
        ${field('Visível', `gallery.items.${i}.visible`, 'checkbox')}
        ${field('Imagem', `gallery.items.${i}.image`, 'image')}
        ${field('Legenda', `gallery.items.${i}.caption`)}
        ${field('Texto alternativo', `gallery.items.${i}.alt`)}
        <div class="row2">${field('Mostrar a partir de', `gallery.items.${i}.startsAt`, 'datetime-local')}${field('Retirar em', `gallery.items.${i}.endsAt`, 'datetime-local')}</div>
      </div>`).join('') +
      `<button class="btn primary sm arrayAdd" data-array="gallery.items" type="button">+ Adicionar foto</button>`;
  }

  function renderDocuments(s) {
    return group('Seção',
      field('Mostrar documentos', 'documents.visible', 'checkbox') +
      field('Linha superior', 'documents.kicker') +
      field('Título', 'documents.title') +
      field('Descrição', 'documents.text', 'textarea')
    ) + (s.documents?.items || []).map((x, i) => `
      <div class="list-card">
        <div class="list-card-head"><strong>${esc(x.title || `Documento ${i + 1}`)}</strong>${listButtons('documents.items', i)}</div>
        ${field('Visível', `documents.items.${i}.visible`, 'checkbox')}
        <div class="row2">${field('Tipo', `documents.items.${i}.type`)}${field('Título', `documents.items.${i}.title`)}</div>
        ${field('Descrição', `documents.items.${i}.desc`, 'textarea')}
        ${field('Link/arquivo', `documents.items.${i}.href`)}
        <label class="btn ghost sm">⬆ Enviar PDF/arquivo<input class="docFileUpload" data-path="documents.items.${i}.href" type="file" accept=".pdf,.doc,.docx,.xls,.xlsx" hidden></label>
        <div class="row2" style="margin-top:10px">${field('Mostrar a partir de', `documents.items.${i}.startsAt`, 'datetime-local')}${field('Retirar em', `documents.items.${i}.endsAt`, 'datetime-local')}</div>
      </div>`).join('') +
      `<button class="btn primary sm arrayAdd" data-array="documents.items" type="button">+ Novo documento</button>`;
  }

  function renderSchedule(s) {
    return group('Cabeçalho',
      field('Visível', 'schedule.visible', 'checkbox') +
      field('Linha superior', 'schedule.kicker') +
      field('Título', 'schedule.title') +
      field('Descrição', 'schedule.text', 'textarea') +
      `<div class="row2">${field('Entrada', 'schedule.entry')}${field('Saída', 'schedule.exit')}</div>`
    ) + group('Períodos',
      (s.schedule?.periods || []).map((x, i) => `
        <div class="list-card">
          <div class="list-card-head"><strong>${i + 1}º bloco</strong></div>
          ${field('Nome', `schedule.periods.${i}.name`)}
          <div class="row2">${field('Horário', `schedule.periods.${i}.time`)}${field('Duração', `schedule.periods.${i}.duration`)}</div>
        </div>`).join('')
    );
  }

  function renderCalendar(s) {
    return group('Calendário',
      field('Visível', 'calendar.visible', 'checkbox') +
      field('Linha superior', 'calendar.kicker') +
      field('Título', 'calendar.title') +
      field('Descrição', 'calendar.text', 'textarea') +
      field('Imagem', 'calendar.image', 'image') +
      field('PDF', 'calendar.pdf')
    ) + group('Indicadores',
      (s.calendar?.stats || []).map((x, i) => `<div class="row2">${field('Valor', `calendar.stats.${i}.value`)}${field('Legenda', `calendar.stats.${i}.label`)}</div>`).join('')
    ) + `<h3 style="color:var(--navy)">Eventos</h3>` +
      (s.events || []).map((x, i) => `
        <div class="list-card">
          <div class="list-card-head"><strong>${esc(x.title || `Evento ${i + 1}`)}</strong>${listButtons('events', i)}</div>
          ${field('Data e hora', `events.${i}.date`, 'datetime-local')}
          ${field('Título', `events.${i}.title`)}
          ${field('Descrição', `events.${i}.desc`)}
          ${field('Tipo', `events.${i}.type`)}
        </div>`).join('') +
      `<button class="btn primary sm arrayAdd" data-array="events" type="button">+ Novo evento</button>`;
  }

  function renderSchool() {
    return group('Identidade da escola',
      field('Nome completo', 'school.name') +
      `<div class="row2">${field('Nome curto', 'school.shortName')}${field('Cidade/UF', 'school.city')}</div>` +
      `<div class="hint">Estes dados aparecem no cabeçalho e no rodapé do site.</div>`
    );
  }

  function renderMenu(s) {
    return `<div class="hint">Edite os itens do menu superior. Marque “Destacado” para usar o botão azul.</div>` +
      (s.menu || []).map((x, i) => `
        <div class="list-card">
          <div class="list-card-head"><strong>${esc(x.label || `Item ${i + 1}`)}</strong>${listButtons('menu', i)}</div>
          <div class="row2">${field('Visível', `menu.${i}.visible`, 'checkbox')}${field('Destacado', `menu.${i}.featured`, 'checkbox')}</div>
          ${field('Texto', `menu.${i}.label`)}
          ${field('Link', `menu.${i}.href`)}
        </div>`).join('') +
      `<button class="btn primary sm arrayAdd" data-array="menu" type="button">+ Novo item do menu</button>`;
  }

  function renderLocation() {
    return group('Seção',
      field('Visível', 'location.visible', 'checkbox') +
      field('Linha superior', 'location.kicker') +
      field('Título', 'location.title') +
      field('Descrição da seção', 'location.text', 'textarea')
    ) + group('Endereço',
      field('Nome da escola', 'location.school') +
      field('Complemento', 'location.description') +
      field('Endereço', 'location.address', 'textarea') +
      field('Busca no Google Maps', 'location.mapsQuery')
    );
  }

  function renderFooter() {
    return group('Rodapé',
      field('Endereço', 'footer.address', 'textarea') +
      field('Copyright', 'footer.copyright') +
      field('Linha final', 'footer.label')
    );
  }

  function renderSeo() {
    return `<div class="hint">Define como a página aparece no Google e ao compartilhar o link no WhatsApp/Facebook.</div>` +
      group('Metadados',
        field('Título da página', 'seo.title') +
        field('Descrição', 'seo.description', 'textarea') +
        field('Imagem de compartilhamento', 'seo.ogImage', 'image')
      );
  }

  const renderers = {
    hero: renderHero,
    quickLinks: renderQuickLinks,
    featuredNotice: renderNotice,
    news: renderNews,
    gallery: renderGallery,
    documents: renderDocuments,
    schedule: renderSchedule,
    calendar: renderCalendar,
    school: renderSchool,
    menu: renderMenu,
    location: renderLocation,
    footer: renderFooter,
    seo: renderSeo
  };

  const titles = {
    hero: 'Destaque / Hero',
    quickLinks: 'Atalhos rápidos',
    featuredNotice: 'Aviso principal',
    news: 'Notícias',
    gallery: 'Galeria',
    documents: 'Documentos',
    schedule: 'Horários',
    calendar: 'Calendário e eventos',
    school: 'Dados da escola',
    menu: 'Menu do site',
    location: 'Localização',
    footer: 'Rodapé',
    seo: 'SEO / Compartilhamento'
  };

  function renderProps() {
    const editor = E();
    if (!editor?.state) return;

    const section = editor.currentSection || 'hero';
    $('#propsTitle').textContent = titles[section] || section;
    $$('.nav-item').forEach((b) => b.classList.toggle('active', b.dataset.section === section));

    try {
      const renderer = renderers[section];
      $('#propsBody').innerHTML = renderer ? renderer(editor.state) : '<div class="empty">Seção sem editor configurado.</div>';
      wireProps();
    } catch (err) {
      console.error('CAIC editor render error:', err);
      $('#propsBody').innerHTML = `<div class="login-error"><b>Não foi possível abrir esta seção.</b><br>${esc(err?.message || err)}</div>`;
    }
  }

  function wireProps() {
    const editor = E();

    $$('[data-path]').forEach((el) => {
      const eventName = el.type === 'checkbox' ? 'change' : 'input';
      el.addEventListener(eventName, () => {
        let value = el.type === 'checkbox' ? el.checked : el.value;
        if (el.type === 'number') value = Number(value);
        editor.setDeep(el.dataset.path, value);
      });
    });

    $$('.pickMedia').forEach((b) => b.onclick = () => editor.openMedia(b.dataset.mediaPath));
    $$('.arrayDelete').forEach((b) => b.onclick = () => editor.deleteArray(b.dataset.array, Number(b.dataset.index)));
    $$('.arrayAdd').forEach((b) => b.onclick = () => addArray(b.dataset.array));
    $$('.moveItem').forEach((b) => b.onclick = () => editor.moveArray(b.dataset.array, Number(b.dataset.index), Number(b.dataset.dir)));
    $$('.docFileUpload').forEach((x) => {
      x.onchange = async () => {
        const file = x.files?.[0];
        if (file && window.CAIC_FILES) await window.CAIC_FILES.upload(x.dataset.path, file);
        x.value = '';
      };
    });

    $('#aiNewsBtn')?.addEventListener('click', () => $('#aiModal')?.classList.add('open'));
  }

  function renderOrder() {
    const editor = E();
    if (!editor?.state) return;

    const names = {
      avisos: '📢 Avisos',
      noticias: '📰 Notícias',
      galeria: '📸 Galeria',
      documentos: '📄 Documentos',
      horarios: '🕒 Horários',
      calendario: '📅 Calendário',
      localizacao: '📍 Localização'
    };
    const root = $('#sectionOrder');
    if (!root) return;

    root.innerHTML = (editor.state.sectionOrder || []).map((x) => `<div class="order-item" draggable="true" data-id="${esc(x)}">☰ ${names[x] || esc(x)}</div>`).join('');

    let drag = null;
    $$('.order-item').forEach((el) => {
      el.ondragstart = () => { drag = el.dataset.id; el.classList.add('dragging'); };
      el.ondragend = () => el.classList.remove('dragging');
      el.ondragover = (ev) => ev.preventDefault();
      el.ondrop = (ev) => {
        ev.preventDefault();
        const target = el.dataset.id;
        if (!drag || drag === target) return;
        const arr = editor.state.sectionOrder;
        const from = arr.indexOf(drag);
        const to = arr.indexOf(target);
        if (from < 0 || to < 0) return;
        arr.splice(from, 1);
        arr.splice(to, 0, drag);
        editor.markDirty();
        renderOrder();
      };
    });
  }

  function rerender() {
    renderProps();
    renderOrder();
  }

  window.addEventListener('caic-editor-loaded', rerender);
  window.addEventListener('caic-editor-rerender', rerender);

  $$('.nav-item').forEach((b) => b.addEventListener('click', () => {
    const editor = E();
    if (!editor) return;
    editor.setSection(b.dataset.section);
  }));

  $('#aiTemplateBtn')?.addEventListener('click', () => {
    const editor = E();
    if (!editor?.state) return;
    const notes = $('#aiNotes')?.value.trim() || '';
    editor.state.news.unshift({
      id: `noticia-${Date.now()}`,
      visible: true,
      date: new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date()),
      title: notes ? notes.split(/[.!?\n]/)[0].slice(0, 70) : 'Nova notícia',
      text: notes || 'Complete as informações desta notícia.',
      image: '',
      linkLabel: 'Ver publicação →',
      startsAt: '',
      endsAt: ''
    });
    editor.setSection('news');
    editor.markDirty();
    $('#aiModal')?.classList.remove('open');
    editor.toast('Rascunho de notícia criado');
  });

  if (E()?.state) rerender();
})();