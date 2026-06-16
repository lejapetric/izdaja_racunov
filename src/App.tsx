// src/App.tsx
import { useState } from 'react'
import { Sidebar } from '@/components/layout/Sidebar'
import { NewInvoice } from '@/components/invoice/NewInvoice'
import { InvoiceArchive } from '@/components/invoice/InvoiceArchive'
import { OverdueAlerts } from '@/components/OverdueAlerts'
import { Estimates } from '@/components/Estimates'
import { Reports } from '@/components/Reports'
import { UserManagement } from '@/components/admin/UserManagement'
import { Settings } from '@/components/admin/Settings'
import { Invoice } from '@/types'
import { SettingsProvider } from '@/contexts/SettingsContext'
import { Confirmation } from '@/components/Confirmation'

function App() {
  const [activeView, setActiveView] = useState('archive')
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null)
  const userRole = 'admin'

  const renderView = () => {
    switch (activeView) {
      case 'new-invoice': 
        return <NewInvoice editingInvoice={editingInvoice} clearEditing={() => setEditingInvoice(null)} />
      case 'archive': 
        return <InvoiceArchive onEditInvoice={(inv) => { setEditingInvoice(inv); setActiveView('new-invoice') }} />
      case 'overdue': 
        return <OverdueAlerts />
      case 'estimates': 
        return <Estimates setActiveView={setActiveView} />
      case 'confirmation':  // <-- DODAJTE TO
        return <Confirmation setActiveView={setActiveView} />
      case 'reports': 
        return <Reports />
      case 'users': 
        return <UserManagement />
      case 'settings': 
        return <Settings />
      default: 
        return <InvoiceArchive onEditInvoice={() => {}} />
    }
  }

  return (
    <SettingsProvider>
      <div className="flex h-screen">
        <Sidebar activeView={activeView} setActiveView={setActiveView} userRole={userRole} />
        <main className="flex-1 overflow-auto bg-gray-50">
          <div className="p-4 md:p-6">{renderView()}</div>
        </main>
      </div>
    </SettingsProvider>
  )
}

export default App