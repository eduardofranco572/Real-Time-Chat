import { useState, useEffect, useCallback } from 'react';
//@ts-expect-error ignorar img 
import iconePadrao from '../../assets/img/iconePadrao.svg';

const useUserStatus = (idUser: number | null, active: boolean) => {
  const [statusImage, setStatusImage] = useState<string>('');

    const fetchUserStatus = useCallback(async () => {
        if (!idUser) return;
            const dataJSON = JSON.stringify({ idUser });
        try {
            const response = await fetch('http://localhost:3000/statusUsuario', {
            method: 'POST',
            body: dataJSON,
            headers: { 'Content-Type': 'application/json' },
            });
            const result = await response.json();
            if (result.message === 'ok') {
            setStatusImage(result.statusImage || iconePadrao);
            }
        } catch (error) {
            console.error('Erro ao buscar status do usuário: ', error);
        }
    }, [idUser]);

    useEffect(() => {
        if (active) {
            fetchUserStatus();
        }
    }, [active, fetchUserStatus]);

    return statusImage;
};

export default useUserStatus;
