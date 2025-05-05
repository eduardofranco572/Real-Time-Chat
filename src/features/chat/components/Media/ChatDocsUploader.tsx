import React, { useState, useEffect, useRef } from 'react';
import { IoMdClose } from 'react-icons/io';

import docs from '../../../../assets/img/docs.svg';

interface ChatDocsUploaderProps {
  onSendMedia: (file: File, caption: string) => void;
  onClose: () => void;
}

const ChatDocsUploader: React.FC<ChatDocsUploaderProps> = ({ onSendMedia, onClose }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [caption, setCaption] = useState<string>('');
  const inputRef = useRef<HTMLInputElement>(null);
  const autoClickedRef = useRef<boolean>(false);

  useEffect(() => {
    if (!selectedFile && inputRef.current && !autoClickedRef.current) {
      autoClickedRef.current = true;
      inputRef.current.click();
    }
  }, [selectedFile]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    } else {
      onClose();
    }
  };

  const handleSend = () => {
    if (selectedFile) {
      onSendMedia(selectedFile, caption);
      onClose();
    } else {
      alert("Nenhum arquivo selecionado!");
    }
  };

  return (
    <>
      <input
        type="file"
        accept=".pdf, .doc, .docx, .txt"
        ref={inputRef}
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />

      {selectedFile && (
        <div className="statusUploaderOverlay">
          <div className="statusUploader">
            <div className="BtnCloseSU">
              <button onClick={onClose}>
                <IoMdClose />
              </button>
            </div>
            <div className="mediaPreview">
              <img className='docsImg' src={docs} alt="Pré-visualização do documento" />
              <h1>{selectedFile.name}</h1>
            </div>
            <div className='alingFooterUploader'>
              <div className="legenda">
                <input
                  className="inputinfos"
                  type="text"
                  placeholder="Digite uma mensagem"
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                />
              </div>
              <div className="btnPostar">
                <button onClick={handleSend}>Enviar</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ChatDocsUploader;
