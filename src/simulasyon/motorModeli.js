// Motorların dönüş modeli. Hem worker'da (sayılan derece bloğu) hem ana sayfada (motorun
// dönmesini çizmek için) kullanılır. Gerçek EV3'e yaklaşık: %100 hız ≈ 1000 °/sn.
export const YUZDE_BASINA_DERECE_SN = 10;
export const TEKER_CEVRESI_CM = Math.PI * 5.6; // EV3 eğitim seti tekerleği

/** Hız yüzdesini °/sn'ye çevirir (−100…100 sınırlanır). */
export const yuzdedenHiz = (yuzde) =>
  Math.max(-100, Math.min(100, Number(yuzde) || 0)) * YUZDE_BASINA_DERECE_SN;

/** Bir hareket miktarını dereceye çevirir. Saniye için null döner. */
export function dereceyeCevir(miktar, birim) {
  const m = Number(miktar) || 0;
  if (birim === 'ROT') return m * 360;
  if (birim === 'DEG') return m;
  if (birim === 'CM') return (m / TEKER_CEVRESI_CM) * 360;
  return null;
}

/** Bir motorun belli bir derece dönmesi kaç milisaniye sürer. */
export function donusSuresiMs(derece, hizDereceSn) {
  const hiz = Math.abs(hizDereceSn);
  return hiz === 0 ? 0 : (Math.abs(derece) / hiz) * 1000;
}

/**
 * EV3 Classroom "dönüş" değerini (−100…100) sol ve sağ motor hızına çevirir.
 * 0 düz, 100 sağa yerinde dönüş, −100 sola yerinde dönüş.
 */
export function donustenHizlar(donus, hiz) {
  const d = Math.max(-100, Math.min(100, Number(donus) || 0));
  const yavas = hiz * (1 - Math.abs(d) / 50);
  return d >= 0 ? { sol: hiz, sag: yavas } : { sol: yavas, sag: hiz };
}

/** Port başına hız ve dönülen derece. simdi(): milisaniye. */
export function motorlarOlustur(simdi = () => Date.now()) {
  const motorlar = {};
  const al = (port) => (motorlar[port] ??= { hiz: 0, t0: simdi(), d0: 0 });
  const derece = (port) => {
    const m = al(port);
    return m.d0 + (m.hiz * (simdi() - m.t0)) / 1000;
  };
  return {
    /** hiz: °/sn */
    hizAyarla(port, hiz) {
      const d = derece(port);
      Object.assign(al(port), { hiz, t0: simdi(), d0: d });
    },
    hiz: (port) => al(port).hiz,
    derece,
    /** Motoru durdurur ve sayılan dereceyi tam değere getirir (süreli dönüş sonunda: enkoder hedefte durur). */
    durdurDerecede(port, d) {
      Object.assign(al(port), { hiz: 0, t0: simdi(), d0: d });
    },
    sifirla(port) {
      Object.assign(al(port), { t0: simdi(), d0: 0 });
    },
    /** Çizim için anlık durum: { A: { hiz, derece } } */
    durum() {
      return Object.fromEntries(Object.keys(motorlar).map((p) => [p, { hiz: motorlar[p].hiz, derece: derece(p) }]));
    },
  };
}
