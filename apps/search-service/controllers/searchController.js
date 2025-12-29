const axios = require('axios');

// @desc    Global Search across services
// @route   GET /api/search?q=query
// @access  Public
exports.globalSearch = async (req, res) => {
  const query = req.query.q;

  if (!query) {
    return res.status(400).json({
      success: false,
      error: 'Please provide a search query (q)'
    });
  }

  console.log(`🔎 Searching for: "${query}"`);

  // Service Endpoints
  const CONTACT_SERVICE = 'http://localhost:5002/api/contacts';
  const OPPORTUNITY_SERVICE = 'http://localhost:5003/api/opportunities';
  const TICKET_SERVICE = 'http://localhost:5010/api/tickets';
  const PRODUCT_SERVICE = 'http://localhost:5008/api/products';
  // Add other services if they support search

  try {
    // Parallel Fetch - Note: This assumes services return ALL data if no filter, 
    // OR we implement ?search= query in other services. 
    // For MVP, we fetch all and filter here (Not scalable for huge data, but fine for now).

    const [contactsRes, opportunitiesRes, ticketsRes, productsRes] = await Promise.all([
      axios.get(CONTACT_SERVICE).catch(e => ({ data: { data: [] } })),
      axios.get(OPPORTUNITY_SERVICE).catch(e => ({ data: { data: [] } })),
      axios.get(TICKET_SERVICE).catch(e => ({ data: { data: [] } })),
      axios.get(PRODUCT_SERVICE).catch(e => ({ data: { data: [] } }))
    ]);

    // Filtering Logic (Simple Case Insensitive Match)
    // Adjust fields based on what actual models have.
    
    const filterData = (data, fields) => {
        if (!Array.isArray(data)) return [];
        return data.filter(item => {
            return fields.some(field => {
                const val = item[field];
                return val && val.toString().toLowerCase().includes(query.toLowerCase());
            });
        });
    };

    const contacts = filterData(contactsRes.data.data, ['name', 'email', 'company']);
    const opportunities = filterData(opportunitiesRes.data.data, ['title']);
    const tickets = filterData(ticketsRes.data.data, ['title', 'description']);
    const products = filterData(productsRes.data.data, ['name', 'sku', 'description']);

    res.status(200).json({
      success: true,
      query,
      results: {
        contacts: { count: contacts.length, data: contacts },
        opportunities: { count: opportunities.length, data: opportunities },
        tickets: { count: tickets.length, data: tickets },
        products: { count: products.length, data: products }
      }
    });

  } catch (err) {
    console.error('❌ Search Error:', err.message);
    res.status(500).json({
      success: false,
      error: 'Server Error during search'
    });
  }
};
