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

/* ── VOTES JURY ── */
const jurors = [
  { key: 'ML', initials: 'ML', name: 'Marie Lefebvre', role: 'Présidente · Réalisatrice', cls: 'va-1' },
  { key: 'PD', initials: 'PD', name: 'Pierre Dubois', role: 'Directeur artistique', cls: 'va-2' },
  { key: 'KI', initials: 'KI', name: 'Kenji Ito', role: 'Artiste numérique', cls: 'va-3' },
  { key: 'SE', initials: 'SE', name: 'Sofia Eriksson', role: 'Critique de cinéma', cls: 'va-4' },
];

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
  const pill = (dec) => {
    if (!dec) return `<span style="color:rgba(136,146,176,0.35);font-size:0.72rem;">—</span>`;
    const cls = { valide: 'sp-valide', aRevoir: 'sp-arevoir', refuse: 'sp-refuse' }[dec];
    const txt = decLabel[dec];
    return `<span class="status-pill ${cls}">${txt}</span>`;
  };
  const tbody = films.map((f, i) => {
    const overall = f.juryDec;
    const vals = Object.values(overall).filter(d => d === 'valide').length;
    const tot = Object.values(overall).filter(d => d !== null).length;
    const sp = tot === 0 ? 'sp-none' :
      vals >= 3 ? 'sp-valide' :
        Object.values(overall).filter(d => d === 'refuse').length >= 2 ? 'sp-refuse' : 'sp-arevoir';
    const spTxt = { 'sp-valide': 'Validé', 'sp-arevoir': 'À revoir', 'sp-refuse': 'Refusé', 'sp-none': 'En attente' }[sp];
    const rk = i < 3 ? 'gold' : '';
    return `<tr onclick="switchView('eval');loadFilm(${f.id})">
      <td><span class="rank ${rk}">${i + 1}</span></td>
      <td><strong>${f.title}</strong></td>
      <td style="color:var(--mist);font-size:0.78rem;">${f.author}</td>
      <td>${pill(overall.ML)}</td>
      <td>${pill(overall.PD)}</td>
      <td>${pill(overall.KI)}</td>
      <td>${pill(overall.SE)}</td>
      <td><span class="status-pill ${sp}">${spTxt}</span></td>
    </tr>`;
  }).join('');
  table.innerHTML = `
    <thead><tr>
      <th>#</th><th>Film</th><th>Réalisateur</th>
      <th>ML</th><th>PD</th><th>KI</th><th>SE</th>
      <th>Décision</th>
    </tr></thead>
    <tbody>${tbody}</tbody>`;
}

function setPhaseTab(el, phase) {
  document.querySelectorAll('.ptab').forEach(t => t.classList.remove('active'));
  el.classList.add('active');
  const badge = document.getElementById('phase-badge');
  if (phase === 1) {
    badge.textContent = 'Phase 1 · Top 50 · 12/12/26';
    badge.className = 'phase-badge phase-1';
  } else {
    badge.textContent = 'Phase 2 · Top 5 · Finale';
    badge.className = 'phase-badge phase-2';
    // En phase 2 on ne montre que 5 films (les plus validés)
    const t = document.getElementById('delib-table');
    if (t && t.tBodies[0]) {
      const rows = Array.from(t.tBodies[0].rows);
      rows.forEach((r, i) => r.style.display = i < 5 ? '' : 'none');
    }
  }
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
