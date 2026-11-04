'use strict';

// Versión de la app (se ve en la pantalla de inicio). Arreglos y ajustes: 0.1.x; novedades: 0.x.0.
const APP_VERSION = '0.2.1';
// Uso de la app en Vercel Analytics: es una sola página, así que cada función se cuenta como una
// página virtual. Solo se envía el nombre de la función, nunca datos de las hojas.
const track = (path) => { try { window.va?.('pageview', { path }); } catch (_) { /* sin analítica */ } };
const trackLabel = (label) => track(`/${label.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}`);
const DISPLAY_KEY = 'sheet:display';
const INSTALL_HINT_KEY = 'sheet:installHint';
const LOCALE = 'es-ES';

const ICONS = {
  cloud: '<path d="M7 18.5h9.5a4 4 0 0 0 .8-7.9 5.8 5.8 0 0 0-11.1-1.5A4.8 4.8 0 0 0 7 18.5z"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  upload: '<path d="M12 15V4M7.5 8.5L12 4l4.5 4.5"/><path d="M5 14v4.5A1.5 1.5 0 0 0 6.5 20h11a1.5 1.5 0 0 0 1.5-1.5V14"/>',
  download: '<path d="M12 4v11M7.5 10.5L12 15l4.5-4.5"/><path d="M5 15v3.5A1.5 1.5 0 0 0 6.5 20h11a1.5 1.5 0 0 0 1.5-1.5V15"/>',
  trash: '<path d="M4.5 7h15M10 11v6M14 11v6"/><path d="M6.5 7l1 12.5A1.5 1.5 0 0 0 9 21h6a1.5 1.5 0 0 0 1.5-1.5l1-12.5M9.5 7V4.5h5V7"/>',
  palette: '<path d="M12 3a9 9 0 1 0 0 18c1.1 0 1.6-.9 1.2-1.8-.5-1-.1-2.2 1.1-2.2H17a4 4 0 0 0 4-4c0-5.5-4-10-9-10z"/><circle cx="7.5" cy="11" r="1.2"/><circle cx="10" cy="7" r="1.2"/><circle cx="15" cy="7.5" r="1.2"/>',
  info: '<circle cx="12" cy="12" r="8.5"/><path d="M12 11v5.5"/><circle cx="12" cy="7.8" r=".6" fill="currentColor"/>',
  chevron: '<path d="M9 5l7 7-7 7"/>',
  back: '<path d="M15 5l-7 7 7 7"/>',
  close: '<path d="M6 6l12 12M18 6L6 18"/>',
  check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
  undo: '<path d="M8 6L4 10l4 4"/><path d="M4 10h10a5 5 0 0 1 0 10h-3"/>',
  redo: '<path d="M16 6l4 4-4 4"/><path d="M20 10H10a5 5 0 0 0 0 10h3"/>',
  left: '<path d="M4 6h16M4 10.5h10M4 15h16M4 19.5h10"/>',
  center: '<path d="M4 6h16M7 10.5h10M4 15h16M7 19.5h10"/>',
  right: '<path d="M4 6h16M10 10.5h10M4 15h16M10 19.5h10"/>',
  wrap: '<path d="M4 6h16M4 12h13a3 3 0 0 1 0 6h-5"/><path d="M14 15.5L11.5 18l2.5 2.5M4 18h4"/>',
  merge: '<rect x="3.5" y="5" width="17" height="14" rx="1.5"/><path d="M12 5v4M12 15v4M7.5 12h9M14.5 10l2 2-2 2M9.5 10l-2 2 2 2"/>',
  border: '<rect x="4" y="4" width="16" height="16" rx="1"/><path d="M4 12h16M12 4v16" stroke-dasharray="2 2"/>',
  fill: '<path d="M6.5 11.5L12 6l6 6-5.5 5.5a2 2 0 0 1-2.8 0l-3.2-3.2a2 2 0 0 1 0-2.8zM9 3.5L12 6"/><path d="M19 15.5c1 1.4 1.6 2.3 1.6 3a1.6 1.6 0 0 1-3.2 0c0-.7.6-1.6 1.6-3z"/>',
  sum: '<path d="M18 5H6.5l6 7-6 7H18"/>',
  fx: '<path d="M10 20c1.5 0 2-1 2.3-2.5L14 7c.3-1.5 1-3 2.5-3M8.5 10H16"/>',
  sort: '<path d="M8 5v14M4.5 15.5L8 19l3.5-3.5"/><path d="M14 7h6M14 12h4.5M14 17h3"/>',
  sortup: '<path d="M8 19V5M4.5 8.5L8 5l3.5 3.5"/><path d="M14 7h3M14 12h4.5M14 17h6"/>',
  freeze: '<rect x="4" y="4" width="16" height="16" rx="1.5"/><path d="M4 9.5h16M9.5 4v16"/>',
  search: '<circle cx="11" cy="11" r="6.5"/><path d="M16 16l4.5 4.5"/>',
  copy: '<rect x="8.5" y="8.5" width="11" height="11.5" rx="1.5"/><path d="M15.5 8.5V5.5A1.5 1.5 0 0 0 14 4H6a1.5 1.5 0 0 0-1.5 1.5v9A1.5 1.5 0 0 0 6 16h2.5"/>',
  cut: '<circle cx="7" cy="17.5" r="2.5"/><circle cx="17" cy="17.5" r="2.5"/><path d="M8.5 15.5L17 4M15.5 15.5L7 4"/>',
  paste: '<rect x="5" y="5.5" width="14" height="15" rx="1.5"/><rect x="9" y="3.5" width="6" height="4" rx="1"/>',
  rows: '<rect x="4" y="5" width="16" height="14" rx="1.5"/><path d="M4 12h16"/>',
  cols: '<rect x="4" y="5" width="16" height="14" rx="1.5"/><path d="M12 5v14"/>',
  edit: '<path d="M5 19l1-4L16.5 4.5a1.8 1.8 0 0 1 2.5 0l.5.5a1.8 1.8 0 0 1 0 2.5L9 18z"/><path d="M14.5 6.5l3 3"/>',
  sheet: '<rect x="4" y="4" width="16" height="16" rx="2"/><path d="M4 9.5h16M4 15h16M10 9.5V20"/>',
  eye: '<path d="M3 12s3.5-6.5 9-6.5S21 12 21 12s-3.5 6.5-9 6.5S3 12 3 12z"/><circle cx="12" cy="12" r="2.5"/>',
  eyeoff: '<path d="M4 4l16 16M9.5 6a9 9 0 0 1 2.5-.5c5.5 0 9 6.5 9 6.5a15 15 0 0 1-3 3.6M6.5 7.8A15 15 0 0 0 3 12s3.5 6.5 9 6.5a9 9 0 0 0 4-1"/>',
};
const icon = (name, size = 22) =>
  `<svg viewBox="0 0 24 24" width="${size}" height="${size}" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[name]}</svg>`;

// Logo de SheetCTRL: anillo fino, anillo discontinuo, arco y una tabla con una casilla marcada
let logoCount = 0;
function logoSVG(size) {
  const id = `sht-g${logoCount++}`;
  return `
    <svg class="logo-mark" viewBox="0 0 120 120" width="${size}" height="${size}" fill="none" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <defs>
        <linearGradient id="${id}" x1="0" y1="1" x2="1" y2="0">
          <stop offset="0" stop-color="#15803d"/><stop offset=".55" stop-color="#22c55e"/><stop offset="1" stop-color="#bbf7d0"/>
        </linearGradient>
      </defs>
      <circle cx="60" cy="60" r="52" stroke="url(#${id})" stroke-width="1.2" opacity=".55"/>
      <circle cx="60" cy="60" r="42" stroke="url(#${id})" stroke-width=".8" stroke-dasharray="2 5" opacity=".6"/>
      <path class="logo-arc" pathLength="1" d="M60 8 A52 52 0 1 1 14.97 86" stroke="url(#${id})" stroke-width="3"/>
      <circle class="logo-dot" cx="14.97" cy="86" r="3" fill="#bbf7d0" stroke="none"/>
      <rect x="35" y="38" width="50" height="44" rx="3.5" stroke="url(#${id})" stroke-width="1.8"/>
      <path d="M35 49h50M35 60.500h50M35 71.500h50M51 38v44M68 38v44" stroke="url(#${id})" stroke-width="1.2" opacity=".75"/>
      <rect x="51" y="60.500" width="17" height="11" stroke="url(#${id})" stroke-width="2.4"/>
      <circle cx="68" cy="71.500" r="2" fill="#bbf7d0" stroke="none"/>
    </svg>`;
}
document.querySelectorAll('[data-logo]').forEach((el) => { el.innerHTML = logoSVG(Number(el.dataset.logo)); });
document.getElementById('app-version').textContent = `Versión ${APP_VERSION}`;

// ---------- Utilidades ----------

const $ = (id) => document.getElementById(id);
const uid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const isTouch = matchMedia('(pointer: coarse)').matches;
function load(key, fallback) {
  try { const raw = localStorage.getItem(key); return raw ? JSON.parse(raw) : fallback; } catch (_) { return fallback; }
}
function save(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)); return true; } catch (_) { return false; }
}

// ---------- Almacén (IndexedDB) ----------
// meta: lista de libros (nombre, fecha, hojas). books: el contenido, que solo se lee al abrir.
let dbPromise = null;
function db() {
  dbPromise ||= new Promise((resolve, reject) => {
    const q = indexedDB.open('sheetctrl', 1);
    q.onupgradeneeded = () => { q.result.createObjectStore('meta', { keyPath: 'id' }); q.result.createObjectStore('books', { keyPath: 'id' }); };
    q.onsuccess = () => resolve(q.result);
    q.onerror = () => reject(q.error);
  });
  return dbPromise;
}
const idb = (store, mode, fn) => db().then((d) => new Promise((resolve, reject) => {
  const tx = d.transaction(store, mode);
  const r = fn(Array.isArray(store) ? store.map((s) => tx.objectStore(s)) : tx.objectStore(store));
  tx.oncomplete = () => resolve(r?.result);
  tx.onerror = () => reject(tx.error);
  tx.onabort = () => reject(tx.error);
}));
const listBooks = () => idb('meta', 'readonly', (s) => s.getAll());
const getBook = (id) => idb('books', 'readonly', (s) => s.get(id));
const putBook = (id, meta, data) => idb(['meta', 'books'], 'readwrite', ([m, b]) => { m.put({ id, ...meta }); b.put({ id, data }); });
const delBook = (id) => idb(['meta', 'books'], 'readwrite', ([m, b]) => { m.delete(id); b.delete(id); });

// Nube (CloudCTRL): opcional; el cliente está en cloud.js
const CLOUD_DELAY_MS = 6000;
const cloudAdapter = {
  kind: 'sheet',
  list: async () => (await listBooks()).map((b) => ({ id: b.id, upd: b.updated })),
  read: async (id) => {
    const [meta, row] = await Promise.all([listBooks().then((l) => l.find((b) => b.id === id)), getBook(id)]);
    return { name: meta.name, payload: row.data };
  },
  write: (id, name, data, upd) => putBook(id, { name, updated: upd, sheets: data.sheets.length }, data),
  remove: delBook,
  fork: async (id) => {
    const [meta, row] = await Promise.all([listBooks().then((l) => l.find((b) => b.id === id)), getBook(id)]);
    const name = `${meta.name} (otra versión)`;
    await putBook(uid(), { name, updated: Date.now(), sheets: meta.sheets }, { ...row.data, name });
  },
  busy: (id) => !!wb && bookId === id,
  done: (s) => {
    if (s.forked) toast('Había dos versiones de un libro: se han guardado las dos', { warn: true });
    if (s.tooLarge) toast('Un libro es demasiado grande para la nube', { warn: true });
    if (wb) return;
    if (s.down || s.removed || s.forked) renderHome();
    else updateCloudNote();
  },
};
function cloudNoteText() {
  if (!Cloud.account) return 'Se guardan en este dispositivo.';
  if (Cloud.status.state === 'error') return `${Cloud.status.error} Tus libros siguen en este dispositivo.`;
  return 'Se guardan aquí y en tu nube, cifrados.';
}
function updateCloudNote() {
  if ($('cloud-note')) $('cloud-note').textContent = cloudNoteText();
}
function openCloudSheet() {
  Cloud.accountSheet(newSheet(true), {
    title: 'libros', close: closeSheet, adapter: cloudAdapter, esc,
    onChange: () => { if (!wb) renderHome(); },
  });
}

function serializeWb(w) {
  return {
    name: w.name, styles: [...w.styles], names: { ...w.names },
    sheets: w.sheets.map((s) => {
      const cells = [];
      for (const [r, row] of s.cells) for (const [c, x] of row) cells.push([r, c, x.v, x.f, x.s]);
      return { id: s.id, name: s.name, cols: { ...s.cols }, rows: { ...s.rows }, merges: s.merges.map((m) => ({ ...m })), freeze: { ...s.freeze }, hidden: s.hidden, defW: s.defW, cells };
    }),
  };
}
// Los libros que llegan de otro dispositivo (nube) o de una copia se validan al cargar: solo pasan
// tipos, números y colores esperados, para que nada acabe interpretado como HTML o CSS.
const SAFE_ID = /^[A-Za-z0-9_-]{1,64}$/;
const HEX = /^#[0-9a-f]{6}$/i;
const BORDER_STYLES = new Set(['thin', 'medium', 'thick', 'dashed', 'dotted', 'double', 'hair', 'mediumDashed', 'dashDot', 'mediumDashDot', 'dashDotDot', 'slantDashDot']);
const int = (v, max) => (Number.isInteger(v) && v >= 0 && v <= max ? v : null);
const str = (v, max = 500) => (typeof v === 'string' ? v.slice(0, max) : '');
function cleanStyle(s) {
  const o = {};
  if (!s || typeof s !== 'object') return o;
  for (const k of ['b', 'i', 'u', 'st', 'wr']) if (s[k]) o[k] = 1;
  if (Number.isFinite(s.fs) && s.fs >= 1 && s.fs <= 409) o.fs = s.fs;
  if (typeof s.fn === 'string' && /^[\p{L}\p{N} ._-]{1,60}$/u.test(s.fn)) o.fn = s.fn;
  if (HEX.test(s.fc)) o.fc = s.fc;
  if (HEX.test(s.bg)) o.bg = s.bg;
  if (['left', 'center', 'right'].includes(s.ha)) o.ha = s.ha;
  if (['top', 'center'].includes(s.va)) o.va = s.va;
  if (typeof s.nf === 'string') o.nf = s.nf.slice(0, 255);
  if (s.bd && typeof s.bd === 'object') {
    const bd = {};
    for (const k of ['t', 'r', 'b', 'l']) {
      const x = s.bd[k];
      if (x && BORDER_STYLES.has(x.s)) bd[k] = { s: x.s, c: HEX.test(x.c) ? x.c : null };
    }
    if (Object.keys(bd).length) o.bd = bd;
  }
  return o;
}
function cleanValue(v) {
  if (typeof v === 'number') return Number.isFinite(v) ? v : undefined;
  if (typeof v === 'string') return v.slice(0, 32767);
  if (typeof v === 'boolean') return v;
  if (isErr(v) && typeof v.e === 'string') return errOf(v.e.slice(0, 12));
  return undefined;
}
function sizes(o, maxKey) {
  const out = {};
  if (o && typeof o === 'object') for (const [k, v] of Object.entries(o)) { const i = Number(k); if (int(i, maxKey) !== null && Number.isFinite(v) && v >= 0 && v <= 5000) out[i] = v; }
  return out;
}
function restoreWb(d) {
  const styles = Array.isArray(d.styles) && d.styles.length ? d.styles.map(cleanStyle) : [{}];
  styles[0] = styles[0] || {};
  const names = {};
  if (d.names && typeof d.names === 'object') for (const [k, v] of Object.entries(d.names)) if (/^[\p{L}_][\p{L}\p{N}_.]{0,254}$/u.test(k) && typeof v === 'string') names[k] = v.slice(0, 8192);
  const w = { name: str(d.name, 80) || 'Libro', styles, names, sheets: [] };
  for (const s of Array.isArray(d.sheets) ? d.sheets : []) {
    const sh = newSheetData(str(s.name, 31).replace(/[\\/?*[\]:]/g, '') || `Hoja${w.sheets.length + 1}`);
    if (SAFE_ID.test(s.id)) sh.id = s.id;
    sh.cols = sizes(s.cols, MAX_COLS - 1);
    sh.rows = sizes(s.rows, MAX_ROWS - 1);
    sh.merges = (Array.isArray(s.merges) ? s.merges : []).filter((m) => m && [m.r1, m.r2].every((x) => int(x, MAX_ROWS - 1) !== null) && [m.c1, m.c2].every((x) => int(x, MAX_COLS - 1) !== null) && m.r1 <= m.r2 && m.c1 <= m.c2).map((m) => ({ r1: m.r1, c1: m.c1, r2: m.r2, c2: m.c2 }));
    sh.freeze = { r: int(s.freeze?.r, 1000) ?? 0, c: int(s.freeze?.c, 1000) ?? 0 };
    if (s.hidden) sh.hidden = true;
    if (Number.isFinite(s.defW) && s.defW > 0 && s.defW <= 1000) sh.defW = s.defW;
    for (const cell of Array.isArray(s.cells) ? s.cells : []) {
      if (!Array.isArray(cell)) continue;
      const [r, c, v, f, st] = cell;
      if (int(r, MAX_ROWS - 1) === null || int(c, MAX_COLS - 1) === null) continue;
      const x = ensureCell(sh, r, c);
      const val = cleanValue(v);
      if (val !== undefined) x.v = val;
      if (typeof f === 'string') x.f = f.slice(0, 8192);
      if (int(st, styles.length - 1)) x.s = st;
    }
    w.sheets.push(sh);
  }
  if (!w.sheets.length) w.sheets.push(newSheetData('Hoja1'));
  return w;
}

// ---------- Estado del editor ----------
let wb = null, bookId = null, calc = null, si = 0;
let sel = { r1: 0, c1: 0, r2: 0, c2: 0, ar: 0, ac: 0 };
let edit = null;       // { r, c, si, typed, pick: {start, end} | null }
let clip = null;       // copia interna
let zoom = 1;
let undoStack = [], redoStack = [], dirty = false, saveTimer = 0;
const sheet = () => wb.sheets[si];
const styleOf = (cell) => wb.styles[cell?.s || 0] || {};

