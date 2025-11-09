import React, { useState } from 'react'
import DashboardLayout from './DashboardLayout.jsx'
import '../styles/patient-dashboard.scss'
import FindADoctor from '../pages/Patient/FindADoctor.jsx'
import AppointmentForm from '../pages/Patient/Appointment-form.jsx'
import PrescriptionTable from '../pages/Patient/Prescription-table.jsx'
import PatientAppointments from '../pages/Patient/PatientAppointments.jsx'
import ChatbotPopup from './chat/ChatbotPopup.jsx'
import '../styles/chatbot-popup.scss'
import { FaUserMd, FaCalendarPlus, FaCalendarCheck, FaPrescriptionBottle } from 'react-icons/fa'

export default function PatientDashboard() {
  const [active, setActive] = useState('appointments')

  const menuItems = [
    { key: 'find-doctor', label: 'Find Doctor', icon: <FaUserMd /> },
    { key: 'book', label: 'Book Appointment', icon: <FaCalendarPlus /> },
    { key: 'appointments', label: 'My Appointments', icon: <FaCalendarCheck /> },
    { key: 'prescriptions', label: 'My Prescriptions', icon: <FaPrescriptionBottle /> }
  ]

  return (
    <div className="patient-dashboard">
      <DashboardLayout
        brand="MediChain"
        menuItems={menuItems}
        active={active}
        setActive={setActive}
      >
        {active === 'find-doctor' && <FindADoctor />}
        {active === 'book' && <AppointmentForm />}
        {active === 'appointments' && <PatientAppointments />}
        {active === 'prescriptions' && <PrescriptionTable />}
      </DashboardLayout>
      <ChatbotPopup />
    </div>
  )
}
