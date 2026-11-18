// EV3 çalışma sitesinden seçilen etkinlikler simülasyonda çalışıyor mu?
// Elle sensörlü etkinlikler, öğrencinin yapacağı düğme/sensör hareketleriyle (plan) çalıştırılır.
import { describe, it, expect } from 'vitest';
import { ETKINLIK_GORUNUMU, etkinlikProgrami } from '../src/etkinlikler/etkinlikler.js';
import { pythonKoduUret } from '../src/bloklar/pythonKodu.js';
import { etkinligiCalistir } from './etkinlikCalistirici.js';
import { alanla } from './yardimci.js';
import { spawnSync } from 'node:child_process';

const bas = (t, dugme, sure = 150) => [{ t, dugmeler: { [dugme]: true } }, { t: t + sure, dugmeler: {} }];
const dokun = (t) => [{ t, sensorler: { 1: { tur: 'dokunma', basili: true } } }, { t: t + 150, sensorler: { 1: { tur: 'dokunma', basili: false } } }];
const mesafe = (t, cm) => ({ t, sensorler: { 4: { tur: 'mesafe', cm } } });
const aci = (t, a) => ({ t, sensorler: { 2: { tur: 'jiroskop', aci: a } } });
const icinde = (r, h) => r.x >= h.x && r.x <= h.x + h.g && r.y >= h.y && r.y <= h.y + h.h;

