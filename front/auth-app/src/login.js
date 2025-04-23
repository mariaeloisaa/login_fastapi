import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';


function Login() {​

    const [username, setUsername] = useState("");​
    const [password, setPassword] = useState("");​
    const [error, setError] = useState("");​
    const [loading, setLoading] = useState(false);    ​
    const navigate = useNavigate(); // Hook de navegação para redirecionar após login
    


//Função para validar se o formulário está preenchido corretamente​

    const validateForm = () => {​

        if (!username || !password) { // Verifica se username ou password estão vazios​

            setError("Username and password are required"); // Exibe erro se algum campo estiver vazio​

            return false;​

        }​

        setError(""); // Limpa o erro se a validação passar​

        return true;​

    };​

// Função chamada ao enviar o formulário​

    const handleSubmit = async (event) => {​

        event.preventDefault(); // Evita o envio padrão do formulário​

        if (!validateForm()) return; // Valida o formulário antes de prosseguir​

        setLoading(true); // Ativa o carregamento (para desabilitar botão, etc)        ​

        const formDetails = new URLSearchParams(); // Cria um objeto para enviar dados de formulário via URL​

        formDetails.append("username", username); // Adiciona o username ao corpo da requisição​

        formDetails.append("password", password); // Adiciona a senha ao corpo da requisição
    }


    try {

        const response = await fetch("http://localhost:8000/token", { // Envia a requisição de login para o backend​

            method: "POST", // Método POST para autenticação​
            headers: {
                "Content-Type": "application/x-www-form-urlencoded", // Tipo de conteúdo enviado (formulário codificado na URL)​
            },

            body: formDetails // Corpo da requisição com os detalhes do formulário​

        });          

        setLoading(false); // Desativa o carregamento após resposta​


        if (response.ok) { // Se a resposta for bem-sucedida​

            const data = await response.json(); // Converte a resposta em JSON​
            localStorage.setItem('token', data.access_token); // Armazena o token JWT no localStorage​
            navigate("/protected"); // Redireciona para a página protegida​

        } else { // Se a resposta não for bem-sucedida​

            const errorData = await response.json(); // Converte o erro em JSON​
            setError(errorData.detail || 'Authentication failed!'); // Exibe o erro retornado ou mensagem padrão​

        }

    } catch (error) { // Captura erros de requisição ou rede​

        setLoading(false); // Desativa o carregamento​

        setError("An error occurred. Please try again later"); // Exibe mensagem de erro​

    };

    return (
        <div>
            <form onSubmit={handleSubmit}> {/* Define o formulário e chama handleSubmit ao enviar */}​
                <div>
                    <label>Username:</label>
                    <input 
                        type="text" // Input de texto para o nome de usuário​
                        value={username} // Vincula o valor do input ao estado username​
                    onChange={(e) => setUsername(e.target.value)} // Atualiza o estado ao digitar​
                    />
                </div>
                <div>
                    <label>Password:</label>
                    <input
                        type="password" // Input do tipo senha
                        value={password} // Vincula o valor ao estado password
                onChange={(e) => setPassword(e.target.value)} />// Atualiza o estado ao digitar
                </div>
                <button type="submit" disabled={loading}> {/* Botão de login, desabilitado enquanto carregando */}
                    {loading ? 'Logging in...': "Login"} {/* Texto no botão muda conforme o estado de carregamento */}
                </button>
                    {error && <p style={{ color: 'red'}}>{error}</p>} {/* Exibe a mensagem de erro, se houver */}
            </form>
        </div>
    );
}
export default Login; // Exporta o componente Login para ser utilizado em outras partes da aplicação​