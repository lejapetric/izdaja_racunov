// src/hooks/useInvoiceForm.ts
import { useState, useEffect, useRef } from 'react'
import { Customer, Invoice, InvoiceItem, VatRate } from '@/types'

const calculateTotals = (items: InvoiceItem[], discountPercent: number) => {
  const totalNetBeforeDiscount = items.reduce((sum, i) => sum + (i.netBeforeDiscount || i.net), 0)
  const totalItemDiscounts = items.reduce((sum, i) => sum + (i.discountAmount || 0), 0)
  const totalNetAfterItemDiscounts = items.reduce((sum, i) => sum + i.net, 0)
  const invoiceDiscountAmount = totalNetAfterItemDiscounts * (discountPercent / 100)
  const finalNetBase = totalNetAfterItemDiscounts - invoiceDiscountAmount
  const vatBreakdown: Record<VatRate, number> = { 22: 0, 9.5: 0, 5: 0, 0: 0 }
  items.forEach(item => {
    const discountShare = discountPercent / 100 * item.net
    const base = item.net - discountShare
    vatBreakdown[item.vatRate] += base * (item.vatRate / 100)
  })
  const totalVat = Object.values(vatBreakdown).reduce((a, b) => a + b, 0)
  const totalGross = finalNetBase + totalVat
  return { 
    totalNetBeforeDiscount, 
    totalItemDiscounts, 
    totalNetAfterItemDiscounts, 
    invoiceDiscountAmount, 
    discountPercent, 
    finalNetBase, 
    vatBreakdown, 
    totalVat, 
    totalGross 
  }
}

export function useInvoiceForm(editingInvoice: Invoice | null | undefined, customers: Customer[]) {
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const [items, setItems] = useState<InvoiceItem[]>([])
  const [discountPercent, setDiscountPercent] = useState(0)
  const [discountError, setDiscountError] = useState('')
  const [issueDate, setIssueDate] = useState<Date | null>(new Date())
  const [serviceDateFrom, setServiceDateFrom] = useState<Date | null>(new Date())
  const [serviceDateTo, setServiceDateTo] = useState<Date | null>(new Date())
  const [dueDate, setDueDate] = useState<Date | null>(new Date(new Date().setDate(new Date().getDate() + 30)))
  const [note, setNote] = useState('')
  const [dateError, setDateError] = useState('')

  useEffect(() => {
    if (serviceDateFrom && serviceDateTo && serviceDateTo < serviceDateFrom) {
      setDateError('Datum "do" ne more biti pred datumom "od"')
    } else {
      setDateError('')
    }
  }, [serviceDateFrom, serviceDateTo])

  useEffect(() => {
    if (discountPercent < 0 || discountPercent > 100) {
      setDiscountError('Popust mora biti med 0 in 100')
    } else {
      setDiscountError('')
    }
  }, [discountPercent])

  useEffect(() => {
    if (editingInvoice) {
      const cust = customers.find(c => c.id === editingInvoice.customerId)
      setSelectedCustomer(cust || null)
      setItems(editingInvoice.items)
      setDiscountPercent(editingInvoice.discountPercent)
      setIssueDate(new Date(editingInvoice.issueDate))
      setServiceDateFrom(new Date(editingInvoice.serviceDateFrom))
      setServiceDateTo(new Date(editingInvoice.serviceDateTo))
      setDueDate(new Date(editingInvoice.dueDate))
      setNote(editingInvoice.note || '')
      if (cust) setSearchTerm(cust.name)
    }
  }, [editingInvoice, customers])

  const resetForm = () => {
    setSelectedCustomer(null)
    setSearchTerm('')
    setItems([])
    setDiscountPercent(0)
    setNote('')
    setIssueDate(new Date())
    setServiceDateFrom(new Date())
    setServiceDateTo(new Date())
    setDueDate(new Date(new Date().setDate(new Date().getDate() + 30)))
  }

  const isFormValid = () => {
    if (!selectedCustomer) return false
    if (!issueDate) return false
    if (!dueDate) return false
    if (!serviceDateFrom) return false
    if (!serviceDateTo) return false
    if (dateError) return false
    if (discountError) return false
    if (items.length === 0) return false
    return true
  }

  const totals = calculateTotals(items, discountPercent)

  return {
    selectedCustomer,
    setSelectedCustomer,
    searchTerm,
    setSearchTerm,
    isDropdownOpen,
    setIsDropdownOpen,
    dropdownRef,
    items,
    setItems,
    discountPercent,
    setDiscountPercent,
    discountError,
    issueDate,
    setIssueDate,
    serviceDateFrom,
    setServiceDateFrom,
    serviceDateTo,
    setServiceDateTo,
    dueDate,
    setDueDate,
    note,
    setNote,
    dateError,
    totals,
    resetForm,
    isFormValid,
    loadInvoiceForEditing: () => {} // kept for compatibility
  }
}