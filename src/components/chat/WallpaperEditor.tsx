import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { IoCloseOutline } from 'react-icons/io5';

interface WallpaperEditorProps {
  onSave: (url: string) => void;
  onCancel: () => void;
}

const WallpaperEditor: React.FC<WallpaperEditorProps> = ({ onSave, onCancel }) => {
  const [inputUrl, setInputUrl] = useState('');

  const handleSave = () => {
    const trimmed = inputUrl.trim();
    if (trimmed) {
      onSave(trimmed);
    }
  };

  const modal = (
    <section className="wallpaper-editor-modal">
      <div className="wallpaper-editor-content">
        <button className="close-btn" onClick={onCancel}>
          <IoCloseOutline size={24} />
        </button>
        <h1 className='titleWec'>Selecionar Papel de Parede</h1>
        <input
          type="text"
          placeholder="Cole a URL da imagem"
          value={inputUrl}
          onChange={e => setInputUrl(e.target.value)}
        />
        <button className="save-btn" onClick={handleSave}>
          Salvar
        </button>
      </div>
    </section>
  );

  return createPortal(modal, document.body);
};

export default WallpaperEditor;
