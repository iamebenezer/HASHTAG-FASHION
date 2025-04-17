// Format price as NGN with commas and 2 decimals
export function formatPrice(price) {
  if (typeof price === 'string') price = price.replace(/,/g, '');
  const num = parseFloat(price);
  if (isNaN(num)) return price;
  // Format without decimals: always show whole Naira, no .00
  return num.toLocaleString('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
}