/** id → [seçenekler, denetim] */
const BEKLENEN = {
  133: [{}, (s) => {
    expect(s.yazilar).toEqual(expect.arrayContaining(['Merhaba!', 'Ben EV3', 'Sinif: 7-A', 'Hosca kal!']));
    expect(s.resimler).toEqual(['NEUTRAL']);
    expect(s.bitti).toBe(true);
  }],
  134: [{ limitSn: 10 }, (s) => expect(s.isiklar.slice(0, 3)).toEqual(['GREEN', 'ORANGE', 'RED'])],
  135: [{ limitSn: 3, plan: [...bas(500, 'LEFT'), ...bas(1000, 'CENTER'), ...bas(1500, 'UP')] }, (s) => {
    expect(s.yazilar).toContain('EV3 PIYANO');
    expect(s.bipler).toBe(3);
  }],
  136: [{ limitSn: 4, plan: [...bas(2050, 'LEFT'), ...bas(3000, 'CENTER')] }, (s) => {
    expect(s.yazilar.some((y) => /^Tur: 2(\.1)?$/.test(y))).toBe(true);
    expect(s.bipler).toBe(1);
    expect(Number(s.yazilar.filter((y) => !y.startsWith('Tur')).at(-1))).toBeLessThan(1.5); // sıfırlandı
  }],
  137: [{ limitSn: 2, plan: bas(500, 'CENTER') }, (s) => {
    const zar = s.yazilar.filter((y) => /^[1-6]$/.test(y));
    expect(zar).toHaveLength(1);
    expect(s.isiklar).toHaveLength(1);
  }],
  138: [{ limitSn: 3, plan: [...dokun(500), ...dokun(1000), ...dokun(1500)] }, (s) => {
    expect(s.yazilar.at(-1)).toBe('Gecis: 3');
    expect(s.bipler).toBe(3);
  }],
  140: [{ limitSn: 6, plan: [mesafe(0, 150), mesafe(2000, 50), mesafe(4000, 3)] }, (s) => {
    expect(s.isiklar[0]).toBe('GREEN');
    expect(s.isiklar).toContain('ORANGE');
    expect(s.isiklar.at(-1)).toBe('RED');
  }],
  141: [{ limitSn: 4, plan: [aci(2000, 45), aci(3000, 90)] }, (s) => {
    expect(s.isiklar[0]).toBe('GREEN');
    expect(s.isiklar).toContain('RED');
    expect(s.isiklar.at(-1)).toBe('GREEN');
    expect(s.yazilar.at(-1)).toBe('90');
  }],
  143: [{}, (s) => {
    expect(Math.hypot(s.robot.x - 70, s.robot.y - 110)).toBeLessThan(1);
    expect(s.robot.carpti).toBe(false);
  }],
  144: [{}, (s, e) => {
    expect(s.robot.carpti).toBe(false);
    expect(icinde(s.robot, e.sahne.hedef)).toBe(true);
    // Dubalar sırayla üstten, alttan, üstten geçildi.
    const yer = (x) => s.yol.find((p) => p[0] >= x)[1];
    expect(yer(68)).toBeLessThan(66 - 10);
    expect(yer(117)).toBeGreaterThan(56 + 10);
    expect(yer(160)).toBeLessThan(66 - 10);
  }],
  145: [{}, (s) => {
    expect(s.robot.carpti).toBe(false);
    expect(s.bitti).toBe(true);
    expect(Math.round(s.robot.yon)).toBeGreaterThan(1070); // 12 × 90°
  }],
  146: [{}, (s) => {
    expect(Math.hypot(s.robot.x - 70, s.robot.y - 95)).toBeLessThan(3); // yıldız kapandı
    expect(s.robot.carpti).toBe(false);
  }],
  147: [{}, (s, e) => {
    expect(icinde(s.robot, e.sahne.hedef)).toBe(true);
    expect(Math.round(s.robot.yon)).toBe(-90);
    expect(s.robot.carpti).toBe(false);
  }],
  148: [{ limitSn: 6, plan: [mesafe(0, 50), mesafe(1000, 5), mesafe(1500, 50)] }, (s) => {
    expect(s.isiklar).toEqual(['GREEN', 'RED']);
    expect(Math.abs(s.motorlar.A.derece)).toBeLessThan(2);
  }],
  153: [{}, (s) => {
    expect(s.bipler).toBe(16);
    expect(s.resimler).toHaveLength(16);
    expect(s.isiklar).toHaveLength(16);
    expect(Math.hypot(s.robot.x - 100, s.robot.y - 75)).toBeLessThan(1);
  }],
  155: [{ limitSn: 60 }, (s) => {
    expect(s.robot.sensorler.renk).toBe('RED');
    expect(s.robot.carpti).toBe(false);
    expect(s.bitti).toBe(true);
  }],
  156: [{ limitSn: 40 }, (s) => {
    expect(s.bitti).toBe(true);
    expect(s.t).toBeGreaterThan(20000);
    expect(s.t).toBeLessThan(23000);
  }],
  157: [{}, (s) => {
    expect(s.robot.sensorler.renk).toBe('YELLOW');
    expect(s.resimler).toEqual(['LOVE']);
    expect(s.robot.carpti).toBe(false);
  }],
  158: [{ limitSn: 5, plan: bas(3000, 'CENTER') }, (s) => {
    const yol = Number(/Yol: (\d+) cm/.exec(s.yazilar.filter((y) => y.startsWith('Yol')).at(-1))[1]);
    expect(Math.abs(yol - (s.robot.x - 20))).toBeLessThan(2); // ekrandaki yol = gerçek yol
  }],
  162: [{}, (s) => {
    expect(s.robot.sensorler.mesafe).toBeGreaterThan(8);
    expect(s.robot.sensorler.mesafe).toBeLessThan(13);
    expect(s.robot.x).toBeLessThan(100); // kuzeybatıdaki en yakın kutuya gitti
    expect(s.robot.y).toBeLessThan(75);
  }],
  164: [{ limitSn: 90 }, (s) => {
    expect(s.yazilar).toEqual(['Durak 1', 'Durak 2', 'Durak 3']);
    expect(s.bitti).toBe(true);
    expect(s.robot.carpti).toBe(false);
  }],
  165: [{ limitSn: 120 }, (s, e) => {
    expect(icinde(s.robot, e.sahne.hedef)).toBe(true);
    expect(s.robot.carpti).toBe(false);
    expect(s.bitti).toBe(true);
  }],
};

const tumu = ETKINLIK_GORUNUMU.etkinlikler;

describe('EV3 çalışma sitesi etkinlikleri', () => {
  it('her etkinliğin bir denetimi var', () => {
    expect(tumu.map((e) => e.id).sort()).toEqual(Object.keys(BEKLENEN).map(Number).sort());
  });
  for (const e of tumu) {
    it(`${e.id} ${e.baslik}`, async () => {
      const [secenek, denetle] = BEKLENEN[e.id];
      const s = await etkinligiCalistir(etkinlikProgrami(e), e.mod === 'sahne' ? e.sahne : null, { limitSn: 90, ...secenek });
      expect(s.hata).toBeNull();
      denetle(s, e);
    }, 60000);
  }
  const python = spawnSync('python3', ['--version']).status === 0;
  it.skipIf(!python)('Python kodları derlenir', () => {
    for (const e of tumu) {
      const kod = alanla(etkinlikProgrami(e), pythonKoduUret);
      const r = spawnSync('python3', ['-c', 'import sys; compile(sys.stdin.read(), "e.py", "exec")'], { input: kod });
      expect(r.status, `${e.baslik}\n${kod}\n${r.stderr}`).toBe(0);
    }
  });
});
