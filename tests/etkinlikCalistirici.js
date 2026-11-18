// Etkinlik testleri için sahte saat: bekleme ve zamanlayıcılar bir kuyruğa girer, sürücü sırayla ilerletir.
// Olay şapkaları (düğme, mesafe, zamanlayıcı) ve birden çok yığın aynı saati paylaşır.
import { jsKoduUret } from '../src/bloklar/jsKodu.js';
import { yurutucuOlustur } from '../src/calistirici/yurutucu.js';
import { alanla } from './yardimci.js';

const makro = () => new Promise((c) => setTimeout(c, 0));

/**
 * plan: [{ t: ms, sensorler?: {...}, dugmeler?: {...} }] — öğrencinin yapacağı (dugmeler bırakılınca {} verilir).
 * Döner: yazılar, ışıklar, resimler, bipler, robot (son anlık), motorlar, hata, bitti, sureDoldu, t (ms).
 */
export async function etkinligiCalistir(durum, sahne, { limitSn = 30, plan = [] } = {}) {
  const kod = alanla(durum, jsKoduUret);
  const s = { yol: [], yazilar: [], isiklar: [], resimler: [], bipler: 0, sesler: [], robot: null, motorlar: {}, olaylar: [], hata: null, bitti: false, sureDoldu: false, t: 0 };
  let t = 0;
  let sira = 0;
  const kuyruk = []; // { at, fn, her?, id }
  const ekle = (at, fn, her) => {
    const k = { at, fn, her, id: ++sira };
    kuyruk.push(k);
    return k.id;
  };
  const aralik = {
    kur: (fn, ms) => ekle(t + ms, fn, ms),
    kaldir: (id) => {
      const i = kuyruk.findIndex((k) => k.id === id);
      if (i !== -1) kuyruk.splice(i, 1);
    },
  };
  const donanim = { sensorler: {}, dugmeler: {} };
  const bekleyen = [...plan].sort((a, b) => a.t - b.t);
  const y = yurutucuOlustur(
    (m) => {
      if (m.tur !== 'toplu') return;
      for (const k of m.komutlar) {
        if (k.tur === 'konum') s.yazilar.push(k.metin);
        else if (k.tur === 'isik') s.isiklar.push(k.renk);
        else if (k.tur === 'resim') s.resimler.push(k.resim);
        else if (k.tur === 'ses' && k.islem === 'bip') s.bipler++;
        else if (k.tur === 'ses') s.sesler.push(k);
        else if (k.tur === 'robot') { s.robot = k; s.yol.push([Math.round(k.x), Math.round(k.y), Math.round(k.yon)]); }
        else if (k.tur === 'motorlar') Object.assign(s.motorlar, k.durum);
        else if (['tamam', 'paket', 'yildiz', 'carpisma'].includes(k.tur)) s.olaylar.push(k);
      }
    },
    {
      sahne,
      simdi: () => (t += 0.05), // meşgul döngülerde de zaman ilerler
      bekle: (ms) => new Promise((coz) => ekle(t + Math.max(0, ms), coz)),
      aralik,
    },
  );
  y.donanimGuncelle(structuredClone(donanim));
  let bitti = false;
  y.calistir(kod).then(() => { bitti = true; s.bitti = !s.sureDoldu; }, (h) => { bitti = true; s.hata = h.message; });
  while (!bitti) {
    await makro();
    await makro();
    if (bitti) break;
    while (bekleyen.length && bekleyen[0].t <= t) {
      const p = bekleyen.shift();
      if (p.sensorler) Object.assign(donanim.sensorler, p.sensorler);
      if (p.dugmeler) donanim.dugmeler = { ...p.dugmeler };
      y.donanimGuncelle(structuredClone(donanim));
    }
    if (t > limitSn * 1000 && !s.sureDoldu) {
      s.sureDoldu = true;
      y.durdur();
      continue;
    }
    if (!kuyruk.length) continue; // meşgul döngü: gerçek makro görevlerle ilerler
    kuyruk.sort((a, b) => a.at - b.at || a.id - b.id);
    const k = kuyruk.shift();
    // Plandaki bir değişiklik bu zamanlayıcıdan önceyse önce ona gel.
    if (bekleyen.length && bekleyen[0].t < k.at) {
      kuyruk.unshift(k);
      t = Math.max(t, bekleyen[0].t);
      continue;
    }
    t = Math.max(t, k.at);
    if (k.her) ekle(t + k.her, k.fn, k.her) && (kuyruk.at(-1).id = k.id);
    k.fn();
  }
  s.t = t;
  return s;
}
