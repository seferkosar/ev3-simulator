// Ekran dışındaki blokların simülatörde ve Python'da çalışması.
import { describe, it, expect } from 'vitest';
import { spawnSync } from 'node:child_process';
import { Blockly } from '../src/bloklar/blocklyKurulum.js';
import { jsKoduUret } from '../src/bloklar/jsKodu.js';
import { pythonKoduUret } from '../src/bloklar/pythonKodu.js';
import { yurutucuOlustur } from '../src/calistirici/yurutucu.js';
import { BLOK_KATEGORILERI } from '../src/bloklar/kategoriler/index.js';
import { SAPKA_TURLERI } from '../src/bloklar/kategoriler/olaylar.js';
import { program, zincir, satiraYaz, metin, sayi, alanla } from './yardimci.js';

const deger = (blok) => ({ block: blok });
const yaz = (blok, satir = 1) => satiraYaz(blok, satir);

/** Programı çalıştırır; ekrana yazılanları, komutları ve yürütücüyü döndürür. */
function baslat(durum, { donanim, simdi, bekle = async () => {} } = {}) {
  const kod = alanla(durum, jsKoduUret);
  const yazilar = [];
  const komutlar = [];
  const mesajlar = [];
  const y = yurutucuOlustur(
    (m) => {
      mesajlar.push(m);
      if (m.tur !== 'toplu') return;
      for (const k of m.komutlar) {
        komutlar.push(k);
        if (k.tur === 'konum') yazilar.push(k.metin);
      }
    },
    { bekle, ...(simdi && { simdi }) },
  );
  if (donanim) y.donanimGuncelle(donanim);
  const bitis = y.calistir(kod);
  return { y, bitis, yazilar, komutlar, mesajlar, kod };
}

async function calistir(durum, secenekler) {
  const s = baslat(durum, secenekler);
  await s.bitis;
  return s;
}

const tekrar = (n, ...bloklar) => ({
  type: 'kontrol_tekrarla',
  inputs: { SAYI: sayi(n), YAP: { block: zincir(bloklar) } },
});
const eger = (kosul, evet, hayir) => ({
  type: hayir ? 'kontrol_eger_degilse' : 'kontrol_eger',
  inputs: {
    KOSUL: deger(kosul),
    YAP: { block: zincir(evet) },
    ...(hayir && { DEGILSE: { block: zincir(hayir) } }),
  },
});
const ikili = (type, a, b) => ({ type, inputs: { A: metin(String(a)), B: metin(String(b)) } });

describe('Kontrol blokları', () => {
  it('tekrarla', async () => {
    const { yazilar } = await calistir(program([tekrar(3, yaz('A'))]));
    expect(yazilar).toEqual(['A', 'A', 'A']);
  });

  it('eğer / değilse', async () => {
    const { yazilar } = await calistir(
      program([
        eger(ikili('op_buyuk', 5, 3), [yaz('EVET')], [yaz('HAYIR')]),
        eger(ikili('op_kucuk', 5, 3), [yaz('EVET')], [yaz('HAYIR')]),
      ]),
    );
    expect(yazilar).toEqual(['EVET', 'HAYIR']);
  });

  it('olana kadar tekrarla + değişken', async () => {
    const v = { variables: [{ name: 'i', id: 'v1' }] };
    const i = { block: { type: 'variables_get', fields: { VAR: { id: 'v1' } } } };
    const { yazilar } = await calistir(
      program(
        [
          { type: 'variables_set', fields: { VAR: { id: 'v1' } }, inputs: { VALUE: sayi(0) } },
          {
            type: 'kontrol_olana_kadar_tekrarla',
            inputs: {
              KOSUL: deger({ type: 'op_esit', inputs: { A: i, B: metin('3') } }),
              YAP: { block: zincir([{ type: 'math_change', fields: { VAR: { id: 'v1' } }, inputs: { DELTA: sayi(1) } }]) },
            },
          },
          yaz(i.block),
        ],
        v,
      ),
    );
    expect(yazilar).toEqual(['3']);
  });

  it('boş "sürekli" döngü kilitlemez; "durdur" ile biter', async () => {
    const s = baslat({
      blocks: {
        languageVersion: 0,
        blocks: [
          { type: 'olay_program_basladiginda', next: { block: { type: 'kontrol_surekli' } } },
          {
            type: 'olay_program_basladiginda',
            x: 300,
            next: { block: zincir([{ type: 'kontrol_bekle', inputs: { SURE: sayi(0.05) } }, { type: 'kontrol_durdur' }]) },
          },
        ],
      },
    }, { bekle: (ms) => new Promise((c) => setTimeout(c, ms)) });
    await s.bitis; // sürekli döngü nefes aldığı için ikinci yığın çalışıp programı bitirebildi
  });

  it('diğer yığınları durdur', async () => {
    const { yazilar } = await calistir(
      {
        blocks: {
          languageVersion: 0,
          blocks: [
            {
              type: 'olay_program_basladiginda',
              next: { block: zincir([{ type: 'kontrol_bekle', inputs: { SURE: sayi(0.05) } }, yaz('GEC')]) },
            },
            { type: 'olay_program_basladiginda', x: 300, next: { block: { type: 'kontrol_diger_yiginlari_durdur' } } },
          ],
        },
      },
      { bekle: (ms) => new Promise((c) => setTimeout(c, ms)) },
    );
    expect(yazilar).toEqual([]);
  });
});

