import { describe, it, expect, afterEach } from 'vitest';
import { Blockly } from '../src/bloklar/blocklyKurulum.js';
import { tumBlokTurleri } from '../src/bloklar/kayit.js';
import { BLOK_KATEGORILERI } from '../src/bloklar/kategoriler/index.js';

let ws;
afterEach(() => ws?.dispose());

describe('blok tanımları', () => {
  it('resimlerdeki bloklar tanımlı (en az 80)', () => {
    expect(tumBlokTurleri().length).toBeGreaterThanOrEqual(80);
    expect(new Set(tumBlokTurleri()).size).toBe(tumBlokTurleri().length);
  });

  it.each(tumBlokTurleri())('%s hatasız oluşturulur', (tur) => {
    ws = new Blockly.Workspace();
    const blok = ws.newBlock(tur);
    expect(blok.type).toBe(tur);
  });

  it.each(BLOK_KATEGORILERI.map((k) => [k.ad, k]))(
    '%s araç kutusundaki her blok gölge değerleriyle yüklenir',
    (_ad, kategori) => {
      ws = new Blockly.Workspace();
      for (const oge of kategori.arac) {
        const { kind: _kind, ...durum } = oge;
        const blok = Blockly.serialization.blocks.append(durum, ws);
        // Sayı/metin olmayan (koşul) girişler dışında her giriş dolu olmalı.
        for (const giris of blok.inputList) {
          if (giris.connection?.getCheck()?.includes('Boolean')) continue;
          if (giris.type === Blockly.inputs.inputTypes.VALUE) {
            expect(giris.connection.targetBlock(), `${blok.type}.${giris.name}`).not.toBeNull();
          }
        }
      }
    },
  );

  it('blok yazıları Türkçe (İngilizce resim yazıları kalmadı)', () => {
    ws = new Blockly.Workspace();
    const ingilizce = /\b(run|motor|move|display|write|play|when|wait|repeat|forever|join|set)\b/i;
    for (const tur of tumBlokTurleri()) {
      const metin = ws.newBlock(tur).toString();
      expect(metin, tur).not.toMatch(ingilizce);
    }
  });
});
