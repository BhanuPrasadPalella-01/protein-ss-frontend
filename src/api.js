// Base URL of the prediction API. Set VITE_API_URL (e.g. in .env.local) to point
// the app at a local backend such as http://localhost:8000.
export const API_URL = import.meta.env.VITE_API_URL ?? 'https://protein-ss-backend.onrender.com'

// GET a JSON endpoint. Throws an Error with a readable message: the API's own
// `detail` for 4xx/5xx responses, or a connection hint when the server can't be reached.
export async function getJSON(path, signal) {
  let res
  try {
    res = await fetch(`${API_URL}${path}`, { signal })
  } catch (err) {
    if (err.name === 'AbortError') throw err
    throw new Error("Couldn't reach the prediction server. Check your connection and try again.", { cause: err })
  }
  const data = await res.json().catch(() => null)
  if (!res.ok) throw new Error(typeof data?.detail === 'string' ? data.detail : `Server error (${res.status}). Please try again.`)
  return data
}
