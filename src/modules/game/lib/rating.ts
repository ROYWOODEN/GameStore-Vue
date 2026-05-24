export const formatGameRating = (value: number): string => {
  const formatted = value.toFixed(1)
  return formatted.endsWith('.0') ? formatted.slice(0, -2) : formatted
}
