// Получаем параметры из URL
const urlParams = new URLSearchParams(window.location.search);
const uuid = urlParams.get('orderId');
const orderAmount = urlParams.get('amount');

// Проверяем UUID
const uuidPattern = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;
if (!uuid || !uuidPattern.test(uuid)) {
    console.error('Invalid UUID:', uuid);
    alert('Invalid order ID. Please check the URL.');
}

// Переводы
const translations = {
    ru: {
        paypal_payment: "Оплатить через PayPal",
        step1: "Перейдите на сайт <a href='https://paypal.com/myaccount/transfer/' class='blue-link' target='_blank'>paypal.com/myaccount/transfer/</a>",
        step2: "Введите <span class='blue-copy' onclick='copyToClipboard(\"shops.endles@gmail.com\")'>shops.endles@gmail.com</span> в качестве получателя",
        step3: "Отправьте {amount} {currency} через {method}",
        currency: "долларов США",
        friends_family: "«Друзья и семья»",
        goods_services: "«Товары и услуги»",
        important_note: "Для успешной обработки платежа обязательно выберите опцию {friends}. Платежи, отправленные как {goods}, будут автоматически возвращены.",
        chat_title: "Чат поддержки",
        chat_placeholder: "Введите ваше сообщение...",
        send_button: "Отправить",
        admin: "Админ",
        moderator: "Модератор",
        payment_view: "PayPal",
        chat_view: "Чат",
        copied: "Скопировано!"
    },
    en: {
        paypal_payment: "Pay with PayPal",
        step1: "Go to website <a href='https://paypal.com/myaccount/transfer/' class='blue-link' target='_blank'>paypal.com/myaccount/transfer/</a>",
        step2: "Enter <span class='blue-copy' onclick='copyToClipboard(\"shops.endles@gmail.com\")'>shops.endles@gmail.com</span> as recipient",
        step3: "Send {amount} {currency} via {method}",
        currency: "US dollars",
        friends_family: "«Friends and Family»",
        goods_services: "«Goods and Services»",
        important_note: "For successful payment processing, be sure to select the {friends} option. Payments sent as {goods} will be automatically refunded.",
        chat_title: "Support Chat",
        chat_placeholder: "Type your message...",
        send_button: "Send",
        admin: "Admin",
        moderator: "Moderator",
        payment_view: "PayPal",
        chat_view: "Chat",
        copied: "Copied!"
    },
    uk: {
        paypal_payment: "Оплатити через PayPal",
        step1: "Перейдіть на сайт <a href='https://paypal.com/myaccount/transfer/' class='blue-link' target='_blank'>paypal.com/myaccount/transfer/</a>",
        step2: "Введіть <span class='blue-copy' onclick='copyToClipboard(\"shops.endles@gmail.com\")'>shops.endles@gmail.com</span> як отримувача",
        step3: "Надішліть {amount} {currency} через {method}",
        currency: "доларів США",
        friends_family: "«Друзям та родичам»",
        goods_services: "«Товари та послуги»",
        important_note: "Для успішної обробки платежу обов'язково виберіть опцію {friends}. Платежі, відправлені як {goods}, будуть автоматично повернуті.",
        chat_title: "Чат підтримки",
        chat_placeholder: "Введіть ваше повідомлення...",
        send_button: "Надіслати",
        admin: "Адмін",
        moderator: "Модератор",
        payment_view: "PayPal",
        chat_view: "Чат",
        copied: "Скопійовано!"
    }
};

// Функция для копирования в буфер обмена
function copyToClipboard(text) {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);

    // Показываем уведомление
    const lang = document.querySelector('.lang-btn.active')?.dataset.lang || 'ru';
    const notification = document.createElement('div');
    notification.className = 'copy-notification';
    notification.textContent = translations[lang]['copied'];
    document.body.appendChild(notification);

    setTimeout(() => {
        notification.remove();
    }, 2000);
}

