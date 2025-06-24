export type GalleryTag = "maths" | "fractal" | "geometry";

/**
 * ギャラリーのリスト
 *
 * `galleryName`の定義されているものが 1 つのページに対応し，そこに至るまでの階層がそのページのパスになる
 * `galleryName`が定義されていないものはギャラリーではなくページ一覧のページに対応する
 */
export const galleryList = {
  compdynam: {
    galleryName: "CompDynam",
    tags: new Set(["maths"]),
  },
} as {
  [path: string]: {
    galleryName: string;
    description?: string;
    tags: Set<GalleryTag>;
  };
};
