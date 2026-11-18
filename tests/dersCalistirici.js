// Testler için: bir dersin örnek programını sahte saatle çalıştırır (simülasyonda çalışıyor mu?).
import { jsKoduUret } from '../src/bloklar/jsKodu.js';
import { yurutucuOlustur } from '../src/calistirici/yurutucu.js';
import { dersBul, dersProgrami } from '../src/dersler/dersGorevleri.js';
import { sahneBul } from '../src/simulasyon/sahneler.js';
import { alanla } from './yardimci.js';

/**
 * plan: [{ t: ms, sensorler?: {...}, dugmeler?: {...} }] — elle sensör değişiklikleri (öğrencinin yapacağı).
 * limitSn: sonsuz döngülü programlar bu kadar (sahte) saniye sonra durdurulur.
 */
export async function dersiCalistir(anahtar, secenek = {}) {
  const ders = dersBul(anahtar);
  const sahne = ders.mod === 'sahne' ? sahneBul(ders.sahne).sahne : null;
  return programiCalistir(dersProgrami(anahtar), sahne, secenek);
}

/** Blockly JSON programını (sahne varsa sahnede) sahte saatle çalıştırır. */
export async function programiCalistir(durum, sahne, { limitSn = 30, plan = [] } = {}) {
  const kod = alanla(durum, jsKoduUret);
  const sonuc = { olaylar: [], yazilar: [], isiklar: [], resimler: [], bipler: 0, robot: null, motorlar: {}, hata: null, bitti: false, sureDoldu: false };
  const donanim = { sensorler: {}, dugmeler: {} };
  const bekleyen = [...plan].sort((a, b) => a.t - b.t);
  let t = 0;
  let y;
  const ilerle = (ms) => {
    t += ms;
    while (bekleyen.length && bekleyen[0].t <= t) {
      const p = bekleyen.shift();
      Object.assign(donanim.sensorler, p.sensorler ?? {});
      Object.assign(donanim.dugmeler, p.dugmeler ?? {});
      y?.donanimGuncelle(structuredClone(donanim));
    }
    if (y && t > limitSn * 1000 && !sonuc.sureDoldu) {
      sonuc.sureDoldu = true;
      y.durdur();
    }
    return t;
  };
  y = yurutucuOlustur(
    (m) => {
      if (m.tur !== 'toplu') return;
      for (const k of m.komutlar) {
        if (k.tur === 'konum') sonuc.yazilar.push(k.metin);
        else if (k.tur === 'isik') sonuc.isiklar.push(k.renk);
        else if (k.tur === 'resim') sonuc.resimler.push(k.resim);
        else if (k.tur === 'ses' && k.islem === 'bip') sonuc.bipler++;
        else if (k.tur === 'robot') sonuc.robot = k;
        else if (k.tur === 'tamam' || k.tur === 'paket' || k.tur === 'yildiz' || k.tur === 'carpisma') sonuc.olaylar.push(k);
        else if (k.tur === 'motorlar') Object.assign(sonuc.motorlar, k.durum);
      }
    },
    { sahne, simdi: () => ilerle(0.25), bekle: async (ms) => { ilerle(ms); } },
  );
  y.donanimGuncelle(structuredClone(donanim));
  ilerle(0);
  try {
    await y.calistir(kod);
    sonuc.bitti = !sonuc.sureDoldu;
  } catch (hata) {
    sonuc.hata = hata.message;
  }
  return sonuc;
}
