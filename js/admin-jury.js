/* ================================================================
   FICHIER — admin-jury.js
   Interface jury : liste des films, lecteur vidéo, système de
   décision (accepter/refuser), délibération et statistiques.
   Dépendances : DOM chargé.
   ================================================================ */

/* ── DONNÉES (maquette) ── */
// decisions: null = pas encore évalué, 'valide', 'aRevoir', 'refuse'
const films = [
  {
    id: 1, title: "Rêves de Silicium", author: "Léa Fontaine", country: "France", type: "img",
    myDecision: 'valide', discussedBy: ['PD'],
    juryDec: { ML: 'valide', PD: 'aRevoir', KI: 'valide', SE: null },
    comments: { ML: 'Narration percutante, maîtrise formelle remarquable.', PD: 'Fin un peu abrupte, à retravailler.', KI: 'Très forte proposition artistique.' },
    tools: "Runway ML · Sora · MusicGen", iasc: "ChatGPT-4o · Claude", iaimg: "Runway ML Gen-3 · Sora", iapost: "MusicGen · ElevenLabs",
    note: "J'ai travaillé avec Runway ML pour générer des séquences oniriques, puis dirigé les mouvements de caméra image par image.", dur: "00:59.8", bg: "#0d1b3e"
  },
  {
    id: 2, title: "L'Enfant-Pixel", author: "Amira Ben Said", country: "Tunisie", type: "hyb",
    myDecision: 'valide', discussedBy: [],
    juryDec: { ML: 'valide', PD: 'valide', KI: 'valide', SE: null },
    comments: { ML: 'Direction visuelle exceptionnelle.', PD: 'Très forte.', KI: 'Bravo.' },
    tools: "Pika Labs · Udio", iasc: "GPT-4o", iaimg: "Pika Labs 1.5", iapost: "Udio · Premiere Pro",
    note: "Un film sur la frontière entre l'enfance et l'IA générative.", dur: "01:02.1", bg: "#0a2e1a"
  },
  {
    id: 3, title: "Archipel 2048", author: "Kenji Ito", country: "Japon", type: "img",
    myDecision: 'aRevoir', discussedBy: ['ML', 'SE'],
    juryDec: { ML: 'aRevoir', PD: 'valide', KI: null, SE: 'aRevoir' },
    comments: { ML: 'Réflexion intéressante, manque de rythme.', PD: 'Belle esthétique.' },
    tools: "Stable Diffusion · Kling", iasc: "Claude 3.5", iaimg: "Stable Diffusion XL · Kling", iapost: "Adobe Firefly",
    note: "Réflexion sur les îles artificielles et la montée des eaux.", dur: "01:00.0", bg: "#2e0a0a"
  },
  {
    id: 4, title: "Mémoire Vive", author: "Carlos Ruiz", country: "Espagne", type: "hyb",
    myDecision: null, discussedBy: [],
    juryDec: { ML: null, PD: null, KI: null, SE: null },
    comments: {},
    tools: "Midjourney · ElevenLabs", iasc: "Gemini", iaimg: "Midjourney V6", iapost: "ElevenLabs · Runway",
    note: "La mémoire d'un être humain transposée dans une machine.", dur: "01:28.0", bg: "#2e1a0a"
  },
  {
    id: 5, title: "Nouveaux Soleils", author: "Priya Mehta", country: "Inde", type: "img",
    myDecision: null, discussedBy: [],
    juryDec: { ML: 'valide', PD: 'valide', KI: 'valide', SE: 'valide' },
    comments: { ML: 'Chef-d\'œuvre.', PD: 'Unanime.', KI: 'Sublime.' },
    tools: "Sora · MusicGen", iasc: "Claude", iaimg: "Sora Turbo", iapost: "MusicGen · DaVinci",
    note: "Une aube nouvelle pour l'humanité guidée par l'IA.", dur: "01:00.0", bg: "#1a2e0a"
  },
  {
    id: 6, title: "Frontières Douces", author: "Omar Diallo", country: "Sénégal", type: "son",
    myDecision: null, discussedBy: ['KI', 'PD'],
    juryDec: { ML: 'refuse', PD: 'aRevoir', KI: null, SE: 'refuse' },
    comments: { ML: 'Trop sonore, peu de visuel.', SE: 'Ne correspond pas au cahier des charges.' },
    tools: "ElevenLabs · Suno", iasc: "Mistral", iaimg: "Aucun", iapost: "Suno AI · ElevenLabs",
    note: "Un voyage sonore entre deux cultures.", dur: "01:30.0", bg: "#2e0a2e"
  },
  {
    id: 7, title: "Vague Numérique", author: "Sofia Ek", country: "Suède", type: "hyb",
    myDecision: 'discuss', discussedBy: ['ML', 'KI'],
    juryDec: { ML: 'valide', PD: null, KI: 'valide', SE: 'aRevoir' },
    comments: { ML: 'Travail visuel très soigné.', KI: 'Bonne proposition.' },
    tools: "Runway · Suno", iasc: "GPT-4", iaimg: "Runway ML", iapost: "Suno AI",
    note: "Le numérique comme vague déferlante sur nos sociétés.", dur: "00:58.5", bg: "#0a2e2e"
  },
  {
    id: 8, title: "Jardin des Codes", author: "Lin Wei", country: "Chine", type: "img",
    myDecision: null, discussedBy: [],
    juryDec: { ML: 'valide', PD: null, KI: 'aRevoir', SE: 'valide' },
    comments: { ML: 'Poésie numérique rare.', SE: 'Beau.' },
    tools: "Kling · Firefly", iasc: "Qwen", iaimg: "Kling AI", iapost: "Adobe Firefly",
    note: "Un jardin zen généré entièrement par IA.", dur: "01:00.0", bg: "#1a2e2e"
  },
  {
    id: 9, title: "Signal Perdu", author: "Aya Tanaka", country: "Japon", type: "hyb",
    myDecision: null, discussedBy: [],
    juryDec: { ML: null, PD: null, KI: null, SE: null },
    comments: {},
    tools: "Pika · Udio", iasc: "GPT-4o", iaimg: "Pika Labs", iapost: "Udio",
    note: "Un signal dans le bruit numérique.", dur: "01:00.0", bg: "#1a0a3e"
  },
  {
    id: 10, title: "Horizon Zéro", author: "Mia Schultz", country: "Allemagne", type: "img",
    myDecision: null, discussedBy: [],
    juryDec: { ML: 'valide', PD: 'valide', KI: 'valide', SE: 'valide' },
    comments: { ML: 'Incontournable.', PD: 'Unanime.', KI: 'Parfait.' },
    tools: "Sora · Adobe Firefly", iasc: "Claude", iaimg: "Sora", iapost: "Adobe Firefly",
    note: "L'horizon comme métaphore du futur possible.", dur: "01:00.0", bg: "#0a1a0a"
  },
];

const decLabel = { valide: 'Validé', aRevoir: 'À revoir', refuse: 'Refusé' };
const decPillCls = { valide: 'vd-valide', aRevoir: 'vd-arevoir', refuse: 'vd-refuse' };
const decDotCls = { valide: 's-select', aRevoir: 's-pending', refuse: 's-reject' };
const decFiCls = { valide: 'fd-valide', aRevoir: 'fd-arevoir', refuse: 'fd-refuse' };
const decBadge = { valide: 'fdb-valide', aRevoir: 'fdb-arevoir', refuse: 'fdb-refuse' };

/* ── LISTE FILMS ── */
let activeFilm = 1;
let playInterval = null, isPlaying = false, progress = 42;
const MOBILE_BREAKPOINT = 980;
let mobilePane = 'list';
let mobileSidebarOpen = false;

function isMobileViewport() {
  return window.innerWidth <= MOBILE_BREAKPOINT;
}

function isEvalViewVisible() {
  const evalEl = document.getElementById('view-eval');
  return !!evalEl && evalEl.style.display !== 'none';
}

function setMobileSidebar(open) {
  mobileSidebarOpen = !!open;
  document.body.classList.toggle('jury-mobile-sidebar-open', mobileSidebarOpen);
}

function toggleMobileSidebar() {
  if (!isMobileViewport()) return;
  setMobileSidebar(!mobileSidebarOpen);
}

function setMobilePane(pane) {
  if (!isMobileViewport()) return;
  mobilePane = pane === 'detail' ? 'detail' : 'list';
  document.body.classList.toggle('jury-mobile-pane-list', mobilePane === 'list');
  document.body.classList.toggle('jury-mobile-pane-detail', mobilePane === 'detail');
}

