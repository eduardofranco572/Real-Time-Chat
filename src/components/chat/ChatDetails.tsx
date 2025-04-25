import React, { useState, useRef, useEffect } from 'react'
import Select, { MultiValue } from 'react-select'
import { IoMdClose, IoMdExit, IoMdPersonAdd } from 'react-icons/io'
import { MdEdit, MdCheck } from 'react-icons/md'
import TextareaAutosize from 'react-textarea-autosize'
import ReadMore from '../ReadMore'
import GroupMembersList from '../GroupMembersList'
import ProfileImageEditor from '../ProfileImageEditor'
import useUserId from '../../hooks/useUserId'
import useContacts from '../../hooks/useContacts'
import useGroupData, { GroupData } from '../../hooks/useGroupData'
import { OneToOneInfo, GroupInfo } from '../../hooks/chatHooks/useChatInfo'
import AddMembersModal from './AddMembers'
import Swal from 'sweetalert2'
import 'sweetalert2/dist/sweetalert2.css'

interface ContactOption {
  value: number
  label: string
  avatar: string
}

interface ChatDetailsProps {
  chatInfo: OneToOneInfo | GroupInfo
  groupData: GroupData
  selectedChatIsGroup: boolean
  isEditingName: boolean
  nameValue: string
  onNameChange: (val: string) => void
  onToggleEditName: () => void
  isEditingDesc: boolean
  descValue: string
  onDescChange: (val: string) => void
  onToggleEditDesc: () => void
  onHideDetails: () => void
  updateGroupData: (args: { descricaoGrupo?: string; nomeGrupo?: string; imageFile?: File }) => Promise<void>
}

