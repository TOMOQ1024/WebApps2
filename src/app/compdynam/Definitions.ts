export enum ControlsTab {
  EXPRESSION,
  PRESETS,
  SETTINGS
}

export enum RenderingMode {
  HSV,
  GRAYSCALE
}

export const PresetExpressions = [
  'z^2-.6-.42i',
  'z^2+.635i',
  'z^2+.395+.2i',
  'z^3+.54+.2i',
  'exp(-z)',
  'exp(i-z)+z',
  'cos(z)',
  'sin(z)',
  'sinh(z)',
  'exp(sin(z+0.01+0.2i))',
  'exp(sinz+0.01+0.2i)',
  'cosz+sinz',
];
