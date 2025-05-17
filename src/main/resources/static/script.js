document.addEventListener('DOMContentLoaded', () => {
    const servers = document.querySelectorAll('.server');
    const languageSelect = document.getElementById('language-select');

    // Проверка, существует ли languageSelect
    if (!languageSelect) {
        console.error('Элемент выбора языка не найден!');
        return;
    }

    // Загрузка выбранного языка из localStorage
    const savedLanguage = localStorage.getItem('selectedLanguage') || 'ru';
    languageSelect.value = savedLanguage;
    changeLanguage(savedLanguage);

    // Обработчик для выбора языка
    languageSelect.addEventListener('change', (event) => {
        const selectedLang = event.target.value;
        localStorage.setItem('selectedLanguage', selectedLang);
        changeLanguage(selectedLang);
    });

    // Функция для переключения языка
    function changeLanguage(lang) {
        document.querySelectorAll('[data-lang]').forEach(element => {
            if (element.getAttribute('data-lang') === lang) {
                element.style.display = 'block'; // Показываем элемент
            } else {
                element.style.display = 'none'; // Скрываем элемент
            }
        });
    }

    // Обработчик для выбора сервера
    servers.forEach(server => {
        server.addEventListener('click', () => {
            const selectedServer = server.getAttribute('data-server');
            if (selectedServer === '2b2t') {
                window.location.href = '2b2t';
            } else if (selectedServer === '9b9t') {
                window.location.href = '9b9t';
            } else if (selectedServer === '6b6t') {
                window.location.href = '6b6t';
            } else {
                console.error('Неизвестный сервер:', selectedServer);
            }
        });
    });
});
