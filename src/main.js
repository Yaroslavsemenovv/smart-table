// === Импорт шрифтов и стилей ===
import './fonts/ys-display/fonts.css';
import './style.css';

// === Импорт локальных данных (моки) ===
import { data as sourceData } from "./data/dataset_1.js";

// === Импорт API функции ===
import { initData } from "./data.js";
import { processFormData } from "./lib/utils.js";

// === Импорт компонентов таблицы и её модулей ===
import { initTable } from "./components/table.js";
import { initPagination } from "./components/pagination.js";
import { initSorting } from "./components/sorting.js";
import { initFiltering } from "./components/filtering.js";
import { initSearching } from "./components/searching.js";

const api = initData(sourceData);


function collectState(tableRoot) {
    const state = processFormData(new FormData(tableRoot));

    const rowsPerPage = parseInt(state.rowsPerPage);
    const page = parseInt(state.page ?? 1);

    return {
        ...state,
        rowsPerPage,
        page
    };
}

async function render(action) {

    const state = collectState(sampleTable.container);

    let query = {};

    // query = applySearching(query, state, action);
    // query = applyFiltering(query, state, action);
    // query = applySorting(query, state, action);
    // query = applyPagination(query, state, action);

    // получаем данные с сервера/моков
    const { total, items } = await api.getRecords(query);
    

    // рисуем
    sampleTable.render(items);
}


// === Инициализация таблицы ===
const sampleTable = initTable({
    tableTemplate: 'table',
    rowTemplate: 'row',
    before: ['search', 'header', 'filter'],
    after: ['pagination']
}, render);


async function init() {

    const indexes = await api.getIndexes();

    // 2. фильтры временно отключены
    // const applyFiltering = initFiltering(sampleTable.filter.elements, {
    //     searchBySeller: indexes.sellers
    // });

    // 3. сортировка
    const applySorting = initSorting([
        sampleTable.header.elements.sortByDate,
        sampleTable.header.elements.sortByTotal
    ]);

    // 4. пагинация
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
}


init().then(render);
