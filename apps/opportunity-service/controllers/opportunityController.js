const Opportunity = require('../models/Opportunity');
const { formatResponse } = require('../../../packages/utils');

// @desc    Get all opportunities
// @route   GET /api/opportunities
// @access  Public
exports.getOpportunities = async (req, res) => {
  try {
    console.log('[Opportunity Service] Fetching all opportunities...');
    const { contactId } = req.query;
    let query = {};
    if (contactId) {
        query.contactId = contactId;
    }
    if (req.query.assignedTo) {
        query.assignedTo = req.query.assignedTo;
    }
    const opportunities = await Opportunity.find(query).sort({ createdAt: -1 });
    console.log(`[Opportunity Service] Found ${opportunities.length} opportunities`);
    formatResponse(res, 200, 'Opportunities retrieved successfully', opportunities);
  } catch (err) {
    console.error('[Opportunity Service] Error fetching opportunities:', err);
    formatResponse(res, 500, 'Server Error', err.message);
  }
};

// @desc    Get single opportunity
// @route   GET /api/opportunities/:id
// @access  Public
exports.getOpportunity = async (req, res) => {
  try {
    const opportunity = await Opportunity.findById(req.params.id);

    if (!opportunity) {
      return formatResponse(res, 404, 'Opportunity not found');
    }

    formatResponse(res, 200, 'Opportunity retrieved successfully', opportunity);
  } catch (err) {
    formatResponse(res, 500, 'Server Error', err.message);
  }
};

// @desc    Create new opportunity
// @route   POST /api/opportunities
// @access  Public
exports.createOpportunity = async (req, res) => {
  try {
    const opportunity = await Opportunity.create(req.body);
    formatResponse(res, 201, 'Opportunity created successfully', opportunity);
  } catch (err) {
    formatResponse(res, 400, 'Invalid data', err.message);
  }
};

// @desc    Update opportunity
// @route   PUT /api/opportunities/:id
// @access  Public
exports.updateOpportunity = async (req, res) => {
  try {
    console.log(`[Controller] UPDATE HIT. ID: ${req.params.id}`);
    console.log(`[Controller] Body Modules: ${req.body.modules ? req.body.modules.length : 'Missing'}`);
    
    let opportunity = await Opportunity.findById(req.params.id);

    if (!opportunity) {
      return formatResponse(res, 404, 'Opportunity not found');
    }

    // Manual update to ensure array handling is correct
    if (req.body.modules) {
        opportunity.modules = req.body.modules;
    }
    // Update other fields
    const allowedUpdates = ['title', 'amount', 'stage', 'employeeTaskStatus', 'contactId', 'assignedTo', 'expectedCloseDate'];
    allowedUpdates.forEach(update => {
        if (req.body[update] !== undefined) {
            opportunity[update] = req.body[update];
        }
    });

    const beforeSave = JSON.parse(JSON.stringify(opportunity));
    await opportunity.save();

    // Return DEBUG info
    res.status(200).json({
        success: true,
        data: opportunity,
        debug: {
            receivedModulesCount: req.body.modules ? req.body.modules.length : 'undefined',
            beforeSaveModulesCount: beforeSave.modules ? beforeSave.modules.length : 'undefined',
            savedModulesCount: opportunity.modules ? opportunity.modules.length : 'undefined'
        }
    });

  } catch (err) {
    formatResponse(res, 500, 'Server Error', err.message);
  }
};

// @desc    Delete opportunity
// @route   DELETE /api/opportunities/:id
// @access  Public
exports.deleteOpportunity = async (req, res) => {
  try {
    const opportunity = await Opportunity.findById(req.params.id);

    if (!opportunity) {
      return formatResponse(res, 404, 'Opportunity not found');
    }

    await opportunity.deleteOne();

    formatResponse(res, 200, 'Opportunity deleted successfully', {});
  } catch (err) {
    formatResponse(res, 500, 'Server Error', err.message);
  }
};
