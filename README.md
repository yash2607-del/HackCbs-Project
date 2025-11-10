# 🩺 MediChain — Blockchain-Enabled Healthcare Ecosystem

A secure, AI-powered, and blockchain-backed web application connecting patients, doctors, and pharmacies through verified prescriptions, intelligent health insights, and real-time medicine discovery.

## 🚀 Overview

MediChain is a decentralized healthcare management platform that securely connects patients, doctors, and pharmacies within a unified, transparent ecosystem. It leverages blockchain technology for tamper-proof prescription storage and generative AI for intelligent symptom classification and doctor recommendations.

The system aims to eliminate prescription fraud, simplify medicine discovery, and promote interoperable, verifiable, and patient-centric healthcare data management.

## 👥 Roles & Dashboards

### 🧑‍⚕️ Doctor
- Create and issue digital prescriptions stored immutably on the blockchain
- Access patient medical histories and past prescriptions
- Ensure all prescriptions are verifiable and tamper-proof through blockchain validation

### 💊 Pharmacy
- Verify prescriptions via blockchain before dispensing medication
- Manage and update real-time medicine inventory through a centralized system
- Generate billing records directly linked to verified transactions

### 🧍‍♂️ Patient
- Access and review all verified prescriptions securely through a personal dashboard
- Search for medicines and locate pharmacies with real-time availability using an interactive map
- Interact with an AI-powered chatbot to describe symptoms and receive doctor recommendations based on AI-classified specialization

## 🔑 Core Features

| Feature | Description |
|---------|-------------|
| **Blockchain-Powered Prescriptions** | Each prescription is hashed and stored on-chain to ensure authenticity and traceability |
| **Pharmacy Inventory Management** | Pharmacies can add, update, and track medicine stock securely within the platform |
| **Medicine Locator Map** | Patients can search for medicines and view pharmacies with availability in their vicinity |
| **AI Chatbot** | A generative AI assistant interprets symptoms and recommends appropriate medical specialists |
| **Role-Based Dashboards** | Provides secure authentication and customized dashboards for doctors, pharmacies, and patients |


## 🌐 Blockchain Prescription Flow

1. Doctor creates a prescription formatted as a JSON object
2. The prescription is hashed and stored on the blockchain, generating a unique transaction hash
3. The transaction hash is stored in the backend database, linked to the relevant doctor, patient, and pharmacy IDs
4. Pharmacy verifies the prescription hash on the blockchain before dispensing
5. Patient views all verified prescriptions through their secure dashboard

## 💬 AI Chatbot Workflow

1. Patient describes symptoms through the chatbot interface
2. The AI model analyzes input and classifies symptoms into medical specializations
3. The system retrieves and displays a list of relevant doctors based on specialization and location

## 🗺️ Medicine Search & Map Integration

1. Pharmacies update available medicines in real time
2. Patients search for specific medicines using the integrated search feature
3. The platform queries participating pharmacies, filtering results by geolocation
4. Nearby pharmacies are displayed on an interactive map with directions and availability details

## 🔮 Future Enhancements

- 📱 Mobile application (React Native / Flutter)
- 🧾 Integration with insurance providers for automated e-claim verification
- 🤖 AI-based prescription conflict detection
- 🗣️ Voice-enabled chatbot for improved accessibility
- 🏥 Integration with telemedicine APIs for online consultations


## 📄 License

This project is licensed under the MIT License.
