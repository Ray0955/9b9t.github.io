document.addEventListener('DOMContentLoaded', () => {
    // Получаем элементы DOM
    const cartItemsContainer = document.querySelector('.cart-items');
    const emptyCartMessage = document.querySelector('.empty-cart-message');
    const totalAmountElement = document.querySelector('.total');
    const checkoutButtons = document.querySelectorAll('.checkout-button');
    const languageSelect = document.getElementById('language-select');

    // Загружаем корзину из localStorage или создаем пустую
    let cart = JSON.parse(localStorage.getItem('cart')) || [];

    // Основная функция обновления отображения корзины
    function updateCartDisplay() {
        // Очищаем контейнер с товарами
        cartItemsContainer.innerHTML = '';

        // Проверяем, пуста ли корзина
        if (cart.length === 0) {
            showEmptyCart();
            return;
        }

        // Скрываем сообщение о пустой корзине
        hideEmptyCart();

        // Рассчитываем общую сумму
        let totalAmount = 0;

        // Добавляем каждый товар в корзину
        cart.forEach(item => {
            totalAmount += item.price * item.quantity;
            createCartItemElement(item);
        });

        // Обновляем общую сумму
        updateTotalAmount(totalAmount);

        // Обновляем отображение языка
        updateLanguage(languageSelect.value);
    }

    // Функция показа пустой корзины
    function showEmptyCart() {
        emptyCartMessage.style.display = 'block';
        document.querySelectorAll('.total-amount').forEach(el => el.style.display = 'none');
        checkoutButtons.forEach(btn => btn.style.display = 'none');
        updateLanguage(languageSelect.value); // Обновляем язык для сообщения
    }

    // Функция скрытия сообщения о пустой корзине
    function hideEmptyCart() {
        emptyCartMessage.style.display = 'none';
        document.querySelectorAll('.total-amount').forEach(el => el.style.display = 'block');
        checkoutButtons.forEach(btn => btn.style.display = 'block');
        updateLanguage(languageSelect.value); // Обновляем язык для кнопок
    }

    // Функция создания элемента товара в корзине
    function createCartItemElement(item) {
        const cartItem = document.createElement('li');
        cartItem.className = 'cart-item';
        cartItem.innerHTML = `
            <div class="cart-item-image">
                <img src="${item.image}" alt="${item.name}" onerror="this.src='https://via.placeholder.com/150'">
            </div>
            <div class="cart-item-details">
                <h3>${item.name}</h3>
                <p>$${item.price.toFixed(2)} x ${item.quantity}</p>
                <p>$${(item.price * item.quantity).toFixed(2)}</p>
            </div>
            <div class="cart-item-actions">
                <button class="quantity-btn minus" data-id="${item.id}" aria-label="Уменьшить количество">
                    <i class="fas fa-minus"></i>
                </button>
                <button class="quantity-btn plus" data-id="${item.id}" aria-label="Увеличить количество">
                    <i class="fas fa-plus"></i>
                </button>
                <button class="remove-btn" data-id="${item.id}" aria-label="Удалить товар">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
        cartItemsContainer.appendChild(cartItem);
    }

    // Функция обновления общей суммы
    function updateTotalAmount(amount) {
        document.querySelectorAll('.total').forEach(el => {
            el.textContent = amount.toFixed(2);
        });
    }

    // Функция настройки обработчиков событий
    function setupEventListeners() {
        // Обработчик для уменьшения количества товара
        document.addEventListener('click', (e) => {
            if (e.target.closest('.minus')) {
                const button = e.target.closest('.minus');
                const id = button.getAttribute('data-id');
                updateItemQuantity(id, -1);
            }

            // Обработчик для увеличения количества товара
            if (e.target.closest('.plus')) {
                const button = e.target.closest('.plus');
                const id = button.getAttribute('data-id');
                updateItemQuantity(id, 1);
            }

            // Обработчик для удаления товара
            if (e.target.closest('.remove-btn')) {
                const button = e.target.closest('.remove-btn');
                const id = button.getAttribute('data-id');
                removeItemFromCart(id);
            }
        });

        // Обработчики для кнопок оформления заказа
        checkoutButtons.forEach(button => {
            button.addEventListener('click', proceedToCheckout);
        });
    }

    // Функция обновления количества товара
    function updateItemQuantity(id, change) {
        const itemIndex = cart.findIndex(item => item.id === id);

        if (itemIndex !== -1) {
            cart[itemIndex].quantity += change;

            // Удаляем товар, если количество стало 0 или меньше
            if (cart[itemIndex].quantity <= 0) {
                cart.splice(itemIndex, 1);
            }

            // Сохраняем изменения
            saveCart();
        }
    }

    // Функция удаления товара из корзины
    function removeItemFromCart(id) {
        cart = cart.filter(item => item.id !== id);
        saveCart();
    }

    // Функция сохранения корзины в localStorage
    function saveCart() {
        localStorage.setItem('cart', JSON.stringify(cart));
        updateCartDisplay();
    }

    // Функция перехода к оформлению заказа
    function proceedToCheckout() {
        if (cart.length > 0) {
            window.location.href = '/9b9t/checkout';
        } else {
            alert(getLocalizedMessage('Ваша корзина пуста!', 'Ваш кошик порожній!', 'Your cart is empty!'));
        }
    }

    // Функция для получения локализованного сообщения
    function getLocalizedMessage(ru, uk, en) {
        const lang = languageSelect.value;
        if (lang === 'ru') return ru;
        if (lang === 'uk') return uk;
        return en;
    }

    // Функции для работы с языком
    function initializeLanguage() {
        const savedLanguage = localStorage.getItem('selectedLanguage') || 'ru';
        languageSelect.value = savedLanguage;
        updateLanguage(savedLanguage);

        languageSelect.addEventListener('change', function() {
            const selectedLanguage = this.value;
            localStorage.setItem('selectedLanguage', selectedLanguage);
            updateLanguage(selectedLanguage);
        });
    }

    function updateLanguage(lang) {
        // Обновляем все элементы с атрибутом data-lang
        document.querySelectorAll('[data-lang]').forEach(el => {
            el.style.display = el.getAttribute('data-lang') === lang ?
                (el.tagName === 'SPAN' ? 'inline' : 'block') : 'none';
        });

        // Обновляем текст кнопок оформления заказа
        checkoutButtons.forEach(btn => {
            btn.style.display = btn.getAttribute('data-lang') === lang ? 'block' : 'none';
        });
    }

    // Инициализация приложения
    function initialize() {
        initializeLanguage();
        updateCartDisplay();
        setupEventListeners();
    }

    // Запускаем приложение
    initialize();
});