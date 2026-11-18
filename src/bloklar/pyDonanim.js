// Python (Pybricks) üretiminde cihaz tanımları ve ortak yardımcılar.
// Tanımlar u.definitions_ içine bir kez eklenir; pythonKodu.js bunları başlığa yerleştirir.
// u.ev3Durum: mesaj fonksiyonlarında `global` ile bildirilmesi gereken durum değişkenleri.

const imp = (u, anahtar, satir) => {
  u.definitions_[`import_${anahtar}`] = satir;
};
const tanim = (u, ad, satir) => {
  if (!(ad in u.definitions_)) u.definitions_[ad] = satir;
};
const durum = (u, ad) => u.ev3Durum?.add(ad);

export const portImport = (u) => imp(u, 'port', 'from pybricks.parameters import Port');
export const stopImport = (u) => imp(u, 'stop', 'from pybricks.parameters import Stop');
export const colorImport = (u) => imp(u, 'color', 'from pybricks.parameters import Color');
export const buttonImport = (u) => imp(u, 'button', 'from pybricks.parameters import Button');
export const waitImport = (u) => imp(u, 'wait', 'from pybricks.tools import wait');

const CIHAZLAR = {
  motor: { sinif: 'Motor', ad: (p) => `motor_${p.toLowerCase()}`, port: (p) => `Port.${p}` },
  renk: { sinif: 'ColorSensor', ad: (p) => `renk_${p}`, port: (p) => `Port.S${p}` },
  dokunma: { sinif: 'TouchSensor', ad: (p) => `dokunma_${p}`, port: (p) => `Port.S${p}` },
  mesafe: { sinif: 'UltrasonicSensor', ad: (p) => `mesafe_${p}`, port: (p) => `Port.S${p}` },
  jiroskop: { sinif: 'GyroSensor', ad: (p) => `jiro_${p}`, port: (p) => `Port.S${p}` },
};

/** Cihazı tanımlar, Python'daki adını döndürür (ör. motor_a, renk_3). */
export function cihaz(u, tur, port) {
  const c = CIHAZLAR[tur];
  imp(u, c.sinif, `from pybricks.ev3devices import ${c.sinif}`);
  portImport(u);
  const ad = c.ad(port);
  tanim(u, `cihaz_${ad}`, `${ad} = ${c.sinif}(${c.port(port)})`);
  return ad;
}

/** Motor ve EV3 Classroom'daki gibi hız (%75) ve duruş ayarı. */
export function motor(u, port) {
  const ad = cihaz(u, 'motor', port);
  stopImport(u);
  const p = port.toLowerCase();
  tanim(u, `durum_hiz_${p}`, `hiz_${p} = 750  # %75 hız (°/sn)`);
  tanim(u, `durum_durus_${p}`, `durus_${p} = Stop.HOLD`);
  durum(u, `hiz_${p}`);
  durum(u, `durus_${p}`);
  durdurYardimcisi(u);
  return { ad, hiz: `hiz_${p}`, durus: `durus_${p}` };
}

export function durdurYardimcisi(u) {
  stopImport(u);
  tanim(
    u,
    'yardimci_durdur',
    [
      'def durdur(motor, durus):',
      '    if durus == Stop.HOLD:',
      '        motor.hold()',
      '    elif durus == Stop.BRAKE:',
      '        motor.brake()',
      '    else:',
      '        motor.stop()',
    ].join('\n'),
  );
}

/** İki motorlu hareket (varsayılan B ve C) ve yardımcı fonksiyonlar. */
export function hareket(u) {
  motor(u, 'B');
  motor(u, 'C');
  waitImport(u);
  tanim(u, 'durum_sol_motor', 'sol_motor = motor_b');
  tanim(u, 'durum_sag_motor', 'sag_motor = motor_c');
  tanim(u, 'durum_hareket_hizi', 'hareket_hizi = 50  # %');
  tanim(u, 'durum_hareket_durusu', 'hareket_durusu = Stop.HOLD');
  for (const d of ['sol_motor', 'sag_motor', 'hareket_hizi', 'hareket_durusu']) durum(u, d);
  tanim(
    u,
    'yardimci_donus_hizlari',
    [
      'def donus_hizlari(donus, hiz):',
      '    yavas = hiz * (1 - abs(donus) / 50)',
      '    return (hiz, yavas) if donus >= 0 else (yavas, hiz)',
    ].join('\n'),
  );
  tanim(
    u,
    'yardimci_hareket_et',
    [
      'def hareket_et(sol, sag, miktar, birim):',
      "    if birim == 'SEC':",
      '        sol_motor.run(sol * 10)',
      '        sag_motor.run(sag * 10)',
      '        wait(miktar * 1000)',
      '        durdur(sol_motor, hareket_durusu)',
      '        durdur(sag_motor, hareket_durusu)',
      '        return',
      "    derece = miktar * 360 if birim == 'ROT' else (miktar / 17.59 * 360 if birim == 'CM' else miktar)",
      '    hizli = max(abs(sol), abs(sag)) or 1',
      '    sol_motor.run_angle(abs(sol) * 10 or 1, derece * sol / hizli, then=hareket_durusu, wait=False)',
      '    sag_motor.run_angle(abs(sag) * 10 or 1, derece * sag / hizli, then=hareket_durusu)',
    ].join('\n'),
  );
}

export function zamanlayici(u) {
  imp(u, 'stopwatch', 'from pybricks.tools import StopWatch');
  tanim(u, 'durum_zamanlayici', 'zamanlayici = StopWatch()');
  return 'zamanlayici';
}

export function notaFrekansi(u) {
  tanim(
    u,
    'yardimci_nota',
    ['def nota_frekansi(nota):', '    return int(440 * 2 ** ((nota - 69) / 12))'].join('\n'),
  );
}

export function basiliDugme(u) {
  tanim(
    u,
    'yardimci_dugme',
    [
      'def basili_dugme():',
      '    basililar = ev3.buttons.pressed()',
      "    return str(basililar[0]) if basililar else ''",
    ].join('\n'),
  );
}

/** EV3 Classroom karşılaştırma kodunu Python/JS işlecine çevirir. */
export const KARS_PY = { LT: '<', EQ: '==', GT: '>' };
export const KARS_JS = { LT: '<', EQ: '=', GT: '>' };

/** Python: "bekle … olana kadar" döngüsü. */
export function bekleDongusu(u, kosul) {
  waitImport(u);
  return `while not (${kosul}):\n${u.INDENT}wait(10)\n`;
}
