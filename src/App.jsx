import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Doctors from './pages/Doctors.jsx'
import Patients from './pages/Patients.jsx'
import Pharmacies from './pages/Pharmacies.jsx'
import NotFound from './pages/NotFound.jsx'
import Landing from './components/Landing.jsx'
import DoctorDashboard from './components/DoctorDashboard.jsx'
import RoleAuth from './components/RoleAuth.jsx'

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


            {/* 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  )
}
