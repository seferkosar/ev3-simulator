import { describe, it, expect } from 'vitest';
import { programiSakla, saklananProgram, saklananProgramiSil } from '../src/arayuz/otomatikKayit.js';
import { ipucuMetni } from '../src/bloklar/kayit.js';
import { INGILIZCE_ADLAR } from '../src/bloklar/ingilizceAdlar.js';
import { tumBlokTurleri } from '../src/bloklar/kayit.js';

const sahteDepo = () => {
  const veri = new Map();
  return {
    getItem: (k) => veri.get(k) ?? null,
    setItem: (k, v) => veri.set(k, v),
    removeItem: (k) => veri.delete(k),
  };
};

describe('otomatik kayıt', () => {
  it('saklanan program ve görev geri gelir', () => {
    const depo = sahteDepo();
    const program = { blocks: { languageVersion: 0, blocks: [{ type: 'ekran_temizle' }] } };
    expect(programiSakla({ program, gorev: 3 }, depo)).toBe(true);
    expect(saklananProgram(depo)).toEqual({ program, gorev: 3 });
  });

  it('silinince boş döner', () => {
    const depo = sahteDepo();
    programiSakla({ program: {}, gorev: 1 }, depo);
    saklananProgramiSil(depo);
    expect(saklananProgram(depo)).toBeNull();
  });

  it('depo yoksa ya da hata verirse oyun çalışır', () => {
    const bozuk = { getItem: () => { throw new Error('x'); }, setItem: () => { throw new Error('x'); } };
    expect(programiSakla({ program: {}, gorev: 1 }, bozuk)).toBe(false);
    expect(saklananProgram(bozuk)).toBeNull();
    expect(saklananProgram(null)).toBeNull();
  });
});

describe('İngilizce adlar', () => {
  it('her bloğun (gölge değerler hariç) EV3 Classroom adı var', () => {
    const eksik = tumBlokTurleri().filter((t) => !t.startsWith('ev3_') && !INGILIZCE_ADLAR[t]);
    expect(eksik).toEqual([]);
  });

  it('ipucu Türkçe açıklama + İngilizce ad', () => {
    expect(ipucuMetni({ type: 'ekran_temizle', tooltip: 'EV3 ekranındaki her şeyi siler.' })).toBe(
      'EV3 ekranındaki her şeyi siler.\nEV3 Classroom: clear display',
    );
    expect(ipucuMetni({ type: 'op_topla' })).toBe('EV3 Classroom: +');
  });
});
