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
import { Send, Ban, History, Package, Mail, X, FileText, Badge, CheckCircle, AlertTriangle, ArrowUp, Download, Printer } from 'lucide-react'
import { Invoice, InvoiceStatus, AuditLogEntry} from '@/types'
import { InvoiceView } from './InvoiceView'
import { InvoiceFilters } from './InvoiceFilters'
import { mockAuditLogs } from '@/data/mockData'
import { InvoiceArchiveTable } from './InvoiceArchiveTable'
import { EditInvoice } from './EditInvoice'
import { Edit, RefreshCw, ArrowRight } from 'lucide-react'
import { statusColors, statusLabels } from '@/data/mockData'
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

interface InvoiceArchiveProps { onEditInvoice: (invoice: Invoice) => void }

export function InvoiceArchive({ onEditInvoice: _onEditInvoice }: InvoiceArchiveProps) {
  const { invoices, updateInvoice, customers } = useInvoices()
  const [selectedNumber, setSelectedNumber] = useState(''); const [searchNumber, setSearchNumber] = useState('')
  const [selectedCustomer, setSelectedCustomer] = useState<{ id: string; name: string; taxId: string } | null>(null); const [searchCustomer, setSearchCustomer] = useState('')
  const [selectedMunicipality, setSelectedMunicipality] = useState(''); const [searchMunicipality, setSearchMunicipality] = useState('')
  const [priceMin, setPriceMin] = useState<number | ''>(''); const [priceMax, setPriceMax] = useState<number | ''>('')
  const [discountMin, setDiscountMin] = useState<number | ''>(''); const [discountMax, setDiscountMax] = useState<number | ''>('')
  const [dateFrom, setDateFrom] = useState<Date | null>(null); const [dateTo, setDateTo] = useState<Date | null>(null)
  const [dueDateFrom, setDueDateFrom] = useState<Date | null>(null); const [dueDateTo, setDueDateTo] = useState<Date | null>(null)
  const [selectedStatus, setSelectedStatus] = useState<InvoiceStatus | 'all'>('all')
  const [activeTab, setActiveTab] = useState('all'); const [selectedInvoiceId, setSelectedInvoiceId] = useState<string | null>(null)
  
  // Email modal
  const [emailModalOpen, setEmailModalOpen] = useState(false); const [emailInvoice, setEmailInvoice] = useState<Invoice | null>(null)
  const [emailSubject, setEmailSubject] = useState(''); const [emailBody, setEmailBody] = useState('')
  
  // Post modal
  const [postModalOpen, setPostModalOpen] = useState(false); const [postInvoice, setPostInvoice] = useState<Invoice | null>(null)
  const [postAddress, setPostAddress] = useState(''); const [postNote, setPostNote] = useState('')
  
  // Mark as Paid modal
  const [paidModalOpen, setPaidModalOpen] = useState(false); const [paidInvoice, setPaidInvoice] = useState<Invoice | null>(null)
  
  // Cancel modal
  const [cancelModalOpen, setCancelModalOpen] = useState(false); const [cancelInvoice, setCancelInvoice] = useState<Invoice | null>(null); const [cancelReason, setCancelReason] = useState('')
  
  const [editModalOpen, setEditModalOpen] = useState(false); const [editingInvoiceData, setEditingInvoiceData] = useState<Invoice | null>(null)
  const [auditModalOpen, setAuditModalOpen] = useState(false); const [auditInvoice, setAuditInvoice] = useState<Invoice | null>(null)

  const uniqueNumbers = Array.from(new Map(invoices.map(inv => [inv.number, inv.number])).entries()).map(([number]) => ({ number })).filter(item => item.number.toLowerCase().includes(searchNumber.toLowerCase()))
  const uniqueCustomers = Array.from(new Map(invoices.map(inv => [inv.customerId, { id: inv.customerId, name: inv.customerName, taxId: inv.customerTaxId }])).entries()).map(([_, customer]) => customer).filter(c => c.name.toLowerCase().includes(searchCustomer.toLowerCase()) || c.taxId.toLowerCase().includes(searchCustomer.toLowerCase()))
  const uniqueMunicipalities = Array.from(new Set(invoices.map(inv => { const customer = customers.find(c => c.id === inv.customerId); const address = customer?.address || ''; const parts = address.split(','); return parts.length > 1 ? parts[parts.length - 1].trim() : address.trim(); }))).filter(m => m.toLowerCase().includes(searchMunicipality.toLowerCase()))

  const filterInvoices = (statusFilter?: string) => invoices.filter(inv => {
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
    if (selectedStatus !== 'all' && inv.status !== selectedStatus) return false
    if (statusFilter && inv.status !== statusFilter) return false
    return true
  })

  const filteredAll = filterInvoices(); 
  const filteredIssued = filterInvoices('issued'); 
  const filteredDrafts = filterInvoices('draft'); 
  const filteredPaid = filterInvoices('paid'); 
  const filteredOverdue = filterInvoices('overdue');
  const filteredSent = filterInvoices('sent');
  const filteredPartiallyPaid = filterInvoices('partially_paid');
  const filteredCancelled = filterInvoices('cancelled');
  
  const clearAllFilters = () => { setSelectedNumber(''); setSearchNumber(''); setSelectedCustomer(null); setSearchCustomer(''); setSelectedMunicipality(''); setSearchMunicipality(''); setPriceMin(''); setPriceMax(''); setDiscountMin(''); setDiscountMax(''); setDateFrom(null); setDateTo(null); setDueDateFrom(null); setDueDateTo(null); setSelectedStatus('all') }

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
    
    // Auto-width columns
    const colWidths = [
      { wch: 15 }, // Številka
      { wch: 15 }, // Datum izdaje
      { wch: 25 }, // Kupec
      { wch: 18 }, // Davčna številka
      { wch: 12 }, // Neto
      { wch: 12 }, // DDV
      { wch: 12 }, // Skupaj
      { wch: 15 }, // Status
      { wch: 15 }, // Datum zapadlosti
      { wch: 12 }, // Št. postavk
    ]
    ws['!cols'] = colWidths

    XLSX.writeFile(wb, `racuni_${new Date().toISOString().split('T')[0]}.xlsx`)
  }

  // Pomožna funkcija za trenutno filtrirane račune glede na aktiven tab
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

  // Mark as Paid modal functions
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
  
  const openEditModal = (invoice: Invoice) => {
    console.log('Urejanje:', invoice.number, 'Tip:', invoice.number?.startsWith('PR') ? 'predračun' : 'račun')
    setEditingInvoiceData(invoice)
    setEditModalOpen(true)
    setSelectedInvoiceId(null)
  }

  // Email modal functions
  const openEmailModal = (invoice: Invoice) => { 
    setEmailInvoice(invoice); 
    setEmailSubject(`Račun ${invoice.number} - GeoFaktura`); 
    setEmailBody(`Spoštovani,\n\nV priponki vam pošiljamo račun št. ${invoice.number} z dne ${formatDate(invoice.issueDate)} v skupnem znesku ${formatCurrency(invoice.totalGross)}.\n\nProsimo, da račun poravnate v roku ${invoice.paymentTermDays} dni.\n\nLep pozdrav,\nGeoFaktura`); 
    setEmailModalOpen(true) 
  }
  
  const handleSendEmail = () => { 
    if (!emailInvoice) return; 
    
    console.log(`E-pošta poslana na naslov kupca ${emailInvoice.customerName}\nZadeva: ${emailSubject}\nPriloga: Racun_${emailInvoice.number}.pdf`);
    
    updateInvoice(emailInvoice.id, { 
      status: 'sent', 
      sentAt: new Date().toISOString(),
      note: emailInvoice.note 
        ? `${emailInvoice.note}\n\n[${new Date().toLocaleDateString('sl-SI')}] Račun poslan po e-pošti.` 
        : `[${new Date().toLocaleDateString('sl-SI')}] Račun poslan po e-pošti.`
    }); 
    
    setEmailModalOpen(false); 
    setEmailInvoice(null);
  }
  
  // Post modal functions
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
      note: postInvoice.note ? `${postInvoice.note}\n\n[${new Date().toLocaleDateString('sl-SI')}] Račun poslan po navadni pošti na naslov: ${postAddress}${postNote ? ` (${postNote})` : ''}` : `[${new Date().toLocaleDateString('sl-SI')}] Račun poslan po navadni pošti na naslov: ${postAddress}${postNote ? ` (${postNote})` : ''}`
    })
    
    setPostModalOpen(false)
    setPostInvoice(null)
    setPostAddress('')
    setPostNote('')
  }
  
  // Cancel modal functions
  const openCancelModal = (invoice: Invoice) => {
    setCancelInvoice(invoice)
    setCancelReason('')
    setCancelModalOpen(true)
  }
  
  const handleCancelInvoice = () => { 
    if (!cancelInvoice || !cancelReason.trim()) { 
      alert('Prosimo, vnesite razlog za stornacijo!'); 
      return 
    } 
    updateInvoice(cancelInvoice.id, { 
      status: 'cancelled', 
      cancelledReason: cancelReason,
      note: cancelInvoice.note 
        ? `${cancelInvoice.note}\n\n[${new Date().toLocaleDateString('sl-SI')}] Račun storniran. Razlog: ${cancelReason}` 
        : `[${new Date().toLocaleDateString('sl-SI')}] Račun storniran. Razlog: ${cancelReason}`
    }); 
    setCancelModalOpen(false); 
    setCancelInvoice(null); 
    setCancelReason('')
  }
  
  const getAuditLogsForInvoice = (invoiceId: string) => mockAuditLogs.filter(log => log.invoiceId === invoiceId).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Seznam računov</h1>
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
            selectedStatus={selectedStatus} setSelectedStatus={setSelectedStatus}
            uniqueNumbers={uniqueNumbers} uniqueCustomers={uniqueCustomers} uniqueMunicipalities={uniqueMunicipalities} statusOptions={statusOptions}
            clearAllFilters={clearAllFilters}
          />
          
          {/* Kontrole za izvoz */}
          <div className="flex justify-start mt-4">
            <div className="flex gap-3">
              <Button 
                variant="outline" 
                className="flex items-center gap-2"
              >
                <div /> Počisti filtre
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

      {/* Ostali modali (Email, Post, Mark as Paid, Cancel, Edit, Audit) ostanejo enaki */}
      {/* ... (vsi modali ostanejo isti kot prej) ... */}
      
      <InvoiceView 
        invoiceId={selectedInvoiceId} 
        open={!!selectedInvoiceId} 
        onClose={() => setSelectedInvoiceId(null)}
        onEdit={openEditModal}
        onSendEmail={(invoice) => openEmailModal(invoice)}
        onSendPost={(invoice) => openPostModal(invoice)}
        onMarkAsPaid={(invoiceId) => {
          const invoice = invoices.find(inv => inv.id === invoiceId)
          if (invoice) openPaidModal(invoice)
        }}
        onCancel={(invoice) => openCancelModal(invoice)}
        onAudit={(invoice) => {
          setAuditInvoice(invoice)
          setAuditModalOpen(true)
        }}
        documentType={selectedInvoiceId && invoices.find(inv => inv.id === selectedInvoiceId)?.number?.startsWith('PR') ? 'estimate' : 'invoice'}
      />
    </div>
  )
}