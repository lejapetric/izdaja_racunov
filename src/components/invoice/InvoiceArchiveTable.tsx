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
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="px-1 py-3 text-left w-[110px]">Številka računa</TableHead>
          <TableHead className="px-4 py-3 text-center">Datum</TableHead>
          <TableHead className="px-4 py-3 text-left w-[240px]">Kupec</TableHead>
          <TableHead className="px-4 py-3 text-left">Občina</TableHead>
          <TableHead className="px-4 py-3 text-right">Neto</TableHead>
          <TableHead className="px-4 py-3 text-right">DDV</TableHead>
          <TableHead className="px-4 py-3 text-right">Bruto</TableHead>
          <TableHead className="px-4 py-3 text-center w-[90px]">Popust</TableHead>
          <TableHead className="px-4 py-3 text-center w-[120px]">Status</TableHead>
          <TableHead className="px-4 py-3 text-center w-[140px]">Zapadlost</TableHead>
          <TableHead className="px-4 py-3 text-center w-[150px]"></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {invoices.map(inv => {
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
              <TableCell className="px-2 py-2 font-left">{inv.number}</TableCell>
              <TableCell className="px-4 py-2 text-center">{formatDate(inv.issueDate)}</TableCell>
              <TableCell className="px-4 py-2">
                <div className="font-medium">{inv.customerName}</div>
                <div className="text-xs text-gray-500">{inv.customerTaxId}</div>
              </TableCell>
              <TableCell className="px-4 py-2">{municipality}</TableCell>
              <TableCell className="px-4 py-2 text-right">{formatCurrency(inv.totalNet)}</TableCell>
              <TableCell className="px-4 py-2 text-right">{formatCurrency(inv.totalVat)}</TableCell>
              <TableCell className="px-4 py-2 text-right font-semibold">{formatCurrency(inv.totalGross)}</TableCell>
              <TableCell className="px-4 py-2 text-center">{inv.discountPercent}%</TableCell>
              <TableCell className="px-4 py-2 text-center"><Badge className={statusColors[inv.status]}>{statusLabels[inv.status]}</Badge></TableCell>
              <TableCell className="px-4 py-2 text-center">
                {formatDate(inv.dueDate)}
                {inv.status === 'overdue' && <div className="text-xs text-red-500">{daysLate} dni zamude</div>}
              </TableCell>
              <TableCell className="px-4 py-2 text-center" onClick={(e) => e.stopPropagation()}>
                <Button 
                  size="sm" 
                  variant="outline"
                  className="text-xs h-7 px-2"
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
  )
}