// ---------- Ayuda de funciones ----------
// Clave | categoría | argumentos | qué hace
const FN_DOC = `SUM|Matemáticas|número1; [número2]; …|Suma los valores
AVERAGE|Estadística|número1; [número2]; …|Media de los valores
COUNT|Estadística|valor1; [valor2]; …|Cuenta las casillas con números
COUNTA|Estadística|valor1; [valor2]; …|Cuenta las casillas no vacías
COUNTBLANK|Estadística|rango|Cuenta las casillas vacías
MIN|Estadística|número1; [número2]; …|Valor mínimo
MAX|Estadística|número1; [número2]; …|Valor máximo
MEDIAN|Estadística|número1; [número2]; …|Valor central
MODE|Estadística|número1; [número2]; …|Valor más repetido
STDEV|Estadística|número1; [número2]; …|Desviación típica de una muestra
STDEVP|Estadística|número1; [número2]; …|Desviación típica de la población
PRODUCT|Matemáticas|número1; [número2]; …|Multiplica los valores
ABS|Matemáticas|número|Valor absoluto
ROUND|Matemáticas|número; decimales|Redondea
ROUNDUP|Matemáticas|número; decimales|Redondea hacia arriba
ROUNDDOWN|Matemáticas|número; decimales|Redondea hacia abajo
INT|Matemáticas|número|Redondea hacia abajo al entero
TRUNC|Matemáticas|número; [decimales]|Quita los decimales
CEILING|Matemáticas|número; múltiplo|Múltiplo superior más cercano
FLOOR|Matemáticas|número; múltiplo|Múltiplo inferior más cercano
MOD|Matemáticas|número; divisor|Resto de la división
POWER|Matemáticas|número; potencia|Eleva a una potencia
SQRT|Matemáticas|número|Raíz cuadrada
EXP|Matemáticas|número|e elevado a un número
LN|Matemáticas|número|Logaritmo natural
LOG|Matemáticas|número; [base]|Logaritmo
LOG10|Matemáticas|número|Logaritmo en base 10
PI|Matemáticas||Número pi
RAND|Matemáticas||Aleatorio entre 0 y 1
RANDBETWEEN|Matemáticas|inferior; superior|Entero aleatorio entre dos valores
SIGN|Matemáticas|número|Signo: 1, 0 o -1
SUMIF|Condicionales|rango; criterio; [rango_suma]|Suma lo que cumple un criterio
SUMIFS|Condicionales|rango_suma; rango1; criterio1; …|Suma lo que cumple varios criterios
COUNTIF|Condicionales|rango; criterio|Cuenta lo que cumple un criterio
COUNTIFS|Condicionales|rango1; criterio1; …|Cuenta lo que cumple varios criterios
AVERAGEIF|Condicionales|rango; criterio; [rango_promedio]|Media de lo que cumple un criterio
AVERAGEIFS|Condicionales|rango_promedio; rango1; criterio1; …|Media con varios criterios
MAXIFS|Condicionales|rango_max; rango1; criterio1; …|Máximo con criterios
MINIFS|Condicionales|rango_min; rango1; criterio1; …|Mínimo con criterios
SUMPRODUCT|Matemáticas|matriz1; [matriz2]; …|Suma de productos
LARGE|Estadística|matriz; k|El k-ésimo mayor
SMALL|Estadística|matriz; k|El k-ésimo menor
RANK|Estadística|número; referencia; [orden]|Posición en una lista
PERCENTILE|Estadística|matriz; k|Percentil
QUARTILE|Estadística|matriz; cuartil|Cuartil
SUBTOTAL|Matemáticas|función; rango|Subtotal (9 = suma, 1 = media…)
IF|Lógica|prueba; si_verdadero; [si_falso]|Elige según una condición
IFS|Lógica|prueba1; valor1; [prueba2]; …|Primera condición que se cumple
IFERROR|Lógica|valor; si_error|Valor alternativo si hay error
IFNA|Lógica|valor; si_nd|Valor alternativo si da #N/D
AND|Lógica|valor1; [valor2]; …|Verdadero si se cumple todo
OR|Lógica|valor1; [valor2]; …|Verdadero si se cumple algo
NOT|Lógica|valor|Invierte verdadero y falso
XOR|Lógica|valor1; [valor2]; …|Verdadero si se cumple un número impar
SWITCH|Lógica|expresión; valor1; resultado1; …; [otro]|Elige por coincidencia
ISBLANK|Lógica|valor|¿Está vacía?
ISNUMBER|Lógica|valor|¿Es un número?
ISTEXT|Lógica|valor|¿Es texto?
ISERROR|Lógica|valor|¿Es un error?
CONCAT|Texto|texto1; [texto2]; …|Une textos
CONCATENATE|Texto|texto1; [texto2]; …|Une textos
TEXTJOIN|Texto|separador; ignorar_vacías; texto1; …|Une textos con separador
LEFT|Texto|texto; [n]|Caracteres del principio
RIGHT|Texto|texto; [n]|Caracteres del final
MID|Texto|texto; inicio; n|Caracteres del medio
LEN|Texto|texto|Número de caracteres
UPPER|Texto|texto|En mayúsculas
LOWER|Texto|texto|En minúsculas
PROPER|Texto|texto|Iniciales en mayúscula
TRIM|Texto|texto|Quita espacios sobrantes
SUBSTITUTE|Texto|texto; antiguo; nuevo; [aparición]|Cambia un texto por otro
REPLACE|Texto|texto; inicio; n; nuevo|Cambia caracteres por posición
FIND|Texto|buscado; texto; [inicio]|Posición (distingue mayúsculas)
SEARCH|Texto|buscado; texto; [inicio]|Posición (admite * y ?)
REPT|Texto|texto; veces|Repite un texto
TEXT|Texto|valor; formato|Número o fecha como texto
VALUE|Texto|texto|Texto como número
EXACT|Texto|texto1; texto2|¿Son idénticos?
TODAY|Fechas||Fecha de hoy
NOW|Fechas||Fecha y hora actuales
DATE|Fechas|año; mes; día|Crea una fecha
TIME|Fechas|hora; minuto; segundo|Crea una hora
YEAR|Fechas|fecha|Año
MONTH|Fechas|fecha|Mes
DAY|Fechas|fecha|Día
HOUR|Fechas|hora|Hora
MINUTE|Fechas|hora|Minuto
SECOND|Fechas|hora|Segundo
WEEKDAY|Fechas|fecha; [tipo]|Día de la semana (tipo 2: lunes = 1)
WEEKNUM|Fechas|fecha; [tipo]|Número de semana
DAYS|Fechas|fin; inicio|Días entre dos fechas
DATEDIF|Fechas|inicio; fin; unidad|Diferencia en "Y", "M" o "D"
EDATE|Fechas|fecha; meses|Suma meses
EOMONTH|Fechas|fecha; meses|Último día del mes
NETWORKDAYS|Fechas|inicio; fin; [festivos]|Días laborables entre dos fechas
WORKDAY|Fechas|inicio; días; [festivos]|Fecha tras n días laborables
VLOOKUP|Búsqueda|valor; matriz; columna; [aproximado]|Busca en la primera columna
HLOOKUP|Búsqueda|valor; matriz; fila; [aproximado]|Busca en la primera fila
XLOOKUP|Búsqueda|valor; matriz_buscar; matriz_devolver; [si_no]|Busca y devuelve
INDEX|Búsqueda|matriz; fila; [columna]|Valor en una posición
MATCH|Búsqueda|valor; matriz; [tipo]|Posición de un valor (0 = exacto)
LOOKUP|Búsqueda|valor; vector; [resultado]|Busca en una lista ordenada
CHOOSE|Búsqueda|índice; valor1; [valor2]; …|Elige de una lista
ROW|Búsqueda|[referencia]|Número de fila
COLUMN|Búsqueda|[referencia]|Número de columna
ROWS|Búsqueda|matriz|Filas de un rango
COLUMNS|Búsqueda|matriz|Columnas de un rango
OFFSET|Búsqueda|ref; filas; columnas; [alto]; [ancho]|Rango desplazado
INDIRECT|Búsqueda|texto|Referencia a partir de un texto
PMT|Finanzas|tasa; nper; va; [vf]; [tipo]|Cuota de un préstamo
FV|Finanzas|tasa; nper; pago; [va]; [tipo]|Valor futuro
PV|Finanzas|tasa; nper; pago; [vf]; [tipo]|Valor actual
NPER|Finanzas|tasa; pago; va; [vf]; [tipo]|Número de periodos
RATE|Finanzas|nper; pago; va; [vf]; [tipo]|Tipo de interés
IPMT|Finanzas|tasa; periodo; nper; va|Intereses de una cuota
PPMT|Finanzas|tasa; periodo; nper; va|Capital de una cuota
NPV|Finanzas|tasa; valor1; [valor2]; …|Valor actual neto
IRR|Finanzas|valores; [estimación]|Tasa interna de retorno`.split('\n').map((l) => {
  const [key, cat, args, text] = l.split('|');
  return { key, cat, args, text, es: FN_ES[key] || key };
});
const CATS = ['Matemáticas', 'Condicionales', 'Estadística', 'Lógica', 'Texto', 'Fechas', 'Búsqueda', 'Finanzas'];

// ---------- Geometría de la rejilla ----------
const DEF_W = 80, DEF_H = 20, HEAD_H = 24;
const FONT = 'Calibri, Carlito, -apple-system, system-ui, sans-serif';
let HEAD_W = 44;
let nRows = 1000, nCols = 52;
let colPos = new Float64Array(1), rowPos = new Float64Array(1);
const cv = () => $('grid'), scroller = () => $('scroller');

function buildLayout() {
  const sh = sheet();
  const u = usedRange(sh);
  const full = (sel.r2 - sel.r1 > 5000) || (sel.c2 - sel.c1 > 2000);
  nRows = Math.min(MAX_ROWS, Math.max(1000, u.r2 + 200, full ? 0 : sel.r2 + 60));
  nCols = Math.min(MAX_COLS, Math.max(52, u.c2 + 12, full ? 0 : sel.c2 + 12));
  colPos = new Float64Array(nCols + 1);
  rowPos = new Float64Array(nRows + 1);
  for (let c = 0; c < nCols; c++) colPos[c + 1] = colPos[c] + (sh.cols[c] ?? sh.defW ?? DEF_W) * zoom;
  for (let r = 0; r < nRows; r++) rowPos[r + 1] = rowPos[r] + (sh.rows[r] ?? DEF_H) * zoom;
  HEAD_W = nRows > 9999 ? 56 : 44;
  $('sizer').style.width = `${HEAD_W + colPos[nCols]}px`;
  $('sizer').style.height = `${HEAD_H + rowPos[nRows]}px`;
}
const fr = () => sheet().freeze || { r: 0, c: 0 };
const frozenW = () => colPos[Math.min(fr().c, nCols)];
const frozenH = () => rowPos[Math.min(fr().r, nRows)];
const xOf = (c) => { const f = fr().c; return c < f ? HEAD_W + colPos[c] : HEAD_W + frozenW() + colPos[Math.min(c, nCols)] - colPos[f] - scroller().scrollLeft; };
const yOf = (r) => { const f = fr().r; return r < f ? HEAD_H + rowPos[r] : HEAD_H + frozenH() + rowPos[Math.min(r, nRows)] - rowPos[f] - scroller().scrollTop; };
function search(pos, v, n) {
  let a = 0, b = n - 1;
  while (a < b) { const m = (a + b + 1) >> 1; if (pos[m] <= v) a = m; else b = m - 1; }
  return a;
}
function colAt(x) {
  const f = fr().c;
  if (f && x < HEAD_W + frozenW()) return search(colPos, Math.max(0, x - HEAD_W), nCols);
  return search(colPos, Math.max(0, x - HEAD_W - frozenW()) + scroller().scrollLeft + colPos[f], nCols);
}
function rowAt(y) {
  const f = fr().r;
  if (f && y < HEAD_H + frozenH()) return search(rowPos, Math.max(0, y - HEAD_H), nRows);
  return search(rowPos, Math.max(0, y - HEAD_H - frozenH()) + scroller().scrollTop + rowPos[f], nRows);
}
const mergeAt = (r, c) => sheet().merges.find((m) => r >= m.r1 && r <= m.r2 && c >= m.c1 && c <= m.c2);

