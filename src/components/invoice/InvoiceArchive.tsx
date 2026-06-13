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
import { Filter, Send, Ban, History, Package, Mail, X, FileText, Badge } from 'lucide-react'
import { Invoice, InvoiceStatus } from '@/types'
import { InvoiceView } from './InvoiceView'
import { InvoiceFilters } from './InvoiceFilters'
import { statusLabels, mockAuditLogs } from '@/data/mockData'
import { InvoiceArchiveTable } from './InvoiceArchiveTable'
import { cn } from '@/lib/utils'
import { EditInvoice } from './EditInvoice'

const statusOptions: { value: InvoiceStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'Vsi' }, { value: 'draft', label: 'Osnutki' }, { value: 'issued', label: 'Izdani' },
  { value: 'sent', label: 'Poslani' }, { value: 'overdue', label: 'Zapadli' }, { value: 'paid', label: 'Plačani' }, { value: 'cancelled', label: 'Stornirani' },
]

interface InvoiceArchiveProps { onEditInvoice: (invoice: Invoice) => void }

export function InvoiceArchive({ onEditInvoice: _onEditInvoice }: InvoiceArchiveProps) {
  const { invoices, deleteInvoice, updateInvoice, customers } = useInvoices()
  const [selectedNumber, setSelectedNumber] = useState(''); const [searchNumber, setSearchNumber] = useState('')
  const [selectedCustomer, setSelectedCustomer] = useState<{ id: string; name: string; taxId: string } | null>(null); const [searchCustomer, setSearchCustomer] = useState('')
  const [selectedMunicipality, setSelectedMunicipality] = useState(''); const [searchMunicipality, setSearchMunicipality] = useState('')
  const [priceMin, setPriceMin] = useState<number | ''>(''); const [priceMax, setPriceMax] = useState<number | ''>('')
  const [discountMin, setDiscountMin] = useState<number | ''>(''); const [discountMax, setDiscountMax] = useState<number | ''>('')
  const [dateFrom, setDateFrom] = useState<Date | null>(null); const [dateTo, setDateTo] = useState<Date | null>(null)
  const [dueDateFrom, setDueDateFrom] = useState<Date | null>(null); const [dueDateTo, setDueDateTo] = useState<Date | null>(null)
  const [selectedStatus, setSelectedStatus] = useState<InvoiceStatus | 'all'>('all')
  const [activeTab, setActiveTab] = useState('all'); const [selectedInvoiceId, setSelectedInvoiceId] = useState<string | null>(null)
  const [showFilters, setShowFilters] = useState(false)
  
  // Email modal
  const [emailModalOpen, setEmailModalOpen] = useState(false); const [emailInvoice, setEmailInvoice] = useState<Invoice | null>(null)
  const [emailSubject, setEmailSubject] = useState(''); const [emailBody, setEmailBody] = useState('')
  
  // Post modal
  const [postModalOpen, setPostModalOpen] = useState(false); const [postInvoice, setPostInvoice] = useState<Invoice | null>(null)
  const [postAddress, setPostAddress] = useState(''); const [postNote, setPostNote] = useState('')
  
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
    if (discountMin !== '' && inv.discountPercent < discountMin) return false
    if (discountMax !== '' && inv.discountPercent > discountMax) return false
    const dateFromStr = dateFrom ? dateFrom.toISOString().split('T')[0] : ''; const dateToStr = dateTo ? dateTo.toISOString().split('T')[0] : ''
    if (dateFromStr && inv.issueDate < dateFromStr) return false; if (dateToStr && inv.issueDate > dateToStr) return false
    const dueFromStr = dueDateFrom ? dueDateFrom.toISOString().split('T')[0] : ''; const dueToStr = dueDateTo ? dueDateTo.toISOString().split('T')[0] : ''
    if (dueFromStr && inv.dueDate < dueFromStr) return false; if (dueToStr && inv.dueDate > dueToStr) return false
    if (selectedStatus !== 'all' && inv.status !== selectedStatus) return false
    if (statusFilter && inv.status !== statusFilter) return false
    return true
  })

  const filteredAll = filterInvoices(); const filteredIssued = filterInvoices('issued'); const filteredDrafts = filterInvoices('draft'); const filteredPaid = filterInvoices('paid'); const filteredOverdue = filterInvoices('overdue')
  const clearAllFilters = () => { setSelectedNumber(''); setSearchNumber(''); setSelectedCustomer(null); setSearchCustomer(''); setSelectedMunicipality(''); setSearchMunicipality(''); setPriceMin(''); setPriceMax(''); setDiscountMin(''); setDiscountMax(''); setDateFrom(null); setDateTo(null); setDueDateFrom(null); setDueDateTo(null); setSelectedStatus('all') }

  const handleInvoiceClick = (invoice: Invoice) => {
    setSelectedInvoiceId(invoice.id)
  }

  const handlePrint = (invoice: Invoice) => { setSelectedInvoiceId(invoice.id); setTimeout(() => { const printContent = document.querySelector('.invoice-print-content'); if (printContent) { const printWindow = window.open('', '_blank'); if (printWindow) { printWindow.document.write(`<html><head><title>Račun ${invoice.number}</title><style>*{margin:0;padding:0;box-sizing:border-box;}body{font-family:Arial;padding:20px;}@media print{body{padding:0;}}</style></head><body><div>${printContent.innerHTML}</div><button onclick="window.print()">Natisni</button><button onclick="window.close()">Zapri</button></body></html>`); printWindow.document.close() } } }, 500) }
  
  // Email modal functions
  const openEmailModal = (invoice: Invoice) => { 
    setEmailInvoice(invoice); 
    setEmailSubject(`Račun ${invoice.number} - GeoFaktura`); 
    setEmailBody(`Spoštovani,\n\nV priponki vam pošiljamo račun št. ${invoice.number} z dne ${formatDate(invoice.issueDate)} v skupnem znesku ${formatCurrency(invoice.totalGross)}.\n\nProsimo, da račun poravnate v roku ${invoice.paymentTermDays} dni.\n\nLep pozdrav,\nGeoFaktura`); 
    setEmailModalOpen(true) 
  }
  
  const handleSendEmail = () => { 
    if (!emailInvoice) return; 
    
    // Obvestilo v konzoli za debugging (ne bo prikazano uporabniku)
    console.log(`📧 E-pošta poslana na naslov kupca ${emailInvoice.customerName}\nZadeva: ${emailSubject}\nPriloga: Racun_${emailInvoice.number}.pdf`);
    
    updateInvoice(emailInvoice.id, { 
      status: 'sent', 
      sentAt: new Date().toISOString(),
      note: emailInvoice.note 
        ? `${emailInvoice.note}\n\n[${new Date().toLocaleDateString('sl-SI')}] Račun poslan po e-pošti.` 
        : `[${new Date().toLocaleDateString('sl-SI')}] Račun poslan po e-pošti.`
    }); 
    
    setEmailModalOpen(false); 
    setEmailInvoice(null);
    setSelectedInvoiceId(null);
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
    
    alert(`📮 Pošta poslana na naslov:\n${postAddress}\n\n${postNote ? `Opomba: ${postNote}\n\n` : ''}Datum pošiljanja: ${new Date().toLocaleDateString('sl-SI')}\n\nRačun: ${postInvoice.number}`)
    
    updateInvoice(postInvoice.id, { 
      status: 'sent', 
      sentAt: new Date().toISOString(),
      note: postInvoice.note ? `${postInvoice.note}\n\n[${new Date().toLocaleDateString('sl-SI')}] Račun poslan po navadni pošti na naslov: ${postAddress}${postNote ? ` (${postNote})` : ''}` : `[${new Date().toLocaleDateString('sl-SI')}] Račun poslan po navadni pošti na naslov: ${postAddress}${postNote ? ` (${postNote})` : ''}`
    })
    
    setPostModalOpen(false)
    setPostInvoice(null)
    setPostAddress('')
    setPostNote('')
    // Zapremo tudi InvoiceView če je odprt
    setSelectedInvoiceId(null)
  }
  
  const handleCancelInvoice = () => { if (!cancelInvoice || !cancelReason.trim()) { alert('Prosimo, vnesite razlog za stornacijo!'); return }; updateInvoice(cancelInvoice.id, { status: 'cancelled', cancelledReason: cancelReason }); setCancelModalOpen(false); setCancelInvoice(null); setCancelReason('') }
  const handleMarkAsPaid = (invoiceId: string) => { if (confirm('Označite ta račun kot plačan?')) updateInvoice(invoiceId, { status: 'paid', paidAt: new Date().toISOString() }) }
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
            discountMin={discountMin} setDiscountMin={setDiscountMin} discountMax={discountMax} setDiscountMax={setDiscountMax}
            dateFrom={dateFrom} setDateFrom={setDateFrom} dateTo={dateTo} setDateTo={setDateTo}
            dueDateFrom={dueDateFrom} setDueDateFrom={setDueDateFrom} dueDateTo={dueDateTo} setDueDateTo={setDueDateTo}
            selectedStatus={selectedStatus} setSelectedStatus={setSelectedStatus}
            uniqueNumbers={uniqueNumbers} uniqueCustomers={uniqueCustomers} uniqueMunicipalities={uniqueMunicipalities} statusOptions={statusOptions}
            clearAllFilters={clearAllFilters} showFilters={showFilters} 
          />
          
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="all">Vsi ({filteredAll.length})</TabsTrigger>
              <TabsTrigger value="issued">Izdani ({filteredIssued.length})</TabsTrigger>
              <TabsTrigger value="drafts">Osnutki ({filteredDrafts.length})</TabsTrigger>
              <TabsTrigger value="paid">Plačani ({filteredPaid.length})</TabsTrigger>
              <TabsTrigger value="overdue">Zapadli ({filteredOverdue.length})</TabsTrigger>
            </TabsList>
            <TabsContent value="all">
              <InvoiceArchiveTable 
                invoices={filteredAll} 
                customers={customers} 
                onInvoiceClick={handleInvoiceClick}
                onSendEmail={openEmailModal}
                onSendPost={openPostModal}
              />
            </TabsContent>
            <TabsContent value="issued">
              <InvoiceArchiveTable 
                invoices={filteredIssued} 
                customers={customers} 
                onInvoiceClick={handleInvoiceClick}
                onSendEmail={openEmailModal}
                onSendPost={openPostModal}
              />
            </TabsContent>
            <TabsContent value="drafts">
              <InvoiceArchiveTable 
                invoices={filteredDrafts} 
                customers={customers} 
                onInvoiceClick={handleInvoiceClick}
                onSendEmail={openEmailModal}
                onSendPost={openPostModal}
              />
            </TabsContent>
            <TabsContent value="paid">
              <InvoiceArchiveTable 
                invoices={filteredPaid} 
                customers={customers} 
                onInvoiceClick={handleInvoiceClick}
                onSendEmail={openEmailModal}
                onSendPost={openPostModal}
              />
            </TabsContent>
            <TabsContent value="overdue">
              <InvoiceArchiveTable 
                invoices={filteredOverdue} 
                customers={customers} 
                onInvoiceClick={handleInvoiceClick}
                onSendEmail={openEmailModal}
                onSendPost={openPostModal}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      
{/* MODAL ZA E-POŠTO - POBOLJŠAN */}
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
        <label className="text-sm font-medium block mb-1 text-gray-700">📧 Prejemnik (e-pošta) *</label>
        <Input 
          value={customers.find(c => c.id === emailInvoice?.customerId)?.email || 'E-pošta ni vpisan'} 
          disabled 
          className="bg-gray-50 border-gray-200" 
        />
      </div>
      
      <div>
        <label className="text-sm font-medium block mb-1 text-gray-700">Zadeva *</label>
        <Input 
          value={emailSubject} 
          onChange={(e) => setEmailSubject(e.target.value)} 
          className="border-gray-200 focus:border-blue-400 focus:ring-blue-400"
        />
      </div>
      
      <div>
        <label className="text-sm font-medium block mb-1 text-gray-700">Sporočilo *</label>
        <Textarea 
          value={emailBody} 
          onChange={(e) => setEmailBody(e.target.value)} 
          rows={8} 
          className="font-normal text-sm border-gray-200 focus:border-blue-400 focus:ring-blue-400"
        />
      </div>
      
      {/* Priponka */}
      <div className="mt-2 px-3 py-1.5 bg-gray-50 rounded border border-gray-200 inline-block">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-gray-600" />
          <span className="text-sm text-gray-700">
            Priponka: <span className="font-medium">{emailInvoice?.invoiceNumber || 'racun'}.pdf</span>
          </span>
        </div>
      </div>
    </div>
    
    <DialogFooter className="gap-2 pt-4">
      <Button 
        variant="outline" 
        onClick={() => {
          setEmailModalOpen(false)
          setEmailInvoice(null)
        }}
      >
        <X className="w-4 h-4 mr-2" /> Prekliči
      </Button>
      <Button onClick={handleSendEmail} className="bg-blue-600 hover:bg-blue-700">
        <Send className="w-4 h-4 mr-2" /> Pošlji po e-pošti
      </Button>
    </DialogFooter>
  </DialogContent>
