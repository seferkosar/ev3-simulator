// Ana sayfa tarafı: programı bir Web Worker'da başlatır, süre dolunca durdurur.
export const ZAMAN_ASIMI_MS = 3000;
const BASLANGIC_SINIRI_MS = 10000; // worker hiç "hazır" demezse

/** Gerçek tarayıcı worker'ı. Testler kendi sahte worker'ını verir. */
export const tarayiciIscisi = () =>
  new Worker(new URL('./isci.js', import.meta.url), { type: 'module' });

/**
 * Sonuç: { durum: 'bitti' | 'hata' | 'zaman_asimi' | 'durduruldu', mesaj? }
 * 3 saniyelik sayaç worker "hazır" dedikten sonra başlar; yavaş bilgisayarda açılış süresi sayılmaz.
 */
export function programCalistir(kod, { komutGeldi, isciOlustur = tarayiciIscisi, sureMs = ZAMAN_ASIMI_MS }) {
  const isci = isciOlustur();
  let coz;
  const sonuc = new Promise((c) => (coz = c));
  let bitti = false;
  let sayac = setTimeout(
    () => bitir({ durum: 'hata', mesaj: 'Program başlatılamadı.' }),
    BASLANGIC_SINIRI_MS,
  );

  function bitir(s) {
    if (bitti) return;
    bitti = true;
    clearTimeout(sayac);
    isci.terminate();
    coz(s);
  }

  isci.onmessage = ({ data }) => {
    if (bitti) return;
    switch (data.tur) {
      case 'hazir':
        clearTimeout(sayac);
        sayac = setTimeout(() => bitir({ durum: 'zaman_asimi' }), sureMs);
        isci.postMessage({ kod });
        break;
      case 'temizle':
      case 'konum':
        try {
          komutGeldi(data);
        } catch (hata) {
          bitir({ durum: 'hata', mesaj: hata.message });
        }
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

  return { sonuc, durdur: () => bitir({ durum: 'durduruldu' }) };
}
