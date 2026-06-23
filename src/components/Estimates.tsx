// src/components/Estimates.tsx
import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { formatCurrency, formatDate } from '@/lib/utils'
import { useInvoices } from '@/hooks/useInvoices'
import { InvoiceView } from './invoice/InvoiceView'
import { InvoiceFilters } from './invoice/InvoiceFilters'
import { InvoiceStatus } from '@/types'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Send, Ban, History, Package, Mail, X, FileText, AlertTriangle } from 'lucide-react'
import { EditInvoice } from './invoice/EditInvoice'
import { mockAuditLogs, statusLabels, statusColors } from '@/data/mockData'
import { Badge } from '@/components/ui/badge'
import { InvoiceArchiveTable } from './invoice/InvoiceArchiveTable'
import { SortField } from '@/components/invoice/InvoiceFilters' // or wherever it's defined

// Status opcije samo za predračune
const estimateStatusOptions: { value: string; label: string }[] = [
  { value: 'all', label: 'Vsi' },
  { value: 'issued', label: 'Izdani' },
  { value: 'sent', label: 'Poslani' },
  { value: 'paid', label: 'Plačani' },
  { value: 'overdue', label: 'Potečeni' },
  { value: 'converted', label: 'Spremenjeni v račun' },
  { value: 'cancelled', label: 'Stornirani' },
  { value: 'partially_paid', label: 'Delno plačani' },
]

// Podatki o plačilih za predračune
// src/components/invoice/InvoiceArchiveTable.tsx
// ... (vse ostalo ostane isto, samo mockPayments posodobi)

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
  
  // Predračuni - VSI predračuni morajo biti tukaj
  'est1': { paid: 0, remaining: 285.00, percentage: 0 },
  'est2': { paid: 0, remaining: 405.00, percentage: 0 },
  'est3': { paid: 0, remaining: 500.00, percentage: 0 },
  'est4': { paid: 950.00, remaining: 0, percentage: 100 }, // ⬅️ PLAČAN
  'est5': { paid: 0, remaining: 300.00, percentage: 0 },
  'est6': { paid: 0, remaining: 552.00, percentage: 0 },
  'est7': { paid: 0, remaining: 750.00, percentage: 0 },
  'est8': { paid: 0, remaining: 300.00, percentage: 0 },
  'est9': { paid: 0, remaining: 300.00, percentage: 0 },
  'est10': { paid: 0, remaining: 660.00, percentage: 0 },
  'est11': { paid: 0, remaining: 855.00, percentage: 0 }, // ⬅️ NOV
  'est12': { paid: 0, remaining: 1539.00, percentage: 0 }, // ⬅️ NOV
  'est13': { paid: 0, remaining: 1100.00, percentage: 0 }, // ⬅️ NOV
  'est14': { paid: 0, remaining: 1200.00, percentage: 0 }, // ⬅️ NOV
  'est15': { paid: 0, remaining: 300.00, percentage: 0 }, // ⬅️ NOV
  
  // Zapadli računi
  'overdue1': { paid: 0, remaining: 552.00, percentage: 0 },
  'overdue2': { paid: 0, remaining: 285.00, percentage: 0 },
  'overdue3': { paid: 0, remaining: 300.00, percentage: 0 },
  'overdue4': { paid: 0, remaining: 475.00, percentage: 0 },
  'overdue5': { paid: 0, remaining: 800.00, percentage: 0 },
  'overdue6': { paid: 0, remaining: 150.00, percentage: 0 },
  'overdue7': { paid: 0, remaining: 750.00, percentage: 0 }, // ⬅️ NOV
  'overdue8': { paid: 0, remaining: 855.00, percentage: 0 }, // ⬅️ NOV
  'overdue9': { paid: 0, remaining: 1520.00, percentage: 0 }, // ⬅️ NOV
  'overdue10': { paid: 0, remaining: 660.00, percentage: 0 }, // ⬅️ NOV
  
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

interface EstimatesProps { 
  onNewEstimate?: () => void
  setActiveView?: (view: string) => void 
}