function ensureMobileControls() {
  const topbar = document.querySelector('.topbar');
  if (!topbar) return;

  if (!document.getElementById('aj-mobile-menu-btn')) {
    const menuBtn = document.createElement('button');
    menuBtn.id = 'aj-mobile-menu-btn';
    menuBtn.className = 'mobile-nav-btn';
    menuBtn.type = 'button';
    menuBtn.textContent = '☰';
    menuBtn.setAttribute('aria-label', 'Ouvrir le menu');
    menuBtn.onclick = toggleMobileSidebar;
    topbar.insertBefore(menuBtn, topbar.firstChild);
  }

  if (!document.getElementById('aj-mobile-back-btn')) {
    const backBtn = document.createElement('button');
    backBtn.id = 'aj-mobile-back-btn';
    backBtn.className = 'mobile-back-btn';
    backBtn.type = 'button';
    backBtn.textContent = '← Liste';
    backBtn.setAttribute('aria-label', 'Retour à la liste des films');
    backBtn.onclick = function () { setMobilePane('list'); };
    topbar.insertBefore(backBtn, topbar.firstChild);
  }

  if (!document.getElementById('aj-mobile-overlay')) {
    const overlay = document.createElement('div');
    overlay.id = 'aj-mobile-overlay';
    overlay.onclick = function () { setMobileSidebar(false); };
    document.body.appendChild(overlay);
  }
}

function injectMobileStyles() {
  if (document.getElementById('aj-mobile-style')) return;
  const style = document.createElement('style');
  style.id = 'aj-mobile-style';
  style.textContent = `
    .mobile-nav-btn,
    .mobile-back-btn {
      display: none;
      align-items: center;
      justify-content: center;
      border: 1px solid rgba(255,255,255,0.14);
      background: rgba(255,255,255,0.04);
      color: var(--white-soft);
      border-radius: 8px;
      font-size: 0.78rem;
      font-weight: 700;
      padding: 6px 10px;
      cursor: pointer;
      line-height: 1;
      white-space: nowrap;
    }
    #aj-mobile-overlay {
      display: none;
      position: fixed;
      inset: 0;
      z-index: 100;
      background: rgba(4,6,14,0.58);
      backdrop-filter: blur(2px);
    }
    @media (max-width: 980px) {
      html, body {
        overflow: auto;
      }
      body {
        display: block;
      }
      .main {
        height: 100dvh;
      }
      .sidebar {
        position: fixed;
        left: 0;
        top: 0;
        bottom: 0;
        z-index: 120;
        transform: translateX(-104%);
        transition: transform 0.22s ease;
      }
      body.jury-mobile-sidebar-open .sidebar {
        transform: translateX(0);
      }
      body.jury-mobile-sidebar-open #aj-mobile-overlay {
        display: block;
      }
      .topbar {
        position: sticky;
        top: 0;
        z-index: 110;
        padding: 0 10px;
        gap: 8px;
      }
      .topbar-sep,
      .topbar-info,
      .phase-badge {
        display: none;
      }
      .topbar-right {
        margin-left: auto;
      }
      .topbar-right > button {
        margin-left: 0 !important;
        font-size: 0.72rem !important;
        padding: 5px 9px !important;
      }
      .mobile-nav-btn,
      .mobile-back-btn {
        display: inline-flex;
      }
      .view {
        display: block;
      }
      .film-list,
      .detail {
        width: 100%;
        min-width: 0;
      }
      .film-list {
        border-right: none;
        height: calc(100dvh - 52px);
      }
      .detail {
        height: calc(100dvh - 52px);
      }
      .detail-scroll {
        padding: 12px;
      }
      .player-ctrl {
        padding: 10px 10px 12px;
      }
      .ctrl-buttons,
      .ctrl-left {
        flex-wrap: wrap;
        gap: 8px;
      }
      .notation-panel {
        position: sticky;
        bottom: 0;
        z-index: 5;
        padding: 10px 12px calc(10px + env(safe-area-inset-bottom));
        background: color-mix(in srgb, var(--surface) 92%, transparent);
        backdrop-filter: blur(6px);
      }
      .decision-main {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 8px;
        margin-bottom: 8px;
      }
      .dbtn-main {
        width: 100%;
        min-height: 38px;
        font-size: 0.76rem;
      }
      .notation-bottom {
        gap: 8px;
        align-items: stretch;
      }
      .btn-publish {
        height: 44px;
      }
      body.jury-mobile-pane-list #view-eval .detail {
        display: none;
      }
      body.jury-mobile-pane-detail #view-eval .film-list {
        display: none;
      }
      body.jury-mobile-pane-list #aj-mobile-back-btn {
        display: none;
      }
      body.jury-mobile-pane-detail #aj-mobile-back-btn {
        display: inline-flex;
      }
    }
  `;
  document.head.appendChild(style);
}

function applyResponsiveLayout() {
  const mobile = isMobileViewport();
  document.body.classList.toggle('jury-mobile', mobile);
  if (!mobile) {
    setMobileSidebar(false);
    document.body.classList.remove('jury-mobile-pane-list', 'jury-mobile-pane-detail');
    return;
  }
  if (isEvalViewVisible() && !mobilePane) {
    mobilePane = 'list';
  }
  if (isEvalViewVisible()) {
    setMobilePane(mobilePane || 'list');
  }
}

function renderList(filterFn) {
  const el = document.getElementById('film-list-scroll');
  const list = (filterFn ? films.filter(filterFn) : films);
  el.innerHTML = list.map(f => {
    const dec = f.myDecision;
    const dotCls = dec ? decDotCls[dec] : 's-pending';
    const fiCls = dec ? decFiCls[dec] : 'fd-none';
    const fiTxt = dec ? decLabel[dec] : '—';
    return `<div class="film-item ${f.id === activeFilm ? 'selected' : ''}" onclick="loadFilm(${f.id})">
      <div class="fi-thumb" style="background:${f.bg};">🎬<div class="fi-status-dot ${dotCls}"></div></div>
      <div class="fi-info">
        <div class="fi-title">${f.title}</div>
        <div class="fi-sub">${f.author} · ${f.country}</div>
      </div>
      <span class="fi-dec ${fiCls}">${fiTxt}</span>
    </div>`;
  }).join('');
}

function loadFilm(id) {
  activeFilm = id;
  const f = films.find(x => x.id === id);
  document.getElementById('d-title').textContent = f.title;
  document.getElementById('d-author').textContent = `${f.author} · ${f.country} · 2026`;
  document.getElementById('d-tools').textContent = f.tools;
  document.getElementById('d-dur').textContent = f.dur;
  document.getElementById('d-ia-sc').textContent = f.iasc;
  document.getElementById('d-ia-img').textContent = f.iaimg;
  document.getElementById('d-ia-post').textContent = f.iapost;
  document.getElementById('d-note').textContent = `"${f.note}"`;
  document.getElementById('player-film-name').textContent = f.title;
  // Badge décision courante
  const badge = document.getElementById('d-decision-badge');
  if (f.myDecision) {
    badge.textContent = decLabel[f.myDecision];
    badge.className = `film-decision-badge ${decBadge[f.myDecision]}`;
  } else {
    badge.textContent = '— Non évalué';
    badge.className = 'film-decision-badge fdb-none';
  }
  // Boutons actifs
  ['valide', 'arevoir', 'refuse'].forEach(k => {
    document.getElementById('btn-' + k).classList.remove('active');
  });
  if (f.myDecision) {
    const map = { valide: 'valide', aRevoir: 'arevoir', refuse: 'refuse' };
    document.getElementById('btn-' + map[f.myDecision])?.classList.add('active');
  }
  document.getElementById('comment-input').value = f.comments?.['ML'] || '';
  renderVotes(f);
  renderComments(f);
  stopPlayer(); progress = 0;
  document.getElementById('pbar').style.width = '0%';
  document.getElementById('ptime').textContent = '0:00 / 1:00';
  renderList();
  if (isMobileViewport() && isEvalViewVisible()) {
    setMobilePane('detail');
    setMobileSidebar(false);
  }
}

