import React, { FormEvent, useState } from 'react';
import { IoMdClose } from 'react-icons/io';

interface EditMessagePopupProps {
  initialMessage: string;
  onSave: (newMessage: string) => void;
  onClose: () => void;
}

const EditMessagePopup: React.FC<EditMessagePopupProps> = ({
  initialMessage,
  onSave,
  onClose,
}) => {
  const [message, setMessage] = useState(initialMessage);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (message.trim() === '') return; 
    onSave(message);
  };

  return (
    <section className="popUpEditar">
      <div className="itensPopUpEditar">
        <div className="headerPopUp">
          <h1>Editar Mensagem</h1>
          <div className="btnClose">
            <button onClick={onClose}>
              <IoMdClose />
            </button>
          </div>
        </div>
        <div className="barraPopup">
          <span></span>
        </div>
        <form className="formPopUpEditar" onSubmit={handleSubmit}>
          <div className="elementosFormPopUp">
            <input
              className="inputPopUp"
              type="text"
              name="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Digite a nova mensagem"
            />
          </div>
          <div className="btnsPopUp">
            <button type="submit" className="btnSalvar">
              Editar
            </button>
          </div>
        </form>
      </div>
    </section>
  );
};

export default EditMessagePopup;
