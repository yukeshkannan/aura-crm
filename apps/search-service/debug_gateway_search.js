const axios = require('axios');

const query = 'Server'; 
const GATEWAY_URL = 'http://localhost:5000/api/search';

(async () => {
    try {
        console.log(`🌍 hitting Gateway: ${GATEWAY_URL}?q=${query}`);
        const res = await axios.get(`${GATEWAY_URL}?q=${query}`);
        
        console.log("✅ Gateway Response Status:", res.status);
        console.log("✅ Data Received:", JSON.stringify(res.data, null, 2));

    } catch (err) {
        console.error("❌ Gateway Failed:", err.message);
        if (err.response) {
            console.error("Status:", err.response.status);
            console.error("Data:", err.response.data);
        }
    }
})();
