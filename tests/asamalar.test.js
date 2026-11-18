// Robot Yolculuğu aşamaları: her aşamanın örnek çözümü sahnede görevi tamamlıyor mu?
// Hata avı aşamalarının hazır (hatalı) programı ise tamamlamamalı.
import { describe, it, expect } from 'vitest';
import { ASAMA_GORUNUMU, asamaCozumu, asamaBaslangici, asamaSahnesiniAl } from '../src/asamalar/asamalar.js';
import { asamaKontrol } from '../src/asamalar/asamaSahnesi.js';
import { ASAMALAR } from '../src/asamalar/asamaVerisi.js';
import { pythonKoduUret } from '../src/bloklar/pythonKodu.js';
import { programiCalistir } from './dersCalistirici.js';
import { alanla } from './yardimci.js';
import { spawnSync } from 'node:child_process';

const tumu = ASAMA_GORUNUMU.flatMap((d) => d.asamalar);

describe('Robot Yolculuğu aşamaları', () => {
  it('26 aşama, 9 dünya', () => {
    expect(tumu).toHaveLength(26);
    expect(ASAMA_GORUNUMU).toHaveLength(9);
    expect(tumu.map((a) => a.id)).toEqual(ASAMALAR.map((a) => a.id));
  });

  for (const a of tumu) {
    it(`${a.no}. ${a.baslik}: çözüm görevi tamamlar`, async () => {
      const s = await programiCalistir(asamaCozumu(a), asamaSahnesiniAl(a), { limitSn: 120 });
      expect(s.hata).toBeNull();
      const k = asamaKontrol(a, s.robot);
      expect(k.mesaj).toBe('Görev tamam! Robot bayrağa vardı.');
      expect(s.robot.carpti).toBe(false);
      expect(s.sureDoldu).toBe(false);
    });
  }

  for (const a of tumu.filter((x) => x.hataAvi)) {
    it(`${a.no}. ${a.baslik}: hazır hatalı program görevi tamamlamaz`, async () => {
      const s = await programiCalistir(asamaBaslangici(a), asamaSahnesiniAl(a), { limitSn: 60 });
      expect(asamaKontrol(a, s.robot).basarili).toBe(false);
    });
  }

  const python = spawnSync('python3', ['--version']).status === 0;
  it.skipIf(!python)('bütün çözümlerin Python kodu derlenir', () => {
    for (const a of tumu) {
      const kod = alanla(asamaCozumu(a), pythonKoduUret);
      const r = spawnSync('python3', ['-c', 'import sys; compile(sys.stdin.read(), "asama.py", "exec")'], { input: kod });
      expect(r.status, `${a.baslik}\n${kod}\n${r.stderr}`).toBe(0);
    }
  });
});

describe('aşama yıldız sınırı', () => {
  it('örnek çözüm 3 yıldız alır (sayfadaki blok sayımıyla)', async () => {
    const { BASLANGIC_BLOGU } = await import('../src/bloklar/pythonKodu.js');
    for (const a of tumu) {
      const sayi = alanla(asamaCozumu(a), (ws) =>
        ws.getAllBlocks(false).filter((b) => !b.isShadow() && !b.outputConnection && b.type !== BASLANGIC_BLOGU).length);
      expect(sayi, a.baslik).toBeLessThanOrEqual(a.par);
    }
  });
});
