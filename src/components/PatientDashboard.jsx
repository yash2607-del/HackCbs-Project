import React, { useEffect, useMemo, useState } from 'react'
import DashboardLayout from './DashboardLayout.jsx'
import '../styles/patient-dashboard.scss'
import FindADoctor from '../pages/Patient/FindADoctor.jsx'
import AppointmentForm from '../pages/Patient/Appointment-form.jsx'
import PrescriptionTable from '../pages/Patient/Prescription-table.jsx'
import PatientAppointments from '../pages/Patient/PatientAppointments.jsx'
import ChatbotPopup from './chat/ChatbotPopup.jsx'
import '../styles/chatbot-popup.scss'
import { FaUserMd, FaCalendarPlus, FaCalendarCheck, FaPrescriptionBottle, FaSearch } from 'react-icons/fa'
import SearchMedicine from '../pages/Patient/SearchMedicine.jsx'

import { useLocation } from 'react-router-dom'

export default function PatientDashboard() {
  const location = useLocation()
  const navState = location.state || {}
  const initialActive = useMemo(() => (navState.active || 'appointments'), [navState.active])
  const [active, setActive] = useState(initialActive)
  const [prefill, setPrefill] = useState({ doctorName: navState.doctorName || '', speciality: navState.speciality || '' })

  useEffect(() => {
    if (navState.active) setActive(navState.active)
    if (navState.doctorName || navState.speciality) {
      setPrefill({ doctorName: navState.doctorName || '', speciality: navState.speciality || '' })
    }
    // Clean the history state so refreshing doesn't keep re-triggering
    window.history.replaceState({}, document.title)
  }, [navState.active, navState.doctorName, navState.speciality])

  const menuItems = [
    { key: 'find-doctor', label: 'Find Doctor', icon: <FaUserMd /> },
    { key: 'search-medicine', label: 'Search Medicine', icon: <FaSearch /> },
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
    {active === 'search-medicine' && <SearchMedicine />}
  {active === 'book' && <AppointmentForm prefill={prefill} />}
        {active === 'appointments' && <PatientAppointments />}
        {active === 'prescriptions' && <PrescriptionTable />}
      </DashboardLayout>
      <ChatbotPopup />
    </div>
  )
}
