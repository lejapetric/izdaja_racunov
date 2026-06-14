// src/components/invoice/InvoiceView.tsx
import { useInvoices } from '@/hooks/useInvoices'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { formatCurrency, formatDate } from '@/lib/utils'
import { Printer, Edit, Mail, CheckCircle, Ban, FileText, Package } from 'lucide-react'
import { useRef } from 'react'
import { companyData, statusLabels } from '@/data/mockData'

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
  documentType?: 'invoice' | 'estimate' | 'draft'
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
  documentType = 'invoice'
}: InvoiceViewProps) {
  const { invoices, customers } = useInvoices()
  const invoice = invoices.find(inv => inv.id === invoiceId)
  const customer = invoice ? customers.find(c => c.id === invoice.customerId) : null
  const printRef = useRef<HTMLDivElement>(null)

  if (!invoice) return null

  // Funkcije za naslove glede na tip dokumenta
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

  const vatBreakdown: Record<number, { base: number; amount: number }> = { 22: { base: 0, amount: 0 }, 9.5: { base: 0, amount: 0 }, 5: { base: 0, amount: 0 }, 0: { base: 0, amount: 0 } }
  invoice.items.forEach(item => {
    const itemBase = item.net
    const discountShare = (invoiceDiscountPercent / 100) * itemBase
    const baseAfterDiscount = itemBase - discountShare
    vatBreakdown[item.vatRate].base += baseAfterDiscount
    vatBreakdown[item.vatRate].amount += baseAfterDiscount * (item.vatRate / 100)
  })

  const totalNetAfterDiscount = invoice.totalNet - (invoice.totalNet * invoiceDiscountPercent / 100)
  const totalVatAmount = Object.values(vatBreakdown).reduce((sum, v) => sum + v.amount, 0)
  const totalGrossAfterDiscount = totalNetAfterDiscount + totalVatAmount

  const qrData = `UPNQR\n\n${companyData.name}\n${companyData.address}\n${companyData.trr}\n\n\n\n${invoice.customerName}\n${customer?.address || ''}, ${invoice.customerTaxId || ''}\n\n${totalGrossAfterDiscount.toFixed(2)}\nEUR\nSI00 ${invoice.number}\n${getDocumentTitle()} št. ${invoice.number}\n`
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodeURIComponent(qrData)}`
  const customerAddress = customer?.address || ''
  const customerTaxId = invoice.customerTaxId || (customer?.taxId || '')

  const getStatusColor = () => {
    switch (invoice.status) {
      case 'paid': return 'bg-green-100 text-green-800'
      case 'overdue': return 'bg-red-100 text-red-800'
      case 'cancelled': return 'bg-gray-100 text-gray-800'
      case 'sent': return 'bg-blue-100 text-blue-800'
      default: return 'bg-yellow-100 text-yellow-800'
    }
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
              body { margin: 0; padding: 20px; background: white; height: auto; min-height: 100vh; }
              .print-invoice-container { padding: 0; margin: 0; min-height: 100vh; display: flex; flex-direction: column; }
              button, .no-print { display: none !important; }
            }
            .print-invoice-container { max-width: 1200px; margin: 0 auto; background: white; display: flex; flex-direction: column; min-height: 100vh; }
            .print-content { flex: 1; }
            .print-footer { margin-top: auto; }
            * { font-size: 8pt !important; line-height: 1.3 !important; }
            h1 { font-size: 12pt !important; font-weight: bold !important; }
            .text-2xl { font-size: 14pt !important; }
            .text-lg { font-size: 11pt !important; }
            table { width: 100%; border-collapse: collapse; }
            th, td { padding: 4px 6px !important; }
            th { font-weight: bold; background-color: #f3f4f6; }
            td:first-child { word-break: break-word; white-space: normal; max-width: 200px; }
            td:not(:first-child) { white-space: nowrap; }
            img { max-width: 80px !important; height: auto !important; }
            .grid { display: flex; flex-wrap: wrap; }
            .border-t, .border-b { border-top-width: 1px !important; border-bottom-width: 1px !important; }
            .mt-auto { margin-top: auto; }
          </style>
        </head>
        <body style="padding: 20px; background: white; margin: 0;">
          <div class="print-invoice-container">
            <div class="print-content">
              ${printContent.innerHTML}
            </div>
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
              
              <div className="flex-1">
                <div className="flex justify-between items-start mb-4 pb-3 relative z-10">
                  <div className="space-y-0">
                    <h1 className="text-lg font-bold">{companyData.name}</h1>
                    <p className="text-sm text-gray-500">{companyData.address}</p>
                    <p className="text-sm text-gray-500">ID za DDV: {companyData.taxId}</p>
                    <p className="text-sm text-gray-500">TRR: {companyData.trr}</p>
                    <p className="text-sm text-gray-500">BIC: {companyData.bic}</p>
                    <p className="text-sm text-gray-500">T: {companyData.phone}</p>
                    <p className="text-sm text-gray-500">E: {companyData.email}</p>
                  </div>

                  <div className="text-right">
                    <div className="text-2xl font-bold">{getDocumentTitle()}</div>
                    <div className="text-sm font-mono mb-2">{invoice.number}</div>
                    <div className="text-sm">
                      <p>Datum storitve: {formatDate(invoice.serviceDateFrom)} - {formatDate(invoice.serviceDateTo)}</p>
                      <p>Datum izdaje: {formatDate(invoice.issueDate)}</p>
                      {documentType === 'invoice' && (
                        <p>Datum zapadlosti: {formatDate(invoice.dueDate)}</p>
                      )}
                      <p>Rok plačila: {invoice.paymentTermDays} dni</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6 mb-6 relative z-10">
                  <div>
                    <div className="text-md font-bold uppercase text-gray-500">PREJEMNIK</div>
                    <div>
                      <p className="font-bold text-gray-800">{invoice.customerName}</p>
                      <p className="text-sm text-gray-700">{customerAddress}</p>
                      {customerTaxId && (
                        <p className="text-sm text-gray-700">
                          <span>ID za DDV:</span> {customerTaxId}
                        </p>
                      )}
                      {invoice.customerRegistrationNumber && (
                        <p className="text-sm text-gray-700">
                          <span>Matična številka:</span> {invoice.customerRegistrationNumber}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="status-badge-print-hide">
                      <span className={`inline-block px-8 py-2 rounded-full text-lg font-bold ${getStatusColor()}`}>
                        {statusLabels[invoice.status]}
                      </span>
                    </div>
                  </div>
                </div>
                
                <table className="w-full text-sm border-collapse mb-4 relative z-10">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="text-left p-2">Opis</th>
                      <th className="text-right p-2">Količina</th>
                      <th className="text-right p-2">Enota</th>
                      <th className="text-right p-2">Cena/Enoto</th>
                      <th className="text-right p-2">Popust</th>
                      <th className="text-right p-2">Neto</th>
                      <th className="text-right p-2">DDV</th>
                      <th className="text-right p-2">Znesek DDV</th>
                      <th className="text-right p-2">Bruto</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoice.items.map(item => (
                      <tr key={item.id} className="border-b">
                        <td className="p-2">
                          <div className="font-medium">{item.description}</div>
                          {item.vatRate === 0 && item.vatExemptionReason && (
                            <div className="text-xs text-gray-500 mt-1">{item.vatExemptionReason}</div>
                          )}
                          {(item.parcelNumber || item.cadastralMunicipality || item.cadastreName || item.landRegisterId) && (
                            <div className="text-xs text-gray-500 mt-1 space-y-0.5">
                              {item.parcelNumber && <div>št. parcele: {item.parcelNumber}</div>}
                              {item.cadastralMunicipality && <div>kat. občina: {item.cadastralMunicipality}</div>}
                              {(item.cadastreName || (item.parcelNumber && 'Kataster stavb')) && (
                                <div>ime katastra: {item.cadastreName || 'Kataster stavb'}</div>
                              )}
                              {(item.landRegisterId || (item.parcelNumber && item.cadastralMunicipality && 
                                `${item.cadastralMunicipality.split(' ')[0]} ${item.parcelNumber}`)) && (
                                <div>ID zaznambe: {item.landRegisterId || `${item.cadastralMunicipality?.split(' ')[0]} ${item.parcelNumber}`}</div>
                              )}
                            </div>
                          )}
                          {item.itemNote && <div className="text-xs text-gray-500 mt-0.5">{item.itemNote}</div>}
                        </td>
                        <td className="text-right p-2">{item.quantity}</td>
                        <td className="text-right p-2">{item.unit}</td>
                        <td className="text-right p-2">{formatCurrency(item.price)}</td>
                        <td className="text-right p-2">{(item.discountPercent ?? 0) > 0 ? `${item.discountPercent ?? 0}%` : '0%'}</td>
                        <td className="text-right p-2">{formatCurrency(item.net)}</td>
                        <td className="text-right p-2">{item.vatRate}%</td>
                        <td className="text-right p-2 font-medium">{formatCurrency(item.vatAmount)}</td>
                        <td className="text-right p-2 font-medium">{formatCurrency(item.gross)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                
                <div className="flex gap-6 mb-6 relative z-10">
                  {invoice.note && (
                    <div className="flex-1">
                      <div className="text-xs font-bold uppercase text-gray-500 mb-1">OPOMBE</div>
                      <div className="text-sm text-gray-700">{invoice.note}</div>
                    </div>
                  )}
                  
                  <div className={invoice.note ? "w-100" : "ml-auto w-100"}>
                    <span className="text-xs font-medium text-gray-500">DDV po stopnjah:</span>
                    {Object.entries(vatBreakdown).map(([rate, data]) => data.base > 0 && (
                      <div key={rate} className="flex justify-between text-sm py-0">
                        <span className="text-sm text-gray-500">DDV stopnje {rate}%:</span>
                        <span className="text-sm text-gray-500">{formatCurrency(data.amount)}</span>
                      </div>
                    ))}
                    <div className="flex justify-between text-sm py-1">
                      <span className="text-gray-500">Skupni DDV:</span>
                      <span className="text-sm text-gray-500">{formatCurrency(invoice.totalVat)}</span>
                    </div>
                    <div className="flex justify-between text-base font-bold pt-2 mt-1 border-t-2 border-gray-800">
                      <span>SKUPAJ ZA PLAČILO (z DDV):</span>
                      <span className="ml-8">{formatCurrency(totalGrossAfterDiscount)}</span>
                    </div>
                    <div className="flex justify-between text-base pt-1">
                      <span className="text-xs text-gray-500">Skupni znesek (brez DDV):</span>
                      <span className="text-xs text-gray-500">{formatCurrency(invoice.finalNetBase || totalNetAfterDiscount)}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Podatki za plačilo - samo za račune */}
              {documentType === 'invoice' && (
                <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t relative z-10">
                  <div>
                    <div className="text-sm font-bold uppercase text-gray-500">PODATKI ZA PLAČILO</div>
                    <p className="text-sm">IBAN: <strong>{companyData.trr}</strong></p>
                    <p className="text-sm">Banka: {companyData.bank}</p>
                    <p className="text-sm">BIC/SWIFT: {companyData.bic}</p>
                    <p className="text-sm">Sklic: SI00 {invoice.number}</p>
                    <p className="text-sm">Namen: {getDocumentTitle()} št. {invoice.number}</p>
                  </div>
                  <div>
                    <div className="text-sm font-bold uppercase text-gray-500">NAČIN PLAČILA</div>
                    <p className="text-sm">Bančno nakazilo</p>
                    <p className="text-sm">Rok plačila: {formatDate(invoice.dueDate)}</p>
                  </div>
                  <div className="text-center">
                    <img src={qrCodeUrl} alt="UPN QR koda" className="mx-auto w-24 h-24" />
                    <p className="text-sm text-gray-500">Skenirajte za hitro plačilo</p>
                  </div>
                </div>
              )}
              
              <div className="mt-4 pt-3 border-t text-center relative z-10">
                <p className="text-xs text-gray-400">
                  {documentType === 'draft' && 'Osnutek računa - ni pravno veljaven dokument.'}
                  {documentType === 'estimate' && 'Predračun nima pravne veljave.'}
                  {documentType === 'invoice' && 'Račun je izdan v skladu z Zakonom o davku na dodano vrednost (ZDDV-1).'}
                </p>
                <p className="text-xs text-gray-400">{companyData.name} • {companyData.address} • Matična št.: {companyData.registrationNumber} • ID za DDV: {companyData.taxId} • TRR: {companyData.trr}</p>
              </div>
            </div>
          </div>
          
          <div className="w-72 shrink-0 border-l pl-6">
            <div className="sticky top-0">
              <h3 className="font-semibold text-lg mb-4">Akcije</h3>
              <div className="space-y-2">
                <Button variant="outline" className="w-full justify-start" onClick={handlePrint}>
                  <Printer className="w-4 h-4 mr-2" /> Natisni
                </Button>
                <Button variant="outline" className="w-full justify-start" onClick={() => onEdit?.(invoice)}>
                  <Edit className="w-4 h-4 mr-2" /> Uredi
                </Button>
                <Button variant="outline" className="w-full justify-start" onClick={() => onSendEmail?.(invoice)}>
                  <Mail className="w-4 h-4 mr-2" /> Pošlji e-mail
                </Button>
                <Button variant="outline" className="w-full justify-start" onClick={() => onSendPost?.(invoice)}>
                  <Package className="w-4 h-4 mr-2" /> Pošlji po pošti
                </Button>
                {documentType === 'invoice' && invoice.status !== 'paid' && invoice.status !== 'draft' && (
                  <Button variant="outline" className="w-full justify-start" onClick={() => onMarkAsPaid?.(invoice.id)}>
                    <CheckCircle className="w-4 h-4 mr-2" /> Označi kot plačano
                  </Button>
                )}
                {documentType === 'estimate' && invoice.status !== 'paid' && invoice.status !== 'cancelled' && (
                  <Button variant="outline" className="w-full justify-start" onClick={() => onMarkAsPaid?.(invoice.id)}>
                    <CheckCircle className="w-4 h-4 mr-2" /> Ustvari račun
                  </Button>
                )}
                {invoice.status !== 'cancelled' &&  invoice.status !== 'draft' && (
                  <Button variant="outline" className="w-full justify-start" onClick={() => onCancel?.(invoice)}>
                    <Ban className="w-4 h-4 mr-2" /> Storniraj
                  </Button>
                )}
                <Button variant="outline" className="w-full justify-start" onClick={() => onAudit?.(invoice)}>
                  <FileText className="w-4 h-4 mr-2" /> Dnevnik sprememb
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}