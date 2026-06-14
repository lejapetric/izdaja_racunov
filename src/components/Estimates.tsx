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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Send, Ban, History, Package, Mail, X, FileText, AlertTriangle } from 'lucide-react'
import { EditInvoice } from './invoice/EditInvoice'
import { mockAuditLogs } from '@/data/mockData'
import {Badge} from '@/components/ui/badge'


// Status opcije samo za predračune - brez osnutek in storniran
const estimateStatusOptions: { value: InvoiceStatus | 'all' | 'converted'; label: string }[] = [
  { value: 'all', label: 'Vsi' },
  { value: 'issued', label: 'Izdani' },
  { value: 'sent', label: 'Poslani' },
  { value: 'overdue', label: 'Potečeni' },
  { value: 'converted', label: 'Spremenjeni v račun' },
]

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
  
  // Convert to invoice modal (za združljivost)
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
  const [selectedStatus, setSelectedStatus] = useState<InvoiceStatus | 'all' | 'converted'>('all')
  const [activeTab, setActiveTab] = useState('all')

  // Pridobi samo predračune (tiste s številko, ki se začne s PR)
  // Izključimo tiste s statusom 'draft' (osnutek) in 'cancelled' (storniran)
  const estimates = invoices.filter(inv => inv.number?.startsWith('PR') && inv.status !== 'draft' && inv.status !== 'cancelled')

  // Unique podatki za filtre
  const uniqueNumbers = Array.from(new Map(estimates.map(inv => [inv.number, inv.number])).entries()).map(([number]) => ({ number })).filter(item => item.number.toLowerCase().includes(searchNumber.toLowerCase()))
  const uniqueCustomers = Array.from(new Map(estimates.map(inv => [inv.customerId, { id: inv.customerId, name: inv.customerName, taxId: inv.customerTaxId }])).entries()).map(([_, customer]) => customer).filter(c => c.name.toLowerCase().includes(searchCustomer.toLowerCase()) || c.taxId.toLowerCase().includes(searchCustomer.toLowerCase()))
  const uniqueMunicipalities = Array.from(new Set(estimates.map(inv => { const customer = customers.find(c => c.id === inv.customerId); const address = customer?.address || ''; const parts = address.split(','); return parts.length > 1 ? parts[parts.length - 1].trim() : address.trim(); }))).filter(m => m.toLowerCase().includes(searchMunicipality.toLowerCase()))

  const filterInvoices = (statusFilter?: string) => estimates.filter(inv => {
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
    if (selectedStatus !== 'all' && selectedStatus !== 'converted') {
      if (inv.status !== selectedStatus) return false
    }
    if (selectedStatus === 'converted') {
      if (inv.status !== 'paid') return false
    }
    if (statusFilter) {
      if (statusFilter === 'converted') {
        if (inv.status !== 'paid') return false
      } else if (inv.status !== statusFilter) return false
    }
    return true
  })

  const filteredAll = filterInvoices()
  const filteredIssued = filterInvoices('issued')
  const filteredSent = filterInvoices('sent')
  const filteredConverted = filterInvoices('converted')
  const filteredExpired = filterInvoices('overdue')

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
  
  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'issued': return 'Izdan'
      case 'sent': return 'Poslan'
      case 'overdue': return 'Potečen'
      case 'paid': return 'Spremenjen v račun'
      case 'cancelled': return 'Storniran'
      default: return status
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'issued': return 'bg-blue-100 text-blue-800'
      case 'sent': return 'bg-green-100 text-green-800'
      case 'overdue': return 'bg-red-100 text-red-800'
      case 'paid': return 'bg-purple-100 text-purple-800'
      case 'cancelled': return 'bg-gray-100 text-gray-800'
      default: return 'bg-yellow-100 text-yellow-800'
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold">Predračuni</h1>
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
            uniqueNumbers={uniqueNumbers} uniqueCustomers={uniqueCustomers} uniqueMunicipalities={uniqueMunicipalities} statusOptions={estimateStatusOptions as any}
            clearAllFilters={clearAllFilters}
          />
          
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="all">Vsi ({filteredAll.length})</TabsTrigger>
              <TabsTrigger value="issued">Izdani ({filteredIssued.length})</TabsTrigger>
              <TabsTrigger value="sent">Poslani ({filteredSent.length})</TabsTrigger>
              <TabsTrigger value="converted">Spremenjeni v račun ({filteredConverted.length})</TabsTrigger>
              <TabsTrigger value="expired">Potečeni ({filteredExpired.length})</TabsTrigger>
            </TabsList>
            
            <TabsContent value="all">
              <EstimatesTable 
                estimates={filteredAll}
                customers={customers}
                onEstimateClick={handleInvoiceClick}
                getStatusLabel={getStatusLabel}
                getStatusColor={getStatusColor}
              />
            </TabsContent>
            <TabsContent value="issued">
              <EstimatesTable 
                estimates={filteredIssued}
                customers={customers}
                onEstimateClick={handleInvoiceClick}
                getStatusLabel={getStatusLabel}
                getStatusColor={getStatusColor}
              />
            </TabsContent>
            <TabsContent value="sent">
              <EstimatesTable 
                estimates={filteredSent}
                customers={customers}
                onEstimateClick={handleInvoiceClick}
                getStatusLabel={getStatusLabel}
                getStatusColor={getStatusColor}
              />
            </TabsContent>
            <TabsContent value="converted">
              <EstimatesTable 
                estimates={filteredConverted}
                customers={customers}
                onEstimateClick={handleInvoiceClick}
                getStatusLabel={getStatusLabel}
                getStatusColor={getStatusColor}
              />
            </TabsContent>
            <TabsContent value="expired">
              <EstimatesTable 
                estimates={filteredExpired}
                customers={customers}
                onEstimateClick={handleInvoiceClick}
                getStatusLabel={getStatusLabel}
                getStatusColor={getStatusColor}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-4 pb-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-blue-500 mt-0.5" />
            <div className="text-sm text-blue-700">
              <p className="font-medium">Informacije o predračunih</p>
              <p className="text-xs mt-1">Predračun nima pravne veljave. Ko ustvarite račun iz predračuna, se predračun označi kot "Spremenjen v račun" in ga ni več mogoče ponovno uporabiti. Predračuni so veljavni 30 dni.</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* MODAL ZA E-POŠTO */}
      <Dialog open={emailModalOpen} onOpenChange={setEmailModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-blue-700">
              <Mail className="w-5 h-5 text-blue-600" />
              Pošlji predračun po e-pošti
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
                rows={10} 
                className="font-normal text-sm border-gray-200 focus:border-blue-400 focus:ring-blue-400"
              />
            </div>
            
            <div className="mt-2 px-3 py-1.5 bg-gray-50 rounded border border-gray-200 inline-block">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-gray-600" />
                <span className="text-sm text-gray-700">
                  Priponka: <span className="font-medium">{emailInvoice?.number || 'predracun'}.pdf</span>
                </span>
              </div>
            </div>
          </div>
          
          <DialogFooter className="gap-2 pt-4">
            <Button variant="outline" onClick={() => {
              setEmailModalOpen(false)
              setEmailInvoice(null)
            }}>
              <X className="w-4 h-4 mr-2" /> Prekliči
            </Button>
            <Button onClick={handleSendEmail} className="bg-blue-600 hover:bg-blue-700">
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
              Pošlji predračun po navadni pošti
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm font-medium text-blue-800">Predračun: {postInvoice?.number}</p>
              <p className="text-sm text-blue-600">Kupec: {postInvoice?.customerName}</p>
              <p className="text-sm text-blue-600">Znesek: {postInvoice && formatCurrency(postInvoice.totalGross)}</p>
            </div>
            
            <div>
              <label className="text-sm font-medium block mb-1 text-gray-700">Naslov za pošiljanje *</label>
              <textarea 
                value={postAddress} 
                onChange={(e) => setPostAddress(e.target.value)} 
                className="w-full min-h-[100px] px-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                placeholder="Ime in priimek / podjetje&#10;Ulica in hišna številka&#10;Poštna številka in kraj"
              />
              <p className="text-xs text-gray-500 mt-1">Preverite naslov pred pošiljanjem</p>
            </div>
            
            <div>
              <label className="text-sm font-medium block mb-1 text-gray-700">Opomba (neobvezno)</label>
              <Input 
                value={postNote} 
                onChange={(e) => setPostNote(e.target.value)} 
                placeholder="Npr. priporočeno, s povratnico, dostava na dom..."
                className="border-gray-200 focus:border-blue-400 focus:ring-blue-400"
              />
            </div>
            
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-sm">
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-gray-600 flex-shrink-0 mt-0.5" />
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
            }}>
              <X className="w-4 h-4 mr-2" /> Prekliči
            </Button>
            <Button onClick={handleSendPost} className="bg-blue-600 hover:bg-blue-700">
              <Package className="w-4 h-4 mr-2" /> Potrdi pošiljanje
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
            <DialogTitle className="flex items-center gap-2 text-green-700">
              <FileText className="w-5 h-5 text-green-600" />
              Ustvari račun iz predračuna
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <div className="bg-yellow-50 border border-yellow-200 rounded p-4 mb-4">
              <p className="text-sm text-yellow-800">
                S tem dejanjem boste iz predračuna <span className="font-semibold">{convertInvoice?.number}</span>
                ustvarili račun. Predračun bo označen kot "Spremenjen v račun".
              </p>
            </div>
            <p className="text-sm text-gray-600">Ste prepričani, da želite to narediti?</p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setConvertModalOpen(false)
              if (convertInvoice) {
                setTimeout(() => {
                  setSelectedInvoiceId(convertInvoice.id)
                }, 50)
              }
            }}>Prekliči</Button>
            <Button onClick={() => {
              handleConvertToInvoice()
              setConvertModalOpen(false)
              setConvertInvoice(null)
            }} className="bg-green-600">
              <FileText className="w-4 h-4 mr-2" /> Ustvari račun
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
              Storniraj predračun
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div className="bg-red-50 border border-red-200 rounded-lg p-5">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-base font-semibold text-red-800">OPOZORILO!</p>
                  <p className="text-sm text-red-700 mt-2 leading-relaxed">
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
                <label className="text-sm font-medium block mb-2 text-gray-700">Številka predračuna</label>
                <Input 
                  value={cancelInvoice?.number || ''} 
                  disabled 
                  className="bg-gray-50 border-gray-200 text-base"
                />
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
                  className="border-red-200 focus:border-red-400 focus:ring-red-400 resize-none"
                />
                <p className="text-xs text-gray-500 mt-2">
                  Razlog bo zabeležen v dnevniku sprememb predračuna in viden v zgodovini.
                </p>
              </div>
            </div>
          </div>
          <DialogFooter className="gap-3 pt-4">
            <Button 
              variant="outline" 
              onClick={() => setCancelModalOpen(false)}
              className="px-6"
            >
              <X className="w-4 h-4 mr-2" /> Prekliči
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleCancelInvoice} 
              disabled={!cancelReason.trim()}
              className="px-6"
            >
              <Ban className="w-4 h-4 mr-2" /> Storniraj predračun
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* MODAL ZA REVIZIJO/SPREMEMBE */}
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
                          <Badge className="w-5 h-5 text-yellow-600" />
                        </div>
                      )}
                      {!['created', 'edited', 'status_changed'].includes(log.action) && (
                        <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                          <History className="w-5 h-5 text-gray-600" />
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-1 bg-gray-50 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-gray-900">{log.user}</span>
                          <span className="text-xs text-gray-500">{formatDate(log.timestamp)}</span>
                        </div>
                        <div className="px-2 py-1 rounded-md text-xs font-medium uppercase bg-gray-200 text-gray-700">
                          {log.action === 'created' && 'Ustvarjeno'}
                          {log.action === 'edited' && 'Posodobljeno'}
                          {log.action === 'status_changed' && 'Status spremenjen'}
                          {!['created', 'edited', 'status_changed'].includes(log.action) && log.action}
                        </div>
                      </div>
                      
                      <p className="text-sm text-gray-700 leading-relaxed">{log.details}</p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <History className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>Za ta predračun ni zabeleženih sprememb.</p>
              </div>
            )}
          </div>
          
          <DialogFooter className="sticky bottom-0 bg-white pt-4 border-t">
            <Button onClick={() => setAuditModalOpen(false)} className="bg-blue-600 hover:bg-blue-700">
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
                <h2 className="text-xl font-bold">Uredi predračun</h2>
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

