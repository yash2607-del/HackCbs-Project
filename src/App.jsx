import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Doctors from './pages/Doctors.jsx'
import Patients from './pages/Patients.jsx'
import Pharmacies from './pages/Pharmacies.jsx'
import NotFound from './pages/NotFound.jsx'
import Landing from './components/Landing.jsx'
import DoctorDashboard from './components/DoctorDashboard.jsx'
import RoleAuth from './components/RoleAuth.jsx'
import FindADoctor from './pages/Patient/FindADoxtor.jsx'
import AppointmentForm from './pages/Patient/Appointment-form.jsx'
export default function App() {
  return (
    <BrowserRouter>
      <div className="app">
        <main>
          <Routes>
            {/* Home and public pages */}
            <Route path="/" element={<Landing />} />
            <Route path="/doctor" element={<DoctorDashboard />} />
            <Route path="/doctors" element={<Doctors />} />
            <Route path="/patients" element={<Patients />} />
            <Route path="/pharmacies" element={<Pharmacies />} />
            <Route path="/auth/:role" element={<RoleAuth />} />
            <Route path="/appointment" element={<FindADoctor />} />
            <Route path="/appointment-form" element={<AppointmentForm />} />



            {/* Legacy or shorthand route: redirect to /doctors */}
            <Route path="/doctor" element={<Navigate to="/doctors" replace />} />

            {/* 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  )
}
