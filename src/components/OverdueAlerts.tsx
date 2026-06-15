// src/components/OverdueInvoices.tsx
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
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Send, Ban, History, Package, Mail, X, FileText, CheckCircle, Bell, BellRing, BellOff } from 'lucide-react'
import { EditInvoice } from './invoice/EditInvoice'
import { mockAuditLogs } from '@/data/mockData'
import { Badge } from '@/components/ui/badge'

// Tip za opomine
interface Reminder {
  sentAt: string
  reminderNumber: number
  method: 'email' | 'post'
}

// Status opcije za zapadle račune
const overdueStatusOptions: { value: InvoiceStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'Vsi' },
  { value: 'overdue', label: 'Zapadli' },
  { value: 'paid', label: 'Plačani' },
  { value: 'cancelled', label: 'Stornirani' },
]

// Pomožna funkcija za izračun dni zamude
const getDaysLate = (dueDate: string) => {
  const today = new Date()
  const due = new Date(dueDate)
  const diffTime = today.getTime() - due.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return diffDays
}

// Pomožna funkcija za določitev naslednjega opomina
const getNextReminderNumber = (reminders: Reminder[]): number => {
  const sentReminders = reminders.map(r => r.reminderNumber)
  if (!sentReminders.includes(1)) return 1
  if (!sentReminders.includes(2)) return 2
  return 3
}

// Pomožna funkcija za preverjanje ali je opomin potreben
const isReminderNeeded = (invoice: any, reminders: Reminder[]): boolean => {
  if (invoice.status !== 'overdue') return false
  
  const daysLate = getDaysLate(invoice.dueDate)
  const sentReminders = reminders.map(r => r.reminderNumber)
  
  // 1. opomin po 7 dneh
  if (daysLate >= 7 && !sentReminders.includes(1)) return true
  // 2. opomin po 14 dneh
  if (daysLate >= 14 && !sentReminders.includes(2)) return true
  // 3. opomin po 21 dneh
  if (daysLate >= 21 && !sentReminders.includes(3)) return true
  
  return false
}

