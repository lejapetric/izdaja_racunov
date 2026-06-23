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
  documentType?: 'all' | 'invoice' | 'estimate' | 'draft'
}

// src/components/invoice/InvoiceArchiveTable.tsx - popravljen mockPayments

// Mock podatki za plačila - v realni aplikaciji bi to prišlo iz baze
const mockPayments: Record<string, { paid: number; remaining: number; percentage: number }> = {
  // Računi
  'inv1': { paid: 291.00, remaining: 0, percentage: 100 },
  'inv2': { paid: 0, remaining: 1197.00, percentage: 0 },
  'inv3': { paid: 1100.00, remaining: 0, percentage: 100 },
  'inv4': { paid: 0, remaining: 1705.00, percentage: 0 },
  'inv5': { paid: 0, remaining: 900.00, percentage: 0 },
  'inv6': { paid: 0, remaining: 291.00, percentage: 0 },
  'inv7': { paid: 1232.00, remaining: 0, percentage: 100 },
  'inv8': { paid: 750.00, remaining: 750.00, percentage: 50 },
  'inv9': { paid: 300.00, remaining: 700.00, percentage: 30 },
  'inv10': { paid: 800.00, remaining: 533.00, percentage: 60 },
  
  // Predračuni - vsi zneski morajo biti pravilni glede na Skupaj (Total Gross)
  // Total Gross = Neto + DDV
  'est1': { paid: 0, remaining: 285.00, percentage: 0 },      // Skupaj: 285.00
  'est2': { paid: 0, remaining: 405.00, percentage: 0 },      // Skupaj: 405.00 (prikazano 405.00)
  'est3': { paid: 0, remaining: 500.00, percentage: 0 },      // Skupaj: 500.00
  'est4': { paid: 1159.00, remaining: 0, percentage: 100 },   // Skupaj: 1.159,00 € (NETO: 1.000,00 + DDV: 209,00)
  'est5': { paid: 0, remaining: 366.00, percentage: 0 },      // Skupaj: 366.00 (NETO: 300,00 + DDV: 66,00)
  'est6': { paid: 0, remaining: 552.00, percentage: 0 },
  'est7': { paid: 821.25, remaining: 0, percentage: 100 },    // Skupaj: 821,25 € (Neto: 750,00 + DDV: 71,25)
  'est8': { paid: 0, remaining: 183.00, percentage: 0 },      // Skupaj: 183,00 (Neto: 150,00 + DDV: 33,00) - CONVERTED - ne prikazujemo plačila
  'est9': { paid: 0, remaining: 366.00, percentage: 0 },      // Skupaj: 366,00 (Neto: 300,00 + DDV: 66,00) - CONVERTED
  'est10': { paid: 0, remaining: 658.80, percentage: 0 },     // Skupaj: 658,80 (Neto: 600,00 + DDV: 118,80) - CONVERTED
  'est11': { paid: 0, remaining: 660.63, percentage: 0 },     // Skupaj: 660,63 (Neto: 570,00 + DDV: 119,13)
  'est12': { paid: 0, remaining: 1317.60, percentage: 0 },    // Skupaj: 1.317,60 € (Neto: 1.200,00 + DDV: 237,60)
  'est13': { paid: 0, remaining: 1100.00, percentage: 0 },    // Skupaj: 1.100,00
  'est14': { paid: 0, remaining: 1464.00, percentage: 0 },    // Skupaj: 1.464,00 (Neto: 1.200,00 + DDV: 264,00)
  'est15': { paid: 0, remaining: 366.00, percentage: 0 },     // Skupaj: 366,00 (Neto: 300,00 + DDV: 66,00)
  
  // Zapadli računi
  'overdue1': { paid: 0, remaining: 552.00, percentage: 0 },
  'overdue2': { paid: 0, remaining: 285.00, percentage: 0 },
  'overdue3': { paid: 0, remaining: 300.00, percentage: 0 },
  'overdue4': { paid: 0, remaining: 475.00, percentage: 0 },
  'overdue5': { paid: 0, remaining: 800.00, percentage: 0 },
  'overdue6': { paid: 0, remaining: 150.00, percentage: 0 },
  'overdue7': { paid: 0, remaining: 750.00, percentage: 0 },
  'overdue8': { paid: 0, remaining: 855.00, percentage: 0 },
  'overdue9': { paid: 0, remaining: 1520.00, percentage: 0 },
  'overdue10': { paid: 0, remaining: 660.00, percentage: 0 },
  
  // Nepotrjeni računi
  'unconf1': { paid: 0, remaining: 291.00, percentage: 0 },
  'unconf2': { paid: 0, remaining: 855.00, percentage: 0 },
  'unconf3': { paid: 0, remaining: 950.00, percentage: 0 },
  'unconf4': { paid: 0, remaining: 450.00, percentage: 0 },
  'unconf5': { paid: 0, remaining: 1425.00, percentage: 0 },
  'unconf6': { paid: 0, remaining: 300.00, percentage: 0 },
  'unconf7': { paid: 0, remaining: 828.00, percentage: 0 },
  'unconf8': { paid: 0, remaining: 950.00, percentage: 0 },
}

