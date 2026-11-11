/**
 * Cena 3D do Hero: notebook, tablet e celular realistas, sem logotipos, mostrando o CurrículoRaiz.
 * Porte do protótipo aprovado (design/prototipos/cena-3d-hero/scene-realista.js). Carregada só por
 * import dinâmico (HeroSceneLoader), depois do LCP; nada daqui entra no carregamento inicial.
 *
 * Telas (public/images/scene/screens): o editor do CurrículoRaiz em vídeo no notebook (quadro parado no
 * celular e na captura do pôster), a página inicial no tablet e o painel admin com dados de demonstração no celular.
 */
import {
  ACESFilmicToneMapping,
  CanvasTexture,
  ClampToEdgeWrapping,
  CylinderGeometry,
  DirectionalLight,
  Group,
  InstancedMesh,
  Matrix4,
  Mesh,
  MeshBasicMaterial,
  MeshPhysicalMaterial,
  MeshStandardMaterial,
  PerspectiveCamera,
  PlaneGeometry,
  PMREMGenerator,
  Quaternion,
  SRGBColorSpace,
  Scene,
  TextureLoader,
  Vector3,
  VideoTexture,
  WebGLRenderer,
  type BufferGeometry,
  type Texture,
} from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";

export type SceneTheme = "light" | "dark";
export type SceneState = "running" | "paused" | "poster";

export interface HeroSceneOptions {
  theme: SceneTheme;
  /** Toque ou tela estreita: DPR menor e quadro parado no notebook, em vez do vídeo. */
  coarse: boolean;
  /** Captura do pôster: sem margem, sem animação, primeiro quadro no estado de repouso. */
  capture?: boolean;
  /** Testes em navegador sem GPU: não rebaixa nem desiste por lentidão. */
  noDowngrade?: boolean;
  onState?: (state: SceneState) => void;
}

export interface HeroScene {
  setTheme(theme: SceneTheme): void;
  destroy(): void;
}

const SCREEN = "/images/scene/screens/";
const SCREENS = {
  laptopVideo: SCREEN + "curriculoraiz-editor.webm",
  laptopStill: SCREEN + "curriculoraiz-editor-still.webp",
  tablet: SCREEN + "curriculoraiz-tablet.webp",
  phone: SCREEN + "curriculoraiz-admin-phone.webp",
};
const ASPECT = { laptop: 1.6, tablet: 820 / 1180, phone: 390 / 844 };

/** Enquadramento e posições aprovados no protótipo (tarefa 1.3). */
const CAM = { p: [11.5, 8.5, 18.5] as const, t: [2.0, 1.7, 0.0] as const, fov: 30 };
const REST = {
  laptop: { p: [-1.6, 0, 0.4], ry: 0.3 },
  tablet: { p: [5.0, 1.65, -2.4], ry: -0.42 },
  phone: { p: [3.3, 0.75, 4.7], ry: -0.2 },
} as const;
/** Margem do canvas em volta do contêiner, para a vista explodida não ser cortada na borda. */
const OVERSCAN = 1.5;
const LID_OPEN = -1.88;
const LID_CLOSED = -0.12;

const clamp = (v: number, a: number, b: number) => (v < a ? a : v > b ? b : v);
const smooth = (t: number) => t * t * (3 - 2 * t);

