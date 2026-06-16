// src/data/mockData.ts
import { Customer, ServiceItem, Invoice, AuditLogEntry, InvoiceItem, VatRate } from '@/types'
import { FileText, Edit, Mail, CheckCircle, Ban, RefreshCw, Printer, Send, Package, Eye, Clock, AlertCircle, Plus, Trash2, Save, XCircle, ArrowRight } from 'lucide-react'

export const mockCustomers: Customer[] = [
  { id: 'c1', name: 'Občina Kranj', taxId: '12345678', address: 'Slovenski trg 1, 4000 Kranj', email: 'info@kranj.si', phone: '04 123 4567', isCompany: true, registrationNumber: '1234567' },
  { id: 'c2', name: 'Gradbena družba Zlato d.o.o.', taxId: 'SI98765432', address: 'Cesta 24. junija 15, 4000 Kranj', email: 'info@zlato.si', phone: '04 765 4321', isCompany: true, registrationNumber: '7654321' },
  { id: 'c3', name: 'Stanislav Horvat', taxId: 'SI11223344', address: 'Cesta v Mestni log 8, 1000 Ljubljana', email: 'stanislav.horvat@gmail.com', phone: '040 123 456', isCompany: false },
  { id: 'c4', name: 'Občina Ljubljana', taxId: '56789012', address: 'Mestni trg 1, 1000 Ljubljana', email: 'info@ljubljana.si', phone: '01 306 1234', isCompany: true, registrationNumber: '3456789' },
  { id: 'c5', name: 'Gradnja Marles d.o.o.', taxId: 'SI44332211', address: 'Poslovna cona A 12, 2000 Maribor', email: 'info@marles.si', phone: '02 456 7890', isCompany: true, registrationNumber: '8765432' },
  { id: 'c6', name: 'Geodetski zavod Slovenije', taxId: 'SI99887766', address: 'Dimičeva ulica 12, 1000 Ljubljana', email: 'info@gzs.si', phone: '01 234 5678', isCompany: true, registrationNumber: '12345678' },
  { id: 'c7', name: 'Miran Kobal', taxId: 'SI55667788', address: 'Prešernova 5, 4000 Kranj', email: 'miran.kobal@gmail.com', phone: '041 234 567', isCompany: false },
  { id: 'c8', name: 'Občina Škofja Loka', taxId: '12345678', address: 'Stari trg 1, 4220 Škofja Loka', email: 'info@skofjaloka.si', phone: '04 512 3456', isCompany: true, registrationNumber: '87654321' },
]

export const mockServices: ServiceItem[] = [
  { id: 's1', code: '101', name: 'Geodetsko snemanje', unit: 'ura', price: 150, vatRate: 22 },
  { id: 's2', code: '102', name: 'Izdelava elaborata', unit: 'kos', price: 300, vatRate: 22 },
  { id: 's3', code: '103', name: 'Parcelacija', unit: 'ura', price: 250, vatRate: 9.5 },
  { id: 's4', code: '104', name: 'Katastrska izmera', unit: 'ura', price: 200, vatRate: 22 },
  { id: 's5', code: '105', name: 'Dnevnica', unit: 'dan', price: 45, vatRate: 9.5 },
  { id: 's6', code: '106', name: 'Kilometrina', unit: 'km', price: 0.43, vatRate: 22 },
]

export const suggestedServices = [
  { description: 'Geodetsko snemanje', price: 150, unit: 'ura', vatRate: 22 },
  { description: 'Izdelava elaborata', price: 300, unit: 'kos', vatRate: 22 },
  { description: 'Parcelacija', price: 250, unit: 'ura', vatRate: 9.5 },
  { description: 'Katastrska izmera', price: 200, unit: 'ura', vatRate: 22 },
  { description: 'Prenos podatkov', price: 80, unit: 'ura', vatRate: 22 },
  { description: 'Strokovno mnenje', price: 180, unit: 'ura', vatRate: 22 },
  { description: 'Legalizacija objekta', price: 400, unit: 'kos', vatRate: 9.5 },
  { description: 'Geodetski načrt', price: 120, unit: 'm²', vatRate: 22 },
]

export const companyData = {
  name: 'Geodetski biro Kranj d.o.o.',
  address: 'Prešernova cesta 22, 4000 Kranj',
  taxId: 'SI78945612',
  registrationNumber: '65412378',
  trr: 'SI56 2900 0000 1234 567',
  bic: 'BKSI SI22',
  phone: '+386 4 123 4567',
  email: 'info@geodetstvo-kranj.si',
  bank: 'Banka Slovenije',
}

export const statusLabels: Record<string, string> = {
  draft: 'Osnutek',
  issued: 'Izdan',
  confirmed: 'Potrjen',
  sent: 'Poslan',
  overdue: 'Zapadel',
  paid: 'Plačan',
  partially_paid: 'Delno plačan',
  cancelled: 'Storniran',
  converted: 'Spremenjen v račun'
}

export const statusColors: Record<string, string> = {
  draft: 'bg-gray-300 text-gray-800',
  issued: 'bg-blue-100 text-blue-800',
  confirmed: 'bg-yellow-100 text-yellow-800',
  sent: 'bg-green-100 text-green-800',
  overdue: 'bg-red-100 text-red-800',
  paid: 'bg-green-300 text-emerald-800',
  partially_paid: 'bg-orange-100 text-orange-800',
  cancelled: 'bg-red-400 text-red-800',
  converted: 'bg-purple-100 text-purple-800',
}

export const actionIcons: Record<string, { icon: any; color: string; bgColor: string }> = {
  drafted: { icon: FileText, color: 'text-gray-800', bgColor: 'bg-gray-300' },
  issued: { icon: FileText, color: 'text-blue-800', bgColor: 'bg-blue-100' },
  converted: { icon: ArrowRight, color: 'text-purple-800', bgColor: 'bg-purple-400' },
  edited: { icon: Edit, color: 'text-yellow-800', bgColor: 'bg-yellow-400' },
  sent: { icon: Send, color: 'text-green-800', bgColor: 'bg-green-100' },
  emailed: { icon: Mail, color: 'text-purple-800', bgColor: 'bg-purple-100' },
  paid: { icon: CheckCircle, color: 'text-emerald-800', bgColor: 'bg-green-300' },
  partially_paid: { icon: Clock, color: 'text-orange-800', bgColor: 'bg-orange-100' },
  cancelled: { icon: XCircle, color: 'text-red-800', bgColor: 'bg-red-400' },
  printed: { icon: Printer, color: 'text-gray-600', bgColor: 'bg-gray-100' },
  viewed: { icon: Eye, color: 'text-gray-600', bgColor: 'bg-gray-100' },
  overdue: { icon: Clock, color: 'text-red-800', bgColor: 'bg-red-100' },
  alert_sent: { icon: AlertCircle, color: 'text-orange-600', bgColor: 'bg-orange-100' },
  item_added: { icon: Plus, color: 'text-green-800', bgColor: 'bg-green-100' },
  item_removed: { icon: Trash2, color: 'text-red-800', bgColor: 'bg-red-100' },
  saved: { icon: Save, color: 'text-indigo-800', bgColor: 'bg-indigo-100' },
}

// Helper function to create invoice items
const createItems = (itemsConfig: Array<{ 
  serviceId: string; 
  quantity: number; 
  discountPercent?: number; 
  parcelNumber?: string; 
  cadastralMunicipality?: string; 
  cadastreName?: string;
  landRegisterId?: string;
  itemNote?: string 
}>): InvoiceItem[] => {
  return itemsConfig.map((config, index) => {
    const service = mockServices.find(s => s.id === config.serviceId) || mockServices[0]
    const price = service.price
    const quantity = config.quantity
    const discountPercent = config.discountPercent || 0
    
    const netBeforeDiscount = price * quantity
    const discountAmount = netBeforeDiscount * discountPercent / 100
    const netAfterDiscount = netBeforeDiscount - discountAmount
    const vatAmount = netAfterDiscount * service.vatRate / 100
    const gross = netAfterDiscount + vatAmount

    return {
      id: `item-${Date.now()}-${index}-${Math.random()}`,
      description: service.name,
      quantity,
      unit: service.unit,
      price,
      vatRate: service.vatRate,
      discountPercent,
      discountAmount,
      netBeforeDiscount,
      net: netAfterDiscount,
      vatAmount,
      gross,
      parcelNumber: config.parcelNumber,
      cadastralMunicipality: config.cadastralMunicipality,
      cadastreName: config.cadastreName || (config.parcelNumber ? 'Kataster stavb' : undefined),
      landRegisterId: config.landRegisterId || (config.parcelNumber && config.cadastralMunicipality ? `${config.cadastralMunicipality.split(' ')[0]} ${config.parcelNumber}` : undefined),
      reverseCharge: false,
      vatExemptionReason: service.vatRate === 0 ? '91. člen ZDDV-1 – oprostitev pri izvozu' : undefined,
      itemNote: config.itemNote,
    }
  })
}

