import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { programCalistir, KILIT_SURESI_MS, EN_UZUN_MS } from '../src/calistirici/calistirici.js';

/** Gerçek Worker yerine elle mesaj gönderdiğimiz sahte worker. */
function sahteIsci() {
  const isci = {
    gelenler: [],
    sonlandirildi: false,
    postMessage: (m) => isci.gelenler.push(m),
    terminate: () => (isci.sonlandirildi = true),
    gonder: (data) => isci.onmessage({ data }),
  };
  return isci;
}

function baslat(ek = {}) {
  const isci = sahteIsci();
  const komutlar = [];
  const calisma = programCalistir('KOD', {
    isciOlustur: () => isci,
    komutGeldi: (k) => komutlar.push(k),
    ...ek,
  });
  let sonuc;
  calisma.sonuc.then((s) => (sonuc = s));
  return { isci, komutlar, calisma, sonuc: () => sonuc };
}

beforeEach(() => vi.useFakeTimers());
afterEach(() => vi.useRealTimers());

describe('çalıştırıcı', () => {
  it('sınırlar: 3 sn kilitlenme, 5 dk toplam', () => {
    expect(KILIT_SURESI_MS).toBe(3000);
    expect(EN_UZUN_MS).toBe(300000);
  });

  it('worker hazır olunca kodu, yavaş çekim ve donanım bilgisiyle gönderir', () => {
    const donanim = { sensorler: { 1: { tur: 'dokunma', basili: false } }, dugmeler: {} };
    const { isci } = baslat({ yavas: true, donanim });
    expect(isci.gelenler).toEqual([]);
    isci.gonder({ tur: 'hazir' });
    expect(isci.gelenler).toEqual([{ tur: 'basla', kod: 'KOD', yavas: true, donanim }]);
  });

  it('toplu komutları sırayla iletir, bitince worker\'ı kapatır', async () => {
    const { isci, komutlar, sonuc } = baslat();
    isci.gonder({ tur: 'hazir' });
    isci.gonder({ tur: 'toplu', komutlar: [{ tur: 'temizle' }, { tur: 'konum', x: 0, y: 0, metin: 'BOS' }] });
    isci.gonder({ tur: 'bitti' });
    await vi.runAllTimersAsync();
    expect(komutlar).toEqual([{ tur: 'temizle' }, { tur: 'konum', x: 0, y: 0, metin: 'BOS' }]);
    expect(sonuc()).toEqual({ durum: 'bitti' });
    expect(isci.sonlandirildi).toBe(true);
  });

  it('nabız geldikçe program sürer (ör. sürekli döngü, uzun bekleme)', async () => {
    const { isci, sonuc } = baslat();
    isci.gonder({ tur: 'hazir' });
    for (let i = 0; i < 40; i++) {
      await vi.advanceTimersByTimeAsync(250);
      isci.gonder({ tur: 'nabiz' });
    }
    expect(sonuc()).toBeUndefined(); // 10 saniye geçti, hâlâ çalışıyor
  });

  it('3 saniye yanıt vermeyen (kilitlenen) worker durdurulur', async () => {
    const { isci, sonuc } = baslat();
    isci.gonder({ tur: 'hazir' });
    await vi.advanceTimersByTimeAsync(KILIT_SURESI_MS - 1);
    expect(sonuc()).toBeUndefined();
    await vi.advanceTimersByTimeAsync(1);
    expect(sonuc()).toEqual({ durum: 'zaman_asimi', sinir: 'kilit' });
    expect(isci.sonlandirildi).toBe(true);
  });

  it('nabız gelse de toplam süre sınırında durur', async () => {
    const { isci, sonuc } = baslat({ enUzunMs: 10000 });
    isci.gonder({ tur: 'hazir' });
    const nabiz = setInterval(() => isci.gonder({ tur: 'nabiz' }), 250);
    await vi.advanceTimersByTimeAsync(9999);
    expect(sonuc()).toBeUndefined();
    await vi.advanceTimersByTimeAsync(1);
    clearInterval(nabiz);
    expect(sonuc()).toEqual({ durum: 'zaman_asimi', sinir: 'toplam' });
  });

  it('açılış süresi sayılmaz; worker hiç hazır olmazsa 10 sn sonra hata', async () => {
    const { sonuc } = baslat();
    await vi.advanceTimersByTimeAsync(9999);
    expect(sonuc()).toBeUndefined();
    await vi.advanceTimersByTimeAsync(1);
    expect(sonuc()).toEqual({ durum: 'hata', mesaj: 'Program başlatılamadı.' });
  });

  it('programdaki hatayı iletir', async () => {
    const { isci, sonuc } = baslat();
    isci.gonder({ tur: 'hazir' });
    isci.gonder({ tur: 'hata', mesaj: 'Konum için x ve y sayı olmalı.' });
    await vi.runAllTimersAsync();
    expect(sonuc()).toEqual({ durum: 'hata', mesaj: 'Konum için x ve y sayı olmalı.' });
  });

  it('ekrana uygulanamayan komutta durur', async () => {
    const { isci, sonuc } = baslat({
      komutGeldi: () => {
        throw new Error('bozuk');
      },
    });
    isci.gonder({ tur: 'hazir' });
    isci.gonder({ tur: 'toplu', komutlar: [{ tur: 'temizle' }] });
    await vi.runAllTimersAsync();
    expect(sonuc()).toEqual({ durum: 'hata', mesaj: 'bozuk' });
    expect(isci.sonlandirildi).toBe(true);
  });

  it('olay bekleyen programı bildirir', () => {
    const dinliyor = vi.fn();
    const { isci } = baslat({ dinliyor });
    isci.gonder({ tur: 'hazir' });
    isci.gonder({ tur: 'dinliyor' });
    expect(dinliyor).toHaveBeenCalledOnce();
  });

  it('sensör değişikliklerini çalışan programa iletir, bittikten sonra iletmez', async () => {
    const { isci, calisma } = baslat();
    isci.gonder({ tur: 'hazir' });
    const donanim = { sensorler: { 4: { tur: 'mesafe', cm: 20 } }, dugmeler: {} };
    calisma.donanimGonder(donanim);
    expect(isci.gelenler.at(-1)).toEqual({ tur: 'donanim', donanim });
    calisma.durdur();
    calisma.donanimGonder(donanim);
    expect(isci.gelenler.filter((m) => m.tur === 'donanim')).toHaveLength(1);
  });

  it('Durdur ile kesilir; sonradan gelen mesajlar yok sayılır', async () => {
    const { isci, komutlar, calisma, sonuc } = baslat();
    isci.gonder({ tur: 'hazir' });
    calisma.durdur();
    isci.gonder({ tur: 'toplu', komutlar: [{ tur: 'temizle' }] });
    isci.gonder({ tur: 'bitti' });
    await vi.runAllTimersAsync();
    expect(sonuc()).toEqual({ durum: 'durduruldu' });
    expect(komutlar).toEqual([]);
  });
});
