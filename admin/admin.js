document.addEventListener('DOMContentLoaded', () => {
    const loginContainer = document.getElementById('login-container');
    const adminContainer = document.getElementById('admin-container');
    const loginForm = document.getElementById('login-form');
    const errorMessage = document.getElementById('error-message');
    const loader = document.getElementById('loader');
    const refreshButton = document.getElementById('refresh-button');
    const addProductButton = document.getElementById('add-product-button');
    const addProductModal = document.getElementById('add-product-modal');
    const editProductModal = document.getElementById('edit-product-modal');
    const closeModals = document.querySelectorAll('.close-modal');
    const addProductForm = document.getElementById('add-product-form');
    const editProductForm = document.getElementById('edit-product-form');
    const ordersTable = document.getElementById('orders-table');
    const productsTable = document.getElementById('products-table');

    // Хеши логина и пароля
    const ADMIN_USERNAME_HASH = "8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918";
    const ADMIN_PASSWORD_HASH = "240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9";

    // Хеширование SHA-256
    async function hashSHA256(text) {
        const encoder = new TextEncoder();
        const data = encoder.encode(text);
        const hashBuffer = await crypto.subtle.digest("SHA-256", data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(byte => byte.toString(16).padStart(2, "0")).join("");
    }

    // Авторизация
    loginForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        loader.style.display = "flex";

        const username = document.getElementById("username").value;
        const password = document.getElementById("password").value;

        try {
            const hashedUsername = await hashSHA256(username);
            const hashedPassword = await hashSHA256(password);

            if (hashedUsername === ADMIN_USERNAME_HASH && hashedPassword === ADMIN_PASSWORD_HASH) {
                localStorage.setItem('role', 'Admin');
                loginContainer.style.display = "none";
                adminContainer.style.display = "block";
                await loadOrders(); // Загружаем заказы
                await loadProducts(); // Загружаем товары
            } else {
                errorMessage.style.display = "block";
            }
        } catch (error) {
            console.error("Ошибка авторизации:", error);
            alert("Ошибка авторизации");
        } finally {
            loader.style.display = "none";
        }
    });

    // Загрузка заказов
    async function loadOrders() {
        loader.style.display = "flex";
        try {
            const response = await fetch('https://9b9t.shop:8443/api/orders');
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

            const orders = await response.json();
            renderOrders(orders);
        } catch (error) {
            console.error("Ошибка загрузки заказов:", error);
            alert("Не удалось загрузить заказы");
        } finally {
            loader.style.display = "none";
        }
    }

    // Отображение заказов
function renderOrders(orders) {
    const tbody = ordersTable.querySelector('tbody');
    tbody.innerHTML = '';

    for (const orderId in orders) {
        const order = orders[orderId];
        const products = order.products ? Object.entries(order.products) : []; // Используем Object.entries для получения пар [id, количество]

        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${order.info.username}</td>
            <td>${order.info.discord}</td>
            <td>${order.info.email}</td>
            <td>
                <div class="order-products">
                    <button class="toggle-products">Показать товары</button>
                    <ul class="products-list" style="display: none;">
                        ${products.map(([productId, quantity]) => {
                            // Получаем данные о товаре по его ID
                            const product = getProductById(productId);
                            if (product) {
                                return `
                                    <li>
                                        ${product.title?.RU || product.title?.EN || 'Нет названия'} 
                                        x${quantity} ($${product.price || 0})
                                    </li>
                                `;
                            } else {
                                return `
                                    <li>
                                        Товар с ID ${productId} не найден
                                    </li>
                                `;
                            }
                        }).join('')}
                    </ul>
                </div>
            </td>
            <td>$${order.totalPrice.toFixed(2)}</td>
            <td>${order.info.deliveryMethod}</td>
            <td>${order.coordinates ? `X: ${order.coordinates.x}<br>Y: ${order.coordinates.y}<br>Z: ${order.coordinates.z}` : 'Нет данных'}</td>
            <td>${order.date || 'Нет данных'}</td>
            <td>
                <a href="/9b9t.github.io/9b9t/chat.html?orderId=${orderId}" class="chat-button">Чат</a>
            </td>
            <td>
                <button class="delete-order-button" data-order-id="${orderId}">Удалить заказ</button>
            </td>
        `;
        tbody.appendChild(row);
    }

    // Обработчики для кнопок удаления заказов
    const deleteOrderButtons = document.querySelectorAll('.delete-order-button');
    deleteOrderButtons.forEach(button => {
        button.addEventListener('click', async () => {
            const orderId = button.getAttribute('data-order-id');
            await deleteOrder(orderId);
        });
    });

    // Обработчики для кнопок показа/скрытия товаров
    const toggleButtons = document.querySelectorAll('.toggle-products');
    toggleButtons.forEach(button => {
        button.addEventListener('click', () => {
            const productsList = button.nextElementSibling;
            if (productsList.style.display === 'none') {
                productsList.style.display = 'block';
                button.textContent = 'Скрыть товары';
            } else {
                productsList.style.display = 'none';
                button.textContent = 'Показать товары';
            }
        });
    });
}

// Функция для получения товара по его ID
function getProductById(productId) {
    // Здесь нужно реализовать логику получения товара по его ID
    // Например, если у вас есть доступ к списку товаров, можно сделать так:
    const products = JSON.parse(localStorage.getItem('products')) || {};
    return products[productId];
}

    // Удаление заказа
    async function deleteOrder(orderId) {
        loader.style.display = 'flex';
        try {
            const response = await fetch(`https://9b9t.shop:8443/api/orders/${orderId}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) throw new Error('Ошибка при удалении заказа');

            const result = await response.json();
            console.log('Заказ удален:', result);

            // Обновляем список заказов
            await loadOrders();
        } catch (error) {
            console.error('Ошибка:', error);
            alert('Не удалось удалить заказ');
        } finally {
            loader.style.display = 'none';
        }
    }

    // Загрузка товаров
    async function loadProducts() {
        loader.style.display = "flex";
        try {
            const response = await fetch('https://9b9t.shop:8443/api/products');
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

            const products = await response.json();
            renderProducts(products);
        } catch (error) {
            console.error("Ошибка загрузки товаров:", error);
            alert("Не удалось загрузить товары");
        } finally {
            loader.style.display = "none";
        }
    }

    // Отображение товаров
    function renderProducts(products) {
        const tbody = productsTable.querySelector('tbody');
        tbody.innerHTML = '';

        for (const productId in products) {
            const product = products[productId];
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${product.title?.RU || 'Нет названия'}</td>
                <td>${product.category || 'Нет категории'}</td>
                <td>${product.price || '0'}$</td>
                <td>${product.description?.RU || 'Нет описания'}</td>
                <td><img src="${product.imageUrl || 'https://via.placeholder.com/150'}" alt="Изображение" width="50"></td>
                <td>
                    <button class="edit-button" data-id="${productId}">Редактировать</button>
                    <button class="delete-button" data-id="${productId}">Удалить</button>
                </td>
            `;
            tbody.appendChild(row);
        }

        // Обработчики для кнопок редактирования
        const editButtons = document.querySelectorAll('.edit-button');
        editButtons.forEach(button => {
            button.addEventListener('click', async () => {
                const productId = button.getAttribute('data-id');
                await openEditModal(productId);
            });
        });

        // Обработчики для кнопок удаления
        const deleteButtons = document.querySelectorAll('.delete-button');
        deleteButtons.forEach(button => {
            button.addEventListener('click', async () => {
                const productId = button.getAttribute('data-id');
                await deleteProduct(productId);
            });
        });
    }

    // Удаление товара
    async function deleteProduct(productId) {
        loader.style.display = "flex";
        try {
            const response = await fetch(`https://9b9t.shop:8443/api/products/${productId}`, {
                method: 'DELETE',
            });

            if (!response.ok) throw new Error('Ошибка при удалении товара');

            await loadProducts(); // Обновляем список товаров после удаления
        } catch (error) {
            console.error('Ошибка:', error);
            alert('Не удалось удалить товар');
        } finally {
            loader.style.display = "none";
        }
    }

    // Открытие модального окна для редактирования товара
    async function openEditModal(productId) {
        loader.style.display = 'flex';
        try {
            const response = await fetch(`https://9b9t.shop:8443/api/products/${productId}`);
            if (!response.ok) throw new Error('Ошибка загрузки данных товара');

            const product = await response.json();

            // Заполняем форму данными товара
            document.getElementById('edit-product-category').value = product.category || '';
            document.getElementById('edit-product-title-ru').value = product.title?.RU || '';
            document.getElementById('edit-product-title-uk').value = product.title?.UK || '';
            document.getElementById('edit-product-title-en').value = product.title?.EN || '';
            document.getElementById('edit-product-description-ru').value = product.description?.RU || '';
            document.getElementById('edit-product-description-uk').value = product.description?.UK || '';
            document.getElementById('edit-product-description-en').value = product.description?.EN || '';
            document.getElementById('edit-product-price').value = product.price || '';
            document.getElementById('edit-product-image-url').value = product.imageUrl || '';

            // Устанавливаем ID товара в форму
            editProductForm.setAttribute('data-id', productId);

            // Открываем модальное окно
            editProductModal.style.display = 'flex';
        } catch (error) {
            console.error('Ошибка:', error);
            alert('Не удалось загрузить данные товара');
        } finally {
            loader.style.display = 'none';
        }
    }

    // Сохранение изменений товара
    editProductForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        loader.style.display = 'flex';

        const price = parseFloat(document.getElementById('edit-product-price').value);
        if (price < 0.1) {
            alert('Минимальная цена товара — 0.1$');
            loader.style.display = 'none';
            return;
        }

        const productId = editProductForm.getAttribute('data-id'); // Получаем ID товара
        const updatedProduct = {
            category: document.getElementById('edit-product-category').value,
            title: {
                RU: document.getElementById('edit-product-title-ru').value,
                UK: document.getElementById('edit-product-title-uk').value,
                EN: document.getElementById('edit-product-title-en').value,
            },
            description: {
                RU: document.getElementById('edit-product-description-ru').value,
                UK: document.getElementById('edit-product-description-uk').value,
                EN: document.getElementById('edit-product-description-en').value,
            },
            price: price,
            imageUrl: document.getElementById('edit-product-image-url').value,
            isAvailable: true,
        };

        try {
            const response = await fetch(`https://9b9t.shop:8443/api/products/${productId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(updatedProduct),
            });

            if (!response.ok) throw new Error('Ошибка при сохранении изменений');

            const result = await response.json();
            console.log('Товар обновлен:', result);

            // Закрываем модальное окно и обновляем список товаров
            editProductModal.style.display = 'none';
            await loadProducts();
        } catch (error) {
            console.error('Ошибка:', error);
            alert('Не удалось сохранить изменения');
        } finally {
            loader.style.display = 'none';
        }
    });

    // Добавление товара
    addProductForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        loader.style.display = 'flex';

        const price = parseFloat(document.getElementById('product-price').value);
        if (price < 0.1) {
            alert('Минимальная цена товара — 0.1$');
            loader.style.display = 'none';
            return;
        }

        const productData = {
            category: document.getElementById('product-category').value,
            title: {
                RU: document.getElementById('product-title-ru').value,
                UK: document.getElementById('product-title-uk').value,
                EN: document.getElementById('product-title-en').value,
            },
            description: {
                RU: document.getElementById('product-description-ru').value,
                UK: document.getElementById('product-description-uk').value,
                EN: document.getElementById('product-description-en').value,
            },
            price: price,
            imageUrl: document.getElementById('product-image-url').value,
            isAvailable: true,
        };

        try {
            const response = await fetch('https://9b9t.shop:8443/api/products', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    products: {
                        [crypto.randomUUID()]: productData,
                    },
                }),
            });

            if (!response.ok) throw new Error('Ошибка при добавлении товара');

            const result = await response.json();
            console.log('Товар добавлен:', result);
            addProductModal.style.display = 'none';
            await loadProducts(); // Обновляем список товаров после добавления
        } catch (error) {
            console.error('Ошибка:', error);
            alert('Не удалось добавить товар');
        } finally {
            loader.style.display = 'none';
        }
    });

    // Открытие модального окна для добавления товара
    addProductButton.addEventListener('click', () => {
        addProductModal.style.display = 'flex';
    });

    // Закрытие модальных окон
    closeModals.forEach(closeModal => {
        closeModal.addEventListener('click', () => {
            addProductModal.style.display = 'none';
            editProductModal.style.display = 'none';
        });
    });

    // Обновление данных
    refreshButton.addEventListener('click', async () => {
        await loadOrders(); // Обновляем заказы
        await loadProducts(); // Обновляем товары
    });
});
