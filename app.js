/* ==========================================================================
   SeanCH - Main Application Logic, Scroll Reveal & Interactivity Script
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  initStarCanvas();
  initScrollReveal();
  initRoomInteractions();
  initPixelCharacters();
  initSFX();
  initProjectFiltersAndModals();
  initRadioUI();
  initToggles();
  initLiveClock();
  initMobileNav();
});

/* --------------------------------------------------------------------------
   1. IntersectionObserver Scroll Reveal (Fixed Cascade & Triggers)
   -------------------------------------------------------------------------- */
function initScrollReveal() {
  const reveals = document.querySelectorAll('.reveal');
  console.log(`[ScrollReveal] Initialized for ${reveals.length} elements`);

  // Check for reduced motion preference
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (prefersReducedMotion) {
    reveals.forEach(el => el.classList.add('active'));
    return;
  }

  const observerOptions = {
    threshold: 0.15,
    rootMargin: '0px 0px -80px 0px'
  };

  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('active');
        console.log('[ScrollReveal] Activated:', entry.target);
        obs.unobserve(entry.target);
      }
    });
  }, observerOptions);

  reveals.forEach(el => observer.observe(el));
}

/* --------------------------------------------------------------------------
   2. Twinkling Star Background (Canvas)
   -------------------------------------------------------------------------- */
function initStarCanvas() {
  const canvas = document.getElementById('star-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let width = canvas.width = window.innerWidth;
  let height = canvas.height = window.innerHeight;

  window.addEventListener('resize', () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  });

  const stars = [];
  const starCount = Math.floor((width * height) / 4500);

  for (let i = 0; i < starCount; i++) {
    stars.push({
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() < 0.8 ? 2 : 3,
      alpha: Math.random(),
      speed: 0.005 + Math.random() * 0.015,
      color: Math.random() > 0.3 ? '#ff79c6' : (Math.random() > 0.5 ? '#8be9fd' : '#f1fa8c')
    });
  }

  function draw() {
    ctx.clearRect(0, 0, width, height);

    stars.forEach(star => {
      star.alpha += star.speed;
      if (star.alpha > 1 || star.alpha < 0.1) {
        star.speed = -star.speed;
      }

      ctx.save();
      ctx.globalAlpha = Math.max(0.1, Math.min(1, star.alpha));
      ctx.fillStyle = star.color;
      ctx.fillRect(Math.floor(star.x), Math.floor(star.y), star.size, star.size);
      ctx.restore();
    });

    requestAnimationFrame(draw);
  }

  draw();
}

/* --------------------------------------------------------------------------
   3. Interactive Pixel Characters & Companions
   -------------------------------------------------------------------------- */
const CHAR_QUOTES = [
  "👾 Hi! I'm Pixel Sean's mascot!",
  "🚀 Welcome to SeanCH's Lofi Workspace!",
  "✨ Keep scrolling down to see cool projects!",
  "🎮 Designed with passion & retro vibes!",
  "☕ Have a coffee and enjoy the lofi music!"
];

function initPixelCharacters() {
  document.querySelectorAll('.pixel-jumping-char, .pixel-waving-char').forEach((char, idx) => {
    char.addEventListener('click', () => {
      playRetroBeep(950 + idx * 100, 0.1, 'square', 0.05);
      showToast(CHAR_QUOTES[idx % CHAR_QUOTES.length]);
    });
  });
}

/* --------------------------------------------------------------------------
   4. 8-Bit Retro Sound Effects (SFX) Engine
   -------------------------------------------------------------------------- */
let sfxEnabled = true;
let sfxAudioCtx = null;

function initSFX() {
  const sfxToggleBtn = document.getElementById('sfx-toggle');
  if (sfxToggleBtn) {
    sfxToggleBtn.addEventListener('click', () => {
      sfxEnabled = !sfxEnabled;
      sfxToggleBtn.innerText = sfxEnabled ? '🔊 SFX: ON' : '🔇 SFX: OFF';
      showToast(sfxEnabled ? 'Retro SFX Enabled 🎮' : 'SFX Muted 🔇');
    });
  }

  document.querySelectorAll('.pixel-btn, .nav-link, .project-card').forEach(elem => {
    elem.addEventListener('mouseenter', () => playRetroBeep(440, 0.03, 'square', 0.02));
    elem.addEventListener('click', () => playRetroBeep(880, 0.06, 'triangle', 0.04));
  });
}

