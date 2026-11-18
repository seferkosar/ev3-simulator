import { describe, it, expect } from 'vitest';
import { dunyaOlustur, ROBOT, MESAFE_EN_FAZLA, YANSIYAN } from '../src/simulasyon/dunya.js';
import { SAHNELER, sahneBul } from '../src/simulasyon/sahneler.js';
import { TEKER_CEVRESI_CM } from '../src/simulasyon/motorModeli.js';

const saha = (ek = {}) => ({ genislik: 200, yukseklik: 150, baslangic: { x: 50, y: 75, yon: 0 }, ...ek });

describe('kinematik', () => {
  it('iki teker 1 tur → düz 17,6 cm', () => {
    const d = dunyaOlustur(saha());
    d.ilerle(1, 360, 360);
    const { x, y, yon } = d.anlik();
    expect(x - 50).toBeCloseTo(TEKER_CEVRESI_CM, 5);
    expect(y).toBeCloseTo(75, 5);
    expect(yon).toBeCloseTo(0, 5);
  });

  it('yerinde sağa dönüş: konum aynı, yön ve jiroskop artar', () => {
    const d = dunyaOlustur(saha());
    // Teker aralığı çevresi / teker çevresi = 90° dönüş için gereken teker dönüşü
    const derece = (Math.PI * ROBOT.tekerAraligi / 4 / TEKER_CEVRESI_CM) * 360;
    d.ilerle(1, derece, -derece);
    const { x, y, yon, sensorler } = d.anlik();
    expect(x).toBeCloseTo(50, 5);
    expect(y).toBeCloseTo(75, 5);
    expect(yon).toBeCloseTo(90, 3);
    expect(sensorler.aci).toBe(90);
  });

  it('yukarı bakan robot ileri gidince y azalır', () => {
    const d = dunyaOlustur(saha({ baslangic: { x: 50, y: 75, yon: -90 } }));
    d.ilerle(1, 360, 360);
    expect(d.anlik().y).toBeCloseTo(75 - TEKER_CEVRESI_CM, 5);
  });
});

describe('çarpışma ve dokunma', () => {
  it('duvara gelince durur, bir kez bildirir, dokunma basılı', () => {
    const d = dunyaOlustur(saha({ engeller: [{ x: 80, y: 0, g: 5, h: 150 }] }));
    const olaylar = d.ilerle(5, 360, 360);
    const { x, carpti } = d.anlik();
    expect(x + ROBOT.on).toBeLessThanOrEqual(80);
    expect(x + ROBOT.on).toBeGreaterThan(79);
    expect(carpti).toBe(true);
    expect(olaylar.filter((o) => o.tur === 'carpisma')).toHaveLength(1);
    expect(d.dokunma()).toBe(true);
    expect(d.ilerle(1, 360, 360)).toEqual([]); // dayanmaya devam: yeni olay yok
  });

  it('saha kenarı da duvardır', () => {
    const d = dunyaOlustur(saha());
    d.ilerle(20, 360, 360);
    expect(d.anlik().x + ROBOT.on).toBeLessThanOrEqual(200);
  });
});

describe('sensörler dünyadan', () => {
  it('ultrasonik: öndeki duvara uzaklık', () => {
    const d = dunyaOlustur(saha({ engeller: [{ x: 100, y: 0, g: 5, h: 150 }] }));
    expect(d.mesafe()).toBeCloseTo(100 - (50 + ROBOT.ultrasonik), 1);
  });
  it('ultrasonik: hiçbir şey yoksa saha kenarı; 255 ile sınırlı', () => {
    const d = dunyaOlustur({ genislik: 600, yukseklik: 150, baslangic: { x: 10, y: 75, yon: 0 } });
    expect(d.mesafe()).toBe(MESAFE_EN_FAZLA);
  });
  it('renk: çizginin üstünde siyah, dışında beyaz zemin', () => {
    const cizgili = saha({ cizgiler: [{ noktalar: [[50 + ROBOT.renkSensoru, 0], [50 + ROBOT.renkSensoru, 150]], kalinlik: 2, renk: 'BLACK' }] });
    expect(dunyaOlustur(cizgili).renk()).toEqual({ renk: 'BLACK', yansiyan: YANSIYAN.BLACK, ortam: 30 });
    expect(dunyaOlustur(saha()).renk().renk).toBe('WHITE');
  });
  it('renk: bölge', () => {
    const d = dunyaOlustur(saha({ bolgeler: [{ x: 40, y: 60, g: 30, h: 30, renk: 'GREEN' }] }));
    expect(d.renk().renk).toBe('GREEN');
  });
});

describe('yıldızlar, hedef, ölçüm', () => {
  it('yıldızın üstünden geçince toplanır', () => {
    const d = dunyaOlustur(saha({ yildizlar: [{ x: 60, y: 75 }] }));
    const olaylar = d.ilerle(1, 360, 360);
    expect(olaylar).toContainEqual({ tur: 'yildiz', puan: 1 });
    expect(d.anlik().puan).toBe(1);
  });
  it('gidilen mesafe ve sıfırlama', () => {
    const d = dunyaOlustur(saha());
    d.ilerle(2, 360, 360);
    expect(d.gidilenMesafe()).toBeCloseTo(2 * TEKER_CEVRESI_CM, 5);
    d.sifirla();
    expect(d.gidilenMesafe()).toBe(0);
    expect(d.iz()).toEqual([[50, 75]]);
  });
});

describe('hazır sahneler', () => {
  it.each(SAHNELER.map((s) => [s.ad, s]))('%s: robot başlangıçta bir engelin içinde değil', (_ad, s) => {
    const d = dunyaOlustur(s.sahne);
    expect(d.ilerle(0.001, 0, 0)).toEqual([]);
    expect(d.anlik().carpti).toBe(false);
  });

  it('otopark: düz ileri gidip mesafe sensörüyle durunca görev başarılı', () => {
    const s = sahneBul('otopark');
    const d = dunyaOlustur(s.sahne);
    while (d.mesafe() > 10) d.ilerle(0.05, 500, 500);
    expect(s.kontrol(d).basarili).toBe(true);
  });

  it('otopark: duvara çarparsa başarısız', () => {
    const s = sahneBul('otopark');
    const d = dunyaOlustur(s.sahne);
    d.ilerle(10, 500, 500);
    expect(s.kontrol(d)).toEqual({ basarili: false, mesaj: expect.stringContaining('çarptın') });
  });

  it('çizgi pisti: başlangıçta renk sensörü çizginin üstünde', () => {
    expect(dunyaOlustur(sahneBul('cizgi').sahne).renk().renk).toBe('BLACK');
  });
});
