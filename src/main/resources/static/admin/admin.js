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
    const logoutButton = document.getElementById('logout-button');
    const ordersTableBody = document.querySelector('#orders-table tbody');
    const usernameLabel = document.querySelector('label[for="username"]');




    // Элементы для управления промокодами
    const generatePromoBtn = document.getElementById('generate-promo-btn');
    const promoCodeInput = document.getElementById('promo-code');
    const promoTypeSelect = document.getElementById('promo-type');
    const promoValueInput = document.getElementById('promo-value');
    const promoValueSuffix = document.getElementById('promo-value-suffix');
    const promoValueContainer = document.getElementById('promo-value-container');
    const promoTargetSelect = document.getElementById('promo-target');
    const promoMinOrderInput = document.getElementById('promo-min-order');
    const promoMaxUsesInput = document.createElement('input');
    const addPromoBtn = document.getElementById('add-promo-btn');
    const promoMessage = document.getElementById('promo-message');
    const promoTable = document.getElementById('promo-table').querySelector('tbody');
    const copyPromoBtn = document.getElementById('copy-promo-btn');

    // Настройка поля для максимального количества использований
    promoMaxUsesInput.type = 'number';
    promoMaxUsesInput.id = 'promo-max-uses';
    promoMaxUsesInput.placeholder = 'Макс. использований (0 = без лимита)';
    promoMaxUsesInput.min = '0';
    promoMaxUsesInput.value = '0';
    promoMaxUsesInput.className = 'promo-control-input';
    document.querySelector('.promo-controls').insertBefore(promoMaxUsesInput, addPromoBtn);

    // Секретный ключ для авторизации (должен совпадать с API_SECRET в ProductController и MaintenanceController)
    const API_SECRET = "test";

    // Получаем authToken из localStorage или генерируем новый
    function getAuthToken() {
        return `Bearer ${API_SECRET}`;
    }

    // Хешированные данные для авторизации
    const users = [
        {
            usernameHash: '14019953baaf598284741f15d39ebad14c09e2e7d70e14240d22e09f1a542181',
            passwordHash: '724ee8525fd528b8ac5ede40fd9fb15048b5c00e4c86a828b3641f80c27e3064',
            role: 'admin',
            server: '9b9t'
        },
        {
            usernameHash: '3d56b9501bd6167bfdb96f72e2ffb09776c0678428ef3ed6b6b9e536447ebb56',
            passwordHash: 'e30bca7e270c84f10c531f8f999034f28799ef6a660d35e4cdb86a0246769474',
            role: 'moderator',
            server: '9b9t'
        },
        {
            usernameHash: 'adc32ec674a8e58e9b661856beb0db36ae2b542388800829700097ee5f37a3a1',
            passwordHash: 'de4455aa92230d8a2e8f061ac4170a0885c25c68f1684011a65fc88f9609f473',
            role: 'admin',
            server: '6b6t'
        },
        {
            usernameHash: 'adbacbf2fea81a2159eb2af9e2170fd018b85af23b4f3e06e3301b5af780f5b3',
            passwordHash: '443def92e889d868bfc7a3df83bd610907bec5182c8c2a34f710724c48cb13de',
            role: 'moderator',
            server: '6b6t'
        }
    ];

    // Функция для хеширования
    async function hashSHA256(text) {
        const encoder = new TextEncoder();
        const data = encoder.encode(text);
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hashHex = hashArray.map(byte => byte.toString(16).padStart(2, '0')).join('');
        return hashHex;
    }

    // Сохраняем захэшированные логин и пароль
    async function loginAdmin(login, password) {
        const loginHash = await hashSHA256(login);
        const passwordHash = await hashSHA256(password);
        localStorage.setItem('adminLogin', login); // сохраняем оригинальный логин
        localStorage.setItem('adminPassword', password); // сохраняем оригинальный пароль
        localStorage.setItem('adminLoginHash', loginHash);
        localStorage.setItem('adminPasswordHash', passwordHash);
    }

    // Функция для получения базового URL API в зависимости от сервера
    function getApiBaseUrl() {
        const server = localStorage.getItem('server') || '9b9t';
        return `https://endles.fun/api/${server}`;
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


            const user = users.find(
                u => u.usernameHash === usernameHash && u.passwordHash === passwordHash
            );

            if (user) {
                // Проверка, заблокирован ли модератор (только для текущего сервера)
                if (user.role === 'moderator') {
                    const serverBlockKey = `moderator_blocked_${user.server}`;
                    if (localStorage.getItem(serverBlockKey)) {
                        errorMessage.textContent = 'Вход для модератора заблокирован администратором!';
                        errorMessage.style.display = 'block';
                        loader.style.display = 'none';
                        return;
                    }
                }


                localStorage.setItem('role', user.role);
                localStorage.setItem('server', user.server);

                loginContainer.style.display = 'none';
                adminContainer.style.display = 'block';

                // Настройка интерфейса в зависимости от роли
                configureUI(user.role);

                // Загружаем данные
                loadOrders();
                if (user.role === 'admin') {
                    loadProducts();
                    loadPromocodes();
                    addModeratorBlockButton();
                    setupPromoCodeHandlers();
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

            // Добавляем кнопку технических работ для администратора
            const maintenanceButton = document.createElement('button');
                maintenanceButton.id = 'maintenance-toggle';
                maintenanceButton.textContent = 'Технические работы: ВЫКЛ';
                maintenanceButton.classList.add('maintenance-button');

                // Функция для обновления состояния кнопки
                const updateMaintenanceButton = (isActive) => {
                    maintenanceButton.textContent = isActive
                        ? 'Технические работы: ВКЛ'
                        : 'Технические работы: ВЫКЛ';
                    maintenanceButton.classList.toggle('active', isActive);
                };

                // Проверяем текущий статус техработ
                fetch('/api/maintenance/status')
                    .then(response => response.json())
                    .then(data => {
                        const isMaintenance = !data.work;
                        updateMaintenanceButton(isMaintenance);
                        localStorage.setItem('maintenanceMode', isMaintenance.toString());

                        // Показываем уведомление в админке если техработы активны
                        if (isMaintenance) {
                            showAdminNotification('Режим техработ активен! Обычные пользователи не могут получить доступ к сайту.');
                        }
                    })
                    .catch(error => {
                        console.error('Ошибка получения статуса техработ:', error);
                        const savedMode = localStorage.getItem('maintenanceMode') === 'true';
                        updateMaintenanceButton(savedMode);
                    });

                // Добавляем кнопку в интерфейс
                const adminHeader = document.querySelector('.admin-header');
                if (adminHeader) {
                    adminHeader.appendChild(maintenanceButton);
                }

                // Обработчик клика по кнопке
                // В функции configureUI для админа:
                maintenanceButton.addEventListener('click', () => {
                    const currentMode = maintenanceButton.classList.contains('active');
                    const newMode = !currentMode;
                    const server = localStorage.getItem('server') || '9b9t';

                    fetch('/api/maintenance/toggle?server=' + server, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'X-API-Secret': API_SECRET
                        },
                        body: JSON.stringify({ work: !newMode })
                    })
                    .then(response => {
                        if (!response.ok) throw new Error('Ошибка сервера');
                        return response.text();
                    })
                    .then(message => {
                        localStorage.setItem('maintenanceMode', newMode.toString());
                        updateMaintenanceButton(newMode);

                        if (newMode) {
                            showAdminNotification('Технические работы включены для сервера ' + server + '!');
                        } else {
                            showAdminNotification('Технические работы выключены для сервера ' + server + '!');
                        }
                    })
                    .catch(error => {
                        console.error('Ошибка переключения режима:', error);
                        alert('Не удалось изменить режим техработ');
                    });
                });

                // При загрузке статуса:
                fetch('/api/maintenance/status?server=' + (localStorage.getItem('server') || '9b9t'))
                    .then(response => response.json())
                    .then(data => {
                        const isMaintenance = !data.work;
                        updateMaintenanceButton(isMaintenance);
                        localStorage.setItem('maintenanceMode', isMaintenance.toString());
                    });

                // Добавляем кнопку блокировки модератора
                addModeratorBlockButton();
            }

            // Функция для показа уведомлений в админке
            function showAdminNotification(message) {
                // Удаляем предыдущее уведомление если есть
                const existingNotification = document.getElementById('admin-notification');
                if (existingNotification) {
                    existingNotification.remove();
                }

                const notification = document.createElement('div');
                notification.id = 'admin-notification';
                notification.style.position = 'fixed';
                notification.style.bottom = '20px';
                notification.style.right = '20px';
                notification.style.backgroundColor = '#333';
                notification.style.color = 'white';
                notification.style.padding = '15px';
                notification.style.borderRadius = '5px';
                notification.style.zIndex = '1000';
                notification.style.maxWidth = '300px';
                notification.textContent = message;

                document.body.appendChild(notification);

                // Автоматически скрываем через 5 секунд
                setTimeout(() => {
                    notification.style.transition = 'opacity 1s';
                    notification.style.opacity = '0';
                    setTimeout(() => notification.remove(), 1000);
                }, 5000);
            }
        }


    // Блокировка/разблокировка модератора
    function addModeratorBlockButton() {
        const adminHeader = document.querySelector('.admin-header');
        if (!adminHeader) return;

        // Проверяем, существует ли кнопка уже
        const existingButton = document.getElementById('block-moderator-button');
        if (existingButton) return; // Если кнопка уже есть, выходим из функции

        const blockButton = document.createElement('button');
        blockButton.id = 'block-moderator-button';

        const currentServer = localStorage.getItem('server') || '9b9t';
        const serverBlockKey = `moderator_blocked_${currentServer}`;

        blockButton.textContent = localStorage.getItem(serverBlockKey)
            ? 'Разблокировать модератора'
            : 'Заблокировать модератора';
        blockButton.classList.add('block-moderator-button');

        blockButton.addEventListener('click', () => {
            const isBlocked = localStorage.getItem(serverBlockKey);

            if (isBlocked) {
                localStorage.removeItem(serverBlockKey);
                blockButton.textContent = 'Заблокировать модератора';
                alert('Модератор разблокирован!');
            } else {
                localStorage.setItem(serverBlockKey, 'true');
                blockButton.textContent = 'Разблокировать модератора';
                alert('Модератор заблокирован!');
            }
        });

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



    // ====================  промокодами ====================

    async function fetchPromocodes() {
        try {
            const response = await fetch(`${getApiBaseUrl()}/promocodes`);
            if (!response.ok) throw new Error('Ошибка загрузки промокодов');
            const data = await response.json();

            // Преобразуем данные сервера в наш формат
            const promocodes = {};
            for (const [code, value] of Object.entries(data)) {
                promocodes[code] = {
                    id: code,
                    code,
                    type: value.type || 'fixed',
                    value: value.value || value,
                    minOrder: value.minOrder || 0,
                    maxUses: value.maxUses || null,
                    usedCount: value.usedCount || 0,
                    target: value.target || '',
                    isActive: value.isActive !== false,
                    createdAt: value.createdAt || new Date().toISOString()
                };
            }
            return promocodes;
        } catch (error) {
            console.error('Ошибка:', error);
            return {};
        }
    }

    async function addPromocode(promoData) {
        try {
            // Преобразуем данные в формат сервера
            const serverFormat = {};
            for (const [code, details] of Object.entries(promoData)) {
                serverFormat[code] = {
                    value: details.value,
                    type: details.type,
                    minOrder: details.minOrder,
                    maxUses: details.maxUses,
                    target: details.target,
                    isActive: details.isActive
                };
            }

            const response = await fetch(`${getApiBaseUrl()}/promocodes`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(serverFormat)
            });

            if (!response.ok) throw new Error('Ошибка при добавлении промокода');
            return await response.json();
        } catch (error) {
            console.error('Ошибка:', error);
            throw error;
        }
    }

    async function deletePromocode(code) {
        try {
            const response = await fetch(`${getApiBaseUrl()}/promocodes/${code}`, {
                method: 'DELETE'
            });

            if (!response.ok) throw new Error('Ошибка при удалении промокода');
            return await response.json();
        } catch (error) {
            console.error('Ошибка:', error);
            throw error;
        }
    }

    async function updatePromocode(code, promoData) {
        try {
            // Сначала удаляем старый промокод
            await deletePromocode(code);

            // Затем добавляем обновленный
            const newPromo = {};
            newPromo[code] = promoData;
            return await addPromocode(newPromo);
        } catch (error) {
            console.error('Ошибка:', error);
            throw error;
        }
    }

    // ==================== для работы с промокодами ====================

    async function loadPromocodes() {
        loader.style.display = 'flex';
        try {
            const promocodes = await fetchPromocodes();
            promoTable.innerHTML = '';

            Object.values(promocodes).forEach(promo => {
                const row = document.createElement('tr');

                // Тип промо
                let typeName = '';
                switch(promo.type) {
                    case 'percentage': typeName = 'Процентная скидка'; break;
                    case 'fixed': typeName = 'Фиксированная скидка'; break;
                    case 'free_shipping': typeName = 'Бесплатная доставка'; break;
                    case 'item_discount': typeName = 'Скидка на товар'; break;
                    case 'delivery_discount': typeName = 'Скидка на доставку'; break;
                    case 'referral': typeName = 'Реферальный'; break;
                    default: typeName = promo.type;
                }

                // Значение промокода
                let valueDisplay = '';
                if (promo.type === 'percentage') {
                    valueDisplay = `${promo.value}%`;
                } else if (promo.type === 'fixed') {
                    valueDisplay = `${promo.value}₽`;
                } else if (promo.type === 'free_shipping') {
                    valueDisplay = 'Бесплатно';
                } else {
                    valueDisplay = promo.value || '-';
                }

                // Лимит использований
                const maxUsesDisplay = promo.maxUses ? `${promo.usedCount}/${promo.maxUses}` : '∞';

                row.innerHTML = `
                    <td>${promo.code}</td>
                    <td>${typeName}</td>
                    <td>${valueDisplay}</td>
                    <td>${promo.minOrder ? `${promo.minOrder}₽` : 'Нет'}</td>
                    <td>${promo.target || '-'}</td>
                    <td>${maxUsesDisplay}</td>
                    <td>${promo.isActive !== false ? 'Активен' : 'Неактивен'}</td>
                    <td>
                        <div class="promo-actions">
                            <button class="edit-promo" data-id="${promo.code}" title="Редактировать">✏️</button>
                            <button class="delete-promo" data-id="${promo.code}" title="Удалить">🗑️</button>
                            <button class="stats-promo" data-id="${promo.code}" title="Статистика">📊</button>
                            <button class="limit-promo" data-id="${promo.code}" title="Лимиты">🔒</button>
                            <button class="toggle-promo" data-id="${promo.code}" title="${promo.isActive !== false ? 'Деактивировать' : 'Активировать'}">
                                ${promo.isActive !== false ? '✅' : '❌'}
                            </button>
                        </div>
                    </td>
                `;

                promoTable.appendChild(row);
            });

            // Добавляем обработчики для кнопок
            addPromoEventListeners();

        } catch (error) {
            console.error('Ошибка загрузки промокодов:', error);
            showPromoMessage('Не удалось загрузить промокоды', 'error');
        } finally {
            loader.style.display = 'none';
        }
    }

    function addPromoEventListeners() {
        document.querySelectorAll('.edit-promo').forEach(btn => {
            btn.addEventListener('click', () => editPromo(btn.dataset.id));
        });

        document.querySelectorAll('.delete-promo').forEach(btn => {
            btn.addEventListener('click', () => deletePromo(btn.dataset.id));
        });

        document.querySelectorAll('.stats-promo').forEach(btn => {
            btn.addEventListener('click', () => showPromoStats(btn.dataset.id));
        });

        document.querySelectorAll('.limit-promo').forEach(btn => {
            btn.addEventListener('click', () => changePromoLimit(btn.dataset.id));
        });

        document.querySelectorAll('.toggle-promo').forEach(btn => {
            btn.addEventListener('click', function() {
                togglePromoStatus(this.dataset.id, this);
            });
        });
    }

    async function togglePromoStatus(code, button) {
        try {
            const promocodes = await fetchPromocodes();
            const promo = promocodes[code];

            if (promo) {
                const newStatus = !promo.isActive;

                // Обновляем статус промокода
                await updatePromocode(code, {
                    ...promo,
                    isActive: newStatus
                });

                // Обновляем кнопку
                button.innerHTML = newStatus ? '✅' : '❌';
                button.title = newStatus ? 'Деактивировать' : 'Активировать';

                showPromoMessage(`Промокод ${newStatus ? 'активирован' : 'деактивирован'}`, 'success');
                loadPromocodes();
            }
        } catch (error) {
            console.error('Ошибка:', error);
            showPromoMessage('Не удалось изменить статус промокода', 'error');
        }
    }

    async function editPromo(code) {
        try {
            const promocodes = await fetchPromocodes();
            const promo = promocodes[code];

            if (!promo) return;

            // Заполняем форму данными промокода
            promoCodeInput.value = promo.code;
            promoTypeSelect.value = promo.type;
            promoValueInput.value = promo.value || '';
            promoMinOrderInput.value = promo.minOrder || '';
            promoMaxUsesInput.value = promo.maxUses || '0';

            // Триггерим изменение типа для обновления интерфейса
            promoTypeSelect.dispatchEvent(new Event('change'));

            if (promo.type === 'item_discount') {
                setTimeout(() => {
                    promoTargetSelect.value = promo.target;
                }, 100);
            }

            showPromoMessage('Редактируйте промокод и сохраните изменения', 'info');
        } catch (error) {
            console.error('Ошибка:', error);
            showPromoMessage('Не удалось загрузить промокод для редактирования', 'error');
        }
    }

    async function deletePromo(code) {
        if (!confirm('Вы уверены, что хотите удалить этот промокод?')) return;

        try {
            await deletePromocode(code);
            showPromoMessage('Промокод удален!', 'success');
            loadPromocodes();
        } catch (error) {
            console.error('Ошибка:', error);
            showPromoMessage('Не удалось удалить промокод', 'error');
        }
    }

    async function showPromoStats(code) {
        try {
            const promocodes = await fetchPromocodes();
            const promo = promocodes[code];

            if (!promo) return;

            const statsText = `
                Промокод: ${promo.code}
                Тип: ${getPromoTypeName(promo.type)}
                Статус: ${promo.isActive !== false ? 'Активен' : 'Неактивен'}
                Использовано раз: ${promo.usedCount}
                Макс. использований: ${promo.maxUses || 'Не ограничено'}
                Дата создания: ${new Date(promo.createdAt).toLocaleString()}
            `;

            alert(statsText);
        } catch (error) {
            console.error('Ошибка:', error);
            showPromoMessage('Не удалось загрузить статистику', 'error');
        }
    }

    async function changePromoLimit(code) {
        try {
            const promocodes = await fetchPromocodes();
            const promo = promocodes[code];

            if (!promo) return;

            const newLimit = prompt(`Текущий лимит: ${promo.maxUses || 'нет'}\nВведите новое максимальное количество использований (0 = без лимита):`,
                                  promo.maxUses || '0');

            if (newLimit === null) return;

            const parsedLimit = parseInt(newLimit);
            if (isNaN(parsedLimit)) {
                alert('Пожалуйста, введите число');
                return;
            }

            await updatePromocode(code, {
                ...promo,
                maxUses: parsedLimit > 0 ? parsedLimit : null
            });

            loadPromocodes();
        } catch (error) {
            console.error('Ошибка:', error);
            showPromoMessage('Не удалось изменить лимит промокода', 'error');
        }
    }

    function getPromoTypeName(type) {
        switch(type) {
            case 'percentage': return 'Процентная скидка';
            case 'fixed': return 'Фиксированная скидка';
            case 'free_shipping': return 'Бесплатная доставка';
            case 'item_discount': return 'Скидка на товар';
            case 'delivery_discount': return 'Скидка на доставку';
            case 'referral': return 'Реферальный';
            default: return type;
        }
    }

    function showPromoMessage(text, type) {
        promoMessage.textContent = text;
        promoMessage.className = `message ${type}`;
        promoMessage.style.display = 'block';

        setTimeout(() => {
            promoMessage.style.display = 'none';
        }, 3000);
    }

    function clearPromoForm() {
        promoCodeInput.value = '';
        promoTypeSelect.value = 'percentage';
        promoValueInput.value = '';
        promoMinOrderInput.value = '';
        promoMaxUsesInput.value = '0';
        promoTargetSelect.value = '';
        promoTypeSelect.dispatchEvent(new Event('change'));
    }

    async function addNewPromo() {
        const code = promoCodeInput.value.trim().toUpperCase();
        const type = promoTypeSelect.value;
        const value = promoValueInput.value;
        const minOrder = promoMinOrderInput.value || 0;
        const maxUses = parseInt(promoMaxUsesInput.value) || 0;
        const target = type === 'item_discount' ? promoTargetSelect.value : '';

        if (!code) {
            showPromoMessage('Введите промокод!', 'error');
            return;
        }

        if (type === 'percentage') {
            const percentValue = parseInt(value);
            if (isNaN(percentValue) || percentValue < 1 || percentValue > 90) {
                showPromoMessage('Процент скидки должен быть от 1 до 90!', 'error');
                return;
            }
        }

        if (!value && type !== 'free_shipping') {
            showPromoMessage('Введите значение промокода!', 'error');
            return;
        }

        const promoData = {
            [code]: {
                type,
                value: type === 'free_shipping' ? null : value,
                minOrder,
                maxUses: maxUses > 0 ? maxUses : null,
                usedCount: 0,
                target,
                isActive: true,
                createdAt: new Date().toISOString()
            }
        };

        try {
            // Проверяем, не существует ли уже такой промокод
            const existingPromos = await fetchPromocodes();
            if (existingPromos[code]) {
                showPromoMessage('Такой промокод уже существует!', 'error');
                return;
            }

            await addPromocode(promoData);
            showPromoMessage('Промокод успешно добавлен!', 'success');
            loadPromocodes();
            clearPromoForm();
        } catch (error) {
            console.error('Ошибка:', error);
            showPromoMessage('Ошибка при добавлении промокода', 'error');
        }
    }

    // Настройка обработчиков для промокодов
    function setupPromoCodeHandlers() {
        // Генерация случайного промокода
        generatePromoBtn.addEventListener('click', () => {
            const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
            let result = '';
            for (let i = 0; i < 8; i++) {
                result += chars.charAt(Math.floor(Math.random() * chars.length));
            }
            promoCodeInput.value = result;
        });

        // Копирование промокода в буфер обмена
        copyPromoBtn.addEventListener('click', () => {
            if (!promoCodeInput.value) {
                showPromoMessage('Нет промокода для копирования', 'error');
                return;
            }

            navigator.clipboard.writeText(promoCodeInput.value).then(() => {
                showPromoMessage('Промокод скопирован в буфер обмена!', 'success');
            }).catch(err => {
                console.error('Не удалось скопировать промокод: ', err);
                showPromoMessage('Не удалось скопировать промокод', 'error');
            });
        });

        // Изменение типа промокода
        promoTypeSelect.addEventListener('change', function() {
            const type = this.value;

            // Обновляем суффикс для значения промокода
            if (type === 'percentage') {
                promoValueSuffix.textContent = '%';
                promoValueInput.placeholder = 'Процент скидки (1-90)';
                promoValueInput.min = '1';
                promoValueInput.max = '90';
            } else if (type === 'fixed') {
                promoValueSuffix.textContent = '₽';
                promoValueInput.placeholder = 'Фиксированная сумма';
                promoValueInput.min = '1';
                promoValueInput.removeAttribute('max');
            } else {
                promoValueSuffix.textContent = '';
                promoValueInput.placeholder = 'Значение';
                promoValueInput.removeAttribute('min');
                promoValueInput.removeAttribute('max');
            }

            // Показываем/скрываем поле для выбора товара
            if (type === 'item_discount') {
                promoTargetSelect.style.display = 'block';
                loadProductsForPromo();
            } else {
                promoTargetSelect.style.display = 'none';
            }

            // Скрываем поле значения для бесплатной доставки
            if (type === 'free_shipping') {
                promoValueContainer.style.display = 'none';
                promoValueInput.required = false;
            } else {
                promoValueContainer.style.display = 'flex';
                promoValueInput.required = true;
            }
        });

        // Добавление нового промокода
        addPromoBtn.addEventListener('click', addNewPromo);

        // Инициализация при загрузке
        promoTypeSelect.dispatchEvent(new Event('change'));
    }

    // Загрузка товаров для выбора в промокоде
    async function loadProductsForPromo() {
        promoTargetSelect.innerHTML = '<option value="">Выберите товар</option>';
        try {
            const response = await fetch(`${getApiBaseUrl()}/products`);
            if (!response.ok) throw new Error('Ошибка загрузки товаров');

            const products = await response.json();

            for (const productId in products) {
                const product = products[productId];
                const option = document.createElement('option');
                option.value = productId;
                option.textContent = product.title?.RU || product.title?.EN || productId;
                promoTargetSelect.appendChild(option);
            }
        } catch (error) {
            console.error('Ошибка загрузки товаров:', error);
        }
    }

    // ==================== Остальные функции ====================
    // Функции для работы с заказами
