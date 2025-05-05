import { API_URL } from '../../../config'

export async function saveStatusService(
  idUser: number,
  file: File,
  caption: string
): Promise<void> {
  const form = new FormData()
  form.append('idAutor', String(idUser))
  form.append('mediaStatus', file)
  form.append('legenda', caption)

  const res = await fetch(`${API_URL}/api/status/salvarStatus`, {
    method: 'POST',
    body: form,
  })

  const json = await res.json()

  if (!res.ok) {
    throw new Error(json.error || 'Falha ao salvar status')
  }
}

export async function fetchUserStatusService(
  idUser: number
): Promise<string> {
  const res = await fetch(`${API_URL}/api/status/statusUsuario`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ idUser }),
  })

  const json = await res.json()

  if (!res.ok || json.message !== 'ok') {
    throw new Error(json.error || 'Falha ao buscar status')
  }
  
  return json.statusImage as string
}
