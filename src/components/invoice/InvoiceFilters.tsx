// src/components/invoice/InvoiceFilters.tsx
import React, { useRef, useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Search, X, ChevronDown, Calendar, DollarSign, Percent, Clock, Filter, ChevronUp } from 'lucide-react'
import DatePicker from 'react-datepicker'
import { sl } from 'date-fns/locale'
import { CustomDateInput } from '@/components/ui/CustomDateInput'
import { NumberInput } from '@/components/ui/NumberInput'
import { InvoiceStatus } from '@/types'

interface InvoiceFiltersProps {
  searchNumber: string
  setSearchNumber: (value: string) => void
  selectedNumber: string
  setSelectedNumber: (value: string) => void
  searchCustomer: string
  setSearchCustomer: (value: string) => void
  selectedCustomer: { id: string; name: string; taxId: string } | null
  setSelectedCustomer: (customer: { id: string; name: string; taxId: string } | null) => void
  searchMunicipality: string
  setSearchMunicipality: (value: string) => void
  selectedMunicipality: string
  setSelectedMunicipality: (value: string) => void
  priceMin: number | ''
  setPriceMin: (value: number | '') => void
  priceMax: number | ''
  setPriceMax: (value: number | '') => void
  discountMin: number | ''
  setDiscountMin: (value: number | '') => void
  discountMax: number | ''
  setDiscountMax: (value: number | '') => void
  dateFrom: Date | null
  setDateFrom: (date: Date | null) => void
  dateTo: Date | null
  setDateTo: (date: Date | null) => void
  dueDateFrom: Date | null
  setDueDateFrom: (date: Date | null) => void
  dueDateTo: Date | null
  setDueDateTo: (date: Date | null) => void
  selectedStatus: InvoiceStatus | 'all'
  setSelectedStatus: (status: InvoiceStatus | 'all') => void
  uniqueNumbers: { number: string }[]
  uniqueCustomers: { id: string; name: string; taxId: string }[]
  uniqueMunicipalities: string[]
  statusOptions: { value: InvoiceStatus | 'all'; label: string }[]
  clearAllFilters: () => void
}

