// Programda hangi motor ve sensörlerin kullanıldığını bulur. Simülatör bunları kendiliğinden
// ilgili porta bağlar (MakeCode'daki gibi).

/** Blok türüne göre sensör türü. */
function sensorTuru(tur) {
  if (/^(sensor_(yansiyan|renk|ortam)|olay_renk)/.test(tur)) return 'renk';
  if (/^(sensor_dokunma|olay_dokunma)/.test(tur)) return 'dokunma';
  if (/^(sensor_mesafe|olay_mesafe)/.test(tur)) return 'mesafe';
  if (/^(sensor_(aci|acisal)|olay_aci)/.test(tur)) return 'jiroskop';
  return null;
}

/**
 * bloklar: [{ type, alanlar: { PORT, SOL, SAG } }]
 * Döner: { motorlar: ['A', ...], sensorler: { '1': 'dokunma', ... }, cakismalar: ['3'] }
 */
export function donanimiBul(bloklar) {
  const motorlar = new Set();
  const sensorler = {};
  const cakismalar = new Set();
  let hareketVar = false;
  let hareketMotorlari = null;

  for (const { type, alanlar } of bloklar) {
    if (type.startsWith('motor_') && alanlar.PORT) motorlar.add(alanlar.PORT);
    if (type.startsWith('hareket_')) {
      hareketVar = true;
      if (type === 'hareket_motorlari') hareketMotorlari = [alanlar.SOL, alanlar.SAG];
    }
    const s = sensorTuru(type);
    if (s && alanlar.PORT) {
      const p = String(alanlar.PORT);
      if (sensorler[p] && sensorler[p] !== s) cakismalar.add(p);
      else sensorler[p] = s;
    }
  }
  if (hareketVar) for (const p of hareketMotorlari ?? ['B', 'C']) motorlar.add(p);
  return { motorlar: [...motorlar].sort(), sensorler, cakismalar: [...cakismalar] };
}

/** Blockly çalışma alanından (etkin bloklar) donanım listesi. */
export function calismaAlanindanDonanim(calismaAlani) {
  const bloklar = calismaAlani
    .getAllBlocks(false)
    .filter((b) => b.isEnabled())
    .map((b) => ({
      type: b.type,
      alanlar: Object.fromEntries(['PORT', 'SOL', 'SAG'].map((a) => [a, b.getField(a) ? b.getFieldValue(a) : undefined])),
    }));
  return donanimiBul(bloklar);
}
