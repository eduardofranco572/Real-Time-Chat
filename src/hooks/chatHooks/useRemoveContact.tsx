import { useState, useCallback } from 'react';
import Swal from 'sweetalert2';
import 'sweetalert2/dist/sweetalert2.min.css';
import { API_URL } from '../../config';

interface UseRemoveContactReturn {
  removeContact: (idUser: number, idContato: number) => Promise<void>;
  loading: boolean;
  error: string | null;
}

const swalCustomClasses = {
  popup: 'swal-custom-popup',
  title: 'swal-custom-title',
  htmlContainer: 'swal-custom-content',
  confirmButton: 'swal-btn-confirm',
  cancelButton: 'swal-btn-cancel'
};

const swalDefaults = {
  buttonsStyling: false,
  customClass: swalCustomClasses
};

export default function useRemoveContact(): UseRemoveContactReturn {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const removeContact = useCallback(
    async (idUser: number, idContato: number) => {
      setError(null);
      setLoading(true);

      const { isConfirmed } = await Swal.fire({
        title: 'Você tem certeza?',
        text: 'Ao desfazer amizade, você não poderá mais trocar mensagens com este contato.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Sim, desfazer amizade',
        cancelButtonText: 'Cancelar',
        ...swalDefaults
      });

      if (!isConfirmed) {
        setLoading(false);
        return;
      }

      try {
        const resp = await fetch(`${API_URL}/api/contacts/removeContato`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ idUser, idContato })
        });

        if (!resp.ok) {
          const errBody = await resp.json().catch(() => null);
          throw new Error(errBody?.error || `Status ${resp.status}`);
        }

        await Swal.fire({
          title: 'Pronto!',
          text: 'Contato removido com sucesso.',
          icon: 'success',
          confirmButtonText: 'OK',
          ...swalDefaults
        });
      } catch (err: any) {
        console.error('Erro ao remover contato:', err);
        setError(err.message || 'Erro desconhecido');

        await Swal.fire('Erro', err.message || 'Não foi possível remover o contato.', 'error');

      } finally {
        setLoading(false);
      }
    },
    []
  );

  return { removeContact, loading, error };
}
