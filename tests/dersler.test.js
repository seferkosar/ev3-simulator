// Öğretim programındaki her kodlu dersin örnek programı simülasyonda çalışıyor mu?
// Elle sensör dersleri, öğrencinin yapacağı değişikliklerle (plan) çalıştırılır.
import { describe, it, expect } from 'vitest';
import { Blockly } from '../src/bloklar/blocklyKurulum.js';
import { DERS_GORUNUMU, dersProgrami } from '../src/dersler/dersGorevleri.js';
import { pythonKoduUret } from '../src/bloklar/pythonKodu.js';
import { TEKER_CEVRESI_CM } from '../src/simulasyon/motorModeli.js';
import { dersiCalistir } from './dersCalistirici.js';
import { spawnSync } from 'node:child_process';

const T = TEKER_CEVRESI_CM;
const dokun = (t, basili, port = 1) => ({ t, sensorler: { [port]: { tur: 'dokunma', basili } } });
const renk = (t, r, yansiyan = 50) => ({ t, sensorler: { 3: { tur: 'renk', renk: r, yansiyan, ortam: 20 } } });
const aci = (t, a) => ({ t, sensorler: { 2: { tur: 'jiroskop', aci: a } } });
const mesafe = (t, cm) => ({ t, sensorler: { 4: { tur: 'mesafe', cm } } });
const yakin = (a, b, tol = 1.5) => expect(Math.abs(a - b)).toBeLessThanOrEqual(tol);

/** anahtar → [çalıştırma seçenekleri, sonucu denetleyen fonksiyon] */
const BEKLENEN = {
  '1-2': [{}, (s) => { expect(s.resimler).toEqual(['LOVE']); expect(s.bipler).toBe(1); expect(s.bitti).toBe(true); }],
  '1-3': [{}, (s) => yakin(s.robot.x, 30 + T)],
  // 2 tur ileri, yerinde 180° dön, 1 tur ileri → başlangıçtan 1 tur ileride, geriye bakar.
  '1-4': [{}, (s) => { yakin(s.robot.x, 30 + T); yakin(s.robot.yon, 180, 2); }],
  '1-5': [{}, (s) => { yakin(s.motorlar.A.derece, 7500, 20); expect(s.bitti).toBe(true); }],
  '1-6': [{}, (s) => { yakin(s.motorlar.A.derece, 0, 2); expect(s.bitti).toBe(true); }],
  '1-7': [{ plan: [renk(1000, 'RED'), renk(3000, 'GREEN')] }, (s) => { expect(s.isiklar).toEqual(['RED', 'GREEN']); expect(s.bitti).toBe(true); }],
  '1-8': [{}, (s) => { expect(s.resimler).toHaveLength(4); expect(s.bipler).toBe(4); yakin(s.motorlar.A.derece, 0, 2); }],
  '1-9': [{ plan: [aci(2000, 20)], limitSn: 6 }, (s) => { expect(s.isiklar).toContain('RED'); expect(s.bipler).toBeGreaterThan(0); }],
  '1-10': [{}, (s) => yakin(s.robot.x, 30 + 5 * T)],
  '1-11': [{}, (s) => { expect(s.resimler).toEqual(['AWAKE', 'DIZZY', 'LOVE']); expect(s.bitti).toBe(true); }],
  '2-1': [{}, (s) => { expect(s.yazilar).toEqual(['Merhaba']); expect(s.bitti).toBe(true); }],
  '2-2': [{}, (s) => { yakin(s.robot.x, 30 + 2 * T); yakin(s.robot.y, 75 + T); }],
  '2-3': [{}, (s) => yakin(Number(s.yazilar[0]), 1000, 5)],
  '2-4': [{}, (s) => { yakin(s.robot.x, 30, 4); yakin(s.robot.y, 75, 4); }],
  '2-5': [{}, (s) => { expect(s.hata).toBeNull(); expect(s.bitti).toBe(true); }],
  '2-6': [{}, (s) => expect(s.yazilar[0]).toMatch(/^2[34] cm\/sn$/)],
  '2-7': [{}, (s) => { expect(s.robot.sensorler.mesafe).toBeLessThan(20); expect(s.bipler).toBe(1); }],
  '2-8': [{ plan: [aci(1500, 60), aci(3500, -60)], limitSn: 6 }, (s) => {
    expect(s.isiklar).toEqual(expect.arrayContaining(['GREEN', 'ORANGE', 'RED']));
    expect(s.resimler).toEqual(expect.arrayContaining(['LOVE', 'AWAKE', 'DIZZY']));
  }],
  '2-9': [{ limitSn: 60 }, (s) => expect(s.robot.puan).toBe(5)],
  '2-10': [{ plan: [dokun(500, true), dokun(700, false), aci(1500, 20), dokun(2000, true)] }, (s) => {
    expect(s.yazilar[0]).toBe('Açı: 20');
    expect(s.yazilar[1]).toMatch(/^Katsayı: 0\.36/);
  }],
  '2-11': [{ plan: [renk(1000, 'WHITE'), dokun(2000, true), aci(3000, 35)] }, (s) => {
    expect(s.isiklar).toEqual(['RED', 'GREEN']);
    expect(s.bitti).toBe(true);
  }],
  '2-12': [{
    plan: [1, 2, 3].flatMap((i) => [dokun(i * 1000, true), dokun(i * 1000 + 200, false), aci(i * 1000 + 500, i * 40)]),
  }, (s) => { expect(s.bipler).toBe(3); expect(s.bitti).toBe(true); }],
  '3-1': [{}, (s) => { yakin(s.robot.x, 30); expect(s.yazilar).toEqual(['Merhaba']); }],
  '3-2': [{}, (s) => yakin(s.robot.x, 30 + (1023 / 360) * T)],
  '3-3': [{}, (s) => { yakin(s.robot.x, 30, 4); yakin(s.robot.y, 75, 4); }],
  '3-4': [{ plan: [dokun(500, true), dokun(800, false)], limitSn: 15 }, (s) => {
    expect(s.robot.sensorler.mesafe).toBeLessThan(15);
    expect(s.robot.carpti).toBe(false);
  }],
  '3-5': [{ plan: [mesafe(0, 100), mesafe(1000, 10), mesafe(2000, 50), mesafe(3000, 10), mesafe(4000, 50)], limitSn: 5 }, (s) =>
    expect(s.yazilar).toEqual(['1', '2'])],
  '3-6': [{ limitSn: 60 }, (s) => expect(s.robot.puan).toBe(5)],
  '3-7': [{}, (s) => { yakin(s.robot.x, 60, 2); yakin(s.robot.y, 95, 2); }],
  '3-8': [{ limitSn: 60 }, (s) => { expect(s.hata).toBeNull(); expect(s.robot).not.toBeNull(); }],
  '3-9': [{}, (s) => { yakin(s.robot.x, 80); expect(s.yazilar).toEqual(['Merhaba']); }],
  '3-10': [{}, (s) => expect(s.robot.sensorler.mesafe).toBeLessThan(15)],
  '3-11': [{ plan: [renk(0, 'WHITE', 90), dokun(500, true), dokun(1500, false)], limitSn: 3 }, (s) =>
    expect(s.motorlar.A.derece).not.toBe(0)],
  '3-12': [{ plan: [dokun(55000, true)], limitSn: 60 }, (s) => { expect(s.robot.puan).toBe(5); expect(s.bitti).toBe(true); }],
};

