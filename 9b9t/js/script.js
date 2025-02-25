document.addEventListener('DOMContentLoaded', () => {
    const languageSelect = document.getElementById('language-select');
    const cartCount = document.querySelector('.cart-count');
    const searchInput = document.getElementById('search-input');
    const filterIcon = document.getElementById('filter-icon');
    const filterDropdown = document.getElementById('filter-dropdown');
    const productsContainer = document.getElementById('products-container');

    if (!productsContainer) {
        console.error('Элемент с id="products-container" не найден в DOM.');
        return;
    }

    // Загружаем язык из localStorage
    const savedLanguage = localStorage.getItem('selectedLanguage') || 'RU';
    languageSelect.value = savedLanguage;
    changeLanguage(savedLanguage);

    // Обработчик смены языка
    languageSelect.addEventListener('change', (event) => {
        const selectedLang = event.target.value;
        localStorage.setItem('selectedLanguage', selectedLang);
        changeLanguage(selectedLang);
    });

    // Функция смены языка
    function changeLanguage(lang) {
        document.querySelectorAll('.glow-button span').forEach(span => {
            span.style.display = span.getAttribute('data-lang') === lang ? 'inline' : 'none';
        });

        document.querySelectorAll('[data-lang]').forEach(element => {
            element.style.display = element.getAttribute('data-lang') === lang ? 'block' : 'none';
        });
    }

    // Загрузка товаров с API
    fetch("https://9b9t.shop:8443/api/products")
        .then(response => response.json())
        .then(products => {
            if (!Array.isArray(products) || products.length === 0) {
                productsContainer.innerHTML = '<p class="error">Продукты не найдены.</p>';
                return;
            }

            // Очистка контейнера перед загрузкой новых данных
            productsContainer.innerHTML = '';

            const fragment = document.createDocumentFragment();

            products.forEach((product, index) => {
                const productCard = document.createElement('div');
                productCard.classList.add('product', 'card');

                // ID товара
                productCard.setAttribute('data-id', product.id || `temp-id-${index}`);

                // Категория товара (если нет, то "Разное")
                productCard.setAttribute('data-category', product.category || 'Разное');

                // Картинка товара (если нет, то заглушка)
                const imageUrl = product.imageUrl || 'https://via.placeholder.com/150';

                // Название товара (по текущему языку)
                const titleRu = product.title?.RU || 'Без названия';
                const titleUk = product.title?.UK || 'Без назви';
                const titleEn = product.title?.EN || 'No name';

                // Описание товара
                const descriptionRu = product.description?.RU || 'Нет описания';
                const descriptionUk = product.description?.UK || 'Немає опису';
                const descriptionEn = product.description?.EN || 'No description';

                // Цена (если нет, то 0)
                const price = product.price ? `${product.price}$` : '0$';

                productCard.innerHTML = `
                    <img src="${imageUrl}" alt="${titleRu}" class="card__img">
                    <div class="card__data">
                        <h1 class="card__title" data-lang="RU">${titleRu}</h1>
                        <h1 class="card__title" data-lang="UK">${titleUk}</h1>
                        <h1 class="card__title" data-lang="EN">${titleEn}</h1>
                        <span class="card__price">${price}</span>
                        <p class="card__description" data-lang="RU">${descriptionRu}</p>
                        <p class="card__description" data-lang="UK">${descriptionUk}</p>
                        <p class="card__description" data-lang="EN">${descriptionEn}</p>
                        <button class="glow-button">
                            <span data-lang="RU">Добавить в корзину</span>
                            <span data-lang="UK">Додати до кошика</span>
                            <span data-lang="EN">Add to Cart</span>
                        </button>
                    </div>
                `;

                fragment.appendChild(productCard);
            });

            productsContainer.appendChild(fragment);

            // Инициализация обработчиков кнопок
            initializeEventListeners();

            // Применяем текущий язык после загрузки товаров
            changeLanguage(savedLanguage);

            // Генерация эффекта свечения для кнопок
            generateGlowButtons();

            // Динамическое изменение размера шрифта для цены
            const priceElements = document.querySelectorAll('.card__price');
            priceElements.forEach(priceElement => {
                const priceText = priceElement.innerText;
                const priceLength = priceText.length;

                if (priceLength > 4) { // Если число больше 5 символов
                    priceElement.style.fontSize = '0.8rem'; // Уменьшаем размер шрифта
                } else {
                    priceElement.style.fontSize = 'var(--normal-font-size)'; // Возвращаем стандартный размер
                }
            });
        })
        .catch(error => {
            console.error('Ошибка при загрузке продуктов:', error);
            productsContainer.innerHTML = '<p class="error">Не удалось загрузить продукты. Пожалуйста, попробуйте позже.</p>';
        });

    // Обработчики событий
    function initializeEventListeners() {
        const addToCartButtons = document.querySelectorAll('.glow-button');
        const products = document.querySelectorAll('.product.card');

        addToCartButtons.forEach(button => {
            button.addEventListener('click', () => {
                button.classList.add('clicked');
                setTimeout(() => button.classList.remove('clicked'), 500);

                const product = button.closest('.product');
                const productId = product.getAttribute('data-id');
                const productName = product.querySelector('.card__title[data-lang="RU"]').innerText;
                const productPrice = parseFloat(product.querySelector('.card__price').innerText.replace('$', ''));
                const productImage = product.querySelector('.card__img').src;

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
                updateCartCount(cart);
            });
        });

        // Фильтр товаров по поиску
        searchInput.addEventListener('input', () => {
            const searchTerm = searchInput.value.toLowerCase();
            products.forEach(product => {
                const title = product.querySelector('.card__title[data-lang="RU"]').innerText.toLowerCase();
                product.style.display = title.includes(searchTerm) ? 'block' : 'none';
            });
        });

        // Фильтр по категориям
        filterIcon.addEventListener('click', (e) => {
            e.stopPropagation();
            filterDropdown.classList.toggle('active');
        });

        document.addEventListener('click', (e) => {
            if (!filterDropdown.contains(e.target) && !filterIcon.contains(e.target)) {
                filterDropdown.classList.remove('active');
            }
        });

        filterDropdown.querySelectorAll('.filter-option').forEach(option => {
            option.addEventListener('click', () => {
                const filter = option.getAttribute('data-filter');
                filterDropdown.classList.remove('active');
                products.forEach(product => {
                    const category = product.getAttribute('data-category');
                    product.style.display = (filter === 'all' || category === filter) ? 'block' : 'none';
                });
            });
        });
    }

    // Обновление счетчика корзины
    function updateCartCount(cart) {
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        cartCount.innerText = totalItems;
    }

    // Инициализация счетчика корзины при загрузке страницы
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    updateCartCount(cart);
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
