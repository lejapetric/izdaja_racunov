// src/components/Reports.tsx
import { useState, useMemo } from 'react'
import { useInvoices } from '@/hooks/useInvoices'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { formatCurrency, formatDateForCompare } from '@/lib/utils'
import { Download, FileText, PieChart as PieChartIcon, Printer, Filter, ChevronDown, ChevronUp, TrendingUp, TrendingDown, DollarSign, Calendar, Percent, Clock } from 'lucide-react'
import DatePicker from 'react-datepicker'
import { sl } from 'date-fns/locale'
import { CustomDateInput } from '@/components/ui/CustomDateInput'
import { NumberInput } from '@/components/ui/NumberInput'
import { Invoice, InvoiceStatus } from '@/types'
import { statusLabels } from '@/data/mockData'
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from 'recharts'

const statusOptions: { value: InvoiceStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'Vsi' }, { value: 'draft', label: 'Osnutki' }, { value: 'issued', label: 'Izdani' },
  { value: 'sent', label: 'Poslani' }, { value: 'overdue', label: 'Zapadli' }, { value: 'paid', label: 'Plačani' }, { value: 'cancelled', label: 'Stornirani' },
]

// Barve za tortni graf
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#FF6B6B', '#4ECDC4']

export function Reports() {
  const { invoices, customers } = useInvoices()
  
  // Filtri
  const [searchNumber, setSearchNumber] = useState('')
  const [searchCustomer, setSearchCustomer] = useState('')
  const [searchMunicipality, setSearchMunicipality] = useState('')
  const [priceMin, setPriceMin] = useState<number | ''>('')
  const [priceMax, setPriceMax] = useState<number | ''>('')
  const [discountMin, setDiscountMin] = useState<number | ''>('')
  const [discountMax, setDiscountMax] = useState<number | ''>('')
  const [dateFrom, setDateFrom] = useState<Date | null>(null)
  const [dateTo, setDateTo] = useState<Date | null>(null)
  const [dueDateFrom, setDueDateFrom] = useState<Date | null>(null)
  const [dueDateTo, setDueDateTo] = useState<Date | null>(null)
  const [selectedStatus, setSelectedStatus] = useState<InvoiceStatus | 'all'>('all')
  const [showAdditionalFilters, setShowAdditionalFilters] = useState(false)

  // Filtriranje s useMemo - samodejno ob vsaki spremembi filtrov
  const filteredInvoices = useMemo(() => {
    return invoices.filter(inv => {
      // Filter po številki računa (DELNO ujemanje, ne glede na velike/male črke)
      if (searchNumber && !inv.number.toLowerCase().includes(searchNumber.toLowerCase())) return false
      
      // Filter po kupcu (delno ujemanje po imenu ali davčni številki)
      if (searchCustomer) {
        const customerMatch = inv.customerName.toLowerCase().includes(searchCustomer.toLowerCase()) ||
                              inv.customerTaxId.toLowerCase().includes(searchCustomer.toLowerCase())
        if (!customerMatch) return false
      }
      
      // Filter po občini (delno ujemanje)
      if (searchMunicipality) { 
        const customer = customers.find(c => c.id === inv.customerId)
        const address = customer?.address || ''
        const parts = address.split(',')
        const municipality = parts.length > 1 ? parts[parts.length - 1].trim() : address.trim()
        if (!municipality.toLowerCase().includes(searchMunicipality.toLowerCase())) return false 
      }
      
      // Filter po znesku
      if (priceMin !== '' && inv.totalGross < priceMin) return false
      if (priceMax !== '' && inv.totalGross > priceMax) return false
      
      // Filter po popustu
      const discountPercent = inv.discountPercent ?? 0
      if (discountMin !== '' && discountPercent < discountMin) return false
      if (discountMax !== '' && discountPercent > discountMax) return false
      
      // Filter po datumu izdaje
      const dateFromStr = dateFrom ? formatDateForCompare(dateFrom) : ''
      const dateToStr = dateTo ? formatDateForCompare(dateTo) : ''
      if (dateFromStr && inv.issueDate < dateFromStr) return false
      if (dateToStr && inv.issueDate > dateToStr) return false
      
      // Filter po datumu zapadlosti
      const dueFromStr = dueDateFrom ? formatDateForCompare(dueDateFrom) : ''
      const dueToStr = dueDateTo ? formatDateForCompare(dueDateTo) : ''
      if (dueFromStr && inv.dueDate < dueFromStr) return false
      if (dueToStr && inv.dueDate > dueToStr) return false
      
      // Filter po statusu
      if (selectedStatus !== 'all' && inv.status !== selectedStatus) return false
      
      return true
    })
  }, [
    invoices, customers,
    searchNumber, searchCustomer, searchMunicipality,
    priceMin, priceMax, discountMin, discountMax,
    dateFrom, dateTo, dueDateFrom, dueDateTo, selectedStatus
  ])

  const clearAllFilters = () => {
    setSearchNumber('')
    setSearchCustomer('')
    setSearchMunicipality('')
    setPriceMin('')
    setPriceMax('')
    setDiscountMin('')
    setDiscountMax('')
    setDateFrom(null)
    setDateTo(null)
    setDueDateFrom(null)
    setDueDateTo(null)
    setSelectedStatus('all')
  }

  // Podatki za analizo
  const stats = useMemo(() => {
    const totalGross = filteredInvoices.reduce((sum, inv) => sum + inv.totalGross, 0)
    const totalNet = filteredInvoices.reduce((sum, inv) => sum + inv.totalNet, 0)
    const totalVat = filteredInvoices.reduce((sum, inv) => sum + inv.totalVat, 0)
    const paidAmount = filteredInvoices.filter(inv => inv.status === 'paid').reduce((sum, inv) => sum + inv.totalGross, 0)
    const overdueAmount = filteredInvoices.filter(inv => inv.status === 'overdue').reduce((sum, inv) => sum + inv.totalGross, 0)
    const averageInvoice = filteredInvoices.length > 0 ? totalGross / filteredInvoices.length : 0
    
    // Podatki po statusih za tortni graf
    const byStatus: Record<string, { count: number; amount: number }> = {}
    filteredInvoices.forEach(inv => { 
      if (!byStatus[inv.status]) byStatus[inv.status] = { count: 0, amount: 0 }
      byStatus[inv.status].count++
      byStatus[inv.status].amount += inv.totalGross
    })
    
    // Podatki po mesecih za stolpčni graf
    const monthlyData: Record<string, { month: string; total: number; count: number }> = {}
    filteredInvoices.forEach(inv => {
      const date = new Date(inv.issueDate)
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
      const monthName = date.toLocaleDateString('sl-SI', { month: 'short', year: 'numeric' })
      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = { month: monthName, total: 0, count: 0 }
      }
      monthlyData[monthKey].total += inv.totalGross
      monthlyData[monthKey].count++
    })
    const monthlyChartData = Object.values(monthlyData).sort((a, b) => 
      a.month.localeCompare(b.month)
    )
    
    // Podatki za DDV po stopnjah
    const vatData: Record<string, number> = { '22%': 0, '9.5%': 0, '5%': 0, '0%': 0 }
    filteredInvoices.forEach(inv => {
      inv.items.forEach(item => {
        const key = `${item.vatRate}%`
        vatData[key] += item.vatAmount
      })
    })
    const vatChartData = Object.entries(vatData).map(([name, value]) => ({ name, value }))
    
    // Top 5 kupcev
    const byCustomer: Record<string, { name: string; amount: number; count: number }> = {}
    filteredInvoices.forEach(inv => { 
      if (!byCustomer[inv.customerId]) byCustomer[inv.customerId] = { name: inv.customerName, amount: 0, count: 0 }
      byCustomer[inv.customerId].amount += inv.totalGross
      byCustomer[inv.customerId].count++
    })
    const topCustomers = Object.values(byCustomer)
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5)
    
    return { 
      totalGross, totalNet, totalVat, paidAmount, overdueAmount, averageInvoice,
      byStatus, monthlyChartData, vatChartData, topCustomers,
      count: filteredInvoices.length 
    }
  }, [filteredInvoices])

  const exportToExcel = () => {
    const headers = ['Številka', 'Datum', 'Kupec', 'Davčna', 'Neto', 'DDV', 'Bruto', 'Popust %', 'Status', 'Zapadlost']
    const rows = filteredInvoices.map(inv => [
      inv.number, 
      formatDateForCompare(new Date(inv.issueDate)), 
      inv.customerName, 
      inv.customerTaxId, 
      inv.totalNet, 
      inv.totalVat, 
      inv.totalGross, 
      inv.discountPercent, 
      statusLabels[inv.status], 
      formatDateForCompare(new Date(inv.dueDate))
    ])
    const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `porocilo_${new Date().toISOString().split('T')[0]}.csv`)
    link.click()
    URL.revokeObjectURL(url)
  }

  // Helper za tortni graf - pretvori byStatus v array
  const pieData = Object.entries(stats.byStatus).map(([status, data]) => ({
    name: statusLabels[status] || status,
    value: data.amount,
    count: data.count
  }))

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Poročila in analize</h1>
      </div>
      
      <Card>
        <CardContent className="space-y-4 pt-6">
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

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Številka računa</label>
              <Input 
                placeholder="Številka računa..." 
                value={searchNumber} 
                onChange={(e) => setSearchNumber(e.target.value)} 
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Kupec (naziv ali davčna)</label>
              <Input 
                placeholder="Ime ali davčna številka..." 
                value={searchCustomer} 
                onChange={(e) => setSearchCustomer(e.target.value)} 
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Občina kupca</label>
              <Input 
                placeholder="Občina..." 
                value={searchMunicipality} 
                onChange={(e) => setSearchMunicipality(e.target.value)} 
              />
            </div>
          </div>

          {showAdditionalFilters && (
            <div className="space-y-4 pt-4 border-t">
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
                    <Percent className="w-4 h-4" /> Popust % od
                  </label>
                  <NumberInput 
                    placeholder="Minimalni popust %" 
                    value={discountMin} 
                    onChange={setDiscountMin} 
                    min={0} 
                    max={100}
                  />
                  <label className="text-sm font-medium mt-2 mb-1 block flex items-center gap-1">
                    <Percent className="w-4 h-4" /> Popust % do
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
                  <div className="relative">
                    <select 
                      className="w-full border rounded-md px-3 py-2 bg-white"
                      value={selectedStatus}
                      onChange={(e) => setSelectedStatus(e.target.value as InvoiceStatus | 'all')}
                    >
                      {statusOptions.map(option => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
              
              {/* DATUMSKI FILTRI - enaka postavitev kot InvoiceFilters */}
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
                    customInput={<CustomDateInput onClear={() => setDateFrom(null)} />}
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
                    customInput={<CustomDateInput onClear={() => setDateTo(null)} />}
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
                    customInput={<CustomDateInput onClear={() => setDueDateFrom(null)} />}
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
                    customInput={<CustomDateInput onClear={() => setDueDateTo(null)} />}
                    placeholderText="Izberite datum do"
                    isClearable={false}
                  />
                </div>
              </div>
            </div>
          )}

          <div className="flex gap-2 pt-4">
            <Button variant="secondary" onClick={clearAllFilters}>Počisti filtre</Button>
          </div>
        </CardContent>
      </Card>
      
      {/* Vedno prikaži rezultate (tudi če so prazni) */}
      <div className="space-y-6 animate-fadeIn">
        {/* Kontrole za izvoz */}
        <div className="flex justify-start">
          <div className="flex gap-3">
            <Button variant="outline" onClick={exportToExcel} disabled={filteredInvoices.length === 0}>
              <Download className="w-4 h-4 mr-2" /> Excel
            </Button>
            <Button variant="outline" onClick={() => window.print()} disabled={filteredInvoices.length === 0}>
              <Printer className="w-4 h-4 mr-2" /> PDF / Natisni
            </Button>
          </div>
        </div>

        {filteredInvoices.length === 0 ? (
          <Card>
            <CardContent className="pt-12 pb-12 text-center">
              <p className="text-gray-500">Ni zadetkov za izbrane kriterije.</p>
              <p className="text-sm text-gray-400 mt-1">Spremenite filtre za prikaz rezultatov.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {/* KPI kartice */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 shadow-sm hover:shadow-md transition-all">
                <CardContent className="pt-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm text-blue-600 font-medium">Skupaj bruto</p>
                      <p className="text-2xl font-bold text-blue-800">{formatCurrency(stats.totalGross)}</p>
                      <p className="text-xs text-blue-500 mt-1">{stats.count} računov</p>
                    </div>
                    <DollarSign className="w-8 h-8 text-blue-400" />
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200 shadow-sm hover:shadow-md transition-all">
                <CardContent className="pt-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm text-green-600 font-medium">Povprečna vrednost</p>
                      <p className="text-2xl font-bold text-green-800">{formatCurrency(stats.averageInvoice)}</p>
                      <p className="text-xs text-green-500 mt-1">na račun</p>
                    </div>
                    <TrendingUp className="w-8 h-8 text-green-400" />
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 shadow-sm hover:shadow-md transition-all">
                <CardContent className="pt-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm text-purple-600 font-medium">Skupaj DDV</p>
                      <p className="text-2xl font-bold text-purple-800">{formatCurrency(stats.totalVat)}</p>
                      <p className="text-xs text-purple-500 mt-1">22%, 9.5%, 5%</p>
                    </div>
                    <Percent className="w-8 h-8 text-purple-400" />
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200 shadow-sm hover:shadow-md transition-all">
                <CardContent className="pt-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm text-red-600 font-medium">Zapadlo neplačano</p>
                      <p className="text-2xl font-bold text-red-800">{formatCurrency(stats.overdueAmount)}</p>
                      <p className="text-xs text-red-500 mt-1">potrebno ukrepanje</p>
                    </div>
                    <TrendingDown className="w-8 h-8 text-red-400" />
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Tortni graf - Statusi */}
              <Card className="shadow-md">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PieChartIcon className="w-5 h-5 text-primary" />
                    Porazdelitev po statusih (€)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        labelLine={true}
                        label={({ name, percent }) => `${name}: ${((percent ?? 0) * 100).toFixed(0)}%`}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                        animationDuration={1500}
                        animationBegin={300}
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value: any) => typeof value === 'number' ? formatCurrency(value) : value} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="flex flex-wrap justify-center gap-3 mt-4">
                    {pieData.map((entry, index) => (
                      <div key={entry.name} className="flex items-center gap-1 text-xs">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                        <span>{entry.name}: {formatCurrency(entry.value)}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Tortni graf - DDV po stopnjah */}
              <Card className="shadow-md">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Percent className="w-5 h-5 text-primary" />
                    DDV po stopnjah
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={stats.vatChartData.filter(d => d.value > 0)}
                        cx="50%"
                        cy="50%"
                        labelLine={true}
                        label={({ name, percent }) => `${name}: ${percent != null ? (percent * 100).toFixed(0) : '0'}%`}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                        animationDuration={1500}
                        animationBegin={300}
                      >
                        {stats.vatChartData.filter(d => d.value > 0).map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value: any) => typeof value === 'number' ? formatCurrency(value) : value} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="flex flex-wrap justify-center gap-3 mt-4">
                    {stats.vatChartData.filter(d => d.value > 0).map((entry, index) => (
                      <div key={entry.name} className="flex items-center gap-1 text-xs">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                        <span>{entry.name}: {formatCurrency(entry.value)}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
            
            {/* Stolpčni graf - Mesečni prihodki */}
            <Card className="shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-primary" />
                  Mesečni prihodki
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={350}>
                  <BarChart data={stats.monthlyChartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                    <YAxis tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`} />
                    <Tooltip formatter={(value) => typeof value === 'number' ? formatCurrency(value) : ''} labelFormatter={(label) => `Mesec: ${label}`} />
                    <Legend />
                    <Bar dataKey="total" name="Prihodki (€)" fill="#1f4e79" radius={[4, 4, 0, 0]} animationDuration={1500} animationBegin={300} />
                  </BarChart>
                </ResponsiveContainer>
                <p className="text-xs text-gray-400 text-center mt-2">* Prikazani so bruto zneski po mesecih izdaje računa</p>
              </CardContent>
            </Card>

            {/* Top kupci */}
            <Card className="shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-primary" />
                  Top 5 kupcev po prihodkih
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {stats.topCustomers.map((customer, idx) => (
                    <div key={customer.name} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-lg text-gray-500 w-6">{idx + 1}.</span>
                        <div>
                          <p className="font-medium">{customer.name}</p>
                          <p className="text-xs text-gray-500">{customer.count} računov</p>
                        </div>
                      </div>
                      <p className="font-semibold text-primary">{formatCurrency(customer.amount)}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Dodatna analiza - črtni graf trenda */}
            {stats.monthlyChartData.length >= 2 && (
              <Card className="shadow-md">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-primary" />
                    Trend rasti (mesečno)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={stats.monthlyChartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis dataKey="month" />
                      <YAxis tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`} />
                      <Tooltip formatter={(value) => typeof value === 'number' ? formatCurrency(value) : ''} labelFormatter={(label) => `Mesec: ${label}`} />
                      <Legend />
                      <Line type="monotone" dataKey="total" name="Prihodki (€)" stroke="#1f4e79" strokeWidth={2} dot={{ r: 4 }} animationDuration={1500} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  )
}