const calculateTotalsForInvoice = (items: InvoiceItem[], discountPercent: number) => {
  const totalNetBeforeDiscount = items.reduce((sum, item) => sum + (item.netBeforeDiscount || 0), 0)
  const totalItemDiscounts = items.reduce((sum, item) => sum + (item.discountAmount || 0), 0)
  const totalNetAfterItemDiscounts = items.reduce((sum, item) => sum + item.net, 0)
  const invoiceDiscountAmount = totalNetAfterItemDiscounts * discountPercent / 100
  const finalNetBase = totalNetAfterItemDiscounts - invoiceDiscountAmount
  
  const vatBreakdown: Record<VatRate, number> = { 22: 0, 9.5: 0, 5: 0, 0: 0 }
  items.forEach(item => {
    const discountShare = (discountPercent / 100) * item.net
    const base = item.net - discountShare
    vatBreakdown[item.vatRate] += base * (item.vatRate / 100)
  })
  
  const totalVat = Object.values(vatBreakdown).reduce((a, b) => a + b, 0)
  const totalGross = finalNetBase + totalVat
  
  return { totalNetBeforeDiscount, totalItemDiscounts, totalNetAfterItemDiscounts, invoiceDiscountAmount, finalNetBase, vatBreakdown, totalVat, totalGross }
}

// PREDRAČUNI (s številko, ki se začne s PR)
const createEstimateItems = (itemsConfig: Array<{ serviceId: string; quantity: number; discountPercent?: number; parcelNumber?: string; cadastralMunicipality?: string; itemNote?: string }>): InvoiceItem[] => {
  return itemsConfig.map((config, index) => {
    const service = mockServices.find(s => s.id === config.serviceId) || mockServices[0]
    const price = service.price
    const quantity = config.quantity
    const discountPercent = config.discountPercent || 0
    
    const netBeforeDiscount = price * quantity
    const discountAmount = netBeforeDiscount * discountPercent / 100
    const netAfterDiscount = netBeforeDiscount - discountAmount
    const vatAmount = netAfterDiscount * service.vatRate / 100
    const gross = netAfterDiscount + vatAmount

    return {
      id: `estimate-item-${Date.now()}-${index}-${Math.random()}`,
      description: service.name,
      quantity,
      unit: service.unit,
      price,
      vatRate: service.vatRate,
      discountPercent,
      discountAmount,
      netBeforeDiscount,
      net: netAfterDiscount,
      vatAmount,
      gross,
      parcelNumber: config.parcelNumber,
      cadastralMunicipality: config.cadastralMunicipality,
      cadastreName: config.parcelNumber ? 'Kataster stavb' : undefined,
      landRegisterId: config.parcelNumber && config.cadastralMunicipality ? `${config.cadastralMunicipality.split(' ')[0]} ${config.parcelNumber}` : undefined,
      reverseCharge: false,
      vatExemptionReason: service.vatRate === 0 ? '91. člen ZDDV-1 – oprostitev pri izvozu' : undefined,
      itemNote: config.itemNote,
    }
  })
}

