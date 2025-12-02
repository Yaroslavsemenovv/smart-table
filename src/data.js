const BASE_URL = 'https://webinars.webdev.education-services.ru/sp7-api';

export function initData(sourceData) {

    let sellers;
    let customers;

    let lastResult;
    let lastQuery;

    const mapRecords = (data) => data.map(item => ({
        id: item.receipt_id,
        date: item.date,
        seller: sellers[item.seller_id],
        customer: customers[item.customer_id],
        total: item.total_amount
    }));


    const getIndexes = async () => {

        if (sellers && customers) {
            return { sellers, customers };
        }

        if (sourceData) {
            sellers = sourceData.sellers.reduce((acc, v) => ({
                ...acc,
                [v.id]: `${v.first_name} ${v.last_name}`
            }), {});

            customers = sourceData.customers.reduce((acc, v) => ({
                ...acc,
                [v.id]: `${v.first_name} ${v.last_name}`
            }), {});

            return { sellers, customers };
        }

        [sellers, customers] = await Promise.all([
            fetch(`${BASE_URL}/sellers`).then(res => res.json()),
            fetch(`${BASE_URL}/customers`).then(res => res.json()),
        ]);

        return { sellers, customers };
    };


    const getRecords = async (query = {}, isUpdated = false) => {

        if (sourceData) {
            // сначала строим полный список (это нужно для total)
            const allItems = sourceData.purchase_records.map(item => ({
                id: item.receipt_id,
                date: item.date,
                seller: sellers[item.seller_id],
                customer: customers[item.customer_id],
                total: item.total_amount
            }));

            // затем применяем пагинацию из query
            const limit = Number(query.limit ?? query.rowsPerPage ?? 0);
            const page = Number(query.page ?? 1);

            const items = limit > 0
                ? allItems.slice((page - 1) * limit, (page - 1) * limit + limit)
                : allItems;

            return {
                total: allItems.length,
                items
            };
        }

        const qs = new URLSearchParams(query);
        const nextQuery = qs.toString();

        if (lastQuery === nextQuery && !isUpdated) {
            return lastResult;
        }

        const response = await fetch(`${BASE_URL}/records?${nextQuery}`);
        const records = await response.json();

        lastQuery = nextQuery;
        lastResult = {
            total: records.total,
            items: mapRecords(records.items)
        };

        return lastResult;
    };

    return {
        getIndexes,
        getRecords
    };
}
