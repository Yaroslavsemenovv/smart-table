import { rules, createComparison } from "../lib/compare.js";

export function initSearching(searchField) {
    // создаём компаратор с правилом поиска по нескольким полям
    const compare = createComparison(
        [], // здесь можно передать массив других правил, если нужно
        [
            rules.searchMultipleFields(searchField, ['date', 'customer', 'seller'], false)
        ]
    );

    return (data, state, action) => {
        return data.filter(row => compare(row, state));
    };
}
