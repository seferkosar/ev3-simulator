// Testlerde blok programı kurmak için kısa yazımlar.
import { Blockly } from '../src/bloklar/blocklyKurulum.js';

export const sayi = (NUM) => ({ shadow: { type: 'ev3_sayi', fields: { NUM } } });
export const metin = (METIN) => ({ shadow: { type: 'ev3_metin', fields: { METIN } } });
export const degisken = (id) => ({ block: { type: 'variables_get', fields: { VAR: { id } } } });

/** Blokları sırayla birbirine bağlar. */
export const zincir = (bloklar) =>
  bloklar.reduceRight((sonraki, blok) => ({ ...blok, ...(sonraki && { next: { block: sonraki } }) }), null);

/** "program başladığında" altına bağlı bir program. */
export const program = (bloklar, ek = {}) => ({
  ...ek,
  blocks: { languageVersion: 0, blocks: [zincir([{ type: 'olay_program_basladiginda' }, ...bloklar])] },
});

export const satiraYaz = (m, satir = 1) => ({
  type: 'ekran_satira_yaz',
  inputs: { METIN: typeof m === 'string' ? metin(m) : { block: m }, SATIR: sayi(satir) },
});

export const konumaYaz = (m, x, y, renk) => ({
  type: 'ekran_konuma_yaz',
  ...(renk && { fields: { RENK: renk } }),
  inputs: { METIN: metin(m), X: typeof x === 'number' ? sayi(x) : x, Y: sayi(y) },
});

/** Çalışma alanını kurar, fn(çalışmaAlanı) sonucunu döndürür, alanı temizler. */
export function alanla(durum, fn) {
  const ws = new Blockly.Workspace();
  Blockly.serialization.workspaces.load(durum, ws);
  try {
    return fn(ws);
  } finally {
    ws.dispose();
  }
}
