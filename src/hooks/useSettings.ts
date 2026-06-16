// src/hooks/useSettings.ts
import { useState, useEffect } from 'react'

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

export function useSettings() {
  const [settings, setSettings] = useState<Settings>(defaultSettings)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Poskusimo naložiti iz localStorage
    const savedSettings = localStorage.getItem('appSettings')
    
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings)
        // Združimo z default nastavitvami
        setSettings({ ...defaultSettings, ...parsed })
      } catch (error) {
        console.error('Napaka pri nalaganju nastavitev:', error)
        // Če je napaka, shranimo default
        localStorage.setItem('appSettings', JSON.stringify(defaultSettings))
        setSettings(defaultSettings)
      }
    } else {
      // Če ni shranjenih nastavitev, shranimo default
      console.log('Inicializiram privzete nastavitve...')
      localStorage.setItem('appSettings', JSON.stringify(defaultSettings))
      setSettings(defaultSettings)
    }
    setLoading(false)
  }, [])

  const updateSettings = (newSettings: Settings) => {
    setSettings(newSettings)
    localStorage.setItem('appSettings', JSON.stringify(newSettings))
  }

  return { settings, updateSettings, loading }
}