describe('Operatörler', () => {
  const sonuc = async (blok) => (await calistir(program([yaz(blok)]))).yazilar[0];
  it.each([
    [ikili('op_topla', 2, 3), '5'],
    [ikili('op_cikar', 2, 3), '-1'],
    [ikili('op_carp', 2, 3), '6'],
    [ikili('op_bol', 6, 3), '2'],
    [ikili('op_mod', -7, 3), '2'],
    [{ type: 'op_uzunluk', inputs: { A: metin('elma') } }, '4'],
    [{ type: 'op_yuvarla', inputs: { A: metin('2.6') } }, '3'],
    [{ type: 'op_islem', fields: { ISLEM: 'ABS' }, inputs: { A: metin('-4') } }, '4'],
    [{ type: 'op_birlestir', inputs: { A: metin('elma'), B: metin('armut') } }, 'elmaarmut'],
  ])('%#: sonuç doğru', async (blok, beklenen) => {
    expect(await sonuc(blok)).toBe(beklenen);
  });

  it('ve / veya / değil', async () => {
    const dogru = ikili('op_esit', 1, 1);
    const yanlis = ikili('op_esit', 1, 2);
    const { yazilar } = await calistir(
      program([
        eger({ type: 'op_ve', inputs: { A: deger(dogru), B: deger(yanlis) } }, [yaz('VE')], [yaz('-')]),
        eger({ type: 'op_veya', inputs: { A: deger(dogru), B: deger(yanlis) } }, [yaz('VEYA')], [yaz('-')]),
        eger({ type: 'op_degil', inputs: { A: deger(yanlis) } }, [yaz('DEGIL')], [yaz('-')]),
      ]),
    );
    expect(yazilar).toEqual(['-', 'VEYA', 'DEGIL']);
  });

  it('rastgele sınırlar içinde', async () => {
    const { yazilar } = await calistir(program([yaz({ type: 'op_rastgele', inputs: { A: sayi(1), B: sayi(3) } })]));
    expect(['1', '2', '3']).toContain(yazilar[0]);
  });
});

describe('Motorlar ve hareket', () => {
  it('motor bir tur döner: süre hızdan hesaplanır, derece sayılır', async () => {
    let t = 0;
    const bekle = async (ms) => {
      t += ms;
    };
    const { yazilar, komutlar } = await calistir(
      program([
        { type: 'motor_sureli_dondur', fields: { PORT: 'A', YON: 'CW', BIRIM: 'ROT' }, inputs: { MIKTAR: sayi(1) } },
        yaz({ type: 'motor_derece', fields: { PORT: 'A' } }),
      ]),
      { bekle, simdi: () => t },
    );
    // %75 hız = 750 °/sn → 360° 480 ms sürer
    expect(t).toBe(480);
    expect(yazilar).toEqual(['360']);
    expect(komutlar.filter((k) => k.tur === 'motorlar').length).toBeGreaterThanOrEqual(2);
  });

  it('ters yönde derece eksi sayılır; sıfırla', async () => {
    let t = 0;
    const { yazilar } = await calistir(
      program([
        { type: 'motor_hiz_ayarla', fields: { PORT: 'B' }, inputs: { HIZ: sayi(50) } },
        { type: 'motor_sureli_dondur', fields: { PORT: 'B', YON: 'CCW', BIRIM: 'DEG' }, inputs: { MIKTAR: sayi(90) } },
        yaz({ type: 'motor_derece', fields: { PORT: 'B' } }),
        { type: 'motor_derece_sifirla', fields: { PORT: 'B' } },
        yaz({ type: 'motor_derece', fields: { PORT: 'B' } }, 2),
      ]),
      { bekle: async (ms) => { t += ms; }, simdi: () => t },
    );
    expect(yazilar).toEqual(['-90', '0']);
  });

  it('hareket: ileri 1 tur → B ve C aynı hızla döner', async () => {
    let t = 0;
    const { komutlar } = await calistir(
      program([{ type: 'hareket_yonlu', fields: { YON: 'FWD', BIRIM: 'ROT' }, inputs: { MIKTAR: sayi(1) } }]),
      { bekle: async (ms) => { t += ms; }, simdi: () => t },
    );
    const ilk = komutlar.find((k) => k.tur === 'motorlar').durum;
    expect(ilk.B.hiz).toBe(500);
    expect(ilk.C.hiz).toBe(500);
    expect(t).toBe(720); // %50 → 500 °/sn, 360°
  });

  it('hareket: sağa yerinde dönüş', async () => {
    let t = 0;
    const { komutlar } = await calistir(
      program([{ type: 'hareket_yonlu', fields: { YON: 'RIGHT', BIRIM: 'SEC' }, inputs: { MIKTAR: sayi(1) } }]),
      { bekle: async (ms) => { t += ms; }, simdi: () => t },
    );
    const ilk = komutlar.find((k) => k.tur === 'motorlar').durum;
    expect([ilk.B.hiz, ilk.C.hiz]).toEqual([500, -500]);
    expect(t).toBe(1000);
  });
});

