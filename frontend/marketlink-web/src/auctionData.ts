export type Auction = { id: number; title: string; category: string; city: string; seller: string; bid: number; bids: number; end_time: string; condition: string; image: string; tone: string }

export const auctionLots: Auction[] = [
  { id: 101, title: 'Analogni fotoaparat Canon AE-1', category: 'Elektronika', city: 'Split', seller: 'Mia Kovač', bid: 85, bids: 12, end_time: '2026-11-13T22:00:00Z', condition: 'Vrlo dobro', image: '📷', tone: 'blue' },
  { id: 102, title: 'Danska vintage fotelja', category: 'Dom i namještaj', city: 'Zagreb', seller: 'Luka Marić', bid: 140, bids: 8, end_time: '2026-11-14T14:00:00Z', condition: 'Dobro', image: '🪑', tone: 'peach' },
  { id: 103, title: 'Slušalice Sony WH-1000XM4', category: 'Elektronika', city: 'Rijeka', seller: 'Nika Perić', bid: 62, bids: 21, end_time: '2026-11-13T21:30:00Z', condition: 'Kao novo', image: '🎧', tone: 'lavender' },
  { id: 104, title: 'Prvo izdanje: Mali princ', category: 'Knjige', city: 'Osijek', seller: 'Ivan Babić', bid: 28, bids: 6, end_time: '2026-11-15T12:50:00Z', condition: 'Dobro', image: '📚', tone: 'yellow' },
  { id: 105, title: 'Ručna keramička vaza', category: 'Dom i namještaj', city: 'Pula', seller: 'Ema Radić', bid: 18, bids: 4, end_time: '2026-11-14T02:50:00Z', condition: 'Kao novo', image: '🏺', tone: 'rose' },
  { id: 106, title: 'Teniski reket Wilson Pro Staff', category: 'Sport', city: 'Zadar', seller: 'Noah Delić', bid: 54, bids: 9, end_time: '2026-11-14T21:50:00Z', condition: 'Vrlo dobro', image: '🎾', tone: 'mint' },
]

export function auctionTimeRemaining(endTime: string, now: number) {
  const milliseconds = new Date(endTime).getTime() - now
  if (!Number.isFinite(milliseconds) || milliseconds <= 0) return 'Završena'
  const seconds = Math.floor(milliseconds / 1000)
  const days = Math.floor(seconds / 86400)
  const hours = Math.floor((seconds % 86400) / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const remainingSeconds = seconds % 60
  if (days > 0) return `${days} d ${hours} h`
  if (hours > 0) return `${hours} h ${minutes} min`
  return `${minutes} min ${remainingSeconds} s`
}
