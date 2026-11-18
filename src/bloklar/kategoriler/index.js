// Kategoriler araç kutusundaki sırayla.
import motorlar from './motorlar.js';
import hareket from './hareket.js';
import ekran from './ekran.js';
import ses from './ses.js';
import olaylar from './olaylar.js';
import kontrol from './kontrol.js';
import sensorler from './sensorler.js';
import operatorler from './operatorler.js';
import degerler from './degerler.js';

/** Araç kutusunda blok listesiyle görünen kategoriler. */
export const BLOK_KATEGORILERI = [motorlar, hareket, ekran, ses, olaylar, kontrol, sensorler, operatorler];

/** Blockly'ye kaydedilecek her şey (gölge değer blokları dahil). */
export const TUM_KATEGORILER = [...BLOK_KATEGORILERI, degerler];
