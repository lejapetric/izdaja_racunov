// src/components/OverdueAlerts.tsx
import { useState } from 'react'
import { useInvoices } from '@/hooks/useInvoices'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { formatCurrency, formatDate } from '@/lib/utils'
import { Mail, CheckCircle, Eye, AlertCircle, Clock, Send, Package, Ban, FileText } from 'lucide-react'
import { InvoiceView } from './invoice/InvoiceView'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'

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
  
  // Mark as Paid modal
  const [paidModalOpen, setPaidModalOpen] = useState(false)
  const [paidInvoice, setPaidInvoice] = useState<any>(null)
  
  const overdue = invoices.filter(inv => inv.status === 'overdue')
  const totalOverdue = overdue.reduce((sum, inv) => sum + inv.totalGross, 0)

  // Email modal functions
  const openEmailModal = (invoice: any) => { 
    setEmailInvoice(invoice)
    setEmailSubject(`Opomin za plačilo - Račun ${invoice.number}`)
    setEmailBody(`Spoštovani,\n\nOpominjamo vas, da je račun št. ${invoice.number} z dne ${formatDate(invoice.issueDate)} v znesku ${formatCurrency(invoice.totalGross)} zapadel ${formatDate(invoice.dueDate)}.\n\nProsimo, da račun poravnate čim prej.\n\nLep pozdrav,\nGeoFaktura`)
    setEmailModalOpen(true)
  }
  
  const handleSendEmail = () => { 
    if (!emailInvoice) return
    console.log(`📧 Opomin poslan na naslov kupca ${emailInvoice.customerName}`)
    updateInvoice(emailInvoice.id, { 
      note: emailInvoice.note 
        ? `${emailInvoice.note}\n\n[${new Date().toLocaleDateString('sl-SI')}] Poslan opomin za plačilo po e-pošti.` 
        : `[${new Date().toLocaleDateString('sl-SI')}] Poslan opomin za plačilo po e-pošti.`
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
      note: postInvoice.note ? `${postInvoice.note}\n\n[${new Date().toLocaleDateString('sl-SI')}] Poslan opomin za plačilo po navadni pošti na naslov: ${postAddress}` : `[${new Date().toLocaleDateString('sl-SI')}] Poslan opomin za plačilo po navadni pošti na naslov: ${postAddress}`
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Zapadli računi</h1>
        <p className="text-sm text-gray-500 mt-1">Pregled in upravljanje zapadlih računov</p>
      </div>

      {overdue.length === 0 ? (
        <Card>
          <CardContent className="pt-12 pb-12 text-center">
            <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
            <p className="text-gray-500">Ni zapadlih računov</p>
            <p className="text-sm text-gray-400 mt-1">Vsi računi so plačani ali še niso zapadli</p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Info Banner */}
          <Card className="bg-red-50 border-red-200">
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-red-600" />
                <div>
                  <span className="font-medium text-red-800">
                    {overdue.length} zapadlih računov
                  </span>
                  <span className="text-red-600 ml-2">
                    Skupaj: {formatCurrency(totalOverdue)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Overdue Invoices Table */}
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
                        <TableRow key={inv.id} className="bg-red-50">
                          <TableCell className="font-mono font-medium">{inv.number}</TableCell>
                          <TableCell>
                            <div className="font-medium">{inv.customerName}</div>
                            <div className="text-xs text-gray-500">{inv.customerTaxId}</div>
                          </TableCell>
                          <TableCell className="text-right font-semibold text-red-600">
                            {formatCurrency(inv.totalGross)}
                          </TableCell>
                          <TableCell>{formatDate(inv.dueDate)}</TableCell>
                          <TableCell>
                            <Badge variant="secondary" className="bg-red-100 text-red-800">
                              <Clock className="w-3 h-3 mr-1" />
                              {daysLate} dni
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-1 justify-center flex-wrap">
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
                                variant="secondary" 
                                onClick={() => openEmailModal(inv)}
                                title="Pošlji opomin po e-pošti"
                              >
                                <Mail className="w-4 h-4" />
                              </Button>
                              <Button 
                                size="sm" 
                                variant="secondary" 
                                onClick={() => openPostModal(inv)}
                                title="Pošlji opomin po pošti"
                              >
                                <Package className="w-4 h-4" />
                              </Button>
                              <Button 
                                size="sm" 
                                onClick={() => openPaidModal(inv)}
                                className="bg-green-600 hover:bg-green-700"
                                title="Označi kot plačano"
                              >
                                <CheckCircle className="w-4 h-4" />
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
        </>
      )}

      {/* Email Modal */}
      <Dialog open={emailModalOpen} onOpenChange={setEmailModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-blue-700">
              <Mail className="w-5 h-5 text-blue-600" />
              Pošlji opomin za plačilo
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium block mb-1 text-gray-700">📧 Prejemnik (e-pošta)</label>
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
              <Textarea value={emailBody} onChange={(e) => setEmailBody(e.target.value)} rows={8} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEmailModalOpen(false)}>
              <Ban className="w-4 h-4 mr-2" /> Prekliči
            </Button>
            <Button onClick={handleSendEmail} className="bg-blue-600 hover:bg-blue-700">
              <Send className="w-4 h-4 mr-2" /> Pošlji opomin
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Post Modal */}
      <Dialog open={postModalOpen} onOpenChange={setPostModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-blue-700">
              <Package className="w-5 h-5 text-blue-600" />
              Pošlji opomin po pošti
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
              <textarea value={postAddress} onChange={(e) => setPostAddress(e.target.value)} className="w-full min-h-[100px] px-3 py-2 text-sm border rounded-md" placeholder="Ime in priimek / podjetje&#10;Ulica in hišna številka&#10;Poštna številka in kraj" />
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
            <Button onClick={handleSendPost} className="bg-blue-600 hover:bg-blue-700">
              <Package className="w-4 h-4 mr-2" /> Potrdi pošiljanje
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Mark as Paid Modal */}
      <Dialog open={paidModalOpen} onOpenChange={setPaidModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-green-700">
              <CheckCircle className="w-5 h-5 text-green-600" />
              Označi račun kot plačan
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-yellow-800">Pozor!</p>
                  <p className="text-sm text-yellow-700 mt-1">
                    S tem dejanjem boste račun <span className="font-semibold">{paidInvoice?.number}</span> 
                    za kupca <span className="font-semibold">{paidInvoice?.customerName}</span> 
                    označili kot <span className="font-semibold text-green-600">PLAČAN</span>.
                  </p>
                </div>
              </div>
            </div>
            <p className="text-sm text-gray-600">Ste prepričani, da želite to narediti?</p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPaidModalOpen(false)}>
              <X className="w-4 h-4 mr-2" /> Prekliči
            </Button>
            <Button onClick={handleMarkAsPaid} className="bg-green-600 hover:bg-green-700">
              <CheckCircle className="w-4 h-4 mr-2" /> Potrdi plačilo
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Invoice View Modal */}
      <InvoiceView 
        invoiceId={selectedInvoiceId} 
        open={!!selectedInvoiceId} 
        onClose={() => setSelectedInvoiceId(null)}
        onSendEmail={openEmailModal}
        onSendPost={openPostModal}
        onMarkAsPaid={(invoiceId) => {
          const invoice = invoices.find(inv => inv.id === invoiceId)
          if (invoice) openPaidModal(invoice)
        }}
      />
    </div>
  )
}

// Potreben import za X ikono
import { X } from 'lucide-react'