export function Estimates({ onNewEstimate, setActiveView }: EstimatesProps) {
  const { invoices, customers, updateInvoice } = useInvoices()
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string | null>(null)
  void onNewEstimate
  void setActiveView

  // Email modal
  const [emailModalOpen, setEmailModalOpen] = useState(false)
  const [emailInvoice, setEmailInvoice] = useState<any>(null)
  const [emailSubject, setEmailSubject] = useState('')
  const [emailBody, setEmailBody] = useState('')
  
  // Post modal
  const [postModalOpen, setPostModalOpen] = useState(false)
  const [postInvoice, setPostInvoice] = useState<any>(null)
  const [postAddress, setPostAddress] = useState('')
  const [postNote, setPostNote] = useState('')
  
  // Edit modal
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [editingInvoiceData, setEditingInvoiceData] = useState<any>(null)
  
  // Convert to invoice modal
  const [convertModalOpen, setConvertModalOpen] = useState(false)
  const [convertInvoice, setConvertInvoice] = useState<any>(null)
  
  // Cancel modal
  const [cancelModalOpen, setCancelModalOpen] = useState(false)
  const [cancelInvoice, setCancelInvoice] = useState<any>(null)
  const [cancelReason, setCancelReason] = useState('')
  
  // Audit modal
  const [auditModalOpen, setAuditModalOpen] = useState(false)
  const [auditInvoice, setAuditInvoice] = useState<any>(null)
  
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
  const [selectedStatus, setSelectedStatus] = useState<string>('all')
  const [activeTab, setActiveTab] = useState('all')

  // Pridobi samo predračune (tiste s številko, ki se začne s PR)
  // Izključimo tiste s statusom 'draft' (osnutek) in 'cancelled' (storniran)
  const estimates = invoices.filter(inv => inv.number?.startsWith('PR') && inv.status !== 'draft' && inv.status !== 'cancelled')

  // Unique podatki za filtre
  const uniqueNumbers = Array.from(new Map(estimates.map(inv => [inv.number, inv.number])).entries()).map(([number]) => ({ number })).filter(item => item.number.toLowerCase().includes(searchNumber.toLowerCase()))
  const uniqueCustomers = Array.from(new Map(estimates.map(inv => [inv.customerId, { id: inv.customerId, name: inv.customerName, taxId: inv.customerTaxId }])).entries()).map(([_, customer]) => customer).filter(c => c.name.toLowerCase().includes(searchCustomer.toLowerCase()) || c.taxId.toLowerCase().includes(searchCustomer.toLowerCase()))
  const uniqueMunicipalities = Array.from(new Set(estimates.map(inv => { const customer = customers.find(c => c.id === inv.customerId); const address = customer?.address || ''; const parts = address.split(','); return parts.length > 1 ? parts[parts.length - 1].trim() : address.trim(); }))).filter(m => m.toLowerCase().includes(searchMunicipality.toLowerCase()))

  const cvfilterInvoices = (statusFilter?: string) => estimates.filter(inv => {
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
      if (selectedStatus === 'converted') {
        if (inv.status !== 'paid') return false
      } else if (inv.status !== selectedStatus) return false
    }
    if (statusFilter) {
      if (statusFilter === 'converted') {
        if (inv.status !== 'paid') return false
      } else if (inv.status !== statusFilter) return false
    }
    return true
  })