// PREDRAČUNI
export const initialEstimates: Invoice[] = [
  {
    id: 'est1',
    number: 'PR-2026-0001',
    customerId: 'c1',
    customerName: 'Občina Kranj',
    customerTaxId: '12345678',
    customerRegistrationNumber: '99887123',
    customerAddress: 'Slovenski trg 1, 4000 Kranj',
    issueDate: '2026-05-01',
    serviceDateFrom: '2026-05-15',
    serviceDateTo: '2026-05-20',
    dueDate: 'null',
    paymentTermDays: 30,
    items: createEstimateItems([{ serviceId: 's2', quantity: 1, discountPercent: 5, parcelNumber: '325/4', cadastralMunicipality: '1434 Šiška', itemNote: 'Elaborat za zazidalni načrt' }]),
    discountPercent: 0,
    ...(() => {
      const items = createEstimateItems([{ serviceId: 's2', quantity: 1, discountPercent: 5, parcelNumber: '325/4', cadastralMunicipality: '1434 Šiška', itemNote: 'Elaborat za zazidalni načrt' }])
      const totals = calculateTotalsForInvoice(items, 0)
      return { totalNet: totals.totalNetAfterItemDiscounts, totalVat: totals.totalVat, totalGross: totals.totalGross, vatBreakdown: totals.vatBreakdown, totalNetBeforeDiscount: totals.totalNetBeforeDiscount, totalItemDiscounts: totals.totalItemDiscounts, invoiceDiscountAmount: totals.invoiceDiscountAmount, finalNetBase: totals.finalNetBase }
    })(),
    status: 'sent',
    sentAt: '2026-05-02T10:00:00Z',
    note: 'Predračun za izdelavo elaborata za zazidalni načrt.',
    createdAt: '2026-05-01T09:00:00Z',
    updatedAt: '2026-05-02T10:00:00Z',
  } as Invoice,
  {
    id: 'est2',
    number: 'PR-2026-0002',
    customerId: 'c4',
    customerName: 'Občina Ljubljana',
    customerTaxId: '56789012',
    customerRegistrationNumber: '3456789',
    customerAddress: 'Mestni trg 1, 1000 Ljubljana',
    issueDate: '2026-05-10',
    serviceDateFrom: '2026-05-20',
    serviceDateTo: '2026-05-25',
    dueDate: '2026-06-10',
    paymentTermDays: 30,
    items: createEstimateItems([{ serviceId: 's1', quantity: 3, parcelNumber: '1000/1', cadastralMunicipality: '1000 Ljubljana', itemNote: 'Geodetsko snemanje za gradnjo' }]),
    discountPercent: 10,
    ...(() => {
      const items = createEstimateItems([{ serviceId: 's1', quantity: 3, parcelNumber: '1000/1', cadastralMunicipality: '1000 Ljubljana', itemNote: 'Geodetsko snemanje za gradnjo' }])
      const totals = calculateTotalsForInvoice(items, 10)
      return { totalNet: totals.totalNetAfterItemDiscounts, totalVat: totals.totalVat, totalGross: totals.totalGross, vatBreakdown: totals.vatBreakdown, totalNetBeforeDiscount: totals.totalNetBeforeDiscount, totalItemDiscounts: totals.totalItemDiscounts, invoiceDiscountAmount: totals.invoiceDiscountAmount, finalNetBase: totals.finalNetBase }
    })(),
    status: 'overdue',
    note: 'Predračun za geodetsko snemanje.',
    createdAt: '2026-05-10T11:00:00Z',
    updatedAt: '2026-05-10T11:00:00Z',
  } as Invoice,
  {
    id: 'est3',
    number: 'PR-2026-0003',
    customerId: 'c5',
    customerName: 'Gradnja Marles d.o.o.',
    customerTaxId: 'SI44332211',
    customerRegistrationNumber: '8765432',
    customerAddress: 'Poslovna cona A 12, 2000 Maribor',
    issueDate: '2026-05-15',
    serviceDateFrom: '2026-06-01',
    serviceDateTo: '2026-06-10',
    dueDate: '2026-06-15',
    paymentTermDays: 30,
    items: createEstimateItems([{ serviceId: 's3', quantity: 2, parcelNumber: '333/7', cadastralMunicipality: '2000 Maribor', itemNote: 'Parcelacija zemljišča' }]),
    discountPercent: 0,
    ...(() => {
      const items = createEstimateItems([{ serviceId: 's3', quantity: 2, parcelNumber: '333/7', cadastralMunicipality: '2000 Maribor', itemNote: 'Parcelacija zemljišča' }])
      const totals = calculateTotalsForInvoice(items, 0)
      return { totalNet: totals.totalNetAfterItemDiscounts, totalVat: totals.totalVat, totalGross: totals.totalGross, vatBreakdown: totals.vatBreakdown, totalNetBeforeDiscount: totals.totalNetBeforeDiscount, totalItemDiscounts: totals.totalItemDiscounts, invoiceDiscountAmount: totals.invoiceDiscountAmount, finalNetBase: totals.finalNetBase }
    })(),
    status: 'sent',
    sentAt: '2026-05-16T09:00:00Z',
    note: 'Predračun za parcelacijo.',
    createdAt: '2026-05-15T14:00:00Z',
    updatedAt: '2026-05-16T09:00:00Z',
  } as Invoice,
  {
    id: 'est4',
    number: 'PR-2026-0004',
    customerId: 'c6',
    customerName: 'Geodetski zavod Slovenije',
    customerTaxId: 'SI99887766',
    customerRegistrationNumber: '12345678',
    customerAddress: 'Dimičeva ulica 12, 1000 Ljubljana',
    issueDate: '2026-05-20',
    serviceDateFrom: '2026-06-05',
    serviceDateTo: '2026-06-15',
    dueDate: '2026-06-20',
    paymentTermDays: 30,
    items: createEstimateItems([{ serviceId: 's4', quantity: 5, parcelNumber: '888/2', cadastralMunicipality: '1000 Ljubljana', itemNote: 'Katastrska izmera' }]),
    discountPercent: 5,
    ...(() => {
      const items = createEstimateItems([{ serviceId: 's4', quantity: 5, parcelNumber: '888/2', cadastralMunicipality: '1000 Ljubljana', itemNote: 'Katastrska izmera' }])
      const totals = calculateTotalsForInvoice(items, 5)
      return { totalNet: totals.totalNetAfterItemDiscounts, totalVat: totals.totalVat, totalGross: totals.totalGross, vatBreakdown: totals.vatBreakdown, totalNetBeforeDiscount: totals.totalNetBeforeDiscount, totalItemDiscounts: totals.totalItemDiscounts, invoiceDiscountAmount: totals.invoiceDiscountAmount, finalNetBase: totals.finalNetBase }
    })(),
    status: 'issued',
    note: 'Predračun za katastrsko izmero.',
    createdAt: '2026-05-20T10:30:00Z',
    updatedAt: '2026-05-20T10:30:00Z',
  } as Invoice,
  {
    id: 'est5',
    number: 'PR-2026-0005',
    customerId: 'c7',
    customerName: 'Miran Kobal',
    customerTaxId: 'SI55667788',
    customerRegistrationNumber: '',
    customerAddress: 'Prešernova 5, 4000 Kranj',
    issueDate: '2026-05-25',
    serviceDateFrom: '2026-06-10',
    serviceDateTo: '2026-06-12',
    dueDate: '2026-06-25',
    paymentTermDays: 30,
    items: createEstimateItems([{ serviceId: 's1', quantity: 2, parcelNumber: '555/1', cadastralMunicipality: '1434 Šiška', itemNote: 'Geodetsko snemanje za gradbeno dovoljenje' }]),
    discountPercent: 0,
    ...(() => {
      const items = createEstimateItems([{ serviceId: 's1', quantity: 2, parcelNumber: '555/1', cadastralMunicipality: '1434 Šiška', itemNote: 'Geodetsko snemanje za gradbeno dovoljenje' }])
      const totals = calculateTotalsForInvoice(items, 0)
      return { totalNet: totals.totalNetAfterItemDiscounts, totalVat: totals.totalVat, totalGross: totals.totalGross, vatBreakdown: totals.vatBreakdown, totalNetBeforeDiscount: totals.totalNetBeforeDiscount, totalItemDiscounts: totals.totalItemDiscounts, invoiceDiscountAmount: totals.invoiceDiscountAmount, finalNetBase: totals.finalNetBase }
    })(),
    status: 'issued',
    note: 'Osnutek predračuna - čaka na potrditev.',
    createdAt: '2026-05-25T08:00:00Z',
    updatedAt: '2026-05-25T08:00:00Z',
  } as Invoice,
  {
    id: 'est6',
    number: 'PR-2026-0006',
    customerId: 'c8',
    customerName: 'Občina Škofja Loka',
    customerTaxId: '12345678',
    customerRegistrationNumber: '87654321',
    customerAddress: 'Stari trg 1, 4220 Škofja Loka',
    issueDate: '5.5.2026',
    serviceDateFrom: '2026-06-15',
    serviceDateTo: '2026-06-20',
    dueDate: 'null',
    paymentTermDays: 30,
    items: createEstimateItems([{ serviceId: 's2', quantity: 2, parcelNumber: '777/3', cadastralMunicipality: '2000 Škofja Loka', itemNote: 'Izdelava elaborata za gradbeno dovoljenje' }]),
    discountPercent: 8,
    ...(() => {
      const items = createEstimateItems([{ serviceId: 's2', quantity: 2, parcelNumber: '777/3', cadastralMunicipality: '2000 Škofja Loka', itemNote: 'Izdelava elaborata za gradbeno dovoljenje' }])
      const totals = calculateTotalsForInvoice(items, 8)
      return { totalNet: totals.totalNetAfterItemDiscounts, totalVat: totals.totalVat, totalGross: totals.totalGross, vatBreakdown: totals.vatBreakdown, totalNetBeforeDiscount: totals.totalNetBeforeDiscount, totalItemDiscounts: totals.totalItemDiscounts, invoiceDiscountAmount: totals.invoiceDiscountAmount, finalNetBase: totals.finalNetBase }
    })(),
    status: 'issued',
    note: 'null',
    createdAt: '2026-06-01T12:00:00Z',
    updatedAt: '2026-06-01T12:00:00Z',
  } as Invoice,
  {
    id: 'est7',
    number: 'PR-2026-0007',
    customerId: 'c2',
    customerName: 'Gradbena družba Zlato d.o.o.',
    customerTaxId: 'SI98765432',
    customerRegistrationNumber: '7654321',
    customerAddress: 'Cesta 24. junija 15, 4000 Kranj',
    issueDate: '2026-06-05',
    serviceDateFrom: '2026-06-20',
    serviceDateTo: '2026-06-25',
    dueDate: '2026-07-05',
    paymentTermDays: 30,
    items: createEstimateItems([{ serviceId: 's3', quantity: 3, parcelNumber: '444/9', cadastralMunicipality: '1434 Šiška', itemNote: 'Parcelacija za gradbeno parcelo' }]),
    discountPercent: 0,
    ...(() => {
      const items = createEstimateItems([{ serviceId: 's3', quantity: 3, parcelNumber: '444/9', cadastralMunicipality: '1434 Šiška', itemNote: 'Parcelacija za gradbeno parcelo' }])
      const totals = calculateTotalsForInvoice(items, 0)
      return { totalNet: totals.totalNetAfterItemDiscounts, totalVat: totals.totalVat, totalGross: totals.totalGross, vatBreakdown: totals.vatBreakdown, totalNetBeforeDiscount: totals.totalNetBeforeDiscount, totalItemDiscounts: totals.totalItemDiscounts, invoiceDiscountAmount: totals.invoiceDiscountAmount, finalNetBase: totals.finalNetBase }
    })(),
    status: 'paid',
    paidAt: '2026-06-10T14:00:00Z',
    note: 'Predračun - spremenjen v račun.',
    createdAt: '2026-06-05T09:00:00Z',
    updatedAt: '2026-06-10T14:00:00Z',
  } as Invoice,
  {
  id: 'est8',
  number: 'PR-2026-0008',
  customerId: 'c3',
  customerName: 'Stanislav Horvat',
  customerTaxId: 'SI11223344',
  customerRegistrationNumber: '',
  customerAddress: 'Cesta v Mestni log 8, 1000 Ljubljana',
  issueDate: '2026-06-01',
  serviceDateFrom: '2026-06-15',
  serviceDateTo: '2026-06-20',
  dueDate: '2026-07-01',
  paymentTermDays: 30,
  items: createEstimateItems([{ serviceId: 's1', quantity: 2, parcelNumber: '555/1', cadastralMunicipality: '1434 Šiška', itemNote: 'Geodetsko snemanje za gradbeno dovoljenje' }]),
  discountPercent: 0,
  ...(() => {
    const items = createEstimateItems([{ serviceId: 's1', quantity: 2, parcelNumber: '555/1', cadastralMunicipality: '1434 Šiška', itemNote: 'Geodetsko snemanje za gradbeno dovoljenje' }])
    const totals = calculateTotalsForInvoice(items, 0)
    return { totalNet: totals.totalNetAfterItemDiscounts, totalVat: totals.totalVat, totalGross: totals.totalGross, vatBreakdown: totals.vatBreakdown }
  })(),
  status: 'converted',
  note: 'Predračun spremenjen v račun R-2026-0045.',
  createdAt: '2026-06-01T10:00:00Z',
  updatedAt: '2026-06-15T12:00:00Z',
} as Invoice,

{
  id: 'est9',
  number: 'PR-2026-0009',
  customerId: 'c8',
  customerName: 'Občina Škofja Loka',
  customerTaxId: '12345678',
  customerRegistrationNumber: '87654321',
  customerAddress: 'Stari trg 1, 4220 Škofja Loka',
  issueDate: '2026-06-10',
  serviceDateFrom: '2026-06-25',
  serviceDateTo: '2026-06-30',
  dueDate: '2026-07-10',
  paymentTermDays: 30,
  items: createEstimateItems([{ serviceId: 's2', quantity: 1, parcelNumber: '777/3', cadastralMunicipality: '2000 Škofja Loka', itemNote: 'Izdelava elaborata' }]),
  discountPercent: 0,
  ...(() => {
    const items = createEstimateItems([{ serviceId: 's2', quantity: 1, parcelNumber: '777/3', cadastralMunicipality: '2000 Škofja Loka', itemNote: 'Izdelava elaborata' }])
    const totals = calculateTotalsForInvoice(items, 0)
    return { totalNet: totals.totalNetAfterItemDiscounts, totalVat: totals.totalVat, totalGross: totals.totalGross, vatBreakdown: totals.vatBreakdown }
  })(),
  status: 'converted',
  note: 'Predračun spremenjen v račun R-2026-0050.',
  createdAt: '2026-06-10T09:00:00Z',
  updatedAt: '2026-07-01T10:00:00Z',
} as Invoice,

{
  id: 'est10',
  number: 'PR-2026-0010',
  customerId: 'c1',
  customerName: 'Občina Kranj',
  customerTaxId: '12345678',
  customerRegistrationNumber: '99887123',
  customerAddress: 'Slovenski trg 1, 4000 Kranj',
  issueDate: '2026-06-15',
  serviceDateFrom: '2026-07-01',
  serviceDateTo: '2026-07-10',
  dueDate: '2026-07-15',
  paymentTermDays: 30,
  items: createEstimateItems([{ serviceId: 's4', quantity: 3, parcelNumber: '325/4', cadastralMunicipality: '1434 Šiška', itemNote: 'Katastrska izmera' }]),
  discountPercent: 10,
  ...(() => {
    const items = createEstimateItems([{ serviceId: 's4', quantity: 3, parcelNumber: '325/4', cadastralMunicipality: '1434 Šiška', itemNote: 'Katastrska izmera' }])
    const totals = calculateTotalsForInvoice(items, 10)
    return { totalNet: totals.totalNetAfterItemDiscounts, totalVat: totals.totalVat, totalGross: totals.totalGross, vatBreakdown: totals.vatBreakdown }
  })(),
  status: 'converted',
  note: 'Predračun spremenjen v račun R-2026-0055.',
  createdAt: '2026-06-15T13:00:00Z',
  updatedAt: '2026-07-05T11:00:00Z',
} as Invoice,
]

