/* Cena 3D do Hero — variante "realista": notebook de alumínio, tablet e celular, sem logotipos nem marcas.
   As telas mostram o próprio portfólio no layout de cada tamanho (1280, 820 e 390 px), rolando sozinhas.
   Mesma API das outras variantes: createHeroScene(THREE, container, opts) -> Promise<{ setTheme, destroy }>. */
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

/* Telas: a página pública do CurrículoRaiz (produto do dono) em cada tamanho, sem login nem dados pessoais.
   A mesma imagem serve aos dois temas do portfólio, porque a tela mostra o produto como ele é.
   ?telas=portfolio volta a mostrar o próprio portfólio, por tema. */
const PORTFOLIO = new URLSearchParams(location.search).get('telas') === 'portfolio';
const shot = (device) => `screens/curriculoraiz-${device}.webp`;
const SCREENS = PORTFOLIO
  ? {
      laptop: { dark: 'screens/laptop-dark.webp', light: 'screens/laptop-light.webp', aspect: 1.6 },
      tablet: { dark: 'screens/tablet-dark.webp', light: 'screens/tablet-light.webp', aspect: 820 / 1180 },
      phone: { dark: 'screens/phone-dark.webp', light: 'screens/phone-light.webp', aspect: 390 / 844 },
    }
  : {
      // Notebook: vídeo do editor real em uso (Ada Lovelace, exemplo público; API simulada). No celular (toque), um quadro parado.
      laptop: { video: 'screens/curriculoraiz-editor.webm', still: 'screens/curriculoraiz-editor-still.webp', aspect: 1.6 },
      tablet: { dark: shot('tablet'), light: shot('tablet'), aspect: 820 / 1180 },
      // Celular: o painel admin do CurrículoRaiz renderizado com DADOS DE DEMONSTRAÇÃO (API simulada).
      phone: { dark: 'screens/curriculoraiz-admin-phone.webp', light: 'screens/curriculoraiz-admin-phone.webp', aspect: 390 / 844 },
    };

