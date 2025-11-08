import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import '../styles/landing.scss'

export default function Landing() {
  const navigate = useNavigate()
  const [showModal, setShowModal] = useState(false)
  const [selectedRole, setSelectedRole] = useState('')

  const handleGetStarted = () => setShowModal(true)
  const closeModal = () => setShowModal(false)
  
  const handleRoleSelect = (role) => {
    setSelectedRole(role)
    const routes = { doctor: '/doctors', patient: '/patients', pharmacy: '/pharmacies' }
    navigate(routes[role])
    setShowModal(false)
  }

  return (
    <div className="landing">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <div className="hero-badge">
            <span className="badge">Blockchain-Enabled</span>
            <span className="badge">AI-Powered</span>
            <span className="badge">Secure</span>
          </div>
          <h1 className="hero-title">
            MediChain
            <span className="subtitle">Blockchain-Enabled Healthcare Ecosystem</span>
          </h1>
          <p className="hero-description">
            A secure, AI-powered, and blockchain-backed web application connecting 
            <strong> patients</strong>, <strong>doctors</strong>, and <strong>pharmacies</strong> through 
            verified prescriptions, real-time inventory, and intelligent health guidance.
          </p>
          <div className="hero-cta">
            <button className="btn primary" onClick={handleGetStarted}>Get Started</button>
            <button className="btn secondary" onClick={() => document.getElementById('overview').scrollIntoView({ behavior: 'smooth' })}>
              Learn More
            </button>
          </div>
        </div>
      </section>

      {/* Overview Section */}
      <section id="overview" className="section overview">
        <div className="container">
          <h2>Transforming Healthcare Connectivity</h2>
          <p className="section-description">
            MediChain is a decentralized healthcare management platform that unifies patients, doctors, 
            and pharmacies under one transparent and secure system. It leverages <strong>blockchain</strong> for 
            tamper-proof prescription storage and <strong>GenAI</strong> for smart symptom classification 
            and doctor recommendations.
          </p>
          <div className="goal-statement">
            <p>
              Our goal is to eliminate prescription fraud, simplify medicine discovery, 
              and make healthcare data interoperable, verifiable, and patient-centric.
            </p>
          </div>
        </div>
      </section>

      {/* Roles Section */}
      <section className="section roles">
        <div className="container">
          <h2>Built for Every Healthcare Stakeholder</h2>
          <div className="roles-grid">
            <div className="role-card" onClick={() => navigate('/doctors')}>
              <div className="role-icon">🧑‍⚕️</div>
              <h3>Doctors</h3>
              <ul>
                <li>Create digital prescriptions and store them immutably on the blockchain</li>
                <li>Access patients' medical history and past prescriptions</li>
                <li>Ensure all prescriptions are verifiable and tamper-proof</li>
              </ul>
              <button className="btn outline">For Doctors →</button>
            </div>

            <div className="role-card" onClick={() => navigate('/patients')}>
              <div className="role-icon">🧍‍♂️</div>
              <h3>Patients</h3>
              <ul>
                <li>View all verified prescriptions securely on their dashboard</li>
                <li>Search for medicines and view pharmacies with availability on an interactive map</li>
                <li>Interact with a GenAI chatbot to describe symptoms and receive doctor recommendations</li>
              </ul>
              <button className="btn outline">For Patients →</button>
            </div>

            <div className="role-card" onClick={() => navigate('/pharmacies')}>
              <div className="role-icon">💊</div>
              <h3>Pharmacies</h3>
              <ul>
                <li>Scan QR codes to verify prescriptions via blockchain before dispensing</li>
                <li>Manage real-time medicine inventory using a QR-based system</li>
                <li>Generate bills from inventory and sync with the shared pharmacy database</li>
              </ul>
              <button className="btn outline">For Pharmacies →</button>
            </div>
          </div>
        </div>
      </section>

      {/* Core Features */}
      <section className="section features">
        <div className="container">
          <h2>Core Features</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">⛓️</div>
              <h3>Blockchain-Powered Prescriptions</h3>
              <p>Every prescription is hashed and stored on-chain for authenticity verification.</p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon">📊</div>
              <h3>Pharmacy Inventory Management</h3>
              <p>Add, track, and scan medicine stock using QR codes.</p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon">🗺️</div>
              <h3>Medicine Locator Map</h3>
              <p>Patients can search for medicines nearby via geolocation-enabled maps.</p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon">🤖</div>
              <h3>AI Chatbot</h3>
              <p>A generative AI chatbot helps patients classify symptoms and suggests the right doctor specialization.</p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon">👥</div>
              <h3>Role-Based Dashboards</h3>
              <p>Secure authentication and different dashboards for each user type.</p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon">✅</div>
              <h3>Verified Transactions</h3>
              <p>Pharmacies verify prescriptions through blockchain before dispensing.</p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="section how-it-works">
        <div className="container">
          <h2>How It Works</h2>
          <div className="flows-container">
            <div className="flow-card">
              <h3>🌐 Blockchain Prescription Flow</h3>
              <div className="flow-steps">
                <div className="step">
                  <span className="step-number">1</span>
                  <p>Doctor creates a prescription → JSON object generated</p>
                </div>
                <div className="step">
                  <span className="step-number">2</span>
                  <p>Prescription is hashed and uploaded to blockchain → transaction hash returned</p>
                </div>
                <div className="step">
                  <span className="step-number">3</span>
                  <p>Hash stored in backend DB linked to doctor, patient, and pharmacy IDs</p>
                </div>
                <div className="step">
                  <span className="step-number">4</span>
                  <p>Pharmacy scans prescription QR → hash verified on blockchain</p>
                </div>
                <div className="step">
                  <span className="step-number">5</span>
                  <p>Patient dashboard fetches verified prescriptions from blockchain</p>
                </div>
              </div>
            </div>

            <div className="flow-card">
              <h3>💬 AI Chatbot Flow</h3>
              <div className="flow-steps">
                <div className="step">
                  <span className="step-number">1</span>
                  <p>Patient interacts with chatbot and describes symptoms</p>
                </div>
                <div className="step">
                  <span className="step-number">2</span>
                  <p>Generative AI model categorizes symptoms into medical specializations</p>
                </div>
                <div className="step">
                  <span className="step-number">3</span>
                  <p>Returns a list of relevant doctors nearby, fetched from the database</p>
                </div>
              </div>
            </div>

            <div className="flow-card">
              <h3>🗺️ Medicine Search & Map Integration</h3>
              <div className="flow-steps">
                <div className="step">
                  <span className="step-bullet">•</span>
                  <p>Each pharmacy updates inventory with available medicines</p>
                </div>
                <div className="step">
                  <span className="step-bullet">•</span>
                  <p>Patients search for a medicine name</p>
                </div>
                <div className="step">
                  <span className="step-bullet">•</span>
                  <p>The app queries all pharmacy databases and filters by geolocation</p>
                </div>
                <div className="step">
                  <span className="step-bullet">•</span>
                  <p>Nearby pharmacies are displayed as map markers with directions</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Future Enhancements */}
      <section className="section future">
        <div className="container">
          <h2>Future Enhancements</h2>
          <div className="future-grid">
            <div className="future-item">
              <span className="future-icon">📱</span>
              <p>Mobile app (React Native / Flutter)</p>
            </div>
            <div className="future-item">
              <span className="future-icon">🧾</span>
              <p>Integration with insurance providers for e-claim verification</p>
            </div>
            <div className="future-item">
              <span className="future-icon">🤖</span>
              <p>AI-based prescription conflict detection</p>
            </div>
            <div className="future-item">
              <span className="future-icon">🗣️</span>
              <p>Voice-based chatbot for accessibility</p>
            </div>
            <div className="future-item">
              <span className="future-icon">🏥</span>
              <p>Integration with telemedicine APIs for online consultations</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section cta">
        <div className="container">
          <div className="cta-content">
            <h2>Ready to Transform Healthcare?</h2>
            <p>Join the blockchain revolution in healthcare. Secure, transparent, and intelligent.</p>
            <button className="btn primary large" onClick={handleGetStarted}>Get Started Today</button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-left">
              <h3>MediChain</h3>
              <p>Blockchain-Enabled Healthcare Ecosystem</p>
            </div>
            <div className="footer-right">
              <p>© {new Date().getFullYear()} MediChain — Your prescription, your data, your control.</p>
              <p>Licensed under the MIT License</p>
            </div>
          </div>
        </div>
      </footer>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Choose Your Role</h3>
              <button className="modal-close" onClick={closeModal}>×</button>
            </div>
            <div className="modal-body">
              <p>Select how you'd like to use MediChain:</p>
              <div className="role-options">
                <button 
                  className="role-option"
                  onClick={() => handleRoleSelect('doctor')}
                >
                  <span className="role-emoji">🧑‍⚕️</span>
                  <span>I'm a Doctor</span>
                </button>
                <button 
                  className="role-option"
                  onClick={() => handleRoleSelect('patient')}
                >
                  <span className="role-emoji">🧍‍♂️</span>
                  <span>I'm a Patient</span>
                </button>
                <button 
                  className="role-option"
                  onClick={() => handleRoleSelect('pharmacy')}
                >
                  <span className="role-emoji">💊</span>
                  <span>I'm a Pharmacy</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}