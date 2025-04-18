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
    const themeToggleButton = document.getElementById('theme-toggle');

    // Хешированные данные для авторизации
    const users = [
        {
            usernameHash: '8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918', 
            passwordHash: 'd396111421e8b2ed6edaf4aed7a6a01a064a0f15b85d5783d5533cb87dd93106', 
            role: 'admin',
        },
        {
            usernameHash: 'b465361ffa25886d97c693b209bd347e600d1b14d397a8e42b7b7c408f32f0a9', 
            passwordHash: '635b589ffadc73a0f83f97ff8ce88fc9a93478ecc51a2dd82e3a455b6c225ead', 
            role: 'moderator',
        },
    ];
    // Функция для хеширования текста с использованием SHA-256
    async function hashSHA256(text) {
    const encoder = new TextEncoder();
    const data = encoder.encode(text);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(byte => byte.toString(16).padStart(2, '0')).join('');
    return hashHex;
    }

    // Обработчик авторизации
    loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    loader.style.display = 'flex';

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    try {
        // Хешируем введенные логин и пароль
        const usernameHash = await hashSHA256(username);
        const passwordHash = await hashSHA256(password);

        // Поиск пользователя по хешу логина и пароля
        const user = users.find(
            u => u.usernameHash === usernameHash && u.passwordHash === passwordHash
        );

        if (user) {
            // Проверка, заблокирован ли модератор
            if (user.role === 'moderator' && localStorage.getItem('moderator_blocked')) {
                errorMessage.textContent = 'Вход для модератора заблокирован администратором!';
                errorMessage.style.display = 'block';
                loader.style.display = 'none';
                return;
            }

            // Сохраняем роль в localStorage
            localStorage.setItem('role', user.role);

            loginContainer.style.display = 'none';
            adminContainer.style.display = 'block';

            // Настройка интерфейса в зависимости от роли
            configureUI(user.role);

            // Загружаем данные
            loadOrders();
            if (user.role === 'admin') {
                loadProducts();
                addModeratorBlockButton(); // Добавляем кнопку блокировки модератора
            }
        } else {
            errorMessage.textContent = 'Неверный логин или пароль!';
            errorMessage.style.display = 'block';
        }
    } catch (error) {
        console.error('Ошибка при авторизации:', error);
        alert('Ошибка при авторизации');
    } finally {
        loader.style.display = 'none';
    }
});
    // Функция для настройки интерфейса в зависимости от роли
    function configureUI(role) {
    const addProductButton = document.getElementById('add-product-button');
    const refreshButton = document.getElementById('refresh-button');
    const tabButtons = document.querySelectorAll('.tab-button');
    const editButtons = document.querySelectorAll('.edit-button');
    const deleteButtons = document.querySelectorAll('.delete-button');

    if (role === 'moderator') {
        // Делаем кнопки и вкладки недоступными для модератора
        addProductButton.disabled = true;
        refreshButton.disabled = false;
        editButtons.forEach(button => button.disabled = true);
        deleteButtons.forEach(button => button.disabled = true);

        // Добавляем подсказки для недоступных элементов
        addProductButton.title = 'Доступно для Администрации';
        editButtons.forEach(button => button.title = 'Доступно для Администрации');
        deleteButtons.forEach(button => button.title = 'Доступно для Администрации');

        // Добавляем класс для изменения курсора
        addProductButton.classList.add('disabled-button');
        editButtons.forEach(button => button.classList.add('disabled-button'));
        deleteButtons.forEach(button => button.classList.add('disabled-button'));

        // Делаем вкладки "Товары" и "Аналитика" недоступными
        tabButtons.forEach(button => {
            if (button.getAttribute('data-tab') !== 'orders') {
                button.disabled = true;
                button.title = 'Доступно для Администрации';
                button.classList.add('disabled-button');
            }
        });

        // Показываем только вкладку "Заказы" по умолчанию
        document.querySelector('.tab-button[data-tab="orders"]').click();
    } else if (role === 'admin') {
        // Администратору все доступно
        addProductButton.disabled = false;
        refreshButton.disabled = false;
        editButtons.forEach(button => button.disabled = false);
        deleteButtons.forEach(button => button.disabled = false);
        tabButtons.forEach(button => {
            button.disabled = false;
            button.title = '';
            button.classList.remove('disabled-button');
        });
    }
    }

    // Добавляем кнопку блокировки модератора для администратора
    function addModeratorBlockButton() {
    const adminHeader = document.querySelector('.admin-header');
    if (!adminHeader) return;

    // Создаем кнопку
    const blockButton = document.createElement('button');
    blockButton.id = 'block-moderator-button';
    blockButton.textContent = localStorage.getItem('moderator_blocked')
        ? 'Разблокировать модератора'
        : 'Заблокировать модератора';
    blockButton.classList.add('block-moderator-button');

    // Обработчик для кнопки
    blockButton.addEventListener('click', () => {
        const isBlocked = localStorage.getItem('moderator_blocked');

        if (isBlocked) {
            localStorage.removeItem('moderator_blocked'); // Разблокируем модератора
            blockButton.textContent = 'Заблокировать модератора';
            alert('Модератор разблокирован!');
        } else {
            localStorage.setItem('moderator_blocked', 'true'); // Блокируем модератора
            blockButton.textContent = 'Разблокировать модератора';
            alert('Модератор заблокирован!');
        }
    });

    // Добавляем кнопку в интерфейс
    adminHeader.appendChild(blockButton);
    }

    // Переключение темы (день/ночь)
    themeToggleButton.addEventListener('click', () => {
    document.body.classList.toggle('dark-theme');
    const isDarkTheme = document.body.classList.contains('dark-theme');
    localStorage.setItem('theme', isDarkTheme ? 'dark' : 'light');
    updateThemeIcon(isDarkTheme);
    });

    // Функция для обновления иконки темы
    function updateThemeIcon(isDarkTheme) {
    const moonIcon = document.querySelector('.moon-icon');
    const sunIcon = document.querySelector('.sun-icon');

    if (isDarkTheme) {
        moonIcon.style.display = 'none';
        sunIcon.style.display = 'block';
    } else {
        moonIcon.style.display = 'block';
        sunIcon.style.display = 'none';
    }
    }

    // Применение сохраненной темы при загрузке страницы
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
    document.body.classList.add('dark-theme');
    updateThemeIcon(true);
    } else {
    document.body.classList.remove('dark-theme');
    updateThemeIcon(false);
    }    

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
// Отображение заказов
async function renderOrders(orders) {
    const tbody = ordersTable.querySelector('tbody');
    tbody.innerHTML = '';

    const role = localStorage.getItem('role'); // Получаем роль пользователя

    for (const orderId in orders) {
        const order = orders[orderId];
        const products = order.products ? Object.entries(order.products) : [];

        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${order.info.username}</td>
            <td>${order.info.discord}</td>
            <td>${order.info.email}</td>
            <td>
                <div class="order-products">
                    <button class="toggle-products">Показать товары</button>
                    <ul class="products-list" style="display: none;">
                        ${products.map(([productId, quantity]) => `
                            <li id="product-${productId}">Товар загружается...</li>
                        `).join('')}
                    </ul>
                </div>
            </td>
            <td>$${order.totalPrice.toFixed(2)}</td>
            <td>${order.info.deliveryMethod}</td>
            <td>${order.coordinates ? `X: ${order.coordinates.x}<br>Y: ${order.coordinates.y}<br>Z: ${order.coordinates.z}` : 'Нет данных'}</td>
            <td>${order.info.formattedISO || 'Нет данных'}</td>
            <td>
                <a href="/9b9t.github.io/9b9t/chat.html?orderId=${orderId}" class="chat-button">Чат</a>
            </td>
            <td>
                <button class="delete-order-button ${role === 'moderator' ? 'disabled-button' : ''}" 
                        data-order-id="${orderId}" 
                        ${role === 'moderator' ? 'disabled' : ''}
                        title="${role === 'moderator' ? 'Доступно для Администрации' : ''}">
                    Удалить заказ
                </button>
            </td>
        `;
        tbody.appendChild(row);

        // Загружаем данные о товарах
        for (const [productId, quantity] of products) {
            fetchProductById(productId).then(product => {
                const productElement = document.getElementById(`product-${productId}`);
                if (product) {
                    productElement.innerHTML = `
                        <img src="${product.imageUrl}" width="50" alt="${product.title?.RU || 'Нет названия'}">
                        ${product.title?.RU || product.title?.EN || 'Нет названия'} 
                        x${quantity} ($${product.price || 0})
                    `;
                } else {
                    productElement.innerText = `Товар с ID ${productId} не найден`;
                }
            }).catch(error => {
                console.error(`Ошибка загрузки товара ${productId}:`, error);
            });
        }
    }

    // Добавляем обработчики событий (скрытие/показ товаров)
    document.querySelectorAll('.toggle-products').forEach(button => {
        button.addEventListener('click', () => {
            const productsList = button.nextElementSibling;
            productsList.style.display = productsList.style.display === 'none' ? 'block' : 'none';
            button.textContent = productsList.style.display === 'none' ? 'Показать товары' : 'Скрыть товары';
        });
    });

    // Добавляем обработчики для удаления заказов (только для администратора)
    if (role === 'admin') {
        document.querySelectorAll('.delete-order-button').forEach(button => {
            button.addEventListener('click', async () => {
                const orderId = button.getAttribute('data-order-id');
                await deleteOrder(orderId);
            });
        });
    }
}
    // Удаление заказа
    async function deleteOrder(orderId) {
        loader.style.display = 'flex';
        try {
            const response = await fetch(`https://9b9t.shop:8443/api/9b9t/orders/${orderId}`, {
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
            const response = await fetch('https://9b9t.shop:8443/api/9b9t/products');
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
            const response = await fetch(`https://9b9t.shop:8443/api/9b9t/products/${productId}`, {
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
            const response = await fetch(`https://9b9t.shop:8443/api/9b9t/products/${productId}`);
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
            document.getElementById('edit-product-is-new').checked = product.isNew || false; // Устанавливаем значение чекбокса

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
            isNew: document.getElementById('edit-product-is-new').checked, // Сохраняем значение чекбокса
        };

        try {
            const response = await fetch(`https://9b9t.shop:8443/api/9b9t/products/${productId}`, {
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
            isNew: document.getElementById('product-is-new').checked, // Сохраняем значение чекбокса
        };

        try {
            const response = await fetch('https://9b9t.shop:8443/api/9b9t/products', {
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

    // Переключение между вкладками
    const tabButtons = document.querySelectorAll('.tab-button');
    const tableWrappers = document.querySelectorAll('.table-wrapper');

    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Убираем активный класс у всех кнопок и таблиц
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tableWrappers.forEach(table => table.classList.remove('active'));

            // Добавляем активный класс к выбранной кнопке и соответствующей таблице
            button.classList.add('active');
            const tabName = button.getAttribute('data-tab');
            document.querySelector(`.table-wrapper[data-tab="${tabName}"]`).classList.add('active');

            // Если выбрана вкладка "Аналитика", загружаем данные
            if (tabName === 'analytics') {
                loadAnalytics();
            }
        });
    });

    // По умолчанию показываем вкладку "Заказы"
    document.querySelector('.tab-button[data-tab="orders"]').click();

    // Функция для загрузки данных аналитики
    async function loadAnalytics() {
        loader.style.display = 'flex';
        try {
            const response = await fetch('https://9b9t.shop:8443/api/9b9t/orders');
            if (!response.ok) throw new Error('Ошибка загрузки данных');

            const orders = await response.json();

            // Анализ данных
            const productSales = await analyzeProductSales(orders);
            const salesByTime = analyzeSalesByTime(orders);
            const salesByCategory = await analyzeSalesByCategory(orders);

            // Отрисовка графиков
            renderPopularProductsChart(productSales);
            renderSalesByTimeChart(salesByTime);
            renderSalesByCategoryChart(salesByCategory);
        } catch (error) {
            console.error('Ошибка загрузки аналитики:', error);
            alert('Не удалось загрузить данные для аналитики');
        } finally {
            loader.style.display = 'none';
        }
    }

    // Анализ популярности товаров
    async function analyzeProductSales(orders) {
        const productSales = {};

        for (const orderId in orders) {
            const order = orders[orderId];
            for (const productId in order.products) {
                const quantity = order.products[productId];
                if (!productSales[productId]) {
                    productSales[productId] = 0;
                }
                productSales[productId] += quantity;
            }
        }

        // Получаем названия товаров
        const productNames = await getProductNames(Object.keys(productSales));

        // Заменяем UUID на названия товаров
        const result = {};
        for (const productId in productSales) {
            const productName = productNames[productId] || `Товар ${productId}`;
            result[productName] = productSales[productId];
        }

        return result;
    }

    // Получение названий товаров по их UUID
    async function getProductNames(productIds) {
        const productNames = {};

        for (const productId of productIds) {
            const product = await fetchProductById(productId);
            if (product) {
                productNames[productId] = product.title?.RU || product.title?.EN || `Товар ${productId}`;
            } else {
                productNames[productId] = `Товар ${productId}`;
            }
        }

        return productNames;
    }

    // Анализ продаж по времени
    function analyzeSalesByTime(orders) {
        const salesByTime = {};

        for (const orderId in orders) {
            const order = orders[orderId];
            const hour = new Date(order.info.formattedISO).getHours();
            if (!salesByTime[hour]) {
                salesByTime[hour] = 0;
            }
            salesByTime[hour] += 1;
        }

        return salesByTime;
    }

    // Анализ продаж по категориям
    async function analyzeSalesByCategory(orders) {
        const salesByCategory = {};

        for (const orderId in orders) {
            const order = orders[orderId];
            for (const productId in order.products) {
                const product = await fetchProductById(productId);
                if (product) {
                    const category = product.category || 'Без категории';
                    if (!salesByCategory[category]) {
                        salesByCategory[category] = 0;
                    }
                    salesByCategory[category] += order.products[productId];
                }
            }
        }

        return salesByCategory;
    }

    // Отрисовка графика популярных товаров
    function renderPopularProductsChart(productSales) {
        const ctx = document.getElementById('popular-products-chart').getContext('2d');
        const labels = Object.keys(productSales);
        const data = Object.values(productSales);

        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Количество продаж',
                    data: data,
                    backgroundColor: 'rgba(75, 192, 192, 0.2)',
                    borderColor: 'rgba(75, 192, 192, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }

    // Отрисовка графика продаж по времени
    function renderSalesByTimeChart(salesByTime) {
        const ctx = document.getElementById('sales-by-time-chart').getContext('2d');
        const labels = Object.keys(salesByTime).map(hour => `${hour}:00`);
        const data = Object.values(salesByTime);

        new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Количество заказов',
                    data: data,
                    backgroundColor: 'rgba(153, 102, 255, 0.2)',
                    borderColor: 'rgba(153, 102, 255, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }

    // Отрисовка графика продаж по категориям
    function renderSalesByCategoryChart(salesByCategory) {
        const ctx = document.getElementById('sales-by-category-chart').getContext('2d');
        const labels = Object.keys(salesByCategory);
        const data = Object.values(salesByCategory);

        new Chart(ctx, {
            type: 'pie',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Продажи по категориям',
                    data: data,
                    backgroundColor: [
                        'rgba(255, 99, 132, 0.2)',
                        'rgba(54, 162, 235, 0.2)',
                        'rgba(255, 206, 86, 0.2)',
                        'rgba(75, 192, 192, 0.2)',
                        'rgba(153, 102, 255, 0.2)'
                    ],
                    borderColor: [
                        'rgba(255, 99, 132, 1)',
                        'rgba(54, 162, 235, 1)',
                        'rgba(255, 206, 86, 1)',
                        'rgba(75, 192, 192, 1)',
                        'rgba(153, 102, 255, 1)'
                    ],
                    borderWidth: 1
                }]
            }
        });
    }

    // Функция для получения товара по его ID
    async function fetchProductById(productId) {
        try {
            const response = await fetch(`https://9b9t.shop:8443/api/9b9t/products/${productId}`);
            if (!response.ok) throw new Error(`Ошибка загрузки товара с ID: ${productId}`);

            return await response.json();
        } catch (error) {
            console.error(`Ошибка загрузки товара ${productId}:`, error);
            return null;
        }
    }
});
