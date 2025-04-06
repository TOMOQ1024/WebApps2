export function CountMap<T>(array: T[]): Map<T, number> {
  const map = new Map<T, number>();
  array.forEach((element) => {
    map.set(element, (map.get(element) || 0) + 1);
  });
  return map;
}
