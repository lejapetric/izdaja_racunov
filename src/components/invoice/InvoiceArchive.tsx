// src/components/invoice/InvoiceArchive.tsx
import { useState } from 'react'
import { useInvoices } from '@/hooks/useInvoices'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { formatCurrency, formatDate } from '@/lib/utils'
import { Send, Ban, History, Package, Mail, X, FileText, CheckCircle, AlertTriangle, Download, Printer, Check } from 'lucide-react'
import { Invoice, InvoiceStatus } from '@/types'
import { InvoiceView } from './InvoiceView'
import { InvoiceFilters } from './InvoiceFilters'
import { mockAuditLogs } from '@/data/mockAuditLogs'
import { statusLabels, statusColors } from '@/data/mockData'
import { InvoiceArchiveTable } from './InvoiceArchiveTable'
import { EditInvoice } from './EditInvoice'
import { Edit, ArrowRight } from 'lucide-react'
import * as XLSX from 'xlsx'

const statusOptions: { value: InvoiceStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'Vsi' }, 
  { value: 'draft', label: 'Osnutki' }, 
  { value: 'issued', label: 'Izdani' },
  { value: 'sent', label: 'Poslani' }, 
  { value: 'overdue', label: 'Zapadli' }, 
  { value: 'paid', label: 'Plačani' },
  { value: 'partially_paid', label: 'Delno plačani' }, 
  { value: 'converted', label: 'Pretvorjeni' },        
  { value: 'cancelled', label: 'Stornirani' },
]

interface InvoiceArchiveProps { 
  onEditInvoice: (invoice: Invoice) => void 
}

