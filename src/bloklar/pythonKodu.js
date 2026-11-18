// Bloklardan gerçek EV3'te çalışabilecek Pybricks programı üretir.
// "program başladığında" → ana program; "mesajı gelince" → fonksiyon;
// sensör/düğme/koşul/zamanlayıcı olayları → sonda bir izleme döngüsü (Pybricks'te olay yok).
import { pythonGenerator } from 'blockly/python';
import { OLAY_KOSULU_PY, SAPKA_TURLERI, mesajFonksiyonu } from './kategoriler/olaylar.js';
import { waitImport } from './pyDonanim.js';
import { TANIM_TURLERI } from './kategoriler/bloklarim.js';

export const BASLANGIC_BLOGU = 'olay_program_basladiginda';

const SHEBANG = '#!/usr/bin/env pybricks-micropython';
const EV3_IMPORT = 'from pybricks.hubs import EV3Brick';
const IMPORT = /^(from\s+\S+\s+)?import\s+/;

export function pythonKoduUret(calismaAlani) {
  const u = pythonGenerator;
  u.init(calismaAlani);
  u.ev3Durum = new Set();
  u.ev3Mesajlar = new Set();

  const zincir = (b) => (b.getNextBlock() ? u.blockToCode(b.getNextBlock()) : '');
  let ana = '';
  const mesajGovdeleri = new Map();
  const olaylar = [];
  for (const blok of calismaAlani.getTopBlocks(true)) {
    if (TANIM_TURLERI.has(blok.type) && blok.isEnabled()) u.blockToCode(blok); // def … (Bloklarım)
    if (!SAPKA_TURLERI.has(blok.type) || !blok.isEnabled()) continue;
    if (blok.type === BASLANGIC_BLOGU) {
      ana += zincir(blok);
    } else if (blok.type === 'olay_mesaj_gelince') {
      const ad = blok.getFieldValue('MESAJ');
      u.ev3Mesajlar.add(ad);
      mesajGovdeleri.set(ad, (mesajGovdeleri.get(ad) ?? '') + zincir(blok));
    } else {
      olaylar.push({ kosul: OLAY_KOSULU_PY[blok.type](blok, u), govde: zincir(blok) });
    }
  }
  if (olaylar.length) waitImport(u);

  // Mesaj fonksiyonları: değiştirilen durum değişkenleri global bildirilir.
  const degiskenler = calismaAlani
    .getVariableMap()
    .getAllVariables()
    .map((v) => u.getVariableName(v.getId()));
  const globaller = [...new Set([...degiskenler, ...u.ev3Durum])];
  const fonksiyonlar = [...u.ev3Mesajlar].map((ad) => {
    const govde = mesajGovdeleri.get(ad) ?? '';
    const global = globaller.length ? `${u.INDENT}global ${globaller.join(', ')}\n` : '';
    return `def ${mesajFonksiyonu(ad)}():\n${global}${govde ? u.prefixLines(govde, u.INDENT) : `${u.INDENT}pass\n`}`;
  });

  // Blockly'nin değişkenleri "x = None" diye başlatmasını atlıyoruz: öğrenciye gereksiz gürültü.
  const { variables: _degiskenler, ...tanimlar } = u.definitions_;
  u.finish('');

  const ekImportlar = Object.values(tanimlar).filter((t) => IMPORT.test(t)).sort();
  const digerTanimlar = Object.values(tanimlar).filter((t) => !IMPORT.test(t));

  const satirlar = [SHEBANG, EV3_IMPORT, ...ekImportlar, '', 'ev3 = EV3Brick()', ''];
  // Fonksiyonların önüne ve arkasına boş satır (okunabilirlik).
  for (const t of [...digerTanimlar, ...fonksiyonlar]) {
    if (t.startsWith('def ')) {
      if (satirlar.at(-1) !== '') satirlar.push('');
      satirlar.push(t.trimEnd(), '');
    } else {
      satirlar.push(t);
    }
  }
  if (satirlar.at(-1) !== '') satirlar.push('');
  let kod = satirlar.join('\n');
  if (ana) kod += `\n${ana}`;
  if (olaylar.length) kod += `\n${olayDongusu(olaylar, u)}`;
  return kod;
}

/** Olayları kenar tetiklemeli bir döngüyle izler: koşul yanlıştan doğruya geçince gövde çalışır. */
function olayDongusu(olaylar, u) {
  const I = u.INDENT;
  let kod = '# Olaylar: Pybricks\'te bir döngüyle izlenir.\n';
  olaylar.forEach((o, i) => {
    kod += `olay_${i + 1}_onceki = ${o.kosul}\n`;
  });
  kod += 'while True:\n';
  olaylar.forEach((o, i) => {
    const n = `olay_${i + 1}`;
    kod += `${I}${n} = ${o.kosul}\n`;
    kod += `${I}if ${n} and not ${n}_onceki:\n`;
    kod += u.prefixLines(o.govde || 'pass\n', I + I);
    kod += `${I}${n}_onceki = ${n}\n`;
  });
  kod += `${I}wait(10)\n`;
  return kod;
}
