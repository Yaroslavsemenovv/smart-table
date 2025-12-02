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

//объявляем в module-scope, чтобы render() видел
let applyPagination;
let updatePagination;

//для серверной фильтрации (шаг 3)
let applyFiltering;
let updateIndexes;

//для серверного поиска (шаг 4)
let applySearching;

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
  //передаём корень формы/контейнер таблицы
  const state = collectState(sampleTable.container);

  let query = {};
  // другие apply*

  //поиск через сервер (шаг 4)
    query = applySearching(query, state, action);
  // применяем фильтрацию через сервер (шаг 3)
    query = applyFiltering(query, state, action);
  // query = applySorting(query, state, action);
    query = applyPagination(query, state, action);

    const { total, items } = await api.getRecords(query);

    updatePagination(total, query);
    sampleTable.render(items);

    console.log('QUERY', query);

}

// === Инициализация таблицы ===
const sampleTable = initTable({
  tableTemplate: 'table',
  rowTemplate: 'row',
  before: ['search', 'header', 'filter'],
  after: ['pagination']
}, render);

const appRoot = document.querySelector('#app');
appRoot.appendChild(sampleTable.container);

async function init() {
  const indexes = await api.getIndexes();

  // поиск: инициализируем функцию применения (шаг 4)
  applySearching = initSearching('search');

  // 2. фильтры: инициализируем модуль и получаем две функции
  ({ applyFiltering, updateIndexes } = initFiltering(sampleTable.filter.elements));

  // заполняем селект продавцов значениями с сервера
  updateIndexes(sampleTable.filter.elements, {
    searchBySeller: indexes.sellers
  });

  // 3. сортировка
  const applySorting = initSorting([
    sampleTable.header.elements.sortByDate,
    sampleTable.header.elements.sortByTotal
  ]);

  // 4. пагинация
  ({ applyPagination, updatePagination } = initPagination(
    sampleTable.pagination.elements,
    (el, page, isCurrent) => {
      const input = el.querySelector('input');
      const label = el.querySelector('span');
      input.value = page;
      input.checked = isCurrent;
      label.textContent = page;
      return el;
    }
  ));
}

init().then(render);