const KODLU = DERS_GORUNUMU.flatMap((s) => s.dersler).filter((d) => d.kodlu);

describe('öğretim programı dersleri simülasyonda', () => {
  it('her kodlu dersin bir denetimi var', () => {
    expect(KODLU.map((d) => d.anahtar).sort()).toEqual(Object.keys(BEKLENEN).sort());
    expect(DERS_GORUNUMU.flatMap((s) => s.dersler)).toHaveLength(48);
  });

  it.each(KODLU.map((d) => [d.anahtar, d.baslik]))('S%s %s', async (anahtar) => {
    const [secenek, denetle] = BEKLENEN[anahtar];
    const s = await dersiCalistir(anahtar, secenek);
    expect(s.hata).toBeNull();
    denetle(s);
  }, 30000);

  it('"kısmen" olanların notu var', () => {
    for (const d of KODLU.filter((x) => x.durum !== 'calisiyor')) expect(d.durumNotu).not.toBe('');
  });
});

describe('derslerin Python çıktısı', () => {
  it.each(KODLU.map((d) => [d.anahtar]))('S%s derlenebilir', (anahtar) => {
    const ws = new Blockly.Workspace();
    Blockly.serialization.workspaces.load(dersProgrami(anahtar), ws);
    const py = pythonKoduUret(ws);
    ws.dispose();
    const s = spawnSync('python3', ['-I', '-c', 'import sys; compile(sys.stdin.read(), "main.py", "exec")'], { input: py, encoding: 'utf8' });
    if (!s.error) expect(s.stderr.trim().split('\n').at(-1) ?? '').toBe('');
  });
});
