// Ana sayfa tarafı: programı bir Web Worker'da başlatır, gerekince durdurur.
//
// Süre kuralları (CLAUDE.md):
//  - Kilitlenme koruması: worker 3 saniye boyunca hiç yanıt vermezse durdurulur.
//    (Worker her 250 ms'de "nabız" gönderir; bekleme ve sürekli döngüler buna engel olmaz.)
//  - Toplam süre en fazla 5 dakika.
export const KILIT_SURESI_MS = 3000;
export const EN_UZUN_MS = 5 * 60 * 1000;
const BASLANGIC_SINIRI_MS = 10000; // worker hiç "hazır" demezse

/** Gerçek tarayıcı worker'ı. Testler kendi sahte worker'ını verir. */
export const tarayiciIscisi = () =>
  new Worker(new URL('./isci.js', import.meta.url), { type: 'module' });

/**
 * Sonuç: { durum: 'bitti' | 'hata' | 'zaman_asimi' | 'durduruldu', mesaj?, sinir? }
 *   zaman_asimi için sinir: 'kilit' (3 sn yanıt yok) | 'toplam' (5 dk)
 * komutGeldi(komut): ekran, ışık, motor, ses, blok vurgulama ve (sahne modunda) robot/çarpışma/yıldız komutları.
 * sahne: verilirse robot bu sahnede hareket eder (src/simulasyon/sahneler.js içindeki `sahne` verisi).
 * dinliyor(): bütün yığınlar bitti, program olayları bekliyor.
 */
export function programCalistir(
  kod,
  {
    komutGeldi,
    dinliyor = () => {},
    donanim = { sensorler: {}, dugmeler: {} },
    yavas = false,
    sahne = null,
    isciOlustur = tarayiciIscisi,
    kilitMs = KILIT_SURESI_MS,
    enUzunMs = EN_UZUN_MS,
  },
) {
  const isci = isciOlustur();
  let coz;
  const sonuc = new Promise((c) => (coz = c));
  let bitti = false;
  let kilitSayaci = setTimeout(() => bitir({ durum: 'hata', mesaj: 'Program başlatılamadı.' }), BASLANGIC_SINIRI_MS);
  let toplamSayaci = null;

  function bitir(s) {
    if (bitti) return;
    bitti = true;
    clearTimeout(kilitSayaci);
    clearTimeout(toplamSayaci);
    isci.terminate();
    coz(s);
  }

  const kilitKur = () => {
    clearTimeout(kilitSayaci);
    kilitSayaci = setTimeout(() => bitir({ durum: 'zaman_asimi', sinir: 'kilit' }), kilitMs);
  };

  isci.onmessage = ({ data }) => {
    if (bitti) return;
    if (data.tur !== 'hazir') kilitKur();
    switch (data.tur) {
      case 'hazir':
        kilitKur();
        toplamSayaci = setTimeout(() => bitir({ durum: 'zaman_asimi', sinir: 'toplam' }), enUzunMs);
        isci.postMessage({ tur: 'basla', kod, yavas, donanim, ...(sahne && { sahne }) });
        break;
      case 'toplu':
        for (const k of data.komutlar) {
          try {
            komutGeldi(k);
          } catch (hata) {
            bitir({ durum: 'hata', mesaj: hata.message });
            return;
          }
        }
        break;
      case 'dinliyor':
        dinliyor();
        break;
      case 'bitti':
        bitir({ durum: 'bitti' });
        break;
      case 'hata':
        bitir({ durum: 'hata', mesaj: data.mesaj });
        break;
    }
  };
  isci.onerror = (olay) => {
    olay?.preventDefault?.();
    bitir({ durum: 'hata', mesaj: olay?.message || 'Program başlatılamadı.' });
  };

  return {
    sonuc,
    durdur: () => bitir({ durum: 'durduruldu' }),
    /** Sensör ve düğme değişikliklerini çalışan programa iletir. */
    donanimGonder(yeni) {
      if (!bitti) isci.postMessage({ tur: 'donanim', donanim: yeni });
    },
  };
}
