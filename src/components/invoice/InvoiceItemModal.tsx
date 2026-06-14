// src/components/invoice/InvoiceItemModal.tsx
import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { InvoiceItem, VatRate, ServiceItem } from '@/types'
import { formatCurrency } from '@/lib/utils'
import { AlertCircle } from 'lucide-react'
import { NumberInput } from '@/components/ui/NumberInput'

interface InvoiceItemModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  editingItem: InvoiceItem | null
  onSave: (item: InvoiceItem) => void
  services: ServiceItem[]
}

const calculateItemTotals = (item: Partial<InvoiceItem>) => {
  const qty = item.quantity && item.quantity > 0 ? item.quantity : 0
  const price = item.price || 0
  const discountPercent = item.discountPercent || 0
  const netBeforeDiscount = qty * price
  const discountAmount = netBeforeDiscount * discountPercent / 100
  const net = netBeforeDiscount - discountAmount
  const vatAmount = net * (item.vatRate || 0) / 100
  const gross = net + vatAmount
  return { netBeforeDiscount, discountAmount, net, vatAmount, gross }
}

export function InvoiceItemModal({ open, onOpenChange, editingItem, onSave, services }: InvoiceItemModalProps) {
  const [selectedServiceId, setSelectedServiceId] = useState<string>('')
  const [newItem, setNewItem] = useState<Partial<InvoiceItem>>({
    description: '', quantity: 1, unit: 'ura', price: 0, vatRate: 22, discountPercent: 0,
    parcelNumber: '', cadastralMunicipality: '', cadastreName: '', landRegisterId: '',
    reverseCharge: false, vatExemptionReason: '', itemNote: '',
  })

  useEffect(() => {
    if (editingItem) {
      setNewItem({ ...editingItem })
      const service = services.find(s => s.name === editingItem.description)
      if (service) setSelectedServiceId(service.id)
    } else {
      resetForm()
    }
  }, [editingItem, open])

  const resetForm = () => {
    setNewItem({
      description: '', quantity: 1, unit: 'ura', price: 0, vatRate: 22, discountPercent: 0,
      parcelNumber: '', cadastralMunicipality: '', cadastreName: '', landRegisterId: '',
      reverseCharge: false, vatExemptionReason: '', itemNote: '',
    })
    setSelectedServiceId('')
  }

  const handleServiceChange = (serviceId: string) => {
    const service = services.find(s => s.id === serviceId)
    if (service) {
      setSelectedServiceId(serviceId)
      setNewItem({
        ...newItem,
        description: service.name,
        price: service.price,
        unit: service.unit,
        vatRate: service.vatRate,
        quantity: 1,
      })
    }
  }

  const handleSave = () => {
    const quantity = newItem.quantity || 0
    if (!newItem.description || quantity <= 0 || !newItem.price) return
    if (newItem.vatRate === 0 && !newItem.vatExemptionReason) return

    const { netBeforeDiscount, discountAmount, net, vatAmount, gross } = calculateItemTotals(newItem)

    const fullItem: InvoiceItem = {
      id: editingItem?.id || crypto.randomUUID(),
      description: newItem.description,
      quantity: quantity,
      unit: newItem.unit || 'ura',
      price: newItem.price,
      discountPercent: newItem.discountPercent || 0,
      discountAmount,
      netBeforeDiscount,
      net,
      vatRate: newItem.vatRate as VatRate,
      vatAmount,
      gross,
      parcelNumber: newItem.parcelNumber,
      cadastralMunicipality: newItem.cadastralMunicipality,
      cadastreName: newItem.cadastreName,
      landRegisterId: newItem.landRegisterId,
      reverseCharge: newItem.reverseCharge || false,
      vatExemptionReason: newItem.vatExemptionReason,
      itemNote: newItem.itemNote,
    }
    onSave(fullItem)
    resetForm()
  }

  const { netBeforeDiscount, discountAmount, net, vatAmount, gross } = calculateItemTotals(newItem)
  const isQuantityValid = newItem.quantity !== undefined && newItem.quantity !== null && newItem.quantity > 0

  return (
    <Dialog open={open} onOpenChange={(val) => { if (!val) onOpenChange(val); resetForm() }}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle>{editingItem ? 'Uredi postavko' : 'Nova postavka'}</DialogTitle></DialogHeader>

        <div className="grid grid-cols-2 gap-4 py-4">
          <div className="col-span-2">
            <label className="text-sm font-medium mb-1 block">Izberi storitev *</label>
            <Select value={selectedServiceId} onValueChange={handleServiceChange}>
              <SelectTrigger><SelectValue placeholder="Izberite storitev iz seznama" /></SelectTrigger>
              <SelectContent>
                {services.map(service => (
                  <SelectItem key={service.id} value={service.id}>
                    {service.name} - {formatCurrency(service.price)} / {service.unit} ({service.vatRate}% DDV)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium mb-1 block">Količina *</label>
            <NumberInput 
              value={newItem.quantity !== undefined && newItem.quantity !== null ? newItem.quantity : 0} 
              onChange={(val) => setNewItem({ ...newItem, quantity: val === null ? 0 : val })} 
              min={0} 
              max={1000} 
              step={0.5} 
            />
            {!isQuantityValid && (
              <div className="text-xs text-red-500 mt-1">Količina mora biti večja od 0</div>
            )}
          </div>

          <div><label className="text-sm font-medium mb-1 block">Merska enota *</label>
            <Select value={newItem.unit} onValueChange={(val) => setNewItem({ ...newItem, unit: val })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent><SelectItem value="ura">ura</SelectItem><SelectItem value="kos">kos</SelectItem><SelectItem value="dan">dan</SelectItem><SelectItem value="m²">m²</SelectItem><SelectItem value="kom">kom</SelectItem></SelectContent>
            </Select>
          </div>

          <div><label className="text-sm font-medium mb-1 block">Cena na enoto (brez DDV) *</label>
            <Input type="number" step="5" min="0" value={newItem.price} onChange={(e) => setNewItem({ ...newItem, price: parseFloat(e.target.value) || 0 })} className="bg-gray-100" readOnly />
            <div className="text-xs text-gray-400 mt-1">Cena je določena s storitvijo</div>
          </div>

          <div><label className="text-sm font-medium mb-1 block">Stopnja DDV *</label>
            <Select value={String(newItem.vatRate)} onValueChange={(val) => setNewItem({ ...newItem, vatRate: parseFloat(val) as VatRate })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent><SelectItem value="22">22%</SelectItem><SelectItem value="9.5">9,5%</SelectItem><SelectItem value="5">5%</SelectItem><SelectItem value="0">0% (oprostitev DDV)</SelectItem></SelectContent>
            </Select>
          </div>

          <div className="col-span-2 border-t pt-3">
            <div className="font-medium mb-2 text-sm">Popust na postavko</div>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="text-sm font-medium mb-1 block">Popust (%)</label>
                <NumberInput value={newItem.discountPercent || 0} onChange={(val) => setNewItem({ ...newItem, discountPercent: val })} min={0} max={100} step={1} />
              </div>
              <div><label className="text-sm font-medium mb-1 block">Znesek popusta (€)</label>
                <Input type="text" disabled value={formatCurrency(discountAmount)} className="bg-gray-100" />
              </div>
            </div>
          </div>

          {newItem.vatRate === 0 && (
            <div className="col-span-2">
              <label className="text-sm font-medium mb-1 block">Zakonska podlaga za oprostitev DDV *</label>
              <Select value={newItem.vatExemptionReason || ''} onValueChange={(val) => setNewItem({ ...newItem, vatExemptionReason: val })}>
                <SelectTrigger><SelectValue placeholder="Izberite zakonsko podlago" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="91. člen ZDDV-1 – oprostitev pri izvozu">91. člen ZDDV-1 – oprostitev pri izvozu</SelectItem>
                  <SelectItem value="92. člen ZDDV-1 – oprostitev pri uvozu">92. člen ZDDV-1 – oprostitev pri uvozu</SelectItem>
                  <SelectItem value="94. člen ZDDV-1 – mednarodni prevoz">94. člen ZDDV-1 – mednarodni prevoz</SelectItem>
                  <SelectItem value="96. člen ZDDV-1 – nepremičnine">96. člen ZDDV-1 – nepremičnine</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="col-span-2 bg-gray-50 p-3 rounded-md">
            <div className="grid grid-cols-4 gap-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Neto pred popustom</label>
                <div className="text-md font-semibold">{formatCurrency(netBeforeDiscount)}</div>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Neto po popustu</label>
                <div className="text-md font-semibold text-primary">{formatCurrency(net)}</div>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Znesek DDV</label>
                <div className="text-md font-medium">{formatCurrency(vatAmount)}</div>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Bruto znesek</label>
                <div className="text-md font-bold text-blue-600">{formatCurrency(gross)}</div>
              </div>
            </div>
          </div>

          <div className="col-span-2 border-t pt-3">
            <div className="font-medium mb-2 text-sm">Geodetski podatki</div>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="text-sm font-medium mb-1 block">Številka parcele</label><Input placeholder="npr. 325/4" value={newItem.parcelNumber || ''} onChange={e => setNewItem({ ...newItem, parcelNumber: e.target.value.replace(/[^0-9/\-\s]/g, '') })} /></div>
              <div><label className="text-sm font-medium mb-1 block">Katastrska občina</label><Input placeholder="npr. 1434 Šiška" value={newItem.cadastralMunicipality || ''} onChange={e => setNewItem({ ...newItem, cadastralMunicipality: e.target.value })} /></div>
              <div><label className="text-sm font-medium mb-1 block">Ime katastra</label><Input placeholder="npr. Kataster stavb" value={newItem.cadastreName || ''} onChange={e => setNewItem({ ...newItem, cadastreName: e.target.value })} /></div>
              <div><label className="text-sm font-medium mb-1 block">ID zaznambe</label><Input placeholder="npr. 1434 325/4" value={newItem.landRegisterId || ''} onChange={e => setNewItem({ ...newItem, landRegisterId: e.target.value.replace(/[^0-9/\-\s]/g, '') })} /></div>
            </div>
          </div>

          <div className="col-span-2">
            <label className="text-sm font-medium mb-1 block flex items-center gap-1"><AlertCircle className="w-4 h-4" /> Opombe k postavki</label>
            <textarea value={newItem.itemNote || ''} onChange={e => setNewItem({ ...newItem, itemNote: e.target.value })} placeholder="Dodatna pojasnila..." className="w-full min-h-[60px] px-3 py-2 text-sm border rounded-md" rows={2} />
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => { onOpenChange(false); resetForm() }}>Prekliči</Button>
          <Button 
            onClick={handleSave} 
            disabled={
              !newItem.description || 
              !isQuantityValid || 
              !newItem.price || 
              (newItem.vatRate === 0 && !newItem.vatExemptionReason)
            }
          >
            {editingItem ? 'Posodobi' : 'Dodaj'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}