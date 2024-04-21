export enum COLORS {
  LR, NR, DR,
  LY, NY, DY,
  LG, NG, DG,
  LC, NC, DC,
  LB, NB, DB,
  LM, NM, DM,
  W, K,
};

export const Colors = [
  '#ffc0c0', '#ff0000', '#c00000',
  '#ffffc0', '#ffff00', '#c0c000',
  '#c0ffc0', '#00ff00', '#00c000',
  '#c0ffff', '#00ffff', '#00c0c0',
  '#c0c0ff', '#0000ff', '#0000c0',
  '#ffc0ff', '#ff00ff', '#c000c0',
  '#ffffff', '#000000', '#ffc0c0'
];

export const Operations = [
  '*', 'push', 'pop',
  'add', 'sub', 'mul',
  'div', 'mod', 'not',
  'great', 'point', 'switch',
  'dup', 'roll', 'in(n)',
  'in(c)', 'out(n)', 'out(c)',
  'white', 'black', ''
];

export enum ControlsTab {
  EXPRESSION,
  PRESETS,
  SETTINGS
};

export enum TOOLS {
  HAND,
  PENCIL,
  BUCKET
};

export const Tools = [
  'hand',
  'pencil',
  'bucket',
];

export const Runner = [
  'reset',
  'run',
  'step',
  // 'stop',
] as const;

export type runner = (typeof Runner)[number];

export const isIn = (x: number, y: number, w: number, h: number) => {
  if (x < 0 || y < 0) return false;
  if (w <= x || h <= y) return false;
  return true;
}
