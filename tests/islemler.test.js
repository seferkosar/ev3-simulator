import { describe, it, expect } from 'vitest';
import { sayi, karsilastir, mod, rastgele, islem } from '../src/calistirici/islemler.js';
import {
  yuzdedenHiz, dereceyeCevir, donusSuresiMs, donustenHizlar, motorlarOlustur,
} from '../src/simulasyon/motorModeli.js';

describe('operatörler', () => {
  it('sayıya çevirme', () => {
    expect(sayi('5')).toBe(5);
    expect(sayi('elma')).toBe(0);
    expect(sayi('')).toBe(0);
  });
  it('karşılaştırma: sayılar sayı gibi, yazılar harf gözetmeden', () => {
    expect(karsilastir('10', '9', '>')).toBe(true);
    expect(karsilastir('Elma', 'elma', '=')).toBe(true);
    expect(karsilastir(3, '3', '=')).toBe(true);
  });
  it('mod bölenin işaretini alır', () => {
    expect(mod(7, 3)).toBe(1);
    expect(mod(-7, 3)).toBe(2);
  });
  it('rastgele: tam sayı uçlarda tam sayı, sınırlar dahil', () => {
    expect(rastgele(1, 10, () => 0)).toBe(1);
    expect(rastgele(1, 10, () => 0.9999)).toBe(10);
    expect(rastgele(10, 1, () => 0)).toBe(1);
  });
  it('işlemler; sin/cos derece ile', () => {
    expect(islem('ABS', -4)).toBe(4);
    expect(islem('SQRT', 9)).toBe(3);
    expect(islem('SIN', 90)).toBe(1);
    expect(islem('COS', 90)).toBe(0);
  });
});

describe('motor modeli', () => {
  it('yüzde → °/sn ve sınırlar', () => {
    expect(yuzdedenHiz(75)).toBe(750);
    expect(yuzdedenHiz(150)).toBe(1000);
    expect(yuzdedenHiz(-30)).toBe(-300);
  });
  it('birim → derece', () => {
    expect(dereceyeCevir(1, 'ROT')).toBe(360);
    expect(dereceyeCevir(90, 'DEG')).toBe(90);
    expect(dereceyeCevir(Math.PI * 5.6, 'CM')).toBeCloseTo(360);
    expect(dereceyeCevir(2, 'SEC')).toBeNull();
  });
  it('dönüş süresi', () => {
    expect(donusSuresiMs(360, 720)).toBe(500);
    expect(donusSuresiMs(360, 0)).toBe(0);
  });
  it('dönüş değeri → sol/sağ hız', () => {
    expect(donustenHizlar(0, 50)).toEqual({ sol: 50, sag: 50 });
    expect(donustenHizlar(100, 50)).toEqual({ sol: 50, sag: -50 });
    expect(donustenHizlar(-50, 40)).toEqual({ sol: 0, sag: 40 });
  });
  it('derece zamanla birikir, sıfırlanır', () => {
    let t = 0;
    const m = motorlarOlustur(() => t);
    m.hizAyarla('A', 360);
    t = 500;
    expect(m.derece('A')).toBe(180);
    m.hizAyarla('A', 0);
    t = 2000;
    expect(m.derece('A')).toBe(180);
    m.sifirla('A');
    expect(m.derece('A')).toBe(0);
    expect(m.durum()).toEqual({ A: { hiz: 0, derece: 0 } });
  });
});