const filteredAll = cvfilterInvoices()
const filteredIssued = cvfilterInvoices('issued')
const filteredSent = cvfilterInvoices('sent')
const filteredConverted = cvfilterInvoices('converted')
const filteredExpired = cvfilterInvoices('overdue')
const [sortField, setSortField] = useState<SortField>('issueDate')
const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc')

  const clearAllFilters = () => { 
    setSelectedNumber(''); setSearchNumber(''); setSelectedCustomer(null); setSearchCustomer('')
    setSelectedMunicipality(''); setSearchMunicipality(''); setPriceMin(''); setPriceMax('')
    setDiscountMin(''); setDiscountMax(''); setDateFrom(null); setDateTo(null)
    setDueDateFrom(null); setDueDateTo(null); setSelectedStatus('all')
  }

  const handleInvoiceClick = (invoice: any) => {
    setSelectedInvoiceId(invoice.id)
  }

  // Email modal functions
  const openEmailModal = (invoice: any) => { 
    setEmailInvoice(invoice)
    setEmailSubject(`Predračun ${invoice.number} - GeoFaktura`)
    setEmailBody(`Spoštovani,\n\nV priponki vam pošiljamo predračun št. ${invoice.number} z dne ${formatDate(invoice.issueDate)} v skupnem znesku ${formatCurrency(invoice.totalGross)}.\n\nProsimo, da ga pregledate.\n\nLep pozdrav,\nGeoFaktura`)
    setEmailModalOpen(true)
  }
  
  const handleSendEmail = () => { 
    if (!emailInvoice) return
    console.log(`📧 Predračun poslan na naslov kupca ${emailInvoice.customerName}`)
    updateInvoice(emailInvoice.id, { 
      status: 'sent', 
      sentAt: new Date().toISOString(),
      note: emailInvoice.note 
        ? `${emailInvoice.note}\n\n[${new Date().toLocaleDateString('sl-SI')}] Predračun poslan po e-pošti.` 
        : `[${new Date().toLocaleDateString('sl-SI')}] Predračun poslan po e-pošti.`
    })
    setEmailModalOpen(false)
    setEmailInvoice(null)
  }
  
  // Post modal functions
  const openPostModal = (invoice: any) => {
    const customer = customers.find(c => c.id === invoice.customerId)
    const defaultAddress = customer?.address || 'Naslov ni vpisan'
    setPostInvoice(invoice)
    setPostAddress(defaultAddress)
    setPostNote('')
    setPostModalOpen(true)
  }
  
  const handleSendPost = () => {
    if (!postInvoice) return
    updateInvoice(postInvoice.id, { 
      status: 'sent', 
      sentAt: new Date().toISOString(),
      note: postInvoice.note ? `${postInvoice.note}\n\n[${new Date().toLocaleDateString('sl-SI')}] Predračun poslan po navadni pošti na naslov: ${postAddress}` : `[${new Date().toLocaleDateString('sl-SI')}] Predračun poslan po navadni pošti na naslov: ${postAddress}`
    })
    setPostModalOpen(false)
    setPostInvoice(null)
    setPostAddress('')
    setPostNote('')
  }
  
  // Convert to invoice
  const openConvertModal = (invoice: any) => {
    setConvertInvoice(invoice)
    setConvertModalOpen(true)
  }
  
  const handleConvertToInvoice = () => {
    if (!convertInvoice) return
    
    const newInvoiceNumber = `2026-${String(Math.floor(Math.random() * 1000)).padStart(4, '0')}`
    
    updateInvoice(convertInvoice.id, { 
      number: newInvoiceNumber,
      status: 'paid',
      note: convertInvoice.note 
        ? `${convertInvoice.note}\n\n[${new Date().toLocaleDateString('sl-SI')}] Predračun spremenjen v račun ${newInvoiceNumber}.` 
        : `[${new Date().toLocaleDateString('sl-SI')}] Predračun spremenjen v račun ${newInvoiceNumber}.`
    })
    
    setConvertModalOpen(false)
    setConvertInvoice(null)
    alert(`Račun ${newInvoiceNumber} uspešno ustvarjen iz predračuna ${convertInvoice.number}`)
  }
  
  // Cancel modal functions
  const openCancelModal = (invoice: any) => {
    setCancelInvoice(invoice)
    setCancelReason('')
    setCancelModalOpen(true)
  }
  
  const handleCancelInvoice = () => {
    if (!cancelInvoice || !cancelReason.trim()) {
      alert('Prosimo, vnesite razlog za stornacijo!')
      return
    }
    updateInvoice(cancelInvoice.id, {
      status: 'cancelled',
      cancelledReason: cancelReason,
      note: cancelInvoice.note 
        ? `${cancelInvoice.note}\n\n[${new Date().toLocaleDateString('sl-SI')}] Predračun storniran. Razlog: ${cancelReason}` 
        : `[${new Date().toLocaleDateString('sl-SI')}] Predračun storniran. Razlog: ${cancelReason}`
    })
    setCancelModalOpen(false)
    setCancelInvoice(null)
    setCancelReason('')
  }
  
  // Audit modal functions
  const openAuditModal = (invoice: any) => {
    setAuditInvoice(invoice)
    setAuditModalOpen(true)
  }
  
  const getAuditLogsForInvoice = (invoiceId: string) => {
    return mockAuditLogs.filter(log => log.invoiceId === invoiceId).sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    )
  }
  
  // Edit funkcije
  const handleEditInvoice = (invoice: any) => {
    setEditingInvoiceData(invoice)
    setSelectedInvoiceId(null)
    setTimeout(() => {
      setEditModalOpen(true)
    }, 50)
  }

  const handleCloseEditModal = () => {
    setEditModalOpen(false)
    if (editingInvoiceData) {
      setTimeout(() => {
        setSelectedInvoiceId(editingInvoiceData.id)
        setEditingInvoiceData(null)
      }, 50)
    } else {
      setEditingInvoiceData(null)
    }
  }
  
  // Uporabi statusLabels in statusColors iz mockData
  const getStatusLabelForEstimate = (status: string) => {
    if (status === 'paid') return statusLabels.converted || 'Spremenjen v račun'
    return statusLabels[status] || status
  }

  const getStatusColorForEstimate = (status: string) => {
    if (status === 'paid') return statusColors.converted || 'bg-purple-100 text-purple-800'
    return statusColors[status] || 'bg-gray-100 text-gray-800'
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 className="text-xl lg:text-2xl font-bold">Predračuni</h1>
        </div>
      </div>

      <Card>
        <CardContent className="pt-6">
<InvoiceFilters 
  searchNumber={searchNumber} setSearchNumber={setSearchNumber} selectedNumber={selectedNumber} setSelectedNumber={setSelectedNumber}
  searchCustomer={searchCustomer} setSearchCustomer={setSearchCustomer} selectedCustomer={selectedCustomer} setSelectedCustomer={setSelectedCustomer}
  searchMunicipality={searchMunicipality} setSearchMunicipality={setSearchMunicipality} selectedMunicipality={selectedMunicipality} setSelectedMunicipality={setSelectedMunicipality}
  priceMin={priceMin} setPriceMin={setPriceMin} priceMax={priceMax} setPriceMax={setPriceMax}
  dateFrom={dateFrom} setDateFrom={setDateFrom} dateTo={dateTo} setDateTo={setDateTo}
  dueDateFrom={dueDateFrom} setDueDateFrom={setDueDateFrom} dueDateTo={dueDateTo} setDueDateTo={setDueDateTo}
  selectedStatus={selectedStatus as any} setSelectedStatus={setSelectedStatus as any}
  uniqueNumbers={uniqueNumbers} uniqueCustomers={uniqueCustomers} uniqueMunicipalities={uniqueMunicipalities} statusOptions={estimateStatusOptions as any}
  clearAllFilters={clearAllFilters}
  sortField={sortField}
  setSortField={setSortField}
  sortDirection={sortDirection}
  setSortDirection={setSortDirection}
/>
          
          <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-6">
            <TabsList className="grid w-full grid-cols-9 text-xs lg:text-sm">
              <TabsTrigger value="all">Vsi (11)</TabsTrigger>
              <TabsTrigger value="issued">Nepotrjeni (0)</TabsTrigger>
              <TabsTrigger value="issued">Zavrnjeni (0)</TabsTrigger>
              <TabsTrigger value="issued">Izdani (2)</TabsTrigger>
              <TabsTrigger value="sent">Poslani (2)</TabsTrigger>
              <TabsTrigger value="expired">Zapadli (1)</TabsTrigger>              
              <TabsTrigger value="expired">Plačani (2)</TabsTrigger>
              <TabsTrigger value="converted">Spremenjeni v račun (4) </TabsTrigger>
              <TabsTrigger value="converted">Stornirani (0) </TabsTrigger>
            </TabsList>
            
            {/* UPORABI InvoiceArchiveTable Z documentType="estimate" */}
            <TabsContent value="all">
              <InvoiceArchiveTable 
                invoices={filteredAll}
                customers={customers}
                onInvoiceClick={handleInvoiceClick}
                documentType="estimate"
              />
            </TabsContent>
            <TabsContent value="issued">
              <InvoiceArchiveTable 
                invoices={filteredIssued}
                customers={customers}
                onInvoiceClick={handleInvoiceClick}
                documentType="estimate"
              />
            </TabsContent>
            <TabsContent value="sent">
              <InvoiceArchiveTable 
                invoices={filteredSent}
                customers={customers}
                onInvoiceClick={handleInvoiceClick}
                documentType="estimate"
              />
            </TabsContent>
            <TabsContent value="converted">
              <InvoiceArchiveTable 
                invoices={filteredConverted}
                customers={customers}
                onInvoiceClick={handleInvoiceClick}
                documentType="estimate"
              />
            </TabsContent>
            <TabsContent value="expired">
              <InvoiceArchiveTable 
                invoices={filteredExpired}
                customers={customers}
                onInvoiceClick={handleInvoiceClick}
                documentType="estimate"
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-4 pb-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-4 h-4 lg:w-5 lg:h-5 text-blue-500 mt-0.5" />
            <div className="text-xs lg:text-sm text-blue-700">
              <p className="font-medium">Informacije o predračunih</p>
              <p className="text-[10px] lg:text-xs mt-1">Predračun nima pravne veljave. Ko ustvarite račun iz predračuna, se predračun označi kot "Spremenjen v račun" in ga ni več mogoče ponovno uporabiti. Predračuni so veljavni 30 dni.</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* MODAL ZA E-POŠTO */}
      <Dialog open={emailModalOpen} onOpenChange={setEmailModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-blue-700 text-base lg:text-lg">
              <Mail className="w-4 h-4 lg:w-5 lg:h-5 text-blue-600" />
              Pošlji predračun po e-pošti
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="text-xs lg:text-sm font-medium block mb-1 text-gray-700">Prejemnik (e-pošta) *</label>
              <Input 
                value={customers.find(c => c.id === emailInvoice?.customerId)?.email || 'E-pošta ni vpisan'} 
                disabled 
                className="bg-gray-50 border-gray-200 text-xs lg:text-sm" 
              />
            </div>
            
            <div>
              <label className="text-xs lg:text-sm font-medium block mb-1 text-gray-700">Zadeva *</label>
              <Input 
                value={emailSubject} 
                onChange={(e) => setEmailSubject(e.target.value)} 
                className="border-gray-200 focus:border-blue-400 focus:ring-blue-400 text-xs lg:text-sm"
              />
            </div>
            
            <div>
              <label className="text-xs lg:text-sm font-medium block mb-1 text-gray-700">Sporočilo *</label>
              <Textarea 
                value={emailBody} 
                onChange={(e) => setEmailBody(e.target.value)} 
                rows={10} 
                className="font-normal text-xs lg:text-sm border-gray-200 focus:border-blue-400 focus:ring-blue-400"
              />
            </div>
            
            <div className="mt-2 px-3 py-1.5 bg-gray-50 rounded border border-gray-200 inline-block">
              <div className="flex items-center gap-2">
                <FileText className="w-3 h-3 lg:w-4 lg:h-4 text-gray-600" />
                <span className="text-xs lg:text-sm text-gray-700">
                  Priponka: <span className="font-medium">{emailInvoice?.number || 'predracun'}.pdf</span>
                </span>
              </div>
            </div>
          </div>
          
          <DialogFooter className="gap-2 pt-4">
            <Button variant="outline" onClick={() => {
              setEmailModalOpen(false)
              setEmailInvoice(null)
            }} className="text-xs lg:text-sm">
              <X className="w-3 h-3 lg:w-4 lg:h-4 mr-2" /> Prekliči
            </Button>
            <Button onClick={handleSendEmail} className="bg-blue-600 hover:bg-blue-700 text-xs lg:text-sm">
              <Send className="w-3 h-3 lg:w-4 lg:h-4 mr-2" /> Pošlji po e-pošti
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* MODAL ZA NAVADNO POŠTO */}
      <Dialog open={postModalOpen} onOpenChange={setPostModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-blue-700 text-base lg:text-lg">
              <Package className="w-4 h-4 lg:w-5 lg:h-5 text-blue-600" />
              Pošlji predračun po navadni pošti
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-xs lg:text-sm font-medium text-blue-800">Predračun: {postInvoice?.number}</p>
              <p className="text-xs lg:text-sm text-blue-600">Kupec: {postInvoice?.customerName}</p>
              <p className="text-xs lg:text-sm text-blue-600">Znesek: {postInvoice && formatCurrency(postInvoice.totalGross)}</p>
            </div>
            
            <div>
              <label className="text-xs lg:text-sm font-medium block mb-1 text-gray-700">Naslov za pošiljanje *</label>
              <textarea 
                value={postAddress} 
                onChange={(e) => setPostAddress(e.target.value)} 
                className="w-full min-h-[100px] px-3 py-2 text-xs lg:text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                placeholder="Ime in priimek / podjetje&#10;Ulica in hišna številka&#10;Poštna številka in kraj"
              />
              <p className="text-[10px] lg:text-xs text-gray-500 mt-1">Preverite naslov pred pošiljanjem</p>
            </div>
            
            <div>
              <label className="text-xs lg:text-sm font-medium block mb-1 text-gray-700">Opomba (neobvezno)</label>
              <Input 
                value={postNote} 
                onChange={(e) => setPostNote(e.target.value)} 
                placeholder="Npr. priporočeno, s povratnico, dostava na dom..."
                className="border-gray-200 focus:border-blue-400 focus:ring-blue-400 text-xs lg:text-sm"
              />
            </div>
            
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-xs lg:text-sm">
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-3 h-3 lg:w-4 lg:h-4 text-gray-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-gray-800">Potrditev pošiljanja:</p>
                  <p className="text-gray-700">S klikom na "Potrdi pošiljanje" potrjujete, da ste predračun fizično poslali po navadni pošti na zgornji naslov.</p>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter className="gap-2 border-t pt-4">
            <Button variant="outline" onClick={() => {
              setPostModalOpen(false)
              setPostInvoice(null)
              setPostAddress('')
              setPostNote('')
            }} className="text-xs lg:text-sm">
              <X className="w-3 h-3 lg:w-4 lg:h-4 mr-2" /> Prekliči
            </Button>
            <Button onClick={handleSendPost} className="bg-blue-600 hover:bg-blue-700 text-xs lg:text-sm">
              <Package className="w-3 h-3 lg:w-4 lg:h-4 mr-2" /> Potrdi pošiljanje
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Convert to Invoice Modal */}
      <Dialog open={convertModalOpen} onOpenChange={(open) => {
        if (!open) {
          setConvertModalOpen(false)
          setConvertInvoice(null)
          if (convertInvoice) {
            setTimeout(() => {
              setSelectedInvoiceId(convertInvoice.id)
            }, 50)
          }
        }
      }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-green-700 text-base lg:text-lg">
              <FileText className="w-4 h-4 lg:w-5 lg:h-5 text-green-600" />
              Ustvari račun iz predračuna
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <div className="bg-yellow-50 border border-yellow-200 rounded p-4 mb-4">
              <p className="text-xs lg:text-sm text-yellow-800">
                S tem dejanjem boste iz predračuna <span className="font-semibold">{convertInvoice?.number}</span>
                ustvarili račun. Predračun bo označen kot "Spremenjen v račun".
              </p>
            </div>
            <p className="text-xs lg:text-sm text-gray-600">Ste prepričani, da želite to narediti?</p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setConvertModalOpen(false)
              if (convertInvoice) {
                setTimeout(() => {
                  setSelectedInvoiceId(convertInvoice.id)
                }, 50)
              }
            }} className="text-xs lg:text-sm">Prekliči</Button>
            <Button onClick={() => {
              handleConvertToInvoice()
              setConvertModalOpen(false)
              setConvertInvoice(null)
            }} className="bg-green-600 text-xs lg:text-sm">
              <FileText className="w-3 h-3 lg:w-4 lg:h-4 mr-2" /> Ustvari račun
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* MODAL ZA STORNIRANJE */}
      <Dialog open={cancelModalOpen} onOpenChange={setCancelModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-700 text-base lg:text-lg">
              <Ban className="w-4 h-4 lg:w-5 lg:h-5 text-red-600" />
              Storniraj predračun
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div className="bg-red-50 border border-red-200 rounded-lg p-5">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 lg:w-6 lg:h-6 text-red-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm lg:text-base font-semibold text-red-800">OPOZORILO!</p>
                  <p className="text-xs lg:text-sm text-red-700 mt-2 leading-relaxed">
                    Storniranje predračuna <span className="font-semibold">{cancelInvoice?.number}</span> 
                    za kupca <span className="font-semibold">{cancelInvoice?.customerName}</span> 
                    v znesku <span className="font-semibold">{formatCurrency(cancelInvoice?.totalGross)}</span> 
                    je <span className="font-semibold underline">TRAJNO</span> in ga <span className="font-semibold underline">ni mogoče razveljaviti</span>.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="grid gap-4">
              <div>
                <label className="text-xs lg:text-sm font-medium block mb-2 text-gray-700">Številka predračuna</label>
                <Input 
                  value={cancelInvoice?.number || ''} 
                  disabled 
                  className="bg-gray-50 border-gray-200 text-sm lg:text-base"
                />
              </div>
              
              <div>
                <label className="text-xs lg:text-sm font-medium block mb-2 text-gray-700">
                  Razlog za stornacijo <span className="text-red-500">*</span>
                </label>
                <Textarea 
                  value={cancelReason} 
                  onChange={(e) => setCancelReason(e.target.value)} 
                  placeholder="Vpišite podroben razlog za stornacijo (obvezno)..."
                  rows={4}
                  className="border-red-200 focus:border-red-400 focus:ring-red-400 resize-none text-xs lg:text-sm"
                />
                <p className="text-[10px] lg:text-xs text-gray-500 mt-2">
                  Razlog bo zabeležen v dnevniku sprememb predračuna in viden v zgodovini.
                </p>
              </div>
            </div>
          </div>
          <DialogFooter className="gap-3 pt-4">
            <Button 
              variant="outline" 
              onClick={() => setCancelModalOpen(false)}
              className="px-6 text-xs lg:text-sm"
            >
              <X className="w-3 h-3 lg:w-4 lg:h-4 mr-2" /> Prekliči
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleCancelInvoice} 
              disabled={!cancelReason.trim()}
              className="px-6 text-xs lg:text-sm"
            >
              <Ban className="w-3 h-3 lg:w-4 lg:h-4 mr-2" /> Storniraj predračun
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* MODAL ZA REVIZIJO/SPREMEMBE */}
      <Dialog open={auditModalOpen} onOpenChange={setAuditModalOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader className="sticky top-0 bg-white pb-4 border-b">
            <DialogTitle className="flex items-center gap-2 text-gray-800 text-base lg:text-lg">
              <History className="w-4 h-4 lg:w-5 lg:h-5 text-blue-600" />
              Dnevnik sprememb - {auditInvoice?.number}
            </DialogTitle>
          </DialogHeader>
          
          <div className="py-4 space-y-3">
            {auditInvoice && getAuditLogsForInvoice(auditInvoice.id).length > 0 ? (
              getAuditLogsForInvoice(auditInvoice.id).map((log, index) => (
                <div key={log.id} className="relative">
                  {index < getAuditLogsForInvoice(auditInvoice.id).length - 1 && (
                    <div className="absolute left-[27px] top-12 bottom-0 w-0.5 bg-gray-200"></div>
                  )}
                  
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 z-10">
                      {log.action === 'created' && (
                        <div className="w-8 h-8 lg:w-10 lg:h-10 rounded-full bg-green-100 flex items-center justify-center">
                          <FileText className="w-4 h-4 lg:w-5 lg:h-5 text-green-600" />
                        </div>
                      )}
                      {log.action === 'edited' && (
                        <div className="w-8 h-8 lg:w-10 lg:h-10 rounded-full bg-blue-100 flex items-center justify-center">
                          <History className="w-4 h-4 lg:w-5 lg:h-5 text-blue-600" />
                        </div>
                      )}
                      {log.action === 'status_changed' && (
                        <div className="w-8 h-8 lg:w-10 lg:h-10 rounded-full bg-yellow-100 flex items-center justify-center">
                          <Badge className="w-4 h-4 lg:w-5 lg:h-5 text-yellow-600" />
                        </div>
                      )}
                      {!['created', 'edited', 'status_changed'].includes(log.action) && (
                        <div className="w-8 h-8 lg:w-10 lg:h-10 rounded-full bg-gray-100 flex items-center justify-center">
                          <History className="w-4 h-4 lg:w-5 lg:h-5 text-gray-600" />
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-1 bg-gray-50 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xs lg:text-sm font-semibold text-gray-900">{log.user}</span>
                          <span className="text-[10px] lg:text-xs text-gray-500">{formatDate(log.timestamp)}</span>
                        </div>
                        <div className="px-2 py-1 rounded-md text-[10px] lg:text-xs font-medium uppercase bg-gray-200 text-gray-700">
                          {log.action === 'created' && 'Ustvarjeno'}
                          {log.action === 'edited' && 'Posodobljeno'}
                          {log.action === 'status_changed' && 'Status spremenjen'}
                          {!['created', 'edited', 'status_changed'].includes(log.action) && log.action}
                        </div>
                      </div>
                      
                      <p className="text-xs lg:text-sm text-gray-700 leading-relaxed">{log.details}</p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <History className="w-10 h-10 lg:w-12 lg:h-12 mx-auto mb-3 text-gray-300" />
                <p className="text-xs lg:text-sm">Za ta predračun ni zabeleženih sprememb.</p>
              </div>
            )}
          </div>
          
          <DialogFooter className="sticky bottom-0 bg-white pt-4 border-t">
            <Button onClick={() => setAuditModalOpen(false)} className="bg-blue-600 hover:bg-blue-700 text-xs lg:text-sm">
              Zapri
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Modal */}
      {editModalOpen && editingInvoiceData && (
        <>
          <div className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm !mt-0" onClick={handleCloseEditModal} />
          <div className="fixed inset-0 z-50 bg-white overflow-y-auto md:left-64 !mt-0">
            <div className="sticky top-0 bg-white border-b p-4">
              <div className="flex justify-between items-center">
                <h2 className="text-lg lg:text-xl font-bold">Uredi predračun</h2>
                <button onClick={handleCloseEditModal} className="p-2 bg-gray-100 rounded-full">
                  <X className="w-4 h-4 lg:w-5 lg:h-5" />
                </button>
              </div>
            </div>
            <div className="p-4 lg:p-6">
              <EditInvoice 
                editingInvoice={editingInvoiceData} 
                onClose={handleCloseEditModal}
                onSaved={handleCloseEditModal}
              />
            </div>
          </div>
        </>
      )}

      <InvoiceView 
        invoiceId={selectedInvoiceId} 
        open={!!selectedInvoiceId} 
        onClose={() => setSelectedInvoiceId(null)}
        onEdit={handleEditInvoice}
        onSendEmail={openEmailModal}
        onSendPost={openPostModal}
        onMarkAsPaid={openConvertModal}
        onCancel={openCancelModal}
        onAudit={openAuditModal}
        documentType="estimate" 
      />
    </div>
  )
}