// ギャラリー用のモックデータ型
export interface CompDynamGalleryItem {
  functionLatex: string;
  initialValueLatex: string;
  iterations: number;
  center: [number, number];
  radius: number;
}

const quadraticData: CompDynamGalleryItem[] = [
  {
    functionLatex: "z^2-0.6-0.42i",
    initialValueLatex: "c",
    iterations: 50,
    center: [0, 0],
    radius: 1.7,
  },
  {
    functionLatex: "z^2+0.635i",
    initialValueLatex: "c",
    iterations: 50,
    center: [0, 0],
    radius: 1.5,
  },
  {
    functionLatex: "z^2+0.395+0.2i",
    initialValueLatex: "c",
    iterations: 50,
    center: [0, 0],
    radius: 1.5,
  },
  {
    functionLatex: "z^2-0.123+0.745i",
    initialValueLatex: "c",
    iterations: 50,
    center: [0, 0],
    radius: 1.5,
  },
  {
    functionLatex: "z^2-0.77+0.1i",
    initialValueLatex: "c",
    iterations: 50,
    center: [0, 0],
    radius: 1.7,
  },
  {
    functionLatex: "z^2-1",
    initialValueLatex: "c",
    iterations: 50,
    center: [0, 0],
    radius: 1.8,
  },
  {
    functionLatex: "z^2+i",
    initialValueLatex: "c",
    iterations: 15,
    center: [0, 0],
    radius: 1.5,
  },
  {
    functionLatex: "z^2-1.755",
    initialValueLatex: "c",
    iterations: 50,
    center: [0, 0],
    radius: 2,
  },
  {
    functionLatex: "z^2+z",
    initialValueLatex: "c",
    iterations: 50,
    center: [-0.5, 0],
    radius: 1.5,
  },
  {
    functionLatex: "z^2-z",
    initialValueLatex: "c",
    iterations: 50,
    center: [0.5, 0],
    radius: 1.8,
  },
  {
    functionLatex: "z^2-0.8-0.1i",
    initialValueLatex: "c",
    iterations: 50,
    center: [0, 0],
    radius: 1.8,
  },
  {
    functionLatex: "z^2-z-0.1+0.2i",
    initialValueLatex: "c",
    iterations: 50,
    center: [0.5, 0],
    radius: 1.8,
  },
  {
    functionLatex: "z^2-iz",
    initialValueLatex: "c",
    iterations: 50,
    center: [0, 0.5],
    radius: 1.5,
  },
];

const polynomialData: CompDynamGalleryItem[] = [
  {
    functionLatex: "z^3-i",
    initialValueLatex: "c",
    iterations: 50,
    center: [0, -1 / 6],
    radius: 1.5,
  },
  {
    functionLatex: "iz^2+0.6+0.4i",
    initialValueLatex: "c",
    iterations: 50,
    center: [0, 0],
    radius: 1.7,
  },
  {
    functionLatex: "z^3+0.54+0.2i",
    initialValueLatex: "c",
    iterations: 50,
    center: [0, 0],
    radius: 1.3,
  },
  {
    functionLatex: "z^4+iz^3-iz^2+z",
    initialValueLatex: "c",
    iterations: 50,
    center: [0, 0],
    radius: 1,
  },
  {
    functionLatex: "iz^4+iz^3-iz^2+z",
    initialValueLatex: "c",
    iterations: 50,
    center: [0, 0],
    radius: 1,
  },
];

const rationalData: CompDynamGalleryItem[] = [
  {
    functionLatex: "z^7-\\frac{0.472}{z}",
    initialValueLatex: "c",
    iterations: 50,
    center: [0, 0],
    radius: 1.3,
  },
  {
    functionLatex: "z^5-\\frac{0.385}{z}",
    initialValueLatex: "c",
    iterations: 50,
    center: [0, 0],
    radius: 1.3,
  },
  {
    functionLatex: "z^3-\\frac{0.25}{z}",
    initialValueLatex: "c",
    iterations: 50,
    center: [0, 0],
    radius: 1.3,
  },
  {
    functionLatex: "z^6-\\frac{0.11}{z}",
    initialValueLatex: "c",
    iterations: 50,
    center: [0, 0],
    radius: 1.3,
  },
  {
    functionLatex: "z^5-\\frac{0.1}{z}",
    initialValueLatex: "c",
    iterations: 50,
    center: [0, 0],
    radius: 1.3,
  },
  {
    functionLatex: "z^4-\\frac{0.033}{z}",
    initialValueLatex: "c",
    iterations: 50,
    center: [0, 0],
    radius: 1.3,
  },
  {
    functionLatex: "z^3-\\frac{0.01}{z}",
    initialValueLatex: "c",
    iterations: 50,
    center: [0, 0],
    radius: 1.3,
  },
  {
    functionLatex: "z^2-\\frac{10^{-6}}{z}",
    initialValueLatex: "c",
    iterations: 50,
    center: [0, 0],
    radius: 1.3,
  },
];

const realPeriodicData: CompDynamGalleryItem[] = [
  {
    functionLatex: "\\sin z",
    initialValueLatex: "c",
    iterations: 50,
    center: [0, 0],
    radius: 5,
  },
  {
    functionLatex: "\\cos z",
    initialValueLatex: "c",
    iterations: 50,
    center: [0, 0],
    radius: 5,
  },
  {
    functionLatex: "1.3\\sinh iz",
    initialValueLatex: "c",
    iterations: 50,
    center: [0, 0],
    radius: 5,
  },
];

const imaginaryPeriodicData: CompDynamGalleryItem[] = [
  {
    functionLatex: "\\sinh z",
    initialValueLatex: "c",
    iterations: 50,
    center: [0, 0],
    radius: 5,
  },
  {
    functionLatex: "e^{-z}",
    initialValueLatex: "c",
    iterations: 50,
    center: [-4, 0],
    radius: 9,
  },
];

export const galleryData: CompDynamGalleryItem[] = [
  ...quadraticData,
  ...polynomialData,
  ...rationalData,
  ...realPeriodicData,
  ...imaginaryPeriodicData,
  {
    functionLatex: "z^2+c",
    initialValueLatex: "0",
    iterations: 50,
    center: [-0.5, 0],
    radius: 1.5,
  },
  {
    functionLatex: "e^{\\frac{i\\pi }{4}}\\csc z",
    initialValueLatex: "c",
    iterations: 50,
    center: [0, 0],
    radius: 4,
  },
  {
    functionLatex: "\\frac{\\cos z^2}{9z}",
    initialValueLatex: "c",
    iterations: 50,
    center: [0, 0],
    radius: 3,
  },
  {
    functionLatex: "z+\\tanh z",
    initialValueLatex: "c",
    iterations: 50,
    center: [0, 0],
    radius: 1,
  },
  {
    functionLatex: "z+i\\tanh z",
    initialValueLatex: "c",
    iterations: 50,
    center: [0, 0],
    radius: 2,
  },
  // https://x.com/TOMOQ8192/status/1748551565932216410
];
