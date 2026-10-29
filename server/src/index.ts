import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import bcrypt from 'bcryptjs'
import { Prisma } from '@prisma/client'
import { z } from 'zod'
import { prisma } from './db.js'
import { createToken, requireAdmin, requireAuth, type AuthRequest } from './auth.js'

const app = express()
app.use(cors({ origin: process.env.CLIENT_URL ?? 'http://localhost:5173' }))
app.use(express.json({ limit: '100kb' }))

const asString = (value: unknown): string => Array.isArray(value) ? value[0] ?? '' : typeof value === 'string' ? value : ''

const asyncRoute = (handler: (req: AuthRequest, res: express.Response) => Promise<unknown>) =>
  (req: AuthRequest, res: express.Response, next: express.NextFunction) => handler(req, res).catch(next)

app.get('/api/health', (_req, res) => res.json({ status: 'ok', service: 'nexora-api' }))

app.get('/api/products', asyncRoute(async (req, res) => {
  const search = asString(req.query.search).trim()
  const category = asString(req.query.category).trim()
  const brand = asString(req.query.brand).trim()
  const minPrice = Number(asString(req.query.minPrice) || 0)
  const maxPrice = Number(asString(req.query.maxPrice) || 1_000_000)
  const minRating = Number(asString(req.query.rating) || 0)
  const sort = asString(req.query.sort) || 'recommended'
  const searchFields = ['name', 'brand', 'category', 'description'] as const
  const searchTerm: Prisma.ProductWhereInput[] = search
    ? searchFields.map(field => ({ [field]: { contains: search, mode: 'insensitive' } }))
    : []

  const products = await prisma.product.findMany({
    where: {
      isActive: true,
      ...(category ? { category: { equals: category, mode: 'insensitive' } } : {}),
      ...(brand ? { brand: { equals: brand, mode: 'insensitive' } } : {}),
      price: { gte: minPrice, lte: maxPrice },
      rating: { gte: minRating },
      ...(searchTerm.length ? { OR: searchTerm } : {}),
    },
    orderBy: sort === 'price-low' ? { price: 'asc' } : sort === 'price-high' ? { price: 'desc' } : sort === 'newest' ? { createdAt: 'desc' } : sort === 'rating' ? { rating: 'desc' } : { createdAt: 'desc' },
  })
  res.json(products)
}))

app.get('/api/products/:id', asyncRoute(async (req, res) => {
  const productId = String(req.params.id)
  const product = await prisma.product.findFirst({ where: { OR: [{ id: productId }, { slug: productId }], isActive: true } })
  if (!product) return res.status(404).json({ error: 'We could not find that product.' })
  res.json(product)
}))

const registrationSchema = z.object({
  name: z.string().trim().min(2).max(80),
  email: z.string().trim().email().max(254),
  password: z.string().min(8).max(128),
})
const loginSchema = registrationSchema.pick({ email: true, password: true })

app.post('/api/auth/register', asyncRoute(async (req, res) => {
  const input = registrationSchema.parse(req.body)
  const passwordHash = await bcrypt.hash(input.password, 12)
  const user = await prisma.user.create({ data: { name: input.name, email: input.email.toLowerCase(), passwordHash } })
  res.status(201).json({ token: createToken({ id: user.id, role: user.role }), user: { id: user.id, name: user.name, email: user.email, role: user.role } })
}))

app.post('/api/auth/login', asyncRoute(async (req, res) => {
  const input = loginSchema.parse(req.body)
  const user = await prisma.user.findUnique({ where: { email: input.email.toLowerCase() } })
  if (!user || !(await bcrypt.compare(input.password, user.passwordHash))) return res.status(401).json({ error: 'That email and password do not match.' })
  res.json({ token: createToken({ id: user.id, role: user.role }), user: { id: user.id, name: user.name, email: user.email, role: user.role } })
}))

app.get('/api/auth/me', requireAuth, asyncRoute(async (req, res) => {
  const user = await prisma.user.findUnique({ where: { id: req.user!.id }, select: { id: true, name: true, email: true, role: true } })
  if (!user) return res.status(404).json({ error: 'Account no longer exists.' })
  res.json(user)
}))

app.get('/api/cart', requireAuth, asyncRoute(async (req, res) => {
  const items = await prisma.cartItem.findMany({ where: { userId: req.user!.id }, include: { product: true }, orderBy: { createdAt: 'asc' } })
  res.json(items)
}))