/* ── PLAYER (vidéo réelle) ── */
function togglePlay(el) {
  const vid = document.getElementById('jury-video');
  if (!vid) return;
  isPlaying = !isPlaying;
  el.textContent = isPlaying ? '⏸' : '▶';
  el.style.paddingLeft = isPlaying ? '0' : '4px';
  const b2 = document.querySelector('.cbtn.play-btn');
  if (b2) { b2.textContent = isPlaying ? '⏸' : '▶'; b2.style.paddingLeft = isPlaying ? '0' : '2px'; }
  if (isPlaying) { vid.play(); startProgress(); } else { vid.pause(); stopPlayer(); }
}
function togglePlay2(el) {
  const vid = document.getElementById('jury-video');
  if (!vid) return;
  isPlaying = !isPlaying;
  el.textContent = isPlaying ? '⏸' : '▶';
  el.style.paddingLeft = isPlaying ? '0' : '2px';
  const bb = document.querySelector('.play-center');
  if (bb) { bb.textContent = isPlaying ? '⏸' : '▶'; bb.style.paddingLeft = isPlaying ? '0' : '4px'; }
  if (isPlaying) { vid.play(); startProgress(); } else { vid.pause(); stopPlayer(); }
}
function fmtTime(s) {
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return m + ':' + String(sec).padStart(2, '0');
}
function startProgress() {
  if (playInterval) clearInterval(playInterval);
  playInterval = setInterval(() => {
    const vid = document.getElementById('jury-video');
    if (!vid || !vid.duration) return;
    const pct = (vid.currentTime / vid.duration) * 100;
    document.getElementById('pbar').style.width = pct + '%';
    document.getElementById('ptime').textContent = fmtTime(vid.currentTime) + ' / ' + fmtTime(vid.duration);
    if (vid.ended) { isPlaying = false; clearInterval(playInterval); }
  }, 250);
}
function stopPlayer() { if (playInterval) clearInterval(playInterval); isPlaying = false; }

/* ── MODALS DÉCISION ── */
function selectModalTag(modal, key) {
  document.querySelectorAll(`#${modal}-tags .mtag`).forEach(b => {
    b.classList.toggle('selected', b.dataset.key === key);
  });
}

function openModalARevoir() {
  const f = films.find(x => x.id === activeFilm);
  if (!f) return;
  document.getElementById('arevoir-chip').textContent = '🎬 ' + f.title;
  document.getElementById('arevoir-message').value = f.comments?.['ML'] || '';
  document.getElementById('arevoir-message').classList.remove('error');
  document.getElementById('arevoir-hint').classList.remove('show');
  document.querySelectorAll('#arevoir-tags .mtag').forEach(b => b.classList.remove('selected'));
  document.getElementById('modal-arevoir').classList.add('open');
  setTimeout(() => document.getElementById('arevoir-message').focus(), 180);
}

function openModalRefuse() {
  const f = films.find(x => x.id === activeFilm);
  if (!f) return;
  document.getElementById('refuse-chip').textContent = '🎬 ' + f.title;
  const defaultMsg =
    `Madame, Monsieur,\n\n` +
    `Nous avons visionné votre film « ${f.title} » dans le cadre de la sélection marsAI 2026.\n\n` +
    `Après délibération, nous avons le regret de vous informer que votre œuvre n'a pas été retenue pour la sélection officielle cette année.\n\n` +
    `Nous vous remercions de l'intérêt que vous portez au festival et vous encourageons à soumettre vos prochains travaux lors des éditions futures.\n\n` +
    `Cordialement,\nL'équipe marsAI 2026`;
  document.getElementById('refuse-message').value = defaultMsg;
  document.querySelectorAll('#refuse-tags .mtag').forEach(b => b.classList.remove('selected'));
  document.getElementById('modal-refuse').classList.add('open');
}

function closeModal(id) {
  document.getElementById(id).classList.remove('open');
}

function closeModalOutside(e, id) {
  if (e.target.id === id) closeModal(id);
}

function confirmARevoir() {
  const msg = document.getElementById('arevoir-message').value.trim();
  if (!msg) {
    document.getElementById('arevoir-message').classList.add('error');
    document.getElementById('arevoir-hint').classList.add('show');
    return;
  }
  const f = films.find(x => x.id === activeFilm);
  if (f) f.comments['ML'] = msg;
  closeModal('modal-arevoir');
  decide('aRevoir');
}

function confirmRefuse() {
  closeModal('modal-refuse');
  decide('refuse');
}

/* ── POPOVER SIGNALEMENT RAPIDE ── */
const quickReportLabels = {
  rights: '🎵 Droits musicaux',
  quality: '📋 Lisibilité / Qualité',
  content: '⚠️ Contenu inapproprié',
  tech: '📺 YouTube / Technique',
  other: '❓ Autre',
};

function toggleReportPopover(e) {
  e.stopPropagation();
  const pop = document.getElementById('report-popover');
  const btn = document.getElementById('btn-report-quick');
  if (pop.classList.contains('open')) {
    closeReportPopover();
    return;
  }
  const rect = btn.getBoundingClientRect();
  pop.style.top = (rect.bottom + 8) + 'px';
  pop.style.left = Math.min(rect.left, window.innerWidth - 238) + 'px';
  pop.classList.add('open');
}

function closeReportPopover() {
  document.getElementById('report-popover').classList.remove('open');
}

function quickReport(typeKey) {
  closeReportPopover();
  const f = films.find(x => x.id === activeFilm);
  const label = quickReportLabels[typeKey] || '❓ Autre';
  showToast(`🚩 Signalé : ${label}${f ? ' — ' + f.title : ''}`, 'warn');
}

document.addEventListener('click', e => {
  const pop = document.getElementById('report-popover');
  if (pop && pop.classList.contains('open') && !pop.contains(e.target)) {
    closeReportPopover();
  }
});

/* ── SIGNALEMENT (Ticket) ── */
function openModalReport() {
  const f = films.find(x => x.id === activeFilm);
  if (!f) return;
  document.getElementById('report-chip').textContent = '🎬 ' + f.title;
  document.getElementById('report-message').value = '';
  document.getElementById('modal-report').classList.add('open');
}

function toggleReportSelect() {
  document.getElementById('report-select').classList.toggle('open');
}

function selectReportType(el) {
  document.getElementById('report-type').value = el.dataset.value;
  document.getElementById('rsel-label').textContent = el.textContent.trim();
  document.getElementById('rsel-dot').style.background = el.querySelector('.rsel-dot').style.background;
  document.querySelectorAll('.rsel-option').forEach(o => o.classList.remove('selected'));
  el.classList.add('selected');
  document.getElementById('report-select').classList.remove('open');
}

document.addEventListener('click', function (e) {
  const sel = document.getElementById('report-select');
  if (sel && !sel.contains(e.target)) sel.classList.remove('open');
});

function confirmReport() {
  showToast('🚩 Signalement envoyé à l\'administration', 'warn');
  closeModal('modal-report');
}

/* ── DÉCISION ── */
function decide(type) {
  const f = films.find(x => x.id === activeFilm);
  if (!f) return;
  f.myDecision = type;
  // Sauvegarder le commentaire en même temps que la décision
  const comment = document.getElementById('comment-input').value.trim();
  if (comment) f.comments['ML'] = comment;
  // Feedback toast selon type
  const toasts = {
    valide: ['✓ Validé : ' + f.title, 'ok'],
    aRevoir: ['↩ À revoir — Email candidat envoyé : ' + f.title, 'warn'],
    refuse: ['✕ Refusé — Email candidat envoyé : ' + f.title, 'err'],
  };
  showToast(...toasts[type]);
  loadFilm(activeFilm);
  updateCounts();
  if (type !== 'aRevoir') {
    setTimeout(() => {
      const idx = films.findIndex(x => x.id === activeFilm);
      if (films[idx + 1]) loadFilm(films[idx + 1].id);
    }, 800);
  }
}

function updateCounts() {
  const evaluated = films.filter(f => f.myDecision !== null).length;
  const pending = films.length - evaluated;
  document.getElementById('nav-pending').textContent = pending;
  document.getElementById('nav-selected').textContent = evaluated;
}

/* ── PUBLIER COMMENTAIRE ── */
function postComment() {
  const f = films.find(x => x.id === activeFilm);
  if (!f) return;
  const comment = document.getElementById('comment-input').value.trim();
  if (!comment) { showToast('Écrivez un commentaire avant de publier.', 'err'); return; }
  f.comments['ML'] = comment;
  f.juryDec['ML'] = f.juryDec['ML'] || null; // ne change pas la décision
  renderVotes(f);
  renderComments(f);
  showToast('💬 Commentaire publié', 'ok');
}

