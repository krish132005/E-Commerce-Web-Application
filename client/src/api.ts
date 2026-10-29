import axios from 'axios'
import type { Product } from './data'

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:4000/api',
  timeout: 8000,
})

api.interceptors.request.use(config => {
  const token = localStorage.getItem('nexora-token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

type ApiProduct = Omit<Product, 'reviews'> & { reviewCount?: number; reviews?: number }
export async function fetchProducts(params?: Record<string, string | number>) {
  const response = await api.get<ApiProduct[]>('/products', { params })
  return response.data.map(({ reviewCount, ...product }) => ({ ...product, reviews: product.reviews ?? reviewCount ?? 0 }))
}

export async function fetchProduct(id: string) {
  const response = await api.get<ApiProduct>(`/products/${id}`)
  const { reviewCount, ...product } = response.data
  return { ...product, reviews: product.reviews ?? reviewCount ?? 0 }
}
