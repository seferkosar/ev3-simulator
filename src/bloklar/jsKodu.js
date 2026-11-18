// Simülatörde (Web Worker içinde) çalışacak JS kodunu üretir.
// Python'la aynı kural: yalnızca "program başladığında" bloğuna bağlı bloklar çalışır.
import { javascriptGenerator } from 'blockly/javascript';
import { BASLANGIC_BLOGU } from './pythonKodu.js';

export function jsKoduUret(calismaAlani) {
  const u = javascriptGenerator;
  u.init(calismaAlani);
  let govde = '';
  for (const blok of calismaAlani.getTopBlocks(true)) {
    if (blok.type === BASLANGIC_BLOGU && blok.isEnabled()) govde += u.blockToCode(blok);
  }
  return u.finish(govde);
}

/** Çalışma alanında en az bir etkin "program başladığında" bloğu var mı, altında blok var mı. */
export function programDurumu(calismaAlani) {
  const baslangiclar = calismaAlani
    .getTopBlocks(false)
    .filter((b) => b.type === BASLANGIC_BLOGU && b.isEnabled());
  return {
    baslangicVar: baslangiclar.length > 0,
    blokVar: baslangiclar.some((b) => b.getNextBlock()),
  };
}