// ZAPADLI RAČUNI (status 'overdue')
export const initialOverdueInvoices: Invoice[] = [
  {
    id: 'overdue1',
    number: 'R-2025-0048',
    customerId: 'c2',
    customerName: 'Gradbena družba Zlato d.o.o.',
    customerTaxId: 'SI98765432',
    customerRegistrationNumber: '7654321',
    customerAddress: 'Cesta 24. junija 15, 4000 Kranj',
    issueDate: '2025-06-15',
    serviceDateFrom: '2025-06-10',
    serviceDateTo: '2025-06-14',
    dueDate: '2025-07-15',
    paymentTermDays: 30,
    items: createItems([{ serviceId: 's4', quantity: 3, parcelNumber: '125/2', cadastralMunicipality: '1434 Šiška', itemNote: 'Terenske meritve' }]),
    discountPercent: 8,
    ...(() => {
      const items = createItems([{ serviceId: 's4', quantity: 3, parcelNumber: '125/2', cadastralMunicipality: '1434 Šiška', itemNote: 'Terenske meritve' }])
      const totals = calculateTotalsForInvoice(items, 8)
      return { totalNet: totals.totalNetAfterItemDiscounts, totalVat: totals.totalVat, totalGross: totals.totalGross, vatBreakdown: totals.vatBreakdown, totalNetBeforeDiscount: totals.totalNetBeforeDiscount, totalItemDiscounts: totals.totalItemDiscounts, invoiceDiscountAmount: totals.invoiceDiscountAmount, finalNetBase: totals.finalNetBase }
    })(),
    status: 'overdue',
    note: 'Račun zapadel - prosimo za čimprejšnje plačilo.',
    createdAt: '2025-06-15T09:00:00Z',
    updatedAt: '2025-07-16T00:00:00Z',
  } as Invoice,
  {
    id: 'overdue2',
    number: 'R-2025-0052',
    customerId: 'c3',
    customerName: 'Stanislav Horvat',
    customerTaxId: 'SI11223344',
    customerRegistrationNumber: '',
    customerAddress: 'Cesta v Mestni log 8, 1000 Ljubljana',
    issueDate: '2025-06-20',
    serviceDateFrom: '2025-06-15',
    serviceDateTo: '2025-06-19',
    dueDate: '2025-07-20',
    paymentTermDays: 30,
    items: createItems([{ serviceId: 's1', quantity: 2, discountPercent: 5, parcelNumber: '888/1', cadastralMunicipality: '1234 Ljubljana', itemNote: 'Geodetsko snemanje' }]),
    discountPercent: 0,
    ...(() => {
      const items = createItems([{ serviceId: 's1', quantity: 2, discountPercent: 5, parcelNumber: '888/1', cadastralMunicipality: '1234 Ljubljana', itemNote: 'Geodetsko snemanje' }])
      const totals = calculateTotalsForInvoice(items, 0)
      return { totalNet: totals.totalNetAfterItemDiscounts, totalVat: totals.totalVat, totalGross: totals.totalGross, vatBreakdown: totals.vatBreakdown, totalNetBeforeDiscount: totals.totalNetBeforeDiscount, totalItemDiscounts: totals.totalItemDiscounts, invoiceDiscountAmount: totals.invoiceDiscountAmount, finalNetBase: totals.finalNetBase }
    })(),
    status: 'overdue',
    note: 'Račun zapadel - plačilo še ni bilo izvršeno.',
    createdAt: '2025-06-20T08:00:00Z',
    updatedAt: '2025-07-21T00:00:00Z',
  } as Invoice,
  {
    id: 'overdue3',
    number: 'R-2025-0053',
    customerId: 'c5',
    customerName: 'Gradnja Marles d.o.o.',
    customerTaxId: 'SI44332211',
    customerRegistrationNumber: '8765432',
    customerAddress: 'Poslovna cona A 12, 2000 Maribor',
    issueDate: '2025-06-25',
    serviceDateFrom: '2025-06-20',
    serviceDateTo: '2025-06-24',
    dueDate: '2025-07-25',
    paymentTermDays: 30,
    items: createItems([{ serviceId: 's2', quantity: 1, parcelNumber: '333/7', cadastralMunicipality: '2000 Maribor', itemNote: 'Izdelava elaborata' }]),
    discountPercent: 0,
    ...(() => {
      const items = createItems([{ serviceId: 's2', quantity: 1, parcelNumber: '333/7', cadastralMunicipality: '2000 Maribor', itemNote: 'Izdelava elaborata' }])
      const totals = calculateTotalsForInvoice(items, 0)
      return { totalNet: totals.totalNetAfterItemDiscounts, totalVat: totals.totalVat, totalGross: totals.totalGross, vatBreakdown: totals.vatBreakdown, totalNetBeforeDiscount: totals.totalNetBeforeDiscount, totalItemDiscounts: totals.totalItemDiscounts, invoiceDiscountAmount: totals.invoiceDiscountAmount, finalNetBase: totals.finalNetBase }
    })(),
    status: 'overdue',
    note: 'Račun zapadel - drugi opomin.',
    createdAt: '2025-06-25T13:00:00Z',
    updatedAt: '2025-07-26T00:00:00Z',
  } as Invoice,
  {
    id: 'overdue4',
    number: 'R-2025-0054',
    customerId: 'c8',
    customerName: 'Občina Škofja Loka',
    customerTaxId: '12345678',
    customerRegistrationNumber: '87654321',
    customerAddress: 'Stari trg 1, 4220 Škofja Loka',
    issueDate: '2025-06-10',
    serviceDateFrom: '2025-06-05',
    serviceDateTo: '2025-06-09',
    dueDate: '2025-07-10',
    paymentTermDays: 30,
    items: createItems([{ serviceId: 's3', quantity: 2, parcelNumber: '777/3', cadastralMunicipality: '2000 Škofja Loka', itemNote: 'Parcelacija zemljišča' }]),
    discountPercent: 5,
    ...(() => {
      const items = createItems([{ serviceId: 's3', quantity: 2, parcelNumber: '777/3', cadastralMunicipality: '2000 Škofja Loka', itemNote: 'Parcelacija zemljišča' }])
      const totals = calculateTotalsForInvoice(items, 5)
      return { totalNet: totals.totalNetAfterItemDiscounts, totalVat: totals.totalVat, totalGross: totals.totalGross, vatBreakdown: totals.vatBreakdown, totalNetBeforeDiscount: totals.totalNetBeforeDiscount, totalItemDiscounts: totals.totalItemDiscounts, invoiceDiscountAmount: totals.invoiceDiscountAmount, finalNetBase: totals.finalNetBase }
    })(),
    status: 'overdue',
    note: 'Račun zapadel - plačilo ni bilo izvršeno v roku.',
    createdAt: '2025-06-10T10:00:00Z',
    updatedAt: '2025-07-11T00:00:00Z',
  } as Invoice,
  {
    id: 'overdue5',
    number: 'R-2025-0055',
    customerId: 'c6',
    customerName: 'Geodetski zavod Slovenije',
    customerTaxId: 'SI99887766',
    customerRegistrationNumber: '12345678',
    customerAddress: 'Dimičeva ulica 12, 1000 Ljubljana',
    issueDate: '2025-06-05',
    serviceDateFrom: '2025-06-01',
    serviceDateTo: '2025-06-04',
    dueDate: '2025-07-05',
    paymentTermDays: 30,
    items: createItems([{ serviceId: 's4', quantity: 4, parcelNumber: '888/2', cadastralMunicipality: '1000 Ljubljana', itemNote: 'Katastrska izmera' }]),
    discountPercent: 0,
    ...(() => {
      const items = createItems([{ serviceId: 's4', quantity: 4, parcelNumber: '888/2', cadastralMunicipality: '1000 Ljubljana', itemNote: 'Katastrska izmera' }])
      const totals = calculateTotalsForInvoice(items, 0)
      return { totalNet: totals.totalNetAfterItemDiscounts, totalVat: totals.totalVat, totalGross: totals.totalGross, vatBreakdown: totals.vatBreakdown, totalNetBeforeDiscount: totals.totalNetBeforeDiscount, totalItemDiscounts: totals.totalItemDiscounts, invoiceDiscountAmount: totals.invoiceDiscountAmount, finalNetBase: totals.finalNetBase }
    })(),
    status: 'overdue',
    note: 'Račun zapadel - čakamo na plačilo.',
    createdAt: '2025-06-05T11:00:00Z',
    updatedAt: '2025-07-06T00:00:00Z',
  } as Invoice,
  {
    id: 'overdue6',
    number: 'R-2025-0056',
    customerId: 'c7',
    customerName: 'Miran Kobal',
    customerTaxId: 'SI55667788',
    customerRegistrationNumber: '',
    customerAddress: 'Prešernova 5, 4000 Kranj',
    issueDate: '2025-06-01',
    serviceDateFrom: '2025-05-28',
    serviceDateTo: '2025-05-30',
    dueDate: '2025-07-01',
    paymentTermDays: 30,
    items: createItems([{ serviceId: 's1', quantity: 1, parcelNumber: '555/1', cadastralMunicipality: '1434 Šiška', itemNote: 'Geodetsko snemanje' }]),
    discountPercent: 0,
    ...(() => {
      const items = createItems([{ serviceId: 's1', quantity: 1, parcelNumber: '555/1', cadastralMunicipality: '1434 Šiška', itemNote: 'Geodetsko snemanje' }])
      const totals = calculateTotalsForInvoice(items, 0)
      return { totalNet: totals.totalNetAfterItemDiscounts, totalVat: totals.totalVat, totalGross: totals.totalGross, vatBreakdown: totals.vatBreakdown, totalNetBeforeDiscount: totals.totalNetBeforeDiscount, totalItemDiscounts: totals.totalItemDiscounts, invoiceDiscountAmount: totals.invoiceDiscountAmount, finalNetBase: totals.finalNetBase }
    })(),
    status: 'overdue',
    note: 'Račun zapadel - poslani opomini.',
    createdAt: '2025-06-01T09:00:00Z',
    updatedAt: '2025-07-02T00:00:00Z',
  } as Invoice,
]

