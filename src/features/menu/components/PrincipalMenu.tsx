import React, { useState } from 'react'
import { IoSearchOutline } from 'react-icons/io5'
import { IoIosAddCircle } from 'react-icons/io'
import useUserInfo from '../../../hooks/useUserInfo'
import ContactForm from '../../ContactForm'
import ContactList from '../../ContactList'
import UserInfo from '../../UserInfo'

export interface PrincipalMenuProps {
  userInfo: ReturnType<typeof useUserInfo>
  contacts: Array<{
    id: number
    nome: string
    isGroup: boolean
    imageUrl?: string
    chatId: number
    mensagem?: string 
    mediaUrl?: string  
    lastMessageAt?: string 
    lastSenderName?: string  
  }>
  onSelectContact: (chatId: number, isGroup: boolean) => void
  onShowStatus: () => void
  onShowAccount: () => void
  onNewContact: () => void
  onNewGroup: () => void
}

const PrincipalMenu: React.FC<PrincipalMenuProps> & {
  AddContactForm: typeof ContactForm
} = ({
  userInfo,
  contacts,
  onSelectContact,
  onShowStatus,
  onShowAccount,
  onNewContact,
  onNewGroup,
}) => {
  const [search, setSearch] = useState('')
  const [showAdd, setShowAdd] = useState(false)

  // converte para ChatItem[]
  const chatItems = contacts
  .filter(c => c.nome.toLowerCase().includes(search.toLowerCase()))
  .map(c => ({
    id: c.id,
    nome: c.nome,
    imageUrl: c.imageUrl || '',
    mensagem: c.mensagem,       
    mediaUrl: c.mediaUrl,       
    lastMessageAt: c.lastMessageAt,  
    chatId: c.chatId,
    isGroup: c.isGroup,
    lastSenderName: c.lastSenderName || userInfo?.nome || '',
  }))

  return (
    <div className="principalMenu">
      <div className="containerMenu">
        <UserInfo
          userInfo={userInfo}
          onStatusClick={onShowStatus}
          onAccountClick={onShowAccount}
        />

        <div className="search">
          <div className="filter">
            <IoSearchOutline />
            <input
              className="inputSearch"
              type="text"
              placeholder="Pesquisar"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>

        <ContactList
          items={chatItems}
          currentUserName={userInfo?.nome || ''}
          onOpenChat={(chatId, isGroup) => {
            onSelectContact(chatId, isGroup);
          }}
        />
      </div>
     
      <div className="footerMenu">
        {showAdd && (
          <div className="add-options-card optionsAddMenu">
            <button onClick={onNewContact}>Adicionar Contato</button>
            <button onClick={onNewGroup}>Adicionar Grupo</button>
          </div>
        )}
        
        <span>
          <IoIosAddCircle onClick={() => setShowAdd(v => !v)} />
        </span>
      </div>
    </div>
  )
}

// anexa o ContactForm como sub-componente
PrincipalMenu.AddContactForm = ContactForm

export default PrincipalMenu
