// src/components/invoice/InvoiceFilters.tsx
import React, { useRef, useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Search, X, ChevronDown, Calendar, DollarSign, Clock, Filter, ChevronUp, ArrowUpDown, SortAsc, SortDesc, Hash, User, MapPin, Tag, FileText, AlertCircle } from 'lucide-react'
import DatePicker from 'react-datepicker'
import { sl } from 'date-fns/locale'
import { CustomDateInput } from '@/components/ui/CustomDateInput'
import { NumberInput } from '@/components/ui/NumberInput'
import { InvoiceStatus } from '@/types'

// Tip za sortiranje
export type SortField = 
  | 'number' 
  | 'issueDate' 
  | 'dueDate' 
  | 'customerName' 
  | 'customerTaxId'
  | 'totalNet' 
  | 'totalVat'
  | 'totalGross' 
  | 'status' 
  | 'paid' 
  | 'remaining'
  | 'itemsCount'
  | 'createdAt'
  | 'updatedAt'
  | 'serviceName'

export type SortDirection = 'asc' | 'desc'

interface InvoiceFiltersProps {
  // Obstoječi filtri
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
  
  // Novi filtri
  documentType?: 'all' | 'invoice' | 'estimate' | 'draft'
  setDocumentType?: (type: 'all' | 'invoice' | 'estimate' | 'draft') => void
  vatRate?: 'all' | '22' | '9.5' | '5' | '0'
  setVatRate?: (rate: 'all' | '22' | '9.5' | '5' | '0') => void
  overdueDaysMin?: number | ''
  setOverdueDaysMin?: (value: number | '') => void
  overdueDaysMax?: number | ''
  setOverdueDaysMax?: (value: number | '') => void
  paidMin?: number | ''
  setPaidMin?: (value: number | '') => void
  paidMax?: number | ''
  setPaidMax?: (value: number | '') => void
  remainingMin?: number | ''
  setRemainingMin?: (value: number | '') => void
  remainingMax?: number | ''
  setRemainingMax?: (value: number | '') => void
  itemsCountMin?: number | ''
  setItemsCountMin?: (value: number | '') => void
  itemsCountMax?: number | ''
  setItemsCountMax?: (value: number | '') => void
  noteSearch?: string
  setNoteSearch?: (value: string) => void
  serviceName?: string
  setServiceName?: (value: string) => void
  
  // Sortiranje
  sortField: SortField
  setSortField: (field: SortField) => void
  sortDirection: SortDirection
  setSortDirection: (direction: SortDirection) => void
  secondarySortField?: SortField
  setSecondarySortField?: (field: SortField) => void
  secondarySortDirection?: SortDirection
  setSecondarySortDirection?: (direction: SortDirection) => void
}

