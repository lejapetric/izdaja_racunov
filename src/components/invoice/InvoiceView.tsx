import { useInvoices } from '@/hooks/useInvoices'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { formatCurrency, formatDate } from '@/lib/utils'
import { useRef, useState } from 'react'
import { companyData, statusColors, statusLabels, mockServices } from '@/data/mockData'
import { Printer, Edit, Mail, Ban, FileText, Package, ArrowRight, Calendar, Clock, Send, X, Trash2 } from 'lucide-react'

interface InvoiceViewProps {
  invoiceId: string | null
  open: boolean
  onClose: () => void
  onEdit?: (invoice: any) => void
  onSendEmail?: (invoice: any) => void
  onSendPost?: (invoice: any) => void
  onMarkAsPaid?: (invoiceId: string) => void
  onCancel?: (invoice: any) => void
  onAudit?: (invoice: any) => void
  onDelete?: (invoiceId: string) => void  // <-- NOVO
  documentType?: 'invoice' | 'estimate' | 'draft'
}

const getItemCode = (item: any) => {
  const service = mockServices.find(s => 
    s.name === item.description || 
    item.serviceId === s.id
  )
  return service?.code || '—'
}

// POMOŽNA FUNKCIJA ZA OBLIKOVANJE ŠTEVILK S TISOČKIM LOČILOM (PIKO)
const formatNumberWithCommas = (value: number): string => {
  const withDecimalComma = value.toFixed(2).replace('.', ',')
  const parts = withDecimalComma.split(',')
  let integerPart = parts[0]
  const decimalPart = parts[1]
  integerPart = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, '.')
  return integerPart + ',' + decimalPart
}

// Funkcija za izračun dni zamude
const calculateDaysOverdue = (dueDate: string): number => {
  const today = new Date()
  const due = new Date(dueDate)
  const diffTime = today.getTime() - due.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return diffDays > 0 ? diffDays : 0
}

export function InvoiceView({ 
  invoiceId, 
  open, 
  onClose, 
  onEdit, 
  onSendEmail, 
  onSendPost,
  onMarkAsPaid, 
  onCancel, 
  onAudit,
  onDelete,  // <-- NOVO
  documentType = 'invoice'
}: InvoiceViewProps) {
  const { invoices, customers } = useInvoices()
  const invoice = invoices.find(inv => inv.id === invoiceId)
  const customer = invoice ? customers.find(c => c.id === invoice.customerId) : null
  const printRef = useRef<HTMLDivElement>(null)
  
  // State za modalno okno opomina
  const [reminderDialogOpen, setReminderDialogOpen] = useState(false)
  const [reminderEmail, setReminderEmail] = useState('')
  const [reminderSubject, setReminderSubject] = useState('')
  const [reminderMessage, setReminderMessage] = useState('')
  const [isSending, setIsSending] = useState(false)
  
  // State za modalno okno brisanja
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  if (!invoice) return null

  const getDocumentTitle = () => {
    if (documentType === 'draft') return 'OSNUTEK RAČUNA'
    if (documentType === 'estimate') return 'PREDRAČUN'
    return 'RAČUN'
  }

  const getDialogTitle = () => {
    if (documentType === 'draft') return 'Osnutek'
    if (documentType === 'estimate') return 'Predračun'
    return 'Račun'
  }

  const invoiceDiscountPercent = invoice.discountPercent ?? 0

  // Izračun DDV po stopnjah za spodnjo tabelo
  const vatBreakdownSummary: Record<number, { base: number; amount: number }> = { 
    22: { base: 0, amount: 0 }, 
    9.5: { base: 0, amount: 0 }, 
    5: { base: 0, amount: 0 }, 
    0: { base: 0, amount: 0 } 
  }
  
  invoice.items.forEach(item => {
    const itemBase = item.net
    const discountShare = (invoiceDiscountPercent / 100) * itemBase
    const baseAfterDiscount = itemBase - discountShare
    vatBreakdownSummary[item.vatRate].base += baseAfterDiscount
    vatBreakdownSummary[item.vatRate].amount += baseAfterDiscount * (item.vatRate / 100)
  })

  const totalNetAfterDiscount = invoice.totalNet - (invoice.totalNet * invoiceDiscountPercent / 100)
  const totalVatAmount = Object.values(vatBreakdownSummary).reduce((sum, v) => sum + v.amount, 0)
  const totalGrossAfterDiscount = totalNetAfterDiscount + totalVatAmount

  const qrData = `UPNQR\n\n${companyData.name}\n${companyData.address}\n${companyData.trr}\n\n\n\n${invoice.customerName}\n${customer?.address || ''}, ${invoice.customerTaxId || ''}\n\n${totalGrossAfterDiscount.toFixed(2)}\nEUR\nSI00 ${invoice.number}\n${getDocumentTitle()} št. ${invoice.number}\n`
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodeURIComponent(qrData)}`
  const customerAddress = customer?.address || ''
  const customerTaxId = invoice.customerTaxId || (customer?.taxId || '')
  
  // Pridobi e-poštni naslov kupca (iz customer-ja ali iz invoice)
  const customerEmail = customer?.email || ''

  // Pripravi podatke za opomin
  const daysOverdue = calculateDaysOverdue(invoice.dueDate)
  const formattedAmount = formatNumberWithCommas(invoice.totalGross)

  // Funkcija za odpiranje modalnega okna za opomin
  const openReminderDialog = () => {
    setReminderEmail(customerEmail)
    setReminderSubject(`Opomin za plačilo - račun št. ${invoice.number}`)
    setReminderMessage(`Spoštovani,