describe('Sensörler (ana sayfadan gelen değerlerle)', () => {
  const donanim = {
    sensorler: {
      1: { tur: 'dokunma', basili: true },
      2: { tur: 'jiroskop', aci: 30 },
      3: { tur: 'renk', renk: 'RED', yansiyan: 40, ortam: 10 },
      4: { tur: 'mesafe', cm: 12 },
    },
    dugmeler: { CENTER: true },
  };
  const oku = async (blok) => (await calistir(program([yaz(blok)]), { donanim })).yazilar[0];

  it.each([
    [{ type: 'sensor_yansiyan', fields: { PORT: '3' } }, '40'],
    [{ type: 'sensor_renk', fields: { PORT: '3' } }, 'kirmizi'],
    [{ type: 'sensor_ortam', fields: { PORT: '3' } }, '10'],
    [{ type: 'sensor_mesafe', fields: { PORT: '4', BIRIM: 'CM' } }, '12'],
    [{ type: 'sensor_aci', fields: { PORT: '2' } }, '30'],
    [{ type: 'sensor_dugme' }, 'orta'],
  ])('%#: değer okunur', async (blok, beklenen) => {
    expect(await oku(blok)).toBe(beklenen);
  });

  it('koşul blokları', async () => {
    const { yazilar } = await calistir(
      program([
        eger({ type: 'sensor_dokunma_mi', fields: { PORT: '1' } }, [yaz('BASILI')]),
        eger({ type: 'sensor_renk_mi', fields: { PORT: '3', RENK: 'RED' } }, [yaz('KIRMIZI')]),
        eger({ type: 'sensor_mesafe_mi', fields: { PORT: '4', KARS: 'LT', BIRIM: 'CM' }, inputs: { DEGER: sayi(15) } }, [yaz('YAKIN')]),
        eger({ type: 'sensor_dugme_mi', fields: { DUGME: 'CENTER' } }, [yaz('ORTA')]),
      ]),
      { donanim },
    );
    expect(yazilar).toEqual(['BASILI', 'KIRMIZI', 'YAKIN', 'ORTA']);
  });

  it('jiroskop sıfırlama', async () => {
    const { yazilar } = await calistir(
      program([{ type: 'sensor_aci_sifirla', fields: { PORT: '2' } }, yaz({ type: 'sensor_aci', fields: { PORT: '2' } })]),
      { donanim },
    );
    expect(yazilar).toEqual(['0']);
  });

  it('"basılana kadar bekle": değer değişince devam eder', async () => {
    const s = baslat(
      program([{ type: 'sensor_dokunma_bekle', fields: { PORT: '1', DURUM: 'PRESSED' } }, yaz('DEVAM')]),
      { donanim: { sensorler: { 1: { tur: 'dokunma', basili: false } }, dugmeler: {} }, bekle: (ms) => new Promise((c) => setTimeout(c, ms)) },
    );
    await new Promise((c) => setTimeout(c, 30));
    expect(s.yazilar).toEqual([]);
    s.y.donanimGuncelle({ sensorler: { 1: { tur: 'dokunma', basili: true } }, dugmeler: {} });
    await s.bitis;
    expect(s.yazilar).toEqual(['DEVAM']);
  });
});

