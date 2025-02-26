document.addEventListener('DOMContentLoaded', () => {
    const loginContainer = document.getElementById('login-container');
    const adminContainer = document.getElementById('admin-container');
    const loginForm = document.getElementById('login-form');
    const errorMessage = document.getElementById('error-message');
    const loader = document.getElementById('loader');
    const refreshButton = document.getElementById('refresh-button');

    // Сохранённые хеши логина и пароля
    const ADMIN_USERNAME_HASH = "8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918";
    const ADMIN_PASSWORD_HASH = "240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9";

    // Функция для хеширования SHA-256
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
                loginContainer.style.display = "none";
                adminContainer.style.display = "block";
                await loadOrders();
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

    // Загрузка заказов с сервера
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

    // Отображение заказов в таблице
    function renderOrders(orders) {
        const tbody = document.querySelector('#orders-table tbody');
        tbody.innerHTML = '';

        // Проходим по каждому заказу
        for (const orderId in orders) {
            const order = orders[orderId];  // Получаем заказ по ID

            const row = document.createElement('tr');
            row.innerHTML = `
            <td>${order.info.username}</td>
            <td>${order.info.discord}</td>
            <td>${order.info.email}</td>
            <td>${order.products.map(product => `
                ${product.name} x${product.quantity} ($${product.price})
            `).join('<br>')}</td>
            <td>$${order.totalPrice.toFixed(2)}</td>
            <td>${order.info.deliveryMethod}</td>
            <td>${order.coordinates ? `X: ${order.coordinates.x}<br>Y: ${order.coordinates.y}<br>Z: ${order.coordinates.z}` : 'Нет данных'}</td>
        `;
            tbody.appendChild(row);
        }
    }

    // Обновление по кнопке
    refreshButton.addEventListener('click', async () => {
        await loadOrders();
    });
});