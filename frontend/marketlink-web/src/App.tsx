import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react'
import './App.css'
import './Nova.css'
import './Shop.css'
import { AuctionSection } from './AuctionSection'
import { auctionLots, auctionTimeRemaining } from './auctionData'
import './Auction.css'

type Role = 'buyer' | 'seller' | 'admin'
type Page = 'shop' | 'product' | 'auction' | 'cart' | 'orders' | 'dashboard'
type Product = { id: number; name: string; category: string; price: number; stock: number; sellerId: string; seller: string; city: string; condition: string; rating: number; reviews: number; image: string; tone: string; active: boolean }
type CartLine = { productId: number; quantity: number }
type OrderItem = { productId: number; name: string; category: string; price: number; quantity: number; sellerId: string; seller: string }
type Order = { id: string; buyerId: string; buyerName: string; createdAt: number; items: OrderItem[]; total: number; payment: 'success'; cancelledAt?: number; review?: { rating: number; text: string } }
type Notice = { id: string; text: string; createdAt: number; read: boolean }
type User = { id: string; name: string; email: string; role: Role }

const initialProducts: Product[] = [
  { id: 1, name: 'Bežične slušalice Sony WH-1000XM5', category: 'Elektronika', price: 220, stock: 4, sellerId: 'mia', seller: 'Mia Kovač', city: 'Split', condition: 'Kao novo', rating: 4.9, reviews: 18, image: '🎧', tone: 'lavender', active: true },
  { id: 2, name: 'Vintage naslonjač od hrasta', category: 'Dom i namještaj', price: 180, stock: 2, sellerId: 'luka', seller: 'Luka Marić', city: 'Zagreb', condition: 'Dobro', rating: 4.8, reviews: 11, image: '🪑', tone: 'peach', active: true },
  { id: 3, name: 'Kožna torba za svaki dan', category: 'Moda', price: 45, stock: 7, sellerId: 'nika', seller: 'Nika Perić', city: 'Rijeka', condition: 'Kao novo', rating: 5, reviews: 6, image: '👜', tone: 'mint', active: true },
  { id: 4, name: 'The Creative Act — Rick Rubin', category: 'Knjige', price: 18, stock: 12, sellerId: 'ivan', seller: 'Ivan Babić', city: 'Osijek', condition: 'Vrlo dobro', rating: 4.7, reviews: 24, image: '📚', tone: 'yellow', active: true },
  { id: 5, name: 'Analogni fotoaparat Pentax', category: 'Elektronika', price: 95, stock: 1, sellerId: 'sara', seller: 'Sara Vuković', city: 'Zadar', condition: 'Dobro', rating: 4.9, reviews: 8, image: '📷', tone: 'blue', active: true },
  { id: 6, name: 'Set ručno rađene keramike', category: 'Dom i namještaj', price: 32, stock: 8, sellerId: 'ema', seller: 'Ema Radić', city: 'Pula', condition: 'Kao novo', rating: 4.8, reviews: 14, image: '🏺', tone: 'rose', active: true },
  { id: 7, name: 'Adidas Gazelle, veličina 39', category: 'Moda', price: 55, stock: 3, sellerId: 'petra', seller: 'Petra Lovrić', city: 'Split', condition: 'Dobro', rating: 4.6, reviews: 31, image: '👟', tone: 'mint', active: true },
  { id: 8, name: 'Teniski reket Wilson', category: 'Sport', price: 70, stock: 5, sellerId: 'noah', seller: 'Noah Delić', city: 'Zagreb', condition: 'Vrlo dobro', rating: 4.7, reviews: 9, image: '🎾', tone: 'peach', active: true },
  { id: 9, name: 'Prvo izdanje: Hobbit', category: 'Kolekcionarstvo', price: 130, stock: 1, sellerId: 'toma', seller: 'Toma Vitas', city: 'Rijeka', condition: 'Dobro', rating: 5, reviews: 3, image: '📖', tone: 'yellow', active: true },
  { id: 10, name: 'Polaroid SX-70 fotoaparat', category: 'Kolekcionarstvo', price: 85, stock: 2, sellerId: 'lana', seller: 'Lana Grgić', city: 'Osijek', condition: 'Korišteno', rating: 4.5, reviews: 12, image: '📸', tone: 'blue', active: true },
  { id: 11, name: 'Gradski bicikl sa 7 brzina', category: 'Sport', price: 110, stock: 2, sellerId: 'filip', seller: 'Filip Rukavina', city: 'Zagreb', condition: 'Dobro', rating: 4.8, reviews: 15, image: '🚲', tone: 'mint', active: true },
  { id: 12, name: 'Stolna lampa iz 60-ih', category: 'Dom i namještaj', price: 38, stock: 4, sellerId: 'iva', seller: 'Iva Šarić', city: 'Split', condition: 'Kao novo', rating: 4.9, reviews: 5, image: '💡', tone: 'rose', active: true },
]

const categories = ['Sve kategorije', 'Elektronika', 'Dom i namještaj', 'Moda', 'Knjige', 'Sport', 'Kolekcionarstvo']
const conditions = ['Svi artikli', 'Kao novo', 'Vrlo dobro', 'Dobro', 'Korišteno']
const cities = ['Svi gradovi', 'Zagreb', 'Split', 'Rijeka', 'Osijek', 'Zadar', 'Pula']
const labelForRole: Record<Role, string> = { buyer: 'Kupac', seller: 'Prodavač', admin: 'Administrator' }
const storage = {
  read<T>(key: string, fallback: T): T {
    try { const value = localStorage.getItem(`marketlink-demo-${key}`); return value ? JSON.parse(value) as T : fallback } catch { return fallback }
  },
  write(key: string, value: unknown) {
    try { localStorage.setItem(`marketlink-demo-${key}`, JSON.stringify(value)) } catch { /* Demo state still works for this session. */ }
  },
}

function orderStatus(order: Order, now: number) {
  if (order.cancelledAt) return 'Otkazana'
  const elapsed = now - order.createdAt
  if (elapsed >= 30_000) return 'Dostavljena'
  if (elapsed >= 15_000) return 'Poslana'
  return 'U pripremi'
}

