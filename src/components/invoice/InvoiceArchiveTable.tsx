// src/components/invoice/InvoiceArchiveTable.tsx
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatCurrency, formatDate } from '@/lib/utils'
import { Invoice } from '@/types'
import { statusLabels, statusColors } from '@/data/mockData'

interface InvoiceArchiveTableProps {
  invoices: Invoice[]
  customers: any[]
  onInvoiceClick: (invoice: Invoice) => void
}

// Mock podatki za plačila - v realni aplikaciji bi to prišlo iz baze
const mockPayments: Record<string, { paid: number; remaining: number; percentage: number }> = {
  // Računi
  'inv1': { paid: 291.00, remaining: 0, percentage: 100 }, // R-2025-0047 - v celoti plačan
  'inv2': { paid: 0, remaining: 1197.00, percentage: 0 }, // R-2025-0048 - nič plačan (zapadel)
  'inv3': { paid: 1100.00, remaining: 0, percentage: 100 }, // R-2025-0049 - v celoti plačan
  'inv4': { paid: 0, remaining: 1705.00, percentage: 0 }, // R-2025-0050 - nič plačan
  'inv5': { paid: 0, remaining: 900.00, percentage: 0 }, // OSNUTEK - nič plačan
  'inv6': { paid: 0, remaining: 291.00, percentage: 0 }, // R-2025-0046 - storniran
  'inv7': { paid: 1232.00, remaining: 0, percentage: 100 }, // R-2025-0051 - v celoti plačan
  'inv8': { paid: 750.00, remaining: 750.00, percentage: 50 }, // R-2025-0057 - delno plačan (50%)
  'inv9': { paid: 300.00, remaining: 700.00, percentage: 30 }, // R-2025-0058 - delno plačan (30%)
  'inv10': { paid: 800.00, remaining: 533.00, percentage: 60 }, // R-2025-0059 - delno plačan (60%)
  
  // Predračuni - pri predračunih so plačila 0
  'est1': { paid: 0, remaining: 285.00, percentage: 0 },
  'est2': { paid: 0, remaining: 405.00, percentage: 0 },
  'est3': { paid: 0, remaining: 500.00, percentage: 0 },
  'est4': { paid: 0, remaining: 950.00, percentage: 0 },
  'est5': { paid: 0, remaining: 300.00, percentage: 0 },
  'est6': { paid: 0, remaining: 552.00, percentage: 0 },
  'est7': { paid: 0, remaining: 750.00, percentage: 0 },
  'est8': { paid: 0, remaining: 300.00, percentage: 0 },
  'est9': { paid: 0, remaining: 300.00, percentage: 0 },
  'est10': { paid: 0, remaining: 660.00, percentage: 0 },
  
  // Zapadli računi
  'overdue1': { paid: 0, remaining: 552.00, percentage: 0 },
  'overdue2': { paid: 0, remaining: 285.00, percentage: 0 },
  'overdue3': { paid: 0, remaining: 300.00, percentage: 0 },
  'overdue4': { paid: 0, remaining: 475.00, percentage: 0 },
  'overdue5': { paid: 0, remaining: 800.00, percentage: 0 },
  'overdue6': { paid: 0, remaining: 150.00, percentage: 0 },
}