// Установка языка
function setLanguage(lang) {
    // Обновляем кнопки переключения языка
    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.lang === lang) btn.classList.add('active');
    });

    // Обновляем все переводимые элементы
    document.querySelectorAll('[data-translate]').forEach(el => {
        const key = el.dataset.translate;
        let translation = translations[lang][key];

        if (key === 'important_note') {
            const friends = translations[lang]['friends_family'];
            const goods = translations[lang]['goods_services'];
            translation = translation.replace('{friends}', `<span class="highlight-red">"${friends}"</span>`)
                                   .replace('{goods}', `<span class="highlight-red">"${goods}"</span>`);
        }

        if (el.hasAttribute('data-translate')) {
            if (el.tagName === 'INPUT') {
                el.placeholder = translation;
            } else {
                el.innerHTML = translation;
            }
        }
    });

    // Обновляем кнопки переключения вида
    document.querySelector('[data-view="payment"]').textContent = translations[lang]['payment_view'];
    document.querySelector('[data-view="chat"]').textContent = translations[lang]['chat_view'];

    // Обновляем тег роли в чате
    updateRoleTag();

    // Обновляем сумму заказа при смене языка
    updateOrderAmount(lang);
}

// Переключение языка
document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.addEventListener('click', function() {
        const lang = this.dataset.lang;
        setLanguage(lang);
    });
});

// Переключение между PayPal и чатом
document.querySelectorAll('.view-btn').forEach(btn => {
    btn.addEventListener('click', function() {
        const view = this.dataset.view;

        // Обновляем активную кнопку
        document.querySelectorAll('.view-btn').forEach(b => b.classList.remove('active'));
        this.classList.add('active');

        // Плавное переключение между видами
        const paymentView = document.getElementById('payment-view');
        const chatView = document.getElementById('chat-view');

        if (view === 'payment') {
            chatView.classList.remove('active-view');
            setTimeout(() => {
                paymentView.classList.add('active-view');
            }, 50);
        } else {
            paymentView.classList.remove('active-view');
            setTimeout(() => {
                chatView.classList.add('active-view');
            }, 50);
        }
    });
});

// Обновление тега роли
function updateRoleTag() {
    const role = localStorage.getItem('role');
    const adminTag = document.getElementById('admin-tag');
    const currentLang = document.querySelector('.lang-btn.active')?.dataset.lang || 'ru';

    if (role === 'Admin') {
        adminTag.innerHTML = `<span class="admin-tag">${translations[currentLang]['admin']}</span>`;
    } else if (role === 'Moderator') {
        adminTag.innerHTML = `<span class="moderator-tag">${translations[currentLang]['moderator']}</span>`;
    } else {
        adminTag.innerHTML = '';
    }
}

// Функция для получения суммы заказа
async function fetchOrderAmount() {
    try {
        const response = await fetch(`https://endles.fun/api/9b9t/orders/${uuid}`);
        if (!response.ok) throw new Error('Failed to fetch order');

        const orderData = await response.json();
        return orderData.totalPrice || 0;
    } catch (error) {
        console.error('Error fetching order amount:', error);
        return 0;
    }
}

// Обновление суммы заказа
async function updateOrderAmount(lang = null) {
    if (!lang) {
        lang = document.querySelector('.lang-btn.active')?.dataset.lang || 'ru';
    }

    // Получаем сумму заказа
    let amount = orderAmount;
    if (!amount) {
        amount = await fetchOrderAmount();
    }

    // Форматируем сумму
    const formattedAmount = amount ? parseFloat(amount).toFixed(2) : '0.00';

    // Обновляем элементы в шаге 3
    const amountElement = document.getElementById('paypal-amount');
    const currencyElement = document.querySelector('[data-translate="currency"]');
    const methodElement = document.querySelector('[data-translate="friends_family"]');

    if (amountElement) {
        amountElement.textContent = formattedAmount;
    }
    if (currencyElement) {
        currencyElement.textContent = translations[lang]['currency'];
    }
    if (methodElement) {
        methodElement.textContent = translations[lang]['friends_family'];
    }

    // Обновляем текст шага 3 (если используется шаблон)
    const step3Element = document.querySelector('[data-translate="step3"]');
    if (step3Element && step3Element.textContent.includes('{amount}')) {
        step3Element.innerHTML = translations[lang]['step3']
            .replace('{amount}', `<span class="amount" id="paypal-amount">${formattedAmount}</span>`)
            .replace('{currency}', `<span data-translate="currency">${translations[lang]['currency']}</span>`)
            .replace('{method}', `<span class="highlight" data-translate="friends_family">${translations[lang]['friends_family']}</span>`);
    }
}

