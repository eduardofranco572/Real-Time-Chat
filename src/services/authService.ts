import { API_URL } from '../config'

export async function fetchUserIdService(): Promise<number> {
  const res = await fetch(`${API_URL}/api/auth/protected`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
  })
  if (!res.ok) {
    throw new Error(`Falha ao obter ID do usuário: ${res.status}`)
  }
  const json = await res.json()
  return json.user
}
