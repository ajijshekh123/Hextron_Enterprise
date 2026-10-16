import { describe, it, expect } from 'vitest';
import { calculateQuotationTotals, calculateItemTotal, roundToTwo, generateQuotationNumber } from '../src/utils/calc.js';

describe('Decimal-Safe Quotation Calculations', () => {
  it('correctly rounds numbers without floating point anomalies', () => {
    expect(roundToTwo(0.1 + 0.2)).toBe(0.3);
    expect(roundToTwo(10.555)).toBe(10.56);
    expect(roundToTwo('45.678')).toBe(45.68);
  });

  it('calculates single line item total accurately', () => {
    // 500 pcs * 175.00
    const total = calculateItemTotal(500, 175);
    expect(total).toBe(87500.00);

    // Decimal quantity (e.g. 12.5 meters/hours * 350.25)
    const decimalTotal = calculateItemTotal(12.5, 350.25);
    expect(decimalTotal).toBe(4378.13);
  });

  it('calculates multi-item quotation totals with GST tax and discount', () => {
    const items = [
      { quantity: 500, unitPrice: 175.00 }, // 87,500.00
      { quantity: 200, unitPrice: 50.00 }   // 10,000.00
    ];

    // Subtotal: 97,500.00
    // Discount 10%: 9,750.00
    // Net: 87,750.00
    // Tax 18%: 15,795.00
    // Grand Total: 103,545.00
    const totals = calculateQuotationTotals({
      items,
      discountPercent: 10,
      taxRate: 18.00
    });

    expect(totals.subtotal).toBe('97500.00');
    expect(totals.discountPercent).toBe('10.00');
    expect(totals.discountAmount).toBe('9750.00');
    expect(totals.netAmount).toBe('87750.00');
    expect(totals.taxRate).toBe('18.00');
    expect(totals.taxAmount).toBe('15795.00');
    expect(totals.grandTotal).toBe('103545.00');
  });

  it('handles zero discount and standard tax rate correctly', () => {
    const totals = calculateQuotationTotals({
      quantity: 100,
      unitPrice: 250,
      discountPercent: 0,
      taxRate: 18
    });

    expect(totals.subtotal).toBe('25000.00');
    expect(totals.discountAmount).toBe('0.00');
    expect(totals.netAmount).toBe('25000.00');
    expect(totals.taxAmount).toBe('4500.00');
    expect(totals.grandTotal).toBe('29500.00');
  });

  it('generates sequential quotation numbers with zero padding', () => {
    expect(generateQuotationNumber(1, 2026)).toBe('HEX-QT-2026-0001');
    expect(generateQuotationNumber(42, 2026)).toBe('HEX-QT-2026-0042');
    expect(generateQuotationNumber(1500, 2026)).toBe('HEX-QT-2026-1500');
  });
});
