// src/components/invoice/InvoiceArchiveTable.tsx
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatCurrency, formatDate } from '@/lib/utils'
import { Eye } from 'lucide-react'
import { Invoice } from '@/types'
import { statusLabels, statusColors } from '@/data/mockData'

interface InvoiceArchiveTableProps {
  invoices: Invoice[]
  customers: any[]
  onInvoiceClick: (invoice: Invoice) => void
}

export function InvoiceArchiveTable({ invoices, customers, onInvoiceClick }: InvoiceArchiveTableProps) {
  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="text-left w-[100px]">Številka</TableHead>
            <TableHead className="text-left w-[90px]">Datum</TableHead>
            <TableHead className="text-left w-[200px]">Kupec</TableHead>
            <TableHead className="text-left w-[100px]">Občina</TableHead>
            <TableHead className="text-right w-[90px]">Neto (€)</TableHead>
            <TableHead className="text-right w-[90px]">DDV (€)</TableHead>
            <TableHead className="text-right w-[90px]">Bruto (€)</TableHead>
            <TableHead className="text-right w-[70px]">Popust (%)</TableHead>
            <TableHead className="text-right w-[90px]">Status</TableHead>
            <TableHead className="text-right w-[110px]">Zapadlost</TableHead>
            <TableHead className="text-center w-[60px]">Akcije</TableHead>
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
                <TableCell className="font-mono text-left">{inv.number}</TableCell>
                <TableCell className="text-left">{formatDate(inv.issueDate)}</TableCell>
                <TableCell className="text-left">
                  <div className="font-medium truncate max-w-[180px]" title={inv.customerName}>{inv.customerName}</div>
                  <div className="text-xs text-gray-500 truncate max-w-[180px]" title={inv.customerTaxId}>{inv.customerTaxId}</div>
                </TableCell>
                <TableCell className="text-left truncate max-w-[90px]" title={municipality}>{municipality}</TableCell>
                <TableCell className="text-right font-mono">{formatCurrency(inv.totalNet)}</TableCell>
                <TableCell className="text-right font-mono">{formatCurrency(inv.totalVat)}</TableCell>
                <TableCell className="text-right font-mono font-semibold">{formatCurrency(inv.totalGross)}</TableCell>
                <TableCell className="text-right">{inv.discountPercent}%</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end">
                    <Badge className={statusColors[inv.status]}>{statusLabels[inv.status]}</Badge>
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <div>{formatDate(inv.dueDate)}</div>
                  {inv.status === 'overdue' && <div className="text-xs text-red-500">{daysLate} dni zamude</div>}
                </TableCell>
                <TableCell className="text-center" onClick={(e) => e.stopPropagation()}>
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    title="Več o računu"
                    onClick={() => onInvoiceClick(inv)}
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}