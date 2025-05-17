document.addEventListener('DOMContentLoaded', () => {
    const cartItems = JSON.parse(localStorage.getItem('cart')) || [];
    const cartList = document.querySelector('.cart-items');
    const totalElement = document.querySelector('.total');
    const emptyCartMessage = document.querySelector('.empty-cart-message');
    const languageSelect = document.getElementById('language-select');
    const checkoutContainer = document.querySelector('.checkout-button-container');
    const allCheckoutButtons = document.querySelectorAll('.checkout-button');

    // Загрузка выбранного языка
    const savedLanguage = localStorage.getItem('selectedLanguage') || 'ru';
    languageSelect.value = savedLanguage;

    // Применяем язык при загрузке
    changeLanguage(savedLanguage);

    // Обработчик изменения языка
    languageSelect.addEventListener('change', (event) => {
        const selectedLang = event.target.value;
        localStorage.setItem('selectedLanguage', selectedLang);
        changeLanguage(selectedLang);
    });

    // Функция смены языка
    function changeLanguage(lang) {
        // Обновляем текст кнопки
        updateCheckoutButtonText(lang);

        // Обновляем видимость элементов
        document.querySelectorAll('[data-lang]').forEach(element => {
            element.style.display = element.getAttribute('data-lang') === lang ?
                (element.tagName === 'SPAN' ? 'inline' : 'block') : 'none';
        });

        // Перерисовываем корзину
        renderCart();
    }

    // Обновление текста кнопки
    function updateCheckoutButtonText(lang) {
        allCheckoutButtons.forEach(button => {
            if (button.getAttribute('data-lang') === lang) {
                if (lang === 'ru') button.textContent = 'Перейти к оформлению';
                else if (lang === 'uk') button.textContent = 'Перейти до оформлення';
                else if (lang === 'en') button.textContent = 'Proceed to checkout';
            }
        });
    }

    // Отображение товаров в корзине
    function renderCart() {
        cartList.innerHTML = '';
        let total = 0;
        const currentLang = languageSelect.value;

        if (cartItems.length === 0) {
            // Корзина пуста
            checkoutContainer.style.display = 'none';

            // Показываем сообщение для текущего языка
            document.querySelectorAll('.empty-cart-message').forEach(el => {
                el.style.display = el.getAttribute('data-lang') === currentLang ? 'block' : 'none';
            });

            // Скрываем все кнопки
            allCheckoutButtons.forEach(btn => btn.style.display = 'none');
        } else {
            // Корзина не пуста
            checkoutContainer.style.display = 'block';

            // Скрываем сообщение
            document.querySelectorAll('.empty-cart-message').forEach(el => {
                el.style.display = 'none';
            });

            // Показываем только кнопку текущего языка
            allCheckoutButtons.forEach(btn => {
                btn.style.display = btn.getAttribute('data-lang') === currentLang ? 'block' : 'none';
            });

            // Отрисовываем товары
            cartItems.forEach((item, index) => {
                const li = document.createElement('li');
                li.innerHTML = `
                    <img src="${item.image}" alt="${item.name}">
                    <span>${item.name} - $${item.price}</span>
                    <div class="quantity-controls">
                        <button onclick="changeQuantity(${index}, -1)">-</button>
                        <span>${item.quantity}</span>
                        <button onclick="changeQuantity(${index}, 1)">+</button>
                    </div>
                    <button onclick="removeItem(${index})">Удалить</button>
                `;
                cartList.appendChild(li);
                total += item.price * item.quantity;
            });
        }

        // Обновляем общую сумму
        document.querySelectorAll('.total-amount').forEach(el => {
            if (el.getAttribute('data-lang') === currentLang) {
                el.style.display = 'block';
                el.querySelector('.total').textContent = total.toFixed(2);
            } else {
                el.style.display = 'none';
            }
        });
    }

    // Изменение количества товара
    window.changeQuantity = (index, delta) => {
        cartItems[index].quantity += delta;
        if (cartItems[index].quantity < 1) cartItems[index].quantity = 1;
        localStorage.setItem('cart', JSON.stringify(cartItems));
        renderCart();
    };

    // Удаление товара
    window.removeItem = (index) => {
        cartItems.splice(index, 1);
        localStorage.setItem('cart', JSON.stringify(cartItems));
        renderCart();
    };

    // Обработчик клика по кнопке оформления
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('checkout-button')) {
            window.location.href = '/6b6t/checkout';
        }
    });

    // Инициализация корзины
    renderCart();
});