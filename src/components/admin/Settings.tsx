// src/components/admin/Settings.tsx
import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Info, X } from 'lucide-react'
import { Textarea } from '@/components/ui/textarea'
import { useSettings } from '@/contexts/SettingsContext'

export function Settings() {
  const { settings, updateSettings } = useSettings()
  
  const [sklicFormat, setSklicFormat] = useState(settings.sklicFormat)
  const [showInfo, setShowInfo] = useState(false)
  
  // Nastavitve za opomine
  const [firstReminderDays, setFirstReminderDays] = useState(settings.firstReminderDays)
  const [secondReminderDays, setSecondReminderDays] = useState(settings.secondReminderDays)
  const [thirdReminderDays, setThirdReminderDays] = useState(settings.thirdReminderDays)

  // BIC izbira
  const [selectedBic, setSelectedBic] = useState(settings.bic)
  
  // Davčni zavezanec
  const [isVatPayer, setIsVatPayer] = useState(settings.isVatPayer)
  const [taxId, setTaxId] = useState(settings.taxId)
  const [registrationNumber, setRegistrationNumber] = useState(settings.registrationNumber)
  
  // Podatki podjetja
  const [companyName, setCompanyName] = useState(settings.companyName)
  const [companyAddress, setCompanyAddress] = useState(settings.companyAddress)
  const [phone, setPhone] = useState(settings.phone)
  const [email, setEmail] = useState(settings.email)
  const [trr, setTrr] = useState(settings.trr)
  
  // Besedila za pošiljanje
  const [invoiceEmailText, setInvoiceEmailText] = useState(settings.invoiceEmailText)
  const [reminderEmailText, setReminderEmailText] = useState(settings.reminderEmailText)

  // Vnaprej pripravljeni formati sklica UPN - razširjeni
  const sklicFormats = [
    { value: 'SI00 {leto}-{stevilka}', label: 'SI00 leto-številka', example: 'SI00 2026-0047' },
    { value: 'SI00 {stevilka}/{leto}', label: 'SI00 številka/leto', example: 'SI00 0047/2026' },
    { value: '{leto}{stevilka}', label: 'letostevilka', example: '20260047' },
    { value: 'SI00 {stevilka}', label: 'SI00 številka', example: 'SI00 0047' },
    { value: 'SI00 {leto}{stevilka}', label: 'SI00 letostevilka', example: 'SI00 20260047' },
    { value: '{stevilka}-{leto}', label: 'številka-leto', example: '0047-2026' },
    { value: 'SI00 {leto}/{stevilka}', label: 'SI00 leto/številka', example: 'SI00 2026/0047' },
    { value: '{stevilka}/{leto}', label: 'številka/leto (brez SI00)', example: '0047/2026' },
    { value: 'SI00 {stevilka:06d}', label: 'SI00 številka (6 mest)', example: 'SI00 000047' },
    { value: '{leto}/{stevilka:06d}', label: 'leto/številka (6 mest)', example: '2026/000047' },
  ]

  // BIC opcije
  const bicOptions = [
    { value: 'BKSI SI22', label: 'Banka Slovenije (BKSI SI22)' },
    { value: 'LJBA SI2X', label: 'NLB d.d. (LJBA SI2X)' },
    { value: 'KBSI SI2X', label: 'SKB banka (KBSI SI2X)' },
    { value: 'ABAN SI2X', label: 'Gorenjska banka (ABAN SI2X)' },
    { value: 'HAAB SI22', label: 'UniCredit Bank (HAAB SI22)' },
    { value: 'SABR SI2X', label: 'Sparkasse (SABR SI2X)' },
    { value: 'DBKX SI2X', label: 'Delavska hranilnica (DBKX SI2X)' },
  ]

  const getSklicPreview = () => {
    const leto = new Date().getFullYear()
    const stevilka = '0047'
    let result = sklicFormat
      .replace('{leto}', leto.toString())
      .replace('{stevilka}', stevilka)
      .replace('{stevilka:06d}', '000047')
    return result
  }

  const handleSaveSettings = () => {
    const newSettings = {
      companyName,
      companyAddress,
      isVatPayer,
      taxId: isVatPayer ? taxId : '',
      registrationNumber,
      phone,
      email,
      trr,
      bic: selectedBic,
      sklicFormat,
      firstReminderDays,
      secondReminderDays,
      thirdReminderDays,
      invoiceEmailText,
      reminderEmailText
    }
    
    updateSettings(newSettings)
    alert('Nastavitve so bile shranjene!')
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Sistemske nastavitve</h1>
      
      {/* Kartica: Podatki podjetja */}
      <Card>
        <CardHeader><CardTitle>Podatki podjetja</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          {/* Prva vrstica - Naziv in Davčni zavezanec */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium block mb-1">Naziv podjetja *</label>
              <Input 
                value={companyName} 
                onChange={(e) => setCompanyName(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium block mb-1">Davčni zavezanec?</label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsVatPayer(true)}
                  className={`w-16 py-1.5 rounded-md text-sm font-medium transition-colors ${
                    isVatPayer 
                      ? 'bg-primary text-white' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Da
                </button>
                <button
                  type="button"
                  onClick={() => setIsVatPayer(false)}
                  className={`w-16 py-1.5 rounded-md text-sm font-medium transition-colors ${
                    !isVatPayer 
                      ? 'bg-primary text-white' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Ne
                </button>

              </div>
            </div>
          </div>

          {/* Druga vrstica - Naslov in ID za DDV */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium block mb-1">Naslov *</label>
              <Input 
                value={companyAddress} 
                onChange={(e) => setCompanyAddress(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium block mb-1">ID za DDV {isVatPayer ? '*' : ''}</label>
              <Input 
                value={isVatPayer ? taxId : ''} 
                onChange={(e) => setTaxId(e.target.value)}
                placeholder={isVatPayer ? "SI12345678" : "Ni potrebno"}
                disabled={!isVatPayer}
                className={!isVatPayer ? "bg-gray-100 cursor-not-allowed" : ""}
                title={!isVatPayer ? "Davčni nezavezanci ne potrebujejo ID za DDV" : "Vnesite ID za DDV v formatu SI + 8 številk"}
              />
              {isVatPayer && (
                <p className="text-xs text-gray-400 mt-1">Vnesi ID za DDV</p>
              )}
              {!isVatPayer && (
                <p className="text-xs text-gray-400 mt-1">Davčni nezavezanci ne potrebujejo ID za DDV</p>
              )}
            </div>
          </div>

          {/* Tretja vrstica - Ostali podatki (Telefon, Email, Matična, TRR, BIC) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium block mb-1">Telefon</label>
              <Input 
                value={phone} 
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+386 1 234 5678" 
              />
            </div>
            <div>
              <label className="text-sm font-medium block mb-1">E-pošta *</label>
              <Input 
                type="email"
                value={email} 
                onChange={(e) => setEmail(e.target.value)}
                placeholder="info@podjetje.si"
                className="w-full"
              />
            </div>
            <div>
              <label className="text-sm font-medium block mb-1">Matična številka</label>
              <Input 
                value={registrationNumber} 
                onChange={(e) => setRegistrationNumber(e.target.value)}
                placeholder="12345678" 
              />
            </div>
            <div>
              <label className="text-sm font-medium block mb-1">TRR (IBAN) *</label>
              <Input 
                value={trr} 
                onChange={(e) => setTrr(e.target.value)}
                placeholder="SI56 2900 0000 1234 567" 
              />
            </div>
            <div>
              <label className="text-sm font-medium block mb-1">BIC/SWIFT *</label>
              <Select value={selectedBic} onValueChange={setSelectedBic}>
                <SelectTrigger>
                  <SelectValue placeholder="Izberite banko" />
                </SelectTrigger>
                <SelectContent>
                  {bicOptions.map((bic) => (
                    <SelectItem key={bic.value} value={bic.value}>
                      {bic.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

          {/* Format sklica UPN */}
          <div>
            <label className="text-sm font-medium block mb-1">Format sklica UPN *</label>
            <div className="w-full">
              <Select value={sklicFormat} onValueChange={(value) => setSklicFormat(value)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Izberite predlogo" />
                </SelectTrigger>
                <SelectContent className="max-h-60">
                  {sklicFormats.map((format) => (
                    <SelectItem key={format.value} value={format.value}>
                      {format.label} 
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="text-xs text-gray-500 mt-2">
              Primer: {getSklicPreview()}
            </div>
          </div>
          </div>
        </CardContent>
      </Card>

       {/* Kartica: Nastavitve opominov */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Nastavitve opominov</CardTitle>
          </div>
          <button 
            onClick={() => setShowInfo(!showInfo)}
            className="text-gray-400 hover:text-blue-500 transition-colors"
          >
            <Info className="w-5 h-5" />
          </button>
        </CardHeader>
        
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
                <p>Sistem vsak dan ob 8:00 preveri zapadle račune. Ko število dni zamude doseže izbrane vrednosti, pošlje opozorilo tajništvu.</p>
              </div>
            </div>
          </div>
        )}
        
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="text-sm font-medium block mb-1">1. opomin (dni)</label>
              <Input 
                type="number" 
                value={firstReminderDays}
                onChange={(e) => setFirstReminderDays(Number(e.target.value))}
                min={1}
                max={365}
              />
              <p className="text-xs text-gray-400 mt-1">Po {firstReminderDays} dneh</p>
            </div>
            <div>
              <label className="text-sm font-medium block mb-1">2. opomin (dni)</label>
              <Input 
                type="number" 
                value={secondReminderDays}
                onChange={(e) => setSecondReminderDays(Number(e.target.value))}
                min={1}
                max={365}
              />
              <p className="text-xs text-gray-400 mt-1">Po {secondReminderDays} dneh</p>
            </div>
            <div>
              <label className="text-sm font-medium block mb-1">3. opomin (dni)</label>
              <Input 
                type="number" 
                value={thirdReminderDays}
                onChange={(e) => setThirdReminderDays(Number(e.target.value))}
                min={1}
                max={365}
              />
              <p className="text-xs text-gray-400 mt-1">Po {thirdReminderDays} dneh</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Kartica: Besedila za e-pošto */}
      <Card>
        <CardHeader>
          <CardTitle>Besedila za e-pošto</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <label className="text-sm font-medium block mb-2">Besedilo za pošiljanje računov</label>
            <Textarea 
              value={invoiceEmailText}
              onChange={(e) => setInvoiceEmailText(e.target.value)}
              rows={8}
              className="font-mono text-sm w-full min-h-[300px]"
            />
            <p className="text-xs text-gray-400 mt-2">
              Oznake: {'{stevilka}'}, {'{datumIzdaje}'}, {'{znesek}'}, {'{rokPlacila}'}, {'{imePodjetja}'}
            </p>
          </div>
          
          <div>
            <label className="text-sm font-medium block mb-2">Besedilo za opomin (e-pošta)</label>
            <Textarea 
              value={reminderEmailText}
              onChange={(e) => setReminderEmailText(e.target.value)}
              rows={10}
              className="font-mono text-sm w-full min-h-[300px]"
            />
            <p className="text-xs text-gray-400 mt-2">
              Oznake: {'{stevilka}'}, {'{datumIzdaje}'}, {'{znesek}'}, {'{datumZapadlosti}'}, {'{dniZamude}'}, {'{imePodjetja}'}
            </p>
          </div>


        </CardContent>
      </Card>

     

      <Button onClick={handleSaveSettings} className="w-full md:w-auto">Shrani nastavitve</Button>
    </div>
  )
}