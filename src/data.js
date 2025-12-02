const BASE_URL = 'https://webinars.webdev.education-services.ru/sp7-api';

export function initData() {

    let sellers;
    let customers;

    let lastResult;
    let lastQuery;

    const normalizeIndex = (payload) => {
        if (payload && typeof payload === 'object' && !Array.isArray(payload)) {
            const values = Object.values(payload);
            if (values.length && values.every(v => typeof v === 'string')) {
                return payload; // уже готовая мапа
            }
        }

        const list =
            Array.isArray(payload) ? payload :
            (payload?.items && Array.isArray(payload.items)) ? payload.items :
            (payload?.data && Array.isArray(payload.data)) ? payload.data :
            [];

        return list.reduce((acc, v) => {
            const name =
                v.name ??
                v.title ??
                `${v.first_name ?? ''} ${v.last_name ?? ''}`.trim();

            acc[String(v.id)] = name;
            return acc;
        }, {});
    };

    const mapRecords = (data) => data.map(item => {
        const sellerId = String(item.seller_id ?? item.sellerId ?? '');
        const customerId = String(item.customer_id ?? item.customerId ?? '');

        return {
            id: item.receipt_id,
            date: item.date,
            seller: sellers?.[sellerId] ?? item.seller ?? '',
            customer: customers?.[customerId] ?? item.customer ?? '',
            total: item.total_amount
        };
    });

    const getIndexes = async () => {

        if (sellers && customers) {
            return { sellers, customers };
        }

        const [sellersPayload, customersPayload] = await Promise.all([
            fetch(`${BASE_URL}/sellers`).then(res => res.json()),
            fetch(`${BASE_URL}/customers`).then(res => res.json()),
        ]);

        sellers = normalizeIndex(sellersPayload);
        customers = normalizeIndex(customersPayload);

        return { sellers, customers };
    };

    const getRecords = async (query = {}, isUpdated = false) => {

        if (!sellers || !customers) {
            await getIndexes();
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
