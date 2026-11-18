import { describe, it, expect } from 'vitest';
import {
  ekranOlustur,
  EKRAN_GENISLIGI,
  EKRAN_YUKSEKLIGI,
  SATIR_YUKSEKLIGI,
} from '../src/ekran/ekranModeli.js';

const MAKS_SATIR = Math.floor(EKRAN_YUKSEKLIGI / SATIR_YUKSEKLIGI);

describe('ekran modeli', () => {
  it('EV3 ekranı 178x128 pikseldir', () => {
    expect(EKRAN_GENISLIGI).toBe(178);
    expect(EKRAN_YUKSEKLIGI).toBe(128);
  });

  it('boş başlar', () => {
    const ekran = ekranOlustur();
    expect(ekran.gunluk()).toEqual([]);
    expect(ekran.ogeler()).toEqual([]);
  });

  describe('print', () => {
    it('metni günlüğe ve ekrana yazar', () => {
      const ekran = ekranOlustur();
      ekran.print('BOS');
      expect(ekran.gunluk()).toEqual([{ tur: 'yaz', metin: 'BOS', x: 0, y: 0 }]);
      expect(ekran.ogeler()).toEqual([{ metin: 'BOS', x: 0, y: 0 }]);
    });

    it('birden çok değeri boşlukla birleştirir, sayıları metne çevirir', () => {
      const ekran = ekranOlustur();
      ekran.print('Bos yer:', 5);
      expect(ekran.gunluk()[0].metin).toBe('Bos yer: 5');
    });

    it('değer verilmezse boş satır yazar', () => {
      const ekran = ekranOlustur();
      ekran.print();
      ekran.print('A');
      expect(ekran.gunluk()[0].metin).toBe('');
      expect(ekran.ogeler()).toEqual([
        { metin: '', x: 0, y: 0 },
        { metin: 'A', x: 0, y: SATIR_YUKSEKLIGI },
      ]);
    });

    it('her yazı bir alt satıra geçer', () => {
      const ekran = ekranOlustur();
      ekran.print('A');
      ekran.print('B');
      ekran.print('C');
      expect(ekran.ogeler().map((o) => o.y)).toEqual([
        0,
        SATIR_YUKSEKLIGI,
        2 * SATIR_YUKSEKLIGI,
      ]);
    });

    it('metindeki satır sonu yeni satır açar', () => {
      const ekran = ekranOlustur();
      ekran.print('A\nB');
      expect(ekran.gunluk()).toHaveLength(1);
      expect(ekran.ogeler()).toEqual([
        { metin: 'A', x: 0, y: 0 },
        { metin: 'B', x: 0, y: SATIR_YUKSEKLIGI },
      ]);
    });

    it('ekran dolunca yukarı kaydırır', () => {
      const ekran = ekranOlustur();
      for (let i = 0; i <= MAKS_SATIR; i++) ekran.print(`S${i}`);
      const ogeler = ekran.ogeler();
      expect(ogeler).toHaveLength(MAKS_SATIR);
      expect(ogeler[0]).toEqual({ metin: 'S1', x: 0, y: 0 });
      expect(ogeler.at(-1)).toEqual({
        metin: `S${MAKS_SATIR}`,
        x: 0,
        y: (MAKS_SATIR - 1) * SATIR_YUKSEKLIGI,
      });
      // Günlük kaydırmadan etkilenmez.
      expect(ekran.gunluk()).toHaveLength(MAKS_SATIR + 1);
    });
  });

  describe('clear', () => {
    it('ekranı boşaltır ve imleci başa alır', () => {
      const ekran = ekranOlustur();
      ekran.print('BOS');
      ekran.clear();
      ekran.print('DOLU');
      expect(ekran.ogeler()).toEqual([{ metin: 'DOLU', x: 0, y: 0 }]);
      expect(ekran.gunluk().map((g) => g.tur)).toEqual(['yaz', 'temizle', 'yaz']);
    });
  });

  describe('draw_text', () => {
    it('metni verilen konuma yazar', () => {
      const ekran = ekranOlustur();
      ekran.draw_text(40, 60, 'DOLU');
      expect(ekran.gunluk()).toEqual([{ tur: 'konum', metin: 'DOLU', x: 40, y: 60 }]);
      expect(ekran.ogeler()).toEqual([{ metin: 'DOLU', x: 40, y: 60 }]);
    });

    it('print imlecini kaydırmaz', () => {
      const ekran = ekranOlustur();
      ekran.draw_text(40, 60, 'X');
      ekran.print('A');
      expect(ekran.ogeler()[1]).toEqual({ metin: 'A', x: 0, y: 0 });
    });

    it('sayıyı metne çevirir', () => {
      const ekran = ekranOlustur();
      ekran.draw_text(0, 0, 5);
      expect(ekran.gunluk()[0].metin).toBe('5');
    });

    it('kaydırmada konumlu yazılar da yukarı kayar', () => {
      const ekran = ekranOlustur();
      ekran.draw_text(50, 2 * SATIR_YUKSEKLIGI, 'K');
      for (let i = 0; i <= MAKS_SATIR; i++) ekran.print(`S${i}`);
      expect(ekran.ogeler().find((o) => o.metin === 'K')).toEqual({
        metin: 'K',
        x: 50,
        y: SATIR_YUKSEKLIGI,
      });
    });

    it('x veya y sayı değilse hata verir', () => {
      const ekran = ekranOlustur();
      expect(() => ekran.draw_text('a', 0, 'X')).toThrow(TypeError);
      expect(() => ekran.draw_text(0, undefined, 'X')).toThrow(TypeError);
      expect(ekran.gunluk()).toEqual([]);
    });
  });

  describe('satır temizleme ("yaz, satır" bloğu)', () => {
    it('aynı satırdaki eski yazı silinir, diğer satırlar ve resim kalır', () => {
      const ekran = ekranOlustur();
      ekran.load_image('NEUTRAL');
      ekran.draw_text(0, 0, 'mesafe 100', undefined, true);
      ekran.draw_text(0, 16, 'renk yok', undefined, true);
      ekran.draw_text(0, 0, 'mesafe 30', undefined, true);
      expect(ekran.ogeler()).toEqual([
        { resim: 'NEUTRAL' },
        { metin: 'renk yok', x: 0, y: 16 },
        { metin: 'mesafe 30', x: 0, y: 0 },
      ]);
      expect(ekran.gunluk().filter((g) => g.tur === 'konum')).toHaveLength(3);
    });
  });

  describe('load_image', () => {
    it('ekranı temizleyip resmi gösterir; günlüğe yazar', () => {
      const ekran = ekranOlustur();
      ekran.print('A');
      ekran.load_image('NEUTRAL');
      expect(ekran.ogeler()).toEqual([{ resim: 'NEUTRAL' }]);
      expect(ekran.gunluk().at(-1)).toEqual({ tur: 'resim', resim: 'NEUTRAL' });
    });

    it('sonraki print en üst satırdan başlar', () => {
      const ekran = ekranOlustur();
      ekran.print('A');
      ekran.load_image('AWAKE');
      ekran.print('B');
      expect(ekran.ogeler()[1]).toEqual({ metin: 'B', x: 0, y: 0 });
    });

    it('bilinmeyen resim hata verir', () => {
      expect(() => ekranOlustur().load_image('YOK')).toThrow('Bilinmeyen resim');
    });
  });

  it('günlük ve öğeler kopya olarak döner', () => {
    const ekran = ekranOlustur();
    ekran.print('A');
    ekran.gunluk()[0].metin = 'bozuk';
    ekran.gunluk().push({});
    ekran.ogeler()[0].metin = 'bozuk';
    expect(ekran.gunluk()).toEqual([{ tur: 'yaz', metin: 'A', x: 0, y: 0 }]);
    expect(ekran.ogeler()).toEqual([{ metin: 'A', x: 0, y: 0 }]);
  });
});
