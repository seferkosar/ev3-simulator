// Blokların solundaki beyaz simgeler. Bu proje için çizilmiş basit SVG'ler.

const svg = (icerik) =>
  'data:image/svg+xml,' +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" ` +
      `stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${icerik}</svg>`,
  );

const nokta = (x, y, r = 1.6) => `<circle cx="${x}" cy="${y}" r="${r}" fill="#fff" stroke="none"/>`;

export const SIMGE = {
  // Motor: tekerlek göbeği
  motor: svg(`<circle cx="12" cy="12" r="9"/>${nokta(12, 7)}${nokta(12, 17)}${nokta(7, 12)}${nokta(17, 12)}`),
  // Hareket: iki tekerlek
  hareket: svg(`<circle cx="9" cy="12" r="6"/><circle cx="16" cy="12" r="6"/>`),
  // Tuğla: ekranlı kutu
  tugla: svg(`<rect x="6" y="2.5" width="12" height="19" rx="2"/><rect x="8.5" y="5" width="7" height="5" rx="0.5"/>${nokta(12, 15.5)}`),
  // Program başlangıcı
  oynat: svg(`<path d="M8 5 L19 12 L8 19 Z" fill="#fff"/>`),
  // Renk sensörü: göz bebeği
  renk: svg(`<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="3.5"/>${nokta(12, 12, 1.2)}`),
  // Mesafe sensörü: iki "göz"
  mesafe: svg(`<circle cx="7" cy="12" r="4.5"/><circle cx="17" cy="12" r="4.5"/>${nokta(7, 12)}${nokta(17, 12)}`),
  // Jiroskop: dönen yaylar
  jiroskop: svg(`<path d="M7 6 A8 8 0 0 0 7 18"/><path d="M17 6 A8 8 0 0 1 17 18"/>${nokta(12, 12, 2.4)}`),
  // Dokunma sensörü: basma düğmesi
  dokunma: svg(`<rect x="4" y="4" width="16" height="16" rx="4"/><path d="M12 8 V16 M8 12 H16"/>`),
};
