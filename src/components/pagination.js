    import {getPages} from "../lib/utils.js";

    export const initPagination = ({pages, fromRow, toRow, totalRows}, createPage) => {
        // @todo: #2.3 — подготовить шаблон кнопки для страницы и очистить контейнер
        const pageTemplate = pages.firstElementChild.cloneNode(true); // клонируем первую кнопку
        pages.firstElementChild.remove(); // удаляем оригинал, чтобы не мешал


        let pageCount;

    const applyPagination = (query, state, action) => {
        const limit = state.rowsPerPage;
        let page = state.page;

        // переносим код, который делали под @todo: #2.6
        if (action) switch (action.name) {
                case 'prev':
                    page = Math.max(1, page - 1);
                    break;
                case 'next':
                    page = Math.min(pageCount, page + 1);
                    break;
                case 'first':
                    page = 1;
                    break;
                case 'last':
                    page = pageCount;
                    break;
            }

        return Object.assign({}, query, { // добавим параметры к query, но не изменяем исходный объект
            limit,
            page
        });
    }

    const updatePagination = (total, { page, limit }) => {
        pageCount = Math.ceil(total / limit);

        // переносим код, который делали под @todo: #2.4
        const visiblePages = getPages(page, pageCount, 5);

                pages.replaceChildren(
                    ...visiblePages.map(pageNumber => {
                        const el = pageTemplate.cloneNode(true); // создаём копию шаблона
                        return createPage(el, pageNumber, pageNumber === page); // заполняем через колбэк
                    })
                );
        // переносим код, который делали под @todo: #2.5 (обратите внимание, что rowsPerPage заменена на limit)
            fromRow.textContent = (page - 1) * limit + 1;
            toRow.textContent = Math.min(page * limit, total);
            totalRows.textContent = total;
    }

    return {
        updatePagination,
        applyPagination
    };

            // // @todo: #2.1 — посчитать количество страниц, объявить переменные и константы
            // const rowsPerPage = state.rowsPerPage;                 // сколько строк на одной странице
            // const pageCount = Math.ceil(data.length / rowsPerPage); // общее количество страниц
            // let page = state.page;                                 // текущая страница (будет меняться)


            // // @todo: #2.2 — посчитать сколько строк нужно пропустить и получить срез данных
            // const skip = (page - 1) * rowsPerPage;
            // return data.slice(skip, skip + rowsPerPage);
    }