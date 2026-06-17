// src/components/Confirmation.tsx
import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { formatCurrency, formatDate } from '@/lib/utils'
import { useInvoices } from '@/hooks/useInvoices'
import { InvoiceView } from './invoice/InvoiceView'
import { InvoiceFilters } from './invoice/InvoiceFilters'
import { InvoiceStatus } from '@/types'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { CheckCircle, Eye, AlertCircle, X, ThumbsDown, AlertTriangle } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'

// Status opcije za potrjevanje
const confirmationStatusOptions: { value: InvoiceStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'Vsi' },
  { value: 'issued', label: 'Nepotrjeni' },
  { value: 'confirmed', label: 'Potrjeni' },
  { value: 'rejected', label: 'Zavrnjeni' },
]

export function Confirmation({ setActiveView }: ConfirmationProps) {
  const { invoices, customers, updateInvoice } = useInvoices()
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string | null>(null)
  const [confirmModalOpen, setConfirmModalOpen] = useState(false)
  const [rejectModalOpen, setRejectModalOpen] = useState(false)
  const [confirmInvoice, setConfirmInvoice] = useState<any>(null)
  const [rejectReason, setRejectReason] = useState('')
  const [rejectError, setRejectError] = useState('')
  
  // Filtri
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
  const [activeTab, setActiveTab] = useState('all')
  
  // Sortiranje
  const [sortField, setSortField] = useState<any>('issueDate')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc')
  const [secondarySortField, setSecondarySortField] = useState<any>('number')
  const [secondarySortDirection, setSecondarySortDirection] = useState<'asc' | 'desc'>('asc')

  // Pridobi samo račune s statusom 'issued', 'confirmed' ali 'rejected'
  const confirmationInvoices = invoices.filter(inv => 
    inv.status === 'issued' || inv.status === 'confirmed' || inv.status === 'rejected'
  )

  // Unique podatki za filtre
  const uniqueNumbers = Array.from(new Map(confirmationInvoices.map(inv => [inv.number, inv.number])).entries()).map(([number]) => ({ number })).filter(item => item.number.toLowerCase().includes(searchNumber.toLowerCase()))
  const uniqueCustomers = Array.from(new Map(confirmationInvoices.map(inv => [inv.customerId, { id: inv.customerId, name: inv.customerName, taxId: inv.customerTaxId }])).entries()).map(([_, customer]) => customer).filter(c => c.name.toLowerCase().includes(searchCustomer.toLowerCase()) || c.taxId.toLowerCase().includes(searchCustomer.toLowerCase()))
  const uniqueMunicipalities = Array.from(new Set(confirmationInvoices.map(inv => { const customer = customers.find(c => c.id === inv.customerId); const address = customer?.address || ''; const parts = address.split(','); return parts.length > 1 ? parts[parts.length - 1].trim() : address.trim(); }))).filter(m => m.toLowerCase().includes(searchMunicipality.toLowerCase()))

  const filterInvoices = (statusFilter?: string) => confirmationInvoices.filter(inv => {
    if (selectedNumber && inv.number !== selectedNumber) return false
    if (selectedCustomer && inv.customerId !== selectedCustomer.id) return false
    if (selectedMunicipality) { const customer = customers.find(c => c.id === inv.customerId); const address = customer?.address || ''; const parts = address.split(','); const municipality = parts.length > 1 ? parts[parts.length - 1].trim() : address.trim(); if (!municipality.toLowerCase().includes(selectedMunicipality.toLowerCase())) return false }
    if (priceMin !== '' && inv.totalGross < priceMin) return false
    if (priceMax !== '' && inv.totalGross > priceMax) return false
    const invoiceDiscountPercent = inv.discountPercent ?? 0
    if (discountMin !== '' && invoiceDiscountPercent < discountMin) return false
    if (discountMax !== '' && invoiceDiscountPercent > discountMax) return false
    const dateFromStr = dateFrom ? dateFrom.toISOString().split('T')[0] : ''; const dateToStr = dateTo ? dateTo.toISOString().split('T')[0] : ''
    if (dateFromStr && inv.issueDate < dateFromStr) return false; if (dateToStr && inv.issueDate > dateToStr) return false
    const dueFromStr = dueDateFrom ? dueDateFrom.toISOString().split('T')[0] : ''; const dueToStr = dueDateTo ? dueDateTo.toISOString().split('T')[0] : ''
    if (dueFromStr && inv.dueDate < dueFromStr) return false; if (dueToStr && inv.dueDate > dueToStr) return false
    if (selectedStatus !== 'all') {
      if (inv.status !== selectedStatus) return false
    }
    if (statusFilter) {
      if (inv.status !== statusFilter) return false
    }
    return true
  })

  const filteredAll = filterInvoices()
  const filteredPending = filterInvoices('issued')
  const filteredConfirmed = filterInvoices('confirmed')
  const filteredRejected = filterInvoices('rejected')

  const clearAllFilters = () => { 
    setSelectedNumber(''); setSearchNumber(''); setSelectedCustomer(null); setSearchCustomer('')
    setSelectedMunicipality(''); setSearchMunicipality(''); setPriceMin(''); setPriceMax('')
    setDiscountMin(''); setDiscountMax(''); setDateFrom(null); setDateTo(null)
    setDueDateFrom(null); setDueDateTo(null); setSelectedStatus('all')
  }

  const handleInvoiceClick = (invoice: any) => {
    setSelectedInvoiceId(invoice.id)
  }

  const openConfirmModal = (invoice: any) => {
    setConfirmInvoice(invoice)
    setConfirmModalOpen(true)
  }

  const openRejectModal = (invoice: any) => {
    setConfirmInvoice(invoice)
    setRejectReason('')
    setRejectError('')
    setRejectModalOpen(true)
  }

  const handleConfirmInvoice = () => {
    if (!confirmInvoice) return
    
    // Dodaj opombo o potrditvi
    const note = confirmInvoice.note 
      ? `${confirmInvoice.note}\n\n[${new Date().toLocaleDateString('sl-SI')} ${new Date().toLocaleTimeString('sl-SI')}] Račun potrdil direktor.` 
      : `[${new Date().toLocaleDateString('sl-SI')} ${new Date().toLocaleTimeString('sl-SI')}] Račun potrdil direktor.`
    
    updateInvoice(confirmInvoice.id, {
      status: 'confirmed' as any,
      note: note
    })
    
    setConfirmModalOpen(false)
    setConfirmInvoice(null)
    setSelectedInvoiceId(null)
  }

  const handleRejectInvoice = () => {
    if (!confirmInvoice) return
    
    // Preveri ali je razlog za zavrnitev vpisan
    if (!rejectReason.trim()) {
      setRejectError('Prosimo, napišite razlog za zavrnitev računa.')
      return
    }
    
    // Dodaj opombo o zavrnitvi
    const note = confirmInvoice.note 
      ? `${confirmInvoice.note}\n\n[${new Date().toLocaleDateString('sl-SI')} ${new Date().toLocaleTimeString('sl-SI')}] RAČUN ZAVRNJEN!\nRazlog: ${rejectReason}` 
      : `[${new Date().toLocaleDateString('sl-SI')} ${new Date().toLocaleTimeString('sl-SI')}] RAČUN ZAVRNJEN!\nRazlog: ${rejectReason}`
    
    updateInvoice(confirmInvoice.id, {
      status: 'rejected' as any,
      note: note
    })
    
    setRejectModalOpen(false)
    setConfirmInvoice(null)
    setSelectedInvoiceId(null)
    setRejectReason('')
    setRejectError('')
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'issued': return 'Nepotrjen'
      case 'confirmed': return 'Potrjen'
      case 'rejected': return 'Zavrnjen'
      default: return status
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'issued': return 'bg-yellow-100 text-yellow-800'
      case 'confirmed': return 'bg-green-100 text-green-800'
      case 'rejected': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  // Število čakajočih na potrditev
  const pendingCount = confirmationInvoices.filter(inv => inv.status === 'issued').length
  const rejectedCount = confirmationInvoices.filter(inv => inv.status === 'rejected').length

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold">Potrditev računov</h1>
          <Badge className="bg-yellow-100 text-yellow-800 px-3 py-1.5 text-sm">
            <AlertCircle className="w-4 h-4 mr-1.5" />
            {pendingCount} Nepotrjen
          </Badge>
          {rejectedCount > 0 && (
            <Badge className="bg-red-100 text-red-800 px-3 py-1.5 text-sm animate-pulse">
              <AlertTriangle className="w-4 h-4 mr-1.5" />
              {rejectedCount} Zavrnjen
            </Badge>
          )}
        </div>
      </div>

      <Card>
        <CardContent className="pt-6">
          <InvoiceFilters 
            searchNumber={searchNumber} setSearchNumber={setSearchNumber} selectedNumber={selectedNumber} setSelectedNumber={setSelectedNumber}
            searchCustomer={searchCustomer} setSearchCustomer={setSearchCustomer} selectedCustomer={selectedCustomer} setSelectedCustomer={setSelectedCustomer}
            searchMunicipality={searchMunicipality} setSearchMunicipality={setSearchMunicipality} selectedMunicipality={selectedMunicipality} setSelectedMunicipality={setSelectedMunicipality}
            priceMin={priceMin} setPriceMin={setPriceMin} priceMax={priceMax} setPriceMax={setPriceMax}
            discountMin={discountMin} setDiscountMin={setDiscountMin} discountMax={discountMax} setDiscountMax={setDiscountMax}
            dateFrom={dateFrom} setDateFrom={setDateFrom} dateTo={dateTo} setDateTo={setDateTo}
            dueDateFrom={dueDateFrom} setDueDateFrom={setDueDateFrom} dueDateTo={dueDateTo} setDueDateTo={setDueDateTo}
            selectedStatus={selectedStatus as any} setSelectedStatus={setSelectedStatus as any}
            uniqueNumbers={uniqueNumbers} uniqueCustomers={uniqueCustomers} uniqueMunicipalities={uniqueMunicipalities} statusOptions={confirmationStatusOptions as any}
            clearAllFilters={clearAllFilters}
            sortField={sortField}
            setSortField={setSortField}
            sortDirection={sortDirection}
            setSortDirection={setSortDirection}
            secondarySortField={secondarySortField}
            setSecondarySortField={setSecondarySortField}
            secondarySortDirection={secondarySortDirection}
            setSecondarySortDirection={setSecondarySortDirection}
          />
          
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="all">Vsi ({filteredAll.length})</TabsTrigger>
              <TabsTrigger value="pending">Čaka na potrditev ({filteredPending.length})</TabsTrigger>
              <TabsTrigger value="confirmed">Potrjeni ({filteredConfirmed.length})</TabsTrigger>
              <TabsTrigger value="rejected" className="text-red-600">
                Zavrnjeni ({filteredRejected.length})
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="all">
              <ConfirmationTable 
                invoices={filteredAll}
                onInvoiceClick={handleInvoiceClick}
                onConfirm={openConfirmModal}
                onReject={openRejectModal}
                getStatusLabel={getStatusLabel}
                getStatusColor={getStatusColor}
              />
            </TabsContent>
            <TabsContent value="pending">
              <ConfirmationTable 
                invoices={filteredPending}
                onInvoiceClick={handleInvoiceClick}
                onConfirm={openConfirmModal}
                onReject={openRejectModal}
                getStatusLabel={getStatusLabel}
                getStatusColor={getStatusColor}
              />
            </TabsContent>
            <TabsContent value="confirmed">
              <ConfirmationTable 
                invoices={filteredConfirmed}
                onInvoiceClick={handleInvoiceClick}
                onConfirm={openConfirmModal}
                onReject={openRejectModal}
                getStatusLabel={getStatusLabel}
                getStatusColor={getStatusColor}
              />
            </TabsContent>
            <TabsContent value="rejected">
              <ConfirmationTable 
                invoices={filteredRejected}
                onInvoiceClick={handleInvoiceClick}
                onConfirm={openConfirmModal}
                onReject={openRejectModal}
                getStatusLabel={getStatusLabel}
                getStatusColor={getStatusColor}
                isRejectedTab={true}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-4 pb-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-blue-500 mt-0.5" />
            <div className="text-sm text-blue-700">
              <p className="font-medium">Informacije o potrjevanju</p>
              <p className="text-xs mt-1">Ko potrdite račun, se njegov status spremeni v "Potrjen". Potrjeni računi se nato pojavijo v seznamu računov. Pred potrditvijo natančno preglejte vse podatke.</p>
            </div>
          </div>
        </CardContent>
      </Card>

      

<InvoiceView 
  invoiceId={selectedInvoiceId} 
  open={!!selectedInvoiceId} 
  onClose={() => setSelectedInvoiceId(null)}
  onEdit={() => {}}
  onSendEmail={() => {}}
  onSendPost={() => {}}
  onMarkAsPaid={() => {}}
  onCancel={() => {}}
  onAudit={() => {}}
  documentType="invoice" 
  hideActions={true}  // <-- DODANO
/>
    </div>
  )
}

