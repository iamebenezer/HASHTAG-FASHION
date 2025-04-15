// Format price as NGN with commas and 2 decimals
export function formatPrice(price) {
  if (typeof price === 'string') price = price.replace(/,/g, '');
  const num = parseFloat(price);
  if (isNaN(num)) return price;
  return num.toLocaleString('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}
