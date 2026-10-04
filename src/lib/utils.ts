import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { format, parseISO } from 'date-fns'

/**
 * Merge Tailwind classes with clsx + tailwind-merge
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs))
}

/**
 * Format a number as Indian Rupee currency
 */
export function formatCurrency(n: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(n)
}

/**
 * Format a date string or Date object to 'dd MMM yyyy'
 */
export function formatDate(d: string | Date): string {
  try {
    const date = typeof d === 'string' ? parseISO(d) : d
    return format(date, 'dd MMM yyyy')
  } catch {
    return String(d)
  }
}

/**
 * Format date to short form 'dd MMM'
 */
export function formatDateShort(d: string | Date): string {
  try {
    const date = typeof d === 'string' ? parseISO(d) : d
    return format(date, 'dd MMM')
  } catch {
    return String(d)
  }
}

/**
 * Generate a random UUID
 */
export function generateId(): string {
  return crypto.randomUUID()
}

/**
 * Calculate weighted average cost from purchase batches
 */
export function calcWeightedAvgCost(
  batches: Array<{ qty: number; price: number }>
): number {
  const totalQty = batches.reduce((sum, b) => sum + b.qty, 0)
  if (totalQty === 0) return 0
  const totalCost = batches.reduce((sum, b) => sum + b.qty * b.price, 0)
  return totalCost / totalQty
}

/**
 * Calculate approximate days of stock remaining based on recent sales velocity
 */
export function calcDaysRemaining(
  stock: number,
  unitsSoldLast30: number
): number {
  if (unitsSoldLast30 === 0) return Infinity
  const dailyRate = unitsSoldLast30 / 30
  return Math.floor(stock / dailyRate)
}

/**
 * Determine if a product is dead stock (no sales in N days)
 */
export function isDeadStock(
  lastSaleDate: string | null,
  thresholdDays = 30
): boolean {
  if (!lastSaleDate) return true
  try {
    const last = parseISO(lastSaleDate)
    const now = new Date()
    const diffMs = now.getTime() - last.getTime()
    const diffDays = diffMs / (1000 * 60 * 60 * 24)
    return diffDays > thresholdDays
  } catch {
    return true
  }
}

/**
 * Get today's date as ISO string (YYYY-MM-DD)
 */
export function todayISO(): string {
  return new Date().toISOString().split('T')[0]
}

/**
 * Get a date N days ago as ISO string
 */
export function daysAgoISO(days: number): string {
  const d = new Date()
  d.setDate(d.getDate() - days)
  return d.toISOString().split('T')[0]
}
