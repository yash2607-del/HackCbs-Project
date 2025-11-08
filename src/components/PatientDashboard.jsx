import React, { useState } from 'react'
import DashboardLayout from './layouts/DashboardLayout.jsx'
import '../styles/patient-dashboard.scss'
import FindADoctor from '../pages/Patient/FindADoxtor.jsx'

function ChatbotPane() {
  return (
    <section className="patient-pane">
      <h2>Chatbot</h2>
      <p>Placeholder chatbot UI. Integrate Gemini later.</p>
    </section>
  )
}

function BookAppointmentPane() {
  return (
    <section className="patient-pane">
      <h2>Book Appointment</h2>
      <p>Use the Find a Doctor tab to select and then book – migrate booking form later.</p>
    </section>
  )
}

function PharmacyPane() {
  return (
    <section className="patient-pane">
      <h2>Find Pharmacy</h2>
      <p>Map & nearby pharmacy listing placeholder.</p>
    </section>
  )
}

export default function PatientDashboard() {
  const [active, setActive] = useState('chatbot')
  const sidebarItems = [
    { key: 'chatbot', label: 'Chatbot' },
    { key: 'book', label: 'Book Appointment' },
    { key: 'pharmacy', label: 'Find Pharmacy' },
    { key: 'find-doctor', label: 'Find Doctor' }
  ]

  return (
    <DashboardLayout
      brand="MedTrack"
      sidebarItems={sidebarItems}
      activeKey={active}
      onChange={setActive}
    >
      {active === 'chatbot' && <ChatbotPane />}
      {active === 'book' && <BookAppointmentPane />}
      {active === 'pharmacy' && <PharmacyPane />}
      {active === 'find-doctor' && <FindADoctor />}
    </DashboardLayout>
  )
}