function playRetroBeep(freq, duration, type = 'square', vol = 0.03) {
  if (!sfxEnabled) return;
  try {
    if (!sfxAudioCtx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      sfxAudioCtx = new AudioCtx();
    }
    if (sfxAudioCtx.state === 'suspended') {
      sfxAudioCtx.resume();
    }

    const osc = sfxAudioCtx.createOscillator();
    const gain = sfxAudioCtx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, sfxAudioCtx.currentTime);

    gain.gain.setValueAtTime(vol, sfxAudioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, sfxAudioCtx.currentTime + duration);

    osc.connect(gain);
    gain.connect(sfxAudioCtx.destination);

    osc.start();
    osc.stop(sfxAudioCtx.currentTime + duration);
  } catch (e) {
    // Ignore audio restrictions
  }
}

/* --------------------------------------------------------------------------
   5. Interactive Pixel Room Scene (Hero)
   -------------------------------------------------------------------------- */
const COFFEE_FORTUNES = [
  "☕ SeanCH's Lofi Brew: 100% Bugs fixed, 0% Caffeine lost!",
  "☕ Wise Dev Saying: 'It works on my machine... and in production!'",
  "☕ Creative Spark: Pixel perfection is an attitude.",
  "☕ Lofi Fortune: A clean UI brings a calm mind.",
  "☕ Coffee Status: Refilled. Ready to craft interactive magic!"
];

function initRoomInteractions() {
  const roomScene = document.getElementById('room-scene');
  const lampBulb = document.getElementById('lamp-bulb');
  const coffeeCup = document.getElementById('coffee-cup');
  const catPet = document.getElementById('pixel-cat');
  const crtMonitor = document.getElementById('crt-monitor');

  if (lampBulb && roomScene) {
    let lampOn = true;
    lampBulb.addEventListener('click', () => {
      lampOn = !lampOn;
      roomScene.classList.toggle('lamp-on', lampOn);
      roomScene.classList.toggle('lamp-off', !lampOn);
      playRetroBeep(lampOn ? 600 : 300, 0.08, 'sine', 0.05);
      showToast(lampOn ? 'Lamp Turned ON 💡' : 'Night Mode Dimmed 🌙');
    });
  }

  if (coffeeCup) {
    let fortuneIndex = 0;
    coffeeCup.addEventListener('click', () => {
      playRetroBeep(1200, 0.1, 'triangle', 0.05);
      showToast(COFFEE_FORTUNES[fortuneIndex]);
      fortuneIndex = (fortuneIndex + 1) % COFFEE_FORTUNES.length;
    });
  }

  if (catPet) {
    catPet.addEventListener('click', () => {
      playRetroBeep(523, 0.15, 'sine', 0.06);
      showToast('🐱 Purr... Pixel Cat appreciates your visit!');
    });
  }

  if (crtMonitor) {
    const codeSnippets = [
      "const seanch = new Developer({ ui: '100%', code: 'crisp' });",
      "import { WebGL, Canvas, Audio } from 'creative-lab';",
      "renderScene({ theme: 'lofi-dusk', sfx: true });",
      "// Designing human-centered interfaces with soul..."
    ];
    let snippetIdx = 0;
    const crtTextElem = document.getElementById('crt-code-text');

    crtMonitor.addEventListener('click', () => {
      snippetIdx = (snippetIdx + 1) % codeSnippets.length;
      if (crtTextElem) {
        crtTextElem.textContent = codeSnippets[snippetIdx];
      }
      playRetroBeep(1000, 0.05, 'square', 0.04);
      showToast('🖥️ Switched CRT Monitor Preview');
    });
  }
}

/* --------------------------------------------------------------------------
   6. Lofi Radio Widget Controls
   -------------------------------------------------------------------------- */
