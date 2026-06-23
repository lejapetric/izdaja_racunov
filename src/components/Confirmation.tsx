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
  { value: 'unconfirmed', label: 'Nepotrjeni' },
]

export const statusColors: Record<string, string> = {
  draft: 'bg-[#e2e8f0] text-gray-800',
  issued: 'bg-[#bfdbfe] text-blue-800',
  unconfirmed: 'bg-[#fef3c7] text-yellow-800',
  sent: 'bg-[#d1fae5] text-green-800',
  overdue: 'bg-[#fecaca] text-red-800',
  paid: 'bg-[#86efac] text-emerald-800',
  partially_paid: 'bg-[#D4A574] text-white',
  cancelled: 'bg-[#f87171] text-red-800',
  converted: 'bg-[#e9d5ff] text-purple-800',
  rejected: 'bg-[#fed7aa] text-orange-800',
}

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

  // Pridobi samo račune s statusom 'unconfirmed'
  const confirmationInvoices = invoices.filter(inv => 
    inv.status === 'unconfirmed'
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
  const filteredPending = filterInvoices('unconfirmed')

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
    
    if (!rejectReason.trim()) {
      setRejectError('Prosimo, napišite razlog za zavrnitev računa.')
      return
    }
    
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

  // Handlerji za InvoiceView
  const handleConfirmFromView = (invoice: any) => {
    openConfirmModal(invoice)
  }

  const handleRejectFromView = (invoice: any, reason: string) => {
    setConfirmInvoice(invoice)
    setRejectReason(reason)
    setRejectError('')
    setRejectModalOpen(true)
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'unconfirmed': return 'Nepotrjen'
      case 'confirmed': return 'Potrjen'
      case 'rejected': return 'Zavrnjen'
      default: return status
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'unconfirmed': return 'bg-yellow-100 text-yellow-800'
      case 'confirmed': return 'bg-green-100 text-green-800'
      case 'rejected': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  // Število čakajočih na potrditev
  const pendingCount = confirmationInvoices.filter(inv => inv.status === 'unconfirmed').length

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold">Potrditev računov</h1>

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
          
          <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-6 border">      

            
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
          </Tabs>
        </CardContent>
      </Card>



      {/* InvoiceView s kontekstom potrjevanja */}
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
        onConfirm={handleConfirmFromView}
        onReject={handleRejectFromView}
        documentType="invoice" 
        showConfirmationActions={true}
      />

      {/* MODAL ZA POTRDITEV */}
      <Dialog open={confirmModalOpen} onOpenChange={setConfirmModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-green-700">
              <CheckCircle className="w-5 h-5" />
              Potrdi račun
            </DialogTitle>
          </DialogHeader>
          
          <div className="py-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-sm text-green-800">
                Ali ste prepričani, da želite potrditi račun <strong>{confirmInvoice?.number}</strong>?
              </p>
              <p className="text-xs text-green-600 mt-2">
                S tem dejanjem potrjujete, da so vsi podatki na računu pravilni in da je račun pripravljen za pošiljanje.
              </p>
            </div>
          </div>
          
          <DialogFooter className="flex gap-3">
            <Button variant="outline" onClick={() => setConfirmModalOpen(false)}>
              Prekliči
            </Button>
            <Button 
              variant="default" 
              className="bg-green-600 hover:bg-green-700"
              onClick={handleConfirmInvoice}
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Potrdi račun
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* MODAL ZA ZAVRNITEV */}
      <Dialog open={rejectModalOpen} onOpenChange={setRejectModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <ThumbsDown className="w-5 h-5" />
              Zavrni račun
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-sm text-red-800">
                Ali ste prepričani, da želite zavrniti račun <strong>{confirmInvoice?.number}</strong>?
              </p>
              <p className="text-xs text-red-600 mt-2">
                Račun bo označen kot zavrnjen in bo poslan nazaj v pregled.
              </p>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Razlog za zavrnitev <span className="text-red-500">*</span>
              </label>
              <Textarea
                value={rejectReason}
                onChange={(e) => {
                  setRejectReason(e.target.value)
                  setRejectError('')
                }}
                rows={4}
                placeholder="Napišite razlog za zavrnitev računa..."
                className={`w-full ${rejectError ? 'border-red-500 focus:ring-red-500' : ''}`}
              />
              {rejectError && (
                <p className="text-xs text-red-500">{rejectError}</p>
              )}
            </div>
          </div>
          
          <DialogFooter className="flex gap-3">
            <Button variant="outline" onClick={() => setRejectModalOpen(false)}>
              Prekliči
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleRejectInvoice}
            >
              <ThumbsDown className="w-4 h-4 mr-2" />
              Zavrni račun
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
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
          <TableHead className="px-1 py-3 text-left w-[110px]">Številka računa</TableHead>
          <TableHead className="px-4 py-3 text-center">Datum izdaje</TableHead>
          <TableHead className="px-4 py-3 text-left w-[200px]">Kupec</TableHead>
          <TableHead className="px-4 py-3 text-right">Neto</TableHead>
          <TableHead className="px-4 py-3 text-right">DDV</TableHead>
          <TableHead className="px-4 py-3 text-right">Skupaj za plačilo</TableHead>
          <TableHead className="px-4 py-3 text-center w-[150px]">Status</TableHead>
          <TableHead className="px-4 py-3 text-center w-[280px]">Akcije</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {invoices.map(inv => {
          const isPending = inv.status === 'unconfirmed'
          
          return (
            <TableRow 
              key={inv.id} 
              className={`
                ${isPending ? 'bg-yellow-50/50' : ''} 
                cursor-pointer hover:bg-gray-50 transition-colors
              `}
            >
              <TableCell 
                className="px-2 py-2"
                onClick={() => onInvoiceClick(inv)}
              >
                <span className="text-blue-600 hover:text-blue-800 underline hover:no-underline transition-all duration-200 cursor-pointer font-medium">
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
                <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
                  Nepotrjen
                </Badge>
              </TableCell>
              <TableCell className="px-4 py-2 text-center" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-center gap-2">
                  <Button 
                    size="sm" 
                    variant="default"
                    className="text-xs h-7 px-2 bg-green-600 hover:bg-green-700"
                    onClick={() => onConfirm(inv)}
                  >
                    <CheckCircle className="w-3.5 h-3.5 mr-1" /> Potrdi
                  </Button>

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