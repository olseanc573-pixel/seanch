/* ==========================================================================
   SeanCH - Main Application Logic, 3D Effects & Interactivity Script
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  // Core Existing Features (wrapped in try/catch to ensure max reliability)
  try { initStarCanvas(); } catch (e) { console.warn(e); }
  try { initScrollReveal(); } catch (e) { console.warn(e); }
  try { initRoomInteractions(); } catch (e) { console.warn(e); }
  try { initPixelCharacters(); } catch (e) { console.warn(e); }
  try { initSFX(); } catch (e) { console.warn(e); }
  try { initProjectFiltersAndModals(); } catch (e) { console.warn(e); }
  try { initRadioUI(); } catch (e) { console.warn(e); }
  try { initToggles(); } catch (e) { console.warn(e); }
  try { initLiveClock(); } catch (e) { console.warn(e); }
  try { initMobileNav(); } catch (e) { console.warn(e); }

  // Upgrade Features: Rich 3D & Interactive Visuals
  try { init3DTiltCards(); } catch (e) { console.warn(e); }
  try { initHero3DParallax(); } catch (e) { console.warn(e); }
  try { init3DMascotCube(); } catch (e) { console.warn(e); }
  try { initCursorGlow(); } catch (e) { console.warn(e); }
});

/* --------------------------------------------------------------------------
   1. IntersectionObserver Scroll Reveal (Fixed Cascade & Triggers)
   -------------------------------------------------------------------------- */
function initScrollReveal() {
  const reveals = document.querySelectorAll('.reveal');
  console.log(`[ScrollReveal] Initialized for ${reveals.length} elements`);

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
        obs.unobserve(entry.target);
      }
    });
  }, observerOptions);

  reveals.forEach(el => observer.observe(el));

  // Failsafe: ensure content becomes visible even if observer fails
  setTimeout(() => {
    reveals.forEach(el => el.classList.add('active'));
  }, 1200);
}

/* --------------------------------------------------------------------------
   2. UPGRADE: True 3D Three.js Star Background (With 2D Fallback)
   -------------------------------------------------------------------------- */
function initStarCanvas() {
  const canvas = document.getElementById('star-canvas');
  if (!canvas) return;

  // Fallback check if Three.js is not loaded
  if (typeof THREE === 'undefined') {
    console.warn('[Three.js] THREE library not loaded. Falling back to 2D stars.');
    initFallback2DStars(canvas);
    return;
  }

  try {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isMobile = window.innerWidth <= 768 || ('ontouchstart' in window);
    const isLowPower = isMobile || (window.devicePixelRatio < 1.5);

    // Three.js WebGLRenderer
    const renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: false });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 1, 1000);
    camera.position.z = 400;

    // Performance-scaled star particle count
    const starCount = isLowPower ? (isMobile ? 220 : 400) : 800;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(starCount * 3);
    const colors = new Float32Array(starCount * 3);
    const sizes = new Float32Array(starCount);

    const hexPalette = ['#ff79c6', '#8be9fd', '#f1fa8c', '#bd93f9', '#ffffff'];

    for (let i = 0; i < starCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 1400;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 1400;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 900;

      const c = new THREE.Color(hexPalette[Math.floor(Math.random() * hexPalette.length)]);
      colors[i * 3] = c.r;
      colors[i * 3 + 1] = c.g;
      colors[i * 3 + 2] = c.b;

      sizes[i] = Math.random() < 0.75 ? 3.0 : 5.0;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

    // Custom pixelated texture for sharp pixel edges
    const textureCanvas = document.createElement('canvas');
    textureCanvas.width = 8;
    textureCanvas.height = 8;
    const tCtx = textureCanvas.getContext('2d');
    tCtx.fillStyle = '#ffffff';
    tCtx.fillRect(1, 1, 6, 6);

    const starTexture = new THREE.CanvasTexture(textureCanvas);
    starTexture.magFilter = THREE.NearestFilter;
    starTexture.minFilter = THREE.NearestFilter;

    const material = new THREE.PointsMaterial({
      size: 4,
      map: starTexture,
      transparent: true,
      vertexColors: true,
      depthWrite: false,
      sizeAttenuation: true
    });

    const starParticles = new THREE.Points(geometry, material);
    scene.add(starParticles);

    // Mouse & Gyro camera variables
    let targetCamX = 0;
    let targetCamY = 0;
    let currentCamX = 0;
    let currentCamY = 0;

    const canHover = window.matchMedia('(hover: hover)').matches;

    if (canHover && !prefersReducedMotion) {
      window.addEventListener('mousemove', (e) => {
        const mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
        const mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
        targetCamX = mouseX * 22; // Subtle angle range
        targetCamY = -mouseY * 22;
      });
    }

    if (!canHover && !prefersReducedMotion && window.DeviceOrientationEvent) {
      window.addEventListener('deviceorientation', (e) => {
        if (e.gamma !== null && e.beta !== null) {
          targetCamX = (e.gamma / 45) * 15;
          targetCamY = ((e.beta - 45) / 45) * 15;
        }
      });
    }

    window.addEventListener('resize', () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    });

    const clock = new THREE.Clock();

    function animateStars() {
      requestAnimationFrame(animateStars);

      if (!prefersReducedMotion) {
        const elapsedTime = clock.getElapsedTime();
        const idleX = isLowPower ? 0 : Math.sin(elapsedTime * 0.25) * 8;
        const idleY = isLowPower ? 0 : Math.cos(elapsedTime * 0.2) * 8;

        if (!isLowPower) {
          starParticles.rotation.y = elapsedTime * 0.015;
        }

        currentCamX += (targetCamX + idleX - currentCamX) * 0.04;
        currentCamY += (targetCamY + idleY - currentCamY) * 0.04;

        camera.position.x = currentCamX;
        camera.position.y = currentCamY;
        camera.lookAt(scene.position);
      }

      renderer.render(scene, camera);
    }

    animateStars();

  } catch (err) {
    console.warn('[Three.js Starfield Error, using 2D fallback]:', err);
    initFallback2DStars(canvas);
  }
}

