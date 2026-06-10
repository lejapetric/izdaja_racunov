// src/components/invoice/InvoiceActions.tsx
import React from 'react'
import { Button } from '@/components/ui/button'
import { Printer, Mail, CheckCircle, Ban, Trash2, Pencil, History, Eye } from 'lucide-react'
import { Invoice } from '@/types'

interface InvoiceActionsProps {
  invoice: Invoice
  onPrint: (invoice: Invoice) => void
  onEdit: (invoice: Invoice) => void
  onSendEmail: (invoice: Invoice) => void
  onMarkAsPaid: (invoiceId: string) => void
  onCancel: (invoice: Invoice) => void
  onDelete: (invoiceId: string) => void
  onAudit: (invoice: Invoice) => void
  onView?: (invoice: Invoice) => void
}

export const InvoiceActions: React.FC<InvoiceActionsProps> = ({
  invoice, onPrint, onEdit, onSendEmail, onMarkAsPaid, onCancel, onDelete, onAudit, onView
}) => {
  return (
    <div className="flex gap-1 flex-wrap">
      {onView && <Button size="sm" variant="ghost" title="Prikaži račun" onClick={() => onView(invoice)}><Eye className="w-4 h-4" /></Button>}
      <Button size="sm" variant="ghost" title="Natisni račun" onClick={() => onPrint(invoice)}><Printer className="w-4 h-4" /></Button>
      <Button size="sm" variant="ghost" title="Dnevnik sprememb" onClick={() => onAudit(invoice)}><History className="w-4 h-4" /></Button>
      <Button size="sm" variant="ghost" title="Uredi račun" onClick={() => onEdit(invoice)}><Pencil className="w-4 h-4" /></Button>
      {(invoice.status === 'issued' || invoice.status === 'overdue') && (
        <Button size="sm" variant="ghost" title="Pošlji po e-pošti" onClick={() => onSendEmail(invoice)}><Mail className="w-4 h-4" /></Button>
      )}
      {invoice.status !== 'paid' && invoice.status !== 'draft' && invoice.status !== 'cancelled' && (
        <Button size="sm" variant="ghost" title="Označi plačano" onClick={() => onMarkAsPaid(invoice.id)}><CheckCircle className="w-4 h-4 text-green-600" /></Button>
      )}
      {invoice.status !== 'paid' && invoice.status !== 'cancelled' && invoice.status !== 'draft' && (
        <Button size="sm" variant="ghost" title="Storniraj račun" onClick={() => onCancel(invoice)}><Ban className="w-4 h-4 text-red-600" /></Button>
      )}
      {invoice.status === 'draft' && (
        <Button size="sm" variant="ghost" title="Izbriši" onClick={() => { if (confirm('Izbriši osnutek?')) onDelete(invoice.id) }}><Trash2 className="w-4 h-4 text-red-600" /></Button>
      )}
    </div>
  )
}