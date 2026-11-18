// Robotun sahnedeki dünyası: konum, yön, çarpışma ve sensörlerin dünyadan hesaplanması.
// Birimler: cm, derece, saniye. Koordinatlar ekran gibi: x sağa, y aşağı artar.
// Yön 0° = sağa (doğu), saat yönünde artar (EV3 jiroskobu gibi: sağa dönüş artı).
// Saf modül: hem worker'da (sensör okuma) hem testlerde kullanılır.
import { TEKER_CEVRESI_CM } from './motorModeli.js';

/** EV3 eğitim seti sürüş tabanına yakın ölçüler (cm). Robotun konumu teker ekseninin ortasıdır. */
export const ROBOT = {
  tekerAraligi: 11.2,
  on: 10, // eksenden öne
  arka: 6, // eksenden arkaya
  yariGenislik: 7,
  renkSensoru: 8, // eksenden öne, gövdenin altında
  ultrasonik: 10, // ön yüz
};

export const MESAFE_EN_FAZLA = 255;
/** Kol (A motoru) bu dereceden aşağıdaysa indirilmiş sayılır (kolu indir = A motoru −90°). */
export const KOL_INIK_DERECE = -45;
const PAKET_TUTMA_CM = 12;
const ULTRASONIK_KONI = [-8, 0, 8]; // derece
const ADIM_SN = 0.01; // entegrasyon alt adımı
const RAD = Math.PI / 180;

/** Renk → yansıyan ışık yüzdesi (yaklaşık EV3 değerleri). */
export const YANSIYAN = {
  WHITE: 90, YELLOW: 80, RED: 55, BROWN: 20, GREEN: 15, BLUE: 12, BLACK: 5, NONE: 0,
};

const icinde = (p, r) => p.x >= r.x && p.x <= r.x + r.g && p.y >= r.y && p.y <= r.y + r.h;

function parcayaUzaklik(p, a, b) {
  const dx = b[0] - a[0];
  const dy = b[1] - a[1];
  const t = Math.max(0, Math.min(1, ((p.x - a[0]) * dx + (p.y - a[1]) * dy) / (dx * dx + dy * dy || 1)));
  return Math.hypot(p.x - (a[0] + t * dx), p.y - (a[1] + t * dy));
}

/** Işın ile dikdörtgenin kesişme uzaklığı (yoksa Infinity). */
function isinDikdortgen(o, d, r) {
  let tmin = 0;
  let tmax = Infinity;
  for (const [p, v, lo, hi] of [[o.x, d.x, r.x, r.x + r.g], [o.y, d.y, r.y, r.y + r.h]]) {
    if (Math.abs(v) < 1e-9) {
      if (p < lo || p > hi) return Infinity;
    } else {
      let t1 = (lo - p) / v;
      let t2 = (hi - p) / v;
      if (t1 > t2) [t1, t2] = [t2, t1];
      tmin = Math.max(tmin, t1);
      tmax = Math.min(tmax, t2);
      if (tmin > tmax) return Infinity;
    }
  }
  return tmin;
}

/** Işının saha kenarına uzaklığı (içeriden). */
function isinKenar(o, d, saha) {
  let t = Infinity;
  if (d.x > 1e-9) t = Math.min(t, (saha.genislik - o.x) / d.x);
  if (d.x < -1e-9) t = Math.min(t, -o.x / d.x);
  if (d.y > 1e-9) t = Math.min(t, (saha.yukseklik - o.y) / d.y);
  if (d.y < -1e-9) t = Math.min(t, -o.y / d.y);
  return Math.max(0, t);
}

/** Robotun yerel noktasını (ileri, sağa) dünya koordinatına çevirir. */
function yerelden(robot, ileri, saga) {
  const a = robot.yon * RAD;
  return {
    x: robot.x + ileri * Math.cos(a) - saga * Math.sin(a),
    y: robot.y + ileri * Math.sin(a) + saga * Math.cos(a),
  };
}

/** Gövde kenarındaki denetim noktaları (köşeler ve kenar ortaları). */
function govdeNoktalari(robot) {
  const { on, arka, yariGenislik: w } = ROBOT;
  return [
    [on, -w], [on, 0], [on, w], [0, w], [-arka, w], [-arka, 0], [-arka, -w], [0, -w],
  ].map(([i, s]) => yerelden(robot, i, s));
}