/* ── RENDU COMMENTAIRES ── */
function renderComments(f) {
  const el = document.getElementById('comments-thread');
  if (!el) return;
  const withComments = jurors.filter(j => f.comments?.[j.key]);
  if (!withComments.length) {
    el.innerHTML = '<div class="ct-empty">Aucun commentaire pour ce film.</div>';
    return;
  }
  el.innerHTML = withComments.map(j => {
    const dec = f.juryDec[j.key];
    const isMine = j.key === 'ML';
    const pillHtml = dec
      ? `<span class="vote-dec ${decPillCls[dec]}">${decLabel[dec]}</span>`
      : '';
    return `<div class="ct-item ${isMine ? 'ct-mine' : ''}">
      <div class="vote-avatar ${j.cls}">${j.initials}</div>
      <div class="ct-body">
        <div class="ct-header">
          <span class="ct-name">${j.name}</span>
          ${isMine ? '<span style="font-size:0.68rem;color:var(--aurora);font-weight:600;">Moi</span>' : `<span class="ct-role">${j.role}</span>`}
          ${pillHtml}
        </div>
        <div class="ct-text">"${f.comments[j.key]}"</div>
      </div>
    </div>`;
  }).join('');
}

/* ── CONSENSUS FILM ── */
function getFilmConsensus(f) {
  if (!f.juryDec) return { type: 'attente', valide: 0, refuse: 0, aRevoir: 0, pending: 0, score: 0 };
  const decs    = Object.values(f.juryDec);
  const valide  = decs.filter(d => d === 'valide').length;
  const refuse  = decs.filter(d => d === 'refuse').length;
  const aRevoir = decs.filter(d => d === 'aRevoir').length;
  const pending = decs.filter(d => d === null || d === undefined).length;
  const voted   = decs.length - pending;
  if (voted === 0) return { type: 'attente', valide, refuse, aRevoir, pending, score: 0 };
  const score = (valide * 2 + aRevoir * 0.5 - refuse * 1.5) / voted;
  if (valide === voted || valide > voted / 2) return { type: 'unanime', valide, refuse, aRevoir, pending, score };
  if (refuse > voted / 2)                    return { type: 'rejete',  valide, refuse, aRevoir, pending, score };
  return                                             { type: 'partage', valide, refuse, aRevoir, pending, score };
}

/* ── VOTES JURY ── */
const jurors = [
  { key: 'ML', id: 1, initials: 'ML', name: 'Marie Lefebvre', role: 'Présidente · Réalisatrice', cls: 'va-1' },
  { key: 'PD', id: 2, initials: 'PD', name: 'Pierre Dubois', role: 'Directeur artistique', cls: 'va-2' },
  { key: 'KI', id: 3, initials: 'KI', name: 'Kenji Ito', role: 'Artiste numérique', cls: 'va-3' },
  { key: 'SE', id: 4, initials: 'SE', name: 'Sofia Eriksson', role: 'Critique de cinéma', cls: 'va-4' },
];

// ── Phase 1 : admin seul sélectionne les 50 films (lecture seule pour le jury)
// ── Phase 2 : admin + jury votent collectivement pour le Top 5 ──
let currentJurorKey = 'ML';
const JURY_VOTE_THRESHOLD = 3; // ceil(5/2) — majorité pour Top 5

function getVotesFromStorage() {
  try {
    return {
      sel: JSON.parse(localStorage.getItem('marsai_adminSelected') || '[]'), // Top 50 — admin seul
      fv:  JSON.parse(localStorage.getItem('marsai_finalistVotes') || '{}'), // Top 5  — collectif
    };
  } catch(e) { return { sel: [], fv: {} }; }
}
function saveFinalistVotes(fv) {
  localStorage.setItem('marsai_finalistVotes', JSON.stringify(fv));
}
function currentJurorId() { return jurors.find(j => j.key === currentJurorKey)?.id || 1; }

function isFilmInTop50(filmId) {
  const { sel } = getVotesFromStorage();
  return sel.includes(filmId);
}
function myFinalistVote(filmId) {
  const { fv } = getVotesFromStorage();
  return (fv[filmId] || []).includes(currentJurorId());
}
function finalistVoteCount(filmId) {
  const { fv } = getVotesFromStorage();
  return (fv[filmId] || []).length;
}
function isFilmInTop5(filmId) { return finalistVoteCount(filmId) >= JURY_VOTE_THRESHOLD; }

function toggleJuryFinalist(filmId) {
  if (!isFilmInTop50(filmId)) { showToast('⚠️ Ce film n\'est pas dans le Top 50', 'warn'); return; }
  const { fv } = getVotesFromStorage();
  const uid = currentJurorId();
  if (!fv[filmId]) fv[filmId] = [];
  const idx = fv[filmId].indexOf(uid);
  if (idx >= 0) {
    fv[filmId].splice(idx, 1);
    showToast('Vote Top 5 retiré', 'warn');
  } else {
    const myCount = films.filter(f => (fv[f.id] || []).includes(uid)).length;
    if (myCount >= 5) { showToast('⚠️ Vous avez déjà voté pour 5 finalistes', 'warn'); return; }
    fv[filmId].push(uid);
    showToast('🏆 Vote Top 5 enregistré', 'ok');
  }
  saveFinalistVotes(fv);
  renderDelib();
}
function switchJuror(key) {
  currentJurorKey = key;
  renderDelib();
}

function renderVotes(f) {
  const el = document.getElementById('votes-list');
  if (!el) return;
  el.innerHTML = jurors.map(j => {
    const dec = f.juryDec[j.key];
    const comment = f.comments?.[j.key] || '';
    const pending = dec === null || dec === undefined;
    const pillCls = pending ? 'vd-none' : decPillCls[dec];
    const pillTxt = pending ? 'En attente' : decLabel[dec];
    return `<div>
      <div class="vote-row" style="${pending ? 'opacity:0.45;border-style:dashed;' : ''}">
        <div class="vote-avatar ${j.cls}">${j.initials}</div>
        <div style="flex:1;">
          <div class="vote-name">${j.name}</div>
          <div class="vote-role">${pending ? 'Pas encore évalué' : j.role}</div>
        </div>
        <span class="vote-dec ${pillCls}">${pillTxt}</span>
      </div>
      ${!pending && comment ? `<div class="vote-comment">"${comment}"</div>` : ''}
    </div>`;
  }).join('');
}

/* ── TABS ── */
function setTab(el, label) {
  document.querySelectorAll('.ltab').forEach(t => t.classList.remove('active'));
  el.classList.add('active');
  if (label === 'À évaluer') renderList(f => f.myDecision === null);
  else if (label === 'Évalués') renderList(f => f.myDecision !== null);
  else renderList();
}

/* ── VUES ── */
function switchView(view, navEl) {
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  if (navEl) navEl.classList.add('active');
  const evalEl = document.getElementById('view-eval');
  const delibEl = document.getElementById('view-delib');
  const listesEl = document.getElementById('view-listes');
  const discuterEl = document.getElementById('view-discuter');
  evalEl.style.display = 'none';
  delibEl.classList.remove('active');
  if (listesEl) listesEl.style.display = 'none';
  if (discuterEl) discuterEl.style.display = 'none';

  if (view === 'eval') {
    evalEl.style.display = 'flex';
    document.getElementById('topbar-title').textContent = 'Films assignés';
    document.getElementById('topbar-info').textContent = 'Films assignés par l\'administrateur — évaluation individuelle';
    document.getElementById('phase-badge').textContent = 'Phase 1 · Top 50 · 12/12/26';
    document.getElementById('phase-badge').className = 'phase-badge phase-1';
  } else if (view === 'listes') {
    if (listesEl) listesEl.style.display = 'block';
    document.getElementById('topbar-title').textContent = 'Mes listes';
    document.getElementById('topbar-info').textContent = 'Vos listes et annotations personnelles — privées';
    document.getElementById('phase-badge').textContent = 'Phase 1 · Top 50 · 12/12/26';
    document.getElementById('phase-badge').className = 'phase-badge phase-1';
  } else if (view === 'discuter') {
    if (discuterEl) discuterEl.style.display = 'grid';
    document.getElementById('topbar-title').textContent = 'À discuter';
    document.getElementById('topbar-info').textContent = 'Films marqués "À discuter" — chat jury en direct';
    document.getElementById('phase-badge').textContent = 'Phase 1 · Top 50 · 12/12/26';
    document.getElementById('phase-badge').className = 'phase-badge phase-1';
    renderDiscuterView();
  } else {
    delibEl.classList.add('active');
    document.getElementById('topbar-title').textContent = 'Délibération';
    document.getElementById('topbar-info').textContent = 'Récapitulatif des décisions du jury';
    document.getElementById('phase-badge').textContent = 'Phase 1 · Top 50 · 12/12/26';
    document.getElementById('phase-badge').className = 'phase-badge phase-1';
    renderDelib();
  }

  if (isMobileViewport()) {
    setMobileSidebar(false);
    if (view === 'eval') setMobilePane('list');
  }
}

