// Hazır sahneler (2B üstten). Ölçüler cm; saha 200 × 150 cm (bir masa matı büyüklüğünde).
// Her sahnenin görevi ve görev kontrolü var; kontrol program bitince dünya durumuna bakar.

const SAHA = { genislik: 200, yukseklik: 150 };

/** Köşeleri yuvarlatılmış dikdörtgen çizgi (kapalı). */
function yuvarlakDikdortgen(x, y, g, h, r, adim = 6) {
  const noktalar = [];
  const yay = (cx, cy, bas) => {
    for (let i = 0; i <= adim; i++) {
      const a = ((bas + (90 * i) / adim) * Math.PI) / 180;
      noktalar.push([cx + r * Math.cos(a), cy + r * Math.sin(a)]);
    }
  };
  yay(x + g - r, y + h - r, 0);
  yay(x + r, y + h - r, 90);
  yay(x + r, y + r, 180);
  yay(x + g - r, y + r, 270);
  noktalar.push(noktalar[0]);
  return noktalar;
}

// --- Otopark: 4 park yeri, 3'ü dolu; boş olan yeşil ---
const PARK_X = (i) => 28 + i * 38;
const otoparkHedef = { x: PARK_X(2) + 4, y: 2, g: 28, h: 40 };
const araba = (i) => ({ x: PARK_X(i) + 6, y: 4, g: 24, h: 36, tur: 'araba' });

// --- Çizgi pisti ---
const pist = yuvarlakDikdortgen(30, 30, 140, 90, 25);

// --- Labirent ---
const labirentCikis = { x: 160, y: 10, g: 32, h: 32 };

export const SAHNELER = [
  {
    anahtar: 'bos',
    ad: 'Boş saha',
    gorev: 'Serbest sürüş. Çalıştırmadan önce robotun kaç cm gideceğini tahmin et, sonra cetvelle ölç.',
    sahne: { ...SAHA, baslangic: { x: 30, y: 75, yon: 0 } },
    kontrol: null,
  },
  {
    anahtar: 'otopark',
    ad: 'Otopark',
    gorev: 'Robotu boş (yeşil) park yerine sür ve duvara çarpmadan dur. Mesafe sensörü yardımcı olur.',
    sahne: {
      ...SAHA,
      baslangic: { x: PARK_X(2) + 18, y: 128, yon: -90 },
      engeller: [araba(0), araba(1), araba(3)],
      bolgeler: [{ ...otoparkHedef, renk: 'GREEN' }],
      cizgiler: [0, 1, 2, 3, 4].map((i) => ({
        noktalar: [[PARK_X(i) - 1, 0], [PARK_X(i) - 1, 46]],
        kalinlik: 1.5,
        renk: 'YELLOW',
      })),
      hedef: otoparkHedef,
    },
    kontrol: (d) => {
      if (!d.hedefte(otoparkHedef)) return { basarili: false, mesaj: 'Robot yeşil park yerinde durmadı.' };
      if (d.anlik().carpti) return { basarili: false, mesaj: 'Park yerine girdin ama bir yere çarptın. Daha önce durmayı dene.' };
      return { basarili: true, mesaj: 'Robot çarpmadan park etti.' };
    },
  },
  {
    anahtar: 'cizgi',
    ad: 'Çizgi pisti',
    gorev: 'Renk sensörüyle siyah çizgiyi izle ve bütün yıldızları topla.',
    sahne: {
      ...SAHA,
      baslangic: { x: 60, y: 120, yon: 0 },
      cizgiler: [{ noktalar: pist, kalinlik: 2.5, renk: 'BLACK' }],
      yildizlar: [
        { x: 115, y: 120 }, { x: 170, y: 75 }, { x: 115, y: 30 }, { x: 55, y: 30 }, { x: 30, y: 75 },
      ],
    },
    kontrol: (d) => {
      const { puan, yildizlar } = d.anlik();
      return puan === yildizlar.length
        ? { basarili: true, mesaj: 'Bütün yıldızları topladın.' }
        : { basarili: false, mesaj: `${yildizlar.length} yıldızdan ${puan} tanesini topladın.` };
    },
  },
  {
    anahtar: 'labirent',
    ad: 'Labirent',
    gorev: 'Labirentten çık: robotu yeşil alana ulaştır.',
    sahne: {
      ...SAHA,
      baslangic: { x: 27, y: 128, yon: -90 },
      engeller: [
        { x: 55, y: 45, g: 5, h: 105 },
        { x: 115, y: 0, g: 5, h: 105 },
      ],
      bolgeler: [{ ...labirentCikis, renk: 'GREEN' }],
      hedef: labirentCikis,
    },
    kontrol: (d) =>
      d.hedefte(labirentCikis)
        ? { basarili: true, mesaj: 'Labirentten çıktın.' }
        : { basarili: false, mesaj: 'Robot yeşil çıkışa ulaşmadı.' },
  },
];

export const sahneBul = (anahtar) => SAHNELER.find((s) => s.anahtar === anahtar) ?? SAHNELER[0];
