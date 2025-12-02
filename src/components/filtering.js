// components/filtering.js

// import {createComparison, defaultRules} from "../lib/compare.js"; // больше не нужно при серверной фильтрации

export function initFiltering(elements) {
    // @todo: #4.1 — заполнить выпадающие списки опциями
    const updateIndexes = (elements, indexes) => {
        Object.keys(indexes) // Получаем имена фильтров, например "searchBySeller"
            .forEach((elementName) => {
                // на всякий случай очищаем старые опции (кроме первой-заглушки)
                const select = elements[elementName];
                if (select && select.tagName === 'SELECT') {
                    // оставим первый option (например "Все")
                    while (select.children.length > 1) select.removeChild(select.lastChild);
                }

                elements[elementName].append(
                    ...Object.values(indexes[elementName])
                        .map(name => {
                            const option = document.createElement('option');
                            option.value = name;
                            option.textContent = name;
                            return option;
                        })
                );
            });
    };

    // @todo: #4.3 — настроить компаратор
    // const compare = createComparison(defaultRules); // больше не нужен при серверной фильтрации

    const applyFiltering = (query, state, action) => {
        // @todo: #4.2 — обработать очистку поля
        if (action && action.name === 'clear') {
            const parent = action.closest('.field'); // родительский элемент
            const input = parent?.querySelector('input, select'); // поле фильтра
            if (input) {
                input.value = ''; // очистка значения в UI
                const field = action.dataset.field; // имя поля из кнопки
                if (field && state[field] !== undefined) {
                    state[field] = ''; // очистка в состоянии
                }
            }
        }

        // @todo: #4.5 — отфильтровать данные используя компаратор
        // Теперь фильтрация делается на сервере — формируем query-параметры вида filter[<name>]=<value>
        const filter = {};
        Object.keys(elements).forEach(key => {
            const el = elements[key];
            if (!el) return;

            if (['INPUT', 'SELECT'].includes(el.tagName) && el.value) { // ищем поля ввода в фильтре с непустыми данными
                filter[`filter[${el.name}]`] = el.value; // чтобы сформировать в query вложенный объект фильтра
            }
        });

        return Object.keys(filter).length ? Object.assign({}, query, filter) : query; // если в фильтре что-то добавилось, применим к запросу
    };

    return {
        updateIndexes,
        applyFiltering
    };
}
