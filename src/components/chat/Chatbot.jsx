import React from 'react';
import { streamText, generateText } from '../../lib/geminiClient';

export default function Chatbot() {
  const [messages, setMessages] = React.useState([
    { role: 'system', text: 'You are a helpful health assistant. Give general guidance only.' }
  ]);
  const [input, setInput] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  // Hardcode single model to simplify usage. Change this string if you want a different one.
  const model = 'gemini-2.5-flash';
  const [lastError, setLastError] = React.useState(null);
  const buffer = React.useRef('');

  async function onSend(e) {
    e.preventDefault();
    const text = input.trim();
    if (!text) return;
    setMessages(m => [...m, { role: 'user', text }]);
    setInput('');
  setLoading(true);
  setLastError(null);

    const prompt = messages
      .concat({ role: 'user', text })
      .map(m => `${m.role.toUpperCase()}: ${m.text}`)
      .join('\n') + '\nASSISTANT:';

    buffer.current = '';
    const idx = messages.length + 1;
    setMessages(m => [...m, { role: 'assistant', text: '' }]);

    try {
      await streamText(prompt, chunk => {
        buffer.current += chunk;
        setMessages(m => m.map((msg, i) => i === idx ? { ...msg, text: buffer.current } : msg));
      }, model);
    } catch (err) {
      // Streaming failed; try a non-stream fallback and surface detailed error info.
      console.error('Gemini stream error:', err);
      const code = err?.status || err?.error?.status || err?.response?.status;
      const msg = err?.message || err?.error?.message || '';
      setLastError({ code, message: msg });
      try {
        const text = await generateText(prompt, model);
        setMessages(m => m.map((msgObj, i) => i === idx ? { ...msgObj, text } : msgObj));
      } catch (fallbackErr) {
        console.error('Gemini fallback error:', fallbackErr);
        const fCode = fallbackErr?.status || fallbackErr?.error?.status || fallbackErr?.response?.status;
        const fMsg = fallbackErr?.message || fallbackErr?.error?.message || '';
        setLastError(prev => prev || { code: fCode, message: fMsg });
        setMessages(m => m.map((msgObj, i) => i === idx ? { ...msgObj, text: `(error getting response${code ? ` ${code}` : ''}${msg ? `: ${msg}` : ''}${fCode || fMsg ? ` | fallback: ${fCode ?? ''} ${fMsg ?? ''}` : ''})` } : msgObj));
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="appointments-pane">
      <h2>Chatbot</h2>
      <p className="hint">Information only; not a diagnosis.</p>

      {/* Model selection removed; using fixed model: gemini-1.5-flash-latest */}

      {lastError?.code === 429 && (
        <div style={{
          background:'var(--color-bg-light)',
          border:'1px solid var(--color-border)',
          borderLeft:'4px solid #d66',
          padding:'0.6rem 0.8rem',
          borderRadius:8,
          marginBottom:'0.6rem',
          color:'var(--color-text-dark)'
        }}>
          You’re hitting the rate limit (429). Try again in ~30s, switch to a lighter model, or enable billing/free quota for your key. See ai.google.dev/gemini-api/docs/rate-limits.
        </div>
      )}

      <div style={{ background:'#fff', border:'1px solid var(--color-border)', borderRadius:12, padding:'0.9rem', display:'flex', flexDirection:'column', gap:'0.75rem', maxHeight:'65vh' }}>
        <div style={{ overflowY:'auto', flex:1, display:'flex', flexDirection:'column', gap:'0.6rem' }}>
          {messages.filter(m => m.role !== 'system').map((m, i) => (
            <div key={i}
              style={{
                alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start',
                background: m.role === 'user' ? 'var(--color-3)' : 'var(--color-bg-light)',
                color: 'var(--color-text-dark)',
                padding:'0.6rem 0.8rem',
                borderRadius:10,
                maxWidth:'70%',
                whiteSpace:'pre-wrap',
                boxShadow:'0 2px 6px var(--shadow-light)'
              }}>
              {m.text || (loading && m.role === 'assistant' ? '...' : '')}
            </div>
          ))}
        </div>

        <form onSubmit={onSend} style={{ display:'flex', gap:'0.5rem' }}>
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            disabled={loading}
            placeholder="Ask something..."
            style={{ flex:1, padding:'0.6rem 0.8rem', border:'1px solid var(--color-border)', borderRadius:8 }}
          />
          <button type="submit" disabled={loading} className="btn primary">Send</button>
        </form>
      </div>
    </section>
  );
}