// Öğretim programındaki kısaltılmış EV3 Classroom blok listelerini Blockly programına çevirir.
// Girdi biçimi (dersVerisi.js): [["start"], ["mvfor", "~ileri|forward", 1, "~dönüş|rotations"], ...]
//   "~" ile başlayan metin açılır liste seçeneğidir; "Türkçe|English" biçiminde Türkçe kısım alınır.
// Çıktı: Blockly.serialization.workspaces.load ile yüklenebilen JSON.

/** "~sağ: 100|right: 100" → "sağ: 100". Açılır liste (~) seçenekleri kırpılır; yazıların boşlukları korunur. */
export const tr = (s) => {
  const t = String(s).replace(/^~/, '').split('|')[0].replace(/−/g, '-');
  return String(s).startsWith('~') ? t.trim() : t;
};

const HARF = { ç: 'c', ğ: 'g', ı: 'i', ö: 'o', ş: 's', ü: 'u', Ç: 'C', Ğ: 'G', İ: 'I', Ö: 'O', Ş: 'S', Ü: 'U' };
/** Python'da da geçerli ASCII ad: "çizgi çiz" → "cizgi_ciz" */
export const asciiAd = (s) =>
  tr(s).replace(/[çğıöşüÇĞİÖŞÜ]/g, (h) => HARF[h]).replace(/[^A-Za-z0-9]+/g, '_').replace(/^_|_$/g, '');

const RENK = {
  kırmızı: 'RED', yeşil: 'GREEN', mavi: 'BLUE', sarı: 'YELLOW', siyah: 'BLACK',
  beyaz: 'WHITE', kahverengi: 'BROWN', turuncu: 'ORANGE',
};
const RESIM = { Sevgi: 'LOVE', Uyanık: 'AWAKE', Sersem: 'DIZZY', Nötr: 'NEUTRAL', Uykulu: 'SLEEPING', Kızgın: 'ANGRY', 'Göz kırpan': 'WINKING' };
const ISIK = { ...RENK, kapalı: 'OFF' };
const DUGME = { orta: 'CENTER', sol: 'LEFT', sağ: 'RIGHT', yukarı: 'UP', aşağı: 'DOWN' };
const DURUM = { basılı: 'PRESSED', bırakılmış: 'RELEASED', çarpılmış: 'BUMPED' };
const KARS = { '<': 'LT', '=': 'EQ', '>': 'GT' };
const SES = { Merhaba: 'HELLO', Evet: 'YES', Hayır: 'NO', 'Hoşça kal': 'GOODBYE' };
const BIRIM = { dönüş: 'ROT', derece: 'DEG', cm: 'CM', saniye: 'SEC' };
const YON_MOTOR = { 'saat yönünde': 'CW', 'saat yönünün tersine': 'CCW' };
const ISLEM = { tan: 'TAN', sin: 'SIN', cos: 'COS', abs: 'ABS', karekök: 'SQRT', mutlak: 'ABS' };

function eslestir(tablo, deger, ne) {
  const anahtar = tr(deger);
  if (!(anahtar in tablo)) throw new Error(`Bilinmeyen ${ne}: ${anahtar}`);
  return tablo[anahtar];
}

/** Sürüş yönü: ileri/geri/sağ/sol (yönlü blok) ya da "düz: 0", "sağ: 100", "sol: -40" (dönüş değeri). */
function surusYonu(deger) {
  const y = tr(deger);
  const dur = /^(düz|sağ|sol):\s*(-?\d+(?:\.\d+)?)$/.exec(y);
  if (dur) return { donus: (dur[1] === 'sol' ? -1 : 1) * Math.abs(Number(dur[2])) };
  const yon = { ileri: 'FWD', geri: 'BWD', sağ: 'RIGHT', sol: 'LEFT' }[y];
  if (!yon) throw new Error(`Bilinmeyen sürüş yönü: ${y}`);
  return { yon };
}

