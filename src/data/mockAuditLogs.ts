// src/data/mockAuditLogs.ts

export interface AuditLogEntry {
  id: string
  invoiceId: string
  invoiceNumber: string
  action: string
  user: string
  userRole: string
  timestamp: string
  details: string
  oldStatus?: string
  newStatus?: string
  currentStatus?: string
}

export const mockAuditLogs: AuditLogEntry[] = [
  // R-2025-0047
  { 
    id: 'a1', 
    invoiceId: 'inv1', 
    invoiceNumber: 'R-2025-0047', 
    action: 'created', 
    user: 'Maja Novak', 
    userRole: 'tajnistvo', 
    timestamp: '2025-06-09T10:00:00Z', 
    details: 'Račun ustvarjen iz predračuna P-2405-12',
    newStatus: 'issued'
  },
  { 
    id: 'a2', 
    invoiceId: 'inv1', 
    invoiceNumber: 'R-2025-0047', 
    action: 'emailed', 
    user: 'Maja Novak', 
    userRole: 'tajnistvo', 
    timestamp: '2025-06-09T10:30:00Z', 
    details: 'Račun poslan po e-pošti na naslov info@kranj.si',
    currentStatus: 'sent'
  },
  { 
    id: 'a3', 
    invoiceId: 'inv1', 
    invoiceNumber: 'R-2025-0047', 
    action: 'paid', 
    user: 'Igor Žagar', 
    userRole: 'direktor', 
    timestamp: '2025-07-10T14:00:00Z', 
    details: 'Račun označen kot plačan - plačilo prispelo na TRR',
    oldStatus: 'issued',
    newStatus: 'paid'
  },

  // R-2025-0048
  { 
    id: 'a4', 
    invoiceId: 'inv2', 
    invoiceNumber: 'R-2025-0048', 
    action: 'created', 
    user: 'Ana Kuhar', 
    userRole: 'projektant', 
    timestamp: '2025-06-15T09:00:00Z', 
    details: 'Račun ustvarjen na podlagi terenskega dela',
    newStatus: 'issued'
  },
  { 
    id: 'a5', 
    invoiceId: 'inv2', 
    invoiceNumber: 'R-2025-0048', 
    action: 'overdue_set', 
    user: 'Sistem', 
    userRole: 'auto', 
    timestamp: '2025-07-16T00:00:00Z', 
    details: 'Račun samodejno označen kot zapadel - rok plačila potekel',
    oldStatus: 'sent',
    newStatus: 'overdue'
  },

  // R-2025-0049
  { 
    id: 'a6', 
    invoiceId: 'inv3', 
    invoiceNumber: 'R-2025-0049', 
    action: 'created', 
    user: 'Maja Novak', 
    userRole: 'tajnistvo', 
    timestamp: '2025-06-20T08:00:00Z', 
    details: 'Račun ustvarjen',
    newStatus: 'issued'
  },
  { 
    id: 'a7', 
    invoiceId: 'inv3', 
    invoiceNumber: 'R-2025-0049', 
    action: 'edited', 
    user: 'Maja Novak', 
    userRole: 'tajnistvo', 
    timestamp: '2025-06-20T08:30:00Z', 
    details: 'Popravljena cena pri postavki Geodetsko snemanje s 140€ na 150€',
    currentStatus: 'issued'
  },
  { 
    id: 'a8', 
    invoiceId: 'inv3', 
    invoiceNumber: 'R-2025-0049', 
    action: 'sent', 
    user: 'Maja Novak', 
    userRole: 'tajnistvo', 
    timestamp: '2025-06-21T11:00:00Z', 
    details: 'Račun poslan po e-pošti na naslov stanislav.horvat@gmail.com',
    currentStatus: 'sent'
  },

  // R-2025-0046 (storniran)
  { 
    id: 'a9', 
    invoiceId: 'inv6', 
    invoiceNumber: 'R-2025-0046', 
    action: 'created', 
    user: 'Maja Novak', 
    userRole: 'tajnistvo', 
    timestamp: '2025-05-20T10:00:00Z', 
    details: 'Račun ustvarjen',
    newStatus: 'issued'
  },
  { 
    id: 'a10', 
    invoiceId: 'inv6', 
    invoiceNumber: 'R-2025-0046', 
    action: 'sent', 
    user: 'Maja Novak', 
    userRole: 'tajnistvo', 
    timestamp: '2025-05-20T10:30:00Z', 
    details: 'Račun poslan po e-pošti',
    currentStatus: 'sent'
  },
  { 
    id: 'a11', 
    invoiceId: 'inv6', 
    invoiceNumber: 'R-2025-0046', 
    action: 'cancelled', 
    user: 'Maja Novak', 
    userRole: 'tajnistvo', 
    timestamp: '2025-05-25T09:00:00Z', 
    details: 'Račun storniran - Razlog: Kupec je podvojil naročilo',
    oldStatus: 'sent',
    newStatus: 'cancelled'
  },

  // R-2025-0057 (delno plačano)
  { 
    id: 'a12', 
    invoiceId: 'inv8', 
    invoiceNumber: 'R-2025-0057', 
    action: 'created', 
    user: 'Maja Novak', 
    userRole: 'tajnistvo', 
    timestamp: '2025-07-01T08:00:00Z', 
    details: 'Račun ustvarjen na podlagi naročila Občine Ljubljana',
    newStatus: 'issued'
  },
  { 
    id: 'a13', 
    invoiceId: 'inv8', 
    invoiceNumber: 'R-2025-0057', 
    action: 'sent', 
    user: 'Maja Novak', 
    userRole: 'tajnistvo', 
    timestamp: '2025-07-01T09:30:00Z', 
    details: 'Račun poslan po e-pošti na naslov info@ljubljana.si',
    currentStatus: 'sent'
  },
  { 
    id: 'a14', 
    invoiceId: 'inv8', 
    invoiceNumber: 'R-2025-0057', 
    action: 'partially_paid', 
    user: 'Igor Žagar', 
    userRole: 'direktor', 
    timestamp: '2025-07-15T12:00:00Z', 
    details: 'Prejeto delno plačilo v višini 750€ (50% zneska)',
    oldStatus: 'sent',
    newStatus: 'partially_paid'
  },
  { 
    id: 'a15', 
    invoiceId: 'inv8', 
    invoiceNumber: 'R-2025-0057', 
    action: 'paid', 
    user: 'Maja Novak', 
    userRole: 'tajnistvo', 
    timestamp: '2025-08-15T10:00:00Z', 
    details: 'Prejeto preostalo plačilo 750€. Račun v celoti poravnan.',
    oldStatus: 'partially_paid',
    newStatus: 'paid'
  },

  // R-2025-0058 - Popolna zgodovina po časovnem vrstnem redu
{ 
  id: 'a16', 
  invoiceId: 'inv9', 
  invoiceNumber: 'R-2025-0058', 
  action: 'unconfirmed', 
  user: 'Ana Kuhar', 
  userRole: 'projektant', 
  timestamp: '2025-07-10T09:00:00Z', 
  details: 'Račun ustvarjen po opravljeni parcelaciji',
  newStatus: 'unconfirmed'
},
{ 
  id: 'a17', 
  invoiceId: 'inv9', 
  invoiceNumber: 'R-2025-0058', 
  action: 'unconfirmed', 
  user: 'Ana Kuhar', 
  userRole: 'projektant', 
  timestamp: '2025-07-10T09:30:00Z', 
  details: 'Popravljena količina postavk s 3 ure na 5 ur',
  currentStatus: 'unconfirmed'
},
{ 
  id: 'a18', 
  invoiceId: 'inv9', 
  invoiceNumber: 'R-2025-0058', 
  action: 'unconfirmed', 
  user: 'Ana Kuhar', 
  userRole: 'projektant', 
  timestamp: '2025-07-11T08:00:00Z', 
  details: 'Račun poslan direktorju za potrditev',
  currentStatus: 'unconfirmed'
},
{ 
  id: 'a19', 
  invoiceId: 'inv9', 
  invoiceNumber: 'R-2025-0058', 
  action: 'rejected', 
  user: 'Igor Žagar', 
  userRole: 'direktor', 
  timestamp: '2025-07-12T09:00:00Z', 
  details: 'Direktor je zavrnil račun (napačna količina)',
  oldStatus: 'unconfirmed',
  newStatus: 'rejected'
},
{ 
  id: 'a20', 
  invoiceId: 'inv9', 
  invoiceNumber: 'R-2025-0058', 
  action: 'rejected', 
  user: 'Ana Kuhar', 
  userRole: 'projektant', 
  timestamp: '2025-07-12T09:30:00Z', 
  details: 'Popravljena količina postavk po pripombah direktorja',
  currentStatus: 'rejected'
},
{ 
  id: 'a21', 
  invoiceId: 'inv9', 
  invoiceNumber: 'R-2025-0058', 
  action: 'rejected', 
  user: 'Ana Kuhar', 
  userRole: 'projektant', 
  timestamp: '2025-07-12T10:00:00Z', 
  details: 'Popravljen račun ponovno poslan direktorju v potrditev',
  currentStatus: 'rejected'
},
{ 
  id: 'a22', 
  invoiceId: 'inv9', 
  invoiceNumber: 'R-2025-0058', 
  action: 'issued', 
  user: 'Igor Žagar', 
  userRole: 'direktor', 
  timestamp: '2025-07-12T11:00:00Z', 
  details: 'Direktor je potrdil račun',
  oldStatus: 'rejected',
  newStatus: 'issued'
},
{ 
  id: 'a23', 
  invoiceId: 'inv9', 
  invoiceNumber: 'R-2025-0058', 
  action: 'sent', 
  user: 'Ana Kuhar', 
  userRole: 'projektant', 
  timestamp: '2025-07-13T09:00:00Z', 
  details: 'Račun poslan stranki Gradnja Marles d.o.o.',
  currentStatus: 'sent'
},
{ 
  id: 'a24', 
  invoiceId: 'inv9', 
  invoiceNumber: 'R-2025-0058', 
  action: 'partially_paid', 
  user: 'Maja Novak', 
  userRole: 'tajnistvo', 
  timestamp: '2025-08-01T13:00:00Z', 
  details: 'Plačano 50% zneska. Dogovorjeno obročno plačilo.',
  oldStatus: 'sent',
  newStatus: 'partially_paid'
},
{ 
  id: 'a25', 
  invoiceId: 'inv9', 
  invoiceNumber: 'R-2025-0058', 
  action: 'paid', 
  user: 'Maja Novak', 
  userRole: 'tajnistvo', 
  timestamp: '2025-09-01T14:00:00Z', 
  details: 'Prejeto preostalih 50% - račun v celoti poravnan.',
  oldStatus: 'partially_paid',
  newStatus: 'paid'
},

  // R-2025-0051 (izvoz)
  { 
    id: 'a22', 
    invoiceId: 'inv7', 
    invoiceNumber: 'R-2025-0051', 
    action: 'created', 
    user: 'Maja Novak', 
    userRole: 'tajnistvo', 
    timestamp: '2025-06-30T10:00:00Z', 
    details: 'Račun ustvarjen za izvozne storitve',
    newStatus: 'issued'
  },
  { 
    id: 'a23', 
    invoiceId: 'inv7', 
    invoiceNumber: 'R-2025-0051', 
    action: 'sent', 
    user: 'Maja Novak', 
    userRole: 'tajnistvo', 
    timestamp: '2025-07-01T09:00:00Z', 
    details: 'Račun poslan kupcu v Sloveniji',
    currentStatus: 'sent'
  },
  { 
    id: 'a24', 
    invoiceId: 'inv7', 
    invoiceNumber: 'R-2025-0051', 
    action: 'paid', 
    user: 'Maja Novak', 
    userRole: 'tajnistvo', 
    timestamp: '2025-07-20T13:00:00Z', 
    details: 'Plačilo prispelo na TRR - račun poravnan',
    oldStatus: 'sent',
    newStatus: 'paid'
  },

  // Predračuni
  { 
    id: 'a25', 
    invoiceId: 'est1', 
    invoiceNumber: 'PR-2026-0001', 
    action: 'created', 
    user: 'Maja Novak', 
    userRole: 'tajnistvo', 
    timestamp: '2026-05-01T09:00:00Z', 
    details: 'Predračun ustvarjen',
    newStatus: 'issued'
  },
  { 
    id: 'a26', 
    invoiceId: 'est1', 
    invoiceNumber: 'PR-2026-0001', 
    action: 'sent', 
    user: 'Maja Novak', 
    userRole: 'tajnistvo', 
    timestamp: '2026-05-02T10:00:00Z', 
    details: 'Predračun poslan po e-pošti',
    currentStatus: 'sent'
  },

  { 
    id: 'a27', 
    invoiceId: 'est2', 
    invoiceNumber: 'PR-2026-0002', 
    action: 'created', 
    user: 'Igor Žagar', 
    userRole: 'direktor', 
    timestamp: '2026-05-10T11:00:00Z', 
    details: 'Predračun ustvarjen',
    newStatus: 'issued'
  },

  { 
    id: 'a28', 
    invoiceId: 'est3', 
    invoiceNumber: 'PR-2026-0003', 
    action: 'created', 
    user: 'Ana Kuhar', 
    userRole: 'projektant', 
    timestamp: '2026-05-15T14:00:00Z', 
    details: 'Predračun ustvarjen',
    newStatus: 'issued'
  },
  { 
    id: 'a29', 
    invoiceId: 'est3', 
    invoiceNumber: 'PR-2026-0003', 
    action: 'sent', 
    user: 'Ana Kuhar', 
    userRole: 'projektant', 
    timestamp: '2026-05-16T09:00:00Z', 
    details: 'Predračun poslan po e-pošti',
    currentStatus: 'sent'
  },

  // PR-2026-0007 (converted)
  { 
    id: 'a30', 
    invoiceId: 'est7', 
    invoiceNumber: 'PR-2026-0007', 
    action: 'created', 
    user: 'Ana Kuhar', 
    userRole: 'projektant', 
    timestamp: '2026-06-01T09:00:00Z', 
    details: 'Predračun ustvarjen za projekt ureditve okolice',
    newStatus: 'issued'
  },
  { 
    id: 'a31', 
    invoiceId: 'est7', 
    invoiceNumber: 'PR-2026-0007', 
    action: 'sent', 
    user: 'Maja Novak', 
    userRole: 'tajnistvo', 
    timestamp: '2026-06-05T11:00:00Z', 
    details: 'Predračun poslan kupcu po e-pošti',
    currentStatus: 'sent'
  },
  { 
    id: 'a32', 
    invoiceId: 'est7', 
    invoiceNumber: 'PR-2026-0007', 
    action: 'converted', 
    user: 'Sistem', 
    userRole: 'auto', 
    timestamp: '2026-06-10T14:00:00Z', 
    details: 'Predračun spremenjen v račun R-2026-0045',
    oldStatus: 'sent',
    newStatus: 'converted'
  },

  // PR-2026-0008 (converted)
  { 
    id: 'a33', 
    invoiceId: 'est8', 
    invoiceNumber: 'PR-2026-0008', 
    action: 'created', 
    user: 'Maja Novak', 
    userRole: 'tajnistvo', 
    timestamp: '2026-06-01T10:00:00Z', 
    details: 'Predračun ustvarjen na podlagi telefonskega naročila',
    newStatus: 'issued'
  },
  { 
    id: 'a34', 
    invoiceId: 'est8', 
    invoiceNumber: 'PR-2026-0008', 
    action: 'edited', 
    user: 'Maja Novak', 
    userRole: 'tajnistvo', 
    timestamp: '2026-06-02T09:00:00Z', 
    details: 'Dodana parcela 555/1, k.o. Šiška',
    currentStatus: 'issued'
  },
  { 
    id: 'a35', 
    invoiceId: 'est8', 
    invoiceNumber: 'PR-2026-0008', 
    action: 'sent', 
    user: 'Maja Novak', 
    userRole: 'tajnistvo', 
    timestamp: '2026-06-03T11:00:00Z', 
    details: 'Predračun poslan kupcu po e-pošti',
    currentStatus: 'sent'
  },
  { 
    id: 'a36', 
    invoiceId: 'est8', 
    invoiceNumber: 'PR-2026-0008', 
    action: 'converted', 
    user: 'Maja Novak', 
    userRole: 'tajnistvo', 
    timestamp: '2026-06-15T12:00:00Z', 
    details: 'Predračun spremenjen v račun R-2026-0045',
    oldStatus: 'sent',
    newStatus: 'converted'
  },

  // PR-2026-0009 (converted z zamudo)
  { 
    id: 'a37', 
    invoiceId: 'est9', 
    invoiceNumber: 'PR-2026-0009', 
    action: 'created', 
    user: 'Ana Kuhar', 
    userRole: 'projektant', 
    timestamp: '2026-06-10T09:00:00Z', 
    details: 'Predračun ustvarjen na podlagi ponudbe',
    newStatus: 'issued'
  },
  { 
    id: 'a38', 
    invoiceId: 'est9', 
    invoiceNumber: 'PR-2026-0009', 
    action: 'sent', 
    user: 'Ana Kuhar', 
    userRole: 'projektant', 
    timestamp: '2026-06-11T10:00:00Z', 
    details: 'Predračun poslan po e-pošti',
    currentStatus: 'sent'
  },
  { 
    id: 'a39', 
    invoiceId: 'est9', 
    invoiceNumber: 'PR-2026-0009', 
    action: 'overdue_set', 
    user: 'Sistem', 
    userRole: 'auto', 
    timestamp: '2026-07-11T00:00:00Z', 
    details: 'Predračun zapadel - ni bil potrjen v roku',
    oldStatus: 'sent',
    newStatus: 'overdue'
  },
  { 
    id: 'a40', 
    invoiceId: 'est9', 
    invoiceNumber: 'PR-2026-0009', 
    action: 'converted', 
    user: 'Igor Žagar', 
    userRole: 'direktor', 
    timestamp: '2026-07-15T10:00:00Z', 
    details: 'Kljub zamudi odobreno - predračun spremenjen v račun R-2026-0050',
    oldStatus: 'overdue',
    newStatus: 'converted'
  },

  // R-2026-0045 (nov račun iz PR-2026-0008)
  { 
    id: 'a41', 
    invoiceId: 'inv10', 
    invoiceNumber: 'R-2026-0045', 
    action: 'created', 
    user: 'Sistem', 
    userRole: 'auto', 
    timestamp: '2026-06-15T12:05:00Z', 
    details: 'Račun samodejno ustvarjen iz predračuna PR-2026-0008',
    newStatus: 'issued'
  },
  { 
    id: 'a42', 
    invoiceId: 'inv10', 
    invoiceNumber: 'R-2026-0045', 
    action: 'sent', 
    user: 'Maja Novak', 
    userRole: 'tajnistvo', 
    timestamp: '2026-06-16T09:00:00Z', 
    details: 'Račun poslan kupcu po e-pošti',
    currentStatus: 'sent'
  },
  { 
    id: 'a43', 
    invoiceId: 'inv10', 
    invoiceNumber: 'R-2026-0045', 
    action: 'paid', 
    user: 'Maja Novak', 
    userRole: 'tajnistvo', 
    timestamp: '2026-07-01T14:00:00Z', 
    details: 'Plačilo prispelo na TRR - račun v celoti poravnan',
    oldStatus: 'sent',
    newStatus: 'paid'
  },

  // R-2026-0050 (nov račun iz PR-2026-0009)
  { 
    id: 'a44', 
    invoiceId: 'inv11', 
    invoiceNumber: 'R-2026-0050', 
    action: 'created', 
    user: 'Sistem', 
    userRole: 'auto', 
    timestamp: '2026-07-15T10:05:00Z', 
    details: 'Račun samodejno ustvarjen iz predračuna PR-2026-0009',
    newStatus: 'issued'
  },
  { 
    id: 'a45', 
    invoiceId: 'inv11', 
    invoiceNumber: 'R-2026-0050', 
    action: 'sent', 
    user: 'Ana Kuhar', 
    userRole: 'projektant', 
    timestamp: '2026-07-16T09:00:00Z', 
    details: 'Račun poslan kupcu po e-pošti',
    currentStatus: 'sent'
  }
]