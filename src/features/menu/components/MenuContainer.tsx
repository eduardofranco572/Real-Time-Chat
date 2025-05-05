import React, {
  useState,
  useCallback,
  lazy,
  Suspense,
  useEffect,
  FormEvent,
} from 'react'
import io from 'socket.io-client'
import Skeleton from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'
import { API_URL } from '../../../config'

import useUserId     from '../../../hooks/useUserId'
import useUserInfo   from '../../../hooks/useUserInfo'
import useContacts   from '../../../hooks/useContacts'
import useUserStatus from '../../menu/hooks/useUserStatus'
import useSaveStatus from '../../menu/hooks/useSaveStatus'
import useAddContact from '../../menu/hooks/useAddContact'
import useAddGroup   from '../../menu/hooks/useAddGroup'

import PrincipalMenu from './PrincipalMenu'
import StatusSection from './StatusSection'
import AccountSection from './AccountSection'

const socket = io(API_URL)

export interface MenuContainerProps {
  onSelectContact: (chatId: number, isGroup: boolean) => void
}

const MenuContainer: React.FC<MenuContainerProps> = ({ onSelectContact }) => {
  const [menuState, setMenuState] = useState<'principal' | 'status' | 'account'>(
    'principal'
  )

  //estados do formulário de adicionar
  const [formType, setFormType] = useState<'contact' | 'group' | null>(null)
  const [email, setEmail] = useState('')
  const [nome, setNome] = useState('')
  const [groupName, setGroupName] = useState('')

  //estados do uploader de status
  const [uploaderVisible, setUploaderVisible] = useState(false)
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)

  //hooks de dados
  const idUser = useUserId()
  const userInfo = useUserInfo(idUser)
  const { items, fetchContacts } = useContacts(idUser)

  const statusImage = useUserStatus(idUser, menuState === 'status')
  const { saveStatus } = useSaveStatus(idUser)

  const addContact = useAddContact(idUser, fetchContacts)
  const { addGroup } = useAddGroup(idUser)

  // atualiza contatos em novas mensagens
  useEffect(() => {
    const onNewMsg = () => fetchContacts()
    socket.on('newMessage', onNewMsg)
    return () => void socket.off('newMessage', onNewMsg)
  }, [fetchContacts])

  //handlers de formulário
  const handleSubmit = useCallback(
    async (e: FormEvent) => {
      e.preventDefault()
      await addContact(email, nome)
      setEmail('')
      setNome('')
      setFormType(null)
    },
    [email, nome, addContact]
  )

  const handleSubmitGroup = useCallback(
    async (e: FormEvent, imageFile?: File, participantIds?: number[]) => {
      e.preventDefault()
      await addGroup(groupName, imageFile, participantIds || [])
      setGroupName('')
      setFormType(null)
    },
    [groupName, addGroup]
  )

  //handlers de status
  const handleImageUpload = (file: File) => {
    setUploadedFile(file)
    setUploaderVisible(true)
  }
  const handleSaveStatus = async (file: File, caption: string) => {
    await saveStatus(file, caption)
    setUploaderVisible(false)
  }

  return (
    <>
      {formType && (
        <PrincipalMenu.AddContactForm
          mode={formType}
          onClose={() => setFormType(null)}
          onSubmitContact={handleSubmit}
          onSubmitGroup={handleSubmitGroup}
          email={email}
          setEmail={setEmail}
          nome={nome}
          setNome={setNome}
          groupName={groupName}
          setGroupName={setGroupName}
        />
      )}

      {uploaderVisible && (
        <Suspense fallback={<Skeleton height={200} />}>
          <StatusSection.Uploader
            uploadedMedia={uploadedFile!}
            onSaveStatus={handleSaveStatus}
            onClose={() => setUploaderVisible(false)}
          />
        </Suspense>
      )}

      {menuState === 'status' && (
        <StatusSection
          onBack={() => setMenuState('principal')}
          onFileSelect={handleImageUpload}
        />
      )}

      {menuState === 'account' && (
        <AccountSection onBack={() => setMenuState('principal')} />
      )}

      {menuState === 'principal' && (
        <PrincipalMenu
          userInfo={userInfo}
          contacts={items}
          onSelectContact={onSelectContact}
          onShowStatus={() => setMenuState('status')}
          onShowAccount={() => setMenuState('account')}
          onNewContact={() => setFormType('contact')}
          onNewGroup={() => setFormType('group')}
        />
      )}
    </>
  )
}

export default MenuContainer
