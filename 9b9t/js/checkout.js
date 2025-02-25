document.addEventListener('DOMContentLoaded', () => {
    const cartItems = JSON.parse(localStorage.getItem('cart')) || [];
    const orderItemsList = document.querySelector('.order-items');
    const orderTotal = document.getElementById('order-total');
    const minOrderWarning = document.getElementById('min-order-warning');
    const checkoutMain = document.getElementById('checkout-main');
    const payButtons = document.querySelectorAll('.pay-button');
    const contactForm = document.getElementById('contact-form');
    const languageSelect = document.getElementById('language-select');
    const deliverySelect = document.getElementById('delivery-select');
    const deliveryDescription = document.getElementById('delivery-description');
    const coordinatesInput = document.getElementById('coordinates-input');
    const xCoordInput = document.getElementById('x-coord');
    const yCoordInput = document.getElementById('y-coord');
    const zCoordInput = document.getElementById('z-coord');

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

    // Обработчик для выбора способа доставки
    deliverySelect.addEventListener('change', (event) => {
        const selectedMethod = event.target.value;
        updateDeliveryDescription(selectedMethod, languageSelect.value);
        if (selectedMethod === 'specific') {
            coordinatesInput.style.display = 'block';
        } else {
            coordinatesInput.style.display = 'none';
        }
    });

    // Ограничение ввода координат (максимум 1 000 000)
    [xCoordInput, yCoordInput, zCoordInput].forEach(input => {
        input.addEventListener('input', (e) => {
            const value = parseInt(e.target.value);
            if (value > 1000000) {
                e.target.value = 1000000;
            } else if (value < -1000000) {
                e.target.value = -1000000;
            }
        });
    });

    // Функция для обновления описания способа доставки
    function updateDeliveryDescription(method, lang) {
        const descriptions = deliveryDescription.querySelectorAll('p');
        descriptions.forEach(desc => {
            if (desc.getAttribute('data-delivery') === method && desc.getAttribute('data-lang') === lang) {
                desc.style.display = 'block';
            } else {
                desc.style.display = 'none';
            }
        });
    }

    // Функция для переключения языка
    function changeLanguage(lang) {
        // Скрываем все элементы с атрибутом data-lang
        document.querySelectorAll('[data-lang]').forEach(element => {
            element.style.display = 'none';
        });

        // Показываем только элементы с выбранным языком
        document.querySelectorAll(`[data-lang="${lang}"]`).forEach(element => {
            element.style.display = 'block';
        });

        // Переключение кнопки оплаты на выбранный язык
        payButtons.forEach(button => {
            if (button.getAttribute('data-lang') === lang) {
                button.style.display = 'none'; // Сначала скрываем все кнопки
            } else {
                button.style.display = 'none';
            }
        });

        // Обновляем описание способа доставки для выбранного языка
        const selectedMethod = deliverySelect.value;
        updateDeliveryDescription(selectedMethod, lang);

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
    if (total < 0) {
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
        button.addEventListener('click', async (e) => {
            e.preventDefault();
            if (contactForm.checkValidity()) {
                // Проверка способа доставки и координат
                const deliveryMethod = deliverySelect.value;
                let coordinates = null;

                if (deliveryMethod === 'specific') {
                    const x = parseInt(xCoordInput.value);
                    const y = parseInt(yCoordInput.value);
                    const z = parseInt(zCoordInput.value);

                    if (isNaN(x) || isNaN(y) || isNaN(z)) {
                        alert('Заполните все поля координат!');
                        return;
                    }

                    coordinates = { x, y, z };
                }

                // Сбор данных пользователя
                const userData = {
                    username: document.getElementById('username').value,
                    discord: document.getElementById('discord').value,
                    email: document.getElementById('email').value,
                    order: cartItems,
                    total: total,
                    deliveryMethod: deliveryMethod,
                    coordinates: coordinates,
                    date: new Date().toLocaleString() // Добавляем дату заказа
                };

                try {
                    // Отправка данных на сервер
                    const response = await fetch('https://9b9t.shop:8443/api/orders', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(userData),
                    });

                    if (response.ok) {
                        alert('Оплата прошла успешно! Данные отправлены на сервер.');
                        localStorage.removeItem('cart'); // Очистка корзины
                        window.location.href = 'index.html'; // Перенаправление на главную страницу
                    } else {
                        alert('Ошибка при отправке данных на сервер.');
                    }
                } catch (error) {
                    console.error('Ошибка:', error);
                    alert('Произошла ошибка при отправке данных.');
                }
            } else {
                alert('Заполните все поля контактной информации!');
            }
        });
    });

    renderOrderSummary();
});
