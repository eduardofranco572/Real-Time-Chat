import { useCallback } from 'react'
import { addContactService } from '../services/contactService'

export default function useAddContact(
  idUser: number | null,
  onSuccess: () => void
) {
  const addContact = useCallback(
    async (email: string, nome: string) => {
      if (!idUser) {
        alert('Usuário não autenticado')
        return
      }
      try {
        await addContactService({ idUser, email, nome })
        onSuccess()
      } catch (err: any) {
        alert('Erro: ' + (err.message || 'desconhecido'))
      }
    },
    [idUser, onSuccess]
  )

  return addContact
}