function initFallback2DStars(canvas) {
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
   3. UPGRADE: 3D Tilt Interaction on .pixel-window Cards
   -------------------------------------------------------------------------- */
function init3DTiltCards() {
  const cards = document.querySelectorAll('.pixel-window');
  const canHover = window.matchMedia('(hover: hover)').matches;
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Disabled on touch devices or reduced motion
  if (!canHover || prefersReducedMotion) return;

  cards.forEach(card => {
    // Append specular reflection glow element if missing
    if (!card.querySelector('.pixel-window-glow')) {
      const glow = document.createElement('div');
      glow.className = 'pixel-window-glow';
      card.appendChild(glow);
    }

    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const relX = (x - rect.width / 2) / (rect.width / 2);
      const relY = (y - rect.height / 2) / (rect.height / 2);

      const maxTilt = 8; // Max 8 degrees angle cap
      const rotX = -relY * maxTilt;
      const rotY = relX * maxTilt;

      card.style.transform = `perspective(1000px) rotateX(${rotX.toFixed(2)}deg) rotateY(${rotY.toFixed(2)}deg) scale3d(1.015, 1.015, 1.015)`;
      card.style.setProperty('--glow-x', `${x}px`);
      card.style.setProperty('--glow-y', `${y}px`);
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
    });
  });
}

/* --------------------------------------------------------------------------
   4. UPGRADE: Hero Lofi Room Scene 3D-ish Parallax
   -------------------------------------------------------------------------- */
function initHero3DParallax() {
  const hero = document.getElementById('hero');
  const roomScene = document.getElementById('room-scene');
  if (!hero || !roomScene) return;

  const canHover = window.matchMedia('(hover: hover)').matches;
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (!canHover || prefersReducedMotion) return;

  const skyLayer = roomScene.querySelector('.room-sky-layer');
  const deskLayer = roomScene.querySelector('.room-desk-layer');

  let mouseX = 0, mouseY = 0;
  let currX = 0, currY = 0;
  let isHovered = false;

  hero.addEventListener('mousemove', (e) => {
    const rect = hero.getBoundingClientRect();
    mouseX = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
    mouseY = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
    isHovered = true;
  });

  hero.addEventListener('mouseleave', () => {
    isHovered = false;
  });

  function animateParallax() {
    requestAnimationFrame(animateParallax);

    const targetX = isHovered ? mouseX : 0;
    const targetY = isHovered ? mouseY : 0;

    currX += (targetX - currX) * 0.08;
    currY += (targetY - currY) * 0.08;

    if (skyLayer) {
      skyLayer.style.transform = `translate3d(${(currX * -10).toFixed(1)}px, ${(currY * -6).toFixed(1)}px, 0)`;
    }

    if (deskLayer) {
      deskLayer.style.transform = `translate3d(${(currX * 6).toFixed(1)}px, ${(currY * 4).toFixed(1)}px, 0)`;
    }
  }

  animateParallax();
}

/* --------------------------------------------------------------------------
   5. UPGRADE: Interactive 3D Pixel Mascot Cube (Three.js Drag & Rotate)
   -------------------------------------------------------------------------- */
