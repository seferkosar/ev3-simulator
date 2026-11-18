import { describe, it, expect } from 'vitest';
import '../src/bloklar/blocklyKurulum.js';
import { blokAra } from '../src/bloklar/blokAra.js';
import { donanimiBul } from '../src/simulasyon/donanimBul.js';
import { COZUMLER, GOREVLER, SERBEST, gorevBul, izinliMi, aracKutusu } from '../src/seviye/otoparkEkrani.js';
import { jsKoduUret } from '../src/bloklar/jsKodu.js';
import { programiYurut } from '../src/calistirici/yurutucu.js';
import { ekranOlustur, komutuUygula } from '../src/ekran/ekranModeli.js';
import { gorevKontrolEt } from '../src/seviye/gorevKontrol.js';
import { programOzeti } from '../src/seviye/programOzeti.js';
import { alanla } from './yardimci.js';

describe('blok arama', () => {
  const hepsiAcik = () => true;
  it('Türkçe yazıyla bulur', () => {
    const turler = blokAra('yaz', hepsiAcik).map((o) => o.type);
    expect(turler).toEqual(expect.arrayContaining(['ekran_satira_yaz', 'ekran_konuma_yaz']));
  });
  it('İngilizce (EV3 Classroom) adıyla bulur', () => {
    expect(blokAra('clear display', hepsiAcik).map((o) => o.type)).toEqual(['ekran_temizle']);
  });
  it('büyük/küçük harf ve Türkçe harfler', () => {
    expect(blokAra('EKRANI TEMİZLE', hepsiAcik).map((o) => o.type)).toContain('ekran_temizle');
  });
  it('açılır liste seçenekleriyle bulur', () => {
    expect(blokAra('kırmızı', hepsiAcik).map((o) => o.type)).toContain('sensor_renk_mi');
  });
  it('görevde kapalı bloklar gri döner', () => {
    const sonuc = blokAra('motor', (t) => izinliMi(t, 1));
    expect(sonuc.length).toBeGreaterThan(0);
    expect(sonuc.every((o) => o.disabledReasons)).toBe(true);
  });
  it('boş sorgu boş sonuç', () => {
    expect(blokAra('  ', hepsiAcik)).toEqual([]);
  });
});

describe('donanım bulma (simülatörde porta bağlanacaklar)', () => {
  const b = (type, alanlar = {}) => ({ type, alanlar });
  it('motor ve sensörler portlarıyla', () => {
    expect(
      donanimiBul([
        b('motor_baslat', { PORT: 'A' }),
        b('sensor_renk', { PORT: '3' }),
        b('olay_dokunma', { PORT: '1' }),
        b('sensor_mesafe', { PORT: '4' }),
        b('sensor_aci', { PORT: '2' }),
      ]),
    ).toEqual({ motorlar: ['A'], sensorler: { 1: 'dokunma', 2: 'jiroskop', 3: 'renk', 4: 'mesafe' }, cakismalar: [] });
  });
  it('hareket blokları B ve C motorlarını ekler; hareket motorları bloğu değiştirir', () => {
    expect(donanimiBul([b('hareket_durdur')]).motorlar).toEqual(['B', 'C']);
    expect(donanimiBul([b('hareket_durdur'), b('hareket_motorlari', { SOL: 'A', SAG: 'D' })]).motorlar).toEqual(['A', 'D']);
  });
  it('aynı porta iki farklı sensör çakışma olarak bildirilir', () => {
    expect(donanimiBul([b('sensor_renk', { PORT: '1' }), b('sensor_dokunma_mi', { PORT: '1' })]).cakismalar).toEqual(['1']);
  });
});

describe('serbest çalışma', () => {
  it('bütün bloklar açık, değişkenler açık', () => {
    expect(gorevBul(0)).toBe(SERBEST);
    expect(izinliMi('motor_baslat', 0)).toBe(true);
    expect(izinliMi('variables_set', 0)).toBe(true);
    const kapali = aracKutusu(0).contents.flatMap((k) => k.contents ?? []).filter((o) => o.disabledReasons);
    expect(kapali).toEqual([]);
  });
});

describe('görev çözümleri', () => {
  it.each(GOREVLER.map((g) => [g.no]))('Görev %i çözümü görev kontrolünden geçer', async (no) => {
    const durum = COZUMLER[no];
    const kod = alanla(durum, jsKoduUret);
    const ozet = alanla(durum, programOzeti);
    const ekran = ekranOlustur();
    await programiYurut(
      kod,
      (m) => m.tur === 'toplu' && m.komutlar.forEach((k) => ['temizle', 'konum', 'resim'].includes(k.tur) && komutuUygula(ekran, k)),
      { bekle: async () => {} },
    );
    expect(gorevKontrolEt(no, { gunluk: ekran.gunluk(), ozet }).basarili).toBe(true);
  });
});
