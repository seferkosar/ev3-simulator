import { describe, it, expect } from 'vitest';
import { programPaketle, programCoz } from '../src/arayuz/programDosyasi.js';

describe('program dosyası', () => {
  it('kaydedilen program geri açılır', () => {
    const durum = { blocks: { languageVersion: 0, blocks: [{ type: 'ekran_temizle' }] } };
    const veri = programCoz(programPaketle(durum, 2));
    expect(veri.program).toEqual(durum);
    expect(veri.gorev).toBe(2);
  });

  it.each([
    ['JSON olmayan dosya', 'merhaba', 'program dosyası değil'],
    ['başka bir JSON', '{"a":1}', 'EV3 simülatör programı değil'],
    ['program alanı yok', '{"tur":"ev3-simulator-programi","surum":1}', 'EV3 simülatör programı değil'],
    ['yeni sürüm', '{"tur":"ev3-simulator-programi","surum":99,"program":{}}', 'daha yeni bir sürüm'],
  ])('%s Türkçe hata verir', (_ad, metin, beklenen) => {
    expect(() => programCoz(metin)).toThrow(beklenen);
  });

  it('çok büyük dosyayı reddeder', () => {
    expect(() => programCoz('x'.repeat(1_000_001))).toThrow('çok büyük');
  });
});
