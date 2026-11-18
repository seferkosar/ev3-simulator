// Blok tanımlarını, Python karşılıklarını ve dinamik kategorileri Blockly'ye kaydeder.
import * as Blockly from 'blockly/core';
import { pythonGenerator } from 'blockly/python';
import { javascriptGenerator } from 'blockly/javascript';
import { TUM_KATEGORILER } from './kategoriler/index.js';
import { INGILIZCE_ADLAR } from './ingilizceAdlar.js';

export const GOREVDE_KAPALI = 'GOREVDE_KAPALI';

let kayitli = false;

/** Türkçe açıklamanın altına EV3 Classroom'daki İngilizce adı ekler. */
export function ipucuMetni(blok) {
  const ingilizce = INGILIZCE_ADLAR[blok.type];
  if (!ingilizce) return blok.tooltip ?? '';
  return `${blok.tooltip ? `${blok.tooltip}\n` : ''}EV3 Classroom: ${ingilizce}`;
}

export function bloklariKaydet() {
  if (kayitli) return;
  for (const k of TUM_KATEGORILER) {
    Blockly.common.defineBlocksWithJsonArray(k.bloklar.map((b) => ({ ...b, tooltip: ipucuMetni(b) })));
    Object.assign(pythonGenerator.forBlock, k.python ?? {});
    Object.assign(javascriptGenerator.forBlock, k.js ?? {});
  }
  kayitli = true;
}

/** Bu uygulamada tanımlanan bütün blok türleri. */
export const tumBlokTurleri = () => TUM_KATEGORILER.flatMap((k) => k.bloklar.map((b) => b.type));

// --- Değişkenler ve Bloklarım için araç kutusu içeriği ---

export const DEGISKEN_ACIK = 'EV3_DEGISKENLER_ACIK';
export const DEGISKEN_KAPALI = 'EV3_DEGISKENLER_KAPALI';
export const BLOKLARIM = 'EV3_BLOKLARIM';
export const BLOKLARIM_ACIK = 'EV3_BLOKLARIM_ACIK';
export const ARAMA = 'EV3_ARAMA';

const sayiGolgesi = (NUM) => ({ shadow: { type: 'ev3_sayi', fields: { NUM } } });

function degiskenAkisi(calismaAlani) {
  const ogeler = [{ kind: 'button', text: 'Değişken oluştur', callbackKey: 'DEGISKEN_OLUSTUR' }];
  const degiskenler = calismaAlani.getVariableMap().getAllVariables();
  degiskenler.sort((a, b) => a.getName().localeCompare(b.getName(), 'tr'));
  for (const d of degiskenler) {
    ogeler.push({ kind: 'block', type: 'variables_get', fields: { VAR: { id: d.getId() } } });
  }
  const ilk = degiskenler[0];
  if (ilk) {
    const VAR = { id: ilk.getId() };
    ogeler.push(
      { kind: 'block', type: 'variables_set', fields: { VAR }, inputs: { VALUE: sayiGolgesi(0) } },
      { kind: 'block', type: 'math_change', fields: { VAR }, inputs: { DELTA: sayiGolgesi(1) } },
    );
  }
  return ogeler;
}

/**
 * Dinamik kategorileri ve "Değişken oluştur" düğmesini bir çalışma alanına bağlar.
 * aramaSonuclari(): { sorgu, ogeler } — "Ara" kategorisinde gösterilecek bloklar.
 */
export function dinamikKategorileriBagla(calismaAlani, { aramaSonuclari = () => ({ sorgu: '', ogeler: [] }) } = {}) {
  calismaAlani.registerToolboxCategoryCallback(ARAMA, () => {
    const { sorgu, ogeler } = aramaSonuclari();
    if (!sorgu.trim()) return [{ kind: 'label', text: 'Üstteki kutuya bir blok adı yaz (ör. "yaz", "motor").' }];
    if (!ogeler.length) return [{ kind: 'label', text: `"${sorgu}" için blok bulunamadı.` }];
    return ogeler;
  });
  calismaAlani.registerToolboxCategoryCallback(DEGISKEN_ACIK, degiskenAkisi);
  calismaAlani.registerToolboxCategoryCallback(DEGISKEN_KAPALI, () => [
    { kind: 'label', text: 'Değişkenler sonraki görevlerde açılacak.' },
  ]);
  calismaAlani.registerToolboxCategoryCallback(BLOKLARIM, () => [
    { kind: 'label', text: 'Kendi bloklarını Serbest modda ve derslerde yapabilirsin.' },
  ]);
  calismaAlani.registerToolboxCategoryCallback(BLOKLARIM_ACIK, (ws) => Blockly.Procedures.flyoutCategory(ws));
  calismaAlani.registerButtonCallback('DEGISKEN_OLUSTUR', (dugme) =>
    Blockly.Variables.createVariableButtonHandler(dugme.getTargetWorkspace()),
  );
}