function addListe() {
  showToast('Nouvelle liste créée', 'ok');
}

function removeFromListe(btn) {
  const row = btn.closest('div[style*="justify-content:space-between"]');
  if (row) row.remove();
  showToast('Film retiré de la liste', 'ok');
}

/* ── DÉLIBÉRATION ── */
function renderDelib() {
  const table = document.getElementById('delib-table');
  if (!table) return;
  const activePhase = document.querySelector('.ptab.active')?.dataset?.phase || '1';
  const uid = currentJurorId();
  const { sel, fv } = getVotesFromStorage();

  const top50Films = films.filter(f => sel.includes(f.id));
  const top50count = top50Films.length;
  const top5count  = films.filter(f => isFilmInTop5(f.id)).length;

  // ── Couleurs consensus ──
  const consensusStyle = {
    unanime: { border: 'rgba(78,255,206,0.5)',  bg: 'rgba(78,255,206,0.04)',  color: 'var(--aurora)', label: '✅ Unanime' },
    partage: { border: 'rgba(245,200,66,0.5)',  bg: 'rgba(245,200,66,0.03)',  color: 'var(--solar)',  label: '⚠️ Partagé' },
    rejete:  { border: 'rgba(255,107,107,0.5)', bg: 'rgba(255,107,107,0.03)', color: 'var(--coral)',  label: '❌ Rejeté'  },
    attente: { border: 'rgba(255,255,255,0.06)', bg: '',                      color: 'var(--mist)',   label: '⏳ En attente' },
  };
  const decColor = { valide: 'var(--aurora)', aRevoir: 'var(--solar)', refuse: 'var(--coral)' };
  const decIcon  = { valide: '✓', aRevoir: '↩', refuse: '✕' };

  // ── Avatars "qui a voté" pour Top 5 (admin id=0 + jurés id=1-4) ──
  const allVoters = [{ id: 0, initials: 'Ad', name: 'Admin' }, ...jurors];
  const voteAvatars = (votedIds) => `<div style="display:flex;gap:5px;align-items:center;flex-wrap:wrap;">` +
    allVoters.map(v => {
      const voted = votedIds.includes(v.id);
      const isMe  = v.id === uid;
      const borderC = voted ? (isMe ? 'var(--lavande)' : 'rgba(192,132,252,0.5)') : 'rgba(255,255,255,0.1)';
      const bgC     = voted ? (isMe ? 'rgba(192,132,252,0.3)' : 'rgba(192,132,252,0.12)') : 'rgba(255,255,255,0.02)';
      return `<span title="${v.name}${voted ? ' — a voté ✓' : ' — pas encore voté'}" style="display:inline-flex;align-items:center;justify-content:center;width:24px;height:24px;border-radius:50%;font-size:0.54rem;font-weight:700;border:2px solid ${borderC};background:${bgC};color:${voted ? 'var(--snow)' : 'rgba(255,255,255,0.2)'};transition:all 0.15s;">${v.initials}</span>`;
    }).join('') +
    `<span style="font-family:monospace;font-size:0.72rem;font-weight:800;color:${votedIds.length >= JURY_VOTE_THRESHOLD ? 'var(--lavande)' : 'var(--mist)'};margin-left:4px;">${votedIds.length}/${JURY_VOTE_THRESHOLD}</span>
    </div>`;

  // ── Switcher juré (Phase 2 uniquement) ──
  const switcherWrap = document.getElementById('delib-juror-switcher')?.closest('div[style*="align-items:center"]');
  const switcher = document.getElementById('delib-juror-switcher');
  if (switcherWrap) switcherWrap.style.display = activePhase === '2' ? '' : 'none';
  if (switcher && activePhase === '2') {
    switcher.innerHTML = jurors.map(j => {
      const active = j.key === currentJurorKey;
      const myFinVotes = films.filter(f => (fv[f.id]||[]).includes(j.id)).length;
      return `<button onclick="switchJuror('${j.key}')" style="padding:6px 14px;border-radius:9px;font-size:0.72rem;font-weight:${active ? 700 : 500};cursor:pointer;border:1.5px solid ${active ? 'var(--lavande)' : 'rgba(255,255,255,0.07)'};background:${active ? 'rgba(192,132,252,0.12)' : 'rgba(255,255,255,0.02)'};color:${active ? 'var(--lavande)' : 'var(--mist)'};transition:all 0.15s;display:flex;flex-direction:column;align-items:center;gap:3px;">
        <span>${j.initials} · ${j.name.split(' ')[0]}</span>
        <span style="font-size:0.58rem;font-weight:600;color:${active ? 'rgba(192,132,252,0.8)' : 'rgba(136,146,176,0.45)'};">🏆 ${myFinVotes} vote${myFinVotes !== 1 ? 's' : ''}</span>
      </button>`;
    }).join('');
  }

  // ── Bandeau d'incitation ──
  const incentiveEl = document.getElementById('delib-incentive');
  if (incentiveEl) {
    if (activePhase === '2') {
      const myFinCount = films.filter(f => (fv[f.id]||[]).includes(uid)).length;
      const almostTop5 = top50Films.filter(f => !isFilmInTop5(f.id) && finalistVoteCount(f.id) === JURY_VOTE_THRESHOLD - 1 && !(fv[f.id]||[]).includes(uid));
      let msg, msgColor = 'var(--lavande)', bg = 'rgba(192,132,252,0.06)', border = 'rgba(192,132,252,0.18)';
      if (myFinCount >= 5) {
        msg = `🎉 Vous avez voté pour <strong>${myFinCount} finaliste${myFinCount > 1 ? 's' : ''}</strong> — merci pour votre contribution !`;
      } else if (almostTop5.length > 0) {
        msg = `⚡ <strong>${almostTop5.length} film${almostTop5.length > 1 ? 's ont' : ' a'} besoin d'1 vote</strong> pour entrer dans le Top 5 — le vôtre peut tout changer !`;
        msgColor = 'var(--solar)'; bg = 'rgba(245,200,66,0.06)'; border = 'rgba(245,200,66,0.22)';
      } else {
        msg = `Vous avez voté pour <strong>${myFinCount}/5</strong> finaliste${myFinCount !== 1 ? 's' : ''}. Il reste <strong>${5 - myFinCount} vote${5 - myFinCount > 1 ? 's' : ''}</strong> à donner.`;
      }
      incentiveEl.style.cssText = `margin-bottom:16px;padding:12px 18px;border-radius:12px;background:${bg};border:1px solid ${border};font-size:0.8rem;color:${msgColor};line-height:1.6;display:flex;align-items:center;gap:10px;`;
      incentiveEl.innerHTML = msg;
    } else {
      incentiveEl.style.cssText = `margin-bottom:16px;padding:11px 18px;border-radius:12px;background:rgba(78,255,206,0.04);border:1px solid rgba(78,255,206,0.14);font-size:0.78rem;color:var(--aurora);line-height:1.6;`;
      incentiveEl.innerHTML = `★ <strong>${top50count}</strong> film${top50count !== 1 ? 's' : ''} présélectionné${top50count !== 1 ? 's' : ''} par l'administrateur${top50count >= 50 ? ' — <strong>quota atteint ✓</strong>' : ` sur 50`}. Passez en <strong>Phase 2</strong> pour voter le Top 5.`;
    }
  }

  if (activePhase === '2') {
    // ════ Phase 2 : vote Top 5 collectif ════
    const pct = Math.min((top5count / 5) * 100, 100);
    const progressRow = `<tr><td colspan="4" style="padding:0;border-bottom:1px solid rgba(192,132,252,0.12);">
      <div style="padding:10px 16px;background:rgba(192,132,252,0.04);display:flex;align-items:center;gap:14px;">
        <span style="font-size:0.7rem;font-weight:700;color:var(--lavande);white-space:nowrap;letter-spacing:0.04em;">🏆 TOP 5</span>
        <div style="flex:1;height:4px;background:rgba(192,132,252,0.12);border-radius:999px;overflow:hidden;">
          <div style="height:100%;width:${pct}%;background:linear-gradient(90deg,var(--lavande),#e0c3ff);border-radius:999px;transition:width 0.4s;"></div>
        </div>
        <span style="font-family:monospace;font-size:0.82rem;font-weight:800;color:${top5count >= 5 ? 'var(--lavande)' : 'var(--snow)'};">${top5count}<span style="color:var(--mist);font-weight:400;"> / 5</span></span>
        ${top5count >= 5 ? '<span style="font-size:0.65rem;font-weight:700;color:var(--lavande);padding:2px 8px;border-radius:999px;background:rgba(192,132,252,0.15);border:1px solid rgba(192,132,252,0.3);">✓ Finale constituée</span>' : ''}
      </div>
    </td></tr>`;

    if (top50Films.length === 0) {
      table.innerHTML = `<tbody><tr><td colspan="4" style="text-align:center;padding:48px;color:var(--mist);font-size:0.85rem;">Aucun film dans le Top 50.<br><span style="font-size:0.75rem;opacity:0.6;">L'administrateur n'a pas encore sélectionné les films.</span></td></tr></tbody>`;
      return;
    }

    const rows = top50Films.map((f, idx) => {
      const cnt    = finalistVoteCount(f.id);
      const inTop5 = isFilmInTop5(f.id);
      const voted  = myFinalistVote(f.id);
      const almost = !inTop5 && cnt === JURY_VOTE_THRESHOLD - 1 && !voted;
      const votedIds = fv[f.id] || [];

      const rowBg     = inTop5  ? 'rgba(192,132,252,0.06)' : almost ? 'rgba(245,200,66,0.03)' : '';
      const leftBorder = inTop5 ? 'border-left:3px solid rgba(192,132,252,0.5);' : almost ? 'border-left:3px solid rgba(245,200,66,0.5);' : 'border-left:3px solid transparent;';
      const rankColor  = inTop5 ? 'var(--lavande)' : 'var(--mist)';

      let voteBtn;
      if (inTop5 && voted) {
        voteBtn = `<button onclick="event.stopPropagation();toggleJuryFinalist(${f.id})" class="delib-btn delib-btn-top5-voted">🏆 Voté <span style="opacity:0.6;font-size:0.62rem;">✕</span></button>`;
      } else if (inTop5) {
        voteBtn = `<button onclick="event.stopPropagation();toggleJuryFinalist(${f.id})" class="delib-btn delib-btn-top5">🏆 Top 5</button>`;
      } else if (voted) {
        voteBtn = `<button onclick="event.stopPropagation();toggleJuryFinalist(${f.id})" class="delib-btn delib-btn-voted">✓ Voté <span style="opacity:0.6;font-size:0.62rem;">✕</span></button>`;
      } else if (almost) {
        voteBtn = `<button onclick="event.stopPropagation();toggleJuryFinalist(${f.id})" class="delib-btn delib-btn-almost">⚡ 1 vote manquant !</button>`;
      } else {
        voteBtn = `<button onclick="event.stopPropagation();toggleJuryFinalist(${f.id})" class="delib-btn delib-btn-default">→ Top 5</button>`;
      }

      return `<tr onclick="switchView('eval');loadFilm(${f.id})" style="background:${rowBg};${leftBorder}" class="delib-row">
        <td style="font-family:monospace;font-size:0.78rem;font-weight:700;color:${rankColor};width:40px;">${String(idx + 1).padStart(2,'0')}</td>
        <td>
          <div style="font-weight:700;font-size:0.88rem;">${f.title}${inTop5 ? ' <span style="font-size:0.62rem;color:var(--lavande);vertical-align:middle;">🏆</span>' : ''}</div>
          <div style="font-size:0.7rem;color:var(--mist);margin-top:2px;">${f.author}${f.country ? ' · ' + f.country : ''}</div>
        </td>
        <td style="width:220px;">${voteAvatars(votedIds)}</td>
        <td style="width:160px;" onclick="event.stopPropagation();">${voteBtn}</td>
      </tr>`;
    }).join('');

    table.innerHTML = `<thead><tr>
      <th style="width:40px;">#</th>
      <th>Film</th>
      <th style="width:220px;">Votes (${top5count}/5 finalistes)</th>
      <th style="width:160px;">Mon vote</th>
    </tr></thead><tbody>${progressRow}${rows}</tbody>`;

  } else {
    // ════ Phase 1 : Top 50 sélectionné par l'admin — lecture seule ════
    const pct50 = Math.min((top50count / 50) * 100, 100);
    const progressRow = `<tr><td colspan="4" style="padding:0;border-bottom:1px solid rgba(78,255,206,0.1);">
      <div style="padding:10px 16px;background:rgba(78,255,206,0.03);display:flex;align-items:center;gap:14px;">
        <span style="font-size:0.7rem;font-weight:700;color:var(--aurora);white-space:nowrap;letter-spacing:0.04em;">★ TOP 50</span>
        <div style="flex:1;height:4px;background:rgba(78,255,206,0.1);border-radius:999px;overflow:hidden;">
          <div style="height:100%;width:${pct50}%;background:linear-gradient(90deg,var(--aurora),#a8ffec);border-radius:999px;transition:width 0.4s;"></div>
        </div>
        <span style="font-family:monospace;font-size:0.82rem;font-weight:800;color:${top50count >= 50 ? 'var(--aurora)' : 'var(--snow)'};">${top50count}<span style="color:var(--mist);font-weight:400;"> / 50</span></span>
        ${top50count >= 50 ? '<span style="font-size:0.65rem;font-weight:700;color:var(--aurora);padding:2px 8px;border-radius:999px;background:rgba(78,255,206,0.12);border:1px solid rgba(78,255,206,0.3);">✓ Sélection complète</span>' : ''}
      </div>
    </td></tr>`;

    if (top50Films.length === 0) {
      table.innerHTML = `<tbody><tr><td colspan="4" style="text-align:center;padding:48px;color:var(--mist);font-size:0.85rem;">L'administrateur n'a pas encore sélectionné les 50 films.<br><span style="font-size:0.75rem;opacity:0.6;">La liste apparaîtra ici dès qu'elle sera constituée.</span></td></tr></tbody>`;
      return;
    }

    const rows = top50Films.map((f, idx) => {
      const c  = getFilmConsensus(f);
      const cs = consensusStyle[c.type] || consensusStyle.attente;
      const tv = c.valide + c.refuse + c.aRevoir;
      const scoreBar = tv > 0
        ? `<div style="display:flex;height:3px;border-radius:3px;overflow:hidden;width:60px;background:rgba(255,255,255,0.05);margin-top:5px;">
            <div style="width:${Math.round((c.valide/tv)*100)}%;background:var(--aurora);"></div>
            <div style="width:${Math.round((c.aRevoir/tv)*100)}%;background:var(--solar);"></div>
            <div style="width:${Math.round((c.refuse/tv)*100)}%;background:var(--coral);"></div>
           </div>`
        : '';
      const juryAvatars = jurors.map(j => {
        const dec = f.juryDec?.[j.key] || null;
        const col = dec ? decColor[dec] : 'rgba(255,255,255,0.12)';
        const ic  = dec ? decIcon[dec]  : '?';
        return `<span title="${j.name}${dec ? ' — ' + dec : ' — pas évalué'}" style="position:relative;display:inline-flex;align-items:center;justify-content:center;width:28px;height:28px;border-radius:50%;font-size:0.6rem;font-weight:700;border:2px solid ${col};background:${dec ? col.replace(')', ',0.12)').replace('var(', 'rgba(') : 'transparent'};color:${dec ? col : 'rgba(255,255,255,0.2)'};">${j.initials}<span style="position:absolute;bottom:-1px;right:-1px;width:12px;height:12px;border-radius:50%;font-size:0.42rem;display:flex;align-items:center;justify-content:center;background:${col};color:var(--deep-sky);font-weight:900;">${ic}</span></span>`;
      }).join('');

      return `<tr onclick="switchView('eval');loadFilm(${f.id})" style="background:${cs.bg};border-left:3px solid ${cs.border};" class="delib-row">
        <td style="font-family:monospace;font-size:0.78rem;font-weight:700;color:var(--mist);width:40px;">${String(idx + 1).padStart(2,'0')}</td>
        <td>
          <div style="font-weight:700;font-size:0.88rem;">${f.title} <span style="font-size:0.62rem;color:var(--aurora);vertical-align:middle;">★</span></div>
          <div style="font-size:0.7rem;color:var(--mist);margin-top:2px;">${f.author}${f.country ? ' · ' + f.country : ''}</div>
        </td>
        <td style="width:160px;"><div style="display:flex;gap:5px;align-items:center;">${juryAvatars}</div>${scoreBar}</td>
        <td style="width:130px;"><span style="font-size:0.72rem;font-weight:700;color:${cs.color};">${cs.label}</span></td>
      </tr>`;
    }).join('');

    table.innerHTML = `<thead><tr>
      <th style="width:40px;">#</th>
      <th>Film présélectionné</th>
      <th style="width:160px;">Évaluations jury</th>
      <th style="width:130px;">Consensus</th>
    </tr></thead><tbody>${progressRow}${rows}</tbody>`;
  }
}

