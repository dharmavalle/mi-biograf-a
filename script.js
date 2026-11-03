// ===== UTILIDADES =====
const $ = (s) => document.querySelector(s);
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const rnd = (a, b) => a + Math.random() * (b - a);
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const NS = "http://www.w3.org/2000/svg";
const svgEl = (tag, attrs = {}, parent) => {
  const e = document.createElementNS(NS, tag);
  for (const k in attrs) e.setAttribute(k, attrs[k]);
  if (parent) parent.appendChild(e);
  return e;
};

// Colores de los tulipanes (cámbialos si quieres)
const TULIP_COLORS = ["#e8a0b4", "#f2c14e", "#d9604c", "#c58be0", "#f4efe6", "#ff8fa3"];

// ===== 1. ANIMACIÓN DE ENTRADA: "hola jejeje" =====
const intro = $("#intro");
const introText = $("#introText");
[...introText.dataset.msg].forEach((ch, i) => {
  const s = document.createElement("span");
  s.textContent = ch === " " ? "\u00A0" : ch;
  s.style.animationDelay = i * 0.09 + "s";
  introText.appendChild(s);
});
let introDone = false;
function endIntro() {
  if (introDone) return;
  introDone = true;
  intro.classList.add("hide");
  document.body.classList.remove("locked");
  setTimeout(() => intro.remove(), 1200);
}
setTimeout(endIntro, 3000);       // desaparece sola a los 3 segundos
intro.addEventListener("click", endIntro); // o con un clic

// ===== 2. FLOTADORES (calaveras, símbolos emo, magia) =====
const EMO = ["🖤", "💔", "🕳️", "🌚", "♠️", "♣️", "⚰️", "💀", "🤘", "🥀"];
const MAGIA = ["🍫", "🦎", "🦥", "✏️", "💵", "📚", "📖", "📕", "🌲", "🍂", "🍁", "🌼", "🌻", "🌺", "💐", "🌾", "🌿", "🌵", "❄️", "☃️"];

function spawn(layer, list, n, extraClass) {
  for (let i = 0; i < n; i++) {
    const s = document.createElement("span");
    s.className = "floater " + extraClass + (extraClass === "emo" && i % 4 === 0 ? " rosa" : "");
    s.textContent = pick(list);
    s.style.setProperty("--x", rnd(0, 96) + "vw");
    s.style.setProperty("--size", rnd(1.2, 3) + "rem");
    s.style.setProperty("--d", rnd(28, 52) + "s");
    s.style.setProperty("--delay", -rnd(0, 52) + "s");
    s.style.setProperty("--dx", rnd(-14, 14) + "vw");
    s.style.setProperty("--r", rnd(-90, 90) + "deg");
    layer.appendChild(s);
  }
}
spawn($("#darkLayer"), EMO, 24, "emo");
spawn($("#greenLayer"), MAGIA, 20, "magia");

// ===== 3. VEGETACIÓN (enredaderas, hojas, tulipanes) =====
// Cada elemento tiene un umbral "t": aparece cuando el crecimiento lo alcanza.
let items = [];

function addItem(parent, x, y, angle, t, className = "sprout") {
  const g = svgEl("g", { class: className }, parent);
  const it = { g, x, y, angle, t, on: null };
  items.push(it);
  return g;
}
function tulip(parent, x, y, w, h, t, color) {
  const g = addItem(parent, x, y, 0, t);
  g.style.color = color;
  const p = svgEl("g", { class: "plant" }, g);
  const u = svgEl("use", { x: -w / 2, y: -h, width: w, height: h }, p);
  u.setAttribute("href", "#tulip");
}

