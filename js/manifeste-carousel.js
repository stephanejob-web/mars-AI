/* ================================================================
   MANIFESTE CAROUSEL — Style Evervault Card Scanner
   Flux horizontal de cartes vidéo traversant un scanner vertical.
   Quand une carte croise le scanner, un côté se transforme en ASCII.
   Particules violettes émanant du faisceau.
   IIFE autonome, 0 dépendance externe.
   ================================================================ */
;(function () {
  'use strict';

  /* ----------------------------------------------------------------
     Configuration
     ---------------------------------------------------------------- */
  var VIDEOS = [
    '../assets/ia2.mp4',
    '../assets/ia3.mp4',
    '../assets/ia1.mp4',
    '../assets/ia.mp4'
  ];
  var CARD_COUNT    = 12;      // 3 sets de 4 vidéos
  var CARD_W        = 380;
  var CARD_H        = 230;
  var CARD_GAP      = 50;
  var SCROLL_SPEED  = 80;      // px/s
  var SCANNER_W     = 8;       // zone de détection du scanner (px)
  var PARTICLE_MAX  = 400;
  var FADE_ZONE     = 50;      // zone de fondu haut/bas des particules

  /* ----------------------------------------------------------------
     Générateur de code ASCII (thème IA/vidéo)
     ---------------------------------------------------------------- */
  function generateCode(cols, rows) {
    var snippets = [
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
      'b.floor(window.innerWidth / 2), width: SCAN_WIDTH',
    ];

    // construire un flux continu de texte
    var flow = snippets.join(' ');
    var total = cols * rows;
    while (flow.length < total + cols) {
      flow += ' ' + snippets[Math.floor(Math.random() * snippets.length)];
    }

    var out = '';
    var offset = Math.floor(Math.random() * 200); // décalage aléatoire
    for (var r = 0; r < rows; r++) {
      var line = flow.substr(offset + r * cols, cols);
      if (line.length < cols) line += ' '.repeat(cols - line.length);
      out += line + (r < rows - 1 ? '\n' : '');
    }
    return out;
  }

  function calcCodeDims(w, h) {
    var charW = 6, lineH = 12;
    return { cols: Math.floor(w / charW), rows: Math.floor(h / lineH) };
  }


  /* ----------------------------------------------------------------
     Création d'une carte (wrapper normal + ascii)
     ---------------------------------------------------------------- */
  function createCard(index) {
    var wrapper = document.createElement('div');
    wrapper.className = 'ev-card-wrapper';

    // couche normale (vidéo)
    var normal = document.createElement('div');
    normal.className = 'ev-card ev-card-normal';
    var video = document.createElement('video');
    video.muted = true;
    video.loop = true;
    video.playsInline = true;
    video.autoplay = true;
    video.preload = 'auto';
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
    this.videos     = [];

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
    // collecter toutes les vidéos
    this.videos = Array.from(this.cardLine.querySelectorAll('video'));
  };

  CardStream.prototype._calcDims = function () {
    this.containerW = this.viewport.offsetWidth;
    this.lineW = (CARD_W + CARD_GAP) * CARD_COUNT;
    // position initiale : centrer les cartes pour qu'elles soient visibles dès le départ
    // on place la ligne pour que le milieu du set soit au milieu du viewport
    this.position = -(this.lineW / 2 - this.containerW / 2);
  };

  /* démarrer l'animation */
  CardStream.prototype.start = function () {
    if (this.running) return;
    this.running = true;
    this.lastTime = performance.now();
    this._preloadVisible();
    this._loop();
  };

  /* lancer la lecture de toutes les vidéos visibles */
  CardStream.prototype._preloadVisible = function () {
    for (var i = 0; i < this.videos.length; i++) {
      var v = this.videos[i];
      if (v.paused) v.play().catch(function () {});
    }
  };

  CardStream.prototype.stop = function () {
    this.running = false;
    // mettre toutes les vidéos en pause
    this.videos.forEach(function (v) { if (!v.paused) v.pause(); });
  };

  CardStream.prototype._loop = function () {
    if (!this.running) return;
    var self = this;
    var now  = performance.now();
    var dt   = (now - this.lastTime) / 1000;
    this.lastTime = now;

    if (!this.dragging) {
      // friction douce
      if (this.velocity > SCROLL_SPEED) {
        this.velocity *= 0.96;
        if (this.velocity < SCROLL_SPEED) this.velocity = SCROLL_SPEED;
      }
      this.position += this.velocity * this.direction * dt;
      this._wrap();
    }

    this.cardLine.style.transform = 'translateX(' + this.position + 'px)';
    this._updateClipping();
    this._manageVideos();

    requestAnimationFrame(function () { self._loop(); });
  };

  /* boucle infinie : quand tout sort, on revient */
  CardStream.prototype._wrap = function () {
    if (this.position < -this.lineW) {
      this.position = this.containerW;
    } else if (this.position > this.containerW) {
      this.position = -this.lineW;
    }
  };

  /* clipping scanner : révèle ASCII quand la carte croise le faisceau */
  CardStream.prototype._updateClipping = function () {
    var scannerX = this.containerW / 2;
    var scanLeft = scannerX - SCANNER_W / 2;
    var scanRight = scannerX + SCANNER_W / 2;

    var wrappers = this.cardLine.querySelectorAll('.ev-card-wrapper');
    for (var i = 0; i < wrappers.length; i++) {
      var wrap = wrappers[i];
      var rect = wrap.getBoundingClientRect();
      var vpRect = this.viewport.getBoundingClientRect();
      var cardLeft  = rect.left - vpRect.left;
      var cardRight = rect.right - vpRect.left;
      var cardW     = rect.width;

      var normal = wrap.querySelector('.ev-card-normal');
      var ascii  = wrap.querySelector('.ev-card-ascii');

      if (cardLeft < scanRight && cardRight > scanLeft) {
        // la carte croise le scanner — clip progressif
        var intersectLeft  = Math.max(scanLeft - cardLeft, 0);
        var intersectRight = Math.min(scanRight - cardLeft, cardW);
        var pctLeft  = (intersectLeft / cardW) * 100;
        var pctRight = (intersectRight / cardW) * 100;
        // normal : cacher la partie gauche (déjà scannée)
        normal.style.clipPath = 'inset(0 0 0 ' + pctLeft + '%)';
        // ascii : cacher la partie droite (pas encore scannée)
        ascii.style.clipPath = 'inset(0 ' + (100 - pctRight) + '% 0 0)';
      } else if (cardRight <= scanLeft) {
        // carte entièrement passée : tout en ASCII
        normal.style.clipPath = 'inset(0 0 0 100%)';
        ascii.style.clipPath = 'none';
      } else {
        // carte pas encore scannée : tout en vidéo
        normal.style.clipPath = 'none';
        ascii.style.clipPath = 'inset(0 100% 0 0)';
      }
    }
  };

  /* play/pause des vidéos selon proximité au viewport */
  CardStream.prototype._manageVideos = function () {
    var vpRect = this.viewport.getBoundingClientRect();
    var margin = 500;

    for (var i = 0; i < this.videos.length; i++) {
      var v    = this.videos[i];
      var rect = v.getBoundingClientRect();
      var visible = rect.right > vpRect.left - margin && rect.left < vpRect.right + margin;

      if (visible) {
        if (v.paused) v.play().catch(function () {});
      } else {
        if (!v.paused) v.pause();
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

    // scroll molette
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

  /* rafraîchir le contenu ASCII périodiquement */
  CardStream.prototype.startAsciiRefresh = function () {
    var self = this;
    this._asciiTimer = setInterval(function () {
      var contents = self.cardLine.querySelectorAll('.ascii-content');
      for (var i = 0; i < contents.length; i++) {
        if (Math.random() < 0.15) {
          var dims = calcCodeDims(CARD_W, CARD_H);
          contents[i].textContent = generateCode(dims.cols, dims.rows);
        }
      }
    }, 250);
  };

  CardStream.prototype.stopAsciiRefresh = function () {
    if (this._asciiTimer) {
      clearInterval(this._asciiTimer);
      this._asciiTimer = null;
    }
  };


  /* ----------------------------------------------------------------
     ScannerParticles — Canvas 2D
     Particules violettes émanant du faisceau scanner vertical.
     Adaptées de l'effet Evervault.
     ---------------------------------------------------------------- */
  function ScannerParticles(canvas, getBeamX) {
    this.canvas   = canvas;
    this.ctx      = canvas.getContext('2d');
    this.getBeamX = getBeamX; // fonction retournant le X du scanner
    this.running  = false;
    this.rafId    = null;

    this.w = 0;
    this.h = 0;
    this.particles = [];
    this.count     = 0;
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
      vx: (0.2 + Math.random() * 0.8),
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
    this.canvas.width  = this.w;
    this.canvas.height = this.h;
  };

  ScannerParticles.prototype.start = function () {
    if (this.running) return;
    this.running = true;
    this._resize();
    // initialiser les particules
    this.particles = [];
    this.count = 0;
    for (var i = 0; i < PARTICLE_MAX; i++) {
      var p = this._makeParticle();
      p.origAlpha = p.alpha;
      this.particles.push(p);
      this.count++;
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
    this._render();
    this.rafId = requestAnimationFrame(function () { self._loop(); });
  };

  ScannerParticles.prototype._render = function () {
    var ctx = this.ctx;
    var w = this.w, h = this.h;
    var bx = this.getBeamX();

    // fond transparent
    ctx.globalCompositeOperation = 'source-over';
    ctx.clearRect(0, 0, w, h);

    // dessiner le glow du faisceau
    this._drawBeamGlow(bx);

    // dessiner les particules
    ctx.globalCompositeOperation = 'lighter';
    for (var i = 0; i < this.particles.length; i++) {
      var p = this.particles[i];

      // mouvement
      p.x += p.vx;
      p.y += p.vy;
      p.time++;
      p.alpha = p.origAlpha * p.life +
                Math.sin(p.time * p.twinkleSpd) * p.twinkleAmt;
      p.life -= p.decay;

      // respawn si mort ou hors écran
      if (p.x > w + 10 || p.life <= 0) {
        this.particles[i] = this._makeParticle();
        this.particles[i].origAlpha = this.particles[i].alpha;
        continue;
      }

      // fondu vertical aux bords
      var fadeAlpha = 1;
      if (p.y < FADE_ZONE) fadeAlpha = p.y / FADE_ZONE;
      else if (p.y > h - FADE_ZONE) fadeAlpha = (h - p.y) / FADE_ZONE;
      fadeAlpha = Math.max(0, Math.min(1, fadeAlpha));

      ctx.globalAlpha = Math.max(0, p.alpha) * fadeAlpha;
      ctx.drawImage(this._gradCache,
        p.x - p.radius, p.y - p.radius,
        p.radius * 2, p.radius * 2);
    }

    // spawn de nouvelles particules
    if (Math.random() < 0.8 && this.count < PARTICLE_MAX) {
      var np = this._makeParticle();
      np.origAlpha = np.alpha;
      this.particles.push(np);
      this.count++;
    }

    // nettoyage mémoire si trop de particules
    if (this.particles.length > PARTICLE_MAX + 100) {
      this.particles = this.particles.slice(-PARTICLE_MAX);
      this.count = this.particles.length;
    }
  };

  /* glow du faisceau scanner (dessiné sur le canvas) */
  ScannerParticles.prototype._drawBeamGlow = function (bx) {
    var ctx = this.ctx;
    var h = this.h;
    var lw = this.beamW;

    // gradient vertical pour fondu haut/bas
    var vGrad = ctx.createLinearGradient(0, 0, 0, h);
    vGrad.addColorStop(0, 'rgba(255,255,255,0)');
    vGrad.addColorStop(FADE_ZONE / h, 'rgba(255,255,255,1)');
    vGrad.addColorStop(1 - FADE_ZONE / h, 'rgba(255,255,255,1)');
    vGrad.addColorStop(1, 'rgba(255,255,255,0)');

    ctx.globalCompositeOperation = 'lighter';

    // glow large
    var g2 = ctx.createLinearGradient(bx - lw * 4, 0, bx + lw * 4, 0);
    g2.addColorStop(0, 'rgba(139, 92, 246, 0)');
    g2.addColorStop(0.5, 'rgba(139, 92, 246, 0.35)');
    g2.addColorStop(1, 'rgba(139, 92, 246, 0)');
    ctx.globalAlpha = 0.6;
    ctx.fillStyle = g2;
    ctx.fillRect(bx - lw * 4, 0, lw * 8, h);

    // glow moyen
    var g1 = ctx.createLinearGradient(bx - lw * 2, 0, bx + lw * 2, 0);
    g1.addColorStop(0, 'rgba(139, 92, 246, 0)');
    g1.addColorStop(0.5, 'rgba(196, 181, 253, 0.7)');
    g1.addColorStop(1, 'rgba(139, 92, 246, 0)');
    ctx.globalAlpha = 0.8;
    ctx.fillStyle = g1;
    ctx.fillRect(bx - lw * 2, 0, lw * 4, h);

    // masque vertical (fondu haut/bas)
    ctx.globalCompositeOperation = 'destination-in';
    ctx.globalAlpha = 1;
    ctx.fillStyle = vGrad;
    ctx.fillRect(0, 0, this.w, h);
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
