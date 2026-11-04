'use strict';
// Lectura y escritura de .xlsx sin dependencias: un .xlsx es un ZIP de XML.
// Se conservan valores, fórmulas, estilos, anchos, combinadas, paneles fijos y nombres definidos.

// ---------- ZIP ----------
const crcTable = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c >>> 0;
  }
  return t;
})();
function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) c = crcTable[(c ^ buf[i]) & 255] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}
async function pipeThrough(data, stream) {
  const res = new Response(new Blob([data]).stream().pipeThrough(stream));
  return new Uint8Array(await res.arrayBuffer());
}
async function readZip(buffer) {
  const u8 = new Uint8Array(buffer), dv = new DataView(buffer);
  let eocd = -1;
  for (let i = u8.length - 22; i >= Math.max(0, u8.length - 66000); i--) if (dv.getUint32(i, true) === 0x06054b50) { eocd = i; break; }
  if (eocd < 0) throw new Error('zip');
  const count = dv.getUint16(eocd + 10, true);
  let p = dv.getUint32(eocd + 16, true);
  const dec = new TextDecoder();
  const entries = new Map();
  for (let n = 0; n < count && dv.getUint32(p, true) === 0x02014b50; n++) {
    const method = dv.getUint16(p + 10, true), csize = dv.getUint32(p + 20, true);
    const nameLen = dv.getUint16(p + 28, true), extraLen = dv.getUint16(p + 30, true), noteLen = dv.getUint16(p + 32, true);
    const local = dv.getUint32(p + 42, true);
    const name = dec.decode(u8.subarray(p + 46, p + 46 + nameLen));
    entries.set(name.replace(/^\//, ''), { method, csize, local });
    p += 46 + nameLen + extraLen + noteLen;
  }
  return {
    names: () => [...entries.keys()],
    has: (n) => entries.has(n),
    async text(n) {
      const e = entries.get(n);
      if (!e) return null;
      const start = e.local + 30 + dv.getUint16(e.local + 26, true) + dv.getUint16(e.local + 28, true);
      const raw = u8.subarray(start, start + e.csize);
      const out = e.method === 0 ? raw : await pipeThrough(raw, new DecompressionStream('deflate-raw'));
      return dec.decode(out);
    },
  };
}
async function writeZip(files) {
  const enc = new TextEncoder();
  const chunks = [], central = [];
  let offset = 0;
  const u16 = (v) => [v & 255, (v >> 8) & 255];
  const u32 = (v) => [v & 255, (v >> 8) & 255, (v >> 16) & 255, (v >>> 24) & 255];
  const canDeflate = typeof CompressionStream !== 'undefined';
  for (const [name, text] of files) {
    const nameB = enc.encode(name), data = enc.encode(text), crc = crc32(data);
    let body = data, method = 0;
    if (canDeflate && data.length > 256) {
      try { body = await pipeThrough(data, new CompressionStream('deflate-raw')); method = 8; } catch (_) { body = data; method = 0; }
    }
    const head = [...u16(20), ...u16(0x0800), ...u16(method), ...u16(0), ...u16(0x21), ...u32(crc), ...u32(body.length), ...u32(data.length), ...u16(nameB.length), ...u16(0)];
    const local = Uint8Array.from([0x50, 0x4b, 3, 4, ...head]);
    chunks.push(local, nameB, body);
    central.push(Uint8Array.from([0x50, 0x4b, 1, 2, ...u16(20), ...head, ...u16(0), ...u16(0), ...u16(0), ...u32(0), ...u32(offset)]), nameB);
    offset += local.length + nameB.length + body.length;
  }
  const size = central.reduce((n, c) => n + c.length, 0);
  const end = Uint8Array.from([0x50, 0x4b, 5, 6, ...u16(0), ...u16(0), ...u16(files.length), ...u16(files.length), ...u32(size), ...u32(offset), ...u16(0)]);
  return new Blob([...chunks, ...central, end], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
}

// ---------- Utilidades XML ----------
const xmlDoc = (text) => new DOMParser().parseFromString(text, 'application/xml');
const kids = (el, name) => (el ? [...el.children].filter((c) => c.localName === name) : []);
const kid = (el, name) => kids(el, name)[0] || null;
const deep = (el, name) => (el ? [...el.getElementsByTagNameNS('*', name)] : []);
const xesc = (s) => String(s).replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f￾￿]/g, '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const resolvePath = (base, target) => {
  if (target.startsWith('/')) return target.slice(1);
  const parts = base.split('/').slice(0, -1);
  for (const p of target.split('/')) { if (p === '..') parts.pop(); else if (p !== '.') parts.push(p); }
  return parts.join('/');
};
function relsOf(doc) {
  const m = {};
  if (doc) deep(doc, 'Relationship').forEach((r) => { m[r.getAttribute('Id')] = { target: r.getAttribute('Target'), type: r.getAttribute('Type') }; });
  return m;
}

// ---------- Colores ----------
const INDEXED = ['000000', 'FFFFFF', 'FF0000', '00FF00', '0000FF', 'FFFF00', 'FF00FF', '00FFFF', '000000', 'FFFFFF', 'FF0000', '00FF00', '0000FF', 'FFFF00', 'FF00FF', '00FFFF', '800000', '008000', '000080', '808000', '800080', '008080', 'C0C0C0', '808080', '9999FF', '993366', 'FFFFCC', 'CCFFFF', '660066', 'FF8080', '0066CC', 'CCCCFF', '000080', 'FF00FF', 'FFFF00', '00FFFF', '800080', '800000', '008080', '0000FF', '00CCFF', 'CCFFFF', 'CCFFCC', 'FFFF99', '99CCFF', 'FF99CC', 'CC99FF', 'FFCC99', '3366FF', '33CCCC', '99CC00', 'FFCC00', 'FF9900', 'FF6600', '666699', '969696', '003366', '339966', '003300', '333300', '993300', '993366', '333399', '333333'];
const DEFAULT_THEME = ['FFFFFF', '000000', 'E7E6E6', '44546A', '4472C4', 'ED7D31', 'A5A5A5', 'FFC000', '5B9BD5', '70AD47', '0563C1', '954F72'];
function tinted(hex, tint) {
  if (!tint) return hex;
  const rgb = [0, 2, 4].map((i) => parseInt(hex.slice(i, i + 2), 16));
  return rgb.map((v) => Math.round(tint < 0 ? v * (1 + tint) : v + (255 - v) * tint).toString(16).padStart(2, '0')).join('').toUpperCase();
}
// Devuelve '#rrggbb' o null (automático). `auto` indica colores de texto negro por tema: se dejan sin color
function readColor(el, theme, isFont) {
  if (!el) return null;
  let hex = null;
  if (el.getAttribute('rgb')) hex = el.getAttribute('rgb').slice(-6).toUpperCase();
  else if (el.getAttribute('theme') !== null) {
    const i = Number(el.getAttribute('theme'));
    if (isFont && i === 1 && !el.getAttribute('tint')) return null;
    hex = theme[i] || null;
  } else if (el.getAttribute('indexed') !== null) {
    const i = Number(el.getAttribute('indexed'));
    if (i >= 64) return null;
    hex = INDEXED[i];
  }
  if (!hex || !/^[0-9A-F]{6}$/.test(hex)) return null;
  if (isFont && hex === '000000') return null;
  return `#${tinted(hex, Number(el.getAttribute('tint') || 0)).toLowerCase()}`;
}

function readTheme(text) {
  if (!text) return DEFAULT_THEME;
  const doc = xmlDoc(text);
  const scheme = deep(doc, 'clrScheme')[0];
  if (!scheme) return DEFAULT_THEME;
  // Orden del archivo: dk1 lt1 dk2 lt2 …; en los índices de color van lt1 dk1 lt2 dk2 …
  const list = [...scheme.children].map((c) => {
    const k = c.firstElementChild;
    return (k?.getAttribute('lastClr') || k?.getAttribute('val') || '000000').toUpperCase();
  });
  if (list.length < 10) return DEFAULT_THEME;
  [list[0], list[1]] = [list[1], list[0]];
  [list[2], list[3]] = [list[3], list[2]];
  return list;
}

function readStyles(text, theme) {
  const out = { xfs: [{}] };
  if (!text) return out;
  const doc = xmlDoc(text);
  const root = doc.documentElement;
  const numFmts = {};
  kids(kid(root, 'numFmts'), 'numFmt').forEach((n) => { numFmts[n.getAttribute('numFmtId')] = n.getAttribute('formatCode'); });
  const fonts = kids(kid(root, 'fonts'), 'font').map((f) => {
    const s = {};
    const on = (n) => { const k = kid(f, n); return k && k.getAttribute('val') !== '0' && k.getAttribute('val') !== 'false'; };
    if (on('b')) s.b = 1;
    if (on('i')) s.i = 1;
    if (kid(f, 'u') && kid(f, 'u').getAttribute('val') !== 'none') s.u = 1;
    if (on('strike')) s.st = 1;
    const size = Number(kid(f, 'sz')?.getAttribute('val'));
    if (size && size !== 11) s.fs = size;
    const name = kid(f, 'name')?.getAttribute('val');
    if (name && name !== 'Calibri') s.fn = name;
    const col = readColor(kid(f, 'color'), theme, true);
    if (col) s.fc = col;
    return s;
  });
  const fills = kids(kid(root, 'fills'), 'fill').map((f) => {
    const p = kid(f, 'patternFill');
    if (!p || !p.getAttribute('patternType') || p.getAttribute('patternType') === 'none') return null;
    if (p.getAttribute('patternType') === 'solid') return readColor(kid(p, 'fgColor'), theme) || readColor(kid(p, 'bgColor'), theme);
    return readColor(kid(p, 'fgColor'), theme);
  });
  const borders = kids(kid(root, 'borders'), 'border').map((b) => {
    const o = {};
    for (const [k, n] of [['l', 'left'], ['r', 'right'], ['t', 'top'], ['b', 'bottom']]) {
      const e = kid(b, n);
      if (e?.getAttribute('style')) o[k] = { s: e.getAttribute('style'), c: readColor(kid(e, 'color'), theme) };
    }
    return Object.keys(o).length ? o : null;
  });
  out.xfs = kids(kid(root, 'cellXfs'), 'xf').map((x) => {
    const s = { ...(fonts[Number(x.getAttribute('fontId') || 0)] || {}) };
    const fill = fills[Number(x.getAttribute('fillId') || 0)];
    if (fill) s.bg = fill;
    const bd = borders[Number(x.getAttribute('borderId') || 0)];
    if (bd) s.bd = bd;
    const id = x.getAttribute('numFmtId') || '0';
    if (id !== '0') s.nf = numFmts[id] || BUILTIN_FMT[id] || 'General';
    const al = kid(x, 'alignment');
    if (al) {
      const h = al.getAttribute('horizontal'), v = al.getAttribute('vertical');
      if (h === 'left' || h === 'center' || h === 'right') s.ha = h;
      if (v === 'top' || v === 'center') s.va = v;
      if (al.getAttribute('wrapText') === '1' || al.getAttribute('wrapText') === 'true') s.wr = 1;
    }
    return s;
  });
  return out;
}
const styleKey = (s) => JSON.stringify(s, Object.keys(s).sort());
function internStyle(wb, s) {
  if (!wb.styleMap) { wb.styleMap = new Map(wb.styles.map((x, i) => [styleKey(x), i])); }
  const key = styleKey(s);
  let i = wb.styleMap.get(key);
  if (i === undefined) { i = wb.styles.length; wb.styles.push(s); wb.styleMap.set(key, i); }
  return i;
}

// ---------- Leer ----------
async function readXlsx(buffer, name) {
  const zip = await readZip(buffer);
  if (!zip.has('xl/workbook.xml')) throw new Error('xlsx');
  const wbDoc = xmlDoc(await zip.text('xl/workbook.xml'));
  const wbRels = relsOf(xmlDoc(await zip.text('xl/_rels/workbook.xml.rels') || '<a/>'));
  const pathOfType = (suffix) => { const r = Object.values(wbRels).find((x) => x.type?.endsWith(suffix)); return r ? resolvePath('xl/workbook.xml', r.target) : null; };
  const theme = readTheme(await zip.text(pathOfType('/theme') || 'xl/theme/theme1.xml'));
  const styles = readStyles(await zip.text(pathOfType('/styles') || 'xl/styles.xml'), theme);
  const date1904 = kid(wbDoc.documentElement, 'workbookPr')?.getAttribute('date1904');
  const is1904 = date1904 === '1' || date1904 === 'true';
  const sst = [];
  const sstText = await zip.text(pathOfType('/sharedStrings') || 'xl/sharedStrings.xml');
  if (sstText) kids(xmlDoc(sstText).documentElement, 'si').forEach((si) => {
    // Texto normal y por partes (<r>); las notas fonéticas (rPh) se ignoran
    sst.push(kids(si, 't').concat(kids(si, 'r').flatMap((r) => kids(r, 't'))).map((t) => t.textContent).join(''));
  });
  const wb = { name, sheets: [], names: {}, styles: [{}] };
  const xfMap = styles.xfs.map((s) => internStyle(wb, s));
  const warnings = new Set();
  const sheetEls = kids(kid(wbDoc.documentElement, 'sheets'), 'sheet');
  for (const el of sheetEls) {
    const rid = el.getAttributeNS('http://schemas.openxmlformats.org/officeDocument/2006/relationships', 'id') || el.getAttribute('r:id');
    const rel = wbRels[rid];
    const sheet = newSheetData(el.getAttribute('name'));
    if (el.getAttribute('state') && el.getAttribute('state') !== 'visible') sheet.hidden = true;
    wb.sheets.push(sheet);
    if (!rel) continue;
    const path = resolvePath('xl/workbook.xml', rel.target);
    const text = await zip.text(path);
    if (text == null) continue;
    readSheet(xmlDoc(text), sheet, { sst, xfMap, xfs: styles.xfs, is1904, warnings });
    const relsPath = path.replace(/([^/]+)$/, '_rels/$1.rels');
    const relsText = await zip.text(relsPath);
    if (relsText) {
      const types = Object.values(relsOf(xmlDoc(relsText))).map((r) => r.type || '');
      if (types.some((t) => t.endsWith('/drawing'))) warnings.add('gráficos o imágenes');
      if (types.some((t) => t.endsWith('/pivotTable'))) warnings.add('tablas dinámicas');
      if (types.some((t) => t.endsWith('/comments'))) warnings.add('comentarios');
    }
  }
  if (!wb.sheets.length) throw new Error('xlsx');
  kids(kid(wbDoc.documentElement, 'definedNames'), 'definedName').forEach((d) => {
    const n = d.getAttribute('name');
    if (n && !n.startsWith('_xlnm.') && d.getAttribute('localSheetId') === null && !d.getAttribute('hidden')) wb.names[n] = fromXlsxFormula(d.textContent);
  });
  if (zip.has('xl/vbaProject.bin')) warnings.add('macros');
  return { wb, warnings: [...warnings] };
}

function readSheet(doc, sheet, ctx) {
  const root = doc.documentElement;
  const { sst, xfMap, xfs, is1904, warnings } = ctx;
  const fmt = kid(root, 'sheetFormatPr');
  const defCols = Number(fmt?.getAttribute('defaultColWidth'));
  if (defCols) sheet.defW = charsToPx(defCols);
  const pane = deep(kid(root, 'sheetViews'), 'pane')[0];
  if (pane && /frozen/i.test(pane.getAttribute('state') || '')) {
    sheet.freeze = { r: Number(pane.getAttribute('ySplit') || 0), c: Number(pane.getAttribute('xSplit') || 0) };
  }
  kids(kid(root, 'cols'), 'col').forEach((c) => {
    const min = Number(c.getAttribute('min')) - 1, max = Math.min(Number(c.getAttribute('max')) - 1, min + 500);
    const hidden = c.getAttribute('hidden') === '1';
    const width = Number(c.getAttribute('width') || 0);
    for (let i = min; i <= max; i++) sheet.cols[i] = hidden ? 0 : charsToPx(width);
  });
  const shared = {};
  kids(kid(root, 'sheetData'), 'row').forEach((row, idx) => {
    const r = Number(row.getAttribute('r') || idx + 1) - 1;
    if (row.getAttribute('hidden') === '1') sheet.rows[r] = 0;
    else if (row.getAttribute('ht') && Math.abs(Number(row.getAttribute('ht')) - 15) > 0.3) sheet.rows[r] = Math.round(Number(row.getAttribute('ht')) * 4 / 3);
    let col = 0;
    for (const c of kids(row, 'c')) {
      const ref = c.getAttribute('r');
      const pos = ref ? parseA1(ref) : { c: col };
      col = pos.c + 1;
      const t = c.getAttribute('t') || 'n';
      const sIdx = Number(c.getAttribute('s') || 0);
      const vEl = kid(c, 'v'), fEl = kid(c, 'f');
      let v;
      if (t === 's') v = sst[Number(vEl?.textContent)];
      else if (t === 'inlineStr') v = deep(kid(c, 'is'), 't').map((x) => x.textContent).join('');
      else if (t === 'str') v = vEl?.textContent ?? '';
      else if (t === 'b') v = vEl?.textContent === '1';
      else if (t === 'e') v = errOf(vEl?.textContent || '#VALUE!');
      else if (vEl && vEl.textContent !== '') {
        v = Number(vEl.textContent);
        if (is1904 && isDateFormat(xfs[sIdx]?.nf)) v += 1462;
      }
      let f;
      if (fEl) {
        const ft = fEl.getAttribute('t');
        const text = fromXlsxFormula(fEl.textContent || '');
        if (ft === 'shared') {
          const si = fEl.getAttribute('si');
          if (text) { shared[si] = { f: text, r, c: pos.c }; f = text; }
          else if (shared[si]) { try { f = shiftFormula(shared[si].f, r - shared[si].r, pos.c - shared[si].c); } catch (_) { f = undefined; } }
        } else f = text;
      }
      const style = xfMap[sIdx] || 0;
      if (v === undefined && f === undefined && !style) continue;
      const cell = ensureCell(sheet, r, pos.c);
      if (v !== undefined) cell.v = v;
      if (f) cell.f = f;
      if (style) cell.s = style;
    }
  });
  kids(kid(root, 'mergeCells'), 'mergeCell').forEach((m) => {
    const rg = parseRange(m.getAttribute('ref') || '');
    if (rg) sheet.merges.push(rg);
  });
  if (kid(root, 'conditionalFormatting')) warnings.add('formato condicional');
  if (kid(root, 'dataValidations')) warnings.add('validación de datos');
  if (kid(root, 'tableParts')) warnings.add('tablas');
}
// Ancho de columna: unidades de carácter de Excel ↔ píxeles (Calibri 11, dígito de 7 px)
const charsToPx = (w) => Math.max(12, Math.round(w * 7 + 5));
const pxToChars = (px) => Math.round((px - 5) / 7 * 100) / 100;

// ---------- Escribir ----------
const BUILTIN_ID = Object.fromEntries(Object.entries(BUILTIN_FMT).map(([k, v]) => [v, Number(k)]));
const xlColor = (c) => `FF${c.slice(1).toUpperCase()}`;
function buildStyles(wb) {
  const fonts = ['<font><sz val="11"/><name val="Calibri"/><family val="2"/></font>'];
  const fills = ['<fill><patternFill patternType="none"/></fill>', '<fill><patternFill patternType="gray125"/></fill>'];
  const borders = ['<border><left/><right/><top/><bottom/><diagonal/></border>'];
  const fmts = [], fmtIds = new Map();
  const uniq = (list, x) => { let i = list.indexOf(x); if (i < 0) { i = list.length; list.push(x); } return i; };
  const xfs = wb.styles.map((s) => {
    const fontX = `<font>${s.b ? '<b/>' : ''}${s.i ? '<i/>' : ''}${s.st ? '<strike/>' : ''}${s.u ? '<u/>' : ''}<sz val="${s.fs || 11}"/>${s.fc ? `<color rgb="${xlColor(s.fc)}"/>` : ''}<name val="${xesc(s.fn || 'Calibri')}"/><family val="2"/></font>`;
    const fontId = uniq(fonts, fontX);
    const fillId = s.bg ? uniq(fills, `<fill><patternFill patternType="solid"><fgColor rgb="${xlColor(s.bg)}"/><bgColor indexed="64"/></patternFill></fill>`) : 0;
    let borderId = 0;
    if (s.bd) {
      const side = (k, n) => (s.bd[k] ? `<${n} style="${s.bd[k].s}">${s.bd[k].c ? `<color rgb="${xlColor(s.bd[k].c)}"/>` : '<color auto="1"/>'}</${n}>` : `<${n}/>`);
      borderId = uniq(borders, `<border>${side('l', 'left')}${side('r', 'right')}${side('t', 'top')}${side('b', 'bottom')}<diagonal/></border>`);
    }
    let numId = 0;
    if (s.nf && s.nf !== 'General') {
      if (BUILTIN_ID[s.nf] !== undefined) numId = BUILTIN_ID[s.nf];
      else {
        if (!fmtIds.has(s.nf)) { fmtIds.set(s.nf, 164 + fmts.length); fmts.push(s.nf); }
        numId = fmtIds.get(s.nf);
      }
    }
    const al = s.ha || s.va || s.wr
      ? `<alignment${s.ha ? ` horizontal="${s.ha}"` : ''}${s.va ? ` vertical="${s.va}"` : ''}${s.wr ? ' wrapText="1"' : ''}/>` : '';
    return `<xf numFmtId="${numId}" fontId="${fontId}" fillId="${fillId}" borderId="${borderId}" xfId="0"${numId ? ' applyNumberFormat="1"' : ''}${fontId ? ' applyFont="1"' : ''}${fillId ? ' applyFill="1"' : ''}${borderId ? ' applyBorder="1"' : ''}${al ? ' applyAlignment="1">' + al + '</xf>' : '/>'}`;
  });
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">${fmts.length ? `<numFmts count="${fmts.length}">${fmts.map((f, i) => `<numFmt numFmtId="${164 + i}" formatCode="${xesc(f)}"/>`).join('')}</numFmts>` : ''}<fonts count="${fonts.length}">${fonts.join('')}</fonts><fills count="${fills.length}">${fills.join('')}</fills><borders count="${borders.length}">${borders.join('')}</borders><cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs><cellXfs count="${xfs.length}">${xfs.join('')}</cellXfs><cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles></styleSheet>`;
}
function sheetXml(sh, sst, sstIndex, first) {
  const out = ['<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">'];
  const u = usedRange(sh);
  if (u.r2 >= 0) out.push(`<dimension ref="A1:${a1(u.r2, Math.max(u.c2, 0))}"/>`);
  const { r: fr, c: fc } = sh.freeze || { r: 0, c: 0 };
  let view = `<sheetView workbookViewId="0"${first ? ' tabSelected="1"' : ''}`;
  if (fr || fc) {
    const pane = fr && fc ? 'bottomRight' : fr ? 'bottomLeft' : 'topRight';
    view += `><pane${fc ? ` xSplit="${fc}"` : ''}${fr ? ` ySplit="${fr}"` : ''} topLeftCell="${a1(fr, fc)}" activePane="${pane}" state="frozen"/><selection pane="${pane}"/></sheetView>`;
  } else view += '/>';
  out.push(`<sheetViews>${view}</sheetViews><sheetFormatPr defaultColWidth="${pxToChars(sh.defW ?? 80)}" defaultRowHeight="15"/>`);
  const colKeys = Object.keys(sh.cols).map(Number).sort((a, b) => a - b);
  if (colKeys.length) {
    out.push(`<cols>${colKeys.map((c) => {
      const w = sh.cols[c], i = c + 1;
      return w === 0 ? `<col min="${i}" max="${i}" width="0" hidden="1" customWidth="1"/>` : `<col min="${i}" max="${i}" width="${pxToChars(w)}" customWidth="1"/>`;
    }).join('')}</cols>`);
  }
  out.push('<sheetData>');
  const rowKeys = [...new Set([...sh.cells.keys(), ...Object.keys(sh.rows).map(Number)])].sort((a, b) => a - b);
  for (const r of rowKeys) {
    const h = sh.rows[r];
    const attr = h === 0 ? ' hidden="1"' : h ? ` ht="${(h * 3 / 4).toFixed(2)}" customHeight="1"` : '';
    const row = sh.cells.get(r);
    if (!row) { out.push(`<row r="${r + 1}"${attr}/>`); continue; }
    const cells = [];
    for (const c of [...row.keys()].sort((a, b) => a - b)) {
      const cell = row.get(c);
      const ref = a1(r, c), st = cell.s ? ` s="${cell.s}"` : '';
      const v = cell.v;
      const f = cell.f !== undefined ? `<f>${xesc(toXlsxFormula(cell.f))}</f>` : '';
      if (f) {
        if (isErr(v)) cells.push(`<c r="${ref}"${st} t="e">${f}<v>${v.e === '#CIRC!' ? '#REF!' : xesc(v.e)}</v></c>`);
        else if (typeof v === 'string') cells.push(`<c r="${ref}"${st} t="str">${f}<v>${xesc(v)}</v></c>`);
        else if (typeof v === 'boolean') cells.push(`<c r="${ref}"${st} t="b">${f}<v>${v ? 1 : 0}</v></c>`);
        else cells.push(`<c r="${ref}"${st}>${f}${v === undefined ? '' : `<v>${v}</v>`}</c>`);
      } else if (v === undefined) cells.push(`<c r="${ref}"${st}/>`);
      else if (typeof v === 'number') cells.push(`<c r="${ref}"${st}><v>${v}</v></c>`);
      else if (typeof v === 'boolean') cells.push(`<c r="${ref}"${st} t="b"><v>${v ? 1 : 0}</v></c>`);
      else if (isErr(v)) cells.push(`<c r="${ref}"${st} t="e"><v>${xesc(v.e)}</v></c>`);
      else {
        let i = sstIndex.get(v);
        if (i === undefined) { i = sst.length; sst.push(v); sstIndex.set(v, i); }
        cells.push(`<c r="${ref}"${st} t="s"><v>${i}</v></c>`);
      }
    }
    out.push(`<row r="${r + 1}"${attr}>${cells.join('')}</row>`);
  }
  out.push('</sheetData>');
  if (sh.merges.length) out.push(`<mergeCells count="${sh.merges.length}">${sh.merges.map((m) => `<mergeCell ref="${rangeText(m)}"/>`).join('')}</mergeCells>`);
  out.push('</worksheet>');
  return out.join('');
}
async function writeXlsx(wb) {
  new Calc(wb).all(); // guarda los resultados: visores como Vista Rápida no recalculan
  const sst = [], sstIndex = new Map();
  const sheets = wb.sheets;
  const files = [];
  const sheetFiles = sheets.map((sh, i) => sheetXml(sh, sst, sstIndex, i === sheets.findIndex((s) => !s.hidden)));
  files.push(['[Content_Types].xml', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>${sheets.map((_, i) => `<Override PartName="/xl/worksheets/sheet${i + 1}.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>`).join('')}<Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/><Override PartName="/xl/sharedStrings.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sharedStrings+xml"/></Types>`]);
  files.push(['_rels/.rels', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>`]);
  const names = Object.entries(wb.names || {});
  files.push(['xl/workbook.xml', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets>${sheets.map((s, i) => `<sheet name="${xesc(s.name)}" sheetId="${i + 1}"${s.hidden ? ' state="hidden"' : ''} r:id="rId${i + 1}"/>`).join('')}</sheets>${names.length ? `<definedNames>${names.map(([k, v]) => `<definedName name="${xesc(k)}">${xesc(v)}</definedName>`).join('')}</definedNames>` : ''}<calcPr calcId="191029" fullCalcOnLoad="1"/></workbook>`]);
  const n = sheets.length;
  files.push(['xl/_rels/workbook.xml.rels', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">${sheets.map((_, i) => `<Relationship Id="rId${i + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet${i + 1}.xml"/>`).join('')}<Relationship Id="rId${n + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/><Relationship Id="rId${n + 2}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/sharedStrings" Target="sharedStrings.xml"/></Relationships>`]);
  files.push(['xl/styles.xml', buildStyles(wb)]);
  files.push(['xl/sharedStrings.xml', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<sst xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" count="${sst.length}" uniqueCount="${sst.length}">${sst.map((s) => `<si><t xml:space="preserve">${xesc(s)}</t></si>`).join('')}</sst>`]);
  sheetFiles.forEach((x, i) => files.push([`xl/worksheets/sheet${i + 1}.xml`, x]));
  return writeZip(files);
}

// ---------- CSV ----------
function parseCsv(text) {
  text = text.replace(/^﻿/, '');
  const head = text.slice(0, 2000);
  const sep = (head.match(/;/g) || []).length >= (head.match(/,/g) || []).length ? (head.includes('\t') && !head.includes(';') ? '\t' : ';') : ',';
  const rows = [[]];
  let cur = '', q = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (q) {
      if (ch === '"') { if (text[i + 1] === '"') { cur += '"'; i++; } else q = false; } else cur += ch;
    } else if (ch === '"' && cur === '') q = true;
    else if (ch === sep) { rows.at(-1).push(cur); cur = ''; }
    else if (ch === '\n' || ch === '\r') {
      if (ch === '\r' && text[i + 1] === '\n') i++;
      rows.at(-1).push(cur); cur = ''; rows.push([]);
    } else cur += ch;
  }
  if (cur !== '' || rows.at(-1).length) rows.at(-1).push(cur); else rows.pop();
  return rows;
}
function sheetToCsv(sh, wb, si) {
  const k = new Calc(wb);
  const u = usedRange(sh);
  const lines = [];
  for (let r = 0; r <= u.r2; r++) {
    const row = [];
    for (let c = 0; c <= u.c2; c++) {
      const cell = getCell(sh, r, c);
      const t = cell ? displayValue(k.safe(si, r, c), wb.styles[cell.s || 0]?.nf).text : '';
      row.push(/[";\n\r]/.test(t) ? `"${t.replace(/"/g, '""')}"` : t);
    }
    lines.push(row.join(';'));
  }
  return `﻿${lines.join('\r\n')}`;
}
