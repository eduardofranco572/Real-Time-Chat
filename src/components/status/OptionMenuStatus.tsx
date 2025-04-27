import React, { useState } from 'react';
import Swal from 'sweetalert2';
import { SlOptionsVertical } from 'react-icons/sl';
import { IoClose } from 'react-icons/io5';

interface OptionMenuStatusProps {
  canDelete?: boolean;
  handleDelete: () => void;
  onClose: () => void;
  toggleMute: () => void;
  isMuted: boolean;
}

const OptionMenuStatus: React.FC<OptionMenuStatusProps> = ({
  canDelete,
  handleDelete,
  onClose,
  toggleMute,
  isMuted
}) => {
  const [isOptionsOpen, setIsOptionsOpen] = useState(false);

  const toggleOptions = () => setIsOptionsOpen(prev => !prev);

  const confirmDelete = () => {
    Swal.fire({
      title: 'Tem certeza?',
      text: 'Este status será excluído permanentemente.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sim, excluir!',
      cancelButtonText: 'Cancelar',

      buttonsStyling: false,
      customClass: {
        popup: 'swal-custom-popup',
        title: 'swal-custom-title',
        htmlContainer: 'swal-custom-content',
        confirmButton: 'swal-btn-confirm',
        cancelButton: 'swal-btn-cancel'
      }

    }).then(result => {
      if (result.isConfirmed) {
        handleDelete();
      }
    });
        
  };

  return (
    <div className="optionMenuContainer" style={{ position: 'relative' }}>
      <div className="optionMenuStatus">
        <SlOptionsVertical onClick={toggleOptions} className="iconeOptions" />
        <button onClick={onClose} className="btnCloseStatus">
          <IoClose />
        </button>
      </div>

      {isOptionsOpen && (
        <div className="menuCardOptions">
          <div className="alingItensMenu">
            {canDelete && (
              <button
                onClick={confirmDelete}
                className="btnDeleteStatus"
              >
                Excluir
              </button>
            )}
            <button
              onClick={toggleMute}
              className="btnSilenciarStatus"
            >
              {isMuted ? 'Ativar Som' : 'Silenciar'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default OptionMenuStatus;
