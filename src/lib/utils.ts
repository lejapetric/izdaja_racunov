// src/lib/utils.ts
import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const formatCurrency = (amount: number) => {
  // Roka zaokrožimo na 2 decimalki
  const roundedAmount = Math.round(amount * 100) / 100
  
  // Ločimo celi in decimalni del
  const [integerPart, decimalPart] = roundedAmount.toFixed(2).split('.')
  
  // Dodamo pike za tisočice (vsake 3 števke)
  const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, '.')
  
  // Sestavimo nazaj z vejico za decimalke
  const formattedNumber = `${formattedInteger},${decimalPart}`
  
  return `${formattedNumber} €`
}

// src/lib/utils.ts
export const formatDate = (date: string | Date | null | undefined): string => {
  if (!date) return '/'
  const d = typeof date === 'string' ? new Date(date) : date
  if (isNaN(d.getTime())) return '/'
  return d.toLocaleDateString('sl-SI', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}


export const formatDateForStorage = (date: Date | null): string => {
  if (!date) return ''
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export const formatDateForCompare = (date: Date | null): string => {
  if (!date) return ''
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}