export async function createHeroScene(container: HTMLElement, opts: HeroSceneOptions): Promise<HeroScene> {
  const onState = opts.onState ?? (() => {});
  const over = opts.capture ? 1 : OVERSCAN;
  const disposables: Array<{ dispose(): void }> = [];
  const track = <T extends { dispose(): void }>(x: T): T => (disposables.push(x), x);

  /* ── Renderização ─────────────────────────────────────────────────── */
  const canvas = document.createElement("canvas");
  canvas.setAttribute("aria-hidden", "true");
  canvas.className = "scene-canvas";
  const off = ((over - 1) / 2) * 100;
  Object.assign(canvas.style, { left: `${-off}%`, top: `${-off}%`, width: `${over * 100}%`, height: `${over * 100}%` });

  const renderer = new WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: "high-performance", preserveDrawingBuffer: !!opts.capture });
  renderer.setClearColor(0x000000, 0);
  renderer.outputColorSpace = SRGBColorSpace;
  renderer.toneMapping = ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.0;
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, opts.coarse ? 1.3 : 1.75));

  const scene = new Scene();
  const pmrem = new PMREMGenerator(renderer);
  const envTex = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environment = envTex;
  const camera = new PerspectiveCamera(CAM.fov, 1, 0.1, 200);
  const key = new DirectionalLight("#fff4e8", 1.4);
  key.position.set(-6, 12, 8);
  scene.add(key);
  /* Luz de contorno por trás: destaca as bordas dos aparelhos contra o fundo escuro. */
  const rim = new DirectionalLight("#d6e0ff", 0.9);
  rim.position.set(10, 7, -12);
  scene.add(rim);

  /* ── Materiais ─────────────────────────────────────────────────────── */
  const M = {
    aluminum: track(new MeshPhysicalMaterial({ color: "#7c7f84", metalness: 1, roughness: 0.32, clearcoat: 0.2, clearcoatRoughness: 0.4 })),
    aluminumDark: track(new MeshPhysicalMaterial({ color: "#4b4e53", metalness: 1, roughness: 0.38 })),
    trackpad: track(new MeshPhysicalMaterial({ color: "#85888d", metalness: 1, roughness: 0.22 })),
    keys: track(new MeshStandardMaterial({ color: "#17171a", metalness: 0.1, roughness: 0.55 })),
    well: track(new MeshStandardMaterial({ color: "#0e0e10", roughness: 0.8 })),
    // Borda da tela: preto que não reage à luz, como o painel de um aparelho real (o brilho fica na camada de vidro).
    bezel: track(new MeshBasicMaterial({ color: "#050506" })),
    phoneBack: track(new MeshPhysicalMaterial({ color: "#23413b", metalness: 0.2, roughness: 0.25, clearcoat: 1, clearcoatRoughness: 0.08 })),
    phoneFrame: track(new MeshPhysicalMaterial({ color: "#2b3533", metalness: 0.9, roughness: 0.3 })),
    lens: track(new MeshPhysicalMaterial({ color: "#0a0b0d", metalness: 0.3, roughness: 0.05, clearcoat: 1 })),
    ring: track(new MeshPhysicalMaterial({ color: "#9a9ea3", metalness: 1, roughness: 0.25 })),
    glare: track(new MeshPhysicalMaterial({ color: "#ffffff", metalness: 0, roughness: 0.04, transparent: true, opacity: 0.1, depthWrite: false })),
  };
  const geo = <T extends BufferGeometry>(g: T): T => track(g);
  const box = (w: number, h: number, d: number, seg: number, r: number) => geo(new RoundedBoxGeometry(w, h, d, seg, r));
  const add = (parent: Group | Scene, mesh: Mesh, x = 0, y = 0, z = 0) => (mesh.position.set(x, y, z), parent.add(mesh), mesh);

  /* ── Telas ─────────────────────────────────────────────────────────── */
  const loader = new TextureLoader();
  interface Screen { mesh: Mesh<PlaneGeometry, MeshBasicMaterial>; visible: number }
  const screens: Screen[] = [];
  function screenMesh(w: number, h: number): Screen {
    const mesh = new Mesh(geo(new PlaneGeometry(w, h)), track(new MeshBasicMaterial({ color: "#f2f2f2", toneMapped: false })));
    const s = { mesh, visible: 0 };
    screens.push(s);
    return s;
  }
  async function imageTexture(url: string): Promise<Texture> {
    const t = await loader.loadAsync(url);
    t.colorSpace = SRGBColorSpace;
    t.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
    return track(t);
  }
  /** Tela que rola sozinha: mostra a fração da imagem que cabe na proporção da tela. */
  async function scrollingScreen(s: Screen, url: string, aspect: number) {
    const t = await imageTexture(url);
    t.wrapS = t.wrapT = ClampToEdgeWrapping;
    const img = t.image as { width: number; height: number };
    s.visible = img.width / aspect / img.height;
    t.repeat.set(1, s.visible);
    t.offset.set(0, 1 - s.visible);
    s.mesh.material.map = t;
    s.mesh.material.needsUpdate = true;
  }
  let video: HTMLVideoElement | null = null;
  async function laptopScreen(s: Screen) {
    if (opts.coarse || opts.capture) {
      s.mesh.material.map = await imageTexture(SCREENS.laptopStill);
    } else {
      video = document.createElement("video");
      Object.assign(video, { muted: true, loop: true, playsInline: true, preload: "auto" });
      video.src = SCREENS.laptopVideo;
      await new Promise<void>((ok, ko) => {
        video!.addEventListener("loadeddata", () => ok(), { once: true });
        video!.addEventListener("error", () => ko(new Error("vídeo da tela não carregou")), { once: true });
        video!.load();
      });
      video.playbackRate = 1.3;
      const vt = track(new VideoTexture(video));
      vt.colorSpace = SRGBColorSpace;
      s.mesh.material.map = vt;
    }
    s.mesh.material.needsUpdate = true;
  }

  /* ── Notebook: alumínio inteiriço, tampa fina, teclado e trackpad ──── */
  const laptop = new Group(); scene.add(laptop);
  const LW = 8, LD = 5.6, LT = 0.17;
  add(laptop, new Mesh(box(LW, LT, LD, 4, 0.08), M.aluminum), 0, LT / 2, 0);
  add(laptop, new Mesh(box(7.0, 0.02, 2.75, 2, 0.01), M.well), 0, LT - 0.005, -1.05);
  /* Teclas: uma malha instanciada (uma chamada de desenho para o teclado inteiro). */
  const rows = [
    { z: -2.2, n: 14, d: 0.2, w: 0.42 },
    { z: -1.8, n: 14, d: 0.36, w: 0.42 },
    { z: -1.35, n: 14, d: 0.36, w: 0.42 },
    { z: -0.9, n: 13, d: 0.36, w: 0.45 },
    { z: -0.45, n: 12, d: 0.36, w: 0.48 },
  ];
  const bottomRow: Array<[number, number]> = [[-2.9, 0.48], [-2.35, 0.48], [-1.75, 0.6], [0, 2.7], [1.75, 0.6], [2.35, 0.48], [2.9, 0.48]];
  const keyCount = rows.reduce((a, r) => a + r.n, 0) + bottomRow.length;
  const keysMesh = new InstancedMesh(box(1, 0.05, 1, 2, 0.02), M.keys, keyCount);
  const m4 = new Matrix4(), q = new Quaternion(), sc = new Vector3(), ps = new Vector3();
  let ki = 0;
  for (const r of rows) {
    const total = r.n * r.w + (r.n - 1) * 0.06, x0 = -total / 2 + r.w / 2;
    for (let i = 0; i < r.n; i++) keysMesh.setMatrixAt(ki++, m4.compose(ps.set(x0 + i * (r.w + 0.06), LT + 0.02, r.z), q, sc.set(r.w, 1, r.d)));
  }
  for (const [x, w] of bottomRow) keysMesh.setMatrixAt(ki++, m4.compose(ps.set(x, LT + 0.02, 0), q, sc.set(w, 1, 0.36)));
  keysMesh.instanceMatrix.needsUpdate = true;
  laptop.add(keysMesh);
  add(laptop, new Mesh(box(3.2, 0.012, 1.95, 2, 0.006), M.trackpad), 0, LT + 0.002, 1.55);
  /* Tampa articulada na borda de trás; a tela olha para -y no espaço da tampa. */
  const lid = new Group(); lid.position.set(0, LT, -LD / 2 + 0.05); laptop.add(lid);
  add(lid, new Mesh(box(LW, 0.1, LD - 0.1, 4, 0.05), M.aluminum), 0, 0.05, (LD - 0.1) / 2);
  const lBez = add(lid, new Mesh(geo(new PlaneGeometry(LW - 0.03, LD - 0.13)), M.bezel), 0, -0.001, (LD - 0.1) / 2);
  lBez.rotation.x = Math.PI / 2;
  const LSW = 7.4;
  const lScreen = screenMesh(LSW, LSW / ASPECT.laptop);
  add(lid, lScreen.mesh, 0, -0.004, (LD - 0.1) / 2 + 0.16).rotation.x = Math.PI / 2;
  add(lid, new Mesh(lScreen.mesh.geometry, M.glare), 0, -0.008, lScreen.mesh.position.z).rotation.x = Math.PI / 2;
  add(lid, new Mesh(box(0.9, 0.01, 0.16, 2, 0.05), M.bezel), 0, -0.006, LD - 0.24);

  /* ── Tablet: bordas finas, alumínio grafite, duas câmeras atrás ─────── */
  const tablet = new Group(); scene.add(tablet);
  const tabletTilt = new Group(); tabletTilt.rotation.x = 1.25; tablet.add(tabletTilt);
  const TW = 4.3, TD = 6.1, TT = 0.1;
  tabletTilt.add(new Mesh(box(TW, TT, TD, 4, 0.05), M.aluminumDark));
  add(tabletTilt, new Mesh(geo(new PlaneGeometry(TW - 0.06, TD - 0.06)), M.bezel), 0, TT / 2 + 0.001, 0).rotation.x = -Math.PI / 2;
  const TSW = 4.0;
  const tScreen = screenMesh(TSW, TSW / ASPECT.tablet);
  add(tabletTilt, tScreen.mesh, 0, TT / 2 + 0.003, 0).rotation.x = -Math.PI / 2;
  add(tabletTilt, new Mesh(tScreen.mesh.geometry, M.glare), 0, TT / 2 + 0.006, 0).rotation.x = -Math.PI / 2;
  for (const z of [-2.55, -2.15]) {
    add(tabletTilt, new Mesh(geo(new CylinderGeometry(0.17, 0.17, 0.05, 32)), M.ring), -1.7, -TT / 2 - 0.02, z);
    add(tabletTilt, new Mesh(geo(new CylinderGeometry(0.12, 0.12, 0.06, 32)), M.lens), -1.7, -TT / 2 - 0.03, z);
  }

  /* ── Celular: traseira de vidro colorido, módulo de câmera, furo na tela ── */
  const phone = new Group(); scene.add(phone);
  const phoneTilt = new Group(); phoneTilt.rotation.x = 1.12; phone.add(phoneTilt);
  const PW = 2.05, PD = 4.35, PT = 0.12;
  phoneTilt.add(new Mesh(box(PW, PT, PD, 6, 0.06), M.phoneFrame));
  add(phoneTilt, new Mesh(box(PW - 0.04, 0.02, PD - 0.04, 4, 0.01), M.phoneBack), 0, -PT / 2 + 0.005, 0);
  add(phoneTilt, new Mesh(geo(new PlaneGeometry(PW - 0.05, PD - 0.05)), M.bezel), 0, PT / 2 + 0.001, 0).rotation.x = -Math.PI / 2;
  const PSW = 1.9;
  const pScreen = screenMesh(PSW, PSW / ASPECT.phone);
  add(phoneTilt, pScreen.mesh, 0, PT / 2 + 0.003, 0).rotation.x = -Math.PI / 2;
  add(phoneTilt, new Mesh(pScreen.mesh.geometry, M.glare), 0, PT / 2 + 0.006, 0).rotation.x = -Math.PI / 2;
  add(phoneTilt, new Mesh(geo(new CylinderGeometry(0.05, 0.05, 0.01, 24)), M.bezel), 0, PT / 2 + 0.008, -PD / 2 + 0.22);
  add(phoneTilt, new Mesh(box(0.95, 0.06, 0.95, 4, 0.1), M.phoneBack), -0.42, -PT / 2 - 0.03, -1.45);
  for (const [x, z] of [[-0.62, -1.65], [-0.62, -1.25]]) {
    add(phoneTilt, new Mesh(geo(new CylinderGeometry(0.16, 0.16, 0.05, 32)), M.ring), x, -PT / 2 - 0.07, z);
    add(phoneTilt, new Mesh(geo(new CylinderGeometry(0.11, 0.11, 0.06, 32)), M.lens), x, -PT / 2 - 0.08, z);
  }

  /* ── Sombras de contato (pré-desenhadas: mais leves que mapa de sombras) ── */
  const blobTex = (() => {
    const c = document.createElement("canvas"); c.width = c.height = 128;
    const g = c.getContext("2d")!;
    const grd = g.createRadialGradient(64, 64, 6, 64, 64, 62);
    grd.addColorStop(0, "rgba(0,0,0,0.6)"); grd.addColorStop(1, "rgba(0,0,0,0)");
    g.fillStyle = grd; g.fillRect(0, 0, 128, 128);
    return track(new CanvasTexture(c));
  })();
  function shadow(w: number, d: number) {
    const m = new Mesh(geo(new PlaneGeometry(w, d)), track(new MeshBasicMaterial({ map: blobTex, transparent: true, depthWrite: false, toneMapped: false })));
    m.rotation.x = -Math.PI / 2; scene.add(m); return m;
  }

  const devices = [
    { g: laptop, r: REST.laptop, sh: shadow(11, 8), spread: [-2.4, 0, 0.6], phase: 0 },
    { g: tablet, r: REST.tablet, sh: shadow(5.5, 3), spread: [2.6, 0.8, -1.2], phase: 1.7 },
    { g: phone, r: REST.phone, sh: shadow(3, 2.6), spread: [0.6, 0.4, 2.6], phase: 3.1 },
  ];

  let theme: SceneTheme = opts.theme;
  const shadowBase = () => (theme === "light" ? 0.45 : 0.85);
  function setTheme(next: SceneTheme) {
    theme = next;
    scene.environmentIntensity = theme === "light" ? 1.0 : 0.85;
    if (!raf) renderOnce();
  }

  /* ── Quadro: flutuação, telas rolando, ponteiro e rolagem da página ── */
  const ptr = { x: 0, y: 0, tx: 0, ty: 0 };
  const camP = new Vector3(), camT = new Vector3(...CAM.t);
  const idle = opts.capture ? 0 : 1;
  let t0 = performance.now(), entryStart = -1;

  function update(now: number) {
    const heroH = container.closest("section")?.offsetHeight || window.innerHeight;
    const pe = idle * smooth(clamp(window.scrollY / (heroH * 0.55), 0, 1));
    const t = (now - t0) / 1000;
    // `life` vai de 0 a 1 depois da troca imagem → cena: em 0, a pose é exatamente a do pôster (troca
    // imperceptível); a entrada sobe e assenta (seno) e a flutuação cresce junto, sem pulo.
    const life = entryStart < 0 ? 0 : smooth(clamp((now - entryStart) / 1400, 0, 1));
    const lifeIdle = idle * (entryStart < 0 ? 0 : smooth(clamp((now - entryStart) / 2400, 0, 1)));
    devices.forEach((d, i) => {
      const bob = lifeIdle * Math.sin(t * 1.1 + d.phase) * (i === 0 ? 0.05 : 0.12);
      const rise = Math.sin(Math.PI * life) * (0.35 + i * 0.15);
      d.g.position.set(d.r.p[0] + d.spread[0] * pe, d.r.p[1] + bob + rise + d.spread[1] * pe, d.r.p[2] + d.spread[2] * pe);
      d.g.rotation.y = d.r.ry + lifeIdle * Math.sin(t * 0.6 + d.phase) * 0.035 + pe * 0.25 * (i === 0 ? -1 : 1);
      const lift = d.g.position.y - (i === 0 ? 0 : 0.35);
      d.sh.position.set(d.g.position.x + (i === 0 ? 0.2 : 0.4), 0.005, d.g.position.z + (i === 0 ? 0.3 : 0.6));
      d.sh.scale.setScalar(1 + lift * 0.18);
      (d.sh.material as MeshBasicMaterial).opacity = shadowBase() * clamp(1.15 - lift * 0.35, 0.2, 1);
    });
    /* Tampa: na entrada, fecha um pouco e volta a abrir; fecha aos poucos enquanto o Hero sai da tela. */
    const open = LID_OPEN * (1 - 0.12 * Math.sin(Math.PI * life));
    lid.rotation.x = open + (LID_CLOSED - open) * pe * 0.85;
    /* Telas que rolam: descem devagar até o fim, param e voltam ao topo (ciclo de 16 s). */
    for (const s of screens) {
      const map = s.mesh.material.map;
      if (!s.visible || !map) continue;
      const k = (t % 16) / 16;
      const pos = idle ? (k < 0.08 ? 0 : k < 0.78 ? smooth((k - 0.08) / 0.7) : k < 0.86 ? 1 : 1 - smooth((k - 0.86) / 0.14)) : 0;
      map.offset.y = (1 - s.visible) * (1 - pos);
    }
    ptr.x += (ptr.tx - ptr.x) * 0.06; ptr.y += (ptr.ty - ptr.y) * 0.06;
    camP.set(CAM.p[0] + ptr.x * 1.2, CAM.p[1] + ptr.y * 0.7, CAM.p[2]);
    camera.position.copy(camP); camera.lookAt(camT);
  }

  function resize() {
    const w = container.clientWidth * over, h = container.clientHeight * over;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.fov = (2 * Math.atan(over * Math.tan((CAM.fov * Math.PI) / 360)) * 180) / Math.PI;
    camera.updateProjectionMatrix();
  }
  const ro = new ResizeObserver(() => { resize(); if (!raf) renderOnce(); });
  const onPointer = (e: PointerEvent) => { ptr.tx = e.clientX / window.innerWidth - 0.5; ptr.ty = -(e.clientY / window.innerHeight - 0.5); };

  /* ── Laço, pausa, rebaixamento e falhas ───────────────────────────── */
  let raf = 0, inView = true, frames = 0, slowSum = 0, last = 0, downgraded = false, failed = false;
  function renderOnce() { update(performance.now()); renderer.render(scene, camera); }
  function frame(now: number) {
    raf = requestAnimationFrame(frame);
    if (last && frames < 60 && !opts.noDowngrade) { slowSum += now - last; frames++; if (frames === 60) checkSpeed(); }
    last = now;
    update(now);
    renderer.render(scene, camera);
  }
  function checkSpeed() {
    if (slowSum / 60 <= 33) return;
    if (!downgraded) { downgraded = true; renderer.setPixelRatio(1); resize(); frames = 0; slowSum = 0; return; }
    fail();
  }
  function play() {
    // Captura do pôster: a cena fica parada no estado de repouso.
    if (opts.capture || raf || !inView || document.hidden || failed) return;
    last = 0; raf = requestAnimationFrame(frame);
    void video?.play().catch(() => {});
    onState("running");
  }
  function pause() {
    if (!raf) return;
    cancelAnimationFrame(raf); raf = 0;
    video?.pause();
    onState("paused");
  }
  const io = new IntersectionObserver((es) => { inView = es[0].isIntersecting; if (inView) play(); else pause(); });
  const onVis = () => (document.hidden ? pause() : play());
  const onLost = (e: Event) => { e.preventDefault(); fail(); };
  function fail() { if (failed) return; failed = true; destroy(); onState("poster"); }

  function destroy() {
    if (raf) { cancelAnimationFrame(raf); raf = 0; }
    io.disconnect(); ro.disconnect();
    document.removeEventListener("visibilitychange", onVis);
    window.removeEventListener("pointermove", onPointer);
    canvas.removeEventListener("webglcontextlost", onLost);
    if (video) { video.pause(); video.removeAttribute("src"); video.load(); }
    disposables.forEach((d) => d.dispose());
    keysMesh.dispose(); envTex.dispose(); pmrem.dispose(); renderer.dispose();
    container.classList.remove("is-live");
    canvas.remove();
  }

  /* ── Montagem: telas antes do primeiro quadro, para a troca imagem → cena não mostrar telas vazias ── */
  try {
    await Promise.all([laptopScreen(lScreen), scrollingScreen(tScreen, SCREENS.tablet, ASPECT.tablet), scrollingScreen(pScreen, SCREENS.phone, ASPECT.phone)]);
  } catch (err) {
    failed = true; destroy(); throw err;
  }
  setTheme(theme);
  container.appendChild(canvas);
  resize();
  renderOnce();
  ro.observe(container);
  io.observe(container);
  document.addEventListener("visibilitychange", onVis);
  canvas.addEventListener("webglcontextlost", onLost);
  if (!opts.coarse) window.addEventListener("pointermove", onPointer, { passive: true });
  requestAnimationFrame(() => {
    container.classList.add("is-live");
    if (!opts.capture) { entryStart = t0 = performance.now(); play(); }
  });

  return { setTheme, destroy: () => { if (!failed) { failed = true; destroy(); } } };
}
