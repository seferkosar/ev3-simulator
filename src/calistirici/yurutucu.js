// Öğrenci programını yürütür. Yalnızca Web Worker içinde çağrılır (src/calistirici/isci.js);
// burada DOM ya da ana sayfa yoktur. Testler bu modülü doğrudan kullanır.
//
// Program (jsKoduUret çıktısı) yığınları ve olayları şu çağrılarla kaydeder:
//   baslat(async (YIGIN) => { ... })                  "program başladığında"
//   olay(() => koşul, async (YIGIN) => { ... })        sensör/düğme/koşul/zamanlayıcı olayı
//   mesajGelince('mesaj1', async (YIGIN) => { ... })   "mesajı gelince"
// Her bloktan önce `await adim('blokId', YIGIN)` çağrılır (vurgulama, durdurma, nefes alma).
import {
  motorlarOlustur, yuzdedenHiz, dereceyeCevir, donusSuresiMs, donustenHizlar,
} from '../simulasyon/motorModeli.js';
import { dunyaOlustur } from '../simulasyon/dunya.js';
import * as islemler from './islemler.js';

// Öğrenci kodunun dışarıyla konuşmasını engellemek için worker'da kapatılan adlar.
const KAPATILACAKLAR = [
  'fetch', 'XMLHttpRequest', 'WebSocket', 'EventSource', 'importScripts',
  'indexedDB', 'caches', 'BroadcastChannel', 'Worker', 'SharedWorker',
];

export function agiKapat(kapsam) {
  for (const ad of KAPATILACAKLAR) {
    try {
      Object.defineProperty(kapsam, ad, { value: undefined, writable: false, configurable: false });
    } catch {
      // Tanımlanamayan ad varsa yok sayılır; zaten bu ortamda bulunmuyordur.
    }
  }
}

const ISIK_RENKLERI = ['GREEN', 'RED', 'ORANGE'];
/** Renk sensörü renkleri; ekrana yazılırken ASCII Türkçe adları kullanılır. */
export const RENK_ADLARI = {
  RED: 'kirmizi', GREEN: 'yesil', BLUE: 'mavi', YELLOW: 'sari',
  BLACK: 'siyah', WHITE: 'beyaz', BROWN: 'kahverengi', NONE: 'yok',
};
const DUGME_ADLARI = { CENTER: 'orta', LEFT: 'sol', RIGHT: 'sag', UP: 'yukari', DOWN: 'asagi' };

/** Ana sayfadan gelmeyen sensör için varsayılan değerler. */
export const SENSOR_VARSAYILAN = {
  dokunma: { basili: false },
  renk: { renk: 'NONE', yansiyan: 50, ortam: 20 },
  mesafe: { cm: 100 },
  jiroskop: { aci: 0 },
};

export const YAVAS_ADIM_MS = 400;
const NEFES_ARALIGI_MS = 15; // sürekli döngüler worker'ı kilitlemesin
const OLAY_ARALIGI_MS = 20;
const VARSAYILAN_MOTOR_HIZI = 75;
const VARSAYILAN_HAREKET_HIZI = 50;

/** Bir yığın durdurulduğunda içeriden fırlatılır; hata sayılmaz. */
class YiginDurdu extends Error {}
/** "durdur ve programdan çık" bloğu. */
class ProgramCikis extends Error {}

const gercekBekle = (ms) => new Promise((coz) => setTimeout(coz, ms));
const nefesAl = () => new Promise((coz) => setTimeout(coz, 0));

/**
 * gonder(mesaj): komutları ana sayfaya iletir. Ekran/ışık/motor/ses komutları toplu gönderilir:
 *   { tur: 'toplu', komutlar: [...] }, ayrıca { tur: 'dinliyor' }.
 * secenekler.bekle: testlerde gerçek bekleme yerine (ms) => Promise.
 */
const CIZIM_ARALIGI_MS = 33; // sahne modunda robot konumu ~30 kez/sn gönderilir

/**
 * secenekler.sahne: verilirse robot bu sahnede hareket eder ve sensörler dünyadan okunur
 * (src/simulasyon/dunya.js). Verilmezse sensörler ana sayfadan gelen elle değerlerdir.
 */
const GERCEK_ARALIK = { kur: (fn, ms) => setInterval(fn, ms), kaldir: (id) => clearInterval(id) };

