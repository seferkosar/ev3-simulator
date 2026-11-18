import { describe, it, expect } from 'vitest';
import { gorevKontrolEt, asciiDisiVarMi } from '../src/seviye/gorevKontrol.js';
import { programOzeti } from '../src/seviye/programOzeti.js';
import { izinliMi, gorevBul } from '../src/seviye/otoparkEkrani.js';
import { ilerlemeYukle, ilerlemeKaydet } from '../src/seviye/ilerleme.js';
import { program, satiraYaz, konumaYaz, metin, sayi, degisken, alanla } from './yardimci.js';

const yaz = (m, x = 0, y = 0) => ({ tur: 'konum', metin: m, x, y });
const TEMIZLE = { tur: 'temizle' };
const BOS_OZET = { atamalar: [], birlestirDegiskenleri: [] };
const kontrol = (no, gunluk, ozet = BOS_OZET) => gorevKontrolEt(no, { gunluk, ozet });

describe('Görev 1: "BOS"', () => {
  it.each(['BOS', 'bos', '  Bos '])('"%s" kabul edilir (büyük/küçük harf ve boşluk fark etmez)', (m) => {
    expect(kontrol(1, [yaz(m)]).basarili).toBe(true);
  });
  it('tam eşleşme gerekir: "BOS YER" kabul edilmez', () => {
    expect(kontrol(1, [yaz('BOS YER')])).toEqual({
      basarili: false,
      mesaj: 'Ekranda "BOS" bekleniyordu, "BOS YER" yazıldı.',
    });
  });
  it('boş ekran', () => {
    expect(kontrol(1, []).mesaj).toBe('Ekrana hiçbir şey yazılmadı.');
  });
});

describe('Görev 2: temizle, sonra "DOLU"', () => {
  it('temizle → DOLU', () => {
    expect(kontrol(2, [yaz('BOS'), TEMIZLE, yaz('DOLU')]).basarili).toBe(true);
  });
  it('temizlemeden DOLU', () => {
    expect(kontrol(2, [yaz('DOLU')]).mesaj).toBe('"DOLU" yazmadan önce ekranı temizle.');
  });
  it('DOLU, temizle, DOLU da geçerli', () => {
    expect(kontrol(2, [yaz('DOLU'), TEMIZLE, yaz('DOLU')]).basarili).toBe(true);
  });
  it('DOLU yazıp sonra temizlemek yetmez', () => {
    expect(kontrol(2, [yaz('DOLU'), TEMIZLE]).basarili).toBe(false);
  });
});

describe('Görev 3: değişken + birleştir', () => {
  const tam = { atamalar: [{ ad: 'bos_yer', deger: '5' }], birlestirDegiskenleri: ['bos_yer'] };
  it('değişken, birleştir ve doğru yazı', () => {
    expect(kontrol(3, [yaz('Bos yer: 5')], tam).basarili).toBe(true);
  });
  it('yazıyı elle yazmak yetmez (değişken yok)', () => {
    expect(kontrol(3, [yaz('Bos yer: 5')]).mesaj).toContain('bos_yer adında bir değişken oluştur');
  });
  it('değişken var ama değeri 5 değil', () => {
    const ozet = { ...tam, atamalar: [{ ad: 'bos_yer', deger: '4' }] };
    expect(kontrol(3, [yaz('Bos yer: 4')], ozet).mesaj).toBe('bos_yer değişkeninin değerini 5 yap.');
  });
  it('değişken birleştir bloğunda kullanılmamış', () => {
    const ozet = { ...tam, birlestirDegiskenleri: [] };
    expect(kontrol(3, [yaz('Bos yer: 5')], ozet).mesaj).toContain('birleştir bloğuyla');
  });
});

describe('Görev 4: hedef kutusu', () => {
  const { hedef } = gorevBul(4);
  it('kutunun içine konumlu yazı', () => {
    expect(kontrol(4, [yaz('P', hedef.x, hedef.y)]).basarili).toBe(true);
    expect(kontrol(4, [yaz('P', hedef.x + hedef.genislik - 1, hedef.y + hedef.yukseklik - 1)]).basarili)
      .toBe(true);
  });
  it('kutunun dışı; mesajda öğrencinin 1\'den başlayan koordinatı', () => {
    const sonuc = kontrol(4, [yaz('P', hedef.x + hedef.genislik, hedef.y)]);
    expect(sonuc.basarili).toBe(false);
    expect(sonuc.mesaj).toContain(`(${hedef.x + hedef.genislik + 1}, ${hedef.y + 1})`);
  });
  it('satıra yaz (x = 0) sayılmaz', () => {
    expect(kontrol(4, [yaz('P', 0, hedef.y)]).mesaj).toBe('Bir yazıyı "konuma yaz" bloğuyla yaz.');
  });
});

