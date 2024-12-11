document.addEventListener('DOMContentLoaded', function () {
    const menuToggle = document.getElementById('menu-toggle');
    const menuLateral = document.getElementById('menu-lateral');
    const conteudoPrincipal = document.getElementById('conteudo-principal');

    // Alternar visibilidade do menu lateral
    menuToggle.addEventListener('click', function () {
        menuLateral.classList.toggle('hidden');
        conteudoPrincipal.classList.toggle('menu-hidden');
    });
});
