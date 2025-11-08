import { GoogleGenerativeAI } from '@google/generative-ai';

// NOTE: Model naming evolves; 404 errors usually mean the ID is deprecated for the API version.
// We'll provide a small fallback chain and a model listing helper.

const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
if (!apiKey) console.warn('VITE_GEMINI_API_KEY is missing');

const genAI = new GoogleGenerativeAI(apiKey);

// If you want to force a single model globally, set this. Leave empty string to allow fallback detection.
export const FORCED_MODEL = 'gemini-2.5-flash';

// Preferred models order (used only when FORCED_MODEL is empty).
const MODEL_FALLBACKS = [
  'gemini-1.5-flash-latest',
  'gemini-1.5-pro-latest',
  'gemini-pro',
];

let cachedWorkingModel = null;

export async function resolveModel(requested) {
  if (requested) return requested; // trust explicit choice
  if (FORCED_MODEL) return FORCED_MODEL;
  if (cachedWorkingModel) return cachedWorkingModel;
  // Prefer listing models to avoid triggering generation errors during detection
  const models = await listAvailableModels(true); // throws with detailed error if it fails
  const available = new Map();
  for (const m of models) {
    const id = (m.name || '').replace(/^models\//, '');
    available.set(id, new Set(m.supportedGenerationMethods || m.supportedMethods || []));
  }
  // Try the preferred order if present and supports generateContent
  for (const id of MODEL_FALLBACKS) {
    const methods = available.get(id);
    if (methods && (methods.has('generateContent') || methods.has('generate_content'))) {
      cachedWorkingModel = id;
      return id;
    }
  }
  // Fallback: pick the first model that supports generateContent
  for (const [id, methods] of available.entries()) {
    if (methods && (methods.has('generateContent') || methods.has('generate_content'))) {
      cachedWorkingModel = id;
      return id;
    }
  }
  throw new Error('No available Gemini model that supports generateContent for this key. Check API access or quotas.');
}

export async function getModel(model) {
  const id = await resolveModel(model);
  return genAI.getGenerativeModel({ model: id });
}

// One-shot helper with automatic fallback
export async function generateText(prompt, modelName) {
  const model = await getModel(modelName);
  const res = await model.generateContent(prompt);
  return res.response.text();
}

// Streaming helper with automatic fallback
export async function streamText(prompt, onChunk, modelName) {
  const model = await getModel(modelName);
  const stream = await model.generateContentStream(prompt);
  for await (const chunk of stream.stream) {
    const text = chunk.text();
    if (text) onChunk(text);
  }
}

// Debug utility: list available models (call from a temporary button / console)
export async function listAvailableModels(throwOnError = false) {
  try {
    const res = await fetch('https://generativelanguage.googleapis.com/v1beta/models?key=' + apiKey);
    if (!res.ok) {
      const text = await res.text().catch(() => '');
      const err = new Error('ListModels failed: ' + res.status + ' ' + text);
      if (throwOnError) throw err; else { console.error(err); return []; }
    }
    const data = await res.json();
    return data.models || [];
  } catch (e) {
    if (throwOnError) throw e;
    console.error('listAvailableModels error', e);
    return [];
  }
}