let vinePaths = [];
function buildVine(svg) {
  svg.innerHTML = "";
  const W = 150, H = window.innerHeight;
  svg.setAttribute("viewBox", `0 0 ${W} ${H}`);
  const pts = [];
  for (let y = H + 10; y >= -10; y -= 6) {
    pts.push([28 + Math.sin(y / 55) * 16 + Math.sin(y / 23) * 4, y]);
  }
  const path = svgEl("path", {
    class: "stem",
    d: "M" + pts.map((p) => p.join(",")).join(" L"),
    pathLength: 1,
  }, svg);
  path.style.strokeDasharray = 1;
  path.style.strokeDashoffset = 1;
  vinePaths.push(path);

  pts.forEach((p, i) => {
    const t = i / pts.length;
    if (i > 6 && i % 7 === 0) {
      const side = (i / 7) % 2 ? 1 : -1;
      const g = addItem(svg, p[0], p[1], side > 0 ? -35 : 215, t);
      svgEl("path", {
        d: "M0 0 C8 -11 24 -11 30 0 C24 9 8 9 0 0Z",
        fill: pick(["#6f8f58", "#7da063", "#5c7a4a"]),
      }, g);
    }
    if (i > 30 && i % 35 === 0) {
      tulip(svg, p[0] + rnd(-4, 4), p[1], 22, 50, t + 0.03, pick(TULIP_COLORS));
    }
  });
}

function buildGround() {
  const svg = $("#ground");
  svg.innerHTML = "";
  const W = window.innerWidth, H = 190;
  svg.setAttribute("viewBox", `0 0 ${W} ${H}`);
  // pasto
  for (let x = 0; x < W; x += 12) {
    const h = rnd(20, 60);
    const g = addItem(svg, x, H, rnd(-8, 8), rnd(0.02, 0.9));
    svgEl("path", { d: `M0 0 Q${rnd(-6, 6)} ${-h / 2} ${rnd(-8, 8)} ${-h}`, stroke: pick(["#5c7a4a", "#6f8f58", "#7da063"]), "stroke-width": 3, fill: "none", "stroke-linecap": "round" }, g);
  }
  // tulipanes
  const n = Math.round(W / 75);
  for (let i = 0; i < n; i++) {
    const h = rnd(80, 160);
    tulip(svg, rnd(20, W - 20), H, h * 0.44, h, rnd(0.08, 0.95), pick(TULIP_COLORS));
  }
}

function buildAll() {
  items = [];
  vinePaths = [];
  buildVine($("#vineL"));
  buildVine($("#vineR"));
  buildGround();
  update();
}

// ===== 4. ACTUALIZAR SEGÚN EL SCROLL =====
function update() {
  const max = document.documentElement.scrollHeight - window.innerHeight;
  const p = max > 0 ? window.scrollY / max : 0;       // 0 = arriba, 1 = abajo
  $("#darkLayer").style.opacity = document.body.classList.contains("oscuro") ? 1 : clamp(1 - (p - 0.1) / 0.45);   // lo oscuro se va desvaneciendo
  $("#greenLayer").style.opacity = clamp((p - 0.25) / 0.5);      // lo mágico verde aparece
  const g = clamp((p - 0.3) / 0.6);                              // crecimiento de la vegetación
  vinePaths.forEach((path) => (path.style.strokeDashoffset = 1 - g));
  items.forEach((it) => {
    const on = g >= it.t;
    if (on === it.on) return;
    it.on = on;
    it.g.style.transform = `translate(${it.x}px, ${it.y}px) rotate(${it.angle}deg) scale(${on ? 1 : 0})`;
  });
}

let ticking = false;
window.addEventListener("scroll", () => {
  if (ticking) return;
  ticking = true;
  requestAnimationFrame(() => { update(); ticking = false; });
}, { passive: true });

let resizeTimer;
window.addEventListener("resize", () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(buildAll, 250);
});