// Združeni vsi računi (za uporabo v useInvoices)
export const initialInvoices: Invoice[] = [
  // Obstoječi računi
  {
    id: 'inv1',
    number: 'R-2025-0047',
    customerId: 'c1',
    customerName: 'Občina Kranj',
    customerTaxId: '12345678',
    customerRegistrationNumber: '99887123',
    customerAddress: 'Slovenski trg 1, 4000 Kranj',
    issueDate: '2025-06-09',
    serviceDateFrom: '2025-06-05',
    serviceDateTo: '2025-06-05',
    dueDate: '2025-07-09',
    paymentTermDays: 30,
    items: createItems([{ 
      serviceId: 's2', 
      quantity: 1, 
      discountPercent: 3, 
      parcelNumber: '325/4', 
      cadastralMunicipality: '1434 Šiška',
      cadastreName: 'Kataster stavb',
      landRegisterId: '1434 325/4',
      itemNote: 'Izdelava elaborata za legalizacijo'
    }]),
    discountPercent: 0,
    ...(() => {
      const items = createItems([{ 
        serviceId: 's2', 
        quantity: 1, 
        discountPercent: 3, 
        parcelNumber: '325/4', 
        cadastralMunicipality: '1434 Šiška',
        cadastreName: 'Kataster stavb',
        landRegisterId: '1434 325/4',
        itemNote: 'Izdelava elaborata za legalizacijo'
      }])
      const totals = calculateTotalsForInvoice(items, 0)
      return { totalNet: totals.totalNetAfterItemDiscounts, totalVat: totals.totalVat, totalGross: totals.totalGross, vatBreakdown: totals.vatBreakdown, totalNetBeforeDiscount: totals.totalNetBeforeDiscount, totalItemDiscounts: totals.totalItemDiscounts, invoiceDiscountAmount: totals.invoiceDiscountAmount, finalNetBase: totals.finalNetBase }
    })(),
    status: 'paid',
    note: 'Račun plačan po predračunu P-2405-12.',
    createdAt: '2025-06-09T10:00:00Z',
    updatedAt: '2025-07-10T14:00:00Z',
    paidAt: '2025-07-10T14:00:00Z',
  } as Invoice,
  {
    id: 'inv2',
    number: 'R-2025-0048',
    customerId: 'c2',
    customerName: 'Gradbena družba Zlato d.o.o.',
    customerTaxId: 'SI98765432',
    customerRegistrationNumber: '7654321',
    customerAddress: 'Cesta 24. junija 15, 4000 Kranj',
    issueDate: '2025-06-15',
    serviceDateFrom: '2025-06-10',
    serviceDateTo: '2025-06-14',
    dueDate: '2025-07-15',
    paymentTermDays: 30,
    items: createItems([ 
      { serviceId: 's4', quantity: 3, parcelNumber: '125/2', cadastralMunicipality: '1434 Šiška', itemNote: 'Terenske meritve' },
      { serviceId: 's1', quantity: 4, discountPercent: 5, parcelNumber: '125/2', cadastralMunicipality: '1434 Šiška', itemNote: 'Snemanje obstoječega stanja' },
      { serviceId: 's5', quantity: 2, itemNote: 'Terenski del' }
    ]),
    discountPercent: 8,
    ...(() => {
      const items = createItems([ 
        { serviceId: 's4', quantity: 3, parcelNumber: '125/2', cadastralMunicipality: '1434 Šiška', itemNote: 'Terenske meritve' },
        { serviceId: 's1', quantity: 4, discountPercent: 5, parcelNumber: '125/2', cadastralMunicipality: '1434 Šiška', itemNote: 'Snemanje obstoječega stanja' },
        { serviceId: 's5', quantity: 2, itemNote: 'Terenski del' }
      ])
      const totals = calculateTotalsForInvoice(items, 8)
      return { totalNet: totals.totalNetAfterItemDiscounts, totalVat: totals.totalVat, totalGross: totals.totalGross, vatBreakdown: totals.vatBreakdown, totalNetBeforeDiscount: totals.totalNetBeforeDiscount, totalItemDiscounts: totals.totalItemDiscounts, invoiceDiscountAmount: totals.invoiceDiscountAmount, finalNetBase: totals.finalNetBase }
    })(),
    status: 'overdue',
    note: 'Prosimo za čimprejšnje plačilo.',
    createdAt: '2025-06-15T09:00:00Z',
    updatedAt: '2025-06-15T09:00:00Z',
  } as Invoice,
  {
    id: 'inv3',
    number: 'R-2025-0049',
    customerId: 'c3',
    customerName: 'Stanislav Horvat',
    customerTaxId: 'SI11223344',
    customerRegistrationNumber: '',
    customerAddress: 'Cesta v Mestni log 8, 1000 Ljubljana',
    issueDate: '2025-06-20',
    serviceDateFrom: '2025-06-15',
    serviceDateTo: '2025-06-19',
    dueDate: '2025-07-20',
    paymentTermDays: 30,
    items: createItems([ 
      { serviceId: 's1', quantity: 2, discountPercent: 5, parcelNumber: '888/1', cadastralMunicipality: '1234 Ljubljana', itemNote: 'Snemanje za gradbeno dovoljenje' },
      { serviceId: 's3', quantity: 3, parcelNumber: '888/1', cadastralMunicipality: '1234 Ljubljana', itemNote: 'Parcelacija zemljišča' },
      { serviceId: 's5', quantity: 1 }
    ]),
    discountPercent: 0,
    ...(() => {
      const items = createItems([ 
        { serviceId: 's1', quantity: 2, discountPercent: 5, parcelNumber: '888/1', cadastralMunicipality: '1234 Ljubljana', itemNote: 'Snemanje za gradbeno dovoljenje' },
        { serviceId: 's3', quantity: 3, parcelNumber: '888/1', cadastralMunicipality: '1234 Ljubljana', itemNote: 'Parcelacija zemljišča' },
        { serviceId: 's5', quantity: 1 }
      ])
      const totals = calculateTotalsForInvoice(items, 0)
      return { totalNet: totals.totalNetAfterItemDiscounts, totalVat: totals.totalVat, totalGross: totals.totalGross, vatBreakdown: totals.vatBreakdown, totalNetBeforeDiscount: totals.totalNetBeforeDiscount, totalItemDiscounts: totals.totalItemDiscounts, invoiceDiscountAmount: totals.invoiceDiscountAmount, finalNetBase: totals.finalNetBase }
    })(),
    status: 'sent',
    sentAt: '2025-06-21T11:00:00Z',
    note: 'Hvala za sodelovanje!',
    createdAt: '2025-06-20T08:00:00Z',
    updatedAt: '2025-06-21T11:00:00Z',
  } as Invoice,
  {
    id: 'inv4',
    number: 'R-2025-0050',
    customerId: 'c4',
    customerName: 'Občina Ljubljana',
    customerTaxId: '56789012',
    customerRegistrationNumber: '3456789',
    customerAddress: 'Mestni trg 1, 1000 Ljubljana',
    issueDate: '2025-06-25',
    serviceDateFrom: '2025-06-20',
    serviceDateTo: '2025-06-24',
    dueDate: '2025-07-25',
    paymentTermDays: 30,
    items: createItems([ 
      { serviceId: 's2', quantity: 2, discountPercent: 15, parcelNumber: '1000/1', cadastralMunicipality: '1000 Ljubljana', itemNote: 'Elaborat za zazidalni načrt' },
      { serviceId: 's4', quantity: 5, parcelNumber: '1000/1', cadastralMunicipality: '1000 Ljubljana' },
      { serviceId: 's1', quantity: 3 }
    ]),
    discountPercent: 0,
    ...(() => {
      const items = createItems([ 
        { serviceId: 's2', quantity: 2, discountPercent: 15, parcelNumber: '1000/1', cadastralMunicipality: '1000 Ljubljana', itemNote: 'Elaborat za zazidalni načrt' },
        { serviceId: 's4', quantity: 5, parcelNumber: '1000/1', cadastralMunicipality: '1000 Ljubljana' },
        { serviceId: 's1', quantity: 3 }
      ])
      const totals = calculateTotalsForInvoice(items, 0)
      return { totalNet: totals.totalNetAfterItemDiscounts, totalVat: totals.totalVat, totalGross: totals.totalGross, vatBreakdown: totals.vatBreakdown, totalNetBeforeDiscount: totals.totalNetBeforeDiscount, totalItemDiscounts: totals.totalItemDiscounts, invoiceDiscountAmount: totals.invoiceDiscountAmount, finalNetBase: totals.finalNetBase }
    })(),
    status: 'issued',
    note: 'Račun bo poslan po elektronski pošti.',
    createdAt: '2025-06-25T13:00:00Z',
    updatedAt: '2025-06-25T13:00:00Z',
  } as Invoice,
  {
    id: 'inv5',
    number: 'OSNUTEK',
    customerId: 'c5',
    customerName: 'Gradnja Marles d.o.o.',
    customerTaxId: 'SI44332211',
    customerRegistrationNumber: '8765432',
    customerAddress: 'Poslovna cona A 12, 2000 Maribor',
    issueDate: '2025-06-28',
    serviceDateFrom: '2025-06-25',
    serviceDateTo: '2025-06-27',
    dueDate: '2025-07-28',
    paymentTermDays: 30,
    items: createItems([ 
      { serviceId: 's1', quantity: 3, parcelNumber: '333/7', cadastralMunicipality: '2000 Maribor', itemNote: 'Geodetsko snemanje za gradnjo' },
      { serviceId: 's3', quantity: 2, parcelNumber: '333/7', cadastralMunicipality: '2000 Maribor', itemNote: 'Parcelacija za gradbeno parcelo' }
    ]),
    discountPercent: 0,
    ...(() => {
      const items = createItems([ 
        { serviceId: 's1', quantity: 3, parcelNumber: '333/7', cadastralMunicipality: '2000 Maribor', itemNote: 'Geodetsko snemanje za gradnjo' },
        { serviceId: 's3', quantity: 2, parcelNumber: '333/7', cadastralMunicipality: '2000 Maribor', itemNote: 'Parcelacija za gradbeno parcelo' }
      ])
      const totals = calculateTotalsForInvoice(items, 0)
      return { totalNet: totals.totalNetAfterItemDiscounts, totalVat: totals.totalVat, totalGross: totals.totalGross, vatBreakdown: totals.vatBreakdown, totalNetBeforeDiscount: totals.totalNetBeforeDiscount, totalItemDiscounts: totals.totalItemDiscounts, invoiceDiscountAmount: totals.invoiceDiscountAmount, finalNetBase: totals.finalNetBase }
    })(),
    status: 'draft',
    note: 'Osnutek - čaka na pregled.',
    createdAt: '2025-06-28T09:30:00Z',
    updatedAt: '2025-06-28T09:30:00Z',
  } as Invoice,
  {
    id: 'inv6',
    number: 'R-2025-0046',
    customerId: 'c2',
    customerName: 'Gradbena družba Zlato d.o.o.',
    customerTaxId: 'SI98765432',
    customerRegistrationNumber: '7654321',
    customerAddress: 'Cesta 24. junija 15, 4000 Kranj',
    issueDate: '2025-05-20',
    serviceDateFrom: '2025-05-15',
    serviceDateTo: '2025-05-19',
    dueDate: '2025-06-19',
    paymentTermDays: 30,
    items: createItems([{ 
      serviceId: 's2', 
      quantity: 1,
      parcelNumber: '525/8',
      cadastralMunicipality: '1434 Šiška',
      itemNote: 'Elaborat za gradbeno dovoljenje (stornirano)'
    }]),
    discountPercent: 0,
    ...(() => {
      const items = createItems([{ 
        serviceId: 's2', 
        quantity: 1,
        parcelNumber: '525/8',
        cadastralMunicipality: '1434 Šiška',
        itemNote: 'Elaborat za gradbeno dovoljenje (stornirano)'
      }])
      const totals = calculateTotalsForInvoice(items, 0)
      return { totalNet: totals.totalNetAfterItemDiscounts, totalVat: totals.totalVat, totalGross: totals.totalGross, vatBreakdown: totals.vatBreakdown, totalNetBeforeDiscount: totals.totalNetBeforeDiscount, totalItemDiscounts: totals.totalItemDiscounts, invoiceDiscountAmount: totals.invoiceDiscountAmount, finalNetBase: totals.finalNetBase }
    })(),
    status: 'cancelled',
    cancelledReason: 'Kupec je podvojil naročilo - stornirano.',
    note: 'Stornirano na zahtevo kupca',
    createdAt: '2025-05-20T10:00:00Z',
    updatedAt: '2025-05-25T09:00:00Z',
  } as Invoice,
  {
    id: 'inv7',
    number: 'R-2025-0051',
    customerId: 'c3',
    customerName: 'Stanislav Horvat',
    customerTaxId: 'SI11223344',
    customerRegistrationNumber: '',
    customerAddress: 'Cesta v Mestni log 8, 1000 Ljubljana',
    issueDate: '2025-06-30',
    serviceDateFrom: '2025-06-25',
    serviceDateTo: '2025-06-29',
    dueDate: '2025-07-30',
    paymentTermDays: 30,
    items: [
      {
        id: 'item-zero-vat-1',
        description: 'Strokovno mnenje za tujino',
        quantity: 1,
        unit: 'kos',
        price: 500,
        discountPercent: 0,
        discountAmount: 0,
        netBeforeDiscount: 500,
        net: 500,
        vatRate: 0 as VatRate,
        vatAmount: 0,
        gross: 500,
        parcelNumber: '999/1',
        cadastralMunicipality: '1000 Ljubljana',
        cadastreName: 'Kataster stavb',
        landRegisterId: '1000 999/1',
        reverseCharge: false,
        vatExemptionReason: '91. člen ZDDV-1 – oprostitev pri izvozu',
        itemNote: 'Storitev opravljena za naročnika v tujini'
      } as InvoiceItem,
      {
        id: 'item-1',
        description: 'Geodetsko snemanje',
        quantity: 2,
        unit: 'ura',
        price: 150,
        discountPercent: 0,
        discountAmount: 0,
        netBeforeDiscount: 300,
        net: 300,
        vatRate: 22 as VatRate,
        vatAmount: 66,
        gross: 366,
        parcelNumber: '999/1',
        cadastralMunicipality: '1000 Ljubljana',
        cadastreName: 'Kataster stavb',
        landRegisterId: '1000 999/1',
        reverseCharge: false,
        itemNote: 'Geodetsko snemanje za izvoz v Avstrijo'
      } as InvoiceItem,
      {
        id: 'item-2',
        description: 'Izdelava elaborata',
        quantity: 1,
        unit: 'kos',
        price: 300,
        discountPercent: 0,
        discountAmount: 0,
        netBeforeDiscount: 300,
        net: 300,
        vatRate: 22 as VatRate,
        vatAmount: 66,
        gross: 366,
        parcelNumber: '999/1',
        cadastralMunicipality: '1000 Ljubljana',
        cadastreName: 'Kataster stavb',
        landRegisterId: '1000 999/1',
        reverseCharge: false,
        itemNote: 'Izdelava elaborata za izvoz - oprostitev DDV'
      } as InvoiceItem
    ],
    discountPercent: 0,
    totalNet: 1100,
    totalVat: 132,
    totalGross: 1232,
    totalNetBeforeDiscount: 1100,
    totalItemDiscounts: 0,
    totalNetAfterItemDiscounts: 1100,
    invoiceDiscountAmount: 0,
    finalNetBase: 1100,
    vatBreakdown: { 22: 132, 9.5: 0, 5: 0, 0: 0 },
    status: 'issued',
    note: 'Račun za izvozne storitve - oprostitev DDV po 91. členu ZDDV-1.',
    createdAt: '2025-06-30T10:00:00Z',
    updatedAt: '2025-06-30T10:00:00Z',
  } as Invoice,
  {
    id: 'inv8',
    number: 'R-2025-0057',
    customerId: 'c4',
    customerName: 'Občina Ljubljana',
    customerTaxId: '56789012',
    customerRegistrationNumber: '3456789',
    customerAddress: 'Mestni trg 1, 1000 Ljubljana',
    issueDate: '2025-07-01',
    serviceDateFrom: '2025-06-25',
    serviceDateTo: '2025-06-30',
    dueDate: '2025-08-01',
    paymentTermDays: 30,
    items: createItems([{ serviceId: 's1', quantity: 10, parcelNumber: '1000/1', cadastralMunicipality: '1000 Ljubljana', itemNote: 'Obsežno geodetsko snemanje' }]),
    discountPercent: 0,
    ...(() => {
      const items = createItems([{ serviceId: 's1', quantity: 10, parcelNumber: '1000/1', cadastralMunicipality: '1000 Ljubljana', itemNote: 'Obsežno geodetsko snemanje' }])
      const totals = calculateTotalsForInvoice(items, 0)
      return { totalNet: totals.totalNetAfterItemDiscounts, totalVat: totals.totalVat, totalGross: totals.totalGross, vatBreakdown: totals.vatBreakdown }
    })(),
    status: 'partially_paid',
    note: 'Kupec je plačal 50% vrednosti računa.',
    createdAt: '2025-07-01T08:00:00Z',
    updatedAt: '2025-08-15T10:00:00Z',
    paidAt: '2025-08-15T10:00:00Z',
  } as Invoice,

{
  id: 'inv9',
  number: 'R-2025-0058',
  customerId: 'c5',
  customerName: 'Gradnja Marles d.o.o.',
  customerTaxId: 'SI44332211',
  customerRegistrationNumber: '8765432',
  customerAddress: 'Poslovna cona A 12, 2000 Maribor',
  issueDate: '2025-07-10',
  serviceDateFrom: '2025-07-01',
  serviceDateTo: '2025-07-09',
  dueDate: '2025-08-10',
  paymentTermDays: 30,
  items: createItems([{ serviceId: 's3', quantity: 5, parcelNumber: '333/7', cadastralMunicipality: '2000 Maribor', itemNote: 'Kompleksna parcelacija' }]),
  discountPercent: 10,
  ...(() => {
    const items = createItems([{ serviceId: 's3', quantity: 5, parcelNumber: '333/7', cadastralMunicipality: '2000 Maribor', itemNote: 'Kompleksna parcelacija' }])
    const totals = calculateTotalsForInvoice(items, 10)
    return { totalNet: totals.totalNetAfterItemDiscounts, totalVat: totals.totalVat, totalGross: totals.totalGross, vatBreakdown: totals.vatBreakdown }
  })(),
  status: 'partially_paid',
  note: 'Plačano 30% - dogovorjeno obročno plačilo.',
  createdAt: '2025-07-10T09:00:00Z',
  updatedAt: '2025-09-01T14:00:00Z',
  paidAt: '2025-09-01T14:00:00Z',
} as Invoice,

{
  id: 'inv10',
  number: 'R-2025-0059',
  customerId: 'c6',
  customerName: 'Geodetski zavod Slovenije',
  customerTaxId: 'SI99887766',
  customerRegistrationNumber: '12345678',
  customerAddress: 'Dimičeva ulica 12, 1000 Ljubljana',
  issueDate: '2025-07-15',
  serviceDateFrom: '2025-07-10',
  serviceDateTo: '2025-07-14',
  dueDate: '2025-08-15',
  paymentTermDays: 30,
  items: createItems([{ serviceId: 's4', quantity: 8, parcelNumber: '888/2', cadastralMunicipality: '1000 Ljubljana', itemNote: 'Katastrska izmera za več parcel' }]),
  discountPercent: 5,
  ...(() => {
    const items = createItems([{ serviceId: 's4', quantity: 8, parcelNumber: '888/2', cadastralMunicipality: '1000 Ljubljana', itemNote: 'Katastrska izmera za več parcel' }])
    const totals = calculateTotalsForInvoice(items, 5)
    return { totalNet: totals.totalNetAfterItemDiscounts, totalVat: totals.totalVat, totalGross: totals.totalGross, vatBreakdown: totals.vatBreakdown }
  })(),
  status: 'partially_paid',
  note: 'Plačano 60% - preostanek v 30 dneh.',
  createdAt: '2025-07-15T11:00:00Z',
  updatedAt: '2025-09-10T09:00:00Z',
  paidAt: '2025-09-10T09:00:00Z',
} as Invoice,

  
  // Dodani zapadli računi
  ...initialOverdueInvoices,
  
  // Dodani predračuni
  ...initialEstimates,
]

