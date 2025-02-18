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


        // Обновляем текст других элементов
        document.querySelectorAll('[data-lang]').forEach(element => {
            if (element.getAttribute('data-lang') === lang) {
                element.style.display = 'block';
            } else {
                element.style.display = 'none';
            }
        });
    }

    // Обработчик для кнопок "Добавить в корзину"
    addToCartButtons.forEach(button => {
        button.addEventListener('click', () => {
            const product = button.closest('.product');
            const productId = product.getAttribute('data-id');
            const productName = product.querySelector('h2').innerText;
            const productPrice = parseFloat(product.getAttribute('data-price'));
            const productImage = product.querySelector('img').src;

            // Загрузка корзины из localStorage
            let cart = JSON.parse(localStorage.getItem('cart')) || [];

            // Проверяем, есть ли товар уже в корзине
            const existingItem = cart.find(item => item.id === productId);
            if (existingItem) {
                existingItem.quantity += 1;
            } else {
                cart.push({
                    id: productId,
                    name: productName,
                    price: productPrice,
                    image: productImage,
                    quantity: 1
                });
            }

            // Сохраняем корзину в localStorage
            localStorage.setItem('cart', JSON.stringify(cart));

            // Обновляем счетчик корзины
            const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
            cartCount.innerText = totalItems;
        });
    });

    // Инициализация счетчика корзины
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCount.innerText = totalItems;
});
