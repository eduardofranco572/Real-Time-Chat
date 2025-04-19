import { useState } from 'react';
import { API_URL } from '../../config';

interface SendMessageParams {
  idUser: number;
  idChat: number;
  message: string;
  replyingMessage: any;
  setMessage: (text: string) => void;
  setReplyingMessage: (msg: any) => void;
}

interface SendMediaParams {
  idUser: number;
  idChat: number;
  file: File;
  caption: string;
}

interface SendDocsParams {
  idUser: number;
  idChat: number;
  file: File;
  caption: string;
}

export const useChatHandlers = () => {
  
  const handleSendMessage = async ({
    idUser,
    idChat,
    message,
    replyingMessage,
    setMessage,
    setReplyingMessage,
  }: SendMessageParams): Promise<void> => {
    if (!message.trim()) return;
  
    try {
      const response = await fetch(`${API_URL}/api/chat/salvarMensagem`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          idUser,
          idChat,
          message,
          replyTo: replyingMessage ? replyingMessage.id : null,
        }),
      });
  
      const result = await response.json();
      if (result.message === 'Mensagem enviada com sucesso') {
        setMessage('');
        setReplyingMessage(null);
      }
    } catch (error) {
      console.error('Erro ao enviar a mensagem:', error);
    }
  };

  const handleSendMedia = async ({
    idUser,
    idChat,
    file,
    caption,
  }: SendMediaParams): Promise<void> => {
    const formData = new FormData();
    formData.append('idUser', idUser.toString());
    formData.append('idChat', idChat.toString());
    formData.append('message', caption);
    formData.append('legenda', caption);
    formData.append('mediaChat', file);
  
    try {
      const response = await fetch(`${API_URL}/api/chat/salvarMensagemMedia`, {
        method: 'POST',
        body: formData,
      });
  
      const result = await response.json();
      if (!response.ok) {
        alert('Erro ao enviar mensagem: ' + (result.error || 'Erro desconhecido'));
      }
    } catch (error) {
      console.error('Erro ao enviar mídia:', error);
    }
  };

  const handleSendDocs = async ({
    idUser,
    idChat,
    file,
    caption,
  }: SendDocsParams): Promise<void> => {
    const formData = new FormData();
    formData.append('idUser', idUser.toString());
    formData.append('idChat', idChat.toString());
    formData.append('message', caption);
    formData.append('nomeDocs', file.name);
    formData.append('mediaChat', file);
    formData.append('legenda', caption);
  
    try {
      const response = await fetch(`${API_URL}/api/chat/salvarDocument`, {
        method: 'POST',
        body: formData,
      });
  
      if (!response.ok) {
        const result = await response.json();
        alert('Erro ao enviar documento: ' + (result.error || 'Erro desconhecido'));
      }
    } catch (error) {
      console.error('Erro ao enviar documento:', error);
    }
  };

  return { handleSendMessage, handleSendMedia, handleSendDocs };
};
