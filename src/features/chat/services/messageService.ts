import { API_URL } from '../../../config'

export async function deleteMessage(id: number) {
  const res = await fetch(`${API_URL}/api/chat/excluirMensagem`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id })
  })
  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.error || 'Erro ao excluir mensagem')
  }
}

export async function editMessage(id: number, message: string) {
  const res = await fetch(`${API_URL}/api/chat/editarMensagem`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id, message })
  })
  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.error || 'Erro ao editar mensagem')
  }
}