// ---------- Pintado ----------
let pal = {}, drawQueued = false;
function readPalette() {
  const s = getComputedStyle(document.documentElement);
  const g = (n) => s.getPropertyValue(n).trim();
  pal = {
    bg: g('--cell'), grid: g('--grid'), text: g('--text'), head: g('--head'), headOn: g('--head-on'), muted: g('--muted'), accent: g('--sel'),
    dark: document.documentElement.dataset.theme !== 'light',
  };
}
function schedule() {
  if (drawQueued) return;
  drawQueued = true;
  requestAnimationFrame(() => { drawQueued = false; draw(); });
}
function lum(hex) {
  const n = parseInt(hex.slice(1), 16);
  return (0.299 * (n >> 16) + 0.587 * ((n >> 8) & 255) + 0.114 * (n & 255)) / 255;
}
// Excel mide las columnas con dígitos de 7 px (Calibri 11). Sin Calibri, la letra del sistema es más
// ancha: se reduce un poco para que lo que cabe en Excel quepa aquí, en la misma columna.
let fontScale = 0;
function fontFit() {
  if (!fontScale) {
    const ctx = cv().getContext('2d');
    ctx.font = `${11 * 4 / 3}px ${FONT}`;
    fontScale = Math.min(1, 7.1 / (ctx.measureText('0000000000').width / 10));
  }
  return fontScale;
}
function fontOf(st) {
  return `${st.i ? 'italic ' : ''}${st.b ? 'bold ' : ''}${((st.fs || 11) * 4 / 3 * zoom * fontFit()).toFixed(2)}px ${st.fn ? `"${st.fn}", ` : ''}${FONT}`;
}
function textColor(st, fmtColor) {
  if (fmtColor) return fmtColor;
  if (st.fc) {
    if (pal.dark && !st.bg && lum(st.fc) < 0.3) return pal.text;
    if (!pal.dark && !st.bg && lum(st.fc) > 0.92) return pal.text;
    return st.fc;
  }
  if (st.bg) return lum(st.bg) > 0.55 ? '#111111' : '#f5f5f5';
  return pal.text;
}
function wrapLines(ctx, text, width) {
  const out = [];
  for (const para of String(text).split('\n')) {
    let line = '';
    for (const word of para.split(' ')) {
      const t = line ? `${line} ${word}` : word;
      if (ctx.measureText(t).width > width && line) { out.push(line); line = word; } else line = t;
    }
    out.push(line);
  }
  return out;
}
function drawText(ctx, st, shown, v, x, y, w, h, clipRight) {
  const text = shown.text;
  if (text === '') return;
  const pad = 3 * zoom;
  ctx.font = fontOf(st);
  ctx.fillStyle = shown.error ? '#e5484d' : textColor(st, shown.color);
  const ha = st.ha || (typeof v === 'number' ? 'right' : typeof v === 'boolean' || shown.error ? 'center' : 'left');
  const fs = (st.fs || 11) * 4 / 3 * zoom * fontFit();
  const lh = fs * 1.2;
  let lines;
  if (st.wr || text.includes('\n')) lines = st.wr ? wrapLines(ctx, text, w - pad * 2) : [text.replace(/\n/g, ' ')];
  else lines = [text];
  if (typeof v === 'number' && !st.wr && ctx.measureText(text).width > w - 2) {
    // Un número que no cabe: en General se ajustan decimales, y si no, almohadillas
    lines = ['#'.repeat(Math.max(1, Math.floor(w / (fs * 0.55))))];
  }
  const total = lines.length * lh;
  const top = st.va === 'top' ? y + 1 : st.va === 'center' ? y + (h - total) / 2 : y + h - total - 1;
  ctx.textBaseline = 'alphabetic';
  ctx.save();
  ctx.beginPath();
  ctx.rect(ha === 'left' ? x : x, y, ha === 'left' ? Math.max(w, clipRight - x) : w, h);
  ctx.clip();
  lines.forEach((ln, i) => {
    const tw = ctx.measureText(ln).width;
    const tx = ha === 'right' ? x + w - pad - tw : ha === 'center' ? x + (w - tw) / 2 : x + pad;
    const ty = top + lh * (i + 1) - lh * 0.22;
    ctx.fillText(ln, tx, ty);
    if (st.u || st.st) {
      ctx.fillRect(tx, st.u ? ty + 1.5 : ty - fs * 0.3, tw, Math.max(1, zoom));
    }
  });
  ctx.restore();
}
function borderLine(ctx, b, x1, y1, x2, y2) {
  if (!b) return;
  const w = { thick: 3, medium: 2 }[b.s] || 1;
  ctx.strokeStyle = b.c ? b.c : (pal.dark ? '#d4d4d4' : '#222222');
  ctx.lineWidth = w;
  ctx.setLineDash(b.s === 'dashed' ? [4, 3] : b.s === 'dotted' ? [1, 2] : []);
  ctx.beginPath();
  ctx.moveTo(Math.round(x1) + (w % 2) / 2, Math.round(y1) + (w % 2) / 2);
  ctx.lineTo(Math.round(x2) + (w % 2) / 2, Math.round(y2) + (w % 2) / 2);
  ctx.stroke();
  ctx.setLineDash([]);
}
function drawPane(ctx, px, py, pw, ph, r1, r2, c1, c2) {
  if (pw <= 0 || ph <= 0 || r1 > r2 || c1 > c2) return;
  const sh = sheet();
  ctx.save();
  ctx.beginPath();
  ctx.rect(px, py, pw, ph);
  ctx.clip();
  // Rejilla
  ctx.strokeStyle = pal.grid;
  ctx.lineWidth = 1;
  ctx.beginPath();
  for (let c = c1; c <= c2 + 1; c++) { const x = Math.round(xOf(c)) - 0.5; ctx.moveTo(x, py); ctx.lineTo(x, py + ph); }
  for (let r = r1; r <= r2 + 1; r++) { const y = Math.round(yOf(r)) - 0.5; ctx.moveTo(px, y); ctx.lineTo(px + pw, y); }
  ctx.stroke();
  // Fondos
  const merged = new Set();
  const inView = sh.merges.filter((m) => m.r2 >= r1 && m.r1 <= r2 && m.c2 >= c1 && m.c1 <= c2);
  const covered = (r, c) => inView.some((m) => r >= m.r1 && r <= m.r2 && c >= m.c1 && c <= m.c2);
  const rowsIn = [];
  for (let r = r1; r <= r2; r++) if (sh.cells.has(r)) rowsIn.push(r);
  for (const r of rowsIn) {
    for (const [c, cell] of sh.cells.get(r)) {
      if (c < c1 || c > c2 || !cell.s) continue;
      const st = wb.styles[cell.s];
      if (st?.bg && !covered(r, c)) { ctx.fillStyle = st.bg; ctx.fillRect(xOf(c) - 1, yOf(r) - 1, xOf(c + 1) - xOf(c) + 1, yOf(r + 1) - yOf(r) + 1); }
    }
  }
  for (const m of inView) {
    const st = styleOf(getCell(sh, m.r1, m.c1));
    ctx.fillStyle = st.bg || pal.bg;
    ctx.fillRect(xOf(m.c1), yOf(m.r1), xOf(m.c2 + 1) - xOf(m.c1) - 1, yOf(m.r2 + 1) - yOf(m.r1) - 1);
    merged.add(`${m.r1},${m.c1}`);
  }
  // Bordes
  for (const r of rowsIn) {
    for (const [c, cell] of sh.cells.get(r)) {
      if (c < c1 - 1 || c > c2 + 1 || !cell.s) continue;
      const bd = wb.styles[cell.s]?.bd;
      if (!bd) continue;
      const x = xOf(c) - 1, y = yOf(r) - 1, X = xOf(c + 1) - 1, Y = yOf(r + 1) - 1;
      borderLine(ctx, bd.t, x, y, X, y);
      borderLine(ctx, bd.b, x, Y, X, Y);
      borderLine(ctx, bd.l, x, y, x, Y);
      borderLine(ctx, bd.r, X, y, X, Y);
    }
  }
  // Texto
  const lastX = xOf(c2 + 1);
  for (const r of rowsIn) {
    const row = sh.cells.get(r);
    for (const [c, cell] of row) {
      if (c < c1 - 40 || c > c2) continue;
      if (edit && edit.si === si && edit.r === r && edit.c === c && !isTouch) continue;
      if (covered(r, c) && !merged.has(`${r},${c}`)) continue;
      const v = calc.safe(si, r, c);
      if (v === undefined || v === '') continue;
      const st = wb.styles[cell.s || 0] || {};
      const shown = displayValue(v, st.nf);
      const m = merged.has(`${r},${c}`) ? inView.find((q) => q.r1 === r && q.c1 === c) : null;
      const x = xOf(c), y = yOf(r);
      const w = (m ? xOf(m.c2 + 1) : xOf(c + 1)) - x, h = (m ? yOf(m.r2 + 1) : yOf(r + 1)) - y;
      let clipRight = x + w;
      if (typeof v === 'string' && !st.wr && !m && (!st.ha || st.ha === 'left')) {
        let n = c + 1;
        while (n <= c2 + 1 && getCell(sh, r, n)?.v === undefined && getCell(sh, r, n)?.f === undefined && !covered(r, n)) n++;
        clipRight = Math.min(xOf(n), lastX);
      }
      drawText(ctx, st, shown, v, x, y, w - 1, h - 1, clipRight);
    }
  }
  drawOverlays(ctx);
  ctx.restore();
}
function rangeBox(x) {
  const a = xOf(x.c1), b = yOf(x.r1);
  return { x: a - 1, y: b - 1, w: xOf(Math.min(x.c2 + 1, nCols)) - a, h: yOf(Math.min(x.r2 + 1, nRows)) - b };
}
const REF_COLORS = ['#3b82f6', '#ef4444', '#a855f7', '#f59e0b', '#14b8a6', '#ec4899'];
function formulaRefs(text) {
  if (!text.startsWith('=')) return [];
  try {
    return tokenize(text.slice(1), true).filter((t) => t.type === 'ref' && (t.sheet === undefined ? edit.si === si : t.sheet.toLowerCase() === sheet().name.toLowerCase()));
  } catch (_) { return []; }
}
function drawOverlays(ctx) {
  // Referencias de la fórmula en edición
  if (edit) {
    formulaRefs(curText()).forEach((t, i) => {
      const b = t.b || t.a;
      const box = rangeBox({ r1: Math.min(t.a.r, b.r), c1: Math.min(t.a.c, b.c), r2: Math.min(Math.max(t.a.r, b.r), nRows - 1), c2: Math.min(Math.max(t.a.c, b.c), nCols - 1) });
      const col = REF_COLORS[i % REF_COLORS.length];
      ctx.fillStyle = `${col}22`;
      ctx.fillRect(box.x, box.y, box.w, box.h);
      ctx.strokeStyle = col;
      ctx.lineWidth = 1.5;
      ctx.strokeRect(box.x + 0.5, box.y + 0.5, box.w, box.h);
    });
  }
  // Selección
  if (!edit || edit.si === si) {
    const box = rangeBox(sel);
    const multi = sel.r1 !== sel.r2 || sel.c1 !== sel.c2;
    if (multi && !edit) {
      // Todo el rango tintado menos la casilla activa
      const m = mergeAt(sel.ar, sel.ac);
      const a = rangeBox(m || { r1: sel.ar, c1: sel.ac, r2: sel.ar, c2: sel.ac });
      ctx.fillStyle = `${pal.accent}22`;
      ctx.beginPath();
      ctx.rect(box.x, box.y, box.w, box.h);
      ctx.rect(a.x, a.y, a.w, a.h);
      ctx.fill('evenodd');
    }
    ctx.strokeStyle = pal.accent;
    ctx.lineWidth = 2;
    ctx.strokeRect(box.x + 0.5, box.y + 0.5, box.w, box.h);
    if (!edit) {
      const hx = box.x + box.w + 0.5, hy = box.y + box.h + 0.5;
      ctx.fillStyle = pal.accent;
      ctx.strokeStyle = pal.bg;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      if (isTouch) ctx.arc(hx, hy, 7, 0, 7);
      else ctx.rect(hx - 3.5, hy - 3.5, 7, 7);
      ctx.fill();
      ctx.stroke();
    }
  }
  // Rango copiado
  if (clip && clip.si === si && clip.show) {
    const b = rangeBox(clip.range);
    ctx.strokeStyle = pal.accent;
    ctx.lineWidth = 1.5;
    ctx.setLineDash([5, 4]);
    ctx.strokeRect(b.x + 0.5, b.y + 0.5, b.w, b.h);
    ctx.setLineDash([]);
  }
}
function drawHeaders(ctx, W, H, firstC, lastC, firstR, lastR) {
  const f = fr();
  const fw = frozenW(), fh = frozenH();
  ctx.font = `${Math.round(12)}px -apple-system, system-ui, sans-serif`;
  ctx.textBaseline = 'middle';
  ctx.textAlign = 'center';
  const cols = (from, to, clipX, clipW) => {
    ctx.save();
    ctx.beginPath();
    ctx.rect(clipX, 0, clipW, HEAD_H);
    ctx.clip();
    for (let c = from; c <= to; c++) {
      const w = sheet().cols[c] ?? 1;
      if (!w) continue;
      const x = xOf(c), X = xOf(c + 1);
      const on = c >= sel.c1 && c <= sel.c2;
      ctx.fillStyle = on ? pal.headOn : pal.head;
      ctx.fillRect(x, 0, X - x, HEAD_H);
      ctx.fillStyle = on ? pal.accent : pal.muted;
      ctx.fillText(colName(c), (x + X) / 2, HEAD_H / 2 + 0.5);
      ctx.fillStyle = pal.grid;
      ctx.fillRect(Math.round(X) - 1, 0, 1, HEAD_H);
    }
    ctx.restore();
  };
  ctx.fillStyle = pal.head;
  ctx.fillRect(0, 0, W, HEAD_H);
  ctx.fillRect(0, 0, HEAD_W, H);
  cols(firstC, lastC, HEAD_W + fw, W - HEAD_W - fw);
  if (f.c) cols(0, f.c - 1, HEAD_W, fw);
  const rows = (from, to, clipY, clipH) => {
    ctx.save();
    ctx.beginPath();
    ctx.rect(0, clipY, HEAD_W, clipH);
    ctx.clip();
    for (let r = from; r <= to; r++) {
      if (sheet().rows[r] === 0) continue;
      const y = yOf(r), Y = yOf(r + 1);
      const on = r >= sel.r1 && r <= sel.r2;
      ctx.fillStyle = on ? pal.headOn : pal.head;
      ctx.fillRect(0, y, HEAD_W, Y - y);
      ctx.fillStyle = on ? pal.accent : pal.muted;
      ctx.fillText(String(r + 1), HEAD_W / 2, (y + Y) / 2 + 0.5);
      ctx.fillStyle = pal.grid;
      ctx.fillRect(0, Math.round(Y) - 1, HEAD_W, 1);
    }
    ctx.restore();
  };
  rows(firstR, lastR, HEAD_H + fh, H - HEAD_H - fh);
  if (f.r) rows(0, f.r - 1, HEAD_H, fh);
  ctx.textAlign = 'left';
  ctx.fillStyle = pal.grid;
  ctx.fillRect(0, HEAD_H - 1, W, 1);
  ctx.fillRect(HEAD_W - 1, 0, 1, H);
  ctx.fillStyle = pal.head;
  ctx.fillRect(0, 0, HEAD_W - 1, HEAD_H - 1);
  ctx.fillStyle = pal.muted;
  ctx.beginPath();
  ctx.moveTo(HEAD_W - 5, HEAD_H - 5); ctx.lineTo(HEAD_W - 13, HEAD_H - 5); ctx.lineTo(HEAD_W - 5, HEAD_H - 13);
  ctx.fill();
}
function draw() {
  if (!wb || $('editor').hidden) return;
  const canvas = cv(), wrap = $('grid-wrap');
  const W = wrap.clientWidth, H = wrap.clientHeight, dpr = window.devicePixelRatio || 1;
  if (canvas.width !== Math.round(W * dpr) || canvas.height !== Math.round(H * dpr)) {
    canvas.width = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);
    canvas.style.width = `${W}px`;
    canvas.style.height = `${H}px`;
  }
  const ctx = canvas.getContext('2d');
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.fillStyle = pal.bg;
  ctx.fillRect(0, 0, W, H);
  const f = fr(), fw = frozenW(), fh = frozenH();
  const sc = scroller();
  const firstC = search(colPos, sc.scrollLeft + colPos[f.c], nCols);
  const firstR = search(rowPos, sc.scrollTop + rowPos[f.r], nRows);
  const lastC = Math.min(nCols - 1, colAt(W));
  const lastR = Math.min(nRows - 1, rowAt(H));
  const bx = HEAD_W + fw, by = HEAD_H + fh;
  drawPane(ctx, bx, by, W - bx, H - by, firstR, lastR, firstC, lastC);
  if (f.r) drawPane(ctx, bx, HEAD_H, W - bx, fh, 0, f.r - 1, firstC, lastC);
  if (f.c) drawPane(ctx, HEAD_W, by, fw, H - by, firstR, lastR, 0, f.c - 1);
  if (f.r && f.c) drawPane(ctx, HEAD_W, HEAD_H, fw, fh, 0, f.r - 1, 0, f.c - 1);
  if (f.r || f.c) {
    ctx.fillStyle = pal.accent;
    ctx.globalAlpha = 0.6;
    if (f.r) ctx.fillRect(HEAD_W, by - 1, W, 1.5);
    if (f.c) ctx.fillRect(bx - 1, HEAD_H, 1.5, H);
    ctx.globalAlpha = 1;
  }
  drawHeaders(ctx, W, H, firstC, lastC, firstR, lastR);
  placeCellEditor();
}

// ---------- Cambios y deshacer ----------
const CELL_FIELDS = (c) => (c ? { v: c.v, f: c.f, s: c.s } : null);
let tx = null;
function begin() { tx = { cells: new Map(), si, selBefore: { ...sel } }; }
function touch(r, c, targetSi = si) {
  const k = `${targetSi}:${r}:${c}`;
  if (tx && !tx.cells.has(k)) tx.cells.set(k, CELL_FIELDS(getCell(wb.sheets[targetSi], r, c)));
}
function commitTx() {
  if (!tx) return;
  if (tx.cells.size) {
    const changes = [];
    for (const [k, before] of tx.cells) {
      const [s, r, c] = k.split(':').map(Number);
      changes.push({ s, r, c, before, after: CELL_FIELDS(getCell(wb.sheets[s], r, c)) });
    }
    pushUndo({ changes, sel: tx.selBefore, si: tx.si });
    afterChange();
  }
  tx = null;
}
function pushUndo(e) {
  undoStack.push(e);
  redoStack = [];
  // Máximo 200 pasos y 10 copias enteras del libro
  if (undoStack.length > 200) undoStack.shift();
  const snaps = undoStack.filter((x) => x.snap);
  if (snaps.length > 10) undoStack.splice(undoStack.indexOf(snaps[0]), 1);
}
// Cambios de estructura (insertar, combinar, hojas…): copia del libro entero antes de tocarlo
function structural(fn) {
  const snap = serializeWb(wb);
  fn();
  pushUndo({ snap, sel: { ...sel }, si });
  calc.indexSheets();
  afterChange(true);
}
function applyEntry(e, dir) {
  if (e.snap) {
    const now = serializeWb(wb);
    wb = { ...restoreWb(e.snap), styleMap: null };
    calc = new Calc(wb);
    si = Math.min(e.si, wb.sheets.length - 1);
    sel = { ...e.sel };
    return { snap: now, sel: e.sel, si: e.si };
  }
  for (const x of e.changes) {
    const v = dir < 0 ? x.before : x.after;
    if (!v || (v.v === undefined && v.f === undefined && !v.s)) dropCell(wb.sheets[x.s], x.r, x.c);
    else {
      const cell = ensureCell(wb.sheets[x.s], x.r, x.c);
      delete cell.g;
      cell.v = v.v; cell.f = v.f; cell.s = v.s;
      if (v.v === undefined) delete cell.v;
      if (v.f === undefined) delete cell.f;
      if (!v.s) delete cell.s;
    }
  }
  si = e.si;
  sel = { ...e.sel };
  return e;
}
function undo() {
  if (edit) return;
  const e = undoStack.pop();
  if (!e) return;
  redoStack.push(applyEntry(e, -1));
  afterChange(true);
}
function redo() {
  if (edit) return;
  const e = redoStack.pop();
  if (!e) return;
  undoStack.push(applyEntry(e, 1));
  afterChange(true);
}
function afterChange(layout = true) {
  calc.invalidate();
  if (layout) buildLayout();
  markDirty();
  renderChrome();
  schedule();
}
function markDirty() {
  dirty = true;
  $('save-state').textContent = 'Guardando…';
  clearTimeout(saveTimer);
  saveTimer = setTimeout(flush, 700);
}
async function flush() {
  clearTimeout(saveTimer);
  if (!dirty || !wb) return;
  dirty = false;
  const data = serializeWb(wb);
  try {
    await putBook(bookId, { name: wb.name, updated: Date.now(), sheets: wb.sheets.length }, data);
    $('save-state').textContent = 'Guardado';
    Cloud.schedule(cloudAdapter, CLOUD_DELAY_MS);
  } catch (_) {
    dirty = true;
    $('save-state').textContent = 'Sin guardar';
    toast('No se ha podido guardar: el dispositivo no tiene espacio', { warn: true });
  }
}
document.addEventListener('visibilitychange', () => {
  if (document.hidden) flush();
  Cloud.schedule(cloudAdapter, document.hidden ? 0 : 300);
});
window.addEventListener('pagehide', flush);

// ---------- Escribir en casillas ----------
function writeCell(r, c, fields, targetSi = si) {
  touch(r, c, targetSi);
  const sh = wb.sheets[targetSi];
  if (fields.v === undefined && fields.f === undefined && !fields.s) { dropCell(sh, r, c); return; }
  const cell = ensureCell(sh, r, c);
  delete cell.g;
  for (const k of ['v', 'f', 's']) { if (fields[k] === undefined) delete cell[k]; else cell[k] = fields[k]; }
}
function setStyleIndex(s, patch) {
  const st = { ...(wb.styles[s || 0] || {}), ...patch };
  for (const k of Object.keys(st)) if (st[k] === undefined || st[k] === null || st[k] === 0 || st[k] === '') delete st[k];
  return internStyle(wb, st);
}
const DATE_FNS = new Set(['TODAY', 'DATE', 'EDATE', 'EOMONTH', 'WORKDAY']);
// Convierte lo escrito; devuelve false si la fórmula no es válida
function enterValue(r, c, raw) {
  const old = getCell(sheet(), r, c);
  const st = styleOf(old);
  const text = String(raw);
  if (text === '') { writeCell(r, c, { s: old?.s }); return true; }
  if (/^=./s.test(text)) {
    let body = text.slice(1);
    const open = (body.replace(/"[^"]*"/g, '').match(/\(/g) || []).length - (body.replace(/"[^"]*"/g, '').match(/\)/g) || []).length;
    if (open > 0) body += ')'.repeat(open);
    let f;
    try { f = fromLocal(body); } catch (_) { return false; }
    const ast = parseFormula(f);
    if (!ast) return false;
    let s = old?.s;
    if (!st.nf && ast.t === 'fn') {
      if (DATE_FNS.has(ast.name)) s = setStyleIndex(s, { nf: 'dd/mm/yyyy' });
      else if (ast.name === 'NOW') s = setStyleIndex(s, { nf: 'dd/mm/yyyy hh:mm' });
    }
    writeCell(r, c, { f, s, v: hasUnknown(ast) ? E['#NAME?'] : undefined });
    return true;
  }
  if (text[0] === "'") { writeCell(r, c, { v: text.slice(1), s: old?.s }); return true; }
  if (st.nf === '@') { writeCell(r, c, { v: text, s: old?.s }); return true; }
  const p = parseInput(text);
  let s = old?.s;
  if (p.nf && !st.nf) s = setStyleIndex(s, { nf: p.nf });
  writeCell(r, c, { v: p.v, s });
  return true;
}

