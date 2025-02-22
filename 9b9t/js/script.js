document.addEventListener('DOMContentLoaded', () => {
    const languageSelect = document.getElementById('language-select');
    const addToCartButtons = document.querySelectorAll('.glow-button');
    const cartCount = document.querySelector('.cart-count');
    const searchInput = document.getElementById('search-input');
    const products = document.querySelectorAll('.product.card');
    const filterIcon = document.getElementById('filter-icon');
    const filterDropdown = document.getElementById('filter-dropdown');

    // Загрузка выбранного языка из localStorage
    const savedLanguage = localStorage.getItem('selectedLanguage') || 'ru';
    languageSelect.value = savedLanguage;
    changeLanguage(savedLanguage);

    // Обработчик для выбора языка
    languageSelect.addEventListener('change', (event) => {
        const selectedLang = event.target.value;
        localStorage.setItem('selectedLanguage', selectedLang);
        changeLanguage(selectedLang);
    });

    // Функция для переключения языка
    function changeLanguage(lang) {
        // Обновляем текст кнопки "Добавить в корзину"
        addToCartButtons.forEach(button => {
            const spans = button.querySelectorAll('span');
            spans.forEach(span => {
                if (span.getAttribute('data-lang') === lang) {
                    span.style.display = 'inline';
                } else {
                    span.style.display = 'none';
                }
            });
        });

        // Обновляем текст других элементов
        document.querySelectorAll('[data-lang]').forEach(element => {
            if (element.getAttribute('data-lang') === lang) {
                element.style.display = 'block';
            } else {
                element.style.display = 'none';
            }
        });
    }

    // Обработчик для кнопок "Добавить в корзину"
    addToCartButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Добавляем класс для анимации
            button.classList.add('clicked');

            // Убираем класс после завершения анимации
            setTimeout(() => {
                button.classList.remove('clicked');
            }, 500); // Длительность анимации (0.5 секунды)

            // Логика добавления товара в корзину
            const product = button.closest('.product');
            const productId = product.getAttribute('data-id');
            const productName = product.querySelector('.card__title').innerText;
            const productPrice = parseFloat(product.getAttribute('data-price'));
            const productImage = product.querySelector('.card__img').src;

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

    // Обработчик для поиска
    searchInput.addEventListener('input', () => {
        const searchTerm = searchInput.value.toLowerCase();
        products.forEach(product => {
            const title = product.querySelector('.card__title').innerText.toLowerCase();
            product.style.display = title.includes(searchTerm) ? 'block' : 'none';
        });
    });

    // Показ/скрытие выпадающего списка фильтров
    filterIcon.addEventListener('click', (e) => {
        e.stopPropagation(); // Предотвращаем всплытие события
        filterDropdown.classList.toggle('active');
    });

    // Закрытие выпадающего списка при клике вне его области
    document.addEventListener('click', (e) => {
        if (!filterDropdown.contains(e.target) && !filterIcon.contains(e.target)) {
            filterDropdown.classList.remove('active');
        }
    });

    // Обработчик для выбора фильтра
    filterDropdown.querySelectorAll('.filter-option').forEach(option => {
        option.addEventListener('click', () => {
            const filter = option.getAttribute('data-filter');
            filterDropdown.classList.remove('active'); // Скрываем выпадающий список

            // Фильтрация товаров
            products.forEach(product => {
                const category = product.getAttribute('data-category');
                if (filter === 'all' || category === filter) {
                    product.style.display = 'block';
                } else {
                    product.style.display = 'none';
                }
            });
        });
    });

    // Генерация эффекта свечения для кнопок
    generateGlowButtons();
});

// Функция для создания эффекта свечения на кнопках
const generateGlowButtons = () => {
    document.querySelectorAll(".glow-button").forEach((button) => {
        let gradientElem = button.querySelector('.gradient');

        if (!gradientElem) {
            gradientElem = document.createElement("div");
            gradientElem.classList.add("gradient");
            button.appendChild(gradientElem);
        }

        button.addEventListener("pointermove", (e) => {
            const rect = button.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            gsap.to(button, {
                "--pointer-x": `${x}px`,
                "--pointer-y": `${y}px`,
                duration: 0.6,
            });

            gsap.to(button, {
                "--button-glow": chroma
                    .mix(
                        getComputedStyle(button)
                            .getPropertyValue("--button-glow-start")
                            .trim(),
                        getComputedStyle(button)
                            .getPropertyValue("--button-glow-end")
                            .trim(),
                        x / rect.width
                    )
                    .hex(),
                duration: 0.2,
            });
        });
    });
};

// Инициализация GSAP (если не подключен)
if (typeof gsap === 'undefined') {
    console.warn('GSAP не подключен. Эффекты свечения не будут работать.');
}

// Инициализация Chroma.js (если не подключен)
if (typeof chroma === 'undefined') {
    console.warn('Chroma.js не подключен. Эффекты свечения не будут работать.');
}