export async function createHeroScene(THREE, container, opts) {
  const coarse = !!opts.coarse;
  const onState = opts.onState || (() => {});
  const Q = coarse ? { dpr: 1.3 } : { dpr: 1.75 };
  const base = new URL('.', import.meta.url);

  /* ── Renderização ─────────────────────────────────────────────────────── */
  const CAM = { p: [11.5, 8.5, 18.5], t: [2.0, 1.7, 0.0], fov: 30 };
  const OVER = opts.capture ? 1 : 1.5;
  const canvas = document.createElement('canvas');
  canvas.setAttribute('aria-hidden', 'true');
  canvas.className = 'scene-canvas';
  const off = ((OVER - 1) / 2) * 100;
  Object.assign(canvas.style, { left: -off + '%', top: -off + '%', width: OVER * 100 + '%', height: OVER * 100 + '%', pointerEvents: 'none' });

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance', preserveDrawingBuffer: !!opts.capture });
  renderer.setClearColor(0x000000, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.0;
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, Q.dpr));

  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  const envTex = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environment = envTex;
  const camera = new THREE.PerspectiveCamera(CAM.fov, 1, 0.1, 200);
  const key = new THREE.DirectionalLight('#fff4e8', 1.4);
  key.position.set(-6, 12, 8);
  scene.add(key);
  /* Luz de contorno por trás: destaca as bordas dos aparelhos contra o fundo escuro. */
  const rim = new THREE.DirectionalLight('#d6e0ff', 0.9);
  rim.position.set(10, 7, -12);
  scene.add(rim);

  /* ── Materiais ───────────────────────────────────────────────────────── */
  const disposables = [];
  const track = (x) => (disposables.push(x), x);
  const M = {
    aluminum: track(new THREE.MeshPhysicalMaterial({ color: '#7c7f84', metalness: 1, roughness: 0.32, clearcoat: 0.2, clearcoatRoughness: 0.4 })),
    aluminumDark: track(new THREE.MeshPhysicalMaterial({ color: '#4b4e53', metalness: 1, roughness: 0.38 })),
    trackpad: track(new THREE.MeshPhysicalMaterial({ color: '#85888d', metalness: 1, roughness: 0.22 })),
    keys: track(new THREE.MeshStandardMaterial({ color: '#17171a', metalness: 0.1, roughness: 0.55 })),
    well: track(new THREE.MeshStandardMaterial({ color: '#0e0e10', roughness: 0.8 })),
    // Borda da tela: preto que não reage à luz, como o painel de um aparelho real (o brilho fica na camada de vidro).
    bezel: track(new THREE.MeshBasicMaterial({ color: '#050506' })),
    phoneBack: track(new THREE.MeshPhysicalMaterial({ color: '#23413b', metalness: 0.2, roughness: 0.25, clearcoat: 1, clearcoatRoughness: 0.08 })),
    phoneFrame: track(new THREE.MeshPhysicalMaterial({ color: '#2b3533', metalness: 0.9, roughness: 0.3 })),
    lens: track(new THREE.MeshPhysicalMaterial({ color: '#0a0b0d', metalness: 0.3, roughness: 0.05, clearcoat: 1 })),
    ring: track(new THREE.MeshPhysicalMaterial({ color: '#9a9ea3', metalness: 1, roughness: 0.25 })),
    glare: track(new THREE.MeshPhysicalMaterial({ color: '#ffffff', metalness: 0, roughness: 0.04, transparent: true, opacity: 0.1, depthWrite: false })),
  };
  const geo = (g) => track(g);

  /* ── Telas: textura do portfólio, rolando sozinha ─────────────────────── */
  const loader = new THREE.TextureLoader();
  const texCache = {};
  async function screenTexture(device, theme) {
    const k = device + theme; if (texCache[k]) return texCache[k];
    const t = await loader.loadAsync(new URL(SCREENS[device][theme], base).href);
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
    t.generateMipmaps = true;
    return (texCache[k] = track(t));
  }
  const screens = []; // { mesh, device, visible (fração da altura da imagem), speed, phase }
  function screenMesh(device, w, h) {
    const mat = track(new THREE.MeshBasicMaterial({ color: '#f2f2f2', toneMapped: false }));
    const mesh = new THREE.Mesh(geo(new THREE.PlaneGeometry(w, h)), mat);
    screens.push({ mesh, device, w, h });
    return mesh;
  }
  /* Vídeo da tela do notebook (um só, independente do tema). */
  let video = null, videoTex = null;
  async function laptopVideoTexture() {
    if (videoTex) return videoTex;
    video = document.createElement('video');
    Object.assign(video, { muted: true, loop: true, playsInline: true, preload: 'auto', crossOrigin: 'anonymous' });
    video.src = new URL(SCREENS.laptop.video, base).href;
    await new Promise((ok, ko) => { video.addEventListener('loadeddata', ok, { once: true }); video.addEventListener('error', ko, { once: true }); video.load(); });
    video.playbackRate = 1.3;
    videoTex = track(new THREE.VideoTexture(video));
    videoTex.colorSpace = THREE.SRGBColorSpace;
    return videoTex;
  }
  async function applyScreens(theme) {
    await Promise.all(screens.map(async (s) => {
      if (s.device === 'laptop' && SCREENS.laptop.video) {
        // Vídeo no computador; quadro parado no celular ou na captura do pôster.
        const useVideo = !coarse && !opts.capture;
        const t = useVideo ? await laptopVideoTexture() : await (async () => {
          const k = 'laptop-still'; if (texCache[k]) return texCache[k];
          const tx = await loader.loadAsync(new URL(SCREENS.laptop.still, base).href); tx.colorSpace = THREE.SRGBColorSpace; return (texCache[k] = track(tx));
        })();
        s.visible = 0; s.mesh.material.map = t; s.mesh.material.needsUpdate = true; return;
      }
      const t = (await screenTexture(s.device, theme)).clone();
      track(t);
      t.wrapS = t.wrapT = THREE.ClampToEdgeWrapping;
      const img = t.image; const visible = (img.width / SCREENS[s.device].aspect) / img.height; // fração visível da imagem
      t.repeat.set(1, visible); t.offset.set(0, 1 - visible); t.needsUpdate = true;
      s.visible = visible;
      const old = s.mesh.material.map; s.mesh.material.map = t; s.mesh.material.needsUpdate = true; old?.dispose();
    }));
  }

  /* ── Notebook (alumínio inteiriço, tampa fina, teclado e trackpad) ─────── */
  const laptop = new THREE.Group(); scene.add(laptop);
  const LW = 8, LD = 5.6, LT = 0.17;
  const baseMesh = new THREE.Mesh(geo(new RoundedBoxGeometry(LW, LT, LD, 4, 0.08)), M.aluminum);
  baseMesh.position.y = LT / 2; laptop.add(baseMesh);
  const well = new THREE.Mesh(geo(new RoundedBoxGeometry(7.0, 0.02, 2.75, 2, 0.01)), M.well);
  well.position.set(0, LT - 0.005, -1.05); laptop.add(well);
  /* Teclas: uma malha instanciada (uma chamada de desenho para o teclado inteiro). */
  const keyGeo = geo(new RoundedBoxGeometry(1, 0.05, 1, 2, 0.02));
  const rows = [
    { z: -2.2, n: 14, d: 0.2, w: 0.42 },
    { z: -1.8, n: 14, d: 0.36, w: 0.42 },
    { z: -1.35, n: 14, d: 0.36, w: 0.42 },
    { z: -0.9, n: 13, d: 0.36, w: 0.45 },
    { z: -0.45, n: 12, d: 0.36, w: 0.48 },
  ];
  const keyCount = rows.reduce((a, r) => a + r.n, 0) + 7;
  const keysMesh = new THREE.InstancedMesh(keyGeo, M.keys, keyCount);
  const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), sc = new THREE.Vector3(), ps = new THREE.Vector3();
  let ki = 0;
  for (const r of rows) {
    const total = r.n * r.w + (r.n - 1) * 0.06, x0 = -total / 2 + r.w / 2;
    for (let i = 0; i < r.n; i++) { ps.set(x0 + i * (r.w + 0.06), LT + 0.02, r.z); sc.set(r.w, 1, r.d); keysMesh.setMatrixAt(ki++, m4.compose(ps, q, sc)); }
  }
  /* Última fileira: modificadores e barra de espaço. */
  [[-2.9, 0.48], [-2.35, 0.48], [-1.75, 0.6], [0, 2.7], [1.75, 0.6], [2.35, 0.48], [2.9, 0.48]].forEach(([x, w]) => {
    ps.set(x, LT + 0.02, 0); sc.set(w, 1, 0.36); keysMesh.setMatrixAt(ki++, m4.compose(ps, q, sc));
  });
  keysMesh.instanceMatrix.needsUpdate = true;
  laptop.add(keysMesh);
  const pad = new THREE.Mesh(geo(new RoundedBoxGeometry(3.2, 0.012, 1.95, 2, 0.006)), M.trackpad);
  pad.position.set(0, LT + 0.002, 1.55); laptop.add(pad);
  /* Tampa: articulada na borda de trás; a tela olha para -y no espaço da tampa. */
  const lid = new THREE.Group(); lid.position.set(0, LT, -LD / 2 + 0.05); laptop.add(lid);
  const lidMesh = new THREE.Mesh(geo(new RoundedBoxGeometry(LW, 0.1, LD - 0.1, 4, 0.05)), M.aluminum);
  lidMesh.position.set(0, 0.05, (LD - 0.1) / 2); lid.add(lidMesh);
  const lBez = new THREE.Mesh(geo(new THREE.PlaneGeometry(LW - 0.03, LD - 0.13)), M.bezel);
  lBez.rotation.x = Math.PI / 2; lBez.position.set(0, -0.001, (LD - 0.1) / 2); lid.add(lBez);
  const LSW = 7.4, LSH = LSW / 1.6;
  const lScreen = screenMesh('laptop', LSW, LSH);
  lScreen.rotation.x = Math.PI / 2; lScreen.position.set(0, -0.004, (LD - 0.1) / 2 + 0.16); lid.add(lScreen);
  const lGlare = new THREE.Mesh(lScreen.geometry, M.glare); lGlare.rotation.copy(lScreen.rotation); lGlare.position.set(0, -0.008, lScreen.position.z); lid.add(lGlare);
  const notch = new THREE.Mesh(geo(new RoundedBoxGeometry(0.9, 0.01, 0.16, 2, 0.05)), M.bezel);
  notch.position.set(0, -0.006, LD - 0.24); lid.add(notch);
  const LID_OPEN = -1.88, LID_CLOSED = -0.12;

  /* ── Tablet (bordas finas, alumínio grafite, duas câmeras atrás) ───────── */
  const tablet = new THREE.Group(); scene.add(tablet);
  const tabletTilt = new THREE.Group(); tabletTilt.rotation.x = 1.25; tablet.add(tabletTilt);
  const TW = 4.3, TD = 6.1, TT = 0.1;
  tabletTilt.add(new THREE.Mesh(geo(new RoundedBoxGeometry(TW, TT, TD, 4, 0.05)), M.aluminumDark));
  const tBez = new THREE.Mesh(geo(new THREE.PlaneGeometry(TW - 0.06, TD - 0.06)), M.bezel);
  tBez.rotation.x = -Math.PI / 2; tBez.position.y = TT / 2 + 0.001; tabletTilt.add(tBez);
  const TSW = 4.0, TSH = TSW / SCREENS.tablet.aspect;
  const tScreen = screenMesh('tablet', TSW, TSH);
  tScreen.rotation.x = -Math.PI / 2; tScreen.position.y = TT / 2 + 0.003; tabletTilt.add(tScreen);
  const tGlare = new THREE.Mesh(tScreen.geometry, M.glare); tGlare.rotation.copy(tScreen.rotation); tGlare.position.y = TT / 2 + 0.006; tabletTilt.add(tGlare);
  [-2.55, -2.15].forEach((z) => {
    const ring = new THREE.Mesh(geo(new THREE.CylinderGeometry(0.17, 0.17, 0.05, 32)), M.ring); ring.position.set(-1.7, -TT / 2 - 0.02, z); tabletTilt.add(ring);
    const lens = new THREE.Mesh(geo(new THREE.CylinderGeometry(0.12, 0.12, 0.06, 32)), M.lens); lens.position.set(-1.7, -TT / 2 - 0.03, z); tabletTilt.add(lens);
  });

  /* ── Celular (traseira de vidro colorido, módulo de câmera, furo na tela) ─ */
  const phone = new THREE.Group(); scene.add(phone);
  const phoneTilt = new THREE.Group(); phoneTilt.rotation.x = 1.12; phone.add(phoneTilt);
  const PW = 2.05, PD = 4.35, PT = 0.12;
  phoneTilt.add(new THREE.Mesh(geo(new RoundedBoxGeometry(PW, PT, PD, 6, 0.06)), M.phoneFrame));
  const back = new THREE.Mesh(geo(new RoundedBoxGeometry(PW - 0.04, 0.02, PD - 0.04, 4, 0.01)), M.phoneBack); back.position.y = -PT / 2 + 0.005; phoneTilt.add(back);
  const pBez = new THREE.Mesh(geo(new THREE.PlaneGeometry(PW - 0.05, PD - 0.05)), M.bezel); pBez.rotation.x = -Math.PI / 2; pBez.position.y = PT / 2 + 0.001; phoneTilt.add(pBez);
  const PSW = 1.9, PSH = PSW / SCREENS.phone.aspect;
  const pScreen = screenMesh('phone', PSW, PSH);
  pScreen.rotation.x = -Math.PI / 2; pScreen.position.y = PT / 2 + 0.003; phoneTilt.add(pScreen);
  const pGlare = new THREE.Mesh(pScreen.geometry, M.glare); pGlare.rotation.copy(pScreen.rotation); pGlare.position.y = PT / 2 + 0.006; phoneTilt.add(pGlare);
  const hole = new THREE.Mesh(geo(new THREE.CylinderGeometry(0.05, 0.05, 0.01, 24)), M.bezel); hole.position.set(0, PT / 2 + 0.008, -PD / 2 + 0.22); phoneTilt.add(hole);
  const module = new THREE.Mesh(geo(new RoundedBoxGeometry(0.95, 0.06, 0.95, 4, 0.1)), M.phoneBack); module.position.set(-0.42, -PT / 2 - 0.03, -1.45); phoneTilt.add(module);
  [[-0.62, -1.65], [-0.62, -1.25]].forEach(([x, z]) => {
    const ring = new THREE.Mesh(geo(new THREE.CylinderGeometry(0.16, 0.16, 0.05, 32)), M.ring); ring.position.set(x, -PT / 2 - 0.07, z); phoneTilt.add(ring);
    const lens = new THREE.Mesh(geo(new THREE.CylinderGeometry(0.11, 0.11, 0.06, 32)), M.lens); lens.position.set(x, -PT / 2 - 0.08, z); phoneTilt.add(lens);
  });

  /* ── Sombras de contato (pré-desenhadas: mais leves que mapa de sombras) ─ */
  const blobTex = (() => {
    const c = document.createElement('canvas'); c.width = c.height = 128;
    const g = c.getContext('2d'); const grd = g.createRadialGradient(64, 64, 6, 64, 64, 62);
    grd.addColorStop(0, 'rgba(0,0,0,0.6)'); grd.addColorStop(1, 'rgba(0,0,0,0)');
    g.fillStyle = grd; g.fillRect(0, 0, 128, 128); return track(new THREE.CanvasTexture(c));
  })();
  function shadow(w, d) {
    const m = new THREE.Mesh(geo(new THREE.PlaneGeometry(w, d)), track(new THREE.MeshBasicMaterial({ map: blobTex, transparent: true, depthWrite: false, toneMapped: false })));
    m.rotation.x = -Math.PI / 2; scene.add(m); return m;
  }
  const shLaptop = shadow(11, 8), shTablet = shadow(5.5, 3), shPhone = shadow(3, 2.6);

  /* ── Posições de repouso ──────────────────────────────────────────────── */
  const REST = {
    laptop: { p: [-1.6, 0, 0.4], ry: 0.3 },
    tablet: { p: [5.0, 1.65, -2.4], ry: -0.42 },
    phone: { p: [3.3, 0.75, 4.7], ry: -0.2 },
  };
  const devices = [
    { g: laptop, r: REST.laptop, sh: shLaptop, spread: [-2.4, 0, 0.6], phase: 0 },
    { g: tablet, r: REST.tablet, sh: shTablet, spread: [2.6, 0.8, -1.2], phase: 1.7 },
    { g: phone, r: REST.phone, sh: shPhone, spread: [0.6, 0.4, 2.6], phase: 3.1 },
  ];

  let theme = opts.theme === 'light' ? 'light' : 'dark';
  function themeLook() {
    const light = theme === 'light';
    devices.forEach((d) => (d.sh.material.opacity = light ? 0.45 : 0.85));
    scene.environmentIntensity = light ? 1.0 : 0.85;
  }
  async function setTheme(next) {
    theme = next === 'light' ? 'light' : 'dark';
    themeLook();
    await applyScreens(theme);
    if (!raf) renderOnce();
  }

  /* ── Quadro: flutuação, telas rolando, ponteiro e rolagem da página ────── */
  const ptr = { x: 0, y: 0, tx: 0, ty: 0 };
  const camP = new THREE.Vector3(), camT = new THREE.Vector3(...CAM.t);
  const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
  const smooth = (t) => t * t * (3 - 2 * t);
  let t0 = performance.now(), entryStart = -1;

  function update(now) {
    const heroH = container.closest('[data-hero]')?.offsetHeight || window.innerHeight;
    const pe = smooth(clamp(window.scrollY / (heroH * 0.55), 0, 1));
    const t = (now - t0) / 1000;
    const idle = opts.capture ? 0 : 1;
    const entry = entryStart < 0 ? 1 : smooth(clamp((now - entryStart) / 1400, 0, 1));
    devices.forEach((d, i) => {
      const bob = idle * Math.sin(t * 1.1 + d.phase) * (i === 0 ? 0.05 : 0.12);
      const rise = (1 - entry) * (0.6 + i * 0.25);
      d.g.position.set(d.r.p[0] + d.spread[0] * pe, d.r.p[1] + bob + rise + d.spread[1] * pe, d.r.p[2] + d.spread[2] * pe);
      d.g.rotation.y = d.r.ry + idle * Math.sin(t * 0.6 + d.phase) * 0.035 + pe * 0.25 * (i === 0 ? -1 : 1);
      const lift = d.g.position.y - (i === 0 ? 0 : 0.35);
      d.sh.position.set(d.g.position.x + (i === 0 ? 0.2 : 0.4), 0.005, d.g.position.z + (i === 0 ? 0.3 : 0.6));
      d.sh.scale.setScalar(1 + lift * 0.18);
      d.sh.material.opacity = (theme === 'light' ? 0.45 : 0.85) * clamp(1.15 - lift * 0.35, 0.2, 1);
    });
    /* Tampa: abre na entrada (de 90° a ~108°) e fecha aos poucos enquanto o Hero sai da tela. */
    const open = LID_OPEN * (0.85 + 0.15 * entry);
    lid.rotation.x = open + (LID_CLOSED - open) * pe * 0.85;
    /* Telas: o conteúdo rola devagar até o fim, para um pouco e volta ao topo. */
    for (const s of screens) {
      if (!s.visible || !s.mesh.material.map) continue; // vídeo ou imagem parada: sem rolagem
      const cycle = 16, k = (t % cycle) / cycle;
      const pos = idle ? (k < 0.08 ? 0 : k < 0.78 ? smooth((k - 0.08) / 0.7) : k < 0.86 ? 1 : 1 - smooth((k - 0.86) / 0.14)) : 0;
      s.mesh.material.map.offset.y = (1 - s.visible) * (1 - pos);
    }
    ptr.x += (ptr.tx - ptr.x) * 0.06; ptr.y += (ptr.ty - ptr.y) * 0.06;
    camP.set(CAM.p[0] + ptr.x * 1.2, CAM.p[1] + ptr.y * 0.7, CAM.p[2]);
    camera.position.copy(camP); camera.lookAt(camT);
  }

  function resize() {
    const w = container.clientWidth * OVER, h = container.clientHeight * OVER;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.fov = (2 * Math.atan(OVER * Math.tan((CAM.fov * Math.PI) / 360)) * 180) / Math.PI;
    camera.updateProjectionMatrix();
  }
  const ro = new ResizeObserver(() => { resize(); if (!raf) renderOnce(); });
  ro.observe(container);
  function onPointer(e) { ptr.tx = e.clientX / window.innerWidth - 0.5; ptr.ty = -(e.clientY / window.innerHeight - 0.5); }
  if (!coarse) window.addEventListener('pointermove', onPointer, { passive: true });

  let raf = 0, inView = true, frames = 0, slowSum = 0, last = 0, downgraded = false;
  function renderOnce() { update(performance.now()); renderer.render(scene, camera); }
  function frame(now) {
    raf = requestAnimationFrame(frame);
    if (last && frames < 60 && !opts.noDowngrade) { slowSum += now - last; frames++; if (frames === 60) checkSpeed(); }
    last = now; update(now); renderer.render(scene, camera);
  }
  function checkSpeed() {
    if (slowSum / 60 <= 33) return;
    if (!downgraded) { downgraded = true; renderer.setPixelRatio(1); resize(); frames = 0; slowSum = 0; return; }
    fail();
  }
  function play() { if (!raf && inView && !document.hidden) { last = 0; raf = requestAnimationFrame(frame); video?.play().catch(() => {}); onState('running'); } }
  function pause() { if (raf) { cancelAnimationFrame(raf); raf = 0; video?.pause(); onState('paused'); } }
  const io = new IntersectionObserver((es) => { inView = es[0].isIntersecting; inView ? play() : pause(); });
  io.observe(container);
  function onVis() { document.hidden ? pause() : play(); }
  document.addEventListener('visibilitychange', onVis);
  function onLost(e) { e.preventDefault(); fail(); }
  canvas.addEventListener('webglcontextlost', onLost);
  let failed = false;
  function fail() { if (failed) return; failed = true; destroy(); onState('poster'); }

  /* Montagem: carrega as telas antes do primeiro quadro, para a troca imagem → cena não mostrar telas vazias. */
  themeLook();
  await applyScreens(theme);
  container.appendChild(canvas);
  resize();
  renderOnce();
  requestAnimationFrame(() => {
    container.classList.add('is-live');
    if (!opts.capture) { entryStart = performance.now(); t0 = performance.now(); play(); }
  });

  function destroy() {
    pause(); io.disconnect(); ro.disconnect();
    document.removeEventListener('visibilitychange', onVis);
    window.removeEventListener('pointermove', onPointer);
    canvas.removeEventListener('webglcontextlost', onLost);
    disposables.forEach((d) => d.dispose?.());
    if (video) { video.pause(); video.removeAttribute('src'); video.load(); }
    keysMesh.dispose(); envTex.dispose(); pmrem.dispose(); renderer.dispose();
    container.classList.remove('is-live');
    canvas.remove();
  }
  return { setTheme, destroy, canvas };
}
