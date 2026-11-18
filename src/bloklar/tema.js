// Kategori renkleri (blok resimlerindeki renklere yakın) ve koyu editör teması.
import * as Blockly from 'blockly/core';

export const RENKLER = {
  motorlar: '#4C97FF',
  hareket: '#E45FC8',
  ekran: '#8A5CF5',
  ses: '#B77CE3',
  olaylar: '#E9BF3B',
  kontrol: '#F0B03C',
  sensorler: '#5BC6EC',
  operatorler: '#59C059',
  degiskenler: '#F7973F',
  bloklarim: '#EC5B67',
  arama: '#9aa0a6',
};

const stil = (renk) => ({ colourPrimary: renk });

export const EV3_TEMASI = Blockly.Theme.defineTheme('ev3', {
  base: Blockly.Themes.Classic,
  blockStyles: {
    motor_blocks: stil(RENKLER.motorlar),
    hareket_blocks: stil(RENKLER.hareket),
    ekran_blocks: stil(RENKLER.ekran),
    ses_blocks: stil(RENKLER.ses),
    olay_blocks: stil(RENKLER.olaylar),
    kontrol_blocks: stil(RENKLER.kontrol),
    sensor_blocks: stil(RENKLER.sensorler),
    operator_blocks: stil(RENKLER.operatorler),
    variable_blocks: stil(RENKLER.degiskenler),
    procedure_blocks: stil(RENKLER.bloklarim),
    deger_blocks: { colourPrimary: '#ffffff', colourSecondary: '#ffffff', colourTertiary: '#c8c8c8' },
  },
  categoryStyles: Object.fromEntries(
    Object.entries(RENKLER).map(([ad, renk]) => [`${ad}_kategori`, { colour: renk }]),
  ),
  componentStyles: {
    workspaceBackgroundColour: '#1f2023',
    toolboxBackgroundColour: '#2a2b2f',
    toolboxForegroundColour: '#e8e8e8',
    flyoutBackgroundColour: '#33353a',
    flyoutForegroundColour: '#e8e8e8',
    flyoutOpacity: 0.97,
    scrollbarColour: '#666a70',
    insertionMarkerColour: '#ffffff',
    insertionMarkerOpacity: 0.3,
    cursorColour: '#ffffff',
  },
  fontStyle: { family: 'system-ui, sans-serif', weight: '600', size: 12 },
  startHats: true,
});
