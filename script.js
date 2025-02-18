document.addEventListener('DOMContentLoaded', () => {
    const languageSelect = document.getElementById('language-select');

    // Загрузка выбранного языка из localStorage
    const savedLanguage = localStorage.getItem('selectedLanguage') || 'ru';
    if (languageSelect) {
        languageSelect.value = savedLanguage;
        changeLanguage(savedLanguage); // Применяем язык при загрузке страницы
    }

    // Обработчик изменения выбора языка
    if (languageSelect) {
        languageSelect.addEventListener('change', (event) => {
            const selectedLang = event.target.value;
            localStorage.setItem('selectedLanguage', selectedLang); // Сохраняем язык
            changeLanguage(selectedLang); // Применяем язык
        });
    }

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