// ---------- Edición ----------
const fxEl = () => $('fx');
const cellEl = () => $('cell-edit');
const activeInput = () => (document.activeElement === cellEl() ? cellEl() : fxEl());
const curText = () => activeInput().value;
function startEdit(initial, opts = {}) {
  if (edit) return;
  const { ar: r, ac: c } = sel;
  const cell = getCell(sheet(), r, c);
  const text = initial !== undefined ? initial : editText(cell, styleOf(cell).nf);
  edit = { r, c, si, typed: initial !== undefined, pick: null };
  fxEl().value = text;
  cellEl().value = text;
  const useBar = isTouch || opts.bar;
  if (useBar) { cellEl().hidden = true; fxEl().focus(); } else { cellEl().hidden = false; placeCellEditor(); cellEl().focus(); }
  const inp = activeInput();
  inp.setSelectionRange(text.length, text.length);
  $('quick').hidden = !isTouch;
  renderChrome();
  schedule();
  resizeSoon();
}
function endEdit() {
  edit = null;
  cellEl().hidden = true;
  $('quick').hidden = true;
  closeAssist();
  cellEl().blur();
  fxEl().blur();
  resizeSoon();
}
function commitEdit(dr = 0, dc = 0) {
  if (!edit) return true;
  const { r, c } = edit;
  const backSi = edit.si;
  const text = curText();
  if (si !== backSi) { si = backSi; renderTabs(); buildLayout(); }
  begin();
  const ok = enterValue(r, c, text);
  if (!ok) {
    tx = null;
    toast('Esa fórmula no es válida', { warn: true });
    activeInput().focus();
    return false;
  }
  endEdit();
  autoRowHeight(r);
  commitTx();
  widenForNumber(r, c);
  if (dr || dc) moveCursor(dr, dc);
  renderChrome();
  schedule();
  return true;
}
function cancelEdit() {
  if (!edit) return;
  if (si !== edit.si) { si = edit.si; renderTabs(); buildLayout(); }
  endEdit();
  renderChrome();
  schedule();
}
function placeCellEditor() {
  const el = cellEl();
  if (!edit || el.hidden || edit.si !== si) { if (edit && edit.si !== si) el.style.visibility = 'hidden'; return; }
  el.style.visibility = '';
  const m = mergeAt(edit.r, edit.c);
  const b = rangeBox(m || { r1: edit.r, c1: edit.c, r2: edit.r, c2: edit.c });
  const st = styleOf(getCell(sheet(), edit.r, edit.c));
  const ctx = cv().getContext('2d');
  ctx.font = fontOf(st);
  const lines = el.value.split('\n');
  const w = Math.max(...lines.map((l) => ctx.measureText(l).width)) + 14;
  const maxW = $('grid-wrap').clientWidth - b.x - 4;
  el.style.left = `${b.x}px`;
  el.style.top = `${b.y}px`;
  el.style.width = `${Math.max(b.w + 2, Math.min(w, maxW))}px`;
  el.style.height = `${Math.max(b.h + 2, lines.length * 20 * zoom + 4)}px`;
  el.style.font = fontOf(st);
}
// Inserta una referencia al señalar casillas mientras se escribe una fórmula
function refInsertable() {
  if (!edit) return false;
  const inp = activeInput(), v = inp.value;
  if (!v.startsWith('=')) return false;
  if (edit.pick) return true;
  const before = v.slice(0, inp.selectionStart);
  return /(^=|[-+*/^&=<>(;,:%])\s*$/.test(before);
}
function putRef(a, b) {
  const inp = activeInput();
  let t = rangeText({ r1: Math.min(a.r, b.r), c1: Math.min(a.c, b.c), r2: Math.max(a.r, b.r), c2: Math.max(a.c, b.c) });
  if (si !== edit.si) t = `${quoteSheet(sheet().name)}!${t}`;
  const start = edit.pick ? edit.pick.start : inp.selectionStart;
  const end = edit.pick ? edit.pick.end : inp.selectionEnd;
  inp.value = inp.value.slice(0, start) + t + inp.value.slice(end);
  edit.pick = { start, end: start + t.length };
  inp.setSelectionRange(start + t.length, start + t.length);
  syncInputs(inp);
  schedule();
}
function syncInputs(from) {
  const other = from === fxEl() ? cellEl() : fxEl();
  other.value = from.value;
  placeCellEditor();
  updateAssist(from);
}
function keepFocus() { if (edit) activeInput().focus(); }

// Autocompletado y ayuda de argumentos
let acItems = [], acIndex = 0;
function closeAssist() { $('assist').hidden = true; acItems = []; }
function enclosingFn(text) {
  let depth = 0, q = false;
  for (let i = text.length - 1; i >= 0; i--) {
    const ch = text[i];
    if (ch === '"') q = !q;
    if (q) continue;
    if (ch === ')') depth++;
    else if (ch === '(') {
      if (depth === 0) { const m = /([\p{L}\d.]+)$/u.exec(text.slice(0, i)); return m ? m[1].toUpperCase() : null; }
      depth--;
    }
  }
  return null;
}
function updateAssist(inp) {
  const box = $('assist');
  const v = inp.value;
  if (!edit || !v.startsWith('=')) { closeAssist(); return; }
  const before = v.slice(0, inp.selectionStart);
  const word = /(?:^=|[-+*/^&=<>(;,:\s])([\p{L}][\p{L}\d.]*)$/u.exec(before)?.[1];
  acItems = word ? FN_DOC.filter((d) => d.es.startsWith(word.toUpperCase())).slice(0, 7) : [];
  acIndex = 0;
  let html = '';
  if (acItems.length) {
    html = acItems.map((d, i) => `<button type="button" class="ac-item ${i === 0 ? 'on' : ''}" data-i="${i}"><b>${esc(d.es)}</b><span>${esc(d.text)}</span></button>`).join('');
  } else {
    const name = enclosingFn(before);
    const d = name && (FN_DOC.find((x) => x.es === name) || FN_DOC.find((x) => x.key === name));
    if (d) html = `<p class="ac-hint"><b>${esc(d.es)}</b>(${esc(d.args)})</p>`;
  }
  if (!html) { closeAssist(); return; }
  box.innerHTML = html;
  const bar = inp === fxEl() ? fxEl() : cellEl();
  const r = bar.getBoundingClientRect();
  box.style.left = `${clamp(r.left, 8, Math.max(8, window.innerWidth - 328))}px`;
  box.style.top = `${r.bottom + 4}px`;
  box.hidden = false;
  box.querySelectorAll('.ac-item').forEach((b) => b.addEventListener('pointerdown', (e) => { e.preventDefault(); acceptAc(Number(b.dataset.i)); }));
}
function acceptAc(i) {
  const d = acItems[i];
  if (!d) return;
  const inp = activeInput(), v = inp.value, pos = inp.selectionStart;
  const m = /([\p{L}][\p{L}\d.]*)$/u.exec(v.slice(0, pos));
  const start = m ? pos - m[1].length : pos;
  const add = `${d.es}(`;
  inp.value = v.slice(0, start) + add + v.slice(pos);
  inp.setSelectionRange(start + add.length, start + add.length);
  syncInputs(inp);
  schedule();
}
function onEditKey(e) {
  if (!edit) return;
  const inp = e.target;
  if (acItems.length) {
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      acIndex = (acIndex + (e.key === 'ArrowDown' ? 1 : acItems.length - 1)) % acItems.length;
      $('assist').querySelectorAll('.ac-item').forEach((b, i) => b.classList.toggle('on', i === acIndex));
      return;
    }
    if (e.key === 'Tab') { e.preventDefault(); acceptAc(acIndex); return; }
  }
  if (e.key === 'Enter' && e.altKey) {
    e.preventDefault();
    const p = inp.selectionStart;
    inp.value = `${inp.value.slice(0, p)}\n${inp.value.slice(inp.selectionEnd)}`;
    inp.setSelectionRange(p + 1, p + 1);
    syncInputs(inp);
    return;
  }
  if (e.key === 'Enter') { e.preventDefault(); commitEdit(e.shiftKey ? -1 : 1, 0); return; }
  if (e.key === 'Tab') { e.preventDefault(); commitEdit(0, e.shiftKey ? -1 : 1); return; }
  if (e.key === 'Escape') { e.preventDefault(); cancelEdit(); return; }
  if (edit.typed && !inp.value.startsWith('=') && inp === cellEl()) {
    const d = { ArrowDown: [1, 0], ArrowUp: [-1, 0], ArrowLeft: [0, -1], ArrowRight: [0, 1] }[e.key];
    if (d) { e.preventDefault(); commitEdit(d[0], d[1]); }
  }
}
function onEditInput(e) {
  if (!edit) return;
  edit.pick = null;
  syncInputs(e.target);
  schedule();
}

// ---------- Selección ----------
function expandMerges(s) {
  let changed = true;
  while (changed) {
    changed = false;
    for (const m of sheet().merges) {
      if (m.r2 >= s.r1 && m.r1 <= s.r2 && m.c2 >= s.c1 && m.c1 <= s.c2 && (m.r1 < s.r1 || m.r2 > s.r2 || m.c1 < s.c1 || m.c2 > s.c2)) {
        s.r1 = Math.min(s.r1, m.r1); s.r2 = Math.max(s.r2, m.r2); s.c1 = Math.min(s.c1, m.c1); s.c2 = Math.max(s.c2, m.c2);
        changed = true;
      }
    }
  }
  return s;
}
function setSel(r, c, extend = false) {
  r = clamp(r, 0, MAX_ROWS - 1); c = clamp(c, 0, MAX_COLS - 1);
  if (extend) {
    sel = expandMerges({ r1: Math.min(sel.ar, r), r2: Math.max(sel.ar, r), c1: Math.min(sel.ac, c), c2: Math.max(sel.ac, c), ar: sel.ar, ac: sel.ac });
  } else {
    const s = expandMerges({ r1: r, r2: r, c1: c, c2: c });
    sel = { ...s, ar: s.r1, ac: s.c1 };
  }
  if (r >= nRows - 20 || c >= nCols - 6) buildLayout();
  renderChrome();
  schedule();
}
function reveal(r, c) {
  const sc = scroller(), f = fr();
  const fw = frozenW(), fh = frozenH();
  if (c >= f.c) {
    const left = colPos[c] - colPos[f.c], right = colPos[c + 1] - colPos[f.c], view = sc.clientWidth - HEAD_W - fw;
    if (left < sc.scrollLeft) sc.scrollLeft = left;
    else if (right > sc.scrollLeft + view) sc.scrollLeft = right - view;
  }
  if (r >= f.r) {
    const top = rowPos[r] - rowPos[f.r], bot = rowPos[r + 1] - rowPos[f.r], view = sc.clientHeight - HEAD_H - fh;
    if (top < sc.scrollTop) sc.scrollTop = top;
    else if (bot > sc.scrollTop + view) sc.scrollTop = bot - view;
  }
}
function moveCursor(dr, dc, extend = false) {
  // Si es una selección extendida, se mueve el extremo; si no, la casilla activa saltando ocultas
  let r = extend ? (sel.r1 === sel.ar ? sel.r2 : sel.r1) : sel.ar;
  let c = extend ? (sel.c1 === sel.ac ? sel.c2 : sel.c1) : sel.ac;
  const m = !extend && mergeAt(r, c);
  if (m) { if (dr > 0) r = m.r2; if (dc > 0) c = m.c2; }
  r += dr; c += dc;
  while (r > 0 && r < MAX_ROWS - 1 && sheet().rows[r] === 0) r += dr || 1;
  while (c > 0 && c < MAX_COLS - 1 && sheet().cols[c] === 0) c += dc || 1;
  setSel(r, c, extend);
  reveal(clamp(r, 0, nRows - 1), clamp(c, 0, nCols - 1));
}
// Ctrl+flecha: salta al borde del bloque de datos
function jump(dr, dc, extend) {
  const hasData = (r, c) => { const x = getCell(sheet(), r, c); return !!x && (x.v !== undefined || x.f !== undefined); };
  let r = extend ? (sel.r1 === sel.ar ? sel.r2 : sel.r1) : sel.ar;
  let c = extend ? (sel.c1 === sel.ac ? sel.c2 : sel.c1) : sel.ac;
  const u = usedRange(sheet());
  const limit = (x, y) => x < 0 || y < 0 || x > Math.max(u.r2 + 1, nRows) || y > Math.max(u.c2 + 1, nCols);
  const next = (x, y) => [x + dr, y + dc];
  let [x, y] = next(r, c);
  if (hasData(r, c) && !limit(x, y) && hasData(x, y)) {
    while (!limit(...next(x, y)) && hasData(...next(x, y))) [x, y] = next(x, y);
  } else {
    while (!limit(x, y) && !hasData(x, y)) [x, y] = next(x, y);
    if (limit(x, y)) { x = dr < 0 ? 0 : dr > 0 ? Math.max(u.r2, r) : r; y = dc < 0 ? 0 : dc > 0 ? Math.max(u.c2, c) : c; }
  }
  setSel(x, y, extend);
  reveal(x, y);
}

// ---------- Ratón y dedo ----------
let drag = null, autoTimer = 0;
const wrapPoint = (e) => { const b = $('grid-wrap').getBoundingClientRect(); return { x: e.clientX - b.left, y: e.clientY - b.top }; };
function hit(x, y) {
  if (x < HEAD_W && y < HEAD_H) return { zone: 'corner' };
  if (y < HEAD_H) {
    const c = colAt(x);
    const edgeR = xOf(c + 1), edgeL = xOf(c);
    const tol = isTouch ? 9 : 4;
    if (Math.abs(x - edgeR) <= tol) return { zone: 'colsize', c };
    if (Math.abs(x - edgeL) <= tol && c > 0) return { zone: 'colsize', c: c - 1 };
    return { zone: 'col', c };
  }
  if (x < HEAD_W) {
    const r = rowAt(y);
    const tol = isTouch ? 8 : 4;
    if (Math.abs(y - yOf(r + 1)) <= tol) return { zone: 'rowsize', r };
    if (Math.abs(y - yOf(r)) <= tol && r > 0) return { zone: 'rowsize', r: r - 1 };
    return { zone: 'row', r };
  }
  if (!edit) {
    const b = rangeBox(sel);
    const tol = isTouch ? 14 : 6;
    if (Math.abs(x - (b.x + b.w)) <= tol && Math.abs(y - (b.y + b.h)) <= tol) return { zone: 'handle' };
  }
  return { zone: 'cell', r: rowAt(y), c: colAt(x) };
}
function autoScroll(px, py) {
  const sc = scroller(), W = sc.clientWidth, H = sc.clientHeight;
  const dx = px < HEAD_W + frozenW() ? -24 : px > W - 8 ? 24 : 0, dy = py < HEAD_H + frozenH() ? -24 : py > H - 8 ? 24 : 0;
  if (dx || dy) { sc.scrollLeft += dx; sc.scrollTop += dy; schedule(); }
}
function dragTo(x, y) {
  if (!drag) return;
  const r = rowAt(y), c = colAt(x);
  if (drag.type === 'cells') { setSel(r, c, true); autoScroll(x, y); }
  else if (drag.type === 'pick') {
    putRef(drag.start, { r, c });
    autoScroll(x, y);
  } else if (drag.type === 'cols') {
    sel = { ...sel, r1: 0, r2: MAX_ROWS - 1, c1: Math.min(drag.c, c), c2: Math.max(drag.c, c) };
    renderChrome(); schedule(); autoScroll(x, HEAD_H + frozenH() + 1);
  } else if (drag.type === 'rows') {
    sel = { ...sel, c1: 0, c2: MAX_COLS - 1, r1: Math.min(drag.r, r), r2: Math.max(drag.r, r) };
    renderChrome(); schedule(); autoScroll(HEAD_W + frozenW() + 1, y);
  } else if (drag.type === 'fill') {
    drag.to = { r, c };
    showFillPreview();
    autoScroll(x, y);
  } else if (drag.type === 'colsize') {
    drag.w = Math.max(14, drag.w0 + (x - drag.x0) / zoom);
    sheet().cols[drag.c] = Math.round(drag.w);
    buildLayout(); schedule();
  } else if (drag.type === 'rowsize') {
    drag.h = Math.max(10, drag.h0 + (y - drag.y0) / zoom);
    sheet().rows[drag.r] = Math.round(drag.h);
    buildLayout(); schedule();
  }
}
function showFillPreview() {
  if (!drag?.to) return;
  const { r, c } = drag.to;
  const target = { ...sel };
  const dDown = r > sel.r2 ? r - sel.r2 : r < sel.r1 ? sel.r1 - r : 0;
  const dSide = c > sel.c2 ? c - sel.c2 : c < sel.c1 ? sel.c1 - c : 0;
  if (dDown >= dSide) { target.r1 = Math.min(sel.r1, r); target.r2 = Math.max(sel.r2, r); } else { target.c1 = Math.min(sel.c1, c); target.c2 = Math.max(sel.c2, c); }
  drag.target = target;
  const b = rangeBox(target), el = $('fill-box');
  el.hidden = false;
  el.style.cssText = `left:${b.x}px;top:${b.y}px;width:${b.w}px;height:${b.h}px`;
}
function onPointerDown(e) {
  const sc = scroller();
  const { x, y } = wrapPoint(e);
  if (x >= sc.clientWidth || y >= sc.clientHeight) return; // barra de desplazamiento
  closePop();
  if (e.button === 2) return;
  const h = hit(x, y);
  const touchDown = e.pointerType === 'touch';
  if (touchDown && (h.zone === 'cell' || h.zone === 'col' || h.zone === 'row')) {
    // Con el dedo la rejilla se desplaza: la selección se decide al levantar
    drag = { type: 'tap', x, y, h, id: e.pointerId, t: Date.now() };
    clearTimeout(autoTimer);
    if (h.zone === 'cell' && !edit) {
      autoTimer = setTimeout(() => {
        if (drag?.type === 'tap') {
          const inside = h.r >= sel.r1 && h.r <= sel.r2 && h.c >= sel.c1 && h.c <= sel.c2;
          if (!inside) setSel(h.r, h.c);
          drag = null;
          keepPopOnce = true;
          openContext(e.clientX, e.clientY);
        }
      }, 480);
    }
    return;
  }
  e.preventDefault();
  try { sc.setPointerCapture(e.pointerId); } catch (_) { /* sin captura: el arrastre sigue dentro de la rejilla */ }
  if (h.zone === 'cell' && edit && refInsertable()) {
    if (e.detail) keepFocus();
    drag = { type: 'pick', start: { r: h.r, c: h.c } };
    putRef(drag.start, drag.start);
    return;
  }
  if (edit && !commitEdit()) return;
  if (h.zone === 'corner') { sel = { r1: 0, c1: 0, r2: MAX_ROWS - 1, c2: MAX_COLS - 1, ar: sel.ar, ac: sel.ac }; renderChrome(); schedule(); return; }
  if (h.zone === 'colsize') {
    if (e.detail === 2) { autoFitCol(h.c); return; }
    drag = { type: 'colsize', c: h.c, x0: x, w0: sheet().cols[h.c] ?? sheet().defW ?? DEF_W, snap: serializeWb(wb), selBefore: { ...sel } };
    return;
  }
  if (h.zone === 'rowsize') {
    drag = { type: 'rowsize', r: h.r, y0: y, h0: sheet().rows[h.r] ?? DEF_H, snap: serializeWb(wb), selBefore: { ...sel } };
    return;
  }
  if (h.zone === 'col') {
    if (e.shiftKey) sel = { ...sel, r1: 0, r2: MAX_ROWS - 1, c1: Math.min(sel.ac, h.c), c2: Math.max(sel.ac, h.c) };
    else sel = { r1: 0, r2: MAX_ROWS - 1, c1: h.c, c2: h.c, ar: rowAt(HEAD_H + frozenH() + 1), ac: h.c };
    drag = { type: 'cols', c: sel.ac };
    renderChrome(); schedule();
    return;
  }
  if (h.zone === 'row') {
    if (e.shiftKey) sel = { ...sel, c1: 0, c2: MAX_COLS - 1, r1: Math.min(sel.ar, h.r), r2: Math.max(sel.ar, h.r) };
    else sel = { r1: h.r, r2: h.r, c1: 0, c2: MAX_COLS - 1, ar: h.r, ac: colAt(HEAD_W + frozenW() + 1) };
    drag = { type: 'rows', r: sel.ar };
    renderChrome(); schedule();
    return;
  }
  if (h.zone === 'handle') {
    // Con el dedo, un toque junto al tirador sin arrastrar selecciona la casilla tocada
    drag = touchDown ? { type: 'cells', tap: { r: rowAt(y), c: colAt(x), x, y } } : { type: 'fill' };
    return;
  }
  if (e.detail === 2 && h.r === sel.ar && h.c === sel.ac) { startEdit(); return; }
  setSel(h.r, h.c, e.shiftKey);
  drag = { type: 'cells' };
}
function onPointerMove(e) {
  const { x, y } = wrapPoint(e);
  if (!drag) {
    if (e.pointerType === 'mouse') {
      const h = hit(x, y);
      scroller().style.cursor = h.zone === 'colsize' ? 'col-resize' : h.zone === 'rowsize' ? 'row-resize' : h.zone === 'handle' ? 'crosshair' : 'cell';
    }
    return;
  }
  if (drag.type === 'tap') {
    if (Math.hypot(x - drag.x, y - drag.y) > 8) { clearTimeout(autoTimer); drag = null; }
    return;
  }
  if (drag.tap) {
    if (Math.hypot(x - drag.tap.x, y - drag.tap.y) < 6) return;
    delete drag.tap;
  }
  dragTo(x, y);
}
function onPointerUp(e) {
  clearTimeout(autoTimer);
  const d = drag;
  drag = null;
  if (!d) return;
  if (d.tap) { setSel(d.tap.r, d.tap.c); return; }
  if (d.type === 'tap') {
    const h = d.h;
    if (h.zone === 'col') { commitEdit(); sel = { r1: 0, r2: MAX_ROWS - 1, c1: h.c, c2: h.c, ar: rowAt(HEAD_H + frozenH() + 1), ac: h.c }; renderChrome(); schedule(); return; }
    if (h.zone === 'row') { commitEdit(); sel = { r1: h.r, r2: h.r, c1: 0, c2: MAX_COLS - 1, ar: h.r, ac: colAt(HEAD_W + frozenW() + 1) }; renderChrome(); schedule(); return; }
    if (edit && refInsertable()) { const p = { r: h.r, c: h.c }; putRef(p, p); keepFocus(); edit.pick = null; return; }
    if (edit && !commitEdit()) return;
    const same = h.r === sel.ar && h.c === sel.ac && sel.r1 === sel.r2 && sel.c1 === sel.c2;
    if (same) editOnClick = true; // el teclado del iPhone solo se abre desde el clic que sigue al toque
    else setSel(h.r, h.c);
    return;
  }
  if (d.type === 'pick' && edit) { edit.pick = null; keepFocus(); return; }
  if (d.type === 'fill') {
    $('fill-box').hidden = true;
    if (d.target) fillTo(d.target);
    return;
  }
  if (d.type === 'colsize' || d.type === 'rowsize') {
    if (d.w !== undefined || d.h !== undefined) {
      pushUndo({ snap: d.snap, sel: d.selBefore, si });
      afterChange();
    }
  }
}
let editOnClick = false;
function autoFitCol(c) {
  const sh = sheet(), ctx = cv().getContext('2d');
  let w = 24;
  for (const [r, row] of sh.cells) {
    const cell = row.get(c);
    if (!cell) continue;
    const st = styleOf(cell);
    ctx.font = fontOf({ ...st, fs: st.fs });
    w = Math.max(w, ctx.measureText(displayValue(calc.safe(si, r, c), st.nf).text).width / zoom + 10);
  }
  structural(() => { sh.cols[c] = Math.round(Math.min(w, 500)); });
}
// Como Excel: si un número o fecha recién escrito no cabe, la columna crece (si nadie fijó su ancho)
function widenForNumber(r, c) {
  const sh = sheet(), cell = getCell(sh, r, c);
  if (!cell || sh.cols[c] !== undefined) return;
  const st = styleOf(cell), v = calc.safe(si, r, c);
  if (typeof v !== 'number') return;
  const ctx = cv().getContext('2d');
  ctx.font = fontOf(st);
  const need = Math.ceil(ctx.measureText(displayValue(v, st.nf).text).width / zoom) + 12;
  if (need > (sh.defW ?? DEF_W)) { sh.cols[c] = Math.min(need, 300); buildLayout(); markDirty(); }
}
function autoRowHeight(r) {
  const sh = sheet(), row = sh.cells.get(r);
  if (!row || sh.rows[r] === 0) return;
  const ctx = cv().getContext('2d');
  let need = 0;
  for (const [c, cell] of row) {
    const st = styleOf(cell);
    if (!st.wr && !st.fs) continue;
    const fs = (st.fs || 11) * 4 / 3;
    ctx.font = fontOf({ ...st });
    const lines = st.wr ? wrapLines(ctx, displayValue(calc.safe(si, r, c), st.nf).text, (sh.cols[c] ?? sh.defW ?? DEF_W) * zoom - 6).length : 1;
    need = Math.max(need, lines * fs * 1.2 + 4);
  }
  if (need > DEF_H) { sh.rows[r] = Math.round(need); buildLayout(); } else if (need && sh.rows[r] > DEF_H) { delete sh.rows[r]; buildLayout(); }
}

// ---------- Rellenar ----------
function seriesStep(values) {
  // Devuelve el incremento si son números en progresión; null si no
  if (values.length < 2 || !values.every((v) => typeof v === 'number')) return null;
  const d = values[1] - values[0];
  return values.every((v, i) => !i || Math.abs(v - values[i - 1] - d) < 1e-9) ? d : null;
}
function fillTo(target) {
  const src = { ...sel };
  if (target.r1 === src.r1 && target.r2 === src.r2 && target.c1 === src.c1 && target.c2 === src.c2) return;
  begin();
  const down = target.r2 - target.r1 !== src.r2 - src.r1;
  const sh = sheet();
  const lines = down ? [src.c1, src.c2] : [src.r1, src.r2];
  for (let l = lines[0]; l <= lines[1]; l++) {
    const len = down ? src.r2 - src.r1 + 1 : src.c2 - src.c1 + 1;
    const at = (i) => (down ? [src.r1 + i, l] : [l, src.c1 + i]);
    const cells = Array.from({ length: len }, (_, i) => getCell(sh, ...at(i)));
    const vals = cells.map((x) => (x?.f === undefined ? x?.v : undefined));
    const step = seriesStep(vals) ?? (len === 1 && typeof vals[0] === 'number' && isDateFormat(styleOf(cells[0]).nf) ? 1 : null);
    const textNum = len === 1 && typeof vals[0] === 'string' ? /^(.*?)(\d+)$/.exec(vals[0]) : null;
    const from = down ? target.r1 : target.c1, to = down ? target.r2 : target.c2;
    const base = down ? src.r1 : src.c1;
    for (let p = from; p <= to; p++) {
      if (p >= base && p < base + len) continue;
      const off = p - base;
      const i = ((off % len) + len) % len;
      const cell = cells[i];
      const [tr, tc] = down ? [p, l] : [l, p];
      if (!cell) { writeCell(tr, tc, {}); continue; }
      if (cell.f !== undefined) {
        const [sr, sc] = at(i);
        writeCell(tr, tc, { f: shiftFormula(cell.f, tr - sr, tc - sc), s: cell.s });
      } else if (step !== null) writeCell(tr, tc, { v: vals[len - 1] + step * (off - len + 1), s: cell.s });
      else if (textNum) writeCell(tr, tc, { v: textNum[1] + String(Number(textNum[2]) + off).padStart(textNum[2].length, '0'), s: cell.s });
      else writeCell(tr, tc, { v: cell.v, s: cell.s });
    }
  }
  sel = { ...sel, r1: target.r1, c1: target.c1, r2: target.r2, c2: target.c2 };
  commitTx();
  renderChrome();
  schedule();
}

// ---------- Portapapeles ----------
function clampSel() {
  return { r1: sel.r1, c1: sel.c1, r2: Math.min(sel.r2, Math.max(usedRange(sheet()).r2, sel.r1)), c2: Math.min(sel.c2, Math.max(usedRange(sheet()).c2, sel.c1)) };
}
function copySel(cut = false) {
  const range = clampSel(), sh = sheet(), cells = [], text = [];
  for (let r = range.r1; r <= range.r2; r++) {
    const row = [], line = [];
    for (let c = range.c1; c <= range.c2; c++) {
      const x = getCell(sh, r, c);
      row.push(x ? { v: x.v, f: x.f, s: x.s } : null);
      line.push(x ? displayValue(calc.safe(si, r, c), styleOf(x).nf).text : '');
    }
    cells.push(row);
    text.push(line.join('\t'));
  }
  const tsv = text.join('\n');
  clip = { si, range, cells, cut, tsv, show: true };
  schedule();
  return tsv;
}
function pasteInternal(valuesOnly = false) {
  const h = clip.cells.length, w = clip.cells[0].length;
  const tall = sel.r2 - sel.r1 + 1, wide = sel.c2 - sel.c1 + 1;
  const big = tall > 100000 || wide > 5000;
  const nh = !big && tall % h === 0 ? tall : h, nw = !big && wide % w === 0 ? wide : w;
  begin();
  if (clip.cut) {
    for (let r = clip.range.r1; r <= clip.range.r2; r++) for (let c = clip.range.c1; c <= clip.range.c2; c++) writeCell(r, c, {}, clip.si);
  }
  for (let i = 0; i < nh; i++) for (let j = 0; j < nw; j++) {
    const x = clip.cells[i % h][j % w], r = sel.r1 + i, c = sel.c1 + j;
    if (!x) { writeCell(r, c, {}); continue; }
    if (valuesOnly) {
      const v = x.f !== undefined ? calc.safe(clip.si, clip.range.r1 + (i % h), clip.range.c1 + (j % w)) : x.v;
      writeCell(r, c, { v, s: getCell(sheet(), r, c)?.s });
    } else if (x.f !== undefined && !clip.cut) {
      writeCell(r, c, { f: shiftFormula(x.f, r - clip.range.r1 - (i % h), c - clip.range.c1 - (j % w)), s: x.s });
    } else writeCell(r, c, { v: x.v, f: x.f, s: x.s });
  }
  sel = { ...sel, r2: sel.r1 + nh - 1, c2: sel.c1 + nw - 1 };
  commitTx();
  if (clip.cut) clip = null;
  else clip.show = false;
  renderChrome();
  schedule();
}
function pasteText(text) {
  const rows = text.replace(/\r\n?/g, '\n').replace(/\n$/, '').split('\n').map((l) => l.split('\t'));
  begin();
  rows.forEach((line, i) => line.forEach((t, j) => { if (!enterValue(sel.r1 + i, sel.c1 + j, t)) writeCell(sel.r1 + i, sel.c1 + j, { v: t }); }));
  sel = { ...sel, r2: sel.r1 + rows.length - 1, c2: sel.c1 + rows[0].length - 1 };
  commitTx();
  renderChrome();
  schedule();
}
document.addEventListener('copy', (e) => handleClip(e, false));
document.addEventListener('cut', (e) => handleClip(e, true));
function handleClip(e, cut) {
  if ($('editor').hidden || edit || e.target.closest?.('input, textarea, .sheet')) return;
  e.preventDefault();
  e.clipboardData.setData('text/plain', copySel(cut));
}
document.addEventListener('paste', (e) => {
  if ($('editor').hidden || edit || e.target.closest?.('input, textarea, .sheet')) return;
  e.preventDefault();
  const text = e.clipboardData.getData('text/plain');
  if (clip && text.replace(/\r/g, '') === clip.tsv) pasteInternal();
  else if (text) pasteText(text);
});
async function menuPaste(valuesOnly) {
  if (clip && (valuesOnly || !navigator.clipboard?.readText)) { pasteInternal(valuesOnly); return; }
  try {
    const text = await navigator.clipboard.readText();
    if (clip && text.replace(/\r/g, '') === clip.tsv) pasteInternal(valuesOnly);
    else if (text) pasteText(text);
  } catch (_) {
    if (clip) pasteInternal(valuesOnly); else toast('Sin permiso para leer el portapapeles', { warn: true });
  }
}
function clearSel(mode = 'content') {
  const r = clampSel();
  begin();
  for (const [row, cols] of [...sheet().cells]) {
    if (row < r.r1 || row > r.r2) continue;
    for (const c of [...cols.keys()]) {
      if (c < r.c1 || c > r.c2) continue;
      if (mode === 'all') writeCell(row, c, {});
      else writeCell(row, c, { s: cols.get(c).s });
    }
  }
  commitTx();
}

// ---------- Formato ----------
function eachSelCell(fn) {
  const fullR = sel.r2 >= MAX_ROWS - 1, fullC = sel.c2 >= MAX_COLS - 1;
  const r2 = fullR ? Math.min(nRows - 1, Math.max(usedRange(sheet()).r2, 200)) : sel.r2;
  const c2 = fullC ? Math.min(nCols - 1, Math.max(usedRange(sheet()).c2, 25)) : sel.c2;
  for (let r = sel.r1; r <= r2; r++) for (let c = sel.c1; c <= c2; c++) fn(r, c);
}
function patchStyle(patchFn) {
  begin();
  eachSelCell((r, c) => {
    const x = getCell(sheet(), r, c);
    const s = setStyleIndex(x?.s, typeof patchFn === 'function' ? patchFn(styleOf(x), r, c) : patchFn);
    if (s !== (x?.s || 0)) writeCell(r, c, { v: x?.v, f: x?.f, s });
  });
  for (let r = sel.r1; r <= Math.min(sel.r2, sel.r1 + 200); r++) autoRowHeight(r);
  commitTx();
  renderChrome();
  schedule();
}
const toggleStyle = (k) => { const on = !styleOf(getCell(sheet(), sel.ar, sel.ac))[k]; patchStyle({ [k]: on ? 1 : undefined }); };
function setBorders(kind) {
  const line = { s: 'thin', c: null };
  const { r1, c1 } = sel;
  const r2 = Math.min(sel.r2, nRows - 1), c2 = Math.min(sel.c2, nCols - 1);
  patchStyle((st, r, c) => {
    const bd = { ...(st.bd || {}) };
    if (kind === 'none') return { bd: undefined };
    if (kind === 'all') { bd.t = bd.b = bd.l = bd.r = line; }
    if (kind === 'outer') { if (r === r1) bd.t = line; if (r === r2) bd.b = line; if (c === c1) bd.l = line; if (c === c2) bd.r = line; }
    if (kind === 'bottom' && r === r2) bd.b = line;
    if (kind === 'top' && r === r1) bd.t = line;
    return { bd };
  });
}
function changeDecimals(delta) {
  const x = getCell(sheet(), sel.ar, sel.ac), st = styleOf(x);
  let nf = st.nf;
  if (isDateFormat(nf)) return;
  if (!nf || nf === 'General') {
    const v = x ? calc.safe(si, sel.ar, sel.ac) : 0;
    const shown = typeof v === 'number' ? generalNumber(v).split(',')[1]?.length || 0 : 0;
    nf = `0${shown + delta > 0 ? `.${'0'.repeat(shown + delta)}` : ''}`;
  } else {
    nf = nf.replace(/0(?:\.(0+))?(?![0#,])/g, (m, d) => {
      const n = Math.max(0, (d?.length || 0) + delta);
      return `0${n ? `.${'0'.repeat(n)}` : ''}`;
    });
  }
  patchStyle({ nf });
}
const NUM_FORMATS = [
  ['General', 'General', '1234,5'],
  ['Número', '#,##0.00', '1.234,50'],
  ['Entero', '#,##0', '1.235'],
  ['Moneda', '#,##0.00 "€"', '1.234,50 €'],
  ['Porcentaje', '0.00%', '12,50%'],
  ['Fecha', 'dd/mm/yyyy', '31/12/2026'],
  ['Fecha larga', 'd mmmm yyyy', '31 diciembre 2026'],
  ['Hora', 'hh:mm', '14:30'],
  ['Fecha y hora', 'dd/mm/yyyy hh:mm', '31/12/2026 14:30'],
  ['Científico', '0.00E+00', '1,23E+03'],
  ['Texto', '@', 'Tal cual'],
];
function toggleMerge() {
  const inside = sheet().merges.filter((m) => m.r2 >= sel.r1 && m.r1 <= sel.r2 && m.c2 >= sel.c1 && m.c1 <= sel.c2);
  if (!inside.length && sel.r1 === sel.r2 && sel.c1 === sel.c2) return;
  if (sel.r2 >= MAX_ROWS - 1 || sel.c2 >= MAX_COLS - 1) return;
  structural(() => {
    const sh = sheet();
    if (inside.length) { sh.merges = sh.merges.filter((m) => !inside.includes(m)); return; }
    for (let r = sel.r1; r <= sel.r2; r++) for (let c = sel.c1; c <= sel.c2; c++) {
      if (r === sel.r1 && c === sel.c1) continue;
      const x = getCell(sh, r, c);
      if (x) { delete x.v; delete x.f; }
    }
    sh.merges.push({ r1: sel.r1, c1: sel.c1, r2: sel.r2, c2: sel.c2 });
  });
}
function toggleFreeze() {
  structural(() => {
    const sh = sheet();
    if (sh.freeze.r || sh.freeze.c) sh.freeze = { r: 0, c: 0 };
    else sh.freeze = { r: sel.ar, c: sel.ac };
  });
  scroller().scrollTop = 0; scroller().scrollLeft = 0;
  if (!sheet().freeze.r && !sheet().freeze.c) toast('Paneles libres'); else toast(`Fijado hasta ${a1(sel.ar, sel.ac)}`);
}
function autoSum(fnEs = 'SUMA') {
  if (edit && !commitEdit()) return;
  const sh = sheet();
  const numAt = (r, c) => typeof calc.safe(si, r, c) === 'number' && !!getCell(sh, r, c);
  // Un rango con datos: la suma va debajo de cada columna
  if (sel.r1 !== sel.r2 || sel.c1 !== sel.c2) {
    if (sel.r2 >= MAX_ROWS - 1 || sel.c2 >= MAX_COLS - 1) return;
    begin();
    for (let c = sel.c1; c <= sel.c2; c++) enterValue(sel.r2 + 1, c, `=${fnEs}(${a1(sel.r1, c)}:${a1(sel.r2, c)})`);
    commitTx();
    return;
  }
  const { ar: r, ac: c } = sel;
  let u = r - 1;
  while (u >= 0 && numAt(u, c)) u--;
  let l = c - 1;
  while (l >= 0 && numAt(r, l)) l--;
  let arg = '';
  if (u < r - 1) arg = `${a1(u + 1, c)}:${a1(r - 1, c)}`;
  else if (l < c - 1) arg = `${a1(r, l + 1)}:${a1(r, c - 1)}`;
  startEdit(`=${fnEs}(${arg})`);
  activeInput().setSelectionRange(fnEs.length + 2, activeInput().value.length - 1);
}

// ---------- Filas, columnas y orden ----------
function shiftMap(obj, at, n) {
  const out = {};
  for (const [k, v] of Object.entries(obj)) {
    const i = Number(k);
    if (i < at) out[i] = v;
    else if (n > 0) out[i + n] = v;
    else if (i >= at - n) out[i + n] = v;
  }
  return out;
}
function restructure(axis, at, n) {
  structural(() => {
    const sh = sheet(), name = sh.name;
    if (axis === 'r') {
      const moved = new Map();
      for (const [r, row] of sh.cells) {
        if (r < at) moved.set(r, row);
        else if (n > 0) moved.set(r + n, row);
        else if (r >= at - n) moved.set(r + n, row);
      }
      sh.cells = moved;
      sh.rows = shiftMap(sh.rows, at, n);
    } else {
      for (const [r, row] of [...sh.cells]) {
        const out = new Map();
        for (const [c, x] of row) {
          if (c < at) out.set(c, x);
          else if (n > 0) out.set(c + n, x);
          else if (c >= at - n) out.set(c + n, x);
        }
        if (out.size) sh.cells.set(r, out); else sh.cells.delete(r);
      }
      sh.cols = shiftMap(sh.cols, at, n);
    }
    const [a, b] = axis === 'r' ? ['r1', 'r2'] : ['c1', 'c2'];
    sh.merges = sh.merges.flatMap((m) => {
      const q = { ...m };
      if (n > 0) { if (q[a] >= at) q[a] += n; if (q[b] >= at) q[b] += n; return [q]; }
      const end = at - n;
      if (q[a] >= at && q[b] < end) return [];
      if (q[a] >= end) q[a] += n; else if (q[a] >= at) q[a] = at;
      if (q[b] >= end) q[b] += n; else if (q[b] >= at) q[b] = at - 1;
      return [q];
    });
    wb.sheets.forEach((s) => {
      for (const row of s.cells.values()) for (const x of row.values()) {
        if (x.f !== undefined) { try { x.f = adjustFormula(x.f, s.name, name, axis, at, n); delete x.g; } catch (_) { /* fórmula rara: sin cambios */ } }
      }
    });
    for (const k of Object.keys(wb.names || {})) { try { wb.names[k] = adjustFormula(wb.names[k], '', name, axis, at, n); } catch (_) { /* igual */ } }
  });
}
function insertRows(after) { const n = sel.r2 - sel.r1 + 1; if (n < 5000) restructure('r', after ? sel.r2 + 1 : sel.r1, n); }
function insertCols(after) { const n = sel.c2 - sel.c1 + 1; if (n < 2000) restructure('c', after ? sel.c2 + 1 : sel.c1, n); }
function deleteRows() { if (sel.r2 - sel.r1 < 100000) { restructure('r', sel.r1, -(sel.r2 - sel.r1 + 1)); setSel(sel.r1, sel.ac); } }
function deleteCols() { if (sel.c2 - sel.c1 < 5000) { restructure('c', sel.c1, -(sel.c2 - sel.c1 + 1)); setSel(sel.ar, sel.c1); } }
function setHidden(axis, hide) {
  structural(() => {
    const sh = sheet(), map = axis === 'r' ? sh.rows : sh.cols;
    const [a, b] = axis === 'r' ? [sel.r1, sel.r2] : [sel.c1, sel.c2];
    if (hide) { if (b - a < 5000) for (let i = a; i <= b; i++) map[i] = 0; } else for (const k of Object.keys(map)) { if (map[k] === 0 && Number(k) >= a - 1 && Number(k) <= b + 1) delete map[k]; }
  });
}
// Bloque de datos alrededor de la casilla (se separa por filas y columnas vacías)
function currentRegion() {
  const sh = sheet();
  const has = (r, c) => { const x = getCell(sh, r, c); return !!x && (x.v !== undefined || x.f !== undefined); };
  const q = { r1: sel.ar, r2: sel.ar, c1: sel.ac, c2: sel.ac };
  let grew = true;
  while (grew) {
    grew = false;
    const anyRow = (r) => { for (let c = q.c1; c <= q.c2; c++) if (has(r, c)) return true; return false; };
    const anyCol = (c) => { for (let r = q.r1; r <= q.r2; r++) if (has(r, c)) return true; return false; };
    if (q.r1 > 0 && anyRow(q.r1 - 1)) { q.r1--; grew = true; }
    if (anyRow(q.r2 + 1)) { q.r2++; grew = true; }
    if (q.c1 > 0 && anyCol(q.c1 - 1)) { q.c1--; grew = true; }
    if (anyCol(q.c2 + 1)) { q.c2++; grew = true; }
  }
  return q;
}
function sortSel(desc) {
  const single = sel.r1 === sel.r2 && sel.c1 === sel.c2;
  const whole = sel.r2 >= MAX_ROWS - 1 || sel.c2 >= MAX_COLS - 1;
  const q = single || whole ? currentRegion() : { r1: sel.r1, r2: sel.r2, c1: sel.c1, c2: sel.c2 };
  const sh = sheet();
  if (sh.merges.some((m) => m.r2 >= q.r1 && m.r1 <= q.r2 && m.c2 >= q.c1 && m.c1 <= q.c2)) { toast('No se puede ordenar con casillas combinadas', { warn: true }); return; }
  // Sin rango marcado, la primera fila es cabecera si es toda texto y debajo hay algo que no lo es o va en negrita
  let top = q.r1;
  if ((single || whole) && q.r2 > q.r1) {
    const types = (r) => { const t = []; for (let c = q.c1; c <= q.c2; c++) t.push(typeof calc.safe(si, r, c)); return t; };
    const head = types(q.r1), next = types(q.r1 + 1);
    if (head.every((t) => t === 'string' || t === 'undefined') && (next.some((t, i) => t !== 'undefined' && t !== head[i]) || isHeaderStyle(q.r1))) top++;
  }
  if (top >= q.r2) return;
  const rows = [];
  for (let r = top; r <= q.r2; r++) {
    const cells = [];
    for (let c = q.c1; c <= q.c2; c++) { const x = getCell(sh, r, c); cells.push(x ? { v: x.v, f: x.f, s: x.s } : null); }
    rows.push({ r, key: calc.safe(si, r, sel.ac), cells });
  }
  const blank = (v) => v === undefined || v === '';
  const dir = desc ? -1 : 1;
  const sorted = rows.map((x, i) => ({ x, i })).sort((a, b) => {
    const p = a.x.key, q2 = b.x.key;
    if (blank(p) || blank(q2)) return blank(p) === blank(q2) ? a.i - b.i : blank(p) ? 1 : -1;
    if (isErr(p) || isErr(q2)) return isErr(p) === isErr(q2) ? a.i - b.i : isErr(p) ? 1 : -1;
    return dir * compareValues(p, q2) || a.i - b.i;
  }).map((o) => o.x);
  begin();
  sorted.forEach((row, i) => {
    const r = top + i;
    row.cells.forEach((x, j) => {
      const c = q.c1 + j;
      if (!x) writeCell(r, c, {});
      else if (x.f !== undefined) writeCell(r, c, { f: shiftFormula(x.f, r - row.r, 0), s: x.s });
      else writeCell(r, c, x);
    });
  });
  commitTx();
  renderChrome();
}
const isHeaderStyle = (r) => !!styleOf(getCell(sheet(), r, sel.ac)).b;

// ---------- Teclado ----------
document.addEventListener('keydown', (e) => {
  if ($('editor').hidden || !wb) return;
  if ($('sheet-back') || !$('menu').hidden) return;
  if (edit || e.target.closest?.('input, textarea, select')) return;
  const mod = e.ctrlKey || e.metaKey;
  const key = e.key;
  const dir = { ArrowDown: [1, 0], ArrowUp: [-1, 0], ArrowLeft: [0, -1], ArrowRight: [0, 1] }[key];
  if (dir) {
    e.preventDefault();
    if (mod) jump(dir[0], dir[1], e.shiftKey); else moveCursor(dir[0], dir[1], e.shiftKey);
    return;
  }
  if (mod) {
    const k = key.toLowerCase();
    const fn = { z: () => (e.shiftKey ? redo() : undo()), y: redo, b: () => toggleStyle('b'), i: () => toggleStyle('i'), u: () => toggleStyle('u'), f: () => openFind(), h: () => openFind(),
      a: () => { sel = { r1: 0, c1: 0, r2: MAX_ROWS - 1, c2: MAX_COLS - 1, ar: sel.ar, ac: sel.ac }; renderChrome(); schedule(); },
      s: () => { flush(); exportXlsx(); },
      Home: () => { setSel(0, 0); reveal(0, 0); },
    }[k === 'home' ? 'Home' : k];
    if (fn) { e.preventDefault(); fn(); }
    return;
  }
  switch (key) {
    case 'Enter': e.preventDefault(); moveCursor(e.shiftKey ? -1 : 1, 0); return;
    case 'Tab': e.preventDefault(); moveCursor(0, e.shiftKey ? -1 : 1); return;
    case 'F2': e.preventDefault(); startEdit(); return;
    case 'Delete': case 'Backspace': e.preventDefault(); clearSel(); renderChrome(); return;
    case 'Escape': if (clip) { clip = null; schedule(); } return;
    case 'Home': e.preventDefault(); setSel(sel.ar, 0); reveal(sel.ar, 0); return;
    case 'PageDown': case 'PageUp': {
      e.preventDefault();
      moveCursor((key === 'PageDown' ? 1 : -1) * Math.floor(scroller().clientHeight / (DEF_H * zoom)) , 0, e.shiftKey);
      return;
    }
    default:
  }
  // Una tecla normal empieza a escribir: se enfoca el editor y el carácter cae dentro
  if ((key.length === 1 || key === 'Dead') && !e.altKey) startEdit('');
});

// ---------- Barra de herramientas ----------
const TOOLS = [
  ['undo', 'Deshacer', undo], ['redo', 'Rehacer', redo], '|',
  ['b', 'Negrita', () => toggleStyle('b'), '<b>N</b>'], ['i', 'Cursiva', () => toggleStyle('i'), '<i>K</i>'], ['u', 'Subrayado', () => toggleStyle('u'), '<u>S</u>'], ['st', 'Tachado', () => toggleStyle('st'), '<s>T</s>'], '|',
  ['size', 'Tamaño de letra', (b) => openSizePop(b), '<span class="tool-text" id="size-label">11</span>'],
  ['fc', 'Color de letra', (b) => openColorPop(b, 'fc'), '<span class="tool-a">A<i id="fc-bar"></i></span>'],
  ['bg', 'Color de fondo', (b) => openColorPop(b, 'bg'), `${icon('fill', 20)}`],
  ['border', 'Bordes', (b) => openBorderPop(b), icon('border', 20)], '|',
  ['left', 'Alinear a la izquierda', () => setAlign('left'), icon('left', 20)], ['center', 'Centrar', () => setAlign('center'), icon('center', 20)], ['right', 'Alinear a la derecha', () => setAlign('right'), icon('right', 20)],
  ['wrap', 'Ajustar texto', () => toggleStyle('wr'), icon('wrap', 20)], ['merge', 'Combinar casillas', toggleMerge, icon('merge', 20)], '|',
  ['nf', 'Formato de número', (b) => openFormatPop(b), '<span class="tool-text">123</span>'],
  ['eur', 'Moneda', () => patchStyle({ nf: '#,##0.00 "€"' }), '<span class="tool-text">€</span>'], ['pct', 'Porcentaje', () => patchStyle({ nf: '0.00%' }), '<span class="tool-text">%</span>'],
  ['dec-', 'Menos decimales', () => changeDecimals(-1), '<span class="tool-text small">,0</span>'], ['dec+', 'Más decimales', () => changeDecimals(1), '<span class="tool-text small">,00</span>'], '|',
  ['sum', 'Autosuma', (b) => openSumPop(b), icon('sum', 20)], ['fx', 'Insertar función', () => openFunctions(), icon('fx', 20)], '|',
  ['asc', 'Ordenar de menor a mayor', () => sortSel(false), icon('sortup', 20)], ['desc', 'Ordenar de mayor a menor', () => sortSel(true), icon('sort', 20)],
  ['freeze', 'Fijar paneles hasta aquí', toggleFreeze, icon('freeze', 20)], ['find', 'Buscar y reemplazar', () => openFind(), icon('search', 20)],
];
function setAlign(a) { const on = styleOf(getCell(sheet(), sel.ar, sel.ac)).ha === a; patchStyle({ ha: on ? undefined : a }); }
function buildToolbar() {
  const box = $('tools');
  box.innerHTML = TOOLS.map((t) => {
    if (t === '|') return '<span class="tool-sep"></span>';
    const [id, label, , html] = t;
    return `<button type="button" class="tool" data-tool="${id}" title="${label}" aria-label="${label}">${html || icon(id, 20)}</button>`;
  }).join('');
  box.querySelectorAll('.tool').forEach((b) => {
    b.addEventListener('pointerdown', (e) => { if (edit) e.preventDefault(); }); // mantiene el teclado en la fórmula
    b.addEventListener('click', (e) => {
      e.stopPropagation();
      const t = TOOLS.find((x) => x[0] === b.dataset.tool);
      if (edit && t[0] !== 'fx' && !commitEdit()) return;
      t[2](b);
    });
  });
}
function renderChrome() {
  if (!wb) return;
  const cell = getCell(sheet(), sel.ar, sel.ac), st = styleOf(cell);
  const multi = sel.r1 !== sel.r2 || sel.c1 !== sel.c2;
  const nb = $('namebox');
  if (document.activeElement !== nb) {
    const whole = sel.r2 >= MAX_ROWS - 1 ? `${colName(sel.c1)}:${colName(sel.c2)}` : sel.c2 >= MAX_COLS - 1 ? `${sel.r1 + 1}:${sel.r2 + 1}` : null;
    nb.value = sel.r2 >= MAX_ROWS - 1 && sel.c2 >= MAX_COLS - 1 ? 'Todo' : whole || (multi && !mergeAt(sel.ar, sel.ac) ? rangeText(sel) : a1(sel.ar, sel.ac));
  }
  if (!edit) fxEl().value = editText(cell, st.nf);
  const set = (id, on) => document.querySelector(`[data-tool="${id}"]`)?.classList.toggle('on', !!on);
  ['b', 'i', 'u', 'st'].forEach((k) => set(k, st[k]));
  ['left', 'center', 'right'].forEach((k) => set(k, st.ha === k));
  set('wrap', st.wr);
  set('merge', !!mergeAt(sel.ar, sel.ac));
  set('freeze', fr().r || fr().c);
  const sz = $('size-label');
  if (sz) sz.textContent = st.fs || 11;
  const bar = $('fc-bar');
  if (bar) bar.style.background = st.fc || 'currentColor';
  document.querySelector('[data-tool="undo"]').disabled = !undoStack.length;
  document.querySelector('[data-tool="redo"]').disabled = !redoStack.length;
  renderStatus();
}
function renderStatus() {
  const el = $('sel-stats');
  if (sel.r1 === sel.r2 && sel.c1 === sel.c2) { el.textContent = ''; return; }
  let s = 0, n = 0, all = 0;
  for (const [r, row] of sheet().cells) {
    if (r < sel.r1 || r > sel.r2) continue;
    for (const c of row.keys()) {
      if (c < sel.c1 || c > sel.c2) continue;
      const v = calc.safe(si, r, c);
      if (v === undefined) continue;
      all++;
      if (typeof v === 'number') { s += v; n++; }
    }
  }
  const f = (v) => v.toLocaleString(LOCALE, { maximumFractionDigits: 2 });
  el.textContent = n ? `Suma ${f(s)} · Media ${f(s / n)} · Recuento ${all}` : all ? `Recuento ${all}` : '';
}
function renderTabs() {
  const box = $('tab-list');
  box.innerHTML = wb.sheets.map((s, i) => (s.hidden ? '' : `<button type="button" class="tab ${i === si ? 'on' : ''}" data-i="${i}">${esc(s.name)}</button>`)).join('');
  box.querySelectorAll('.tab').forEach((b) => {
    const i = Number(b.dataset.i);
    b.addEventListener('pointerdown', (e) => { if (edit) e.preventDefault(); });
    b.addEventListener('click', () => {
      if (i === si) { if (!edit) openSheetActions(); return; }
      switchSheet(i);
    });
    b.addEventListener('contextmenu', (e) => { e.preventDefault(); if (i !== si) switchSheet(i); openSheetActions(); });
  });
}
function switchSheet(i) {
  if (edit && !curText().startsWith('=') && !commitEdit()) return;
  si = i;
  if (!edit) sel = { r1: 0, c1: 0, r2: 0, c2: 0, ar: 0, ac: 0 };
  scroller().scrollTop = 0; scroller().scrollLeft = 0;
  buildLayout();
  renderTabs();
  renderChrome();
  schedule();
  keepFocus();
}
function uniqueSheetName(base) {
  let i = 1, name = base;
  const used = new Set(wb.sheets.map((s) => s.name.toLowerCase()));
  while (used.has(name.toLowerCase())) name = `${base} ${++i}`;
  return name;
}
function addSheet() {
  structural(() => {
    let n = wb.sheets.length + 1;
    while (wb.sheets.some((s) => s.name.toLowerCase() === `hoja${n}`)) n++;
    wb.sheets.push(newSheetData(`Hoja${n}`));
  });
  switchSheet(wb.sheets.length - 1);
}
function renameSheet(name) {
  const clean = name.trim().replace(/[\\/?*[\]:]/g, '').slice(0, 31);
  const sh = sheet();
  if (!clean || clean === sh.name) return;
  if (wb.sheets.some((s) => s !== sh && s.name.toLowerCase() === clean.toLowerCase())) { toast('Ya hay una hoja con ese nombre', { warn: true }); return; }
  structural(() => {
    const old = sh.name;
    sh.name = clean;
    wb.sheets.forEach((s) => {
      for (const row of s.cells.values()) for (const x of row.values()) {
        if (x.f !== undefined) { try { x.f = renameSheetInFormula(x.f, old, clean); } catch (_) { /* sin cambios */ } }
      }
    });
    for (const k of Object.keys(wb.names || {})) { try { wb.names[k] = renameSheetInFormula(wb.names[k], old, clean); } catch (_) { /* igual */ } }
  });
  renderTabs();
}
function openSheetActions() {
  const sh = sheet();
  const back = newSheet();
  const visible = wb.sheets.filter((s) => !s.hidden).length;
  const hiddenList = wb.sheets.map((s, i) => [s, i]).filter(([s]) => s.hidden);
  back.innerHTML = `
    <div class="sheet" role="dialog" aria-modal="true" aria-label="Hoja">
      <h2 class="sheet-title">Hoja</h2>
      <label class="field"><span>Nombre</span><input id="sh-name" maxlength="31" value="${esc(sh.name)}" /></label>
      <div class="action-grid">
        <button type="button" data-a="dup">${icon('copy', 18)}Duplicar</button>
        <button type="button" data-a="left" ${si === 0 ? 'disabled' : ''}>${icon('back', 18)}Mover a la izquierda</button>
        <button type="button" data-a="right" ${si === wb.sheets.length - 1 ? 'disabled' : ''}>${icon('chevron', 18)}Mover a la derecha</button>
        <button type="button" data-a="hide" ${visible < 2 ? 'disabled' : ''}>${icon('eyeoff', 18)}Ocultar</button>
        <button type="button" data-a="del" class="danger" ${visible < 2 ? 'disabled' : ''}>${icon('trash', 18)}Eliminar</button>
      </div>
      ${hiddenList.length ? `<p class="opt-label">Ocultas</p><div class="action-grid">${hiddenList.map(([s, i]) => `<button type="button" data-show="${i}">${icon('eye', 18)}${esc(s.name)}</button>`).join('')}</div>` : ''}
      <div class="sheet-actions"><button type="button" class="done-btn" data-close>Listo</button></div>
    </div>`;
  const nameIn = back.querySelector('#sh-name');
  const close = () => { renameSheet(nameIn.value); closeSheet(); };
  back.querySelector('[data-close]').addEventListener('click', close);
  nameIn.addEventListener('keydown', (e) => { if (e.key === 'Enter') close(); });
  back.querySelectorAll('[data-show]').forEach((b) => b.addEventListener('click', () => {
    const i = Number(b.dataset.show);
    structural(() => { delete wb.sheets[i].hidden; });
    closeSheet(); switchSheet(i); renderTabs();
  }));
  back.querySelectorAll('[data-a]').forEach((b) => b.addEventListener('click', () => {
    const a = b.dataset.a;
    if (a === 'del') { confirmDeleteSheet(); return; }
    closeSheet();
    if (a === 'dup') {
      structural(() => {
        const copy = restoreWb({ ...serializeWb(wb), sheets: [serializeWb(wb).sheets[si]] }).sheets[0];
        copy.id = uid();
        copy.name = uniqueSheetName(`${sh.name} copia`);
        wb.sheets.splice(si + 1, 0, copy);
      });
      switchSheet(si + 1);
      renderTabs();
    } else if (a === 'left' || a === 'right') {
      const to = si + (a === 'left' ? -1 : 1);
      structural(() => { const [x] = wb.sheets.splice(si, 1); wb.sheets.splice(to, 0, x); });
      si = to;
      renderTabs();
    } else if (a === 'hide') {
      structural(() => { sh.hidden = true; });
      switchSheet(wb.sheets.findIndex((s) => !s.hidden));
    }
  }));
}
function confirmDeleteSheet() {
  const sh = sheet();
  const back = newSheet(true);
  back.innerHTML = `
    <div class="sheet" role="dialog" aria-modal="true" aria-label="Eliminar hoja">
      <h2 class="sheet-title">¿Eliminar «${esc(sh.name)}»?</h2>
      <p class="small muted">Las fórmulas de otras hojas que la usen darán error. Se puede deshacer.</p>
      <div class="sheet-actions">
        <button type="button" class="ghost-btn" data-close>Cancelar</button>
        <button type="button" class="done-btn danger-fill" data-ok>Eliminar</button>
      </div>
    </div>`;
  back.querySelector('[data-close]').addEventListener('click', closeSheet);
  back.querySelector('[data-ok]').addEventListener('click', () => {
    closeSheet();
    structural(() => { wb.sheets.splice(si, 1); });
    si = Math.min(si, wb.sheets.length - 1);
    if (wb.sheets[si].hidden) si = wb.sheets.findIndex((s) => !s.hidden);
    switchSheet(si);
    renderTabs();
  });
}

// ---------- Ventanitas ----------
function closePop() { $('pop').hidden = true; }
function openPop(btn, html, bind) {
  const pop = $('pop');
  pop.innerHTML = html;
  pop.hidden = false;
  const r = btn.getBoundingClientRect();
  pop.style.left = `${clamp(r.left, 8, Math.max(8, window.innerWidth - pop.offsetWidth - 8))}px`;
  pop.style.top = `${r.bottom + 6}px`;
  bind?.(pop);
}
// Al soltar tras una pulsación larga llega un clic que no debe cerrar el menú recién abierto
let keepPopOnce = false;
document.addEventListener('click', (e) => {
  if (keepPopOnce) { keepPopOnce = false; return; }
  if (!e.target.closest('#pop')) closePop();
});
const SWATCHES = ['#000000', '#434343', '#7f7f7f', '#c0c0c0', '#ffffff', '#c00000', '#e53935', '#f57c00', '#fbc02d', '#ffeb3b',
  '#2e7d32', '#22c55e', '#00897b', '#00acc1', '#1e88e5', '#1a237e', '#5e35b1', '#8e24aa', '#d81b60', '#795548',
  '#fde2e2', '#fff3cd', '#d4edda', '#d1ecf1', '#dbe5f1'];
function openColorPop(btn, key) {
  openPop(btn, `<div class="swatches">${SWATCHES.map((c) => `<button type="button" class="swatch" data-c="${c}" style="background:${c}" aria-label="${c}"></button>`).join('')}</div>
    <button type="button" class="pop-item" data-c="">Sin color</button>`, (p) => {
    p.querySelectorAll('[data-c]').forEach((b) => b.addEventListener('click', () => { closePop(); patchStyle({ [key]: b.dataset.c || undefined }); }));
  });
}
function openSizePop(btn) {
  openPop(btn, `<div class="pop-col">${[8, 9, 10, 11, 12, 14, 16, 18, 20, 24, 28, 36].map((s) => `<button type="button" class="pop-item" data-s="${s}">${s}</button>`).join('')}</div>`, (p) => {
    p.querySelectorAll('[data-s]').forEach((b) => b.addEventListener('click', () => { closePop(); const v = Number(b.dataset.s); patchStyle({ fs: v === 11 ? undefined : v }); }));
  });
}
function openBorderPop(btn) {
  openPop(btn, ['all:Todos', 'outer:Contorno', 'bottom:Abajo', 'top:Arriba', 'none:Sin bordes'].map((x) => { const [k, l] = x.split(':'); return `<button type="button" class="pop-item" data-b="${k}">${l}</button>`; }).join(''), (p) => {
    p.querySelectorAll('[data-b]').forEach((b) => b.addEventListener('click', () => { closePop(); setBorders(b.dataset.b); }));
  });
}
function openFormatPop(btn) {
  openPop(btn, NUM_FORMATS.map(([l, f, ex], i) => `<button type="button" class="pop-item" data-i="${i}"><span>${l}</span><span class="muted">${esc(ex)}</span></button>`).join(''), (p) => {
    p.querySelectorAll('[data-i]').forEach((b) => b.addEventListener('click', () => { closePop(); const f = NUM_FORMATS[b.dataset.i][1]; patchStyle({ nf: f === 'General' ? undefined : f }); }));
  });
}
function openSumPop(btn) {
  openPop(btn, ['SUMA:Suma', 'PROMEDIO:Promedio', 'CONTAR:Contar números', 'MAX:Máximo', 'MIN:Mínimo'].map((x) => { const [k, l] = x.split(':'); return `<button type="button" class="pop-item" data-f="${k}">${l}</button>`; }).join(''), (p) => {
    p.querySelectorAll('[data-f]').forEach((b) => b.addEventListener('click', () => { closePop(); autoSum(b.dataset.f); }));
  });
}
function openFunctions() {
  const back = newSheet();
  let cat = 'Todas', q = '';
  back.innerHTML = `
    <div class="sheet tall" role="dialog" aria-modal="true" aria-label="Funciones">
      <h2 class="sheet-title">Funciones</h2>
      <input id="fn-search" class="text-in" placeholder="Buscar: suma, fecha, buscar…" autocomplete="off" />
      <div class="chips">${['Todas', ...CATS].map((c) => `<button type="button" class="chip ${c === cat ? 'on' : ''}" data-c="${c}">${c}</button>`).join('')}</div>
      <div class="fn-list" id="fn-list"></div>
      <div class="sheet-actions"><button type="button" class="ghost-btn" data-close>Cerrar</button></div>
    </div>`;
  const draw = () => {
    const low = q.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
    const list = FN_DOC.filter((d) => (cat === 'Todas' || d.cat === cat)
      && (!low || `${d.es} ${d.key} ${d.text}`.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().includes(low)));
    back.querySelector('#fn-list').innerHTML = list.map((d) => `<button type="button" class="fn-item" data-k="${d.key}"><b>${esc(d.es)}</b><span>${esc(d.text)}</span><code>${esc(d.es)}(${esc(d.args)})</code></button>`).join('')
      || '<p class="muted small">Sin resultados</p>';
    back.querySelectorAll('.fn-item').forEach((b) => b.addEventListener('click', () => {
      const d = FN_DOC.find((x) => x.key === b.dataset.k);
      closeSheet();
      if (edit) {
        const inp = activeInput(), p = inp.selectionStart, t = `${d.es}(`;
        inp.value = inp.value.slice(0, p) + t + inp.value.slice(inp.selectionEnd);
        inp.focus();
        inp.setSelectionRange(p + t.length, p + t.length);
        syncInputs(inp);
      } else startEdit(`=${d.es}(`);
    }));
  };
  draw();
  const inp = back.querySelector('#fn-search');
  inp.addEventListener('input', () => { q = inp.value; draw(); });
  back.querySelectorAll('.chip').forEach((b) => b.addEventListener('click', () => {
    cat = b.dataset.c;
    back.querySelectorAll('.chip').forEach((x) => x.classList.toggle('on', x === b));
    draw();
  }));
  back.querySelector('[data-close]').addEventListener('click', closeSheet);
}
function openFind() {
  if (edit && !commitEdit()) return;
  const back = newSheet();
  back.innerHTML = `
    <div class="sheet" role="dialog" aria-modal="true" aria-label="Buscar y reemplazar">
      <h2 class="sheet-title">Buscar y reemplazar</h2>
      <label class="field"><span>Buscar</span><input id="fd-q" autocomplete="off" /></label>
      <label class="field"><span>Reemplazar por</span><input id="fd-r" autocomplete="off" /></label>
      <p class="small muted" id="fd-note">&nbsp;</p>
      <div class="sheet-actions">
        <button type="button" class="ghost-btn" data-close>Cerrar</button>
        <button type="button" class="ghost-btn" data-all>Reemplazar todo</button>
        <button type="button" class="done-btn" data-next>Siguiente</button>
      </div>
    </div>`;
  const q = back.querySelector('#fd-q'), rep = back.querySelector('#fd-r'), note = back.querySelector('#fd-note');
  const matches = () => {
    const low = q.value.toLowerCase(), out = [];
    if (!low) return out;
    for (const r of [...sheet().cells.keys()].sort((a, b) => a - b)) {
      for (const c of [...sheet().cells.get(r).keys()].sort((a, b) => a - b)) {
        const x = getCell(sheet(), r, c);
        if (editText(x, styleOf(x).nf).toLowerCase().includes(low) || displayValue(calc.safe(si, r, c), styleOf(x).nf).text.toLowerCase().includes(low)) out.push([r, c]);
      }
    }
    return out;
  };
  back.querySelector('[data-next]').addEventListener('click', () => {
    const list = matches();
    if (!list.length) { note.textContent = 'Sin resultados'; return; }
    const i = list.findIndex(([r, c]) => r > sel.ar || (r === sel.ar && c > sel.ac));
    const n = i < 0 ? 0 : i;
    const [r, c] = list[n];
    setSel(r, c);
    reveal(r, c);
    note.textContent = `${n + 1} de ${list.length}: ${a1(r, c)}`;
  });
  back.querySelector('[data-all]').addEventListener('click', () => {
    const list = matches(), low = q.value.toLowerCase();
    if (!low) return;
    const re = new RegExp(q.value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
    begin();
    let n = 0;
    for (const [r, c] of list) {
      const x = getCell(sheet(), r, c);
      const t = editText(x, styleOf(x).nf);
      if (!t.toLowerCase().includes(low)) continue;
      if (enterValue(r, c, t.replace(re, () => rep.value))) n++;
    }
    commitTx();
    note.textContent = `${n} ${n === 1 ? 'reemplazo' : 'reemplazos'}`;
  });
  back.querySelector('[data-close]').addEventListener('click', closeSheet);
  q.focus();
}
function openContext(x, y) {
  const whole = sel.r2 >= MAX_ROWS - 1 ? 'col' : sel.c2 >= MAX_COLS - 1 ? 'row' : null;
  const items = [
    ['cut', 'Cortar', () => { const t = copySel(true); navigator.clipboard?.writeText(t).catch(() => {}); }],
    ['copy', 'Copiar', () => { const t = copySel(false); navigator.clipboard?.writeText(t).catch(() => {}); }],
    ['paste', 'Pegar', () => menuPaste(false)],
    ['paste', 'Pegar solo valores', () => menuPaste(true)],
    null,
    ['close', 'Borrar contenido', () => { clearSel(); renderChrome(); }],
    ['trash', 'Borrar contenido y formato', () => { clearSel('all'); renderChrome(); }],
    null,
  ];
  if (isTouch) {
    items.push(['rows', 'Rellenar hacia abajo', () => fillSelection('down')], ['cols', 'Rellenar a la derecha', () => fillSelection('right')], null);
  }
  if (whole !== 'col') items.push(['rows', 'Insertar fila encima', () => insertRows(false)], ['rows', 'Insertar fila debajo', () => insertRows(true)], ['trash', 'Eliminar fila', deleteRows]);
  if (whole !== 'row') items.push(['cols', 'Insertar columna a la izquierda', () => insertCols(false)], ['cols', 'Insertar columna a la derecha', () => insertCols(true)], ['trash', 'Eliminar columna', deleteCols]);
  items.push(null);
  if (whole === 'col') items.push(['eyeoff', 'Ocultar columna', () => setHidden('c', true)], ['eye', 'Mostrar columnas ocultas', () => setHidden('c', false)]);
  else if (whole === 'row') items.push(['eyeoff', 'Ocultar fila', () => setHidden('r', true)], ['eye', 'Mostrar filas ocultas', () => setHidden('r', false)]);
  const pop = $('pop');
  pop.innerHTML = `<div class="ctx">${items.map((m, i) => (m ? `<button type="button" class="pop-item left" data-i="${i}">${icon(m[0], 18)}<span>${m[1]}</span></button>` : '<hr/>')).join('')}</div>`;
  pop.hidden = false;
  const H = window.innerHeight, W = window.innerWidth;
  pop.style.left = `${clamp(x, 8, Math.max(8, W - pop.offsetWidth - 8))}px`;
  pop.style.top = `${clamp(y, 8, Math.max(8, H - pop.offsetHeight - 8))}px`;
  pop.querySelectorAll('[data-i]').forEach((b) => b.addEventListener('click', (e) => { e.stopPropagation(); closePop(); items[b.dataset.i][2](); }));
}
function fillSelection(dir) {
  // Copia la primera fila (o columna) de la selección sobre el resto
  const keep = { ...sel };
  if (dir === 'down' && keep.r2 > keep.r1) { sel = { ...keep, r2: keep.r1 }; fillTo({ ...keep }); } else if (dir === 'right' && keep.c2 > keep.c1) { sel = { ...keep, c2: keep.c1 }; fillTo({ ...keep }); }
}

// ---------- Hojas emergentes ----------
function newSheet(center = false) {
  closeSheet();
  const b = document.createElement('div');
  b.id = 'sheet-back';
  b.className = `sheet-backdrop${center ? ' center' : ''}`;
  b.addEventListener('click', (e) => { if (e.target === b) closeSheet(); });
  document.body.append(b);
  return b;
}
function closeSheet() { $('sheet-back')?.remove(); }
document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && $('sheet-back')) closeSheet(); });

