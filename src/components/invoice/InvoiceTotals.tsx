// src/components/invoice/InvoiceTotals.tsx
import React from 'react'
import { formatCurrency } from '@/lib/utils'

interface InvoiceTotalsProps {
  totals: {
    totalNet: number
    totalVat: number
    totalGross: number
    vatBreakdown: Record<number, number>
  }
}

export function InvoiceTotals({ totals }: InvoiceTotalsProps) {
  return (
    <div className="mt-6 flex justify-end">
      <div className="w-96 space-y-2">
        <div className="pt-2 border-t">
          <div className="text-xs font-medium text-gray-500 mb-1">DDV po stopnjah:</div>
          {Object.entries(totals.vatBreakdown).map(([rate, amount]) => amount > 0 && (
            <div key={rate} className="flex justify-between text-sm">
              <span className="text-gray-600">DDV stopnje {rate}%:</span>
              <span>{formatCurrency(amount)}</span>
            </div>
          ))}
        </div>

        <div className="flex justify-between text-sm pt-1">
          <span className="text-gray-600">Skupni DDV:</span>
          <span className="font-medium">{formatCurrency(totals.totalVat)}</span>
        </div>

        <div className="flex justify-between text-primary font-bold text-lg pt-2 border-t">
          <span>SKUPNI ZNESEK ZA PLAČILO (z DDV):</span>
          <span>{formatCurrency(totals.totalGross)}</span>
        </div>

        <div className="flex justify-between text-xs text-gray-400 pt-1">
          <span>Skupni znesek (brez DDV):</span>
          <span>{formatCurrency(totals.totalNet)}</span>
        </div>
      </div>
    </div>
  )
}