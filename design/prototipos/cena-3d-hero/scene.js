/* Cena 3D do Hero — protótipo da change cena-3d-e-transicao-de-tema.
   Formato igual ao que vai para components/scene/hero-scene.ts:
   createHeroScene(THREE, container, { theme, coarse, onState }) -> { setTheme, destroy }.
   Composição: camadas da interface (tokens → componentes → tela), com fundo transparente. */

export function createHeroScene(THREE, container, opts) {
  const coarse = !!opts.coarse;
  const Q = coarse ? { dpr: 1.3, shadow: 0 } : { dpr: 1.75, shadow: 1024 };
  const reduceQ = { dpr: 1, shadow: 0 };
  const onState = opts.onState || (() => {});

  /* Paletas por tema. As placas são sempre escuras: no claro, elas seguram a composição sobre o creme. */
  const PALETTES = {
    dark: { bone: '#EDE8DD', graphite: '#3E3B36', slate: '#8399C4', sage: '#A2B99B', orange: '#FF7D40', stone: '#9C968A', slot: '#1A1917', shadow: 0.42, hemiSky: '#f6eee2', hemiGround: '#1b1915', hemi: 0.95 },
    light: { bone: '#FBF8F1', graphite: '#46423B', slate: '#7F95C2', sage: '#9EB896', orange: '#FF7433', stone: '#A39C8F', slot: '#211F1B', shadow: 0.2, hemiSky: '#fffaf1', hemiGround: '#8c8577', hemi: 1.1 },
  };

  /* Composição "Camadas da interface": tokens → componentes → tela, em escada (cada camada mais alta
     e mais ao fundo), para as três ficarem visíveis. Posições locais à camada: [x, y, z] do centro da peça. */
  const LAYERS = [
    { id: 'tokens', origin: [0.6, 0, 3.4] },
    { id: 'componentes', origin: [0, 2.0, 0] },
    { id: 'tela', origin: [-0.6, 4.0, -3.4] },
  ];
  const PLATE = [9, 0.3, 5.4];
  const T = PLATE[1]; // topo da placa
  const on = (h, extra = 0) => T + extra + h / 2; // y do centro de uma peça de altura h apoiada na placa
  const P = (layer, id, size, color, x, z, extra = 0) => ({ layer, id, size, color, local: [x, on(size[1], extra), z] });
  const PIECES = [];
  LAYERS.forEach((L, i) => PIECES.push({ layer: i, id: 'placa-' + L.id, size: PLATE, color: 'graphite', local: [0, T / 2, 0], plate: true }));
  /* Tokens: amostras de cor, escala de tipo e escala de espaçamento. */
  ['bone', 'slate', 'sage', 'orange', 'stone'].forEach((c, i) => PIECES.push(P(0, 'cor' + i, [0.95, 0.95, 0.95], c, -3.4 + i * 1.25, -1.2)));
  [1.1, 0.8, 0.55].forEach((h, i) => PIECES.push(P(0, 'tipo' + i, [0.45, h, 0.45], 'bone', 2.85 + i * 0.6, -1.2)));
  [0.4, 0.6, 0.85, 1.1].forEach((w, i) => PIECES.push(P(0, 'espaco' + i, [w, 0.15, w], 'slate', [-3.5, -2.7, -1.65, -0.35][i], 1.2)));
  /* Componentes: botão, campo com cursor, cartão, interruptor e caixa de seleção. */
  PIECES.push(P(1, 'botao', [2.2, 0.45, 0.85], 'orange', -2.6, -1.4));
  PIECES.push(P(1, 'campo', [3.4, 0.3, 0.85], 'bone', 1.6, -1.4));
  PIECES.push(P(1, 'cursor', [0.12, 0.3, 0.55], 'slot', 0.35, -1.4, 0.3));
  PIECES.push(P(1, 'cartao', [3, 0.3, 2.2], 'bone', -2.4, 1));
  PIECES.push(P(1, 'cartao-linha', [2.2, 0.12, 0.35], 'slate', -2.4, 0.45, 0.3));
  PIECES.push(P(1, 'cartao-icone', [0.7, 0.12, 0.7], 'sage', -3.15, 1.4, 0.3));
  PIECES.push(P(1, 'interruptor', [1.4, 0.35, 0.7], 'sage', 1.2, 1));
  PIECES.push(P(1, 'interruptor-pino', [0.55, 0.45, 0.55], 'bone', 1.55, 1));
  PIECES.push(P(1, 'selecao', [0.6, 0.3, 0.6], 'slate', 3.2, 1));
  /* Tela: janela com barra de título, menu lateral, gráfico, cartões, linhas de texto e botão. */
  PIECES.push(P(2, 'barra', [9, 0.18, 0.7], 'bone', 0, -2.35));
  ['orange', 'sage', 'slate'].forEach((c, i) => PIECES.push(P(2, 'ponto' + i, [0.28, 0.2, 0.28], c, -4.0 + i * 0.4, -2.35, 0.18)));
  PIECES.push(P(2, 'menu', [1.9, 0.22, 4.2], 'slate', -3.35, 0.4));
  PIECES.push(P(2, 'grafico', [3.4, 0.18, 2.4], 'bone', -0.1, -0.6));
  [0.5, 0.9, 0.7, 1.2].forEach((h, i) => PIECES.push(P(2, 'coluna' + i, [0.45, h, 0.45], 'sage', -1.2 + i * 0.7, -0.6, 0.18)));
  PIECES.push(P(2, 'painel1', [2.6, 0.18, 1.15], 'bone', 2.9, -1.1));
  PIECES.push(P(2, 'painel2', [2.6, 0.18, 1.15], 'bone', 2.9, 0.2));
  PIECES.push(P(2, 'texto1', [3, 0.1, 0.25], 'bone', -0.4, 1.4));
  PIECES.push(P(2, 'texto2', [2.2, 0.1, 0.25], 'bone', -0.8, 1.9));
  PIECES.push(P(2, 'acao', [1.8, 0.35, 0.7], 'orange', 2.9, 1.75));

  /* Enquadramento (ajustado no protótipo; vai para o código como constante). */
  const CAM = { p: [16, 15.5, 20], t: [0, 2.2, 0], fov: 29 };

  /* O canvas é maior que o contêiner (margem em volta), para as peças se afastarem sem serem cortadas
     na borda. A câmera compensa o campo de visão, então a composição parada fica idêntica à imagem. */
  const OVER = opts.capture ? 1 : 1.5;
  const canvas = document.createElement('canvas');
  canvas.setAttribute('aria-hidden', 'true');
  canvas.className = 'scene-canvas';
  const off = ((OVER - 1) / 2) * 100;
  Object.assign(canvas.style, { left: -off + '%', top: -off + '%', width: OVER * 100 + '%', height: OVER * 100 + '%', pointerEvents: 'none' });
  container.appendChild(canvas);

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance', preserveDrawingBuffer: !!opts.capture });
  renderer.setClearColor(0x000000, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(CAM.fov, 1, 0.1, 200);
  const hemi = new THREE.HemisphereLight('#f6eee2', '#1b1915', 0.95);
  scene.add(hemi);
  const key = new THREE.DirectionalLight('#fff1e2', 2.3);
  key.position.set(-9, 17, 11);
  scene.add(key);
  const rim = new THREE.DirectionalLight('#9fb3dc', 0.55);
  rim.position.set(12, 6, -14);
  scene.add(rim);

  const groundGeo = new THREE.PlaneGeometry(80, 80);
  groundGeo.rotateX(-Math.PI / 2);
  const ground = new THREE.Mesh(groundGeo, new THREE.ShadowMaterial({ opacity: 0.4 }));
  ground.receiveShadow = true;
  scene.add(ground);

  /* Sombra difusa pré-desenhada (usada quando não há mapa de sombras: toque e nível baixo). */
  const blobTex = (() => {
    const c = document.createElement('canvas'); c.width = c.height = 128;
    const g = c.getContext('2d'); const grd = g.createRadialGradient(64, 64, 8, 64, 64, 62);
    grd.addColorStop(0, 'rgba(0,0,0,0.55)'); grd.addColorStop(1, 'rgba(0,0,0,0)');
    g.fillStyle = grd; g.fillRect(0, 0, 128, 128);
    const t = new THREE.CanvasTexture(c); return t;
  })();
  const blobGeo = new THREE.PlaneGeometry(17, 13); blobGeo.rotateX(-Math.PI / 2);
  const blob = new THREE.Mesh(blobGeo, new THREE.MeshBasicMaterial({ map: blobTex, transparent: true, depthWrite: false }));
  blob.position.y = 0.01;
  scene.add(blob);

  const geos = [];
  const mats = {};
  function roundedBlock(w, h, d) {
    const bev = Math.min(0.09, h * 0.22), bs = bev * 0.85;
    let rad = Math.min(0.22, w / 2 - bs - 0.01, d / 2 - bs - 0.01);
    const W = w - 2 * bs, D = d - 2 * bs, x = -W / 2, y = -D / 2, s = new THREE.Shape();
    rad = Math.max(0.01, Math.min(rad, W / 2 - 0.001, D / 2 - 0.001));
    s.moveTo(x + rad, y); s.lineTo(x + W - rad, y); s.quadraticCurveTo(x + W, y, x + W, y + rad);
    s.lineTo(x + W, y + D - rad); s.quadraticCurveTo(x + W, y + D, x + W - rad, y + D);
    s.lineTo(x + rad, y + D); s.quadraticCurveTo(x, y + D, x, y + D - rad);
    s.lineTo(x, y + rad); s.quadraticCurveTo(x, y, x + rad, y);
    const g = new THREE.ExtrudeGeometry(s, { depth: Math.max(0.005, h - 2 * bev), bevelEnabled: true, bevelThickness: bev, bevelSize: bs, bevelSegments: 3, curveSegments: 5 });
    g.rotateX(-Math.PI / 2); g.center(); g.computeVertexNormals(); geos.push(g); return g;
  }
  function material(name) {
    if (mats[name]) return mats[name];
    const m = new THREE.MeshStandardMaterial({ roughness: name === 'slot' ? 1 : 0.8, metalness: 0 });
    if (name === 'orange') { m.emissive = new THREE.Color('#ff5a1a'); m.emissiveIntensity = 0.12; }
    return (mats[name] = m);
  }
  const geoCache = {};
  const meshes = PIECES.map((pc) => {
    const k = pc.size.join('x');
    const g = (geoCache[k] ||= roundedBlock(...pc.size));
    const mesh = new THREE.Mesh(g, material(pc.color));
    scene.add(mesh);
    return mesh;
  });

  function applyQuality(q) {
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, q.dpr));
    renderer.shadowMap.enabled = !!q.shadow;
    renderer.shadowMap.type = THREE.PCFShadowMap;
    key.castShadow = !!q.shadow;
    if (q.shadow) {
      key.shadow.mapSize.set(q.shadow, q.shadow);
      const sc = key.shadow.camera; sc.left = -12; sc.right = 12; sc.top = 12; sc.bottom = -12; sc.near = 1; sc.far = 60;
      key.shadow.bias = -0.0006; key.shadow.normalBias = 0.02;
    }
    meshes.forEach((m) => { m.castShadow = !!q.shadow; m.receiveShadow = !!q.shadow; });
    ground.visible = !!q.shadow;
    blob.visible = !q.shadow;
    Object.values(mats).forEach((m) => { m.needsUpdate = true; });
  }

  let theme = opts.theme === 'light' ? 'light' : 'dark';
  function setTheme(next) {
    theme = next === 'light' ? 'light' : 'dark';
    const P = PALETTES[theme];
    Object.keys(mats).forEach((name) => mats[name].color.set(P[name]));
    ground.material.opacity = P.shadow;
    blob.material.opacity = theme === 'light' ? 0.6 : 1;
    hemi.color.set(P.hemiSky); hemi.groundColor.set(P.hemiGround); hemi.intensity = P.hemi;
    if (!raf) renderOnce();
  }

  /* Estado do quadro (pré-alocado). */
  const ptr = { x: 0, y: 0, tx: 0, ty: 0 };
  const camP = new THREE.Vector3(), camT = new THREE.Vector3(...CAM.t);
  const easeOut = (t) => 1 - Math.pow(1 - t, 3);
  const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
  let settleStart = -1; // ms; -1 = sem assentamento (estado montado)
  const SETTLE = 1200, STAGGER = 40;

  function update(now) {
    const heroH = container.closest('[data-hero]')?.offsetHeight || window.innerHeight;
    // O afastamento se completa na primeira metade da rolagem do Hero, enquanto a cena ainda está à vista.
    const p = clamp(window.scrollY / (heroH * 0.55), 0, 1);
    const pe = p * p * (3 - 2 * p);
    for (let n = 0; n < PIECES.length; n++) {
      const pc = PIECES[n], m = meshes[n], o = LAYERS[pc.layer].origin, L = pc.layer;
      let lift = 0, rot = 0;
      if (settleStart >= 0) {
        // As camadas descem e se encaixam de baixo para cima; as peças, logo depois da placa.
        const t = clamp((now - settleStart - L * 160 - (pc.plate ? 0 : 120 + (n % 7) * 25)) / SETTLE, 0, 1);
        const k = 1 - easeOut(t);
        lift = k * (pc.plate ? 1.2 + L * 0.4 : 0.9);
        rot = k * 0.12 * (n % 2 ? 1 : -1);
      }
      // Vista explodida: as camadas se afastam na vertical e em profundidade; as peças sobem da placa.
      const gap = pe * L * 2.4, back = -pe * (L - 1) * 1.1, pieceLift = pc.plate ? 0 : pe * (0.35 + (n % 3) * 0.15);
      m.position.set(o[0] + pc.local[0], o[1] + pc.local[1] + lift + gap + pieceLift, o[2] + pc.local[2] + back);
      m.rotation.set(rot + pe * 0.06 * (L - 1), pe * 0.08 * (L - 1), rot * 0.6);
    }
    ptr.x += (ptr.tx - ptr.x) * 0.06; ptr.y += (ptr.ty - ptr.y) * 0.06;
    camP.set(CAM.p[0] + ptr.x * 0.8, CAM.p[1] + ptr.y * 0.5, CAM.p[2]);
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

  /* Laço de quadros, pausa e rebaixamento de qualidade. */
  let raf = 0, inView = true, frames = 0, slowSum = 0, last = 0, downgraded = false;
  function renderOnce() { update(performance.now()); renderer.render(scene, camera); }
  function frame(now) {
    raf = requestAnimationFrame(frame);
    if (last && frames < 60 && !opts.noDowngrade) { slowSum += now - last; frames++; if (frames === 60) checkSpeed(); }
    last = now;
    update(now);
    renderer.render(scene, camera);
  }
  function checkSpeed() {
    if (slowSum / 60 <= 33) return;
    if (!downgraded) { downgraded = true; applyQuality(reduceQ); frames = 0; slowSum = 0; return; }
    fail();
  }
  function play() { if (!raf && inView && !document.hidden) { last = 0; raf = requestAnimationFrame(frame); onState('running'); } }
  function pause() { if (raf) { cancelAnimationFrame(raf); raf = 0; onState('paused'); } }
  const io = new IntersectionObserver((es) => { inView = es[0].isIntersecting; inView ? play() : pause(); });
  io.observe(container);
  function onVis() { document.hidden ? pause() : play(); }
  document.addEventListener('visibilitychange', onVis);
  function onLost(e) { e.preventDefault(); fail(); }
  canvas.addEventListener('webglcontextlost', onLost);

  let failed = false;
  function fail() { if (failed) return; failed = true; destroy(); onState('poster'); }

  /* Montagem: primeiro quadro no estado montado (igual à imagem), depois troca e assentamento. */
  applyQuality(Q);
  setTheme(theme);
  resize();
  renderOnce();
  requestAnimationFrame(() => {
    container.classList.add('is-live');
    if (!opts.capture) {
      setTimeout(() => { settleStart = performance.now(); }, 420);
      play();
    }
  });

  function destroy() {
    pause(); io.disconnect(); ro.disconnect();
    document.removeEventListener('visibilitychange', onVis);
    window.removeEventListener('pointermove', onPointer);
    canvas.removeEventListener('webglcontextlost', onLost);
    geos.forEach((g) => g.dispose()); groundGeo.dispose(); blobGeo.dispose(); blobTex.dispose();
    ground.material.dispose(); blob.material.dispose();
    Object.values(mats).forEach((m) => m.dispose());
    renderer.dispose();
    container.classList.remove('is-live');
    canvas.remove();
  }

  return { setTheme, destroy, canvas };
}
