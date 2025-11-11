import {sortCollection, sortMap} from "../lib/sort.js";

export function initSorting(columns) {
    return (data, state, action) => {
        let field = null;
        let order = null;

        // #3.1 — запомнить выбранный режим сортировки
        if (action && action.name === 'sort') {
            // переключаем значение сортировки по кругу (none → asc → desc → none)
            action.dataset.value = sortMap[action.dataset.value];

            // запоминаем выбранное поле и направление
            field = action.dataset.field;
            order = action.dataset.value;

            // #3.2 — сбросить сортировки остальных колонок
            columns.forEach(column => {
                if (column !== action) {
                    column.dataset.value = 'none';
                }
            });
        } 
        // #3.3 — получить выбранный режим сортировки при перерисовке
        else {
            columns.forEach(column => {
                if (column.dataset.value !== 'none') {
                    field = column.dataset.field;
                    order = column.dataset.value;
                }
            });
        }

        // вызываем универсальную функцию сортировки из sort.js
        return sortCollection(data, field, order);
    };
}
