document.addEventListener('DOMContentLoaded', () => {
    const cartItems = JSON.parse(localStorage.getItem('cart')) || [];
    const cartList = document.querySelector('.cart-items');
    const totalElement = document.querySelector('.total');
    const emptyCartMessage = document.querySelector('.empty-cart-message');
    const checkoutButton = document.querySelector('.checkout-button');
    const languageSelect = document.getElementById('language-select');

    // Загрузка выбранного языка из localStorage
    const savedLanguage = localStorage.getItem('selectedLanguage') || 'ru';
    languageSelect.value = savedLanguage;

    // Применяем язык ДО отображения товаров
    changeLanguage(savedLanguage);

    // Обработчик для выбора языка
    languageSelect.addEventListener('change', (event) => {
        const selectedLang = event.target.value;
        localStorage.setItem('selectedLanguage', selectedLang);
        changeLanguage(selectedLang);
    });

    // Функция для переключения языка
    function changeLanguage(lang) {
        console.log('Применяем язык:', lang);

        // Обновляем текст кнопки "Перейти к оформлению"
        if (lang === 'ru') {
            checkoutButton.innerText = 'Перейти к оформлению';
        } else if (lang === 'uk') {
            checkoutButton.innerText = 'Перейти до оформлення';
        } else if (lang === 'en') {
            checkoutButton.innerText = 'Proceed to Checkout';
        }

        // Обновляем видимость элементов с data-lang
        document.querySelectorAll('[data-lang]').forEach(element => {
            if (element.getAttribute('data-lang') === lang) {
                element.style.display = 'block';
            } else {
                element.style.display = 'none';
            }
        });

        // Перерисовываем корзину
        renderCart();
    }

    // Отображение товаров в корзине
    function renderCart() {
        cartList.innerHTML = '';
        let total = 0;

        if (cartItems.length === 0) {
            // Если корзина пуста, показываем сообщение
            document.querySelectorAll('.empty-cart-message').forEach(element => {
                if (element.getAttribute('data-lang') === languageSelect.value) {
                    element.style.display = 'block';
                } else {
                    element.style.display = 'none';
                }
            });
            checkoutButton.style.display = 'none';
        } else {
            // Если в корзине есть товары, скрываем сообщение
            document.querySelectorAll('.empty-cart-message').forEach(element => {
                element.style.display = 'none';
            });
            checkoutButton.style.display = 'block';

            // Отображаем товары
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

            // Обновляем общую сумму
            document.querySelectorAll('.total-amount').forEach(element => {
                if (element.getAttribute('data-lang') === languageSelect.value) {
                    element.style.display = 'block';
                    element.querySelector('.total').innerText = total.toFixed(2);
                } else {
                    element.style.display = 'none';
                }
            });
        }
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

    // Переход к оформлению заказа
    checkoutButton.addEventListener('click', () => {
        window.location.href = 'checkout.html';
    });

    // Инициализация корзины
    renderCart();
});
