import React from 'react';
import { IoMdClose } from 'react-icons/io';

interface ImageModalProps {
  imageUrl: string;
  onClose: () => void;
}

const ImageModal: React.FC<ImageModalProps> = ({ imageUrl, onClose }) => {
  return (
    <div className="image-modal-overlay" onClick={onClose}>
      <div className="image-modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="close-button" onClick={onClose}>
          <IoMdClose />
        </button>
        <img src={imageUrl} alt="Visualização Ampliada" />
      </div>
    </div>
  );
};

export default ImageModal;
