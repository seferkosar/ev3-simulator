// Görevin başarılıp başarılmadığına karar verir.
// Girdi: ekran yazı günlüğü (ekranModeli.gunluk()) ve program özeti (programOzeti()).
// Çıktı: { basarili, mesaj } — mesaj öğrenciye gösterilir: kısa, Türkçe, cevabı vermeyen.
import { gorevBul } from './otoparkEkrani.js';

/** Büyük/küçük harf ve baştaki/sondaki boşluk fark etmez. */
const ayni = (a, b) => String(a).trim().toLowerCase() === String(b).trim().toLowerCase();

const yazilar = (gunluk) => gunluk.filter((g) => g.tur === 'konum' || g.tur === 'yaz');
const ilkYazi = (gunluk) => yazilar(gunluk)[0]?.metin;

const basarili = (mesaj) => ({ basarili: true, mesaj });
const eksik = (mesaj) => ({ basarili: false, mesaj });

function beklenenYazi(gunluk, beklenen) {
  if (yazilar(gunluk).some((g) => ayni(g.metin, beklenen))) return null;
  const yazilan = ilkYazi(gunluk);
  return yazilan === undefined
    ? eksik('Ekrana hiçbir şey yazılmadı.')
    : eksik(`Ekranda "${beklenen}" bekleniyordu, "${yazilan}" yazıldı.`);
}

const KONTROLLER = {
  1: ({ gunluk }) => beklenenYazi(gunluk, 'BOS') ?? basarili('Ekranda "BOS" yazıyor.'),

  2: ({ gunluk }) => {
    const hata = beklenenYazi(gunluk, 'DOLU');
    if (hata) return hata;
    const temizle = gunluk.findIndex((g) => g.tur === 'temizle');
    const sonrakiDolu = temizle !== -1 && gunluk.slice(temizle + 1).some((g) => g.tur !== 'temizle' && ayni(g.metin, 'DOLU'));
    if (!sonrakiDolu) return eksik('"DOLU" yazmadan önce ekranı temizle.');
    return basarili('Ekran temizlendi, sonra "DOLU" yazıldı.');
  },

  3: ({ gunluk, ozet }) => {
    const bosYer = (ad) => ayni(ad, 'bos_yer');
    if (!ozet.atamalar.some((a) => bosYer(a.ad))) {
      return eksik('bos_yer adında bir değişken oluştur ve değerini 5 yap.');
    }
    if (!ozet.atamalar.some((a) => bosYer(a.ad) && a.deger === '5')) {
      return eksik('bos_yer değişkeninin değerini 5 yap.');
    }
    if (!ozet.birlestirDegiskenleri.some(bosYer)) {
      return eksik('"Bos yer: " yazısını ve bos_yer değişkenini birleştir bloğuyla yan yana getir.');
    }
    return beklenenYazi(gunluk, 'Bos yer: 5') ?? basarili('Ekranda "Bos yer: 5" yazıyor.');
  },

  4: ({ gunluk }) => {
    const { hedef } = gorevBul(4);
    // satıra yaz her zaman x = 0'a yazar; hedef kutusu ekranın ortasında.
    const konumlu = gunluk.filter((g) => g.tur === 'konum' && g.x > 0 && String(g.metin).trim());
    if (!konumlu.length) return eksik('Bir yazıyı "konuma yaz" bloğuyla yaz.');
    const icinde = konumlu.some(
      ({ x, y }) =>
        x >= hedef.x && x < hedef.x + hedef.genislik && y >= hedef.y && y < hedef.y + hedef.yukseklik,
    );
    if (icinde) return basarili('Yazı hedef kutusunun içinde.');
    const { x, y } = konumlu.at(-1);
    return eksik(
      `Yazı (${x + 1}, ${y + 1}) noktasına yazıldı, hedef kutusunun dışında. ` +
        'Fareyi ekranın üstünde gezdirip kutunun konumunu bul.',
    );
  },
};

export function gorevKontrolEt(gorevNo, { gunluk, ozet }) {
  const kontrol = KONTROLLER[gorevNo];
  if (!kontrol) throw new Error(`Görev ${gorevNo} için kontrol yok.`);
  return kontrol({ gunluk, ozet });
}

/** EV3 ekranında görünmeyebilecek (ASCII olmayan) harfler var mı? */
export const asciiDisiVarMi = (gunluk) =>
  yazilar(gunluk).some((g) => /[^\x20-\x7e]/.test(g.metin));
