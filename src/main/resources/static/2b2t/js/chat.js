// Получаем UUID из параметра запроса orderId
const urlParams = new URLSearchParams(window.location.search);
const uuid = urlParams.get('orderId');

// Проверяем, что UUID извлечен и имеет правильный формат
const uuidPattern = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;
if (!uuid || !uuidPattern.test(uuid)) {
    console.error('Некорректный UUID:', uuid);
    alert('Некорректный UUID. Проверьте URL.');
} else {
    // Элементы страницы
    const chatMessages = document.getElementById('chat-messages');
    const chatInput = document.getElementById('chat-input');
    const sendButton = document.getElementById('send-button');

    // Функция для загрузки сообщений
    async function loadMessages() {
        try {
            const response = await fetch(`http://endles.fun/api/2b2t/orders/${uuid}`);
            if (!response.ok) {
                throw new Error('Ошибка загрузки сообщений');
            }
            const data = await response.json();
            const messages = data.messages || {}; // Получаем сообщения из ответа

            // Очищаем и обновляем чат
            function formatTimestamp(timestamp) {
                const date = new Date(Number(timestamp));
                return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            }

     // В функции loadMessages:
       chatMessages.innerHTML = Object.entries(messages)
    .map(([timestamp, message]) => {
        // Определяем класс автора сообщения
        const authorClass = message.author === 'Admin' ? 'admin' :
                           message.author === 'Moderator' ? 'moderator' : 'user';
        return `
            <div class="message ${authorClass}">
                <strong>${message.author}</strong> (${formatTimestamp(timestamp)}): ${message.message}
            </div>
        `;
    })
    .join('');
        chatMessages.scrollTop = chatMessages.scrollHeight; // Автопрокрутка
        } catch (error) {
            console.error('Ошибка:', error);
        }
    }



    // Функция для отправки сообщения
    async function sendMessage() {
        const text = chatInput.value.trim();
        if (text) {
            try {
                // Сначала загружаем текущий заказ
                const responseGet = await fetch(`http://endles.fun/api/2b2t/orders/${uuid}`);
                if (!responseGet.ok) {
                    throw new Error('Ошибка загрузки заказа');
                }
                const currentOrder = await responseGet.json();

                // Получаем имя пользователя из данных заказа
                const username = currentOrder.info.username;

                // Добавляем новое сообщение
                currentOrder.messages = currentOrder.messages || {}; // Инициализируем, если messages отсутствует
                currentOrder.messages[Date.now()] = {
                    author: localStorage.getItem('role') === 'Admin' ? 'Admin' :
                    localStorage.getItem('role') === 'Moderator' ? 'Moderator' : username,
            message: text
        };
                // Отправляем обновленный заказ
                const responsePut = await fetch(`https://9b9t.shop:8443/api/2b2t/orders/${uuid}`, {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(currentOrder)
                });

                if (!responsePut.ok) {
                    throw new Error('Ошибка отправки сообщения');
                }

                chatInput.value = ''; // Очищаем поле ввода
                loadMessages(); // Обновляем сообщения
            } catch (error) {
                console.error('Ошибка:', error);
                alert('Не удалось отправить сообщение. Проверьте консоль для подробностей.');
            }
        }
    }

    // Загружаем сообщения при загрузке страницы
    loadMessages();

    // Обновляем сообщения каждые 2 секунды
    setInterval(loadMessages, 2000);

    // Отправка сообщения по нажатию кнопки
    sendButton.addEventListener('click', sendMessage);

    // Отправка сообщения по нажатию Enter
    chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') sendMessage();
    });
}