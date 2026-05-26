export function moneyINR(n: number) {
  const val = Number.isFinite(Number(n)) ? Number(n) : 0;
  return new Intl.NumberFormat("en-IN").format(val);
}
