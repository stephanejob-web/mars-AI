/* ================================================================
   MANIFESTE CAROUSEL — Style Evervault Card Scanner (OPTIMISÉ)
   Flux horizontal de cartes vidéo traversant un scanner vertical.
   Quand une carte croise le scanner, un côté se transforme en ASCII.
   Particules violettes émanant du faisceau.
   IIFE autonome, 0 dépendance externe.

   OPTIMISATIONS v2 (GPU Intel UHD) :
   - 6 cartes au lieu de 12
   - 3 vidéos légères seulement (ia.mp4 53Mo exclue)
   - Max 3 vidéos en lecture simultanée
   - 60 particules au lieu de 400
   - DOM queries cachées, gradients pré-calculés
   - Boucle RAF unique, gestion vidéo throttlée
   ================================================================ */
;(function () {
  'use strict';

  /* ----------------------------------------------------------------
     Configuration (optimisée pour GPU intégré)
     ---------------------------------------------------------------- */
  var VIDEOS = [
    '../assets/ia2.mp4',   // ~4.6 Mo
    '../assets/ia3.mp4',   // ~6.7 Mo
    '../assets/ia1.mp4'    // ~21 Mo — ia.mp4 (53Mo) exclu
  ];
  var CARD_COUNT    = 6;       // réduit de 12 à 6
  var CARD_W        = 380;
  var CARD_H        = 230;
  var CARD_GAP      = 50;
  var SCROLL_SPEED  = 80;      // px/s
  var SCANNER_W     = 8;
  var PARTICLE_MAX  = 60;      // réduit de 400 à 60
  var FADE_ZONE     = 50;
  var MAX_PLAYING   = 3;       // max 3 vidéos en lecture simultanée
  var VIDEO_CHECK_INTERVAL = 500; // vérifier vidéos toutes les 500ms au lieu de chaque frame

  /* ----------------------------------------------------------------
     Générateur de code ASCII (thème IA/vidéo)
     ---------------------------------------------------------------- */
  var _codeSnippets = [
    '// compiled preview • scanner demo',
    '/* generated for visual effect */',
    'const SCAN_WIDTH = 8;',
    'const MAX_PARTICLES = 2500;',
    'const TRANSITION = 0.05;',
    'function clamp(n, a, b) { return Math.max(a, Math.min(b, n)); }',
    'function lerp(a, b, t) { return a + (b - a) * t; }',
    'class Particle0 { constructor(x, y, vx, vy, r, a) {',
    '  this.x = x; this.y = y;',
    '  this.vx = vx; this.vy = vy;',
    '} step(dt) { this.x += this.vx * dt; this.y += this.vy * dt; } }',
    'const scanner = { x: Math.floor(window.innerWidth / 2), width: SCAN_WIDTH, glow: 3.5 };',
    'function drawParticle(ctx, p) { ctx.globalAlpha = clamp(p.a, 0, 1);',
    '  ctx.drawImage(gradient, p.x - p.r, p.y - p.r, p.r * 2, p.r * 2); }',
    'function tick(t) { const dt = 0.016; // update & render }',
    'const state = { intensity: 1.2, particles: MAX_PARTICLES };',
    'ctx.globalCompositeOperation = "lighter";',
    '// ascii overlay is masked with a 3-phase gradient',
    'if (state.intensity > 1) { scanner.glow += 0.01; }',
    'class Particle1 { constructor(x, y, vx, vy, r, a) {',
    '  this.x = x; this.vx = vx; this.vy = vy;',
    '} step(dt) { this.x += this.vx; this.y += this.vy; } }',
    'const neer = { x: Math.floor(window.innerWidth / 2) };',
    'function drawParticle(cta, p) { ctx.globalAlpha =',
    '  clamp(p.a, 0, 1); ctx.drawImage(gradient, p.x, p.y); }',
    'b.floor(window.innerWidth / 2), width: SCAN_WIDTH'
  ];
  // flux pré-construit (évite de recalculer à chaque appel)
  var _codeFlow = _codeSnippets.join(' ');
  while (_codeFlow.length < 8000) {
    _codeFlow += ' ' + _codeSnippets[Math.floor(Math.random() * _codeSnippets.length)];
  }

  function generateCode(cols, rows) {
    var total = cols * rows;
    var out = '';
    var offset = Math.floor(Math.random() * 200);
    for (var r = 0; r < rows; r++) {
      var line = _codeFlow.substr(offset + r * cols, cols);
      if (line.length < cols) line += ' '.repeat(cols - line.length);
      out += line + (r < rows - 1 ? '\n' : '');
    }
    return out;
  }

  function calcCodeDims(w, h) {
    return { cols: Math.floor(w / 6), rows: Math.floor(h / 12) };
  }


  /* ----------------------------------------------------------------
     Création d'une carte (wrapper normal + ascii)
     ---------------------------------------------------------------- */
  function createCard(index) {
    var wrapper = document.createElement('div');
    wrapper.className = 'ev-card-wrapper';

    // couche normale (vidéo) — preload metadata seulement
    var normal = document.createElement('div');
    normal.className = 'ev-card ev-card-normal';
    var video = document.createElement('video');
    video.muted = true;
    video.loop = true;
    video.playsInline = true;
    video.preload = 'metadata'; // pas 'auto' — charge les données à la demande
    video.src = VIDEOS[index % VIDEOS.length];
    normal.appendChild(video);

    // couche ASCII
    var ascii = document.createElement('div');
    ascii.className = 'ev-card ev-card-ascii';
    var content = document.createElement('div');
    content.className = 'ascii-content';
    var dims = calcCodeDims(CARD_W, CARD_H);
    content.textContent = generateCode(dims.cols, dims.rows);
    ascii.appendChild(content);

    wrapper.appendChild(normal);
    wrapper.appendChild(ascii);

    // cache les refs DOM sur le wrapper pour éviter querySelector chaque frame
    wrapper._normal = normal;
    wrapper._ascii = ascii;
    wrapper._video = video;

    return wrapper;
  }


  /* ----------------------------------------------------------------
     CardStream — Défilement horizontal automatique
     Gère le scroll, le drag, et le clipping scanner.
     ---------------------------------------------------------------- */
  function CardStream(viewport) {
    this.viewport  = viewport;
    this.cardLine  = viewport.querySelector('.card-line');
    this.position  = 0;
    this.velocity  = SCROLL_SPEED;
    this.direction = -1;
    this.running   = false;
    this.dragging  = false;
    this.lastTime  = 0;
    this.lastMouseX = 0;
    this.mouseVel   = 0;
    this.containerW = 0;
    this.lineW      = 0;
    this.wrappers   = [];   // cache des wrappers
    this.videos     = [];
    this._lastVideoCheck = 0;

    this._populate();
    this._calcDims();
    this._bindDrag();
  }

  /* remplir la ligne de cartes */
  CardStream.prototype._populate = function () {
    this.cardLine.innerHTML = '';
    for (var i = 0; i < CARD_COUNT; i++) {
      var card = createCard(i);
      this.cardLine.appendChild(card);
    }
    // cacher les refs DOM une seule fois
    this.wrappers = Array.from(this.cardLine.querySelectorAll('.ev-card-wrapper'));
    this.videos = [];
    for (var j = 0; j < this.wrappers.length; j++) {
      this.videos.push(this.wrappers[j]._video);
    }
  };

  CardStream.prototype._calcDims = function () {
    this.containerW = this.viewport.offsetWidth;
    this.lineW = (CARD_W + CARD_GAP) * CARD_COUNT;
    this.position = -(this.lineW / 2 - this.containerW / 2);
  };

  /* démarrer l'animation */
  CardStream.prototype.start = function () {
    if (this.running) return;
    this.running = true;
    this.lastTime = performance.now();
    this._lastVideoCheck = 0;
    this._loop();
  };

  CardStream.prototype.stop = function () {
    this.running = false;
    // pause toutes les vidéos
    for (var i = 0; i < this.videos.length; i++) {
      if (!this.videos[i].paused) this.videos[i].pause();
    }
  };

  CardStream.prototype._loop = function () {
    if (!this.running) return;
    var self = this;
    var now  = performance.now();
    var dt   = (now - this.lastTime) / 1000;
    this.lastTime = now;

    if (!this.dragging) {
      if (this.velocity > SCROLL_SPEED) {
        this.velocity *= 0.96;
        if (this.velocity < SCROLL_SPEED) this.velocity = SCROLL_SPEED;
      }
      this.position += this.velocity * this.direction * dt;
      this._wrap();
    }

    this.cardLine.style.transform = 'translateX(' + this.position + 'px)';
    this._updateClipping();

    // vérifier les vidéos seulement toutes les 500ms (pas chaque frame)
    if (now - this._lastVideoCheck > VIDEO_CHECK_INTERVAL) {
      this._manageVideos();
      this._lastVideoCheck = now;
    }

    requestAnimationFrame(function () { self._loop(); });
  };

  /* boucle infinie */
  CardStream.prototype._wrap = function () {
    if (this.position < -this.lineW) {
      this.position = this.containerW;
    } else if (this.position > this.containerW) {
      this.position = -this.lineW;
    }
  };

  /* clipping scanner — utilise les refs cachées, pas de querySelector */
  CardStream.prototype._updateClipping = function () {
    var scannerX = this.containerW / 2;
    var scanLeft = scannerX - SCANNER_W / 2;
    var scanRight = scannerX + SCANNER_W / 2;
    var vpRect = this.viewport.getBoundingClientRect(); // 1 seul appel

    for (var i = 0; i < this.wrappers.length; i++) {
      var wrap = this.wrappers[i];
      var rect = wrap.getBoundingClientRect();
      var cardLeft  = rect.left - vpRect.left;
      var cardRight = rect.right - vpRect.left;
      var cardW     = rect.width;

      var normal = wrap._normal;
      var ascii  = wrap._ascii;

      if (cardLeft < scanRight && cardRight > scanLeft) {
        var intersectLeft  = Math.max(scanLeft - cardLeft, 0);
        var intersectRight = Math.min(scanRight - cardLeft, cardW);
        var pctLeft  = (intersectLeft / cardW) * 100;
        var pctRight = (intersectRight / cardW) * 100;
        normal.style.clipPath = 'inset(0 0 0 ' + pctLeft + '%)';
        ascii.style.clipPath = 'inset(0 ' + (100 - pctRight) + '% 0 0)';
      } else if (cardRight <= scanLeft) {
        normal.style.clipPath = 'inset(0 0 0 100%)';
        ascii.style.clipPath = 'none';
      } else {
        normal.style.clipPath = 'none';
        ascii.style.clipPath = 'inset(0 100% 0 0)';
      }
    }
  };

  /* play/pause intelligent — max 3 vidéos en lecture simultanée */
  CardStream.prototype._manageVideos = function () {
    var vpRect = this.viewport.getBoundingClientRect();
    var scannerX = vpRect.left + this.containerW / 2;

    // trier les vidéos par distance au scanner (les plus proches en premier)
    var scored = [];
    for (var i = 0; i < this.videos.length; i++) {
      var v = this.videos[i];
      var vRect = v.getBoundingClientRect();
      var center = (vRect.left + vRect.right) / 2;
      var dist = Math.abs(center - scannerX);
      var inViewport = vRect.right > vpRect.left && vRect.left < vpRect.right;
      scored.push({ video: v, dist: dist, inViewport: inViewport });
    }
    scored.sort(function (a, b) { return a.dist - b.dist; });

    // jouer les MAX_PLAYING plus proches qui sont dans le viewport, pauser le reste
    var playing = 0;
    for (var j = 0; j < scored.length; j++) {
      var s = scored[j];
      if (s.inViewport && playing < MAX_PLAYING) {
        if (s.video.paused) s.video.play().catch(function () {});
        playing++;
      } else {
        if (!s.video.paused) s.video.pause();
      }
    }
  };

  /* drag souris + tactile */
  CardStream.prototype._bindDrag = function () {
    var self = this;
    var line = this.cardLine;

    function startDrag(x) {
      self.dragging = true;
      self.lastMouseX = x;
      self.mouseVel = 0;
      line.classList.add('dragging');
    }
    function onDrag(x) {
      if (!self.dragging) return;
      var dx = x - self.lastMouseX;
      self.position += dx;
      self.mouseVel = dx * 60;
      self.lastMouseX = x;
      line.style.transform = 'translateX(' + self.position + 'px)';
      self._updateClipping();
    }
    function endDrag() {
      if (!self.dragging) return;
      self.dragging = false;
      line.classList.remove('dragging');
      if (Math.abs(self.mouseVel) > 30) {
        self.velocity = Math.abs(self.mouseVel);
        self.direction = self.mouseVel > 0 ? 1 : -1;
      } else {
        self.velocity = SCROLL_SPEED;
      }
    }

    line.addEventListener('mousedown', function (e) {
      e.preventDefault(); startDrag(e.clientX);
    });
    document.addEventListener('mousemove', function (e) { onDrag(e.clientX); });
    document.addEventListener('mouseup', endDrag);

    line.addEventListener('touchstart', function (e) {
      startDrag(e.touches[0].clientX);
    }, { passive: true });
    document.addEventListener('touchmove', function (e) {
      if (self.dragging) onDrag(e.touches[0].clientX);
    }, { passive: true });
    document.addEventListener('touchend', endDrag);

    line.addEventListener('wheel', function (e) {
      e.preventDefault();
      self.position += (e.deltaY > 0 ? -20 : 20);
      self._wrap();
      line.style.transform = 'translateX(' + self.position + 'px)';
      self._updateClipping();
    }, { passive: false });

    window.addEventListener('resize', function () {
      self.containerW = self.viewport.offsetWidth;
      self.lineW = (CARD_W + CARD_GAP) * CARD_COUNT;
    });
  };

  /* rafraîchir le contenu ASCII périodiquement (800ms au lieu de 250ms) */
  CardStream.prototype.startAsciiRefresh = function () {
    var self = this;
    var contents = this.cardLine.querySelectorAll('.ascii-content');
    this._asciiContents = contents; // cache
    this._asciiTimer = setInterval(function () {
      // rafraîchir 1 seule carte aléatoire par tick (pas toutes)
      var idx = Math.floor(Math.random() * self._asciiContents.length);
      var dims = calcCodeDims(CARD_W, CARD_H);
      self._asciiContents[idx].textContent = generateCode(dims.cols, dims.rows);
    }, 800);
  };

  CardStream.prototype.stopAsciiRefresh = function () {
    if (this._asciiTimer) {
      clearInterval(this._asciiTimer);
      this._asciiTimer = null;
    }
  };


  /* ----------------------------------------------------------------
     ScannerParticles — Canvas 2D (optimisé)
     60 particules au lieu de 400, gradients pré-calculés.
     ---------------------------------------------------------------- */
  function ScannerParticles(canvas, getBeamX) {
    this.canvas   = canvas;
    this.ctx      = canvas.getContext('2d');
    this.getBeamX = getBeamX;
    this.running  = false;
    this.rafId    = null;

    this.w = 0;
    this.h = 0;
    this.particles = [];
    this.beamW     = 3;

    this._createGradient();
  }

  /* gradient radial pré-rendu (cache) */
  ScannerParticles.prototype._createGradient = function () {
    var c = document.createElement('canvas');
    c.width = 16; c.height = 16;
    var ctx = c.getContext('2d');
    var half = 8;
    var g = ctx.createRadialGradient(half, half, 0, half, half, half);
    g.addColorStop(0,   'rgba(255, 255, 255, 1)');
    g.addColorStop(0.3, 'rgba(196, 181, 253, 0.8)');
    g.addColorStop(0.7, 'rgba(139, 92, 246, 0.4)');
    g.addColorStop(1,   'transparent');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(half, half, half, 0, Math.PI * 2);
    ctx.fill();
    this._gradCache = c;
  };

  ScannerParticles.prototype._makeParticle = function () {
    var bx = this.getBeamX();
    return {
      x: bx + (Math.random() - 0.5) * this.beamW,
      y: Math.random() * this.h,
      vx: 0.2 + Math.random() * 0.8,
      vy: (Math.random() - 0.5) * 0.3,
      radius: 0.4 + Math.random() * 0.6,
      alpha: 0.6 + Math.random() * 0.4,
      origAlpha: 0,
      life: 1,
      decay: 0.005 + Math.random() * 0.02,
      twinkleSpd: 0.02 + Math.random() * 0.06,
      twinkleAmt: 0.1 + Math.random() * 0.15,
      time: 0
    };
  };

  ScannerParticles.prototype._resize = function () {
    var rect = this.canvas.parentElement.getBoundingClientRect();
    this.w = rect.width;
    this.h = rect.height;
    // rendu à 50% de résolution — les particules sont floues par nature, pas besoin de full res
    this.canvas.width  = Math.round(this.w * 0.5);
    this.canvas.height = Math.round(this.h * 0.5);
  };

  ScannerParticles.prototype.start = function () {
    if (this.running) return;
    this.running = true;
    this._resize();
    this.particles = [];
    for (var i = 0; i < PARTICLE_MAX; i++) {
      var p = this._makeParticle();
      p.origAlpha = p.alpha;
      this.particles.push(p);
    }
    this._loop();
  };

  ScannerParticles.prototype.stop = function () {
    this.running = false;
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  };

  ScannerParticles.prototype._loop = function () {
    if (!this.running) return;
    var self = this;
    var now = performance.now();
    // throttle à ~30fps (33ms entre frames)
    if (now - (self._lastFrame || 0) >= 33) {
      self._lastFrame = now;
      this._render();
    }
    this.rafId = requestAnimationFrame(function () { self._loop(); });
  };

  ScannerParticles.prototype._render = function () {
    var ctx = this.ctx;
    // coordonnées en espace réel (CSS), canvas à 50%
    var w = this.w, h = this.h;
    var cw = this.canvas.width, ch = this.canvas.height;
    var scale = 0.5;
    var bx = this.getBeamX() * scale;

    ctx.globalCompositeOperation = 'source-over';
    ctx.clearRect(0, 0, cw, ch);

    // glow simplifié (1 seul gradient)
    var lw = this.beamW;
    ctx.globalCompositeOperation = 'lighter';
    var g = ctx.createLinearGradient(bx - lw * 3, 0, bx + lw * 3, 0);
    g.addColorStop(0, 'rgba(139, 92, 246, 0)');
    g.addColorStop(0.5, 'rgba(196, 181, 253, 0.5)');
    g.addColorStop(1, 'rgba(139, 92, 246, 0)');
    ctx.globalAlpha = 0.7;
    ctx.fillStyle = g;
    ctx.fillRect(bx - lw * 3, 0, lw * 6, ch);

    // particules (coordonnées en espace réel, dessinées en espace canvas)
    for (var i = 0; i < this.particles.length; i++) {
      var p = this.particles[i];

      p.x += p.vx;
      p.y += p.vy;
      p.time++;
      p.alpha = p.origAlpha * p.life +
                Math.sin(p.time * p.twinkleSpd) * p.twinkleAmt;
      p.life -= p.decay;

      // respawn si mort ou hors écran
      if (p.x > w + 10 || p.life <= 0) {
        var np = this._makeParticle();
        np.origAlpha = np.alpha;
        this.particles[i] = np;
        continue;
      }

      // fondu vertical aux bords
      var fadeAlpha = 1;
      if (p.y < FADE_ZONE) fadeAlpha = p.y / FADE_ZONE;
      else if (p.y > h - FADE_ZONE) fadeAlpha = (h - p.y) / FADE_ZONE;
      if (fadeAlpha < 0) fadeAlpha = 0;
      if (fadeAlpha > 1) fadeAlpha = 1;

      var a = p.alpha * fadeAlpha;
      if (a <= 0) continue; // skip invisible — évite un drawImage inutile
      ctx.globalAlpha = a;
      // dessiner en coordonnées canvas (÷2)
      var px = p.x * scale;
      var py = p.y * scale;
      var pr = p.radius;
      ctx.drawImage(this._gradCache, px - pr, py - pr, pr * 2, pr * 2);
    }
  };


  /* ----------------------------------------------------------------
     INITIALISATION — IntersectionObserver
     ---------------------------------------------------------------- */
  function init() {
    var viewport = document.querySelector('.carousel-viewport');
    if (!viewport) return;

    var stream = new CardStream(viewport);

    var scannerCanvas = viewport.querySelector('.scanner-canvas');
    var fx = new ScannerParticles(scannerCanvas, function () {
      return viewport.offsetWidth / 2;
    });

    var section = document.querySelector('.manifeste-section');
    if (!section) return;

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          stream.start();
          stream.startAsciiRefresh();
          fx.start();
        } else {
          stream.stop();
          stream.stopAsciiRefresh();
          fx.stop();
        }
      });
    }, { threshold: 0.1 });

    observer.observe(section);

    window.addEventListener('resize', function () {
      if (fx.running) fx._resize();
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
