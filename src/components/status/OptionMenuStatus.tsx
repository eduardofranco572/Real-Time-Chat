import React, { useState } from 'react';
import { SlOptionsVertical } from 'react-icons/sl';
import { IoClose } from 'react-icons/io5';

interface OptionMenuStatusProps {
    canDelete?: boolean;
    handleDelete: () => void;
    onClose: () => void;
}
  
const OptionMenuStatus: React.FC<OptionMenuStatusProps> = ({ canDelete, handleDelete, onClose }) => {
  const [isOptionsOpen, setIsOptionsOpen] = useState(false);

  const toggleOptions = () => {
    setIsOptionsOpen((prev) => !prev);
  };

  return (
    <div className="optionMenuContainer" style={{ position: 'relative' }}>
      <div className="optionMenuStatus">
        <SlOptionsVertical onClick={toggleOptions} className='iconeOptions' />
        <button onClick={onClose} className='btnCloseStatus'>
          <IoClose />
        </button>
      </div>

      {isOptionsOpen && (
        <div className="menuCardOptions">
            <div className='alingItensMenu'>
                {canDelete && (
                <button onClick={handleDelete} className="btnDeleteStatus">
                    Excluir
                </button>
                )}
                <button className="btnSilenciarStatus">
                    Silenciar
                </button>
            </div>
        </div>
      )}
    </div>
  );
};

export default OptionMenuStatus;
