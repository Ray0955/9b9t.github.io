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
            updateOrderTotalWithDelivery(); // Обновляем стоимость при выборе способа доставки
        } else {
            coordinatesInput.style.display = 'none';
            updateOrderTotalWithDelivery(); // Обновляем стоимость при выборе способа доставки
        }
    });

    // Ограничение ввода координат X и Z (максимум 1 000 000)
    [xCoordInput, zCoordInput].forEach(input => {
        input.addEventListener('input', (e) => {
            let value = parseInt(e.target.value) || 0;
            if (value > 1000000) value = 1000000;
            if (value < -1000000) value = -1000000;
            e.target.value = value; // Устанавливаем скорректированное значение
            if (deliverySelect.value === 'specific') updateOrderTotalWithDelivery();
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

    // Функция для расчета дополнительной стоимости доставки
    function calculateDeliveryFee(x, z) {
        const distance = Math.max(Math.abs(x), Math.abs(z)); // Максимальное расстояние по X или Z
        const feePer10000Blocks = 0.1; // Стоимость за каждые 10 000 блоков
        const additionalFee = Math.floor(distance / 10000) * feePer10000Blocks; // Округляем вниз
        return additionalFee;
    }

    // Обновляем отображение итоговой суммы с учетом доставки
    function updateOrderTotalWithDelivery() {
        const x = parseInt(xCoordInput.value) || 0;
        const z = parseInt(zCoordInput.value) || 0;
        const deliveryFee = calculateDeliveryFee(x, z);
        const totalPrice = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0); // Пересчитываем общую стоимость товаров
        const finalTotalPrice = totalPrice + deliveryFee;

        // Обновляем отображение итоговой суммы
        orderTotal.textContent = finalTotalPrice.toFixed(2);

        // Обновляем отображение стоимости доставки
        const deliveryFeeElement = document.getElementById('delivery-fee');
        if (deliveryFeeElement) {
            deliveryFeeElement.textContent = deliveryFee.toFixed(2);
        }
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

    // Функция для проверки, заполнены ли координаты X и Z
    function validateCoordinates() {
    const x = xCoordInput.value.trim();
    const z = zCoordInput.value.trim();

    // Проверка, что поля не пустые
    if (x === "" || z === "") {
        alert('Пожалуйста, заполните координаты X и Z.'); // Показываем alert, если поля пустые
        return false;
    }

    return true;
    }   

    payButtons.forEach(button => {
        button.addEventListener('click', async (e) => {
            e.preventDefault();

            // Проверяем, заполнены ли координаты
            if (deliverySelect.value === 'specific' && !validateCoordinates()) {
                alert('Пожалуйста, заполните координаты X и Z.');
                return;
            }

            if (contactForm.checkValidity()) {
                await sendOrder();
            } else {
                alert('Заполните все поля контактной информации!');
            }
        });
    });

    async function sendOrder() {
        const orderId = crypto.randomUUID(); // Генерация UUID

        const getValue = (id) => {
            const element = document.getElementById(id);
            if (!element) {
                console.error(`Ошибка: элемент #${id} не найден!`);
                return null;
            }
            return element.value;
        };

        const formattedISO = new Date().toISOString();
        const username = getValue('username');
        const discord = getValue('discord');
        const email = getValue('email');
        const deliveryMethod = deliverySelect.value;

        // Получаем координаты X и Z
        const x = parseInt(getValue('x-coord')) || 0;
        const z = parseInt(getValue('z-coord')) || 0;

        // Рассчитываем дополнительную стоимость доставки
        const deliveryFee = calculateDeliveryFee(x, z);

        // Общая стоимость заказа
        const totalPrice = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
        const finalTotalPrice = totalPrice + deliveryFee;

        // Формируем данные заказа
        const orderData = {
            orders: {
                [orderId]: {
                    info: { formattedISO, username, discord, email, deliveryMethod },
                    coordinates: { x, z },
                    totalPrice: finalTotalPrice,
                    deliveryFee,
                    products: getCartItems().reduce((acc, product) => {
                        acc[product.id] = product.quantity || 1;
                        return acc;
                    }, {}),
                    messages: {}
                }
            }
        };

        console.log("Sending order data:", JSON.stringify(orderData, null, 2)); // Логируем данные

        try {
            const response = await fetch('https://9b9t.shop:8443/api/{server}/orders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(orderData)
            });

            if (!response.ok) {
                const errorResponse = await response.json();
                console.error("Server error:", errorResponse);
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const responseData = await response.json();
            console.log("Server response:", responseData);

            // Перенаправляем пользователя на страницу чата
            window.location.href = `https://ray0955.github.io/9b9t.github.io/9b9t/chat.html?orderId=${orderId}`;
        } catch (error) {
            console.error('Ошибка:', error);
            alert('Ошибка соединения с сервером.');
        }
    }

    // Функция получения товаров из корзины
    function getCartItems() {
        return JSON.parse(localStorage.getItem('cart')) || [];
    }

    renderOrderSummary();
});
