document.addEventListener('DOMContentLoaded', () => {
    const cartItems = JSON.parse(localStorage.getItem('cart')) || [];
    const orderItemsList = document.querySelector('.order-items');
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
    let activePromo = null;

    // Функции для получения элементов с учетом языка
    function getOrderTotalElement(lang) {
        return document.querySelector(`[data-lang="${lang}"] #order-total`);
    }

    function getDeliveryFeeElement(lang) {
        return document.querySelector(`[data-lang="${lang}"] #delivery-fee`);
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
        updateOrderTotal(); // Добавлено обновление суммы при смене языка
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
        updateOrderTotal();
    });

    // Ограничение ввода координат X и Z
    [xCoordInput, zCoordInput].forEach(input => {
        input.addEventListener('input', (e) => {
            let value = parseInt(e.target.value) || 0;
            if (value > 1000000) value = 1000000;
            if (value < -1000000) value = -1000000;
            e.target.value = value;
            if (deliverySelect.value === 'specific') updateOrderTotal();
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

    // Функция для расчета стоимости доставки
    function calculateDeliveryFee(x, z) {
        const distance = Math.max(Math.abs(x), Math.abs(z));
        const feePer10000Blocks = 0.1;
        return Math.floor(distance / 10000) * feePer10000Blocks;
    }

    // Обновление итоговой суммы
function updateOrderTotal() {
    const lang = languageSelect.value;
    const orderTotal = getOrderTotalElement(lang);
    const deliveryFeeElement = getDeliveryFeeElement(lang);
    const discountElement = document.querySelector(`[data-lang="${lang}"] #discount-amount`);

    const x = parseInt(xCoordInput.value) || 0;
    const z = parseInt(zCoordInput.value) || 0;
    const deliveryFee = calculateDeliveryFee(x, z);
    let subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

    let discount = 0;
    if (activePromo) {
        if (activePromo.type === 'percentage') {
            discount = subtotal * (activePromo.value / 100);
        } else if (activePromo.type === 'fixed') {
            discount = activePromo.value;
        } else if (activePromo.type === 'free_shipping') {
            deliveryFee = 0;
        }
    }

    const totalPrice = Math.max(0, subtotal - discount) + deliveryFee;

    if (orderTotal) orderTotal.textContent = totalPrice.toFixed(2);
    if (deliveryFeeElement) deliveryFeeElement.textContent = deliveryFee.toFixed(2);
    if (discountElement) discountElement.textContent = discount.toFixed(2);

    // Показываем/скрываем строку с промокодом
    document.querySelectorAll(`[data-lang="${lang}"] .discount`).forEach(el => {
        el.style.display = discount > 0 ? 'block' : 'none';
    });
}

    // Функция для переключения языка
    function changeLanguage(lang) {
        document.querySelectorAll('[data-lang]').forEach(element => {
            element.style.display = 'none';
        });

        document.querySelectorAll(`[data-lang="${lang}"]`).forEach(element => {
            element.style.display = 'block';
        });

        payButtons.forEach(button => {
            button.style.display = 'none';
        });

        const selectedMethod = deliverySelect.value;
        updateDeliveryDescription(selectedMethod, lang);

        const isFormValid = contactForm.checkValidity();
        if (isFormValid) {
            const activePayButton = document.querySelector(`.pay-button[data-lang="${lang}"]`);
            if (activePayButton) {
                activePayButton.style.display = 'block';
            }
        }
        updateOrderTotal(); // Добавлено обновление суммы при смене языка
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
        updateOrderTotal();
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

    // Обработчик для кнопки применения промокода
    document.querySelectorAll('#apply-promo-btn').forEach(btn => {
        btn.addEventListener('click', applyPromoCode);
    });

async function applyPromoCode(e) {
    e.preventDefault();
    const promoCode = document.querySelector('.promo-code-input:not([style*="display: none"])').value.trim().toUpperCase();
    const currentLang = languageSelect.value; // Получаем текущий выбранный язык

    // Локализованные сообщения
    const messages = {
        enter_promo: {
            ru: 'Введите промокод',
            uk: 'Введіть промокод',
            en: 'Enter promo code'
        },
        promo_not_found: {
            ru: 'Кажется, этот промокод убежал! 🏃‍♂️ Введите другой или ловите свежие коды в нашей группе',
            uk: 'Схоже, цей промокод втік! 🏃‍♂️ Введіть інший або ловіть свіжі коди в нашій групі',
            en: 'Oops, this promo code ran away! 🏃‍♂️ Try another one or catch fresh codes in our group'
        },
        promo_no_value: {
            ru: 'Промокод не содержит значения скидки',
            uk: 'Промокод не містить значення знижки',
            en: 'Promo code does not contain discount value'
        },
        promo_inactive: {
            ru: 'Промокод неактивен',
            uk: 'Промокод неактивний',
            en: 'Promo code is inactive'
        },
        promo_limit_reached: {
            ru: 'Лимит использований исчерпан',
            uk: 'Ліміт використань вичерпано',
            en: 'Usage limit reached'
        },
        promo_min_order: {
            ru: 'Минимальная сумма заказа для этого промокода: {minOrder}$',
            uk: 'Мінімальна сума замовлення для цього промокоду: {minOrder}$',
            en: 'Minimum order amount for this promo code: {minOrder}$'
        },
        promo_applied: {
            ru: 'Промокод применен!',
            uk: 'Промокод застосовано!',
            en: 'Promo code applied!'
        },
        promo_check_error: {
            ru: 'Ошибка при проверке промокода',
            uk: 'Помилка при перевірці промокоду',
            en: 'Error checking promo code'
        }
    };

    if (!promoCode) {
        showPromoMessage(messages.enter_promo[currentLang] || messages.enter_promo.ru, 'error');
        return;
    }

    try {
        const response = await fetch(`https://endles.fun/api/9b9t/promocodes/${promoCode}`);

        if (!response.ok) {
            throw new Error(messages.promo_not_found[currentLang] || messages.promo_not_found.ru);
        }

        const promoData = await response.json();
        console.log("Promo data:", promoData);

        // Проверяем обязательные поля для free_shipping
        if (promoData.type !== 'free_shipping') {
            if (!promoData.value) {
                throw new Error('Промокод не содержит значения скидки');
            }
        }

        // Проверяем активность промокода
        if (promoData.isActive === false) {
            throw new Error('Промокод неактивен');
        }

        // Проверяем лимит использований
        if (promoData.maxUses && promoData.usedCount >= promoData.maxUses) {
            throw new Error('Лимит использований исчерпан');
        }

        // Проверяем минимальную сумму заказа
        const totalPrice = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
        if (promoData.minOrder && totalPrice < promoData.minOrder) {
            throw new Error(`Минимальная сумма заказа для этого промокода: ${promoData.minOrder}$`);
        }

        // Сохраняем промокод
        activePromo = {
            code: promoCode,
            type: promoData.type,
            value: promoData.value, // может быть null для free_shipping
            minOrder: promoData.minOrder || 0
        };

        showPromoMessage('Промокод применен!', 'success');
        updateOrderTotal();
    } catch (error) {
        console.error('Ошибка при применении промокода:', error);
        showPromoMessage(error.message || 'Ошибка при проверке промокода', 'error');
        activePromo = null;
        updateOrderTotal();
    }
}

   function showPromoMessage(message, type = 'info') {
        const promoMessage = document.getElementById('promo-message');
        promoMessage.textContent = message;
        promoMessage.className = `promo-message ${type}`;

        setTimeout(() => {
            promoMessage.textContent = '';
            promoMessage.className = 'promo-message';
        }, 5000);
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
        const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

        // Применяем промокод, если он есть
        let discount = 0;
        if (activePromo) {
            if (activePromo.type === 'percentage') {
                discount = subtotal * (activePromo.value / 100);
            } else if (activePromo.type === 'fixed') {
                discount = activePromo.value;
            } else if (activePromo.type === 'free_shipping') {
                deliveryFee = 0;
            }
        }

        const finalTotalPrice = Math.max(0, subtotal - discount) + deliveryFee;

        // Формируем данные заказа
        const orderData = {
            orders: {
                [orderId]: {
                    info: { formattedISO, username, discord, email, deliveryMethod },
                    coordinates: { x, z },
                    subtotal,
                    discount,
                    deliveryFee,
                    totalPrice: finalTotalPrice,
                    promoCode: activePromo ? activePromo.code : null,
                    products: cartItems.reduce((acc, product) => {
                        acc[product.id] = product.quantity || 1;
                        return acc;
                    }, {}),
                    messages: {}
                }
            }
        };

        console.log("Sending order data:", JSON.stringify(orderData, null, 2)); // Логируем данные

        try {
            const response = await fetch('https://endles.fun/api/9b9t/orders', {
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

            // Очищаем корзину после успешного заказа
            localStorage.removeItem('cart');
            localStorage.removeItem('activePromo');

            // Перенаправляем пользователя на страницу чата
            window.location.href = "https://endles.fun/9b9t/chat?orderId=" + orderId;
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