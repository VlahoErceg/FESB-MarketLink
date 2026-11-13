import { useMemo, useState } from 'react'
import { auctionLots, auctionTimeRemaining } from './auctionData'
import './Auction.css'

export function AuctionSection({ updates, onBid, onSelect, now }: { updates: Record<number, { bid: number; bids: number }>; onBid: (id: number) => void; onSelect: (id: number) => void; now: number }) {
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('Sve kategorije')
  const [city, setCity] = useState('Svi gradovi')
  const [ending, setEnding] = useState('Bilo kada')
  const [sort, setSort] = useState('Uskoro završavaju')
  const filtered = useMemo(() => auctionLots.filter((lot) => {
    const remaining = new Date(lot.end_time).getTime() - now
    const endsToday = new Date(lot.end_time).toDateString() === new Date(now).toDateString()
    return (category === 'Sve kategorije' || lot.category === category) && (city === 'Svi gradovi' || lot.city === city) &&
      (ending === 'Uskoro' ? remaining > 0 && remaining <= 6 * 60 * 60 * 1000 : ending === 'Danas' ? endsToday : true) &&
      `${lot.title} ${lot.seller} ${lot.city}`.toLocaleLowerCase('hr').includes(query.toLocaleLowerCase('hr'))
  }).sort((a, b) => sort === 'Najviše ponuda' ? (updates[b.id]?.bids ?? b.bids) - (updates[a.id]?.bids ?? a.bids) : sort === 'Najniža cijena' ? (updates[a.id]?.bid ?? a.bid) - (updates[b.id]?.bid ?? b.bid) : new Date(a.end_time).getTime() - new Date(b.end_time).getTime()), [category, city, ending, query, sort, updates, now])
  const activeCount = auctionLots.filter((lot) => new Date(lot.end_time).getTime() > now).length

  return <section className="auction-section" id="auctions"><div className="auction-heading"><div><span className="eyebrow">LICITIRAJ ZA NEŠTO POSEBNO</span><h2>Aukcije <span>u tijeku.</span></h2><p>Pronađi rijetke komade i daj svoju ponudu prije isteka vremena.</p></div><span className="auction-live"><i /> {activeCount} aktivnih aukcija</span></div>
    <div className="auction-filters"><label>Pretraži aukcije<input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Naziv, prodavač ili grad" /></label><label>Kategorija<select value={category} onChange={(e) => setCategory(e.target.value)}>{['Sve kategorije', 'Elektronika', 'Dom i namještaj', 'Knjige', 'Sport'].map((item) => <option key={item}>{item}</option>)}</select></label><label>Lokacija<select value={city} onChange={(e) => setCity(e.target.value)}>{['Svi gradovi', 'Zagreb', 'Split', 'Rijeka', 'Osijek', 'Zadar', 'Pula'].map((item) => <option key={item}>{item}</option>)}</select></label><label>Završetak<select value={ending} onChange={(e) => setEnding(e.target.value)}><option>Bilo kada</option><option>Uskoro</option><option>Danas</option></select></label><label>Poredaj<select value={sort} onChange={(e) => setSort(e.target.value)}><option>Uskoro završavaju</option><option>Najviše ponuda</option><option>Najniža cijena</option></select></label></div>
    <div className="auction-grid">{filtered.map((lot) => { const bid = updates[lot.id]?.bid ?? lot.bid; const bids = updates[lot.id]?.bids ?? lot.bids; const remaining = auctionTimeRemaining(lot.end_time, now); const ended = remaining === 'Završena'; return <article className="auction-card" key={lot.id}><button className={`auction-art ${lot.tone}`} onClick={() => onSelect(lot.id)} aria-label={`Pogledaj detalje: ${lot.title}`}><span>{lot.image}</span><small>{lot.condition}</small><b className={ended ? 'auction-ended' : ''}>{remaining}</b></button><div className="auction-info"><small>{lot.category} · {lot.city}</small><button className="auction-title-link" onClick={() => onSelect(lot.id)}>{lot.title}</button><p>Prodaje {lot.seller}</p><div className="auction-price"><span>Trenutačna ponuda<strong>€{bid.toFixed(2)}</strong></span><span>{bids} ponuda</span></div><button className="auction-bid-button" disabled={ended} onClick={() => onBid(lot.id)}>{ended ? 'Aukcija završena' : 'Daj ponudu'} <span>{ended ? '✓' : '→'}</span></button></div></article> })}{!filtered.length && <p className="auction-empty">Nema aukcija koje odgovaraju odabranim filtrima.</p>}</div>
  </section>
}
