// src/components/invoice/EditInvoice.tsx
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useInvoices } from '@/hooks/useInvoices'
import { InvoiceItem, Customer, Invoice } from '@/types'
import { formatCurrency } from '@/lib/utils'
import { Plus, Trash2, Edit, Calendar, AlertCircle, ReceiptText, FileText, CheckCircle, X, Save } from 'lucide-react'
import DatePicker from 'react-datepicker'
import { sl } from 'date-fns/locale'
import 'react-datepicker/dist/react-datepicker.css'
import { CustomDateInput } from '@/components/ui/CustomDateInput'
import { CustomerSelector } from './CustomerSelector'
import { InvoiceItemModal } from './InvoiceItemModal'
import { InvoiceTotals } from './InvoiceTotals'
import { formatDateForStorage } from '@/lib/utils'
import { statusColors, statusLabels } from '@/data/mockData'

interface EditInvoiceProps {
  editingInvoice: Invoice | null
  onClose: () => void
  onSaved?: () => void
}

export function EditInvoice({ editingInvoice, onClose, onSaved }: EditInvoiceProps) {
  const { customers, updateInvoice, services } = useInvoices()
  const [modalOpen, setModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<InvoiceItem | null>(null)
  
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [items, setItems] = useState<InvoiceItem[]>([])
  const [issueDate, setIssueDate] = useState<Date | null>(null)
  const [serviceDateFrom, setServiceDateFrom] = useState<Date | null>(null)
  const [serviceDateTo, setServiceDateTo] = useState<Date | null>(null)
  const [dueDate, setDueDate] = useState<Date | null>(null)
  const [note, setNote] = useState('')
  const [dateError, setDateError] = useState('')

  const clearIssueDate = () => setIssueDate(null)
  const clearDueDate = () => setDueDate(null)
  const clearServiceDateFrom = () => setServiceDateFrom(null)
  const clearServiceDateTo = () => setServiceDateTo(null)

  // Določi trenutni tip računa
  const getCurrentInvoiceType = (): 'draft' | 'estimate' | 'invoice' => {
    if (!editingInvoice) return 'invoice'
    if (editingInvoice.status === 'draft') return 'draft'
    if (editingInvoice.number?.startsWith('PR')) return 'estimate'
    return 'invoice'
  }

  const currentType = getCurrentInvoiceType()

  useEffect(() => {
    if (serviceDateFrom && serviceDateTo && serviceDateTo < serviceDateFrom) {
      setDateError('Datum "do" ne more biti pred datumom "od"')
    } else {
      setDateError('')
    }
  }, [serviceDateFrom, serviceDateTo])

 useEffect(() => {
  if (editingInvoice) {
    const cust = customers.find(c => c.id === editingInvoice.customerId)
    setSelectedCustomer(cust || null)
    setItems(editingInvoice.items)
    
    // Fix: Only set dates if they are valid
    if (editingInvoice.issueDate && editingInvoice.issueDate !== 'null') {
      setIssueDate(new Date(editingInvoice.issueDate))
    } else {
      setIssueDate(null)
    }
    
    if (editingInvoice.serviceDateFrom && editingInvoice.serviceDateFrom !== 'null') {
      setServiceDateFrom(new Date(editingInvoice.serviceDateFrom))
    } else {
      setServiceDateFrom(null)
    }
    
    if (editingInvoice.serviceDateTo && editingInvoice.serviceDateTo !== 'null') {
      setServiceDateTo(new Date(editingInvoice.serviceDateTo))
    } else {
      setServiceDateTo(null)
    }
    
    if (editingInvoice.dueDate && editingInvoice.dueDate !== 'null') {
      setDueDate(new Date(editingInvoice.dueDate))
    } else {
      setDueDate(null)
    }
    
    setNote(editingInvoice.note || '')
    if (cust) setSearchTerm(cust.name)
  }
}, [editingInvoice, customers])

  // Preveri ali je obrazec veljaven za trenutni tip
  const isFormValid = () => {
    if (currentType === 'draft') {
      return selectedCustomer !== null && items.length > 0
    }
    if (currentType === 'estimate') {
      return selectedCustomer !== null && 
             items.length > 0 && 
             issueDate !== null && 
             serviceDateFrom !== null && 
             serviceDateTo !== null && 
             !dateError
    }
    return selectedCustomer !== null && 
           items.length > 0 && 
           issueDate !== null && 
           serviceDateFrom !== null && 
           serviceDateTo !== null && 
           dueDate !== null && 
           !dateError
  }

  // Pridobi sporočilo o manjkajočih podatkih
  const getValidationMessage = () => {
    if (currentType === 'draft') {
      const missing = []
      if (!selectedCustomer) missing.push('kupec')
      if (items.length === 0) missing.push('vsaj ena postavka')
      if (missing.length > 0) return `Manjkajo podatki: ${missing.join(' in ')}`
      return null
    }
    if (currentType === 'estimate') {
      const missing = []
      if (!selectedCustomer) missing.push('kupec')
      if (items.length === 0) missing.push('vsaj ena postavka')
      if (!issueDate) missing.push('datum izdaje')
      if (!serviceDateFrom) missing.push('datum storitve (od)')
      if (!serviceDateTo) missing.push('datum storitve (do)')
      if (dateError) missing.push(dateError)
      if (missing.length > 0) return `Manjkajo podatki: ${missing.join(', ')}`
      return null
    }
    const missing = []
    if (!selectedCustomer) missing.push('kupec')
    if (items.length === 0) missing.push('vsaj ena postavka')
    if (!issueDate) missing.push('datum izdaje')
    if (!serviceDateFrom) missing.push('datum storitve (od)')
    if (!serviceDateTo) missing.push('datum storitve (do)')
    if (!dueDate) missing.push('rok plačila')
    if (dateError) missing.push(dateError)
    if (missing.length > 0) return `Manjkajo podatki: ${missing.join(', ')}`
    return null
  }

  const calculateTotals = () => {
    const totalNet = items.reduce((sum, i) => sum + i.net, 0)
    const totalVat = items.reduce((sum, i) => sum + i.vatAmount, 0)
    const totalGross = items.reduce((sum, i) => sum + i.gross, 0)
    const vatBreakdown: Record<number, number> = { 22: 0, 9.5: 0, 5: 0, 0: 0 }
    items.forEach(item => { vatBreakdown[item.vatRate] += item.vatAmount })
    return { totalNet, totalVat, totalGross, vatBreakdown }
  }

  const totals = calculateTotals()

// Shrani spremembe
const handleSave = () => {
  if (!isFormValid()) {
    return
  }

  const hasReverseCharge = items.some(item => item.reverseCharge)
  const reverseChargeClause = hasReverseCharge ? '\n\nObrnjena davčna obveznost – DDV obračuna kupec.' : ''
  const selfBillingClause = selectedCustomer?.selfBilling ? '\n\nSamofakturiranje – račun izdal kupec v imenu in za račun dobavitelja.' : ''

  const updatedInvoice = {
    ...editingInvoice,
    customerId: selectedCustomer?.id || '',
    customerName: selectedCustomer?.name || '',
    customerTaxId: selectedCustomer?.taxId || '',
    issueDate: issueDate ? formatDateForStorage(issueDate) : '',
    serviceDateFrom: serviceDateFrom ? formatDateForStorage(serviceDateFrom) : '',
    serviceDateTo: serviceDateTo ? formatDateForStorage(serviceDateTo) : '',
    dueDate: dueDate ? formatDateForStorage(dueDate) : '',
    items,
    totalNet: totals.totalNet,
    totalVat: totals.totalVat,
    totalGross: totals.totalGross,
    vatBreakdown: totals.vatBreakdown,
    note: note + reverseChargeClause + selfBillingClause,
    updatedAt: new Date().toISOString(),
  }

  updateInvoice(editingInvoice!.id, updatedInvoice)
  // Odstranjen alert - tiho shranjevanje
  
  if (onSaved) onSaved()
  onClose() // Zapre edit modal in se vrne nazaj
}

// Pretvori predračun v račun
const handleConvertToInvoice = () => {
  if (!isFormValid()) {
    return
  }

  const newInvoiceNumber = `2026-${String(Math.floor(Math.random() * 1000)).padStart(4, '0')}`
  
  const convertedInvoice = {
    ...editingInvoice,
    number: newInvoiceNumber,
    status: 'issued' as const,
    updatedAt: new Date().toISOString(),
  }

  updateInvoice(editingInvoice!.id, convertedInvoice)
  // Odstranjen alert - tiho pretvarjanje
  
  if (onSaved) onSaved()
  onClose() // Zapre edit modal in se vrne nazaj
}

  const handleAddOrUpdateItem = (item: InvoiceItem) => {
    const processedItem = {
      ...item,
      vatExemptionReason: item.vatRate === 0 ? item.vatExemptionReason : undefined,
      reverseCharge: item.vatRate === 0 ? item.reverseCharge : false,
    }
    
    if (editingItem) {
      setItems(items.map(i => i.id === editingItem.id ? processedItem : i))
    } else {
      setItems([...items, processedItem])
    }
    setModalOpen(false)
    setEditingItem(null)
  }

  const editItem = (item: InvoiceItem) => {
    setEditingItem(item)
    setModalOpen(true)
  }

  const deleteItem = (id: string) => {
    setItems(items.filter(i => i.id !== id))
  }

  const validationMessage = getValidationMessage()
  const isValid = isFormValid()

  // Pridobi naslov glede na tip
  const getTitle = () => {
    return `Urejanje računa: ${editingInvoice?.number}`
  }

  // Pridobi barvo naslova glede na tip
  const getTitleColor = () => {
    if (currentType === 'draft') return 'text-gray-700'
    if (currentType === 'estimate') return 'text-blue-700'
    return 'text-gray-700'
  }

return (
<div className="space-y-6">
  {/* Header */}
  <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg p-4 border border-primary/20">
    <div className="flex items-center justify-between flex-wrap gap-4">
      {/* Left side - Invoice info */}
      <div className="flex items-center gap-3">
        <div className="bg-primary/20 rounded-lg p-2">
          <ReceiptText className="w-6 h-6 text-primary" />
        </div>
        <div>
          <div className="text-lg font-bold text-gray-900">
            Urejanje: {editingInvoice?.number || (currentType === 'draft' ? 'Nov osnutek' : currentType === 'estimate' ? 'Nov predračun' : 'Nov račun')}
          </div>
          <div className="text-sm text-gray-500">
            {editingInvoice?.customerName || 'Izberite kupca'}
          </div>
        </div>
      </div>
      
      {/* Right side - Status badge */}
      <div>
<span className={`px-4 py-2 rounded-lg font-medium text-base uppercase inline-block ${statusColors[editingInvoice?.status || 'draft']}`}>
  {currentType === 'draft' && 'OSNUTEK'}
  {currentType === 'estimate' && `${(statusLabels[editingInvoice?.status || 'draft'] || '').toUpperCase()} PREDRAČUN`}
  {currentType === 'invoice' && `${(statusLabels[editingInvoice?.status || 'draft'] || '').toUpperCase()} RAČUN`}
</span>
      </div>
    </div>
  </div>
      

      <Card>
        <CardHeader><CardTitle>Podatki o računu</CardTitle></CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <CustomerSelector
              selectedCustomer={selectedCustomer}
              setSelectedCustomer={setSelectedCustomer}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              isDropdownOpen={isDropdownOpen}
              setIsDropdownOpen={setIsDropdownOpen}
              customers={customers}
            />
            
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-1 block flex items-center gap-1">
                    <Calendar className="w-4 h-4" /> Datum izdaje *
                  </label>
                  <DatePicker
                    selected={issueDate}
                    onChange={(date: Date | null) => setIssueDate(date)}
                    dateFormat="dd. MM. yyyy"
                    locale={sl}
                    customInput={<CustomDateInput onClear={clearIssueDate} />}
                    isClearable={false}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block flex items-center gap-1">
                    <Calendar className="w-4 h-4" /> Rok plačila {currentType === 'invoice' ? '*' : ''}
                  </label>
                  <DatePicker
                    selected={dueDate}
                    onChange={(date: Date | null) => setDueDate(date)}
                    dateFormat="dd. MM. yyyy"
                    locale={sl}
                    customInput={<CustomDateInput onClear={clearDueDate} />}
                    isClearable={false}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Datum storitve od *</label>
                  <DatePicker
                    selected={serviceDateFrom}
                    onChange={(date: Date | null) => setServiceDateFrom(date)}
                    dateFormat="dd. MM. yyyy"
                    locale={sl}
                    customInput={<CustomDateInput onClear={clearServiceDateFrom} />}
                    isClearable={false}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Datum storitve do *</label>
                  <DatePicker
                    selected={serviceDateTo}
                    onChange={(date: Date | null) => setServiceDateTo(date)}
                    dateFormat="dd. MM. yyyy"
                    locale={sl}
                    customInput={<CustomDateInput onClear={clearServiceDateTo} />}
                    isClearable={false}
                  />
                  {dateError && (
                    <div className="text-xs text-red-500 mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {dateError}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t">
            <label className="text-sm font-medium mb-2 block flex items-center gap-1"><AlertCircle className="w-4 h-4" /> Opombe</label>
            <textarea 
              value={note} 
              onChange={e => setNote(e.target.value)} 
              placeholder="Sklic na naročilnico, dodatna pojasnila, način plačila..." 
              className="w-full min-h-[80px] px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-y" 
              rows={3} 
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex-row justify-between items-center">
          <CardTitle>Postavke računa</CardTitle>
          <Button size="sm" onClick={() => { setEditingItem(null); setModalOpen(true); }}>
            <Plus className="w-4 h-4 mr-1" /> Dodaj postavko
          </Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Storitev</TableHead>
                <TableHead className="text-right">Količina</TableHead>
                <TableHead>En.</TableHead>
                <TableHead className="text-right">Cena/enoto (€)</TableHead>
                <TableHead className="text-right">Popust %</TableHead>
                <TableHead className="text-right">Neto</TableHead>
                <TableHead className="text-right">DDV %</TableHead>
                <TableHead className="text-right">Znesek DDV</TableHead>
                <TableHead className="text-right">Bruto</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map(item => (
                <TableRow key={item.id}>
                  <TableCell>
                    <div className="font-medium">{item.description}</div>
                    {(item.parcelNumber || item.cadastralMunicipality) && (
                      <div className="text-xs text-gray-500 mt-1">
                        {[
                          item.parcelNumber && `št. parcele: ${item.parcelNumber}`,
                          item.cadastralMunicipality && `kat.občina: ${item.cadastralMunicipality}`
                        ].filter(Boolean).join(' | ')}
                      </div>
                    )}
                    {item.itemNote && <div className="text-xs text-gray-500 mt-1">{item.itemNote}</div>}
                    {item.vatRate === 0 && item.vatExemptionReason && (
                      <div className="text-xs text-gray-600 mt-1">{item.vatExemptionReason}</div>
                    )}
                  </TableCell>
                  <TableCell className="text-right">{item.quantity}</TableCell>
                  <TableCell>{item.unit}</TableCell>
                  <TableCell className="text-right">{formatCurrency(item.price)}</TableCell>
                  <TableCell className="text-right">{item.discountPercent || 0}%</TableCell>
                  <TableCell className="text-right font-medium">{formatCurrency(item.net)}</TableCell>
                  <TableCell className="text-right">{item.vatRate}%</TableCell>
                  <TableCell className="text-right">{formatCurrency(item.vatAmount)}</TableCell>
                  <TableCell className="text-right font-bold">{formatCurrency(item.gross)}</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button size="sm" variant="ghost" onClick={() => editItem(item)}><Edit className="w-4 h-4" /></Button>
                      <Button size="sm" variant="ghost" onClick={() => deleteItem(item.id)}><Trash2 className="w-4 h-4" /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {items.length === 0 && (
                <TableRow>
                  <TableCell colSpan={10} className="text-center text-gray-400">Ni postavk. Kliknite "Dodaj postavko".</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>

          <InvoiceTotals totals={totals} />
        </CardContent>
      </Card>

{/* Footer z gumbi */}
<div className="flex justify-between items-center">
  {validationMessage && (
    <div className="text-sm text-amber-600 flex items-center gap-2">
      <AlertCircle className="w-4 h-4" />
      {validationMessage}
    </div>
  )}
  <div className="flex gap-3 ml-auto">
    <Button variant="outline" onClick={onClose}>
      Prekliči
    </Button>
    
    {/* Za osnutek - shrani osnutek, ustvari predračun, izdaj račun */}
    {currentType === 'draft' && (
      <>
        <Button 
          onClick={handleSave} 
          disabled={!selectedCustomer || items.length === 0}
          variant="default"
        >
          <Save className="w-4 h-4 mr-2" /> Shrani osnutek
        </Button>
        <Button 
          onClick={() => {
            const newNumber = `PR-2026-${String(Math.floor(Math.random() * 1000)).padStart(4, '0')}`;
            const updatedInvoice = {
              ...editingInvoice,
              number: newNumber,
              status: 'draft' as const,
              issueDate: issueDate ? formatDateForStorage(issueDate) : '',
              serviceDateFrom: serviceDateFrom ? formatDateForStorage(serviceDateFrom) : '',
              serviceDateTo: serviceDateTo ? formatDateForStorage(serviceDateTo) : '',
              items,
              totalNet: totals.totalNet,
              totalVat: totals.totalVat,
              totalGross: totals.totalGross,
              vatBreakdown: totals.vatBreakdown,
              updatedAt: new Date().toISOString(),
            };
            updateInvoice(editingInvoice!.id, updatedInvoice);
            onClose();
          }} 
          disabled={!selectedCustomer || items.length === 0 || !issueDate || !serviceDateFrom || !serviceDateTo || !!dateError}
          variant="default"
        >
          <FileText className="w-4 h-4 mr-2" /> Ustvari predračun
        </Button>
        <Button 
          onClick={() => {
            const newNumber = `2026-${String(Math.floor(Math.random() * 1000)).padStart(4, '0')}`;
            const updatedInvoice = {
              ...editingInvoice,
              number: newNumber,
              status: 'issued' as const,
              issueDate: issueDate ? formatDateForStorage(issueDate) : '',
              serviceDateFrom: serviceDateFrom ? formatDateForStorage(serviceDateFrom) : '',
              serviceDateTo: serviceDateTo ? formatDateForStorage(serviceDateTo) : '',
              dueDate: dueDate ? formatDateForStorage(dueDate) : '',
              items,
              totalNet: totals.totalNet,
              totalVat: totals.totalVat,
              totalGross: totals.totalGross,
              vatBreakdown: totals.vatBreakdown,
              updatedAt: new Date().toISOString(),
            };
            updateInvoice(editingInvoice!.id, updatedInvoice);
            onClose();
          }} 
          disabled={!selectedCustomer || items.length === 0 || !issueDate || !serviceDateFrom || !serviceDateTo || !dueDate || !!dateError}
          variant="default"
        >
          <CheckCircle className="w-4 h-4 mr-2" /> Izdaj račun
        </Button>
      </>
    )}
    
    {/* Za predračun - shrani predračun in izdaj račun */}
    {currentType === 'estimate' && (
      <>
        <Button 
          onClick={handleSave} 
          disabled={!selectedCustomer || items.length === 0 || !issueDate || !serviceDateFrom || !serviceDateTo || !!dateError}
          variant="default"
        >
          <Save className="w-4 h-4 mr-2" /> Shrani predračun
        </Button>
        <Button 
          onClick={handleConvertToInvoice} 
          disabled={!selectedCustomer || items.length === 0 || !issueDate || !serviceDateFrom || !serviceDateTo || !dueDate || !!dateError}
          variant="default"
        >
          <CheckCircle className="w-4 h-4 mr-2" /> Izdaj račun
        </Button>
      </>
    )}
    
    {/* Za račun - samo shrani račun */}
    {currentType === 'invoice' && (
      <Button 
        onClick={handleSave} 
        disabled={!selectedCustomer || items.length === 0 || !issueDate || !serviceDateFrom || !serviceDateTo || !dueDate || !!dateError}
        variant="default"
      >
        <Save className="w-4 h-4 mr-2" /> Shrani račun
      </Button>
    )}
  </div>
</div>

      <InvoiceItemModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        editingItem={editingItem}
        onSave={handleAddOrUpdateItem}
        services={services}
      />
    </div>
  )
}