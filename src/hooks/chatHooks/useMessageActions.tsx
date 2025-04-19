import { Dispatch, SetStateAction } from 'react';
import { API_URL } from '../../config';
import { Message } from './useMessages';

type SetMessages = Dispatch<SetStateAction<Message[]>>;

const useMessageActions = (setMessages: SetMessages) => {
  const deleteMessage = async (id: number) => {
    try {
      const res = await fetch(`${API_URL}/api/chat/excluirMensagem`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessages(prev => prev.filter(m => m.id !== id));
      } else {
        console.error('Erro ao excluir mensagem:', data.error);
      }
    } catch (error) {
      console.error('Erro na requisição de exclusão:', error);
    }
  };

  const editMessage = async (id: number, newText: string) => {
    try {
      const res = await fetch(`${API_URL}/api/chat/editarMensagem`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, message: newText }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessages(prev =>
          prev.map(msg =>
            msg.id === id ? { ...msg, mensagem: newText } : msg
          )
        );
      } else {
        console.error('Erro ao editar mensagem:', data.error);
      }
    } catch (error) {
      console.error('Erro ao editar mensagem:', error);
    }
  };

  return { deleteMessage, editMessage };
};

export default useMessageActions;