// ===== 5. CORAZÓN LLENO DE PERSONAS (hover de "Entorno") =====
function buildPeople() {
  const g = document.getElementById("gentio");
  if (!g) return;
  const skins = ["#ffe3d3", "#ffd0b8", "#f2c3a0", "#e8b48c", "#ffffff", "#ffd9e2"];
  const shirts = ["#ffffff", "#ffc2d1", "#f6e6a8", "#bfe3c0", "#c9b8ff"];
  let row = 0;
  for (let y = 34; y <= 172; y += 19, row++) {
    for (let x = row % 2 ? 14 : 4; x <= 196; x += 20) {
      const outer = svgEl("g", { transform: `translate(${x} ${y})` }, g);
      const p = svgEl("g", { class: "mini" }, outer);
      p.style.animationDelay = -rnd(0, 1.3) + "s";
      svgEl("circle", { cx: 0, cy: -6, r: 4, fill: pick(skins) }, p);
      svgEl("path", { d: "M-5 8 Q-5 0 0 0 Q5 0 5 8Z", fill: pick(shirts) }, p);
    }
  }
}
buildPeople();

// ===== 6. BOTONES "VER MÁS" =====
document.querySelectorAll(".ver-mas").forEach((btn) => {
  btn.addEventListener("click", () => {
    const panel = document.getElementById(btn.getAttribute("aria-controls"));
    const abierto = btn.getAttribute("aria-expanded") === "true";
    btn.setAttribute("aria-expanded", String(!abierto));
    panel.classList.toggle("open", !abierto);
    btn.textContent = abierto ? "ver más" : "ver menos";
    setTimeout(update, 550); // la página cambia de alto, recalcular el scroll
  });
});

buildAll();


// ===== 7. EDAD DE MILO J (se calcula sola con su cumpleaños: 25 de octubre de 2006) =====
(function () {
  const hoy = new Date();
  let edad = hoy.getFullYear() - 2006;
  if (hoy < new Date(hoy.getFullYear(), 9, 25)) edad--;   // meses van de 0 a 11: 9 = octubre
  const span = document.getElementById("edadMilo");
  if (span) span.textContent = edad;
})();

// ===== 8. BOTÓN PLAY (canción de Milo J: cancion2.mp3) =====
(function () {
  const audio = document.getElementById("audioMilo");
  const btn = document.getElementById("btnPlay");
  const caja = document.getElementById("reproductor");
  const aviso = document.getElementById("avisoAudio");
  if (!audio || !btn) return;
  const estado = (sonando) => {
    btn.textContent = sonando ? "⏸" : "▶";
    btn.setAttribute("aria-pressed", String(sonando));
    btn.setAttribute("aria-label", sonando ? "Pausar la canción" : "Reproducir la canción de Milo J");
    caja.classList.toggle("sonando", sonando);
  };
  btn.addEventListener("click", () => {
    if (audio.paused) {
      audio.play().then(() => (aviso.hidden = true)).catch(() => (aviso.hidden = false));
    } else {
      audio.pause();
    }
  });
  audio.addEventListener("play", () => estado(true));
  audio.addEventListener("pause", () => estado(false));
  audio.addEventListener("ended", () => estado(false));
  audio.addEventListener("error", () => (aviso.hidden = false));
})();

// ===== 9. JACK SPARROW CORRIENDO (sale del botón de Piratas del Caribe) =====
(function () {
  const btn = document.getElementById("btnJack");
  const jack = document.getElementById("jack");
  if (!btn || !jack) return;
  btn.addEventListener("click", () => {
    if (btn.disabled) return;
    btn.disabled = true;
    const r = btn.getBoundingClientRect();
    jack.style.left = r.left + "px";
    jack.style.top = r.bottom - 150 + "px";
    jack.hidden = false;
    const distancia = window.innerWidth - r.left + 200;
    const anim = jack.animate(
      [
        { transform: "translateX(0) scale(.2)", opacity: 0 },
        { transform: "translateX(30px) scale(1)", opacity: 1, offset: 0.06 },
        { transform: `translateX(${distancia}px) scale(1)`, opacity: 1 },
      ],
      { duration: 4500, easing: "linear" }
    );
    anim.onfinish = () => { jack.hidden = true; btn.disabled = false; };
  });
})();


