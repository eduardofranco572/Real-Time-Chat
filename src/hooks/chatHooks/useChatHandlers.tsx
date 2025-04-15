import { useState } from 'react';

interface SendMessageParams {
  idUser: number;
  selectedContactId: number;
  message: string;
  replyingMessage: any;
  setMessage: (text: string) => void;
  setReplyingMessage: (msg: any) => void;
}

interface SendMediaParams {
  idUser: number;
  selectedContactId: number;
  file: File;
  caption: string;
}

interface SendDocsParams {
  idUser: number;
  selectedContactId: number;
  file: File;
  caption: string;
}

export const useChatHandlers = () => {
  
  const handleSendMessage = async ({
    idUser,
    selectedContactId,
    message,
    replyingMessage,
    setMessage,
    setReplyingMessage,
  }: SendMessageParams): Promise<void> => {
    if (!message.trim()) return;
  
    try {
      const response = await fetch('http://localhost:3000/api/chat/salvarMensagem', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          idUser,
          idContato: selectedContactId,
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
    selectedContactId,
    file,
    caption,
  }: SendMediaParams): Promise<void> => {
    const formData = new FormData();
    formData.append('idUser', idUser.toString());
    formData.append('idContato', selectedContactId.toString());
    formData.append('message', caption);
    formData.append('legenda', caption);
    formData.append('mediaChat', file);
  
    try {
      const response = await fetch('http://localhost:3000/api/chat/salvarMensagemMedia', {
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
    selectedContactId,
    file,
    caption,
  }: SendDocsParams): Promise<void> => {
    const formData = new FormData();
    formData.append('mediaChat', file);
    formData.append('legenda', caption);
    formData.append('idUser', idUser.toString());
    formData.append('idContato', selectedContactId.toString());
    formData.append('message', caption);
    formData.append('nomeDocs', file.name);
  
    try {
      const response = await fetch('http://localhost:3000/api/chat/salvarDocument', {
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