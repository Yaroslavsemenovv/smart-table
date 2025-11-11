import {createComparison, defaultRules} from "../lib/compare.js";

export function initFiltering(elements, indexes) {
    // @todo: #4.1 — заполнить выпадающие списки опциями
    Object.keys(indexes) // Получаем имена фильтров, например "searchBySeller"
        .forEach((elementName) => {
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

    // @todo: #4.3 — настроить компаратор
    const compare = createComparison(defaultRules);

    return (data, state, action) => {
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
        return data.filter(row => compare(row, state));
    }
}