export function InvoiceArchive({ onEditInvoice: _onEditInvoice }: InvoiceArchiveProps) {
  const { invoices, updateInvoice, customers } = useInvoices()
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
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string | null>(null)
  
  // Email modal
  const [emailModalOpen, setEmailModalOpen] = useState(false)
  const [emailInvoice, setEmailInvoice] = useState<Invoice | null>(null)
  const [emailSubject, setEmailSubject] = useState('')
  const [emailBody, setEmailBody] = useState('')
  
  // Post modal
  const [postModalOpen, setPostModalOpen] = useState(false)
  const [postInvoice, setPostInvoice] = useState<Invoice | null>(null)
  const [postAddress, setPostAddress] = useState('')
  const [postNote, setPostNote] = useState('')
  
  // Mark as Paid modal
  const [paidModalOpen, setPaidModalOpen] = useState(false)
  const [paidInvoice, setPaidInvoice] = useState<Invoice | null>(null)
  
  // Cancel modal
  const [cancelModalOpen, setCancelModalOpen] = useState(false)
  const [cancelInvoice, setCancelInvoice] = useState<Invoice | null>(null)
  const [cancelReason, setCancelReason] = useState('')
  
  // Edit modal
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [editingInvoiceData, setEditingInvoiceData] = useState<Invoice | null>(null)
  
  // Audit modal
  const [auditModalOpen, setAuditModalOpen] = useState(false)
  const [auditInvoice, setAuditInvoice] = useState<Invoice | null>(null)

  // Pomožna funkcija za varno pretvorbo v lowercase
  const safeToLowerCase = (str: string | undefined | null): string => {
    return str?.toLowerCase() || ''
  }

  // Unique values za filtre
  const uniqueNumbers = Array.from(
    new Map(
      invoices
        .filter(inv => inv.number)
        .map(inv => [inv.number, inv.number])
    ).entries()
  )
  .map(([number]) => ({ number }))
  .filter(item => 
    safeToLowerCase(item.number).includes(safeToLowerCase(searchNumber))
  )

  const uniqueCustomers = Array.from(
    new Map(
      invoices
        .filter(inv => inv.customerId && inv.customerName)
        .map(inv => [inv.customerId, { 
          id: inv.customerId, 
          name: inv.customerName || '', 
          taxId: inv.customerTaxId || '' 
        }])
    ).entries()
  )
  .map(([_, customer]) => customer)
  .filter(c => 
    safeToLowerCase(c.name).includes(safeToLowerCase(searchCustomer)) || 
    safeToLowerCase(c.taxId).includes(safeToLowerCase(searchCustomer))
  )

  const uniqueMunicipalities = Array.from(
    new Set(
      invoices
        .filter(inv => inv.customerId)
        .map(inv => {
          const customer = customers.find(c => c.id === inv.customerId)
          if (!customer) return ''
          const address = customer.address || ''
          const parts = address.split(',')
          return parts.length > 1 ? parts[parts.length - 1].trim() : address.trim()
        })
        .filter(m => m)
    )
  )
  .filter(m => 
    safeToLowerCase(m).includes(safeToLowerCase(searchMunicipality))
  )

  // Filtriranje invoice-jev
  const filterInvoices = (statusFilter?: string) => invoices.filter(inv => {
    if (selectedNumber && inv.number !== selectedNumber) return false
    if (selectedCustomer && inv.customerId !== selectedCustomer.id) return false
    if (selectedMunicipality) { 
      const customer = customers.find(c => c.id === inv.customerId)
      if (!customer) return false
      const address = customer.address || ''
      const parts = address.split(',')
      const municipality = parts.length > 1 ? parts[parts.length - 1].trim() : address.trim()
      if (!safeToLowerCase(municipality).includes(safeToLowerCase(selectedMunicipality))) return false 
    }
    if (priceMin !== '' && inv.totalGross < priceMin) return false
    if (priceMax !== '' && inv.totalGross > priceMax) return false
    const invoiceDiscountPercent = inv.discountPercent ?? 0
    if (discountMin !== '' && invoiceDiscountPercent < discountMin) return false
    if (discountMax !== '' && invoiceDiscountPercent > discountMax) return false
    const dateFromStr = dateFrom ? dateFrom.toISOString().split('T')[0] : ''
    const dateToStr = dateTo ? dateTo.toISOString().split('T')[0] : ''
    if (dateFromStr && inv.issueDate < dateFromStr) return false
    if (dateToStr && inv.issueDate > dateToStr) return false
    const dueFromStr = dueDateFrom ? dueDateFrom.toISOString().split('T')[0] : ''
    const dueToStr = dueDateTo ? dueDateTo.toISOString().split('T')[0] : ''
    if (dueFromStr && inv.dueDate < dueFromStr) return false
    if (dueToStr && inv.dueDate > dueToStr) return false
    if (selectedStatus !== 'all' && inv.status !== selectedStatus) return false
    if (statusFilter && inv.status !== statusFilter) return false
    return true
  })

  // Filtrirani seznami
  const filteredAll = filterInvoices()
  const filteredDrafts = filterInvoices('draft')
  const filteredIssued = filterInvoices('issued')
  const filteredSent = filterInvoices('sent')
  const filteredPaid = filterInvoices('paid')
  const filteredOverdue = filterInvoices('overdue')
  const filteredPartiallyPaid = filterInvoices('partially_paid')
  const filteredCancelled = filterInvoices('cancelled')
  
  // Počisti vse filtre
  const clearAllFilters = () => { 
    setSelectedNumber('')
    setSearchNumber('')
    setSelectedCustomer(null)
    setSearchCustomer('')
    setSelectedMunicipality('')
    setSearchMunicipality('')
    setPriceMin('')
    setPriceMax('')
    setDiscountMin('')
    setDiscountMax('')
    setDateFrom(null)
    setDateTo(null)
    setDueDateFrom(null)
    setDueDateTo(null)
    setSelectedStatus('all')
  }

  // Klik na invoice
  const handleInvoiceClick = (invoice: Invoice) => {
    setSelectedInvoiceId(invoice.id)
  }

  // Funkcija za izvoz v Excel
  const exportToExcel = () => {
    const filteredInvoices = getCurrentFilteredInvoices()
    if (filteredInvoices.length === 0) return

    const excelData = filteredInvoices.map(inv => ({
      'Številka': inv.number || 'Osnutek',
      'Datum izdaje': formatDate(inv.issueDate),
      'Kupec': inv.customerName,
      'Davčna številka': inv.customerTaxId || '',
      'Neto': inv.totalNet,
      'DDV': inv.totalVat,
      'Skupaj': inv.totalGross,
      'Status': statusLabels[inv.status] || inv.status,
      'Datum zapadlosti': inv.dueDate ? formatDate(inv.dueDate) : '',
      'Št. postavk': inv.items.length
    }))

    const ws = XLSX.utils.json_to_sheet(excelData)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Računi')
    
    const colWidths = [
      { wch: 15 }, { wch: 15 }, { wch: 25 }, { wch: 18 },
      { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 15 },
      { wch: 15 }, { wch: 12 }
    ]
    ws['!cols'] = colWidths

    XLSX.writeFile(wb, `racuni_${new Date().toISOString().split('T')[0]}.xlsx`)
  }

  // Dobi trenutno filtrirane invoice-je glede na aktivni tab
  const getCurrentFilteredInvoices = () => {
    switch(activeTab) {
      case 'drafts': return filteredDrafts
      case 'issued': return filteredIssued
      case 'sent': return filteredSent
      case 'overdue': return filteredOverdue
      case 'paid': return filteredPaid
      case 'partially_paid': return filteredPartiallyPaid
      case 'cancelled': return filteredCancelled
      default: return filteredAll
    }
  }

  // Mark as Paid modal funkcije
  const openPaidModal = (invoice: Invoice) => {
    setPaidInvoice(invoice)
    setPaidModalOpen(true)
  }
  
  const handleMarkAsPaid = () => {
    if (!paidInvoice) return
    updateInvoice(paidInvoice.id, { 
      status: 'paid', 
      paidAt: new Date().toISOString(),
      note: paidInvoice.note 
        ? `${paidInvoice.note}\n\n[${new Date().toLocaleDateString('sl-SI')}] Račun označen kot plačan.` 
        : `[${new Date().toLocaleDateString('sl-SI')}] Račun označen kot plačan.`
    })
    setPaidModalOpen(false)
    setPaidInvoice(null)
  }
  
  // Edit modal funkcije
  const openEditModal = (invoice: Invoice) => {
    console.log('Urejanje:', invoice.number, 'Tip:', invoice.number?.startsWith('PR') ? 'predračun' : 'račun')
    setEditingInvoiceData(invoice)
    setEditModalOpen(true)
    setSelectedInvoiceId(null)
  }

  // Email modal funkcije
  const openEmailModal = (invoice: Invoice) => { 
    setEmailInvoice(invoice)
    setEmailSubject(`Račun ${invoice.number} - GeoFaktura`)
    setEmailBody(`Spoštovani,\n\nV priponki vam pošiljamo račun št. ${invoice.number} z dne ${formatDate(invoice.issueDate)} v skupnem znesku ${formatCurrency(invoice.totalGross)}.\n\nProsimo, da račun poravnate v roku ${invoice.paymentTermDays} dni.\n\nLep pozdrav,\nGeoFaktura`)
    setEmailModalOpen(true)
  }
  
  const handleSendEmail = () => { 
    if (!emailInvoice) return
    
    console.log(`E-pošta poslana na naslov kupca ${emailInvoice.customerName}\nZadeva: ${emailSubject}\nPriloga: Racun_${emailInvoice.number}.pdf`)
    
    updateInvoice(emailInvoice.id, { 
      status: 'sent', 
      sentAt: new Date().toISOString(),
      note: emailInvoice.note 
        ? `${emailInvoice.note}\n\n[${new Date().toLocaleDateString('sl-SI')}] Račun poslan po e-pošti.` 
        : `[${new Date().toLocaleDateString('sl-SI')}] Račun poslan po e-pošti.`
    })
    
    setEmailModalOpen(false)
    setEmailInvoice(null)
  }
  
  // Post modal funkcije
  const openPostModal = (invoice: Invoice) => {
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
      note: postInvoice.note 
        ? `${postInvoice.note}\n\n[${new Date().toLocaleDateString('sl-SI')}] Račun poslan po navadni pošti na naslov: ${postAddress}${postNote ? ` (${postNote})` : ''}` 
        : `[${new Date().toLocaleDateString('sl-SI')}] Račun poslan po navadni pošti na naslov: ${postAddress}${postNote ? ` (${postNote})` : ''}`
    })
    
    setPostModalOpen(false)
    setPostInvoice(null)
    setPostAddress('')
    setPostNote('')
  }
  
  // Cancel modal funkcije
  const openCancelModal = (invoice: Invoice) => {
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
        ? `${cancelInvoice.note}\n\n[${new Date().toLocaleDateString('sl-SI')}] Račun storniran. Razlog: ${cancelReason}` 
        : `[${new Date().toLocaleDateString('sl-SI')}] Račun storniran. Razlog: ${cancelReason}`
    })
    
    setCancelModalOpen(false)
    setCancelInvoice(null)
    setCancelReason('')
  }
  
  // Audit log funkcije
  const getAuditLogsForInvoice = (invoiceId: string) => {
    return mockAuditLogs.filter(log => log.invoiceId === invoiceId).sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    )
  }

  // Close edit modal
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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Seznam računov</h1>
      </div>
      
      <Card>
        <CardContent className="pt-6">
          <InvoiceFilters 
            searchNumber={searchNumber} 
            setSearchNumber={setSearchNumber} 
            selectedNumber={selectedNumber} 
            setSelectedNumber={setSelectedNumber}
            searchCustomer={searchCustomer} 
            setSearchCustomer={setSearchCustomer} 
            selectedCustomer={selectedCustomer} 
            setSelectedCustomer={setSelectedCustomer}
            searchMunicipality={searchMunicipality} 
            setSearchMunicipality={setSearchMunicipality} 
            selectedMunicipality={selectedMunicipality} 
            setSelectedMunicipality={setSelectedMunicipality}
            priceMin={priceMin} 
            setPriceMin={setPriceMin} 
            priceMax={priceMax} 
            setPriceMax={setPriceMax}
            dateFrom={dateFrom} 
            setDateFrom={setDateFrom} 
            dateTo={dateTo} 
            setDateTo={setDateTo}
            dueDateFrom={dueDateFrom} 
            setDueDateFrom={setDueDateFrom} 
            dueDateTo={dueDateTo} 
            setDueDateTo={setDueDateTo}
            selectedStatus={selectedStatus} 
            setSelectedStatus={setSelectedStatus}
            uniqueNumbers={uniqueNumbers} 
            uniqueCustomers={uniqueCustomers} 
            uniqueMunicipalities={uniqueMunicipalities} 
            statusOptions={statusOptions}
            clearAllFilters={clearAllFilters}
          />
          
          <div className="flex justify-start mt-4">
            <div className="flex gap-3">
              <Button variant="outline" onClick={clearAllFilters} className="flex items-center gap-2">
                <X className="w-4 h-4" /> Počisti filtre
              </Button>
              <Button 
                variant="outline" 
                onClick={exportToExcel} 
                disabled={getCurrentFilteredInvoices().length === 0}
                className="flex items-center gap-2"
              >
                <Download className="w-4 h-4" /> Excel
              </Button>
              <Button 
                variant="outline" 
                onClick={() => window.print()} 
                disabled={getCurrentFilteredInvoices().length === 0}
                className="flex items-center gap-2"
              >
                <Printer className="w-4 h-4" /> PDF / Natisni
              </Button>
            </div>
          </div>

          <div className="mt-6">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid grid-cols-9">
                <TabsTrigger value="all">Vsi ({filteredAll.length})</TabsTrigger>
                <TabsTrigger value="drafts">Osnutki ({filteredDrafts.length})</TabsTrigger>
                <TabsTrigger value="issued">Izdani ({filteredIssued.length})</TabsTrigger>
                <TabsTrigger value="sent">Poslani ({filteredSent.length})</TabsTrigger>
                <TabsTrigger value="paid">Plačani ({filteredPaid.length})</TabsTrigger>
                <TabsTrigger value="overdue">Zapadli ({filteredOverdue.length})</TabsTrigger>
                <TabsTrigger value="partially_paid">Delno plačani ({filteredPartiallyPaid.length})</TabsTrigger>
                <TabsTrigger value="converted">Pretvorjeni (0)</TabsTrigger>
                <TabsTrigger value="cancelled">Stornirani ({filteredCancelled.length})</TabsTrigger>
              </TabsList>
              
              <TabsContent value="all">
                <InvoiceArchiveTable 
                  invoices={filteredAll} 
                  customers={customers} 
                  onInvoiceClick={handleInvoiceClick}
                />
              </TabsContent>
              <TabsContent value="drafts">
                <InvoiceArchiveTable 
                  invoices={filteredDrafts} 
                  customers={customers} 
                  onInvoiceClick={handleInvoiceClick}
                />
              </TabsContent>
              <TabsContent value="issued">
                <InvoiceArchiveTable 
                  invoices={filteredIssued} 
                  customers={customers} 
                  onInvoiceClick={handleInvoiceClick}
                />
              </TabsContent>
              <TabsContent value="sent">
                <InvoiceArchiveTable 
                  invoices={filteredSent} 
                  customers={customers} 
                  onInvoiceClick={handleInvoiceClick}
                />
              </TabsContent>
              <TabsContent value="paid">
                <InvoiceArchiveTable 
                  invoices={filteredPaid} 
                  customers={customers} 
                  onInvoiceClick={handleInvoiceClick}
                />
              </TabsContent>
              <TabsContent value="overdue">
                <InvoiceArchiveTable 
                  invoices={filteredOverdue} 
                  customers={customers} 
                  onInvoiceClick={handleInvoiceClick}
                />
              </TabsContent>
              <TabsContent value="partially_paid">
                <InvoiceArchiveTable 
                  invoices={filteredPartiallyPaid} 
                  customers={customers} 
                  onInvoiceClick={handleInvoiceClick}
                />
              </TabsContent>
              <TabsContent value="cancelled">
                <InvoiceArchiveTable 
                  invoices={filteredCancelled} 
                  customers={customers} 
                  onInvoiceClick={handleInvoiceClick}
                />
              </TabsContent>
            </Tabs>
          </div>
        </CardContent>
      </Card>

      {/* MODAL ZA E-POŠTO */}
      <Dialog open={emailModalOpen} onOpenChange={setEmailModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-blue-700">
              <Mail className="w-5 h-5 text-blue-600" />
              Pošlji račun po e-pošti
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium block mb-1 text-gray-700">Prejemnik (e-pošta) *</label>
              <Input 
                value={customers.find(c => c.id === emailInvoice?.customerId)?.email || 'E-pošta ni vpisan'} 
                disabled 
                className="bg-gray-50 border-gray-200" 
              />
            </div>
            <div>
              <label className="text-sm font-medium block mb-1 text-gray-700">Zadeva *</label>
              <Input value={emailSubject} onChange={(e) => setEmailSubject(e.target.value)} />
            </div>
            <div>
              <label className="text-sm font-medium block mb-1 text-gray-700">Sporočilo *</label>
              <Textarea value={emailBody} onChange={(e) => setEmailBody(e.target.value)} rows={10} />
            </div>
            <div className="mt-2 px-3 py-1.5 bg-gray-50 rounded border border-gray-200 inline-block">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-gray-600" />
                <span className="text-sm text-gray-700">
                  Priponka: <span className="font-medium">{emailInvoice?.number || 'racun'}.pdf</span>
                </span>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEmailModalOpen(false)}>
              <X className="w-4 h-4 mr-2" /> Prekliči
            </Button>
            <Button onClick={handleSendEmail} className="bg-blue-600">
              <Send className="w-4 h-4 mr-2" /> Pošlji po e-pošti
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* MODAL ZA NAVADNO POŠTO */}
      <Dialog open={postModalOpen} onOpenChange={setPostModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-blue-700">
              <Package className="w-5 h-5 text-blue-600" />
              Pošlji račun po navadni pošti
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm font-medium text-blue-800">Račun: {postInvoice?.number}</p>
              <p className="text-sm text-blue-600">Kupec: {postInvoice?.customerName}</p>
              <p className="text-sm text-blue-600">Znesek: {postInvoice && formatCurrency(postInvoice.totalGross)}</p>
            </div>
            <div>
              <label className="text-sm font-medium block mb-1 text-gray-700">Naslov za pošiljanje *</label>
              <textarea 
                value={postAddress} 
                onChange={(e) => setPostAddress(e.target.value)} 
                className="w-full min-h-[100px] px-3 py-2 text-sm border rounded-md"
                placeholder="Ime in priimek / podjetje&#10;Ulica in hišna številka&#10;Poštna številka in kraj"
              />
            </div>
            <div>
              <label className="text-sm font-medium block mb-1 text-gray-700">Opomba (neobvezno)</label>
              <Input value={postNote} onChange={(e) => setPostNote(e.target.value)} placeholder="Npr. priporočeno, s povratnico..." />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPostModalOpen(false)}>
              <X className="w-4 h-4 mr-2" /> Prekliči
            </Button>
            <Button onClick={handleSendPost} className="bg-blue-600">
              <Package className="w-4 h-4 mr-2" /> Potrdi pošiljanje
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* MODAL ZA PLAČILO */}
      <Dialog open={paidModalOpen} onOpenChange={setPaidModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-green-700">
              <CheckCircle className="w-5 h-5 text-green-600" />
              Označi račun kot plačan
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <div className="bg-yellow-50 border border-yellow-200 rounded p-4 mb-4">
              <p className="text-sm text-yellow-800">
                S tem dejanjem boste račun <span className="font-semibold">{paidInvoice?.number}</span>
                za kupca <span className="font-semibold">{paidInvoice?.customerName}</span>
                označili kot <span className="font-semibold text-green-600">PLAČAN</span>.
              </p>
            </div>
            <p className="text-sm text-gray-600">Ste prepričani, da želite to narediti?</p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPaidModalOpen(false)}>Prekliči</Button>
            <Button onClick={handleMarkAsPaid} className="bg-green-600">
              <CheckCircle className="w-4 h-4 mr-2" /> Potrdi plačilo
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* MODAL ZA STORNIRANJE */}
      <Dialog open={cancelModalOpen} onOpenChange={setCancelModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-700">
              <Ban className="w-5 h-5 text-red-600" />
              Storniraj račun
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div className="bg-red-50 border border-red-200 rounded-lg p-5">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-base font-semibold text-red-800">OPOZORILO!</p>
                  <p className="text-sm text-red-700 mt-2 leading-relaxed">
                    Storniranje računa <span className="font-semibold">{cancelInvoice?.number}</span> 
                    za kupca <span className="font-semibold">{cancelInvoice?.customerName}</span> 
                    v znesku <span className="font-semibold">{formatCurrency(cancelInvoice?.totalGross)}</span> 
                    je <span className="font-semibold underline">TRAJNO</span> in ga <span className="font-semibold underline">ni mogoče razveljaviti</span>.
                  </p>
                </div>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium block mb-2 text-gray-700">
                Razlog za stornacijo <span className="text-red-500">*</span>
              </label>
              <Textarea 
                value={cancelReason} 
                onChange={(e) => setCancelReason(e.target.value)} 
                placeholder="Vpišite podroben razlog za stornacijo (obvezno)..."
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCancelModalOpen(false)}>
              <X className="w-4 h-4 mr-2" /> Prekliči
            </Button>
            <Button variant="destructive" onClick={handleCancelInvoice} disabled={!cancelReason.trim()}>
              <Ban className="w-4 h-4 mr-2" /> Storniraj račun
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    {/* MODAL ZA REVIZIJO/SPREMEMBE */}
<Dialog open={auditModalOpen} onOpenChange={setAuditModalOpen}>
  <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
    <DialogHeader className="sticky top-0 bg-white pb-4 border-b z-10">
      <DialogTitle className="flex items-center gap-2 text-gray-800 text-base lg:text-lg">
        <History className="w-4 h-4 lg:w-5 lg:h-5 text-blue-600" />
        Dnevnik sprememb - {auditInvoice?.number}
      </DialogTitle>
    </DialogHeader>
    
    <div className="py-4 space-y-3">
      {auditInvoice && getAuditLogsForInvoice(auditInvoice.id).length > 0 ? (
        (() => {
          const logs = getAuditLogsForInvoice(auditInvoice.id)
          return logs.map((log, index) => {
            const isLast = index === logs.length - 1
            
            // Določi ikono, barvo in label glede na akcijo
           // Določi ikono, barvo in label glede na akcijo
let icon, bgColor, iconColor, label
switch(log.action) {
  case 'created':
    icon = <FileText className="w-4 h-4 lg:w-5 lg:h-5" />
    bgColor = 'bg-green-100'
    iconColor = 'text-green-800'
    label = 'Ustvarjeno'
    break
  case 'edited':
  case 'saved':
    icon = <Edit className="w-4 h-4 lg:w-5 lg:h-5" />
    bgColor = 'bg-blue-100'
    iconColor = 'text-blue-800'
    label = log.action === 'saved' ? 'Shranjeno' : 'Posodobljeno'
    break
  case 'drafted':
    icon = <FileText className="w-4 h-4 lg:w-5 lg:h-5" />
    bgColor = 'bg-gray-300'
    iconColor = 'text-gray-800'
    label = 'Osnutek'
    break
  case 'status_changed':
    icon = <ArrowRight className="w-4 h-4 lg:w-5 lg:h-5" />
    bgColor = 'bg-yellow-100'
    iconColor = 'text-yellow-800'
    label = 'Status spremenjen'
    break
  case 'sent':
  case 'emailed':
    icon = <Mail className="w-4 h-4 lg:w-5 lg:h-5" />
    bgColor = 'bg-green-100'
    iconColor = 'text-green-800'
    label = log.action === 'emailed' ? 'Poslano po e-pošti' : 'Poslan'
    break
  case 'posted':
    icon = <Package className="w-4 h-4 lg:w-5 lg:h-5" />
    bgColor = 'bg-purple-100'
    iconColor = 'text-purple-800'
    label = 'Poslano po pošti'
    break
  case 'paid':
    icon = <CheckCircle className="w-4 h-4 lg:w-5 lg:h-5" />
    bgColor = 'bg-green-300'
    iconColor = 'text-emerald-800'
    label = 'Plačan'
    break
  case 'partially_paid':
    icon = <CheckCircle className="w-4 h-4 lg:w-5 lg:h-5" />
    bgColor = 'bg-amber-700'
    iconColor = 'text-white'
    label = 'Delno plačano'
    break
  case 'cancelled':
    icon = <Ban className="w-4 h-4 lg:w-5 lg:h-5" />
    bgColor = 'bg-red-400'
    iconColor = 'text-red-800'
    label = 'Storniran'
    break
  case 'unconfirmed':
    icon = <AlertTriangle className="w-4 h-4 lg:w-5 lg:h-5" />
    bgColor = 'bg-yellow-100'
    iconColor = 'text-yellow-800'
    label = 'Nepotrjen'
    break
  case 'rejected':
    icon = <X className="w-4 h-4 lg:w-5 lg:h-5" />
    bgColor = 'bg-orange-100'
    iconColor = 'text-orange-800'
    label = 'Zavrnjen'
    break
  case 'printed':
    icon = <Printer className="w-4 h-4 lg:w-5 lg:h-5" />
    bgColor = 'bg-gray-300'
    iconColor = 'text-gray-800'
    label = 'Natisnjeno'
    break
  case 'converted':
    icon = <ArrowRight className="w-4 h-4 lg:w-5 lg:h-5" />
    bgColor = 'bg-purple-100'
    iconColor = 'text-purple-800'
    label = 'Pretvorjeno'
    break
  case 'viewed':
    icon = <History className="w-4 h-4 lg:w-5 lg:h-5" />
    bgColor = 'bg-gray-300'
    iconColor = 'text-gray-800'
    label = 'Ogledano'
    break
  case 'overdue_set':
    icon = <AlertTriangle className="w-4 h-4 lg:w-5 lg:h-5" />
    bgColor = 'bg-red-100'
    iconColor = 'text-red-800'
    label = 'Zapadlo'
    break
  case 'issued':
    icon = <Check className="w-4 h-4 lg:w-5 lg:h-5" />
    bgColor = 'bg-blue-100'
    iconColor = 'text-blue-800'
    label = 'Izdan'
    break
  case 'item_added':
    icon = <Package className="w-4 h-4 lg:w-5 lg:h-5" />
    bgColor = 'bg-green-100'
    iconColor = 'text-green-800'
    label = 'Postavka dodana'
    break
  case 'item_removed':
    icon = <X className="w-4 h-4 lg:w-5 lg:h-5" />
    bgColor = 'bg-red-400'
    iconColor = 'text-red-800'
    label = 'Postavka odstranjena'
    break
  default:
    icon = <History className="w-4 h-4 lg:w-5 lg:h-5" />
    bgColor = 'bg-gray-300'
    iconColor = 'text-gray-800'
    label = log.action || 'Sprememba'
    
}
            
            // Pripravi opis spremembe
            let description = log.details || ''
            
            // Če je status spremenjen, sestavi opis iz starega in novega statusa
            if (log.action === 'status_changed' && log.oldStatus && log.newStatus) {
              const oldStatusLabel = statusLabels[log.oldStatus as InvoiceStatus] || log.oldStatus
              const newStatusLabel = statusLabels[log.newStatus as InvoiceStatus] || log.newStatus
              description = `Sprememba statusa iz "${oldStatusLabel}" v "${newStatusLabel}"`
            }
            
            // Če ni opisa, uporabi oldValue/newValue
            if (!description && log.oldValue && log.newValue) {
              description = `Sprememba: "${log.oldValue}" → "${log.newValue}"`
            }
            
            // Če še vedno ni opisa, uporabi privzeto
            if (!description) {
              description = 'Sprememba izvedena'
            }
            
            return (
              <div key={log.id} className="relative">
                {/* Črta za povezavo */}
                {!isLast && (
                  <div className="absolute left-[27px] top-12 bottom-0 w-0.5 bg-gray-200"></div>
                )}
                
                <div className="flex gap-4">
                  {/* Ikona z barvo */}
                  <div className="flex-shrink-0 z-10">
                    <div className={`w-8 h-8 lg:w-10 lg:h-10 rounded-full ${bgColor} flex items-center justify-center`}>
                      <div className={iconColor}>
                        {icon}
                      </div>
                    </div>
                  </div>
                  
                  {/* Vsebina */}
                  <div className="flex-1 bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors">
                    <div className="flex flex-wrap justify-between items-start gap-2 mb-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs lg:text-sm font-semibold text-gray-900">
                          {log.user}
                          {log.userRole && (
                            <span className="ml-1 text-xs font-normal text-gray-500">
                              ({log.userRole})
                            </span>
                          )}
                        </span>
                        <span className="text-[10px] lg:text-xs text-gray-500">• {formatDate(log.timestamp)}</span>
                      </div>
                      <div className={`px-2 py-1 rounded-md text-[10px] lg:text-xs font-medium uppercase ${bgColor} ${iconColor}`}>
                        {label}
                      </div>
                    </div>
                    
                    {/* Glavni opis */}
                    <p className="text-xs lg:text-sm text-gray-700 leading-relaxed">
                      {description}
                    </p>
                    
                    {/* Prikaz starega in novega statusa - vizualno */}
                    {log.action === 'status_changed' && log.oldStatus && log.newStatus && (
                      <div className="mt-3 flex flex-wrap items-center gap-3 text-xs bg-white rounded-lg p-3 border border-gray-200 shadow-sm">
                        <div className="flex items-center gap-2">
                          <span className="text-gray-500 text-[10px] uppercase tracking-wider">Prejšnji status</span>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[log.oldStatus as InvoiceStatus] || 'bg-gray-100 text-gray-700'}`}>
                            {statusLabels[log.oldStatus as InvoiceStatus] || log.oldStatus}
                          </span>
                        </div>
                        
                        <ArrowRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
                        
                        <div className="flex items-center gap-2">
                          <span className="text-gray-500 text-[10px] uppercase tracking-wider">Nov status</span>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[log.newStatus as InvoiceStatus] || 'bg-gray-100 text-gray-700'}`}>
                            {statusLabels[log.newStatus as InvoiceStatus] || log.newStatus}
                          </span>
                        </div>
                      </div>
                    )}
                    
                    {/* Prikaz drugih sprememb vrednosti */}
                    {log.oldValue && log.newValue && log.action !== 'status_changed' && (
                      <div className="mt-3 flex flex-wrap items-center gap-2 text-xs bg-white rounded-lg p-3 border border-gray-200">
                        <span className="text-gray-500 text-[10px] uppercase tracking-wider">Prej:</span>
                        <span className="text-gray-500 line-through text-red-500 bg-red-50 px-2 py-0.5 rounded">
                          {log.oldValue}
                        </span>
                        <ArrowRight className="w-3 h-3 text-gray-400" />
                        <span className="text-gray-500 text-[10px] uppercase tracking-wider">Zdaj:</span>
                        <span className="text-gray-700 font-medium text-green-600 bg-green-50 px-2 py-0.5 rounded">
                          {log.newValue}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )
          })
        })()
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

      {/* EDIT MODAL */}
      {editModalOpen && editingInvoiceData && (
        <>
          <div className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm !mt-0" onClick={handleCloseEditModal} />
          <div className="fixed inset-0 z-50 bg-white overflow-y-auto md:left-64 !mt-0">
            <div className="sticky top-0 bg-white border-b p-4">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold">Uredi račun</h2>
                <button onClick={handleCloseEditModal} className="p-2 bg-gray-100 rounded-full">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="p-6">
              <EditInvoice 
                editingInvoice={editingInvoiceData} 
                onClose={handleCloseEditModal}
                onSaved={handleCloseEditModal}
              />
            </div>
          </div>
        </>
      )}

      {/* INVOICE VIEW */}
      <InvoiceView 
        invoiceId={selectedInvoiceId} 
        open={!!selectedInvoiceId} 
        onClose={() => setSelectedInvoiceId(null)}
        onEdit={openEditModal}
        onSendEmail={openEmailModal}
        onSendPost={openPostModal}
        onMarkAsPaid={(invoiceId) => {
          const invoice = invoices.find(inv => inv.id === invoiceId)
          if (invoice) openPaidModal(invoice)
        }}
        onCancel={openCancelModal}
        onAudit={(invoice) => {
          setAuditInvoice(invoice)
          setAuditModalOpen(true)
        }}
        documentType={selectedInvoiceId && invoices.find(inv => inv.id === selectedInvoiceId)?.number?.startsWith('PR') ? 'estimate' : 'invoice'}
      />
    </div>
  )
}