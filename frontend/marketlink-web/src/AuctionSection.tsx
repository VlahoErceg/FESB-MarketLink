import { useMemo, useState } from 'react'
import './Auction.css'

export type Auction = { id: number; title: string; category: string; city: string; seller: string; bid: number; bids: number; hours: number; condition: string; image: string; tone: string }

const lots: Auction[] = [
  { id: 101, title: 'Analogni fotoaparat Canon AE-1', category: 'Elektronika', city: 'Split', seller: 'Mia Kovač', bid: 85, bids: 12, hours: 3, condition: 'Vrlo dobro', image: '📷', tone: 'blue' },
  { id: 102, title: 'Danska vintage fotelja', category: 'Dom i namještaj', city: 'Zagreb', seller: 'Luka Marić', bid: 140, bids: 8, hours: 19, condition: 'Dobro', image: '🪑', tone: 'peach' },
  { id: 103, title: 'Slušalice Sony WH-1000XM4', category: 'Elektronika', city: 'Rijeka', seller: 'Nika Perić', bid: 62, bids: 21, hours: 1, condition: 'Kao novo', image: '🎧', tone: 'lavender' },
  { id: 104, title: 'Prvo izdanje: Mali princ', category: 'Knjige', city: 'Osijek', seller: 'Ivan Babić', bid: 28, bids: 6, hours: 42, condition: 'Dobro', image: '📚', tone: 'yellow' },
  { id: 105, title: 'Ručna keramička vaza', category: 'Dom i namještaj', city: 'Pula', seller: 'Ema Radić', bid: 18, bids: 4, hours: 8, condition: 'Kao novo', image: '🏺', tone: 'rose' },
  { id: 106, title: 'Teniski reket Wilson Pro Staff', category: 'Sport', city: 'Zadar', seller: 'Noah Delić', bid: 54, bids: 9, hours: 27, condition: 'Vrlo dobro', image: '🎾', tone: 'mint' },
]

export function AuctionSection({ updates, onBid, onSelect }: { updates: Record<number, { bid: number; bids: number }>; onBid: (id: number) => void; onSelect: (id: number) => void }) {
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('Sve kategorije')
  const [city, setCity] = useState('Svi gradovi')
  const [ending, setEnding] = useState('Bilo kada')
  const [sort, setSort] = useState('Uskoro završavaju')
  const filtered = useMemo(() => lots.filter((lot) =>
    (category === 'Sve kategorije' || lot.category === category) && (city === 'Svi gradovi' || lot.city === city) &&
    (ending === 'Uskoro' ? lot.hours <= 6 : ending === 'Danas' ? lot.hours <= 24 : true) &&
    `${lot.title} ${lot.seller} ${lot.city}`.toLocaleLowerCase('hr').includes(query.toLocaleLowerCase('hr')),
  ).sort((a, b) => sort === 'Najviše ponuda' ? (updates[b.id]?.bids ?? b.bids) - (updates[a.id]?.bids ?? a.bids) : sort === 'Najniža cijena' ? (updates[a.id]?.bid ?? a.bid) - (updates[b.id]?.bid ?? b.bid) : a.hours - b.hours), [category, city, ending, query, sort, updates])
  return <section className="auction-section" id="auctions"><div className="auction-heading"><div><span className="eyebrow">LICITIRAJ ZA NEŠTO POSEBNO</span><h2>Aukcije <span>u tijeku.</span></h2><p>Pronađi rijetke komade i daj svoju ponudu prije isteka vremena.</p></div><span className="auction-live"><i /> {lots.length} aktivnih aukcija</span></div>
    <div className="auction-filters"><label>Pretraži aukcije<input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Naziv, prodavač ili grad" /></label><label>Kategorija<select value={category} onChange={(e) => setCategory(e.target.value)}>{['Sve kategorije', 'Elektronika', 'Dom i namještaj', 'Knjige', 'Sport'].map((item) => <option key={item}>{item}</option>)}</select></label><label>Lokacija<select value={city} onChange={(e) => setCity(e.target.value)}>{['Svi gradovi', 'Zagreb', 'Split', 'Rijeka', 'Osijek', 'Zadar', 'Pula'].map((item) => <option key={item}>{item}</option>)}</select></label><label>Završetak<select value={ending} onChange={(e) => setEnding(e.target.value)}><option>Bilo kada</option><option>Uskoro</option><option>Danas</option></select></label><label>Poredaj<select value={sort} onChange={(e) => setSort(e.target.value)}><option>Uskoro završavaju</option><option>Najviše ponuda</option><option>Najniža cijena</option></select></label></div>
    <div className="auction-grid">{filtered.map((lot) => { const bid = updates[lot.id]?.bid ?? lot.bid; const bids = updates[lot.id]?.bids ?? lot.bids; return <article className="auction-card" key={lot.id}><button className={`auction-art ${lot.tone}`} onClick={() => onSelect(lot.id)} aria-label={`Pogledaj detalje: ${lot.title}`}><span>{lot.image}</span><small>{lot.condition}</small><b>⌛ {lot.hours < 24 ? `${lot.hours} h` : `${Math.ceil(lot.hours / 24)} d`}</b></button><div className="auction-info"><small>{lot.category} · {lot.city}</small><button className="auction-title-link" onClick={() => onSelect(lot.id)}>{lot.title}</button><p>Prodaje {lot.seller}</p><div className="auction-price"><span>Trenutačna ponuda<strong>€{bid.toFixed(2)}</strong></span><span>{bids} ponuda</span></div><button className="auction-bid-button" onClick={() => onBid(lot.id)}>Daj ponudu <span>→</span></button></div></article> })}{!filtered.length && <p className="auction-empty">Nema aukcija koje odgovaraju odabranim filtrima.</p>}</div>
  </section>
}

export const auctionLots = lots
