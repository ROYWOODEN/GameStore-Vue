export const EMPTY_BASKET_TOTAL = '0.00'

export const addPriceToTotal = (totalAmount: string | undefined, price?: string): string => {
  if (!price) {
    return totalAmount ?? EMPTY_BASKET_TOTAL
  }

  const total = Number.parseFloat(totalAmount ?? EMPTY_BASKET_TOTAL)
  const nextPrice = Number.parseFloat(price)

  if (!Number.isFinite(total) || !Number.isFinite(nextPrice)) {
    return totalAmount ?? EMPTY_BASKET_TOTAL
  }

  return (total + nextPrice).toFixed(2)
}

export const subtractPriceFromTotal = (totalAmount: string | undefined, price?: string): string => {
  if (!price) {
    return totalAmount ?? EMPTY_BASKET_TOTAL
  }

  const total = Number.parseFloat(totalAmount ?? EMPTY_BASKET_TOTAL)
  const nextPrice = Number.parseFloat(price)

  if (!Number.isFinite(total) || !Number.isFinite(nextPrice)) {
    return totalAmount ?? EMPTY_BASKET_TOTAL
  }

  return Math.max(0, total - nextPrice).toFixed(2)
}
