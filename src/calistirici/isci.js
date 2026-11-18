// Web Worker: öğrenci programını ana sayfadan ayrı çalıştırır.
// Ana sayfa → { tur: 'basla', kod, yavas, donanim, sahne? } | { tur: 'donanim', donanim }
// Worker → { tur: 'hazir' | 'nabiz' | 'toplu' | 'dinliyor' | 'bitti' | 'hata' }
import { yurutucuOlustur, agiKapat } from './yurutucu.js';

const gonder = self.postMessage.bind(self);
agiKapat(self);

// Kilitlenme koruması: worker yanıt verebildiği sürece düzenli "nabız" gönderir.
setInterval(() => gonder({ tur: 'nabiz' }), 250);

let yurutucu = null;

self.onmessage = async ({ data }) => {
  if (data.tur === 'donanim') {
    yurutucu?.donanimGuncelle(data.donanim);
    return;
  }
  if (data.tur !== 'basla' || yurutucu) return;
  yurutucu = yurutucuOlustur(gonder, { yavas: Boolean(data.yavas), sahne: data.sahne ?? null });
  yurutucu.donanimGuncelle(data.donanim);
  try {
    await yurutucu.calistir(data.kod);
    gonder({ tur: 'bitti' });
  } catch (hata) {
    gonder({ tur: 'hata', mesaj: hata?.message ?? String(hata) });
  }
};

gonder({ tur: 'hazir' });