Opominjamo vas, da je račun št. ${invoice.number} z dne ${formatDate(invoice.issueDate)} v znesku ${formattedAmount} EUR zapadel v plačilo dne ${formatDate(invoice.dueDate)}.

Trenutno stanje zamude: ${daysOverdue} dni.

Prosimo, da račun poravnate v najkrajšem možnem času.

Lep pozdrav,
${companyData.name}`)
    setReminderDialogOpen(true)
  }

  // Funkcija za pošiljanje opomina
  const handleSendReminder = async () => {
    setIsSending(true)
    
    // Simulacija pošiljanja (tu bi klical tvoj API)
    console.log('Pošiljam opomin:', {
      to: reminderEmail,
      subject: reminderSubject,
      message: reminderMessage
    })
    
    // Počakaj 1 sekundo za simulacijo
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    alert(`Opomin uspešno poslan na naslov: ${reminderEmail}`)
    setIsSending(false)
    setReminderDialogOpen(false)
  }

  // Funkcija za brisanje osnutka
  const handleDelete = () => {
    setDeleteDialogOpen(true)
  }

  // Potrditev brisanja
  const confirmDelete = () => {
    setIsDeleting(true)
    
    // Simulacija brisanja
    setTimeout(() => {
      if (onDelete) {
        onDelete(invoice.id)
      }
      setIsDeleting(false)
      setDeleteDialogOpen(false)
      onClose()
    }, 500)
  }

  // Pomožna funkcija za prikaz geodetskih podatkov z vejicami
  const getGeoDetails = (item: any) => {
    const details = []
    if (item.parcelNumber) details.push(`št. parcele: ${item.parcelNumber}`)
    if (item.cadastralMunicipality) details.push(`kat. občina: ${item.cadastralMunicipality}`)
    if (item.cadastreName || (item.parcelNumber && 'Kataster stavb')) {
      details.push(`ime katastra: ${item.cadastreName || 'Kataster stavb'}`)
    }
    if (item.landRegisterId || (item.parcelNumber && item.cadastralMunicipality && 
      `${item.cadastralMunicipality.split(' ')[0]} ${item.parcelNumber}`)) {
      details.push(`ID zaznambe: ${item.landRegisterId || `${item.cadastralMunicipality?.split(' ')[0]} ${item.parcelNumber}`}`)
    }
    return details.join(', ')
  }

  const handlePrint = () => {
    if (!printRef.current) return
    
    const iframe = document.createElement('iframe')
    iframe.style.position = 'absolute'
    iframe.style.width = '0'
    iframe.style.height = '0'
    iframe.style.border = 'none'
    document.body.appendChild(iframe)
    
    const iframeDoc = iframe.contentWindow?.document
    if (!iframeDoc) {
      document.body.removeChild(iframe)
      return
    }
    
    const printContent = printRef.current.cloneNode(true) as HTMLElement
    
    const watermark = printContent.querySelector('.watermark')
    if (watermark) watermark.remove()
    
    const statusBadge = printContent.querySelector('.status-badge-print-hide')
    if (statusBadge) statusBadge.remove()
    
    const styles = document.querySelectorAll('link[rel="stylesheet"], style')
    let stylesHtml = ''
    styles.forEach(style => {
      if (style.tagName === 'LINK') {
        const link = style as HTMLLinkElement
        stylesHtml += `<link rel="stylesheet" href="${link.href}">`
      } else if (style.tagName === 'STYLE') {
        stylesHtml += style.outerHTML
      }
    })
    
    iframeDoc.open()
    iframeDoc.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${getDocumentTitle()} ${invoice.number}</title>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          ${stylesHtml}
          <style>
            @media print {
              body { margin: 0; padding: 0; background: white; }
              .print-invoice-container { padding: 20px; margin: 0 auto; width: 100%; max-width: 1200px; box-sizing: border-box; }
              button, .no-print, .status-badge-print-hide, .action-buttons { display: none !important; }
              table { width: 100%; border-collapse: collapse; }
              td, th { padding: 8px; font-size: 10pt; }
              .text-right { text-align: right; }
              .text-center { text-align: center; }
              .bg-gray-100 { background-color: #f3f4f6; }
              .border-b { border-bottom: 1px solid #ddd; }
              .border-t { border-top: 1px solid #ddd; }
              .border-t-2 { border-top: 2px solid #000; }
              .font-bold { font-weight: bold; }
            }
            .print-invoice-container { max-width: 1200px; margin: 0 auto; background: white; font-family: Arial, sans-serif; }
            table { width: 100%; border-collapse: collapse; }
            th, td { border-bottom: 1px solid #ddd; padding: 8px; text-align: left; vertical-align: top; }
            th { background-color: #f3f4f6; }
            .text-right { text-align: right; }
            .text-center { text-align: center; }
            .font-bold { font-weight: bold; }
            .border-t { border-top: 1px solid #ddd; }
            .border-t-2 { border-top: 2px solid #000; }
            .border-b { border-bottom: 1px solid #ddd; }
            .bg-gray-100 { background-color: #f3f4f6; }
          </style>
        </head>
        <body>
          <div class="print-invoice-container">
            ${printContent.innerHTML}
          </div>
        </body>
      </html>
    `)
    iframeDoc.close()
    
    setTimeout(() => {
      iframe.contentWindow?.focus()
      iframe.contentWindow?.print()
      setTimeout(() => {
        if (iframe && iframe.parentNode) {
          document.body.removeChild(iframe)
        }
      }, 500)
    }, 500)
  }

  return (
    <>
      <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
        <DialogContent className="max-w-7xl w-[95vw] h-[90vh] bg-white p-0 flex flex-col [&>button:first-child]:hidden">
          <DialogHeader className="flex flex-row justify-between items-center border-b pb-3 px-6 pt-6 shrink-0">
            <DialogTitle className="text-gray-700">
              {getDialogTitle()} {invoice.number}
            </DialogTitle>
          </DialogHeader>
          
          <div className="flex flex-1 overflow-hidden p-6 pt-4 gap-6">
            <div className="flex-1 overflow-y-auto pr-2">
              <div ref={printRef} className="bg-white flex flex-col min-h-full relative">
                {/* Watermark */}
                <div className="watermark hidden print:hidden" style={{ 
                  position: 'absolute', 
                  top: '50%', 
                  left: '50%', 
                  transform: 'translate(-50%, -50%) rotate(-45deg)',
                  fontSize: '60px',
                  fontWeight: 'bold',
                  color: 'rgba(0,0,0,0.05)',
                  whiteSpace: 'nowrap',
                  pointerEvents: 'none',
                  zIndex: 0
                }}>
                  {documentType === 'draft' && 'OSNUTEK'}
                  {documentType === 'estimate' && (invoice.status === 'paid' ? 'SPREMENJEN V RAČUN' : 'PREDRAČUN')}
                  {documentType === 'invoice' && statusLabels[invoice.status]?.toUpperCase()}
                </div>
                
                <div className="flex-1 relative z-10">
                  {/* Header - podatki o prodajalcu in kupcu */}
                  <div className="flex justify-between items-start mb-6 pb-3 border-b">
                    <div className="space-y-1">
                      <h1 className="text-xl font-bold">{companyData.name}</h1>
                      <p className="text-sm text-gray-600">{companyData.address}</p>
                      <p className="text-sm text-gray-600">ID za DDV: {companyData.taxId}</p>
                      <p className="text-sm text-gray-600">TRR: {companyData.trr}</p>
                      <p className="text-sm text-gray-600">BIC: {companyData.bic}</p>
                      <p className="text-sm text-gray-600">T: {companyData.phone}</p>
                      <p className="text-sm text-gray-600">E: {companyData.email}</p>
                    </div>

                    <div className="text-right">
                      <div className="text-2xl font-bold mb-2">{getDocumentTitle()}</div>
                      <div className="text-lg font-mono mb-3">{invoice.number}</div>
                      <div className="text-sm space-y-1">
                        <p><strong>Datum storitve:</strong> {formatDate(invoice.serviceDateFrom)} - {formatDate(invoice.serviceDateTo)}</p>
                        <p><strong>Datum izdaje:</strong> {formatDate(invoice.issueDate)}</p>
                        {documentType === 'invoice' && (
                          <p><strong>Datum zapadlosti:</strong> {formatDate(invoice.dueDate)}</p>
                        )}
                        <p><strong>Rok plačila:</strong> {invoice.paymentTermDays} dni</p>
                      </div>
                    </div>
                  </div>

                  {/* Kupec in statusna oznaka - v isti vrstici */}
                  <div className="flex justify-between items-start mb-6">
                    <div className="flex-1">
                      <div className="text-sm font-bold uppercase text-gray-500 mb-2">PREJEMNIK</div>
                      <div>
                        <p className="font-bold text-gray-800">{invoice.customerName}</p>
                        <p className="text-sm text-gray-700">{customerAddress}</p>
                        {customerTaxId && (
                          <p className="text-sm text-gray-700">ID za DDV: {customerTaxId}</p>
                        )}

                        {customerEmail && (
                          <p className="text-sm text-gray-700">E-pošta: {customerEmail}</p>
                        )}
                      </div>
                    </div>
                    
                    {/* Statusna oznaka - desno */}
                    <div className="status-badge-print-hide">
                      <span className={`inline-block px-6 py-2 rounded-full text-md font-bold ${statusColors[invoice.status]}`}>
                        {statusLabels[invoice.status]}
                      </span>
                    </div>
                  </div>

                  {/* Tabela postavk */}
                  <table className="w-full border-collapse mb-4 table-auto">
                    <thead>
                      <tr className="border-b border-black bg-gray-200">
                        <th className="text-left p-2 w-16">Ident</th>
                        <th className="text-left p-2">Naziv</th>
                        <th className="text-right p-2 w-20">Količina</th>
                        <th className="text-right p-2 w-16">EM</th>
                        <th className="text-right p-2 w-20">Cena</th>
                        <th className="text-right p-2 w-16">R%</th>
                        <th className="text-right p-2 w-16">DDV%</th>
                        <th className="text-right p-2 w-24">Znesek z DDV</th>
                      </tr>
                    </thead>
                    <tbody>
                      {invoice.items.map((item, idx) => (
                        <tr key={item.id} className="border-b">
                          <td className="p-2 align-top whitespace-nowrap">{getItemCode(item)}</td>
                          <td className="p-2 align-top">
                            <div className="font-medium whitespace-normal">{item.description}</div>
                            {item.vatRate === 0 && item.vatExemptionReason && (
                              <div className="text-xs text-gray-500 mt-1 whitespace-normal">{item.vatExemptionReason}</div>
                            )}
                            {getGeoDetails(item) && (
                              <div className="text-xs text-gray-500 mt-1 whitespace-normal">{getGeoDetails(item)}</div>
                            )}
                            {item.itemNote && <div className="text-xs text-gray-500 mt-0.5 whitespace-normal">{item.itemNote}</div>}
                          </td>
                          <td className="text-right p-2 whitespace-nowrap">{formatNumberWithCommas(item.quantity)}</td>
                          <td className="text-right p-2 whitespace-nowrap">{item.unit}</td>
                          <td className="text-right p-2 whitespace-nowrap">{formatNumberWithCommas(item.price)}</td>
                          <td className="text-right p-2 whitespace-nowrap">{formatNumberWithCommas(item.discountPercent ?? 0)}</td>
                          <td className="text-right p-2 whitespace-nowrap">{formatNumberWithCommas(item.vatRate)}</td>
                          <td className="text-right p-2 font-medium whitespace-nowrap">{formatNumberWithCommas(item.gross)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {/* Skupaj, DDV in za plačilo - desno poravnano - BREZ OZNAKE € pri Skupaj */}
                  <div className="flex justify-end mt-4">
                    <div className="w-80">
                      <div className="flex justify-between py-1">
                        <span>Skupaj</span>
                        <span>{formatNumberWithCommas(totalNetAfterDiscount)}</span>
                      </div>
                      <div className="flex justify-between py-1">
                        <span>DDV:</span>
                        <span>{formatNumberWithCommas(totalVatAmount)}</span>
                      </div>
                      <div className="flex justify-between py-2 mt-1 border-t-2 border-black font-bold">
                        <span className="w-1/3">Za plačilo</span>
                        <span className="w-1/3 text-left pl-4">EUR</span>
                        <span className="w-1/3 text-right">{formatNumberWithCommas(totalGrossAfterDiscount)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Tabela z DDV po stopnjah - BREZ OZNAKE € */}
                  <div className="mt-6">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="border-b border-black bg-gray-200">
                          <th className="text-left p-2">DAVČNE STOPNJE</th>
                          <th className="text-right p-2">Osnova</th>
                          <th className="text-right p-2">DDV</th>
                          <th className="text-right p-2">Vrednost</th>
                        </tr>
                      </thead>
                      <tbody>
                        {Object.entries(vatBreakdownSummary)
                          .filter(([_, data]) => data.base > 0)
                          .map(([rate, data]) => (
                            <tr key={rate} className="border-b">
                              <td className="p-2">DDV od prometa storitev - {rate}%</td>
                              <td className="text-right p-2">{formatNumberWithCommas(data.base)}</td>
                              <td className="text-right p-2">{formatNumberWithCommas(data.amount)}</td>
                              <td className="text-right p-2">{formatNumberWithCommas(data.base + data.amount)}</td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Opombe */}
                  {invoice.note && (
                    <div className="mt-6">
                      <div className="text-sm text-gray-700 whitespace-normal">{invoice.note}</div>
                    </div>
                  )}
                  
                  {/* Podatki za plačilo - samo za račune */}
                    <div className="grid grid-cols-3 gap-4 mt-6 pt-4 border-t">
                      <div>
                        <div className="text-sm font-bold uppercase text-gray-500 mb-2">PODATKI ZA PLAČILO</div>
                        <p className="text-sm">IBAN: <strong>{companyData.trr}</strong></p>
                        <p className="text-sm">Banka: {companyData.bank}</p>
                        <p className="text-sm">BIC/SWIFT: {companyData.bic}</p>
                        <p className="text-sm">Sklic: SI00 {invoice.number}</p>
                        <p className="text-sm">Namen: {getDocumentTitle()} št. {invoice.number}</p>
                      </div>
                      <div>
                        <div className="text-sm font-bold uppercase text-gray-500 mb-2">NAČIN PLAČILA</div>
                        <p className="text-sm">Bančno nakazilo</p>
                        <p className="text-sm">Rok plačila: {formatDate(invoice.dueDate)}</p>
                      </div>
                      <div className="text-center">
                        <img src={qrCodeUrl} alt="UPN QR koda" className="mx-auto w-24 h-24" />
                        <p className="text-sm text-gray-500">Skenirajte za hitro plačilo</p>
                      </div>
                    </div>
                
                  
                  {/* Footer */}
                  <div className="mt-6 pt-3 border-t text-center">
                    <p className="text-xs text-gray-400">
                      {documentType === 'draft' && 'Osnutek računa - ni pravno veljaven dokument.'}
                      {documentType === 'estimate' && 'Predračun nima pravne veljave.'}
                      {documentType === 'invoice' && 'Račun je izdan v skladu z Zakonom o davku na dodano vrednost (ZDDV-1).'}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      {companyData.name} • {companyData.address} • Matična št.: {companyData.registrationNumber} • ID za DDV: {companyData.taxId} • TRR: {companyData.trr}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Akcije - desna stran */}
            <div className="w-72 shrink-0 border-l pl-6 action-buttons">
              <div className="sticky top-0">
                <h3 className="font-semibold text-lg mb-4">Akcije</h3>
                <div className="space-y-2">
                  <Button variant="outline" className="w-full justify-start" onClick={handlePrint}>
                    <Printer className="w-4 h-4 mr-2" /> Natisni
                  </Button>
                  <Button variant="outline" className="w-full justify-start" onClick={() => onEdit?.(invoice)}>
                    <Edit className="w-4 h-4 mr-2" /> Uredi
                  </Button>
                  
                  {/* Gumb za brisanje - samo za osnutke */}
                  {documentType === 'draft' && (
                    <Button 
                      variant="outline" 
                      className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200 hover:border-red-300"
                      onClick={handleDelete}
                    >
                      <Trash2 className="w-4 h-4 mr-2" /> Izbriši
                    </Button>
                  )}
                  
                  <Button variant="outline" className="w-full justify-start" onClick={() => onSendEmail?.(invoice)}>
                    <Mail className="w-4 h-4 mr-2" /> Pošlji e-mail
                  </Button>
                  <Button variant="outline" className="w-full justify-start" onClick={() => onSendPost?.(invoice)}>
                    <Package className="w-4 h-4 mr-2" /> Pošlji po pošti
                  </Button>
                  {documentType === 'estimate' && invoice.status === 'issued' && (
                    <Button 
                      variant="outline" 
                      className="w-full justify-start" 
                      onClick={() => {
                        // Zapri trenutni pogled
                        onClose()
                        // Pokliči onEdit s podatki predračuna
                        onEdit?.({
                          ...invoice,
                          _isEstimateConversion: true,  // oznaka da gre za pretvorbo iz predračuna
                          _sourceType: 'estimate'
                        })
                      }}
                    >
                      <ArrowRight className="w-4 h-4 mr-2" /> Ustvari račun
                    </Button>
                  )}
                  {invoice.status !== 'cancelled' && invoice.status !== 'draft' && (
                    <Button variant="outline" className="w-full justify-start" onClick={() => onCancel?.(invoice)}>
                      <Ban className="w-4 h-4 mr-2" /> Storniraj
                    </Button>
                  )}
                  <Button variant="outline" className="w-full justify-start" onClick={() => onAudit?.(invoice)}>
                    <FileText className="w-4 h-4 mr-2" /> Dnevnik sprememb
                  </Button>
                  {documentType === 'invoice' && invoice.status === 'overdue' && (
                    <Button variant="outline" className="w-full justify-start" onClick={openReminderDialog}>
                      <Send className="w-4 h-4 mr-2" /> Pošlji opomin
                    </Button>
                  )}
                </div>

<<<<<<< HEAD
=======
                {/* Delno plačani računi */}
                {documentType === 'invoice' && invoice.status === 'partially_paid' && (
                  <div className="mt-8 p-4 bg-orange-50 rounded-lg border border-orange-200">
                    <h4 className="font-bold text-orange-800 mb-3">PREGLED PLAČILA</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm">Skupni znesek:</span>
                        <span className="font-bold">{formatCurrency(invoice.totalGross)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Plačano do sedaj:</span>
                        <span className="font-bold text-black-600">{formatCurrency(invoice.totalGross * 0.5)}</span>
                      </div>
                      <div className="flex justify-between pt-1 border-t border-orange-200">
                        <span className="text-sm font-medium">Preostanek:</span>
                        <span className="font-bold text-orange-600">{formatCurrency(invoice.totalGross * 0.5)}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-500 pt-2">
                        <Calendar className="w-3 h-3" />
                        <span>Zadnje plačilo: 15.08.2025</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <Clock className="w-3 h-3" />
                        <span>Rok plačila: {formatDate(invoice.dueDate)}</span>
                      </div>
                    </div>
                  </div>
                )}
>>>>>>> f3c581a3979ac6051779d502ee579f727a56fccc
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* MODALNO OKNO ZA POŠILJANJE OPOMINA */}
      <Dialog open={reminderDialogOpen} onOpenChange={(isOpen) => !isOpen && setReminderDialogOpen(false)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Send className="w-5 h-5" />
              Pošlji opomin - račun {invoice.number}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">E-poštni naslov prejemnika</label>
              <input
                type="email"
                value={reminderEmail}
                onChange={(e) => setReminderEmail(e.target.value)}
                placeholder="email@example.com"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Zadeva</label>
              <input
                type="text"
                value={reminderSubject}
                onChange={(e) => setReminderSubject(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Sporočilo</label>
              <textarea
                value={reminderMessage}
                onChange={(e) => setReminderMessage(e.target.value)}
                rows={12}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
              />
            </div>
          </div>
          
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline" onClick={() => setReminderDialogOpen(false)}>
              Prekliči
            </Button>
            <Button onClick={handleSendReminder} disabled={isSending} className="gap-2">
              {isSending ? (
                <>Pošiljanje...</>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Pošlji opomin
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* MODALNO OKNO ZA BRISANJE OSNUTKA */}
      <Dialog open={deleteDialogOpen} onOpenChange={(isOpen) => !isOpen && setDeleteDialogOpen(false)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <Trash2 className="w-5 h-5" />
              Izbriši osnutek
            </DialogTitle>
          </DialogHeader>
          
          <div className="py-6 space-y-4">
            <div className="bg-red-50 border border-red-200 rounded-lg p-5">
              <div className="flex items-start gap-3">
                <Trash2 className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-base font-semibold text-red-800">OPOZORILO!</p>
                  <p className="text-sm text-red-700 mt-2 leading-relaxed">
                    Ali ste prepričani, da želite izbrisati osnutek{' '}
                    <span className="font-semibold">{invoice.number}</span>?
                  </p>
                  <p className="text-sm text-red-600 mt-2">
                    To dejanje bo trajno izbrisalo osnutek iz sistema in{' '}
                    <span className="font-semibold underline">ga ne bo mogoče razveljaviti</span>.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-gray-500">Kupec:</span>
                  <div className="font-medium">{invoice.customerName}</div>
                </div>
                <div>
                  <span className="text-gray-500">Znesek:</span>
                  <div className="font-medium">{formatCurrency(invoice.totalGross)}</div>
                </div>
                <div>
                  <span className="text-gray-500">Datum izdaje:</span>
                  <div className="font-medium">{formatDate(invoice.issueDate)}</div>
                </div>
                <div>
                  <span className="text-gray-500">Št. postavk:</span>
                  <div className="font-medium">{invoice.items.length}</div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Prekliči
            </Button>
            <Button 
              variant="destructive" 
              onClick={confirmDelete} 
              disabled={isDeleting}
              className="gap-2"
            >
              {isDeleting ? (
                <>Brisanje...</>
              ) : (
                <>
                  <Trash2 className="w-4 h-4" />
                  Izbriši osnutek
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}