export const InvoiceFilters: React.FC<InvoiceFiltersProps> = ({
  searchNumber, setSearchNumber, selectedNumber, setSelectedNumber,
  searchCustomer, setSearchCustomer, selectedCustomer, setSelectedCustomer,
  searchMunicipality, setSearchMunicipality, selectedMunicipality, setSelectedMunicipality,
  priceMin, setPriceMin, priceMax, setPriceMax,
  discountMin, setDiscountMin, discountMax, setDiscountMax,
  dateFrom, setDateFrom, dateTo, setDateTo,
  dueDateFrom, setDueDateFrom, dueDateTo, setDueDateTo,
  selectedStatus, setSelectedStatus,
  uniqueNumbers, uniqueCustomers, uniqueMunicipalities, statusOptions,
  clearAllFilters
}) => {
  const numberDropdownRef = useRef<HTMLDivElement>(null)
  const customerDropdownRef = useRef<HTMLDivElement>(null)
  const municipalityDropdownRef = useRef<HTMLDivElement>(null)
  const statusDropdownRef = useRef<HTMLDivElement>(null)
  const [isNumberDropdownOpen, setIsNumberDropdownOpen] = React.useState(false)
  const [isCustomerDropdownOpen, setIsCustomerDropdownOpen] = React.useState(false)
  const [isMunicipalityDropdownOpen, setIsMunicipalityDropdownOpen] = React.useState(false)
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = React.useState(false)
  const [showAdditionalFilters, setShowAdditionalFilters] = useState(false)

  // Clear date handlers
  const clearDateFrom = () => setDateFrom(null)
  const clearDateTo = () => setDateTo(null)
  const clearDueDateFrom = () => setDueDateFrom(null)
  const clearDueDateTo = () => setDueDateTo(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (numberDropdownRef.current && !numberDropdownRef.current.contains(event.target as Node)) setIsNumberDropdownOpen(false)
      if (customerDropdownRef.current && !customerDropdownRef.current.contains(event.target as Node)) setIsCustomerDropdownOpen(false)
      if (municipalityDropdownRef.current && !municipalityDropdownRef.current.contains(event.target as Node)) setIsMunicipalityDropdownOpen(false)
      if (statusDropdownRef.current && !statusDropdownRef.current.contains(event.target as Node)) setIsStatusDropdownOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const clearNumber = () => { setSelectedNumber(''); setSearchNumber('') }
  const clearCustomer = () => { setSelectedCustomer(null); setSearchCustomer('') }
  const clearMunicipality = () => { setSelectedMunicipality(''); setSearchMunicipality('') }

  return (
    <>
      {/* Naslov FILTRI in gumb */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h3 className="text-2xl font-bold text-black">FILTRI</h3>
        </div>
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => setShowAdditionalFilters(!showAdditionalFilters)}
          className="text-primary border-primary hover:bg-primary hover:text-white"
        >
          <Filter className="w-4 h-4 mr-2" />
          {showAdditionalFilters ? 'Skrij dodatne filtre' : 'Pokaži dodatne filtre'}
          {showAdditionalFilters ? <ChevronUp className="w-4 h-4 ml-2" /> : <ChevronDown className="w-4 h-4 ml-2" />}
        </Button>
      </div>

      {/* Osnovni filtri - vedno vidni */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div><label className="text-sm font-medium mb-1 block">Številka računa</label>
          <div className="relative" ref={numberDropdownRef}>
            <div className="flex items-center border rounded-md px-3 py-2 bg-white">
              <Search className="w-4 h-4 text-gray-400 mr-2" />
              <input type="text" placeholder="Številka računa..." value={searchNumber} onChange={(e) => { setSearchNumber(e.target.value); setIsNumberDropdownOpen(true); if (e.target.value === '') setSelectedNumber('') }} className="flex-1 outline-none bg-transparent text-sm" onFocus={() => setIsNumberDropdownOpen(true)} />
              {selectedNumber ? <X className="w-4 h-4 text-gray-400 ml-2 cursor-pointer hover:text-red-500" onClick={clearNumber} /> : <ChevronDown className={`w-4 h-4 text-gray-400 ml-2 transition-transform ${isNumberDropdownOpen ? 'rotate-180' : ''}`} />}
            </div>
            {isNumberDropdownOpen && uniqueNumbers.length > 0 && (
              <div className="absolute z-50 w-full mt-1 bg-white border rounded-md shadow-lg max-h-60 overflow-auto">
                {uniqueNumbers.map(inv => <div key={inv.number} className="p-3 hover:bg-gray-50 cursor-pointer border-b" onClick={() => { setSelectedNumber(inv.number); setSearchNumber(inv.number); setIsNumberDropdownOpen(false) }}><div className="font-mono">{inv.number}</div></div>)}
              </div>
            )}
          </div>
        </div>

        <div><label className="text-sm font-medium mb-1 block">Kupec (naziv ali davčna)</label>
          <div className="relative" ref={customerDropdownRef}>
            <div className="flex items-center border rounded-md px-3 py-2 bg-white">
              <Search className="w-4 h-4 text-gray-400 mr-2" />
              <input type="text" placeholder="Išči po nazivu ali davčni..." value={searchCustomer} onChange={(e) => { setSearchCustomer(e.target.value); setIsCustomerDropdownOpen(true); if (e.target.value === '') setSelectedCustomer(null) }} className="flex-1 outline-none bg-transparent text-sm" onFocus={() => setIsCustomerDropdownOpen(true)} />
              {selectedCustomer ? <X className="w-4 h-4 text-gray-400 ml-2 cursor-pointer hover:text-red-500" onClick={clearCustomer} /> : <ChevronDown className={`w-4 h-4 text-gray-400 ml-2 transition-transform ${isCustomerDropdownOpen ? 'rotate-180' : ''}`} />}
            </div>
            {isCustomerDropdownOpen && uniqueCustomers.length > 0 && (
              <div className="absolute z-50 w-full mt-1 bg-white border rounded-md shadow-lg max-h-60 overflow-auto">
                {uniqueCustomers.map(customer => <div key={customer.id} className="p-3 hover:bg-gray-50 cursor-pointer border-b" onClick={() => { setSelectedCustomer(customer); setSearchCustomer(`${customer.name} (${customer.taxId})`); setIsCustomerDropdownOpen(false) }}><div className="font-medium">{customer.name}</div><div className="text-sm text-gray-500">Davčna: {customer.taxId}</div></div>)}
              </div>
            )}
          </div>
        </div>

        <div><label className="text-sm font-medium mb-1 block">Občina kupca</label>
          <div className="relative" ref={municipalityDropdownRef}>
            <div className="flex items-center border rounded-md px-3 py-2 bg-white">
              <Search className="w-4 h-4 text-gray-400 mr-2" />
              <input type="text" placeholder="Občina..." value={searchMunicipality} onChange={(e) => { setSearchMunicipality(e.target.value); setIsMunicipalityDropdownOpen(true); if (e.target.value === '') setSelectedMunicipality('') }} className="flex-1 outline-none bg-transparent text-sm" onFocus={() => setIsMunicipalityDropdownOpen(true)} />
              {selectedMunicipality ? <X className="w-4 h-4 text-gray-400 ml-2 cursor-pointer hover:text-red-500" onClick={clearMunicipality} /> : <ChevronDown className={`w-4 h-4 text-gray-400 ml-2 transition-transform ${isMunicipalityDropdownOpen ? 'rotate-180' : ''}`} />}
            </div>
            {isMunicipalityDropdownOpen && uniqueMunicipalities.length > 0 && (
              <div className="absolute z-50 w-full mt-1 bg-white border rounded-md shadow-lg max-h-60 overflow-auto">
                {uniqueMunicipalities.map(municipality => <div key={municipality} className="p-3 hover:bg-gray-50 cursor-pointer border-b" onClick={() => { setSelectedMunicipality(municipality); setSearchMunicipality(municipality); setIsMunicipalityDropdownOpen(false) }}><div>{municipality}</div></div>)}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Dodatni filtri - prikažejo se samo ko je showAdditionalFilters true */}
      {showAdditionalFilters && (
        <div className="space-y-4 mb-4 pt-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium mb-1 block flex items-center gap-1">
                <DollarSign className="w-4 h-4" /> Znesek (bruto) od
              </label>
              <NumberInput 
                placeholder="Minimalni znesek €" 
                value={priceMin} 
                onChange={setPriceMin} 
                min={1} 
                max={999999999}
              />
              <label className="text-sm font-medium mt-2 mb-1 block flex items-center gap-1">
                <DollarSign className="w-4 h-4" /> Znesek (bruto) do
              </label>
              <NumberInput 
                placeholder="Maksimalni znesek €" 
                value={priceMax} 
                onChange={setPriceMax} 
                min={1} 
                max={999999999}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block flex items-center gap-1">
                <Percent className="w-4 h-4" /> Popust od
              </label>
              <NumberInput 
                placeholder="Minimalni popust %" 
                value={discountMin} 
                onChange={setDiscountMin} 
                min={0} 
                max={100}
              />
              <label className="text-sm font-medium mt-2 mb-1 block flex items-center gap-1">
                <Percent className="w-4 h-4" /> Popust do
              </label>
              <NumberInput 
                placeholder="Maksimalni popust %" 
                value={discountMax} 
                onChange={setDiscountMax} 
                min={0} 
                max={100}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Status računa</label>
              <div className="relative" ref={statusDropdownRef}>
                <div className="flex items-center border rounded-md px-3 py-2 bg-white cursor-pointer" onClick={() => setIsStatusDropdownOpen(!isStatusDropdownOpen)}>
                  <span className="flex-1 text-sm">{statusOptions.find(s => s.value === selectedStatus)?.label}</span>
                  <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isStatusDropdownOpen ? 'rotate-180' : ''}`} />
                </div>
                {isStatusDropdownOpen && (
                  <div className="absolute z-50 w-full mt-1 bg-white border rounded-md shadow-lg">
                    {statusOptions.map(option => <div key={option.value} className="p-2 hover:bg-gray-50 cursor-pointer" onClick={() => { setSelectedStatus(option.value); setIsStatusDropdownOpen(false) }}>{option.label}</div>)}
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-8 gap-4">
            <div>
              <label className="text-sm font-medium mb-1 block flex items-center gap-1">
                <Calendar className="w-4 h-4" /> Datum izdaje od
              </label>
              <DatePicker
                selected={dateFrom}
                onChange={setDateFrom}
                dateFormat="dd. MM. yyyy"
                locale={sl}
                customInput={<CustomDateInput onClear={clearDateFrom} />}
                placeholderText="Izberite datum od"
                isClearable={false}
              />
              <label className="text-sm font-medium mt-2 mb-1 block flex items-center gap-1">
                <Calendar className="w-4 h-4" /> Datum izdaje do
              </label>
              <DatePicker
                selected={dateTo}
                onChange={setDateTo}
                dateFormat="dd. MM. yyyy"
                locale={sl}
                customInput={<CustomDateInput onClear={clearDateTo} />}
                placeholderText="Izberite datum do"
                isClearable={false}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block flex items-center gap-1">
                <Clock className="w-4 h-4" /> Datum zapadlosti od
              </label>
              <DatePicker
                selected={dueDateFrom}
                onChange={setDueDateFrom}
                dateFormat="dd. MM. yyyy"
                locale={sl}
                customInput={<CustomDateInput onClear={clearDueDateFrom} />}
                placeholderText="Izberite datum od"
                isClearable={false}
              />
              <label className="text-sm font-medium mt-2 mb-1 block flex items-center gap-1">
                <Clock className="w-4 h-4" /> Datum zapadlosti do
              </label>
              <DatePicker
                selected={dueDateTo}
                onChange={setDueDateTo}
                dateFormat="dd. MM. yyyy"
                locale={sl}
                customInput={<CustomDateInput onClear={clearDueDateTo} />}
                placeholderText="Izberite datum do"
                isClearable={false}
              />
            </div>
          </div>
        </div>
      )}

      {/* Gumb za čiščenje filtrov */}
      <div className="flex gap-5 flex-wrap my-4">
        <Button size="sm" variant="secondary" onClick={clearAllFilters}>
          Počisti vse filtre
        </Button>
      </div>
    </>
  )
}