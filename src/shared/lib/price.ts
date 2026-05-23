export const formatRubPrice = (value: number | string): string => {
  const amount = typeof value === 'number' ? value : Number.parseFloat(value)

  if (!Number.isFinite(amount)) {
    return '0,00 ₽'
  }

  return new Intl.NumberFormat('ru-RU', {
    currency: 'RUB',
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
    style: 'currency',
  }).format(amount)
}
