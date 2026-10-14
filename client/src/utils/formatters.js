/**
 * Formats a number to Indian Rupee representation (e.g. ₹1,23,456)
 * Uses Intl.NumberFormat('en-IN') with tabular numbers
 *
 * @param {number|string} amount
 * @param {boolean} [showDecimals=false]
 * @returns {string}
 */
export function formatINR(amount, showDecimals = false) {
  const numeric = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (numeric === null || numeric === undefined || isNaN(numeric)) {
    return '₹0';
  }

  const formatter = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: showDecimals ? 2 : 0,
    maximumFractionDigits: showDecimals ? 2 : 0
  });

  return formatter.format(numeric);
}

/**
 * Calculates discount percentage between MRP and selling price
 * Returns 0 if MRP is less than or equal to price, or if either is invalid
 *
 * @param {number|string} mrp
 * @param {number|string} price
 * @returns {number} Integer percentage (e.g. 25 for 25% off)
 */
export function calcDiscountPercent(mrp, price) {
  const numMrp = typeof mrp === 'string' ? parseFloat(mrp) : mrp;
  const numPrice = typeof price === 'string' ? parseFloat(price) : price;

  if (
    numMrp === null ||
    numMrp === undefined ||
    isNaN(numMrp) ||
    numPrice === null ||
    numPrice === undefined ||
    isNaN(numPrice) ||
    numMrp <= 0 ||
    numPrice <= 0 ||
    numMrp <= numPrice
  ) {
    return 0;
  }

  return Math.round(((numMrp - numPrice) / numMrp) * 100);
}