function initRadioUI() {
  const playBtn = document.getElementById('radio-play-btn');
  const nextBtn = document.getElementById('radio-next-btn');
  const miniBtn = document.getElementById('radio-minimize-btn');
  const volumeSlider = document.getElementById('radio-volume');
  const trackTicker = document.getElementById('radio-track-name');
  const radioWidget = document.getElementById('lofi-radio-widget');

  if (!playBtn) return;

  playBtn.addEventListener('click', () => {
    const isPlaying = window.lofiRadio.togglePlay();
    playBtn.innerText = isPlaying ? '⏸ PAUSE' : '▶ PLAY';
    radioWidget.classList.toggle('playing', isPlaying);
    showToast(isPlaying ? '♫ Lofi Beats Playing...' : '♫ Music Paused');
  });

  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      const trackName = window.lofiRadio.nextTrack();
      if (trackTicker) trackTicker.innerText = trackName;
      showToast('♫ Switched to ' + trackName);
    });
  }

  if (volumeSlider) {
    volumeSlider.addEventListener('input', (e) => {
      window.lofiRadio.setVolume(parseFloat(e.target.value));
    });
  }

  if (miniBtn && radioWidget) {
    miniBtn.addEventListener('click', () => {
      radioWidget.classList.toggle('minimized');
      miniBtn.innerText = radioWidget.classList.contains('minimized') ? '▲' : '▼';
    });
  }
}

/* --------------------------------------------------------------------------
   7. Projects Filtering & Detail Modal
   -------------------------------------------------------------------------- */
const PROJECTS_DATA = {
  'pixelsynth': {
    title: 'PixelSynth Studio',
    category: 'Interactive Media • Full Stack',
    tags: ['Web Audio API', 'HTML5 Canvas', 'TypeScript', 'Tailwind'],
    description: 'A retro browser-based synthesizer, step sequencer, and audio visualizer. Craft custom 8-bit chip tunes and lofi chords with interactive canvas waveforms.',
    highlights: [
      'Procedural Web Audio API sound generation',
      'Real-time frequency visualizer canvas',
      'Preset saving & export feature',
      'Tactile retro UI controls'
    ]
  },
  'chrono': {
    title: 'Chrono UI System',
    category: 'UI/UX Design • Design Tokens',
    tags: ['Figma', 'Design Systems', 'CSS Variables', 'Micro-interactions'],
    description: 'A comprehensive cyber-retro design system built for multi-platform web apps. Features 3-tier token architecture, 50+ accessible components, and dark mode themes.',
    highlights: [
      'Comprehensive WCAG AAA color contrast mapping',
      'Figma auto-layout variables & variants',
      'Custom pixel border shadow utilities',
      'Interactive component storybook'
    ]
  },
  'cyberdusk': {
    title: 'CyberDusk RPG Canvas Engine',
    category: 'Interactive Media • Creative Coding',
    tags: ['Canvas 2D', 'JavaScript ES6', 'Web Audio', 'Pixel Art'],
    description: 'A 2D top-down browser RPG engine featuring pixel-art sprite rendering, collision detection, tilemaps, and atmospheric dusk lighting.',
    highlights: [
      'Zero-dependency 60 FPS HTML5 canvas loop',
      'Dynamic tilemap loading & object layering',
      'Custom retro dialogue box system',
      'Integrated chip-tune audio engine'
    ]
  },
  'auralofi': {
    title: 'Aura Lofi Radio App',
    category: 'Full Stack • UI/UX Design',
    tags: ['React', 'Next.js', 'Tailwind CSS', 'Web Audio'],
    description: 'A chill ambient music streaming web app with cozy animated pixel backgrounds, custom soundscape mixers (rain, coffee shop, fireplace), and pomodoro timer.',
    highlights: [
      'Multi-track ambient soundlayer mixer',
      'Custom pixel art room customization',
      'Integrated productivity timer',
      'Responsive mobile PWA layout'
    ]
  },
  'vaporflow': {
    title: 'VaporFlow Shader Visualizer',
    category: 'Interactive Media • WebGL',
    tags: ['Three.js', 'GLSL Shaders', 'WebGL', 'Creative Coding'],
    description: 'An interactive 3D shader visualizer rendering fluid neon wave patterns reacting to microphone audio input or cursor position.',
    highlights: [
      'Custom fragment shader GLSL raymarching',
      'Web Audio API FFT audio reactivity',
      'Post-processing bloom & CRT distortion filters',
      'High performance GPU rendering'
    ]
  },
  'hyperspace': {
    title: 'HyperSpace Telemetry Console',
    category: 'Full Stack Development',
    tags: ['TypeScript', 'Node.js', 'WebSockets', 'Tailwind'],
    description: 'Real-time system telemetry and metric monitoring dashboard rendered with pixel-art themed widgets, live chart streams, and instant alerts.',
    highlights: [
      'WebSocket low-latency data streaming',
      'Custom canvas charts with retro grid lines',
      'Configurable dashboard card layout',
      'Theme switching & export capabilities'
    ]
  }
};

