// src/components/invoice/NewInvoice.tsx
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useInvoices } from '@/hooks/useInvoices'
import { useSettings } from '@/hooks/useSettings'
import { InvoiceItem, Customer, Invoice } from '@/types'
import { formatCurrency } from '@/lib/utils'
import { Plus, Trash2, Edit, Calendar, AlertCircle, ReceiptText, FileText, CheckCircle, Building2, MapPin, Phone, Mail, Landmark } from 'lucide-react'
import DatePicker from 'react-datepicker'
import { sl } from 'date-fns/locale'
import 'react-datepicker/dist/react-datepicker.css'
import { CustomDateInput } from '@/components/ui/CustomDateInput'
import { CustomerSelector } from './CustomerSelector'
import { InvoiceItemModal } from './InvoiceItemModal'
import { InvoiceTotals } from './InvoiceTotals'
import { formatDateForStorage } from '@/lib/utils'

type InvoiceType = 'draft' | 'estimate' | 'invoice'

interface NewInvoiceProps {
  editingInvoice?: Invoice | null
  clearEditing?: () => void
}

// Funkcija za generiranje manjkajočih geodetskih podatkov
const enrichItemWithGeodeticData = (item: InvoiceItem): InvoiceItem => {
  const enrichedItem = { ...item }
  
  if (!enrichedItem.cadastreName && enrichedItem.parcelNumber) {
    enrichedItem.cadastreName = 'Kataster stavb'
  }
  
  if (!enrichedItem.landRegisterId && enrichedItem.parcelNumber && enrichedItem.cadastralMunicipality) {
    const koNumber = enrichedItem.cadastralMunicipality.split(' ')[0]
    enrichedItem.landRegisterId = `${koNumber} ${enrichedItem.parcelNumber}`
  }
  
  return enrichedItem
}

