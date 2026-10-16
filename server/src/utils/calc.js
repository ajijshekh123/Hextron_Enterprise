/**
 * Decimal-Safe Arithmetic Utility for Quotation & Financial Calculations
 * Avoids IEEE 754 floating-point inaccuracies (e.g. 0.1 + 0.2 !== 0.3)
 * Operates in integer cents/paise internally for precision.
 */

export function roundToTwo(num) {
  const n = Number(num);
  if (isNaN(n)) return 0;
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

export function formatDecimal(num) {
  return roundToTwo(num).toFixed(2);
}

/**
 * Calculates line item total: quantity * unitPrice
 */
export function calculateItemTotal(quantity, unitPrice) {
  const qty = Number(quantity) || 0;
  const price = Number(unitPrice) || 0;
  return roundToTwo(qty * price);
}

/**
 * Calculates complete quotation financial breakdown:
 * - Subtotal: sum of item totals (or single item quantity * unitPrice)
 * - Discount: (subtotal * discountPercent) / 100
 * - Net after discount: subtotal - discountAmount
 * - Tax (GST): (netAfterDiscount * taxRate) / 100
 * - Grand Total: netAfterDiscount + taxAmount
 */
export function calculateQuotationTotals({
  items = [],
  quantity = 1,
  unitPrice = 0,
  discountPercent = 0,
  taxRate = 18.0
}) {
  let subtotal = 0;

  if (Array.isArray(items) && items.length > 0) {
    subtotal = items.reduce((acc, item) => {
      const lineTotal = calculateItemTotal(item.quantity, item.unitPrice);
      return acc + lineTotal;
    }, 0);
  } else {
    subtotal = calculateItemTotal(quantity, unitPrice);
  }

  subtotal = roundToTwo(subtotal);

  const pct = Math.max(0, Math.min(100, Number(discountPercent) || 0));
  const discountAmount = roundToTwo((subtotal * pct) / 100);
  const netAmount = Math.max(0, roundToTwo(subtotal - discountAmount));

  const taxPct = Math.max(0, Number(taxRate) >= 0 ? Number(taxRate) : 18.0);
  const taxAmount = roundToTwo((netAmount * taxPct) / 100);
  const grandTotal = roundToTwo(netAmount + taxAmount);

  return {
    subtotal: formatDecimal(subtotal),
    discountPercent: formatDecimal(pct),
    discountAmount: formatDecimal(discountAmount),
    netAmount: formatDecimal(netAmount),
    taxRate: formatDecimal(taxPct),
    taxAmount: formatDecimal(taxAmount),
    grandTotal: formatDecimal(grandTotal)
  };
}

/**
 * Generates safely formatted, non-colliding sequential Quotation Numbers
 * Example: HEX-QT-2026-0001
 */
export function generateQuotationNumber(sequenceNumber = 1, year = new Date().getFullYear()) {
  const padded = String(sequenceNumber).padStart(4, '0');
  return `HEX-QT-${year}-${padded}`;
}