export const mockAuditLogs: AuditLogEntry[] = []

export const initializeAuditLogs = () => {
  mockAuditLogs.push(
    { id: 'a1', invoiceId: 'inv1', invoiceNumber: 'R-2025-0047', action: 'issued', user: 'Maja Novak', userRole: 'tajnistvo', timestamp: '2025-06-09T10:00:00Z', details: 'Račun ustvarjen iz predračuna P-2405-12' },
    { id: 'a2', invoiceId: 'inv1', invoiceNumber: 'R-2025-0047', action: 'sent', user: 'Maja Novak', userRole: 'tajnistvo', timestamp: '2025-06-09T10:30:00Z', details: 'Račun poslan po e-pošti na naslov info@kranj.si' },
    { id: 'a3', invoiceId: 'inv1', invoiceNumber: 'R-2025-0047', action: 'paid', user: 'Igor Žagar', userRole: 'direktor', timestamp: '2025-07-10T14:00:00Z', details: 'Račun označen kot plačan - plačilo prispelo na TRR' },
    { id: 'a4', invoiceId: 'inv2', invoiceNumber: 'R-2025-0048', action: 'issued', user: 'Ana Kuhar', userRole: 'projektant', timestamp: '2025-06-15T09:00:00Z', details: 'Račun ustvarjen na podlagi terenskega dela' },
    { id: 'a5', invoiceId: 'inv2', invoiceNumber: 'R-2025-0048', action: 'status_changed', user: 'Sistem', userRole: 'auto', timestamp: '2025-07-16T00:00:00Z', details: 'Račun samodejno označen kot zapadel - rok plačila potekel', oldValue: 'izdan', newValue: 'zapadel' },
    { id: 'a6', invoiceId: 'inv3', invoiceNumber: 'R-2025-0049', action: 'issued', user: 'Maja Novak', userRole: 'tajnistvo', timestamp: '2025-06-20T08:00:00Z', details: 'Račun ustvarjen' },
    { id: 'a7', invoiceId: 'inv3', invoiceNumber: 'R-2025-0049', action: 'edited', user: 'Maja Novak', userRole: 'tajnistvo', timestamp: '2025-06-20T08:30:00Z', details: 'Popravljena cena pri postavki Geodetsko snemanje', oldValue: '140,00 €', newValue: '150,00 €' },
    { id: 'a8', invoiceId: 'inv3', invoiceNumber: 'R-2025-0049', action: 'sent', user: 'Maja Novak', userRole: 'tajnistvo', timestamp: '2025-06-21T11:00:00Z', details: 'Račun poslan po e-pošti na naslov stanislav.horvat@gmail.com' },
    { id: 'a9', invoiceId: 'inv4', invoiceNumber: 'R-2025-0050', action: 'issued', user: 'Igor Žagar', userRole: 'direktor', timestamp: '2025-06-25T13:00:00Z', details: 'Račun ustvarjen - čaka na pošiljanje' },
    { id: 'a10', invoiceId: 'inv5', invoiceNumber: 'OSNUTEK', action: 'issued', user: 'Ana Kuhar', userRole: 'projektant', timestamp: '2025-06-28T09:30:00Z', details: 'Osnutek računa ustvarjen' },
    { id: 'a11', invoiceId: 'inv5', invoiceNumber: 'OSNUTEK', action: 'edited', user: 'Ana Kuhar', userRole: 'projektant', timestamp: '2025-06-28T10:00:00Z', details: 'Dodana parcela 333/7, k.o. Maribor' },
    { id: 'a12', invoiceId: 'inv6', invoiceNumber: 'R-2025-0046', action: 'issued', user: 'Maja Novak', userRole: 'tajnistvo', timestamp: '2025-05-20T10:00:00Z', details: 'Račun ustvarjen' },
    { id: 'a13', invoiceId: 'inv6', invoiceNumber: 'R-2025-0046', action: 'sent', user: 'Maja Novak', userRole: 'tajnistvo', timestamp: '2025-05-20T10:30:00Z', details: 'Račun poslan po e-pošti' },
    { id: 'a14', invoiceId: 'inv6', invoiceNumber: 'R-2025-0046', action: 'cancelled', user: 'Maja Novak', userRole: 'tajnistvo', timestamp: '2025-05-25T09:00:00Z', details: 'Račun storniran - Razlog: Kupec je podvojil naročilo' },
    
    // Audit logi za predračune
    { id: 'a15', invoiceId: 'est1', invoiceNumber: 'PR-2026-0001', action: 'issued', user: 'Maja Novak', userRole: 'tajnistvo', timestamp: '2026-05-01T09:00:00Z', details: 'Predračun ustvarjen' },
    { id: 'a16', invoiceId: 'est1', invoiceNumber: 'PR-2026-0001', action: 'sent', user: 'Maja Novak', userRole: 'tajnistvo', timestamp: '2026-05-02T10:00:00Z', details: 'Predračun poslan po e-pošti' },
    { id: 'a17', invoiceId: 'est2', invoiceNumber: 'PR-2026-0002', action: 'issued', user: 'Igor Žagar', userRole: 'direktor', timestamp: '2026-05-10T11:00:00Z', details: 'Predračun ustvarjen' },
    { id: 'a18', invoiceId: 'est3', invoiceNumber: 'PR-2026-0003', action: 'issued', user: 'Ana Kuhar', userRole: 'projektant', timestamp: '2026-05-15T14:00:00Z', details: 'Predračun ustvarjen' },
    { id: 'a19', invoiceId: 'est3', invoiceNumber: 'PR-2026-0003', action: 'sent', user: 'Ana Kuhar', userRole: 'projektant', timestamp: '2026-05-16T09:00:00Z', details: 'Predračun poslan po e-pošti' },
    { id: 'a20', invoiceId: 'est7', invoiceNumber: 'PR-2026-0007', action: 'status_changed', user: 'Sistem', userRole: 'tajnistvo', timestamp: '2026-06-10T14:00:00Z', details: 'Predračun spremenjen v račun', oldValue: 'izdan', newValue: 'spremenjen v račun' },
    
    //kasneje dodana
    { id: 'a21', invoiceId: 'inv8', invoiceNumber: 'R-2025-0057', action: 'issued', user: 'Maja Novak', userRole: 'tajnistvo', timestamp: '2025-07-01T08:00:00Z', details: 'Račun ustvarjen na podlagi naročila Občine Ljubljana' },
    { id: 'a22', invoiceId: 'inv8', invoiceNumber: 'R-2025-0057', action: 'sent', user: 'Maja Novak', userRole: 'tajnistvo', timestamp: '2025-07-01T09:30:00Z', details: 'Račun poslan po e-pošti na naslov info@ljubljana.si' },
    { id: 'a23', invoiceId: 'inv8', invoiceNumber: 'R-2025-0057', action: 'viewed', user: 'Ana Kovač', userRole: 'tajnistvo', timestamp: '2025-07-02T10:00:00Z', details: 'Račun pregledan s strani tajništva Občine Ljubljana' },
    { id: 'a24', invoiceId: 'inv8', invoiceNumber: 'R-2025-0057', action: 'partially_paid', user: 'Igor Žagar', userRole: 'direktor', timestamp: '2025-07-15T12:00:00Z', details: 'Prejeto delno plačilo v višini 750€ (50% zneska). Stanje: delno plačano', oldValue: 'issued', newValue: 'partially_paid' },
    { id: 'a25', invoiceId: 'inv8', invoiceNumber: 'R-2025-0057', action: 'alert_sent', user: 'Sistem', userRole: 'auto', timestamp: '2025-08-01T08:00:00Z', details: 'Samodejno opozorilo za neplačani del računa poslano tajništvu' },
    { id: 'a26', invoiceId: 'inv8', invoiceNumber: 'R-2025-0057', action: 'paid', user: 'Maja Novak', userRole: 'tajnistvo', timestamp: '2025-08-15T10:00:00Z', details: 'Prejeto preostalo plačilo 750€. Račun v celoti poravnan.', oldValue: 'partially_paid', newValue: 'paid' },
    { id: 'a27', invoiceId: 'inv9', invoiceNumber: 'R-2025-0058', action: 'issued', user: 'Ana Kuhar', userRole: 'projektant', timestamp: '2025-07-10T09:00:00Z', details: 'Račun ustvarjen po opravljeni parcelaciji' },
    { id: 'a28', invoiceId: 'inv9', invoiceNumber: 'R-2025-0058', action: 'edited', user: 'Ana Kuhar', userRole: 'projektant', timestamp: '2025-07-10T09:30:00Z', details: 'Popravljena količina postavk', oldValue: '3 ure', newValue: '5 ur' },
    { id: 'a29', invoiceId: 'inv9', invoiceNumber: 'R-2025-0058', action: 'sent', user: 'Ana Kuhar', userRole: 'projektant', timestamp: '2025-07-11T08:00:00Z', details: 'Račun poslan direktorju v pregled' },
    { id: 'a30', invoiceId: 'inv9', invoiceNumber: 'R-2025-0058', action: 'viewed', user: 'Igor Žagar', userRole: 'direktor', timestamp: '2025-07-11T10:00:00Z', details: 'Direktor pregledal račun - odobril' },
    { id: 'a31', invoiceId: 'inv9', invoiceNumber: 'R-2025-0058', action: 'sent', user: 'Igor Žagar', userRole: 'direktor', timestamp: '2025-07-12T09:00:00Z', details: 'Račun poslan kupcu Gradnja Marles d.o.o.' },
    { id: 'a32', invoiceId: 'inv9', invoiceNumber: 'R-2025-0058', action: 'partially_paid', user: 'Maja Novak', userRole: 'tajnistvo', timestamp: '2025-08-01T13:00:00Z', details: 'Plačano 30% zneska. Dogovorjeno obročno plačilo.', oldValue: 'sent', newValue: 'partially_paid' },
    { id: 'a33', invoiceId: 'inv9', invoiceNumber: 'R-2025-0058', action: 'paid', user: 'Maja Novak', userRole: 'tajnistvo', timestamp: '2025-09-01T14:00:00Z', details: 'Prejeto preostalih 70% - račun v celoti poravnan.', oldValue: 'partially_paid', newValue: 'paid' },

    // Bogata zgodovina za est8 (converted)
    { id: 'a34', invoiceId: 'est8', invoiceNumber: 'PR-2026-0008', action: 'issued', user: 'Maja Novak', userRole: 'tajnistvo', timestamp: '2026-06-01T10:00:00Z', details: 'Predračun ustvarjen na podlagi telefonskega naročila' },
    { id: 'a35', invoiceId: 'est8', invoiceNumber: 'PR-2026-0008', action: 'edited', user: 'Maja Novak', userRole: 'tajnistvo', timestamp: '2026-06-02T09:00:00Z', details: 'Dodana parcela 555/1, k.o. Šiška', oldValue: 'brez podatkov', newValue: 'št. parcele: 555/1' },
    { id: 'a36', invoiceId: 'est8', invoiceNumber: 'PR-2026-0008', action: 'sent', user: 'Maja Novak', userRole: 'tajnistvo', timestamp: '2026-06-03T11:00:00Z', details: 'Predračun poslan kupcu po e-pošti' },
    { id: 'a37', invoiceId: 'est8', invoiceNumber: 'PR-2026-0008', action: 'viewed', user: 'Stanislav Horvat', userRole: 'zunanji', timestamp: '2026-06-05T14:00:00Z', details: 'Kupec pregledal predračun - potrdil' },
    { id: 'a38', invoiceId: 'est8', invoiceNumber: 'PR-2026-0008', action: 'converted', user: 'Maja Novak', userRole: 'tajnistvo', timestamp: '2026-06-15T12:00:00Z', details: 'Predračun spremenjen v račun R-2026-0045', oldValue: 'predračun', newValue: 'račun' },

    // Bogata zgodovina za est9 (converted)
    { id: 'a39', invoiceId: 'est9', invoiceNumber: 'PR-2026-0009', action: 'issued', user: 'Ana Kuhar', userRole: 'projektant', timestamp: '2026-06-10T09:00:00Z', details: 'Predračun ustvarjen na podlagi ponudbe' },
    { id: 'a40', invoiceId: 'est9', invoiceNumber: 'PR-2026-0009', action: 'sent', user: 'Ana Kuhar', userRole: 'projektant', timestamp: '2026-06-11T10:00:00Z', details: 'Predračun poslan po e-pošti' },
    { id: 'a41', invoiceId: 'est9', invoiceNumber: 'PR-2026-0009', action: 'overdue', user: 'Sistem', userRole: 'auto', timestamp: '2026-07-11T00:00:00Z', details: 'Predračun zapadel - ni bil potrjen v roku', oldValue: 'sent', newValue: 'overdue' },
    { id: 'a42', invoiceId: 'est9', invoiceNumber: 'PR-2026-0009', action: 'converted', user: 'Igor Žagar', userRole: 'direktor', timestamp: '2026-07-15T10:00:00Z', details: 'Kljub zamudi odobreno - predračun spremenjen v račun R-2026-0050', oldValue: 'overdue', newValue: 'converted' },

    // Bogata zgodovina za inv7 (izvoz)
    { id: 'a43', invoiceId: 'inv7', invoiceNumber: 'R-2025-0051', action: 'issued', user: 'Maja Novak', userRole: 'tajnistvo', timestamp: '2025-06-30T10:00:00Z', details: 'Račun ustvarjen za izvozne storitve' },
    { id: 'a44', invoiceId: 'inv7', invoiceNumber: 'R-2025-0051', action: 'edited', user: 'Maja Novak', userRole: 'tajnistvo', timestamp: '2025-06-30T10:30:00Z', details: 'Dodana opomba o oprostitvi DDV po 91. členu' },
    { id: 'a45', invoiceId: 'inv7', invoiceNumber: 'R-2025-0051', action: 'sent', user: 'Maja Novak', userRole: 'tajnistvo', timestamp: '2025-07-01T09:00:00Z', details: 'Račun poslan kupcu v Sloveniji' },
    { id: 'a46', invoiceId: 'inv7', invoiceNumber: 'R-2025-0051', action: 'viewed', user: 'Stanislav Horvat', userRole: 'zunanji', timestamp: '2025-07-02T11:00:00Z', details: 'Kupec pregledal račun' },
    { id: 'a47', invoiceId: 'inv7', invoiceNumber: 'R-2025-0051', action: 'paid', user: 'Maja Novak', userRole: 'tajnistvo', timestamp: '2025-07-20T13:00:00Z', details: 'Plačilo prispelo na TRR - račun poravnan', oldValue: 'issued', newValue: 'paid' },
      
  )
}

initializeAuditLogs()