export function NewInvoice({ editingInvoice, clearEditing }: NewInvoiceProps) {
  const { customers, invoices, addInvoice, updateInvoice, services } = useInvoices()
  const { settings, loading } = useSettings()
  const [modalOpen, setModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<InvoiceItem | null>(null)
  const [invoiceType, setInvoiceType] = useState<InvoiceType>('draft')
  
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [items, setItems] = useState<InvoiceItem[]>([])
  const [issueDate, setIssueDate] = useState<Date | null>(new Date())
  const [serviceDateFrom, setServiceDateFrom] = useState<Date | null>(null)
  const [serviceDateTo, setServiceDateTo] = useState<Date | null>(null)
  const [dueDate, setDueDate] = useState<Date | null>(null)
  const [note, setNote] = useState('')
  const [dateError, setDateError] = useState('')
  const [previewNumber, setPreviewNumber] = useState<string>('OSNUTEK')

  const clearIssueDate = () => setIssueDate(null)
  const clearDueDate = () => setDueDate(null)
  const clearServiceDateFrom = () => setServiceDateFrom(null)
  const clearServiceDateTo = () => setServiceDateTo(null)

  // Funkcija za generiranje zaporedne številke
  const generatePreviewNumber = (type: InvoiceType): string => {
    const year = new Date().getFullYear()
    
    // Filtriramo račune glede na tip in leto
    let existingNumbers: string[] = []
    
    if (type === 'estimate') {
      // Predračuni: PR-2026-0001
      existingNumbers = invoices
        .filter(inv => inv.number?.startsWith(`PR-${year}`))
        .map(inv => inv.number || '')
        .filter(num => num !== '')
    } else if (type === 'invoice') {
      // Računi: 2026-0001
      existingNumbers = invoices
        .filter(inv => inv.number?.startsWith(`${year}-`))
        .map(inv => inv.number || '')
        .filter(num => num !== '')
    } else {
      return 'OSNUTEK'
    }

    // Če ni obstoječih številk, začnemo z 1
    if (existingNumbers.length === 0) {
      if (type === 'estimate') {
        return `PR-${year}-0001`
      } else if (type === 'invoice') {
        return `${year}-0001`
      }
    }

    // Poiščemo največjo številko
    let maxNumber = 0
    existingNumbers.forEach(num => {
      let numberPart = ''
      if (type === 'estimate') {
        // PR-2026-0001 -> izluščimo 0001
        const parts = num.split('-')
        numberPart = parts[parts.length - 1]
      } else if (type === 'invoice') {
        // 2026-0001 -> izluščimo 0001
        const parts = num.split('-')
        numberPart = parts[parts.length - 1]
      }
      
      const numValue = parseInt(numberPart, 10)
      if (!isNaN(numValue) && numValue > maxNumber) {
        maxNumber = numValue
      }
    })

    // Generiramo novo številko
    const nextNumber = maxNumber + 1
    const paddedNumber = String(nextNumber).padStart(4, '0')
    
    if (type === 'estimate') {
      return `PR-${year}-${paddedNumber}`
    } else if (type === 'invoice') {
      return `${year}-${paddedNumber}`
    }
    
    return 'OSNUTEK'
  }

  // Posodobi predvideno številko ko se spremeni invoiceType ali invoices
  useEffect(() => {
    if (!editingInvoice) {
      const newPreview = generatePreviewNumber(invoiceType)
      setPreviewNumber(newPreview)
    } else {
      setPreviewNumber(editingInvoice.number || '')
    }
  }, [invoiceType, invoices, editingInvoice])

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
      
      const enrichedItems = editingInvoice.items.map(item => enrichItemWithGeodeticData(item))
      setItems(enrichedItems)
      
      if (editingInvoice.issueDate) setIssueDate(new Date(editingInvoice.issueDate))
      if (editingInvoice.serviceDateFrom) setServiceDateFrom(new Date(editingInvoice.serviceDateFrom))
      if (editingInvoice.serviceDateTo) setServiceDateTo(new Date(editingInvoice.serviceDateTo))
      if (editingInvoice.dueDate) setDueDate(new Date(editingInvoice.dueDate))
      setNote(editingInvoice.note || '')
      if (cust) setSearchTerm(cust.name)
      if (editingInvoice.status === 'draft') setInvoiceType('draft')
      else if (editingInvoice.number?.startsWith('PR')) setInvoiceType('estimate')
      else setInvoiceType('invoice')
    }
  }, [editingInvoice, customers])

  const resetForm = () => {
    setSelectedCustomer(null)
    setSearchTerm('')
    setItems([])
    setNote('')
    setIssueDate(new Date())
    setServiceDateFrom(null)
    setServiceDateTo(null)
    setDueDate(null)
    setPreviewNumber(generatePreviewNumber(invoiceType))
  }

  const getRequiredFieldsMessage = () => {
    if (invoiceType === 'draft') {
      const missing = []
      if (!selectedCustomer) missing.push('kupec')
      if (items.length === 0) missing.push('vsaj ena postavka')
      if (missing.length > 0) return `Manjkajo podatki: ${missing.join(', ')}`
      return null
    }
    if (invoiceType === 'estimate') {
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
    if (invoiceType === 'invoice') {
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
    return null
  }

  const isFormValid = () => {
    if (invoiceType === 'draft') {
      return selectedCustomer !== null && items.length > 0
    }
    if (invoiceType === 'estimate') {
      return selectedCustomer !== null && 
             items.length > 0 && 
             issueDate !== null && 
             serviceDateFrom !== null && 
             serviceDateTo !== null && 
             !dateError
    }
    if (invoiceType === 'invoice') {
      return selectedCustomer !== null && 
             items.length > 0 && 
             issueDate !== null && 
             serviceDateFrom !== null && 
             serviceDateTo !== null && 
             dueDate !== null && 
             !dateError
    }
    return false
  }

  const getButtonText = () => {
    switch (invoiceType) {
      case 'draft': return 'Shrani osnutek'
      case 'estimate': return 'Ustvari predračun'
      case 'invoice': return 'Ustvari račun'
      default: return 'Shrani'
    }
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
  const validationMessage = getRequiredFieldsMessage()

  const saveInvoice = () => {
    if (validationMessage) {
      alert(validationMessage)
      return
    }

    const hasReverseCharge = items.some(item => item.reverseCharge)
    const reverseChargeClause = hasReverseCharge ? '\n\nObrnjena davčna obveznost – DDV obračuna kupec.' : ''
    const selfBillingClause = selectedCustomer?.selfBilling ? '\n\nSamofakturiranje – račun izdal kupec v imenu in za račun dobavitelja.' : ''

    let invoiceNumber = editingInvoice?.number || ''
    let status = 'draft'
    
    if (invoiceType === 'invoice') {
      invoiceNumber = editingInvoice?.number || previewNumber
      status = 'issued'
    } else if (invoiceType === 'estimate') {
      invoiceNumber = editingInvoice?.number || previewNumber
      status = 'draft'
    } else {
      invoiceNumber = editingInvoice?.number || 'OSNUTEK'
      status = 'draft'
    }

    const invoiceData = {
      id: editingInvoice?.id || crypto.randomUUID(),
      number: invoiceNumber,
      customerId: selectedCustomer?.id || '',
      customerName: selectedCustomer?.name || '',
      customerTaxId: selectedCustomer?.taxId || '',
      issueDate: issueDate ? formatDateForStorage(issueDate) : '',
      serviceDateFrom: serviceDateFrom ? formatDateForStorage(serviceDateFrom) : '',
      serviceDateTo: serviceDateTo ? formatDateForStorage(serviceDateTo) : '',
      dueDate: dueDate ? formatDateForStorage(dueDate) : '',
      paymentTermDays: 30,
      items,
      discountPercent: 0,
      totalNet: totals.totalNet,
      totalVat: totals.totalVat,
      totalGross: totals.totalGross,
      totalNetBeforeDiscount: totals.totalNet,
      totalItemDiscounts: 0,
      totalNetAfterItemDiscounts: totals.totalNet,
      invoiceDiscountAmount: 0,
      finalNetBase: totals.totalNet,
      vatBreakdown: totals.vatBreakdown,
      status: status as any,
      note: note + reverseChargeClause + selfBillingClause,
      createdAt: editingInvoice?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    if (editingInvoice) {
      updateInvoice(editingInvoice.id, invoiceData)
    } else {
      addInvoice(invoiceData)
    }

    if (!editingInvoice) resetForm()
    if (clearEditing) clearEditing()
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

  const isValid = isFormValid()

  // Če se podatki še nalagajo, prikažemo loading
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Nalaganje nastavitev...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Ustvari račun</h1>
      </div>

       {/* Invoice Type Selector s predvideno številko */}
      <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg p-4 border border-primary/20">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-primary/20 rounded-lg p-2"><ReceiptText className="w-6 h-6 text-primary" /></div>
            <div>
              <div className="text-md font-bold text-primary">
                {editingInvoice ? editingInvoice.number : (invoiceType === 'invoice' ? 'Ustvari račun' : invoiceType === 'estimate' ? 'Ustvari predračun' : 'Ustvari osnutek')}
              </div>
              {!editingInvoice && (
              <div className="text-xs text-gray-500">
                {invoiceType === 'invoice' && (
                  `Številka bo avtomatsko dodeljena ob shranjevanju (predvidena številka računa: ${previewNumber})`
                )}
                {invoiceType === 'estimate' && (
                  `Številka bo avtomatsko dodeljena ob shranjevanju (predvidena številka predračuna: ${previewNumber})`
                )}
                {invoiceType === 'draft' && (
                  'Številka bo dodeljena ob shranjevanju'
                )}
              </div>
            )}
            </div>
          </div>
          <div className="flex gap-2 bg-white rounded-lg p-1 border">
            <button
              onClick={() => setInvoiceType('draft')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${invoiceType === 'draft' ? 'bg-gray-200 text-gray-800' : 'text-gray-500 hover:bg-gray-100'}`}
            >
              <FileText className="w-4 h-4" /> Osnutek
            </button>
            <button
              onClick={() => setInvoiceType('estimate')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${invoiceType === 'estimate' ? 'bg-blue-100 text-blue-700' : 'text-gray-500 hover:bg-gray-100'}`}
            >
              <FileText className="w-4 h-4" /> Predračun
            </button>
            <button
              onClick={() => setInvoiceType('invoice')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${invoiceType === 'invoice' ? 'bg-blue-100 text-blue-700' : 'text-gray-500 hover:bg-gray-100'}`}
            >
              <CheckCircle className="w-4 h-4" /> Ustvari račun
            </button>
          </div>
        </div>
      </div>

      {/* Podatki podjetja */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2 font-bold text-lg text-gray-800">
                <Building2 className="w-5 h-5 text-blue-600" />
                {settings.companyName || 'Ime podjetja'}
              </div>
              <div className="text-sm text-gray-600 space-y-1">
                <div className="flex items-start gap-1">
                  <MapPin className="w-3.5 h-3.5 text-gray-400 mt-0.5" />
                  <span>{settings.companyAddress || 'Naslov podjetja'}</span>
                </div>
                <div className="pl-5">
                  <span className="font-medium">ID za DDV:</span>{' '}
                  {settings.isVatPayer ? settings.taxId : 'NI DAVČNI ZAVEZANEC'}
                </div>
                <div className="pl-5">
                  <span className="font-medium">Matična številka:</span>{' '}
                  {settings.registrationNumber || 'NI VNOSA'}
                </div>
              </div>
            </div>

            <div className="space-y-2 text-sm text-gray-600">
              {settings.phone && (
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-gray-400" />
                  <span>{settings.phone}</span>
                </div>
              )}
              {settings.email && (
                <div className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-gray-400" />
                  <span>{settings.email}</span>
                </div>
              )}
              {(settings.trr || settings.bic) && (
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <div className="flex items-center gap-2 font-medium text-xs text-gray-500 mb-1">
                    <Landmark className="w-3.5 h-3.5" />
                    <span>BANČNI RAČUN</span>
                  </div>
                  {settings.trr && (
                    <div className="font-mono text-xs pl-5">{settings.trr}</div>
                  )}
                  {settings.bic && (
                    <div className="font-mono text-xs text-gray-500 pl-5">{settings.bic}</div>
                  )}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

     

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
                    <Calendar className="w-4 h-4" /> Datum izdaje {invoiceType !== 'draft' && '*'}
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
                    <Calendar className="w-4 h-4" /> Rok plačila {invoiceType === 'invoice' ? '*' : ''}
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
                  <label className="text-sm font-medium mb-1 block">Datum storitve od {invoiceType !== 'draft' && '*'}</label>
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
                  <label className="text-sm font-medium mb-1 block">Datum storitve do {invoiceType !== 'draft' && '*'}</label>
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
            <label className="text-sm font-medium mb-2 block flex items-center gap-1"> Opombe</label>
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
                <TableHead>Naziv</TableHead>
                <TableHead className="text-right">Količina</TableHead>
                <TableHead className="text-right">Enota merjenja</TableHead>
                <TableHead className="text-right">Cena (€)</TableHead>
                <TableHead className="text-right">Popust %</TableHead>
                <TableHead className="text-right">Znesek brez DDV</TableHead>
                <TableHead className="text-right">DDV %</TableHead>
                <TableHead className="text-right">Znesek DDV</TableHead>
                <TableHead className="text-right">Znesek z DDV</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map(item => (
                <TableRow key={item.id}>
<TableCell>
  <div className="font-medium">{item.description}</div>
  
  {/* 1. VRSTICA: Geodetski podatki - ločeni z vejico */}
  {(item.parcelNumber || item.cadastralMunicipality || item.cadastreName || item.landRegisterId) && (
    <div className="text-xs text-gray-500 mt-1">
      {[
        item.parcelNumber && `št. parcele: ${item.parcelNumber}`,
        item.cadastralMunicipality && `kat. občina: ${item.cadastralMunicipality}`,
        item.cadastreName && `ime katastra: ${item.cadastreName}`,
        item.landRegisterId && `ID zaznambe: ${item.landRegisterId}`
      ].filter(Boolean).join(', ')}
    </div>
  )}
  
  {/* 2. VRSTICA: Opomba (itemNote) */}
  {item.itemNote && (
    <div className="text-xs text-gray-500 mt-1">{item.itemNote}</div>
  )}
  
  {/* 3. VRSTICA: Davčna oprostitev */}
  {item.vatRate === 0 && item.vatExemptionReason && (
    <div className="text-xs text-gray-500 mt-1">{item.vatExemptionReason}</div>
  )}
</TableCell>
                  <TableCell className="text-right">{item.quantity}</TableCell>
                  <TableCell className="text-right">{item.unit}</TableCell>
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

      <div className="flex justify-between items-center">
        {validationMessage && (
          <div className="text-sm text-blue-600 flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            {validationMessage}
          </div>
        )}
        <Button 
          onClick={saveInvoice} 
          className="min-w-[200px] ml-auto"
          disabled={!isValid}
        >
          {getButtonText()}
        </Button>
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