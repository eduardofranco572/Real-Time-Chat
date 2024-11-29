import React, { useState} from 'react';
import { IoMdClose } from "react-icons/io";

interface StatusUploaderProps {
    onSaveStatus: (file: File, caption: string) => void; 
    onClose: () => void;
    uploadedImage: File | null;
}
  
const StatusUploader: React.FC<StatusUploaderProps> = ({ onSaveStatus, onClose, uploadedImage }) => {
    const [caption, setCaption] = useState<string>(''); 
  
    const handleSave = () => {
      if (uploadedImage) {
        onSaveStatus(uploadedImage, caption);
      }
    };
  
    return (
      <div className="statusUploaderOverlay">
        <div className="statusUploader">
          <div className="BtnCloseSU">
            <button onClick={onClose}><IoMdClose /></button>
          </div>
  
          {uploadedImage && (
            <div className="imagePreview">
              <img src={URL.createObjectURL(uploadedImage)} alt="Pré-visualização do Status" />
              <div className='legenda'>
                <input
                  className="inputinfos"
                  type="text"
                  name="nome"
                  placeholder="Digite uma legenda"
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)} 
                />
              </div>
            </div>
          )}
  
          <div className="btnPostar">
            <button onClick={handleSave}>Salvar</button>
          </div>
        </div>
      </div>
    );
  };
  

export default StatusUploader;