function SalesChart({ orders, role, userId }: { orders: Order[]; role: Role; userId: string }) {
  const week = Array.from({ length: 7 }, (_, index) => {
    const date = new Date()
    date.setHours(0, 0, 0, 0)
    date.setDate(date.getDate() - (6 - index))
    const amount = orders.reduce((total, order) => {
      if (order.cancelledAt || new Date(order.createdAt).toDateString() !== date.toDateString()) return total
      return total + order.items.filter((item) => role !== 'seller' || item.sellerId === userId).reduce((sum, item) => sum + item.price * item.quantity, 0)
    }, 0)
    return { day: date.toLocaleDateString('hr-HR', { weekday: 'short' }), amount }
  })
  const maxAmount = Math.max(1, ...week.map((day) => day.amount))

  return <section className="app-page chart-section"><div className="sales-chart-panel"><div className="panel-title"><div><h2>Prodaja po danima</h2><p>{role === 'seller' ? 'Uključene su samo tvoje stavke iz potvrđenih narudžbi.' : 'Pregled vrijednosti uspješnih narudžbi u zadnjih sedam dana.'}</p></div><strong>€{week.reduce((sum, day) => sum + day.amount, 0).toFixed(2)}</strong></div><div className="sales-chart-bars" role="img" aria-label="Stupčasti prikaz prodaje u zadnjih sedam dana">{week.map((day) => <div className="sales-chart-day" key={day.day} title={`${day.day}: €${day.amount.toFixed(2)}`}><span>€{day.amount ? Math.round(day.amount) : '—'}</span><div className="sales-bar-track"><i style={{ height: `${day.amount ? Math.max(8, day.amount / maxAmount * 100) : 2}%` }} /></div><small>{day.day}</small></div>)}</div></div></section>
}