</Dialog>

      {/* MODAL ZA NAVADNO POŠTO - POBOLJŠAN */}
      <Dialog open={postModalOpen} onOpenChange={setPostModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-amber-700">
              <Package className="w-5 h-5 text-amber-600" />
              Pošlji račun po navadni pošti
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <p className="text-sm font-medium text-amber-800">📄 Račun: {postInvoice?.number}</p>
              <p className="text-sm text-amber-600">🏢 Kupec: {postInvoice?.customerName}</p>
              <p className="text-sm text-amber-600">💰 Znesek: {postInvoice && formatCurrency(postInvoice.totalGross)}</p>
            </div>
            
            <div>
              <label className="text-sm font-medium block mb-1 text-gray-700">📮 Naslov za pošiljanje *</label>
              <textarea 
                value={postAddress} 
                onChange={(e) => setPostAddress(e.target.value)} 
                className="w-full min-h-[100px] px-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                placeholder="Ime in priimek / podjetje&#10;Ulica in hišna številka&#10;Poštna številka in kraj"
              />
              <p className="text-xs text-gray-500 mt-1">Preverite naslov pred pošiljanjem</p>
            </div>
            
            <div>
              <label className="text-sm font-medium block mb-1 text-gray-700">📝 Opomba (neobvezno)</label>
              <Input 
                value={postNote} 
                onChange={(e) => setPostNote(e.target.value)} 
                placeholder="Npr. priporočeno, s povratnico, dostava na dom..."
                className="border-gray-200 focus:border-amber-400 focus:ring-amber-400"
              />
            </div>
            
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-sm">
              <p className="font-medium mb-1 text-gray-700">📮 Potrditev pošiljanja:</p>
              <p className="text-gray-600">S klikom na "Potrdi pošiljanje" potrjujete, da ste račun fizično poslali po navadni pošti na zgornji naslov.</p>
            </div>
          </div>
          <DialogFooter className="gap-2 border-t pt-4">
            <Button 
              variant="outline" 
              onClick={() => {
                setPostModalOpen(false)
                setPostInvoice(null)
                setPostAddress('')
                setPostNote('')
              }}
            >
              <X className="w-4 h-4 mr-2" /> Prekliči
            </Button>
            <Button onClick={handleSendPost} className="bg-amber-600 hover:bg-amber-700">
              <Package className="w-4 h-4 mr-2" /> Potrdi pošiljanje
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={cancelModalOpen} onOpenChange={setCancelModalOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Storniraj račun</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><label>Številka računa</label><Input value={cancelInvoice?.number || ''} disabled /></div>
            <div><label>Razlog za stornacijo *</label><Textarea value={cancelReason} onChange={(e) => setCancelReason(e.target.value)} placeholder="Vpišite razlog..." rows={3} /></div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setCancelModalOpen(false)}>Prekliči</Button>
            <Button variant="destructive" onClick={handleCancelInvoice}><Ban className="w-4 h-4 mr-2" />Storniraj</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

{editModalOpen && (
  <>
      {/* Overlay - zatemnitev ozadja */}
    <div 
      className="fixed top-0 left-0 bottom-0 z-40 w-64 bg-black/30 backdrop-blur-sm"
      onClick={() => {
        // Zapremo edit modal
        setEditModalOpen(false);
        setEditingInvoiceData(null);
        // Odpremo InvoiceView za isti račun
        if (editingInvoiceData) {
          setSelectedInvoiceId(editingInvoiceData.id);
        }
      }}
    />
    
    {/* Modal */}
    <div className="fixed inset-0 z-50 bg-white overflow-y-auto md:left-64">
      <div className="sticky top-0 bg-white border-b z-10 px-4 md:px-6 py-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-800">Uredi račun</h2>
          <button
            onClick={() => {
              setEditModalOpen(false);
              setEditingInvoiceData(null);
            }}
            className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>
      
      <div className="p-4 md:p-6">
        {editingInvoiceData && (
          <EditInvoice 
  editingInvoice={editingInvoiceData} 
  onClose={() => { 
    setEditModalOpen(false); 
    setEditingInvoiceData(null);
    // Po zaprtju edit modala odpremo InvoiceView
    if (editingInvoiceData) {
      setSelectedInvoiceId(editingInvoiceData.id);
    }
  }} 
  onSaved={() => {
    // Opcijsko: dodatna logika po shranjevanju
  }}
/>
        )}
      </div>
    </div>
  </>
)}

      <Dialog open={auditModalOpen} onOpenChange={setAuditModalOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <History className="w-5 h-5" />Dnevnik sprememb - {auditInvoice?.number}
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            {auditInvoice && getAuditLogsForInvoice(auditInvoice.id).map(log => (
              <div key={log.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg mb-2">
                <div className="px-2 py-1 rounded-md text-xs font-medium bg-blue-100">{log.action}</div>
                <div className="flex-1">
                  <div className="flex justify-between">
                    <span className="font-medium">{log.user}</span>
                    <span className="text-xs text-gray-500">{formatDate(log.timestamp)}</span>
                  </div>
                  <p className="text-sm text-gray-600">{log.details}</p>
                </div>
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button onClick={() => setAuditModalOpen(false)}>Zapri</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <InvoiceView 
        invoiceId={selectedInvoiceId} 
        open={!!selectedInvoiceId} 
        onClose={() => setSelectedInvoiceId(null)}
        onEdit={(invoice) => {
          setEditingInvoiceData(invoice)
          setEditModalOpen(true)
          setSelectedInvoiceId(null)
        }}
        onSendEmail={(invoice) => {
          openEmailModal(invoice)
          // Ne zapremo takoj InvoiceView, počakamo da uporabnik zaključi z modalom
        }}
        onSendPost={(invoice) => {
          openPostModal(invoice)
          // Ne zapremo takoj InvoiceView, počakamo da uporabnik zaključi z modalom
        }}
        onMarkAsPaid={(invoiceId) => {
          handleMarkAsPaid(invoiceId)
          setSelectedInvoiceId(null)
        }}
        onCancel={(invoice) => {
          openCancelModal(invoice)
          setSelectedInvoiceId(null)
        }}
        onAudit={(invoice) => {
          setAuditInvoice(invoice)
          setAuditModalOpen(true)
          setSelectedInvoiceId(null)
        }}
      />
    </div>
  )
}