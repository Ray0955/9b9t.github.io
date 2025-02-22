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
    const paypalButtonContainer = document.getElementById('paypal-button-container');

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

        // Обновляем описание способа доставки для выбранного языка
        const selectedMethod = deliverySelect.value;
        updateDeliveryDescription(selectedMethod, lang);

        // Показываем кнопку PayPal, если форма заполнена
        checkFormValidity();
    }

    // Проверка минимальной суммы
    const total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    if (total < 2) {
        minOrderWarning.style.display = 'block';
        checkoutMain.style.display = 'none';
        payButtons.forEach(button => button.style.display = 'none');
        paypalButtonContainer.style.display = 'none'; // Скрываем PayPal, если сумма меньше $2
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

    // Функция для проверки валидности формы
    function checkFormValidity() {
        const isFormValid = contactForm.checkValidity();
        const deliveryMethod = deliverySelect.value;
        const areCoordinatesValid = deliveryMethod !== 'specific' || (
            !isNaN(parseInt(xCoordInput.value)) &&
            !isNaN(parseInt(yCoordInput.value)) &&
            !isNaN(parseInt(zCoordInput.value))
        );

        if (isFormValid && areCoordinatesValid) {
            paypalButtonContainer.style.display = 'block'; // Показываем PayPal
        } else {
            paypalButtonContainer.style.display = 'none'; // Скрываем PayPal
        }
    }

    // Обработчик для изменения полей формы
    contactForm.addEventListener('input', checkFormValidity);
    deliverySelect.addEventListener('change', checkFormValidity);
    xCoordInput.addEventListener('input', checkFormValidity);
    yCoordInput.addEventListener('input', checkFormValidity);
    zCoordInput.addEventListener('input', checkFormValidity);

    // Инициализация PayPal
    paypal.Buttons({
        createOrder: function (data, actions) {
            return actions.order.create({
                purchase_units: [{
                    amount: {
                        value: total.toFixed(2) // Сумма заказа
                    }
                }]
            });
        },
        onApprove: function (data, actions) {
            return actions.order.capture().then(function (details) {
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

                // Получаем текущие заказы из localStorage
                const orders = JSON.parse(localStorage.getItem('orders')) || [];

                // Добавляем новый заказ
                orders.push(userData);

                // Сохраняем обновлённый список заказов
                localStorage.setItem('orders', JSON.stringify(orders));

                // Очистка корзины
                localStorage.removeItem('cart');

                alert('Оплата прошла успешно! Данные сохранены.');
                window.location.href = 'https://ray0955.github.io/9b9t.github.io/9b9t/checkout/success.html'; // Перенаправление на страницу успеха
            });
        },
        onError: function (err) {
            console.error(err);
            alert('Ошибка при оплате. Пожалуйста, попробуйте еще раз.');
            window.location.href = 'https://ray0955.github.io/9b9t.github.io/9b9t/checkout/failure.html'; // Перенаправление на страницу ошибки
        }
    }).render('#paypal-button-container'); // Отображение кнопки PayPal

    // Изначально скрываем PayPal
    paypalButtonContainer.style.display = 'none';

    renderOrderSummary();
});
