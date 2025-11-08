import { useState } from 'react';
import { FaDownload, FaEye, FaTimes } from 'react-icons/fa';
import './Prescription-table.css';

export default function PrescriptionTable() {
  const [showModal, setShowModal] = useState(false);
  const [selectedPrescription, setSelectedPrescription] = useState(null);

  // Dummy prescription data
  const prescriptions = [
    {
      id: 1,
      prescriptionId: 'RX-2024-001',
      doctorName: 'Dr. Sarah Johnson',
      date: '2024-11-05',
      medicines: ['Amoxicillin 500mg', 'Paracetamol 650mg'],
      diagnosis: 'Upper respiratory tract infection',
      dosage: 'Amoxicillin: 1 tablet 3 times daily for 7 days. Paracetamol: 1 tablet when needed for fever.',
      notes: 'Take medicines after meals. Complete the full course of antibiotics.'
    },
    {
      id: 2,
      prescriptionId: 'RX-2024-002',
      doctorName: 'Dr. Michael Chen',
      date: '2024-11-03',
      medicines: ['Metformin 500mg', 'Atorvastatin 10mg'],
      diagnosis: 'Type 2 Diabetes Management',
      dosage: 'Metformin: 1 tablet twice daily with meals. Atorvastatin: 1 tablet at bedtime.',
      notes: 'Monitor blood sugar levels regularly. Follow prescribed diet plan.'
    },
    {
      id: 3,
      prescriptionId: 'RX-2024-003',
      doctorName: 'Dr. Emily Rodriguez',
      date: '2024-10-28',
      medicines: ['Lisinopril 10mg', 'Aspirin 75mg'],
      diagnosis: 'Hypertension',
      dosage: 'Lisinopril: 1 tablet once daily in the morning. Aspirin: 1 tablet once daily.',
      notes: 'Check blood pressure weekly. Reduce salt intake.'
    },
    {
      id: 4,
      prescriptionId: 'RX-2024-004',
      doctorName: 'Dr. James Wilson',
      date: '2024-10-25',
      medicines: ['Omeprazole 20mg', 'Antacid Syrup'],
      diagnosis: 'Gastroesophageal Reflux Disease (GERD)',
      dosage: 'Omeprazole: 1 capsule before breakfast. Antacid: 2 teaspoons after meals if needed.',
      notes: 'Avoid spicy foods and late-night meals. Sleep with head elevated.'
    },
    {
      id: 5,
      prescriptionId: 'RX-2024-005',
      doctorName: 'Dr. Priya Sharma',
      date: '2024-10-20',
      medicines: ['Cetirizine 10mg', 'Fluticasone Nasal Spray'],
      diagnosis: 'Allergic Rhinitis',
      dosage: 'Cetirizine: 1 tablet at bedtime. Nasal spray: 2 sprays in each nostril twice daily.',
      notes: 'Avoid allergen exposure. Keep windows closed during high pollen days.'
    },
    {
      id: 6,
      prescriptionId: 'RX-2024-006',
      doctorName: 'Dr. Robert Brown',
      date: '2024-10-15',
      medicines: ['Ibuprofen 400mg', 'Muscle Relaxant'],
      diagnosis: 'Lower Back Pain',
      dosage: 'Ibuprofen: 1 tablet 3 times daily after meals. Muscle relaxant: 1 tablet at bedtime.',
      notes: 'Apply hot compress. Avoid heavy lifting. Do prescribed exercises.'
    }
  ];

  const handleView = (prescription) => {
    setSelectedPrescription(prescription);
    setShowModal(true);
  };

  const handleDownload = (prescription) => {
    // Simulate download functionality
    alert(`Downloading prescription ${prescription.prescriptionId}...`);
    console.log('Download prescription:', prescription);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedPrescription(null);
  };

  return (
    <div className="prescription-table-container">
      <div className="table-header">
        <h1>My Prescriptions</h1>
        <p>View and download your prescription history</p>
      </div>

      <div className="table-wrapper">
        <table className="prescription-table">
          <thead>
            <tr>
              <th>S.No</th>
              <th>Doctor Name</th>
              <th>Prescription ID</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {prescriptions.map((prescription, index) => (
              <tr key={prescription.id}>
                <td>{index + 1}</td>
                <td>
                  <div className="doctor-cell">
                    <span className="doctor-name">{prescription.doctorName}</span>
                  </div>
                </td>
                <td>
                  <span className="prescription-id">{prescription.prescriptionId}</span>
                </td>
                <td>
                  <span className="date">{new Date(prescription.date).toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'short', 
                    day: 'numeric' 
                  })}</span>
                </td>
                <td>
                  <div className="action-buttons">
                    <button 
                      className="btn-view"
                      onClick={() => handleView(prescription)}
                      title="View Details"
                    >
                      <FaEye /> View
                    </button>
                    <button 
                      className="btn-download"
                      onClick={() => handleDownload(prescription)}
                      title="Download Prescription"
                    >
                      <FaDownload /> Download
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* View Modal */}
      {showModal && selectedPrescription && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Prescription Details</h2>
              <button className="modal-close" onClick={closeModal}>
                <FaTimes />
              </button>
            </div>
            <div className="modal-body">
              <div className="detail-row">
                <span className="detail-label">Prescription ID:</span>
                <span className="detail-value">{selectedPrescription.prescriptionId}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Doctor:</span>
                <span className="detail-value">{selectedPrescription.doctorName}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Date:</span>
                <span className="detail-value">{new Date(selectedPrescription.date).toLocaleDateString('en-US', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Diagnosis:</span>
                <span className="detail-value">{selectedPrescription.diagnosis}</span>
              </div>
              <div className="detail-section">
                <h3>Prescribed Medicines</h3>
                <ul className="medicines-list">
                  {selectedPrescription.medicines.map((medicine, idx) => (
                    <li key={idx}>{medicine}</li>
                  ))}
                </ul>
              </div>
              <div className="detail-section">
                <h3>Dosage Instructions</h3>
                <p>{selectedPrescription.dosage}</p>
              </div>
              <div className="detail-section">
                <h3>Additional Notes</h3>
                <p>{selectedPrescription.notes}</p>
              </div>
            </div>
            <div className="modal-footer">
              <button 
                className="btn-download"
                onClick={() => handleDownload(selectedPrescription)}
              >
                <FaDownload /> Download Prescription
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}