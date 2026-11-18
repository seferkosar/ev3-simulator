// Bloklar sahnede: worker'daki yürütücü dünya modeliyle birlikte.
import { describe, it, expect } from 'vitest';
import { jsKoduUret } from '../src/bloklar/jsKodu.js';
import { yurutucuOlustur } from '../src/calistirici/yurutucu.js';
import { sahneBul } from '../src/simulasyon/sahneler.js';
import { TEKER_CEVRESI_CM } from '../src/simulasyon/motorModeli.js';
import { program, satiraYaz, sayi, alanla } from './yardimci.js';

/** Sahte saatle çalıştırır: her bekleme saati ilerletir. Son robot durumunu ve olayları döndürür. */
async function sahnedeCalistir(durum, sahneAnahtari = 'bos') {
  let t = 0;
  const komutlar = [];
  const y = yurutucuOlustur(
    (m) => m.tur === 'toplu' && komutlar.push(...m.komutlar),
    { sahne: sahneBul(sahneAnahtari).sahne, simdi: () => t, bekle: async (ms) => { t += ms; } },
  );
  await y.calistir(alanla(durum, jsKoduUret));
  const robot = komutlar.filter((k) => k.tur === 'robot').at(-1);
  return { robot, komutlar, sure: t };
}

const ileri = (miktar, birim = 'ROT') => ({
  type: 'hareket_yonlu', fields: { YON: 'FWD', BIRIM: birim }, inputs: { MIKTAR: sayi(miktar) },
});

describe('bloklar sahnede', () => {
  it('"ileri 1 tur" robotu 17,6 cm ilerletir', async () => {
    const { robot } = await sahnedeCalistir(program([ileri(1)]));
    expect(robot.x - 30).toBeCloseTo(TEKER_CEVRESI_CM, 1);
    expect(robot.y).toBeCloseTo(75, 5);
  });

  it('"ileri 20 cm" robotu 20 cm ilerletir', async () => {
    const { robot } = await sahnedeCalistir(program([ileri(20, 'CM')]));
    expect(robot.x - 30).toBeCloseTo(20, 1);
  });

  it('"sağa 90° dön" bloğuyla dönüş: jiroskop artar', async () => {
    const { robot } = await sahnedeCalistir(
      program([{ type: 'hareket_yonlu', fields: { YON: 'RIGHT', BIRIM: 'DEG' }, inputs: { MIKTAR: sayi(180) } }]),
    );
    // Yerinde dönüşte her teker 180° döner; robot (teker çevresi/teker aralığı) oranında döner.
    expect(robot.sensorler.aci).toBeGreaterThan(80);
    expect(robot.x).toBeCloseTo(30, 5);
  });

  it('otopark çözümü: mesafe < 10 cm olana kadar ileri, dur → görev başarılı', async () => {
    const s = sahneBul('otopark');
    const { robot } = await sahnedeCalistir(
      program([
        { type: 'hareket_baslat', inputs: { DONUS: sayi(0) } },
        {
          type: 'sensor_mesafe_bekle',
          fields: { PORT: '4', KARS: 'LT', BIRIM: 'CM' },
          inputs: { DEGER: sayi(10) },
        },
        { type: 'hareket_durdur' },
      ]),
      'otopark',
    );
    expect(robot.sensorler.mesafe).toBeLessThan(10);
    const sonuc = s.kontrol({ hedefte: (r) => robot.x >= r.x && robot.x <= r.x + r.g && robot.y >= r.y && robot.y <= r.y + r.h, anlik: () => robot });
    expect(sonuc.basarili).toBe(true);
  });

  it('duvara çarpınca "carpisma" komutu gelir', async () => {
    const { komutlar } = await sahnedeCalistir(program([ileri(20)]));
    expect(komutlar.some((k) => k.tur === 'carpisma')).toBe(true);
  });

  it('ekran blokları sahnede de çalışır', async () => {
    const { komutlar } = await sahnedeCalistir(program([satiraYaz('A'), ileri(0.5)]));
    expect(komutlar.find((k) => k.tur === 'konum').metin).toBe('A');
  });

  it('sahne yoksa robot komutu gönderilmez (elle sensör modu)', async () => {
    const komutlar = [];
    const y = yurutucuOlustur((m) => m.tur === 'toplu' && komutlar.push(...m.komutlar), { bekle: async () => {} });
    await y.calistir(alanla(program([ileri(1)]), jsKoduUret));
    expect(komutlar.some((k) => k.tur === 'robot')).toBe(false);
  });

  it('jiroskop ile dönüş: açı 90 olana kadar sağa dön', async () => {
    const { robot } = await sahnedeCalistir(
      program([
        { type: 'hareket_tank_baslat', inputs: { SOL_HIZ: sayi(30), SAG_HIZ: sayi(-30) } },
        { type: 'sensor_aci_bekle', fields: { PORT: '2', KARS: 'GT' }, inputs: { DEGER: sayi(89) } },
        { type: 'hareket_durdur' },
      ]),
    );
    expect(robot.yon).toBeGreaterThan(89);
    expect(robot.yon).toBeLessThan(93);
  });
});
