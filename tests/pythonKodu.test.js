import { describe, it, expect } from 'vitest';
import { Blockly } from '../src/bloklar/blocklyKurulum.js';
import { pythonKoduUret } from '../src/bloklar/pythonKodu.js';

const BASLIK =
  '#!/usr/bin/env pybricks-micropython\n' +
  'from pybricks.hubs import EV3Brick\n' +
  '\n' +
  'ev3 = EV3Brick()\n';

function kodUret(durum) {
  const ws = new Blockly.Workspace();
  Blockly.serialization.workspaces.load(durum, ws);
  const kod = pythonKoduUret(ws);
  ws.dispose();
  return kod;
}

const sayi = (NUM) => ({ shadow: { type: 'ev3_sayi', fields: { NUM } } });
const metin = (METIN) => ({ shadow: { type: 'ev3_metin', fields: { METIN } } });

/** Blokları sırayla birbirine bağlar. */
function zincir(bloklar) {
  return bloklar.reduceRight((sonraki, blok) => ({
    ...blok,
    ...(sonraki && { next: { block: sonraki } }),
  }), null);
}

const program = (bloklar, ek = {}) => ({
  ...ek,
  blocks: {
    languageVersion: 0,
    blocks: [zincir([{ type: 'olay_program_basladiginda' }, ...bloklar])],
  },
});

const satiraYaz = (m, satir = 1) => ({
  type: 'ekran_satira_yaz',
  inputs: { METIN: typeof m === 'string' ? metin(m) : { block: m }, SATIR: sayi(satir) },
});

