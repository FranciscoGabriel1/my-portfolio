/* ==========================================================================
   Mundo 3D · "A montagem"
   Um mundo persistente em Three.js conduzido pela rolagem NATIVA (build-threejs-scroll-worlds).
   - Fonte da verdade: window.scrollY. Com o Lenis ligado, ele só suaviza a rolagem nativa.
   - Topologia: revelação em camadas. O mesmo lugar e as mesmas peças mudam de formação a cada ato.
   - Pôster estático com movimento reduzido, ?poster, economia de dados, sem WebGL ou perda de contexto.
   - Render pausado fora da tela e com a aba oculta. DPR limitado. Sem alocação por quadro.
   ========================================================================== */
(function () {
  'use strict';
  var world = document.getElementById('mundo'); if (!world) return;
  var canvas = world.querySelector('.world-canvas');
  var stage = world.querySelector('.world-stage');
  var sections = Array.prototype.slice.call(world.querySelectorAll('[data-cam]'));
  var railLinks = Array.prototype.slice.call(world.querySelectorAll('.world-rail a'));
  var params = new URLSearchParams(location.search);
  var mqReduce = matchMedia('(prefers-reduced-motion: reduce)');
  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }

  /* Condutor de rolagem (adaptado de build-threejs-scroll-worlds/scroll-conductor.js) */
  var conductor = (function () {
    var anchors = [], widthAt = 0, active = -1, st = { exact: 0, smooth: 0 };
    function measure() {
      var max = Math.max(1, document.documentElement.scrollHeight - innerHeight), y = scrollY || 0;
      widthAt = innerWidth;
      var ratio = innerWidth <= 900 ? 0.72 : 0.5;
      anchors = sections.map(function (el, i) {
        if (i === 0) return 0;
        var r = (el.querySelector('[data-anchor]') || el).getBoundingClientRect();
        return clamp(r.top + y + r.height * 0.5 - innerHeight * ratio, 0, max);
      });
      for (var i = 1; i < anchors.length; i++) anchors[i] = Math.max(anchors[i], anchors[i - 1] + 1);
    }
    function progressAt(y) {
      if (!anchors.length) measure();
      if (y <= anchors[0]) return 0;
      for (var i = 0; i < anchors.length - 1; i++) if (y <= anchors[i + 1]) return i + clamp((y - anchors[i]) / Math.max(1, anchors[i + 1] - anchors[i]), 0, 1);
      return anchors.length - 1;
    }
    function read() { st.exact = progressAt(scrollY || 0); var idx = Math.round(st.exact); if (idx !== active) { active = idx; setChapter(idx); } }
    function onResize() { if (matchMedia('(pointer: coarse)').matches && innerWidth === widthAt) return; measure(); read(); }
    return {
      st: st,
      start: function () {
        measure(); read(); st.smooth = st.exact;
        addEventListener('scroll', read, { passive: true });
        addEventListener('resize', onResize, { passive: true });
        addEventListener('load', function () { measure(); read(); });
        if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { measure(); read(); });
      },
      tick: function (dt, lambda) { st.smooth += (st.exact - st.smooth) * (1 - Math.exp(-lambda * dt)); if (Math.abs(st.smooth - st.exact) < 1e-4) st.smooth = st.exact; },
      anchor: function (i) { return anchors[i]; },
      jump: function (i) { measure(); var y = anchors[i] || 0; var l = window.MT && window.MT.lenis; if (l) l.scrollTo(y, { immediate: true, force: true }); else scrollTo(0, y); read(); st.smooth = st.exact; }
    };
  })();
  /* QA: ?ato=N abre direto no ato N (0 a 4), com a câmera já no enquadramento composto. */
  if (params.has('ato')) addEventListener('load', function () { setTimeout(function () { conductor.jump(Number(params.get('ato')) || 0); }, 400); });

  function setChapter(i) {
    world.setAttribute('data-chapter', String(i));
    railLinks.forEach(function (a, k) { if (k === i - 1) a.setAttribute('aria-current', 'step'); else a.removeAttribute('aria-current'); });
  }
  Array.prototype.slice.call(document.querySelectorAll('[data-goto]')).forEach(function (a) {
    a.addEventListener('click', function (e) {
      var y = conductor.anchor(Number(a.getAttribute('data-goto'))); if (typeof y !== 'number') return;
      e.preventDefault();
      var lenis = window.MT && window.MT.lenis;
      if (lenis && !mqReduce.matches) lenis.scrollTo(y, { duration: 1.6 }); else scrollTo(0, y);
    });
  });
  conductor.start();

  /* Pôster ou mundo? */
  var saveData = navigator.connection && navigator.connection.saveData;
  if (mqReduce.matches || params.has('poster') || saveData || !hasWebGL()) { world.classList.add('is-poster'); return; }
  function hasWebGL() {
    try { var c = document.createElement('canvas'), gl = c.getContext('webgl2') || c.getContext('webgl'); if (!gl) return false; var x = gl.getExtension('WEBGL_lose_context'); if (x) x.loseContext(); return true; } catch (e) { return false; }
  }
  function loadThree(done, fail) {
    if (window.THREE) { done(window.THREE); return; }
    var warn = console.warn;
    console.warn = function (m) { if (typeof m === 'string' && m.indexOf('build/three') !== -1) return; return warn.apply(console, arguments); };
    var s = document.createElement('script');
    s.src = 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.min.js';
    s.integrity = 'sha384-qOkzR5Ke/XkQxuGVJ9hpFEpDlcoLtWwVYhnJf06cLIZa2vaIptSqaubivErzmD5O';
    s.crossOrigin = 'anonymous'; s.async = true;
    s.onload = function () { console.warn = warn; window.THREE ? done(window.THREE) : fail(new Error('THREE ausente')); };
    s.onerror = function () { console.warn = warn; fail(new Error('Three.js não carregou')); };
    document.head.appendChild(s);
  }
  var api = null;
  function toPoster() { world.classList.remove('is-live'); world.classList.add('is-poster'); if (api) { api.destroy(); api = null; } }
  if (mqReduce.addEventListener) mqReduce.addEventListener('change', function () { if (mqReduce.matches) toPoster(); });
  function boot() { loadThree(function (THREE) { try { api = createWorld(THREE); window.__mundo = api; } catch (err) { console.error(err); toPoster(); } }, toPoster); }
  if ('requestIdleCallback' in window) requestIdleCallback(boot, { timeout: 600 }); else setTimeout(boot, 60);

  function createWorld(THREE) {
    var mobile = matchMedia('(max-width: 900px)').matches;
    var Q = mobile ? { dpr: 1.3, shadow: 0 } : { dpr: 1.75, shadow: 1024 };

    /* Bíblia do mundo: 1 unidade = 1 bloco. Argila fosca, luz quente de cima à esquerda, contra-luz fria.
       Paleta: osso, grafite, ardósia, sálvia e um único laranja (a peça que fecha cada ato). */
    var COLORS = { bone: '#EDE8DD', graphite: '#3E3B36', slate: '#8399C4', sage: '#A2B99B', orange: '#FF7D40', slot: '#1A1917' };

    /* Peças. Estados por ato: [x, y, z, rotX, rotY, rotZ, escala]. Ato 0 = hero (nuvem de peças soltas). */
    var H = 0.6; /* altura da placa */
    var BIG = [
      { id: 'placa', size: [12, H, 9], color: 'graphite', st: [[0, 0.3, 0, 0, 0, 0, 0], [0, 0.3, 0, 0, 0, 0, 0], [0, 0.3, 0, 0, 0, 0, 0], [0, 0.3, 0, 0, 0, 0, 1], [0, 0.3, 0, 0, 0, 0, 1]] },
      { id: 'vao', size: [3.1, 0.04, 1.1], color: 'slot', st: [[3.95, 0.62, 3.55, 0, 0, 0, 0], [3.95, 0.62, 3.55, 0, 0, 0, 0], [3.95, 0.62, 3.55, 0, 0, 0, 0], [3.95, 0.62, 3.55, 0, 0, 0, 1], [3.95, 0.62, 3.55, 0, 0, 0, 1]] },
      { id: 'topo', size: [12, 0.45, 1.3], color: 'bone', st: [[-2.5, 7.2, -3, 0.3, 0.5, -0.2, 1], [-6, 0.6, -64, 0.2, 0.4, 0, 1], [-1, 0.225, -6.5, 0, 0, 0, 1], [0, 0.825, -3.85, 0, 0, 0, 1], [0, 0.825, -3.85, 0, 0, 0, 1]] },
      { id: 'lateral', size: [2.8, 0.75, 6.7], color: 'slate', st: [[-4.5, 3.4, 1.5, -0.5, 0.3, 0.5, 1], [-16, 1, -62, 0.3, -0.4, 0.2, 1], [-8.5, 0.375, 0, 0, 0, 0, 1], [-4.1, 0.975, 0.65, 0, 0, 0, 1], [-4.1, 0.975, 0.65, 0, 0, 0, 1]] },
      { id: 'card1', size: [3.9, 0.5, 3], color: 'bone', st: [[1.2, 8.2, -0.5, 0.6, -0.3, 0.25, 1], [10, 1.5, -66, -0.3, 0.6, 0.2, 1], [4.5, 0.25, -2.2, 0, 0, 0, 1], [-0.25, 0.85, -1.2, 0, 0, 0, 1], [-0.25, 0.85, -1.2, 0, 0, 0, 1]] },
      { id: 'card2', size: [3.3, 0.9, 3], color: 'sage', st: [[5.2, 4.4, -1.5, -0.25, 0.8, -0.3, 1], [18, 2, -60, 0.4, 0.2, -0.3, 1], [4.5, 0.45, 1.6, 0, 0, 0, 1], [3.85, 1.05, -1.2, 0, 0, 0, 1], [3.85, 1.05, -1.2, 0, 0, 0, 1]] },
      { id: 'conteudo', size: [7.7, 0.35, 1.7], color: 'bone', st: [[0.2, 2.2, 3.4, 0.25, -0.5, 0.4, 1], [-4, 0.4, -70, 0, 0.3, 0, 1], [-1, 0.175, 3.6, 0, 0, 0, 1], [1.65, 0.775, 1.65, 0, 0, 0, 1], [1.65, 0.775, 1.65, 0, 0, 0, 1]] },
      { id: 'botao', size: [3.1, 0.6, 1.1], color: 'orange', st: [[2.8, 5.6, 2.6, 0.5, 0.4, -0.6, 1], [0.6, 1.5, 0, 0.12, 0.35, 0.05, 1], [4.5, 0.3, 4.6, 0, 0, 0, 1], [3.95, 3.3, 3.55, 0, 0, 0, 1], [3.95, 0.9, 3.55, 0, 0, 0, 1]] }
    ];
    /* 12 cubos (os "tokens"): nuvem, corrente de blocos (Blockly), biblioteca em grade, estoque ao lado da placa, colunas da API atrás. */
    var cubeColors = ['bone', 'slate', 'sage', 'graphite'];
    var CUBES = [];
    for (var i = 0; i < 12; i++) {
      var a = i * 2.399, r = 3 + (i % 4) * 1.4;
      var s0 = [Math.cos(a) * r + 1, 2.6 + (i % 5) * 1.25, Math.sin(a) * r * 0.6, i * 0.7, i * 0.4, i * 0.3, 1];
      var s1 = i < 5 ? [-2.4 + (i % 2) * 0.25, 0.45 + i * 0.92, 0.2, 0, 0.1 * (i % 2), 0, 1] : [-12 + i * 2.6, 0.45, -60 - (i % 3) * 4, 0, i, 0, 1];
      var c = i % 4, rr = Math.floor(i / 4);
      var s2 = [-1 + (c - 1.5) * 1.4, 0.45, (rr - 1) * 1.4, 0, 0, 0, 1];
      var k = Math.floor(i / 4), h = i % 4;
      var s3 = [-8.2, 0.45 + h * 0.92, -2.2 + k * 2.2, 0, 0, 0, 1];
      var col = i < 5 ? 0 : i < 9 ? 1 : 2, lev = i < 5 ? i : i < 9 ? i - 5 : i - 9;
      var s4 = [-3.6 + col * 3.6, 0.45 + lev * 0.92, -7.6, 0, 0, 0, 1];
      CUBES.push({ id: 'cubo' + i, size: [0.9, 0.9, 0.9], color: cubeColors[i % 4], st: [s0, s1, s2, s3, s4] });
    }
    var PIECES = BIG.concat(CUBES);

    /* Câmeras por ato: p = posição, t = alvo. Desktop deixa o foco à direita do texto; celular, acima do card. */
    var CAM = [
      { p: [7, 9, 30], t: [-8.5, 3.4, 0], fov: 38, m: { p: [1, 9, 32], t: [1, 11, 0], fov: 52 } },
      { p: [4.6, 5.6, 13.5], t: [-3.6, 2.4, 0], fov: 36, m: { p: [-0.6, 7, 18], t: [-0.8, -2.6, 0], fov: 56 } },
      { p: [3, 20, 17], t: [-5, 0, 0], fov: 40, m: { p: [-1, 30, 20], t: [-2, -8, -0.5], fov: 56 } },
      { p: [9.5, 12.5, 17.5], t: [-5.8, 0.8, 0.5], fov: 38, m: { p: [0, 18, 24], t: [0, -7, 0], fov: 54 } },
      { p: [11, 13, 21], t: [-5.2, 1.6, -2.2], fov: 40, m: { p: [0, 20, 30], t: [0, -7, -2.5], fov: 56 } }
    ];

    var renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: false, powerPreference: 'high-performance' });
    renderer.setPixelRatio(Math.min(devicePixelRatio || 1, Q.dpr));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    if (Q.shadow) { renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap; }

    var scene = new THREE.Scene();
    scene.background = new THREE.Color('#141311');
    scene.fog = new THREE.Fog('#141311', 24, 62);
    var camera = new THREE.PerspectiveCamera(38, 1, 0.1, 200);

    scene.add(new THREE.HemisphereLight('#f6eee2', '#1b1915', 0.95));
    var key = new THREE.DirectionalLight('#fff1e2', 2.3);
    key.position.set(-9, 17, 11);
    if (Q.shadow) {
      key.castShadow = true; key.shadow.mapSize.set(Q.shadow, Q.shadow);
      var sc = key.shadow.camera; sc.left = -16; sc.right = 16; sc.top = 16; sc.bottom = -16; sc.near = 1; sc.far = 60;
      key.shadow.bias = -0.0006; key.shadow.normalBias = 0.02;
    }
    scene.add(key);
    var rim = new THREE.DirectionalLight('#9fb3dc', 0.55); rim.position.set(12, 6, -14); scene.add(rim);

    var groundGeo = new THREE.PlaneGeometry(160, 160); groundGeo.rotateX(-Math.PI / 2);
    var ground = new THREE.Mesh(groundGeo, new THREE.ShadowMaterial({ opacity: 0.32 }));
    ground.receiveShadow = true; scene.add(ground);

    var geos = [], mats = {};
    function roundedBlock(w, h, d) {
      var bev = Math.min(0.09, h * 0.22), bs = bev * 0.85, rad = Math.min(0.22, w / 2 - bs - 0.01, d / 2 - bs - 0.01);
      var W = w - 2 * bs, D = d - 2 * bs, x = -W / 2, y = -D / 2, s = new THREE.Shape();
      rad = Math.max(0.01, Math.min(rad, W / 2 - 0.001, D / 2 - 0.001));
      s.moveTo(x + rad, y); s.lineTo(x + W - rad, y); s.quadraticCurveTo(x + W, y, x + W, y + rad);
      s.lineTo(x + W, y + D - rad); s.quadraticCurveTo(x + W, y + D, x + W - rad, y + D);
      s.lineTo(x + rad, y + D); s.quadraticCurveTo(x, y + D, x, y + D - rad);
      s.lineTo(x, y + rad); s.quadraticCurveTo(x, y, x + rad, y);
      var g = new THREE.ExtrudeGeometry(s, { depth: Math.max(0.005, h - 2 * bev), bevelEnabled: true, bevelThickness: bev, bevelSize: bs, bevelSegments: 3, curveSegments: 5 });
      g.rotateX(-Math.PI / 2); g.center(); g.computeVertexNormals(); geos.push(g); return g;
    }
    function material(name) {
      if (mats[name]) return mats[name];
      var m = new THREE.MeshStandardMaterial({ color: COLORS[name], roughness: name === 'slot' ? 1 : 0.8, metalness: 0 });
      if (name === 'orange') { m.emissive = new THREE.Color('#ff5a1a'); m.emissiveIntensity = 0.12; }
      return (mats[name] = m);
    }
    var cubeGeo = null;
    var meshes = PIECES.map(function (pc) {
      var g = pc.id.indexOf('cubo') === 0 ? (cubeGeo || (cubeGeo = roundedBlock(0.9, 0.9, 0.9))) : roundedBlock(pc.size[0], pc.size[1], pc.size[2]);
      var mesh = new THREE.Mesh(g, material(pc.color));
      mesh.castShadow = !!Q.shadow; mesh.receiveShadow = !!Q.shadow; mesh.matrixAutoUpdate = true;
      scene.add(mesh); return mesh;
    });

    /* Estado do quadro (pré-alocado) */
    var camP = new THREE.Vector3(), camT = new THREE.Vector3(), ptr = { x: 0, y: 0, tx: 0, ty: 0 };
    function ease(t) { return t * t * (3 - 2 * t); }
    function lerp(a, b, t) { return a + (b - a) * t; }
    function seg(v) { var i = Math.min(Math.floor(v), 3); var t = ease(clamp(v - i, 0, 1)); return { i: i, t: t }; }

    function update(time) {
      var s = seg(conductor.st.smooth), ia = s.i, ib = s.i + 1, t = s.t;
      var w0 = clamp(1 - conductor.st.smooth, 0, 1);
      for (var n = 0; n < PIECES.length; n++) {
        var A = PIECES[n].st[ia], B = PIECES[n].st[ib], m = meshes[n];
        var bob = w0 * Math.sin(time * 0.0006 + n * 1.7) * 0.22;
        m.position.set(lerp(A[0], B[0], t), lerp(A[1], B[1], t) + bob, lerp(A[2], B[2], t));
        m.rotation.set(lerp(A[3], B[3], t) + bob * 0.4, lerp(A[4], B[4], t) + w0 * time * 0.00008, lerp(A[5], B[5], t));
        var sc = lerp(A[6], B[6], t); m.scale.setScalar(Math.max(sc, 0.0001)); m.visible = sc > 0.002;
      }
      var ca = mobile ? CAM[ia].m : CAM[ia], cb = mobile ? CAM[ib].m : CAM[ib];
      camP.set(lerp(ca.p[0], cb.p[0], t), lerp(ca.p[1], cb.p[1], t), lerp(ca.p[2], cb.p[2], t));
      camT.set(lerp(ca.t[0], cb.t[0], t), lerp(ca.t[1], cb.t[1], t), lerp(ca.t[2], cb.t[2], t));
      ptr.x += (ptr.tx - ptr.x) * 0.06; ptr.y += (ptr.ty - ptr.y) * 0.06;
      camP.x += ptr.x * 0.8 * w0; camP.y += ptr.y * 0.5 * w0;
      camera.position.copy(camP); camera.lookAt(camT);
      var fov = lerp(ca.fov, cb.fov, t); if (camera.fov !== fov) { camera.fov = fov; camera.updateProjectionMatrix(); }
    }

    function resize() {
      var w = stage.clientWidth, h = stage.clientHeight;
      renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix();
    }
    resize();
    addEventListener('resize', resize, { passive: true });
    function onPointer(e) { ptr.tx = (e.clientX / innerWidth - 0.5); ptr.ty = -(e.clientY / innerHeight - 0.5); }
    if (matchMedia('(pointer: fine)').matches) addEventListener('pointermove', onPointer, { passive: true });

    var raf = 0, last = performance.now(), inView = true, first = true;
    function frame(now) {
      raf = requestAnimationFrame(frame);
      var dt = Math.min((now - last) / 1000, 1 / 30); last = now;
      conductor.tick(dt, window.MT && window.MT.lenis ? 7 : 5);
      update(now); renderer.render(scene, camera);
      if (first) { first = false; world.classList.add('is-live'); }
    }
    function play() { if (!raf && inView && !document.hidden) { last = performance.now(); raf = requestAnimationFrame(frame); } }
    function pause() { if (raf) { cancelAnimationFrame(raf); raf = 0; } }
    var io = new IntersectionObserver(function (es) { inView = es[0].isIntersecting; inView ? play() : pause(); });
    io.observe(world);
    function onVis() { document.hidden ? pause() : play(); }
    document.addEventListener('visibilitychange', onVis);
    function onLost(e) { e.preventDefault(); toPoster(); }
    canvas.addEventListener('webglcontextlost', onLost);
    play();

    return {
      destroy: function () {
        pause(); io.disconnect();
        document.removeEventListener('visibilitychange', onVis);
        removeEventListener('resize', resize); removeEventListener('pointermove', onPointer);
        canvas.removeEventListener('webglcontextlost', onLost);
        geos.forEach(function (g) { g.dispose(); }); groundGeo.dispose(); ground.material.dispose();
        Object.keys(mats).forEach(function (k) { mats[k].dispose(); });
        renderer.dispose();
      }
    };
  }
})();
