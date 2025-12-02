    import { cloneTemplate } from "../lib/utils.js";

    /**
     * Инициализирует таблицу и вызывает коллбэк при любых изменениях и нажатиях на кнопки
     *
     * @param {Object} settings
     * @param {(action: HTMLButtonElement | undefined) => void} onAction
     * @returns {{container: Node, elements: *, render: render}}
     */
    export function initTable(settings, onAction) {
        const { tableTemplate, rowTemplate, before, after } = settings;
        const root = cloneTemplate(tableTemplate);

        // Вставляем дополнительные шаблоны до таблицы
        before.reverse().forEach(subName => {
            root[subName] = cloneTemplate(subName);
            root.container.prepend(root[subName].container);
        });

        // И после таблицы
        after.forEach(subName => {
            root[subName] = cloneTemplate(subName);
            root.container.append(root[subName].container);
        });

        const render = (data) => {
            // Шаг 1.1 — преобразуем данные в строки
            const nextRows = data.map(item => {
                
                const row = cloneTemplate(rowTemplate);

                Object.keys(item).forEach(key => {
                    if (row.elements[key]) {
                        if (['INPUT', 'SELECT'].includes(row.elements[key].tagName)) {
                            row.elements[key].value = item[key];
                        } else {
                            row.elements[key].textContent = item[key];
                        }
                    }
                });

                return row.container;
            });

            // Меняем старые строки новыми
            root.elements.rows.replaceChildren(...nextRows);
        };

        // Обработчики событий
        root.container.addEventListener('change', () => {
            onAction();
        });

        root.container.addEventListener('reset', () => {
            setTimeout(() => {
                onAction();
            }, 0);
        });

        root.container.addEventListener('submit', (e) => {
            e.preventDefault();
            onAction(e.submitter);
        });

        return { ...root, render };
    }
