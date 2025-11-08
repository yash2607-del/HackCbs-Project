import React, { useMemo, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useParams } from 'react-router-dom'
import TagsInput from './TagsInput.jsx'
import MapPicker from './MapPicker.jsx'
 
const ROLE_LABELS = {
  doctor: 'Doctor',
  patient: 'Patient',
  pharmacy: 'Pharmacy'
}

export default function RoleAuth() {
  // Central API URL builder using Vite env
  const apiUrl = (path) => new URL(path, import.meta.env.VITE_API_BASE_URL || '/').toString()
  const { role } = useParams()
  const validRole = ['doctor', 'patient', 'pharmacy'].includes(role) ? role : null
  const [mode, setMode] = useState('login')
  const [message, setMessage] = useState('')
  const [loginData, setLoginData] = useState({ email: '', password: '' })

  const [patientData, setPatientData] = useState({
    email: '', password: '', phone: '', name: '', age: '', weight: '', height: '', conditions: [], sex: '', location: null
  })
  const [doctorData, setDoctorData] = useState({
    name: '', regNumber: '', email: '', password: '', phone: '', education: '', specialties: [], experienceYears: '', location: null
  })
  const [pharmacyData, setPharmacyData] = useState({
    shopName: '', email: '', password: '', phone: '', location: null
  })

  const navigate = useNavigate()
  const [animating, setAnimating] = useState(false)

  if (!validRole) {
    return <div className="auth-page"><h2>Invalid role</h2><p>Unknown role: {role}</p></div>
  }

  // Auto-detect location on signup: only for patient. Doctor and Pharmacy will detect on button click.
  useEffect(() => {
    if (mode === 'signup' && validRole === 'patient') {
      if (patientData.location) return
      tryDetectLocation('patient')
    }
  }, [mode, validRole])

  // Reverse geocode helper
  const fetchAddress = async (lat, lng) => {
    try {
      const proxyUrl = `/api/places/reverse?lat=${lat}&lng=${lng}`
      const proxyRes = await fetch(proxyUrl)
      if (proxyRes.ok) {
        const data = await proxyRes.json()
        const addr = data?.results?.[0]?.formatted_address
        if (addr) return addr
      }
      // fallback to Nominatim
      const nomRes = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`)
      if (nomRes.ok) {
        const nomData = await nomRes.json()
        return nomData.display_name || null
      }
      return null
    } catch (err) {
      console.debug('Reverse geocode failed', err)
      return null
    }
  }

  // Effect: fetch addresses when lat/lng changes
  useEffect(() => {
    const updateAddress = async (data, setter) => {
      if (data?.location && !data.location.address) {
        const { lat, lng } = data.location
        if (lat && lng) {
          const addr = await fetchAddress(lat, lng)
          if (addr) setter(d => ({ ...d, location: { ...d.location, address: addr } }))
        }
      }
    }
    updateAddress(doctorData, setDoctorData)
    updateAddress(pharmacyData, setPharmacyData)
    updateAddress(patientData, setPatientData)
  }, [doctorData.location, pharmacyData.location, patientData.location])

  // Try detect location
  const tryDetectLocation = async (target) => {
    setMessage('')
    if (!navigator?.geolocation) {
      setMessage('Geolocation is not supported by this browser')
      return
    }
    setMessage('Detecting location...')
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude }
        if (target === 'doctor') setDoctorData(d => ({ ...d, location: loc }))
        if (target === 'pharmacy') setPharmacyData(p => ({ ...p, location: loc }))
        if (target === 'patient') setPatientData(p => ({ ...p, location: loc }))
        setMessage('Location detected')
      },
      async (err) => {
        console.debug('Geolocation error', err)
        setMessage('Unable to get location. Trying IP-based lookup...')
        try {
          const ipRes = await fetch('https://ipapi.co/json/')
          if (ipRes.ok) {
            const ipData = await ipRes.json()
            const lat = parseFloat(ipData.latitude)
            const lng = parseFloat(ipData.longitude)
            if (lat && lng) {
              const loc = { lat, lng }
              if (target === 'doctor') setDoctorData(d => ({ ...d, location: loc }))
              if (target === 'pharmacy') setPharmacyData(p => ({ ...p, location: loc }))
              if (target === 'patient') setPatientData(p => ({ ...p, location: loc }))
              setMessage('Location approximated from IP address')
            }
          }
        } catch (ipErr) {
          console.debug('IP lookup failed', ipErr)
          setMessage('Could not detect location automatically')
        }
      },
      { timeout: 8000 }
    )
  }

  // Role info for left panel
  const roleInfo = useMemo(() => {
    switch (validRole) {
      case 'patient':
        return { title: 'Welcome, Patient', subtitle: 'Your health, your control', points: ['Access verified prescriptions securely','Find medicines nearby on the map','Get AI-assisted guidance to the right doctor'] }
      case 'doctor':
        return { title: 'Welcome, Doctor', subtitle: 'Streamlined and secure care', points: ['Create tamper-proof prescriptions on-chain','View patient history with confidence','Build trust with verifiable records'] }
      case 'pharmacy':
        return { title: 'Welcome, Pharmacy', subtitle: 'Reliable inventory and verification', points: ['Verify prescriptions via blockchain','Manage real-time stock with ease','Serve patients faster with confidence'] }
      default:
        return { title: '', subtitle: '', points: [] }
    }
  }, [validRole])

  const handleLoginSubmit = async (e) => {
    e.preventDefault()
    setMessage('')
    try {
      const res = await fetch(apiUrl('api/auth/login'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginData)
      })
      const data = await res.json()
      if (!res.ok) { setMessage(data.error || 'Login failed'); return }
      localStorage.setItem('token', data.token)
      localStorage.setItem('session', JSON.stringify({ role: data.user.role, user: data.user }))
  setMessage(`Welcome back, ${data.user.profile?.name || data.user.email}! Redirecting to your dashboard...`)
  // Redirect to the appropriate dashboard route for the user's role
  const dest = data?.user?.role ? `/${data.user.role}` : `/profile/${validRole}`
  setTimeout(() => navigate(dest), 600)
    } catch (err) {
      console.error(err)
      setMessage('Network error during login')
    }
  }

  const handleSignupSubmit = async (e) => {
    e.preventDefault()
    setMessage('')
    let payload = {}
    if (validRole === 'patient') payload = { profile: patientData }
    if (validRole === 'doctor') payload = { profile: doctorData }
    if (validRole === 'pharmacy') payload = { profile: pharmacyData }

    const email = payload.profile?.email
    const password = payload.profile?.password
    if (!email || !password) { setMessage('Email & password required'); return }

    try {
      const res = await fetch(apiUrl('api/auth/register'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: validRole, email, password, profile: payload.profile })
      })
      const data = await res.json()
      if (!res.ok) { setMessage(data.error || 'Registration failed'); return }
      localStorage.setItem('token', data.token)
      localStorage.setItem('session', JSON.stringify({ role: data.user.role, user: data.user }))
      setMessage(`${ROLE_LABELS[validRole]} registered successfully! Redirecting...`)
      setTimeout(()=> navigate(`/profile/${validRole}`), 800)
    } catch (err) {
      console.error(err)
      setMessage('Network error during registration')
    }
  }

  const renderSignup = () => {
    switch (validRole) {
      case 'patient':
        return (
          <form onSubmit={handleSignupSubmit} className="auth-form">
            <div className="two-col">
              <div className="form-field"><label>Name</label><input value={patientData.name} onChange={e=>setPatientData({...patientData,name:e.target.value})} /></div>
              <div className="form-field"><label>Email</label><input type="email" value={patientData.email} onChange={e=>setPatientData({...patientData,email:e.target.value})} required /></div>
              <div className="form-field"><label>Password</label><input type="password" value={patientData.password} onChange={e=>setPatientData({...patientData,password:e.target.value})} required /></div>
              <div className="form-field"><label>Phone</label><input value={patientData.phone} onChange={e=>setPatientData({...patientData,phone:e.target.value})} /></div>
              <div className="form-field"><label>Age</label><input type="number" value={patientData.age} onChange={e=>setPatientData({...patientData,age:e.target.value})} /></div>
              <div className="form-field"><label>Weight (kg)</label><input type="number" value={patientData.weight} onChange={e=>setPatientData({...patientData,weight:e.target.value})} /></div>
              <div className="form-field"><label>Height (cm)</label><input type="number" value={patientData.height} onChange={e=>setPatientData({...patientData,height:e.target.value})} /></div>
              <div className="form-field"><label>Sex</label>
                <select value={patientData.sex} onChange={e=>setPatientData({...patientData,sex:e.target.value})}>
                  <option value="">Select</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>
            <TagsInput label="Pre-existing Conditions" value={patientData.conditions} onChange={v=>setPatientData({...patientData,conditions:v})} />
            <MapPicker label="Location" value={patientData.location} onChange={v=>setPatientData({...patientData,location:v})} height={220} />
            {patientData.location?.address && <div style={{marginTop:8}}><strong>Address:</strong> {patientData.location.address}</div>}
            <button className="btn primary" type="submit">Sign Up as Patient</button>
          </form>
        )
      case 'doctor':
        return (
          <form onSubmit={handleSignupSubmit} className="auth-form">
            <div className="two-col">
              <div className="form-field"><label>Name</label><input value={doctorData.name} onChange={e=>setDoctorData({...doctorData,name:e.target.value})} /></div>
              <div className="form-field"><label>Reg Number</label><input value={doctorData.regNumber} onChange={e=>setDoctorData({...doctorData,regNumber:e.target.value})} /></div>
              <div className="form-field"><label>Email</label><input type="email" value={doctorData.email} onChange={e=>setDoctorData({...doctorData,email:e.target.value})} required /></div>
              <div className="form-field"><label>Password</label><input type="password" value={doctorData.password} onChange={e=>setDoctorData({...doctorData,password:e.target.value})} required /></div>
              <div className="form-field"><label>Phone</label><input value={doctorData.phone} onChange={e=>setDoctorData({...doctorData,phone:e.target.value})} /></div>
              <div className="form-field"><label>Education</label><input value={doctorData.education} onChange={e=>setDoctorData({...doctorData,education:e.target.value})} /></div>
              <div className="form-field"><label>Years of Experience</label><input type="number" value={doctorData.experienceYears} onChange={e=>setDoctorData({...doctorData,experienceYears:e.target.value})} /></div>
            </div>
            <TagsInput label="Specialties" value={doctorData.specialties} onChange={v=>setDoctorData({...doctorData,specialties:v})} />
            <MapPicker label="Location" value={doctorData.location} onChange={v=>setDoctorData({...doctorData,location:v})} height={220} />
            {doctorData.location?.address && <div style={{marginTop:8}}><strong>Address:</strong> {doctorData.location.address}</div>}
            <button className="btn primary" type="submit">Sign Up as Doctor</button>
          </form>
        )
      case 'pharmacy':
        return (
          <form onSubmit={handleSignupSubmit} className="auth-form">
            <div className="two-col">
              <div className="form-field"><label>Shop Name</label><input value={pharmacyData.shopName} onChange={e=>setPharmacyData({...pharmacyData,shopName:e.target.value})} /></div>
              <div className="form-field"><label>Email</label><input type="email" value={pharmacyData.email} onChange={e=>setPharmacyData({...pharmacyData,email:e.target.value})} required /></div>
              <div className="form-field"><label>Password</label><input type="password" value={pharmacyData.password} onChange={e=>setPharmacyData({...pharmacyData,password:e.target.value})} required /></div>
              <div className="form-field"><label>Phone</label><input value={pharmacyData.phone} onChange={e=>setPharmacyData({...pharmacyData,phone:e.target.value})} /></div>
            </div>
            <MapPicker label="Location" value={pharmacyData.location} onChange={v=>setPharmacyData({...pharmacyData,location:v})} height={220} />
            {pharmacyData.location?.address && <div style={{marginTop:8}}><strong>Address:</strong> {pharmacyData.location.address}</div>}
            <button className="btn primary" type="submit">Sign Up as Pharmacy</button>
          </form>
        )
      default: return null
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-role-switch">
        <button className={validRole==='doctor'?'active':''} onClick={()=>navigate('/auth/doctor')}>Doctor</button>
        <button className={validRole==='patient'?'active':''} onClick={()=>navigate('/auth/patient')}>Patient</button>
        <button className={validRole==='pharmacy'?'active':''} onClick={()=>navigate('/auth/pharmacy')}>Pharmacy</button>
      </div>
      <div className={`auth-card split ${mode==='signup'?'signup-active':''}`}>
        <div className="panel info-panel">
          <div className={`info-inner ${animating?'anim':''}`}>
            <h3 className="info-title">{roleInfo.title}</h3>
            <p className="info-subtitle">{roleInfo.subtitle}</p>
            <ul className="info-points">{roleInfo.points.map(p=><li key={p}>{p}</li>)}</ul>
            <div className="info-cta">
              <span className="muted">Mode</span>
              <div className="mode-toggle">
                <button className={mode==='login'?'active':''} onClick={()=>{if(mode!=='login'){setAnimating(true); setTimeout(()=>setMode('login'),220); setTimeout(()=>setAnimating(false),520)}}}>Login</button>
                <button className={mode==='signup'?'active':''} onClick={()=>{if(mode!=='signup'){setAnimating(true); setTimeout(()=>setMode('signup'),220); setTimeout(()=>setAnimating(false),520)}}}>Signup</button>
              </div>
            </div>
          </div>
        </div>
        <div className="panel form-panel">
          <div className={`form-inner ${animating?'anim':''}`}>
            <h2>{ROLE_LABELS[validRole]} {mode==='login'?'Login':'Signup'}</h2>
            {message && <div className="auth-message">{message}</div>}
            {mode==='login' ? (
              <form onSubmit={handleLoginSubmit} className="auth-form">
                <div className="form-field"><label>Email</label><input type="email" value={loginData.email} onChange={e=>setLoginData({...loginData,email:e.target.value})} required /></div>
                <div className="form-field"><label>Password</label><input type="password" value={loginData.password} onChange={e=>setLoginData({...loginData,password:e.target.value})} required /></div>
                <button className="btn primary" type="submit">Login</button>
              </form>
            ) : renderSignup()}
          </div>
        </div>
      </div>
    </div>
  )
}
