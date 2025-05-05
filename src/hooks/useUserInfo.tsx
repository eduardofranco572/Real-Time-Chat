import { useState, useEffect } from 'react'
import { getUserDataService, UserData } from '../services/userService'

const defaultImage = '/assets/img/iconePadrao.svg'
const defaultDesc = 'Mensagem Padrão'

const useUserInfo = (idUser: number | string | null): UserData => {
  const [userInfo, setUserInfo] = useState<UserData>({
    nome: '',
    descricao: defaultDesc,
    imageUrl: defaultImage
  })

  useEffect(() => {
    async function fetchUserInfo() {
      if (!idUser) return

      try {
        const data = await getUserDataService(idUser.toString())
        setUserInfo({
          nome: data.nome,
          descricao: data.descricao || defaultDesc,
          imageUrl: data.imageUrl || defaultImage
        })
      } catch (error) {
        console.error('Erro ao buscar informações do usuário:', error)
      }
    }
    fetchUserInfo()
  }, [idUser])

  return userInfo
}

export default useUserInfo