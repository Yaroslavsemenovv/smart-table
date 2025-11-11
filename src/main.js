// === Импорт шрифтов и стилей ===
import './fonts/ys-display/fonts.css';
import './style.css';

// === Импорт исходных данных ===
import { data as sourceData } from "./data/dataset_1.js";

// === Импорт вспомогательных модулей ===
import { initData } from "./data.js";
import { processFormData } from "./lib/utils.js";

// === Импорт компонентов таблицы и её модулей ===
import { initTable } from "./components/table.js";
import { initPagination } from "./components/pagination.js";
import { initSorting } from "./components/sorting.js";
import { initFiltering } from "./components/filtering.js";

import {initSearching} from "./components/searching.js";

const applySearching = initSearching('search');


// === Подготовка данных ===
const { data, ...indexes } = initData(sourceData);

/**
 * Сбор и обработка полей из таблицы
 * @returns {Object}
 */
function collectState() {
    const state = processFormData(new FormData(sampleTable.container));

    // Приведение строковых значений к числам для удобства
    const rowsPerPage = parseInt(state.rowsPerPage);
    const page = parseInt(state.page ?? 1);

    return {
        ...state,
        rowsPerPage,
        page
    };
}

/**
 * Перерисовка состояния таблицы при любых изменениях
 * @param {HTMLButtonElement?} action
 */
function render(action) {
    let state = collectState();
    let result = [...data];

    // 🔹 правильная последовательность
    result = applySearching(result, state, action);   // поиск
    result = applyFiltering(result, state, action);   // фильтрация
    result = applySorting(result, state, action);     // сортировка
    result = applyPagination(result, state, action);  // пагинация

    sampleTable.render(result);
}


// === Инициализация таблицы ===
const sampleTable = initTable({
    tableTemplate: 'table',
    rowTemplate: 'row',
    before: ['search', 'header', 'filter'], // ВАЖНО: search должен идти первым
    after: ['pagination']
}, render);


// === @todo: инициализация ===

// ✅ Фильтрация
const applyFiltering = initFiltering(sampleTable.filter.elements, {
    searchBySeller: indexes.sellers
});

// ✅ Сортировка
const applySorting = initSorting([
    sampleTable.header.elements.sortByDate,
    sampleTable.header.elements.sortByTotal
]);

// ✅ Пагинация
const applyPagination = initPagination(
    sampleTable.pagination.elements,
    (el, page, isCurrent) => {
        const input = el.querySelector('input');
        const label = el.querySelector('span');
        input.value = page;
        input.checked = isCurrent;
        label.textContent = page;
        return el;
    }
);

// === Добавляем таблицу на страницу ===
const appRoot = document.querySelector('#app');
appRoot.appendChild(sampleTable.container);

// === Первичный рендер ===
render();