describe('program özeti (gerçek bloklardan)', () => {
  const v = { variables: [{ name: 'bos_yer', id: 'v1' }] };
  const atama = (deger) => ({ type: 'variables_set', fields: { VAR: { id: 'v1' } }, inputs: { VALUE: deger } });

  it('değişken ataması ve birleştirdeki değişken', () => {
    const ozet = alanla(
      program(
        [atama(sayi(5)), satiraYaz({ type: 'op_birlestir', inputs: { A: metin('Bos yer: '), B: degisken('v1') } })],
        v,
      ),
      programOzeti,
    );
    expect(ozet).toEqual({ atamalar: [{ ad: 'bos_yer', deger: '5' }], birlestirDegiskenleri: ['bos_yer'] });
  });

  it('"program başladığında" bloğuna bağlı olmayanlar sayılmaz', () => {
    const ozet = alanla(
      { ...v, blocks: { languageVersion: 0, blocks: [{ type: 'olay_program_basladiginda' }, { ...atama(sayi(5)), x: 300 }] } },
      programOzeti,
    );
    expect(ozet.atamalar).toEqual([]);
  });

  it('Görev 3 uçtan uca: bloklar → özet → kontrol', () => {
    const ozet = alanla(
      program(
        [atama(sayi(5)), satiraYaz({ type: 'op_birlestir', inputs: { A: metin('Bos yer: '), B: degisken('v1') } })],
        v,
      ),
      programOzeti,
    );
    expect(kontrol(3, [yaz('Bos yer: 5')], ozet).basarili).toBe(true);
  });
});

describe('görevde izinli bloklar', () => {
  it('Görev 1: konuma yaz ve değişkenler izinli değil, değer ovalleri her zaman izinli', () => {
    expect(izinliMi('ekran_satira_yaz', 1)).toBe(true);
    expect(izinliMi('ekran_konuma_yaz', 1)).toBe(false);
    expect(izinliMi('variables_set', 1)).toBe(false);
    expect(izinliMi('motor_baslat', 1)).toBe(false);
    expect(izinliMi('ev3_metin', 1)).toBe(true);
  });
  it('Görev 4: hepsi açık', () => {
    for (const tur of ['ekran_konuma_yaz', 'variables_set', 'variables_get', 'op_birlestir']) {
      expect(izinliMi(tur, 4)).toBe(true);
    }
  });
});

describe('ASCII uyarısı', () => {
  it('Türkçe harf varsa uyarır', () => {
    expect(asciiDisiVarMi([yaz('BOŞ')])).toBe(true);
    expect(asciiDisiVarMi([yaz('BOS'), TEMIZLE])).toBe(false);
  });
});

describe('ilerleme (yalnızca tarayıcıda)', () => {
  const sahteDepo = () => {
    const veri = new Map();
    return { getItem: (k) => veri.get(k) ?? null, setItem: (k, v) => veri.set(k, v) };
  };

  it('kaydedilen görevler geri yüklenir', () => {
    const depo = sahteDepo();
    expect(ilerlemeKaydet(new Set([2, 1]), depo)).toBe(true);
    expect([...ilerlemeYukle(depo)]).toEqual([1, 2]);
  });

  it('depo yoksa ya da hata verirse oyun çalışmaya devam eder', () => {
    const bozuk = { getItem: () => { throw new Error('kapalı'); }, setItem: () => { throw new Error('kapalı'); } };
    expect(ilerlemeYukle(bozuk).size).toBe(0);
    expect(ilerlemeKaydet(new Set([1]), bozuk)).toBe(false);
    expect(ilerlemeYukle(null).size).toBe(0);
  });

  it('bozuk veri yok sayılır', () => {
    const depo = sahteDepo();
    depo.setItem('ev3-simulator:otopark-ekrani:ilerleme', '{bozuk');
    expect(ilerlemeYukle(depo).size).toBe(0);
  });
});