// ===== 10. NIEVE EN LA ESCENA DE SUEÑOS =====
document.querySelectorAll(".copos").forEach((c) => {
  for (let i = 0; i < 22; i++) {
    const f = document.createElement("i");
    f.textContent = "❄";
    f.style.setProperty("--x", rnd(0, 97) + "%");
    f.style.setProperty("--s", rnd(.6, 1.2) + "rem");
    f.style.setProperty("--d", rnd(4, 9) + "s");
    f.style.setProperty("--dl", -rnd(0, 9) + "s");
    c.appendChild(f);
  }
});

// ===== 11. TARJETAS APARECEN AL HACER SCROLL =====
if ("IntersectionObserver" in window) {
  const io = new IntersectionObserver((es) => es.forEach((e) => {
    if (e.isIntersecting) { e.target.classList.remove("pre"); io.unobserve(e.target); }
  }), { threshold: 0.15 });
  document.querySelectorAll(".card").forEach((c) => { c.classList.add("pre"); io.observe(c); });
}

// ===== 12. CORTINA AL NAVEGAR POR EL MENÚ (estilo Google) =====
(function () {
  const cortina = $("#cortina"), txt = $("#cortinaTxt");
  let ocupada = false;
  document.querySelectorAll("#menu a").forEach((a) => a.addEventListener("click", (e) => {
    if (a.id === "btnArchive") return;   // TOP SECRET tiene su propio clic
    e.preventDefault();
    const destino = document.querySelector(a.getAttribute("href"));
    if (!destino || ocupada) return;
    ocupada = true;
    txt.textContent = a.firstChild.textContent.trim();
    cortina.className = "on cierra";
    setTimeout(() => {   // pantalla tapada: saltamos a la sección
      window.scrollTo({ top: destino.getBoundingClientRect().top + window.scrollY, left: 0, behavior: "instant" });
      update();
    }, 750);
    setTimeout(() => (cortina.className = "on abre"), 1050);
    setTimeout(() => { cortina.className = ""; ocupada = false; }, 1700);
  }));
})();

// ===== 13. ONDA DE COLOR Y TEMBLOR AL ABRIR "VER MÁS" =====
document.querySelectorAll(".ver-mas").forEach((btn) => btn.addEventListener("click", (e) => {
  const card = btn.closest(".card");
  const color = (card && getComputedStyle(card).getPropertyValue("--hbd").trim()) || "#e8a0b4";
  const r = btn.getBoundingClientRect();
  const x = e.clientX || r.left + r.width / 2, y = e.clientY || r.top + r.height / 2;
  const d = document.createElement("div");
  d.className = "onda";
  d.style.left = x + "px"; d.style.top = y + "px"; d.style.background = color;
  document.body.appendChild(d);
  const k = Math.hypot(innerWidth, innerHeight) / 10;
  d.animate([
    { transform: "translate(-50%,-50%) scale(0)", opacity: 0.5 },
    { transform: `translate(-50%,-50%) scale(${k})`, opacity: 0 },
  ], { duration: 800, easing: "ease-out" }).onfinish = () => d.remove();
  if (card && card.dataset.tema === "suenos" && btn.getAttribute("aria-expanded") === "true") {
    $("main").animate([
      { transform: "translate(0)" }, { transform: "translate(-8px,4px)" }, { transform: "translate(8px,-4px)" },
      { transform: "translate(-5px,-3px)" }, { transform: "translate(0)" },
    ], { duration: 450 });   // ¡toc toc! el mazo golpea
  }
}));


