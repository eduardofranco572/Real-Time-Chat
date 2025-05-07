import React, { useState, useEffect } from 'react';
import { IoMdClose } from 'react-icons/io';

interface StatusUploaderProps {
  onSaveStatus: (file: File, caption: string) => void;
  onClose: () => void;
  uploadedMedia: File | null;
}

const StatusUploader: React.FC<StatusUploaderProps> = ({
  onSaveStatus,
  onClose,
  uploadedMedia,
}) => {
  const [caption, setCaption] = useState('');
  const [mediaURL, setMediaURL] = useState<string | null>(null);

  useEffect(() => {
    if (uploadedMedia) {
      const url = URL.createObjectURL(uploadedMedia);
      setMediaURL(url);
      return () => {
        URL.revokeObjectURL(url);
        setMediaURL(null);
      };
    }
  }, [uploadedMedia]);

  const handleSave = () => {
    if (uploadedMedia) {
      onSaveStatus(uploadedMedia, caption);
    } else {
      alert('Nenhum arquivo foi selecionado!');
    }
  };

  return (
    <div className="statusUploaderOverlay">
      <div className="statusUploader">
        <div className="BtnCloseSU">
          <button onClick={onClose}>
            <IoMdClose />
          </button>
        </div>

        {mediaURL && (
          <div className="mediaPreview">
            {uploadedMedia!.type.startsWith('video/') ? (
              <video controls src={mediaURL} />
            ) : (
              <img
                src={mediaURL}
                alt="Pré-visualização do Status"
              />
            )}
          </div>
        )}

        <div className="legenda">
          <input
            className="inputinfos"
            type="text"
            placeholder="Digite uma legenda"
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
          />
        </div>
        <div className="btnPostar">
          <button onClick={handleSave}>Postar</button>
        </div>
      </div>
    </div>
  );
};

export default StatusUploader;