// Инициализация чата
async function initChat() {
    const chatInput = document.getElementById('chat-input');
    const sendButton = document.getElementById('send-button');
    const chatMessages = document.getElementById('chat-messages');

    // Инициализируем сумму заказа
    await updateOrderAmount();

    // Функция загрузки сообщений
    async function loadMessages() {
        try {
            const response = await fetch(`https://endles.fun/api/9b9t/orders/${uuid}`);
            if (!response.ok) throw new Error('Failed to load messages');

            const data = await response.json();
            const messages = data.messages || {};

            // Форматирование времени
            const formatTime = timestamp => {
                return new Date(Number(timestamp)).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit'
                });
            };

            // Отображение сообщений
            chatMessages.innerHTML = Object.entries(messages)
                .map(([timestamp, msg]) => {
                    const currentLang = document.querySelector('.lang-btn.active')?.dataset.lang || 'ru';
                    let authorDisplay = msg.author;

                    if (msg.author === 'Admin') {
                        authorDisplay = translations[currentLang]['admin'];
                    } else if (msg.author === 'Moderator') {
                        authorDisplay = translations[currentLang]['moderator'];
                    }

                    return `
                        <div class="message ${msg.author === 'Admin' ? 'admin' :
                                           msg.author === 'Moderator' ? 'moderator' : 'user'}">
                            <strong>${authorDisplay}</strong>
                            <span class="time">(${formatTime(timestamp)})</span>:
                            ${msg.message}
                        </div>
                    `;
                })
                .join('');

            chatMessages.scrollTop = chatMessages.scrollHeight;
        } catch (error) {
            console.error('Error loading messages:', error);
        }
    }

    // Функция отправки сообщения
    async function sendMessage() {
        const text = chatInput.value.trim();
        if (!text) return;

        try {
            // Получаем текущий заказ
            const response = await fetch(`https://endles.fun/api/9b9t/orders/${uuid}`);
            if (!response.ok) throw new Error('Failed to load order');

            const order = await response.json();
            const username = order.info.username;

            // Определяем автора
            let author;
            const role = localStorage.getItem('role');
            if (role === 'Admin') author = 'Admin';
            else if (role === 'Moderator') author = 'Moderator';
            else author = username;

            // Добавляем сообщение
            order.messages = order.messages || {};
            order.messages[Date.now()] = { author, message: text };

            // Сохраняем изменения
            const putResponse = await fetch(`https://endles.fun/api/9b9t/orders/${uuid}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(order)
            });

            if (!putResponse.ok) throw new Error('Failed to send message');

            chatInput.value = '';
            loadMessages();
        } catch (error) {
            console.error('Error sending message:', error);
            alert('Message sending failed. Please try again.');
        }
    }

    // Обработчики событий
    sendButton.addEventListener('click', sendMessage);
    chatInput.addEventListener('keypress', e => {
        if (e.key === 'Enter') sendMessage();
    });

    // Загружаем сообщения сразу и каждые 2 секунды
    loadMessages();
    setInterval(loadMessages, 2000);

    // Инициализация роли пользователя
    if (!localStorage.getItem('role')) {
        localStorage.setItem('role', 'User');
    }
    updateRoleTag();
}

// Инициализация
document.addEventListener('DOMContentLoaded', () => {
    setLanguage('ru');
    initChat();

    // По умолчанию показываем PayPal view
    document.getElementById('payment-view').classList.add('active-view');
});