export const InvoiceFilters: React.FC<InvoiceFiltersProps> = ({
  searchNumber, setSearchNumber, selectedNumber, setSelectedNumber,
  searchCustomer, setSearchCustomer, selectedCustomer, setSelectedCustomer,
  searchMunicipality, setSearchMunicipality, selectedMunicipality, setSelectedMunicipality,
  priceMin, setPriceMin, priceMax, setPriceMax,
  dateFrom, setDateFrom, dateTo, setDateTo,
  dueDateFrom, setDueDateFrom, dueDateTo, setDueDateTo,
  selectedStatus, setSelectedStatus,
  uniqueNumbers, uniqueCustomers, uniqueMunicipalities, statusOptions,
  clearAllFilters,
  documentType = 'all',
  setDocumentType = () => {},
  vatRate = 'all',
  setVatRate = () => {},
  overdueDaysMin = '',
  setOverdueDaysMin = () => {},
  overdueDaysMax = '',
  setOverdueDaysMax = () => {},
  paidMin = '',
  setPaidMin = () => {},
  paidMax = '',
  setPaidMax = () => {},
  remainingMin = '',
  setRemainingMin = () => {},
  remainingMax = '',
  setRemainingMax = () => {},
  itemsCountMin = '',
  setItemsCountMin = () => {},
  itemsCountMax = '',
  setItemsCountMax = () => {},
  noteSearch = '',
  setNoteSearch = () => {},
  serviceName = '',
  setServiceName = () => {},
  sortField,
  setSortField,
  sortDirection,
  setSortDirection,
  secondarySortField,
  setSecondarySortField = () => {},
  secondarySortDirection,
  setSecondarySortDirection = () => {},
}) => {
  const numberDropdownRef = useRef<HTMLDivElement>(null)
  const customerDropdownRef = useRef<HTMLDivElement>(null)
  const municipalityDropdownRef = useRef<HTMLDivElement>(null)
  const statusDropdownRef = useRef<HTMLDivElement>(null)
  const [isNumberDropdownOpen, setIsNumberDropdownOpen] = useState(false)
  const [isCustomerDropdownOpen, setIsCustomerDropdownOpen] = useState(false)
  const [isMunicipalityDropdownOpen, setIsMunicipalityDropdownOpen] = useState(false)
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false)
  const [showAdditionalFilters, setShowAdditionalFilters] = useState(false)
  const [showSorting, setShowSorting] = useState(false)

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

  const sortOptions: { value: SortField; label: string }[] = [
    { value: 'number', label: 'Številka računa' },
    { value: 'issueDate', label: 'Datum izdaje' },
    { value: 'dueDate', label: 'Datum zapadlosti' },
    { value: 'customerName', label: 'Kupec (naziv)' },
    { value: 'customerTaxId', label: 'Kupec (davčna)' },
    { value: 'totalNet', label: 'Neto' },
    { value: 'totalVat', label: 'DDV' },
    { value: 'totalGross', label: 'Bruto' },
    { value: 'status', label: 'Status' },
    { value: 'paid', label: 'Plačano' },
    { value: 'remaining', label: 'Preostanek' },
    { value: 'itemsCount', label: 'Št. postavk' },
    { value: 'createdAt', label: 'Datum ustvarjanja' },
    { value: 'updatedAt', label: 'Zadnja sprememba' },
  ]

  const documentTypeOptions = [
    { value: 'all', label: 'Vsi' },
    { value: 'invoice', label: 'Računi' },
    { value: 'estimate', label: 'Predračuni' },
    { value: 'draft', label: 'Osnutki' },
  ]

  const vatRateOptions = [
    { value: 'all', label: 'Vse' },
    { value: '22', label: '22%' },
    { value: '9.5', label: '9.5%' },
    { value: '5', label: '5%' },
    { value: '0', label: '0%' },
  ]

  // Število aktivnih filtrov
  const getActiveFilterCount = () => {
    let count = 0
    if (selectedNumber) count++
    if (selectedCustomer) count++
    if (selectedMunicipality) count++
    if (selectedStatus !== 'all') count++
    if (documentType !== 'all') count++
    if (vatRate !== 'all') count++
    if (priceMin !== '' || priceMax !== '') count++
    if (paidMin !== '' || paidMax !== '') count++
    if (remainingMin !== '' || remainingMax !== '') count++
    if (overdueDaysMin !== '' || overdueDaysMax !== '') count++
    if (itemsCountMin !== '' || itemsCountMax !== '') count++
    if (dateFrom || dateTo) count++
    if (dueDateFrom || dueDateTo) count++
    if (noteSearch) count++
    if (serviceName) count++
    return count
  }

  const activeFilterCount = getActiveFilterCount()

  // Pridobi oznako za izbran status
  const getStatusLabel = () => {
    const found = statusOptions.find(s => s.value === selectedStatus)
    return found ? found.label : 'Vsi'
  }

  return (
    <div className="space-y-4">
      {/* Header z gumbi */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <h3 className="text-lg font-semibold text-gray-700">Filtri</h3>
          {activeFilterCount > 0 && (
            <span className="text-xs bg-blue-100 text-blue-700 px-2.5 py-1 rounded-full font-medium">
              {activeFilterCount} aktivnih filtrov
            </span>
          )}
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setShowAdditionalFilters(!showAdditionalFilters)}
            className="text-sm"
          >
            <Filter className="w-4 h-4 mr-1.5" />
            {showAdditionalFilters ? 'Skrij filtre' : 'Več filtrov'}
            {showAdditionalFilters ? <ChevronUp className="w-3.5 h-3.5 ml-1.5" /> : <ChevronDown className="w-3.5 h-3.5 ml-1.5" />}
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setShowSorting(!showSorting)}
            className="text-sm"
          >
            <ArrowUpDown className="w-4 h-4 mr-1.5" />
            Sortiranje
            {showSorting ? <ChevronUp className="w-3.5 h-3.5 ml-1.5" /> : <ChevronDown className="w-3.5 h-3.5 ml-1.5" />}
          </Button>
          {activeFilterCount > 0 && (
            <Button 
              size="sm" 
              variant="ghost" 
              onClick={clearAllFilters} 
              className="text-sm text-red-500 hover:text-red-700 hover:bg-red-50"
            >
              <X className="w-4 h-4 mr-1" /> Počisti vse
            </Button>
          )}
        </div>
      </div>

      {/* Osnovni filtri - 3 v vrsti */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* Filter: Številka */}
        <div className="relative" ref={numberDropdownRef}>
          <label className="text-xs font-medium text-gray-600 mb-1 block">Številka računa</label>
          <div className="flex items-center border rounded-md px-3 py-2 bg-white focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500 transition-shadow">
            <input 
              type="text" 
              placeholder="Išči po številki računa" 
              value={searchNumber} 
              onChange={(e) => { setSearchNumber(e.target.value); setIsNumberDropdownOpen(true); if (e.target.value === '') setSelectedNumber('') }} 
              className="flex-1 outline-none bg-transparent text-sm" 
              onFocus={() => setIsNumberDropdownOpen(true)} 
            />
            {selectedNumber ? (
              <X className="w-4 h-4 text-gray-400 ml-2 cursor-pointer hover:text-red-500 transition-colors" onClick={clearNumber} />
            ) : (
              <ChevronDown className={`w-4 h-4 text-gray-400 ml-2 transition-transform ${isNumberDropdownOpen ? 'rotate-180' : ''}`} />
            )}
          </div>
          {isNumberDropdownOpen && uniqueNumbers.length > 0 && (
            <div className="absolute z-50 w-full mt-1 bg-white border rounded-md shadow-lg max-h-48 overflow-auto">
              {uniqueNumbers.map(inv => (
                <div 
                  key={inv.number} 
                  className="px-3 py-2 hover:bg-blue-50 cursor-pointer text-sm border-b last:border-0 transition-colors"
                  onClick={() => { setSelectedNumber(inv.number); setSearchNumber(inv.number); setIsNumberDropdownOpen(false) }}
                >
                  {inv.number}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Filter: Kupec */}
        <div className="relative" ref={customerDropdownRef}>
          <label className="text-xs font-medium text-gray-600 mb-1 block">Naziv kupeca</label>
          <div className="flex items-center border rounded-md px-3 py-2 bg-white focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500 transition-shadow">
            <input 
              type="text" 
              placeholder="Išči po nazivu kupca ali davčni številki..." 
              value={searchCustomer} 
              onChange={(e) => { setSearchCustomer(e.target.value); setIsCustomerDropdownOpen(true); if (e.target.value === '') setSelectedCustomer(null) }} 
              className="flex-1 outline-none bg-transparent text-sm" 
              onFocus={() => setIsCustomerDropdownOpen(true)} 
            />
            {selectedCustomer ? (
              <X className="w-4 h-4 text-gray-400 ml-2 cursor-pointer hover:text-red-500 transition-colors" onClick={clearCustomer} />
            ) : (
              <ChevronDown className={`w-4 h-4 text-gray-400 ml-2 transition-transform ${isCustomerDropdownOpen ? 'rotate-180' : ''}`} />
            )}
          </div>
          {isCustomerDropdownOpen && uniqueCustomers.length > 0 && (
            <div className="absolute z-50 w-full mt-1 bg-white border rounded-md shadow-lg max-h-48 overflow-auto">
              {uniqueCustomers.map(customer => (
                <div 
                  key={customer.id} 
                  className="px-3 py-2 hover:bg-blue-50 cursor-pointer text-sm border-b last:border-0 transition-colors"
                  onClick={() => { setSelectedCustomer(customer); setSearchCustomer(customer.name); setIsCustomerDropdownOpen(false) }}
                >
                  <div className="font-medium">{customer.name}</div>
                  <div className="text-xs text-gray-500">ID: {customer.taxId}</div>
                </div>
              ))}
            </div>
          )}
        </div>


      </div>

      {/* Dodatni filtri */}
      {showAdditionalFilters && (
        <div className="space-y-3 pt-3 border-t">
          {/* Vrstica 1: Tip dokumenta, DDV, Občina, Št. postavk */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1 block">Vrsta računa</label>
              <select 
                value={documentType} 
                onChange={(e) => setDocumentType(e.target.value as any)}
                className="w-full border rounded-md px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-shadow"
              >
                {documentTypeOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-medium text-gray-600 mb-1 block">Stopnja DDV</label>
              <select 
                value={vatRate} 
                onChange={(e) => setVatRate(e.target.value as any)}
                className="w-full border rounded-md px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-shadow"
              >
                {vatRateOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>

            <div className="relative" ref={municipalityDropdownRef}>
              <label className="text-xs font-medium text-gray-600 mb-1 block">Občina kupca</label>
              <div className="flex items-center border rounded-md px-3 py-2 bg-white focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500 transition-shadow">
                <MapPin className="w-4 h-4 text-gray-400 mr-2" />
                <input 
                  type="text" 
                  placeholder="Občina..." 
                  value={searchMunicipality} 
                  onChange={(e) => { setSearchMunicipality(e.target.value); setIsMunicipalityDropdownOpen(true); if (e.target.value === '') setSelectedMunicipality('') }} 
                  className="flex-1 outline-none bg-transparent text-sm" 
                  onFocus={() => setIsMunicipalityDropdownOpen(true)} 
                />
                {selectedMunicipality ? (
                  <X className="w-4 h-4 text-gray-400 ml-2 cursor-pointer hover:text-red-500 transition-colors" onClick={clearMunicipality} />
                ) : (
                  <ChevronDown className={`w-4 h-4 text-gray-400 ml-2 transition-transform ${isMunicipalityDropdownOpen ? 'rotate-180' : ''}`} />
                )}
              </div>
              {isMunicipalityDropdownOpen && uniqueMunicipalities.length > 0 && (
                <div className="absolute z-50 w-full mt-1 bg-white border rounded-md shadow-lg max-h-48 overflow-auto">
                  {uniqueMunicipalities.map(municipality => (
                    <div 
                      key={municipality} 
                      className="px-3 py-2 hover:bg-blue-50 cursor-pointer text-sm border-b last:border-0 transition-colors"
                      onClick={() => { setSelectedMunicipality(municipality); setSearchMunicipality(municipality); setIsMunicipalityDropdownOpen(false) }}
                    >
                      {municipality}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label className="text-xs font-medium text-gray-600 mb-1 block">Št. postavk na računu</label>
              <div className="flex gap-2">
                <NumberInput 
                  placeholder="Od" 
                  value={itemsCountMin} 
                  onChange={setItemsCountMin} 
                  min={0} 
                  max={999}
                  className="flex-1"
                />
                <NumberInput 
                  placeholder="Do" 
                  value={itemsCountMax} 
                  onChange={setItemsCountMax} 
                  min={0} 
                  max={999}
                  className="flex-1"
                />
              </div>
            </div>
          </div>

          {/* Vrstica 2: Zneski */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1 block">Skupni znesek</label>
              <div className="flex gap-2">
                <NumberInput 
                  placeholder="Od €" 
                  value={priceMin} 
                  onChange={setPriceMin} 
                  min={0} 
                  max={999999999}
                  className="flex-1"
                />
                <NumberInput 
                  placeholder="Do €" 
                  value={priceMax} 
                  onChange={setPriceMax} 
                  min={0} 
                  max={999999999}
                  className="flex-1"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-gray-600 mb-1 block">Plačano</label>
              <div className="flex gap-2">
                <NumberInput 
                  placeholder="Od €" 
                  value={paidMin} 
                  onChange={setPaidMin} 
                  min={0} 
                  max={999999999}
                  className="flex-1"
                />
                <NumberInput 
                  placeholder="Do €" 
                  value={paidMax} 
                  onChange={setPaidMax} 
                  min={0} 
                  max={999999999}
                  className="flex-1"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-gray-600 mb-1 block">Preostanek</label>
              <div className="flex gap-2">
                <NumberInput 
                  placeholder="Od €" 
                  value={remainingMin} 
                  onChange={setRemainingMin} 
                  min={0} 
                  max={999999999}
                  className="flex-1"
                />
                <NumberInput 
                  placeholder="Do €" 
                  value={remainingMax} 
                  onChange={setRemainingMax} 
                  min={0} 
                  max={999999999}
                  className="flex-1"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-gray-600 mb-1 block">Dni zamude</label>
              <div className="flex gap-2">
                <NumberInput 
                  placeholder="Od dni" 
                  value={overdueDaysMin} 
                  onChange={setOverdueDaysMin} 
                  min={0} 
                  max={999}
                  className="flex-1"
                />
                <NumberInput 
                  placeholder="Do dni" 
                  value={overdueDaysMax} 
                  onChange={setOverdueDaysMax} 
                  min={0} 
                  max={999}
                  className="flex-1"
                />
              </div>
            </div>
          </div>

          {/* Vrstica 3: Datumi in iskanje */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1 block">Datum izdaje</label>
              <div className="flex gap-2">
                <DatePicker
                  selected={dateFrom}
                  onChange={setDateFrom}
                  dateFormat="dd.MM.yyyy"
                  locale={sl}
                  placeholderText="Od"
                  customInput={<CustomDateInput onClear={clearDateFrom} placeholder="Od" />}
                  isClearable={false}
                  className="flex-1"
                />
                <DatePicker
                  selected={dateTo}
                  onChange={setDateTo}
                  dateFormat="dd.MM.yyyy"
                  locale={sl}
                  placeholderText="Do"
                  customInput={<CustomDateInput onClear={clearDateTo} placeholder="Do" />}
                  isClearable={false}
                  className="flex-1"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-gray-600 mb-1 block">Datum zapadlosti</label>
              <div className="flex gap-2">
                <DatePicker
                  selected={dueDateFrom}
                  onChange={setDueDateFrom}
                  dateFormat="dd.MM.yyyy"
                  locale={sl}
                  placeholderText="Od"
                  customInput={<CustomDateInput onClear={clearDueDateFrom} placeholder="Od" />}
                  isClearable={false}
                  className="flex-1"
                />
                <DatePicker
                  selected={dueDateTo}
                  onChange={setDueDateTo}
                  dateFormat="dd.MM.yyyy"
                  locale={sl}
                  placeholderText="DO"
                  customInput={<CustomDateInput onClear={clearDueDateTo} placeholder="Do" />}
                  isClearable={false}
                  className="flex-1"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-gray-600 mb-1 block">Išči v opombah</label>
              <div className="flex items-center border rounded-md px-3 py-2 bg-white focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500 transition-shadow">
                <FileText className="w-4 h-4 text-gray-400 mr-2" />
                <input 
                  type="text" 
                  placeholder="Besedilo..." 
                  value={noteSearch} 
                  onChange={(e) => setNoteSearch(e.target.value)} 
                  className="flex-1 outline-none bg-transparent text-sm" 
                />
                {noteSearch && (
                  <X 
                    className="w-4 h-4 text-gray-400 ml-2 cursor-pointer hover:text-red-500 transition-colors" 
                    onClick={() => setNoteSearch('')} 
                  />
                )}
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-gray-600 mb-1 block">Ime storitve</label>
              <div className="flex items-center border rounded-md px-3 py-2 bg-white focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500 transition-shadow">
                <Tag className="w-4 h-4 text-gray-400 mr-2" />
                <input 
                  type="text" 
                  placeholder="Ime storitve..." 
                  value={serviceName} 
                  onChange={(e) => setServiceName(e.target.value)} 
                  className="flex-1 outline-none bg-transparent text-sm" 
                />
                {serviceName && (
                  <X 
                    className="w-4 h-4 text-gray-400 ml-2 cursor-pointer hover:text-red-500 transition-colors" 
                    onClick={() => setServiceName('')} 
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sortiranje */}
      {showSorting && (
        <div className="pt-3 border-t">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1 block">Primarno sortiranje</label>
              <select 
                value={sortField} 
                onChange={(e) => setSortField(e.target.value as SortField)}
                className="w-full border rounded-md px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-shadow"
              >
                {sortOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1 block">Smer</label>
              <div className="flex gap-2">
                <button
                  onClick={() => setSortDirection('asc')}
                  className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-all ${
                    sortDirection === 'asc' 
                      ? 'bg-blue-600 text-white shadow-sm' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <SortAsc className="w-4 h-4 inline mr-1.5" /> Narašč.
                </button>
                <button
                  onClick={() => setSortDirection('desc')}
                  className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-all ${
                    sortDirection === 'desc' 
                      ? 'bg-blue-600 text-white shadow-sm' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <SortDesc className="w-4 h-4 inline mr-1.5" /> Padajoče
                </button>
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1 block">Sekundarno</label>
              <select 
                value={secondarySortField || 'number'} 
                onChange={(e) => setSecondarySortField(e.target.value as SortField)}
                className="w-full border rounded-md px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-shadow"
              >
                <option value="number">Številka računa</option>
                {sortOptions.filter(opt => opt.value !== sortField).map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1 block">Smer sekundarnega</label>
              <div className="flex gap-2">
                <button
                  onClick={() => setSecondarySortDirection('asc')}
                  className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-all ${
                    secondarySortDirection === 'asc' 
                      ? 'bg-purple-600 text-white shadow-sm' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <SortAsc className="w-4 h-4 inline mr-1.5" /> Narašč.
                </button>
                <button
                  onClick={() => setSecondarySortDirection('desc')}
                  className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-all ${
                    secondarySortDirection === 'desc' 
                      ? 'bg-purple-600 text-white shadow-sm' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <SortDesc className="w-4 h-4 inline mr-1.5" /> Padajoče
                </button>
              </div>
            </div>
          </div>
          
        </div>
      )}
    </div>
  )
}