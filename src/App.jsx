import React from 'react'
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
import Example from './components/Example.jsx'
import DoctorDashboard from './components/DoctorDashboard.jsx'

function HomeLayout() {
  return (
    <div className="app">
      <header className="app-header">
        <h1>HackCbs Project — React + SCSS skeleton</h1>
        <p>Colour palette is defined in <code>src/styles/_colors.scss</code></p>
        <nav style={{marginTop:'1rem'}}>
          <Link to="/" style={{marginRight:'1rem'}}>Home</Link>
          <Link to="/doctor">Doctor Dashboard</Link>
        </nav>
      </header>
      <main>
        <Example />
      </main>
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/doctor" element={<DoctorDashboard />} />
        <Route path="/" element={<HomeLayout />} />
      </Routes>
    </BrowserRouter>
  )
}