// ---------- Inicio: lista de libros ----------
const fmtDate = (t) => new Date(t).toLocaleString(LOCALE, { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
async function renderHome() {
  let list = [];
  try { list = await listBooks(); } catch (_) { toast('Este navegador no permite guardar libros', { warn: true }); }
  list.sort((a, b) => b.updated - a.updated);
  $('view').innerHTML = `
    <section class="intro"><p class="intro-text">Hojas de cálculo sencillas, con las fórmulas de siempre y compatibles con Excel. <span id="cloud-note">${cloudNoteText()}</span></p></section>
    <div class="home-actions">
      <button type="button" class="big-btn primary" id="new-book">${icon('plus', 20)}Nuevo libro</button>
      <button type="button" class="big-btn" id="open-file">${icon('upload', 20)}Abrir archivo</button>
    </div>
    <p class="label">Tus libros</p>
    ${list.length ? `<div class="book-list">${list.map((b) => `
      <div class="book">
        <button type="button" class="book-main" data-open="${esc(b.id)}">
          <span class="book-icon">${icon('sheet', 22)}</span>
          <span class="book-text"><b>${esc(b.name)}</b><small>${fmtDate(b.updated)} · ${Number(b.sheets) || 1} ${Number(b.sheets) === 1 ? 'hoja' : 'hojas'}</small></span>
        </button>
        <button type="button" class="book-more" data-more="${esc(b.id)}" aria-label="Opciones de ${esc(b.name)}">${icon('chevron', 18)}</button>
      </div>`).join('')}</div>` : '<p class="empty">Aún no hay ningún libro. Crea uno nuevo o abre un .xlsx.</p>'}`;
  $('new-book').addEventListener('click', () => { track('/nuevo'); createBook(); });
  $('open-file').addEventListener('click', () => $('file-input').click());
  $('view').querySelectorAll('[data-open]').forEach((b) => b.addEventListener('click', () => openBook(b.dataset.open)));
  $('view').querySelectorAll('[data-more]').forEach((b) => b.addEventListener('click', () => bookActions(list.find((x) => x.id === b.dataset.more))));
}
function bookActions(meta) {
  const back = newSheet();
  back.innerHTML = `
    <div class="sheet" role="dialog" aria-modal="true" aria-label="Libro">
      <h2 class="sheet-title">${esc(meta.name)}</h2>
      <label class="field"><span>Nombre</span><input id="bk-name" value="${esc(meta.name)}" maxlength="80" /></label>
      <div class="action-grid">
        <button type="button" data-a="xlsx">${icon('download', 18)}Exportar .xlsx</button>
        <button type="button" data-a="dup">${icon('copy', 18)}Duplicar</button>
        <button type="button" data-a="del" class="danger">${icon('trash', 18)}Eliminar</button>
      </div>
      <div class="sheet-actions"><button type="button" class="done-btn" data-close>Listo</button></div>
    </div>`;
  const nameIn = back.querySelector('#bk-name');
  const rename = async () => {
    const name = nameIn.value.trim();
    if (!name || name === meta.name) return;
    const row = await getBook(meta.id);
    row.data.name = name;
    await putBook(meta.id, { ...meta, name, id: undefined, updated: Date.now() }, row.data);
  };
  back.querySelector('[data-close]').addEventListener('click', async () => { await rename(); closeSheet(); renderHome(); });
  back.querySelectorAll('[data-a]').forEach((b) => b.addEventListener('click', async () => {
    const a = b.dataset.a;
    await rename();
    const row = await getBook(meta.id);
    if (a === 'del') { confirmDeleteBook(meta); return; }
    closeSheet();
    if (a === 'xlsx') { await downloadXlsx(restoreWb(row.data), nameIn.value.trim() || meta.name); }
    if (a === 'dup') {
      const name = `${meta.name} copia`;
      await putBook(uid(), { name, updated: Date.now(), sheets: meta.sheets }, { ...row.data, name });
    }
    renderHome();
  }));
}
function confirmDeleteBook(meta) {
  const back = newSheet(true);
  back.innerHTML = `
    <div class="sheet" role="dialog" aria-modal="true" aria-label="Eliminar libro">
      <h2 class="sheet-title">¿Eliminar «${esc(meta.name)}»?</h2>
      <p class="small muted">${Cloud.account ? 'Se quita de todos tus dispositivos. Podrás recuperarlo durante 30 días desde la papelera de CloudCTRL.' : 'Se borra de este dispositivo y no se puede recuperar.'}</p>
      <div class="sheet-actions">
        <button type="button" class="ghost-btn" data-close>Cancelar</button>
        <button type="button" class="done-btn danger-fill" data-ok>Eliminar</button>
      </div>
    </div>`;
  back.querySelector('[data-close]').addEventListener('click', closeSheet);
  back.querySelector('[data-ok]').addEventListener('click', async () => {
    await delBook(meta.id);
    Cloud.forget('sheet', meta.id);
    closeSheet();
    renderHome();
    Cloud.schedule(cloudAdapter, 0);
  });
}
function emptyWorkbook(name) { return { name, sheets: [newSheetData('Hoja1')], names: {}, styles: [{}] }; }
async function createBook() {
  const list = await listBooks().catch(() => []);
  let n = 1;
  while (list.some((b) => b.name === `Libro ${n}`)) n++;
  wb = emptyWorkbook(`Libro ${n}`);
  bookId = uid();
  showEditor();
  dirty = true;
  flush();
}
async function openBook(id) {
  const row = await getBook(id);
  if (!row) { toast('No se encuentra ese libro', { warn: true }); return; }
  wb = restoreWb(row.data);
  bookId = id;
  track('/abrir');
  showEditor();
}
function showEditor() {
  calc = new Calc(wb);
  si = Math.max(0, wb.sheets.findIndex((s) => !s.hidden));
  sel = { r1: 0, c1: 0, r2: 0, c2: 0, ar: 0, ac: 0 };
  undoStack = []; redoStack = []; clip = null; edit = null; zoom = 1;
  $('app').hidden = true;
  $('editor').hidden = false;
  document.body.classList.add('editing');
  $('book-name').value = wb.name;
  $('save-state').textContent = 'Guardado';
  $('zoom-label').textContent = '100 %';
  readPalette();
  buildLayout();
  scroller().scrollTop = 0; scroller().scrollLeft = 0;
  renderTabs();
  renderChrome();
  schedule();
}
async function closeEditor() {
  if (edit && !commitEdit()) return;
  await flush();
  wb = null;
  $('editor').hidden = true;
  $('app').hidden = false;
  document.body.classList.remove('editing');
  await renderHome();
  Cloud.schedule(cloudAdapter, 0);
}
// Abrir archivos
async function importFile(file) {
  const name = file.name.replace(/\.[^.]+$/, '');
  const ext = (/\.([^.]+)$/.exec(file.name)?.[1] || '').toLowerCase();
  try {
    let book, warnings = [];
    if (ext === 'xlsx' || ext === 'xlsm') {
      toast('Leyendo archivo…', { stay: true });
      const r = await readXlsx(await file.arrayBuffer(), name);
      book = r.wb; warnings = r.warnings;
    } else if (ext === 'csv' || ext === 'tsv' || ext === 'txt') {
      book = emptyWorkbook(name);
      parseCsv(await file.text()).forEach((row, r) => row.forEach((t, c) => {
        const p = parseInput(t);
        if (p.v === undefined) return;
        const x = ensureCell(book.sheets[0], r, c);
        x.v = p.v;
        if (p.nf) x.s = internStyle(book, { nf: p.nf });
      }));
    } else if (ext === 'xls') {
      toast('El formato .xls antiguo no se puede abrir: guárdalo antes como .xlsx', { warn: true });
      return;
    } else {
      toast('Solo se abren archivos .xlsx y .csv', { warn: true });
      return;
    }
    if (edit && !commitEdit()) return;
    await flush();
    wb = book;
    bookId = uid();
    track(`/importar/${ext}`);
    showEditor();
    dirty = true;
    await flush();
    $('toast').hidden = true;
    if (warnings.length) showImportNote(warnings);
  } catch (err) {
    console.error(err);
    toast('No se ha podido leer el archivo', { warn: true });
  }
}
function showImportNote(warnings) {
  const back = newSheet(true);
  back.innerHTML = `
    <div class="sheet" role="dialog" aria-modal="true" aria-label="Aviso">
      <h2 class="sheet-title">Abierto con algún límite</h2>
      <p class="small">Este archivo tiene <b>${warnings.map(esc).join(', ')}</b>, que SheetCTRL no conserva. Los datos, las fórmulas y los formatos sí.</p>
      <p class="small muted">Tu archivo original no cambia. Si exportas desde aquí, esas partes no estarán en la copia nueva.</p>
      <div class="sheet-actions"><button type="button" class="done-btn" data-close>Entendido</button></div>
    </div>`;
  back.querySelector('[data-close]').addEventListener('click', closeSheet);
}
// Guardar: en móvil se abre el menú de compartir (en una app instalada es la vía fiable)
async function saveBlob(blob, filename) {
  const file = new File([blob], filename, { type: blob.type });
  if (isTouch && navigator.canShare?.({ files: [file] })) {
    try { await navigator.share({ files: [file] }); return; } catch (e) { if (e.name === 'AbortError') return; }
  }
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  document.body.append(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 30000);
}
const safeName = (n) => (n || 'Libro').replace(/[\\/:*?"<>|]/g, '-').trim() || 'Libro';
async function downloadXlsx(book, name) {
  try { await saveBlob(await writeXlsx(book), `${safeName(name)}.xlsx`); } catch (err) { console.error(err); toast('No se ha podido exportar', { warn: true }); }
}
async function exportXlsx() {
  if (edit && !commitEdit()) return;
  track('/exportar/xlsx');
  await downloadXlsx(wb, wb.name);
  calc.invalidate();
  schedule();
}
function exportCsv() {
  if (edit && !commitEdit()) return;
  track('/exportar/csv');
  saveBlob(new Blob([sheetToCsv(sheet(), wb, si)], { type: 'text/csv;charset=utf-8' }), `${safeName(wb.name)} - ${safeName(sheet().name)}.csv`);
}

// ---------- Menú ⋯ ----------
const menuItems = () => (wb ? [
  { label: 'Exportar .xlsx', icon: 'download', run: exportXlsx },
  { label: 'Exportar hoja a .csv', icon: 'download', run: exportCsv },
  { label: 'Funciones', icon: 'fx', run: openFunctions },
  { label: 'Buscar y reemplazar', icon: 'search', run: openFind },
  { label: 'Opciones de visualización', icon: 'palette', run: openDisplaySheet },
  { label: 'Información', icon: 'info', run: openInfoSheet },
] : [
  { label: 'Nuevo libro', icon: 'plus', run: createBook },
  { label: 'Abrir archivo', icon: 'upload', run: () => $('file-input').click() },
  { label: 'Nube', icon: 'cloud', run: openCloudSheet },
  { label: 'Opciones de visualización', icon: 'palette', run: openDisplaySheet },
  { label: 'Información', icon: 'info', run: openInfoSheet },
]);
let menuAnchor = null;
function openMenu(btn) {
  const menu = $('menu'), items = menuItems();
  menuAnchor = btn;
  menu.innerHTML = items.map((m, i) =>
    `<button class="menu-item" role="menuitem" data-i="${i}">${icon(m.icon, 20)}<span>${m.label}</span></button>`).join('');
  menu.querySelectorAll('.menu-item').forEach((b) => b.addEventListener('click', () => {
    closeMenu();
    trackLabel(items[b.dataset.i].label);
    items[b.dataset.i].run();
  }));
  const r = btn.getBoundingClientRect();
  menu.style.top = `${r.bottom + 6}px`;
  menu.style.right = `${Math.max(8, window.innerWidth - r.right)}px`;
  menu.hidden = false;
  btn.setAttribute('aria-expanded', 'true');
}
function closeMenu() {
  $('menu').hidden = true;
  menuAnchor?.setAttribute('aria-expanded', 'false');
}
['menu-btn', 'ed-menu-btn'].forEach((id) => $(id).addEventListener('click', (e) => {
  e.stopPropagation();
  if ($('menu').hidden) openMenu(e.currentTarget);
  else closeMenu();
}));
document.addEventListener('click', (e) => { if (!$('menu').hidden && !e.target.closest('#menu')) closeMenu(); });

function openInfoSheet() {
  const back = newSheet(true);
  back.innerHTML = `
    <div class="sheet" role="dialog" aria-modal="true" aria-label="Información">
      <span class="install-logo">${logoSVG(56)}</span>
      <h2 class="sheet-title">SheetCTRL</h2>
      <p class="small muted">Versión ${APP_VERSION} · by OmT Finance</p>
      <p class="small">Hojas de cálculo con ${FN_DOC.length} funciones en español, que abre y guarda archivos .xlsx de Excel y .csv.</p>
      <p class="small muted">${Cloud.account ? 'Tus libros se guardan en este dispositivo y en tu nube de CloudCTRL, cifrados.' : 'Tus libros se guardan solo en este dispositivo. Para tenerlos en la nube, conéctate a CloudCTRL desde ⋯ → Nube.'}</p>
      <div class="sheet-actions"><button type="button" class="done-btn" data-close>Cerrar</button></div>
    </div>`;
  back.querySelector('[data-close]').addEventListener('click', closeSheet);
}

// ---------- Opciones de visualización (modo y fondo) ----------

const WALLS = {
  hoja: { name: 'Hoja', c: ['34 197 94', '134 239 172', '22 163 74', '21 128 61'] },
  noche: { name: 'Noche', c: ['71 85 105', '100 116 139', '37 99 235', '30 58 138'] },
  menta: { name: 'Menta', c: ['45 212 191', '153 246 228', '20 184 166', '15 118 110'] },
  arena: { name: 'Arena', c: ['217 170 90', '245 222 179', '180 130 60', '133 92 40'] },
};
const lightQuery = matchMedia('(prefers-color-scheme: light)');
let display = { theme: 'auto', wall: 'hoja', ...load(DISPLAY_KEY, {}) };
if (!WALLS[display.wall]) display.wall = 'hoja';

function applyDisplay() {
  const light = display.theme === 'light' || (display.theme === 'auto' && lightQuery.matches);
  document.documentElement.dataset.theme = light ? 'light' : 'dark';
  document.documentElement.dataset.wall = display.wall;
  document.querySelector('meta[name="theme-color"]').setAttribute('content', light ? '#f2fbf4' : '#07120b');
  readPalette();
  if (wb) schedule();
}
lightQuery.addEventListener('change', () => { if (display.theme === 'auto') applyDisplay(); });

function wallPreview(key) {
  const [c1, c2, c3, c4] = WALLS[key].c;
  const light = document.documentElement.dataset.theme === 'light';
  const a = light ? 0.4 : 0.5;
  const base = light ? '#f2fbf4' : '#07120b';
  return `radial-gradient(70% 60% at 15% 10%, rgb(${c1} / ${a}), transparent 70%), radial-gradient(60% 55% at 90% 25%, rgb(${c2} / ${a * 0.8}), transparent 72%),
    radial-gradient(70% 60% at 75% 95%, rgb(${c3} / ${a * 0.85}), transparent 70%), radial-gradient(60% 55% at 5% 85%, rgb(${c4} / ${a * 0.8}), transparent 72%), ${base}`;
}

function openDisplaySheet() {
  const back = newSheet();
  const draw2 = () => {
    back.innerHTML = `
      <div class="sheet" role="dialog" aria-modal="true" aria-label="Opciones de visualización">
        <h2 class="sheet-title">Opciones de visualización</h2>
        <p class="opt-label">Modo</p>
        <div class="seg" role="group" aria-label="Modo">
          ${[['dark', 'Oscuro'], ['light', 'Claro'], ['auto', 'Automático']].map(([v, l]) =>
            `<button type="button" data-theme-opt="${v}" class="${display.theme === v ? 'on' : ''}" aria-pressed="${display.theme === v}">${l}</button>`).join('')}
        </div>
        <p class="muted small">${display.theme === 'auto' ? 'Sigue el modo claro u oscuro del sistema.' : '&nbsp;'}</p>
        <p class="opt-label">Fondo</p>
        <div class="walls">
          ${Object.entries(WALLS).map(([k, w]) =>
            `<button type="button" class="wall ${display.wall === k ? 'on' : ''}" data-wall-opt="${k}" style="background:${wallPreview(k)}" aria-pressed="${display.wall === k}">${w.name}</button>`).join('')}
        </div>
        <div class="sheet-actions"><button class="done-btn" type="button">Listo</button></div>
      </div>`;
    back.querySelectorAll('[data-theme-opt]').forEach((b) => b.addEventListener('click', () => {
      display.theme = b.dataset.themeOpt;
      save(DISPLAY_KEY, display);
      applyDisplay();
      draw2();
    }));
    back.querySelectorAll('[data-wall-opt]').forEach((b) => b.addEventListener('click', () => {
      display.wall = b.dataset.wallOpt;
      save(DISPLAY_KEY, display);
      applyDisplay();
      draw2();
    }));
    back.querySelector('.done-btn').addEventListener('click', closeSheet);
  };
  draw2();
}

// ---------- Aviso breve ----------

let toastTimer = 0;
function toast(text, { warn = false, stay = false } = {}) {
  const el = $('toast');
  el.textContent = text;
  el.classList.toggle('warn', warn);
  el.hidden = false;
  clearTimeout(toastTimer);
  if (!stay) toastTimer = setTimeout(() => { el.hidden = true; }, warn ? 5000 : 2400);
}

// ---------- Pantalla de inicio ----------
// Sin botón Entrar: el logo aparece (el arco se dibuja), se ve un instante y se pasa sola a la app
// con la transición de cristal, como en las demás apps.
const SPLASH_HOLD_MS = 1700;
const SPLASH_OUT_MS = 1200;
function enterApp() {
  const body = document.body;
  if (!$('splash') || body.classList.contains('entering')) return;
  body.classList.add('entering');
  setTimeout(() => {
    $('splash').remove();
    body.classList.remove('booting', 'entering');
    maybeShowInstallHint();
  }, SPLASH_OUT_MS);
}
setTimeout(enterApp, SPLASH_HOLD_MS);

// ---------- Aviso: añadir a la pantalla de inicio (solo móvil y tablet) ----------

const ua = navigator.userAgent;
const isIOS = /iPhone|iPad|iPod/.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1);
const isAndroid = /Android/.test(ua);
const isStandalone = () => matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;
const HINT_ICONS = {
  share: '<path d="M12 3.5v11M8 7.5l4-4 4 4"/><path d="M7 10.5H6a1.5 1.5 0 0 0-1.5 1.5v7A1.5 1.5 0 0 0 6 20.5h12a1.5 1.5 0 0 0 1.5-1.5v-7a1.5 1.5 0 0 0-1.5-1.5h-1"/>',
  more: '<circle cx="12" cy="5.5" r="1.5" fill="currentColor"/><circle cx="12" cy="12" r="1.5" fill="currentColor"/><circle cx="12" cy="18.5" r="1.5" fill="currentColor"/>',
  add: '<rect x="4" y="4" width="16" height="16" rx="3.5"/><path d="M12 8.5v7M8.5 12h7"/>',
  check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
};
const hintIcon = (name) =>
  `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${HINT_ICONS[name]}</svg>`;

function maybeShowInstallHint() {
  if (!(isIOS || isAndroid) || isStandalone()) return;
  if (load(INSTALL_HINT_KEY, null) === 'off') return;
  const steps = isIOS
    ? [
        ['share', 'Pulsa el botón <b>Compartir</b> de Safari (abajo en el iPhone, arriba en el iPad).'],
        ['add', 'Desliza hacia abajo y elige <b>Añadir a pantalla de inicio</b>.'],
        ['check', 'Pulsa <b>Añadir</b>. El icono de SheetCTRL aparecerá junto a tus apps.'],
      ]
    : [
        ['more', 'Pulsa el menú <b>⋮</b> de Chrome, arriba a la derecha.'],
        ['add', 'Elige <b>Añadir a pantalla de inicio</b> o <b>Instalar aplicación</b>.'],
        ['check', 'Confirma con <b>Instalar</b>. El icono de SheetCTRL aparecerá junto a tus apps.'],
      ];
  const back = newSheet(true);
  back.innerHTML = `
    <div class="sheet install-sheet" role="dialog" aria-modal="true" aria-labelledby="install-title">
      <span class="install-logo">${logoSVG(56)}</span>
      <h2 class="sheet-title" id="install-title">Añade SheetCTRL a tu pantalla de inicio</h2>
      <p class="muted small">Así la abrirás como una app más, a pantalla completa y con un solo toque.</p>
      <ol class="install-steps">
        ${steps.map(([ic, text]) => `<li><span class="step-icon">${hintIcon(ic)}</span><span>${text}</span></li>`).join('')}
      </ol>
      <div class="install-footer">
        <label class="no-more"><input type="checkbox" id="install-no-more" /> No mostrar más</label>
        <button class="done-btn" type="button" id="install-ok">Aceptar</button>
      </div>
    </div>`;
  back.querySelector('#install-ok').addEventListener('click', () => {
    if (back.querySelector('#install-no-more').checked) save(INSTALL_HINT_KEY, 'off');
    closeSheet();
  });
}

// ---------- Sin zoom del navegador (Safari en iOS ignora user-scalable=no) ----------
document.addEventListener('gesturestart', (e) => e.preventDefault());

// ---------- Conexión de eventos ----------
function resizeSoon() {
  setTimeout(() => { fitViewport(); schedule(); }, 60);
}
// Con el teclado del móvil abierto, el editor ocupa solo lo que queda visible
function fitViewport() {
  const vv = window.visualViewport;
  document.documentElement.style.setProperty('--vvh', `${vv ? vv.height : window.innerHeight}px`);
  if (document.body.classList.contains('editing')) window.scrollTo(0, 0);
}
window.visualViewport?.addEventListener('resize', () => { fitViewport(); schedule(); });
window.addEventListener('resize', () => { closeMenu(); closePop(); fitViewport(); schedule(); });
fitViewport();

const sc0 = $('scroller');
sc0.addEventListener('scroll', () => { closeAssistIfTouch(); schedule(); }, { passive: true });
function closeAssistIfTouch() { if (isTouch && !edit) closePop(); }
sc0.addEventListener('click', () => { if (editOnClick) { editOnClick = false; startEdit(); } });
sc0.addEventListener('pointerdown', onPointerDown);
sc0.addEventListener('pointermove', onPointerMove);
sc0.addEventListener('pointerup', onPointerUp);
sc0.addEventListener('pointercancel', () => { clearTimeout(autoTimer); if (drag?.type === 'tap') drag = null; });
// El tirador de selección debe mover la selección, no la hoja
sc0.addEventListener('touchstart', (e) => {
  if (e.touches.length !== 1) return;
  const { x, y } = wrapPoint(e.touches[0]);
  const z = hit(x, y).zone;
  if (z === 'handle' || z === 'colsize' || z === 'rowsize') e.preventDefault();
}, { passive: false });
sc0.addEventListener('contextmenu', (e) => {
  e.preventDefault();
  if (edit && !commitEdit()) return;
  const { x, y } = wrapPoint(e);
  const h = hit(x, y);
  if (h.zone === 'cell' && !(h.r >= sel.r1 && h.r <= sel.r2 && h.c >= sel.c1 && h.c <= sel.c2)) setSel(h.r, h.c);
  if (h.zone === 'col' && !(h.c >= sel.c1 && h.c <= sel.c2 && sel.r2 >= MAX_ROWS - 1)) sel = { r1: 0, r2: MAX_ROWS - 1, c1: h.c, c2: h.c, ar: sel.ar, ac: h.c };
  if (h.zone === 'row' && !(h.r >= sel.r1 && h.r <= sel.r2 && sel.c2 >= MAX_COLS - 1)) sel = { r1: h.r, r2: h.r, c1: 0, c2: MAX_COLS - 1, ar: h.r, ac: sel.ac };
  renderChrome(); schedule();
  openContext(e.clientX, e.clientY);
});

[fxEl(), cellEl()].forEach((el) => {
  el.addEventListener('keydown', onEditKey);
  el.addEventListener('input', onEditInput);
  el.addEventListener('click', () => { if (edit) { edit.pick = null; updateAssist(el); } });
  el.addEventListener('keyup', (e) => { if (edit && /^Arrow|Home|End/.test(e.key)) { edit.pick = null; updateAssist(el); } });
});
fxEl().addEventListener('focus', () => {
  if (!edit) startEdit(undefined, { bar: true });
  else if (!cellEl().hidden) cellEl().hidden = true;
});
fxEl().addEventListener('blur', (e) => {
  // Tocar fuera confirma, salvo que el foco vaya a otra parte de la edición
  setTimeout(() => {
    if (!edit || document.activeElement === cellEl() || document.activeElement === fxEl()) return;
    if (document.activeElement?.closest?.('.sheet')) return;
    if (isTouch) return; // en móvil se confirma con ✓ o tocando otra casilla
    commitEdit();
  }, 80);
  void e;
});
// Cuadro de nombre: ir a una casilla o rango
const nb0 = $('namebox');
nb0.addEventListener('focus', () => nb0.select());
nb0.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') { nb0.blur(); renderChrome(); }
  if (e.key !== 'Enter') return;
  e.preventDefault();
  const q = parseRange(nb0.value.trim());
  nb0.blur();
  if (q && q.r2 < MAX_ROWS && q.c2 < MAX_COLS) {
    sel = { ...q, ar: q.r1, ac: q.c1 };
    buildLayout();
    reveal(q.r1, q.c1);
    renderChrome(); schedule();
  } else { toast('Escribe una casilla, por ejemplo B12', { warn: true }); renderChrome(); }
});
$('back-btn').addEventListener('click', closeEditor);
$('add-sheet').addEventListener('click', () => { if (!edit || commitEdit()) addSheet(); });
$('book-name').addEventListener('change', (e) => {
  const v = e.target.value.trim();
  if (v) { wb.name = v; markDirty(); } else e.target.value = wb.name;
});
$('book-name').addEventListener('keydown', (e) => { if (e.key === 'Enter') e.target.blur(); });
$('save-btn').addEventListener('click', exportXlsx);
function setZoom(d) {
  const steps = [0.5, 0.75, 1, 1.25, 1.5, 2];
  const i = clamp(steps.indexOf(zoom) + d, 0, steps.length - 1);
  zoom = steps[i];
  $('zoom-label').textContent = `${Math.round(zoom * 100)} %`;
  buildLayout();
  schedule();
}
$('zoom-out').addEventListener('click', () => setZoom(-1));
$('zoom-in').addEventListener('click', () => setZoom(1));
// Teclas rápidas sobre el teclado del móvil
$('quick').querySelectorAll('[data-k]').forEach((b) => b.addEventListener('pointerdown', (e) => {
  e.preventDefault();
  if (!edit) return;
  const k = b.dataset.k;
  if (k === 'ok') { commitEdit(1, 0); return; }
  if (k === 'no') { cancelEdit(); return; }
  const inp = activeInput(), p = inp.selectionStart;
  inp.value = inp.value.slice(0, p) + k + inp.value.slice(inp.selectionEnd);
  inp.setSelectionRange(p + k.length, p + k.length);
  edit.pick = null;
  syncInputs(inp);
  schedule();
}));
$('file-input').addEventListener('change', (e) => {
  const f = e.target.files?.[0];
  if (f) importFile(f);
  e.target.value = '';
});
// Arrastrar un archivo a la ventana (escritorio)
document.addEventListener('dragover', (e) => { e.preventDefault(); });
document.addEventListener('drop', (e) => {
  e.preventDefault();
  const f = e.dataTransfer?.files?.[0];
  if (f) importFile(f);
});
// Doble clic en un .xlsx con la app instalada (Chrome y Edge de escritorio)
window.launchQueue?.setConsumer(async (params) => {
  const h = params.files?.[0];
  if (h) importFile(await h.getFile());
});

buildToolbar();
applyDisplay();
navigator.storage?.persist?.().catch(() => {});
renderHome().then(async () => {
  await Cloud.sync(cloudAdapter);
  const wanted = new URLSearchParams(location.search).get('open'); // enlace desde CloudCTRL
  if (wanted && !wb) openBook(wanted);
});

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(() => {}));
}
