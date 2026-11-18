import { describe, it, expect } from 'vitest';
import * as Blockly from 'blockly';

describe('iskelet', () => {
  it('Blockly yüklenir', () => {
    expect(typeof Blockly.inject).toBe('function');
  });
});
