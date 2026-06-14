// src/components/OverdueAlerts.tsx
import { useState } from 'react'
import { useInvoices } from '@/hooks/useInvoices'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { formatCurrency, formatDate } from '@/lib/utils'
import { Mail, CheckCircle, Eye, AlertCircle, Clock, Package, Send } from 'lucide-react'
import { InvoiceView } from '../invoice/InvoiceView'

export function OverdueAlerts() {
  const { invoices, updateInvoice, customers } = useInvoices()
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string | null>(null)
  
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
  
  const overdue = invoices.filter(inv => inv.status === 'overdue')
  const totalOverdue = overdue.reduce((sum, inv) => sum + inv.totalGross, 0)

  const handleMarkAsPaid = (invoiceId: string) => {
    if (confirm('Ali ste prepričani, da želite označiti ta račun kot plačan?')) {
      updateInvoice(invoiceId, { 
        status: 'paid', 
        paidAt: new Date().toISOString() 
      })
    }
  }

  // Email functions
  const openEmailModal = (invoice: any) => {
    setEmailInvoice(invoice)
    setEmailSubject(`Opomin - zapadli račun ${invoice.number} - GeoFaktura`)
    setEmailBody(`Spoštovani,\n\nOpominjamo vas, da je račun št. ${invoice.number} z dne ${formatDate(invoice.issueDate)} v skupnem znesku ${formatCurrency(invoice.totalGross)} zapadel v plačilo dne ${formatDate(invoice.dueDate)}.\n\nProsimo, da račun poravnate v najkrajšem možnem času.\n\nLep pozdrav,\nGeoFaktura tim`)
    setEmailModalOpen(true)
  }

  const handleSendEmail = () => {
    if (!emailInvoice) return
    console.log(`📧 Opomin poslan po e-pošti na naslov kupca ${emailInvoice.customerName}`)
    updateInvoice(emailInvoice.id, {
      note: emailInvoice.note ? `${emailInvoice.note}\n\n[${new Date().toLocaleDateString('sl-SI')}] Poslan opomin po e-pošti.` : `[${new Date().toLocaleDateString('sl-SI')}] Poslan opomin po e-pošti.`
    })
    setEmailModalOpen(false)
    setEmailInvoice(null)
  }

  // Post functions
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
      note: postInvoice.note ? `${postInvoice.note}\n\n[${new Date().toLocaleDateString('sl-SI')}] Poslan opomin po navadni pošti na naslov: ${postAddress}${postNote ? ` (${postNote})` : ''}` : `[${new Date().toLocaleDateString('sl-SI')}] Poslan opomin po navadni pošti na naslov: ${postAddress}${postNote ? ` (${postNote})` : ''}`
    })
    setPostModalOpen(false)
    setPostInvoice(null)
    setPostAddress('')
    setPostNote('')
  }

  if (overdue.length === 0) {
    return (
      <div className="space-y-6">
        <div><h1 className="text-2xl font-bold">Zapadli računi</h1></div>
        <Card>
          <CardContent className="pt-12 pb-12 text-center">
            <CheckCircle className="w-12 h-12 text-blue-500 mx-auto mb-3" />
            <p className="text-gray-500">Ni zapadlih računov</p>
            <p className="text-sm text-gray-400 mt-1">Vsi računi so plačani ali še niso zapadli</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Zapadli računi</h1>
        <p className="text-sm text-gray-500 mt-1">Pregled in upravljanje zapadlih računov</p>
      </div>

      <Card className="bg-red-50 border-red-200">
        <CardContent className="pt-4 pb-4">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <span className="font-medium text-red-800">{overdue.length} zapadlih računov</span>
            <span className="text-red-600">Skupaj: {formatCurrency(totalOverdue)}</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Seznam zapadlih računov</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Številka</TableHead>
                  <TableHead>Kupec</TableHead>
                  <TableHead className="text-right">Znesek</TableHead>
                  <TableHead>Datum zapadlosti</TableHead>
                  <TableHead>Dni zamude</TableHead>
                  <TableHead className="text-center">Akcije</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {overdue.map(inv => {
                  const daysLate = Math.floor((new Date().getTime() - new Date(inv.dueDate).getTime()) / (1000 * 3600 * 24))
                  return (
                    <TableRow key={inv.id}>
                      <TableCell className="font-mono">{inv.number || '-'}</TableCell>
                      <TableCell>
                        <div>{inv.customerName || '-'}</div>
                        <div className="text-xs text-gray-500">{inv.customerTaxId || '-'}</div>
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {formatCurrency(inv.totalGross)}
                      </TableCell>
                      <TableCell>{formatDate(inv.dueDate)}</TableCell>
                      <TableCell>
                        <Badge className="bg-blue-100 text-blue-800">
                          <Clock className="w-3 h-3 mr-1" />
                          {daysLate} dni
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1 justify-center">
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            title="Prikaži račun"
                            onClick={() => setSelectedInvoiceId(inv.id)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            title="Pošlji opomin po e-pošti"
                            onClick={() => openEmailModal(inv)}
                          >
                            <Mail className="w-4 h-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            title="Pošlji opomin po navadni pošti"
                            onClick={() => openPostModal(inv)}
                          >
                            <Package className="w-4 h-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            title="Označi kot plačano"
                            onClick={() => handleMarkAsPaid(inv.id)}
                          >
                            <CheckCircle className="w-4 h-4 text-green-600" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* MODAL ZA E-POŠTO - OPOMIN */}
      <Dialog open={emailModalOpen} onOpenChange={setEmailModalOpen}>
        <DialogContent className="max-w-2xl" aria-describedby={undefined}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Mail className="w-5 h-5 text-blue-600" />
              Pošlji opomin po e-pošti
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="bg-blue-50 rounded-lg p-3">
              <p className="text-sm font-medium text-blue-800">Račun: {emailInvoice?.number || '-'}</p>
              <p className="text-sm text-blue-600">Kupec: {emailInvoice?.customerName || '-'}</p>
              <p className="text-sm text-red-600 mt-1">Zapadlost: {emailInvoice?.dueDate ? formatDate(emailInvoice.dueDate) : '-'}</p>
            </div>
            
            <div>
              <label className="text-sm font-medium block mb-1">Prejemnik (e-pošta) *</label>
              <Input 
                value={customers.find(c => c.id === emailInvoice?.customerId)?.email || 'E-pošta ni vpisan'} 
                disabled 
                className="bg-gray-50" 
              />
            </div>
            
            <div>
              <label className="text-sm font-medium block mb-1">Zadeva *</label>
              <Input 
                value={emailSubject} 
                onChange={(e) => setEmailSubject(e.target.value)} 
              />
            </div>
            
            <div>
              <label className="text-sm font-medium block mb-1">Sporočilo *</label>
              <Textarea 
                value={emailBody} 
                onChange={(e) => setEmailBody(e.target.value)} 
                rows={10} 
                className="font-mono text-sm" 
              />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="ghost" onClick={() => setEmailModalOpen(false)}>Prekliči</Button>
            <Button onClick={handleSendEmail} className="bg-blue-600 hover:bg-blue-700">
              <Send className="w-4 h-4 mr-2" /> Pošlji opomin
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* MODAL ZA NAVADNO POŠTO - OPOMIN */}
      <Dialog open={postModalOpen} onOpenChange={setPostModalOpen}>
        <DialogContent className="max-w-2xl" aria-describedby={undefined}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Package className="w-5 h-5 text-amber-600" />
              Pošlji opomin po navadni pošti
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="bg-amber-50 rounded-lg p-3">
              <p className="text-sm font-medium text-amber-800">Račun: {postInvoice?.number || '-'}</p>
              <p className="text-sm text-amber-600">Kupec: {postInvoice?.customerName || '-'}</p>
              <p className="text-sm text-red-600 mt-1">Zapadlost: {postInvoice?.dueDate ? formatDate(postInvoice.dueDate) : '-'}</p>
            </div>
            
            <div>
              <label className="text-sm font-medium block mb-1">Naslov za pošiljanje *</label>
              <textarea 
                value={postAddress} 
                onChange={(e) => setPostAddress(e.target.value)} 
                className="w-full min-h-[80px] px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                placeholder="Ime in priimek / podjetje&#10;Ulica in hišna številka&#10;Poštna številka in kraj"
              />
              <p className="text-xs text-gray-500 mt-1">Preverite naslov pred pošiljanjem</p>
            </div>
            
            <div>
              <label className="text-sm font-medium block mb-1">Opomba (neobvezno)</label>
              <Input 
                value={postNote} 
                onChange={(e) => setPostNote(e.target.value)} 
                placeholder="Npr. priporočeno, s povratnico, dostava na dom..."
              />
            </div>
            
            <div className="bg-gray-50 rounded-lg p-3 text-sm">
              <p className="font-medium mb-1">📮 Potrditev pošiljanja:</p>
              <p className="text-gray-600">S klikom na "Potrdi pošiljanje" potrjujete, da ste opomin fizično poslali po navadni pošti na zgornji naslov.</p>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="ghost" onClick={() => setPostModalOpen(false)}>Prekliči</Button>
            <Button onClick={handleSendPost} className="bg-amber-600 hover:bg-amber-700">
              <Package className="w-4 h-4 mr-2" /> Potrdi pošiljanje
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Invoice View Modal */}
      <InvoiceView 
        invoiceId={selectedInvoiceId} 
        open={!!selectedInvoiceId} 
        onClose={() => setSelectedInvoiceId(null)}
        onSendEmail={(invoice: any) => {
          openEmailModal(invoice)
          setSelectedInvoiceId(null)
        }}
        onSendPost={(invoice: any) => {
          openPostModal(invoice)
          setSelectedInvoiceId(null)
        }}
        onMarkAsPaid={(invoiceId: string) => {
          handleMarkAsPaid(invoiceId)
          setSelectedInvoiceId(null)
        }}
      />
    </div>
  )
}