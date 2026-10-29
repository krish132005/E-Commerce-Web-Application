import type { NextFunction, Request, Response } from 'express'
import jwt from 'jsonwebtoken'

export type AuthUser = { id: string; role: 'USER' | 'ADMIN' }
export type AuthRequest = Request & { user?: AuthUser }

const secret = () => {
  const value = process.env.JWT_SECRET
  if (!value || value.length < 32) throw new Error('JWT_SECRET must be set to at least 32 characters.')
  return value
}

export function createToken(user: AuthUser) {
  return jwt.sign(user, secret(), { expiresIn: '7d' })
}

export function requireAuth(req: AuthRequest, res: Response, next: NextFunction) {
  const token = req.headers.authorization?.replace(/^Bearer\s+/i, '')
  if (!token) return res.status(401).json({ error: 'Sign in to continue.' })
  try {
    req.user = jwt.verify(token, secret()) as AuthUser
    next()
  } catch {
    return res.status(401).json({ error: 'Your session has expired. Please sign in again.' })
  }
}

export function requireAdmin(req: AuthRequest, res: Response, next: NextFunction) {
  if (req.user?.role !== 'ADMIN') return res.status(403).json({ error: 'Administrator access is required.' })
  next()
}