function setPhaseTab(el, phase) {
  document.querySelectorAll('.ptab').forEach(t => { t.classList.remove('active'); delete t.dataset.phase; });
  el.classList.add('active');
  el.dataset.phase = String(phase);
  const badge = document.getElementById('phase-badge');
  if (badge) {
    badge.textContent = phase === 1 ? 'Phase 1 · Top 50 · 12/12/26' : 'Phase 2 · Top 5 · Finale';
    badge.className = phase === 1 ? 'phase-badge phase-1' : 'phase-badge phase-2';
  }
  renderDelib();
}

/* ── ANNOTATION RAPIDE (À discuter) ── */
function quickAnnotate(type, btn) {
  document.querySelectorAll('.qa-btn, .dbtn-discuss').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  if (type === 'discuss') {
    const f = films.find(x => x.id === activeFilm);
    if (f) {
      f.myDecision = 'discuss';
      if (!f.discussedBy) f.discussedBy = [];
      if (!f.discussedBy.includes('ML')) f.discussedBy.push('ML');
    }
    // Ouvrir le sidebar chat sur le canal "Tous" avec le titre du film pré-rempli
    pendingFilmId = f ? f.id : null;
    if (!scOpen) {
      scOpen = true;
      document.getElementById('sc-panel').classList.add('open');
      document.getElementById('sc-toggle-btn').classList.add('open');
    }
    selectSCContact('all');
    const inp = document.getElementById('sc-input');
    if (inp) {
      inp.value = f ? `📽️ ${f.title} — quelqu'un pour en discuter ?` : '📽️ Film — quelqu\'un pour en discuter ?';
      inp.focus();
    }
  }
}

