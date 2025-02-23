document.addEventListener('DOMContentLoaded', () => {
    const languageSelect = document.getElementById('language-select');
    const addToCartButtons = document.querySelectorAll('.glow-button');
    const cartCount = document.querySelector('.cart-count');
    const searchInput = document.getElementById('search-input');
    const filterIcon = document.getElementById('filter-icon');
    const filterDropdown = document.getElementById('filter-dropdown');
    const productsContainer = document.querySelector('.products');

    // Загрузка продуктов с сервера
    fetch("https://9b9t.shop:8443/api/products")
        .then(response => response.json())
        .then(products => {
            // Очистить контейнер перед добавлением новых продуктов
            productsContainer.innerHTML = '';

            // Добавление продуктов на страницу
            products.forEach(product => {
                const productCard = `
                    <div class="product card" data-id="${product.id}" data-price="${product.price}" data-category="${product.category}">
                        <img src="${product.imageUrl}" alt="${product.nameRu}" class="card__img">
                        <div class="card__data">
                            <h1 class="card__title" data-lang="ru">${product.nameRu}</h1>
                            <h1 class="card__title" data-lang="uk">${product.nameUk}</h1>
                            <h1 class="card__title" data-lang="en">${product.nameEn}</h1>
                            <span class="card__price" data-lang="ru">${product.price}$</span>
                            <span class="card__price" data-lang="uk">${product.price}$</span>
                            <span class="card__price" data-lang="en">${product.price}$</span>
                            <p class="card__description" data-lang="ru">${product.descriptionRu}</p>
                            <p class="card__description" data-lang="uk">${product.descriptionUk}</p>
                            <p class="card__description" data-lang="en">${product.descriptionEn}</p>
                            <button class="glow-button">
                                <span data-lang="ru">Добавить в корзину</span>
                                <span data-lang="uk">Додати до кошика</span>
                                <span data-lang="en">Add to Cart</span>
                            </button>
                        </div>
                    </div>
                `;
                productsContainer.innerHTML += productCard;
            });
        })
        .catch(error => console.error('Ошибка при загрузке продуктов:', error));

    // Обработчик для выбора языка
    const savedLanguage = localStorage.getItem('selectedLanguage') || 'ru';
    languageSelect.value = savedLanguage;
    changeLanguage(savedLanguage);

    languageSelect.addEventListener('change', (event) => {
        const selectedLang = event.target.value;
        localStorage.setItem('selectedLanguage', selectedLang);
        changeLanguage(selectedLang);
    });

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
            }, 500);

            // Логика добавления товара в корзину
            const product = button.closest('.product');
            const productId = product.getAttribute('data-id');
            const productName = product.querySelector('.card__title').innerText;
            const productPrice = parseFloat(product.getAttribute('data-price'));
            const productImage = product.querySelector('.card__img').src;

            let cart = JSON.parse(localStorage.getItem('cart')) || [];

            // Проверяем, есть ли товар в корзине
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
        const products = document.querySelectorAll('.product.card');
        products.forEach(product => {
            const title = product.querySelector('.card__title').innerText.toLowerCase();
            product.style.display = title.includes(searchTerm) ? 'block' : 'none';
        });
    });

    // Показ/скрытие выпадающего списка фильтров
    filterIcon.addEventListener('click', (e) => {
        e.stopPropagation();
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
            filterDropdown.classList.remove('active');

            const products = document.querySelectorAll('.product.card');
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
