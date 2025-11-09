import React from 'react'
import Chatbot from '../../components/chat/Chatbot.jsx'

export default function ChatbotPage() {
  return (
    <div className="chatbot-page" style={{ 
      height: '100vh', 
      display: 'flex', 
      flexDirection: 'column',
      overflow: 'hidden'
    }}>
      <Chatbot />
    </div>
  )
}
