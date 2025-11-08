import { useState } from "react";
import { useLocation } from "react-router-dom";
import "./Appointment-form.css";

export default function AppointmentForm() {
  const location = useLocation();

  const [formData, setFormData] = useState({
    doctorName: location.state?.doctorName || "",
    speciality: location.state?.speciality || "",
    appointmentDate: "",
    appointmentTime: "",
    reasonForVisit: "",
    additionalNotes: "",
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handleReset = () => {
    setFormData({
      doctorName: location.state?.doctorName || "",
      speciality: location.state?.speciality || "",
      appointmentDate: "",
      appointmentTime: "",
      reasonForVisit: "",
      additionalNotes: "",
    });
    setErrors({});
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.doctorName.trim()) newErrors.doctorName = "Doctor name is required";
    if (!formData.speciality) newErrors.speciality = "Speciality is required";
    if (!formData.appointmentDate) newErrors.appointmentDate = "Appointment date is required";
    if (!formData.appointmentTime) newErrors.appointmentTime = "Appointment time is required";
    if (!formData.reasonForVisit.trim()) newErrors.reasonForVisit = "Reason for visit is required";

    // Validate appointment date is not in the past
    if (formData.appointmentDate) {
      const selectedDate = new Date(formData.appointmentDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (selectedDate < today) {
        newErrors.appointmentDate = "Appointment date cannot be in the past";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      console.log("Appointment Form Data:", formData);
      alert("Appointment request submitted successfully! We will contact you shortly to confirm.");
      setIsSubmitting(false);
      handleReset();
    }, 1500);
  };
  return (
    <div className="prescribe-form-page">
      <div className="prescribe-form-container">
        {/* Header */}
        <div className="form-header">
          <h1>Book Appointment</h1>
          <p>Create an appointment request. All fields optional, but doctor name recommended.</p>
        </div>

        <form onSubmit={handleSubmit} className="prescribe-form">
          {/* Patient Information Section */}
          <div className="form-section">
            <h2 className="section-title">Appointment Information</h2>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="doctorName">
                  Doctor Name <span className="required">*</span>
                </label>
                <input
                  type="text"
                  id="doctorName"
                  name="doctorName"
                  value={formData.doctorName}
                  onChange={handleChange}
                  className={errors.doctorName ? "error" : ""}
                  placeholder="e.g. Dr. John Smith"
                />
                {errors.doctorName && (
                  <span className="error-message">{errors.doctorName}</span>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="speciality">Speciality</label>
                <select
                  id="speciality"
                  name="speciality"
                  value={formData.speciality}
                  onChange={handleChange}
                  className={errors.speciality ? "error" : ""}
                >
                  <option value="">Select</option>
                  <option value="Orthopaedics and Joint Replacement">
                    Orthopaedics and Joint Replacement
                  </option>
                  <option value="Cardiology">Cardiology</option>
                  <option value="Neurology & Neurosurgery">
                    Neurology & Neurosurgery
                  </option>
                  <option value="Surgical Oncology">Surgical Oncology</option>
                  <option value="Dermatology">Dermatology</option>
                  <option value="Pediatrics">Pediatrics</option>
                </select>
                {errors.speciality && (
                  <span className="error-message">{errors.speciality}</span>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="appointmentDate">Date</label>
                <input
                  type="date"
                  id="appointmentDate"
                  name="appointmentDate"
                  value={formData.appointmentDate}
                  onChange={handleChange}
                  className={errors.appointmentDate ? "error" : ""}
                  min={new Date().toISOString().split("T")[0]}
                />
                {errors.appointmentDate && (
                  <span className="error-message">{errors.appointmentDate}</span>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="appointmentTime">Time</label>
                <select
                  id="appointmentTime"
                  name="appointmentTime"
                  value={formData.appointmentTime}
                  onChange={handleChange}
                  className={errors.appointmentTime ? "error" : ""}
                >
                  <option value="">Select</option>
                  <option value="09:00">09:00 AM</option>
                  <option value="09:30">09:30 AM</option>
                  <option value="10:00">10:00 AM</option>
                  <option value="10:30">10:30 AM</option>
                  <option value="11:00">11:00 AM</option>
                  <option value="11:30">11:30 AM</option>
                  <option value="12:00">12:00 PM</option>
                  <option value="12:30">12:30 PM</option>
                  <option value="13:00">01:00 PM</option>
                  <option value="13:30">01:30 PM</option>
                  <option value="14:00">02:00 PM</option>
                  <option value="14:30">02:30 PM</option>
                  <option value="15:00">03:00 PM</option>
                  <option value="15:30">03:30 PM</option>
                  <option value="16:00">04:00 PM</option>
                  <option value="16:30">04:30 PM</option>
                  <option value="17:00">05:00 PM</option>
                </select>
                {errors.appointmentTime && (
                  <span className="error-message">{errors.appointmentTime}</span>
                )}
              </div>
            </div>
          </div>

          {/* Appointment Details Section */}
          <div className="form-section appointment-details-section">
            <div className="section-header">
              <h2 className="section-title">Appointment Details</h2>
            </div>
            <div className="form-group">
              <label htmlFor="reasonForVisit">Reason for Visit</label>
              <input
                type="text"
                id="reasonForVisit"
                name="reasonForVisit"
                value={formData.reasonForVisit}
                onChange={handleChange}
                className={errors.reasonForVisit ? "error" : ""}
                placeholder="Describe your symptoms or reason for appointment"
              />
              {errors.reasonForVisit && (
                <span className="error-message">{errors.reasonForVisit}</span>
              )}
            </div>
          </div>

          {/* Additional Notes Section */}
          <div className="form-section">
            <h2 className="section-title">Additional Notes</h2>
            <div className="form-group">
              <textarea
                id="additionalNotes"
                name="additionalNotes"
                value={formData.additionalNotes}
                onChange={handleChange}
                rows="4"
                placeholder="Special requirements, accessibility needs, or any additional information..."
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="form-actions">
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Submitting..." : "Submit Appointment"}
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={handleReset}
            >
              Reset
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
