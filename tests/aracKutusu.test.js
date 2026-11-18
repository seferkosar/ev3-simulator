import { describe, it, expect } from 'vitest';
import '../src/bloklar/blocklyKurulum.js';
import { aracKutusu, GOREVLER } from '../src/seviye/otoparkEkrani.js';
import { DEGISKEN_ACIK, DEGISKEN_KAPALI } from '../src/bloklar/kayit.js';

const bloklar = (kutu) => kutu.contents.flatMap((k) => k.contents ?? []);
const acikTurler = (kutu) =>
  bloklar(kutu).filter((b) => !b.disabledReasons).map((b) => b.type).sort();
const degiskenKategorisi = (kutu) => kutu.contents.find((k) => k.name === 'Değişkenler');

describe('araç kutusu', () => {
  it('bütün kategoriler, resimlerdeki sırayla görünür', () => {
    for (const g of GOREVLER) {
      expect(aracKutusu(g.no).contents.map((k) => k.name)).toEqual([
        'Motorlar', 'Hareket', 'Ekran', 'Ses', 'Olaylar', 'Kontrol',
        'Sensörler', 'Operatörler', 'Değişkenler', 'Bloklarım',
      ]);
    }
  });

  it.each([1, 2])('Görev %i: yalnızca başla, temizle ve satıra yaz açık', (no) => {
    const kutu = aracKutusu(no);
    expect(acikTurler(kutu)).toEqual(
      ['ekran_satira_yaz', 'ekran_temizle', 'olay_program_basladiginda'],
    );
    expect(degiskenKategorisi(kutu).custom).toBe(DEGISKEN_KAPALI);
  });

  it('kapalı bloklar da araç kutusunda görünür (gri)', () => {
    const kutu = aracKutusu(1);
    expect(bloklar(kutu).length).toBeGreaterThan(80);
    expect(bloklar(kutu).find((b) => b.type === 'motor_baslat').disabledReasons).toBeTruthy();
  });

  it('Görev 3: + birleştir ve değişkenler', () => {
    const kutu = aracKutusu(3);
    expect(acikTurler(kutu)).toContain('op_birlestir');
    expect(acikTurler(kutu)).not.toContain('ekran_konuma_yaz');
    expect(degiskenKategorisi(kutu).custom).toBe(DEGISKEN_ACIK);
  });

  it('Görev 4: + konuma yaz', () => {
    const kutu = aracKutusu(4);
    expect(acikTurler(kutu)).toEqual(expect.arrayContaining(['op_birlestir', 'ekran_konuma_yaz']));
    expect(degiskenKategorisi(kutu).custom).toBe(DEGISKEN_ACIK);
  });

  it('bilinmeyen görevde hata verir', () => {
    expect(() => aracKutusu(9)).toThrow();
  });
});
