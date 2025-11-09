import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaSearch, FaMapMarkerAlt, FaPhoneAlt, FaClock, FaBoxes, FaCommentDots, FaPills } from 'react-icons/fa';
import { motion } from 'framer-motion';
import DashboardLayout from '../../components/layouts/DashboardLayout';
import './NearbyPharmacy.css';

export default function NearbyPharmacy() {
  const navigate = useNavigate();
  const [activeKey, setActiveKey] = useState('nearby-pharmacy');
  const [selectedMedicine, setSelectedMedicine] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const sidebarItems = [
    { key: 'dashboard', label: 'Dashboard' },
    { key: 'appointment', label: 'Find Doctor' },
    { key: 'appointments', label: 'My Appointments' },
    { key: 'prescriptions', label: 'My Prescriptions' },
    { key: 'nearby-pharmacy', label: 'Nearby Pharmacy' },
    { key: 'profile', label: 'Profile' },
  ];

  const handleSidebarChange = (key) => {
    setActiveKey(key);
    switch (key) {
      case 'dashboard':
        navigate('/patients');
        break;
      case 'appointment':
        navigate('/appointment');
        break;
      case 'appointments':
        navigate('/patient-appointments');
        break;
      case 'prescriptions':
        navigate('/prescription-table');
        break;
      case 'nearby-pharmacy':
        navigate('/nearby-pharmacy');
        break;
      case 'profile':
        navigate('/profile/patient');
        break;
      default:
        break;
    }
  };

  // Dummy medicine list
  const medicines = [
    'Paracetamol 500mg',
    'Amoxicillin 250mg',
    'Ibuprofen 400mg',
    'Metformin 500mg',
    'Omeprazole 20mg',
    'Atorvastatin 10mg',
    'Lisinopril 10mg',
    'Cetirizine 10mg',
    'Aspirin 75mg',
    'Azithromycin 500mg'
  ];

  // Dummy pharmacy data with locations
  const pharmacies = [
    {
      id: 1,
      name: 'HealthPlus Pharmacy',
      address: '123 Medical Plaza, Connaught Place',
      phone: '+91 98765 43210',
      distance: '0.5 km',
      openTime: '8:00 AM - 10:00 PM',
      image: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=400&h=300&fit=crop',
      location: [28.6304, 77.2177],
      stock: {
        'Paracetamol 500mg': 150,
        'Amoxicillin 250mg': 80,
        'Ibuprofen 400mg': 120,
        'Metformin 500mg': 95,
        'Omeprazole 20mg': 60,
        'Atorvastatin 10mg': 45,
        'Lisinopril 10mg': 70,
        'Cetirizine 10mg': 110,
        'Aspirin 75mg': 200,
        'Azithromycin 500mg': 55
      }
    },
    {
      id: 2,
      name: 'MediCare Plus',
      address: '456 Health Avenue, Karol Bagh',
      phone: '+91 98765 43211',
      distance: '1.2 km',
      openTime: '24/7 Open',
      image: 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=400&h=300&fit=crop',
      location: [28.6519, 77.1900],
      stock: {
        'Paracetamol 500mg': 200,
        'Amoxicillin 250mg': 50,
        'Ibuprofen 400mg': 90,
        'Metformin 500mg': 120,
        'Omeprazole 20mg': 75,
        'Atorvastatin 10mg': 65,
        'Lisinopril 10mg': 40,
        'Cetirizine 10mg': 85,
        'Aspirin 75mg': 150,
        'Azithromycin 500mg': 30
      }
    },
    {
      id: 3,
      name: 'Apollo Pharmacy',
      address: '789 Wellness Street, Nehru Place',
      phone: '+91 98765 43212',
      distance: '2.0 km',
      openTime: '7:00 AM - 11:00 PM',
      image: 'https://images.unsplash.com/photo-1631549916768-4119b2e5f926?w=400&h=300&fit=crop',
      location: [28.5494, 77.2501],
      stock: {
        'Paracetamol 500mg': 180,
        'Amoxicillin 250mg': 100,
        'Ibuprofen 400mg': 140,
        'Metformin 500mg': 85,
        'Omeprazole 20mg': 90,
        'Atorvastatin 10mg': 55,
        'Lisinopril 10mg': 60,
        'Cetirizine 10mg': 95,
        'Aspirin 75mg': 175,
        'Azithromycin 500mg': 45
      }
    },
    {
      id: 4,
      name: 'Guardian Pharmacy',
      address: '321 Care Road, Lajpat Nagar',
      phone: '+91 98765 43213',
      distance: '2.5 km',
      openTime: '8:00 AM - 9:00 PM',
      image: 'https://images.unsplash.com/photo-1585435557343-3b092031a831?w=400&h=300&fit=crop',
      location: [28.5677, 77.2431],
      stock: {
        'Paracetamol 500mg': 130,
        'Amoxicillin 250mg': 70,
        'Ibuprofen 400mg': 100,
        'Metformin 500mg': 110,
        'Omeprazole 20mg': 50,
        'Atorvastatin 10mg': 75,
        'Lisinopril 10mg': 80,
        'Cetirizine 10mg': 120,
        'Aspirin 75mg': 160,
        'Azithromycin 500mg': 40
      }
    }
  ];

  const handleMedicineSelect = (medicine) => {
    setSelectedMedicine(medicine);
    setSearchQuery(medicine);
    setSearchOpen(false);
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    setSearchOpen(true);
  };

  const filteredMedicines = medicines.filter(medicine =>
    medicine.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCallPharmacy = (phone) => {
    window.location.href = `tel:${phone}`;
  };

  const handleMessage = (pharmacyName) => {
    alert(`Opening message to ${pharmacyName}...`);
    // In real app, this would open a messaging interface
  };

  const getStockStatus = (stock) => {
    if (stock > 100) return { status: 'In Stock', color: '#10b981' };
    if (stock > 50) return { status: 'Limited Stock', color: '#f59e0b' };
    if (stock > 0) return { status: 'Low Stock', color: '#ef4444' };
    return { status: 'Out of Stock', color: '#6b7280' };
  };

  const filteredPharmacies = selectedMedicine
    ? pharmacies.filter(p => p.stock[selectedMedicine] > 0)
    : pharmacies;

  return (
    <DashboardLayout
      brand="MediChain"
      sidebarItems={sidebarItems}
      activeKey={activeKey}
      onChange={handleSidebarChange}
    >
      <div className="nearby-pharmacy-wrapper">
        <div className="pharmacy-header">
          <h1>Find Nearby Pharmacy</h1>
          <p>Search for medicines and locate pharmacies with available stock</p>
        </div>

      {/* Search Bar */}
      <div className="search-section">
        <div className="search-wrapper">
          <div className="search-box">
            <FaSearch className="search-icon" />
            <input
              type="text"
              placeholder="Search for medicine..."
              value={searchQuery}
              onChange={handleSearchChange}
              onFocus={() => setSearchOpen(true)}
              className="search-input"
            />
          </div>
          {searchOpen && filteredMedicines.length > 0 && (
            <div className="dropdown-menu">
              {filteredMedicines.map((medicine, index) => (
                <div
                  key={index}
                  className="dropdown-item"
                  onClick={() => handleMedicineSelect(medicine)}
                >
                  {medicine}
                </div>
              ))}
            </div>
          )}
        </div>
        {selectedMedicine && (
          <button className="clear-btn" onClick={() => {
            setSelectedMedicine('');
            setSearchQuery('');
          }}>
            Clear Search
          </button>
        )}
      </div>

      {/* Results Header */}
      <div className="results-header">
        <h2>
          {selectedMedicine 
            ? `Pharmacies with ${selectedMedicine}` 
            : 'All Pharmacies'}
        </h2>
        <p className="muted">Showing {filteredPharmacies.length} results</p>
      </div>

      {/* Pharmacy Cards Grid */}
      <div className="pharmacy-cards-grid">
        {filteredPharmacies.length === 0 ? (
          <div className="empty">No pharmacies found with the selected medicine.</div>
        ) : (
          filteredPharmacies.map((pharmacy) => {
            const stockCount = selectedMedicine ? pharmacy.stock[selectedMedicine] : 0;
            const stockInfo = selectedMedicine ? getStockStatus(stockCount) : null;

            return (
              <motion.div 
                key={pharmacy.id}
                whileHover={{ scale: 1.02, y: -4 }}
                transition={{ type: 'spring', stiffness: 260, damping: 22 }}
              >
                <div className="pharmacy-card">
                  <div className="pharmacy-card-hero">
                    <div className="pharmacy-icon-wrapper">
                      <FaPills className="pharmacy-icon" />
                    </div>
                    <div className="distance-badge">{pharmacy.distance}</div>
                  </div>
                  <div className="pharmacy-card-body">
                    <h3 className="pharmacy-name">{pharmacy.name}</h3>
                    
                    <div className="pharmacy-info">
                      <div className="info-row">
                        <FaMapMarkerAlt className="info-icon" />
                        <span>{pharmacy.address}</span>
                      </div>
                      <div className="info-row">
                        <FaClock className="info-icon" />
                        <span>{pharmacy.openTime}</span>
                      </div>
                      <div className="info-row">
                        <FaPhoneAlt className="info-icon" />
                        <span>{pharmacy.phone}</span>
                      </div>
                    </div>

                    {selectedMedicine && stockInfo && (
                      <div className="stock-badge" style={{ borderLeftColor: stockInfo.color }}>
                        <FaBoxes className="stock-icon" />
                        <div className="stock-info-inline">
                          <span className="stock-count">{stockCount} units</span>
                          <span className="stock-status" style={{ color: stockInfo.color }}>
                            {stockInfo.status}
                          </span>
                        </div>
                      </div>
                    )}

                    <div className="card-actions">
                      <button 
                        className="message-btn"
                        onClick={() => handleMessage(pharmacy.name)}
                      >
                        <FaCommentDots /> Message
                      </button>
                      <button 
                        className="call-btn"
                        onClick={() => handleCallPharmacy(pharmacy.phone)}
                      >
                        <FaPhoneAlt /> Call
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })
        )}
      </div>
      </div>
    </DashboardLayout>
  );
}