function initProjectFiltersAndModals() {
  const filterBtns = document.querySelectorAll('.filter-btn');
  const projectCards = document.querySelectorAll('.project-card');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('pixel-btn-primary'));
      btn.classList.add('pixel-btn-primary');

      const filter = btn.getAttribute('data-filter');

      projectCards.forEach(card => {
        const cat = card.getAttribute('data-category');
        if (filter === 'all' || cat === filter) {
          card.style.display = 'block';
        } else {
          card.style.display = 'none';
        }
      });
    });
  });

  const modal = document.getElementById('project-modal');
  const closeModalBtn = document.getElementById('close-modal-btn');

  if (!modal) return;

  document.querySelectorAll('.inspect-project-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const projId = btn.getAttribute('data-project');
      openProjectModal(projId);
    });
  });

  if (closeModalBtn) {
    closeModalBtn.addEventListener('click', () => {
      modal.classList.add('hidden');
    });
  }

  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.classList.add('hidden');
    }
  });
}

function openProjectModal(id) {
  const data = PROJECTS_DATA[id];
  if (!data) return;

  const modal = document.getElementById('project-modal');
  document.getElementById('modal-title').innerText = data.title;
  document.getElementById('modal-category').innerText = data.category;
  document.getElementById('modal-description').innerText = data.description;

  const tagsContainer = document.getElementById('modal-tags');
  tagsContainer.innerHTML = '';
  data.tags.forEach(tag => {
    const span = document.createElement('span');
    span.className = 'pixel-badge pixel-badge-pink';
    span.innerText = tag;
    tagsContainer.appendChild(span);
  });

  const highlightsList = document.getElementById('modal-highlights');
  highlightsList.innerHTML = '';
  data.highlights.forEach(item => {
    const li = document.createElement('li');
    li.className = 'flex items-center gap-2 text-sm text-gray-300 font-mono';
    li.innerHTML = `<span class="text-pink-400">►</span> ${item}`;
    highlightsList.appendChild(li);
  });

  modal.classList.remove('hidden');
  playRetroBeep(600, 0.08, 'square', 0.04);
}

/* --------------------------------------------------------------------------
   8. Scanline Toggle
   -------------------------------------------------------------------------- */
function initToggles() {
  const scanlineBtn = document.getElementById('scanline-toggle');
  const overlay = document.getElementById('scanline-overlay');

  if (scanlineBtn && overlay) {
    scanlineBtn.addEventListener('click', () => {
      overlay.classList.toggle('hidden-scanlines');
      const isHidden = overlay.classList.contains('hidden-scanlines');
      scanlineBtn.innerText = isHidden ? '📺 CRT: OFF' : '📺 CRT: ON';
      showToast(isHidden ? 'CRT Scanlines Disabled' : 'CRT Scanlines Enabled');
    });
  }
}

/* --------------------------------------------------------------------------
   9. Live Retro Clock
   -------------------------------------------------------------------------- */
function initLiveClock() {
  const clockElem = document.getElementById('live-clock');
  if (!clockElem) return;

  function updateTime() {
    const now = new Date();
    const hrs = String(now.getHours()).padStart(2, '0');
    const mins = String(now.getMinutes()).padStart(2, '0');
    const secs = String(now.getSeconds()).padStart(2, '0');
    clockElem.innerText = `SYS TIME: ${hrs}:${mins}:${secs}`;
  }

  updateTime();
  setInterval(updateTime, 1000);
}

/* --------------------------------------------------------------------------
   10. Mobile Navigation Drawer
   -------------------------------------------------------------------------- */
function initMobileNav() {
  const hamburger = document.getElementById('mobile-menu-btn');
  const navDrawer = document.getElementById('mobile-nav-drawer');

  if (hamburger && navDrawer) {
    hamburger.addEventListener('click', () => {
      navDrawer.classList.toggle('hidden');
    });

    navDrawer.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        navDrawer.classList.add('hidden');
      });
    });
  }
}

/* --------------------------------------------------------------------------
   11. Toast Notification System
   -------------------------------------------------------------------------- */
let toastTimeout = null;
function showToast(message) {
  let toast = document.getElementById('pixel-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'pixel-toast';
    toast.className = 'pixel-toast';
    document.body.appendChild(toast);
  }

  toast.innerText = message;
  toast.classList.add('show');

  if (toastTimeout) clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => {
    toast.classList.remove('show');
  }, 3000);
}
