// src/components/Reports.tsx
import { useState } from 'react'
import { useInvoices } from '@/hooks/useInvoices'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { formatCurrency, formatDate, formatDateForCompare } from '@/lib/utils'
import { Download, FileText, PieChart, Printer } from 'lucide-react'
import { Invoice, InvoiceStatus } from '@/types'
import { InvoiceFilters } from './invoice/InvoiceFilters'
import { statusLabels } from '@/data/mockData'

const statusOptions: { value: InvoiceStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'Vsi' }, { value: 'draft', label: 'Osnutki' }, { value: 'issued', label: 'Izdani' },
  { value: 'sent', label: 'Poslani' }, { value: 'overdue', label: 'Zapadli' }, { value: 'paid', label: 'Plačani' }, { value: 'cancelled', label: 'Stornirani' },
]

export function Reports() {
  const { invoices, customers } = useInvoices()
  const [selectedNumber, setSelectedNumber] = useState('')
  const [searchNumber, setSearchNumber] = useState('')
  const [selectedCustomer, setSelectedCustomer] = useState<{ id: string; name: string; taxId: string } | null>(null)
  const [searchCustomer, setSearchCustomer] = useState('')
  const [selectedMunicipality, setSelectedMunicipality] = useState('')
  const [searchMunicipality, setSearchMunicipality] = useState('')
  const [priceMin, setPriceMin] = useState<number | ''>('')
  const [priceMax, setPriceMax] = useState<number | ''>('')
  const [discountMin, setDiscountMin] = useState<number | ''>('')
  const [discountMax, setDiscountMax] = useState<number | ''>('')
  const [dateFrom, setDateFrom] = useState<Date | null>(null)
  const [dateTo, setDateTo] = useState<Date | null>(null)
  const [dueDateFrom, setDueDateFrom] = useState<Date | null>(null)
  const [dueDateTo, setDueDateTo] = useState<Date | null>(null)
  const [selectedStatus, setSelectedStatus] = useState<InvoiceStatus | 'all'>('all')
  const [showReport, setShowReport] = useState(false)
  const [reportType, setReportType] = useState<'list' | 'analysis'>('list')
  const [filteredInvoices, setFilteredInvoices] = useState<Invoice[]>([])

  const uniqueNumbers = Array.from(new Map(invoices.map(inv => [inv.number, inv.number])).entries()).map(([number]) => ({ number })).filter(item => item.number.toLowerCase().includes(searchNumber.toLowerCase()))
  const uniqueCustomers = Array.from(new Map(invoices.map(inv => [inv.customerId, { id: inv.customerId, name: inv.customerName, taxId: inv.customerTaxId }])).entries()).map(([_, customer]) => customer).filter(c => c.name.toLowerCase().includes(searchCustomer.toLowerCase()) || c.taxId.toLowerCase().includes(searchCustomer.toLowerCase()))
  const uniqueMunicipalities = Array.from(new Set(invoices.map(inv => { const customer = customers.find(c => c.id === inv.customerId); const address = customer?.address || ''; const parts = address.split(','); return parts.length > 1 ? parts[parts.length - 1].trim() : address.trim(); }))).filter(m => m.toLowerCase().includes(searchMunicipality.toLowerCase()))

  const applyFilters = () => {
    const filtered = invoices.filter(inv => {
      if (selectedNumber && inv.number !== selectedNumber) return false
      if (selectedCustomer && inv.customerId !== selectedCustomer.id) return false
      if (selectedMunicipality) { const customer = customers.find(c => c.id === inv.customerId); const address = customer?.address || ''; const parts = address.split(','); const municipality = parts.length > 1 ? parts[parts.length - 1].trim() : address.trim(); if (!municipality.toLowerCase().includes(selectedMunicipality.toLowerCase())) return false }
      if (priceMin !== '' && inv.totalGross < priceMin) return false
      if (priceMax !== '' && inv.totalGross > priceMax) return false
      if (discountMin !== '' && inv.discountPercent < discountMin) return false
      if (discountMax !== '' && inv.discountPercent > discountMax) return false
      const dateFromStr = formatDateForCompare(dateFrom); const dateToStr = formatDateForCompare(dateTo)
      if (dateFromStr && inv.issueDate < dateFromStr) return false
      if (dateToStr && inv.issueDate > dateToStr) return false
      const dueFromStr = formatDateForCompare(dueDateFrom); const dueToStr = formatDateForCompare(dueDateTo)
      if (dueFromStr && inv.dueDate < dueFromStr) return false
      if (dueToStr && inv.dueDate > dueToStr) return false
      if (selectedStatus !== 'all' && inv.status !== selectedStatus) return false
      return true
    })
    setFilteredInvoices(filtered)
    setShowReport(true)
  }

  const clearAllFilters = () => {
    setSelectedNumber(''); setSearchNumber(''); setSelectedCustomer(null); setSearchCustomer('')
    setSelectedMunicipality(''); setSearchMunicipality(''); setPriceMin(''); setPriceMax('')
    setDiscountMin(''); setDiscountMax(''); setDateFrom(null); setDateTo(null)
    setDueDateFrom(null); setDueDateTo(null); setSelectedStatus('all'); setShowReport(false)
  }

  const stats = (() => {
    const totalGross = filteredInvoices.reduce((sum, inv) => sum + inv.totalGross, 0)
    const paidAmount = filteredInvoices.filter(inv => inv.status === 'paid').reduce((sum, inv) => sum + inv.totalGross, 0)
    const overdueAmount = filteredInvoices.filter(inv => inv.status === 'overdue').reduce((sum, inv) => sum + inv.totalGross, 0)
    const byStatus: Record<string, { count: number; amount: number }> = {}
    filteredInvoices.forEach(inv => { if (!byStatus[inv.status]) byStatus[inv.status] = { count: 0, amount: 0 }; byStatus[inv.status].count++; byStatus[inv.status].amount += inv.totalGross })
    const byCustomer: Record<string, { name: string; count: number; amount: number }> = {}
    filteredInvoices.forEach(inv => { if (!byCustomer[inv.customerId]) byCustomer[inv.customerId] = { name: inv.customerName, count: 0, amount: 0 }; byCustomer[inv.customerId].count++; byCustomer[inv.customerId].amount += inv.totalGross })
    return { totalGross, paidAmount, overdueAmount, byStatus, byCustomer, count: filteredInvoices.length }
  })()

  const exportToExcel = () => {
    const headers = ['Številka', 'Datum', 'Kupec', 'Davčna', 'Neto', 'DDV', 'Bruto', 'Popust %', 'Status', 'Zapadlost']
    const rows = filteredInvoices.map(inv => [inv.number, formatDate(inv.issueDate), inv.customerName, inv.customerTaxId, inv.totalNet, inv.totalVat, inv.totalGross, inv.discountPercent, statusLabels[inv.status], formatDate(inv.dueDate)])
    const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a'); const url = URL.createObjectURL(blob)
    link.setAttribute('href', url); link.setAttribute('download', `porocilo_${new Date().toISOString().split('T')[0]}.csv`)
    link.click(); URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center"><h1 className="text-2xl font-bold">Poročila in analize</h1></div>
      <Card><CardHeader><CardTitle>Filtri za poročilo</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <InvoiceFilters searchNumber={searchNumber} setSearchNumber={setSearchNumber} selectedNumber={selectedNumber} setSelectedNumber={setSelectedNumber}
            searchCustomer={searchCustomer} setSearchCustomer={setSearchCustomer} selectedCustomer={selectedCustomer} setSelectedCustomer={setSelectedCustomer}
            searchMunicipality={searchMunicipality} setSearchMunicipality={setSearchMunicipality} selectedMunicipality={selectedMunicipality} setSelectedMunicipality={setSelectedMunicipality}
            priceMin={priceMin} setPriceMin={setPriceMin} priceMax={priceMax} setPriceMax={setPriceMax}
            discountMin={discountMin} setDiscountMin={setDiscountMin} discountMax={discountMax} setDiscountMax={setDiscountMax}
            dateFrom={dateFrom} setDateFrom={setDateFrom} dateTo={dateTo} setDateTo={setDateTo}
            dueDateFrom={dueDateFrom} setDueDateFrom={setDueDateFrom} dueDateTo={dueDateTo} setDueDateTo={setDueDateTo}
            selectedStatus={selectedStatus} setSelectedStatus={setSelectedStatus}
            uniqueNumbers={uniqueNumbers} uniqueCustomers={uniqueCustomers} uniqueMunicipalities={uniqueMunicipalities} statusOptions={statusOptions}
            clearAllFilters={clearAllFilters} showFilters={true} />
          <div className="flex gap-2 pt-4"><Button onClick={applyFilters} className="bg-primary">Prikaži poročilo</Button></div>
        </CardContent>
      </Card>
      {showReport && (
        <Card><CardHeader className="flex-row justify-between items-center flex-wrap gap-2"><CardTitle>Rezultati poročila</CardTitle>
          <div className="flex gap-2"><Button size="md" variant="outline" onClick={() => setReportType('list')}><FileText className="w-4 h-4 mr-1" /> Seznam</Button>
            <Button size="md" variant="outline" onClick={() => setReportType('analysis')}><PieChart className="w-4 h-4 mr-1" /> Analiza</Button>
            <Button size="md" variant="outline" onClick={exportToExcel}><Download className="w-4 h-4 mr-1" /> Excel</Button>
            <Button size="md" variant="outline" onClick={() => window.print()}><Printer className="w-4 h-4 mr-1" /> PDF / Natisni</Button></div>
        </CardHeader>
        <CardContent>
          {reportType === 'list' ? (
            <Table><TableHeader><TableRow><TableHead>Številka</TableHead><TableHead>Datum</TableHead><TableHead>Kupec</TableHead><TableHead className="text-right">Neto</TableHead><TableHead className="text-right">DDV</TableHead><TableHead className="text-right">Bruto</TableHead><TableHead>Status</TableHead><TableHead>Zapadlost</TableHead></TableRow></TableHeader>
              <TableBody>{filteredInvoices.map(inv => <TableRow key={inv.id}><TableCell className="font-mono">{inv.number}</TableCell><TableCell>{formatDate(inv.issueDate)}</TableCell><TableCell>{inv.customerName}</TableCell><TableCell className="text-right">{formatCurrency(inv.totalNet)}</TableCell><TableCell className="text-right">{formatCurrency(inv.totalVat)}</TableCell><TableCell className="text-right font-semibold">{formatCurrency(inv.totalGross)}</TableCell><TableCell><Badge>{statusLabels[inv.status]}</Badge></TableCell><TableCell>{formatDate(inv.dueDate)}</TableCell></TableRow>)}</TableBody></Table>
          ) : (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="bg-blue-50"><CardContent className="pt-6"><div className="flex justify-between"><div><p className="text-sm text-blue-600">Skupaj bruto</p><p className="text-2xl font-bold text-blue-800">{formatCurrency(stats.totalGross)}</p></div></div></CardContent></Card>
                <Card className="bg-green-50"><CardContent className="pt-6"><div className="flex justify-between"><div><p className="text-sm text-green-600">Plačano</p><p className="text-2xl font-bold text-green-800">{formatCurrency(stats.paidAmount)}</p></div></div></CardContent></Card>
                <Card className="bg-red-50"><CardContent className="pt-6"><div className="flex justify-between"><div><p className="text-sm text-red-600">Zapadlo neplačano</p><p className="text-2xl font-bold text-red-800">{formatCurrency(stats.overdueAmount)}</p></div></div></CardContent></Card>
                <Card className="bg-purple-50"><CardContent className="pt-6"><div className="flex justify-between"><div><p className="text-sm text-purple-600">Število računov</p><p className="text-2xl font-bold text-purple-800">{stats.count}</p></div></div></CardContent></Card>
              </div>
              <Card><CardHeader><CardTitle>Po statusih</CardTitle></CardHeader><CardContent>{Object.entries(stats.byStatus).map(([status, data]) => <div key={status} className="flex justify-between p-2 border-b"><span>{statusLabels[status]}</span><span>{data.count} računov • {formatCurrency(data.amount)}</span></div>)}</CardContent></Card>
              <Card><CardHeader><CardTitle>Po kupcih (top 10)</CardTitle></CardHeader><CardContent>{Object.entries(stats.byCustomer).sort((a, b) => b[1].amount - a[1].amount).slice(0, 10).map(([_, customer]) => <div key={customer.name} className="flex justify-between p-2 border-b"><span>{customer.name}</span><span>{customer.count} računov • {formatCurrency(customer.amount)}</span></div>)}</CardContent></Card>
            </div>
          )}
        </CardContent></Card>
      )}
    </div>
  )
}