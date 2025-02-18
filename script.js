document.addEventListener('DOMContentLoaded', () => {
    const servers = document.querySelectorAll('.server');
    const languageSelect = document.getElementById('language-select');

    // Загрузка выбранного языка из localStorage
    const savedLanguage = localStorage.getItem('selectedLanguage') || 'ru';
    languageSelect.value = savedLanguage;
    updateLanguage(savedLanguage);

    // Обработчик изменения языка
    languageSelect.addEventListener('change', (event) => {
        const selectedLang = event.target.value;
        localStorage.setItem('selectedLanguage', selectedLang); // Сохраняем выбранный язык
        updateLanguage(selectedLang); // Обновляем язык на странице
    });

    // Функция для обновления языка
    function updateLanguage(lang) {
        document.querySelectorAll('[data-lang]').forEach(element => {
            // Показываем только элементы с выбранным языком
            element.style.display = element.getAttribute('data-lang') === lang ? 'block' : 'none';
        });
    }

    // Обработчик клика по серверу
    servers.forEach(server => {
        server.addEventListener('click', () => {
            const selectedServer = server.getAttribute('data-server');
            redirectToServer(selectedServer); // Перенаправляем на страницу сервера
        });
    });

    // Функция для перенаправления на страницу сервера
    function redirectToServer(server) {
        switch (server) {
            case '2b2t':
                window.location.href = '2b2t/index.html';
                break;
            case '9b9t':
                window.location.href = '9b9t/index.html';
                break;
            default:
                console.error('Неизвестный сервер:', server);
        }
    }
});
