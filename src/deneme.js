// Geçici deneme sayfası: ekran modelini ve çiziciyi elle denemek için.
import { ekranOlustur } from './ekran/ekranModeli.js';
import { ciziciOlustur } from './ekran/ekranCizici.js';

const $ = (id) => document.getElementById(id);

const cizici = ciziciOlustur($('ekran'));
let ekran = ekranOlustur();

function gunlukSatiri(g) {
  if (g.tur === 'temizle') return 'temizle';
  if (g.tur === 'yaz') return `yaz "${g.metin}"`;
  return `konum (${g.x}, ${g.y}) "${g.metin}"`;
}

function yenile() {
  cizici.ciz(ekran.ogeler());
  $('gunluk').replaceChildren(
    ...ekran.gunluk().map((g) => {
      const li = document.createElement('li');
      li.textContent = gunlukSatiri(g);
      return li;
    }),
  );
}

function calistir(islem) {
  $('hata').textContent = '';
  try {
    islem();
  } catch (hata) {
    $('hata').textContent = hata.message;
  }
  yenile();
}

$('yaz').onclick = () => calistir(() => ekran.print($('yaz-metin').value));
$('konum').onclick = () =>
  calistir(() =>
    ekran.draw_text(
      $('konum-x').valueAsNumber,
      $('konum-y').valueAsNumber,
      $('konum-metin').value,
    ),
  );
$('temizle').onclick = () => calistir(() => ekran.clear());
$('sifirla').onclick = () => calistir(() => (ekran = ekranOlustur()));

yenile();
