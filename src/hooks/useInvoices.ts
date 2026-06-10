// src/hooks/useInvoices.ts
import { useState, useCallback } from 'react'
import { Invoice, Customer, ServiceItem, AuditLogEntry, VatRate, InvoiceItem } from '@/types'

// Mock data
import { mockCustomers, mockServices, initialInvoices, mockAuditLogs, initializeAuditLogs } from '@/data/mockData'

// Re-export for convenience
export { mockCustomers, mockServices, mockAuditLogs }

// Calculate totals for invoice
export const calculateInvoiceTotals = (items: InvoiceItem[], discountPercent: number) => {
  const totalNetBeforeDiscount = items.reduce((sum, item) => sum + (item.netBeforeDiscount || item.net), 0)
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

export function useInvoices() {
  const [invoices, setInvoices] = useState<Invoice[]>(initialInvoices)
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>(mockAuditLogs)

  const addInvoice = useCallback((invoice: Invoice) => {
    setInvoices(prev => [invoice, ...prev])
    const newLog: AuditLogEntry = {
      id: `a${Date.now()}`,
      invoiceId: invoice.id,
      invoiceNumber: invoice.number,
      action: 'created',
      user: 'Trenutni uporabnik',
      userRole: 'tajnistvo',
      timestamp: new Date().toISOString(),
      details: `Račun ${invoice.number} ustvarjen`,
    }
    setAuditLogs(prev => [newLog, ...prev])
  }, [])

  const updateInvoice = useCallback((id: string, updates: Partial<Invoice>) => {
    const oldInvoice = invoices.find(inv => inv.id === id)
    if (oldInvoice) {
      if (updates.status && updates.status !== oldInvoice.status) {
        const statusLog: AuditLogEntry = {
          id: `a${Date.now()}`,
          invoiceId: id,
          invoiceNumber: oldInvoice.number,
          action: updates.status === 'paid' ? 'paid' : updates.status === 'cancelled' ? 'cancelled' : 'status_changed',
          user: 'Trenutni uporabnik',
          userRole: 'tajnistvo',
          timestamp: new Date().toISOString(),
          oldValue: oldInvoice.status,
          newValue: updates.status,
          details: updates.status === 'paid' ? 'Račun označen kot plačan' : updates.status === 'cancelled' ? `Račun storniran - ${updates.cancelledReason || 'brez razloga'}` : `Status spremenjen iz ${oldInvoice.status} v ${updates.status}`,
        }
        setAuditLogs(prev => [statusLog, ...prev])
      }
      
      if (updates.sentAt && !oldInvoice.sentAt) {
        const sentLog: AuditLogEntry = {
          id: `a${Date.now()}`,
          invoiceId: id,
          invoiceNumber: oldInvoice.number,
          action: 'sent',
          user: 'Trenutni uporabnik',
          userRole: 'tajnistvo',
          timestamp: new Date().toISOString(),
          details: `Račun poslan po e-pošti`,
        }
        setAuditLogs(prev => [sentLog, ...prev])
      }
    }
    
    setInvoices(prev => prev.map(inv => inv.id === id ? { ...inv, ...updates, updatedAt: new Date().toISOString() } : inv))
  }, [invoices])

  const deleteInvoice = useCallback((id: string) => {
    const invoice = invoices.find(inv => inv.id === id)
    if (invoice) {
      const deleteLog: AuditLogEntry = {
        id: `a${Date.now()}`,
        invoiceId: id,
        invoiceNumber: invoice.number,
        action: 'cancelled',
        user: 'Trenutni uporabnik',
        userRole: 'tajnistvo',
        timestamp: new Date().toISOString(),
        details: `Račun ${invoice.number} izbrisan`,
      }
      setAuditLogs(prev => [deleteLog, ...prev])
    }
    setInvoices(prev => prev.filter(inv => inv.id !== id))
  }, [invoices])

  const addAuditLogEntry = useCallback((entry: Omit<AuditLogEntry, 'id' | 'timestamp'>) => {
    const newEntry: AuditLogEntry = {
      ...entry,
      id: `a${Date.now()}`,
      timestamp: new Date().toISOString(),
    }
    setAuditLogs(prev => [newEntry, ...prev])
  }, [])

  const getInvoiceAuditLogs = useCallback((invoiceId: string) => {
    return auditLogs.filter(log => log.invoiceId === invoiceId)
  }, [auditLogs])

  return { 
    invoices, 
    customers: mockCustomers, 
    services: mockServices, 
    auditLogs,
    addInvoice, 
    updateInvoice, 
    deleteInvoice,
    addAuditLogEntry,
    getInvoiceAuditLogs
  }
}