export function IsIn(
  x: number,
  y: number,
  l: number,
  t: number,
  w: number,
  h: number
) {
  if (x < l) return false;
  if (y < t) return false;
  if (l + w <= x) return false;
  if (t + h <= y) return false;

  return true;
}
