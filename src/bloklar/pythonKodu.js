// Bloklardan gerçek EV3'te çalışabilecek Pybricks programı üretir.
// Yalnızca "program başladığında" bloğuna bağlı bloklar programa girer.
import { pythonGenerator } from 'blockly/python';

export const BASLANGIC_BLOGU = 'olay_program_basladiginda';

const SHEBANG = '#!/usr/bin/env pybricks-micropython';
const EV3_IMPORT = 'from pybricks.hubs import EV3Brick';
const IMPORT = /^(from\s+\S+\s+)?import\s+/;

export function pythonKoduUret(calismaAlani) {
  const u = pythonGenerator;
  u.init(calismaAlani);
  let govde = '';
  for (const blok of calismaAlani.getTopBlocks(true)) {
    if (blok.type === BASLANGIC_BLOGU && blok.isEnabled()) govde += u.blockToCode(blok);
  }
  // Blockly'nin değişkenleri "x = None" diye başlatmasını atlıyoruz: öğrenciye gereksiz gürültü.
  const { variables: _degiskenler, ...tanimlar } = u.definitions_;
  u.finish('');

  const ekImportlar = Object.values(tanimlar).filter((t) => IMPORT.test(t)).sort();
  const digerTanimlar = Object.values(tanimlar).filter((t) => !IMPORT.test(t));

  const satirlar = [SHEBANG, EV3_IMPORT, ...ekImportlar, '', 'ev3 = EV3Brick()', ''];
  if (digerTanimlar.length) satirlar.push(...digerTanimlar, '');
  let kod = satirlar.join('\n');
  if (govde) kod += `\n${govde}`;
  return kod;
}
