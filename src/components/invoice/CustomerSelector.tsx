// src/components/invoice/CustomerSelector.tsx
import React, { RefObject } from 'react'
import { Search, X, ChevronDown, Building2, MapPin, Mail, Phone, FileText as FileIcon } from 'lucide-react'
import { Customer } from '@/types'

interface CustomerSelectorProps {
  selectedCustomer: Customer | null
  setSelectedCustomer: (customer: Customer | null) => void
  searchTerm: string
  setSearchTerm: (term: string) => void
  isDropdownOpen: boolean
  setIsDropdownOpen: (open: boolean) => void
  customers: Customer[]
}

export function CustomerSelector({
  selectedCustomer,
  setSelectedCustomer,
  searchTerm,
  setSearchTerm,
  isDropdownOpen,
  setIsDropdownOpen,
  customers
}: CustomerSelectorProps) {
  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.address?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.taxId.includes(searchTerm)
  )

  const clearCustomerSelection = () => {
    setSelectedCustomer(null)
    setSearchTerm('')
    setIsDropdownOpen(false)
  }

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen)
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="text-sm font-medium mb-2 block">Kupec *</label>
        <div className="relative">
          <div className="flex items-center border rounded-md px-3 py-2 bg-white hover:border-gray-400">
            <Search className="w-4 h-4 text-gray-400 mr-2 flex-shrink-0" />
            <input
              type="text"
              placeholder="Iskanje po nazivu, naslovu ali davčni številki..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value)
                if (e.target.value) setIsDropdownOpen(true)
              }}
              onFocus={() => setIsDropdownOpen(true)}
              className="flex-1 outline-none bg-transparent text-sm"
            />
            {selectedCustomer ? (
              <X className="w-4 h-4 text-gray-400 ml-2 cursor-pointer hover:text-red-500 flex-shrink-0" onClick={clearCustomerSelection} />
            ) : (
              <ChevronDown 
                className={`w-4 h-4 text-gray-400 ml-2 transition-transform cursor-pointer flex-shrink-0 ${isDropdownOpen ? 'rotate-180' : ''}`} 
                onClick={toggleDropdown}
              />
            )}
          </div>
          
          {isDropdownOpen && filteredCustomers.length > 0 && (
            <div className="absolute z-50 w-full mt-1 bg-white border rounded-md shadow-lg max-h-80 overflow-auto">
              {filteredCustomers.map(customer => (
                <div
                  key={customer.id}
                  className="p-3 hover:bg-gray-50 cursor-pointer border-b last:border-b-0"
                  onClick={() => {
                    setSelectedCustomer(customer)
                    setSearchTerm(customer.name)
                    setIsDropdownOpen(false)
                  }}
                >
                  <div className="font-medium text-gray-900">{customer.name}</div>
                  <div className="text-sm text-gray-500 mt-1">
                    <div>{customer.address || 'Ni naslova'}</div>
                    <div>Davčna številka: {customer.taxId}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {isDropdownOpen && filteredCustomers.length === 0 && searchTerm && (
            <div className="absolute z-50 w-full mt-1 bg-white border rounded-md shadow-lg p-4 text-center text-gray-500">
              Ni najdenih strank za "{searchTerm}"
            </div>
          )}
        </div>
      </div>

      {selectedCustomer && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200 p-4">
          <div className="flex items-start gap-3">
            <div className="bg-blue-100 rounded-lg p-2"><Building2 className="w-5 h-5 text-blue-600" /></div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 text-lg">{selectedCustomer.name}</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
                <div className="flex items-start gap-2"><MapPin className="w-4 h-4 text-gray-500 mt-0.5" /><div className="text-sm"><span className="text-gray-500">Naslov:</span><div className="text-gray-900">{selectedCustomer.address || 'Ni vpisan'}</div></div></div>
                <div className="flex items-start gap-2"><FileIcon className="w-4 h-4 text-gray-500 mt-0.5" /><div className="text-sm"><span className="text-gray-500">Davčna številka:</span><div className="text-gray-900">{selectedCustomer.taxId}</div></div></div>
                <div className="flex items-start gap-2"><Mail className="w-4 h-4 text-gray-500 mt-0.5" /><div className="text-sm"><span className="text-gray-500">Email:</span><div className="text-gray-900">{selectedCustomer.email || 'Ni vpisan'}</div></div></div>
                <div className="flex items-start gap-2"><Phone className="w-4 h-4 text-gray-500 mt-0.5" /><div className="text-sm"><span className="text-gray-500">Telefon:</span><div className="text-gray-900">{selectedCustomer.phone || 'Ni vpisan'}</div></div></div>
              </div>
              {selectedCustomer.selfBilling && <div className="mt-2 text-sm text-blue-600 border-t border-blue-200 pt-2"><span className="font-medium">✓ Samofakturiranje</span></div>}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}