/** aralik: tekrarlı zamanlayıcı (olay denetimi, çizim); testler sahte saatle değiştirir. */
export function yurutucuOlustur(
  gonder,
  { bekle = gercekBekle, simdi = () => Date.now(), yavas = false, sahne = null, aralik = GERCEK_ARALIK } = {},
) {
  // --- Komut tamponu ---
  let tampon = [];
  const komut = (k) => tampon.push(k);
  const bosalt = () => {
    if (!tampon.length) return;
    gonder({ tur: 'toplu', komutlar: tampon });
    tampon = [];
  };

  // --- Donanım durumu (ana sayfadan gelir) ---
  let donanim = { sensorler: {}, dugmeler: {} };
  const sensor = (port, tur) => {
    if (dunya) {
      dunyaGuncelle();
      // Dokunma: ön tampon bir engele değince ya da kullanıcı "Dokunmaya bas" düğmesine basınca.
      if (tur === 'dokunma') return { basili: dunya.dokunma() || Boolean(donanim.sensorler[String(port)]?.basili) };
      if (tur === 'renk') return dunya.renk();
      if (tur === 'mesafe') return { cm: dunya.mesafe() };
      return dunya.jiroskop();
    }
    return { ...SENSOR_VARSAYILAN[tur], ...(donanim.sensorler[String(port)] ?? {}) };
  };

  // --- Yığınlar ve olaylar ---
  const baslangiclar = [];
  const olaylar = [];
  const mesajlar = new Map();
  const aktif = new Set();
  const durdurulan = new Set();
  let yiginSayaci = 0;
  let cikis = false;
  let sonNefes = simdi();
  let bitirFn;
  let hataFn;
  let dinliyorBildirildi = false;
  let olayZamanlayici = null;

  async function beklet(ms) {
    bosalt();
    await bekle(Math.max(0, ms));
  }

  function yiginKontrol(yigin) {
    if (cikis || durdurulan.has(yigin)) throw new YiginDurdu();
  }

  async function adim(id, yigin) {
    yiginKontrol(yigin);
    if (yavas) {
      komut({ tur: 'blok', id });
      await beklet(YAVAS_ADIM_MS);
      yiginKontrol(yigin);
    } else if (simdi() - sonNefes > NEFES_ARALIGI_MS) {
      bosalt();
      await nefesAl();
      sonNefes = simdi();
      yiginKontrol(yigin);
    }
  }

  function bittiMi() {
    if (aktif.size > 0) return;
    if (cikis || olaylar.length === 0) {
      aralik.kaldir(olayZamanlayici);
      robotuBildir(); // görev kontrolü için son konum
      aralik.kaldir(cizimZamanlayici);
      bosalt();
      bitirFn?.();
    } else if (!dinliyorBildirildi) {
      dinliyorBildirildi = true;
      bosalt();
      gonder({ tur: 'dinliyor' });
    }
  }

  function yiginCalistir(fn) {
    const yigin = ++yiginSayaci;
    aktif.add(yigin);
    const bitis = (async () => {
      try {
        await fn(yigin);
      } catch (hata) {
        if (hata instanceof ProgramCikis) {
          cikis = true;
        } else if (!(hata instanceof YiginDurdu)) {
          hataFn?.(hata);
        }
      } finally {
        aktif.delete(yigin);
        durdurulan.delete(yigin);
        bittiMi();
      }
    })();
    return bitis;
  }

  function olaylariDenetle() {
    for (const o of olaylar) {
      let simdiki;
      try {
        simdiki = Boolean(o.kosul());
      } catch (hata) {
        hataFn?.(hata);
        return;
      }
      if (simdiki && !o.onceki && !o.calisiyor) {
        o.calisiyor = true;
        yiginCalistir(o.fn).finally(() => (o.calisiyor = false));
      }
      o.onceki = simdiki;
    }
  }

  // --- Motorlar ---
  const hamMotorlar = motorlarOlustur(simdi);
  // Hız değişmeden önce dünya o ana kadar eski hızlarla ilerletilir (sonuç saate değil hıza bağlı).
  const motorlar = {
    ...hamMotorlar,
    hizAyarla(port, hiz) {
      dunyaGuncelle();
      hamMotorlar.hizAyarla(port, hiz);
    },
  };

  // --- Sahne (dünya) ---
  const dunya = sahne ? dunyaOlustur(sahne) : null;
  let dunyaZamani = simdi();
  let cizimZamanlayici = null;
  function dunyaGuncelle() {
    if (!dunya) return;
    const t = simdi();
    const dt = (t - dunyaZamani) / 1000;
    dunyaZamani = t;
    if (dt <= 0) return;
    dunyaOlaylari(dunya.ilerle(dt, hamMotorlar.hiz(hareket.sol), hamMotorlar.hiz(hareket.sag), hamMotorlar.derece('A')));
  }
  /** Dünya olaylarını iletir; "tamam" gelirse ve sahne isterse program biter (Robot Yolculuğu). */
  function dunyaOlaylari(olaylar) {
    for (const olay of olaylar) {
      komut(olay);
      if (olay.tur === 'tamam' && sahne.tamamlanincaDur) {
        cikis = true;
        queueMicrotask(bittiMi);
      }
    }
  }
  /** Ekran ya da ses: bayraktaysa haber verildi (görev "haber ver" istiyorsa). */
  function haberVer() {
    if (!dunya) return;
    dunyaGuncelle();
    dunyaOlaylari(dunya.haberVer());
  }
  function robotuBildir() {
    if (!dunya) return;
    dunyaGuncelle();
    const tekerler = Object.fromEntries(
      Object.entries(hamMotorlar.durum()).map(([p, m]) => [p, Math.round(m.derece)]),
    );
    komut({ tur: 'robot', ...dunya.anlik(), tekerler });
  }
  const motorAyar = {}; // port → { hiz: %, durus }
  const ayar = (port) => (motorAyar[port] ??= { hiz: VARSAYILAN_MOTOR_HIZI, durus: 'HOLD' });
  const hareket = { sol: 'B', sag: 'C', hiz: VARSAYILAN_HAREKET_HIZI, durus: 'HOLD' };
  const motorBildir = () => komut({ tur: 'motorlar', durum: motorlar.durum(), zaman: simdi() });

  function motorHizi(port, yuzde) {
    motorlar.hizAyarla(port, yuzdedenHiz(yuzde));
  }

  /** Bir ya da iki motoru belli bir miktar döndürüp bekler. hizlar: { port: yuzde } */
  async function sureliDondur(hizlar, miktar, birim, yigin) {
    const portlar = Object.keys(hizlar);
    const enHizli = Math.max(...portlar.map((p) => Math.abs(hizlar[p])));
    const derece = dereceyeCevir(miktar, birim);
    const ms = derece === null ? Number(miktar) * 1000 : donusSuresiMs(derece, yuzdedenHiz(enHizli));
    const yon = derece !== null && derece < 0 ? -1 : 1;
    for (const p of portlar) motorHizi(p, hizlar[p] * yon);
    motorBildir();
    await beklet(ms);
    for (const p of portlar) motorlar.hizAyarla(p, 0);
    motorBildir();
    yiginKontrol(yigin);
  }

  const yonIsareti = (yon) => (yon === 'CCW' ? -1 : 1);

  // --- Sensörler ---
  const kalibrasyon = {}; // port → { MIN, MAX }
  const jiroSifir = {}; // port → açı ofseti
  let zamanlayiciT0 = simdi();

  const robot = {
    // Motorlar
    motorSureli: (port, yon, miktar, birim, yigin) =>
      sureliDondur({ [port]: ayar(port).hiz * yonIsareti(yon) }, miktar, birim, yigin),
    motorSureliHizla: (port, miktar, birim, hiz, yigin) =>
      sureliDondur({ [port]: islemler.sayi(hiz) }, miktar, birim, yigin),
    motorBaslat(port, yon) {
      motorHizi(port, ayar(port).hiz * yonIsareti(yon));
      motorBildir();
    },
    motorHizlaBaslat(port, hiz) {
      motorHizi(port, islemler.sayi(hiz));
      motorBildir();
    },
    motorDurdur(port) {
      motorlar.hizAyarla(port, 0);
      motorBildir();
    },
    motorHizAyarla(port, hiz) {
      ayar(port).hiz = islemler.sayi(hiz);
    },
    motorDurus(port, durus) {
      ayar(port).durus = durus;
    },
    motorDereceSifirla(port) {
      motorlar.sifirla(port);
      motorBildir();
    },
    motorDerece: (port) => Math.round(motorlar.derece(port)),
    motorHiz: (port) => Math.round(motorlar.hiz(port) / 10),

    // Hareket (iki motorlu sürüş)
    hareketMotorlari(sol, sag) {
      dunyaGuncelle();
      Object.assign(hareket, { sol, sag });
    },
    hareketHizAyarla(hiz) {
      hareket.hiz = islemler.sayi(hiz);
    },
    hareketDurus(durus) {
      hareket.durus = durus;
    },
    hareketYonlu(yon, miktar, birim, yigin) {
      const donus = { FWD: 0, BWD: 0, RIGHT: 100, LEFT: -100 }[yon] ?? 0;
      const hiz = yon === 'BWD' ? -hareket.hiz : hareket.hiz;
      return robot.hareketDonuslu(donus, miktar, birim, hiz, yigin);
    },
    hareketDonuslu(donus, miktar, birim, hiz, yigin) {
      const { sol, sag } = donustenHizlar(islemler.sayi(donus), hiz ?? hareket.hiz);
      return sureliDondur({ [hareket.sol]: sol, [hareket.sag]: sag }, miktar, birim, yigin);
    },
    hareketTank(miktar, birim, solHiz, sagHiz, yigin) {
      return sureliDondur(
        { [hareket.sol]: islemler.sayi(solHiz), [hareket.sag]: islemler.sayi(sagHiz) },
        miktar, birim, yigin,
      );
    },
    hareketBaslat(donus, hiz) {
      const h = donustenHizlar(islemler.sayi(donus), hiz ?? hareket.hiz);
      robot.hareketTankBaslat(h.sol, h.sag);
    },
    hareketTankBaslat(solHiz, sagHiz) {
      motorHizi(hareket.sol, islemler.sayi(solHiz));
      motorHizi(hareket.sag, islemler.sayi(sagHiz));
      motorBildir();
    },
    hareketDurdur() {
      motorlar.hizAyarla(hareket.sol, 0);
      motorlar.hizAyarla(hareket.sag, 0);
      motorBildir();
    },

    // Renk sensörü
    yansiyan(port) {
      const ham = sensor(port, 'renk').yansiyan;
      const k = kalibrasyon[port];
      if (!k) return ham;
      const { MIN = 0, MAX = 100 } = k;
      return Math.max(0, Math.min(100, Math.round(((ham - MIN) / (MAX - MIN || 1)) * 100)));
    },
    yansiyanAyarla(port, uc, deger) {
      kalibrasyon[port] = { ...(kalibrasyon[port] ?? {}), [uc]: islemler.sayi(deger) };
    },
    yansiyanSifirla() {
      for (const p of Object.keys(kalibrasyon)) delete kalibrasyon[p];
    },
    renk: (port) => sensor(port, 'renk').renk,
    renkAdi: (port) => RENK_ADLARI[sensor(port, 'renk').renk] ?? 'yok',
    ortam: (port) => sensor(port, 'renk').ortam,
    // Dokunma sensörü
    basili: (port) => Boolean(sensor(port, 'dokunma').basili),
    // Ultrasonik
    mesafe(port, birim) {
      const cm = sensor(port, 'mesafe').cm;
      return birim === 'IN' ? Math.round((cm / 2.54) * 10) / 10 : cm;
    },
    // Jiroskop
    aci: (port) => sensor(port, 'jiroskop').aci - (jiroSifir[port] ?? 0),
    acisalHiz: (port) => sensor(port, 'jiroskop').hiz ?? 0,
    aciSifirla(port) {
      jiroSifir[port] = sensor(port, 'jiroskop').aci;
    },
    // Tuğla düğmeleri
    dugmeBasili: (ad) => Boolean(donanim.dugmeler[ad]),
    dugmeAdi: () => DUGME_ADLARI[Object.keys(donanim.dugmeler).find((d) => donanim.dugmeler[d])] ?? '',
    // Zamanlayıcı (saniye)
    zamanlayici: () => Math.round((simdi() - zamanlayiciT0) / 100) / 10,
    zamanlayiciSifirla() {
      zamanlayiciT0 = simdi();
    },

    // Ses
    async sesCal(ad, biteneKadar) {
      komut({ tur: 'ses', islem: 'dosya', ad });
      if (biteneKadar) await beklet(1000);
    },
    async bip(nota, saniye) {
      const ms = Math.max(0, islemler.sayi(saniye) * 1000);
      komut({ tur: 'ses', islem: 'bip', nota: islemler.sayi(nota), ms });
      haberVer();
      await beklet(ms);
    },
    bipBaslat(nota) {
      komut({ tur: 'ses', islem: 'bip', nota: islemler.sayi(nota), ms: 60000 });
    },
    sesDurdur() {
      komut({ tur: 'ses', islem: 'durdur' });
    },
    sesDuzey(yuzde) {
      komut({ tur: 'ses', islem: 'duzey', yuzde: Math.max(0, Math.min(100, islemler.sayi(yuzde))) });
    },

    // Kontrol
    async bekleKosul(kosul, yigin) {
      while (!kosul()) {
        await beklet(10);
        yiginKontrol(yigin);
      }
    },
    digerleriniDurdur(yigin) {
      for (const y of aktif) if (y !== yigin) durdurulan.add(y);
    },
    programdanCik() {
      cikis = true;
      throw new ProgramCikis();
    },

    // Mesajlar
    yayinla(ad) {
      return Promise.all((mesajlar.get(ad) ?? []).map((fn) => yiginCalistir(fn)));
    },
  };

  const ekran = {
    clear: () => {
      komut({ tur: 'temizle' });
      haberVer();
    },
    draw_text(x, y, metin, renk, satir) {
      if (!Number.isFinite(x) || !Number.isFinite(y)) {
        throw new TypeError('Konum için x ve y sayı olmalı.');
      }
      komut({ tur: 'konum', x, y, metin: String(metin), ...(renk && { renk }), ...(satir && { satir: true }) });
      haberVer();
    },
    load_image: (resim) => {
      komut({ tur: 'resim', resim });
      haberVer();
    },
  };
  const isik = {
    on(renk) {
      if (!ISIK_RENKLERI.includes(renk)) throw new Error(`Bilinmeyen ışık rengi: ${renk}`);
      komut({ tur: 'isik', renk });
    },
    off: () => komut({ tur: 'isik', renk: 'OFF' }),
  };
  async function bekleBlok(ms) {
    if (!Number.isFinite(ms) || ms < 0) throw new TypeError('Bekleme süresi 0 ya da daha büyük bir sayı olmalı.');
    await beklet(ms);
  }

  return {
    /** Programı içeriden durdurur: yığınlar bir sonraki adımda biter, calistir() çözülür. */
    durdur() {
      cikis = true;
      bittiMi();
    },

    /** Ana sayfadan gelen sensör ve düğme durumunu günceller. */
    donanimGuncelle(yeni) {
      donanim = { sensorler: yeni?.sensorler ?? {}, dugmeler: yeni?.dugmeler ?? {} };
    },

    /** Programı çalıştırır; bütün yığınlar bitince (olay yoksa) çözülür, hata olursa reddedilir. */
    calistir(kod) {
      return new Promise((coz, reddet) => {
        let tamam = false;
        bitirFn = () => {
          if (!tamam) {
            tamam = true;
            coz();
          }
        };
        hataFn = (hata) => {
          if (tamam) return;
          tamam = true;
          cikis = true;
          aralik.kaldir(olayZamanlayici);
          aralik.kaldir(cizimZamanlayici);
          bosalt();
          reddet(hata);
        };
        try {
          // new Function yalnızca worker içinde kullanılır; ana sayfada eval yoktur (CLAUDE.md).
          const kaydet = new Function(
            'baslat', 'olay', 'mesajGelince', 'adim', 'ekran', 'isik', 'bekle', 'robot', 'op',
            `'use strict';\n${kod}`,
          );
          kaydet(
            (fn) => baslangiclar.push(fn),
            (kosul, fn) => olaylar.push({ kosul, fn, onceki: undefined, calisiyor: false }),
            (ad, fn) => mesajlar.set(ad, [...(mesajlar.get(ad) ?? []), fn]),
            adim, ekran, isik, bekleBlok, robot, islemler,
          );
        } catch (hata) {
          reddet(hata);
          return;
        }
        // Olaylar başlangıçtaki durumu "önceki" sayar: yalnızca değişimde tetiklenir.
        for (const o of olaylar) {
          try {
            o.onceki = Boolean(o.kosul());
          } catch (hata) {
            reddet(hata);
            return;
          }
        }
        if (olaylar.length) olayZamanlayici = aralik.kur(olaylariDenetle, OLAY_ARALIGI_MS);
        if (dunya) {
          dunyaZamani = simdi();
          robotuBildir();
          cizimZamanlayici = aralik.kur(() => {
            robotuBildir();
            bosalt();
          }, CIZIM_ARALIGI_MS);
        }
        for (const fn of baslangiclar) yiginCalistir(fn);
        bittiMi();
      });
    },
  };
}

/** Kısa yol: kodu çalıştırır, bitince çözülür (testler ve basit kullanım için). */
export function programiYurut(kod, gonder, secenekler = {}) {
  const yurutucu = yurutucuOlustur(gonder, secenekler);
  if (secenekler.donanim) yurutucu.donanimGuncelle(secenekler.donanim);
  return yurutucu.calistir(kod);
}
