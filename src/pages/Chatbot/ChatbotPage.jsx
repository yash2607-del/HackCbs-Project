import React, { useState } from 'react'
import DashboardLayout from '../../components/DashboardLayout.jsx'
import Chatbot from '../../components/chat/Chatbot.jsx'

export default function ChatbotPage() {
  const [active, setActive] = useState('chatbot')

  const menuItems = [
    { key: 'chatbot', label: 'Chatbot' },
  ]

  return (
    <div className="chatbot-page">
      <DashboardLayout
        brand="MedTrack"
        menuItems={menuItems}
        active={active}
        setActive={setActive}
      >
        <Chatbot />
      </DashboardLayout>
    </div>
  )
}
