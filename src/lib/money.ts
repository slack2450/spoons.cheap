export function formatMoney(value: number | null | undefined, currency: string, places = 2): string {
  if (typeof value !== 'number' || !Number.isFinite(value)) return '—';
  const fractionDigits = Number.isInteger(places) ? Math.min(20, Math.max(0, places)) : 2;
  const options: Intl.NumberFormatOptions = {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  };

  try {
    if (/^[A-Z]{3}$/.test(currency)) {
      return new Intl.NumberFormat('en-GB', { ...options, style: 'currency', currency }).format(value);
    }
    return new Intl.NumberFormat('en-GB', options).format(value);
  } catch {
    return value.toFixed(fractionDigits);
  }
}
