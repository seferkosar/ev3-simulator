// "Görevler" açılır menüsü. Bölümler:
//   1) Otopark Ekranı görevleri (Görev 1–4): tıklanınca doğrudan açılır, tamamlananlarda ✓.
//   2) Etkinlikler (EV3 çalışma sitesinden seçmeler) ve 3) öğretim programının 3 seviye × 16 haftalık dersleri:
//      tıklanınca bilgi penceresi açılır; "Örnek programı yükle" ya da "Boş çalışma alanıyla başla".
const ROZET = {
  calisiyor: ['✓ Simülasyonda çalışıyor', 'calisiyor'],
  kismen: ['◐ Kısmen çalışıyor', 'kismen'],
  kodsuz: ['Kodsuz hafta', 'kodsuz'],
};

const el = (etiket, ozellik = {}, ...cocuk) => {
  const e = document.createElement(etiket);
  for (const [k, v] of Object.entries(ozellik)) {
    if (k === 'class') e.className = v;
    else e.setAttribute(k, v);
  }
  e.append(...cocuk);
  return e;
};

/** Ders ya da etkinliği pencere için ortak biçime çevirir. */
function pencereBilgisi(d) {
  if (d.etkinlik) {
    return {
      ust: `Etkinlik · ${d.grup} · EV3 çalışma sitesi, konu ${d.konu}`,
      durum: d.uyarlama ? `${ROZET.calisiyor[0]}. Uyarlama: ${d.uyarlama}` : ROZET.calisiyor[0],
      satirlar: [
        ['Ne yapıyor?', d.aciklama],
        ['Simülasyonda', `${d.mod === 'sahne' ? 'Sahne sekmesinde çalışır.' : 'Robot sekmesinde (elle sensörlerle) çalışır.'} ${d.ipucu}`],
        ['Geliştir', d.gelistir],
      ],
    };
  }
  const [etiket] = ROZET[d.durum];
  return {
    ust: `Seviye ${d.seviye} · Hafta ${d.hafta}${d.proje ? ' · Proje haftası' : ''}`,
    durum: d.durumNotu ? `${etiket}: ${d.durumNotu}` : etiket,
    satirlar: [
      ['Kazanım', d.kazanim],
      ['Disiplinler', d.disiplin],
      ['Anlatım önerisi', d.anlatim],
      ['Yaygın yanılgı', d.yanilgi || '—'],
      ['Simülasyonda', [
        d.kodlu ? (d.mod === 'sahne' ? 'Sahne sekmesinde çalışır.' : 'Robot sekmesinde (elle sensörlerle) çalışır.') : '',
        d.ipucu,
        d.ekNot,
      ].filter(Boolean).join(' ')],
    ],
  };
}

export function dersMenusuOlustur({ menu, liste, pencere, alanlar, gorevler, etkinlikler, seviyeler, dersSecildi }) {
  const listeDugmesi = (ozellik, sol, ad, rozet, tikla) => {
    const dugme = el('button', { type: 'button', ...ozellik }, el('span', { class: 'hafta' }, sol), el('span', { class: 'ad' }, ad), rozet);
    dugme.onclick = () => {
      menu.open = false;
      tikla();
    };
    return el('li', {}, dugme);
  };

  function listele() {
    const g = gorevler();
    liste.replaceChildren(
      el(
        'section',
        {},
        el('h3', {}, g.baslik),
        el('p', { class: 'seviye-alt' }, g.alt),
        el('ol', {}, ...g.ogeler.map((o) =>
          listeDugmesi(
            { 'data-gorev': o.no, ...(o.secili && { 'aria-current': 'true' }) },
            `G${o.no}`,
            o.metin,
            el('span', { class: `rozet ${o.tamam ? 'calisiyor' : 'kodsuz'}` }, o.tamam ? '✓ Tamamlandı' : 'Görev'),
            o.sec,
          ))),
      ),
      el(
        'section',
        {},
        el('h3', {}, `${etkinlikler.ad} (${etkinlikler.etkinlikler.length})`),
        el('p', { class: 'seviye-alt' }, etkinlikler.alt),
        ...etkinlikler.gruplar.flatMap((g) => [
          el('h4', { class: 'etkinlik-grubu' }, g),
          el('ol', {}, ...etkinlikler.etkinlikler.filter((e) => e.grup === g).map((e) =>
            listeDugmesi(
              { 'data-ders': e.anahtar },
              `K${e.konu}`,
              e.baslik,
              el('span', { class: 'rozet calisiyor' }, e.mod === 'sahne' ? '✓ Sahnede' : '✓ Robotta'),
              () => goster(e),
            ))),
        ]),
      ),
      ...seviyeler.map((s) =>
        el(
          'section',
          {},
          el('h3', {}, `Seviye ${s.no} · ${s.ad}`),
          el('p', { class: 'seviye-alt' }, s.alt),
          el('ol', {}, ...s.dersler.map((d) => {
            const [etiket, sinif] = ROZET[d.durum];
            return listeDugmesi(
              { 'data-ders': d.anahtar },
              `H${d.hafta}`,
              d.proje ? `${d.baslik} (proje)` : d.baslik,
              el('span', { class: `rozet ${sinif}` }, etiket),
              () => goster(d),
            );
          })),
        ),
      ),
    );
  }
  // Liste menü her açıldığında kurulur (tamamlanan görevler güncel olsun).
  menu.addEventListener('toggle', () => menu.open && listele());

  menu.addEventListener('keydown', (o) => {
    if (o.key === 'Escape' && menu.open) {
      menu.open = false;
      menu.querySelector('summary').focus();
    }
  });
  document.addEventListener('click', (o) => {
    if (menu.open && !menu.contains(o.target)) menu.open = false;
  });

  let secili = null;
  function goster(d) {
    secili = d;
    const b = pencereBilgisi(d);
    alanlar.ust.textContent = b.ust;
    alanlar.baslik.textContent = d.baslik;
    alanlar.durum.textContent = b.durum;
    alanlar.bilgi.replaceChildren(...b.satirlar.flatMap(([dt, dd]) => [el('dt', {}, dt), el('dd', {}, dd)]));
    const kodlu = d.etkinlik || d.kodlu;
    alanlar.yukle.hidden = !kodlu;
    alanlar.bos.hidden = !kodlu;
    pencere.returnValue = '';
    pencere.showModal();
  }

  pencere.addEventListener('close', () => {
    if (secili && (pencere.returnValue === 'yukle' || pencere.returnValue === 'bos')) {
      dersSecildi(secili, pencere.returnValue === 'yukle');
    }
  });

  return { goster, listele };
}
