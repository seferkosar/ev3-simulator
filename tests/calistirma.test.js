import { describe, it, expect } from 'vitest';
import { jsKoduUret, programDurumu } from '../src/bloklar/jsKodu.js';
import { pythonKoduUret } from '../src/bloklar/pythonKodu.js';
import { programiYurut, agiKapat } from '../src/calistirici/yurutucu.js';
import { ekranOlustur, komutuUygula } from '../src/ekran/ekranModeli.js';
import { program, satiraYaz, konumaYaz, metin, sayi, degisken, alanla } from './yardimci.js';

/** Bloklardan JS üretir, çalıştırır, ekran modelini ve bekleme sürelerini döndürür. */
async function calistir(durum) {
  const kod = alanla(durum, jsKoduUret);
  const ekran = ekranOlustur();
  const beklemeler = [];
  await programiYurut(kod, (k) => komutuUygula(ekran, k), {
    bekle: async (ms) => beklemeler.push(ms),
  });
  return { ekran, beklemeler, kod };
}

/** Python'daki draw_text satırlarından (x, y, metin) çıkarır (yalnızca düz değerler). */
function pythonYazilari(durum) {
  const kod = alanla(durum, pythonKoduUret);
  return [...kod.matchAll(/draw_text\((\d+), (\d+), '([^']*)'/g)].map(([, x, y, m]) => ({
    x: Number(x), y: Number(y), metin: m,
  }));
}

const GOREV_COZUMLERI = {
  'Görev 1': program([satiraYaz('BOS')]),
  'Görev 2': program([{ type: 'ekran_temizle' }, satiraYaz('DOLU')]),
  'Görev 4': program([konumaYaz('DOLU', 41, 61)]),
  'iki satır': program([satiraYaz('A', 1), satiraYaz('B', 3)]),
};

describe('bloklar simülatörde çalışır', () => {
  it('Görev 1: BOS sol üst köşeye yazılır', async () => {
    const { ekran } = await calistir(GOREV_COZUMLERI['Görev 1']);
    expect(ekran.ogeler()).toEqual([{ metin: 'BOS', x: 0, y: 0 }]);
  });

  it('Görev 2: günlükte önce temizle, sonra DOLU', async () => {
    const { ekran } = await calistir(GOREV_COZUMLERI['Görev 2']);
    expect(ekran.gunluk()).toEqual([
      { tur: 'temizle' },
      { tur: 'konum', metin: 'DOLU', x: 0, y: 0 },
    ]);
  });

  it('Görev 3: değişken ve birleştir → "Bos yer: 5"', async () => {
    const { ekran } = await calistir(
      program(
        [
          { type: 'variables_set', fields: { VAR: { id: 'v1' } }, inputs: { VALUE: sayi(5) } },
          satiraYaz({ type: 'op_birlestir', inputs: { A: metin('Bos yer: '), B: degisken('v1') } }),
        ],
        { variables: [{ name: 'bos_yer', id: 'v1' }] },
      ),
    );
    expect(ekran.ogeler()).toEqual([{ metin: 'Bos yer: 5', x: 0, y: 0 }]);
  });

  it('Görev 4: konum 41, 61 → (40, 60)', async () => {
    const { ekran } = await calistir(GOREV_COZUMLERI['Görev 4']);
    expect(ekran.ogeler()).toEqual([{ metin: 'DOLU', x: 40, y: 60 }]);
  });

  it('beyaz yazı rengi ekrana geçer', async () => {
    const { ekran } = await calistir(program([konumaYaz('A', 1, 1, 'WHITE')]));
    expect(ekran.ogeler()).toEqual([{ metin: 'A', x: 0, y: 0, renk: 'WHITE' }]);
  });

  it('bekle bloğu milisaniye ile bekler', async () => {
    const { beklemeler } = await calistir(
      program([{ type: 'kontrol_bekle', inputs: { SURE: sayi(0.5) } }]),
    );
    expect(beklemeler).toEqual([500]);
  });

  it('"program başladığında" bloğuna bağlı olmayan bloklar çalışmaz', async () => {
    const { ekran } = await calistir({
      blocks: {
        languageVersion: 0,
        blocks: [{ type: 'olay_program_basladiginda' }, { ...satiraYaz('DISARIDA'), x: 300, y: 300 }],
      },
    });
    expect(ekran.gunluk()).toEqual([]);
  });

  it('konum değişkenden metin gelirse Türkçe hata verir', async () => {
    const durum = program(
      [
        { type: 'variables_set', fields: { VAR: { id: 'v1' } }, inputs: { VALUE: metin('abc') } },
        konumaYaz('A', degisken('v1'), 1),
      ],
      { variables: [{ name: 'x', id: 'v1' }] },
    );
    await expect(calistir(durum)).rejects.toThrow('x ve y sayı olmalı');
  });

  it.each(Object.entries(GOREV_COZUMLERI))(
    '%s: Python ile simülatör aynı yere aynı yazıyı yazar',
    async (_ad, durum) => {
      const { ekran } = await calistir(durum);
      const simulator = ekran.gunluk().filter((g) => g.tur === 'konum')
        .map(({ x, y, metin: m }) => ({ x, y, metin: m }));
      expect(simulator).toEqual(pythonYazilari(durum));
    },
  );
});

describe('program durumu', () => {
  it('başlangıç bloğu yoksa', () => {
    expect(alanla({}, programDurumu)).toEqual({ baslangicVar: false, blokVar: false });
  });
  it('başlangıç bloğu var, altı boş', () => {
    expect(alanla(program([]), programDurumu)).toEqual({ baslangicVar: true, blokVar: false });
  });
  it('başlangıç bloğu ve altında blok var', () => {
    expect(alanla(program([satiraYaz('A')]), programDurumu)).toEqual({ baslangicVar: true, blokVar: true });
  });
});

describe('yürütücü güvenliği', () => {
  it('ağ ve alt worker erişimini kapatır', () => {
    const kapsam = { fetch: () => {}, XMLHttpRequest: class {}, importScripts: () => {}, setTimeout };
    agiKapat(kapsam);
    expect(kapsam.fetch).toBeUndefined();
    expect(kapsam.XMLHttpRequest).toBeUndefined();
    expect(kapsam.importScripts).toBeUndefined();
    expect(kapsam.setTimeout).toBe(setTimeout);
    // Öğrenci kodu katı modda çalışır: geri açmaya çalışmak hata verir.
    expect(() => {
      kapsam.fetch = () => {};
    }).toThrow(TypeError);
    expect(kapsam.fetch).toBeUndefined();
  });

  it('metin bloğuna yazılan tırnak kod olarak çalışmaz', async () => {
    const { ekran } = await calistir(program([satiraYaz("'); ekran.clear(); ('")]));
    expect(ekran.gunluk()).toEqual([{ tur: 'konum', metin: "'); ekran.clear(); ('", x: 0, y: 0 }]);
  });
});