// ===== 14. ARCHIVE_06: ILUSTRACIÓN AL PASAR EL CURSOR (o tocar en móvil) =====
(function () {
  const btn = $("#btnArchive"), panel = $("#archivoPanel"), lienzo = $("#lienzo");
  if (!btn || !panel) return;
  const tactil = matchMedia("(hover: none)").matches;
  let timer = null, abierto = false, z = 1, tx = 0, ty = 0, arrastre = null;
  const aplicar = () => { lienzo.style.transform = `translate(${tx}px,${ty}px) scale(${z})`; };
  const limitar = () => {
    const r = panel.getBoundingClientRect();
    tx = Math.min(0, Math.max(r.width * (1 - z), tx)); ty = Math.min(0, Math.max(r.height * (1 - z), ty));
  };
  const abrir = () => {
    clearTimeout(timer); if (abierto) return; abierto = true; z = 1; tx = ty = 0; aplicar();
    if (!tactil) {
      const r = btn.getBoundingClientRect();
      const h = Math.max(260, Math.min(560, window.innerHeight - r.bottom - 24)), w = (h * 400) / 560;
      panel.style.setProperty("--h", h + "px");
      panel.style.setProperty("--px", clamp(r.left + r.width / 2, w / 2 + 10, window.innerWidth - w / 2 - 10) + "px");
      panel.style.setProperty("--py", r.bottom + 10 + "px");
      panel.style.setProperty("--ty", "0px");
    }
    panel.classList.add("abierto"); panel.setAttribute("aria-hidden", "false");
  };
  const cerrar = () => {
    clearTimeout(timer); abierto = false;
    panel.classList.remove("abierto", "zoom-tactil"); panel.setAttribute("aria-hidden", "true");
  };
  const cerrarLuego = (ms) => { clearTimeout(timer); timer = setTimeout(cerrar, ms); };

  if (!tactil) {
    btn.addEventListener("mouseenter", abrir);
    btn.addEventListener("mouseleave", () => cerrarLuego(700));
    panel.addEventListener("mouseenter", () => clearTimeout(timer));
    panel.addEventListener("mouseleave", () => cerrarLuego(300));
    panel.addEventListener("wheel", (e) => {          // zoom con la rueda, sin mostrar nada extra
      e.preventDefault();
      const r = panel.getBoundingClientRect(), px = e.clientX - r.left, py = e.clientY - r.top;
      const nz = clamp(z * (e.deltaY < 0 ? 1.15 : 1 / 1.15), 1, 4);
      tx = px - (px - tx) * (nz / z); ty = py - (py - ty) * (nz / z); z = nz;
      if (z === 1) tx = ty = 0;
      limitar(); aplicar();
    }, { passive: false });
    panel.addEventListener("pointerdown", (e) => { if (z > 1) { arrastre = { x: e.clientX - tx, y: e.clientY - ty }; panel.setPointerCapture(e.pointerId); } });
    panel.addEventListener("pointermove", (e) => { if (arrastre) { tx = e.clientX - arrastre.x; ty = e.clientY - arrastre.y; limitar(); aplicar(); } });
    panel.addEventListener("pointerup", () => (arrastre = null));
    panel.addEventListener("dblclick", () => { z = 1; tx = ty = 0; aplicar(); });
  } else {
    panel.addEventListener("click", () => panel.classList.toggle("zoom-tactil"));  // toque = acercar / alejar
    document.addEventListener("click", (e) => { if (abierto && !panel.contains(e.target) && e.target !== btn) cerrar(); });
  }

  // El CLIC es independiente del hover: cierra el panel y baja hasta el final absoluto.
  btn.addEventListener("click", (e) => {
    e.preventDefault();
    if (tactil && !abierto) { abrir(); return; }   // en móvil: 1er toque = ver la imagen, 2º toque = ir a la caja fuerte
    cerrar();
    window.scrollTo({ top: document.documentElement.scrollHeight, behavior: "smooth" });
  });
})();