// Tabela za potrjevanje
interface ConfirmationTableProps {
  invoices: any[]
  onInvoiceClick: (invoice: any) => void
  onConfirm: (invoice: any) => void
  onReject: (invoice: any) => void
  getStatusLabel: (status: string) => string
  getStatusColor: (status: string) => string
  isRejectedTab?: boolean
}

function ConfirmationTable({ 
  invoices, 
  onInvoiceClick, 
  onConfirm, 
  onReject, 
  getStatusLabel, 
  getStatusColor,
  isRejectedTab = false 
}: ConfirmationTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="px-1 py-3 text-left w-[110px]">Številka</TableHead>
          <TableHead className="px-4 py-3 text-center">Datum izdaje</TableHead>
          <TableHead className="px-4 py-3 text-left w-[200px]">Kupec</TableHead>
          <TableHead className="px-4 py-3 text-right">Neto</TableHead>
          <TableHead className="px-4 py-3 text-right">DDV</TableHead>
          <TableHead className="px-4 py-3 text-right">Bruto</TableHead>
          <TableHead className="px-4 py-3 text-center w-[150px]">Status</TableHead>
          <TableHead className="px-4 py-3 text-center w-[280px]">Akcije</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {invoices.map(inv => {
          const isRejected = inv.status === 'rejected'
          const isPending = inv.status === 'issued'
          
          return (
            <TableRow 
              key={inv.id} 
              className={`
                ${isPending ? 'bg-yellow-50/50' : ''} 
                ${isRejected ? 'bg-red-50/50' : ''} 
                ${isRejected && isRejectedTab ? 'animate-pulse' : ''}
                cursor-pointer hover:bg-gray-50 transition-colors
              `}
            >
              <TableCell 
                className="px-2 py-2"
                onClick={() => onInvoiceClick(inv)}
              >
                <span className="hover:font-bold hover:underline hover:text-blue-600 transition-all duration-200 cursor-pointer">
                  {inv.number}
                </span>
              </TableCell>
              <TableCell className="px-4 py-2 text-center" onClick={() => onInvoiceClick(inv)}>{formatDate(inv.issueDate)}</TableCell>
              <TableCell 
                className="px-4 py-2"
                onClick={() => onInvoiceClick(inv)}
              >
                <div className="font-medium">{inv.customerName}</div>
                <div className="text-xs text-gray-500">{inv.customerTaxId}</div>
              </TableCell>
              <TableCell className="px-4 py-2 text-right" onClick={() => onInvoiceClick(inv)}>{formatCurrency(inv.totalNet)}</TableCell>
              <TableCell className="px-4 py-2 text-right" onClick={() => onInvoiceClick(inv)}>{formatCurrency(inv.totalVat)}</TableCell>
              <TableCell className="px-4 py-2 text-right font-semibold" onClick={() => onInvoiceClick(inv)}>{formatCurrency(inv.totalGross)}</TableCell>
              <TableCell className="px-4 py-2 text-center" onClick={() => onInvoiceClick(inv)}>
                <Badge className={`
                  ${getStatusColor(inv.status)}
                  ${isRejected && isRejectedTab ? 'animate-pulse border-2 border-red-400' : ''}
                `}>
                  {getStatusLabel(inv.status)}
                </Badge>
              </TableCell>
              <TableCell className="px-4 py-2 text-center" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-center gap-2">
                  {inv.status === 'issued' && (
                    <>
                      <Button 
                        size="sm" 
                        variant="default"
                        className="text-xs h-7 px-2 bg-green-600 hover:bg-green-700"
                        onClick={() => onConfirm(inv)}
                      >
                        <CheckCircle className="w-3.5 h-3.5 mr-1" /> Potrdi
                      </Button>
                     
                    </>
                  )}
                  {inv.status === 'confirmed' && (
                    <span className="text-xs text-gray-500 flex items-center gap-1">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      Potrjen
                    </span>
                  )}
                  {inv.status === 'rejected' && (
                    <div className="flex flex-col items-center gap-1">
                      <span className="text-xs text-red-600 flex items-center gap-1">
                        <AlertTriangle className="w-4 h-4" />
                        Zavrnjen - čaka na popravek
                      </span>
                      <Button 
                        size="sm" 
                        variant="outline"
                        className="text-xs h-6 px-2 border-yellow-400 text-yellow-700 hover:bg-yellow-50"
                        onClick={() => {
                          // Odpri invoice view za pregled
                          onInvoiceClick(inv)
                        }}
                      >
                        <Eye className="w-3 h-3 mr-1" /> Poglej napako
                      </Button>
                    </div>
                  )}
                </div>
              </TableCell>
            </TableRow>
          )
        })}
        {invoices.length === 0 && (
          <TableRow>
            <TableCell colSpan={8} className="text-center text-gray-400 py-8">
              <div className="flex flex-col items-center gap-2">
                <CheckCircle className="w-8 h-8 text-green-400" />
                <span>Ni računov za prikaz</span>
              </div>
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  )
}

// Props za glavno komponento
interface ConfirmationProps {
  setActiveView?: (view: string) => void
}