app.put('/api/cart/:productId', requireAuth, asyncRoute(async (req, res) => {
  const productId = String(req.params.productId)
  const quantity = z.number().int().min(0).max(50).parse(req.body.quantity)
  const product = await prisma.product.findFirst({ where: { OR: [{ id: productId }, { slug: productId }], isActive: true } })
  if (!product) return res.status(404).json({ error: 'We could not find that product.' })
  if (quantity > product.stock) return res.status(409).json({ error: `Only ${product.stock} are available right now.` })
  if (quantity === 0) {
    await prisma.cartItem.deleteMany({ where: { userId: req.user!.id, productId: product.id } })
    return res.json({ removed: true })
  }
  const item = await prisma.cartItem.upsert({
    where: { userId_productId: { userId: req.user!.id, productId: product.id } },
    create: { userId: req.user!.id, productId: product.id, quantity },
    update: { quantity },
    include: { product: true },
  })
  res.json(item)
}))

app.post('/api/orders', requireAuth, asyncRoute(async (req, res) => {
  const items = await prisma.cartItem.findMany({ where: { userId: req.user!.id }, include: { product: true } })
  if (!items.length) return res.status(400).json({ error: 'Your bag is empty.' })
  for (const item of items) {
    if (item.quantity > item.product.stock) return res.status(409).json({ error: `${item.product.name} no longer has enough stock.` })
  }
  const subtotal = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0)
  const order = await prisma.$transaction(async tx => {
    const created = await tx.order.create({
      data: {
        orderNumber: `NX-${Date.now().toString().slice(-8)}`,
        userId: req.user!.id,
        subtotal,
        total: subtotal,
        items: { create: items.map(item => ({ productId: item.productId, quantity: item.quantity, unitPrice: item.product.price })) },
      },
      include: { items: { include: { product: true } } },
    })
    for (const item of items) await tx.product.update({ where: { id: item.productId }, data: { stock: { decrement: item.quantity } } })
    await tx.cartItem.deleteMany({ where: { userId: req.user!.id } })
    return created
  })
  res.status(201).json(order)
}))

app.post('/api/newsletter', asyncRoute(async (req, res) => {
  const { email } = z.object({ email: z.string().trim().email().max(254) }).parse(req.body)
  await prisma.newsletterSignup.upsert({ where: { email: email.toLowerCase() }, create: { email: email.toLowerCase() }, update: {} })
  res.status(201).json({ message: 'You are on the list.' })
}))

app.get('/api/admin/overview', requireAuth, requireAdmin, asyncRoute(async (_req, res) => {
  const weekStart = new Date()
  weekStart.setHours(0, 0, 0, 0)
  weekStart.setDate(weekStart.getDate() - 6)
  const [orders, gross, users, productsCount, latestOrders, weekOrders] = await Promise.all([
    prisma.order.count(),
    prisma.order.aggregate({ _sum: { total: true } }),
    prisma.user.count(),
    prisma.product.count({ where: { isActive: true } }),
    prisma.order.findMany({ take: 8, orderBy: { createdAt: 'desc' }, include: { user: { select: { name: true } }, items: { include: { product: { select: { name: true } } } } } }),
    prisma.order.findMany({ where: { createdAt: { gte: weekStart } }, select: { total: true, createdAt: true } }),
  ])
  const salesByDay = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(weekStart)
    date.setDate(weekStart.getDate() + index)
    const dayOrders = weekOrders.filter(order => order.createdAt.toDateString() === date.toDateString())
    return { day: date.toLocaleDateString('en-IN', { weekday: 'short' }), sales: dayOrders.reduce((sum, order) => sum + order.total, 0) }
  })
  res.json({ orders, grossSales: gross._sum.total ?? 0, customers: users, products: productsCount, latestOrders, salesByDay })
}))

app.post('/api/admin/products', requireAuth, requireAdmin, asyncRoute(async (req, res) => {
  const input = z.object({
    slug: z.string().min(2), name: z.string().min(2), brand: z.string().min(1), category: z.string().min(1),
    description: z.string().min(10), price: z.number().int().positive(), originalPrice: z.number().int().positive(),
    image: z.string().url(), imageHover: z.string().url().optional(), stock: z.number().int().min(0).default(0),
  }).parse(req.body)
  const product = await prisma.product.create({ data: input })
  res.status(201).json(product)
}))

app.use((err: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  if (err instanceof z.ZodError) return res.status(400).json({ error: 'Please check the information you entered.', details: err.flatten().fieldErrors })
  if (typeof err === 'object' && err !== null && 'code' in err && err.code === 'P2002') return res.status(409).json({ error: 'That record already exists.' })
  console.error(err)
  res.status(500).json({ error: 'Something went wrong. Please try again.' })
})

const port = Number(process.env.PORT ?? 4000)
app.listen(port, () => console.log(`NEXORA API listening on http://localhost:${port}`))

process.on('beforeExit', async () => prisma.$disconnect())
