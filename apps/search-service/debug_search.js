const axios = require('axios');

const query = 'Server'; // Default test query

console.log(`🔎 Testing Search for: "${query}"`);

// Service Endpoints
const SERVICES = {
    contacts: 'http://localhost:5002/api/contacts',
    opportunities: 'http://localhost:5003/api/opportunities',
    tickets: 'http://localhost:5010/api/tickets',
    products: 'http://localhost:5008/api/products'
};

(async () => {
    try {
        console.log("--- Checking Individual Services ---");
        
        const results = await Promise.allSettled(
            Object.entries(SERVICES).map(async ([name, url]) => {
                const start = Date.now();
                try {
                    const res = await axios.get(url);
                    const duration = Date.now() - start;
                    console.log(`✅ ${name}: Connected (${duration}ms). Items: ${res.data.data?.length || 0}`);
                    if (res.data.data?.length > 0) {
                        console.log(`[DATA SAMPLE] ${name}:`, JSON.stringify(res.data.data[0], null, 2));
                    }
                    return { name, data: res.data.data };
                } catch (e) {
                    const duration = Date.now() - start;
                    console.error(`❌ ${name}: Failed (${duration}ms) - ${e.message}`);
                    return { name, error: e.message };
                }
            })
        );

        console.log("\n--- Mocking Search Controller Logic ---");
        // Simulate Logic
        const filterData = (data, fields) => {
            if (!Array.isArray(data)) return [];
            return data.filter(item => {
                return fields.some(field => {
                    const val = item[field];
                    return val && val.toString().toLowerCase().includes(query.toLowerCase());
                });
            });
        };

        results.forEach(result => {
            if (result.status === 'fulfilled' && result.value.data) {
                const { name, data } = result.value;
                let filtered = [];
                if (name === 'contacts') filtered = filterData(data, ['name', 'email', 'company']);
                if (name === 'opportunities') filtered = filterData(data, ['title']);
                if (name === 'tickets') filtered = filterData(data, ['title', 'description']);
                if (name === 'products') filtered = filterData(data, ['name', 'sku', 'description']);
                
                console.log(`🔍 ${name} matches: ${filtered.length}`);
            }
        });

    } catch (err) {
        console.error("Critical Failure:", err);
    }
})();
