import { useCallback, useState } from 'react'
import Swal from 'sweetalert2'
import { removeContact as removeContactService } from '../services/contactService'

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

const swal = Swal.mixin(swalDefaults);

export default function useRemoveContact() {
  const [loading, setLoading] = useState(false);

  const removeContact = useCallback(async (userId: number, contactId: number) => {
    const { isConfirmed } = await swal.fire({
      title: 'Desfazer amizade?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sim',
      cancelButtonText: 'Não'
    });
    if (!isConfirmed) return;

    setLoading(true);
    try {
      await removeContactService(userId, contactId);

      await swal.fire({
        title: 'Pronto!',
        text: 'Contato removido com sucesso.',
        icon: 'success',
        confirmButtonText: 'OK'
      });
    } catch (err: any) {
      console.error(err);
      await swal.fire({
        title: 'Erro',
        text: err.message || 'Não foi possível remover',
        icon: 'error',
        confirmButtonText: 'OK'
      });
    } finally {
      setLoading(false);
    }
  }, []);

  return { removeContact, loading }
}