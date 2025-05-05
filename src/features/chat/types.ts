export interface Message {
    id: number
    idChat: number
    idUser: number
    mensagem: string
    link: boolean
    createdAt: string
    replyTo?: number | null
    nomeContato?: string
    mediaUrl?: string
    nomeDocs?: string
    imageUrl?: string
}
  
export interface UserInfo {
    id: number
    nome: string
    imageUrl: string
}

export interface OneToOneInfo {
    id: number
    nome: string
    descricao: string
    imageUrl: string
    isGroup: false
    email: string
}

export interface GroupInfo {
    id: number
    nome: string
    descricao: string
    imageUrl: string
    isGroup: true
    members: UserInfo[]
}
  
export type ChatInfo = OneToOneInfo | GroupInfo
  