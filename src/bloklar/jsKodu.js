// Simülatörde (Web Worker içinde) çalışacak JS kodunu üretir.
// Yalnızca şapka bloklarına ("program başladığında", olaylar, "mesajı gelince") bağlı bloklar çalışır.
// Çıktının nasıl çalıştırıldığı: src/calistirici/yurutucu.js
import { javascriptGenerator } from 'blockly/javascript';
import { OLAY_KOSULU_JS, SAPKA_TURLERI } from './kategoriler/olaylar.js';
import { TANIM_TURLERI } from './kategoriler/bloklarim.js';

// Her bloktan önce: vurgulama (yavaş çekim), durdurma denetimi, nefes alma.
const ADIM = 'await adim(%1, YIGIN);\n';

function sapkaKodu(blok, u) {
  const sonraki = blok.getNextBlock();
  const govde = u.prefixLines(
    `await adim(${u.quote_(blok.id)}, YIGIN);\n${sonraki ? u.blockToCode(sonraki) : ''}`,
    u.INDENT,
  );
  const fn = `async (YIGIN) => {\n${govde}}`;
  if (blok.type === 'olay_program_basladiginda') return `baslat(${fn});\n`;
  if (blok.type === 'olay_mesaj_gelince') return `mesajGelince(${u.quote_(blok.getFieldValue('MESAJ'))}, ${fn});\n`;
  return `olay(() => (${OLAY_KOSULU_JS[blok.type](blok, u)}), ${fn});\n`;
}

const etkinSapkalar = (calismaAlani) =>
  calismaAlani.getTopBlocks(true).filter((b) => SAPKA_TURLERI.has(b.type) && b.isEnabled());

export function jsKoduUret(calismaAlani) {
  const u = javascriptGenerator;
  u.init(calismaAlani);
  u.STATEMENT_PREFIX = ADIM;
  try {
    // Bloklarım tanımları: üretici kodu definitions_ içine koyar (u.finish başa ekler).
    for (const b of calismaAlani.getTopBlocks(true)) if (TANIM_TURLERI.has(b.type) && b.isEnabled()) u.blockToCode(b);
    const kod = etkinSapkalar(calismaAlani).map((b) => sapkaKodu(b, u)).join('');
    return u.finish(kod);
  } finally {
    u.STATEMENT_PREFIX = null;
  }
}

/** Çalışma alanında etkin bir şapka bloğu var mı, altında blok var mı. */
export function programDurumu(calismaAlani) {
  const sapkalar = etkinSapkalar(calismaAlani);
  return {
    baslangicVar: sapkalar.length > 0,
    blokVar: sapkalar.some((b) => b.getNextBlock()),
  };
}
