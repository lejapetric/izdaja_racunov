// src/contexts/SettingsContext.tsx
import { createContext, useContext, useState, ReactNode, useEffect } from 'react'

export interface Settings {
  companyName: string
  companyAddress: string
  isVatPayer: boolean
  taxId: string
  registrationNumber: string
  phone: string
  email: string
  trr: string
  bic: string
  sklicFormat: string
  firstReminderDays: number
  secondReminderDays: number
  thirdReminderDays: number
  invoiceEmailText: string
  reminderEmailText: string
}

interface SettingsContextType {
  settings: Settings
  updateSettings: (newSettings: Settings) => void
  loading: boolean
}

const defaultSettings: Settings = {
  companyName: 'Geodetski biro Kranj d.o.o.',
  companyAddress: 'Prešernova cesta 22, 4000 Kranj',
  isVatPayer: true,
  taxId: 'SI78945612',
  registrationNumber: '65412378',
  phone: '+386 4 123 4567',
  email: 'info@geodetstvo-kranj.si',
  trr: 'SI56 2900 0000 1234 567',
  bic: 'BKSI SI22',
  sklicFormat: 'SI00 {leto}-{stevilka}',
  firstReminderDays: 7,
  secondReminderDays: 14,
  thirdReminderDays: 21,
  invoiceEmailText: `Spoštovani,

V priponki vam pošiljamo račun št. {stevilka} z dne {datumIzdaje} v skupnem znesku {znesek}.

Prosimo, da račun poravnate v roku {rokPlacila} dni.

Lep pozdrav,
{imePodjetja}`,
  reminderEmailText: `Spoštovani,

Opominjamo vas, da je račun št. {stevilka} z dne {datumIzdaje} v znesku {znesek} zapadel v plačilo dne {datumZapadlosti}.

Trenutno stanje zamude: {dniZamude} dni.

Prosimo, da račun poravnate v najkrajšem možnem času.

Lep pozdrav,
{imePodjetja}`
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined)

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<Settings>(defaultSettings)
  const [loading, setLoading] = useState(true)

  // Naloži nastavitve iz localStorage ob zagonu
  useEffect(() => {
    const savedSettings = localStorage.getItem('appSettings')
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings)
        setSettings({ ...defaultSettings, ...parsed })
      } catch (error) {
        console.error('Napaka pri nalaganju nastavitev:', error)
      }
    }
    setLoading(false)
  }, [])

  const updateSettings = (newSettings: Settings) => {
    setSettings(newSettings)
    localStorage.setItem('appSettings', JSON.stringify(newSettings))
  }

  return (
    <SettingsContext.Provider value={{ settings, updateSettings, loading }}>
      {children}
    </SettingsContext.Provider>
  )
}

export function useSettings() {
  const context = useContext(SettingsContext)
  if (context === undefined) {
    throw new Error('useSettings mora biti uporabljen znotraj SettingsProvider')
  }
  return context
}