/* ── TOAST ── */
function showToast(msg, type = 'ok') {
  const t = document.getElementById('toast');
  t.textContent = msg; t.className = `toast ${type} show`;
  setTimeout(() => t.classList.remove('show'), 3000);
}

/* ── VUE À DISCUTER ── */
let activeDiscussFilm = null;

const juryAvatarsMap = { ML: 'https://i.pravatar.cc/150?img=47', PD: 'https://i.pravatar.cc/150?img=12', KI: 'https://i.pravatar.cc/150?img=68', SE: 'https://i.pravatar.cc/150?img=44' };
const juryNamesMap = { ML: 'Marie L.', PD: 'Pierre D.', KI: 'Kenji I.', SE: 'Sofia E.' };

function renderDiscuterView() {
  // Tous les films demandés à discuter par au moins un juré
  const discussFilms = films.filter(f =>
    f.myDecision === 'discuss' || (f.discussedBy && f.discussedBy.length > 0)
  );
  const list = document.getElementById('discuss-film-list');
  if (!list) return;

  // Badge nav
  const badge = document.getElementById('nav-discuter-count');
  if (badge) badge.textContent = discussFilms.length;

  if (discussFilms.length === 0) {
    list.innerHTML = `<div style="font-size:0.72rem;color:var(--mist);opacity:0.6;padding:8px 4px;">Aucun film marqué "À discuter".</div>`;
    return;
  }

  list.innerHTML = discussFilms.map(f => {
    // Qui a demandé la discussion
    const requesters = [...(f.discussedBy || [])];
    if (f.myDecision === 'discuss' && !requesters.includes('ML')) requesters.unshift('ML');
    const avatarsHtml = requesters.map(k =>
      `<img src="${juryAvatarsMap[k]}" title="${juryNamesMap[k]}" style="width:16px;height:16px;border-radius:50%;object-fit:cover;border:1.5px solid rgba(192,132,252,0.5);margin-right:-4px;">`
    ).join('');
    return `<div class="discuss-film-item ${activeDiscussFilm === f.id ? 'active' : ''}" data-id="${f.id}" onclick="selectDiscussFilm(${f.id})">
      <div class="dfi-title">${f.title}</div>
      <div class="dfi-author">${f.author}</div>
      <div style="display:flex;align-items:center;gap:6px;margin-top:5px;">
        <div style="display:flex;">${avatarsHtml}</div>
        <span style="font-size:0.6rem;color:var(--lavande);margin-left:6px;">${requesters.length} juré${requesters.length > 1 ? 's' : ''}</span>
      </div>
    </div>`;
  }).join('');

  if (!activeDiscussFilm || !discussFilms.find(f => f.id === activeDiscussFilm)) {
    selectDiscussFilm(discussFilms[0].id);
  }
}

function selectDiscussFilm(id) {
  activeDiscussFilm = id;
  const f = films.find(x => x.id === id);
  if (!f) return;

  document.querySelectorAll('.discuss-film-item').forEach(el => {
    el.classList.toggle('active', parseInt(el.dataset.id) === id);
  });

  const vid = document.getElementById('discuss-video');
  if (vid) { vid.currentTime = 0; }

  const typeLabel = { img: '🎨 Image générée', hyb: '🎭 Hybride', son: '🎵 Sonore' };
  const juryNames = { ML: 'Marie L.', PD: 'Pierre D.', KI: 'Kenji I.', SE: 'Sofia E.' };
  const juryAvatars = { ML: 'https://i.pravatar.cc/150?img=47', PD: 'https://i.pravatar.cc/150?img=12', KI: 'https://i.pravatar.cc/150?img=68', SE: 'https://i.pravatar.cc/150?img=44' };
  const decColors = { valide: 'var(--aurora)', aRevoir: 'var(--solar)', refuse: 'var(--coral)' };
  const decIcons = { valide: '✓', aRevoir: '↩', refuse: '✕' };

  const juryRows = Object.entries(f.juryDec || {}).map(([key, dec]) => {
    const color = dec ? decColors[dec] : 'rgba(255,255,255,0.15)';
    const icon = dec ? decIcons[dec] : '?';
    const comment = f.comments?.[key] || '';
    return `<div style="display:flex;align-items:flex-start;gap:10px;padding:8px 0;border-bottom:1px solid rgba(255,255,255,0.04);">
      <div style="position:relative;flex-shrink:0;">
        <img src="${juryAvatars[key]}" style="width:28px;height:28px;border-radius:50%;object-fit:cover;border:2px solid ${color};">
        <span style="position:absolute;bottom:-2px;right:-2px;width:13px;height:13px;border-radius:50%;font-size:0.45rem;font-weight:900;display:flex;align-items:center;justify-content:center;background:${color};color:var(--deep-sky);">${icon}</span>
      </div>
      <div style="flex:1;min-width:0;">
        <div style="font-size:0.72rem;font-weight:700;color:${color};">${juryNames[key] || key}</div>
        ${comment ? `<div style="font-size:0.7rem;color:rgba(240,244,255,0.65);margin-top:2px;font-style:italic;">"${comment}"</div>` : '<div style="font-size:0.68rem;color:var(--mist);opacity:0.5;">Pas de commentaire</div>'}
      </div>
    </div>`;
  }).join('');

  const details = document.getElementById('discuss-film-details');
  details.innerHTML = `
    <!-- Titre + meta -->
    <div class="dfd-title">${f.title}</div>
    <div class="dfd-meta">
      <span class="dfd-chip">${f.author}</span>
      <span class="dfd-chip">🌍 ${f.country || '—'}</span>
      <span class="dfd-chip">⏱ ${f.dur || '—'}</span>
      <span class="dfd-chip">${typeLabel[f.type] || f.type || '—'}</span>
    </div>

    <!-- Note du réalisateur -->
    ${f.note ? `<div class="dfd-section">
      <div class="dfd-label">🎬 Note du réalisateur</div>
      <div class="dfd-text">"${f.note}"</div>
    </div>` : ''}

    <!-- Outils IA -->
    <div class="dfd-section">
      <div class="dfd-label">🤖 Outils IA utilisés</div>
      <div class="dfd-ia-grid">
        <div class="dfd-ia-row"><span class="dfd-ia-cat">Scénario</span><span class="dfd-ia-val">${f.iasc || '—'}</span></div>
        <div class="dfd-ia-row"><span class="dfd-ia-cat">Image</span><span class="dfd-ia-val">${f.iaimg || '—'}</span></div>
        <div class="dfd-ia-row"><span class="dfd-ia-cat">Post-prod</span><span class="dfd-ia-val">${f.iapost || '—'}</span></div>
        <div class="dfd-ia-row"><span class="dfd-ia-cat">Global</span><span class="dfd-ia-val">${f.tools || '—'}</span></div>
      </div>
    </div>

    <!-- Votes jury -->
    <div class="dfd-section">
      <div class="dfd-label">⚖️ Votes & commentaires jury</div>
      ${juryRows}
    </div>`;
}

