// src/components/invoice/InvoiceView.tsx
import { useInvoices } from '@/hooks/useInvoices'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { formatCurrency, formatDate } from '@/lib/utils'
import { Printer, X } from 'lucide-react'
import { useRef } from 'react'
import { companyData, statusLabels, statusColors } from '@/data/mockData'
import { InvoiceActions } from './InvoiceActions'

interface InvoiceViewProps {
  invoiceId: string | null
  open: boolean
  onClose: () => void
  onEdit?: (invoice: any) => void
  onSendEmail?: (invoice: any) => void
  onMarkAsPaid?: (invoiceId: string) => void
  onCancel?: (invoice: any) => void
  onAudit?: (invoice: any) => void
}

export function InvoiceView({ 
  invoiceId, 
  open, 
  onClose, 
  onEdit, 
  onSendEmail, 
  onMarkAsPaid, 
  onCancel, 
  onAudit 
}: InvoiceViewProps) {
  const { invoices, customers } = useInvoices()
  const invoice = invoices.find(inv => inv.id === invoiceId)
  const customer = invoice ? customers.find(c => c.id === invoice.customerId) : null
  const printRef = useRef<HTMLDivElement>(null)

  if (!invoice) return null

  const vatBreakdown: Record<number, { base: number; amount: number }> = { 22: { base: 0, amount: 0 }, 9.5: { base: 0, amount: 0 }, 5: { base: 0, amount: 0 }, 0: { base: 0, amount: 0 } }
  invoice.items.forEach(item => {
    const itemBase = item.net
    const discountShare = (invoice.discountPercent / 100) * itemBase
    const baseAfterDiscount = itemBase - discountShare
    vatBreakdown[item.vatRate].base += baseAfterDiscount
    vatBreakdown[item.vatRate].amount += baseAfterDiscount * (item.vatRate / 100)
  })

  const totalNetAfterDiscount = invoice.totalNet - (invoice.totalNet * invoice.discountPercent / 100)
  const totalVatAmount = Object.values(vatBreakdown).reduce((sum, v) => sum + v.amount, 0)
  const totalGrossAfterDiscount = totalNetAfterDiscount + totalVatAmount

  const qrData = `UPNQR\n\n${companyData.name}\n${companyData.address}\n${companyData.trr}\n\n\n\n${invoice.customerName}\n${customer?.address || ''}, ${invoice.customerTaxId || ''}\n\n${totalGrossAfterDiscount.toFixed(2)}\nEUR\nSI00 ${invoice.number}\nRačun št. ${invoice.number}\n`
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodeURIComponent(qrData)}`
  const customerAddress = customer?.address || ''
  const customerTaxId = invoice.customerTaxId || (customer?.taxId || '')

  // Status badge barva glede na status
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
    const printWindow = window.open('', '_blank', 'height=900,width=900')
    if (!printWindow) return

    const styles = `* { margin: 0; padding: 0; box-sizing: border-box; } body { font-family: 'Helvetica Neue', Arial, sans-serif; font-size: 11px; line-height: 1.4; color: #1a1a1a; background: white; padding: 20px; } @media print { body { padding: 0; } } .invoice-container { max-width: 800px; margin: 0 auto; background: white; position: relative; } .watermark { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%) rotate(-45deg); font-size: 80px; font-weight: bold; color: rgba(0,0,0,0.05); white-space: nowrap; pointer-events: none; z-index: 0; } @media print { .watermark { color: rgba(0,0,0,0.05); } } .invoice-header { display: flex; justify-content: space-between; margin-bottom: 20px; padding-bottom: 10px; border-bottom: 1px solid #ddd; position: relative; z-index: 1; } .company-info h1 { font-size: 14px; font-weight: bold; margin-bottom: 5px; } .company-info p { font-size: 8px; color: #555; margin: 2px 0; } .invoice-title { text-align: right; } .invoice-title .title { font-size: 18px; font-weight: bold; letter-spacing: 2px; } .invoice-title .number { font-size: 11px; margin-top: 5px; color: #555; } .two-columns { display: flex; justify-content: space-between; margin-bottom: 15px; position: relative; z-index: 1; } .info-box { flex: 1; } .info-box-label { font-size: 7px; font-weight: bold; text-transform: uppercase; color: #666; margin-bottom: 3px; } .info-box-content { font-size: 9px; } .info-box-content p { margin: 2px 0; } .status-badge { display: inline-block; padding: 2px 8px; border-radius: 12px; font-size: 9px; font-weight: bold; } table { width: 100%; border-collapse: collapse; margin: 15px 0; font-size: 9px; position: relative; z-index: 1; } th { text-align: left; padding: 6px 4px; background: #f5f5f5; font-weight: bold; border-bottom: 1px solid #ddd; } td { padding: 5px 4px; border-bottom: 1px solid #eee; } td:last-child, th:last-child { text-align: right; } .vat-summary { float: right; width: 260px; margin: 15px 0; position: relative; z-index: 1; } .vat-row { display: flex; justify-content: space-between; padding: 4px 0; font-size: 9px; border-bottom: 1px solid #eee; } .vat-total { font-weight: bold; border-top: 2px solid #333; padding-top: 6px; margin-top: 4px; } .payment-info { margin-top: 20px; padding-top: 10px; border-top: 1px solid #ddd; position: relative; z-index: 1; } .payment-grid { display: flex; justify-content: space-between; gap: 20px; } .payment-column { flex: 1; } .payment-label { font-size: 7px; font-weight: bold; text-transform: uppercase; color: #666; margin-bottom: 3px; } .qr-container { text-align: center; } .qr-container img { width: 70px; height: 70px; } .footer { margin-top: 20px; padding-top: 10px; border-top: 1px solid #ddd; font-size: 7px; color: #999; text-align: center; position: relative; z-index: 1; } .clearfix { clear: both; }`

    const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Račun ${invoice.number}</title><style>${styles}</style></head><body><div class="invoice-container">${printRef.current.innerHTML}</div></body></html>`
    printWindow.document.write(html)
    printWindow.document.close()
    setTimeout(() => printWindow.print(), 250)
  }

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-w-7xl w-[95vw] h-[90vh] bg-white p-0 flex flex-col">
        <DialogHeader className="flex flex-row justify-between items-center border-b pb-3 px-6 pt-6 shrink-0">
          <DialogTitle className="text-gray-700">Račun {invoice.number}</DialogTitle>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={handlePrint}>
              <Printer className="w-4 h-4 mr-1" /> Natisni
            </Button>
            <Button size="sm" variant="ghost" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </DialogHeader>
        
        <div className="flex flex-1 overflow-hidden p-6 pt-4 gap-6">
          {/* Levi stolpec - PDF vsebina s scrollom */}
          <div className="flex-1 overflow-y-auto pr-2">
            <div ref={printRef} className="bg-white relative">
              {/* Watermark - samo za prikaz, pri printu izgine */}
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
                {statusLabels[invoice.status]?.toUpperCase()}
              </div>
              
              {/* Header */}
              <div className="flex justify-between items-start mb-4 pb-3 border-b relative z-10">
                <div>
                  <h1 className="text-lg font-bold">{companyData.name}</h1>
                  <p className="text-xs text-gray-500">{companyData.address}</p>
                  <p className="text-xs text-gray-500">ID za DDV: {companyData.taxId} | Matična št.: {companyData.registrationNumber}</p>
                  <p className="text-xs text-gray-500">TRR: {companyData.trr} | BIC: {companyData.bic}</p>
                  <p className="text-xs text-gray-500">T: {companyData.phone} | E: {companyData.email}</p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold">RAČUN</div>
                  <div className="text-sm font-mono">{invoice.number}</div>
                </div>
              </div>
              
              {/* Prejemnik in podatki */}
              <div className="grid grid-cols-2 gap-4 mb-4 relative z-10">
                <div>
                  <div className="text-xs font-bold uppercase text-gray-500">PREJEMNIK</div>
                  <div className="text-sm">
                    <p className="font-medium">{invoice.customerName}</p>
                    <p className="text-xs">{customerAddress}</p>
                    {customerTaxId && <p className="text-xs">ID za DDV: {customerTaxId}</p>}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs font-bold uppercase text-gray-500">PODATKI RAČUNA</div>
                  <div className="text-sm">
                    <p>Datum izdaje: {formatDate(invoice.issueDate)}</p>
                    <p>Datum storitve: {formatDate(invoice.serviceDateFrom)} - {formatDate(invoice.serviceDateTo)}</p>
                    <p>Datum zapadlosti: {formatDate(invoice.dueDate)}</p>
                    <p>Rok plačila: {invoice.paymentTermDays} dni</p>
                  </div>
                  <div className="mt-2">
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${getStatusColor()}`}>
                      {statusLabels[invoice.status]}
                    </span>
                  </div>
                </div>
              </div>
              
              {/* Tabela postavk */}
              <table className="w-full text-sm border-collapse mb-4 relative z-10">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="text-left p-2">Opis</th>
                    <th className="text-right p-2">Količina</th>
                    <th className="text-right p-2">Cena (€)</th>
                    <th className="text-right p-2">Popust</th>
                    <th className="text-right p-2">Neto (€)</th>
                    <th className="text-right p-2">DDV</th>
                    <th className="text-right p-2">Bruto (€)</th>
                  </tr>
                </thead>
                <tbody>
                  {invoice.items.map(item => (
                    <tr key={item.id} className="border-b">
                      <td className="p-2">
                        {item.description}
                        {item.parcelNumber && <div className="text-xs text-gray-400">Parcela {item.parcelNumber}</div>}
                      </td>
                      <td className="text-right p-2">{item.quantity} {item.unit}</td>
                      <td className="text-right p-2">{formatCurrency(item.price)}</td>
                      <td className="text-right p-2">{item.discountPercent > 0 ? `${item.discountPercent}%` : '-'}</td>
                      <td className="text-right p-2">{formatCurrency(item.net)}</td>
                      <td className="text-right p-2">{item.vatRate}%</td>
                      <td className="text-right p-2 font-medium">{formatCurrency(item.gross)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              {/* DDV povzetek */}
              <div className="flex justify-end mb-4 relative z-10">
                <div className="w-72">
                  <div className="flex justify-between text-sm py-1 border-b">
                    <span>Skupaj neto pred popustom:</span>
                    <span>{formatCurrency(invoice.totalNet)}</span>
                  </div>
                  {invoice.discountPercent > 0 && (
                    <div className="flex justify-between text-sm py-1 border-b">
                      <span>Popust na račun ({invoice.discountPercent}%):</span>
                      <span>- {formatCurrency(invoice.totalNet * invoice.discountPercent / 100)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm py-1 border-b">
                    <span>Skupaj neto po popustu:</span>
                    <span>{formatCurrency(totalNetAfterDiscount)}</span>
                  </div>
                  {Object.entries(vatBreakdown).map(([rate, data]) => data.base > 0 && (
                    <div key={rate} className="flex justify-between text-sm py-1 border-b">
                      <span>DDV {rate}% (od {formatCurrency(data.base)}):</span>
                      <span>{formatCurrency(data.amount)}</span>
                    </div>
                  ))}
                  <div className="flex justify-between text-base font-bold pt-2 mt-1 border-t-2 border-gray-800">
                    <span>SKUPAJ ZA PLAČILO (z DDV):</span>
                    <span>{formatCurrency(totalGrossAfterDiscount)}</span>
                  </div>
                </div>
              </div>
              
              {/* Podatki za plačilo */}
              <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t relative z-10">
                <div>
                  <div className="text-xs font-bold uppercase text-gray-500">PODATKI ZA PLAČILO</div>
                  <p className="text-sm">IBAN: <strong>{companyData.trr}</strong></p>
                  <p className="text-xs">Banka: {companyData.bank}</p>
                  <p className="text-xs">BIC/SWIFT: {companyData.bic}</p>
                  <p className="text-xs">Sklic: SI00 {invoice.number}</p>
                  <p className="text-xs">Namen: Račun št. {invoice.number}</p>
                </div>
                <div>
                  <div className="text-xs font-bold uppercase text-gray-500">NAČIN PLAČILA</div>
                  <p className="text-sm">Bančno nakazilo</p>
                  <p className="text-xs">Rok plačila: {formatDate(invoice.dueDate)}</p>
                </div>
                <div className="text-center">
                  <img src={qrCodeUrl} alt="UPN QR koda" className="w-20 h-20 mx-auto" />
                  <p className="text-xs text-gray-500">Skenirajte za hitro plačilo</p>
                </div>
              </div>
              
              {/* Opombe in footer */}
              {invoice.note && (
                <div className="mt-4 pt-3 border-t relative z-10">
                  <p className="text-xs text-gray-600"><strong>Opombe:</strong> {invoice.note}</p>
                </div>
              )}
              
              <div className="mt-4 pt-3 border-t text-center relative z-10">
                <p className="text-xs text-gray-400">Račun je izdan v skladu z Zakonom o davku na dodano vrednost (ZDDV-1).</p>
                <p className="text-xs text-gray-400">{companyData.name} • {companyData.address} • ID za DDV: {companyData.taxId} • TRR: {companyData.trr}</p>
              </div>
            </div>
          </div>
          
          {/* Desni stolpec - Akcije (fiksno) */}
          <div className="w-72 shrink-0 border-l pl-6">
            <div className="sticky top-0">
              <h3 className="font-semibold text-lg mb-4">Akcije</h3>
              <InvoiceActions 
                invoice={invoice}
                onPrint={handlePrint}
                onEdit={onEdit || (() => {})}
                onSendEmail={onSendEmail || (() => {})}
                onMarkAsPaid={onMarkAsPaid || (() => {})}
                onCancel={onCancel || (() => {})}
                onDelete={() => {}}
                onAudit={onAudit || (() => {})}
              />
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}