export function InvoiceArchiveTable({ invoices, customers, onInvoiceClick }: InvoiceArchiveTableProps) {
  // Sort invoices: first by date (newest to oldest), then by invoice number
  const sortedInvoices = [...invoices].sort((a, b) => {
    const dateA = new Date(a.issueDate).getTime()
    const dateB = new Date(b.issueDate).getTime()
    
    if (dateA !== dateB) {
      return dateB - dateA
    }
    
    const numA = a.number || ''
    const numB = b.number || ''
    
    if (numA && numB) {
      const numericA = parseInt(numA.replace(/\D/g, '')) || 0
      const numericB = parseInt(numB.replace(/\D/g, '')) || 0
      return numericB - numericA
    }
    
    if (numA && !numB) return -1
    if (!numA && numB) return 1
    
    return (b.id || '').localeCompare(a.id || '')
  })

  // Funkcija za pridobitev podatkov o plačilu
  const getPaymentInfo = (invoiceId: string) => {
    return mockPayments[invoiceId] || { paid: 0, remaining: 0, percentage: 0 }
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="px-1 py-3 text-left w-[110px] text-xs lg:text-sm">Številka računa</TableHead>
            <TableHead className="px-4 py-3 text-center text-xs lg:text-sm">Datum izdaje</TableHead>
            <TableHead className="px-4 py-3 text-left w-[240px] text-xs lg:text-sm">Kupec</TableHead>
            <TableHead className="px-4 py-3 text-right text-xs lg:text-sm">Neto</TableHead>
            <TableHead className="px-4 py-3 text-right text-xs lg:text-sm">DDV</TableHead>
            <TableHead className="px-4 py-3 text-right text-xs lg:text-sm">Bruto</TableHead>
            <TableHead className="px-4 py-3 text-right w-[120px] text-xs lg:text-sm">Plačano</TableHead>
            <TableHead className="px-4 py-3 text-right w-[120px] text-xs lg:text-sm">Preostanek</TableHead>
            <TableHead className="px-4 py-3 text-center w-[180px] text-xs lg:text-sm">Status</TableHead>
            <TableHead className="px-4 py-3 text-center w-[140px] text-xs lg:text-sm">Zapadlost</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedInvoices.map(inv => {
            const daysLate = inv.status === 'overdue' ? Math.floor((new Date().getTime() - new Date(inv.dueDate).getTime()) / (1000 * 3600 * 24)) : 0
            const customer = customers.find(c => c.id === inv.customerId)
            
            // Pridobi podatke o plačilu
            const paymentInfo = getPaymentInfo(inv.id)
            const isFullyPaid = paymentInfo.remaining <= 0 && paymentInfo.paid > 0
            const isEstimate = inv.number?.startsWith('PR')
            const isDraft = inv.status === 'draft' || inv.number === 'OSNUTEK'
            
            // Za predračune in osnutke prikažemo 0
            const displayPaid = isEstimate || isDraft ? 0 : paymentInfo.paid
            const displayRemaining = isEstimate || isDraft ? inv.totalGross : paymentInfo.remaining
            
            return (
              <TableRow 
                key={inv.id} 
                className={`${inv.status === 'overdue' ? 'bg-red-50' : ''} cursor-pointer hover:bg-gray-100 transition-colors`}
                onClick={() => onInvoiceClick(inv)}
              >
                <TableCell className="px-2 py-1 whitespace-nowrap text-xs lg:text-sm">
                 <span 
  className={`
    hover:font-bold hover:underline hover:text-black-600 transition-all duration-200 cursor-pointer
    ${inv.number && inv.number !== 'OSNUTEK' ? 'text-gray-900' : 'text-gray-500 italic'}
  `}
>
  {inv.number || 'Osnutek'}
</span>
                </TableCell>
                <TableCell className="px-2 py-1 text-center whitespace-nowrap text-xs lg:text-sm">{formatDate(inv.issueDate)}</TableCell>
                <TableCell className="px-2 py-1 whitespace-nowrap text-xs lg:text-sm">
                  <div className="font-medium">{inv.customerName}</div>
                  <div className="text-[10px] lg:text-xs text-gray-500">{inv.customerTaxId}</div>
                </TableCell>
                <TableCell className="px-2 py-1 text-right whitespace-nowrap text-xs lg:text-sm">{formatCurrency(inv.totalNet)}</TableCell>
                <TableCell className="px-2 py-1 text-right whitespace-nowrap text-xs lg:text-sm">{formatCurrency(inv.totalVat)}</TableCell>
                <TableCell className="px-2 py-1 text-right font-semibold whitespace-nowrap text-xs lg:text-sm">{formatCurrency(inv.totalGross)}</TableCell>
                
{/* Stolpec Plačano */}
<TableCell className="px-2 py-1 text-right whitespace-nowrap text-xs lg:text-sm">
  {isEstimate || isDraft ? (
    <span className="text-gray-400">/</span>
  ) : (
    <div className="flex flex-col items-end">
      <span className={`font-medium ${isFullyPaid ? 'text-green-600' : ''}`}>
        {formatCurrency(displayPaid)}
      </span>
      {paymentInfo.percentage > 0 && paymentInfo.percentage < 100 && (
        <span className="text-[10px] text-gray-400">
          {paymentInfo.percentage}% plačano
        </span>
      )}

    </div>
  )}
</TableCell>
                
                {/* Stolpec Preostanek */}
                <TableCell className="px-2 py-1 text-right whitespace-nowrap text-xs lg:text-sm">
                  {isEstimate || isDraft ? (
                    <span className="text-gray-400">/</span>
                  ) : (
                    <span className={`font-medium ${displayRemaining > 0 ? 'text-red-600' : 'text-black-600'}`}>
                      {formatCurrency(displayRemaining)}
                    </span>
                  )}
                </TableCell>
                

<TableCell className="px-2 py-1 text-center whitespace-nowrap text-xs lg:text-sm">
  <Badge className={`${statusColors[inv.status]} text-[10px] lg:text-xs`}>
    {statusLabels[inv.status] || inv.status}
  </Badge>
</TableCell>
                <TableCell className="px-2 py-1 text-center whitespace-nowrap text-xs lg:text-sm">
                  {inv.dueDate && inv.dueDate !== 'null' ? (
                    <>
                      {formatDate(inv.dueDate)}
                      {inv.status === 'overdue' && (
                        <div className="text-[10px] lg:text-xs text-red-500 whitespace-nowrap">
                          {daysLate} dni zamude
                        </div>
                      )}
                    </>
                  ) : (
                    <span className="text-gray-400 text-xs">/</span>
                  )}
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
      
      {/* Pagination footer */}
      <div className="flex items-center justify-between px-4 py-3 border-t">
        <div className="text-xs lg:text-sm text-gray-500">
          Skupaj: {sortedInvoices.length} računov
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-xs lg:text-sm text-gray-500">
            Stran 1 / {Math.ceil(sortedInvoices.length / 10) || 1}
          </span>
        </div>           
        <div>
          <Button 
            size="sm" 
            variant="ghost" 
            className="text-xs lg:text-sm h-7 px-2 text-gray-500 hover:text-gray-700"
          >
            Naslednja stran
          </Button>
        </div>
      </div>
    </div>
  )
}