document.getElementById('registerButton').addEventListener('click', async function() {
    var username = document.getElementById('username').value;
    var password = document.getElementById('password').value;

    if (username === "" || password === "") {
        alert("Por favor, preencha todos os campos.");
        return;
    }

    try {
        console.log('Enviando dados:', { username, password });
        const response = await fetch('https://logtes-99v1.onrender.com/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password }),
            mode: 'no-cors' // Isso faz a requisição sem precisar de CORS, mas você não terá acesso à resposta do servidor
        });

        console.log('Resposta:', response);
        alert("Administrador cadastrado com sucesso!");
        window.location.href = 'admin_login.html';
    } catch (error) {
        console.error('Erro:', error);
        alert("Ocorreu um erro ao tentar cadastrar o administrador. Por favor, tente novamente.");
    }
});
