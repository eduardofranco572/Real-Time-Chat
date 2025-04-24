import React, { useState, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import AvatarEditor from 'react-avatar-editor';
import { IoCloseOutline } from "react-icons/io5";

interface ProfileImageEditorProps {
    image: string;
    onSave: (file: File) => void;
    onCancel: () => void;
}

const ProfileImageEditor: React.FC<ProfileImageEditorProps> = ({ image, onSave, onCancel }) => {
    const [scale, setScale] = useState<number>(1);
    const editorRef = useRef<AvatarEditor>(null);

    const handleSaveImage = useCallback(() => {
    if (editorRef.current) {
        const canvas = editorRef.current.getImageScaledToCanvas();
        canvas.toBlob((blob) => {
        if (blob) {
            const file = new File([blob], "croppedImage.png", { type: blob.type });
            onSave(file);
        }
        }, 'image/png');
    }
    }, [onSave]);

    const modal = (
        <section className="cardEditImage">
            <div className='edtImage'>
                <div className="closed" onClick={onCancel}>
                    <IoCloseOutline size={24} />
                </div>

                <h1>Editar imagem</h1>
                <div className="imageforedit">
                    <AvatarEditor
                        ref={editorRef}
                        image={image}
                        width={300} 
                        height={300}
                        color={[28, 28, 28, 0.6]}
                        scale={scale}
                        borderRadius={150}
                    />
                </div>

                <input
                    type="range"
                    min="1"
                    max="2"
                    step="0.01"
                    value={scale}
                    onChange={(e) => setScale(parseFloat(e.target.value))}
                />

                <button className='brtsaveedimg' onClick={handleSaveImage}>Salvar imagem</button>
            </div>
        </section>
    );

    return createPortal(modal, document.body);
};

export default ProfileImageEditor;