function sendChatMsg() {
  const input = document.getElementById('discuss-input');
  const text = input.value.trim();
  if (!text) return;
  const now = new Date();
  const time = now.getHours().toString().padStart(2, '0') + ':' + now.getMinutes().toString().padStart(2, '0');
  const msgs = document.getElementById('discuss-messages');
  const div = document.createElement('div');
  div.className = 'chat-msg chat-msg-me';
  div.innerHTML = `
    <div class="chat-bubble chat-bubble-me">
      <div class="chat-name">Moi <span class="chat-time">${time}</span></div>
      <div class="chat-text">${text.replace(/</g, '&lt;')}</div>
    </div>
    <img class="chat-avatar" src="https://i.pravatar.cc/150?img=47" alt="Moi" style="opacity:0.5;">`;
  msgs.appendChild(div);
  msgs.scrollTop = msgs.scrollHeight;
  input.value = '';
  input.focus();
}

/* ── INIT ── */
renderList();
updateCounts();
renderVotes(films[0]);
renderComments(films[0]);
document.getElementById('comment-input').value = films[0].comments?.['ML'] || '';

/* ════════════════════════════════════════════
   SIDEBAR CHAT JURY
   ════════════════════════════════════════════ */
const chatContacts = [
  { id: 'all', name: 'Tout le jury', sub: '8 membres actifs', avatar: null, online: true, unread: 0 },
  { id: 1, name: 'Marie Lefebvre', sub: 'Présidente · Réalisatrice', avatar: 'https://i.pravatar.cc/150?img=47', online: true, unread: 2 },
  { id: 2, name: 'Pierre Dubois', sub: 'Directeur artistique', avatar: 'https://i.pravatar.cc/150?img=12', online: true, unread: 0 },
  { id: 3, name: 'Kenji Ito', sub: 'Artiste numérique', avatar: 'https://i.pravatar.cc/150?img=68', online: false, unread: 0 },
  { id: 4, name: 'Sofia Eriksson', sub: 'Critique de cinéma', avatar: 'https://i.pravatar.cc/150?img=44', online: true, unread: 1 },
  { id: 7, name: 'Amara Touré', sub: 'Productrice', avatar: 'https://i.pravatar.cc/150?img=32', online: false, unread: 0 },
  { id: 8, name: 'Elena Petrov', sub: 'Compositrice', avatar: 'https://i.pravatar.cc/150?img=29', online: true, unread: 0 },
  { id: 9, name: 'Yuki Nakamura', sub: 'Réalisatrice', avatar: 'https://i.pravatar.cc/150?img=56', online: false, unread: 0 },
  { id: 10, name: 'Carlos Ruiz', sub: 'Chef opérateur', avatar: 'https://i.pravatar.cc/150?img=18', online: true, unread: 0 },
];

const chatHistory = {
  all: [
    { from: 'admin', name: 'Admin', text: 'Bonjour à tous, rappel : les évaluations de la phase 1 sont à finaliser avant le 12/12/26.', time: '09:00' },
    { from: 1, name: 'Marie L.', text: 'Bien reçu ! J\'ai encore 3 films à visionner.', time: '09:14' },
    { from: 4, name: 'Sofia E.', text: 'Pareil, je les termine ce soir.', time: '09:22' },
    { from: 2, name: 'Pierre D.', text: 'J\'ai une question sur le film "Frontières Douces" — peut-on en discuter ?', time: '10:05' },
  ],
  1: [
    { from: 1, name: 'Marie L.', text: 'Bonjour, tu as eu le temps de voir le film n°12 ?', time: '11:30' },
    { from: 'me', text: 'Oui ! Je l\'ai trouvé très fort. Je penche pour "Validé".', time: '11:45' },
    { from: 1, name: 'Marie L.', text: 'Pareil, le traitement sonore est remarquable.', time: '11:47' },
  ],
  4: [
    { from: 4, name: 'Sofia E.', text: 'Bonsoir, je ne vois pas le film "Signal Perdu" dans ma liste — tu as eu ça aussi ?', time: '18:10' },
  ],
};

let scOpen = false;
let scContact = 'all';
let pendingFilmId = null;

function toggleJuryChat() {
  scOpen = !scOpen;
  document.getElementById('sc-panel').classList.toggle('open', scOpen);
  document.getElementById('sc-toggle-btn').classList.toggle('open', scOpen);
  if (scOpen) {
    renderSCContacts();
    renderSCMessages(scContact);
  }
}

function updateSCBadge() {
  const total = chatContacts.filter(c => c.id !== 'all').reduce((s, c) => s + c.unread, 0);
  const b = document.getElementById('sc-badge');
  if (b) { b.textContent = total; b.style.display = total > 0 ? '' : 'none'; }
}

function renderSCContacts() {
  const row = document.getElementById('sc-contacts-row');
  if (!row) return;
  row.innerHTML = chatContacts.map(c => {
    const isActive = c.id === scContact;
    const avHtml = c.id === 'all'
      ? `<div class="sc-av sc-av-all">📢</div>`
      : `<div class="sc-av">
           <img src="${c.avatar}" alt="${c.name}">
           ${c.online ? '<div class="sc-dot"></div>' : ''}
           ${c.unread > 0 ? `<div class="sc-cb-unread">${c.unread}</div>` : ''}
         </div>`;
    const label = c.id === 'all' ? 'Tous' : c.name.split(' ')[0];
    return `<div class="sc-cb ${isActive ? 'active' : ''}" onclick="selectSCContact(${JSON.stringify(c.id)})">
      ${avHtml}
      <div class="sc-lbl">${label}</div>
    </div>`;
  }).join('');
}

function selectSCContact(id) {
  scContact = id;
  const c = chatContacts.find(x => x.id === id);
  if (c) c.unread = 0;
  renderSCContacts();
  renderSCMessages(id);
}

function renderSCMessages(contactId) {
  const msgs = chatHistory[contactId] || [];
  const el = document.getElementById('sc-messages');
  if (!el) return;
  el.innerHTML = msgs.length
    ? msgs.map(m => {
      const isMe = m.from === 'me';
      const who = isMe ? 'Moi' : (m.name || '?');
      const filmCard = m.filmId ? (() => {
        const f = films.find(x => x.id === m.filmId);
        if (!f) return '';
        return `<div class="sc-film-card" onclick="loadFilm(${f.id});switchView('eval',document.querySelectorAll('.nav-item')[0])">
            <span class="sc-film-icon">▶</span>
            <div class="sc-film-info">
              <div class="sc-film-title">${f.title}</div>
              <div class="sc-film-sub">${f.author} · ${f.country}</div>
            </div>
            <span class="sc-film-cta">Voir</span>
          </div>`;
      })() : '';
      return `<div class="sc-msg ${isMe ? 'sc-msg-me' : ''}">
          <div class="sc-bubble">${m.text.replace(/</g, '&lt;')}</div>
          ${filmCard}
          <div class="sc-meta">${who} · ${m.time}</div>
        </div>`;
    }).join('')
    : `<div style="text-align:center;color:var(--mist);font-size:0.68rem;padding:16px 0;opacity:0.6;">Aucun message</div>`;
  el.scrollTop = el.scrollHeight;
}

function sendJuryMsg() {
  const inp = document.getElementById('sc-input');
  const text = inp.value.trim();
  if (!text) return;
  const now = new Date();
  const time = now.getHours().toString().padStart(2, '0') + ':' + now.getMinutes().toString().padStart(2, '0');
  if (!chatHistory[scContact]) chatHistory[scContact] = [];
  const msg = { from: 'me', text, time };
  if (pendingFilmId) { msg.filmId = pendingFilmId; pendingFilmId = null; }
  chatHistory[scContact].push(msg);
  inp.value = '';
  renderSCMessages(scContact);
}

// Init badge au chargement
updateSCBadge();

injectMobileStyles();
ensureMobileControls();
applyResponsiveLayout();
window.addEventListener('resize', applyResponsiveLayout);

// Toggle sidebar gauche — délègue au système mobile si viewport étroit
function toggleSidebar() {
  if (isMobileViewport()) {
    toggleMobileSidebar();
  } else {
    document.body.classList.toggle('sidebar-collapsed');
  }
}
