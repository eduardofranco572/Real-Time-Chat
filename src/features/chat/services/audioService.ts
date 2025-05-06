import { API_URL } from '../../../config'

export interface UploadAudioParams {
  chatId: number
  userId: number
  file: File
}

export async function uploadAudio({ chatId, userId, file }: UploadAudioParams) {
  const form = new FormData()
  form.append('idChat', String(chatId))
  form.append('idUser', String(userId))
  form.append('audio', file)

  const res = await fetch(`${API_URL}/api/chat/uploadAudio`, {
    method: 'POST',
    body: form
  })

  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.error || 'Erro ao enviar áudio')
  }

  return res.json()
}
