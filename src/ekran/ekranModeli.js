// Sanal EV3 ekranının modeli. Canvas'a dokunmaz; çizim ayrı bir modülde yapılır.
// Yöntem adları Pybricks EV3 ekran API'siyle aynıdır: clear, print, draw_text, load_image.
//
// Not: Gerçek EV3 yazı tipi ve satır yüksekliği yaklaşık olarak taklit edilir.

export const EKRAN_GENISLIGI = 178;
export const EKRAN_YUKSEKLIGI = 128;
export const SATIR_YUKSEKLIGI = 16;

const MAKS_SATIR = Math.floor(EKRAN_YUKSEKLIGI / SATIR_YUKSEKLIGI);
/** Sonsuz döngüde bellek dolmasın: günlük en fazla bu kadar kayıt tutar (görev kontrolü için yeterli). */
export const EN_FAZLA_GUNLUK = 5000;

/** Ekranda gösterilebilen resimler (Pybricks ImageFile adları). Çizimleri ekranCizici.js'te. */
export const RESIMLER = ['NEUTRAL', 'AWAKE', 'SLEEPING', 'ANGRY', 'DIZZY', 'WINKING', 'LOVE'];

/** Worker'dan gelen ekran komutunu modele uygular (src/calistirici/yurutucu.js). */
export function komutuUygula(ekran, komut) {
  if (komut.tur === 'temizle') ekran.clear();
  else if (komut.tur === 'konum') ekran.draw_text(komut.x, komut.y, komut.metin, komut.renk, komut.satir);
  else if (komut.tur === 'resim') ekran.load_image(komut.resim);
  else throw new Error(`Bilinmeyen ekran komutu: ${komut.tur}`);
}

/**
 * Yeni, boş bir ekran oluşturur.
 *
 * gunluk(): Programın ekrana yaptığı her işlemin kaydı. Görev kontrolü bunu kullanır.
 *   { tur: 'temizle' } | { tur: 'yaz' | 'konum', metin, x, y } | { tur: 'resim', resim }
 * ogeler(): Ekranda şu an görünenler: { metin, x, y } | { resim }. Çizici bunu kullanır.
 */
export function ekranOlustur() {
  const kayitlar = [];
  const gunluk = { push: (k) => kayitlar.length < EN_FAZLA_GUNLUK && kayitlar.push(k) };
  let ogeler = [];
  let satir = 0;

  function satirEkle(metin) {
    if (satir >= MAKS_SATIR) {
      ogeler = ogeler
        .map((o) => ({ ...o, y: o.y - SATIR_YUKSEKLIGI }))
        .filter((o) => o.y >= 0);
      satir = MAKS_SATIR - 1;
    }
    ogeler.push({ metin, x: 0, y: satir * SATIR_YUKSEKLIGI });
    satir += 1;
  }

  return {
    clear() {
      gunluk.push({ tur: 'temizle' });
      ogeler = [];
      satir = 0;
    },

    print(...degerler) {
      const metin = degerler.map(String).join(' ');
      const y = Math.min(satir, MAKS_SATIR - 1) * SATIR_YUKSEKLIGI;
      gunluk.push({ tur: 'yaz', metin, x: 0, y });
      metin.split('\n').forEach(satirEkle);
    },

    /**
     * renk: yalnızca 'WHITE' (siyah zemin üstüne beyaz yazı) kaydedilir; varsayılan siyah.
     * satiriTemizle: "yaz, satır" bloğu önce o satırdaki eski yazıları siler (üst üste binmesin).
     */
    draw_text(x, y, deger, renk, satiriTemizle = false) {
      if (!Number.isFinite(x) || !Number.isFinite(y)) {
        throw new TypeError('Konum için x ve y sayı olmalı.');
      }
      const metin = String(deger);
      const ek = renk === 'WHITE' ? { renk } : {};
      if (satiriTemizle) {
        ogeler = ogeler.filter((o) => o.resim || o.y + SATIR_YUKSEKLIGI <= y || o.y >= y + SATIR_YUKSEKLIGI);
      }
      gunluk.push({ tur: 'konum', metin, x, y, ...ek });
      ogeler.push({ metin, x, y, ...ek });
      // Döngüde üst üste yazılanlar birikmesin: en eski görünen yazı atılır.
      if (ogeler.length > 400) ogeler.shift();
    },

    /** Pybricks'teki gibi önce ekranı temizler, sonra resmi bütün ekrana çizer. */
    load_image(resim) {
      if (!RESIMLER.includes(resim)) throw new Error(`Bilinmeyen resim: ${resim}`);
      gunluk.push({ tur: 'resim', resim });
      ogeler = [{ resim }];
      satir = 0;
    },

    gunluk() {
      return kayitlar.map((g) => ({ ...g }));
    },

    ogeler() {
      return ogeler.map((o) => ({ ...o }));
    },
  };
}
