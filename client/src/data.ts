export type Product = {
  id: string
  name: string
  brand: string
  category: string
  price: number
  originalPrice: number
  rating: number
  reviews: number
  image: string
  imageHover?: string
  badge?: string
  colors?: string[]
  description: string
}

export const products: Product[] = [
  { id: '1', name: 'Studio Wireless Headphones', brand: 'Auralis', category: 'Audio', price: 7499, originalPrice: 9999, rating: 4.8, reviews: 284, image: 'photo-1505740420928-5e560c06d30e', imageHover: 'photo-1546435770-a3e426bf472b', badge: 'BESTSELLER', colors: ['#222', '#d2c7b5', '#788276'], description: 'Immersive, beautifully balanced sound with adaptive noise cancellation and a considered all-day fit.' },
  { id: '2', name: 'Everyday Leather Tote', brand: 'Forma', category: 'Bags', price: 3299, originalPrice: 4299, rating: 4.7, reviews: 163, image: 'photo-1590874103328-eac38a683ce7', imageHover: 'photo-1548036328-c9fa89d128fa', badge: 'SALE', colors: ['#a7744c', '#262522'], description: 'A softly structured carryall in supple, responsibly sourced leather, made for days that run long.' },
  { id: '3', name: 'Field Automatic Watch', brand: 'Northline', category: 'Watches', price: 12499, originalPrice: 15999, rating: 4.9, reviews: 91, image: 'photo-1524805444758-089113d48a6d', imageHover: 'photo-1523275335684-37898b6baf30', badge: 'LIMITED', colors: ['#242b28', '#8e765a'], description: 'A precision automatic movement, brushed steel case and clean dial bring a little intention to every hour.' },
  { id: '4', name: 'Cloudfoam Daily Sneakers', brand: 'Stride & Co.', category: 'Footwear', price: 4599, originalPrice: 5999, rating: 4.6, reviews: 412, image: 'photo-1542291026-7eec264c27ff', imageHover: 'photo-1495555961986-6d4c1ecb7be3', badge: 'LOW STOCK', colors: ['#ba332c', '#dedbd2', '#333'], description: 'Lightweight cushioning and an easy, versatile silhouette for wherever the day takes you.' },
  { id: '5', name: 'Arc 14-inch Laptop', brand: 'Nexa', category: 'Laptops', price: 64999, originalPrice: 72999, rating: 4.8, reviews: 76, image: 'photo-1496181133206-80ce9b88a853', imageHover: 'photo-1517336714731-489689fd1ca8', badge: 'NEW', description: 'A crisp, color-accurate display and all-day performance in a quiet, lightweight aluminum body.' },
  { id: '6', name: 'Everyday Eau de Parfum', brand: 'Serein', category: 'Beauty', price: 2199, originalPrice: 2799, rating: 4.5, reviews: 208, image: 'photo-1541643600914-78b084683601', imageHover: 'photo-1594035910387-fea47794261f', description: 'A warm, skin-close blend of bergamot, soft cedar and amber—made for the everyday.' },
  { id: '7', name: 'Ribbed Cotton Overshirt', brand: 'Common Ground', category: 'Men', price: 2899, originalPrice: 3899, rating: 4.7, reviews: 132, image: 'photo-1618354691373-d851c5c3a990', imageHover: 'photo-1598033129183-c4f50c736f10', badge: 'NEW', colors: ['#8c7966', '#465349', '#ded8cd'], description: 'An easy layer in brushed organic cotton, cut with a relaxed shape and considered details.' },
  { id: '8', name: 'Sculpt Ceramic Table Lamp', brand: 'Atelier Home', category: 'Home', price: 3899, originalPrice: 4999, rating: 4.8, reviews: 67, image: 'photo-1507473885765-e6ed057f782c', imageHover: 'photo-1507473885765-e6ed057f782c', description: 'A tactile stoneware base and warm diffused light make this the quiet centrepiece of a room.' },
  { id: '9', name: 'Move Light Training Mat', brand: 'Form Studio', category: 'Fitness', price: 1799, originalPrice: 2299, rating: 4.6, reviews: 119, image: 'photo-1592432678016-e910b452f9a2', imageHover: 'photo-1518611012118-696072aa579a', badge: 'SALE', colors: ['#c5ad9b', '#6c7669'], description: 'A grippy, supportive everyday mat with just enough cushioning for your practice at home or away.' },
  { id: '10', name: 'Mini Crossbody in Canvas', brand: 'Forma', category: 'Bags', price: 1899, originalPrice: 2499, rating: 4.5, reviews: 87, image: 'photo-1584917865442-de89df76afd3', imageHover: 'photo-1548036328-c9fa89d128fa', description: 'A compact, hands-free companion with thoughtful pockets and a comfortable adjustable strap.' },
  { id: '11', name: 'Soundbar Mini', brand: 'Auralis', category: 'Electronics', price: 8999, originalPrice: 10999, rating: 4.7, reviews: 54, image: 'photo-1545454675-3531b543be5d', imageHover: 'photo-1608043152269-423dbba4e7e1', badge: 'NEW', description: 'Room-filling clarity and rich low notes in a compact soundbar designed to disappear into your space.' },
  { id: '12', name: 'Linen Weekend Shirt', brand: 'Common Ground', category: 'Women', price: 2499, originalPrice: 3299, rating: 4.6, reviews: 143, image: 'photo-1598554747436-c9293d6a588f', imageHover: 'photo-1551488831-00ddcb6c6bd3', colors: ['#e7dfd1', '#818b79', '#b48f82'], description: 'Airy washed linen, relaxed sleeves and a softly curved hem make this an effortless warm-weather staple.' },
]

export const categories = [
  { name: 'Fashion', image: 'photo-1483985988355-763728e1935b', note: 'Made for your rhythm' },
  { name: 'Electronics', image: 'photo-1498049794561-7780e7231661', note: 'Everyday, upgraded' },
  { name: 'Footwear', image: 'photo-1542291026-7eec264c27ff', note: 'Find your next step' },
  { name: 'Home', image: 'photo-1616486338812-3dadae4b4ace', note: 'A softer place to land' },
  { name: 'Beauty', image: 'photo-1596462502278-27bfdc403348', note: 'Small rituals, daily' },
  { name: 'Fitness', image: 'photo-1518611012118-696072aa579a', note: 'Move in your own way' },
]

export const lifestyles = [
  { name: 'CAMPUS READY', text: 'Good things for big plans.', image: 'photo-1529139574466-a303027c1d8b', category: 'Fashion' },
  { name: 'DESK UPGRADE', text: 'Make room for good ideas.', image: 'photo-1498050108023-c5249f4df085', category: 'Electronics' },
  { name: 'GAME NIGHT', text: 'The best nights stay in.', image: 'photo-1593305841991-05c297ba4575', category: 'Electronics' },
  { name: 'MOVE BETTER', text: 'Find your kind of momentum.', image: 'photo-1518611012118-696072aa579a', category: 'Fitness' },
  { name: 'WEEKEND ESCAPE', text: 'A little further feels good.', image: 'photo-1476514525535-07fb3b4ae5f1', category: 'Bags' },
]

export const imageUrl = (id: string, width = 900) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${width}&q=85`
export const formatPrice = (price: number) => `₹${price.toLocaleString('en-IN')}`
