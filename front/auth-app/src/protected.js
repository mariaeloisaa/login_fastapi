import React, { useEffect } from "react";
import { useNavigate } from 'react-router-dom';

function ProtectedPage() {
    const navigate = useNavigate();

    useEffect(() => {
        // Função que verifica se o token armazenado é válido​
        const verifyToken = async () => {
            const token = localStorage.getItem('token'); // Recupera o token do localStorage​
            console.log(token); // Exibe o token no console (útil para depuração)​
            try {
                // Envia uma requisição para o servidor para verificar a validade do token
                const response = await fetch(`http://localhost:8000/verify-token/${token}`);
                if (!response.ok) { // Se a resposta não for bem-sucedida​
                    throw new Error("Token verification failed"); // Lança erro de falha na verificação​
                }
            } catch (error) { // Se ocorrer um erro (token inválido ou outro erro de rede)​
                localStorage.removeItem("token"); // Remove o token do localStorage​
                navigate('/'); // Redireciona o usuário de volta para a página de login​
            }
        };
        verifyToken(); // Chama a função de verificação ao carregar a página​
    }, [navigate]); // O efeito depende da função navigate, garantindo que seja chamado novamente se necessário​
    // Retorna a mensagem que só será visível para usuários autenticados​
    return <div>This is protected page. Only visible to authenticated users.</div>;

}

export default ProtectedPage; // Exporta o componente ProtectedPage para ser usado em outras partes da aplicação​