// Programı dosyaya kaydetme ve dosyadan açma (yalnızca öğrencinin kendi bilgisayarında).
export const DOSYA_TURU = 'ev3-simulator-programi';
export const DOSYA_SURUMU = 1;
const EN_BUYUK_DOSYA = 1_000_000; // karakter

export function programPaketle(durum, gorevNo) {
  return JSON.stringify(
    { tur: DOSYA_TURU, surum: DOSYA_SURUMU, seviye: 'otopark-ekrani', gorev: gorevNo, program: durum },
    null,
    2,
  );
}

/** Dosya metnini çözer. Uygun değilse öğrencinin anlayacağı Türkçe bir hata fırlatır. */
export function programCoz(metin) {
  if (metin.length > EN_BUYUK_DOSYA) throw new Error('Dosya çok büyük.');
  let veri;
  try {
    veri = JSON.parse(metin);
  } catch {
    throw new Error('Bu dosya bir program dosyası değil.');
  }
  if (veri?.tur !== DOSYA_TURU || !veri.program || typeof veri.program !== 'object') {
    throw new Error('Bu dosya bir EV3 simülatör programı değil.');
  }
  if (veri.surum > DOSYA_SURUMU) {
    throw new Error('Bu dosya simülatörün daha yeni bir sürümüyle kaydedilmiş.');
  }
  return veri;
}