async function loadOrders() {
    loader.style.display = "flex";
    try {
        const login = document.getElementById('username').value; // Берем оригинальный логин
        const password = document.getElementById('password').value; // Берем оригинальный пароль
        const server = localStorage.getItem('server') || '9b9t';

        if (!login || !password) {
            alert('Авторизация не выполнена');
            return;
        }

        const response = await fetch(`${getApiBaseUrl()}/orders?login=${encodeURIComponent(login)}&password=${encodeURIComponent(password)}`);

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
        }

        const orders = await response.json();
        await renderOrders(orders);
    } catch (error) {
        console.error("Ошибка загрузки заказов:", error);
        alert("Не удалось загрузить заказы: " + error.message);
    } finally {
        loader.style.display = "none";
    }
}


    async function renderOrders(orders) {
        const tbody = ordersTable.querySelector('tbody');
        tbody.innerHTML = '';

        const role = localStorage.getItem('role');
        const currentServer = localStorage.getItem('server') || '9b9t';

        if (typeof orders !== 'object' || orders === null) {
            console.error("Invalid orders data:", orders);
            tbody.innerHTML = '<tr><td colspan="9">Нет данных о заказах</td></tr>';
            return;
        }

        for (const orderId in orders) {
            const order = orders[orderId];
            if (!order || !order.info) continue;

            const products = order.products ? Object.entries(order.products) : [];
            const row = document.createElement('tr');

            row.innerHTML = `
                <td>${order.info.username || 'Нет данных'}</td>
                <td>${order.info.discord || 'Нет данных'}</td>
                <td>${order.info.email || 'Нет данных'}</td>
                <td>
                    <div class="order-products">
                        <button class="toggle-products">Показать товары</button>
                        <ul class="products-list" style="display: none;">
                            ${products.map(([productId]) => `<li id="product-${productId}">Загрузка...</li>`).join('')}
                        </ul>
                    </div>
                </td>
                <td>$${order.totalPrice?.toFixed(2) || '0.00'}</td>
                <td>${order.info.deliveryMethod || 'Нет данных'}</td>
                <td>${order.coordinates ? `X: ${order.coordinates.x}<br>Y: ${order.coordinates.y}<br>Z: ${order.coordinates.z}` : 'Нет данных'}</td>
                <td>${order.info.formattedISO || 'Нет данных'}</td>
                <td><a href="/${currentServer}/chat?orderId=${orderId}" class="chat-button">Чат</a></td>
                <td>
                    <button class="delete-order-button ${role === 'moderator' ? 'disabled-button' : ''}"
                            data-order-id="${orderId}"
                            ${role === 'moderator' ? 'disabled' : ''}
                            title="${role === 'moderator' ? 'Доступно для Администрации' : ''}">
                        Удалить
                    </button>
                </td>
            `;

            tbody.appendChild(row);

            // Загрузка информации о товарах
            for (const [productId, quantity] of products) {
                try {
                    const product = await fetchProductById(productId);
                    const element = document.getElementById(`product-${productId}`);
                    if (element) {
                        element.innerHTML = product ? `
                            <img src="${product.imageUrl || 'https://via.placeholder.com/50'}" width="50"
                                 alt="${product.title?.RU || product.title?.EN || productId}">
                            ${product.title?.RU || product.title?.EN || productId}
                            x${quantity} ($${(product.price || 0).toFixed(2)})
                        ` : `Товар ${productId} не найден`;
                    }
                } catch (error) {
                    console.error(`Ошибка загрузки товара ${productId}:`, error);
                }
            }
        }
        // Обработчики событий
    document.querySelectorAll('.toggle-products').forEach(button => {
        button.addEventListener('click', () => {
            const list = button.nextElementSibling;
            list.style.display = list.style.display === 'none' ? 'block' : 'none';
            button.textContent = list.style.display === 'none' ? 'Показать товары' : 'Скрыть товары';
        });
    });

    if (localStorage.getItem('role') === 'admin') {
        document.querySelectorAll('.delete-order-button').forEach(button => {
            button.addEventListener('click', async () => {
                const orderId = button.getAttribute('data-order-id');
                if (confirm(`Удалить заказ ${orderId}?`)) {
                    await deleteOrder(orderId);
                }
            });
        });
    }
}

    async function deleteOrder(orderId) {
        loader.style.display = 'flex';
        try {
            const loginHash = localStorage.getItem('adminLoginHash');
            const passwordHash = localStorage.getItem('adminPasswordHash');

            const response = await fetch(`${getApiBaseUrl()}/orders/${orderId}?login=${loginHash}&password=${passwordHash}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Ошибка при удалении заказа');
            }

            await loadOrders();
        } catch (error) {
            console.error('Ошибка:', error);
            alert('Не удалось удалить заказ: ' + error.message);
        } finally {
            loader.style.display = 'none';
        }
    }
    // Загрузка товаров
    async function loadProducts() {
        loader.style.display = "flex";
        try {
            const response = await fetch(`${getApiBaseUrl()}/products`);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            renderProducts(await response.json());
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

        // Обработчики для кнопок
        document.querySelectorAll('.edit-button').forEach(button => {
            button.addEventListener('click', () => openEditModal(button.dataset.id));
        });

        document.querySelectorAll('.delete-button').forEach(button => {
            button.addEventListener('click', () => deleteProduct(button.dataset.id));
        });
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

    // Удаление товара
    async function deleteProduct(productId) {
        if (!confirm('Вы уверены, что хотите удалить этот товар?')) return;

        loader.style.display = "flex";
        try {
            const response = await fetch(`${getApiBaseUrl()}/products/${productId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': getAuthToken()
                }
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Ошибка при удалении товара');
            }

            await loadProducts(); // Обновляем список товаров после удаления
        } catch (error) {
            console.error('Ошибка:', error);
            alert('Не удалось удалить товар: ' + error.message);
        } finally {
            loader.style.display = "none";
        }
    }

    // Список категорий для выпадающего меню (можно вынести в глобальную область)
    const PRODUCT_CATEGORIES = [
        'Еда',
        'Броня',
        'Инструменты',
        'Механизмы',
        'Строительные блоки',
        'Стеши',
        'Расходники',
        'Разное'
    ];

    // Открытие модального окна для редактирования товара
    async function openEditModal(productId) {
        loader.style.display = 'flex';
        try {
            const response = await fetch(`${getApiBaseUrl()}/products/${productId}`);
            if (!response.ok) throw new Error('Ошибка загрузки данных товара');

            const product = await response.json();
            const categorySelect = document.getElementById('edit-product-category');

            // Заполняем выпадающий список категориями
            categorySelect.innerHTML = '';
            PRODUCT_CATEGORIES.forEach(category => {
                const option = document.createElement('option');
                option.value = category;
                option.textContent = category;
                categorySelect.appendChild(option);
            });

            // Заполняем форму данными товара
            categorySelect.value = product.category || '';
            document.getElementById('edit-product-title-ru').value = product.title?.RU || '';
            document.getElementById('edit-product-title-uk').value = product.title?.UK || '';
            document.getElementById('edit-product-title-en').value = product.title?.EN || '';
            document.getElementById('edit-product-description-ru').value = product.description?.RU || '';
            document.getElementById('edit-product-description-uk').value = product.description?.UK || '';
            document.getElementById('edit-product-description-en').value = product.description?.EN || '';
            document.getElementById('edit-product-price').value = product.price || '';
            document.getElementById('edit-product-image-url').value = product.imageUrl || '';
            document.getElementById('edit-product-is-new').checked = product.isNew || false;

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
        if (price < 0.01) {
            alert('Минимальная цена товара — 0.01$');
            loader.style.display = 'none';
            return;
        }

        const category = document.getElementById('edit-product-category').value;
        if (!category) {
            alert('Пожалуйста, выберите категорию товара');
            loader.style.display = 'none';
            return;
        }

        const productId = editProductForm.getAttribute('data-id');
        const updatedProduct = {
            category: category,
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
            isNew: document.getElementById('edit-product-is-new').checked,
        };

        try {
            const response = await fetch(`${getApiBaseUrl()}/products/${productId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': getAuthToken()
                },
                body: JSON.stringify(updatedProduct),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Ошибка при сохранении изменений');
            }

            const result = await response.json();
            console.log('Товар обновлен:', result);

            // Закрываем модальное окно и обновляем список товаров
            editProductModal.style.display = 'none';
            await loadProducts();
        } catch (error) {
            console.error('Ошибка:', error);
            alert('Не удалось сохранить изменения: ' + error.message);
        } finally {
            loader.style.display = 'none';
        }
    });
    // Добавление товара
    addProductForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        loader.style.display = 'flex';

        const price = parseFloat(document.getElementById('product-price').value);
        if (price < 0.01) {
            alert('Минимальная цена товара — 0.01$');
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
            isNew: document.getElementById('product-is-new').checked,
        };

        try {
            const response = await fetch(`${getApiBaseUrl()}/products`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': getAuthToken()
                },
                body: JSON.stringify({
                    products: {
                        [crypto.randomUUID()]: productData,
                    },
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Ошибка при добавлении товара');
            }

            const result = await response.json();
            console.log('Товар добавлен:', result);
            addProductModal.style.display = 'none';
            addProductForm.reset();
            await loadProducts();
        } catch (error) {
            console.error('Ошибка:', error);
            alert('Не удалось добавить товар: ' + error.message);
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
        await loadOrders();
        await loadProducts();
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
            const response = await fetch(`${getApiBaseUrl()}/orders`);
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
            const response = await fetch(`${getApiBaseUrl()}/products/${productId}`);
            if (!response.ok) throw new Error(`Ошибка загрузки товара с ID: ${productId}`);

            return await response.json();
        } catch (error) {
            console.error(`Ошибка загрузки товара ${productId}:`, error);
            return null;
        }
    }
});