export function OverdueInvoices() {
  const { invoices, customers, updateInvoice } = useInvoices()
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string | null>(null)
  const [reminders, setReminders] = useState<Record<string, Reminder[]>>({})
  
  // Naloži opomine iz localStorage
  useEffect(() => {
    const savedReminders = localStorage.getItem('invoiceReminders')
    if (savedReminders) {
      setReminders(JSON.parse(savedReminders))
    }
  }, [])
  
  // Shrani opomine v localStorage
  const saveReminders = (newReminders: Record<string, Reminder[]>) => {
    setReminders(newReminders)
    localStorage.setItem('invoiceReminders', JSON.stringify(newReminders))
  }
  
  // Email modal
  const [emailModalOpen, setEmailModalOpen] = useState(false)
  const [emailInvoice, setEmailInvoice] = useState<any>(null)
  const [emailSubject, setEmailSubject] = useState('')
  const [emailBody, setEmailBody] = useState('')
  const [currentReminderNumber, setCurrentReminderNumber] = useState<number>(1)
  
  // Post modal
  const [postModalOpen, setPostModalOpen] = useState(false)
  const [postInvoice, setPostInvoice] = useState<any>(null)
  const [postAddress, setPostAddress] = useState('')
  const [postNote, setPostNote] = useState('')
  const [postReminderNumber, setPostReminderNumber] = useState<number>(1)
  
  // Edit modal
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [editingInvoiceData, setEditingInvoiceData] = useState<any>(null)
  
  // Mark as Paid modal
  const [paidModalOpen, setPaidModalOpen] = useState(false)
  const [paidInvoice, setPaidInvoice] = useState<any>(null)
  
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
  const [selectedStatus, setSelectedStatus] = useState<InvoiceStatus | 'all'>('all')
  const [activeTab, setActiveTab] = useState('all')

  // Pridobi samo zapadle račune (status === 'overdue')
  const overdueInvoices = invoices.filter(inv => inv.status === 'overdue')

  // Unique podatki za filtre
  const uniqueNumbers = Array.from(new Map(overdueInvoices.map(inv => [inv.number, inv.number])).entries()).map(([number]) => ({ number })).filter(item => item.number.toLowerCase().includes(searchNumber.toLowerCase()))
  const uniqueCustomers = Array.from(new Map(overdueInvoices.map(inv => [inv.customerId, { id: inv.customerId, name: inv.customerName, taxId: inv.customerTaxId }])).entries()).map(([_, customer]) => customer).filter(c => c.name.toLowerCase().includes(searchCustomer.toLowerCase()) || c.taxId.toLowerCase().includes(searchCustomer.toLowerCase()))
  const uniqueMunicipalities = Array.from(new Set(overdueInvoices.map(inv => { const customer = customers.find(c => c.id === inv.customerId); const address = customer?.address || ''; const parts = address.split(','); return parts.length > 1 ? parts[parts.length - 1].trim() : address.trim(); }))).filter(m => m.toLowerCase().includes(searchMunicipality.toLowerCase()))

  const filterInvoices = (statusFilter?: string) => overdueInvoices.filter(inv => {
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
  const filteredOverdue = filterInvoices('overdue')
  const filteredPaid = filterInvoices('paid')
  const filteredCancelled = filterInvoices('cancelled')

  const clearAllFilters = () => { 
    setSelectedNumber(''); setSearchNumber(''); setSelectedCustomer(null); setSearchCustomer('')
    setSelectedMunicipality(''); setSearchMunicipality(''); setPriceMin(''); setPriceMax('')
    setDiscountMin(''); setDiscountMax(''); setDateFrom(null); setDateTo(null)
    setDueDateFrom(null); setDueDateTo(null); setSelectedStatus('all')
  }

  const handleInvoiceClick = (invoice: any) => {
    setSelectedInvoiceId(invoice.id)
  }

  // Email modal functions (opomin)
  const openEmailModal = (invoice: any, reminderNumber: number) => { 
    setEmailInvoice(invoice)
    setCurrentReminderNumber(reminderNumber)
    setEmailSubject(`${reminderNumber}. opomin za plačilo - Račun ${invoice.number}`)
    setEmailBody(`Spoštovani,\n\nTo je ${reminderNumber}. opomin za plačilo računa št. ${invoice.number} z dne ${formatDate(invoice.issueDate)} v znesku ${formatCurrency(invoice.totalGross)}.\n\nRačun je zapadel ${formatDate(invoice.dueDate)}.\n\nProsimo, da račun poravnate čim prej.\n\nLep pozdrav,\nGeoFaktura`)
    setEmailModalOpen(true)
  }
  
  const handleSendEmail = () => { 
    if (!emailInvoice) return
    
    const newReminder: Reminder = {
      sentAt: new Date().toISOString(),
      reminderNumber: currentReminderNumber,
      method: 'email'
    }
    
    const currentReminders = reminders[emailInvoice.id] || []
    const updatedReminders = [...currentReminders, newReminder]
    
    saveReminders({
      ...reminders,
      [emailInvoice.id]: updatedReminders
    })
    
    updateInvoice(emailInvoice.id, { 
      note: emailInvoice.note 
        ? `${emailInvoice.note}\n\n[${new Date().toLocaleDateString('sl-SI')}] Poslan ${currentReminderNumber}. opomin za plačilo po e-pošti.` 
        : `[${new Date().toLocaleDateString('sl-SI')}] Poslan ${currentReminderNumber}. opomin za plačilo po e-pošti.`
    })
    setEmailModalOpen(false)
    setEmailInvoice(null)
  }
  
  // Post modal functions
  const openPostModal = (invoice: any, reminderNumber: number) => {
    const customer = customers.find(c => c.id === invoice.customerId)
    const defaultAddress = customer?.address || 'Naslov ni vpisan'
    setPostInvoice(invoice)
    setPostReminderNumber(reminderNumber)
    setPostAddress(defaultAddress)
    setPostNote('')
    setPostModalOpen(true)
  }
  
  const handleSendPost = () => {
    if (!postInvoice) return
    
    const newReminder: Reminder = {
      sentAt: new Date().toISOString(),
      reminderNumber: postReminderNumber,
      method: 'post'
    }
    
    const currentReminders = reminders[postInvoice.id] || []
    const updatedReminders = [...currentReminders, newReminder]
    
    saveReminders({
      ...reminders,
      [postInvoice.id]: updatedReminders
    })
    
    updateInvoice(postInvoice.id, { 
      note: postInvoice.note ? `${postInvoice.note}\n\n[${new Date().toLocaleDateString('sl-SI')}] Poslan ${postReminderNumber}. opomin za plačilo po navadni pošti na naslov: ${postAddress}` : `[${new Date().toLocaleDateString('sl-SI')}] Poslan ${postReminderNumber}. opomin za plačilo po navadni pošti na naslov: ${postAddress}`
    })
    setPostModalOpen(false)
    setPostInvoice(null)
    setPostAddress('')
    setPostNote('')
  }
  
  // Mark as Paid modal
  const openPaidModal = (invoice: any) => {
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
        ? `${cancelInvoice.note}\n\n[${new Date().toLocaleDateString('sl-SI')}] Račun storniran. Razlog: ${cancelReason}` 
        : `[${new Date().toLocaleDateString('sl-SI')}] Račun storniran. Razlog: ${cancelReason}`
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
  
  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'issued': return 'Izdan'
      case 'sent': return 'Poslan'
      case 'overdue': return 'Zapadel'
      case 'paid': return 'Plačan'
      case 'cancelled': return 'Storniran'
      default: return status
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'issued': return 'bg-blue-100 text-blue-800'
      case 'sent': return 'bg-green-100 text-green-800'
      case 'overdue': return 'bg-red-100 text-red-800'
      case 'paid': return 'bg-emerald-100 text-emerald-800'
      case 'cancelled': return 'bg-gray-100 text-gray-800'
      default: return 'bg-yellow-100 text-yellow-800'
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold">Zapadli računi</h1>
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
            uniqueNumbers={uniqueNumbers} uniqueCustomers={uniqueCustomers} uniqueMunicipalities={uniqueMunicipalities} statusOptions={overdueStatusOptions as any}
            clearAllFilters={clearAllFilters}
          />
          
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="all">Vsi ({filteredAll.length})</TabsTrigger>
              <TabsTrigger value="overdue">Zapadli ({filteredOverdue.length})</TabsTrigger>
              <TabsTrigger value="paid">Plačani ({filteredPaid.length})</TabsTrigger>
              <TabsTrigger value="cancelled">Stornirani ({filteredCancelled.length})</TabsTrigger>
            </TabsList>
            
            <TabsContent value="all">
              <OverdueTable 
                invoices={filteredAll}
                customers={customers}
                reminders={reminders}
                onInvoiceClick={handleInvoiceClick}
                onSendEmail={openEmailModal}
                onSendPost={openPostModal}
                getStatusLabel={getStatusLabel}
                getStatusColor={getStatusColor}
              />
            </TabsContent>
            <TabsContent value="overdue">
              <OverdueTable 
                invoices={filteredOverdue}
                customers={customers}
                reminders={reminders}
                onInvoiceClick={handleInvoiceClick}
                onSendEmail={openEmailModal}
                onSendPost={openPostModal}
                getStatusLabel={getStatusLabel}
                getStatusColor={getStatusColor}
              />
            </TabsContent>
            <TabsContent value="paid">
              <OverdueTable 
                invoices={filteredPaid}
                customers={customers}
                reminders={reminders}
                onInvoiceClick={handleInvoiceClick}
                onSendEmail={openEmailModal}
                onSendPost={openPostModal}
                getStatusLabel={getStatusLabel}
                getStatusColor={getStatusColor}
              />
            </TabsContent>
            <TabsContent value="cancelled">
              <OverdueTable 
                invoices={filteredCancelled}
                customers={customers}
                reminders={reminders}
                onInvoiceClick={handleInvoiceClick}
                onSendEmail={openEmailModal}
                onSendPost={openPostModal}
                getStatusLabel={getStatusLabel}
                getStatusColor={getStatusColor}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* MODAL ZA E-POŠTO (opomin) */}
      <Dialog open={emailModalOpen} onOpenChange={setEmailModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-blue-700">
              <Mail className="w-5 h-5 text-blue-600" />
              Pošlji {currentReminderNumber}. opomin za plačilo
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
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEmailModalOpen(false)}>
              <X className="w-4 h-4 mr-2" /> Prekliči
            </Button>
            <Button onClick={handleSendEmail} className="bg-blue-600">
              <Send className="w-4 h-4 mr-2" /> Pošlji opomin
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
              Pošlji {postReminderNumber}. opomin po pošti
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
                <Ban className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
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

      {/* MODAL ZA REVIZIJO */}
      <Dialog open={auditModalOpen} onOpenChange={setAuditModalOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader className="sticky top-0 bg-white pb-4 border-b">
            <DialogTitle className="flex items-center gap-2 text-gray-800">
              <History className="w-5 h-5 text-blue-600" />
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
                        <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                          <FileText className="w-5 h-5 text-green-600" />
                        </div>
                      )}
                      {log.action === 'edited' && (
                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                          <History className="w-5 h-5 text-blue-600" />
                        </div>
                      )}
                      {log.action === 'status_changed' && (
                        <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center">
                          <FileText className="w-5 h-5 text-yellow-600" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 bg-gray-50 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-sm font-semibold text-gray-900">{log.user}</span>
                        <span className="text-xs text-gray-500">{formatDate(log.timestamp)}</span>
                      </div>
                      <p className="text-sm text-gray-700">{log.details}</p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <History className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>Za ta račun ni zabeleženih sprememb.</p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button onClick={() => setAuditModalOpen(false)}>Zapri</Button>
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

      <InvoiceView 
        invoiceId={selectedInvoiceId} 
        open={!!selectedInvoiceId} 
        onClose={() => setSelectedInvoiceId(null)}
        onEdit={handleEditInvoice}
        onSendEmail={(invoice) => {
          const nextReminder = getNextReminderNumber(reminders[invoice.id] || [])
          openEmailModal(invoice, nextReminder)
        }}
        onSendPost={(invoice) => {
          const nextReminder = getNextReminderNumber(reminders[invoice.id] || [])
          openPostModal(invoice, nextReminder)
        }}
        onMarkAsPaid={(invoiceId) => {
          const invoice = invoices.find(inv => inv.id === invoiceId)
          if (invoice) openPaidModal(invoice)
        }}
        onCancel={openCancelModal}
        onAudit={openAuditModal}
        documentType="invoice" 
      />
    </div>
  )
}
// Tabela za zapadle račune
interface OverdueTableProps {
  invoices: any[]
  customers: any[]
  reminders: Record<string, Reminder[]>
  onInvoiceClick: (invoice: any) => void
  onSendEmail: (invoice: any, reminderNumber: number) => void
  onSendPost: (invoice: any, reminderNumber: number) => void
  getStatusLabel: (status: string) => string
  getStatusColor: (status: string) => string
}

function OverdueTable({ invoices, customers, reminders, onInvoiceClick, onSendEmail, onSendPost, getStatusLabel, getStatusColor }: OverdueTableProps) {
  const getReminderStatus = (invoice: any, reminders: Reminder[]) => {
    const sentReminders = reminders.map(r => r.reminderNumber)
    const daysLate = getDaysLate(invoice.dueDate)
    const remindersSentCount = sentReminders.length
    
    let needsReminder = false
    let nextReminderNumber = 0
    
    if (remindersSentCount < 3 && invoice.status === 'overdue') {
      if (remindersSentCount === 0 && daysLate >= 7) {
        needsReminder = true
        nextReminderNumber = 1
      } else if (remindersSentCount === 1 && daysLate >= 14) {
        needsReminder = true
        nextReminderNumber = 2
      } else if (remindersSentCount === 2 && daysLate >= 21) {
        needsReminder = true
        nextReminderNumber = 3
      }
    }
    
    return { 
      sentCount: remindersSentCount,
      needsReminder, 
      nextReminderNumber
    }
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="px-1 py-3 text-left w-[110px]">Številka</TableHead>
          <TableHead className="px-4 py-3 text-center">Datum izdaje</TableHead>
          <TableHead className="px-4 py-3 text-left w-[240px]">Kupec</TableHead>
          <TableHead className="px-4 py-3 text-right">Neto</TableHead>
          <TableHead className="px-4 py-3 text-right">DDV</TableHead>
          <TableHead className="px-4 py-3 text-right">Bruto</TableHead>
          <TableHead className="px-4 py-3 text-center w-[150px]">Status</TableHead>
          <TableHead className="px-4 py-3 text-center w-[140px]">Zapadlost</TableHead>
          <TableHead className="px-4 py-3 text-center w-[100px]">Opomini</TableHead>
          <TableHead className="px-4 py-3 text-center w-[150px]">Akcije</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {invoices.map(inv => {
          const invoiceReminders = reminders[inv.id] || []
          const reminderStatus = getReminderStatus(inv, invoiceReminders)
          const daysLate = getDaysLate(inv.dueDate)
          
          return (
            <TableRow 
              key={inv.id} 
              className="cursor-pointer hover:bg-gray-50 transition-colors"
              onClick={() => onInvoiceClick(inv)}
            >
              <TableCell className="px-2 py-2">
                <span>{inv.number}</span>
              </TableCell>
              <TableCell className="px-4 py-2 text-center">{formatDate(inv.issueDate)}</TableCell>
              <TableCell className="px-4 py-2">
                <div className="font-medium">{inv.customerName}</div>
                <div className="text-xs text-gray-500">{inv.customerTaxId}</div>
              </TableCell>
              <TableCell className="px-4 py-2 text-right">{formatCurrency(inv.totalNet)}</TableCell>
              <TableCell className="px-4 py-2 text-right">{formatCurrency(inv.totalVat)}</TableCell>
              <TableCell className="px-4 py-2 text-right font-semibold">{formatCurrency(inv.totalGross)}</TableCell>
              <TableCell className="px-4 py-2 text-center">
                <Badge className={getStatusColor(inv.status)}>
                  {getStatusLabel(inv.status)}
                </Badge>
              </TableCell>
              <TableCell className="px-4 py-2 text-center">
                {formatDate(inv.dueDate)}
                {inv.status === 'overdue' && daysLate > 0 && (
                  <div className="text-xs text-red-500">{daysLate} dni zamude</div>
                )}
              </TableCell>
              
              {/* Stolpec Opomini - samo številka, rdeč krog samo ko je potreben opomin */}
              <TableCell className="px-4 py-2 text-center" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-center">
                  {inv.status === 'overdue' ? (
                    <div className="relative">
                      {reminderStatus.needsReminder ? (
                        <div className="w-8 h-8 rounded-full bg-red-500 text-white flex items-center justify-center">
                          <span className="text-sm font-bold">{reminderStatus.sentCount}</span>
                        </div>
                      ) : (
                        <span className="text-sm font-medium text-gray-700">{reminderStatus.sentCount}</span>
                      )}
                      {reminderStatus.needsReminder && (
                        <div className="absolute inset-0 rounded-full border-2 border-red-600 animate-pulse" />
                      )}
                    </div>
                  ) : (
                    <span className="text-sm text-gray-400">—</span>
                  )}
                </div>
              </TableCell>
              
              {/* Stolpec Akcije - SAMO gumb "Več o računu" */}
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
        {invoices.length === 0 && (
          <TableRow>
            <TableCell colSpan={10} className="text-center text-gray-400 py-8">
              Ni zapadlih računov
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  )
}

export { OverdueInvoices as OverdueAlerts }