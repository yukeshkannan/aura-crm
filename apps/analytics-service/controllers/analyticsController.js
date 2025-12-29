const axios = require('axios');
const { formatResponse } = require('../../../packages/utils');

// @desc    Get Dashboard Analytics
// @route   GET /api/analytics/dashboard
// @access  Public (Should be Protected in Prod)
exports.getDashboardData = async (req, res) => {
  try {
    console.log('📊 Fetching Dashboard Data...');

    // 1. Define Service URLs (Use Environment Variables for Docker compatibility)
    const CONTACT_SERVICE = `${process.env.CONTACT_SERVICE_URL || 'http://localhost:5002'}/api/contacts`;
    const OPPORTUNITY_SERVICE = `${process.env.OPPORTUNITY_SERVICE_URL || 'http://localhost:5003'}/api/opportunities`;
    const TASK_SERVICE = `${process.env.TASK_SERVICE_URL || 'http://localhost:5004'}/api/tasks`;
    const INVOICE_SERVICE = `${process.env.INVOICE_SERVICE_URL || 'http://localhost:5009'}/api/invoices`;
    const TICKET_SERVICE = `${process.env.TICKET_SERVICE_URL || 'http://localhost:5010'}/api/tickets`;

    // 2. Parallel Fetch
    const [contactsRes, opportunitiesRes, tasksRes, invoicesRes, ticketsRes] = await Promise.all([
      axios.get(CONTACT_SERVICE).catch(e => ({ data: { data: [] } })),
      axios.get(OPPORTUNITY_SERVICE).catch(e => ({ data: { data: [] } })),
      axios.get(TASK_SERVICE).catch(e => ({ data: { data: [] } })),
      axios.get(INVOICE_SERVICE).catch(e => ({ data: { data: [] } })),
      axios.get(TICKET_SERVICE).catch(e => ({ data: { data: [] } }))
    ]);

    const contacts = contactsRes.data.data || [];
    const opportunities = opportunitiesRes.data.data || [];
    const tasks = tasksRes.data.data || [];
    const invoices = invoicesRes.data.data || [];
    const tickets = ticketsRes.data.data || [];

    // 3. Process Data
    const totalRevenuePotential = opportunities.reduce((sum, deal) => sum + (deal.amount || 0), 0);
    const dealsWon = opportunities.filter(d => d.stage === 'Won').length;
    const dealsLost = opportunities.filter(d => d.stage === 'Lost').length;
    const totalDeals = opportunities.length;
    const winRate = totalDeals > 0 ? ((dealsWon / totalDeals) * 100).toFixed(1) : 0;

    const totalInvoiced = invoices.reduce((sum, inv) => sum + (inv.totalAmount || 0), 0);
    const paidInvoices = invoices.filter(inv => inv.status === 'Paid');
    const totalCollected = paidInvoices.reduce((sum, inv) => sum + (inv.totalAmount || 0), 0);
    const overdueInvoices = invoices.filter(inv => inv.status === 'Overdue').length;

    const openTickets = tickets.filter(t => t.status !== 'Closed' && t.status !== 'Resolved').length;
    const criticalTickets = tickets.filter(t => t.priority === 'Critical' && t.status !== 'Resolved' && t.status !== 'Closed').length;

    const pendingTasks = tasks.filter(t => t.status === 'Pending' || t.status === 'In Progress').length;
    
    const totalContacts = contacts.length;
    const newContacts = contacts.filter(c => c.status === 'New').length;

    const dashboardData = {
      overview: {
        totalRevenuePotential,
        totalCollected,
        totalContacts,
        totalDeals,
        winRate: `${winRate}%`
      },
      actionItems: {
        pendingTasks,
        newLeads: newContacts,
        overdueInvoices,
        criticalTickets
      },
      breakdown: {
        sales: {
          won: dealsWon,
          lost: dealsLost,
          active: totalDeals - (dealsWon + dealsLost)
        },
        finance: {
          totalInvoiced,
          collected: totalCollected,
          pending: totalInvoiced - totalCollected
        },
        support: {
          openTickets,
          criticalAttention: criticalTickets
        }
      }
    };

    console.log('✅ Dashboard Data Aggregated Successfully');
    formatResponse(res, 200, 'Dashboard data retrieved', dashboardData);

  } catch (err) {
    console.error('❌ Analytics Error:', err.message);
    formatResponse(res, 500, 'Server Error', err.message);
  }
};
