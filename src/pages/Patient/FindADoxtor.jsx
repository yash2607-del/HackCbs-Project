import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import "./FindADoxtor.css";

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
    <div className="min-h-screen bg-white">
      {/* Gradient Header Banner */}
      <div className="w-full bg-gradient-to-r from-pink-700 via-pink-800 to-purple-900 py-20 px-6">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-center text-white">
          Find A Doctor
        </h1>
      </div>

      {/* Main Content */}
      <div className="bg-white py-10 px-6">
        {/* Search Filters */}
        <div className="flex flex-col md:flex-row justify-center items-center gap-4 mb-12 max-w-5xl mx-auto">
          <div className="relative w-full md:w-auto min-w-[300px]">
            <select
              className="w-full border border-gray-300 rounded-lg p-3.5 bg-white text-gray-800 shadow-sm focus:border-pink-500 focus:ring-2 focus:ring-pink-200 appearance-none cursor-pointer transition-all"
              onChange={(e) => {
                setSpeciality(e.target.value);
                setDoctor(""); // Reset doctor search when speciality changes
              }}
              value={speciality || "Orthopaedics and Joint Replacement"}
            >
              <option value="Orthopaedics and Joint Replacement">Orthopaedics and Joint Replacement (Bone)</option>
              <option value="Cardiology">Cardiology</option>
              <option value="Neurology & Neurosurgery">Neurology & Neurosurgery</option>
              <option value="Surgical Oncology">Surgical Oncology</option>
              <option value="Dermatology">Dermatology</option>
              <option value="Pediatrics">Pediatrics</option>
            </select>
          </div>

          <div className="relative w-full md:w-auto min-w-[200px]">
            <select
              className="w-full border border-gray-300 rounded-lg p-3.5 bg-white text-gray-800 shadow-sm focus:border-pink-500 focus:ring-2 focus:ring-pink-200 appearance-none cursor-pointer transition-all"
              onChange={(e) => setDoctor(e.target.value)}
              value={doctor}
            >
              <option value="">Select Doctor</option>
              {doctorsData
                .filter((doc) => {
                  const selectedSpeciality = speciality || "Orthopaedics and Joint Replacement";
                  return doc.specialization === selectedSpeciality;
                })
                .map((doc) => (
                  <option key={doc.name} value={doc.name}>
                    {doc.name}
                  </option>
                ))}
            </select>
          </div>
        </div>

        {/* Doctor Cards Grid */}
        <div className="max-w-7xl mx-auto">
          {(() => {
            const filteredDoctors = doctorsData.filter((doc) => {
              const selectedSpeciality = speciality || "Orthopaedics and Joint Replacement";
              const matchesSpeciality = doc.specialization === selectedSpeciality;
              const matchesDoctor = !doctor || doc.name === doctor;
              return matchesSpeciality && matchesDoctor;
            });

            const displayedDoctors = filteredDoctors.slice(0, 6); // Show up to 6 cards (2 rows of 3, or 3 rows of 2)

            if (displayedDoctors.length === 0) {
              return (
                <div className="text-center py-16">
                  <p className="text-gray-500 text-lg">No doctors found. Please try a different search.</p>
                </div>
              );
            }

            return (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {displayedDoctors.map((doc) => (
                  <motion.div
                    key={doc.name}
                    whileHover={{ scale: 1.03, y: -5 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    className="h-full"
                  >
                    <Card className="bg-white shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl overflow-hidden border border-gray-100 h-full flex flex-col">
                      <div className="relative w-full h-72 bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center overflow-hidden">
                        <img
                          src={doc.image}
                          alt={doc.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(doc.name)}&size=400&background=3b82f6&color=fff&bold=true`;
                          }}
                        />
                      </div>
                      <CardContent className="p-6 flex flex-col flex-grow">
                        <h3 className="text-xl font-bold text-gray-900 mb-2">
                          {doc.name}
                        </h3>
                        <p className="text-sm text-gray-700 font-semibold mb-2">{doc.title}</p>
                        <p className="text-sm text-gray-600 mb-4 leading-relaxed flex-grow">{doc.speciality}</p>
                        <a
                          href="#"
                          className="text-red-600 underline text-sm mb-4 block hover:text-red-700 transition-colors font-medium"
                          onClick={(e) => e.preventDefault()}
                        >
                          View Full Profile
                        </a>
                        <Button 
                          className="w-full bg-red-600 text-white hover:bg-red-700 rounded-lg py-3 font-semibold transition-all duration-200 shadow-md hover:shadow-lg"
                          onClick={() => navigate("/appointment-form", { 
                            state: { 
                              doctorName: doc.name, 
                              speciality: doc.specialization 
                            } 
                          })}
                        >
                          Book an Appointment
                        </Button>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            );
          })()}
        </div>
      </div>
    </div>
  );
}
