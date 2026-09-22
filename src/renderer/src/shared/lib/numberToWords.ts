const ONES = [
  '',
  'ONE',
  'TWO',
  'THREE',
  'FOUR',
  'FIVE',
  'SIX',
  'SEVEN',
  'EIGHT',
  'NINE',
  'TEN',
  'ELEVEN',
  'TWELVE',
  'THIRTEEN',
  'FOURTEEN',
  'FIFTEEN',
  'SIXTEEN',
  'SEVENTEEN',
  'EIGHTEEN',
  'NINETEEN'
]
const TENS = ['', '', 'TWENTY', 'THIRTY', 'FORTY', 'FIFTY', 'SIXTY', 'SEVENTY', 'EIGHTY', 'NINETY']
const SCALES = ['', 'THOUSAND', 'MILLION', 'BILLION']

function threeDigitsToWords(value: number): string {
  const words: string[] = []
  let n = value
  if (n >= 100) {
    words.push(ONES[Math.floor(n / 100)], 'HUNDRED')
    n %= 100
  }
  if (n >= 20) {
    words.push(TENS[Math.floor(n / 10)])
    n %= 10
    if (n > 0) words.push(ONES[n])
  } else if (n > 0) {
    words.push(ONES[n])
  }
  return words.join(' ')
}

export function integerToWords(value: number): string {
  const n = Math.floor(Math.abs(value))
  if (n === 0) return 'ZERO'
  const chunks: number[] = []
  let remaining = n
  while (remaining > 0) {
    chunks.push(remaining % 1000)
    remaining = Math.floor(remaining / 1000)
  }
  const groups: string[] = []
  for (let i = chunks.length - 1; i >= 0; i--) {
    if (chunks[i] === 0) continue
    const words = threeDigitsToWords(chunks[i])
    groups.push(SCALES[i] ? `${words} ${SCALES[i]}` : words)
  }
  return groups.join(' ')
}

/** "ONE THOUSAND EIGHT HUNDRED TWELVE PESOS & 50/100 ONLY" — the acknowledgment-receipt
 *  wording printed on the Council's real Disbursement Voucher form. A whole-peso amount
 *  drops the "& 00/100" fraction entirely (e.g. "FIFTY PESOS ONLY"), matching how it's
 *  actually written by hand on the real booklets — the fraction only appears when there
 *  are real centavos to spell out. */
export function amountToWords(amount: number): string {
  const safe = Math.max(0, amount)
  const pesos = Math.floor(safe)
  const centavos = Math.round((safe - pesos) * 100)
  const pesoWord = pesos === 1 ? 'PESO' : 'PESOS'
  if (centavos === 0) return `${integerToWords(pesos)} ${pesoWord} ONLY`
  const centavosStr = String(centavos).padStart(2, '0')
  return `${integerToWords(pesos)} ${pesoWord} & ${centavosStr}/100 ONLY`
}
