/* Cena 3D do Hero — variante "dispositivos": a mesma interface em notebook, tablet e celular (design responsivo).
   Mesma API de scene.js: createHeroScene(THREE, container, { theme, coarse, onState, capture }) -> { setTheme, destroy }.
   Cada aparelho é um grupo; as peças da interface ficam presas à tela e "saltam" ao longo da normal dela. */

export function createHeroScene(THREE, container, opts) {
  const coarse = !!opts.coarse;
  const Q = coarse ? { dpr: 1.3, shadow: 0 } : { dpr: 1.75, shadow: 1024 };
  const reduceQ = { dpr: 1, shadow: 0 };
  const onState = opts.onState || (() => {});

  const PALETTES = {
    dark: { body: '#3E3B36', deck: '#2A2824', screen: '#EDE8DD', ink: '#9C968A', bone: '#F7F3EA', slate: '#8399C4', sage: '#A2B99B', orange: '#FF7D40', shadow: 0.42, hemiSky: '#f6eee2', hemiGround: '#1b1915', hemi: 0.95 },
    light: { body: '#46423B', deck: '#34312C', screen: '#FBF8F1', ink: '#A39C8F', bone: '#FFFFFF', slate: '#7F95C2', sage: '#9EB896', orange: '#FF7433', shadow: 0.2, hemiSky: '#fffaf1', hemiGround: '#8c8577', hemi: 1.1 },
  };

  const CAM = { p: [15.5, 13.5, 19], t: [2.3, 1.6, 0.4], fov: 29 };
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
  const blobTex = (() => {
    const c = document.createElement('canvas'); c.width = c.height = 128;
    const g = c.getContext('2d'); const grd = g.createRadialGradient(64, 64, 8, 64, 64, 62);
    grd.addColorStop(0, 'rgba(0,0,0,0.55)'); grd.addColorStop(1, 'rgba(0,0,0,0)');
    g.fillStyle = grd; g.fillRect(0, 0, 128, 128);
    return new THREE.CanvasTexture(c);
  })();
  const blobGeo = new THREE.PlaneGeometry(18, 13); blobGeo.rotateX(-Math.PI / 2);
  const blob = new THREE.Mesh(blobGeo, new THREE.MeshBasicMaterial({ map: blobTex, transparent: true, depthWrite: false }));
  blob.position.set(1, 0.01, 0.5);
  scene.add(blob);

  const geos = [], geoCache = {}, mats = {};
  function roundedBlock(w, h, d) {
    const k = [w, h, d].join('x'); if (geoCache[k]) return geoCache[k];
    const bev = Math.min(0.09, h * 0.22), bs = bev * 0.85;
    let rad = Math.min(0.22, w / 2 - bs - 0.01, d / 2 - bs - 0.01);
    const W = w - 2 * bs, D = d - 2 * bs, x = -W / 2, y = -D / 2, s = new THREE.Shape();
    rad = Math.max(0.01, Math.min(rad, W / 2 - 0.001, D / 2 - 0.001));
    s.moveTo(x + rad, y); s.lineTo(x + W - rad, y); s.quadraticCurveTo(x + W, y, x + W, y + rad);
    s.lineTo(x + W, y + D - rad); s.quadraticCurveTo(x + W, y + D, x + W - rad, y + D);
    s.lineTo(x + rad, y + D); s.quadraticCurveTo(x, y + D, x, y + D - rad);
    s.lineTo(x, y + rad); s.quadraticCurveTo(x, y, x + rad, y);
    const g = new THREE.ExtrudeGeometry(s, { depth: Math.max(0.005, h - 2 * bev), bevelEnabled: true, bevelThickness: bev, bevelSize: bs, bevelSegments: 3, curveSegments: 5 });
    g.rotateX(-Math.PI / 2); g.center(); g.computeVertexNormals(); geos.push(g); return (geoCache[k] = g);
  }
  function material(name) {
    if (mats[name]) return mats[name];
    const m = new THREE.MeshStandardMaterial({ roughness: name === 'screen' ? 0.6 : 0.8, metalness: 0 });
    if (name === 'orange') { m.emissive = new THREE.Color('#ff5a1a'); m.emissiveIntensity = 0.12; }
    if (name === 'screen') { m.emissive = new THREE.Color('#ffffff'); m.emissiveIntensity = 0.06; }
    return (mats[name] = m);
  }

  const meshes = [];
  const uiPieces = []; // { mesh, base: Vector3, normal: Vector3, unit, order }
  function block(parent, size, color, pos) {
    const m = new THREE.Mesh(roundedBlock(...size), material(color));
    m.position.set(...pos); parent.add(m); meshes.push(m); return m;
  }
  /* Peça de interface sobre uma tela: (u, v) no plano da tela, apoiada na face da tela; normal = direção do "salto". */
  function ui(unit, screenGroup, normal, size, color, u, v, faceY) {
    const pos = new THREE.Vector3(u, faceY + normal.y * (size[1] / 2), v);
    const m = block(screenGroup, size, color, pos.toArray());
    uiPieces.push({ mesh: m, base: pos.clone(), normal, unit, order: uiPieces.filter((p) => p.unit === unit).length });
  }

  const units = []; // { group, base: Vector3, rotY, spread: Vector3 }
  function unit(pos, rotY, spread) {
    const g = new THREE.Group(); g.position.set(...pos); g.rotation.y = rotY; scene.add(g);
    units.push({ group: g, base: new THREE.Vector3(...pos), rotY, spread: new THREE.Vector3(...spread) });
    return units.length - 1;
  }
  const DOWN = new THREE.Vector3(0, -1, 0), UP = new THREE.Vector3(0, 1, 0);

  /* ── Notebook (esquerda): interface completa, com menu lateral e gráfico. ── */
  const nb = unit([-1.6, 0, 0.6], 0.18, [-2.2, 0, 0.4]);
  const nbG = units[nb].group;
  block(nbG, [7, 0.28, 4.6], 'body', [0, 0.14, 0]);
  block(nbG, [5.9, 0.06, 2.3], 'deck', [0, 0.3, -0.6]);
  [-1.5, -1.0, -0.5, 0].forEach((z) => block(nbG, [5.5, 0.06, 0.32], 'ink', [0, 0.36, z - 0.15]));
  block(nbG, [2.2, 0.05, 1.3], 'deck', [0, 0.3, 1.35]);
  const lid = new THREE.Group(); lid.position.set(0, 0.28, -2.3); lid.rotation.x = -1.83; nbG.add(lid);
  block(lid, [7, 0.18, 4.6], 'body', [0, 0.09, 2.3]);
  block(lid, [6.5, 0.04, 4.1], 'screen', [0, -0.02, 2.3]);
  const F = -0.04; // face da tela no grupo da tampa (a tela olha para -y)
  ui(nb, lid, DOWN, [6.5, 0.06, 0.45], 'ink', 0, 4.05, F);
  [-2.9, -2.6, -2.3].forEach((x, i) => ui(nb, lid, DOWN, [0.18, 0.08, 0.18], ['orange', 'sage', 'slate'][i], x, 4.05, F - 0.06));
  ui(nb, lid, DOWN, [1.3, 0.06, 3.1], 'slate', -2.45, 2.15, F);
  [1.2, 1.8, 1.5, 2.4].forEach((len, i) => ui(nb, lid, DOWN, [0.42, 0.08, len], 'sage', -0.85 + i * 0.62, 0.75 + len / 2, F));
  ui(nb, lid, DOWN, [1.6, 0.05, 0.18], 'ink', 2.2, 3.2, F);
  ui(nb, lid, DOWN, [1.2, 0.05, 0.18], 'ink', 2.0, 2.85, F);
  ui(nb, lid, DOWN, [1.9, 0.06, 0.9], 'slate', 2.2, 2.0, F);
  ui(nb, lid, DOWN, [1.5, 0.1, 0.45], 'orange', 2.2, 0.85, F);

  /* ── Tablet (direita, em pé): a mesma interface em duas colunas. ── */
  const tb = unit([5.4, 0, -0.9], -0.45, [2.2, 0, -0.6]);
  const tbG = units[tb].group;
  const tbody = new THREE.Group(); tbody.rotation.x = -1.75; tbG.add(tbody);
  block(tbody, [3.4, 0.22, 4.7], 'body', [0, 0.11, 2.35]);
  block(tbody, [3.0, 0.04, 4.3], 'screen', [0, -0.02, 2.35]);
  ui(tb, tbody, DOWN, [3.0, 0.06, 0.4], 'ink', 0, 4.25, F);
  ui(tb, tbody, DOWN, [2.6, 0.06, 1.2], 'slate', 0, 3.25, F);
  ui(tb, tbody, DOWN, [1.2, 0.08, 1.0], 'sage', -0.7, 1.95, F);
  ui(tb, tbody, DOWN, [1.2, 0.08, 1.0], 'sage', 0.7, 1.95, F);
  ui(tb, tbody, DOWN, [2.0, 0.05, 0.16], 'ink', -0.3, 1.1, F);
  ui(tb, tbody, DOWN, [1.6, 0.1, 0.42], 'orange', 0, 0.55, F);

  /* ── Celular (frente, deitado): tudo em uma coluna. ── */
  const ph = unit([3.1, 0, 3.6], 0.42, [0.8, 0, 2.2]);
  const phG = units[ph].group;
  block(phG, [1.8, 0.2, 3.5], 'body', [0, 0.1, 0]);
  block(phG, [1.6, 0.03, 3.2], 'screen', [0, 0.215, 0]);
  const PF = 0.23; // face da tela do celular (olha para +y)
  ui(ph, phG, UP, [1.6, 0.05, 0.32], 'ink', 0, -1.42, PF);
  ui(ph, phG, UP, [1.4, 0.06, 0.95], 'slate', 0, -0.68, PF);
  ui(ph, phG, UP, [1.2, 0.04, 0.14], 'ink', -0.1, 0.05, PF);
  ui(ph, phG, UP, [0.9, 0.04, 0.14], 'ink', -0.25, 0.32, PF);
  ui(ph, phG, UP, [1.4, 0.06, 0.5], 'sage', 0, 0.85, PF);
  ui(ph, phG, UP, [1.3, 0.09, 0.36], 'orange', 0, 1.38, PF);

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
    ground.visible = !!q.shadow; blob.visible = !q.shadow;
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

  const ptr = { x: 0, y: 0, tx: 0, ty: 0 };
  const camP = new THREE.Vector3(), camT = new THREE.Vector3(...CAM.t);
  const easeOut = (t) => 1 - Math.pow(1 - t, 3);
  const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
  let settleStart = -1;
  const SETTLE = 1100;

  function update(now) {
    const heroH = container.closest('[data-hero]')?.offsetHeight || window.innerHeight;
    const p = clamp(window.scrollY / (heroH * 0.55), 0, 1);
    const pe = p * p * (3 - 2 * p);
    // Aparelhos: assentam em sequência (notebook, tablet, celular) e se afastam com a rolagem.
    units.forEach((u, i) => {
      let lift = 0;
      if (settleStart >= 0) lift = (1 - easeOut(clamp((now - settleStart - i * 180) / SETTLE, 0, 1))) * 1.4;
      u.group.position.set(u.base.x + u.spread.x * pe, u.base.y + lift + pe * 0.6, u.base.z + u.spread.z * pe);
      u.group.rotation.y = u.rotY + pe * 0.12 * (i - 1);
    });
    // Interface: as peças se montam na tela depois do aparelho e saltam dela na vista explodida.
    for (const pc of uiPieces) {
      let pop = 0;
      if (settleStart >= 0) {
        const t = clamp((now - settleStart - 450 - pc.unit * 180 - pc.order * 45) / 700, 0, 1);
        pop = (1 - easeOut(t)) * 0.9;
      }
      const out = pop + pe * (0.5 + pc.order * 0.12);
      pc.mesh.position.set(pc.base.x + pc.normal.x * out, pc.base.y + pc.normal.y * out, pc.base.z + pc.normal.z * out);
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

  let raf = 0, inView = true, frames = 0, slowSum = 0, last = 0, downgraded = false;
  function renderOnce() { update(performance.now()); renderer.render(scene, camera); }
  function frame(now) {
    raf = requestAnimationFrame(frame);
    if (last && frames < 60 && !opts.noDowngrade) { slowSum += now - last; frames++; if (frames === 60) checkSpeed(); }
    last = now; update(now); renderer.render(scene, camera);
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

  applyQuality(Q);
  setTheme(theme);
  resize();
  renderOnce();
  requestAnimationFrame(() => {
    container.classList.add('is-live');
    if (!opts.capture) { setTimeout(() => { settleStart = performance.now(); }, 420); play(); }
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
