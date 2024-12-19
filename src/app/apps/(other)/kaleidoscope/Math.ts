export function generateUniform(
  ma: number,
  mb: number,
  mc: number
): { [k: string]: any } {
  const cv = Math.sign(mb * mc + mc * ma + ma * mb - ma * mb * mc);
  return {
    ma: ma,
    mb: mb,
    mc: mc,
    cv: cv,
    cr: 1 / Math.sqrt(Math.abs(cv)),
  };
}
