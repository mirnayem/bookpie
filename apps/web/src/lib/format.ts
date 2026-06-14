const banglaDigits = new Intl.NumberFormat("bn-BD", {
  maximumFractionDigits: 0,
});

export function formatTaka(value: number) {
  return `${banglaDigits.format(value)}৳`;
}

export function formatDiscount(percent: number) {
  return `${banglaDigits.format(percent)}% OFF`;
}
