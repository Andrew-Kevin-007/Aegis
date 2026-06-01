export function formatCurrency(amount: number, currency: string = "GBP"): string {
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: currency.toUpperCase(),
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch (e) {
    // Fallback if currency code is invalid or missing
    return `£${amount.toFixed(2)}`;
  }
}
