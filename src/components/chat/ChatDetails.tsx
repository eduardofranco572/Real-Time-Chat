import React, { useState, useRef, useEffect } from 'react';
import { IoMdClose, IoMdExit } from 'react-icons/io';
import { MdEdit, MdCheck } from 'react-icons/md';
import TextareaAutosize from 'react-textarea-autosize';
import ReadMore from '../ReadMore';
import GroupMembersList from '../GroupMembersList';
import ProfileImageEditor from '../ProfileImageEditor';
import { OneToOneInfo, GroupInfo } from '../../hooks/chatHooks/useChatInfo';
import { GroupData } from '../../hooks/useGroupData';

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
  updateGroupData: (args: { descricaoGrupo?: string; nomeGrupo?: string; imageFile?: File }) => Promise<void>;
}

export default function ChatDetails({
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
}: ChatDetailsProps) {
  const [showImageEditor, setShowImageEditor] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log('handleFileChange – arquivo selecionado:', e.target.files);
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setShowImageEditor(true);
  };

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  useEffect(() => {
    return () => { 
      if (previewUrl){
        URL.revokeObjectURL(previewUrl); 
      } 
    };
  }, [previewUrl]);

  const handleSaveCropped = async (file: File) => {
    await updateGroupData({ imageFile: file });
    setShowImageEditor(false);
    setSelectedFile(null);
  };

  return (
    <>
      {showImageEditor && selectedFile && (
        <ProfileImageEditor
          image={previewUrl}
          onSave={handleSaveCropped}
          onCancel={() => {
            setShowImageEditor(false);
            setSelectedFile(null);
          }}
        />
      )}

      <div className="DadosContato">
        <div className="bodyDC">
          <div className="headerDC">
            <h1>Dados do Chat</h1>
            <button onClick={onHideDetails}>
              <IoMdClose />
            </button>
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
                        <ReadMore
                          text={groupData.descricaoGrupo}
                          initialLines={4}
                        />
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
                  <GroupMembersList members={(chatInfo as GroupInfo).members} />
                  <div className="barraDivisao" />
                  <div className="OpcoesUserGrupo">
                    <IoMdExit />
                    <h1>Sair do Grupo</h1>
                  </div>
                </>
              )}

            </div>
          </div>
        </div>
      </div>
    </>
    
  )
}