import { useEffect, useMemo, useState } from 'react'
import { Link, Route, Routes, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis } from 'recharts'
import { ArrowRight, ArrowUpRight, Check, ChevronDown, ChevronRight, Heart, Menu, Minus, Plus, Search, ShoppingBag, SlidersHorizontal, Sparkles, Star, X } from 'lucide-react'
import { isAxiosError } from 'axios'
import type { FormEvent } from 'react'
import { categories, formatPrice, imageUrl, lifestyles, products, type Product } from './data'
import { api, fetchProducts } from './api'

type BagItem = { id: string; quantity: number }
const navItems = ['New In', 'Men', 'Women', 'Electronics', 'Home', 'Beauty', 'Sports', 'Collections', 'Deals']

function App() {
  const [cart, setCart] = useState<BagItem[]>(() => JSON.parse(localStorage.getItem('nexora-cart') || '[]'))
  const [wishlist, setWishlist] = useState<string[]>(() => JSON.parse(localStorage.getItem('nexora-wishlist') || '[]'))
  const [searchOpen, setSearchOpen] = useState(false)
  const [cartOpen, setCartOpen] = useState(false)
  const [accountOpen, setAccountOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [toast, setToast] = useState('')
  const navigate = useNavigate()

  useEffect(() => localStorage.setItem('nexora-cart', JSON.stringify(cart)), [cart])
  useEffect(() => localStorage.setItem('nexora-wishlist', JSON.stringify(wishlist)), [wishlist])
  useEffect(() => {
    if (!toast) return
    const timer = window.setTimeout(() => setToast(''), 2400)
    return () => window.clearTimeout(timer)
  }, [toast])

  const addToCart = (id: string) => {
    const quantity = (cart.find(item => item.id === id)?.quantity ?? 0) + 1
    setCart(current => current.some(item => item.id === id)
      ? current.map(item => item.id === id ? { ...item, quantity: item.quantity + 1 } : item)
      : [...current, { id, quantity: 1 }])
    setToast('Added to your bag')
    if (localStorage.getItem('nexora-token')) {
      api.put(`/cart/${id}`, { quantity }).catch(error => {
        setToast(isAxiosError<{ error?: string }>(error) ? error.response?.data.error ?? 'Could not sync your bag.' : 'Could not sync your bag.')
      })
    }
  }
  const changeQuantity = (id: string, delta: number) => {
    const quantity = Math.max(0, (cart.find(item => item.id === id)?.quantity ?? 0) + delta)
    setCart(current => current.map(item => item.id === id ? { ...item, quantity: item.quantity + delta } : item).filter(item => item.quantity > 0))
    if (localStorage.getItem('nexora-token')) {
      api.put(`/cart/${id}`, { quantity }).catch(error => {
        setToast(isAxiosError<{ error?: string }>(error) ? error.response?.data.error ?? 'Could not sync your bag.' : 'Could not sync your bag.')
      })
    }
  }
  const toggleWishlist = (id: string) => {
    setWishlist(current => current.includes(id) ? current.filter(item => item !== id) : [...current, id])
    setToast(wishlist.includes(id) ? 'Removed from saved items' : 'Saved to your wishlist')
  }
  const search = (value = query) => {
    if (!value.trim()) return
    const recent: string[] = JSON.parse(localStorage.getItem('nexora-searches') || '[]')
    localStorage.setItem('nexora-searches', JSON.stringify([value.trim(), ...recent.filter(item => item !== value.trim())].slice(0, 5)))
    setSearchOpen(false)
    navigate(`/search?q=${encodeURIComponent(value.trim())}`)
  }

  return (
    <div className="app-shell">
      <div className="announcement">A little more to love — complimentary delivery over ₹999 <span>·</span> easy returns <span>·</span> made for you</div>
      <header className="site-header">
        <button className="icon-button mobile-menu-toggle" aria-label="Open menu" onClick={() => setMenuOpen(!menuOpen)}>{menuOpen ? <X /> : <Menu />}</button>
        <Link className="wordmark" to="/" aria-label="Nexora home">nexora<span>®</span></Link>
        <nav className={`main-nav ${menuOpen ? 'nav-open' : ''}`}>
          {navItems.map(item => <Link key={item} to={item === 'Deals' ? '/shop?sort=discount' : `/shop?category=${encodeURIComponent(item === 'New In' ? '' : item)}`} onClick={() => setMenuOpen(false)}>{item}</Link>)}
        </nav>
        <div className="header-actions">
          <button className="icon-button" aria-label="Search" onClick={() => setSearchOpen(true)}><Search /></button>
          <button className="icon-button account-action" aria-label="Account" onClick={() => setAccountOpen(true)}><span className="action-label">Account</span><span className="account-dot">A</span></button>
          <button className="icon-button" aria-label="Wishlist" onClick={() => navigate('/wishlist')}><Heart /><span className="action-label">Saved</span>{wishlist.length > 0 && <span className="count-badge">{wishlist.length}</span>}</button>
          <button className="icon-button" aria-label="Shopping bag" onClick={() => setCartOpen(true)}><ShoppingBag /><span className="action-label">Bag</span>{cart.reduce((sum, item) => sum + item.quantity, 0) > 0 && <span className="count-badge">{cart.reduce((sum, item) => sum + item.quantity, 0)}</span>}</button>
        </div>
      </header>

      <Routes>
        <Route path="/" element={<Home addToCart={addToCart} wishlist={wishlist} toggleWishlist={toggleWishlist} />} />
        <Route path="/shop" element={<Shop addToCart={addToCart} wishlist={wishlist} toggleWishlist={toggleWishlist} />} />
        <Route path="/search" element={<SearchResults addToCart={addToCart} wishlist={wishlist} toggleWishlist={toggleWishlist} />} />
        <Route path="/product/:id" element={<ProductPage addToCart={addToCart} wishlist={wishlist} toggleWishlist={toggleWishlist} />} />
        <Route path="/collection/:name" element={<CollectionPage addToCart={addToCart} wishlist={wishlist} toggleWishlist={toggleWishlist} />} />
        <Route path="/wishlist" element={<WishlistPage wishlist={wishlist} toggleWishlist={toggleWishlist} addToCart={addToCart} />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Footer />

      {searchOpen && <SearchModal value={query} setValue={setQuery} onClose={() => setSearchOpen(false)} onSearch={search} />}
      {cartOpen && <CartDrawer cart={cart} onClose={() => setCartOpen(false)} changeQuantity={changeQuantity} onShop={() => { setCartOpen(false); navigate('/shop') }} onCheckout={async () => {
        if (!localStorage.getItem('nexora-token')) { setCartOpen(false); setAccountOpen(true); setToast('Sign in before checkout'); return }
        try {
          await api.post('/orders')
          setCart([])
          setCartOpen(false)
          setToast('Order placed. Thank you for shopping with us.')
        } catch (error) {
          setToast(isAxiosError<{ error?: string }>(error) ? error.response?.data.error ?? 'Checkout could not be completed.' : 'Checkout could not be completed.')
        }
      }} />}
      {accountOpen && <AccountModal onClose={() => setAccountOpen(false)} onAuthenticated={async () => {
        for (const item of cart) await api.put(`/cart/${item.id}`, { quantity: item.quantity })
      }} />}
      {toast && <div className="toast"><Check size={17} />{toast}</div>}
    </div>
  )
}

type ProductActions = { addToCart: (id: string) => void; wishlist: string[]; toggleWishlist: (id: string) => void }

function ProductCard({ product, addToCart, wishlist, toggleWishlist }: ProductActions & { product: Product }) {
  const discount = Math.round((1 - product.price / product.originalPrice) * 100)
  return <article className="product-card">
    <div className="product-image-wrap">
      <Link to={`/product/${product.id}`} className="product-image-link">
        <img className="product-image" src={imageUrl(product.image, 700)} alt={product.name} loading="lazy" />
        {product.imageHover && <img className="product-image product-image-hover" src={imageUrl(product.imageHover, 700)} alt="" loading="lazy" />}
      </Link>
      {product.badge && <span className={`product-badge ${product.badge === 'SALE' ? 'sale-badge' : ''}`}>{product.badge}</span>}
      <button className={`wish-button ${wishlist.includes(product.id) ? 'is-saved' : ''}`} onClick={() => toggleWishlist(product.id)} aria-label="Save to wishlist"><Heart size={17} fill={wishlist.includes(product.id) ? 'currentColor' : 'none'} /></button>
      <button className="quick-add" onClick={() => addToCart(product.id)}>Quick add <Plus size={15} /></button>
    </div>
    <div className="product-info">
      <div className="product-brand">{product.brand}<span className="product-rating"><Star size={12} fill="currentColor" /> {product.rating}</span></div>
      <Link to={`/product/${product.id}`} className="product-name">{product.name}</Link>
      <div className="price-row"><strong>{formatPrice(product.price)}</strong><del>{formatPrice(product.originalPrice)}</del><span className="discount-label">{discount}% off</span></div>
      {product.colors && <div className="swatches">{product.colors.map(color => <span key={color} style={{ backgroundColor: color }} />)}</div>}
    </div>
  </article>
}

function ProductGrid({ items, ...actions }: ProductActions & { items: Product[] }) {
  return <div className="product-grid">{items.map(product => <ProductCard key={product.id} product={product} {...actions} />)}</div>
}

function SectionHeading({ eyebrow, title, action = 'View all', href = '/shop' }: { eyebrow?: string; title: string; action?: string; href?: string }) {
  return <div className="section-heading">{eyebrow && <span className="eyebrow">{eyebrow}</span>}<div className="heading-line"><h2>{title}</h2><Link to={href} className="text-link">{action}<ArrowUpRight size={16} /></Link></div></div>
}

function Home(props: ProductActions) {
  const [seconds, setSeconds] = useState(4 * 60 * 60 + 32 * 60 + 18)
  const [newsletterStatus, setNewsletterStatus] = useState('')
  useEffect(() => { const timer = window.setInterval(() => setSeconds(value => value > 0 ? value - 1 : 0), 1000); return () => window.clearInterval(timer) }, [])
  const deal = products[0]
  return <main>
    <section className="hero">
      <img className="hero-image" src={imageUrl('photo-1523275335684-37898b6baf30', 2200)} alt="A considered selection of everyday essentials" />
      <div className="hero-shade" />
      <div className="hero-content"><span className="eyebrow light-eyebrow"><span className="live-dot" /> THE NEXORA EDIT — NO. 08</span><h1>Designed for<br /><em>everyday life.</em></h1><p>Good things for the way you live. Thoughtfully chosen, always a little unexpected.</p><div className="hero-buttons"><Link className="button button-light" to="/shop">Shop the edit <ArrowRight size={16} /></Link><Link className="hero-secondary" to="/shop">Find your something <ArrowUpRight size={15} /></Link></div></div>
      <div className="hero-index">01 <span /> 04</div>
      <div className="hero-caption">OBJECTS WITH A LITTLE MORE THOUGHT.</div>
    </section>

    <section className="promise-strip"><span>Considered, not crowded</span><i /><span>Good design, fair prices</span><i /><span>A delivery you can count on</span><i /><span>Here when you need us</span></section>

    <section className="section-container categories-section"><SectionHeading eyebrow="A GOOD PLACE TO START" title="Find your kind of thing." action="Explore everything" /><div className="category-grid">{categories.map((category, index) => <Link to={`/shop?category=${encodeURIComponent(category.name)}`} className={`category-card category-${index}`} key={category.name}><img src={imageUrl(category.image, 850)} alt="" loading="lazy" /><div className="category-overlay" /><div className="category-copy"><span>{category.note}</span><h3>{category.name}</h3></div><span className="circle-arrow"><ArrowUpRight size={17} /></span></Link>)}</div></section>

    <section className="section-container trending-section"><SectionHeading eyebrow="THE THINGS WE KEEP COMING BACK TO" title="Currently on our minds." action="Shop what’s trending" /><ProductGrid items={products.slice(0, 4)} {...props} /></section>

    <section className="deal-section"><div className="deal-image"><img src={imageUrl(deal.image, 1100)} alt={deal.name} /><span className="deal-stamp">A GOOD<br />FIND <Sparkles size={16} /></span></div><div className="deal-content"><span className="eyebrow">THE DAILY FIND · TODAY ONLY</span><h2>A little more<br />listening, a little<br /><em>less noise.</em></h2><p>Thoughtful sound that makes your everyday feel like yours. Our pick for a better commute, a slower Sunday and everything in between.</p><div className="deal-price"><strong>{formatPrice(deal.price)}</strong><del>{formatPrice(deal.originalPrice)}</del><span>{Math.round((1 - deal.price / deal.originalPrice) * 100)}% off</span></div><div className="countdown"><span>ENDS IN</span><b>{String(Math.floor(seconds / 3600)).padStart(2, '0')}</b>:<b>{String(Math.floor(seconds % 3600 / 60)).padStart(2, '0')}</b>:<b>{String(seconds % 60).padStart(2, '0')}</b></div><button className="button button-dark" onClick={() => props.addToCart(deal.id)}>Make it yours <ArrowRight size={16} /></button></div></section>

    <section className="section-container new-arrivals"><SectionHeading eyebrow="JUST FOUND ITS WAY HERE" title="New things, good timing." action="See all new in" href="/shop?sort=newest" /><ProductGrid items={products.slice(4, 8)} {...props} /></section>

    <section className="lifestyle-section"><div className="section-container"><SectionHeading eyebrow="A FEW IDEAS TO GET YOU GOING" title="Shop by the moment." action="All the edits" /></div><div className="lifestyle-track">{lifestyles.map((life, i) => <Link className={`lifestyle-card life-${i}`} to={`/collection/${encodeURIComponent(life.name.toLowerCase().replaceAll(' ', '-'))}`} key={life.name}><img src={imageUrl(life.image, 950)} alt="" loading="lazy" /><div className="life-shade" /><span className="life-number">0{i + 1} / THE NEXORA EDIT</span><div className="life-copy"><h3>{life.name}</h3><p>{life.text}</p></div><span className="life-arrow"><ArrowUpRight size={19} /></span></Link>)}</div></section>

    <section className="editorial section-container"><div className="editorial-photo"><img src={imageUrl('photo-1519389950473-47ba0277781c', 1200)} alt="A workspace that works wherever you do" /><span className="photo-note">WORK, WHEREVER.</span></div><div className="editorial-copy"><span className="eyebrow">A LITTLE LESS FRICTION, A LOT MORE FLOW</span><h2>Tech that<br />moves with <em>you.</em></h2><p>The best technology isn't just clever. It fits right into your day. Meet the pieces that make every in-between moment work a little better.</p><Link className="button button-dark" to="/shop?category=Electronics">Meet your new sidekick <ArrowRight size={16} /></Link><div className="editorial-counter">THE NEXORA JOURNAL <span>—</span> 04 / 12</div></div><div className="editorial-side-note">OBJECTS FOR A LIFE IN MOTION · EST. 2024</div></section>

    <section className="section-container bestseller-section"><SectionHeading eyebrow="THE COMMUNITY HAS GOOD TASTE" title="Well-loved, for good reason." action="Shop best sellers" /><ProductGrid items={[products[10], products[11], products[8], products[9]]} {...props} /></section>
    <section className="newsletter"><div className="newsletter-mark">N.</div><span className="eyebrow">A NOTE FROM US, NOW AND THEN</span><h2>Good things in your<br /><em>inbox.</em></h2><p>New finds, thoughtful edits and the occasional very good deal. Never the noise.</p><form onSubmit={async event => { event.preventDefault(); const email = new FormData(event.currentTarget).get('email'); try { await api.post('/newsletter', { email }); setNewsletterStatus('You’re on the list. Look out for a note from us soon.') } catch { setNewsletterStatus('The signup service is offline for now. Please try again later.') } }}><input name="email" type="email" placeholder="Your email address" required aria-label="Email address" /><button aria-label="Subscribe"><ArrowRight size={18} /></button></form><small>{newsletterStatus || 'By subscribing, you agree to our Privacy Policy.'}</small></section>
  </main>
}

function Shop({ addToCart, wishlist, toggleWishlist }: ProductActions) {
  const [params, setParams] = useSearchParams()
  const initialCategory = params.get('category') || ''
  const [category, setCategory] = useState(initialCategory)
  const [sort, setSort] = useState(params.get('sort') || 'recommended')
  const [maxPrice, setMaxPrice] = useState(70000)
  const [minRating, setMinRating] = useState(0)
  const [mobileFilters, setMobileFilters] = useState(false)
  const [catalog, setCatalog] = useState(products)
  const categoriesList = ['All things', 'Electronics', 'Audio', 'Laptops', 'Men', 'Women', 'Footwear', 'Bags', 'Watches', 'Beauty', 'Home', 'Fitness']
  useEffect(() => { setCategory(initialCategory) }, [initialCategory])
  useEffect(() => {
    let active = true
    fetchProducts().then(items => { if (active && items.length) setCatalog(items) }).catch(error => console.warn('Using the demo catalog because the API is unavailable:', error))
    return () => { active = false }
  }, [])
  const visible = useMemo(() => {
    let result = catalog.filter(product => (!category || category === 'All things' || product.category.toLowerCase().includes(category.toLowerCase()) || category.toLowerCase() === 'fashion' && ['Men', 'Women', 'Footwear'].includes(product.category)) && product.price <= maxPrice && product.rating >= minRating)
    if (sort === 'newest') result = [...result].reverse()
    if (sort === 'price-low') result = [...result].sort((a, b) => a.price - b.price)
    if (sort === 'price-high') result = [...result].sort((a, b) => b.price - a.price)
    if (sort === 'rating') result = [...result].sort((a, b) => b.rating - a.rating)
    if (sort === 'discount') result = [...result].sort((a, b) => (1 - b.price / b.originalPrice) - (1 - a.price / a.originalPrice))
    return result
  }, [catalog, category, maxPrice, minRating, sort])
  return <main className="shop-page"><div className="shop-intro"><div className="breadcrumb"><Link to="/">Home</Link><ChevronRight size={13} /> Shop</div><span className="eyebrow">A LITTLE OF EVERYTHING, A LOT OF GOOD</span><h1>Good things,<br /><em>all in one place.</em></h1><p>Find something useful. Find something lovely. Find the thing you didn't know you were looking for.</p></div>
    <div className="shop-toolbar"><span>{visible.length} good finds</span><div className="shop-tools"><button className="filter-toggle" onClick={() => setMobileFilters(true)}><SlidersHorizontal size={15} /> Filter & sort</button><label>Sort by <select value={sort} onChange={event => { setSort(event.target.value); setParams(current => { current.set('sort', event.target.value); return current }) }}><option value="recommended">Recommended</option><option value="newest">Newest</option><option value="price-low">Price: low to high</option><option value="price-high">Price: high to low</option><option value="rating">Highest rated</option><option value="discount">Biggest discount</option></select><ChevronDown size={14} /></label></div></div>
    <div className="shop-layout"><aside className={`filter-sidebar ${mobileFilters ? 'filter-open' : ''}`}><div className="filter-mobile-head">Filter & sort <button className="icon-button" onClick={() => setMobileFilters(false)}><X /></button></div><div className="filter-group"><h3>Category</h3>{categoriesList.map(item => <button key={item} className={`filter-option ${category === (item === 'All things' ? '' : item) ? 'selected' : ''}`} onClick={() => { setCategory(item === 'All things' ? '' : item); setParams(item === 'All things' ? {} : { category: item }) }}><span>{item}</span>{category === item && <Check size={14} />}</button>)}</div><div className="filter-group"><h3>Price range</h3><div className="price-range-label"><span>₹0</span><span>{formatPrice(maxPrice)}</span></div><input type="range" min="1000" max="70000" step="1000" value={maxPrice} onChange={event => setMaxPrice(Number(event.target.value))} /></div><div className="filter-group"><h3>Customer rating</h3>{[4.5, 4, 3.5].map(rate => <button className={`filter-option ${minRating === rate ? 'selected' : ''}`} key={rate} onClick={() => setMinRating(minRating === rate ? 0 : rate)}><span className="stars">{rate}+ <Star size={13} fill="currentColor" /></span></button>)}</div><button className="clear-filters" onClick={() => { setCategory(''); setMaxPrice(70000); setMinRating(0); setSort('recommended'); setParams({}) }}>Clear all filters</button><button className="button button-dark apply-filter" onClick={() => setMobileFilters(false)}>Show {visible.length} finds</button></aside>{mobileFilters && <button className="drawer-scrim filter-scrim" onClick={() => setMobileFilters(false)} aria-label="Close filters" />}
      <div className="shop-results">{visible.length ? <ProductGrid items={visible} addToCart={addToCart} wishlist={wishlist} toggleWishlist={toggleWishlist} /> : <div className="empty-state"><span>NOTHING HERE JUST YET</span><h2>Try a different filter.</h2><button className="text-link" onClick={() => { setCategory(''); setMinRating(0); setMaxPrice(70000) }}>Show me everything <ArrowRight size={15} /></button></div>}</div></div>
  </main>
}

function SearchResults(props: ProductActions) {
  const [params] = useSearchParams()
  const q = params.get('q') || ''
  const [catalog, setCatalog] = useState(products)
  useEffect(() => {
    let active = true
    fetchProducts({ search: q }).then(items => { if (active) setCatalog(items) }).catch(error => console.warn('Using the demo catalog because the API is unavailable:', error))
    return () => { active = false }
  }, [q])
  const matches = catalog.filter(product => `${product.name} ${product.brand} ${product.category} ${product.description}`.toLowerCase().includes(q.toLowerCase()))
  return <main className="search-results-page"><div className="breadcrumb"><Link to="/">Home</Link><ChevronRight size={13} /> Search</div><span className="eyebrow">A GOOD PLACE TO LOOK</span><h1>Results for <em>“{q}”</em></h1><p>{matches.length} {matches.length === 1 ? 'find' : 'finds'} worth a look</p>{matches.length ? <ProductGrid items={matches} {...props} /> : <div className="empty-state"><h2>No matches this time.</h2><p>Try a brand, a category or something a little less specific.</p><Link className="button button-dark" to="/shop">Explore everything</Link></div>}</main>
}

function ProductPage({ addToCart, wishlist, toggleWishlist }: ProductActions) {
  const { id } = useParams()
  const product = products.find(item => item.id === id)
  const [quantity, setQuantity] = useState(1)
  const [activeImage, setActiveImage] = useState(0)
  const [selectedVariant, setSelectedVariant] = useState('')
  if (!product) return <NotFound />
  const imgs = [product.image, ...(product.imageHover ? [product.imageHover] : [])]
  const variantLabel = ['Footwear'].includes(product.category) ? 'Select your size' : ['Men', 'Women'].includes(product.category) ? 'Select a size' : product.category === 'Watches' ? 'Strap' : product.colors?.length ? 'Color' : ''
  const variants = variantLabel.includes('size') ? ['XS', 'S', 'M', 'L', 'XL'] : variantLabel === 'Strap' ? ['Classic leather', 'Steel mesh'] : product.colors?.length ? product.colors.map((_, i) => `Option ${i + 1}`) : []
  return <main className="product-page"><div className="breadcrumb"><Link to="/">Home</Link><ChevronRight size={13} /><Link to="/shop">Shop</Link><ChevronRight size={13} />{product.name}</div><div className="product-detail"><div className="gallery"><div className="gallery-thumbs">{imgs.map((img, i) => <button key={img} className={activeImage === i ? 'thumb-active' : ''} onClick={() => setActiveImage(i)}><img src={imageUrl(img, 220)} alt="" /></button>)}</div><div className="gallery-main"><img src={imageUrl(imgs[activeImage], 1300)} alt={product.name} /><span className="gallery-note">A CLOSER LOOK · NEXORA EDITION</span></div></div><div className="product-details-copy"><div className="breadcrumb"><Link to="/shop">{product.category}</Link> <span>·</span> {product.brand}</div><span className="eyebrow">{product.brand.toUpperCase()} / EVERYDAY OBJECTS</span><h1>{product.name}</h1><div className="detail-rating"><span><Star size={14} fill="currentColor" /> {product.rating}</span> <a href="#reviews">{product.reviews} thoughtful reviews</a></div><div className="detail-price"><strong>{formatPrice(product.price)}</strong><del>{formatPrice(product.originalPrice)}</del><span>{Math.round((1 - product.price / product.originalPrice) * 100)}% off</span></div><small className="tax-note">Inclusive of all taxes. Easy returns within 7 days.</small><p className="detail-description">{product.description}</p>{variantLabel && <div className="variant-group"><div className="variant-label">{variantLabel} <span>{selectedVariant && `· ${selectedVariant}`}</span></div><div className="variant-options">{variants.map(variant => <button key={variant} className={selectedVariant === variant ? 'variant-selected' : ''} onClick={() => setSelectedVariant(variant)}>{variant}</button>)}</div></div>}<div className="stock-status"><span /> In stock — ready to make its way to you</div><div className="detail-actions"><div className="quantity-control"><button aria-label="Decrease quantity" onClick={() => setQuantity(Math.max(1, quantity - 1))}><Minus size={14} /></button>{quantity}<button aria-label="Increase quantity" onClick={() => setQuantity(quantity + 1)}><Plus size={14} /></button></div><button className="button button-dark add-bag" onClick={() => { if (variants.length && !selectedVariant) { setSelectedVariant(variants[0]); return } for (let i = 0; i < quantity; i++) addToCart(product.id) }}>Add to bag — {formatPrice(product.price * quantity)} <ArrowRight size={16} /></button><button className={`detail-wish ${wishlist.includes(product.id) ? 'is-saved' : ''}`} aria-label="Save item" onClick={() => toggleWishlist(product.id)}><Heart size={19} fill={wishlist.includes(product.id) ? 'currentColor' : 'none'} /></button></div><div className="delivery-card"><div><span className="delivery-icon">01</span><p><strong>A delivery that fits your day</strong><small>Free delivery on orders over ₹999</small></p></div><div><span className="delivery-icon">02</span><p><strong>Easy does it</strong><small>7-day returns, no awkward questions</small></p></div></div><details className="product-accordion"><summary>A few more details <Plus size={15} /></summary><p>Thoughtfully selected for everyday use. Your order is carefully packed and delivered with care. Contact our team any time if you need help choosing.</p></details><details className="product-accordion"><summary>Shipping & returns <Plus size={15} /></summary><p>Complimentary standard delivery on orders over ₹999. Easy returns within 7 days of delivery, provided the item is unused and in its original packaging.</p></details></div></div><section className="section-container product-recommendations"><SectionHeading eyebrow="A FEW GOOD COMPANIONS" title="You might like these, too." /><ProductGrid items={products.filter(item => item.id !== product.id).slice(0, 4)} addToCart={addToCart} wishlist={wishlist} toggleWishlist={toggleWishlist} /></section></main>
}

function CollectionPage(props: ProductActions) {
  const { name = '' } = useParams()
  const life = lifestyles.find(item => item.name.toLowerCase().replaceAll(' ', '-') === name)
  const title = life?.name ?? name.replaceAll('-', ' ').toUpperCase()
  const matches = products.filter(product => life?.category ? product.category === life.category : true).slice(0, 6)
  return <main className="collection-page"><div className="collection-hero" style={{ backgroundImage: `linear-gradient(90deg,rgba(20,23,21,.58),rgba(20,23,21,.04)),url("${imageUrl(life?.image ?? 'photo-1476514525535-07fb3b4ae5f1', 1800)}")` }}><span className="eyebrow light-eyebrow">THE NEXORA EDIT / A COLLECTION</span><h1>{title}<br /><em>has a good feeling.</em></h1><p>{life?.text ?? 'A few thoughtful picks for the moments that make a day.'}</p></div><section className="section-container collection-products"><SectionHeading eyebrow="PUT TOGETHER WITH YOU IN MIND" title="The good stuff." /><ProductGrid items={matches} {...props} /></section></main>
}

function WishlistPage({ wishlist, toggleWishlist, addToCart }: ProductActions) {
  const saved = products.filter(product => wishlist.includes(product.id))
  return <main className="wishlist-page"><span className="eyebrow">THE THINGS YOU'RE THINKING ABOUT</span><h1>Your saved <em>things.</em></h1><p>{saved.length} {saved.length === 1 ? 'good find' : 'good finds'}, waiting here.</p>{saved.length ? <ProductGrid items={saved} wishlist={wishlist} toggleWishlist={toggleWishlist} addToCart={addToCart} /> : <div className="empty-state"><Heart size={30} strokeWidth={1.4} /><h2>A little room for possibility.</h2><p>Tap the heart on anything that catches your eye. We'll keep it safe here.</p><Link to="/shop" className="button button-dark">Go find something <ArrowRight size={16} /></Link></div>}</main>
}

function SearchModal({ value, setValue, onClose, onSearch }: { value: string; setValue: (value: string) => void; onClose: () => void; onSearch: (value?: string) => void }) {
  const [recent, setRecent] = useState<string[]>(() => JSON.parse(localStorage.getItem('nexora-searches') || '[]'))
  const suggestions = value ? products.filter(p => `${p.name} ${p.brand} ${p.category}`.toLowerCase().includes(value.toLowerCase())).slice(0, 4) : []
  const clearRecent = () => { localStorage.removeItem('nexora-searches'); setRecent([]) }
  return <div className="modal-backdrop" onMouseDown={event => { if (event.target === event.currentTarget) onClose() }}><section className="search-modal"><div className="search-modal-top"><Link to="/" className="wordmark" onClick={onClose}>nexora<span>®</span></Link><button className="icon-button" onClick={onClose}><X /></button></div><form className="search-input-row" onSubmit={event => { event.preventDefault(); onSearch() }}><Search size={20} /><input autoFocus value={value} onChange={event => setValue(event.target.value)} placeholder="What are you looking for?" /><button type="submit"><ArrowRight size={18} /></button></form>{suggestions.length > 0 ? <div className="search-suggestions"><span className="eyebrow">THINGS THAT MIGHT BE IT</span>{suggestions.map(item => <Link to={`/product/${item.id}`} onClick={onClose} key={item.id}><img src={imageUrl(item.image, 100)} alt="" /><span>{item.name}<small>{item.brand} · {formatPrice(item.price)}</small></span><ArrowUpRight size={15} /></Link>)}</div> : <div className="search-modal-bottom">{recent.length > 0 && <div className="search-chips"><div className="search-label">RECENTLY LOOKED FOR <button onClick={clearRecent}>Clear</button></div>{recent.map(item => <button key={item} onClick={() => onSearch(item)}>{item}</button>)}</div>}<div className="search-chips"><div className="search-label">A FEW GOOD PLACES TO START</div>{['Headphones', 'Everyday bags', 'Home things', 'Sneakers'].map(item => <button key={item} onClick={() => onSearch(item)}>{item}</button>)}</div></div>}</section></div>
}

function CartDrawer({ cart, onClose, changeQuantity, onShop, onCheckout }: { cart: BagItem[]; onClose: () => void; changeQuantity: (id: string, delta: number) => void; onShop: () => void; onCheckout: () => void }) {
  const lineItems = cart.map(item => ({ ...item, product: products.find(product => product.id === item.id) })).filter(item => item.product)
  const subtotal = lineItems.reduce((sum, item) => sum + item.product!.price * item.quantity, 0)
  const remaining = Math.max(0, 999 - subtotal)
  return <div className="drawer-backdrop" onMouseDown={event => { if (event.target === event.currentTarget) onClose() }}><aside className="cart-drawer"><div className="drawer-heading"><div><span className="eyebrow">YOUR GOOD FINDS</span><h2>Your bag <span>({cart.reduce((sum, item) => sum + item.quantity, 0)})</span></h2></div><button className="icon-button" onClick={onClose}><X /></button></div>{lineItems.length ? <><div className="free-delivery-progress"><p>{remaining ? <>You're <strong>{formatPrice(remaining)}</strong> away from complimentary delivery.</> : <>Lovely. Your delivery is on us.</>}</p><div><span style={{ width: `${Math.min(100, subtotal / 999 * 100)}%` }} /></div></div><div className="cart-items">{lineItems.map(item => <div className="cart-line" key={item.id}><img src={imageUrl(item.product!.image, 260)} alt={item.product!.name} /><div className="cart-line-info"><span>{item.product!.brand}</span><h3>{item.product!.name}</h3><strong>{formatPrice(item.product!.price)}</strong><div className="quantity-control"><button onClick={() => changeQuantity(item.id, -1)}><Minus size={12} /></button>{item.quantity}<button onClick={() => changeQuantity(item.id, 1)}><Plus size={12} /></button></div></div><button className="remove-line" aria-label="Remove item" onClick={() => changeQuantity(item.id, -item.quantity)}><X size={15} /></button></div>)}</div><div className="cart-summary"><div><span>Subtotal</span><strong>{formatPrice(subtotal)}</strong></div><p>Taxes included. Delivery calculated at checkout.</p><button className="button button-dark checkout-button" onClick={onCheckout}>Continue to checkout <ArrowRight size={16} /></button><button className="continue-shopping" onClick={onShop}>Keep looking around</button></div></> : <div className="cart-empty"><ShoppingBag size={36} strokeWidth={1.3} /><h3>Nothing in here just yet.</h3><p>There's something good out there with your name on it.</p><button className="button button-dark" onClick={onShop}>Find your something <ArrowRight size={15} /></button></div>}</aside></div>
}

function AccountModal({ onClose, onAuthenticated }: { onClose: () => void; onAuthenticated: () => Promise<void> }) {
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [password, setPassword] = useState('')
  const [registering, setRegistering] = useState(false)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setBusy(true)
    setError('')
    try {
      const { data } = await api.post<{ token: string; user: { id: string; name: string; email: string; role: string } }>(registering ? '/auth/register' : '/auth/login', registering ? { name, email, password } : { email, password })
      localStorage.setItem('nexora-token', data.token)
      localStorage.setItem('nexora-user', JSON.stringify(data.user))
      await onAuthenticated()
      onClose()
    } catch (requestError) {
      setError(isAxiosError<{ error?: string }>(requestError) ? requestError.response?.data.error ?? 'We couldn’t reach your account just now. Check the API and try again.' : 'We couldn’t reach your account just now. Check the API and try again.')
    } finally {
      setBusy(false)
    }
  }
  return <div className="modal-backdrop" onMouseDown={event => { if (event.target === event.currentTarget) onClose() }}><section className="account-modal"><button className="icon-button account-close" onClick={onClose}><X /></button><span className="eyebrow">WELCOME TO YOUR LITTLE CORNER</span><h2>{registering ? 'Make yourself at home.' : 'Good to have you.'}</h2><p>{registering ? 'Create an account to keep your good finds close.' : 'Sign in for thoughtful updates, a saved list and a little less checkout.'}</p><form onSubmit={submit}>{registering && <><label>Your name</label><input value={name} onChange={event => setName(event.target.value)} placeholder="How should we call you?" minLength={2} required /> </>}<label>Email address</label><input type="email" value={email} onChange={event => setEmail(event.target.value)} placeholder="you@example.com" required /><label>Password</label><input type="password" value={password} onChange={event => setPassword(event.target.value)} placeholder="At least 8 characters" minLength={8} required />{error && <p className="form-error">{error}</p>}<button className="button button-dark" disabled={busy}>{busy ? 'One moment…' : registering ? 'Create your account' : 'Sign in'} <ArrowRight size={15} /></button></form><button className="account-switch" onClick={() => { setRegistering(!registering); setError('') }}>{registering ? 'Already have a little corner? Sign in' : 'New here? Create an account'}</button><small>Your details stay safe with us. Passwords are securely encrypted.</small></section></div>
}

function AdminPage() {
  type Overview = {
    orders: number
    grossSales: number
    customers: number
    products: number
    salesByDay: { day: string; sales: number }[]
    latestOrders: { orderNumber: string; status: string; total: number; user: { name: string }; items: { product: { name: string } }[] }[]
  }
  const [overview, setOverview] = useState<Overview | null>(null)
  const [apiError, setApiError] = useState('')
  useEffect(() => {
    api.get<Overview>('/admin/overview').then(response => setOverview(response.data)).catch(error => {
      setApiError(isAxiosError(error) && error.response?.status === 403 ? 'Sign in with an admin account to see live store data.' : 'Live store data is unavailable. Showing an illustrative preview.')
    })
  }, [])
  const chartData = overview?.salesByDay ?? [{ day: 'Mon', sales: 42000 }, { day: 'Tue', sales: 38000 }, { day: 'Wed', sales: 56000 }, { day: 'Thu', sales: 49000 }, { day: 'Fri', sales: 74000 }, { day: 'Sat', sales: 63000 }, { day: 'Sun', sales: 89000 }]
  const latestOrders = overview?.latestOrders.map(order => [order.orderNumber, order.user.name, order.items[0]?.product.name ?? 'Order', formatPrice(order.total), order.status]) ?? [['NX-2048', 'Aarav Mehta', 'Studio Wireless Headphones', '₹7,499', 'Processing'], ['NX-2047', 'Diya Kapoor', 'Everyday Leather Tote', '₹3,299', 'Shipped'], ['NX-2046', 'Ishaan Rao', 'Field Automatic Watch', '₹12,499', 'Delivered'], ['NX-2045', 'Myra Shah', 'Cloudfoam Daily Sneakers', '₹4,599', 'Processing']]
  const stats = [
    ['Gross sales', overview ? formatPrice(overview.grossSales) : '₹4,86,320'],
    ['Orders', overview?.orders.toLocaleString('en-IN') ?? '1,284'],
    ['Customers', overview?.customers.toLocaleString('en-IN') ?? '986'],
    ['Products live', overview?.products.toLocaleString('en-IN') ?? '12'],
  ]
  return <main className="admin-page">
    <div className="admin-header"><div><span className="eyebrow">NEXORA / COMMERCE</span><h1>Good morning, <em>admin.</em></h1><p>A little snapshot of how things are going this week.</p></div><button className="admin-date">Last 7 days <ChevronDown size={14} /></button></div>
    <div className="admin-stats">{stats.map(([label, amount]) => <div className="admin-stat" key={label}><span>{label}</span><strong>{amount}</strong><small>{overview ? 'Live store data' : 'Illustrative preview'}</small></div>)}</div>
    <div className="admin-content">
      <section className="admin-chart-card"><div className="admin-card-title"><div><span className="eyebrow">THE LAST SEVEN DAYS</span><h2>Sales overview</h2></div><button>This week <ChevronDown size={13} /></button></div><div className="chart-area"><ResponsiveContainer width="100%" height="100%"><AreaChart data={chartData} margin={{ top: 10, right: 12, left: -20, bottom: 0 }}><defs><linearGradient id="salesFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#b36b4c" stopOpacity={0.22} /><stop offset="100%" stopColor="#b36b4c" stopOpacity={0} /></linearGradient></defs><CartesianGrid stroke="#e9e5df" vertical={false} /><XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#8b8881', fontSize: 12 }} /><Tooltip formatter={(value) => [formatPrice(Number(value)), 'Sales']} contentStyle={{ border: '1px solid #e8e3dc', borderRadius: 2, fontSize: 12 }} /><Area type="monotone" dataKey="sales" stroke="#b36b4c" strokeWidth={2} fill="url(#salesFill)" /></AreaChart></ResponsiveContainer></div></section>
      <section className="admin-orders"><div className="admin-card-title"><div><span className="eyebrow">JUST CAME THROUGH</span><h2>Recent orders</h2></div><span className="admin-order-count">{overview ? overview.latestOrders.length : 'Preview'}</span></div>{latestOrders.length ? latestOrders.slice(0, 5).map(row => <div className="order-row" key={row[0]}><span>{row[0]}</span><div><strong>{row[1]}</strong><small>{row[2]}</small></div><strong>{row[3]}</strong><span className={`order-status ${row[4].toLowerCase()}`}>{row[4]}</span></div>) : <div className="admin-empty">No orders yet. They’ll show up here when your first order arrives.</div>}</section>
    </div>
    <div className="admin-note"><span>{overview ? 'LIVE DATA' : 'PREVIEW'}</span> {apiError || (overview ? 'Analytics are connected to your PostgreSQL order history.' : 'Connect your database and sign in as an admin to load store analytics.')}</div>
  </main>
}

function NotFound() {
  return <main className="not-found"><span className="eyebrow">A LITTLE DETOUR</span><h1>This page took<br /><em>the scenic route.</em></h1><p>It doesn't seem to be here. Let's find you something good instead.</p><Link to="/shop" className="button button-dark">Back to the good stuff <ArrowRight size={16} /></Link></main>
}

function Footer() {
  return <footer className="site-footer"><div className="footer-top"><div className="footer-brand"><Link className="wordmark" to="/">nexora<span>®</span></Link><p>Everything you want.<br />One thoughtful place.</p><span className="footer-location">MADE FOR THE WAY YOU LIVE · INDIA</span></div><div className="footer-column"><span>THE GOOD STUFF</span><Link to="/shop">Shop everything</Link><Link to="/shop?sort=newest">Just arrived</Link><Link to="/shop?sort=discount">Good deals</Link><Link to="/wishlist">Your saved things</Link></div><div className="footer-column"><span>HERE TO HELP</span><a href="mailto:hello@nexora.example">Get in touch</a><a href="mailto:hello@nexora.example">Shipping & returns</a><a href="mailto:hello@nexora.example">FAQs, probably</a><a href="mailto:hello@nexora.example">Track your order</a></div><div className="footer-column"><span>A LITTLE ABOUT US</span><Link to="/">Our story</Link><Link to="/">The Nexora journal</Link><Link to="/">Sustainability, honestly</Link><Link to="/admin">Admin dashboard</Link></div><div className="footer-column"><span>THE FINE PRINT</span><Link to="/">Privacy policy</Link><Link to="/">Terms of service</Link><Link to="/">Returns policy</Link><Link to="/">Accessibility</Link></div></div><div className="footer-bottom"><span>© 2025 NEXORA. GOOD THINGS, THOUGHTFULLY FOUND.</span><div className="payment-types"><span>VISA</span><span>mastercard</span><span>UPI</span><span>RuPay</span></div><div className="social-links"><a href="https://instagram.com" aria-label="Instagram">ig</a><a href="https://pinterest.com" aria-label="Pinterest">p</a><a href="https://x.com" aria-label="X">x</a></div><span>MADE WITH INTENTION, IN INDIA</span></div></footer>
}

export default App
