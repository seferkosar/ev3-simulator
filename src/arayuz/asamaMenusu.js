// "Aşamalar" açılır menüsü: Robot Yolculuğu oyununun 9 dünyası ve 26 aşaması.
// Bir aşamaya tıklanınca hikâye ve kullanılacak bloklar penceresi açılır; "Başla" sahneyi kurar.
const el = (etiket, ozellik = {}, ...cocuk) => {
  const e = document.createElement(etiket);
  for (const [k, v] of Object.entries(ozellik)) {
    if (k === 'class') e.className = v;
    else e.setAttribute(k, v);
  }
  e.append(...cocuk);
  return e;
};
const yildizMetni = (n) => '★'.repeat(n) + '☆'.repeat(3 - n);

export function asamaMenusuOlustur({ menu, liste, pencere, alanlar, dunyalar, yildizlar, asamaSecildi }) {
  function listele() {
    const kazanilan = yildizlar();
    liste.replaceChildren(
      ...dunyalar.map((d) =>
        el(
          'section',
          {},
          el('h3', {}, `Dünya ${d.no} · ${d.ad}`),
          el('p', { class: 'seviye-alt' }, `${d.alt} (${d.kavram})`),
          el(
            'ol',
            {},
            ...d.asamalar.map((a) => {
              const y = kazanilan[a.anahtar] ?? 0;
              const dugme = el(
                'button',
                { type: 'button', 'data-asama': a.anahtar },
                el('span', { class: 'hafta' }, `${a.no}.`),
                el('span', { class: 'ad' }, a.hataAvi ? `${a.baslik} (hata avı)` : a.baslik),
                el('span', { class: `rozet ${y ? 'calisiyor' : 'kodsuz'}`, title: `${y} yıldız` }, yildizMetni(y)),
              );
              dugme.onclick = () => {
                menu.open = false;
                goster(a);
              };
              return el('li', {}, dugme);
            }),
          ),
        ),
      ),
    );
  }
  listele();
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
  function goster(a) {
    secili = a;
    alanlar.ust.textContent = `Robot Yolculuğu · Aşama ${a.no} / 26`;
    alanlar.baslik.textContent = a.baslik;
    alanlar.hikaye.textContent = a.hikaye;
    alanlar.bloklar.replaceChildren(...a.bloklar.map((b) => el('li', {}, b)));
    alanlar.hedef.textContent = `${a.par} blok ya da daha az: 3 yıldız. ${a.par + 2} blok ya da daha az: 2 yıldız.`;
    alanlar.not.textContent = a.hataAvi
      ? 'Hata avı: hatalı program çalışma alanına yüklenecek. Önce çalıştır, sonra hatayı bul.'
      : '';
    pencere.returnValue = '';
    pencere.showModal();
  }
  pencere.addEventListener('close', () => {
    if (secili && pencere.returnValue === 'basla') asamaSecildi(secili);
  });

  return { goster, listele };
}