describe('Python üretimi', () => {
  it('boş çalışma alanında yalnızca Pybricks başlığı', () => {
    expect(kodUret({})).toBe(BASLIK);
  });

  it('yalnızca "program başladığında" varken de başlık', () => {
    expect(kodUret(program([]))).toBe(BASLIK);
  });

  it('Görev 1: satır 1 → önce satırı temizle, sonra draw_text(0, 0, ...)', () => {
    expect(kodUret(program([satiraYaz('BOS')]))).toBe(
      BASLIK.replace('EV3Brick\n', 'EV3Brick\nfrom pybricks.parameters import Color\n') +
        '\nev3.screen.draw_box(0, 0, 177, 15, fill=True, color=Color.WHITE)\n' +
        "ev3.screen.draw_text(0, 0, 'BOS')\n",
    );
  });

  it('satır değişkenden gelirse kutu sınırları ifadeyle yazılır', () => {
    const kod = kodUret(
      program(
        [{ type: 'ekran_satira_yaz', inputs: { METIN: metin('A'), SATIR: { block: { type: 'variables_get', fields: { VAR: { id: 'v1' } } } } } }],
        { variables: [{ name: 'n', id: 'v1' }] },
      ),
    );
    expect(kod).toContain('ev3.screen.draw_box(0, (n - 1) * 16, 177, n * 16 - 1, fill=True, color=Color.WHITE)');
  });

  it('satır 3 → y = 32 (satır yüksekliği 16)', () => {
    expect(kodUret(program([satiraYaz('A', 3)]))).toContain("ev3.screen.draw_text(0, 32, 'A')");
  });

  it('Görev 2: temizle sonra DOLU, sıra korunur', () => {
    expect(kodUret(program([{ type: 'ekran_temizle' }, satiraYaz('DOLU')]))).toContain(
      "ev3.screen.clear()\nev3.screen.draw_box(0, 0, 177, 15, fill=True, color=Color.WHITE)\nev3.screen.draw_text(0, 0, 'DOLU')\n",
    );
  });

  it('"program başladığında" bloğuna bağlı olmayan bloklar programa girmez', () => {
    const kod = kodUret({
      blocks: {
        languageVersion: 0,
        blocks: [
          { type: 'olay_program_basladiginda', next: { block: satiraYaz('ICERIDE') } },
          { ...satiraYaz('DISARIDA'), x: 300, y: 300 },
        ],
      },
    });
    expect(kod).toContain('ICERIDE');
    expect(kod).not.toContain('DISARIDA');
  });

  it('Görev 3: değişken ve birleştir, sayı str() ile metne çevrilir', () => {
    const kod = kodUret(
      program(
        [
          { type: 'variables_set', fields: { VAR: { id: 'v1' } }, inputs: { VALUE: sayi(5) } },
          satiraYaz({
            type: 'op_birlestir',
            inputs: {
              A: metin('Bos yer: '),
              B: { block: { type: 'variables_get', fields: { VAR: { id: 'v1' } } } },
            },
          }),
        ],
        { variables: [{ name: 'bos_yer', id: 'v1' }] },
      ),
    );
    expect(kod).toContain('bos_yer = 5\n');
    expect(kod).toContain("ev3.screen.draw_text(0, 0, 'Bos yer: ' + str(bos_yer))\n");
    expect(kod).not.toContain('None');
  });

  it('Görev 4: konum 1, 1 sol üst köşedir → draw_text(0, 0, ...)', () => {
    const kod = kodUret(
      program([
        {
          type: 'ekran_konuma_yaz',
          inputs: { METIN: metin('DOLU'), X: sayi(41), Y: sayi(61) },
        },
      ]),
    );
    expect(kod).toContain("ev3.screen.draw_text(40, 60, 'DOLU')\n");
  });

  it('konum değişkenden gelirse 1 çıkarma ifadesi yazılır', () => {
    const kod = kodUret(
      program(
        [
          {
            type: 'ekran_konuma_yaz',
            inputs: {
              METIN: metin('A'),
              X: { block: { type: 'variables_get', fields: { VAR: { id: 'v1' } } } },
              Y: sayi(1),
            },
          },
        ],
        { variables: [{ name: 'x', id: 'v1' }] },
      ),
    );
    expect(kod).toContain("ev3.screen.draw_text(x - 1, 0, 'A')");
  });

  it('beyaz yazı rengi Color içe aktarır', () => {
    const kod = kodUret(
      program([
        {
          type: 'ekran_konuma_yaz',
          fields: { RENK: 'WHITE' },
          inputs: { METIN: metin('A'), X: sayi(1), Y: sayi(1) },
        },
      ]),
    );
    expect(kod).toContain('from pybricks.parameters import Color\n');
    expect(kod).toContain(
      "ev3.screen.draw_text(0, 0, 'A', text_color=Color.WHITE, background_color=Color.BLACK)",
    );
  });

  it('resim göster → load_image(ImageFile....) ve ImageFile içe aktarılır', () => {
    const kod = kodUret(program([{ type: 'ekran_resim', fields: { RESIM: 'DIZZY' } }]));
    expect(kod).toContain('from pybricks.media.ev3dev import ImageFile\n');
    expect(kod).toContain('ev3.screen.load_image(ImageFile.DIZZY)\n');
  });

  it('süreli resim → load_image, wait, clear', () => {
    const kod = kodUret(
      program([{ type: 'ekran_resim_sureli', fields: { RESIM: 'NEUTRAL' }, inputs: { SURE: sayi(2) } }]),
    );
    expect(kod).toContain('from pybricks.tools import wait\n');
    expect(kod).toContain('ev3.screen.load_image(ImageFile.NEUTRAL)\nwait(2000)\nev3.screen.clear()\n');
  });

  it('durum ışığı → ev3.light.on(Color...) / ev3.light.off()', () => {
    const kod = kodUret(
      program([
        { type: 'ekran_durum_isigi', fields: { RENK: 'RED' } },
        { type: 'ekran_durum_isigi', fields: { RENK: 'OFF' } },
      ]),
    );
    expect(kod).toContain('from pybricks.parameters import Color\n');
    expect(kod).toContain('ev3.light.on(Color.RED)\nev3.light.off()\n');
  });

  it('bekle → wait(milisaniye) ve wait içe aktarılır', () => {
    const kod = kodUret(program([{ type: 'kontrol_bekle', inputs: { SURE: sayi(1.5) } }]));
    expect(kod).toContain('from pybricks.tools import wait\n');
    expect(kod).toContain('wait(1500)\n');
  });
});
