document.addEventListener('DOMContentLoaded', () => {
    const cartItems = JSON.parse(localStorage.getItem('cart')) || [];
    const cartList = document.querySelector('.cart-items');
    const totalElement = document.querySelector('.total');
    const emptyCartMessage = document.querySelector('.empty-cart-message');
    const checkoutButton = document.querySelector('.checkout-button');
    const languageSelect = document.getElementById('language-select');

    // Загрузка выбранного языка из localStorage
    const savedLanguage = localStorage.getItem('selectedLanguage') || 'ru';
    if (languageSelect) {
        languageSelect.value = savedLanguage;
    }
    changeLanguage(savedLanguage);

    // Обработчик для выбора языка
    if (languageSelect) {
        languageSelect.addEventListener('change', (event) => {
            const selectedLang = event.target.value;
            localStorage.setItem('selectedLanguage', selectedLang);
            changeLanguage(selectedLang);
        });
    }

    // Функция для переключения языка
    function changeLanguage(lang) {
        // Скрываем все элементы с атрибутом data-lang
        document.querySelectorAll('[data-lang]').forEach(element => {
            if (element.getAttribute('data-lang') === lang) {
                element.style.display = 'block'; // Показываем элемент
            } else {
                element.style.display = 'none'; // Скрываем элемент
            }
        });

        // Обновляем текст кнопки "Перейти к оформлению"
        if (checkoutButton) {
            if (lang === 'ru') {
                checkoutButton.innerText = 'Перейти к оформлению';
            } else if (lang === 'uk') {
                checkoutButton.innerText = 'Перейти до оформлення';
            } else if (lang === 'en') {
                checkoutButton.innerText = 'Proceed to Checkout';
            }
        }
    }

    // Отображение товаров в корзине
    function renderCart() {
        cartList.innerHTML = '';
        let total = 0;

        if (cartItems.length === 0) {
            if (emptyCartMessage) {
                emptyCartMessage.style.display = 'block';
            }
            if (checkoutButton) {
                checkoutButton.style.display = 'none';
            }
        } else {
            if (emptyCartMessage) {
                emptyCartMessage.style.display = 'none';
            }
            if (checkoutButton) {
                checkoutButton.style.display = 'block';
            }

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

            if (totalElement) {
                totalElement.innerText = total.toFixed(2);
            }
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
    if (checkoutButton) {
        checkoutButton.addEventListener('click', () => {
            window.location.href = 'checkout.html'; // Перенаправление на checkout.html
        });
    }

    renderCart();
});