function App() {
  const [page, setPage] = useState<Page>('shop')
  const [products, setProducts] = useState<Product[]>(() => storage.read('products', initialProducts))
  const [cart, setCart] = useState<CartLine[]>(() => storage.read('cart', []))
  const [favorites, setFavorites] = useState<number[]>(() => storage.read('favorites', []))
  const [orders, setOrders] = useState<Order[]>(() => storage.read('orders', []))
  const [notices, setNotices] = useState<Notice[]>(() => storage.read('notices', []))
  const [user, setUser] = useState<User | null>(() => storage.read('user', null))
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('Sve kategorije')
  const [condition, setCondition] = useState('Svi artikli')
  const [city, setCity] = useState('Svi gradovi')
  const [minPrice, setMinPrice] = useState('')
  const [maxPrice, setMaxPrice] = useState('')
  const [inStockOnly, setInStockOnly] = useState(false)
  const [sort, setSort] = useState('Preporučeno')
  const [currentPage, setCurrentPage] = useState(1)
  const [authOpen, setAuthOpen] = useState(false)
  const [authReturnToCheckout, setAuthReturnToCheckout] = useState(false)
  const [authName, setAuthName] = useState('')
  const [authEmail, setAuthEmail] = useState('')
  const [authRole, setAuthRole] = useState<Role>('buyer')
  const [checkoutOpen, setCheckoutOpen] = useState(false)
  const [paymentOutcome, setPaymentOutcome] = useState<'success' | 'declined' | 'timeout'>('success')
  const [paymentMessage, setPaymentMessage] = useState('')
  const [paymentProcessing, setPaymentProcessing] = useState(false)
  const paymentLock = useRef(false)
  const [selectedProductId, setSelectedProductId] = useState<number | null>(null)
  const [selectedAuctionId, setSelectedAuctionId] = useState<number | null>(null)
  const [notificationOpen, setNotificationOpen] = useState(false)
  const [showNewProduct, setShowNewProduct] = useState(false)
  const [reviewDrafts, setReviewDrafts] = useState<Record<string, { rating: number; text: string }>>({})
  const [now, setNow] = useState(Date.now())
  const [toast, setToast] = useState('')
  const [auctionUpdates, setAuctionUpdates] = useState<Record<number, { bid: number; bids: number }>>(() => storage.read('auction-bids', {}))
  const [pendingAuctionId, setPendingAuctionId] = useState<number | null>(null)
  const [bidAuctionId, setBidAuctionId] = useState<number | null>(null)
  const [auctionBidAmount, setAuctionBidAmount] = useState('')

  useEffect(() => { storage.write('products', products) }, [products])
  useEffect(() => { storage.write('cart', cart) }, [cart])
  useEffect(() => { storage.write('favorites', favorites) }, [favorites])
  useEffect(() => { storage.write('orders', orders) }, [orders])
  useEffect(() => { storage.write('notices', notices) }, [notices])
  useEffect(() => { storage.write('user', user) }, [user])
  useEffect(() => { storage.write('auction-bids', auctionUpdates) }, [auctionUpdates])
  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1_000)
    return () => window.clearInterval(timer)
  }, [])
  useEffect(() => {
    for (const order of orders) {
      if (order.cancelledAt) continue
      const status = orderStatus(order, now)
      const noticeId = `${order.id}-${status}`
      if ((status === 'Poslana' || status === 'Dostavljena') && !notices.some((notice) => notice.id === noticeId)) {
        const title = status === 'Poslana' ? `Narudžba #${order.id} je poslana.` : `Narudžba #${order.id} je označena kao dostavljena.`
        setNotices((current) => current.some((notice) => notice.id === noticeId) ? current : [{ id: noticeId, text: title, createdAt: Date.now(), read: false }, ...current])
      }
    }
  }, [now, notices, orders])

  const activeProducts = useMemo(() => products.filter((product) => product.active), [products])
  const filteredProducts = useMemo(() => {
    const matches = activeProducts.filter((product) =>
      (category === 'Sve kategorije' || product.category === category) &&
      (condition === 'Svi artikli' || product.condition === condition) &&
      (city === 'Svi gradovi' || product.city === city) &&
      (!minPrice || product.price >= Number(minPrice)) && (!maxPrice || product.price <= Number(maxPrice)) &&
      (!inStockOnly || product.stock > 0) &&
      `${product.name} ${product.category} ${product.seller} ${product.city}`.toLocaleLowerCase('hr').includes(query.toLocaleLowerCase('hr')),
    )
    return matches.sort((a, b) => {
      if (sort === 'Cijena: niža prvo') return a.price - b.price
      if (sort === 'Cijena: viša prvo') return b.price - a.price
      if (sort === 'Najbolje ocijenjeno') return b.rating - a.rating
      if (sort === 'Najnovije') return b.id - a.id
      return b.reviews - a.reviews
    })
  }, [activeProducts, category, city, condition, inStockOnly, maxPrice, minPrice, query, sort])
  const pageSize = 6
  const pageCount = Math.max(1, Math.ceil(filteredProducts.length / pageSize))
  const pageProducts = filteredProducts.slice((currentPage - 1) * pageSize, currentPage * pageSize)
  const cartItems = cart.map((line) => ({ line, product: products.find((item) => item.id === line.productId) })).filter((entry): entry is { line: CartLine; product: Product } => Boolean(entry.product))
  const cartCount = cart.reduce((total, line) => total + line.quantity, 0)
  const cartTotal = cartItems.reduce((total, entry) => total + entry.product.price * entry.line.quantity, 0)
  const selectedProduct = products.find((product) => product.id === selectedProductId)
  const selectedAuction = auctionLots.find((lot) => lot.id === selectedAuctionId)
  const selectedAuctionRemaining = selectedAuction ? auctionTimeRemaining(selectedAuction.end_time, now) : ''
  const selectedAuctionEnded = selectedAuctionRemaining === 'Završena'
  const unreadCount = notices.filter((notice) => !notice.read).length

  function addNotice(text: string) {
    const notice: Notice = { id: `${Date.now()}-${Math.random().toString(16).slice(2)}`, text, createdAt: Date.now(), read: false }
    setNotices((current) => [notice, ...current])
  }

  function addToCart(product: Product) {
    if (product.stock < 1) { setToast('Artikl trenutačno nije dostupan.'); return }
    const existing = cart.find((line) => line.productId === product.id)
    if (existing && existing.quantity >= product.stock) { setToast('U košarici je već sva dostupna zaliha.'); return }
    setCart((current) => {
      const line = current.find((entry) => entry.productId === product.id)
      return line ? current.map((entry) => entry.productId === product.id ? { ...entry, quantity: entry.quantity + 1 } : entry) : [...current, { productId: product.id, quantity: 1 }]
    })
    setToast(`${product.name} dodan je u košaricu.`)
  }

  function updateQuantity(productId: number, quantity: number) {
    const product = products.find((item) => item.id === productId)
    if (!product) return
    if (quantity < 1) { setCart((current) => current.filter((line) => line.productId !== productId)); return }
    if (quantity > product.stock) { setToast(`Dostupno je još ${product.stock} kom.`); return }
    setCart((current) => current.map((line) => line.productId === productId ? { ...line, quantity } : line))
  }

  function requestCheckout() {
    if (!cartItems.length) return
    if (user && user.role !== 'buyer') { setToast('Demo narudžbu može predati samo korisnik s ulogom Kupac.'); return }
    if (!user) { setAuthReturnToCheckout(true); setAuthOpen(true); return }
    setPaymentMessage('')
    setCheckoutOpen(true)
  }

  function requestAuctionBid(id: number) {
    const lot = auctionLots.find((item) => item.id === id)
    if (!lot) return
    if (new Date(lot.end_time).getTime() <= now) { setToast('Aukcija je završena; ponude više nisu moguće.'); return }
    if (!user) { setPendingAuctionId(id); setAuthRole('buyer'); setAuthOpen(true); setToast('Prijavi se kao kupac prije slanja ponude.'); return }
    if (user.role !== 'buyer') { setToast('Za ponudu odaberi demo ulogu Kupac.'); return }
    setBidAuctionId(id)
    setAuctionBidAmount(String((auctionUpdates[id]?.bid ?? lot.bid) + 5))
  }

  function submitAuctionBid(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (bidAuctionId === null) return
    const lot = auctionLots.find((item) => item.id === bidAuctionId)
    const amount = Number(auctionBidAmount)
    if (lot && new Date(lot.end_time).getTime() <= now) { setBidAuctionId(null); setToast('Aukcija je završena; ponuda nije prihvaćena.'); return }
    if (!lot || amount < (auctionUpdates[bidAuctionId]?.bid ?? lot.bid) + 5) { setToast('Ponuda mora biti barem 5 € viša od trenutačne.'); return }
    setAuctionUpdates((current) => ({ ...current, [bidAuctionId]: { bid: amount, bids: (current[bidAuctionId]?.bids ?? lot.bids) + 1 } }))
    setBidAuctionId(null)
    setToast('Ponuda je spremljena u ovom demo pregledniku.')
  }

  function handleSignIn(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const emailName = authEmail.split('@')[0]?.replace(/[._-]+/g, ' ').trim()
    const nextUser: User = { id: `demo-${authEmail.toLowerCase()}`, name: authName.trim() || emailName || 'MarketLink korisnik', email: authEmail, role: authRole }
    setUser(nextUser)
    setAuthOpen(false)
    setPage(authRole === 'buyer' ? page : 'dashboard')
    addNotice(`Prijavljeni ste kao ${labelForRole[authRole].toLocaleLowerCase('hr')}.`)
    if (authReturnToCheckout) {
      setAuthReturnToCheckout(false)
      if (authRole === 'buyer') setCheckoutOpen(true)
      else setToast('Za kupnju promijeni demo ulogu na Kupac.')
    }
    if (pendingAuctionId !== null) {
      const id = pendingAuctionId
      setPendingAuctionId(null)
      if (authRole === 'buyer') {
        const lot = auctionLots.find((item) => item.id === id)
        if (lot && new Date(lot.end_time).getTime() > now) { setBidAuctionId(id); setAuctionBidAmount(String((auctionUpdates[id]?.bid ?? lot.bid) + 5)) }
        else setToast('Aukcija je završena; ponude više nisu moguće.')
      }
      else setToast('Za ponudu se prijavi kao Kupac.')
    }
    setAuthName('')
    setAuthEmail('')
  }

  function completePayment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!user) { setCheckoutOpen(false); setAuthReturnToCheckout(true); setAuthOpen(true); return }
    if (user.role !== 'buyer') { setPaymentMessage('Za predaju narudžbe prijavi se s demo ulogom Kupac.'); return }
    const invalidLine = cart.find((line) => (products.find((product) => product.id === line.productId)?.stock ?? 0) < line.quantity)
    if (invalidLine) { setPaymentMessage('Zaliha artikla promijenila se. Uredi košaricu prije nove potvrde.'); return }
    if (paymentLock.current) return
    paymentLock.current = true
    setPaymentProcessing(true)
    setPaymentMessage('Obrađujemo simuliranu uplatu…')
    window.setTimeout(() => {
      if (paymentOutcome === 'declined') {
        setPaymentMessage('Plaćanje je odbijeno. Zaliha nije promijenjena; možete pokušati ponovno.')
        setPaymentProcessing(false)
        paymentLock.current = false
        return
      }
      if (paymentOutcome === 'timeout') {
        setPaymentMessage('Zahtjev je istekao bez potvrde. Narudžba nije stvorena i zaliha nije smanjena. Ako simulirana potvrda stigne kasnije, ignorira se.')
        setPaymentProcessing(false)
        paymentLock.current = false
        return
      }
      const order: Order = {
        id: String(Date.now()).slice(-8), buyerId: user.id, buyerName: user.name, createdAt: Date.now(), payment: 'success', total: cartTotal,
        items: cartItems.map(({ line, product }) => ({ productId: product.id, name: product.name, category: product.category, price: product.price, quantity: line.quantity, sellerId: product.sellerId, seller: product.seller })),
      }
      setProducts((current) => current.map((product) => {
        const bought = cart.find((line) => line.productId === product.id)
        return bought ? { ...product, stock: Math.max(0, product.stock - bought.quantity) } : product
      }))
      setOrders((current) => [order, ...current])
      setCart([])
      setCheckoutOpen(false)
      setPaymentProcessing(false)
      paymentLock.current = false
      setPage('orders')
      addNotice(`Narudžba #${order.id} je potvrđena. Plaćanje je simulirano.`)
      setToast('Narudžba je uspješno stvorena.')
    }, 650)
  }

  function cancelOrder(order: Order) {
    if (orderStatus(order, now) !== 'U pripremi' || order.cancelledAt) return
    setOrders((current) => current.map((item) => item.id === order.id ? { ...item, cancelledAt: Date.now() } : item))
    setProducts((current) => current.map((product) => {
      const line = order.items.find((item) => item.productId === product.id)
      return line ? { ...product, stock: product.stock + line.quantity } : product
    }))
    addNotice(`Narudžba #${order.id} je otkazana; zaliha je vraćena.`)
  }

  function leaveReview(order: Order) {
    const draft = reviewDrafts[order.id]
    if (!draft || draft.text.trim().length < 4) return
    setOrders((current) => current.map((item) => item.id === order.id ? { ...item, review: draft } : item))
    setProducts((current) => current.map((product) => {
      const purchased = order.items.some((item) => item.productId === product.id)
      if (!purchased) return product
      return { ...product, rating: Number(((product.rating * product.reviews + draft.rating) / (product.reviews + 1)).toFixed(1)), reviews: product.reviews + 1 }
    }))
    addNotice(`Hvala na recenziji narudžbe #${order.id}.`)
  }

  function resetFilters() {
    setQuery(''); setCategory('Sve kategorije'); setCondition('Svi artikli'); setCity('Svi gradovi'); setMinPrice(''); setMaxPrice(''); setInStockOnly(false); setSort('Preporučeno'); setCurrentPage(1)
  }

  function openPage(nextPage: Page) {
    if ((nextPage === 'orders' || nextPage === 'dashboard') && !user) { setAuthOpen(true); return }
    setPage(nextPage)
    setNotificationOpen(false)
  }

  function updateStock(productId: number, stock: number) {
    setProducts((current) => current.map((product) => product.id === productId ? { ...product, stock: Math.max(0, stock) } : product))
  }

  function addProduct(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!user) return
    const data = new FormData(event.currentTarget)
    const product: Product = {
      id: Math.max(0, ...products.map((item) => item.id)) + 1,
      name: String(data.get('name')).trim(), category: String(data.get('category')), price: Number(data.get('price')), stock: Number(data.get('stock')),
      sellerId: user.id, seller: user.name, city: String(data.get('city')), condition: String(data.get('condition')), rating: 0, reviews: 0, image: '✨', tone: 'peach', active: true,
    }
    setProducts((current) => [product, ...current])
    setShowNewProduct(false)
    setToast('Novi artikl objavljen je u katalogu.')
    addNotice(`Artikl „${product.name}” dodan je u katalog.`)
  }

  const visibleOrders = useMemo(() => {
    if (!user) return []
    if (user.role === 'admin') return orders
    if (user.role === 'seller') return orders.filter((order) => order.items.some((item) => item.sellerId === user.id))
    return orders.filter((order) => order.buyerId === user.id)
  }, [orders, user])
  const sellerProducts = user?.role === 'admin' ? products : products.filter((product) => product.sellerId === user?.id)
  const recommendations = activeProducts.filter((product) => product.category === category && category !== 'Sve kategorije').slice(0, 3)
  const roleSales = visibleOrders.reduce((total, order) => total + (order.cancelledAt ? 0 : order.items.filter((item) => user?.role !== 'seller' || item.sellerId === user.id).reduce((sum, item) => sum + item.price * item.quantity, 0)), 0)

  return (
    <div className="site-shell shop-shell">
      <div className="announcement"><span>✦</span> Dobri proizvodi zaslužuju novi dom. <a href="#catalog">Istraži ponudu <span>↗</span></a></div>
      <header className="topbar shop-topbar">
        <a className="brand" href="#home" onClick={() => setPage('shop')} aria-label="MarketLink naslovnica"><span className="brand-mark">m</span><span>market<span className="brand-light">link</span></span></a>
        <nav className="main-nav" aria-label="Glavna navigacija"><a href="#auctions" onClick={() => setPage('shop')}>Aukcije</a><button className={page === 'shop' ? 'nav-active' : ''} onClick={() => openPage('shop')}>Tržnica</button>{user && <button className={page === 'orders' ? 'nav-active' : ''} onClick={() => openPage('orders')}>Moje narudžbe</button>}{user && <button className={page === 'dashboard' ? 'nav-active' : ''} onClick={() => openPage('dashboard')}>Nadzorna ploča</button>}</nav>
        <div className="top-actions shop-top-actions"><button className="notification-trigger" aria-label={`${unreadCount} nepročitanih obavijesti`} onClick={() => setNotificationOpen(!notificationOpen)}>♧{unreadCount > 0 && <span>{unreadCount}</span>}</button><button className="cart-trigger" onClick={() => openPage('cart')}>Košarica <b>{cartCount}</b></button>{user ? <button className="user-pill" onClick={() => { setUser(null); setPage('shop'); setToast('Odjavljeni ste.') }}><span>{user.name.split(' ').map((name) => name[0]).join('').slice(0, 2)}</span>{user.name.split(' ')[0]} · Odjava</button> : <button className="login-button" onClick={() => setAuthOpen(true)}>Prijava</button>}
        </div>
        {notificationOpen && <div className="notification-panel"><div className="notification-heading"><strong>Obavijesti</strong><button onClick={() => setNotices((current) => current.map((notice) => ({ ...notice, read: true })))}>Označi pročitano</button></div>{notices.length ? notices.slice(0, 8).map((notice) => <div className={notice.read ? 'notice-row' : 'notice-row notice-unread'} key={notice.id}><span>{notice.text}</span><small>{new Date(notice.createdAt).toLocaleTimeString('hr-HR', { hour: '2-digit', minute: '2-digit' })}</small></div>) : <p className="no-notices">Obavijesti o narudžbama pojavit će se ovdje.</p>}</div>}
      </header>

      {page === 'shop' && <main id="home">
        <section className="shop-hero"><div className="shop-hero-content"><div className="eyebrow"><span className="eyebrow-dot"/> LOKALNA VIŠEPRODAVAČKA TRŽNICA</div><h1>Pronađi dobro.<br /><span>Proslijedi dalje.</span></h1><p>Otkrij jedinstvene rabljene i nove stvari od prodavača iz svoje blizine. Kupuj pažljivo, prodaj jednostavno.</p><div className="shop-hero-actions"><a href="#catalog" className="button-primary">Istraži proizvode <span>↗</span></a><button className="button-text" onClick={() => { if (!user) setAuthOpen(true); else { setPage('dashboard'); setShowNewProduct(true) } }}>Imaš nešto za prodati? <span>→</span></button></div><div className="hero-stats"><span><b>{activeProducts.length}</b> pažljivo odabranih artikala</span><i/><span><b>{new Set(activeProducts.map((product) => product.sellerId)).size}</b> lokalnih prodavača</span></div></div><div className="shop-hero-visual"><div className="shop-hero-blob"/><div className="hero-product hero-product-one">🪑</div><div className="hero-product hero-product-two">📷</div><div className="hero-product hero-product-three">👜</div><div className="hero-product-tag">Lijepo pronađeno.<br /><strong>Još ljepše podijeljeno.</strong></div><div className="shop-hero-caption">DOBRE STVARI, BLIZU TEBE <span>✳</span></div></div></section>
        <section className="catalog-section" id="catalog"><div className="catalog-heading"><div><div className="eyebrow"><span className="eyebrow-dot"/> TRŽNICA ZAJEDNICE</div><h2>Pronađi svoj <span>sljedeći favorit.</span></h2><p>Svaki artikl ima svoju priču. Napiši mu novo poglavlje.</p></div><div className="catalog-trust"><span>✓ Sigurna simulirana kupnja</span><span>✓ Lokalni prodavači</span></div></div>
          <div className="catalog-toolbar"><label className="catalog-search"><span>⌕</span><input placeholder="Pretraži proizvode, prodavače, gradove..." value={query} onChange={(event) => { setQuery(event.target.value); setCurrentPage(1) }} /><kbd>⌘ K</kbd></label><div className="catalog-filters"><label><span>Kategorija</span><select value={category} onChange={(event) => { setCategory(event.target.value); setCurrentPage(1) }}>{categories.map((item) => <option key={item}>{item}</option>)}</select></label><label><span>Stanje</span><select value={condition} onChange={(event) => { setCondition(event.target.value); setCurrentPage(1) }}>{conditions.map((item) => <option key={item}>{item}</option>)}</select></label><label><span>Lokacija</span><select value={city} onChange={(event) => { setCity(event.target.value); setCurrentPage(1) }}>{cities.map((item) => <option key={item}>{item}</option>)}</select></label><label><span>Sortiraj</span><select value={sort} onChange={(event) => setSort(event.target.value)}>{['Preporučeno', 'Najnovije', 'Najbolje ocijenjeno', 'Cijena: niža prvo', 'Cijena: viša prvo'].map((item) => <option key={item}>{item}</option>)}</select></label><label className="price-filter"><span>Najniža cijena (€)</span><input type="number" min="0" placeholder="0" value={minPrice} onChange={(event) => { setMinPrice(event.target.value); setCurrentPage(1) }} /></label><label className="price-filter"><span>Najviša cijena (€)</span><input type="number" min="0" placeholder="Bez limita" value={maxPrice} onChange={(event) => { setMaxPrice(event.target.value); setCurrentPage(1) }} /></label><label className="stock-filter"><input type="checkbox" checked={inStockOnly} onChange={(event) => setInStockOnly(event.target.checked)} /> Samo dostupno</label><button className="reset-filter" onClick={resetFilters}>Očisti filtre</button></div></div>
          <div className="catalog-results"><span>Prikazano <strong>{pageProducts.length}</strong> od <strong>{filteredProducts.length}</strong> proizvoda</span><span>Prodaju <strong>provjereni članovi zajednice</strong></span></div>
          {pageProducts.length ? <div className="product-grid">{pageProducts.map((product) => <article className="product-card" key={product.id}><button className={`product-image ${product.tone}`} onClick={() => { setSelectedProductId(product.id); setPage('product'); window.scrollTo({ top: 0, behavior: 'smooth' }) }} aria-label={`Pogledaj ${product.name}`}><span className="product-emoji">{product.image}</span><span className="product-category-chip">{product.category}</span><span className="product-condition-chip">{product.condition}</span></button><div className="product-card-content"><div className="product-rating">★ <b>{product.rating ? product.rating.toFixed(1) : 'Novo'}</b> <span>({product.reviews} recenzija)</span><button className={`save-product ${favorites.includes(product.id) ? 'is-saved' : ''}`} aria-label={favorites.includes(product.id) ? 'Ukloni iz spremljenih' : 'Spremi proizvod'} onClick={() => setFavorites((current) => current.includes(product.id) ? current.filter((id) => id !== product.id) : [...current, product.id])}>{favorites.includes(product.id) ? '♥' : '♡'}</button></div><button className="product-title" onClick={() => { setSelectedProductId(product.id); setPage('product'); window.scrollTo({ top: 0, behavior: 'smooth' }) }}>{product.name}</button><div className="product-seller">{product.seller} <span>· {product.city}</span></div><div className="product-buy-row"><strong>€{product.price.toFixed(2)}</strong><button disabled={product.stock < 1} onClick={() => addToCart(product)}>{product.stock < 1 ? 'Rasprodano' : '＋ Dodaj'}</button></div><div className={product.stock <= 2 ? 'stock-note low-stock' : 'stock-note'}>{product.stock > 0 ? `${product.stock} kom. dostupno` : 'Trenutačno nedostupno'}</div></div></article>)}</div> : <div className="empty-state">Nema proizvoda koji odgovaraju odabranim filtrima. <button onClick={resetFilters}>Očisti filtre</button></div>}
          {filteredProducts.length > pageSize && <nav className="pagination" aria-label="Stranice kataloga"><button disabled={currentPage === 1} onClick={() => setCurrentPage((value) => value - 1)}>← Prethodna</button><span>Stranica {currentPage} od {pageCount}</span><button disabled={currentPage === pageCount} onClick={() => setCurrentPage((value) => value + 1)}>Sljedeća →</button></nav>}
        </section>
        <section className="recommendation-section"><div className="recommendation-heading"><div><div className="eyebrow"><span className="eyebrow-dot"/> PRIJEDLOZI ZA TEBE</div><h2>{category === 'Sve kategorije' ? 'Dobro ocijenjeno u zajednici.' : `Još iz kategorije ${category.toLocaleLowerCase('hr')}.`}</h2><p>{category === 'Sve kategorije' ? 'Ovo su artikli s najboljim ocjenama kupaca.' : `Prikazujemo još proizvoda iz kategorije koju istražuješ: ${category}.`}</p></div></div><div className="recommendation-list">{(recommendations.length ? recommendations : [...activeProducts].sort((a, b) => b.rating - a.rating).slice(0, 3)).map((product) => <button className="recommendation-item" key={product.id} onClick={() => { setSelectedProductId(product.id); setPage('product'); window.scrollTo({ top: 0, behavior: 'smooth' }) }}><span className={`recommendation-art ${product.tone}`}>{product.image}</span><span><small>{recommendations.length ? `Još iz kategorije ${product.category}` : 'Popularno u zajednici'}</small><strong>{product.name}</strong><em>€{product.price.toFixed(2)} · ★ {product.rating.toFixed(1)}</em></span><b>↗</b></button>)}</div></section>
        <section className="community-banner" id="community"><div className="community-mark">m.</div><div><div className="eyebrow">DOBRE STVARI PUTUJU</div><h2>Kupi pažljivo.<br /><span>Proslijedi dalje.</span></h2></div><button className="button-light" onClick={() => { if (!user) setAuthOpen(true); else { setPage('dashboard'); setShowNewProduct(true) } }}>Postani prodavač <span>↗</span></button><div className="community-decoration">✳</div></section>
      </main>}

      {page === 'shop' && <AuctionSection updates={auctionUpdates} onBid={requestAuctionBid} onSelect={(id) => { setSelectedAuctionId(id); setPage('auction'); window.scrollTo({ top: 0, behavior: 'smooth' }) }} now={now} />}

      {page === 'product' && selectedProduct && <main className="app-page item-detail-page"><button className="subtle-action" onClick={() => setPage('shop')}>← Natrag na tržnicu</button><div className="item-detail-layout"><div className={`item-detail-image ${selectedProduct.tone}`}><span>{selectedProduct.image}</span><small>{selectedProduct.condition}</small></div><article className="item-detail-content"><div className="eyebrow">{selectedProduct.category} · ARTIKL #{selectedProduct.id}</div><h1>{selectedProduct.name}</h1><div className="item-detail-rating">★ {selectedProduct.rating ? selectedProduct.rating.toFixed(1) : 'Novo'} <span>({selectedProduct.reviews} recenzija)</span></div><strong className="item-detail-price">€{selectedProduct.price.toFixed(2)}</strong><p className="item-detail-description">Ovaj {selectedProduct.category.toLocaleLowerCase('hr')} artikl prodaje član MarketLink zajednice. Pregledaj stanje i podatke o prodavaču prije kupnje.</p><div className="item-detail-facts"><div><span>Stanje</span><strong>{selectedProduct.condition}</strong></div><div><span>Dostupnost</span><strong>{selectedProduct.stock ? `${selectedProduct.stock} komada` : 'Nedostupno'}</strong></div><div><span>Lokacija</span><strong>{selectedProduct.city}</strong></div><div><span>Kategorija</span><strong>{selectedProduct.category}</strong></div></div><section className="item-seller-panel"><span className="seller-avatar">{selectedProduct.seller.split(' ').map((part) => part[0]).join('')}</span><div><small>PRODAVAČ</small><strong>{selectedProduct.seller}</strong><span>★ {selectedProduct.rating.toFixed(1)} · {selectedProduct.reviews} recenzija</span></div></section><button className="auth-submit" disabled={!selectedProduct.stock} onClick={() => addToCart(selectedProduct)}>{selectedProduct.stock ? 'Dodaj u košaricu' : 'Trenutačno nedostupno'} <span>＋</span></button><small className="demo-disclaimer">Informacije o artiklu prikazuju se iz lokalnih demo podataka.</small></article></div></main>}

      {page === 'auction' && selectedAuction && <main className="app-page item-detail-page">
        <button className="subtle-action" onClick={() => setPage('shop')}>← Natrag na tržnicu</button>
        <div className="item-detail-layout">
          <div className={'item-detail-image ' + selectedAuction.tone}><span>{selectedAuction.image}</span><small>{selectedAuction.condition}</small></div>
          <article className="item-detail-content">
            <div className="eyebrow">{selectedAuctionEnded ? 'ZAVRŠENA AUKCIJA' : 'AUKCIJA U TIJEKU'} · {selectedAuction.category}</div>
            <h1>{selectedAuction.title}</h1>
            <p className="item-detail-description">{selectedAuctionEnded ? 'Ova aukcija je završena i nove ponude više nisu moguće.' : <>Ovaj artikl prodaje član MarketLink zajednice. Preostalo vrijeme: {selectedAuctionRemaining}.</>}</p>
            <div className="auction-detail-facts">
              <span>Trenutačna ponuda<strong>€{(auctionUpdates[selectedAuction.id]?.bid ?? selectedAuction.bid).toFixed(2)}</strong></span>
              <span>Broj ponuda<strong>{auctionUpdates[selectedAuction.id]?.bids ?? selectedAuction.bids}</strong></span>
              <span>{selectedAuctionEnded ? 'Status aukcije' : 'Preostalo vrijeme'}<strong>{selectedAuctionRemaining}</strong></span>
              <span>Završava<strong>{new Date(selectedAuction.end_time).toLocaleString('hr-HR')}</strong></span>
              <span>Stanje<strong>{selectedAuction.condition}</strong></span>
              <span>Lokacija<strong>{selectedAuction.city}</strong></span>
              <span>Kategorija<strong>{selectedAuction.category}</strong></span>
            </div>
            <section className="item-seller-panel"><span className="seller-avatar">{selectedAuction.seller.split(' ').map((part) => part[0]).join('')}</span><div><small>PRODAVAČ</small><strong>{selectedAuction.seller}</strong><span>Član lokalne MarketLink zajednice · {selectedAuction.city}</span></div></section>
            <button className="auth-submit" disabled={selectedAuctionEnded} onClick={() => requestAuctionBid(selectedAuction.id)}>{selectedAuctionEnded ? 'Aukcija završena' : 'Daj ponudu'} <span>{selectedAuctionEnded ? '✓' : '→'}</span></button>
            <small className="demo-disclaimer">Ponude su demonstracijske i spremaju se samo u ovom pregledniku.</small>
          </article>
        </div>
      </main>}

      {page === 'cart' && <main className="app-page"><div className="page-heading"><div><div className="eyebrow">TVOJA KUPOVINA</div><h1>Košarica <span>({cartCount})</span></h1><p>Pregledaj artikle prije potvrde narudžbe.</p></div><button className="subtle-action" onClick={() => setPage('shop')}>← Nastavi kupovati</button></div>{cartItems.length ? <div className="cart-layout"><section className="cart-lines">{cartItems.map(({ line, product }) => <article className="cart-line" key={product.id}><div className={`cart-line-art ${product.tone}`}>{product.image}</div><div className="cart-line-info"><small>{product.seller} · {product.city}</small><h3>{product.name}</h3><span>€{product.price.toFixed(2)} po komadu · {product.stock} dostupno</span><div className="quantity-control"><button aria-label="Smanji količinu" onClick={() => updateQuantity(product.id, line.quantity - 1)}>−</button><span>{line.quantity}</span><button aria-label="Povećaj količinu" disabled={line.quantity >= product.stock} onClick={() => updateQuantity(product.id, line.quantity + 1)}>＋</button><button className="remove-line" onClick={() => updateQuantity(product.id, 0)}>Ukloni</button></div></div><strong>€{(product.price * line.quantity).toFixed(2)}</strong></article>)}</section><aside className="order-summary"><h2>Sažetak narudžbe</h2><div><span>Proizvodi ({cartCount})</span><b>€{cartTotal.toFixed(2)}</b></div><div><span>Dostava</span><b>Izračun pri predaji</b></div><div className="summary-total"><span>Ukupno</span><strong>€{cartTotal.toFixed(2)}</strong></div><button className="button-primary checkout-button" onClick={requestCheckout}>Nastavi na plaćanje <span>→</span></button><p>Testno plaćanje je simulirano. Ne unosite podatke kartice.</p></aside></div> : <div className="empty-panel"><span>🧺</span><h2>Košarica je prazna</h2><p>Pronađi nešto posebno na tržnici.</p><button className="button-primary" onClick={() => setPage('shop')}>Istraži proizvode <span>↗</span></button></div>}</main>}

      {page === 'orders' && <main className="app-page"><div className="page-heading"><div><div className="eyebrow">PREGLED KUPNJE</div><h1>Moje <span>narudžbe.</span></h1><p>Status narudžbe se u demo prikazu mijenja automatski.</p></div><button className="subtle-action" onClick={() => setPage('shop')}>← Tržnica</button></div>{visibleOrders.length ? <div className="order-list">{visibleOrders.map((order) => { const status = orderStatus(order, now); const displayedItems = user?.role === 'seller' ? order.items.filter((item) => item.sellerId === user.id) : order.items; return <article className="order-card" key={order.id}><header><div><small>NARUDŽBA #{order.id}</small><strong>{new Date(order.createdAt).toLocaleString('hr-HR')}{user?.role === 'admin' && ` · Kupac: ${order.buyerName}`}</strong></div><span className={`order-status ${status === 'Dostavljena' ? 'status-delivered' : status === 'Otkazana' ? 'status-cancelled' : ''}`}>{status}</span></header><div className="order-items">{displayedItems.map((item) => <div key={item.productId}><span>{item.name} <small>× {item.quantity}</small></span><span>{user?.role === 'seller' && <small>{item.seller} · </small>}€{(item.price * item.quantity).toFixed(2)}</span></div>)}</div><footer><span>Plaćanje: <b>Simulirano — uspješno</b></span><strong>€{displayedItems.reduce((sum, item) => sum + item.price * item.quantity, 0).toFixed(2)}</strong></footer>{status === 'U pripremi' && user?.role !== 'seller' && <button className="cancel-order" onClick={() => cancelOrder(order)}>Otkaži narudžbu</button>}{status === 'Dostavljena' && !order.review && user?.role === 'buyer' && <form className="review-form" onSubmit={(event) => { event.preventDefault(); leaveReview(order) }}><strong>Ostavite recenziju</strong><label>Ocjena <select value={reviewDrafts[order.id]?.rating ?? 5} onChange={(event) => setReviewDrafts((current) => ({ ...current, [order.id]: { rating: Number(event.target.value), text: current[order.id]?.text ?? '' } }))}>{[5, 4, 3, 2, 1].map((rating) => <option key={rating} value={rating}>{rating} zvjezdica</option>)}</select></label><label className="review-text">Vaše iskustvo <input required minLength={4} value={reviewDrafts[order.id]?.text ?? ''} onChange={(event) => setReviewDrafts((current) => ({ ...current, [order.id]: { rating: current[order.id]?.rating ?? 5, text: event.target.value } }))} placeholder="Kratko opišite kupnju i prodavača" /></label><button type="submit">Pošalji recenziju</button></form>}{order.review && <p className="review-saved">Vaša recenzija: {'★'.repeat(order.review.rating)} — {order.review.text}</p>}</article>})}</div> : <div className="empty-panel"><span>📦</span><h2>Još nema narudžbi</h2><p>Nakon kupnje ovdje ćeš pratiti stanje narudžbe i dostave.</p><button className="button-primary" onClick={() => setPage('shop')}>Otvori tržnicu <span>↗</span></button></div>}</main>}

      {page === 'dashboard' && user && <main className="app-page"><div className="page-heading"><div><div className="eyebrow">RADNI PROSTOR · {labelForRole[user.role].toLocaleUpperCase('hr')}</div><h1>{user.role === 'admin' ? 'Pregled tržnice.' : user.role === 'seller' ? 'Moja prodaja.' : 'Moj pregled.'}</h1><p>Podaci i radnje demonstriraju sučelje na lokalnim podacima ovog preglednika.</p></div><label className="role-switch"><span>Demo uloga</span><select value={user.role} onChange={(event) => setUser({ ...user, role: event.target.value as Role })}><option value="buyer">Kupac</option><option value="seller">Prodavač</option><option value="admin">Administrator</option></select></label></div><div className="dashboard-metrics"><article><span>{user.role === 'buyer' ? 'MOJE NARUDŽBE' : 'NARUDŽBE'}</span><strong>{visibleOrders.length}</strong><small>{user.role === 'seller' ? 'Samo stavke iz tvojih narudžbi' : 'Ukupan broj u demo profilu'}</small></article><article><span>{user.role === 'admin' ? 'AKTIVNI PROIZVODI' : 'MOJI PROIZVODI'}</span><strong>{sellerProducts.filter((product) => product.active).length}</strong><small>{sellerProducts.reduce((sum, product) => sum + product.stock, 0)} komada na zalihi</small></article><article><span>{user.role === 'seller' ? 'VRIJEDNOST PRODAJE' : 'VRIJEDNOST NARUDŽBI'}</span><strong>€{roleSales.toFixed(2)}</strong><small>{user.role === 'seller' ? 'Samo tvoje stavke u narudžbama' : 'Simulirani promet'}</small></article><article><span>OBAVIJESTI</span><strong>{unreadCount}</strong><small>Spremljene u ovom pregledniku</small></article></div>{user.role === 'buyer' ? <section className="dashboard-panel"><div className="panel-title"><div><h2>Preporuke za kupca</h2><p>Prijedlozi su objašnjeni kategorijom i ocjenama iz demo kataloga.</p></div></div><div className="buyer-recos">{activeProducts.slice(0, 4).map((product) => <div key={product.id}><span>{product.image}</span><b>{product.name}</b><small>Popularno u kategoriji {product.category} · ★ {product.rating.toFixed(1)}</small></div>)}</div></section> : <section className="dashboard-panel"><div className="panel-title"><div><h2>{user.role === 'admin' ? 'Moderiranje kataloga' : 'Upravljanje proizvodima'}</h2><p>{user.role === 'seller' ? 'Uređuj zalihu i status samo svojih artikala.' : 'Pregled svih aktivnih i uklonjenih artikala na tržnici.'}</p></div>{user.role === 'seller' && <button className="button-primary" onClick={() => setShowNewProduct(!showNewProduct)}>＋ Dodaj proizvod</button>}</div>{showNewProduct && user.role === 'seller' && <form className="new-product-form" onSubmit={addProduct}><label>Naziv<input name="name" required minLength={3} placeholder="Naziv proizvoda" /></label><label>Kategorija<select name="category">{categories.slice(1).map((item) => <option key={item}>{item}</option>)}</select></label><label>Cijena (€)<input name="price" type="number" min="0.01" step="0.01" required /></label><label>Zaliha<input name="stock" type="number" min="0" required defaultValue="1" /></label><label>Grad<select name="city">{cities.slice(1).map((item) => <option key={item}>{item}</option>)}</select></label><label>Stanje<select name="condition">{conditions.slice(1).map((item) => <option key={item}>{item}</option>)}</select></label><button type="submit" className="auth-submit">Objavi proizvod</button></form>}<div className="inventory-list">{sellerProducts.map((product) => <article key={product.id}><span className={`inventory-art ${product.tone}`}>{product.image}</span><div><strong>{product.name}</strong><small>{product.seller} · {product.city} · €{product.price.toFixed(2)}</small></div><label>Zaliha<input type="number" min="0" value={product.stock} onChange={(event) => updateStock(product.id, Number(event.target.value))} /></label><span className={product.active ? 'inventory-active' : 'inventory-removed'}>{product.active ? 'Aktivan' : 'Skriven'}</span><button className="subtle-action" onClick={() => setProducts((current) => current.map((item) => item.id === product.id ? { ...item, active: !item.active } : item))}>{user.role === 'admin' ? (product.active ? 'Ukloni' : 'Vrati') : (product.active ? 'Sakrij' : 'Objavi')}</button></article>)}</div></section>}</main>}

      {page === 'dashboard' && user && <SalesChart orders={visibleOrders} role={user.role} userId={user.id} />}

      {bidAuctionId !== null && <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setBidAuctionId(null) }}><section className="app-modal" role="dialog" aria-modal="true" aria-labelledby="auction-bid-title"><button className="modal-close" aria-label="Zatvori" onClick={() => setBidAuctionId(null)}>×</button><div className="eyebrow">PONUDA ZA AUKCIJU</div><h2 id="auction-bid-title">Daj svoju ponudu</h2><p>{auctionLots.find((lot) => lot.id === bidAuctionId)?.title}</p><form className="app-form" onSubmit={submitAuctionBid}><label>Iznos ponude (€)<input type="number" min={(auctionUpdates[bidAuctionId]?.bid ?? auctionLots.find((lot) => lot.id === bidAuctionId)?.bid ?? 0) + 5} step="1" required value={auctionBidAmount} onChange={(event) => setAuctionBidAmount(event.target.value)} /></label><small>Minimalna ponuda je 5 € iznad trenutačne. Sprema se samo u ovom pregledniku.</small><button className="auth-submit" type="submit">Potvrdi ponudu <span>→</span></button></form></section></div>}

      {authOpen && <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) { setAuthOpen(false); setAuthReturnToCheckout(false) } }}><section className="app-modal auth-modal" role="dialog" aria-modal="true" aria-labelledby="auth-title"><button className="modal-close" aria-label="Zatvori" onClick={() => { setAuthOpen(false); setAuthReturnToCheckout(false) }}>×</button><span className="brand-mark">m</span><div className="eyebrow">MARKETLINK DEMO RAČUN</div><h2 id="auth-title">Prijava i korisnička uloga</h2><p>Unesi podatke za lokalni demo. Ne postoji stvarna autentikacija ni pohrana lozinke.</p><form className="app-form" onSubmit={handleSignIn}><label>Email<input type="email" required value={authEmail} onChange={(event) => setAuthEmail(event.target.value)} placeholder="ime@primjer.hr" /></label><label>Ime za prikaz<input value={authName} onChange={(event) => setAuthName(event.target.value)} placeholder="Nije obavezno" /></label><label>Demo uloga<select value={authRole} onChange={(event) => setAuthRole(event.target.value as Role)}><option value="buyer">Kupac — košarica, narudžbe i recenzije</option><option value="seller">Prodavač — samo vlastiti proizvodi i stavke narudžbi</option><option value="admin">Administrator — upravljanje katalogom</option></select></label><button type="submit" className="auth-submit">Nastavi kao {labelForRole[authRole].toLocaleLowerCase('hr')} <span>↗</span></button></form><small className="demo-disclaimer">Frontend prototip: prijava se simulira i uloga služi samo za prikaz odgovarajućeg sučelja.</small></section></div>}

      {checkoutOpen && <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget && !paymentProcessing) setCheckoutOpen(false) }}><section className="app-modal checkout-modal" role="dialog" aria-modal="true" aria-labelledby="checkout-title"><button className="modal-close" aria-label="Zatvori" disabled={paymentProcessing} onClick={() => setCheckoutOpen(false)}>×</button><div className="eyebrow">POTVRDA NARUDŽBE</div><h2 id="checkout-title">Plaćanje</h2><p>Pregledaj stavke i odaberi ishod simulacije. Ne tražimo niti obrađujemo podatke kartice.</p><div className="checkout-items">{cartItems.map(({ line, product }) => <div key={product.id}><span>{product.name} <small>× {line.quantity}</small><em>Prodavač: {product.seller}</em></span><b>€{(product.price * line.quantity).toFixed(2)}</b></div>)}</div><div className="checkout-total"><span>Ukupno</span><strong>€{cartTotal.toFixed(2)}</strong></div><form className="app-form" onSubmit={completePayment}><label>Scenarij plaćanja za demonstraciju<select value={paymentOutcome} onChange={(event) => setPaymentOutcome(event.target.value as typeof paymentOutcome)} disabled={paymentProcessing}><option value="success">Uspješno</option><option value="declined">Odbijeno</option><option value="timeout">Istek vremena</option></select></label>{paymentMessage && <p className="payment-message" role="status">{paymentMessage}</p>}<button className="auth-submit" type="submit" disabled={paymentProcessing}>{paymentProcessing ? 'Obrada…' : 'Potvrdi simulirano plaćanje'} <span>↗</span></button></form></section></div>}


      {toast && <div className="toast" role="status">{toast}<button aria-label="Zatvori obavijest" onClick={() => setToast('')}>×</button></div>}
    </div>
  )
}

export default App