/**
 * sahne: { genislik, yukseklik, baslangic: {x, y, yon}, engeller: [{x,y,g,h}],
 *          bolgeler: [{x,y,g,h,renk}], cizgiler: [{noktalar: [[x,y]...], kalinlik, renk}],
 *          yildizlar: [{x,y}], hedef?: {x,y,g,h},
 *          paketler?: [{x,y}], teslim?: {x,y,g,h}, haberVer?: bool }
 * paketler/teslim: kol (A motoru) indirilince yakındaki paket tutulur, kaldırılınca bırakılır.
 * haberVer: görevin tamamlanması için robot bayraktayken ekrana bir şey yazmalı (Robot Yolculuğu).
 */
export function dunyaOlustur(sahne) {
  let robot;
  let toplamDonus;
  let acisalHiz;
  let carpti; // program boyunca hiç çarptı mı (görev kontrolü)
  let carpismada; // şu an bir engele dayanıyor mu
  let yildizlar;
  let iz;
  let paketler;
  let tasinan; // tutulan paketin sırası ya da -1
  let haberVerildi;
  let tamamBildirildi;

  function sifirla() {
    robot = { ...sahne.baslangic };
    toplamDonus = 0;
    acisalHiz = 0;
    carpti = false;
    carpismada = false;
    yildizlar = (sahne.yildizlar ?? []).map(() => false);
    iz = [[robot.x, robot.y]];
    paketler = (sahne.paketler ?? []).map((p) => ({ x: p.x, y: p.y, teslim: false }));
    tasinan = -1;
    haberVerildi = false;
    tamamBildirildi = false;
  }
  sifirla();

  const engelde = (p) =>
    p.x < 0 || p.y < 0 || p.x > sahne.genislik || p.y > sahne.yukseklik ||
    (sahne.engeller ?? []).some((e) => icinde(p, e));

  function zeminRengi(p) {
    for (const c of [...(sahne.cizgiler ?? [])].reverse()) {
      for (let i = 1; i < c.noktalar.length; i++) {
        if (parcayaUzaklik(p, c.noktalar[i - 1], c.noktalar[i]) <= c.kalinlik / 2) return c.renk;
      }
    }
    for (const b of [...(sahne.bolgeler ?? [])].reverse()) if (icinde(p, b)) return b.renk;
    return sahne.zeminRengi ?? 'WHITE';
  }

  const hedefte = () => Boolean(sahne.hedef) && icinde(robot, sahne.hedef);

  /** Bayrağa varıldı, bütün yıldızlar ve paketler tamam, gerekiyorsa haber verildi. */
  function gorevTamam() {
    if (!sahne.hedef || !hedefte()) return false;
    if (yildizlar.some((y) => !y)) return false;
    if (paketler.some((p) => !p.teslim) || tasinan !== -1) return false;
    return !sahne.haberVer || haberVerildi;
  }
  function tamamMi(olaylar) {
    // Yalnızca Robot Yolculuğu aşamaları (tamamlanincaDur) "tamam" olayı alır; diğer sahnelerin kendi kontrolü var.
    if (sahne.tamamlanincaDur && !tamamBildirildi && gorevTamam()) {
      tamamBildirildi = true;
      olaylar.push({ tur: 'tamam' });
    }
  }

  function kolDurumu(kolDerece, olaylar) {
    if (kolDerece === undefined) return;
    const inik = kolDerece <= KOL_INIK_DERECE;
    if (inik && tasinan === -1) {
      const i = paketler.findIndex((p) => !p.teslim && Math.hypot(p.x - robot.x, p.y - robot.y) < PAKET_TUTMA_CM);
      if (i !== -1) {
        tasinan = i;
        olaylar.push({ tur: 'paket', islem: 'tut' });
      }
    } else if (!inik && tasinan !== -1) {
      const p = paketler[tasinan];
      p.x = robot.x;
      p.y = robot.y;
      p.teslim = Boolean(sahne.teslim) && icinde(p, sahne.teslim);
      olaylar.push({ tur: 'paket', islem: p.teslim ? 'teslim' : 'birak' });
      tasinan = -1;
    }
  }

  function yildizlariTopla(olaylar) {
    (sahne.yildizlar ?? []).forEach((y, i) => {
      if (!yildizlar[i] && Math.hypot(y.x - robot.x, y.y - robot.y) < 8) {
        yildizlar[i] = true;
        olaylar.push({ tur: 'yildiz', puan: yildizlar.filter(Boolean).length });
      }
    });
  }

  return {
    sifirla,

    /**
     * dt saniye boyunca sol/sağ teker hızlarıyla (°/sn) ilerler.
     * Döner: bu adımda olan olaylar ([{ tur: 'carpisma' } | { tur: 'yildiz', puan }]).
     */
    ilerle(dt, solDereceSn, sagDereceSn, kolDerece) {
      const olaylar = [];
      kolDurumu(kolDerece, olaylar);
      const vSol = (solDereceSn / 360) * TEKER_CEVRESI_CM;
      const vSag = (sagDereceSn / 360) * TEKER_CEVRESI_CM;
      const v = (vSol + vSag) / 2;
      const w = (vSol - vSag) / ROBOT.tekerAraligi; // rad/sn, saat yönü artı
      acisalHiz = dt > 0 ? w / RAD : 0;
      let kalan = dt;
      while (kalan > 1e-9) {
        const h = Math.min(ADIM_SN, kalan);
        kalan -= h;
        const a = robot.yon * RAD;
        const yeni = {
          x: robot.x + v * Math.cos(a) * h,
          y: robot.y + v * Math.sin(a) * h,
          yon: robot.yon + (w * h) / RAD,
        };
        if (govdeNoktalari(yeni).some(engelde)) {
          if (!carpismada) olaylar.push({ tur: 'carpisma' });
          carpti = true;
          carpismada = true;
          acisalHiz = 0;
          break;
        }
        carpismada = false;
        toplamDonus += yeni.yon - robot.yon;
        robot = yeni;
        const son = iz[iz.length - 1];
        if (Math.hypot(robot.x - son[0], robot.y - son[1]) > 0.8) iz.push([robot.x, robot.y]);
        if (iz.length > 4000) iz.splice(0, iz.length - 4000);
        yildizlariTopla(olaylar);
      }
      if (tasinan !== -1) Object.assign(paketler[tasinan], { x: robot.x, y: robot.y });
      tamamMi(olaylar);
      return olaylar;
    },

    /** Program ekrana yazdı ya da ses çaldı: robot bayraktaysa "haber verildi" sayılır. */
    haberVer() {
      const olaylar = [];
      if (hedefte()) haberVerildi = true;
      tamamMi(olaylar);
      return olaylar;
    },
    gorevTamam,

    // --- Sensörler ---
    /** Ultrasonik: öndeki en yakın engele uzaklık (cm, en fazla 255). */
    mesafe() {
      const o = yerelden(robot, ROBOT.ultrasonik, 0);
      let enYakin = MESAFE_EN_FAZLA;
      for (const sapma of ULTRASONIK_KONI) {
        const a = (robot.yon + sapma) * RAD;
        const d = { x: Math.cos(a), y: Math.sin(a) };
        let t = isinKenar(o, d, sahne);
        for (const e of sahne.engeller ?? []) t = Math.min(t, isinDikdortgen(o, d, e));
        enYakin = Math.min(enYakin, t);
      }
      return Math.round(enYakin * 10) / 10;
    },
    /** Renk sensörü: altındaki zeminin rengi, yansıyan ve ortam ışığı. */
    renk() {
      const renk = zeminRengi(yerelden(robot, ROBOT.renkSensoru, 0));
      return { renk, yansiyan: YANSIYAN[renk] ?? 50, ortam: 30 };
    },
    /** Dokunma: ön tampon bir engele değiyor mu. */
    dokunma() {
      return [-4, 0, 4].some((s) => engelde(yerelden(robot, ROBOT.on + 1, s)));
    },
    /** Jiroskop: başlangıçtan beri toplam dönüş (°, sağa artı) ve dönüş hızı (°/sn). */
    jiroskop: () => ({ aci: Math.round(toplamDonus), hiz: Math.round(acisalHiz) }),

    /** Çizim için anlık durum. */
    anlik() {
      const us = yerelden(robot, ROBOT.ultrasonik, 0);
      const mesafe = this.mesafe();
      const a = robot.yon * RAD;
      return {
        x: robot.x,
        y: robot.y,
        yon: robot.yon,
        carpti,
        yildizlar: [...yildizlar],
        puan: yildizlar.filter(Boolean).length,
        paketler: paketler.map((p, i) => ({ ...p, tasiniyor: i === tasinan })),
        haberVerildi,
        gorevTamam: gorevTamam(),
        bayrakta: hedefte(),
        sensorler: {
          mesafe,
          ...this.renk(),
          dokunma: this.dokunma(),
          ...this.jiroskop(),
        },
        isin: { x1: us.x, y1: us.y, x2: us.x + Math.cos(a) * mesafe, y2: us.y + Math.sin(a) * mesafe },
        renkNoktasi: yerelden(robot, ROBOT.renkSensoru, 0),
      };
    },
    iz: () => iz.map((p) => [...p]),
    /** Robotun merkezi bir dikdörtgenin içinde mi (görev kontrolü). */
    hedefte: (r) => icinde(robot, r),
    /** Başlangıçtan düz çizgi uzaklığı (cm) — "tahmin et, sonra ölç". */
    gidilenMesafe: () => Math.hypot(robot.x - sahne.baslangic.x, robot.y - sahne.baslangic.y),
  };
}
