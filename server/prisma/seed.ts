import 'dotenv/config'
import bcrypt from 'bcryptjs'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const catalog = [
  ['1', 'studio-wireless-headphones', 'Studio Wireless Headphones', 'Auralis', 'Audio', 'Immersive, beautifully balanced sound with adaptive noise cancellation and a considered all-day fit.', 7499, 9999, 4.8, 284, 'photo-1505740420928-5e560c06d30e', 'photo-1546435770-a3e426bf472b', 'BESTSELLER', ['#222222', '#d2c7b5', '#788276'], 42, ['wireless', 'headphones', 'noise cancellation']],
  ['2', 'everyday-leather-tote', 'Everyday Leather Tote', 'Forma', 'Bags', 'A softly structured carryall in supple, responsibly sourced leather, made for days that run long.', 3299, 4299, 4.7, 163, 'photo-1590874103328-eac38a683ce7', 'photo-1548036328-c9fa89d128fa', 'SALE', ['#a7744c', '#262522'], 18, ['tote', 'leather', 'bag']],
  ['3', 'field-automatic-watch', 'Field Automatic Watch', 'Northline', 'Watches', 'A precision automatic movement, brushed steel case and clean dial bring a little intention to every hour.', 12499, 15999, 4.9, 91, 'photo-1524805444758-089113d48a6d', 'photo-1523275335684-37898b6baf30', 'LIMITED', ['#242b28', '#8e765a'], 11, ['watch', 'automatic', 'timepiece']],
  ['4', 'cloudfoam-daily-sneakers', 'Cloudfoam Daily Sneakers', 'Stride & Co.', 'Footwear', 'Lightweight cushioning and an easy, versatile silhouette for wherever the day takes you.', 4599, 5999, 4.6, 412, 'photo-1542291026-7eec264c27ff', 'photo-1495555961986-6d4c1ecb7be3', 'LOW STOCK', ['#ba332c', '#dedbd2', '#333333'], 7, ['sneakers', 'shoes', 'running']],
  ['5', 'arc-14-inch-laptop', 'Arc 14-inch Laptop', 'Nexa', 'Laptops', 'A crisp, color-accurate display and all-day performance in a quiet, lightweight aluminum body.', 64999, 72999, 4.8, 76, 'photo-1496181133206-80ce9b88a853', 'photo-1517336714731-489689fd1ca8', 'NEW', [], 12, ['laptop', 'computer', 'work']],
  ['6', 'everyday-eau-de-parfum', 'Everyday Eau de Parfum', 'Serein', 'Beauty', 'A warm, skin-close blend of bergamot, soft cedar and amber—made for the everyday.', 2199, 2799, 4.5, 208, 'photo-1541643600914-78b084683601', 'photo-1594035910387-fea47794261f', null, [], 30, ['perfume', 'fragrance', 'beauty']],
  ['7', 'ribbed-cotton-overshirt', 'Ribbed Cotton Overshirt', 'Common Ground', 'Men', 'An easy layer in brushed organic cotton, cut with a relaxed shape and considered details.', 2899, 3899, 4.7, 132, 'photo-1618354691373-d851c5c3a990', 'photo-1598033129183-c4f50c736f10', 'NEW', ['#8c7966', '#465349', '#ded8cd'], 23, ['shirt', 'overshirt', 'mens fashion']],
  ['8', 'sculpt-ceramic-table-lamp', 'Sculpt Ceramic Table Lamp', 'Atelier Home', 'Home', 'A tactile stoneware base and warm diffused light make this the quiet centrepiece of a room.', 3899, 4999, 4.8, 67, 'photo-1507473885765-e6ed057f782c', null, null, [], 15, ['lamp', 'home', 'lighting']],
  ['9', 'move-light-training-mat', 'Move Light Training Mat', 'Form Studio', 'Fitness', 'A grippy, supportive everyday mat with just enough cushioning for your practice at home or away.', 1799, 2299, 4.6, 119, 'photo-1592432678016-e910b452f9a2', 'photo-1518611012118-696072aa579a', 'SALE', ['#c5ad9b', '#6c7669'], 36, ['fitness', 'yoga', 'mat']],
  ['10', 'mini-crossbody-canvas', 'Mini Crossbody in Canvas', 'Forma', 'Bags', 'A compact, hands-free companion with thoughtful pockets and a comfortable adjustable strap.', 1899, 2499, 4.5, 87, 'photo-1584917865442-de89df76afd3', 'photo-1548036328-c9fa89d128fa', null, [], 24, ['bag', 'crossbody', 'travel']],
  ['11', 'soundbar-mini', 'Soundbar Mini', 'Auralis', 'Electronics', 'Room-filling clarity and rich low notes in a compact soundbar designed to disappear into your space.', 8999, 10999, 4.7, 54, 'photo-1545454675-3531b543be5d', 'photo-1608043152269-423dbba4e7e1', 'NEW', [], 9, ['soundbar', 'audio', 'speaker']],
  ['12', 'linen-weekend-shirt', 'Linen Weekend Shirt', 'Common Ground', 'Women', 'Airy washed linen, relaxed sleeves and a softly curved hem make this an effortless warm-weather staple.', 2499, 3299, 4.6, 143, 'photo-1598554747436-c9293d6a588f', 'photo-1551488831-00ddcb6c6bd3', null, ['#e7dfd1', '#818b79', '#b48f82'], 19, ['linen', 'shirt', 'womens fashion']],
]

async function main() {
  for (const [id, slug, name, brand, category, description, price, originalPrice, rating, reviewCount, image, imageHover, badge, colors, stock, keywords] of catalog) {
    await prisma.product.upsert({
      where: { id: id as string },
      update: {},
      create: {
        id: id as string, slug: slug as string, name: name as string, brand: brand as string, category: category as string,
        description: description as string, price: price as number, originalPrice: originalPrice as number, rating: rating as number,
        reviewCount: reviewCount as number, image: image as string, imageHover: imageHover as string | null, badge: badge as string | null,
        colors: colors as string[], stock: stock as number, keywords: keywords as string[],
      },
    })
  }

  const email = process.env.ADMIN_EMAIL ?? 'admin@nexora.local'
  const password = process.env.ADMIN_PASSWORD
  if (password) {
    const passwordHash = await bcrypt.hash(password, 12)
    await prisma.user.upsert({
      where: { email },
      update: { role: 'ADMIN', passwordHash },
      create: { name: 'NEXORA Admin', email, passwordHash, role: 'ADMIN' },
    })
    console.log(`Seeded admin account: ${email}`)
  } else {
    console.log('ADMIN_PASSWORD not set; skipped admin account. Set it in server/.env to create the demo admin.')
  }
  console.log(`Seeded ${catalog.length} NEXORA products.`)
}

main().catch(error => {
  console.error(error)
  process.exitCode = 1
}).finally(async () => prisma.$disconnect())