// ===== 15. CAJA FUERTE =====
(function () {
  const boveda = $("#boveda"), caja = $("#caja"), estado = $("#estado"), privado = $("#privado"), apagon = $("#apagon");
  if (!boveda) return;
  const cas = [...document.querySelectorAll(".casilla")];
  // Solo se guarda una huella (PBKDF2-SHA256) del código, nunca el código.
  const SAL = "49751c99aee780d8ebca6dd09cca0587", HUELLA = "63b7c1ac91ea2ea3a907f7438327d60f288365f0e0b2640b5bf6b9e7593bf158", ITER = 200000;
  let entrada = "", bloqueado = false, visible = false, sonido = false, ctx = null;
  const hex = (b) => [...new Uint8Array(b)].map((x) => x.toString(16).padStart(2, "0")).join("");
  const bytes = (h) => Uint8Array.from(h.match(/../g).map((x) => parseInt(x, 16)));
  async function verificar(c) {
    if (!(window.crypto && crypto.subtle)) return false;
    const k = await crypto.subtle.importKey("raw", new TextEncoder().encode(c), "PBKDF2", false, ["deriveBits"]);
    const bits = await crypto.subtle.deriveBits({ name: "PBKDF2", hash: "SHA-256", salt: bytes(SAL), iterations: ITER }, k, 256);
    return hex(bits) === HUELLA;
  }
  const pinta = () => cas.forEach((c, i) => {
    c.textContent = entrada[i] || ""; c.classList.toggle("llena", i < entrada.length); c.classList.toggle("activa", i === entrada.length && !bloqueado);
  });
  function beep(f, d = 0.08) {   // sonidos opcionales (apagados por defecto)
    if (!sonido) return;
    try {
      ctx = ctx || new (window.AudioContext || window.webkitAudioContext)();
      const o = ctx.createOscillator(), g = ctx.createGain();
      o.frequency.value = f; g.gain.value = 0.04; o.connect(g); g.connect(ctx.destination); o.start();
      g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + d); o.stop(ctx.currentTime + d);
    } catch (e) {}
  }
  const mensaje = (t, cls) => { estado.textContent = t; estado.className = "estado " + (cls || ""); };
  function tecla(k) {
    if (bloqueado) return;
    if (k === "del") { entrada = entrada.slice(0, -1); beep(300); }
    else if (k === "clr") { entrada = ""; beep(260); }
    else if (entrada.length < 6) { entrada += k; beep(480 + entrada.length * 45); }
    pinta();
    if (entrada.length === 6) comprobar();
  }
  async function comprobar() {
    bloqueado = true; pinta();
    (await verificar(entrada)) ? exito() : error();
  }
  function error() {
    mensaje("THE ARCHIVE REMAINS SEALED", "err"); caja.classList.add("error"); beep(110, 0.4);
    setTimeout(() => { caja.classList.remove("error"); entrada = ""; bloqueado = false; pinta(); mensaje("RESTRICTED ACCESS"); }, 1600);
  }
  function exito() {
    mensaje("ACCESS GRANTED", "ok"); beep(880, 0.6);
    cas.forEach((c, i) => setTimeout(() => c.classList.add("luz"), i * 160));
    boveda.classList.add("distorsion");
    setTimeout(() => apagon.classList.add("on"), 1500);
    setTimeout(() => {
      caja.hidden = true; privado.hidden = false;
      boveda.classList.remove("distorsion"); boveda.classList.add("abierta");
      window.scrollTo({ top: boveda.getBoundingClientRect().top + window.scrollY, behavior: "instant" });
      update(); apagon.classList.remove("on");
    }, 3000);
  }
  $("#teclado").addEventListener("click", (e) => { const b = e.target.closest("button"); if (b) tecla(b.dataset.k); });
  document.addEventListener("keydown", (e) => {
    if (!visible || bloqueado || e.ctrlKey || e.metaKey) return;
    if (/^[0-9]$/.test(e.key)) tecla(e.key);
    else if (e.key === "Backspace") { e.preventDefault(); tecla("del"); }
    else if (e.key === "Escape") tecla("clr");
  });
  $("#sonido").addEventListener("click", (e) => {
    sonido = !sonido; e.currentTarget.textContent = "SOUND: " + (sonido ? "ON" : "OFF"); e.currentTarget.setAttribute("aria-pressed", String(sonido));
  });
  // Al llegar a la caja fuerte el fondo vuelve a oscurecerse
  new IntersectionObserver((es) => es.forEach((e) => {
    visible = e.isIntersecting; document.body.classList.toggle("oscuro", visible); update();
  }), { threshold: 0.3 }).observe(boveda);
  pinta();
})();