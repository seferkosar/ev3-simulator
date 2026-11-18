// Blok tanımlarını, Python karşılıklarını ve dinamik kategorileri Blockly'ye kaydeder.
import * as Blockly from 'blockly/core';
import { pythonGenerator } from 'blockly/python';
import { javascriptGenerator } from 'blockly/javascript';
import { TUM_KATEGORILER } from './kategoriler/index.js';

export const GOREVDE_KAPALI = 'GOREVDE_KAPALI';

let kayitli = false;

export function bloklariKaydet() {
  if (kayitli) return;
  for (const k of TUM_KATEGORILER) {
    Blockly.common.defineBlocksWithJsonArray(k.bloklar);
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

/** Dinamik kategorileri ve "Değişken oluştur" düğmesini bir çalışma alanına bağlar. */
export function dinamikKategorileriBagla(calismaAlani) {
  calismaAlani.registerToolboxCategoryCallback(DEGISKEN_ACIK, degiskenAkisi);
  calismaAlani.registerToolboxCategoryCallback(DEGISKEN_KAPALI, () => [
    { kind: 'label', text: 'Değişkenler sonraki görevlerde açılacak.' },
  ]);
  calismaAlani.registerToolboxCategoryCallback(BLOKLARIM, () => [
    { kind: 'label', text: 'Kendi bloklarını sonraki seviyelerde yapacaksın.' },
  ]);
  calismaAlani.registerButtonCallback('DEGISKEN_OLUSTUR', (dugme) =>
    Blockly.Variables.createVariableButtonHandler(dugme.getTargetWorkspace()),
  );
}
