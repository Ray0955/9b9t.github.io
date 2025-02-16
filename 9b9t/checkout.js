document.addEventListener('DOMContentLoaded', () => {
    const cartItems = JSON.parse(localStorage.getItem('cart')) || [];
    const orderItemsList = document.querySelector('.order-items');
    const orderTotal = document.getElementById('order-total');
    const minOrderWarning = document.getElementById('min-order-warning');
    const checkoutMain = document.getElementById('checkout-main');
    const payButtons = document.querySelectorAll('.pay-button');
    const contactForm = document.getElementById('contact-form');
    const languageSelect = document.getElementById('language-select');

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
        // Переключение текстов на странице
        document.querySelectorAll('[data-lang]').forEach(element => {
            if (element.getAttribute('data-lang') === lang) {
                element.style.display = 'block';
            } else {
                element.style.display = 'none';
            }
        });

        // Переключение кнопки оплаты на выбранный язык
        payButtons.forEach(button => {
            if (button.getAttribute('data-lang') === lang) {
                button.style.display = 'none'; // Сначала скрываем все кнопки
            } else {
                button.style.display = 'none';
            }
        });

        // Показываем кнопку оплаты, если форма заполнена
        const isFormValid = contactForm.checkValidity();
        if (isFormValid) {
            const activePayButton = document.querySelector(`.pay-button[data-lang="${lang}"]`);
            if (activePayButton) {
                activePayButton.style.display = 'block';
            }
        }
    }

    // Проверка минимальной суммы
    const total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    if (total < 2) {
        minOrderWarning.style.display = 'block';
        checkoutMain.style.display = 'none';
        payButtons.forEach(button => button.style.display = 'none');
    } else {
        minOrderWarning.style.display = 'none';
        checkoutMain.style.display = 'flex';
    }

    // Отображение товаров в заказе
    function renderOrderSummary() {
        orderItemsList.innerHTML = '';
        cartItems.forEach(item => {
            const li = document.createElement('li');
            li.innerHTML = `
                <span>${item.name} - $${item.price} x ${item.quantity}</span>
            `;
            orderItemsList.appendChild(li);
        });
        orderTotal.innerText = total.toFixed(2);
    }

    // Обработчик для изменения полей формы
    contactForm.addEventListener('input', () => {
        const isFormValid = contactForm.checkValidity();
        const currentLanguage = languageSelect.value;

        payButtons.forEach(button => {
            if (button.getAttribute('data-lang') === currentLanguage) {
                button.style.display = isFormValid ? 'block' : 'none';
            } else {
                button.style.display = 'none';
            }
        });
    });

    // Обработчик для кнопки "Оплатить"
    payButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            if (contactForm.checkValidity()) {
                // Сбор данных пользователя
                const userData = {
                    username: document.getElementById('username').value,
                    discord: document.getElementById('discord').value,
                    email: document.getElementById('email').value,
                    order: cartItems,
                    total: total,
                    date: new Date().toLocaleString() // Добавляем дату заказа
                };

                // Получаем текущие заказы из localStorage
                const orders = JSON.parse(localStorage.getItem('orders')) || [];

                // Добавляем новый заказ
                orders.push(userData);

                // Сохраняем обновлённый список заказов
                localStorage.setItem('orders', JSON.stringify(orders));

                // Очистка корзины
                localStorage.removeItem('cart');

                alert('Оплата прошла успешно! Данные сохранены.');
                window.location.href = 'index.html'; // Перенаправление на главную страницу
            } else {
                alert('Заполните все поля контактной информации!');
            }
        });
    });

    renderOrderSummary();
});