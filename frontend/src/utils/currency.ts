/**
 * All money is carried as integer paise (1 rupee = 100 paise) until the
 * moment it is displayed. Doing the arithmetic in rupees as floats is how
 * "0.1 + 0.2" bugs end up in an invoice; integers avoid that class of error
 * entirely (spec section 8: "use safe monetary calculations").
 */
export function rupeesToPaise(rupees: number): number {
  return Math.round(rupees * 100);
}

export function paiseToRupees(paise: number): number {
  return paise / 100;
}

export function formatPaise(paise: number): string {
  const rupees = paiseToRupees(paise);
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: rupees % 1 === 0 ? 0 : 2,
  }).format(rupees);
}
