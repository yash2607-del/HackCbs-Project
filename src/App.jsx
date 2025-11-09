import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Doctors from './pages/Doctors.jsx'
import Patients from './pages/Patients.jsx'
import Pharmacies from './pages/Pharmacies.jsx'
import NotFound from './pages/NotFound.jsx'
import Landing from './components/Landing.jsx'
import DoctorDashboard from './components/DoctorDashboard.jsx'
import PharmacyDashboard from './components/PharmacyDashboard.jsx'
import PatientDashboard from './components/PatientDashboard.jsx'
import ProtectedRoute from './components/routing/ProtectedRoute.jsx'
import RoleAuth from './components/RoleAuth.jsx'
import ProfileRouter from './pages/profile/ProfileRouter.jsx'
import DoctorProfile from './pages/profile/DoctorProfile.jsx'
import PatientProfile from './pages/profile/PatientProfile.jsx'
import PharmacyProfile from './pages/profile/PharmacyProfile.jsx'
import FindADoctor from './pages/Patient/FindADoctor.jsx'
import AppointmentForm from './pages/Patient/Appointment-form.jsx'
import PrescriptionTable from './pages/Patient/Prescription-table.jsx'
import PatientAppointments from './pages/Patient/PatientAppointments.jsx'
import ChatbotPage from './pages/Chatbot/ChatbotPage.jsx'
import Logout from './components/Logout.jsx'
export default function App() {
  return (
    <BrowserRouter>
      <div className="app">
        <main>
          <Routes>
            {/* Home and public pages */}
            <Route path="/" element={<Landing />} />
            <Route path="/doctor" element={
              <ProtectedRoute allowedRole="doctor">
                <DoctorDashboard />
              </ProtectedRoute>
            } />
            <Route path="/pharmacy" element={
              <ProtectedRoute allowedRole="pharmacy">
                <PharmacyDashboard />
              </ProtectedRoute>
            } />
            <Route path="/patient" element={
              <ProtectedRoute allowedRole="patient">
                <PatientDashboard />
              </ProtectedRoute>
            } />
            <Route path="/doctors" element={<Doctors />} />
            <Route path="/patients" element={<Patients />} />
            <Route path="/auth/:role" element={<RoleAuth />} />
            {/* Profile routing */}
            <Route path="/profile" element={
              <ProtectedRoute>
                <ProfileRouter />
              </ProtectedRoute>
            } />
            <Route path="/profile/doctor" element={
              <ProtectedRoute allowedRole="doctor">
                <DoctorProfile />
              </ProtectedRoute>
            } />
            <Route path="/profile/patient" element={
              <ProtectedRoute allowedRole="patient">
                <PatientProfile />
              </ProtectedRoute>
            } />
            <Route path="/profile/pharmacy" element={
              <ProtectedRoute allowedRole="pharmacy">
                <PharmacyProfile />
              </ProtectedRoute>
            } />
            <Route path="/appointment" element={<FindADoctor />} />
            <Route path="/appointment-form" element={<AppointmentForm />} />
            <Route path="/prescription-table" element={<PrescriptionTable />} />
            <Route path="/patient-appointments" element={<PatientAppointments />} />
            <Route path="/chatbot" element={<ChatbotPage />} />
            <Route path="/logout" element={<Logout />} />
            {/* 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}