// Tabela za predračune
interface EstimatesTableProps {
  estimates: any[]
  customers: any[]
  onEstimateClick: (estimate: any) => void
  getStatusLabel: (status: string) => string
  getStatusColor: (status: string) => string
}

function EstimatesTable({ estimates, customers, onEstimateClick, getStatusLabel, getStatusColor }: EstimatesTableProps) {
  const getDaysUntilExpiry = (dueDate: string) => {
    const today = new Date()
    const expiry = new Date(dueDate)
    const diffTime = expiry.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="px-1 py-3 text-left w-[110px]">Številka</TableHead>
          <TableHead className="px-4 py-3 text-center">Datum</TableHead>
          <TableHead className="px-4 py-3 text-left w-[240px]">Kupec</TableHead>
          <TableHead className="px-4 py-3 text-left">Občina</TableHead>
          <TableHead className="px-4 py-3 text-right">Neto</TableHead>
          <TableHead className="px-4 py-3 text-right">DDV</TableHead>
          <TableHead className="px-4 py-3 text-right">Bruto</TableHead>
          <TableHead className="px-4 py-3 text-center w-[90px]">Popust</TableHead>
          <TableHead className="px-4 py-3 text-center w-[120px]">Status</TableHead>
          <TableHead className="px-4 py-3 text-center w-[140px]">Velja do</TableHead>
          <TableHead className="px-4 py-3 text-center w-[150px]"></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {estimates.map(est => {
          const customer = customers.find(c => c.id === est.customerId)
          const address = customer?.address || ''
          const parts = address.split(',')
          const municipality = parts.length > 1 ? parts[parts.length - 1].trim() : address.trim()
          const daysUntilExpiry = getDaysUntilExpiry(est.dueDate)
          const isExpired = daysUntilExpiry < 0
          
          return (
            <TableRow 
              key={est.id} 
              className={`${isExpired ? 'bg-red-50' : ''} cursor-pointer hover:bg-gray-50 transition-colors`}
              onClick={() => onEstimateClick(est)}
            >
              <TableCell className="px-2 py-2 font-left">{est.number}</TableCell>
              <TableCell className="px-4 py-2 text-center">{formatDate(est.issueDate)}</TableCell>
              <TableCell className="px-4 py-2">
                <div className="font-medium">{est.customerName}</div>
                <div className="text-xs text-gray-500">{est.customerTaxId}</div>
              </TableCell>
              <TableCell className="px-4 py-2">{municipality}</TableCell>
              <TableCell className="px-4 py-2 text-right">{formatCurrency(est.totalNet)}</TableCell>
              <TableCell className="px-4 py-2 text-right">{formatCurrency(est.totalVat)}</TableCell>
              <TableCell className="px-4 py-2 text-right font-semibold">{formatCurrency(est.totalGross)}</TableCell>
              <TableCell className="px-4 py-2 text-center">{(est.discountPercent ?? 0)}%</TableCell>
             <TableCell className="px-4 py-2 text-center">
  {est.status ? (
    <Badge className={getStatusColor(est.status)}>
      {getStatusLabel(est.status)}
    </Badge>
  ) : (
    <Badge className="bg-gray-100 text-gray-800">
      Izdan
    </Badge>
  )}
</TableCell>
              <TableCell className="px-4 py-2 text-center">
                {est.dueDate ? formatDate(est.dueDate) : '-'}
                {!isExpired && daysUntilExpiry <= 7 && daysUntilExpiry > 0 && est.dueDate && (
                  <div className="text-xs text-orange-500">Poteče čez {daysUntilExpiry} dni</div>
                )}
                {isExpired && est.dueDate && <div className="text-xs text-red-500">POTEČEN</div>}
              </TableCell>
              <TableCell className="px-4 py-2 text-center" onClick={(e) => e.stopPropagation()}>
                <Button 
                  size="sm" 
                  variant="outline"
                  className="text-xs h-7 px-2"
                  onClick={() => onEstimateClick(est)}
                >
                   Več o računu
                </Button>
              </TableCell>
            </TableRow>
          )
        })}
        {estimates.length === 0 && (
          <TableRow>
            <TableCell colSpan={11} className="text-center text-gray-400 py-8">
              Ni predračunov
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  )
}