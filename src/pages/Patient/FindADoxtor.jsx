import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
// Use local UI primitives (adjust path if different)
import { Card, CardContent } from '../../components/ui/Card.jsx'
import { Button } from '../../components/ui/button.jsx'
import '../../styles/find-doctor.scss'

export default function FindADoctor() {
  const navigate = useNavigate();
  const [speciality, setSpeciality] = useState("");
  const [doctor, setDoctor] = useState("");

  // AI-generated placeholder images for professional doctor photos
  // Using a service that provides professional-looking portraits
  const getDoctorImage = (id) => {
    // Using randomuser.me API for professional-looking portraits
    // Alternating between men and women, using unique IDs
    return `https://randomuser.me/api/portraits/${id % 2 === 0 ? 'men' : 'women'}/${((id - 1) % 50) + 1}.jpg`;
  };

  const doctorsData = [
    // Orthopaedics and Joint Replacement
    {
      name: "Dr. Aakarsh Mahajan",
      title: "Associate Consultant",
      speciality: "Orthopaedics, Joint Replacement & Arthroscopy Surgeon",
      specialization: "Orthopaedics and Joint Replacement",
      image: getDoctorImage(1),
    },
    {
      name: "Dr. Aashish Chaudhry",
      title: "Director & Head",
      speciality: "Orthopaedics & Joint Replacement",
      specialization: "Orthopaedics and Joint Replacement",
      image: getDoctorImage(2),
    },
    {
      name: "Dr. Abhishek Kumar Sambharia",
      title: "Consultant",
      speciality: "Orthopaedics",
      specialization: "Orthopaedics and Joint Replacement",
      image: getDoctorImage(3),
    },
    {
      name: "Dr. Bharat Bahre",
      title: "Senior Consultant & Associate Director",
      speciality: "Orthopaedics & Joint Replacement",
      specialization: "Orthopaedics and Joint Replacement",
      image: getDoctorImage(4),
    },
    {
      name: "Dr. Vikram Singh",
      title: "Consultant",
      speciality: "Orthopaedics, Joint Replacement & Sports Medicine",
      specialization: "Orthopaedics and Joint Replacement",
      image: getDoctorImage(5),
    },
    // Cardiology
    {
      name: "Dr. Priya Verma",
      title: "Director & Head",
      speciality: "Cardiology & Interventional Cardiology",
      specialization: "Cardiology",
      image: getDoctorImage(6),
    },
    {
      name: "Dr. Sanjay Mehta",
      title: "Senior Consultant",
      speciality: "Cardiology & Cardiac Electrophysiology",
      specialization: "Cardiology",
      image: getDoctorImage(7),
    },
    {
      name: "Dr. Neha Gupta",
      title: "Consultant",
      speciality: "Cardiology & Preventive Cardiology",
      specialization: "Cardiology",
      image: getDoctorImage(8),
    },
    {
      name: "Dr. Rohit Agarwal",
      title: "Associate Consultant",
      speciality: "Cardiology & Heart Failure Management",
      specialization: "Cardiology",
      image: getDoctorImage(9),
    },
    {
      name: "Dr. Kavita Reddy",
      title: "Senior Consultant",
      speciality: "Cardiology & Cardiac Imaging",
      specialization: "Cardiology",
      image: getDoctorImage(10),
    },
    // Neurology & Neurosurgery
    {
      name: "Dr. Amit Srivastava",
      title: "Director",
      speciality: "Neurosurgery & Neuro-oncology",
      specialization: "Neurology & Neurosurgery",
      image: getDoctorImage(11),
    },
    {
      name: "Dr. Madhukar Bhardwaj",
      title: "Director & HOD",
      speciality: "Neurology & Stroke Medicine",
      specialization: "Neurology & Neurosurgery",
      image: getDoctorImage(12),
    },
    {
      name: "Dr. Sunita Nair",
      title: "Senior Consultant",
      speciality: "Neurology & Epilepsy",
      specialization: "Neurology & Neurosurgery",
      image: getDoctorImage(13),
    },
    {
      name: "Dr. Karan Malhotra",
      title: "Consultant",
      speciality: "Neurosurgery & Spine Surgery",
      specialization: "Neurology & Neurosurgery",
      image: getDoctorImage(14),
    },
    {
      name: "Dr. Meera Joshi",
      title: "Associate Consultant",
      speciality: "Neurology & Movement Disorders",
      specialization: "Neurology & Neurosurgery",
      image: getDoctorImage(15),
    },
    // Surgical Oncology
    {
      name: "Dr. Arun Kumar Giri",
      title: "Director",
      speciality: "Surgical Oncology & Gastrointestinal Surgery",
      specialization: "Surgical Oncology",
      image: getDoctorImage(16),
    },
    {
      name: "Dr. Shalini Kapoor",
      title: "Senior Consultant",
      speciality: "Surgical Oncology & Breast Surgery",
      specialization: "Surgical Oncology",
      image: getDoctorImage(17),
    },
    {
      name: "Dr. Deepak Chawla",
      title: "Consultant",
      speciality: "Surgical Oncology & Head & Neck Surgery",
      specialization: "Surgical Oncology",
      image: getDoctorImage(18),
    },
    {
      name: "Dr. Ritu Desai",
      title: "Associate Consultant",
      speciality: "Surgical Oncology & Gynecological Oncology",
      specialization: "Surgical Oncology",
      image: getDoctorImage(19),
    },
    {
      name: "Dr. Nitin Shah",
      title: "Senior Consultant",
      speciality: "Surgical Oncology & Uro-oncology",
      specialization: "Surgical Oncology",
      image: getDoctorImage(20),
    },
    // Dermatology
    {
      name: "Dr. Anjali Mehta",
      title: "Director & Head",
      speciality: "Dermatology & Cosmetic Dermatology",
      specialization: "Dermatology",
      image: getDoctorImage(21),
    },
    {
      name: "Dr. Rahul Kapoor",
      title: "Senior Consultant",
      speciality: "Dermatology & Skin Cancer Surgery",
      specialization: "Dermatology",
      image: getDoctorImage(22),
    },
    {
      name: "Dr. Sneha Patel",
      title: "Consultant",
      speciality: "Dermatology & Hair Transplant",
      specialization: "Dermatology",
      image: getDoctorImage(23),
    },
    {
      name: "Dr. Mohit Sharma",
      title: "Associate Consultant",
      speciality: "Dermatology & Pediatric Dermatology",
      specialization: "Dermatology",
      image: getDoctorImage(24),
    },
    {
      name: "Dr. Kavita Nair",
      title: "Senior Consultant",
      speciality: "Dermatology & Laser Therapy",
      specialization: "Dermatology",
      image: getDoctorImage(25),
    },
    // Pediatrics
    {
      name: "Dr. Priya Sharma",
      title: "Director & Head",
      speciality: "Pediatrics & Neonatology",
      specialization: "Pediatrics",
      image: getDoctorImage(26),
    },
    {
      name: "Dr. Rajesh Verma",
      title: "Senior Consultant",
      speciality: "Pediatrics & Pediatric Cardiology",
      specialization: "Pediatrics",
      image: getDoctorImage(27),
    },
    {
      name: "Dr. Meera Desai",
      title: "Consultant",
      speciality: "Pediatrics & Pediatric Neurology",
      specialization: "Pediatrics",
      image: getDoctorImage(28),
    },
    {
      name: "Dr. Ankit Kumar",
      title: "Associate Consultant",
      speciality: "Pediatrics & Pediatric Emergency",
      specialization: "Pediatrics",
      image: getDoctorImage(29),
    },
    {
      name: "Dr. Sunita Reddy",
      title: "Senior Consultant",
      speciality: "Pediatrics & Developmental Pediatrics",
      specialization: "Pediatrics",
      image: getDoctorImage(30),
    },
  ];

  return (
    <div className="find-doctor-wrapper">
      <div className="find-doctor-header">
        
      </div>
      <div className="find-doctor-filters-row">
        <select
          className="fd-select"
          onChange={(e)=>{ setSpeciality(e.target.value); setDoctor('') }}
          value={speciality || 'Orthopaedics and Joint Replacement'}
        >
          <option value="Orthopaedics and Joint Replacement">Orthopaedics and Joint Replacement (Bone)</option>
          <option value="Cardiology">Cardiology</option>
          <option value="Neurology & Neurosurgery">Neurology & Neurosurgery</option>
          <option value="Surgical Oncology">Surgical Oncology</option>
          <option value="Dermatology">Dermatology</option>
          <option value="Pediatrics">Pediatrics</option>
        </select>
        <select
          className="fd-select"
          onChange={(e)=> setDoctor(e.target.value)}
          value={doctor}
        >
          <option value="">Select Doctor</option>
          {doctorsData.filter(d => d.specialization === (speciality || 'Orthopaedics and Joint Replacement')).map(d => (
            <option key={d.name} value={d.name}>{d.name}</option>
          ))}
        </select>
      </div>
      <div className="doctor-cards-grid">
        {(() => {
          const sel = speciality || 'Orthopaedics and Joint Replacement'
          const filtered = doctorsData.filter(d => {
            if (d.specialization !== sel) return false
            if (doctor && d.name !== doctor) return false
            return true
          }).slice(0,6)
          if (!filtered.length) return <div className="empty">No matches found.</div>
          return filtered.map(d => (
            <motion.div key={d.name} whileHover={{ scale:1.02, y:-4 }} transition={{ type:'spring', stiffness:260, damping:22 }}>
              <Card className="doctor-card">
                <div className="doctor-card-hero">
                  <img src={d.image} alt={d.name} onError={(e)=>{ e.target.src=`https://ui-avatars.com/api/?name=${encodeURIComponent(d.name)}&background=89CFF3&color=fff` }} />
                </div>
                <CardContent className="doctor-card-body">
                  <h3 className="name">{d.name}</h3>
                  <div className="title">{d.title}</div>
                  <div className="speciality">{d.speciality}</div>
                  <button
                    className="profile-link"
                    onClick={(e)=> e.preventDefault()}
                  >View Full Profile</button>
                  <Button
                    className="book-btn"
                    onClick={() => navigate('/appointment-form', { state:{ doctorName: d.name, speciality: d.specialization } })}
                  >Book an Appointment</Button>
                </CardContent>
              </Card>
            </motion.div>
          ))
        })()}
      </div>
    </div>
  )
}
