// Editörün altındaki konsol: bilgi, başarı ve hata satırları.
const EN_FAZLA_SATIR = 200;

export function konsolOlustur(liste) {
  function ekle(metin, tur) {
    const satir = document.createElement('li');
    if (tur) satir.className = tur;
    const saat = document.createElement('time');
    saat.textContent = new Date().toLocaleTimeString('tr-TR');
    satir.append(saat, metin);
    liste.append(satir);
    while (liste.children.length > EN_FAZLA_SATIR) liste.firstElementChild.remove();
    satir.scrollIntoView({ block: 'nearest' });
  }

  return {
    bilgi: (metin) => ekle(metin, ''),
    basari: (metin) => ekle(metin, 'basari'),
    hata: (metin) => ekle(metin, 'hata'),
    uyari: (metin) => ekle(metin, 'uyari'),
    ipucu: (metin) => ekle(metin, 'ipucu'),
    temizle: () => liste.replaceChildren(),
  };
}