export function programaCevir(programlar) {
  const degiskenler = new Map(); // ascii ad → id
  const yordamlar = new Map(); // ascii ad → [parametre ascii adları]
  const degisken = (ad) => {
    const a = asciiAd(ad);
    if (!degiskenler.has(a)) degiskenler.set(a, `v_${a}`);
    return { id: degiskenler.get(a) };
  };

  // Önce bütün tanımları (parametreleriyle) topla: çağrılar parametre adlarını bilmeli.
  for (const p of programlar) {
    if (p[0]?.[0] === 'def') {
      const [, ad, ...params] = p[0];
      yordamlar.set(asciiAd(ad), params.map(asciiAd));
      params.forEach(degisken);
    }
  }

  const golge = (v) =>
    typeof v === 'number'
      ? { shadow: { type: 'ev3_sayi', fields: { NUM: v } } }
      : { shadow: { type: 'ev3_metin', fields: { METIN: tr(v) } } };

  /** Değer: sayı, metin ya da ifade dizisi. */
  function deger(v) {
    if (!Array.isArray(v)) return golge(v);
    return { block: ifade(v) };
  }
  /** Sayı girişine değer: düz sayıysa sayı ovali, ifadeyse blok (gölge altta kalır). */
  const sayiGirisi = (v) => (Array.isArray(v) ? { shadow: golge(0).shadow, block: ifade(v) } : golge(v));

  function ifade([op, ...a]) {
    switch (op) {
      case 'angle': return { type: 'sensor_aci', fields: { PORT: tr(a[0]) } };
      case 'dist': return { type: 'sensor_mesafe', fields: { PORT: tr(a[0]), BIRIM: 'CM' } };
      case 'refl': return { type: 'sensor_yansiyan', fields: { PORT: tr(a[0]) } };
      case 'modeg': return { type: 'motor_derece', fields: { PORT: tr(a[0]) } };
      case 'timer': return { type: 'sensor_zamanlayici' };
      case 'var': return { type: 'variables_get', fields: { VAR: degisken(a[0]) } };
      case 'add': case 'sub': case 'mul': case 'div':
        return {
          type: { add: 'op_topla', sub: 'op_cikar', mul: 'op_carp', div: 'op_bol' }[op],
          inputs: { A: deger(a[0]), B: deger(a[1]) },
        };
      case 'gt': case 'lt': case 'eq':
        return { type: { gt: 'op_buyuk', lt: 'op_kucuk', eq: 'op_esit' }[op], inputs: { A: deger(a[0]), B: deger(a[1]) } };
      case 'mod': return { type: 'op_mod', inputs: { A: deger(a[0]), B: deger(a[1]) } };
      case 'rand': return { type: 'op_rastgele', inputs: { A: deger(a[0]), B: deger(a[1]) } };
      case 'and': return { type: 'op_ve', inputs: { A: { block: ifade(a[0]) }, B: { block: ifade(a[1]) } } };
      case 'not': return { type: 'op_degil', inputs: { A: { block: ifade(a[0]) } } };
      case 'amb': return { type: 'sensor_ortam', fields: { PORT: tr(a[0]) } };
      case 'btn': return { type: 'sensor_dugme_mi', fields: { DUGME: eslestir(DUGME, a[0], 'düğme') } };
      case 'or': return { type: 'op_veya', inputs: { A: { block: ifade(a[0]) }, B: { block: ifade(a[1]) } } };
      case 'join': return { type: 'op_birlestir', inputs: { A: deger(a[0]), B: deger(a[1]) } };
      case 'round': return { type: 'op_yuvarla', inputs: { A: deger(a[0]) } };
      case 'fn': return { type: 'op_islem', fields: { ISLEM: eslestir(ISLEM, a[0], 'işlem') }, inputs: { A: deger(a[1]) } };
      case 'iscolor': return { type: 'sensor_renk_mi', fields: { PORT: tr(a[0]), RENK: eslestir(RENK, a[1], 'renk') } };
      case 'pressed': return { type: 'sensor_dokunma_mi', fields: { PORT: tr(a[0]) } };
      default: throw new Error(`Bilinmeyen ifade: ${op}`);
    }
  }

  const zincir = (liste) => {
    const bloklar = liste.map(komut);
    for (let i = bloklar.length - 2; i >= 0; i--) bloklar[i].next = { block: bloklar[i + 1] };
    return bloklar[0];
  };
  const govde = (liste) => (liste?.length ? { block: zincir(liste) } : undefined);

  function komut([op, ...a]) {
    switch (op) {
      case 'img': return { type: 'ekran_resim', fields: { RESIM: eslestir(RESIM, a[0], 'resim') } };
      case 'beep': return { type: 'ses_bip', inputs: { NOTA: golge(a[0]), SURE: golge(a[1]) } };
      case 'wait': return { type: 'kontrol_bekle', inputs: { SURE: sayiGirisi(a[0]) } };
      case 'clear': return { type: 'ekran_temizle' };
      case 'write': return { type: 'ekran_satira_yaz', inputs: { METIN: deger(a[0]), SATIR: golge(a[1] ?? 1) } };
      case 'writexy': return { type: 'ekran_konuma_yaz', inputs: { METIN: deger(a[0]), X: sayiGirisi(a[1]), Y: sayiGirisi(a[2]) } };
      case 'imgfor': return { type: 'ekran_resim_sureli', fields: { RESIM: eslestir(RESIM, a[0], 'resim') }, inputs: { SURE: golge(a[1]) } };
      case 'sound': return { type: 'ses_bitene_kadar_cal', fields: { SES: eslestir(SES, a[0], 'ses') } };
      case 'mvforh': {
        const y = surusYonu(a[0]);
        const donus = y.yon ? { FWD: 0, BWD: 0, RIGHT: 100, LEFT: -100 }[y.yon] : y.donus;
        return {
          type: 'hareket_donuslu_hizla',
          fields: { BIRIM: eslestir(BIRIM, a[2], 'birim') },
          inputs: { DONUS: golge(donus), MIKTAR: sayiGirisi(a[1]), HIZ: sayiGirisi(a[3]) },
        };
      }
      case 'tank':
        return {
          type: 'hareket_tank',
          fields: { BIRIM: eslestir(BIRIM, a[1], 'birim') },
          inputs: { MIKTAR: sayiGirisi(a[0]), SOL_HIZ: golge(a[2]), SAG_HIZ: golge(a[3]) },
        };
      case 'mvstarth': {
        const y = Array.isArray(a[0]) ? null : surusYonu(a[0]);
        const donus = y ? (y.yon ? { FWD: 0, BWD: 0, RIGHT: 100, LEFT: -100 }[y.yon] : y.donus) : null;
        return { type: 'hareket_baslat_hizla', inputs: { DONUS: y ? golge(donus) : sayiGirisi(a[0]), HIZ: sayiGirisi(a[1]) } };
      }
      case 'waitbtn':
        return { type: 'sensor_dugme_bekle', fields: { DUGME: eslestir(DUGME, a[0], 'düğme'), DURUM: eslestir(DURUM, a[1] ?? '~basılı', 'durum') } };
      case 'waittouch':
        return { type: 'sensor_dokunma_bekle', fields: { PORT: tr(a[0]), DURUM: eslestir(DURUM, a[1] ?? '~basılı', 'durum') } };
      case 'light': return { type: 'ekran_durum_isigi', fields: { RENK: eslestir(ISIK, a[0], 'ışık rengi') } };
      case 'mvfor': {
        const y = surusYonu(a[0]);
        const ortak = { MIKTAR: sayiGirisi(a[1]) };
        const birim = eslestir(BIRIM, a[2], 'birim');
        return y.yon
          ? { type: 'hareket_yonlu', fields: { YON: y.yon, BIRIM: birim }, inputs: ortak }
          : { type: 'hareket_donuslu', fields: { BIRIM: birim }, inputs: { DONUS: golge(y.donus), ...ortak } };
      }
      case 'mvstart': {
        if (Array.isArray(a[0])) return { type: 'hareket_baslat', inputs: { DONUS: sayiGirisi(a[0]) } };
        const y = surusYonu(a[0]);
        const donus = y.yon ? { FWD: 0, BWD: 0, RIGHT: 100, LEFT: -100 }[y.yon] : y.donus;
        return { type: 'hareket_baslat', inputs: { DONUS: golge(donus) } };
      }
      case 'mvstop': return { type: 'hareket_durdur' };
      case 'mvspeed': return { type: 'hareket_hiz_ayarla', inputs: { HIZ: golge(a[0]) } };
      case 'morun':
        return {
          type: 'motor_sureli_dondur',
          fields: { PORT: tr(a[0]), YON: eslestir(YON_MOTOR, a[1], 'motor yönü'), BIRIM: eslestir(BIRIM, a[3], 'birim') },
          inputs: { MIKTAR: sayiGirisi(a[2]) },
        };
      case 'mostart':
        return { type: 'motor_baslat', fields: { PORT: tr(a[0]), YON: eslestir(YON_MOTOR, a[1], 'motor yönü') } };
      case 'mostop': return { type: 'motor_durdur', fields: { PORT: tr(a[0]) } };
      case 'mospeed': return { type: 'motor_hiz_ayarla', fields: { PORT: tr(a[0]) }, inputs: { HIZ: golge(a[1]) } };
      case 'moreset': return { type: 'motor_derece_sifirla', fields: { PORT: tr(a[0]) } };
      case 'resetangle': return { type: 'sensor_aci_sifirla', fields: { PORT: tr(a[0]) } };
      case 'resettimer': return { type: 'sensor_zamanlayici_sifirla' };
      case 'until': return { type: 'kontrol_olana_kadar_bekle', inputs: { KOSUL: { block: ifade(a[0]) } } };
      case 'rep': return { type: 'kontrol_tekrarla', inputs: { SAYI: golge(a[0]), YAP: govde(a[1]) } };
      case 'forever': return { type: 'kontrol_surekli', inputs: { YAP: govde(a[0]) } };
      case 'untilrep':
        return { type: 'kontrol_olana_kadar_tekrarla', inputs: { KOSUL: { block: ifade(a[0]) }, YAP: govde(a[1]) } };
      case 'if': return { type: 'kontrol_eger', inputs: { KOSUL: { block: ifade(a[0]) }, YAP: govde(a[1]) } };
      case 'ifelse':
        return {
          type: 'kontrol_eger_degilse',
          inputs: { KOSUL: { block: ifade(a[0]) }, YAP: govde(a[1]), DEGILSE: govde(a[2]) },
        };
      case 'set': return { type: 'variables_set', fields: { VAR: degisken(a[0]) }, inputs: { VALUE: sayiGirisi(a[1]) } };
      case 'change': return { type: 'math_change', fields: { VAR: degisken(a[0]) }, inputs: { DELTA: sayiGirisi(a[1]) } };
      case 'stop': return { type: 'kontrol_durdur' };
      case 'call': {
        const ad = asciiAd(a[0]);
        const params = yordamlar.get(ad) ?? [];
        return {
          type: 'procedures_callnoreturn',
          extraState: { name: ad, params },
          inputs: Object.fromEntries(a.slice(1).map((v, i) => [`ARG${i}`, deger(v)])),
        };
      }
      default: throw new Error(`Bilinmeyen blok: ${op}`);
    }
  }

  const ust = programlar.map((p, i) => {
    const konum = { x: 20 + (i % 2) * 380, y: 20 + Math.floor(i / 2) * 260 };
    const [bas, ...gerisi] = p;
    const devam = gerisi.length ? { next: { block: zincir(gerisi) } } : {};
    if (bas[0] === 'start') return { type: 'olay_program_basladiginda', ...konum, ...devam };
    // Olay şapkaları: ['ondugme', '~orta'], ['ondokunma', '~1'], ['onmesafe', '~4', '<', 15], ['onrenk', '~3', '~kırmızı'], ['ontimer', 20]
    if (bas[0] === 'ondugme') {
      return { type: 'olay_dugme', ...konum, fields: { DUGME: eslestir(DUGME, bas[1], 'düğme'), DURUM: 'PRESSED' }, ...devam };
    }
    if (bas[0] === 'ondokunma') return { type: 'olay_dokunma', ...konum, fields: { PORT: tr(bas[1]), DURUM: 'PRESSED' }, ...devam };
    if (bas[0] === 'onmesafe') {
      return {
        type: 'olay_mesafe', ...konum,
        fields: { PORT: tr(bas[1]), KARS: KARS[bas[2]], BIRIM: 'CM' },
        inputs: { DEGER: golge(bas[3]) }, ...devam,
      };
    }
    if (bas[0] === 'onrenk') return { type: 'olay_renk', ...konum, fields: { PORT: tr(bas[1]), RENK: eslestir(RENK, bas[2], 'renk') }, ...devam };
    if (bas[0] === 'ontimer') return { type: 'olay_zamanlayici', ...konum, inputs: { DEGER: golge(bas[1]) }, ...devam };
    if (bas[0] === 'def') {
      const ad = asciiAd(bas[1]);
      return {
        type: 'procedures_defnoreturn',
        ...konum,
        fields: { NAME: ad },
        extraState: { params: yordamlar.get(ad).map((p) => ({ name: p, id: degiskenler.get(p) })) },
        ...(gerisi.length && { inputs: { STACK: { block: zincir(gerisi) } } }),
      };
    }
    throw new Error(`Program "start" ya da "def" ile başlamalı: ${bas[0]}`);
  });

  return {
    variables: [...degiskenler].map(([name, id]) => ({ name, id })),
    blocks: { languageVersion: 0, blocks: ust },
  };
}
