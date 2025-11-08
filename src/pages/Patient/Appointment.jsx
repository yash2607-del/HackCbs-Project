import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

export default function FindADoctor() {
  const [speciality, setSpeciality] = useState("");
  const [doctor, setDoctor] = useState("");

  const doctorsData = [
    {
      name: "Dr. Arun Kumar Giri",
      title: "Director",
      speciality: "Surgical Oncology",
      experience: "20+ Years Experience",
      image: "/images/arun-giri.png",
    },
    {
      name: "Dr. Amit Srivastava",
      title: "Director",
      speciality: "Neurosurgery",
      experience: "18+ Years Experience",
      image: "/images/amit-srivastava.png",
    },
    {
      name: "Dr. Madhukar Bhardwaj",
      title: "Director & HOD",
      speciality: "Neurology",
      experience: "17+ Years Experience",
      image: "/images/madhukar-bhardwaj.png",
    },
  ];

  const sections = [
    { title: "Surgical Oncology", filter: "Surgical Oncology" },
    { title: "Neurology & Neurosurgery", filter: "Neurosurgery" },
  ];

  return (
    <div className="bg-[var(--color-bg-light)] min-h-screen py-10 px-6">
      <h1 className="text-3xl font-semibold text-center text-[var(--color-text-dark)] mb-8">
        Find a Doctor
      </h1>

      {/* Search Filters */}
      <div className="flex flex-col md:flex-row justify-center gap-4 mb-12">
        <select
          className="border border-[var(--color-border)] rounded-xl p-3 w-full md:w-64 bg-white text-[var(--color-text-dark)] shadow-sm focus:border-[var(--color-3)] focus:ring-1 focus:ring-[var(--color-3)]"
          onChange={(e) => setSpeciality(e.target.value)}
        >
          <option value="">Select Speciality</option>
          <option value="Surgical Oncology">Surgical Oncology</option>
          <option value="Neurology & Neurosurgery">Neurology & Neurosurgery</option>
        </select>

        <input
          type="text"
          placeholder="Search Doctor Name"
          value={doctor}
          onChange={(e) => setDoctor(e.target.value)}
          className="border border-[var(--color-border)] rounded-xl p-3 w-full md:w-64 bg-white text-[var(--color-text-dark)] shadow-sm focus:border-[var(--color-3)] focus:ring-1 focus:ring-[var(--color-3)]"
        />
      </div>

      {/* Doctor Sections */}
      <div className="max-w-7xl mx-auto space-y-12">
        {sections.map((section) => (
          <div key={section.title}>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold text-[var(--color-text-dark)]">
                {section.title}
              </h2>
              <Button
                variant="outline"
                className="text-[var(--color-3)] border-[var(--color-3)] hover:bg-[var(--color-1)]"
              >
                View More
              </Button>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {doctorsData
                .filter((doc) => doc.speciality.includes(section.filter))
                .map((doc) => (
                  <motion.div
                    key={doc.name}
                    whileHover={{ scale: 1.03 }}
                    transition={{ type: "spring", stiffness: 200 }}
                  >
                    <Card className="shadow-md hover:shadow-lg transition-shadow duration-300 rounded-2xl overflow-hidden border border-[var(--color-border)]">
                      <img
                        src={doc.image}
                        alt={doc.name}
                        className="w-full h-60 object-cover bg-[var(--color-1)]"
                      />
                      <CardContent className="p-5">
                        <h3 className="text-lg font-semibold text-[var(--color-text-dark)] mb-1">
                          {doc.name}
                        </h3>
                        <p className="text-[var(--color-3)] font-medium mb-1">{doc.title}</p>
                        <p className="text-sm text-gray-600 mb-2">{doc.speciality}</p>
                        <p className="text-xs text-gray-500 mb-4">{doc.experience}</p>
                        <div className="flex flex-col gap-2">
                          <Button className="bg-[var(--color-3)] text-white hover:bg-[var(--color-2)]">
                            Book an Appointment
                          </Button>
                          <Button
                            variant="outline"
                            className="border-[var(--color-3)] text-[var(--color-3)] hover:bg-[var(--color-1)]"
                          >
                            View Full Profile
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