const ChatDetails: React.FC<ChatDetailsProps> = ({
  chatInfo,
  groupData,
  selectedChatIsGroup,
  isEditingName,
  nameValue,
  onNameChange,
  onToggleEditName,
  isEditingDesc,
  descValue,
  onDescChange,
  onToggleEditDesc,
  onHideDetails,
  updateGroupData,
}) => {
  const idUser = useUserId()
  const { items: contacts } = useContacts(idUser)
  const { addParticipants, leaveGroup } = useGroupData((chatInfo as GroupInfo).id)

  // File/image
  const [showImageEditor, setShowImageEditor] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string>('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Add-membros
  const [addingOpen, setAddingOpen] = useState(false)
  const [selectedOptions, setSelectedOptions] = useState<MultiValue<ContactOption>>([])

  // Opções de contatos
  const memberIds = selectedChatIsGroup ? (chatInfo as GroupInfo).members.map(m => m.id) : []
  const options: ContactOption[] = contacts
    .filter(c => !c.isGroup && !memberIds.includes(c.id))
    .map(c => ({ value: c.id, label: c.nome, avatar: c.imageUrl }))

  // image upload handlers...
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setSelectedFile(file)
    setPreviewUrl(URL.createObjectURL(file))
    setShowImageEditor(true)
  }
  const handleImageClick = () => fileInputRef.current?.click()
  useEffect(() => () => { if (previewUrl) URL.revokeObjectURL(previewUrl) }, [previewUrl])
  const handleSaveCropped = async (file: File) => {
    await updateGroupData({ imageFile: file })
    setShowImageEditor(false)
    setSelectedFile(null)
  }

  // adicionar membros
  const openAdd = () => setAddingOpen(true)
  const closeAdd = () => { setAddingOpen(false); setSelectedOptions([]) }
  const handleSaveMembers = async () => {
    const ids = selectedOptions.map(o => o.value)
    if (ids.length === 0) return
    try {
      await addParticipants(ids)
      closeAdd()
    } catch (err) {
      console.error('Erro ao adicionar membros:', err)
    }
  }

  // membro sair do grupo
  const handleConfirmLeave = () => {
    Swal.fire({
      title: 'Você tem certeza?',
      text: 'Ao sair, você não receberá mais mensagens deste grupo.',
      icon: 'warning',
    
      showCancelButton: true,
      confirmButtonText: 'Sim, sair',
      cancelButtonText: 'Cancelar',
    
      buttonsStyling: false,
      customClass: {
        popup: 'swal-custom-popup',
        title: 'swal-custom-title',
        htmlContainer: 'swal-custom-content',
        confirmButton: 'swal-btn-confirm',
        cancelButton: 'swal-btn-cancel'
      }
    }).then(async result => {
      if (result.isConfirmed) {
        await handleLeave()
      }
    })
  }
  
  const handleLeave = async () => {
    if (!idUser) return
    try {
      await leaveGroup(idUser)
      Swal.fire('Saído', 'Você saiu do grupo com sucesso.', 'success')
      onHideDetails()
    } catch (err) {
      console.error('Erro ao sair do grupo:', err)
      Swal.fire('Erro', 'Não foi possível sair do grupo.', 'error')
    }
  }

  return (
    <>
      {showImageEditor && selectedFile && (
        <ProfileImageEditor
          image={previewUrl}
          onSave={handleSaveCropped}
          onCancel={() => { setShowImageEditor(false); setSelectedFile(null) }}
        />
      )}

      <div className="DadosContato">
        <div className="bodyDC">
          <div className="headerDC">
            <h1>Dados do Chat</h1>
            <button onClick={onHideDetails}><IoMdClose /></button>
          </div>

          <div className="infosDC">
            <div className="containerDC">
              <div className="detalhesUser">
                <img
                  src={selectedChatIsGroup ? groupData.imgUrl : chatInfo.imageUrl}
                  alt={chatInfo.nome}
                  onClick={selectedChatIsGroup ? handleImageClick : undefined}
                />
                <input
                  type="file"
                  accept="image/*"
                  ref={fileInputRef}
                  style={{ display: 'none' }}
                  onChange={handleFileChange}
                />

                <div className="alinhaNome">
                  {isEditingName ? (
                    <input
                      type="text"
                      value={nameValue}
                      onChange={e => onNameChange(e.target.value)}
                      className="input-edit"
                      autoFocus
                    />
                  ) : (
                    <h1>{selectedChatIsGroup ? groupData.nome : chatInfo.nome}</h1>
                  )}
                  {selectedChatIsGroup && (
                    <button onClick={onToggleEditName}>
                      {isEditingName ? <MdCheck /> : <MdEdit />}
                    </button>
                  )}
                </div>

                {'email' in chatInfo && !selectedChatIsGroup ? (
                  <p>{chatInfo.email}</p>
                ) : selectedChatIsGroup ? (
                  <div className="group-description-container">
                    <div className="barraDivisao" />
                    <div className="alinhaGroupDesc">
                      {isEditingDesc ? (
                        <TextareaAutosize
                          autoFocus
                          minRows={4}
                          value={descValue}
                          onChange={e => onDescChange(e.target.value)}
                          className="textarea-edit"
                        />
                      ) : (
                        <ReadMore text={groupData.descricaoGrupo} initialLines={4} />
                      )}
                      <button onClick={onToggleEditDesc}>
                        {isEditingDesc ? <MdCheck /> : <MdEdit />}
                      </button>
                    </div>
                  </div>
                ) : (
                  <p>{chatInfo.descricao}</p>
                )}
              </div>

              <div className="barraDivisao" />

              {selectedChatIsGroup && (
                <>
                  <GroupMembersList
                    members={(chatInfo as GroupInfo).members}
                    onAddMember={openAdd}
                  />
                  <div className="barraDivisao" />

                  <div className="OpcoesUserGrupo" onClick={handleConfirmLeave}>
                    <IoMdExit />
                    <h1>Sair do Grupo</h1>
                  </div>
                </>
              )}

              <AddMembersModal
                open={addingOpen}
                onClose={closeAdd}
                options={options}
                value={selectedOptions}
                onChange={setSelectedOptions}
                onSave={handleSaveMembers}
              />
            </div>
          </div>
        </div>   
      </div>
    </>
  )
}

export default ChatDetails;