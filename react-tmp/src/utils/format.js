export function formatBRL(v) {
  if (v == null || isNaN(v)) return '0,00'
  const abs = Math.abs(v)
  return abs.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

export function formatCurrency(v) {
  const sign = v < 0 ? '-' : ''
  return sign + 'R$ ' + formatBRL(v)
}