function init3DMascotCube() {
  const container = document.getElementById('mascot-3d-container');
  if (!container) return;

  if (typeof THREE === 'undefined') {
    container.innerHTML = '<div class="flex items-center justify-center h-full text-2xl">👾</div>';
    return;
  }

  try {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const width = container.clientWidth || 72;
    const height = container.clientHeight || 72;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: false });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height);
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 100);
    camera.position.z = 3.6;

    const geometry = new THREE.BoxGeometry(1.65, 1.65, 1.65);

    // Create 6 retro pixel texture faces using Canvas 2D
    const faceIcons = ['👾', '☕', '🚀', '🎮', '💻', '⚡'];
    const faceColors = ['#ff79c6', '#ffb86c', '#8be9fd', '#bd93f9', '#50fa7b', '#f1fa8c'];

    const materials = faceIcons.map((icon, i) => {
      const canvas = document.createElement('canvas');
      canvas.width = 64;
      canvas.height = 64;
      const ctx = canvas.getContext('2d');

      // Outer border & fill
      ctx.fillStyle = faceColors[i];
      ctx.fillRect(0, 0, 64, 64);

      ctx.fillStyle = '#120e24';
      ctx.fillRect(4, 4, 56, 56);

      // Icon text rendering
      ctx.font = '28px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(icon, 32, 34);

      const texture = new THREE.CanvasTexture(canvas);
      texture.magFilter = THREE.NearestFilter;
      texture.minFilter = THREE.NearestFilter;

      return new THREE.MeshBasicMaterial({ map: texture });
    });

    const cube = new THREE.Mesh(geometry, materials);
    scene.add(cube);

    let isDragging = false;
    let previousMousePosition = { x: 0, y: 0 };

    container.addEventListener('pointerdown', (e) => {
      isDragging = true;
      previousMousePosition = { x: e.clientX, y: e.clientY };
      try { container.setPointerCapture(e.pointerId); } catch (err) {}
    });

    container.addEventListener('pointermove', (e) => {
      if (!isDragging) return;
      const deltaMove = {
        x: e.clientX - previousMousePosition.x,
        y: e.clientY - previousMousePosition.y
      };

      cube.rotation.y += deltaMove.x * 0.02;
      cube.rotation.x += deltaMove.y * 0.02;

      previousMousePosition = { x: e.clientX, y: e.clientY };
    });

    const endDrag = (e) => {
      isDragging = false;
      try { container.releasePointerCapture(e.pointerId); } catch (err) {}
    };

    container.addEventListener('pointerup', endDrag);
    container.addEventListener('pointercancel', endDrag);

    function animateCube() {
      requestAnimationFrame(animateCube);

      if (!isDragging && !prefersReducedMotion) {
        cube.rotation.y += 0.012;
        cube.rotation.x += 0.006;
      }

      renderer.render(scene, camera);
    }

    animateCube();

  } catch (err) {
    console.warn('[3D Mascot Cube Error]:', err);
    container.innerHTML = '<div class="flex items-center justify-center h-full text-2xl">👾</div>';
  }
}

/* --------------------------------------------------------------------------
   6. UPGRADE: Cursor Reactive Ambient Light Overlay
   -------------------------------------------------------------------------- */
function initCursorGlow() {
  const canHover = window.matchMedia('(hover: hover)').matches;
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (!canHover || prefersReducedMotion) return;

  let glow = document.getElementById('cursor-glow');
  if (!glow) {
    glow = document.createElement('div');
    glow.id = 'cursor-glow';
    glow.className = 'cursor-glow-overlay';
    document.body.appendChild(glow);
  }

  let targetX = -500, targetY = -500;
  let currX = -500, currY = -500;
  let active = false;

  window.addEventListener('pointermove', (e) => {
    targetX = e.clientX;
    targetY = e.clientY;
    if (!active) {
      active = true;
      glow.style.opacity = '1';
    }
  });

  document.addEventListener('mouseleave', () => {
    active = false;
    glow.style.opacity = '0';
  });

  function renderGlow() {
    requestAnimationFrame(renderGlow);
    if (!active) return;
    currX += (targetX - currX) * 0.15;
    currY += (targetY - currY) * 0.15;
    glow.style.transform = `translate3d(${currX.toFixed(1)}px, ${currY.toFixed(1)}px, 0)`;
  }

  renderGlow();
}

/* --------------------------------------------------------------------------
   7. Interactive Pixel Characters & Companions
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
   8. 8-Bit Retro Sound Effects (SFX) Engine
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
   9. Interactive Pixel Room Scene (Hero)
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
   10. Lofi Radio Widget Controls
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
   11. Projects Filtering & Detail Modal
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
   12. Scanline Toggle
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
   13. Live Retro Clock
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
   14. Mobile Navigation Drawer
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
   15. Toast Notification System
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
