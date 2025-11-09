import React from 'react';
import { FaPaperPlane, FaStop, FaTrash, FaRobot, FaUser } from 'react-icons/fa';
import { streamText } from '../../lib/geminiClient';
import { FORCED_MODEL } from '../../lib/geminiClient';
import './Chatbot.css';

export default function Chatbot() {
  const [messages, setMessages] = React.useState([
    { 
      role: 'assistant', 
      text: 'Hello! I\'m your AI health assistant. I can help answer general health questions, provide wellness tips, and offer medical information. How can I assist you today?',
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = React.useState('');
  const [loading, setLoading] = React.useState(false);

  const model = FORCED_MODEL || 'gemini-2.5-flash';
  const buffer = React.useRef('');
  const stopFlag = React.useRef({ stopped: false });
  const listRef = React.useRef(null);

  React.useEffect(() => {
    // Auto-scroll to bottom whenever messages change
    const el = listRef.current;
    if (el) {
      el.scrollTop = el.scrollHeight;
    }
  }, [messages, loading]);

  function clearChat() {
    setMessages([
      { 
        role: 'assistant', 
        text: 'Chat cleared! I\'m ready to help with your health questions.',
        timestamp: new Date()
      }
    ]);
  }

  function formatTime(date) {
    return new Date(date).toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  }

  async function onSend(e) {
    e.preventDefault();
    if (loading) return;
    const text = input.trim();
    if (!text) return;

    setMessages(m => [...m, { role: 'user', text, timestamp: new Date() }]);
    setInput('');
    setLoading(true);

    // Build a better prompt with system context
    const systemContext = `You are a helpful AI health assistant. Provide clear, accurate, and empathetic health information. Keep responses concise (2-3 paragraphs). Always remind users to consult healthcare professionals for medical advice.`;
    
    const conversationHistory = messages
      .filter(m => m.role !== 'system')
      .slice(-6) // Keep last 6 messages for context
      .map(m => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.text}`)
      .join('\n');
    
    const prompt = `${systemContext}\n\n${conversationHistory}\nUser: ${text}\nAssistant:`;

    buffer.current = '';
    stopFlag.current.stopped = false;

    // Placeholder assistant message at the end
    const assistantIndex = messages.length + 1;
    setMessages(m => [...m, { role: 'assistant', text: '', timestamp: new Date() }]);

    try {
      await streamText(
        prompt,
        chunk => {
          buffer.current += chunk;
          setMessages(m =>
            m.map((msg, i) =>
              i === assistantIndex ? { ...msg, text: buffer.current } : msg
            )
          );
        },
        model,
        {
          maxOutputTokens: 400, // keep answers concise
          temperature: 0.7,
          shouldStop: () => stopFlag.current.stopped
        }
      );
    } catch (err) {
      console.error('Gemini error:', err);
      const errorMessage = err.message?.includes('API') || err.message?.includes('key')
        ? 'API key not configured. Please add VITE_GEMINI_API_KEY to your .env file and restart the server.'
        : `Error: ${err.message || 'Failed to get response. Please try again.'}`;
      
      setMessages(m =>
        m.map((msg, i) =>
          i === assistantIndex
            ? { ...msg, text: errorMessage }
            : msg
        )
      );
    } finally {
      setLoading(false);
    }
  }

  function onStop() {
    // Signal the stream loop to stop on next chunk
    stopFlag.current.stopped = true;
    setLoading(false);
  }

  function onKeyDown(e) {
    // Enter to send, Shift+Enter for newline
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSend(e);
    }
  }

  return (
    <div className="chatbot-container">
      {/* Header with Clear Button */}
             <div className="chatbot-actions">
          {loading && (
            <button type="button" className="btn-header" onClick={onStop}>
              <FaStop /> Stop
            </button>
          )}
          <button type="button" className="btn-header" onClick={clearChat}>
            <FaTrash /> Clear
          </button>
        </div>
    

      {/* Messages */}
      <div className="chatbot-messages" ref={listRef}>
        {messages.filter(m => m.role !== 'system').map((m, i) => (
          <div key={i} className={`message-bubble ${m.role}`}>
            <div className={`message-avatar ${m.role}`}>
              {m.role === 'user' ? <FaUser /> : <FaRobot />}
            </div>
            <div className="message-content">
              <div className="message-text">
                {m.text || (loading && m.role === 'assistant' && i === messages.length - 1 ? (
                  <div className="typing-indicator">
                    <div className="typing-dot"></div>
                    <div className="typing-dot"></div>
                    <div className="typing-dot"></div>
                  </div>
                ) : '')}
              </div>
              <div className="message-timestamp">
                {formatTime(m.timestamp)}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Input Area */}
      <div className="chatbot-input-area">
        <form onSubmit={onSend} className="chatbot-input-form">
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={onKeyDown}
            disabled={loading && !stopFlag.current.stopped}
            placeholder="Type your health question here..."
            rows={2}
            className="chatbot-textarea"
          />
          <button 
            type="submit" 
            disabled={loading || !input.trim()} 
            className="btn-send"
          >
            {loading ? (
              <>
                <FaStop /> Stop
              </>
            ) : (
              <>
                <FaPaperPlane /> Send
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}