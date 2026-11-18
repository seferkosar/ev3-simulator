// Web Worker: öğrenci programını ana sayfadan ayrı çalıştırır.
// Mesajlar: worker → { tur: 'hazir' | 'temizle' | 'konum' | 'bitti' | 'hata' }, ana sayfa → { kod }
import { programiYurut, agiKapat } from './yurutucu.js';

const gonder = self.postMessage.bind(self);
agiKapat(self);

self.onmessage = async ({ data }) => {
  try {
    await programiYurut(data.kod, gonder);
    gonder({ tur: 'bitti' });
  } catch (hata) {
    gonder({ tur: 'hata', mesaj: hata?.message ?? String(hata) });
  }
};

gonder({ tur: 'hazir' });
