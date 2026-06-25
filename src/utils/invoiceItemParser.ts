import { Order } from '../types';

export interface ParsedInvoiceItem {
  serviceType: string;
  description: string;
  quantity: number;
  rate: number;
  total: number;
}

export function parseInvoiceItem(order: { serviceType: string; details: string; totalAmount: number }): ParsedInvoiceItem {
  const serviceType = order.serviceType || 'Services';
  const details = order.details || '';
  const total = order.totalAmount || 0;
  
  let qty = 1;
  
  // Try to match standard formats like "1000 Cards", "30 Sheets", "500 prints"
  // Match a number followed by cards, sheets, prints, pcs, pieces, copies, pages, albums
  const countRegex = /(\d+)\s*(?:cards|sheets|prints|copies|pcs|pieces|pages|albums)/i;
  const countMatch = details.match(countRegex);
  
  if (countMatch && countMatch[1]) {
    const parsed = parseInt(countMatch[1], 10);
    if (!isNaN(parsed) && parsed > 0) {
      qty = parsed;
    }
  } else {
    // Try to match "quantity: 500" or "qty: 500" or "quantity 500" or "qty 500"
    const qtyRegex = /(?:quantity|qty)[:=\s\-]+(\d+)/i;
    const qtyMatch = details.match(qtyRegex);
    if (qtyMatch && qtyMatch[1]) {
      const parsed = parseInt(qtyMatch[1], 10);
      if (!isNaN(parsed) && parsed > 0) {
        qty = parsed;
      }
    }
  }
  
  const rate = qty > 0 ? total / qty : total;
  
  return {
    serviceType,
    description: details,
    quantity: qty,
    rate,
    total
  };
}