export function InvoiceArchiveTable({ 
  invoices, 
  customers, 
  onInvoiceClick,
  documentType = 'all'
}: InvoiceArchiveTableProps) {
  
  // Funkcija za določitev tipa dokumenta
  const getDocumentType = (inv: Invoice): 'invoice' | 'estimate' | 'draft' => {
    if (inv.status === 'draft') return 'draft'
    if (inv.number && inv.number.startsWith('PR-')) return 'estimate'
    if (inv.number && inv.number.startsWith('R-')) return 'invoice'
    if (inv.number && inv.number.includes('OSNUTEK')) return 'draft'
    return 'invoice'
  }

  // Filtriranje glede na vrsto dokumenta
  const filteredInvoices = invoices.filter(inv => {
    if (documentType === 'all') return true
    const type = getDocumentType(inv)
    return type === documentType
  })

  // Sortiranje
  const sortedInvoices = [...filteredInvoices].sort((a, b) => {
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

  const getPaymentInfo = (invoiceId: string) => {
    return mockPayments[invoiceId] || { paid: 0, remaining: 0, percentage: 0 }
  }

const isIssuedInvoice = (inv: Invoice) => {
  const status = inv.status
  // Za predračune (PR-) prikažemo plačila tudi za issued in sent
  if (inv.number?.startsWith('PR-')) {
    // Za converted ne prikazujemo plačil
    if (status === 'paid') return true // Plačan - prikažemo plačilo
    return status === 'issued' || status === 'sent' || status === 'overdue'
  }
  // Za račune
  return status === 'sent' || status === 'paid' || status === 'partially_paid' || status === 'overdue' || status === 'issued'
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
            <TableHead className="px-4 py-3 text-right font-semibold text-xs lg:text-sm">Skupni znesek</TableHead>
            <TableHead className="px-4 py-3 text-right w-[120px] text-xs lg:text-sm">Plačano</TableHead>
            <TableHead className="px-4 py-3 text-right w-[150px] text-xs lg:text-sm">Preostanek</TableHead>
            <TableHead className="px-4 py-3 text-center w-[150px] text-xs lg:text-sm">Status</TableHead>
            <TableHead className="px-4 py-3 text-center w-[150px] text-xs lg:text-sm">Zapadlost</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedInvoices.map(inv => {
            const daysLate = inv.status === 'overdue' ? Math.floor((new Date().getTime() - new Date(inv.dueDate).getTime()) / (1000 * 3600 * 24)) : 0
            const paymentInfo = getPaymentInfo(inv.id)
            const isFullyPaid = paymentInfo.remaining <= 0 && paymentInfo.paid > 0
            const showPaymentData = isIssuedInvoice(inv)
            
            return (
              <TableRow 
                key={inv.id} 
                className={`${inv.status === 'overdue' ? 'bg-red-50' : ''} cursor-pointer hover:bg-blue-100 transition-colors`}
                onClick={() => onInvoiceClick(inv)}
              >
                <TableCell className="px-2 py-1 whitespace-nowrap text-xs lg:text-sm">
                  <span 
                    className="text-blue-600 underline hover:text-blue-800 hover:font-semibold transition-all duration-200 cursor-pointer"
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
                
                <TableCell className="px-2 py-1 text-right whitespace-nowrap text-xs lg:text-sm">
                  {showPaymentData ? (
                    <div className="flex flex-col items-end">
                      <span className={`font-medium ${isFullyPaid ? 'text-green-600' : paymentInfo.paid > 0 ? 'text-blue-600' : 'text-gray-600'}`}>
                        {formatCurrency(paymentInfo.paid)}
                      </span>
                      {paymentInfo.percentage > 0 && paymentInfo.percentage < 100 && (
                        <span className="text-[10px] text-gray-400">
                          {paymentInfo.percentage}%
                        </span>
                      )}
                    </div>
                  ) : (
                    <span className="text-gray-300">-</span>
                  )}
                </TableCell>
                
                <TableCell className="px-2 py-1 text-right whitespace-nowrap text-xs lg:text-sm">
                  {showPaymentData ? (
                    <span className={`font-medium ${paymentInfo.remaining > 0 ? 'text-red-600' : 'text-green-600'}`}>
                      {formatCurrency(paymentInfo.remaining)}
                    </span>
                  ) : (
                    <span className="text-gray-300">-</span>
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
                          +{daysLate} dni
                        </div>
                      )}
                    </>
                  ) : (
                    <span className="text-gray-300 text-xs">-</span>
                  )}
                </TableCell>
              </TableRow>
            )
          })}
          {sortedInvoices.length === 0 && (
            <TableRow>
              <TableCell colSpan={10} className="text-center text-gray-400 py-8 text-xs lg:text-sm">
                {documentType === 'all' && 'Ni dokumentov'}
                {documentType === 'invoice' && 'Ni računov'}
                {documentType === 'estimate' && 'Ni predračunov'}
                {documentType === 'draft' && 'Ni osnutkov'}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      
      <div className="flex items-center justify-between px-4 py-3 border-t">
        <div className="text-xs lg:text-sm text-gray-500">
          Skupaj: {sortedInvoices.length} dokumentov
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
          </Button>
        </div>
      </div>
    </div>
  )
}