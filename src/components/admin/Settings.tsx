// src/components/admin/Settings.tsx
import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Info, X } from 'lucide-react'

export function Settings() {
  const [sklicFormat, setSklicFormat] = useState('SI00 {leto}-{stevilka}')
  const [showInfo, setShowInfo] = useState(false)
  
  // Nastavitve za opomine
  const [firstReminderDays, setFirstReminderDays] = useState(7)
  const [secondReminderDays, setSecondReminderDays] = useState(14)
  const [thirdReminderDays, setThirdReminderDays] = useState(21)

  // Vnaprej pripravljeni formati sklica UPN
  const sklicFormats = [
    { value: 'SI00 {leto}-{stevilka}', label: 'SI00 2026-0047' },
    { value: 'SI00 {stevilka}/{leto}', label: 'SI00 0047/2026' },
    { value: '{leto}{stevilka}', label: '20260047' },
    { value: 'SI00 {stevilka}', label: 'SI00 0047' },
  ]

  const getSklicPreview = () => {
    const leto = new Date().getFullYear()
    const stevilka = '0047'
    return sklicFormat
      .replace('{leto}', leto.toString())
      .replace('{stevilka}', stevilka)
  }

  const handleSaveSettings = () => {
    console.log('Shranjene nastavitve:', {
      sklicFormat,
      reminderDays: {
        first: firstReminderDays,
        second: secondReminderDays,
        third: thirdReminderDays
      }
    })
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Sistemske nastavitve</h1>
      
      {/* Kartica: Podatki podjetja */}
      <Card>
        <CardHeader><CardTitle>Podatki podjetja</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><label className="text-sm font-medium block mb-1">Naziv podjetja *</label><Input defaultValue="Geodetstvo Novak d.o.o." /></div>
            <div><label className="text-sm font-medium block mb-1">Davčna številka *</label><Input defaultValue="SI12345678" /></div>
            <div className="md:col-span-2"><label className="text-sm font-medium block mb-1">Naslov *</label><Input defaultValue="Geodetska ulica 4, 1000 Ljubljana" /></div>
            <div><label className="text-sm font-medium block mb-1">TRR (IBAN) *</label><Input defaultValue="SI56 6100 0002 3456 789" /></div>
            <div><label className="text-sm font-medium block mb-1">Telefon</label><Input defaultValue="+386 1 234 5678" /></div>
            <div><label className="text-sm font-medium block mb-1">E-pošta *</label><Input defaultValue="info@geodetstvo-novak.si" /></div>
            
            {/* Format sklica UPN - Dropdown + Input */}
            <div className="md:col-span-2">
              <label className="text-sm font-medium block mb-1">Format sklica UPN *</label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Select value={sklicFormat} onValueChange={(value) => setSklicFormat(value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Izberite predlogo" />
                  </SelectTrigger>
                  <SelectContent>
                    {sklicFormats.map((format) => (
                      <SelectItem key={format.value} value={format.value}>
                        {format.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input 
                  placeholder="Vaša predloga npr. SI00 {leto}-{stevilka}"
                  value={sklicFormat}
                  onChange={(e) => setSklicFormat(e.target.value)}
                />
              </div>
              <div className="text-xs text-gray-500 mt-2">
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Kartica: Nastavitve opominov */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Nastavitve opominov za neplačane račune</CardTitle>
          </div>
          <button 
            onClick={() => setShowInfo(!showInfo)}
            className="text-gray-400 hover:text-blue-500 transition-colors"
          >
            <Info className="w-5 h-5" />
          </button>
        </CardHeader>
        
        {/* Informacijski popup */}
        {showInfo && (
          <div className="mx-6 mb-4 bg-blue-50 border border-blue-200 rounded-lg p-4 relative">
            <button 
              onClick={() => setShowInfo(false)}
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
            <div className="flex items-start gap-3 pr-6">
              <div className="text-blue-500 text-lg">ℹ️</div>
              <div className="text-sm text-blue-800">
                <p className="font-medium mb-1">Kako deluje?</p>
                <p>Sistem vsak dan ob 8:00 preveri vse zapadle račune. Če je število dni zamude enako kateri od zgornjih vrednosti, pošlje e-poštno opozorilo tajništvu s seznamom računov. Tajništvo nato ročno pošlje opomine kupcem.</p>
              </div>
            </div>
          </div>
        )}
        
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* 1. opomin */}
            <div>
              <label className="text-sm font-medium block mb-1">1. opomin (dni po zapadlosti)</label>
              <Input 
                type="number" 
                value={firstReminderDays}
                onChange={(e) => setFirstReminderDays(Number(e.target.value))}
                min={1}
                max={365}
              />
              <p className="text-xs text-gray-400 mt-1">Po {firstReminderDays} dneh pošlji opozorilo tajništvu</p>
            </div>

            {/* 2. opomin */}
            <div>
              <label className="text-sm font-medium block mb-1">2. opomin (dni po zapadlosti)</label>
              <Input 
                type="number" 
                value={secondReminderDays}
                onChange={(e) => setSecondReminderDays(Number(e.target.value))}
                min={1}
                max={365}
              />
              <p className="text-xs text-gray-400 mt-1">Po {secondReminderDays} dneh pošlji opozorilo tajništvu</p>
            </div>

            {/* 3. opomin */}
            <div>
              <label className="text-sm font-medium block mb-1">3. opomin (dni po zapadlosti)</label>
              <Input 
                type="number" 
                value={thirdReminderDays}
                onChange={(e) => setThirdReminderDays(Number(e.target.value))}
                min={1}
                max={365}
              />
              <p className="text-xs text-gray-400 mt-1">Po {thirdReminderDays} dneh pošlji opozorilo tajništvu</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Button onClick={handleSaveSettings} className="w-full md:w-auto">Shrani nastavitve</Button>
    </div>
  )
}