import React, { useState, useRef, useEffect } from 'react'
import Select, { MultiValue } from 'react-select'
import { IoMdClose, IoMdExit } from 'react-icons/io'
import { MdEdit, MdCheck } from 'react-icons/md'
import TextareaAutosize from 'react-textarea-autosize'
import Swal from 'sweetalert2'
import 'sweetalert2/dist/sweetalert2.css'

import ReadMore from '../Messages/ReadMore'
import AddMembersModal from '../Members/AddMembers'
import ProfileImageEditor from '../../../ProfileImageEditor'
import useUserId from '../../../../hooks/useUserId'
import useContacts from '../../../../hooks/useContacts'
import useGroupData from '../../../../hooks/useGroupData'
import { ChatInfo, GroupInfo, OneToOneInfo } from '../../types'
import GroupMembersList, { Member } from '../Members/GroupMembersList'

interface ContactOption {
  value: number
  label: string
  avatar: string
}

interface ChatDetailsProps {
  isOpen: boolean
  isGroup: boolean
  chatInfo: ChatInfo
  onClose: () => void
}

const ChatDetails: React.FC<ChatDetailsProps> = ({
  isOpen,
  isGroup,
  chatInfo,
  onClose
}) => {
  if (!isOpen) return null

  const idUser = useUserId()
  const oneToOne = !isGroup

  // hooks de grupo
  const groupId = isGroup ? (chatInfo as GroupInfo).id : undefined
  const { items: contacts } = useContacts(idUser)
  const {
    groupData,
    addParticipants,
    leaveGroup,
    updateGroupData
  } = useGroupData(groupId, isGroup)

  // valores de exibição
  const displayName = isGroup
    ? groupData.nome || chatInfo.nome
    : chatInfo.nome

  const displayDesc = isGroup
    ? groupData.descricao
    : (chatInfo as OneToOneInfo).descricao

  const displayImageUrl = isGroup
    ? groupData.imageUrl
    : chatInfo.imageUrl

  const members: Member[] = isGroup
    ? (groupData.members || [])
    : []

  // estados de edição
  const [isEditingName, setIsEditingName] = useState(false)
  const [nameValue, setNameValue] = useState(displayName)
  const [isEditingDesc, setIsEditingDesc] = useState(false)
  const [descValue, setDescValue] = useState(displayDesc)

  // edição de imagem
  const [showImageEditor, setShowImageEditor] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string>('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  // adicionar membros
  const [addingOpen, setAddingOpen] = useState(false)
  const [selectedOptions, setSelectedOptions] =
    useState<MultiValue<ContactOption>>([])

  useEffect(() => {
    setNameValue(displayName)
    setDescValue(displayDesc)
  }, [displayName, displayDesc])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setSelectedFile(file)
    setPreviewUrl(URL.createObjectURL(file))
    setShowImageEditor(true)
  }
  const handleImageClick = () => fileInputRef.current?.click()
  useEffect(
    () => () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl)
    },
    [previewUrl]
  )
  const handleSaveCropped = async (file: File) => {
    await updateGroupData({ imageFile: file })
    setShowImageEditor(false)
    setSelectedFile(null)
  }

  const toggleEditName = async () => {
    if (isEditingName && nameValue !== displayName) {
      await updateGroupData({ nomeGrupo: nameValue })
    }
    setIsEditingName(v => !v)
  }

  const toggleEditDesc = async () => {
    if (isEditingDesc && descValue !== displayDesc) {
      await updateGroupData({ descricaoGrupo: descValue })
    }
    setIsEditingDesc(v => !v)
  }

  // opções de contatos para adicionar ao grupo
  const memberIds = members.map(m => m.id)
  const options: ContactOption[] = contacts
    .filter(c => !c.isGroup && !memberIds.includes(c.id))
    .map(c => ({ value: c.id, label: c.nome, avatar: c.imageUrl }))

  const openAdd = () => setAddingOpen(true)
  const closeAdd = () => {
    setAddingOpen(false)
    setSelectedOptions([])
  }
  const handleSaveMembers = async () => {
    const ids = selectedOptions.map(o => o.value)
    if (ids.length === 0) return
    await addParticipants(ids)
    closeAdd()
  }

  // confirma saída do grupo
  const MySwal = Swal.mixin({
    buttonsStyling: false,
    customClass: {
      popup: 'swal-custom-popup',
      title: 'swal-custom-title',
      htmlContainer: 'swal-custom-content',
      confirmButton: 'swal-btn-confirm',
      cancelButton: 'swal-btn-cancel'
    }
  });
  
  const confirmLeave = () => {
    MySwal.fire({
      title: 'Você tem certeza?',
      text: 'Ao sair, você não receberá mais mensagens deste grupo.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sim, sair',
      cancelButtonText: 'Cancelar'
    }).then(async result => {
      if (result.isConfirmed && idUser) {
        await leaveGroup(idUser);
        await MySwal.fire({
          title: 'Saído',
          text: 'Você saiu do grupo com sucesso.',
          icon: 'success',
          confirmButtonText: 'OK'
        });
        onClose();
      }
    });
  };

  return (
    <>
      {showImageEditor && selectedFile && (
        <ProfileImageEditor
          image={previewUrl}
          onSave={handleSaveCropped}
          onCancel={() => {
            setShowImageEditor(false)
            setSelectedFile(null)
          }}
        />
      )}

      <div className="DadosContato">
        <div className="bodyDC">
          <div className="headerDC">
            <h1>Dados do Chat</h1>
            <button onClick={onClose}>
              <IoMdClose />
            </button>
          </div>

          <div className="infosDC">
            <div className="containerDC">
              <div className="detalhesUser">
                <img
                  src={displayImageUrl}
                  alt={displayName}
                  onClick={isGroup ? handleImageClick : undefined}
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
                      onChange={e => setNameValue(e.target.value)}
                      className="input-edit"
                      autoFocus
                    />
                  ) : (
                    <h1>{displayName}</h1>
                  )}
                  {isGroup && (
                    <button onClick={toggleEditName}>
                      {isEditingName ? <MdCheck /> : <MdEdit />}
                    </button>
                  )}
                </div>

                {oneToOne ? (
                  <p>{(chatInfo as OneToOneInfo).email}</p>
                ) : (
                  <div className="group-description-container">
                    <div className="barraDivisao" />
                    <div className="alinhaGroupDesc">
                      {isEditingDesc ? (
                        <TextareaAutosize
                          autoFocus
                          minRows={4}
                          value={descValue}
                          onChange={e => setDescValue(e.target.value)}
                          className="textarea-edit"
                        />
                      ) : (
                        <ReadMore
                          text={displayDesc}
                          initialLines={4}
                        />
                      )}
                      <button onClick={toggleEditDesc}>
                        {isEditingDesc ? <MdCheck /> : <MdEdit />}
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div className="barraDivisao" />

              {isGroup && (
                <>
                  <GroupMembersList
                    members={members}
                    onAddMember={openAdd}
                  />
                  <div className="barraDivisao" />

                  <div
                    className="OpcoesUserGrupo"
                    onClick={confirmLeave}
                  >
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

export default ChatDetails
