# 🤖 AI Chatbot Setup Guide

## ✅ What's Been Done

### **1. Enhanced UI** 🎨
- Modern, professional chatbot interface
- Gradient header with AI branding
- Message bubbles with avatars
- Typing indicator animation
- Smooth animations and transitions
- Responsive design for all devices

### **2. Features** ⚡
- Real-time streaming responses from Gemini AI
- Message history
- Timestamps for each message
- Stop generation button
- Clear chat functionality
- Auto-scroll to latest message
- Enter to send, Shift+Enter for new line

---

## 🔧 Setup Instructions

### **Step 1: Get Gemini API Key**

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Get API Key"
4. Copy your API key

### **Step 2: Add API Key to Environment**

Create or update `.env` file in the root directory:

```env
VITE_GEMINI_API_KEY=your_api_key_here
```

**Important**: Replace `your_api_key_here` with your actual Gemini API key.

### **Step 3: Install Dependencies**

If not already installed:

```bash
npm install @google/generative-ai
```

### **Step 4: Restart Development Server**

```bash
npm run dev
```

---

## 🎨 UI Features

### **Header**
- **Title**: "AI Health Assistant"
- **Subtitle**: "Powered by Gemini AI"
- **Robot Icon**: Animated icon
- **Actions**: Stop (when loading) and Clear buttons

### **Message Bubbles**
- **User Messages**: Blue gradient, right-aligned
- **AI Messages**: Light gray, left-aligned
- **Avatars**: User icon and Robot icon
- **Timestamps**: Show time for each message

### **Typing Indicator**
- Animated dots when AI is thinking
- Shows in assistant's message bubble

### **Input Area**
- Multi-line textarea
- Placeholder: "Type your health question here..."
- Send button with icon
- Disabled when no text or loading

---

## 🎯 How It Works

### **1. User Sends Message**
```javascript
User types → Press Enter → Message sent to Gemini AI
```

### **2. AI Processes**
```javascript
Gemini AI receives prompt → Streams response → Updates UI in real-time
```

### **3. Response Display**
```javascript
Chunks received → Buffer updated → Message bubble updates → Auto-scroll
```

---

## 📋 API Configuration

### **Current Model**
```javascript
FORCED_MODEL = 'gemini-2.5-flash'
```

### **Generation Config**
```javascript
{
  maxOutputTokens: 400,  // Keep responses concise
  temperature: 0.7        // Balanced creativity
}
```

---

## 🎨 Color Scheme

### **Primary Colors**
- **Header Gradient**: `#00A9FF` → `#89CFF3`
- **User Messages**: `#00A9FF` → `#89CFF3`
- **AI Messages**: `#F9FBFC` with border
- **Background**: `#F9FBFC` → `#CDF5FD`

### **Avatars**
- **User**: Blue gradient circle
- **AI**: Green gradient circle

---

## 📱 Responsive Design

### **Desktop (> 768px)**
- Full-width layout
- Side-by-side header elements
- 80% max width for messages

### **Tablet (768px)**
- Adjusted padding
- Smaller avatars
- 90% max width for messages

### **Mobile (< 480px)**
- Stacked header buttons
- 95% max width for messages
- Compact UI elements

---

## 🚀 Usage

### **Navigate to Chatbot**
```
http://localhost:5173/chatbot
```

### **Example Questions**
- "What are the symptoms of flu?"
- "How can I improve my sleep quality?"
- "What foods are good for heart health?"
- "When should I see a doctor for a headache?"

---

## ⚠️ Important Notes

### **Disclaimer**
The chatbot provides general health information only and is not a substitute for professional medical advice. Always consult with a healthcare provider for medical concerns.

### **API Limits**
- Free tier: 60 requests per minute
- Rate limiting may apply
- Monitor usage in Google AI Studio

### **Privacy**
- Messages are sent to Google's Gemini API
- No conversation history is stored on server
- Local storage only (browser session)

---

## 🎉 Features Summary

✅ **Modern UI** - Beautiful gradient design
✅ **Real-time Streaming** - See responses as they're generated
✅ **Message History** - Scroll through conversation
✅ **Typing Indicator** - Know when AI is thinking
✅ **Stop Generation** - Cancel long responses
✅ **Clear Chat** - Start fresh conversation
✅ **Timestamps** - Track message times
✅ **Responsive** - Works on all devices
✅ **Smooth Animations** - Professional feel
✅ **Error Handling** - Graceful error messages

---

## 🐛 Troubleshooting

### **"API Key Missing" Warning**
- Check `.env` file exists
- Verify `VITE_GEMINI_API_KEY` is set
- Restart dev server

### **"Error Getting Response"**
- Check API key is valid
- Verify internet connection
- Check API quota limits
- Try different model in `geminiClient.js`

### **Messages Not Appearing**
- Check browser console for errors
- Verify Gemini API is accessible
- Clear browser cache

---

## 📊 File Structure

```
src/
├── components/
│   └── chat/
│       ├── Chatbot.jsx      # Main component
│       └── Chatbot.css       # Styles
├── lib/
│   └── geminiClient.js       # API client
└── pages/
    └── Chatbot/
        └── ChatbotPage.jsx   # Page wrapper
```

---

**Your AI Health Assistant is ready to help! 🎉**
