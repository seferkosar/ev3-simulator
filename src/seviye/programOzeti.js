// Görev kontrolü için programın yapısından gereken bilgiler.
// Yalnızca "program başladığında" bloğuna bağlı ve etkin bloklar sayılır.
import { BASLANGIC_BLOGU } from '../bloklar/pythonKodu.js';

const degiskenAdi = (blok) => blok.getField('VAR')?.getVariable()?.getName() ?? '';

export function programOzeti(calismaAlani) {
  const bloklar = calismaAlani
    .getTopBlocks(false)
    .filter((b) => b.type === BASLANGIC_BLOGU && b.isEnabled())
    .flatMap((b) => b.getDescendants(false))
    .filter((b) => b.isEnabled());

  return {
    /** Değer atanan değişkenler: [{ ad, deger }] (deger yalnızca düz sayı/metinse) */
    atamalar: bloklar
      .filter((b) => b.type === 'variables_set')
      .map((b) => {
        const deger = b.getInputTargetBlock('VALUE');
        const alan = deger?.getField('NUM') ?? deger?.getField('METIN');
        return { ad: degiskenAdi(b), deger: alan ? String(alan.getValue()) : null };
      }),
    /** Birleştir bloklarının içinde kullanılan değişken adları */
    birlestirDegiskenleri: bloklar
      .filter((b) => b.type === 'op_birlestir')
      .flatMap((b) => b.getDescendants(false))
      .filter((b) => b.type === 'variables_get' && b.isEnabled())
      .map(degiskenAdi),
  };
}