describe('Olaylar ve mesajlar', () => {
  it('dokunma olayı: basılınca çalışır; program olay bekler', async () => {
    const s = baslat(
      {
        blocks: {
          languageVersion: 0,
          blocks: [{
            type: 'olay_dokunma',
            fields: { PORT: '1', DURUM: 'PRESSED' },
            next: { block: zincir([yaz('BASILDI'), { type: 'kontrol_durdur' }]) },
          }],
        },
      },
      { donanim: { sensorler: { 1: { tur: 'dokunma', basili: false } }, dugmeler: {} } },
    );
    await new Promise((c) => setTimeout(c, 30));
    expect(s.mesajlar.some((m) => m.tur === 'dinliyor')).toBe(true);
    expect(s.yazilar).toEqual([]);
    s.y.donanimGuncelle({ sensorler: { 1: { tur: 'dokunma', basili: true } }, dugmeler: {} });
    await s.bitis;
    expect(s.yazilar).toEqual(['BASILDI']);
  });

  it('mesaj yayınla ve bekle: alıcı önce çalışır', async () => {
    const { yazilar } = await calistir({
      blocks: {
        languageVersion: 0,
        blocks: [
          {
            type: 'olay_program_basladiginda',
            next: { block: zincir([{ type: 'olay_yayinla_bekle', fields: { MESAJ: 'mesaj1' } }, yaz('SONRA', 2)]) },
          },
          { type: 'olay_mesaj_gelince', x: 300, fields: { MESAJ: 'mesaj1' }, next: { block: yaz('MESAJ') } },
        ],
      },
    });
    expect(yazilar).toEqual(['MESAJ', 'SONRA']);
  });
});

describe('Yavaş çekim', () => {
  it('her blok için vurgulama komutu gönderir', async () => {
    const kod = alanla(program([yaz('A'), yaz('B', 2)]), jsKoduUret);
    const bloklar = [];
    const y = yurutucuOlustur(
      (m) => m.tur === 'toplu' && m.komutlar.forEach((k) => k.tur === 'blok' && bloklar.push(k.id)),
      { yavas: true, bekle: async () => {} },
    );
    await y.calistir(kod);
    expect(bloklar.length).toBe(3); // şapka + iki yaz bloğu
  });
});

/** Bilgisayarda python3 varsa sözdizimini derleyerek denetler (çalıştırmaz). Yoksa ''. */
function pythonSozdizimiHatasi(kod) {
  const s = spawnSync('python3', ['-I', '-c', 'import sys; compile(sys.stdin.read(), "main.py", "exec")'], {
    input: kod,
    encoding: 'utf8',
  });
  if (s.error) return ''; // python3 yok: atla
  return s.status === 0 ? '' : s.stderr.trim().split('\n').at(-1);
}

describe('Python: mesajlar ve olaylar birlikte', () => {
  it('derlenebilir program üretir', () => {
    const kod = alanla(
      {
        blocks: {
          languageVersion: 0,
          blocks: [
            { type: 'olay_program_basladiginda', next: { block: { type: 'olay_yayinla', fields: { MESAJ: 'mesaj1' } } } },
            { type: 'olay_mesaj_gelince', x: 200, fields: { MESAJ: 'mesaj1' } },
            { type: 'olay_dugme', x: 400, fields: { DUGME: 'CENTER', DURUM: 'PRESSED' }, next: { block: yaz('ORTA') } },
          ],
        },
      },
      pythonKoduUret,
    );
    expect(kod).toContain('def mesaj_mesaj1():\n    pass\n');
    expect(kod).toContain('while True:');
    expect(pythonSozdizimiHatasi(kod)).toBe('');
  });
});

describe('Python: her blok kod üretir', () => {
  const ogeler = BLOK_KATEGORILERI.flatMap((k) => k.arac.map((o) => [o.type, o]));

  it.each(ogeler)('%s', (tur, oge) => {
    const { kind: _k, ...durum } = oge;
    const ws = new Blockly.Workspace();
    try {
      if (SAPKA_TURLERI.has(tur)) {
        Blockly.serialization.blocks.append({ ...durum, next: { block: { type: 'ekran_temizle' } } }, ws);
      } else {
        const blok = Blockly.serialization.blocks.append(durum, ws);
        const sapka = ws.newBlock('olay_program_basladiginda');
        if (blok.previousConnection) {
          sapka.nextConnection.connect(blok.previousConnection);
        } else {
          const tasiyici = ws.newBlock(blok.outputConnection.getCheck()?.includes('Boolean') ? 'kontrol_eger' : 'ekran_satira_yaz');
          tasiyici.getInput(tasiyici.type === 'kontrol_eger' ? 'KOSUL' : 'METIN').connection.connect(blok.outputConnection);
          sapka.nextConnection.connect(tasiyici.previousConnection);
        }
      }
      const py = pythonKoduUret(ws);
      const js = jsKoduUret(ws);
      expect(py).not.toMatch(/undefined|NaN|\[object/);
      expect(js).not.toMatch(/undefined\b(?!,)|NaN|\[object/);
      expect(py.split('\n').length).toBeGreaterThan(5);
      expect(pythonSozdizimiHatasi(py)).toBe('');
      // JS sözdizimi geçerli mi (çalıştırmadan)
      expect(() => new Function('baslat', 'olay', 'mesajGelince', 'adim', 'ekran', 'isik', 'bekle', 'robot', 'op', js)).not.toThrow();
    } finally {
      ws.dispose();
    }
  });
});
