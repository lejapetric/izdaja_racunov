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

export function InvoiceArchiveTable({ invoices, customers, onInvoiceClick }: InvoiceArchiveTableProps) {
  // Sort invoices: first by date (newest to oldest), then by invoice number (for same date)
  // Draft invoices (without number) go to the end for the same date
  const sortedInvoices = [...invoices].sort((a, b) => {
    // First compare by issueDate
    const dateA = new Date(a.issueDate).getTime()
    const dateB = new Date(b.issueDate).getTime()
    
    if (dateA !== dateB) {
      return dateB - dateA // Descending (newest first)
    }
    
    // Same date - sort by invoice number
    // Handle missing invoice numbers (drafts)
    const numA = a.number || ''
    const numB = b.number || ''
    
    // If both have numbers, compare numerically
    if (numA && numB) {
      // Extract numeric part if numbers have format like "INV-001"
      const numericA = parseInt(numA.replace(/\D/g, '')) || 0
      const numericB = parseInt(numB.replace(/\D/g, '')) || 0
      return numericB - numericA // Descending (higher number first)
    }
    
    // If only one has a number, the one with number comes first
    if (numA && !numB) return -1
    if (!numA && numB) return 1
    
    // Both don't have numbers (drafts) - sort by id or keep as is
    return (b.id || '').localeCompare(a.id || '')
  })

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="px-1 py-3 text-left w-[110px] text-xs lg:text-sm">Številka računa</TableHead>
            <TableHead className="px-4 py-3 text-center text-xs lg:text-sm">Datum</TableHead>
            <TableHead className="px-4 py-3 text-left w-[240px] text-xs lg:text-sm">Kupec</TableHead>
            <TableHead className="px-4 py-3 text-right text-xs lg:text-sm">Neto</TableHead>
            <TableHead className="px-4 py-3 text-right text-xs lg:text-sm">DDV</TableHead>
            <TableHead className="px-4 py-3 text-right text-xs lg:text-sm">Bruto</TableHead>
            <TableHead className="px-4 py-3 text-center w-[180px] text-xs lg:text-sm">Status</TableHead>
            <TableHead className="px-4 py-3 text-center w-[140px] text-xs lg:text-sm">Zapadlost</TableHead>
            <TableHead className="px-4 py-3 text-center w-[150px] text-xs lg:text-sm"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedInvoices.map(inv => {
            const daysLate = inv.status === 'overdue' ? Math.floor((new Date().getTime() - new Date(inv.dueDate).getTime()) / (1000 * 3600 * 24)) : 0
            const customer = customers.find(c => c.id === inv.customerId)
            const address = customer?.address || ''
            const parts = address.split(',')
            const municipality = parts.length > 1 ? parts[parts.length - 1].trim() : address.trim()
            
            return (
              <TableRow 
                key={inv.id} 
                className={`${inv.status === 'overdue' ? 'bg-red-50' : ''} cursor-pointer hover:bg-gray-50 transition-colors`}
                onClick={() => onInvoiceClick(inv)}
              >
                <TableCell className="px-2 py-1 whitespace-nowrap text-xs lg:text-sm">
                  {inv.number || <span className="text-gray-400 italic">Osnutek</span>}
                </TableCell>
                <TableCell className="px-2 py-1 text-center whitespace-nowrap text-xs lg:text-sm">{formatDate(inv.issueDate)}</TableCell>
                <TableCell className="px-2 py-1 whitespace-nowrap text-xs lg:text-sm">
                  <div className="font-medium">{inv.customerName}</div>
                  <div className="text-[10px] lg:text-xs text-gray-500">{inv.customerTaxId}</div>
                </TableCell>
                <TableCell className="px-2 py-1 text-right whitespace-nowrap text-xs lg:text-sm">{formatCurrency(inv.totalNet)}</TableCell>
                <TableCell className="px-2 py-1 text-right whitespace-nowrap text-xs lg:text-sm">{formatCurrency(inv.totalVat)}</TableCell>
                <TableCell className="px-2 py-1 text-right font-semibold whitespace-nowrap text-xs lg:text-sm">{formatCurrency(inv.totalGross)}</TableCell>
                <TableCell className="px-2 py-1 text-center whitespace-nowrap text-xs lg:text-sm">
                  <Badge className={`${statusColors[inv.status]} text-[10px] lg:text-xs`}>{statusLabels[inv.status]}</Badge>
                </TableCell>
                <TableCell className="px-2 py-1 text-center whitespace-nowrap text-xs lg:text-sm">
                  {formatDate(inv.dueDate)}
                  {inv.status === 'overdue' && <div className="text-[10px] lg:text-xs text-red-500 whitespace-nowrap">{daysLate} dni zamude</div>}
                </TableCell>
                <TableCell className="px-2 py-1 text-center whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                  <Button 
                    size="sm" 
                    variant="outline"
                    className="text-[10px] lg:text-xs h-6 lg:h-7 px-1.5 lg:px-2 whitespace-nowrap"
                    onClick={() => onInvoiceClick(inv)}
                  >
                    Več o računu
                  </Button>
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