document.addEventListener('DOMContentLoaded', () => {
    const languageSelect = document.getElementById('language-select');
    const cartCount = document.querySelector('.cart-count');

    // Функция для загрузки продуктов с сервера
    function loadProducts() {
        fetch('http://81.94.159.122:8080/api/products') 
            .then(response => response.json()) 
            .then(products => {
                const productsContainer = document.querySelector('.products');
                productsContainer.innerHTML = '';

                products.forEach(product => {
                    const productElement = document.createElement('div');
                    productElement.classList.add('product');
                    productElement.dataset.id = product.id;
                    productElement.dataset.price = product.price;

                    productElement.innerHTML = `
                        <img src="${product.imageUrl}" alt="${product.nameRu}">
                        <h2 data-lang="ru">${product.nameRu}</h2>
                        <h2 data-lang="uk">${product.nameUk}</h2>
                        <h2 data-lang="en">${product.nameEn}</h2>
                        <p data-lang="ru">Цена: $${product.price}</p>
                        <p data-lang="uk">Ціна: $${product.price}</p>
                        <p data-lang="en">Price: $${product.price}</p>
                        <button class="add-to-cart">Добавить в корзину</button>
                    `;

                    productsContainer.appendChild(productElement);
                });

                // После загрузки продуктов — назначаем обработчики на кнопки "Добавить в корзину"
                attachCartHandlers();
            })
            .catch(error => console.error('Ошибка при загрузке продуктов:', error));
    }

    // Функция для добавления обработчиков на кнопки "Добавить в корзину"
    function attachCartHandlers() {
        document.querySelectorAll('.add-to-cart').forEach(button => {
            button.addEventListener('click', () => {
                const product = button.closest('.product');
                const productId = product.getAttribute('data-id');
                const productName = product.querySelector('h2[data-lang="ru"]').innerText;
                const productPrice = parseFloat(product.getAttribute('data-price'));
                const productImage = product.querySelector('img').src;

                let cart = JSON.parse(localStorage.getItem('cart')) || [];
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

                localStorage.setItem('cart', JSON.stringify(cart));
                updateCartCount();
            });
        });
    }

    // Обновление счётчика товаров в корзине
    function updateCartCount() {
        const cart = JSON.parse(localStorage.getItem('cart')) || [];
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        cartCount.innerText = totalItems;
    }

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

    // Загружаем продукты при загрузке страницы
    loadProducts();
    updateCartCount();
});
