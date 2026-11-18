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
const renk = (t, r) => ({ t, sensorler: { 3: { tur: 'renk', renk: r, yansiyan: 50, ortam: 30 } } });
const ortam = (t, o) => ({ t, sensorler: { 3: { tur: 'renk', renk: 'WHITE', yansiyan: 90, ortam: o } } });
const yakin = (a, b, tol) => expect(Math.abs(a - b)).toBeLessThanOrEqual(tol);
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
  // --- Ek etkinlikler ---
  139: [{ limitSn: 3, plan: [renk(0, 'RED'), renk(1500, 'BLUE')] }, (s) => {
    expect(s.yazilar).toEqual(expect.arrayContaining(['KIRMIZI', 'MAVI']));
  }],
  142: [{ limitSn: 4, plan: [ortam(0, 50), ortam(2000, 5)] }, (s) => {
    expect(s.isiklar[0]).toBe('OFF');
    expect(s.isiklar.at(-1)).toBe('ORANGE');
    expect(s.resimler).toEqual(expect.arrayContaining(['AWAKE', 'SLEEPING']));
  }],
  83: [{ limitSn: 3, plan: [{ t: 1000, sensorler: { 1: { tur: 'dokunma', basili: true } } }, { t: 1600, sensorler: { 1: { tur: 'dokunma', basili: false } } }] }, (s) => {
    expect(s.resimler[0]).toBe('SLEEPING');
    expect(s.resimler).toContain('LOVE');
    expect(s.resimler.at(-1)).toBe('SLEEPING');
  }],
  161: [{ limitSn: 2.5, plan: [{ t: 1000, sensorler: { 1: { tur: 'dokunma', basili: true } } }, { t: 1500, dugmeler: { CENTER: true } }, { t: 2000, dugmeler: {} }] }, (s) => {
    expect(s.yazilar).toEqual(expect.arrayContaining(['A: 0', 'AND: 0', 'OR: 0', 'NOT A: 1', 'A: 1', 'AND: 1', 'OR: 1', 'NOT A: 0']));
    expect(s.isiklar).toEqual(expect.arrayContaining(['OFF', 'GREEN']));
  }],
  159: [{ limitSn: 7, plan: bas(6000, 'CENTER', 300) }, (s) => {
    const sure = s.yazilar.find((y) => y.startsWith('Sure: '));
    expect(Number(sure.slice(6))).toBeGreaterThan(0.9); // en fazla 5 sn beklenir, 6. sn'de basıldı
    expect(s.yazilar).toContain(`En iyi: ${sure.slice(6)}`);
  }],
  160: [{ limitSn: 22, plan: [500, 3500, 6500, 9500, 12500].flatMap((t) => bas(t, 'RIGHT', 300)) }, (s) => {
    const puan = s.yazilar.find((y) => y.startsWith('Puan: '));
    expect(Number(puan.slice(6))).toBeGreaterThanOrEqual(0);
    expect(Number(puan.slice(6))).toBeLessThanOrEqual(5);
    expect(s.sesler).toHaveLength(5);
  }],
  149: [{ limitSn: 4, plan: [{ t: 500, dugmeler: { UP: true } }, { t: 1500, dugmeler: {} }, ...bas(2000, 'CENTER')] }, (s) => {
    expect(s.motorlar.A.derece).toBeLessThan(-200); // %25 = 250 °/sn, 1 sn
    yakin(s.motorlar.D.derece, 90, 2);
  }],
  150: [{ limitSn: 4, plan: [...bas(1500, 'CENTER'), ...bas(3000, 'CENTER')] }, (s) => {
    expect(s.yazilar).toEqual(expect.arrayContaining(['Derece/sn: 100', 'Devir/dk: 17', 'Derece/sn: 200', 'Hiz %: 30']));
  }],
  152: [{ limitSn: 5.5 }, (s) => {
    yakin(s.motorlar.A.derece, 36, 1); // 0, 1, …, 5. saniyelerde 6°
    expect(s.bipler).toBe(6);
  }],
  154: [{ limitSn: 5, plan: [mesafe(0, 50), ...dokun(1000), mesafe(3000, 5)] }, (s) => {
    expect(s.yazilar).toContain('Alarm kurulu');
    expect(s.bipler).toBe(12);
    expect(s.isiklar).toEqual(['GREEN', 'RED', 'GREEN', 'RED', 'GREEN']);
  }],
  163: [{ limitSn: 10, plan: [mesafe(0, 100), mesafe(1000, 20), mesafe(1500, 100), ...dokun(4000), ...dokun(4500), ...dokun(5000)] }, (s) => {
    expect(s.yazilar).toEqual(expect.arrayContaining(['Ihlal: 1', 'Sifre: 2/3', 'KAPANDI']));
    expect(s.bitti).toBe(true);
  }],
  '95b': [{ limitSn: 9, plan: [...bas(500, 'UP'), ...bas(3000, 'RIGHT'), ...bas(5500, 'UP')] }, (s) => {
    yakin(s.robot.x, 77.6, 1);
    yakin(s.robot.y, 92.4, 1);
    yakin(s.robot.yon, 0, 2);
  }],
  '95a': [{ limitSn: 5, plan: bas(2000, 'CENTER') }, (s) => yakin(s.robot.x, 20 + 48.9, 2)],
  69: [{}, (s) => {
    expect(Math.max(...s.yol.map((p) => p[0]))).toBeGreaterThanOrEqual(106); // bitiş çizgisi
    yakin(s.robot.x, 20, 1);
  }],
  73: [{}, (s) => { expect(s.yazilar).toEqual(['Hello World']); yakin(s.robot.x, 20 + 3 * 24.4, 2); }],
  '20a': [{}, (s, e) => { yakin(s.robot.x, 30, 2); yakin(s.robot.y, 75, 2); expect(s.robot.carpti).toBe(false); }],
  '20b': [{}, (s) => { expect(s.robot.x).toBeLessThan(45); yakin(s.robot.yon, 180, 4); expect(s.robot.carpti).toBe(false); }],
  82: [{}, (s) => { yakin(s.robot.x, 50, 1); yakin(s.robot.y, 120, 1); expect(s.robot.carpti).toBe(false); }],
  89: [{}, (s) => yakin(s.robot.x, 50, 0.5)],
  90: [{}, (s) => { yakin(s.robot.yon, 0, 1); expect(s.robot.x).toBeGreaterThan(85); }],
  102: [{}, (s) => { expect(s.robot.sensorler.renk).toBe('BLACK'); expect(s.robot.x).toBeLessThan(150); }],
  77: [{}, (s) => { yakin(s.robot.yon, 90, 2); expect(s.robot.carpti).toBe(false); expect(Math.max(...s.yol.map((p) => p[0]))).toBeGreaterThan(185); }],
  27: [{}, (s) => { yakin(s.robot.yon, 360, 3); expect(s.robot.carpti).toBe(false); }],
  '84a': [{ limitSn: 45, plan: [{ t: 40000, sensorler: { 1: { tur: 'dokunma', basili: true } } }] }, (s) => {
    expect(s.robot.puan).toBeGreaterThanOrEqual(4);
    expect(s.bitti).toBe(true);
  }],
  81: [{ limitSn: 10 }, (s) => {
    expect(s.robot.sensorler.mesafe).toBeGreaterThanOrEqual(15);
    expect(s.robot.sensorler.mesafe).toBeLessThanOrEqual(20);
    expect(s.robot.carpti).toBe(false);
  }],
  30: [{}, (s) => { expect(s.robot.sensorler.mesafe).toBeGreaterThan(30); expect(s.robot.sensorler.mesafe).toBeLessThan(32); }],
  53: [{ limitSn: 20 }, (s) => { expect(s.robot.sensorler.mesafe).toBeLessThan(2); expect(s.robot.carpti).toBe(false); }],
  99: [{ limitSn: 70 }, (s) => { yakin(s.robot.sensorler.mesafe, 15, 0.5); expect(s.bitti).toBe(true); }],
  78: [{}, (s) => expect(s.robot.sensorler.renk).toBe('GREEN')],
  75: [{ limitSn: 25 }, (s) => expect(s.yazilar).toEqual(expect.arrayContaining(['SIYAH', 'KIRMIZI']))],
  '84b': [{}, (s) => { expect(s.bitti).toBe(true); expect(s.robot.x).toBeGreaterThan(120); yakin(s.robot.y, 120, 5); }],
  100: [{}, (s) => { expect(s.bitti).toBe(true); expect(s.robot.x).toBeGreaterThan(100); yakin(s.robot.y, 120, 5); }],
  93: [{ limitSn: 60 }, (s) => { expect(s.robot.sensorler.renk).toBe('BLACK'); expect(s.bitti).toBe(true); }],
  55: [{}, (s) => { const u = Number(s.yazilar[0].slice('Uzunluk: '.length)); yakin(u, 40, 1); }],
  16: [{}, (s) => { expect(s.robot.paketler[0].tasiniyor).toBe(true); yakin(s.robot.x, 30, 1); }],
  85: [{}, (s) => { expect(s.robot.paketler[0].tasiniyor).toBe(true); expect(s.robot.sensorler.renk).toBe('GREEN'); }],
  33: [{}, (s) => { yakin(s.robot.x, 40, 3); yakin(s.robot.y, 120, 3); expect(s.robot.carpti).toBe(false); }],
  167: [{ limitSn: 20, plan: [...bas(500, 'RIGHT'), ...bas(1500, 'RIGHT'), ...bas(2500, 'CENTER')] }, (s) => {
    expect(s.yazilar).toContain('Hedef no: 3');
    yakin(Math.max(...s.yol.map((p) => p[0])), 170, 2);
    yakin(s.robot.x, 20, 1);
  }],
};

const tumu = ETKINLIK_GORUNUMU.etkinlikler;

describe('EV3 çalışma sitesi etkinlikleri', () => {
  it('her etkinliğin bir denetimi var', () => {
    expect(tumu.map((e) => e.id).sort()).toEqual(Object.keys(BEKLENEN).sort());
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
